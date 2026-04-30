const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Child = require("../models/Child");
const Location = require("../models/Location");
const { checkGeofences } = require("../utils/geofenceUtils");

let io = null;

/**
 * Initialize Socket.io server and attach all event handlers
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.CLIENT_URL || "http://localhost:3000",
        /^http:\/\/192\.168\./,
        /^exp:\/\//,
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ─── Authentication middleware ─────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error("Authentication token required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = require("../models/User");
      const user = await User.findById(decoded.id).select("-password");

      if (!user || !user.isActive) return next(new Error("Invalid token"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  // ─── Connection handler ────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const { user } = socket;
    console.log(`🔌  Socket connected: ${user.name} (${user.role}) — ${socket.id}`);

    // Auto-join rooms based on role
    if (user.role === "parent") {
      const parentRoom = `parent:${user._id.toString()}`;
      socket.join(parentRoom);
      console.log(`🏠 Parent ${user.name} joined room: ${parentRoom}`);
    }

    // ── join-room (explicit) ────────────────────────────────────────────────
    socket.on("join-room", ({ roomId }) => {
      socket.join(roomId);
      console.log(`📌  ${user.name} joined room: ${roomId}`);
    });

    // ── child-specific join & status ─────────────────────────────────────────
    if (user.role === "child") {
      Child.findOneAndUpdate(
        { userId: user._id },
        { isOnline: true, lastSeen: new Date() },
        { new: true }
      ).then(child => {
        if (child) {
          socket.join(`child:${child._id}`);
          console.log(`📌 Child ${child.name} is now ONLINE`);
          // Notify parent immediately
          io.to(`parent:${child.parentId}`).emit("child-status", {
            childId: child._id,
            isOnline: true
          });
        }
      });
    }

    // ── tracking:command (parent → child) ────────────────────────────────────
    socket.on("tracking:command", (data) => {
      const { childId, command } = data;
      if (user.role === "parent" && childId) {
        console.log(`📡 Parent ${user.name} sending ${command} to child ${childId}`);
        io.to(`child:${childId}`).emit("tracking:command", { command });
      }
    });

    // ── send-location (child → server → parent) ─────────────────────────────
    socket.on("send-location", async (data) => {
      try {
        const { childId, latitude, longitude, accuracy, altitude, speed, batteryLevel } = data;

        if (!childId || latitude == null || longitude == null) return;

        // Find child and verify ownership
        const child = await Child.findById(childId);
        if (!child) return;

        // Deduplication check: Ignore if coordinates are identical to last update and received < 10s ago
        const lastLoc = await Location.findOne({ childId }).sort({ createdAt: -1 });
        if (lastLoc) {
          const timeDiff = (Date.now() - new Date(lastLoc.createdAt).getTime()) / 1000;
          const isSameCoords = lastLoc.latitude === latitude && lastLoc.longitude === longitude;
          if (isSameCoords && timeDiff < 10) {
            return; // Silently ignore duplicate
          }
        }

        // Store location in DB
        await Location.create({
          childId,
          parentId: child.parentId,
          latitude,
          longitude,
          accuracy,
          altitude,
          speed,
          batteryLevel,
        });

        // Update child record
        await Child.findByIdAndUpdate(childId, {
          lastLocation: { lat: latitude, lng: longitude, timestamp: new Date() },
          batteryLevel,
          isOnline: true,
        });

        // Broadcast to parent's room
        io.to(`parent:${child.parentId}`).emit("location-update", {
          childId,
          latitude,
          longitude,
          accuracy,
          batteryLevel,
          timestamp: new Date().toISOString(),
        });

        // Geofence check (non-blocking)
        checkGeofences(childId, child.parentId.toString(), latitude, longitude).catch(
          console.error
        );
      } catch (err) {
        console.error("send-location error:", err.message);
      }
    });

    // ── send-alert (child SOS from socket) ─────────────────────────────────
    socket.on("send-alert", async (data) => {
      try {
        const { childId, type, message, latitude, longitude } = data;

        const Alert = require("../models/Alert");
        const { sendPushNotification } = require("../utils/fcm");
        const child = await Child.findById(childId).select("name parentId");
        if (!child) return;

        const severity = type === "sos" ? "critical" : "medium";
        const address = latitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : "Unknown location";

        const alert = await Alert.create({
          childId,
          parentId: child.parentId,
          type: type || "sos",
          severity,
          title: type === "sos" ? `🚨 SOS from ${child.name}` : `Alert from ${child.name}`,
          message,
          location: latitude ? { lat: latitude, lng: longitude, address } : undefined,
        });

        const alertData = alert.toObject();
        const parentRoom = `parent:${child.parentId.toString()}`;
        console.log(`📡 Broadcasting socket alert to: ${parentRoom}`);
        
        io.to(parentRoom).emit("alert-received", {
          ...alertData,
          id: alertData._id,
          timestamp: alertData.createdAt,
          childName: child.name,
        });

        // Also send push notification
        await sendPushNotification(
          child.parentId,
          {
            title: type === "sos" ? `🚨 SOS: ${child.name}` : `Alert: ${child.name}`,
            body: message,
          },
          {
            type: type || "sos",
            childId: childId.toString(),
            alertId: alert._id.toString(),
          }
        );
      } catch (err) {
        console.error("send-alert error:", err.message);
      }
    });

    // ── child status updates ─────────────────────────────────────────────────
    socket.on("update-status", async ({ childId, batteryLevel }) => {
      try {
        const child = await Child.findByIdAndUpdate(
          childId,
          { batteryLevel, isOnline: true, lastSeen: new Date() },
          { new: true }
        );
        if (child) {
          io.to(`parent:${child.parentId}`).emit("child-status", {
            childId,
            isOnline: true,
            batteryLevel,
          });
        }
      } catch (err) {
        console.error("update-status error:", err.message);
      }
    });

    // ── disconnect ──────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      console.log(`🔌  Socket disconnected: ${user.name} — ${socket.id}`);

      // If a child disconnects, mark all their children as offline
      if (user.role === "child") {
        try {
          const child = await Child.findOneAndUpdate(
            { userId: user._id },
            { isOnline: false },
            { new: true }
          );
          if (child) {
            io.to(`parent:${child.parentId}`).emit("child-status", {
              childId: child._id,
              isOnline: false,
            });
          }
        } catch (err) {
          console.error("disconnect cleanup error:", err.message);
        }
      }
    });
  });

  console.log("📡  Socket.io initialized");
  return io;
};

/**
 * Get the active IO instance (for use in controllers)
 */
const getIO = () => io;

module.exports = { initSocket, getIO };
