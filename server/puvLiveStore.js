"use strict";

/**
 * Persist last-known PUV positions for reconnect snapshots and audits.
 * Matches data.xml unit ids (e.g. LM-BTR-03) — no FK to MySQL vehicles required.
 */

function normalizePayload(body) {
  var puvId = String((body && body.puvId) || "").trim();
  var lat = Number(body && body.lat);
  var lng = Number(body && body.lng);
  if (!puvId || !isFinite(lat) || !isFinite(lng)) {
    return null;
  }
  return {
    puvId: puvId,
    lat: lat,
    lng: lng,
    bearing: body.bearing != null && isFinite(Number(body.bearing)) ? Number(body.bearing) : null,
    speedKph: body.speedKph != null && isFinite(Number(body.speedKph)) ? Number(body.speedKph) : null,
    progress: body.progress != null && isFinite(Number(body.progress)) ? Number(body.progress) : null,
    plateNumber: body.plateNumber != null ? String(body.plateNumber) : null,
    routeId: body.routeId != null && isFinite(Number(body.routeId)) ? Number(body.routeId) : null,
    status: body.status != null ? String(body.status).slice(0, 32) : "active",
  };
}

function rowToSocketPayload(row) {
  var ts =
    row.updated_at instanceof Date
      ? row.updated_at.toISOString()
      : new Date(row.updated_at).toISOString();
  var p = {
    puvId: row.puv_id,
    lat: Number(row.lat),
    lng: Number(row.lng),
    bearing: row.bearing != null ? Number(row.bearing) : null,
    speedKph: row.speed_kph != null ? Number(row.speed_kph) : null,
    progress: row.progress != null ? Number(row.progress) : null,
    status: row.status || "active",
    timestamp: ts,
  };
  if (row.plate_number) {
    p.plateNumber = String(row.plate_number);
  }
  if (row.route_id != null) {
    p.routeId = Number(row.route_id);
  }
  return p;
}

/**
 * @param {import("mysql2/promise").Pool} pool
 * @param {object} body — raw POST JSON
 * @returns {Promise<object|null>} normalized payload or null
 */
async function upsertPuvPosition(pool, body) {
  var n = normalizePayload(body);
  if (!n) {
    return null;
  }
  await pool.execute(
    `INSERT INTO puv_live_state (puv_id, lat, lng, bearing, speed_kph, progress, plate_number, route_id, status, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,NOW(3))
     ON DUPLICATE KEY UPDATE
       lat = VALUES(lat),
       lng = VALUES(lng),
       bearing = VALUES(bearing),
       speed_kph = VALUES(speed_kph),
       progress = VALUES(progress),
       plate_number = VALUES(plate_number),
       route_id = VALUES(route_id),
       status = VALUES(status),
       updated_at = NOW(3)`,
    [
      n.puvId,
      n.lat,
      n.lng,
      n.bearing,
      n.speedKph,
      n.progress,
      n.plateNumber,
      n.routeId,
      n.status || "active",
    ]
  );
  return n;
}

/**
 * @param {import("mysql2/promise").Pool} pool
 * @returns {Promise<object[]>} payloads suitable for puv:snapshot / broadcast
 */
async function fetchAllLiveForSnapshot(pool) {
  const [rows] = await pool.execute(
    `SELECT puv_id, lat, lng, bearing, speed_kph, progress, plate_number, route_id, status, updated_at
     FROM puv_live_state
     ORDER BY updated_at DESC`
  );
  return (rows || []).map(rowToSocketPayload);
}

module.exports = {
  normalizePayload,
  upsertPuvPosition,
  fetchAllLiveForSnapshot,
};
