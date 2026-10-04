import { Server } from "socket.io";
import { Message } from "./Models/messageModel.js";
import { Conversation } from "./Models/conversationModel.js";

const initializeSocket = (server, allowedOrigins) => {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    }
  });

  const onlineUsers = new Map(); // userId -> socketId

  io.on("connection", (socket) => {
    // console.log("New socket connection:", socket.id);

    // User connects and registers their ID
    socket.on("register", (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        io.emit("online_users", Array.from(onlineUsers.keys()));
      }
    });

    // Join a specific conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
    });

    // Handle sending a message
    socket.on("send_message", async (data) => {
      try {
        const { conversationId, senderId, text } = data;

        // Save to DB
        const message = await Message.create({
          conversation: conversationId,
          sender: senderId,
          text: text
        });

        // Update conversation last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: text,
          lastMessageAt: Date.now()
        });

        // Broadcast to everyone in the room
        io.to(conversationId).emit("receive_message", message);

        // Also emit a general notification event if the receiver is online but not in the room
        // We find the conversation to know the other user
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          const receiverId = conversation.owner.toString() === senderId ? conversation.user.toString() : conversation.owner.toString();
          const receiverSocketId = onlineUsers.get(receiverId);
          
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("new_message_notification", {
              conversationId,
              message
            });
          }
        }
      } catch (err) {
        console.error("Socket send_message error:", err);
      }
    });

    socket.on("disconnect", () => {
      // Remove from online users
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

export default initializeSocket;
