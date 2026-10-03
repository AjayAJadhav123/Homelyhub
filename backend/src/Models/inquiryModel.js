import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.ObjectId,
      ref: "Property",
      required: true,
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Inquiry message is required"],
      trim: true,
      minlength: [10, "Message must be at least 10 characters long"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "read", "replied", "closed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Indexes for faster lookups
inquirySchema.index({ owner: 1, status: 1 });
inquirySchema.index({ sender: 1 });
inquirySchema.index({ property: 1 });

const Inquiry = mongoose.models.Inquiry || mongoose.model("Inquiry", inquirySchema);
export default Inquiry;
