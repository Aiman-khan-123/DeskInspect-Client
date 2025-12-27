import React, { useState, useEffect } from "react";
import FacultyHeader from "../components/FacultyHeader";
import {
  FileText,
  Send,
  User,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";

const FacultyThesisEvaluation = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sendingReport, setSendingReport] = useState(null);
  const [sendStatus, setSendStatus] = useState({});
  const [deletingReport, setDeletingReport] = useState(null);
  const [message, setMessage] = useState(""); // Add this line

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user")) || {};
      const facultyId = user._id || user.facultyId;

      if (!facultyId) {
        console.error("No faculty ID found in user data");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/reports/faculty-reports/${facultyId}`
      );

      if (response.ok) {
        const result = await response.json();
        setReports(result.data || []);
      } else {
        console.error("Failed to fetch reports:", response.status);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewReport = (reportItem) => {
    let reportRoute = "";
    switch (reportItem.reportType) {
      case "thesis-evaluation":
        reportRoute = `/faculty/evaluation-result/${reportItem._id}`;
        break;
      case "plagiarism-detection":
        reportRoute = `/faculty/plagiarism-result/${reportItem._id}`;
        break;
      case "ai-detection":
        reportRoute = `/faculty/ai-detection-result/${reportItem._id}`;
        break;
      default:
        console.error("Unknown report type:", reportItem.reportType);
        return;
    }

    window.open(reportRoute, "_blank");
  };

  const sendToStudent = async (reportItem) => {
    if (sendingReport) return;

    setSendingReport(reportItem._id);
    setSendStatus((prev) => ({ ...prev, [reportItem._id]: "sending" }));

    try {
      console.log("🔍 DEBUG - Sending report details:", {
        reportId: reportItem._id,
        studentId: reportItem.studentId,
        studentName: reportItem.studentName,
        currentStatus: reportItem.status,
        isSentToStudent: reportItem.isSentToStudent,
      });

      const response = await fetch(
        `http://localhost:5000/api/reports/report/${reportItem._id}/send-to-student`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();

        console.log("✅ Report sent successfully - Backend response:", result);

        setSendStatus((prev) => ({ ...prev, [reportItem._id]: "success" }));

        setReports((prev) =>
          prev.map((report) =>
            report._id === reportItem._id
              ? {
                  ...report,
                  status: "sent",
                  isSentToStudent: true,
                  sentDate: result.data?.sentDate || new Date().toISOString(),
                }
              : report
          )
        );

        setMessage(`✅ Report successfully sent to ${reportItem.studentName}`);

        setTimeout(() => {
          setSendStatus((prev) => ({ ...prev, [reportItem._id]: null }));
          setMessage("");
        }, 3000);
      } else {
        const errorText = await response.text();
        let errorMessage = `Failed to send report: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }

        console.error("❌ Send failed:", errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("❌ Error sending report:", error);
      setSendStatus((prev) => ({ ...prev, [reportItem._id]: "error" }));

      setMessage(`❌ Failed to send report: ${error.message}`);

      setTimeout(() => {
        setSendStatus((prev) => ({ ...prev, [reportItem._id]: null }));
        setMessage("");
      }, 3000);
    } finally {
      setSendingReport(null);
    }
  };
  const deleteReport = async (reportItem) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this report? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingReport(reportItem._id);

    try {
      const response = await fetch(
        `http://localhost:5000/api/reports/report/${reportItem._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Remove the report from local state
        setReports((prev) =>
          prev.filter((report) => report._id !== reportItem._id)
        );
        setMessage("✅ Report deleted successfully");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete report");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      setMessage(`❌ Failed to delete report: ${error.message}`);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setDeletingReport(null);
    }
  };

  const getReportTypeDisplay = (type) => {
    const types = {
      "thesis-evaluation": "Thesis Evaluation",
      "plagiarism-detection": "Plagiarism Detection",
      "ai-detection": "AI Content Detection",
    };
    return types[type] || type;
  };

  const getStatusBadge = (status, isSentToStudent) => {
    const statusConfig = {
      draft: { color: "bg-yellow-100 text-yellow-800", text: "Draft" },
      saved: { color: "bg-blue-100 text-blue-800", text: "Saved" },
      published: { color: "bg-green-100 text-green-800", text: "Published" },
      sent: { color: "bg-green-100 text-green-800", text: "Sent" },
    };

    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      text: status,
    };

    return (
      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
        >
          {config.text}
        </span>
        {isSentToStudent && <CheckCircle className="w-4 h-4 text-green-500" />}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getSendButtonState = (reportItem) => {
    const status = sendStatus[reportItem._id];

    if (status === "sending") {
      return {
        text: "Sending...",
        icon: <RefreshCw className="w-4 h-4 animate-spin" />,
        className: "bg-gray-400 text-white cursor-not-allowed",
        disabled: true,
      };
    }

    if (status === "success") {
      return {
        text: "Sent ✓",
        icon: <CheckCircle className="w-4 h-4" />,
        className: "bg-green-600 text-white cursor-not-allowed",
        disabled: true,
      };
    }

    if (status === "error") {
      return {
        text: "Failed - Retry",
        icon: <XCircle className="w-4 h-4" />,
        className: "bg-red-600 text-white hover:bg-red-700",
        disabled: false,
      };
    }

    // Check if report is already sent (shouldn't happen with new flow, but good to have)
    if (reportItem.isSentToStudent || reportItem.status === "sent") {
      return {
        text: "Sent to Student",
        icon: <CheckCircle className="w-4 h-4" />,
        className: "bg-green-600 text-white cursor-not-allowed",
        disabled: true,
      };
    }

    // Default state - ready to send (for draft reports)
    return {
      text: "Send to Student",
      icon: <Send className="w-4 h-4" />,
      className: "bg-[#6B46C1] text-white hover:bg-[#8B5CF6]",
      disabled: false,
    };
  };

  const filteredReports = reports.filter((reportItem) => {
    const matchesSearch =
      reportItem.studentName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      reportItem.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reportItem.thesisTitle?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" || reportItem.reportType === filterType;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FacultyHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B46C1] mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">
              Loading evaluation reports...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FacultyHeader />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white bg-opacity-20 rounded-2xl">
              <FileText className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Evaluation Reports
              </h1>
              <p className="text-white text-opacity-90">
                View, manage, and send evaluation reports to students
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student name, ID, or thesis title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent"
              >
                <option value="all">All Report Types</option>
                <option value="thesis-evaluation">Thesis Evaluation</option>
                <option value="plagiarism-detection">
                  Plagiarism Detection
                </option>
                <option value="ai-detection">AI Content Detection</option>
              </select>
              <button
                onClick={fetchReports}
                className="flex items-center gap-2 px-4 py-3 bg-[#6B46C1] text-white rounded-lg hover:bg-[#8B5CF6] transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`mt-4 p-4 rounded-lg text-center ${
                message.includes("❌")
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-green-100 text-green-700 border border-green-200"
              }`}
            >
              <div className="font-medium">{message}</div>
            </div>
          )}
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {filteredReports.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {reports.length === 0
                  ? "No Reports Found"
                  : "No Matching Reports"}
              </h3>
              <p className="text-gray-500 mb-6">
                {reports.length === 0
                  ? "You haven't created any evaluation reports yet. Generate reports from the Thesis Review page."
                  : "Try adjusting your search criteria or filters."}
              </p>
              {reports.length === 0 && (
                <a
                  href="/faculty/thesisreview"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#6B46C1] text-white rounded-lg hover:bg-[#8B5CF6] transition"
                >
                  Go to Thesis Review
                </a>
              )}
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Reports ({filteredReports.length})
                  </h2>
                  <span className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </span>
                </div>

                <div className="space-y-4">
                  {filteredReports.map((reportItem, index) => {
                    const sendButton = getSendButtonState(reportItem);

                    return (
                      <div
                        key={reportItem._id || index}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                          {/* Report Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-xl font-semibold text-[#6B46C1] mb-1">
                                  {reportItem.studentName}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                  Student ID: {reportItem.studentId}
                                </p>
                              </div>
                              <div className="text-right space-y-2">
                                {getStatusBadge(
                                  reportItem.status,
                                  reportItem.isSentToStudent
                                )}
                                <div className="text-sm font-medium text-gray-700">
                                  {getReportTypeDisplay(reportItem.reportType)}
                                </div>
                                {reportItem.thesisVersion && (
                                  <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block">
                                    Version {reportItem.thesisVersion}
                                  </div>
                                )}
                              </div>
                            </div>

                            {reportItem.thesisTitle && (
                              <p className="text-gray-700 mb-3 font-medium">
                                "{reportItem.thesisTitle}"
                              </p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  Created: {formatDate(reportItem.createdAt)}
                                </span>
                              </div>
                              {reportItem.sentDate && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <Send className="w-4 h-4" />
                                  <span>
                                    Sent: {formatDate(reportItem.sentDate)}
                                  </span>
                                </div>
                              )}
                              {reportItem.filename && (
                                <div className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  <span>File: {reportItem.filename}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 lg:w-48">
                            <button
                              onClick={() => viewReport(reportItem)}
                              className="w-full px-4 py-2 bg-[#6B46C1] text-white rounded-lg hover:bg-[#8B5CF6] transition text-sm font-medium flex items-center justify-center gap-2"
                            >
                              <FileText className="w-4 h-4" />
                              View Report
                            </button>

                            <button
                              onClick={() => sendToStudent(reportItem)}
                              disabled={sendButton.disabled}
                              className={`w-full px-4 py-2 rounded-lg transition text-sm font-medium flex items-center justify-center gap-2 ${sendButton.className}`}
                            >
                              {sendButton.icon}
                              {sendButton.text}
                            </button>

                            <button
                              onClick={() => deleteReport(reportItem)}
                              disabled={deletingReport === reportItem._id}
                              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium flex items-center justify-center gap-2 disabled:bg-red-400 disabled:cursor-not-allowed"
                            >
                              {deletingReport === reportItem._id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              {deletingReport === reportItem._id
                                ? "Deleting..."
                                : "Delete Report"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#F3F0FF] border-t border-[#E9E3FF] py-4 mt-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-[#6B46C1] font-medium">
            © 2025 DeskInspect. All rights reserved. | Faculty Evaluation
            Reports
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FacultyThesisEvaluation;
