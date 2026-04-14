"use strict";

require("dotenv").config();
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");

const PORT = Number(process.env.PORT || 3000);
const DEV_OTP = process.env.DEV_RETURN_OTP === "true" || process.env.NODE_ENV === "development";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "lipamove",
  waitForConnections: true,
  connectionLimit: 10,
});

function randomOtp6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function randomToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function cleanupExpiredOtps(conn) {
  await conn.execute("DELETE FROM otp_codes WHERE expires_at < NOW(3)");
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

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
  const conn = await pool.getConnection();
  try {
    await cleanupExpiredOtps(conn);
    const hash = await bcrypt.hash(password, 10);
    const [ins] = await conn.execute(
      "INSERT INTO users (username, email, phone, password_hash, verified) VALUES (?,?,?,?,0)",
      [username.trim(), email.trim(), phone.trim(), hash]
    );
    const userId = ins.insertId;
    if (!userId) {
      throw new Error("Insert failed");
    }
    const code = randomOtp6();
    const exp = new Date(Date.now() + 10 * 60 * 1000);
    await conn.execute(
      "INSERT INTO otp_codes (user_id, phone, purpose, code_plain, expires_at) VALUES (?,?,?,?,?)",
      [userId, phone.trim(), "signup", code, exp]
    );
    const out = { ok: true, message: "OTP generated. Check dev response or SMS in production." };
    if (DEV_OTP) out.devOtp = code;
    res.json(out);
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Username or email already exists" });
    }
    console.error(e);
    res.status(500).json({ error: "Register failed" });
  } finally {
    conn.release();
  }
});

app.post("/api/auth/verify-signup", async (req, res) => {
  const { phone, code } = req.body || {};
  if (!phone || !code) {
    return res.status(400).json({ error: "Phone and code required" });
  }
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      `SELECT o.id AS otp_id, o.user_id, o.code_plain, o.expires_at
       FROM otp_codes o
       WHERE o.phone = ? AND o.purpose = 'signup' AND o.consumed_at IS NULL
       ORDER BY o.id DESC LIMIT 1`,
      [phone.trim()]
    );
    const row = rows[0];
    if (!row || row.code_plain !== String(code).trim()) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (new Date(row.expires_at) < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }
    await conn.execute("UPDATE users SET verified = 1 WHERE id = ?", [row.user_id]);
    await conn.execute("UPDATE otp_codes SET consumed_at = NOW(3) WHERE id = ?", [row.otp_id]);
    const token = randomToken();
    const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await conn.execute("INSERT INTO sessions (user_id, token, expires_at) VALUES (?,?,?)", [row.user_id, token, exp]);
    res.json({ ok: true, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Verify failed" });
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
      "SELECT id, username, email, phone, password_hash, verified FROM users WHERE username = ? LIMIT 1",
      [username.trim()]
    );
    const u = users[0];
    if (!u || !(await bcrypt.compare(password, u.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (!u.verified) {
      return res.status(403).json({ error: "Account not verified. Complete signup OTP first." });
    }
    await conn.execute("DELETE FROM otp_codes WHERE user_id = ? AND purpose = 'login' AND consumed_at IS NULL", [u.id]);
    const code = randomOtp6();
    const exp = new Date(Date.now() + 10 * 60 * 1000);
    await conn.execute(
      "INSERT INTO otp_codes (user_id, phone, purpose, code_plain, expires_at) VALUES (?,?,?,?,?)",
      [u.id, u.phone, "login", code, exp]
    );
    const out = { ok: true, needsOtp: true, phoneHint: u.phone };
    if (DEV_OTP) out.devOtp = code;
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Login failed" });
  } finally {
    conn.release();
  }
});

app.post("/api/auth/verify-login-otp", async (req, res) => {
  const { username, code } = req.body || {};
  if (!username || !code) {
    return res.status(400).json({ error: "Username and code required" });
  }
  const conn = await pool.getConnection();
  try {
    const [users] = await conn.execute("SELECT id, phone FROM users WHERE username = ? LIMIT 1", [username.trim()]);
    const u = users[0];
    if (!u) {
      return res.status(400).json({ error: "Invalid" });
    }
    const [rows] = await conn.execute(
      `SELECT o.id AS otp_id, o.code_plain, o.expires_at
       FROM otp_codes o
       WHERE o.user_id = ? AND o.purpose = 'login' AND o.consumed_at IS NULL
       ORDER BY o.id DESC LIMIT 1`,
      [u.id]
    );
    const row = rows[0];
    if (!row || row.code_plain !== String(code).trim()) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (new Date(row.expires_at) < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }
    await conn.execute("UPDATE otp_codes SET consumed_at = NOW(3) WHERE id = ?", [row.otp_id]);
    const token = randomToken();
    const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await conn.execute("INSERT INTO sessions (user_id, token, expires_at) VALUES (?,?,?)", [u.id, token, exp]);
    res.json({ ok: true, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Verify failed" });
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

app.use(
  express.static(staticRoot, {
    setHeaders: function (res, filePath) {
      if (path.extname(filePath).toLowerCase() === ".xhtml") {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
      }
    },
  })
);

app.listen(PORT, "0.0.0.0", function () {
  console.log("LipaMove API + static files at http://127.0.0.1:" + PORT);
  console.log("Open http://127.0.0.1:" + PORT + "/  or  http://127.0.0.1:" + PORT + "/index.xhtml");
});
