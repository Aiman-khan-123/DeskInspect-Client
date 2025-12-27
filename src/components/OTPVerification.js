import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaKey, FaCheck, FaTimes } from "react-icons/fa";

const OTPVerification = ({ email, onStepChange, onOtpChange }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Pass OTP to parent component
      if (onOtpChange) {
        onOtpChange(newOtp);
      }

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage("OTP verified successfully!");
        setVerified(true);
        // Pass the verified OTP to parent before changing step
        if (onOtpChange) {
          onOtpChange(otp);
        }
        setTimeout(() => {
          onStepChange(3); // Move to password reset step
        }, 1000);
      } else {
        setError(result.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");
    setMessage("");

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
        setMessage("New OTP sent to your email");
        setOtp(["", "", "", "", "", ""]);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } else {
        setError(result.message || "Failed to resend OTP");
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
      <p className="text-sm text-gray-600 mb-6 text-center">
        We sent a 6-digit code to{" "}
        <strong className="text-gray-900">{email}</strong>
      </p>

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
          <div className="flex items-center gap-2">
            <FaTimes className="w-4 h-4" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleVerifyOTP}>
        <div className="flex justify-center gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#6B46C1] focus:ring-2 focus:ring-[#6B46C1]/20 outline-none transition-all duration-300 bg-white shadow-sm"
              disabled={loading || verified}
            />
          ))}
        </div>

        <div className="space-y-3">
          <motion.button
            type="submit"
            className="w-full bg-[#6B46C1] text-white py-3.5 rounded-lg font-semibold text-base shadow-md hover:bg-[#5B3BA1] hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={loading || verified}
          >
            {loading ? "Verifying..." : verified ? "Verified!" : "Verify Code"}
          </motion.button>

          <button
            type="button"
            onClick={handleResendOTP}
            disabled={loading}
            className="w-full text-[#6B46C1] py-3 rounded-lg font-semibold border-2 border-[#6B46C1] hover:bg-[#6B46C1] hover:text-white transition-all duration-300 disabled:opacity-50"
          >
            Resend Code
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default OTPVerification;
