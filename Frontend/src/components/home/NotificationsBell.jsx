import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { axiosInstance } from "../../utils/axios";
import "./NotificationsBell.css";

const NotificationsBell = () => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await axiosInstance.get("/v1/rent/notifications");
      setNotifications(data.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // In a real app with WebSockets, we'd listen for events here.
    // We poll every 30 seconds for new notifications for this requirement.
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/v1/rent/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put("/v1/rent/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="notifications-container" ref={dropdownRef}>
      <div
        className="notifications-bell"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </div>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-btn">
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <span className="material-symbols-outlined">notifications_off</span>
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.read ? "unread" : ""}`}
                  onClick={() => !notification.read && markAsRead(notification._id)}
                >
                  <div className="notification-icon">
                    {notification.type === "BOOKING_CONFIRMED" && <span className="material-symbols-outlined text-success">check_circle</span>}
                    {notification.type === "PAYMENT_FAILED" && <span className="material-symbols-outlined text-danger">error</span>}
                    {notification.type === "NEW_INQUIRY" && <span className="material-symbols-outlined text-primary">mail</span>}
                    {notification.type === "INQUIRY_UPDATE" && <span className="material-symbols-outlined text-info">update</span>}
                    {notification.type === "PRICE_CHANGE" && <span className="material-symbols-outlined text-warning" style={{color: "#f59e0b"}}>trending_down</span>}
                    {notification.type === "SYSTEM" && <span className="material-symbols-outlined text-secondary">info</span>}
                  </div>
                  <div className="notification-content">
                    <h5>{notification.title}</h5>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  {!notification.read && <div className="unread-dot"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;

