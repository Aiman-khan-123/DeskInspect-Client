import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FacultyHeader from "../components/FacultyHeader";
import {
  FaClipboardCheck,
  FaCalendarAlt,
  FaBell,
  FaChartLine,
} from "react-icons/fa";

const navItems = [
  {
    label: "Review Submissions",
    href: "/faculty/thesisreview",
    icon: <FaClipboardCheck />,
    description:
      "Review and evaluate student thesis submissions using AI-powered tools",
  },
  {
    label: "Events",
    href: "/faculty/events",
    icon: <FaCalendarAlt />,
    description: "View academic events, deadlines, and manage faculty calendar",
  },
  {
    label: "Notifications",
    href: "/faculty/notifications",
    icon: <FaBell />,
    description:
      "Stay updated with submission alerts and important announcements",
  },
  {
    label: "Evaluation Reports",
    href: "/faculty/evaluation",
    icon: <FaChartLine />,
    description: "Access evaluation reports, send feedback to students",
  },
];

const FacultyDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth state if needed
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 overflow-hidden">
      {/* Reusable Faculty Header */}
      <FacultyHeader onLogout={handleLogout} />

      {/* Hero Section */}
      <section className="pt-8 pb-8 md:pt-10 md:pb-10 bg-white">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <div className="inline-block mb-2">
            <span className="bg-[#6B46C1]/10 text-[#6B46C1] px-3 py-1.5 rounded-full text-xs font-semibold">
              Faculty Dashboard
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 leading-tight">
            Welcome to
            <span className="block text-[#6B46C1]">
              DeskInspect Faculty Portal
            </span>
          </h1>

          <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Manage thesis submissions, evaluate student work with AI-powered
            tools, and stay updated with academic events and student progress.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Faculty Tools
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Access all your review and evaluation functionalities in one place
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {navItems.map((item, idx) => (
              <motion.div
                key={idx}
                role="button"
                tabIndex={0}
                onClick={() => navigate(item.href)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") navigate(item.href);
                }}
                className="group bg-white rounded-xl border border-gray-200 p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#6B46C1]/20 cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.1,
                  ease: "easeOut",
                }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br from-[#6B46C1] to-[#8B5CF6] rounded-xl flex items-center justify-center mb-3 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:rotate-6 group-hover:scale-110`}
                >
                  <div className="text-xl text-white">{item.icon}</div>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-[#6B46C1] transition-colors">
                  {item.label}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  {item.description}
                </p>
                <div className="flex items-center text-[#6B46C1] font-semibold text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
                  <span>Access Now</span>
                  <svg
                    className="w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#F3F0FF] border-t border-[#E9E3FF] py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-[#6B46C1] font-medium">
            © 2025 DeskInspect. All rights reserved. | Faculty Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FacultyDashboard;
