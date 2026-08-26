const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getCareerDashboard } = require("../controllers/careerDashboardController");

// All routes are protected
router.use(protect);

// Get career dashboard
router.get("/", getCareerDashboard);

module.exports = router;
