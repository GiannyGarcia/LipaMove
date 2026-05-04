"use strict";

require("dotenv").config();

const BASE = (process.env.SMOKE_BASE_URL || `http://127.0.0.1:${process.env.PORT || 3000}`).replace(/\/+$/, "");

function fail(message, details) {
  const out = details ? `${message}\n${details}` : message;
  console.error(out);
  process.exit(1);
}

async function asJson(res) {
  const text = await res.text();
  try {
    return { status: res.status, ok: res.ok, body: JSON.parse(text) };
  } catch (_) {
    return { status: res.status, ok: res.ok, body: text };
  }
}

async function post(path, payload, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return asJson(res);
}

async function get(path, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${BASE}${path}`, { headers });
  return asJson(res);
}

function randomPhMobile() {
  let d = "";
  for (let i = 0; i < 9; i++) {
    d += String(Math.floor(Math.random() * 10));
  }
  return "+639" + d;
}

async function main() {
  console.log(`Smoke test target: ${BASE}`);

  const health = await get("/api/health");
  if (!health.ok || !health.body || health.body.ok !== true) {
    fail("Health check failed.", JSON.stringify(health, null, 2));
  }
  console.log("Health check passed.");

  const id = Date.now().toString(36);
  const username = `smoke_${id}`;
  const email = `${username}@example.com`;
  const phone = randomPhMobile();
  const password = "SmokePass123!";

  const reg = await post("/api/auth/register", { username, email, phone, password });
  if (!reg.ok || !reg.body || !reg.body.token) {
    fail("Register flow failed.", JSON.stringify(reg, null, 2));
  }
  console.log("Register endpoint passed (password-only signup + session).");

  const me = await get("/api/me", reg.body.token);
  if (!me.ok || !me.body || !me.body.user || me.body.user.username !== username) {
    fail("Authenticated /api/me check failed.", JSON.stringify(me, null, 2));
  }
  console.log("Authenticated profile check passed.");

  const login = await post("/api/auth/login", { username, password });
  if (!login.ok || !login.body || !login.body.token) {
    fail("Login failed.", JSON.stringify(login, null, 2));
  }
  console.log("Login passed.");

  const me2 = await get("/api/me", login.body.token);
  if (!me2.ok || !me2.body || !me2.body.user || me2.body.user.username !== username) {
    fail("Second session /api/me check failed.", JSON.stringify(me2, null, 2));
  }
  console.log("Second-session profile check passed.");

  const logout = await post("/api/auth/logout", {}, login.body.token);
  if (!logout.ok || !logout.body || logout.body.ok !== true) {
    fail("Logout endpoint failed.", JSON.stringify(logout, null, 2));
  }

  console.log("Auth smoke test passed.");
}

main().catch((err) => {
  fail("Smoke test crashed.", err && err.stack ? err.stack : String(err));
});
