import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaLock,
  FaEnvelope,
  FaUser,
  FaIdBadge,
  FaBuilding,
  FaGraduationCap,
  FaCheckCircle,
  FaBookOpen,
  FaLightbulb,
  FaArrowRight,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";

const InputField = ({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  disabled,
  error,
  onBlur,
  label,
  showPassword,
  onTogglePassword,
}) => (
  <div className="mb-2">
    <label className="block text-xs font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <div
      className={`flex items-center bg-white border ${
        error
          ? "border-red-400"
          : value
          ? "border-[#6B46C1]"
          : "border-gray-300"
      } rounded-lg px-2.5 py-1.5 focus-within:border-[#6B46C1] focus-within:ring-2 focus-within:ring-[#6B46C1]/20 transition-all duration-300`}
    >
      <Icon className="text-[#6B46C1] mr-2 text-sm" />
      <input
        type={
          type === "password" && showPassword !== undefined
            ? showPassword
              ? "text"
              : "password"
            : type
        }
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onBlur={onBlur}
        className="w-full outline-none bg-transparent text-gray-800 text-sm"
        required
      />
      {type === "password" && onTogglePassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="ml-2 text-gray-500 hover:text-[#6B46C1] transition-colors"
        >
          {showPassword ? (
            <FaEyeSlash className="text-sm" />
          ) : (
            <FaEye className="text-sm" />
          )}
        </button>
      )}
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-500 text-xs mt-0.5 ml-1"
      >
        {error}
      </motion.p>
    )}
  </div>
);

