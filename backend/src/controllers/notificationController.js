import { Notification } from "../Models/notificationModel.js";

// Internal helper to create a notification from other controllers
export const createNotification = async (userId, title, message, type = "SYSTEM", link = "") => {
  try {
    await Notification.create({ userId, title, message, type, link });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
};

// Get all notifications for user
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark single notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );
    res.status(200).json({ success: true, message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
