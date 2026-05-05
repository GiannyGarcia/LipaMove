"use strict";

/**
 * LipaMove route service — snap waypoint sequences to real drivable roads.
 *
 * Strategy (accuracy first):
 *   1) In-memory cache (SHA-256 key of rounded coordinates)
 *   2) OSRM Route → OSRM Match (with radiuses → without) → pairwise OSRM legs
 *   3) Optional Mapbox Directions API if MAPBOX_ACCESS_TOKEN is set
 *   4) Return original coordinates as xml_fallback
 *
 * Env:
 *   DISABLE_ROAD_SNAP=true — skip external routing
 *   OSRM_BASE_URL — default https://router.project-osrm.org
 *   OSRM_SNAP_RADIUS_METERS — snap off-network points (default 150, max 500)
 *   OSRM_MAX_WAYPOINTS — thin long traces before OSRM (default 90)
 *   OSRM_LEG_SPLIT_DEPTH / OSRM_LEG_MIN_SPLIT_KM — bisect failed legs for road-following segments
 *   MAPBOX_ACCESS_TOKEN — fallback; long routes use pairwise legs (Mapbox waypoint limit)
 *   ROUTE_CACHE_TTL_MS — default 86400000 (24h)
 *   ROUTE_CACHE_MAX_ENTRIES — default 500
 */

const crypto = require("crypto");

const DEFAULT_OSRM = "https://router.project-osrm.org";

/** Haversine km — used to decide when to split a failed OSRM leg */
function distanceKmApprox(a, b) {
  var R = 6371;
  var dLat = ((b[0] - a[0]) * Math.PI) / 180;
  var dLng = ((b[1] - a[1]) * Math.PI) / 180;
  var lat1 = (a[0] * Math.PI) / 180;
  var lat2 = (b[0] * Math.PI) / 180;
  var x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** @type {Map<string, { expires: number, payload: { path: Array<[number, number]>, source: string } }>} */
const routeCache = new Map();

function thinWaypoints(points, maxN) {
  if (!points || points.length <= maxN) {
    return points.slice();
  }
  var out = [];
  var last = points.length - 1;
  var step = last / (maxN - 1);
  for (var k = 0; k < maxN - 1; k++) {
    var ix = Math.min(last, Math.round(k * step));
    out.push([points[ix][0], points[ix][1]]);
  }
  out.push([points[last][0], points[last][1]]);
  return out;
}

function osrmCoordString(pointsLatLng) {
  return pointsLatLng
    .map(function (p) {
      return Number(p[1]).toFixed(6) + "," + Number(p[0]).toFixed(6);
    })
    .join(";");
}

function geometryToLatLngPath(geometry) {
  if (!geometry || !geometry.coordinates) {
    return [];
  }
  return geometry.coordinates.map(function (c) {
    return [Number(c[1]), Number(c[0])];
  });
}

function coordSegmentCount(coordStr) {
  if (!coordStr || !String(coordStr).trim()) {
    return 0;
  }
  return String(coordStr).split(";").filter(Boolean).length;
}

function radiusesQueryParam(coordCount) {
  var m = Number(process.env.OSRM_SNAP_RADIUS_METERS || 150);
  if (!isFinite(m) || m <= 0 || coordCount < 1) {
    return "";
  }
  var r = Math.min(500, Math.max(25, Math.round(m)));
  return "&radiuses=" + new Array(coordCount).fill(String(r)).join(";");
}

/**
 * Stable cache key from coordinates (5 decimal places ~ 1.1 m).
 */
function cacheKeyForCoordinates(coords) {
  var normalized = (coords || []).map(function (p) {
    return [Math.round(Number(p[0]) * 1e5) / 1e5, Math.round(Number(p[1]) * 1e5) / 1e5];
  });
  return crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}

function pruneRouteCache() {
  var max = Math.max(10, Number(process.env.ROUTE_CACHE_MAX_ENTRIES || 500));
  while (routeCache.size > max) {
    var firstKey = routeCache.keys().next().value;
    routeCache.delete(firstKey);
  }
}

/**
 * @param {"route"|"match"} service
 */
async function osrmFetchGeometry(base, coordStr, service, useRadiuses) {
  var pathSeg = service === "match" ? "/match/v1/driving/" : "/route/v1/driving/";
  var n = coordSegmentCount(coordStr);
  var qBase =
    service === "match"
      ? "overview=full&geometries=geojson&steps=false"
      : "overview=full&geometries=geojson&continue_straight=true";
  if (useRadiuses && n > 0) {
    qBase += radiusesQueryParam(n);
  }
  var url = base.replace(/\/$/, "") + pathSeg + coordStr + "?" + qBase;
  var ac = new AbortController();
  var to = setTimeout(function () {
    ac.abort();
  }, 26000);
  try {
    var r = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "LipaMove/1.0 (route-service)" },
      signal: ac.signal,
    });
    if (!r.ok) {
      throw new Error("OSRM HTTP " + r.status);
    }
    var j = await r.json();
    if (j.code !== "Ok") {
      throw new Error(j.code || "NotOk");
    }
    if (service === "match") {
      if (!j.matchings || !j.matchings.length || !j.matchings[0].geometry) {
        throw new Error("NoMatchings");
      }
      return geometryToLatLngPath(j.matchings[0].geometry);
    }
    if (!j.routes || !j.routes[0] || !j.routes[0].geometry) {
      throw new Error("NoRoute");
    }
    return geometryToLatLngPath(j.routes[0].geometry);
  } finally {
    clearTimeout(to);
  }
}

