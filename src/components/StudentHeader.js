import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaHome,
  FaFileUpload,
  FaCalendarAlt,
  FaBell,
  FaChartLine,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const apiBase = process.env.REACT_APP_API_URL;

const studentNavItems = [
  { label: "Home", href: "/student/dashboard", icon: <FaHome /> },
  {
    label: "Thesis Submission",
    href: "/student/thesissubmission",
    icon: <FaFileUpload />,
  },
  { label: "Events", href: "/student/events", icon: <FaCalendarAlt /> },
  {
    label: "Notifications",
    href: "/student/notifications",
    icon: <FaBell />,
  },
  { label: "Results", href: "/student/results", icon: <FaChartLine /> },
];

const StudentHeader = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [popup, setPopup] = useState(null);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const remindersKey = (email) => `reminders:${email}`;
  const processedKey = (email) => `reminders_processed:${email}`;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activePath = location.pathname;
  const currentPage = studentNavItems.find((item) =>
    activePath.startsWith(item.href)
  );
  const currentTitle = currentPage
    ? `DeskInspect – ${currentPage.label}`
    : "DeskInspect – Student";

  // Hide navigation on dashboard page
  const isDashboardPage = activePath === "/student/dashboard";

  // Global reminder trigger/popup
  useEffect(() => {
    if (!user?.email) return;
    let timer = null;
    const poll = async () => {
      try {
        const saved = localStorage.getItem(remindersKey(user.email));
        if (!saved) return;
        const reminders = JSON.parse(saved);
        const processedRaw = localStorage.getItem(processedKey(user.email));
        const processed = processedRaw ? JSON.parse(processedRaw) : {};
        const now = Date.now();
        for (const [evtId, when] of Object.entries(reminders)) {
          const ts = new Date(when).getTime();
          if (ts && ts <= now && !processed[evtId]) {
            const eventsRes = await fetch(`${apiBase}/api/events`);
            const events = await eventsRes.json();
            const name = events.find((e) => e._id === evtId)?.name || "event";
            let created = null;
            try {
              const res = await fetch(`${apiBase}/api/notifications`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: user.email,
                  type: "reminder",
                  title: "Event Reminder",
                  message: `Reminder for ${name}`,
                  scheduledAt: new Date(when).toISOString(),
                  priority: "high",
                }),
              });
              created = await res.json();
            } catch {}
            setPopup(created || { message: `Reminder for ${name}` });
            processed[evtId] = true;
            localStorage.setItem(
              processedKey(user.email),
              JSON.stringify(processed)
            );
            break;
          }
        }
      } catch {}
    };
    poll();
    timer = setInterval(poll, 10000);
    return () => clearInterval(timer);
  }, [user]);

  return (
    <header className="bg-[#6B46C1] text-white px-6 py-4 flex items-center justify-between shadow-md sticky top-0 z-50">
      {popup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform animate-slideUp">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] p-6">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-full">
                  <FaBell className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Event Reminder
                  </h3>
                  <p className="text-white text-opacity-90 text-sm">
                    Important notification
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-blue-50 border-l-4 border-[#6B46C1] p-4 rounded-r-lg mb-6">
                <p className="text-gray-800 text-base leading-relaxed">
                  {popup.message}
                </p>
              </div>

              {/* Action button */}
              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    if (popup._id) {
                      try {
                        await fetch(
                          `${apiBase}/api/notifications/${popup._id}/delivered`,
                          { method: "POST" }
                        );
                      } catch {}
                    }
                    setPopup(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6B46C1] focus:ring-offset-2"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Page Title */}
      <h1 className="text-lg font-semibold">{currentTitle}</h1>

      {/* Navigation Links */}
      <div className="flex items-center gap-6">
        {!isDashboardPage && (
          <nav className="flex gap-2">
            {studentNavItems.map((item, idx) => {
              const isActive = activePath.startsWith(item.href);
              return (
                <Link
                  key={idx}
                  to={item.href}
                  className={`group flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white text-[#6B46C1] shadow-lg"
                      : "bg-[#553399] text-white hover:bg-[#7d5bb8] hover:shadow-md"
                  }`}
                >
                  <span
                    className={`text-lg ${
                      isActive
                        ? "text-[#6B46C1]"
                        : "text-white group-hover:scale-110 transition-transform"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Account Dropdown */}
        <div className="relative">
          <FaUserCircle
            className="text-3xl cursor-pointer hover:text-gray-200"
            onClick={() => setShowMenu(!showMenu)}
          />
          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
              <Link
                to="/student/profile"
                className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                View Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;
