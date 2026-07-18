const Notification = require("../models/Notification");
const User = require("../models/User");
const { emitNotification } = require("../sockets/socket");

const createNotification = async ({
  userId,
  title,
  message,
  type = "system",
  priority = "normal",
  actionUrl = "",
  metadata = {},
}) => {
  if (!userId || !title || !message) return null;

  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    priority,
    actionUrl,
    metadata,
  });

  emitNotification(notification);

  return notification;
};

const sendError = (res, error) => {
  const statusCode = error.name === "ValidationError" ? 400 : 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message,
  });
};

const getMyNotifications = async (req, res) => {
  try {
    const filter = { userId: req.user._id };

    if (req.query.unread === "true") filter.isRead = false;
    if (req.query.type) filter.type = req.query.type;

    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    sendError(res, error);
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;
    notification.readAt = notification.readAt || new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    sendError(res, error);
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        userId: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    sendError(res, error);
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    sendError(res, error);
  }
};

const broadcastNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type = "system",
      priority = "normal",
      role,
      actionUrl = "",
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    const userFilter = role ? { role } : {};
    const users = await User.find(userFilter).select("_id");
    const notifications = users.map((user) => ({
      userId: user._id,
      title,
      message,
      type,
      priority,
      actionUrl,
      metadata: {
        broadcast: true,
        role: role || "all",
      },
    }));

    if (notifications.length) {
      const created = await Notification.insertMany(notifications);
      created.forEach((notification) => emitNotification(notification));
    }

    res.status(201).json({
      success: true,
      message: "Notification broadcast sent",
      sentCount: notifications.length,
    });
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  broadcastNotification,
};
