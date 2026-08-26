const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  optimizeResumeForJob,
} = require("../controllers/jobOptimizationController");

const router = express.Router();

// ==========================================
// JOB-SPECIFIC RESUME OPTIMIZATION
// POST /api/job-optimization
// ==========================================

router.post(
  "/",
  authMiddleware,
  optimizeResumeForJob
);

module.exports = router;