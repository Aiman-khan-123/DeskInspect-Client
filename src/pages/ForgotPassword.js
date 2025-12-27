import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaArrowLeft,
  FaGraduationCap,
  FaCheckCircle,
  FaKey,
  FaLock,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import OTPVerification from "../components/OTPVerification";
import ResetPassword from "./ResetPassword";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleStepChange = (newStep) => {
    setMessage(""); // Clear messages when changing steps
    setError("");
    setStep(newStep);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(result.message);
        handleStepChange(2); // Move to OTP verification step
      } else {
        setError(result.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-3 focus-within:border-[#6B46C1] focus-within:ring-2 focus-within:ring-[#6B46C1]/20 transition-all duration-300">
                <FaEnvelope className="text-[#6B46C1] mr-3 text-lg" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full outline-none bg-transparent text-gray-800"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="w-full bg-[#6B46C1] text-white py-3.5 rounded-lg font-semibold text-base shadow-md hover:bg-[#5B3BA1] hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
            >
              {loading ? "Sending Code..." : "Send Reset Code"}
            </motion.button>
          </form>
        );
      case 2:
        return (
          <OTPVerification
            email={email}
            onStepChange={handleStepChange}
            onOtpChange={setOtp}
          />
        );
      case 3:
        return <ResetPassword email={email} otp={otp} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Forgot Password";
      case 2:
        return "Verify OTP";
      case 3:
        return "Reset Password";
      default:
        return "Forgot Password";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Enter your email to receive a reset code";
      case 2:
        return "Enter the 6-digit code sent to your email";
      case 3:
        return "Create your new password";
      default:
        return "Enter your email to receive a reset code";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-purple-50/30 font-sans">
      {/* Header */}
      <motion.header
        className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 py-4 px-6 shadow-sm sticky top-0 z-50"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#6B46C1] to-[#EC4899] rounded-lg blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative transform group-hover:scale-110 transition-transform duration-300">
                <FaGraduationCap className="text-3xl text-[#6B46C1]" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              DeskInspect
            </h1>
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm font-medium text-[#6B46C1] hover:text-[#5B3BA1] transition-colors"
          >
            <FaArrowLeft className="w-3 h-3" />
            Back to Login
          </Link>
        </div>
      </motion.header>

      <main className="flex-grow flex items-center justify-center px-6 py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl w-full">
          {/* Left Side - Illustration & Branding */}
          <motion.div
            className="hidden lg:flex flex-col justify-center relative"
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Decorative Card */}
            <div className="relative w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-[#6B46C1]/20 to-[#EC4899]/20 rounded-2xl blur-2xl transform scale-105"></div>
              <div className="relative bg-white rounded-2xl p-10 border border-gray-200/50 shadow-xl">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mb-8"
                >
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6B46C1] to-[#EC4899] rounded-xl blur-md opacity-50"></div>
                    <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#6B46C1] to-[#5B3BA1] rounded-xl text-white text-3xl shadow-lg">
                      {step === 1 ? (
                        <FaEnvelope />
                      ) : step === 2 ? (
                        <FaKey />
                      ) : (
                        <FaLock />
                      )}
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    {step === 1
                      ? "Reset Your Password"
                      : step === 2
                      ? "Verify Your Identity"
                      : "Create New Password"}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {step === 1
                      ? "We'll help you regain access to your account"
                      : step === 2
                      ? "Enter the code we sent to your email"
                      : "Choose a strong, secure password"}
                  </p>
                </motion.div>

                {/* Feature List */}
                <div className="space-y-4">
                  {[
                    {
                      icon: <FaCheckCircle />,
                      text: "Secure Recovery Process",
                    },
                    { icon: <FaCheckCircle />, text: "Email Verification" },
                    { icon: <FaCheckCircle />, text: "Instant Access" },
                  ].map((feature, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center space-x-3"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                    >
                      <span className="text-[#6B46C1] text-xl">
                        {feature.icon}
                      </span>
                      <span className="font-medium text-gray-700">
                        {feature.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            className="flex items-center justify-center"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="w-full max-w-md">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6B46C1]/10 to-transparent rounded-2xl blur-xl"></div>
                <div className="relative bg-white p-10 rounded-2xl shadow-2xl border border-gray-200/50 backdrop-blur-sm">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                      {getStepTitle()}
                    </h2>
                    <p className="text-gray-600">{getStepDescription()}</p>
                  </div>

                  {message && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4"
                    >
                      <p className="text-sm font-medium">{message}</p>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4"
                    >
                      <p className="text-sm font-medium">{error}</p>
                    </motion.div>
                  )}

                  {renderStep()}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="text-center text-sm py-6 bg-white text-gray-600 border-t border-gray-200">
        © DeskInspect 2025 – MS Thesis Evaluation System
      </footer>
    </div>
  );
};

export default ForgotPassword;
