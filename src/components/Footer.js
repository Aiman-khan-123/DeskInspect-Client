import React from "react";
import { motion } from "framer-motion";
import FooterColumn from "./FooterColumn";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaHeart,
  FaGraduationCap,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <FaGraduationCap className="text-white text-3xl" />
              <span className="text-2xl font-bold text-white">DeskInspect</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Revolutionizing thesis evaluation with AI-powered precision and
              comprehensive analysis.
            </p>
            <div className="flex space-x-3">
              <motion.button
                onClick={() => {}}
                className="bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition-all duration-300 shadow-lg cursor-pointer"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Facebook"
              >
                <FaFacebookF />
              </motion.button>
              <motion.button
                onClick={() => {}}
                className="bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition-all duration-300 shadow-lg cursor-pointer"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Twitter"
              >
                <FaTwitter />
              </motion.button>
              <motion.button
                onClick={() => {}}
                className="bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition-all duration-300 shadow-lg cursor-pointer"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                aria-label="LinkedIn"
              >
                <FaLinkedinIn />
              </motion.button>
              <motion.button
                onClick={() => {}}
                className="bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition-all duration-300 shadow-lg cursor-pointer"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Instagram"
              >
                <FaInstagram />
              </motion.button>
            </div>
          </div>

          {/* Footer Columns */}
          <FooterColumn
            heading="Company"
            links={["About Us", "Our Team", "Contact Us", "Careers"]}
          />
          <FooterColumn
            heading="Features"
            links={[
              "AI Evaluation",
              "Plagiarism Detection",
              "AI Content Analysis",
              "Automated Scoring",
              "Reports",
            ]}
          />
          <FooterColumn
            heading="Resources"
            links={[
              "User Guide",
              "FAQs",
              "Support Center",
              "Documentation",
              "Blog",
            ]}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Bottom Section */}
        <div className="flex justify-center items-center">
          <div className="text-gray-400 text-sm text-center">
            <p>© 2025 DeskInspect. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
