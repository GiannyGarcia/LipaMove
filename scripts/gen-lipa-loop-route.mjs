/**
 * Builds the Lipa loop polyline using OSRM with explicit via points on:
 *   - Ayala Highway (eastern trunk, Sabang/Tibig — avoids Paraiso / Manila-Batangas Bypass strip ~121.155–121.158)
 *   - President Jose P. Laurel Highway (121.165–121.168)
 *   - Leviste Dr access to UB (from JP Laurel — not the western bypass)
 *
 * OSRM "shortest path" alone often picks Manila-Batangas Bypass Road; we force the corridor above.
 *
 * Run:
 *   node scripts/gen-lipa-loop-route.mjs > new-route.xml
 *   node scripts/apply-route-xml.mjs
 */
const BASE = "https://router.project-osrm.org/route/v1/driving";

/** [lng, lat] — OSRM order */
const bayan = [121.1632107, 13.9425265];
const ayala_sabang = [121.1627166, 13.952915];
const sm = [121.1626338, 13.9549345];
const jp_marauoy = [121.165609, 13.9602586];
const leviste_jp_ub = [121.1662014, 13.9696965];
const ub = [121.1595069, 13.968191];
const jp_north_of_ub = [121.165609, 13.9715];
const jp_inosluban = [121.1676026, 13.9977579];
const outlets = [121.1697526, 14.0095011];
const jp_mid_south = [121.168048, 13.98499];
const ayala_sabang_return = [121.16301, 13.952952];

async function geomMulti(waypoints) {
  const coords = waypoints.map(([lng, lat]) => `${lng},${lat}`).join(";");
  const url = `${BASE}/${coords}?overview=full&geometries=geojson`;
  const r = await fetch(url);
  const j = await r.json();
  if (j.code !== "Ok" || !j.routes || !j.routes[0]) {
    throw new Error(JSON.stringify(j));
  }
  return j.routes[0].geometry.coordinates;
}

function mergeUnique(segments) {
  const out = [];
  for (const seg of segments) {
    for (const p of seg) {
      const last = out[out.length - 1];
      if (!last || last[0] !== p[0] || last[1] !== p[1]) {
        out.push(p);
      }
    }
  }
  return out;
}

function decimate(lngLat, every) {
  const r = [];
  for (let i = 0; i < lngLat.length; i += every) {
    r.push(lngLat[i]);
  }
  const last = lngLat[lngLat.length - 1];
  const prev = r[r.length - 1];
  if (!prev || prev[0] !== last[0] || prev[1] !== last[1]) {
    r.push(last);
  }
  return r;
}

function dist2(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

function snapLandmarks(lngLat, landmarks) {
  const out = lngLat.map((p) => [...p]);
  for (const { lng, lat } of landmarks) {
    const target = [lng, lat];
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < out.length; i++) {
      const d = dist2(out[i], target);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    out[best] = [...target];
  }
  return out;
}

function toXmlPoints(lngLat, labels) {
  const lines = [];
  lngLat.forEach((p, i) => {
    const lat = p[1].toFixed(7);
    const lng = p[0].toFixed(7);
    const label = labels[i] || "Corridor";
    lines.push(`                <point lat="${lat}" lng="${lng}">${label}</point>`);
  });
  return lines.join("\n");
}

const g1 = await geomMulti([bayan, ayala_sabang, sm]);
const g2 = await geomMulti([sm, jp_marauoy, leviste_jp_ub, ub]);
const g3 = await geomMulti([ub, jp_north_of_ub, jp_inosluban, outlets]);
const g4 = await geomMulti([outlets, jp_mid_south, jp_marauoy, ayala_sabang_return, bayan]);

let merged = mergeUnique([g1, g2, g3, g4]);
const first = merged[0];
const last = merged[merged.length - 1];
if (first[0] === last[0] && first[1] === last[1] && merged.length > 1) {
  merged = merged.slice(0, -1);
}

const step = Math.max(6, Math.floor(merged.length / 55));
let slim = decimate(merged, step);
slim = snapLandmarks(slim, [
  { lng: 121.1632107, lat: 13.9425265 },
  { lng: 121.1630958, lat: 13.9547813 },
  { lng: 121.1595069, lat: 13.968191 },
  { lng: 121.1697526, lat: 14.0095011 },
]);
if (slim.length > 2 && dist2(slim[0], slim[slim.length - 1]) < 1e-14) {
  slim = slim.slice(0, -1);
}

const labels = [];
labels[0] = "Bayan - T.M. Kalaw Street";
if (slim.length > 1) {
  labels[slim.length - 1] = "Bayan - T.M. Kalaw Street (loop)";
}
for (let i = 1; i < slim.length - 1; i++) {
  const lat = slim[i][1];
  const lng = slim[i][0];
  const near = (a, b) => Math.abs(a - b) < 0.00025;
  if (near(lat, 13.9547813) && near(lng, 121.1630958)) {
    labels[i] = "SM Lipa Terminal";
    continue;
  }
  if (near(lat, 13.968191) && near(lng, 121.1595069)) {
    labels[i] = "University of Batangas Lipa (Leviste Dr)";
    continue;
  }
  if (near(lat, 14.0095011) && near(lng, 121.1697526)) {
    labels[i] = "The Outlets at Lipa";
    continue;
  }
  if (lat < 13.972 && lng < 121.162) {
    labels[i] = "Leviste Dr / UB access";
    continue;
  }
  if (lng >= 121.162 && lat < 13.956) {
    labels[i] = "Ayala Highway";
    continue;
  }
  if (lng >= 121.162 && lat >= 13.956 && lat < 13.972) {
    labels[i] = "Ayala Highway / J.P. Laurel (Marauoy)";
    continue;
  }
  if (lat >= 14.0) {
    labels[i] = "President J.P. Laurel Highway - LIMA / Outlets";
    continue;
  }
  if (lat >= 13.975) {
    labels[i] = "President J.P. Laurel Highway - toward LIMA";
    continue;
  }
  labels[i] = "President J.P. Laurel Highway";
}

process.stdout.write(toXmlPoints(slim, labels) + "\n");
process.stderr.write("// points: " + slim.length + " merged: " + merged.length + " step: " + step + "\n");