const SignUp = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [fullNameError, setFullNameError] = useState("");

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

  const handlePasswordBlur = () => {
    // Do not show a specific "minimum 6 characters" error on blur
    setPasswordError("");
  };

  const handleConfirmPasswordBlur = () => {
    if (confirmPassword && confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleFullNameBlur = () => {
    if (fullName && fullName.length < 3) {
      setFullNameError("Name must be at least 3 characters");
    } else {
      setFullNameError("");
    }
  };

  const handleRoleSelect = (selectedRole) => setRole(selectedRole);
  const handleContinue = () => role && setStep(2);
  const handleBack = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }

    const userData = {
      fullName,
      studentId,
      department,
      email,
      password,
      role,
    };

    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      const data = await res.json();
      if (res.ok) {
        // After successful signup, attempt to login so we have the same user shape and token as the Login flow
        try {
          const loginRes = await fetch(
            `${process.env.REACT_APP_API_URL}/api/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            }
          );
          const loginData = await loginRes.json();
          if (loginRes.ok && loginData.user) {
            // Store token and user in the same format as Login.js
            localStorage.setItem("token", loginData.token);
            localStorage.setItem("user", JSON.stringify(loginData.user));
          } else {
            // Fallback: store minimal user data to avoid breaking the dashboard
            localStorage.setItem(
              "user",
              JSON.stringify({ fullName, email, studentId, department, role })
            );
          }
        } catch (err) {
          // On error, store minimal fallback user info
          localStorage.setItem(
            "user",
            JSON.stringify({ fullName, email, studentId, department, role })
          );
        }

        alert("Registration successful!");
        navigate(
          role === "Student" ? "/student/dashboard" : "/faculty/dashboard"
        );
      } else {
        setErrorMessage(data.msg || "An error occurred.");
      }
    } catch (error) {
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
              to="/login"
              className="bg-[#6B46C1] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#5B3BA1] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </motion.header>

      <main className="flex-grow flex items-center justify-center px-6 py-4 bg-gradient-to-b from-white to-gray-50">
        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              >
                {/* Left Side - Illustration */}
                <div className="hidden lg:flex flex-col justify-center items-center">
                  <div className="relative w-full max-w-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6B46C1]/20 to-[#EC4899]/20 rounded-2xl blur-2xl transform -rotate-3"></div>
                    <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/50 p-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-center mb-8"
                      >
                        <div className="relative inline-block mb-4">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#6B46C1] to-[#EC4899] rounded-2xl blur-md opacity-50"></div>
                          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#6B46C1] to-[#5B3BA1] rounded-2xl text-white text-4xl shadow-lg">
                            <FaGraduationCap />
                          </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                          Join DeskInspect
                        </h2>
                        <p className="text-gray-600 text-lg">
                          Start your thesis evaluation journey
                        </p>
                      </motion.div>

                      <div className="space-y-4">
                        {[
                          {
                            icon: <FaCheckCircle />,
                            text: "Quick Registration",
                          },
                          { icon: <FaCheckCircle />, text: "Secure Platform" },
                          { icon: <FaCheckCircle />, text: "AI-Powered Tools" },
                          { icon: <FaCheckCircle />, text: "24/7 Access" },
                        ].map((feature, idx) => (
                          <motion.div
                            key={idx}
                            className="flex items-center space-x-3"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                              duration: 0.5,
                              delay: 0.5 + idx * 0.1,
                            }}
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
                </div>

                {/* Right Side - Role Selection */}
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-md">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#6B46C1]/10 to-transparent rounded-2xl blur-xl"></div>
                      <div className="relative bg-white p-10 rounded-2xl shadow-2xl border border-gray-200/50">
                        <div className="mb-8">
                          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                            Select Your Role
                          </h2>
                          <p className="text-gray-600">
                            Choose how you'll use DeskInspect
                          </p>
                        </div>

                        <div className="space-y-4 mb-8">
                          {["Student", "Faculty"].map((r) => (
                            <motion.div
                              key={r}
                              onClick={() => handleRoleSelect(r)}
                              className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
                                role === r
                                  ? "bg-[#6B46C1] text-white border-[#6B46C1] shadow-lg scale-105"
                                  : "border-gray-200 hover:border-[#6B46C1] hover:bg-gray-50 bg-white"
                              }`}
                              whileHover={{ scale: role === r ? 1.05 : 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`text-4xl ${
                                    role === r
                                      ? "text-white"
                                      : "text-purple-600"
                                  }`}
                                >
                                  {r === "Student" ? (
                                    <FaUserGraduate />
                                  ) : (
                                    <FaChalkboardTeacher />
                                  )}
                                </div>
                                <div className="flex-1 text-left">
                                  <h3 className="text-xl font-bold mb-1">
                                    {r}
                                  </h3>
                                  <p
                                    className={`text-sm ${
                                      role === r
                                        ? "text-white/90"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {r === "Student"
                                      ? "Submit and track your thesis evaluations"
                                      : "Review submissions and provide feedback"}
                                  </p>
                                </div>
                                {role === r && (
                                  <FaCheckCircle className="text-2xl text-white" />
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        <motion.button
                          disabled={!role}
                          onClick={handleContinue}
                          className="w-full bg-[#6B46C1] text-white py-3.5 rounded-lg font-semibold text-base shadow-md hover:bg-[#5B3BA1] hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={role ? { scale: 1.01 } : {}}
                          whileTap={role ? { scale: 0.99 } : {}}
                        >
                          <span className="flex items-center justify-center">
                            Continue <FaArrowRight className="ml-2" />
                          </span>
                        </motion.button>

                        <p className="text-center text-gray-600 mt-6">
                          Already have an account?{" "}
                          <Link
                            to="/login"
                            className="font-semibold text-[#6B46C1] hover:text-[#5B3BA1] hover:underline"
                          >
                            Sign In
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              >
                {/* Left Side - Branding */}
                <div className="hidden lg:flex flex-col justify-center items-center">
                  <div className="relative w-full max-w-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6B46C1]/20 to-[#EC4899]/20 rounded-2xl blur-2xl transform rotate-3"></div>
                    <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 text-center">
                      <div className="relative inline-block mb-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#6B46C1] to-[#EC4899] rounded-xl blur-md opacity-50"></div>
                        <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#6B46C1] to-[#5B3BA1] rounded-xl text-white text-3xl shadow-lg">
                          {role === "Student" ? (
                            <FaUserGraduate />
                          ) : (
                            <FaChalkboardTeacher />
                          )}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        {role === "Student"
                          ? "Elevate Your Thesis Journey"
                          : "Elevate Thesis Evaluation"}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed px-3">
                        {role === "Student"
                          ? "Unlock AI-powered thesis evaluation, instant feedback, and comprehensive progress tracking. Get started in minutes."
                          : "Unlock AI-powered tools for comprehensive thesis review, smart feedback generation, and streamlined faculty collaboration. Get started in minutes."}
                      </p>
                      <div className="bg-[#6B46C1]/5 rounded-xl p-4 border border-[#6B46C1]/10 text-left">
                        <ul className="space-y-2.5">
                          {role === "Student" ? (
                            <>
                              <li className="flex items-start text-sm text-gray-700">
                                <FaCheckCircle className="text-[#6B46C1] mr-2 mt-0.5 flex-shrink-0" />
                                <span>AI-Powered Content Analysis</span>
                              </li>
                              <li className="flex items-start text-sm text-gray-700">
                                <FaCheckCircle className="text-[#6B46C1] mr-2 mt-0.5 flex-shrink-0" />
                                <span>Real-Time Progress Tracking</span>
                              </li>
                              <li className="flex items-start text-sm text-gray-700">
                                <FaCheckCircle className="text-[#6B46C1] mr-2 mt-0.5 flex-shrink-0" />
                                <span>Instant Plagiarism Detection</span>
                              </li>
                            </>
                          ) : (
                            <>
                              <li className="flex items-start text-sm text-gray-700">
                                <FaCheckCircle className="text-[#6B46C1] mr-2 mt-0.5 flex-shrink-0" />
                                <span>Smart Feedback Generation</span>
                              </li>
                              <li className="flex items-start text-sm text-gray-700">
                                <FaCheckCircle className="text-[#6B46C1] mr-2 mt-0.5 flex-shrink-0" />
                                <span>AI-Powered Plagiarism Check</span>
                              </li>
                              <li className="flex items-start text-sm text-gray-700">
                                <FaCheckCircle className="text-[#6B46C1] mr-2 mt-0.5 flex-shrink-0" />
                                <span>Collaborative Review Tools</span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Registration Form */}
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-md">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#6B46C1]/10 to-transparent rounded-2xl blur-xl"></div>
                      <div className="relative bg-white p-6 rounded-2xl shadow-2xl border border-gray-200/50">
                        <div className="mb-3">
                          <button
                            onClick={handleBack}
                            className="flex items-center text-[#6B46C1] hover:text-[#5B3BA1] font-semibold transition-colors text-sm"
                          >
                            <FaArrowLeft className="mr-2 text-sm" /> Back
                          </button>
                        </div>

                        <div className="mb-3">
                          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
                            Create Account
                          </h2>
                          <p className="text-gray-600 text-sm">
                            {role} Registration
                          </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-2">
                          <InputField
                            icon={FaUser}
                            type="text"
                            label="Full Name"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            error={fullNameError}
                            onBlur={handleFullNameBlur}
                          />
                          {role === "Student" && (
                            <InputField
                              icon={FaIdBadge}
                              type="text"
                              label="Student ID"
                              placeholder="SP21-BCS-001"
                              value={studentId}
                              onChange={(e) => setStudentId(e.target.value)}
                            />
                          )}
                          <InputField
                            icon={FaBuilding}
                            type="text"
                            label="Department"
                            placeholder="Computer Science"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                          />
                          <InputField
                            icon={FaEnvelope}
                            type="email"
                            label="Email Address"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={emailError}
                            onBlur={handleEmailBlur}
                          />
                          <InputField
                            icon={FaLock}
                            type="password"
                            label="Password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={passwordError}
                            onBlur={handlePasswordBlur}
                            showPassword={showPassword}
                            onTogglePassword={() =>
                              setShowPassword(!showPassword)
                            }
                          />
                          <InputField
                            icon={FaLock}
                            type="password"
                            label="Confirm Password"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            error={confirmPasswordError}
                            onBlur={handleConfirmPasswordBlur}
                            showPassword={showConfirmPassword}
                            onTogglePassword={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          />

                          {errorMessage && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg"
                            >
                              <p className="text-sm font-medium">
                                {errorMessage}
                              </p>
                            </motion.div>
                          )}

                          <motion.button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-[#6B46C1] to-[#5B3BA1] text-white py-2.5 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            {isLoading
                              ? "Creating Account..."
                              : "Create Account"}
                          </motion.button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="text-center text-sm py-6 bg-white text-gray-600 border-t border-gray-200">
        © DeskInspect 2025 – MS Thesis Evaluation System
      </footer>
    </div>
  );
};

export default SignUp;