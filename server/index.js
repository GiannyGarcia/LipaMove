"use strict";

require("dotenv").config();
const path = require("path");
const http = require("http");
const crypto = require("crypto");
const express = require("express");
const socketService = require("./socketService");
const routeService = require("./routeService");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
const { normalizePhone, isValidPhilippineMobileE164 } = require("./phone");

const PORT = Number(process.env.PORT || 3000);

function buildMysqlPoolOptions() {
  const fromEnv = process.env.MYSQL_URL || process.env.MYSQL_PRIVATE_URL || "";
  const fromDatabaseUrl =
    process.env.DATABASE_URL && /^mysql2?:\/\//i.test(process.env.DATABASE_URL) ? process.env.DATABASE_URL : "";
  const rawUrl = fromEnv || fromDatabaseUrl;
  const dbUrl = rawUrl && /^mysql2?:\/\//i.test(rawUrl) ? rawUrl : "";
  if (dbUrl) {
    try {
      const u = new URL(dbUrl);
      const database = (u.pathname || "/").replace(/^\//, "").split("?")[0] || process.env.MYSQL_DATABASE || "lipamove";
      const opts = {
        host: u.hostname,
        port: Number(u.port || 3306),
        user: decodeURIComponent(u.username || ""),
        password: decodeURIComponent(u.password || ""),
        database,
        waitForConnections: true,
        connectionLimit: 10,
      };
      const sslMode = u.searchParams.get("ssl-mode") || u.searchParams.get("sslmode");
      if (
        process.env.MYSQL_SSL === "true" ||
        process.env.MYSQL_SSL === "required" ||
        (sslMode && String(sslMode).toLowerCase() === "required")
      ) {
        opts.ssl = { rejectUnauthorized: true };
      }
      return opts;
    } catch (e) {
      console.error("Invalid MYSQL_URL — fix the connection string in your host.", e.message);
    }
  }
  const opts = {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "lipamove",
    waitForConnections: true,
    connectionLimit: 10,
  };
  if (process.env.MYSQL_SSL === "true" || process.env.MYSQL_SSL === "required") {
    opts.ssl = { rejectUnauthorized: true };
  }
  return opts;
}

const mysqlConfig = buildMysqlPoolOptions();
if (process.env.RAILWAY_ENVIRONMENT && mysqlConfig.host === "127.0.0.1") {
  console.error(
    "[lipamove] MYSQL_URL is missing — the app defaults to 127.0.0.1 and will crash on Railway. On the LipaMove service add variable MYSQL_URL = ${{ MySQL.MYSQL_URL }} (or set MYSQL_HOST / MYSQL_PASSWORD from the MySQL service)."
  );
}
console.log(
  "[lipamove] MySQL:",
  mysqlConfig.host + ":" + mysqlConfig.port + "/" + mysqlConfig.database,
  process.env.MYSQL_URL || process.env.MYSQL_PRIVATE_URL ? "(from URL)" : "(from MYSQL_* env)"
);
const pool = mysql.createPool(mysqlConfig);

function randomToken() {
  return crypto.randomBytes(32).toString("hex");
}

function validateAccountEmail(email) {
  const raw = String(email || "").trim();
  if (!raw.includes("@")) {
    return { ok: false, error: "Email must contain @.", field: "email" };
  }
  const lower = raw.toLowerCase();
  const at = lower.indexOf("@");
  const local = lower.slice(0, at);
  const domain = lower.slice(at + 1);
  if (!local || !domain || !domain.includes(".")) {
    return { ok: false, error: "Enter a valid email address (e.g. name@gmail.com).", field: "email" };
  }
  if (lower.includes("..") || local.startsWith(".") || domain.startsWith(".") || domain.endsWith(".")) {
    return { ok: false, error: "Enter a valid email address.", field: "email" };
  }
  return { ok: true, value: lower };
}

function validateUsername(username) {
  const t = String(username || "").trim();
  if (t.length < 3 || t.length > 64) {
    return { ok: false, error: "Username must be 3–64 characters.", field: "username" };
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(t)) {
    return {
      ok: false,
      error: "Username may only use letters, numbers, dot, underscore, and hyphen (no spaces).",
      field: "username",
    };
  }
  return { ok: true, value: t };
}

async function insertSession(conn, userId) {
  const token = randomToken();
  const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await conn.execute("INSERT INTO sessions (user_id, token, expires_at) VALUES (?,?,?)", [userId, token, exp]);
  return token;
}

const RATE_LIMIT_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX || 12);
const RATE_LIMIT_WINDOW_MS = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const rateBuckets = new Map();
const CORS_ALLOWED_ORIGINS = String(process.env.CORS_ALLOWED_ORIGINS || "http://127.0.0.1:3000,http://localhost:3000")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);

