"use strict";

/**
 * Smoke test for POST /api/puv/position
 * Requires PUV_INGEST_KEY in server/.env (same as runtime).
 *
 *   cd server && node scripts/puv-position-smoke.js
 */

require("dotenv").config();
const path = require("path");

const BASE = (process.env.SMOKE_BASE_URL || `http://127.0.0.1:${process.env.PORT || 3000}`).replace(/\/+$/, "");
const KEY = (process.env.PUV_INGEST_KEY || "").trim();

async function main() {
  if (!KEY) {
    console.error("Set PUV_INGEST_KEY in server/.env (long random string).");
    process.exit(1);
  }
  const url = `${BASE}/api/puv/position`;
  const body = {
    puvId: process.env.SMOKE_PUV_ID || "LM-BTR-03",
    lat: Number(process.env.SMOKE_LAT || 13.9547813),
    lng: Number(process.env.SMOKE_LNG || 121.1630958),
    speedKph: 26,
    bearing: 180,
    status: "active",
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-PUV-Ingest-Key": KEY,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let j;
  try {
    j = JSON.parse(text);
  } catch (_) {
    j = text;
  }
  if (!res.ok) {
    console.error("Failed:", res.status, j);
    process.exit(1);
  }
  console.log("OK:", j);
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
