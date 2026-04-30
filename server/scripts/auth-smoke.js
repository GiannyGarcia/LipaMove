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

async function post(path, payload) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return asJson(res);
}

async function get(path, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${BASE}${path}`, { headers });
  return asJson(res);
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
  const phone = "+63917" + Math.floor(1000000 + Math.random() * 8999999);
  const password = "SmokePass123!";

  const reg = await post("/api/auth/register", { username, email, phone, password });
  if (!reg.ok || !reg.body || reg.body.ok !== true) {
    fail("Register flow failed.", JSON.stringify(reg, null, 2));
  }
  console.log("Register endpoint passed.");

  if (!reg.body.devOtp) {
    console.log("DEV_RETURN_OTP is disabled; stopping after register success (expected for secure default).");
    process.exit(0);
  }

  const verifySignup = await post("/api/auth/verify-signup", {
    userId: reg.body.userId,
    phone,
    code: reg.body.devOtp,
  });
  if (!verifySignup.ok || !verifySignup.body || !verifySignup.body.token) {
    fail("Verify-signup flow failed.", JSON.stringify(verifySignup, null, 2));
  }
  console.log("Signup OTP verify passed.");

  const me = await get("/api/me", verifySignup.body.token);
  if (!me.ok || !me.body || !me.body.user || me.body.user.username !== username) {
    fail("Authenticated /api/me check failed.", JSON.stringify(me, null, 2));
  }
  console.log("Authenticated profile check passed.");

  const login = await post("/api/auth/login", { username, password });
  if (!login.ok || !login.body || login.body.ok !== true || !login.body.devOtp) {
    fail("Login OTP issuance failed.", JSON.stringify(login, null, 2));
  }
  console.log("Login OTP issuance passed.");

  const verifyLogin = await post("/api/auth/verify-login-otp", { username, code: login.body.devOtp });
  if (!verifyLogin.ok || !verifyLogin.body || !verifyLogin.body.token) {
    fail("Login OTP verify failed.", JSON.stringify(verifyLogin, null, 2));
  }
  console.log("Login OTP verify passed.");

  const logout = await post("/api/auth/logout", {});
  if (!logout.ok || !logout.body || logout.body.ok !== true) {
    fail("Logout endpoint failed.", JSON.stringify(logout, null, 2));
  }

  console.log("Auth smoke test passed.");
}

main().catch((err) => {
  fail("Smoke test crashed.", err && err.stack ? err.stack : String(err));
});
