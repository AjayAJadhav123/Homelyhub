import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.ObjectId,
    ref: "Property",
    required: true
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true
  },
  lastMessage: {
    type: String
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure uniqueness of a conversation
conversationSchema.index({ property: 1, owner: 1, user: 1 }, { unique: true });

export const Conversation = mongoose.model("Conversation", conversationSchema);
