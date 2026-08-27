const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  uploadResume,
  getUserResumes,
  getResumeById,
  getResumeFile,
  deleteResume,
  analyzeResume,
  getLatestResume,
} = require("../controllers/resumeController");

const router = express.Router();

// ==========================================
// POST /api/resumes/upload
// Upload a resume (PDF or DOCX)
// ==========================================
router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

// ==========================================
// GET /api/resumes
// Get all resumes for logged-in user
// ==========================================
router.get(
  "/",
  authMiddleware,
  getUserResumes
);

// ==========================================
// GET /api/resumes/latest
// Get the user's most recent resume across
// both builder (GeneratedResume) and uploaded Resume.
// MUST be declared BEFORE /:id to avoid param collision.
// ==========================================
router.get(
  "/latest",
  authMiddleware,
  getLatestResume
);

// ==========================================
// GET /api/resumes/:id/file
// Serve resume file (PDF/DOCX) inline
// ==========================================
router.get(
  "/:id/file",
  authMiddleware,
  getResumeFile
);

// ==========================================
// GET /api/resumes/:id
// Get a single resume by ID
// ==========================================
router.get(
  "/:id",
  authMiddleware,
  getResumeById
);

// ==========================================
// DELETE /api/resumes/:id
// Delete a resume by ID
// ==========================================
router.delete(
  "/:id",
  authMiddleware,
  deleteResume
);

// ==========================================
// POST /api/resumes/analyze/:id
// Analyze resume using Gemini AI
// ==========================================
router.post(
  "/analyze/:id",
  authMiddleware,
  analyzeResume
);

module.exports = router;
