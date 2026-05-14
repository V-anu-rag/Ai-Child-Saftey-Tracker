const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const childRoutes = require("./routes/children");
const locationRoutes = require("./routes/location");
const alertRoutes = require("./routes/alerts");
const geofenceRoutes = require("./routes/geofences");
const activityRoutes = require("./routes/activity");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

// ─── Security & Performance ───────────────────────────────────────────────────
// Trust proxy is required for rate limiting to work correctly behind proxies like Render/Fly/Vercel
app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  /\.vercel\.app$/,        // Allow all Vercel deployments
  /^http:\/\/192\.168\./,  // Allow local network for mobile dev
  /^exp:\/\//,             // Expo dev client
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed instanceof RegExp) return allowed.test(origin);
        return allowed === origin;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true,
    optionsSuccessStatus: 200, // Important for some older browsers/clients
  })
);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 req / 15 min per IP for standard API calls
  message: { success: false, message: "Too many requests. Try again later." },
});

const locationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600, // 600 req / 15 min per IP for high-frequency location updates
  message: { success: false, message: "Too many location updates. Try again later." },
});

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SafeTrack API is running",
    timestamp: new Date().toISOString(),
  });
});

// ─── Debug Push Route (Temporary) ──────────────────────────────────────────────
app.post("/api/debug/test-push", async (req, res) => {
  const { token, title, body } = req.body;
  console.log(`[DEBUG NOTIFICATION] Manual push test triggered for token: ${token}`);
  
  if (!token) return res.status(400).json({ success: false, message: "Missing token" });

  try {
    const fetch = require("node-fetch");
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{
        to: token,
        sound: "default",
        title: title || "Debug Test",
        body: body || "This is a test notification from /api/debug/test-push",
        priority: "high",
        channelId: "emergency-sos",
        data: { type: "debug" }
      }]),
    });

    const resData = await response.json();
    console.log("[DEBUG NOTIFICATION] Expo API Response:", JSON.stringify(resData));
    res.json({ success: true, expoResponse: resData });
  } catch (err) {
    console.error("[DEBUG NOTIFICATION] Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", apiLimiter, authRoutes);
app.use("/api/children", apiLimiter, childRoutes);
app.use("/api/location", locationLimiter, locationRoutes);
app.use("/api/alerts", apiLimiter, alertRoutes);
app.use("/api/geofences", apiLimiter, geofenceRoutes);
app.use("/api/activity", apiLimiter, activityRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
