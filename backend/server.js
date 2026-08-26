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
const resumeBuilderRoutes = require("./routes/resumeBuilderRoutes");
const jobOptimizationRoutes = require("./routes/jobOptimizationRoutes");
const careerRoadmapRoutes = require("./routes/careerRoadmapRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const careerDashboardRoutes = require("./routes/careerDashboardRoutes");
const resumeComparisonRoutes = require("./routes/resumeComparisonRoutes");
const careerAssistantRoutes = require("./routes/careerAssistantRoutes");
const jobSearchRoutes = require("./routes/jobSearchRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// ==========================================
// Connect to MongoDB
// ==========================================

connectDB();

// ==========================================
// Middleware
// ==========================================

app.use(helmet());

const frontendUrls =
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,http://127.0.0.1:5176";

const allowedOrigins = frontendUrls
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

console.log('Allowed CORS origins:', allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
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

// ==========================================
// Rate Limiting
// ==========================================

const rateWindowMs =
  parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;

const rateMax =
  parseInt(process.env.RATE_LIMIT_MAX, 10) ||
  (process.env.NODE_ENV === "production" ? 100 : 200);

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

// Authentication
app.use("/api/auth", authRoutes);

// Resume Builder
app.use("/api/resumes/builder", resumeBuilderRoutes);

app.use(
  "/api/job-optimization",
  jobOptimizationRoutes
);

// Resume upload and analysis
app.use("/api/resumes", resumeRoutes);

// Skill Gap Analysis
app.use("/api/skill-gap", skillGapRoutes);

// Job Matching
app.use("/api/job-matching", jobMatchingRoutes);

// Career Roadmap
app.use("/api/career-roadmap", careerRoadmapRoutes);

// AI Interviewer
app.use("/api/interviews", interviewRoutes);

// Notifications
app.use("/api/notifications", notificationRoutes);

// Career Dashboard
app.use("/api/career-dashboard", careerDashboardRoutes);

// Resume Comparison
app.use("/api/resume-comparison", resumeComparisonRoutes);

// Career Assistant (AI Chat)
app.use("/api/career-assistant", careerAssistantRoutes);

// Real-time Job Search (Arbeitnow + Remotive)
app.use("/api/jobs", jobSearchRoutes);

// ==========================================
// Health Check
// ==========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Resume Analyzer API is running",
  });
});

// ==========================================
// Error Handler
// ==========================================

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
// Start Server
// ==========================================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;