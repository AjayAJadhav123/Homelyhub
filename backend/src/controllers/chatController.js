import { Conversation } from "../Models/conversationModel.js";
import { Message } from "../Models/messageModel.js";
import { Property } from "../Models/propertyModel.js";

// Fetch user's conversations
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      $or: [{ owner: userId }, { user: userId }]
    })
      .populate("property", "propertyName address images")
      .populate("owner", "name avatar")
      .populate("user", "name avatar")
      .sort({ lastMessageAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Start or get existing conversation
export const getOrCreateConversation = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user._id;

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });
    if (!property.userId) return res.status(400).json({ success: false, message: "Invalid property owner" });

    // Can't chat with yourself
    if (property.userId.toString() === userId.toString()) {
      return res.status(400).json({ success: false, message: "You cannot chat with yourself." });
    }

    let conversation = await Conversation.findOne({
      property: propertyId,
      owner: property.userId,
      user: userId
    });

    if (!conversation) {
      conversation = await Conversation.create({
        property: propertyId,
        owner: property.userId,
        user: userId
      });
    }

    // Populate after creation or finding
    conversation = await Conversation.findById(conversation._id)
      .populate("property", "propertyName address images")
      .populate("owner", "name avatar")
      .populate("user", "name avatar");

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Authorization check
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });

    const userId = req.user._id.toString();
    if (conversation.owner.toString() !== userId && conversation.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to view this conversation" });
    }

    const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: req.user._id }, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
