const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createGeneratedResume,
  getGeneratedResumes,
  getGeneratedResumeById,
  updateGeneratedResume,
  deleteGeneratedResume,
  generateAIResume,
} = require("../controllers/resumeBuilderController");

const router = express.Router();

// ==========================================
// CREATE RESUME
// POST /api/resumes/builder
// ==========================================

router.post(
  "/",
  authMiddleware,
  createGeneratedResume
);

// ==========================================
// GET ALL USER RESUMES
// GET /api/resumes/builder
// ==========================================

router.get(
  "/",
  authMiddleware,
  getGeneratedResumes
);

// ==========================================
// GET ONE RESUME
// GET /api/resumes/builder/:id
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  getGeneratedResumeById
);

// ==========================================
// UPDATE RESUME
// PUT /api/resumes/builder/:id
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  updateGeneratedResume
);

// ==========================================
// DELETE RESUME
// DELETE /api/resumes/builder/:id
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  deleteGeneratedResume
);

// ==========================================
// GENERATE AI RESUME
// POST /api/resumes/builder/:id/ai
// ==========================================

router.post(
  "/:id/ai",
  authMiddleware,
  generateAIResume
);

module.exports = router;