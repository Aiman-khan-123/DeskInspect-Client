import React, { useState } from "react";
import {
  FaEnvelope,
  FaLock,
  FaGraduationCap,
  FaBookOpen,
  FaLightbulb,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    console.log("🔄 Starting login process...");

    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("📡 Response status:", response.status);
      const result = await response.json();
      console.log("📡 Response data:", result);

      if (response.ok && result.user) {
        console.log("✅ Login successful");

        // Normalize role
        const normalizedRole =
          result.user.role === "Faculty"
            ? "Faculty"
            : result.user.role === "Student"
            ? "Student"
            : result.user.role === "admin"
            ? "admin"
            : "Student";

        const normalizedUser = {
          ...result.user,
          role: normalizedRole,
        };

        // Store in localStorage
        localStorage.setItem("user", JSON.stringify(normalizedUser));
        localStorage.setItem("token", result.token);

        console.log("🔄 Redirecting to:", normalizedRole);

        // Force redirect based on role
        switch (normalizedRole) {
          case "Student":
            window.location.href = "/student/dashboard";
            break;
          case "Faculty":
            window.location.href = "/faculty/dashboard";
            break;
          case "admin":
            window.location.href = "/admin/dashboard";
            break;
          default:
            window.location.href = "/student/dashboard";
        }
      } else {
        setErrorMessage(result.msg || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("💥 Login error:", err);
      setErrorMessage("Server error. Please try again.");
    } finally {
      setIsLoading(false);
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
          <nav className="hidden md:flex space-x-6 items-center">
            <Link
              to="/signup"
              className="bg-[#6B46C1] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#5B3BA1] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Sign Up
            </Link>
          </nav>
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
                      <FaBookOpen />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Welcome Back!
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Access your thesis evaluation platform
                  </p>
                </motion.div>

                {/* Feature List */}
                <div className="space-y-4">
                  {[
                    { icon: <FaCheckCircle />, text: "AI-Driven Evaluation" },
                    { icon: <FaCheckCircle />, text: "Plagiarism Detection" },
                    { icon: <FaCheckCircle />, text: "Instant Feedback" },
                    { icon: <FaCheckCircle />, text: "Comprehensive Reports" },
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

          {/* Right Side - Login Form */}
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
                      Sign In
                    </h2>
                    <p className="text-gray-600">
                      Enter your credentials to continue
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-5"
                  >
                    {/* Email Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div
                        className={`flex items-center bg-white border ${
                          emailError
                            ? "border-red-400"
                            : email
                            ? "border-[#6B46C1]"
                            : "border-gray-300"
                        } rounded-lg px-4 py-3 focus-within:border-[#6B46C1] focus-within:ring-2 focus-within:ring-[#6B46C1]/20 transition-all duration-300`}
                      >
                        <FaEnvelope className="text-[#6B46C1] mr-3 text-lg" />
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={handleEmailBlur}
                          required
                          className="w-full outline-none bg-transparent text-gray-800"
                        />
                      </div>
                      {emailError && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-1 ml-1"
                        >
                          {emailError}
                        </motion.p>
                      )}
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                      </label>
                      <div
                        className={`flex items-center bg-white border ${
                          passwordError
                            ? "border-red-400"
                            : password
                            ? "border-[#6B46C1]"
                            : "border-gray-300"
                        } rounded-lg px-4 py-3 focus-within:border-[#6B46C1] focus-within:ring-2 focus-within:ring-[#6B46C1]/20 transition-all duration-300`}
                      >
                        <FaLock className="text-[#6B46C1] mr-3 text-lg" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full outline-none bg-transparent text-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="ml-2 text-gray-500 hover:text-[#6B46C1] transition-colors"
                        >
                          {showPassword ? (
                            <FaEyeSlash className="text-lg" />
                          ) : (
                            <FaEye className="text-lg" />
                          )}
                        </button>
                      </div>
                      {passwordError && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-1 ml-1"
                        >
                          {passwordError}
                        </motion.p>
                      )}
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-[#6B46C1] hover:text-[#5B3BA1] hover:underline transition-colors"
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                      >
                        <p className="text-sm font-medium">{errorMessage}</p>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      className="w-full bg-[#6B46C1] text-white py-3.5 rounded-lg font-semibold text-base shadow-md hover:bg-[#5B3BA1] hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing In..." : "Sign In"}
                    </motion.button>

                    {/* Sign Up Link */}
                    <p className="text-center text-gray-600 mt-6">
                      Don't have an account?{" "}
                      <Link
                        to="/signup"
                        className="font-semibold text-[#6B46C1] hover:text-[#5B3BA1] hover:underline"
                      >
                        Create Account
                      </Link>
                    </p>
                  </form>
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

export default LoginPage;
