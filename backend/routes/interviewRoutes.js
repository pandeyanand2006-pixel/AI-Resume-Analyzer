const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createInterviewSession,
  startInterviewSession,
  submitAnswer,
  completeInterview,
  getUserInterviews,
  getInterviewById,
  deleteInterview,
  getLatestInterview,
} = require("../controllers/interviewController");

// All routes are protected
router.use(protect);

// Create a new interview session
router.post("/", createInterviewSession);

// Get all interviews for current user
router.get("/", getUserInterviews);

// Get latest interview
router.get("/latest", getLatestInterview);

// Get specific interview by ID
router.get("/:id", getInterviewById);

// Start interview
router.post("/:id/start", startInterviewSession);

// Submit answer to question
router.post("/:id/answer", submitAnswer);

// Complete interview and get evaluation
router.post("/:id/complete", completeInterview);

// Delete interview
router.delete("/:id", deleteInterview);

module.exports = router;
