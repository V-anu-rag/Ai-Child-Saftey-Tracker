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
      // Allow requests with no origin (like mobile apps or curl requests)
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
    credentials: true,
  })
);

// Rate limiting — 100 req / 15 min per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests. Try again later." },
});
app.use("/api/", limiter);

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

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/children", childRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/geofences", geofenceRoutes);
app.use("/api/activity", activityRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
