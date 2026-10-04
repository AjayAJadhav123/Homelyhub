import express from "express";
import { protect } from "../controllers/authController.js";
import { createReview, getPropertyReviews, updateReview, deleteReview, checkReviewEligibility } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

// Get reviews for a property
reviewRouter.route("/property/:propertyId").get(getPropertyReviews);

// Check eligibility
reviewRouter.route("/eligibility/:propertyId").get(protect, checkReviewEligibility);

// Create, update, delete reviews
reviewRouter.route("/").post(protect, createReview);
reviewRouter.route("/:id")
  .put(protect, updateReview)
  .delete(protect, deleteReview);

export { reviewRouter };
