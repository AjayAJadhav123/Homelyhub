import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["BOOKING_CONFIRMED", "PAYMENT_FAILED", "NEW_INQUIRY", "INQUIRY_UPDATE", "PRICE_CHANGE", "SYSTEM"],
      default: "SYSTEM",
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
    }
  },
  { timestamps: true }
);

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
export { Notification };
