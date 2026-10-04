import express from "express";
import { protect } from "../controllers/authController.js";
import { getConversations, getOrCreateConversation, getMessages } from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.use(protect);

chatRouter.route("/conversations").get(getConversations);
chatRouter.route("/conversations").post(getOrCreateConversation);
chatRouter.route("/messages/:conversationId").get(getMessages);

export { chatRouter };
