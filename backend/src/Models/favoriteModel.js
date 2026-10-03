import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.ObjectId,
      ref: "Property",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent a user from favoriting the same property multiple times
favoriteSchema.index({ user: 1, property: 1 }, { unique: true });
// Index for quickly finding all favorites of a user
favoriteSchema.index({ user: 1 });

const Favorite = mongoose.models.Favorite || mongoose.model("Favorite", favoriteSchema);
export default Favorite;
