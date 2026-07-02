const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const authorize = require("../middleware/role");

const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  broadcastNotification,
} = require("../controllers/notificationController");

router.get("/", auth, getMyNotifications);
router.put("/read-all", auth, markAllNotificationsRead);
router.put("/:id/read", auth, markNotificationRead);
router.delete("/:id", auth, deleteNotification);
router.post("/broadcast", auth, authorize("admin"), broadcastNotification);

module.exports = router;
