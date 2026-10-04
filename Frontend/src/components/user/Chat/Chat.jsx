import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { axiosInstance } from "../../../utils/axios";
import LoadingSpinner from "../../LoadingSpinner";
import "./Chat.css";

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:3000";

const Chat = () => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Initialize Socket & Fetch Conversations
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const newSocket = io(SOCKET_URL, { withCredentials: true });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("register", user._id);
    });

    newSocket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("receive_message", (message) => {
      // If we are currently viewing this conversation, append the message
      if (activeConv && message.conversation === activeConv._id) {
        setMessages((prev) => [...prev, message]);
      }
      // Also update the conversation list snippet
      setConversations((prev) => 
        prev.map(c => 
          c._id === message.conversation 
            ? { ...c, lastMessage: message.text, lastMessageAt: message.createdAt } 
            : c
        ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    });

    // Also listen for notifications if we aren't inside that room
    newSocket.on("new_message_notification", ({ conversationId, message }) => {
      setConversations((prev) => 
        prev.map(c => 
          c._id === conversationId 
            ? { ...c, lastMessage: message.text, lastMessageAt: message.createdAt } 
            : c
        ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    });

    const fetchConversations = async () => {
      try {
        const { data } = await axiosInstance.get("/v1/rent/chat/conversations");
        setConversations(data.data);
      } catch (err) {
        console.error("Error fetching conversations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    return () => newSocket.disconnect();
  }, [isAuthenticated, user, activeConv]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConv) return;
      try {
        const { data } = await axiosInstance.get(`/v1/rent/chat/messages/${activeConv._id}`);
        setMessages(data.data);
        if (socket) socket.emit("join_conversation", activeConv._id);
      } catch (err) {
        console.error("Error fetching messages", err);
      }
    };

    fetchMessages();
  }, [activeConv]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv || !socket) return;

    socket.emit("send_message", {
      conversationId: activeConv._id,
      senderId: user._id,
      text: newMessage
    });

    setNewMessage("");
  };

  if (!isAuthenticated || !user) {
    return <div className="chat-fallback">Please login to access messages.</div>;
  }

  if (loading) return <div className="chat-fallback"><LoadingSpinner /></div>;

  return (
    <div className="chat-wrapper">
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h3>Messages</h3>
        </div>
        <div className="chat-conversation-list">
          {conversations.length === 0 ? (
            <div className="no-conversations">No conversations yet.</div>
          ) : (
            conversations.map((conv) => {
              const otherPerson = conv.owner._id === user._id ? conv.user : conv.owner;
              const isOnline = onlineUsers.includes(otherPerson._id);
              
              return (
                <div 
                  key={conv._id} 
                  className={`conversation-item ${activeConv?._id === conv._id ? "active" : ""}`}
                  onClick={() => setActiveConv(conv)}
                >
                  <div className="avatar-wrapper">
                    {otherPerson.avatar?.url ? (
                      <img src={otherPerson.avatar.url} alt="avatar" className="conv-avatar" />
                    ) : (
                      <span className="material-symbols-outlined conv-avatar-placeholder">account_circle</span>
                    )}
                    {isOnline && <div className="online-indicator"></div>}
                  </div>
                  <div className="conv-details">
                    <div className="conv-header">
                      <h4>{otherPerson.name}</h4>
                      {conv.lastMessageAt && (
                        <span className="conv-time">
                          {new Date(conv.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p className="conv-property">{conv.property.propertyName}</p>
                    <p className="conv-last-msg">{conv.lastMessage || "No messages yet."}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="chat-main">
        {!activeConv ? (
          <div className="chat-empty-state">
            <span className="material-symbols-outlined chat-icon-large">forum</span>
            <h2>Your Messages</h2>
            <p>Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <h3>{activeConv.owner._id === user._id ? activeConv.user.name : activeConv.owner.name}</h3>
                <span className="chat-header-property">
                  <span className="material-symbols-outlined">home</span>
                  {activeConv.property.propertyName}
                </span>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((msg) => {
                const isMe = msg.sender === user._id;
                return (
                  <div key={msg._id} className={`message-wrapper ${isMe ? "mine" : "theirs"}`}>
                    <div className="message-bubble">
                      <p>{msg.text}</p>
                      <span className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" disabled={!newMessage.trim()}>
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
