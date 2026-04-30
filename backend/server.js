const dns = require("dns");
// Only force Google DNS in development to bypass potential local ISP blocks
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8"]);
}

require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const { connectDB } = require("./src/config/db");
const { initSocket } = require("./src/socket/socketHandler");

const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
initSocket(server);

// ── Inactivity Cron ──────────────────────────────────────────────────────────
// Every 10 minutes: alert parent if a child's location hasn't updated in 30 min
const INACTIVITY_CHECK_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const INACTIVITY_THRESHOLD_MS = 30 * 60 * 1000;      // 30 minutes

function startInactivityCron() {
  const Location = require("./src/models/Location");
  const Child = require("./src/models/Child");
  const Alert = require("./src/models/Alert");
  const { getIO } = require("./src/socket/socketHandler");

  setInterval(async () => {
    try {
      const io = getIO();
      if (!io) return;

      const cutoff = new Date(Date.now() - INACTIVITY_THRESHOLD_MS);
      // Find children who haven't updated location recently
      const staleChildren = await Child.find({ 
        "lastLocation.timestamp": { $lt: cutoff },
        isOnline: true 
      });

      for (const child of staleChildren) {
        const message = `No location update from ${child.name} for over 30 minutes.`;
        const alert = await Alert.create({
          childId: child._id,
          parentId: child.parentId,
          type: "device_offline",
          severity: "high",
          title: "Connectivity Alert",
          message,
        });

        io.to(`parent:${child.parentId}`).emit("alert-received", {
          ...alert.toObject(),
          childName: child.name,
        });
        
        // Also mark as offline
        child.isOnline = false;
        await child.save();
        
        console.log(`[Inactivity] Alert sent and offline marked for: ${child.name}`);
      }
    } catch (err) {
      console.error("[Inactivity cron error]", err.message);
    }
  }, INACTIVITY_CHECK_INTERVAL_MS);

  console.log("📡 Inactivity cron started (30m threshold)");
}

// Connect to MongoDB then start listening
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`\n🚀  SafeTrack server running on port ${PORT}`);
      console.log(`📡  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗  Health check: http://localhost:${PORT}/api/health\n`);
      startInactivityCron();
    });
  })
  .catch((err) => {
    console.error("❌  Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

// Graceful Shutdown
const gracefulShutdown = () => {
  console.log("\n🛑 SIGTERM/SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("🔌 HTTP server closed.");
    // Close DB connection if needed (Mongoose handles this generally, but explicit is better)
    const mongoose = require("mongoose");
    mongoose.connection.close(false).then(() => {
      console.log("📦 MongoDB connection closed.");
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("⚠️ Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});
