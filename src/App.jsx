import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentProfile from "./pages/StudentProfile";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminProfile from "./pages/AdminProfile";
import AdminEventPage from "./pages/AdminEventPage";
import StudentsProgress from "./pages/AdminStudentProgress";
import AdminReports from "./pages/AdminReports";
import StudentEvent from "./pages/StudentEventPage";
import ThesisSubmission from "./pages/ThesisSubmissionPage";
import ThesisResubmission from "./pages/ThesisResubmissionPage";
import ThesisVersionHistory from "./pages/ThesisVersionHistory";
import StudentNotification from "./pages/NotificationPage";
import StudentResult from "./pages/StudentResults";
import ThesisReview from "./pages/FacultyThesisReview";
import FacultyEvent from "./pages/FacultyEventPage";
import FacultyNotification from "./pages/FacultyNotificationPage";
import FacultyProfile from "./pages/FacultyProfile";
import ThesisEvaluationReport from "./pages/ThesisEvaluationReport";
import PlagiarismDetectionReport from "./pages/PlagiarismDetectionReport";
import AIContentDetectionReport from "./pages/AIContentDetectionReport";
import EvaluationReports from "./pages/FacultyThesisEvaluation";
import Unauthorized from "./pages/Unauthorized";
import StudentLayout from "./pages/StudentLayout"; 

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Student Protected Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/thesissubmission"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <ThesisSubmission />
              </ProtectedRoute>
            }
          />
          <Route
            path="/thesis-resubmission"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <ThesisResubmission />
              </ProtectedRoute>
            }
          />
          <Route
            path="/thesis-version-history/:thesisId"
            element={
              <ProtectedRoute allowedRoles={["Student", "Faculty"]}>
                <ThesisVersionHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/events"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <StudentEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <StudentNotification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/results"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <StudentResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          {/* Student Report Routes - Using Same Components as Faculty */}
          <Route
            path="/student/report/thesis/:id"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <StudentLayout>
                  <ThesisEvaluationReport />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/report/plagiarism/:id"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <StudentLayout>
                  <PlagiarismDetectionReport />
                </StudentLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/report/ai/:id"
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <StudentLayout>
                  <AIContentDetectionReport />
                </StudentLayout>
              </ProtectedRoute>
            }
          />

          {/* Faculty Protected Routes */}
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Faculty"]}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/profile"
            element={
              <ProtectedRoute allowedRoles={["Faculty"]}>
                <FacultyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/thesisreview"
            element={
              <ProtectedRoute allowedRoles={["Faculty"]}>
                <ThesisReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/thesis-version-history/:thesisId"
            element={
              <ProtectedRoute allowedRoles={["Faculty"]}>
                <ThesisVersionHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/events"
            element={
              <ProtectedRoute allowedRoles={["Faculty"]}>
                <FacultyEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/notifications"
            element={
              <ProtectedRoute allowedRoles={["Faculty"]}>
                <FacultyNotification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/evaluation-result/:id"
            element={
              <ProtectedRoute allowedRoles={["Faculty"]}>
                <ThesisEvaluationReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/plagiarism-result/:id"
            element={
              <ProtectedRoute allowedRoles={["Faculty"]}>
                <PlagiarismDetectionReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/ai-detection-result/:id"
            element={
              <ProtectedRoute allowedRoles={["Faculty"]}>
                <AIContentDetectionReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/evaluation"
            element={
              <ProtectedRoute allowedRoles={["Faculty"]}>
                <EvaluationReports />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students-progress"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StudentsProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          {/* Common Protected Routes */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
