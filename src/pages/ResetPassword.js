import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaLock, FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ResetPassword = ({ email, otp }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otp.join(""),
          newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage("Password reset successfully!");
        setTimeout(() => {
          navigate("/login", {
            state: {
              message:
                "Password reset successfully. Please login with your new password.",
            },
          });
        }, 2000);
      } else {
        setError(result.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4"
        >
          <div className="flex items-center gap-2">
            <FaCheck className="w-4 h-4" />
            <p className="text-sm font-medium">{message}</p>
          </div>
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

      <form onSubmit={handleResetPassword} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            New Password
          </label>
          <div className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-3 focus-within:border-[#6B46C1] focus-within:ring-2 focus-within:ring-[#6B46C1]/20 transition-all duration-300">
            <FaLock className="text-[#6B46C1] mr-3 text-lg" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-3 focus-within:border-[#6B46C1] focus-within:ring-2 focus-within:ring-[#6B46C1]/20 transition-all duration-300">
            <FaLock className="text-[#6B46C1] mr-3 text-lg" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full outline-none bg-transparent text-gray-800"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="ml-2 text-gray-500 hover:text-[#6B46C1] transition-colors"
            >
              {showConfirmPassword ? (
                <FaEyeSlash className="text-lg" />
              ) : (
                <FaEye className="text-lg" />
              )}
            </button>
          </div>
        </div>

        <motion.button
          type="submit"
          className="w-full bg-[#6B46C1] text-white py-3.5 rounded-lg font-semibold text-base shadow-md hover:bg-[#5B3BA1] hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={loading}
        >
          {loading ? "Resetting Password..." : "Reset Password"}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ResetPassword;