function authRateLimiter(req, res, next) {
  try {
    const ip = (req.ip || req.socket?.remoteAddress || "unknown").toString();
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    let bucket = rateBuckets.get(key);
    if (!bucket || now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS) {
      bucket = { startedAt: now, count: 0 };
    }
    bucket.count += 1;
    rateBuckets.set(key, bucket);
    if (bucket.count > RATE_LIMIT_MAX) {
      const retryAfterSec = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - bucket.startedAt)) / 1000));
      res.setHeader("Retry-After", String(retryAfterSec));
      return res.status(429).json({ error: "Too many authentication attempts. Please try again later." });
    }
    next();
  } catch (_) {
    next();
  }
}

function corsOriginHandler(origin, callback) {
  // Allow non-browser and same-origin requests (no Origin header).
  if (!origin) return callback(null, true);
  if (CORS_ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
  return callback(new Error("Not allowed by CORS"));
}

async function ensureAuthTables() {
  await pool.execute(
    `CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(64) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(32) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      verified TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      UNIQUE KEY uq_users_username (username),
      UNIQUE KEY uq_users_email (email),
      UNIQUE KEY uq_users_phone (phone)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  );
  await pool.execute(
    `CREATE TABLE IF NOT EXISTS sessions (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      token VARCHAR(64) NOT NULL,
      expires_at DATETIME(3) NOT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      UNIQUE KEY uq_sessions_token (token),
      KEY idx_sessions_user (user_id),
      CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  );
}

function isMissingAuthTableError(e) {
  return !!(e && e.code === "ER_NO_SUCH_TABLE");
}

const app = express();
app.use(cors({ origin: corsOriginHandler, credentials: true }));
app.use(express.json());
app.use("/api/auth", authRateLimiter);

const staticRoot = path.join(__dirname, "..");

async function authMiddleware(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    const m = h.match(/^Bearer\s+(.+)$/i);
    if (!m) {
      req.user = null;
      return next();
    }
    const token = m[1].trim();
    const [rows] = await pool.execute(
      `SELECT u.id, u.username, u.email, u.phone, u.verified
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > NOW(3)`,
      [token]
    );
    req.user = rows[0] || null;
    next();
  } catch (e) {
    next(e);
  }
}

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "connected" });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message) });
  }
});

app.get("/api/me", authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      phone: req.user.phone,
      verified: !!req.user.verified,
    },
  });
});


