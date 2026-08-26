const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  compareResumes,
  getResumesForComparison
} = require('../controllers/resumeComparisonController');

// All routes require authentication
router.use(protect);

// @route   GET /api/resume-comparison/list
// @desc    Get user's resumes for comparison
// @access  Private
router.get('/list', getResumesForComparison);

// @route   POST /api/resume-comparison/compare
// @desc    Compare two resume versions
// @access  Private
router.post('/compare', compareResumes);

module.exports = router;
