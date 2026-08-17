const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const skillGapRoutes = require("./routes/skillGapRoutes");
const jobMatchingRoutes = require("./routes/jobMatchingRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// ==========================================
// Connect to MongoDB
// ==========================================

connectDB();

// ==========================================
// Middleware
// ==========================================

// Security: set sensible HTTP headers
app.use(helmet());

// CORS: allow a single origin or a comma-separated allowlist via FRONTEND_URLS
const frontendUrls =
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  "http://localhost:5175";

const allowedOrigins = frontendUrls
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // such as Postman, curl, and some mobile requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);

      return callback(
        new Error(`CORS policy: Origin ${origin} is not allowed.`)
      );
    },
    credentials: true,
  })
);
app.use(express.json());

// Rate limiting: basic protection against brute force and abuse
const rateWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const rateMax = parseInt(process.env.RATE_LIMIT_MAX, 10) || (process.env.NODE_ENV === 'production' ? 100 : 200);

const limiter = rateLimit({
  windowMs: rateWindowMs,
  max: rateMax,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// ==========================================
// Routes
// ==========================================

// Authentication routes
app.use("/api/auth", authRoutes);

// Resume upload & analysis routes
app.use("/api/resumes", resumeRoutes);

// Skill Gap Analysis routes
app.use("/api/skill-gap", skillGapRoutes);

app.use("/api/job-matching", jobMatchingRoutes);

// ==========================================
// Health Check
// ==========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Resume Analyzer API is running",
  });
});

// Centralized error handler to avoid leaking stack traces
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err?.message || err);

  const status = err?.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Server error"
      : err?.message || "Server error";

  res.status(status).json({
    success: false,
    message,
  });
});

// ==========================================
// Export app and start server when run directly
// ==========================================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;