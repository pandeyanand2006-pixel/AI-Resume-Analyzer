const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { realtimeSearch, realtimeSearchGet } = require("../controllers/jobSearchController");

const router = express.Router();

router.use(authMiddleware);

// GET with query params (for easy testing)
router.get("/search", realtimeSearchGet);

// POST with body { resumeId, desiredRole, location, remoteFilter, skills }
router.post("/search", realtimeSearch);

module.exports = router;
