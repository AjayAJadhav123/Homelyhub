import express from "express";
import { protect, restrictTo } from "../controllers/authController.js";
import { getOwnerAnalytics, getAdminAnalytics } from "../controllers/analyticsController.js";

const analyticsRouter = express.Router();

analyticsRouter.use(protect);
analyticsRouter.route("/").get(getOwnerAnalytics);
analyticsRouter.route("/admin").get(restrictTo("admin"), getAdminAnalytics);

export { analyticsRouter };
