import express from "express";
import { protect } from "../controllers/authController.js";
import { getUserNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.use(protect);

notificationRouter.route("/").get(getUserNotifications);
notificationRouter.route("/read-all").put(markAllAsRead);
notificationRouter.route("/:id/read").put(markAsRead);

export { notificationRouter };
