// backend/controllers/notificationController.js
import asyncHandler from "express-async-handler";
import Notification from "../models/notificationModel.js";

const getNotifications = asyncHandler(async (req, res) => {
  // Return latest notifications (most recent first)
  const notifications = await Notification.find({})
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(notifications);
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ read: false }, { $set: { read: true } });
  res.json({ message: "All notifications marked read" });
});

export { getNotifications, markAllRead };
