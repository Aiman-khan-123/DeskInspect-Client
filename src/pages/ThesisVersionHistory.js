import React, { useState, useEffect } from "react";
import {
  FaHistory,
  FaDownload,
  FaEye,
  FaCalendarAlt,
  FaFileAlt,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";
import StudentHeader from "../components/StudentHeader";
import FacultyHeader from "../components/FacultyHeader";
import { useParams, useNavigate } from "react-router-dom";

const ThesisVersionHistory = () => {
  const { thesisId } = useParams();
  const navigate = useNavigate();
  const [versionHistory, setVersionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [originalThesisId, setOriginalThesisId] = useState("");
  const [currentVersion, setCurrentVersion] = useState(1);
  const [totalVersions, setTotalVersions] = useState(0);

  // Get user information to determine which header to use
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;

  console.log("🔍 ThesisVersionHistory - User:", user);
  console.log("🔍 ThesisVersionHistory - User Role:", userRole);

  // Determine which header component to use based on user role
  const HeaderComponent =
    userRole === "Faculty" ? FacultyHeader : StudentHeader;

  useEffect(() => {
    if (thesisId) {
      loadVersionHistory();
    } else {
      setError("No thesis ID provided");
      setLoading(false);
    }
  }, [thesisId]);

  const loadVersionHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/thesis/version-history/${thesisId}`
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setVersionHistory(data.versions || []);
        setOriginalThesisId(data.originalThesisId || thesisId);
        setCurrentVersion(data.currentVersion || 1);
        setTotalVersions(data.totalVersions || 0);
      } else {
        throw new Error(data.message || "Failed to load version history");
      }
    } catch (error) {
      console.error("Error loading version history:", error);
      setError(error.message || "Error loading version history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <FaCheckCircle className="text-green-500" />;
      case "Rejected":
        return <FaTimesCircle className="text-red-500" />;
      case "Resubmission Requested":
        return <FaExclamationTriangle className="text-orange-500" />;
      case "Under Review":
        return <FaClock className="text-blue-500" />;
      case "Resubmitted":
        return <FaFileAlt className="text-purple-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "Resubmission Requested":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Under Review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Resubmitted":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getFileName = (url) => {
    if (!url) return "No file";
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    const decodedFilename = decodeURIComponent(filename);
    return decodedFilename.length > 40
      ? decodedFilename.substring(0, 40) + "..."
      : decodedFilename;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <HeaderComponent />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#575C9E] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading version history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <HeaderComponent />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
            <FaTimesCircle className="text-6xl text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-[#575C9E] text-white px-4 py-2 rounded-lg hover:bg-[#454B94] transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <HeaderComponent />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="bg-gradient-to-r from-[#575C9E] to-[#454B94] text-white p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  Thesis Version History
                </h1>
                <p className="opacity-90">
                  Track all versions and changes to thesis submissions
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{totalVersions}</div>
                <div className="text-sm opacity-90">Total Versions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Version Timeline */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <FaHistory />
              <span>Submission Timeline</span>
            </h2>
          </div>

          <div className="p-6">
            {versionHistory.length === 0 ? (
              <div className="text-center py-8">
                <FaHistory className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No version history available</p>
              </div>
            ) : (
              <div className="space-y-6">
                {versionHistory.map((version, index) => (
                  <div
                    key={version._id}
                    className="relative flex items-start space-x-6 pb-6"
                  >
                    {/* Timeline line */}
                    {index < versionHistory.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
                    )}

                    {/* Version number circle */}
                    <div className="flex-shrink-0 w-12 h-12 bg-[#575C9E] text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {version.version}
                    </div>

                    {/* Version details */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-6 border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Version {version.version}
                              {version.isResubmission && (
                                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  Resubmission
                                </span>
                              )}
                            </h3>
                            {getStatusIcon(version.status)}
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <FaCalendarAlt />
                              <span>{formatDate(version.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FaUser />
                              <span>{version.studentName}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 mb-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                version.status
                              )}`}
                            >
                              {version.status}
                            </span>
                            <span className="text-sm text-gray-600">
                              File: {getFileName(version.fileUrl)}
                            </span>
                          </div>

                          {version.supervisorId && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Supervisor:</span>{" "}
                              {version.supervisorId.fullName}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-2 ml-4">
                          <a
                            href={version.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-[#575C9E] hover:text-[#454B94] text-sm font-medium"
                          >
                            <FaEye />
                            <span>View</span>
                          </a>
                          <a
                            href={version.fileUrl}
                            download
                            className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            <FaDownload />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThesisVersionHistory;
