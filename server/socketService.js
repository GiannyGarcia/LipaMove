"use strict";

/**
 * LipaMove real-time layer (Socket.io v4)
 *
 * Events (server → client):
 *   - puv:update   — single vehicle position / kinematics update
 *   - puv:status — lifecycle / operational status change (active, idle, offline, …)
 *   - puv:snapshot — optional full list of last-known positions (see broadcastAllActivePUVs)
 *
 * Events (client → server):
 *   - joinRoute(routeId:number)  — subscribe to room `route:<id>` (for future scoped broadcasts)
 *   - leaveRoute(routeId:number)
 *
 * Auth:
 *   Pass the same Bearer session token as REST, either:
 *     - handshake.auth.token = "<hex>"
 *     - or Authorization: Bearer <hex> header on the handshake
 *
 * Env:
 *   SOCKET_AUTH_REQUIRED=true  — reject connection if token missing/invalid (recommended in production)
 *   SOCKET_AUTH_REQUIRED=false — allow anonymous sockets (default; can still attach user if token valid)
 *
 * Client (browser) minimal example:
 *   <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
 *   <script>
 *     const socket = io({ path: "/socket.io/", auth: { token: localStorage.getItem("lipamove_token") } });
 *     socket.on("puv:update", (p) => console.log("update", p));
 *     socket.on("puv:status", (p) => console.log("status", p));
 *     socket.emit("joinRoute", 3);
 *   </script>
 */

const { Server } = require("socket.io");

/** @type {import("socket.io").Server | null} */
let io = null;

/** Last normalized payload per PUV id (string key) for snapshot API */
const lastByPuvId = new Map();

/**
 * @param {import("mysql2/promise").Pool} pool
 * @param {string} token
 * @returns {Promise<object|null>}
 */
async function verifySocketToken(pool, token) {
  const t = String(token || "").trim();
  if (!t) return null;
  const [rows] = await pool.execute(
    `SELECT u.id, u.username, u.email, u.phone, u.verified
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > NOW(3)`,
    [t]
  );
  return rows[0] || null;
}

/**
 * Normalize outbound payload (adds ISO timestamp if missing).
 * @param {object} data
 */
function normalizePuvPayload(data) {
  const ts = data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString();
  return {
    puvId: data.puvId,
    plateNumber: data.plateNumber != null ? String(data.plateNumber) : null,
    routeId: data.routeId != null ? Number(data.routeId) : null,
    lat: Number(data.lat),
    lng: Number(data.lng),
    bearing: data.bearing != null ? Number(data.bearing) : null,
    speedKph: data.speedKph != null ? Number(data.speedKph) : null,
    progress: data.progress != null ? Number(data.progress) : null,
    timestamp: ts,
    status: data.status != null ? String(data.status) : "active",
  };
}

/**
 * Attach Socket.io to the same HTTP server as Express.
 *
 * @param {import("http").Server} httpServer
 * @param {{
 *   pool: import("mysql2/promise").Pool;
 *   corsAllowedOrigins: string[];
 * }} opts
 */
function initSocket(httpServer, opts) {
  const pool = opts.pool;
  const origins = opts.corsAllowedOrigins && opts.corsAllowedOrigins.length ? opts.corsAllowedOrigins : true;

  io = new Server(httpServer, {
    path: "/socket.io/",
    cors: {
      origin: origins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    allowEIO3: false,
  });

  const requireAuth = String(process.env.SOCKET_AUTH_REQUIRED || "false").toLowerCase() === "true";

  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.headers && socket.handshake.headers.authorization;
      const fromHeader = typeof authHeader === "string" && authHeader.match(/^Bearer\s+(.+)$/i);
      const rawToken =
        (socket.handshake.auth && socket.handshake.auth.token) ||
        (fromHeader ? fromHeader[1] : "") ||
        "";
      const token = String(rawToken || "").trim();
      const user = token ? await verifySocketToken(pool, token) : null;
      socket.data.user = user;
      if (requireAuth && !user) {
        return next(new Error("Unauthorized"));
      }
      return next();
    } catch (e) {
      return next(new Error("Auth error"));
    }
  });

  io.on("connection", (socket) => {
    const u = socket.data.user;
    socket.emit("puv:welcome", {
      ok: true,
      authenticated: !!u,
      user: u ? { id: u.id, username: u.username } : null,
    });

    socket.on("joinRoute", (routeId) => {
      const id = Number(routeId);
      if (!Number.isFinite(id) || id < 0) return;
      socket.join("route:" + id);
      socket.emit("route:joined", { routeId: id });
    });

    socket.on("leaveRoute", (routeId) => {
      const id = Number(routeId);
      if (!Number.isFinite(id)) return;
      socket.leave("route:" + id);
      socket.emit("route:left", { routeId: id });
    });
  });

  console.log("[lipamove] Socket.io ready at path /socket.io/ (SOCKET_AUTH_REQUIRED=" + requireAuth + ")");
  return io;
}

function getIo() {
  if (!io) {
    throw new Error("Socket.io not initialized — call initSocket(server) after creating http.Server");
  }
  return io;
}

/**
 * Broadcast a position update to all connected clients (and optionally to a route room without duplicating).
 * @param {object} puvData
 */
function broadcastPUVUpdate(puvData) {
  const payload = normalizePuvPayload(puvData);
  lastByPuvId.set(String(payload.puvId), payload);
  // Fleet-wide; clients that called joinRoute(routeId) can also listen for route-scoped emits via broadcastPUVUpdateToRoute.
  getIo().emit("puv:update", payload);
}

/**
 * Broadcast status change (start/stop/offline/etc.).
 * @param {object} statusPayload — must include at least puvId, status; routeId optional
 */
function broadcastPUVStatus(statusPayload) {
  const payload = {
    ...statusPayload,
    timestamp: statusPayload.timestamp ? new Date(statusPayload.timestamp).toISOString() : new Date().toISOString(),
  };
  getIo().emit("puv:status", payload);
}

/** Emit last-known positions for all PUVs seen since server start. */
function broadcastAllActivePUVs() {
  const vehicles = Array.from(lastByPuvId.values());
  getIo().emit("puv:snapshot", {
    vehicles,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Route-only broadcast (no global emit) — use when you want clients that only joined a route room to receive updates.
 * @param {number} routeId
 * @param {object} puvData
 */
function broadcastPUVUpdateToRoute(routeId, puvData) {
  const payload = normalizePuvPayload({ ...puvData, routeId });
  lastByPuvId.set(String(payload.puvId), payload);
  getIo().to("route:" + Number(routeId)).emit("puv:update", payload);
}

module.exports = {
  initSocket,
  getIo,
  verifySocketToken,
  broadcastPUVUpdate,
  broadcastPUVStatus,
  broadcastAllActivePUVs,
  broadcastPUVUpdateToRoute,
};
