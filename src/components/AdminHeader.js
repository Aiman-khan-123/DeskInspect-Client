import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaHome,
  FaCalendarAlt,
  FaChartLine,
  FaFileAlt,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { FaListAlt } from "react-icons/fa"; // Add this import
const adminNavItems = [
  { label: "Home", href: "/admin/dashboard", icon: <FaHome /> },
  { label: "Events", href: "/admin/events", icon: <FaCalendarAlt /> },
  {
    label: "Student Progress",
    href: "/admin/students-progress",
    icon: <FaChartLine />,
  },
  { label: "Reports", href: "/admin/reports", icon: <FaFileAlt /> },
];

const AdminHeader = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activePath = location.pathname;
  const currentPage = adminNavItems.find((item) =>
    activePath.startsWith(item.href)
  );
  const currentTitle = currentPage
    ? `DeskInspect – ${currentPage.label}`
    : "DeskInspect – Admin";

  // Hide navigation on dashboard page
  const isDashboardPage = activePath === "/admin/dashboard";

  return (
    <header className="bg-[#6B46C1] text-white px-6 py-4 flex items-center justify-between shadow-md sticky top-0 z-50">
      {/* Page Title */}
      <h1 className="text-lg font-semibold">{currentTitle}</h1>

      {/* Navigation Links */}
      <div className="flex items-center gap-6">
        {!isDashboardPage && (
          <nav className="flex gap-2">
            {adminNavItems.map((item, idx) => {
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
                to="/admin/profile"
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

export default AdminHeader;