async function snapFullPathOsrm(base, coordStr) {
  var attempts = [
    { svc: "route", rad: true, tag: "osrm_route" },
    { svc: "match", rad: true, tag: "osrm_match" },
    { svc: "route", rad: false, tag: "osrm_route_open" },
    { svc: "match", rad: false, tag: "osrm_match_open" },
  ];
  for (var i = 0; i < attempts.length; i++) {
    var a = attempts[i];
    try {
      var path = await osrmFetchGeometry(base, coordStr, a.svc, a.rad);
      if (path.length >= 2) {
        return { path: path, source: a.tag };
      }
    } catch (e) {
      /* continue */
    }
  }
  throw new Error("snap_full_failed");
}

function mergePolylineSegments(out, seg) {
  if (!seg || !seg.length) {
    return out;
  }
  if (!out.length) {
    return seg.slice();
  }
  var last = out[out.length - 1];
  var first = seg[0];
  if (Math.abs(last[0] - first[0]) < 1e-7 && Math.abs(last[1] - first[1]) < 1e-7) {
    return out.concat(seg.slice(1));
  }
  return out.concat(seg);
}

/**
 * Route a single leg A→B with OSRM (route/match × radius variants).
 */
async function routeOneLegOsrm(base, a, b) {
  var coordStr = osrmCoordString([a, b]);
  var order = [
    ["route", true],
    ["route", false],
    ["match", true],
    ["match", false],
  ];
  var lastErr = null;
  for (var i = 0; i < order.length; i++) {
    try {
      var path = await osrmFetchGeometry(base, coordStr, order[i][0], order[i][1]);
      if (path && path.length >= 2) {
        return path;
      }
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("leg_failed");
}

/**
 * If a leg fails (NoRoute / far endpoints), bisect with a midpoint so OSRM can find local roads.
 * Max depth configurable via OSRM_LEG_SPLIT_DEPTH (default 9).
 */
async function routeLegOsrmRecursive(base, a, b, depth) {
  var maxDepth = Math.min(14, Math.max(4, Number(process.env.OSRM_LEG_SPLIT_DEPTH || 9)));
  var minSplitKm = Math.max(0.018, Number(process.env.OSRM_LEG_MIN_SPLIT_KM || 0.035));
  try {
    return await routeOneLegOsrm(base, a, b);
  } catch (e) {
    if (depth >= maxDepth) {
      throw e;
    }
    var dKm = distanceKmApprox(a, b);
    if (dKm < minSplitKm) {
      throw e;
    }
    var mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    var left = await routeLegOsrmRecursive(base, a, mid, depth + 1);
    var right = await routeLegOsrmRecursive(base, mid, b, depth + 1);
    var merged = mergePolylineSegments(left, right);
    if (!merged.length || merged.length < 2) {
      throw e;
    }
    return merged;
  }
}

async function snapPairwiseOsrm(pointsLatLng, base) {
  var out = [];
  for (var i = 0; i < pointsLatLng.length - 1; i++) {
    var a = pointsLatLng[i];
    var b = pointsLatLng[i + 1];
    var seg = await routeLegOsrmRecursive(base, a, b, 0);
    out = mergePolylineSegments(out, seg);
  }
  return out.length >= 2 ? out : pointsLatLng.slice();
}

/** Mapbox allows a limited number of waypoints per request; use pairwise for long lists. */
const MAPBOX_MAX_COORDS_PER_REQUEST = 25;

async function mapboxFetchGeometry(coordStr, token) {
  var url =
    "https://api.mapbox.com/directions/v5/mapbox/driving/" +
    coordStr +
    "?geometries=geojson&overview=full&alternatives=false&access_token=" +
    encodeURIComponent(token);
  var ac = new AbortController();
  var to = setTimeout(function () {
    ac.abort();
  }, 26000);
  try {
    var r = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "LipaMove/1.0 (route-service)" },
      signal: ac.signal,
    });
    if (!r.ok) {
      return null;
    }
    var j = await r.json();
    if (!j.routes || !j.routes[0] || !j.routes[0].geometry) {
      return null;
    }
    return geometryToLatLngPath(j.routes[0].geometry);
  } catch (e) {
    return null;
  } finally {
    clearTimeout(to);
  }
}

/**
 * Mapbox Directions API v5 — one request (only if coordinate count within API limits).
 */
