import mongoose from "mongoose";
import { Property } from "./propertyModel.js";

const reviewSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    cleanlinessRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    locationRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    valueRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews from the same user for the same booking
reviewSchema.index({ propertyId: 1, userId: 1, bookingId: 1 }, { unique: true });

// Static method to update the property's average rating
reviewSchema.statics.calculateAverageRating = async function (propertyId) {
  const stats = await this.aggregate([
    {
      $match: { propertyId: propertyId },
    },
    {
      $group: {
        _id: "$propertyId",
        numberOfReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Property.findByIdAndUpdate(propertyId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      numberOfReviews: stats[0].numberOfReviews,
    });
  } else {
    await Property.findByIdAndUpdate(propertyId, {
      averageRating: 0,
      numberOfReviews: 0,
    });
  }
};

// Call calculateAverageRating after saving/updating a review
reviewSchema.post("save", function () {
  this.constructor.calculateAverageRating(this.propertyId);
});

reviewSchema.post("remove", function () {
  this.constructor.calculateAverageRating(this.propertyId);
});
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.propertyId);
  }
});
reviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.propertyId);
  }
});

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export { Review };
