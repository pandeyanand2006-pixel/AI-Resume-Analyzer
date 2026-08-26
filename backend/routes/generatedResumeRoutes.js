const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  generateResume,
  getGeneratedResumes,
} = require("../controllers/generatedResumeController");

router.post("/", authMiddleware, generateResume);

router.get("/", authMiddleware, getGeneratedResumes);

module.exports = router;