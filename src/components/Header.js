import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGraduationCap } from "react-icons/fa";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-white shadow-lg border-gray-300"
          : "bg-white/95 backdrop-blur-md border-gray-300/60"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 lg:px-12 py-4">
        <div className="flex justify-between items-center">
          {/* Logo + Title */}
          <Link to="/" className="flex items-center space-x-3 group">
            <FaGraduationCap className="text-[#6B46C1] text-3xl" />
            <span className="text-2xl font-bold text-[#6B46C1]">
              DeskInspect
            </span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Link to="/signup">
              <motion.button
                className="bg-white text-[#6B46C1] hover:bg-gray-50 px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 border-2 border-[#6B46C1]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                className="bg-[#6B46C1] text-white hover:bg-[#553399] px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
