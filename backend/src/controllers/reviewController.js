import { Review } from "../Models/reviewModel.js";
import { Booking } from "../Models/bookingModel.js";

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { propertyId, bookingId, rating, cleanlinessRating, locationRating, valueRating, comment } = req.body;
    const userId = req.user._id;

    // Verify booking belongs to user and is completed/approved (in this system, we'll just check if booking exists for user and property)
    const booking = await Booking.findOne({ _id: bookingId, user: userId, property: propertyId });
    if (!booking) {
      return res.status(403).json({ success: false, message: "No valid booking found to review this property." });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ propertyId, userId, bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this booking." });
    }

    const review = await Review.create({
      propertyId,
      userId,
      bookingId,
      rating,
      cleanlinessRating,
      locationRating,
      valueRating,
      comment,
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reviews for a property
export const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ propertyId: req.params.propertyId }).populate("userId", "name");
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user._id;

    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found or unauthorized." });
    }

    const updatedReview = await Review.findOneAndUpdate(
      { _id: reviewId, userId },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user._id;

    const review = await Review.findOneAndDelete({ _id: reviewId, userId });
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found or unauthorized." });
    }

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check if user is eligible to review
export const checkReviewEligibility = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user._id;

    // Has the user already reviewed?
    const existingReview = await Review.findOne({ propertyId, userId });
    if (existingReview) {
      return res.status(200).json({ success: true, canReview: false, reason: "already_reviewed", review: existingReview });
    }

    // Has the user booked this property?
    const booking = await Booking.findOne({ property: propertyId, user: userId });
    if (!booking) {
      return res.status(200).json({ success: true, canReview: false, reason: "no_booking" });
    }

    return res.status(200).json({ success: true, canReview: true, bookingId: booking._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
