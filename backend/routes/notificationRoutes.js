const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getUnreadCount,
} = require("../controllers/notificationController");

// All routes are protected
router.use(protect);

// Get all notifications
router.get("/", getUserNotifications);

// Get unread count
router.get("/unread/count", getUnreadCount);

// Create notification
router.post("/", createNotification);

// Mark all as read
router.put("/read-all", markAllAsRead);

// Mark notification as read
router.put("/:id/read", markAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

module.exports = router;