async function tryMapboxDirectionsFull(pointsLatLng) {
  var token = (process.env.MAPBOX_ACCESS_TOKEN || "").trim();
  if (!token || pointsLatLng.length < 2 || pointsLatLng.length > MAPBOX_MAX_COORDS_PER_REQUEST) {
    return null;
  }
  var coordStr = pointsLatLng
    .map(function (p) {
      return Number(p[1]).toFixed(6) + "," + Number(p[0]).toFixed(6);
    })
    .join(";");
  return mapboxFetchGeometry(coordStr, token);
}

/**
 * Mapbox leg-by-leg — required when XML has more waypoints than Mapbox allows in one URL.
 */
async function tryMapboxPairwiseMerge(pointsLatLng) {
  var token = (process.env.MAPBOX_ACCESS_TOKEN || "").trim();
  if (!token || pointsLatLng.length < 2) {
    return null;
  }
  var out = [];
  for (var i = 0; i < pointsLatLng.length - 1; i++) {
    var pair = [pointsLatLng[i], pointsLatLng[i + 1]];
    var coordStr = osrmCoordString(pair);
    var seg = await mapboxFetchGeometry(coordStr, token);
    if (!seg || seg.length < 2) {
      return null;
    }
    out = mergePolylineSegments(out, seg);
  }
  return out.length >= 2 ? out : null;
}

/**
 * Mapbox fallback: full route when short enough, else pairwise merge.
 */
async function tryMapboxDirections(pointsLatLng) {
  if (!pointsLatLng || pointsLatLng.length < 2) {
    return null;
  }
  var full = await tryMapboxDirectionsFull(pointsLatLng);
  if (full && full.length >= 2) {
    return full;
  }
  return tryMapboxPairwiseMerge(pointsLatLng);
}

/**
 * Core snap logic (no cache).
 * @param {Array<[number, number]>} pointsLatLng
 */
async function snapRouteToRoadsInternal(pointsLatLng) {
  if (String(process.env.DISABLE_ROAD_SNAP || "").toLowerCase() === "true") {
    return { path: pointsLatLng.slice(), source: "disabled" };
  }
  var base = (process.env.OSRM_BASE_URL || DEFAULT_OSRM).trim();
  var pts = (pointsLatLng || []).filter(function (p) {
    return p && isFinite(p[0]) && isFinite(p[1]);
  });
  if (pts.length < 2) {
    return { path: pts.slice(), source: "too_few_points" };
  }
  var maxWp = Math.min(90, Math.max(2, Number(process.env.OSRM_MAX_WAYPOINTS || 90)));
  if (pts.length > maxWp) {
    pts = thinWaypoints(pts, maxWp);
  }
  var coordStr = osrmCoordString(pts);
  try {
    return await snapFullPathOsrm(base, coordStr);
  } catch (e1) {
    /* continue */
  }
  try {
    var merged = await snapPairwiseOsrm(pts, base);
    if (merged.length >= 2) {
      return { path: merged, source: "osrm_pairwise" };
    }
  } catch (e2) {
    /* continue */
  }
  var mb = await tryMapboxDirections(pts);
  if (mb && mb.length >= 2) {
    return { path: mb, source: "mapbox_directions" };
  }
  console.warn(
    "[lipamove] Route snap fell back to XML chords — use http://127.0.0.1 (not file://), check OSRM / MAPBOX_ACCESS_TOKEN / OSRM_SNAP_RADIUS_METERS."
  );
  return { path: pointsLatLng.slice(), source: "xml_fallback" };
}

/**
 * Public API: snap [lat,lng][] to roads with caching.
 * @param {Array<[number, number]>} coordinates
 * @returns {Promise<{ path: Array<[number, number]>, source: string, cached?: boolean }>}
 */
async function snapRouteToRoads(coordinates) {
  var ttl = Number(process.env.ROUTE_CACHE_TTL_MS || 86400000);
  if (!isFinite(ttl) || ttl < 0) {
    ttl = 86400000;
  }
  var key = cacheKeyForCoordinates(coordinates || []);
  var now = Date.now();
  var hit = routeCache.get(key);
  if (hit && hit.expires > now && hit.payload && hit.payload.path && hit.payload.path.length >= 2) {
    return {
      path: hit.payload.path.slice(),
      source: hit.payload.source,
      cached: true,
    };
  }
  var result = await snapRouteToRoadsInternal(coordinates);
  var bad =
    result.source === "xml_fallback" ||
    result.source === "disabled" ||
    result.source === "too_few_points";
  if (!bad) {
    routeCache.set(key, {
      expires: now + ttl,
      payload: { path: result.path.slice(), source: result.source },
    });
    pruneRouteCache();
  }
  return Object.assign({}, result, { cached: false });
}

/** Legacy name used by POST /api/route/snap-roads */
async function snapPathToDrivingRoads(pointsLatLng) {
  var r = await snapRouteToRoads(pointsLatLng);
  return { path: r.path, source: r.source };
}

module.exports = {
  snapRouteToRoads,
  snapPathToDrivingRoads,
  thinWaypoints,
  /** Test hook */
  _routeCache: routeCache,
};
