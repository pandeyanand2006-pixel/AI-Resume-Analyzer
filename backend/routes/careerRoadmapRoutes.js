const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createCareerRoadmap,
  getUserRoadmaps,
  getRoadmapById,
  updateRoadmapProgress,
  deleteRoadmap,
  getLatestRoadmap,
} = require("../controllers/careerRoadmapController");

// All routes are protected
router.use(protect);

// Create a new career roadmap
router.post("/", createCareerRoadmap);

// Get all roadmaps for current user
router.get("/", getUserRoadmaps);

// Get latest roadmap
router.get("/latest", getLatestRoadmap);

// Get specific roadmap by ID
router.get("/:id", getRoadmapById);

// Update roadmap progress
router.put("/:id/progress", updateRoadmapProgress);

// Delete roadmap
router.delete("/:id", deleteRoadmap);

module.exports = router;