app.post("/api/auth/register", async (req, res) => {
  const { username, email, phone, password } = req.body || {};
  if (!username || !email || !phone || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const userVal = validateUsername(username);
  if (!userVal.ok) {
    return res.status(400).json({ error: userVal.error, field: userVal.field });
  }
  const emailVal = validateAccountEmail(email);
  if (!emailVal.ok) {
    return res.status(400).json({ error: emailVal.error, field: emailVal.field });
  }
  const phoneN = normalizePhone(phone);
  if (!isValidPhilippineMobileE164(phoneN)) {
    return res.status(400).json({
      error:
        "Enter a valid Philippine mobile number in international form (+63…) with 11 national digits (e.g. +639194748917).",
      field: "phone",
    });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters.", field: "password" });
  }
  const usernameT = userVal.value;
  const emailT = emailVal.value;
  const conn = await pool.getConnection();
  try {
    const [byUser] = await conn.execute("SELECT id FROM users WHERE username = ? LIMIT 1", [usernameT]);
    if (byUser.length) {
      return res.status(409).json({ error: "This username is already taken.", field: "username" });
    }
    const [byEmail] = await conn.execute("SELECT id FROM users WHERE email = ? LIMIT 1", [emailT]);
    if (byEmail.length) {
      return res.status(409).json({ error: "This email is already registered.", field: "email" });
    }
    const [byPhone] = await conn.execute("SELECT id FROM users WHERE phone = ? LIMIT 1", [phoneN]);
    if (byPhone.length) {
      return res.status(409).json({
        error: "This mobile number is already registered. Log in instead.",
        field: "phone",
      });
    }
    const hash = await bcrypt.hash(password, 10);
    await conn.beginTransaction();
    const [ins] = await conn.execute(
      "INSERT INTO users (username, email, phone, password_hash, verified) VALUES (?,?,?,?,1)",
      [usernameT, emailT, phoneN, hash]
    );
    const userId = ins.insertId;
    if (!userId) {
      throw new Error("Insert failed");
    }
    const token = await insertSession(conn, userId);
    await conn.commit();
    res.json({ ok: true, userId, token, message: "Signed up and logged in." });
  } catch (e) {
    try {
      await conn.rollback();
    } catch (_) {}
    if (isMissingAuthTableError(e)) {
      return res.status(500).json({ error: "Auth database is not initialized. Run database/lipamove_full_setup.sql in MySQL Workbench." });
    }
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Username, email, or phone is already in use.", field: "duplicate" });
    }
    console.error(e);
    res.status(500).json({ error: "Register failed" });
  } finally {
    conn.release();
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  const conn = await pool.getConnection();
  try {
    const [users] = await conn.execute(
      "SELECT id, username, email, phone, password_hash FROM users WHERE username = ? LIMIT 1",
      [String(username).trim()]
    );
    const u = users[0];
    if (!u || !(await bcrypt.compare(password, u.password_hash))) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    const token = await insertSession(conn, u.id);
    res.json({ ok: true, token });
  } catch (e) {
    if (isMissingAuthTableError(e)) {
      return res.status(500).json({ error: "Auth database is not initialized. Run database/lipamove_full_setup.sql in MySQL Workbench." });
    }
    console.error(e);
    res.status(500).json({ error: "Login failed" });
  } finally {
    conn.release();
  }
});

app.post("/api/auth/logout", authMiddleware, async (req, res) => {
  try {
    const h = req.headers.authorization || "";
    const m = h.match(/^Bearer\s+(.+)$/i);
    if (m) {
      await pool.execute("DELETE FROM sessions WHERE token = ?", [m[1].trim()]);
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Logout failed" });
  }
});

app.get("/", function (req, res) {
  res.redirect(302, "/index.xhtml");
});

/**
 * Internal bridge for IoT / simulators to push live PUV payloads into Socket.io.
 * Set INTERNAL_PUV_BROADCAST_KEY in .env and send header X-Internal-Key: <same value>.
 *
 * Body examples:
 *   { "type": "update", "payload": { "puvId": "LM-1", "routeId": 1, "lat": 13.94, "lng": 121.16, "bearing": 0, "speedKph": 25, "progress": 40, "status": "active" } }
 *   { "type": "status", "payload": { "puvId": "LM-1", "routeId": 1, "status": "idle" } }
 *   { "type": "snapshot" }
 */
/**
 * Snap waypoints to drivable roads (OSRM → Mapbox optional → fallback).
 * POST body: { "path": [[lat,lng], ...] }
 * Response: { path, source, cached? }
 */
async function handleSnapRoadsRoute(req, res) {
  try {
    const pathIn = req.body && req.body.path;
    if (!Array.isArray(pathIn) || pathIn.length < 2) {
      return res.status(400).json({ error: "path must be [[lat,lng],...] with length >= 2" });
    }
    const result = await routeService.snapRouteToRoads(pathIn);
    res.json({
      path: result.path,
      source: result.source,
      cached: !!result.cached,
    });
  } catch (e) {
    console.warn("[lipamove] /api/route/snap-roads", e && e.message);
    const fallback = (req.body && req.body.path) || [];
    res.json({ path: fallback, source: "error_fallback", cached: false });
  }
}

app.post("/api/route/snap-roads", handleSnapRoadsRoute);
app.post("/api/route/snap", handleSnapRoadsRoute);

app.post("/api/puv/broadcast", function (req, res) {
  const key = process.env.INTERNAL_PUV_BROADCAST_KEY;
  if (!key || req.get("x-internal-key") !== key) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const body = req.body || {};
  const t = body.type;
  try {
    if (t === "update") {
      socketService.broadcastPUVUpdate(body.payload || body);
    } else if (t === "status") {
      socketService.broadcastPUVStatus(body.payload || body);
    } else if (t === "snapshot") {
      socketService.broadcastAllActivePUVs();
    } else {
      return res.status(400).json({ error: "type must be update, status, or snapshot" });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(503).json({ error: "socket_unavailable", message: String(e && e.message) });
  }
});

app.use(
  express.static(staticRoot, {
    setHeaders: function (res, filePath) {
      if (path.extname(filePath).toLowerCase() === ".xhtml") {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
      }
    },
  })
);

const httpServer = http.createServer(app);

ensureAuthTables()
  .then(function () {
    socketService.initSocket(httpServer, {
      pool,
      corsAllowedOrigins: CORS_ALLOWED_ORIGINS,
    });
    httpServer.listen(PORT, "0.0.0.0", function () {
      console.log("LipaMove listening on port " + PORT + " (HTTP + Socket.io; server bind).");
      if (process.env.RAILWAY_ENVIRONMENT) {
        console.log("Open the public domain from Railway (Networking), not http://127.0.0.1 in your browser.");
      } else {
        console.log("Local: http://127.0.0.1:" + PORT + "/  or  /index.xhtml");
      }
    });
  })
  .catch(function (e) {
    console.error("Failed to initialize auth tables.", e);
    process.exit(1);
  });
