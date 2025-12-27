import React, { useState, useEffect } from "react";
import StudentHeader from "../components/StudentHeader";
import {
  FaBell,
  FaCheckCircle,
  FaExclamationCircle,
  FaInbox,
  FaEnvelope,
  FaEnvelopeOpen,
  FaFilter,
  FaTrash,
  FaCheck,
} from "react-icons/fa";

const apiBase = process.env.REACT_APP_API_URL;

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  useEffect(() => {
    loadNotifications();
    const intervalId = setInterval(loadNotifications, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const loadNotifications = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.email) return;

      const res = await fetch(
        `${apiBase}/api/notifications?email=${encodeURIComponent(user.email)}`
      );
      const data = await res.json();
      const notificationList = data.notifications || data;
      setNotifications(
        notificationList.map((n) => ({
          id: n._id,
          type: n.type,
          message: n.message,
          timestamp: new Date(n.createdAt).toLocaleString(),
          read: n.read,
          priority: n.priority || "medium",
        }))
      );
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${apiBase}/api/notifications/${id}/read`, {
        method: "POST",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.email) return;

      await fetch(`${apiBase}/api/notifications/mark-all-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`${apiBase}/api/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setSelectedNotifications((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const deleteSelected = async () => {
    try {
      await Promise.all(
        Array.from(selectedNotifications).map((id) =>
          fetch(`${apiBase}/api/notifications/${id}`, { method: "DELETE" })
        )
      );
      setNotifications((prev) =>
        prev.filter((n) => !selectedNotifications.has(n.id))
      );
      setSelectedNotifications(new Set());
    } catch (error) {
      console.error("Failed to delete selected:", error);
    }
  };

  const toggleSelectNotification = (id) => {
    setSelectedNotifications((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getIcon = (type) => {
    const iconProps = { className: "w-6 h-6" };
    switch (type) {
      case "submission":
        return <FaCheckCircle {...iconProps} className="text-green-500" />;
      case "feedback":
        return (
          <FaExclamationCircle {...iconProps} className="text-yellow-500" />
        );
      case "reminder":
        return <FaBell {...iconProps} className="text-blue-500" />;
      default:
        return <FaInbox {...iconProps} className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-l-red-500";
      case "medium":
        return "border-l-4 border-l-yellow-500";
      case "low":
        return "border-l-4 border-l-green-500";
      default:
        return "border-l-4 border-l-gray-300";
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "read") return n.read;
    if (filter === "unread") return !n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#575C9E] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StudentHeader />

      <main className="flex-grow p-6 max-w-6xl mx-auto w-full">
        {/* Header - Consistent with Admin Portal */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-0">
              <div className="p-3 sm:p-4 bg-[#6B46C1]/10 rounded-2xl">
                <FaBell className="w-8 h-8 sm:w-10 sm:h-10 text-[#6B46C1]" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Notifications
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Stay updated with your academic progress and important updates
                </p>
              </div>
            </div>

            <div className="text-center bg-[#6B46C1]/10 px-6 py-3 rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold text-[#6B46C1]">
                {unreadCount}
              </div>
              <div className="text-sm text-gray-600">Unread</div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <FaFilter className="w-4 h-4" />
              <span className="font-medium">Filter:</span>
            </div>
            <div className="flex gap-2">
              {["all", "unread", "read"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filter === f
                      ? "bg-[#6B46C1] text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {selectedNotifications.size > 0 && (
              <button
                onClick={deleteSelected}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <FaTrash className="w-4 h-4" />
                Delete Selected ({selectedNotifications.size})
              </button>
            )}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <FaCheck className="w-4 h-4" />
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FaEnvelopeOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {filter === "all"
                  ? "No Notifications"
                  : `No ${filter} notifications`}
              </h3>
              <p className="text-gray-500">
                {filter === "all"
                  ? "You're all caught up! Check back later for new updates."
                  : `No ${filter} notifications found.`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden ${getPriorityColor(
                  notif.priority
                )} ${notif.read ? "opacity-75" : "ring-1 ring-[#6B46C1]/20"}`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notif.id)}
                      onChange={() => toggleSelectNotification(notif.id)}
                      className="mt-1 w-4 h-4 text-[#6B46C1] border-gray-300 rounded focus:ring-[#6B46C1]"
                    />

                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {notif.read ? (
                        <FaEnvelopeOpen className="w-5 h-5 text-gray-400" />
                      ) : (
                        <FaEnvelope className="w-5 h-5 text-[#6B46C1]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getIcon(notif.type)}
                          <p
                            className={`font-medium ${
                              notif.read ? "text-gray-600" : "text-gray-900"
                            }`}
                          >
                            {notif.message}
                          </p>
                        </div>
                        {!notif.read && (
                          <span className="flex-shrink-0 bg-[#6B46C1]/10 text-[#6B46C1] text-xs px-2 py-1 rounded-full font-medium">
                            New
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          {notif.timestamp}
                        </p>
                        <div className="flex gap-3">
                          {!notif.read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="text-sm text-[#6B46C1] hover:text-[#553399] font-medium hover:underline transition-colors"
                            >
                              Mark as Read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="bg-[#F3F0FF] border-t border-[#E9E3FF] py-4 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-[#6B46C1] font-medium">
            © 2025 DeskInspect. All rights reserved. | Notifications
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NotificationPage;
