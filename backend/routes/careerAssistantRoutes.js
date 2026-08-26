const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  chatWithAssistant,
  getSuggestedQuestions
} = require('../controllers/careerAssistantController');

// Logging middleware
router.use((req, res, next) => {
  console.log(`[Career Assistant] ${req.method} ${req.path}`);
  next();
});

// @route   POST /api/career-assistant/chat
// @desc    Chat with AI Career Assistant
// @access  Public (no authentication required)
router.post('/chat', chatWithAssistant);

// @route   GET /api/career-assistant/suggestions
// @desc    Get suggested questions
// @access  Public (no authentication required)
router.get('/suggestions', getSuggestedQuestions);

module.exports = router;
