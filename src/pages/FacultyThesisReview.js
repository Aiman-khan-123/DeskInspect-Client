import React, { useState, useEffect } from "react";
import FacultyHeader from "../components/FacultyHeader";

const ThesisReviewPage = () => {
  const [thesesList, setThesesList] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loadingThesisId, setLoadingThesisId] = useState(null);
  const [loadingType, setLoadingType] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [resubmissionModalOpen, setResubmissionModalOpen] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [resubmissionReason, setResubmissionReason] = useState("");
  const [submittingResubmission, setSubmittingResubmission] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const supervisorId = user._id || user.facultyId || user.email;

    const fetchAssignedTheses = async () => {
      if (!supervisorId) return;
      try {
        const res = await fetch(
          `http://localhost:5000/api/thesis/by-supervisor/${supervisorId}`
        );
        if (res.ok) {
          const data = await res.json();
          setThesesList(data.theses || data);
        } else {
          console.error("Failed to fetch assigned theses");
          showNotification("Failed to load theses", "error");
        }
      } catch (err) {
        console.error("Error fetching assigned theses", err);
        showNotification("Error loading theses", "error");
      }
    };

    fetchAssignedTheses();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      5000
    );
  };

  const handleExpandToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const storeTemporaryReport = async (
    type,
    reportId,
    analysisData,
    thesisData
  ) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/temporary-reports/store",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
            id: reportId,
            data: {
              analysisData,
              thesisData,
              timestamp: new Date().toISOString(),
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to store temporary report");
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error storing temporary report:", error);
      return false;
    }
  };

  const handleResubmissionRequest = (thesis) => {
    setSelectedThesis(thesis);
    setResubmissionModalOpen(true);
    setResubmissionReason("");
  };

  const submitResubmissionRequest = async () => {
    if (!resubmissionReason.trim()) {
      showNotification("Please provide a reason for resubmission", "error");
      return;
    }

    if (!selectedThesis) {
      showNotification("No thesis selected", "error");
      return;
    }

    try {
      setSubmittingResubmission(true);

      const user = JSON.parse(localStorage.getItem("user")) || {};
      const facultyId = user._id || user.facultyId;

      const response = await fetch(
        "http://localhost:5000/api/thesis/request-resubmission",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            thesisId: selectedThesis._id,
            reason: resubmissionReason,
            facultyId: facultyId,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification("Resubmission request sent successfully!", "success");
        setResubmissionModalOpen(false);
        setResubmissionReason("");
        setSelectedThesis(null);

        // Refresh the thesis list to show updated status
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(
          result.message || "Failed to send resubmission request"
        );
      }
    } catch (error) {
      console.error("Error requesting resubmission:", error);
      showNotification(`Error: ${error.message}`, "error");
    } finally {
      setSubmittingResubmission(false);
    }
  };

  const closeResubmissionModal = () => {
    setResubmissionModalOpen(false);
    setResubmissionReason("");
    setSelectedThesis(null);
  };

  const handleAIOptionClick = async (option, thesisId, thesisData) => {
    setLoadingThesisId(thesisId);
    setLoadingType(option);

    try {
      const fileResponse = await fetch(thesisData.fileUrl);
      if (!fileResponse.ok) throw new Error("Failed to fetch thesis file");

      const fileBlob = await fileResponse.blob();
      const formData = new FormData();
      formData.append("file", fileBlob, thesisData.filename || "thesis.pdf");

      let endpoint = "";

      switch (option) {
        case "evaluation":
          endpoint = "/api/evaluation/thesis-evaluation";
          break;
        case "plagiarism":
          endpoint = "/api/evaluation/plagiarism-detection";
          break;
        case "ai-detection":
          endpoint = "/api/evaluation/ai-detection";
          break;
        default:
          throw new Error("Invalid analysis type");
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.message || "Analysis failed");

      // Store the report in temporary storage
      const reportType =
        option === "evaluation"
          ? "thesis"
          : option === "plagiarism"
          ? "plagiarism"
          : "ai";

      const storageSuccess = await storeTemporaryReport(
        reportType,
        result.reportId,
        result.data,
        {
          ...thesisData,
          studentName: thesisData.studentName,
          studentId: thesisData.studentId,
          filename: thesisData.filename || "thesis.pdf",
          title: thesisData.title || "Thesis Document",
        }
      );

      if (!storageSuccess) {
        throw new Error("Failed to store report data");
      }

      // Open report in new tab
      openReportInNewTab(option, result.reportId);
      showNotification(
        `${getOptionDisplayName(option)} completed successfully!`,
        "success"
      );
    } catch (error) {
      console.error(`Error during ${option} analysis:`, error);
      showNotification(
        `Failed to perform ${getOptionDisplayName(option)}: ${error.message}`,
        "error"
      );
    } finally {
      setLoadingThesisId(null);
      setLoadingType(null);
    }
  };

  const openReportInNewTab = (option, reportId) => {
    // Determine the report route based on analysis type
    let reportRoute = "";
    switch (option) {
      case "evaluation":
        reportRoute = `/faculty/evaluation-result/${reportId}`;
        break;
      case "plagiarism":
        reportRoute = `/faculty/plagiarism-result/${reportId}`;
        break;
      case "ai-detection":
        reportRoute = `/faculty/ai-detection-result/${reportId}`;
        break;
      default:
        return;
    }

    console.log("🛣️ Opening route:", reportRoute);

    // Open new tab with the report
    const newTab = window.open(
      `${window.location.origin}${reportRoute}`,
      "_blank"
    );

    // Fallback: if popup is blocked, show message
    if (!newTab || newTab.closed || typeof newTab.closed === "undefined") {
      showNotification(
        "Popup blocked! Please allow popups for this site and try again.",
        "error"
      );
    }
  };

  const getOptionDisplayName = (option) => {
    const names = {
      evaluation: "Thesis Evaluation",
      plagiarism: "Plagiarism Detection",
      "ai-detection": "AI Content Detection",
    };
    return names[option] || option;
  };

  const getButtonText = (option, thesisId) => {
    if (loadingThesisId === thesisId && loadingType === option) {
      const loadingTexts = {
        evaluation: "Evaluating Thesis...",
        plagiarism: "Checking Plagiarism...",
        "ai-detection": "Detecting AI Content...",
      };
      return loadingTexts[option] || "Processing...";
    }

    const buttonTexts = {
      evaluation: "Thesis Evaluation",
      plagiarism: "Plagiarism Detection",
      "ai-detection": "AI Content Detection",
    };
    return buttonTexts[option] || option;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: { color: "bg-blue-100 text-blue-800", text: "Submitted" },
      under_review: {
        color: "bg-yellow-100 text-yellow-800",
        text: "Under Review",
      },
      evaluated: { color: "bg-green-100 text-green-800", text: "Evaluated" },
      revision_required: {
        color: "bg-orange-100 text-orange-800",
        text: "Revision Required",
      },
    };

    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      text: status,
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#F4F4F8] to-white">
      <FacultyHeader />

      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            notification.type === "error"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="flex-grow max-w-6xl w-full mx-auto p-6 mt-6">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6 border border-gray-200">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#6B46C1] mb-3">
              Assigned Thesis Submissions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Review and evaluate student thesis submissions using AI-powered
              analysis tools. Click "Review by AI" to access evaluation options.
            </p>
          </div>

          {thesesList.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-gray-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Theses Assigned
              </h3>
              <p className="text-gray-500">
                You don't have any thesis submissions assigned to you yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {thesesList.map((thesis) => (
                <div
                  key={thesis._id}
                  className="p-6 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    {/* Thesis Information */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-semibold text-[#6B46C1]">
                              {thesis.studentName}
                            </h3>
                            {thesis.isResubmission && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200">
                                Version {thesis.version}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Student ID: {thesis.studentId}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(thesis.status)}
                        </div>
                      </div>

                      {thesis.title && (
                        <p className="text-gray-700 mb-3 font-medium">
                          "{thesis.title}"
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            {thesis.isResubmission
                              ? `Resubmitted (v${thesis.version}): ${new Date(
                                  thesis.createdAt
                                ).toLocaleDateString()}`
                              : `Submitted: ${new Date(
                                  thesis.createdAt
                                ).toLocaleDateString()}`}
                          </span>
                        </div>

                        {thesis.department && (
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            <span>{thesis.department}</span>
                          </div>
                        )}
                      </div>

                      {/* Thesis File Link */}
                      {thesis.fileUrl && (
                        <div className="mt-4 flex flex-wrap gap-3">
                          <a
                            href={thesis.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            {thesis.isResubmission
                              ? `View Thesis Document (v${thesis.version})`
                              : "View Thesis Document"}
                          </a>

                          <button
                            onClick={() => handleResubmissionRequest(thesis)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors duration-200 text-sm font-medium"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Request Resubmission
                          </button>

                          <button
                            onClick={() =>
                              window.open(
                                `/thesis-version-history/${thesis._id}`,
                                "_blank"
                              )
                            }
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-200 text-sm font-medium"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Version History
                          </button>
                        </div>
                      )}
                    </div>

                    {/* AI Review Section */}
                    <div className="lg:w-64">
                      <div className="relative">
                        <button
                          onClick={() => handleExpandToggle(thesis._id)}
                          disabled={loadingThesisId === thesis._id}
                          className={`w-full px-6 py-3 bg-[#6B46C1] text-white rounded-xl hover:bg-[#8B5CF6] transition-all duration-200 flex items-center justify-center gap-2 font-medium ${
                            loadingThesisId === thesis._id
                              ? "opacity-70 cursor-not-allowed"
                              : "hover:shadow-md"
                          }`}
                        >
                          {loadingThesisId === thesis._id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                              Review by AI
                            </>
                          )}
                        </button>

                        {/* Dropdown Options */}
                        {expandedId === thesis._id && (
                          <div className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            {["evaluation", "plagiarism", "ai-detection"].map(
                              (option) => (
                                <button
                                  key={option}
                                  onClick={() =>
                                    handleAIOptionClick(
                                      option,
                                      thesis._id,
                                      thesis
                                    )
                                  }
                                  disabled={loadingThesisId === thesis._id}
                                  className={`w-full text-left px-4 py-4 bg-white hover:bg-[#6B46C1] hover:text-white transition-all duration-200 flex items-center gap-3 group ${
                                    loadingThesisId === thesis._id
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  } ${
                                    option === "evaluation"
                                      ? "border-b border-gray-100"
                                      : option === "plagiarism"
                                      ? "border-b border-gray-100"
                                      : ""
                                  }`}
                                >
                                  {loadingThesisId === thesis._id &&
                                  loadingType === option ? (
                                    <div className="w-4 h-4 border-2 border-[#6B46C1] border-t-transparent rounded-full animate-spin group-hover:border-white"></div>
                                  ) : (
                                    <div
                                      className={`p-1 rounded-lg group-hover:bg-white group-hover:bg-opacity-20`}
                                    >
                                      {option === "evaluation" && (
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                          />
                                        </svg>
                                      )}
                                      {option === "plagiarism" && (
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                          />
                                        </svg>
                                      )}
                                      {option === "ai-detection" && (
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                          />
                                        </svg>
                                      )}
                                    </div>
                                  )}
                                  <span className="font-medium">
                                    {getButtonText(option, thesis._id)}
                                  </span>
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      {/* Helper Text */}
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Opens analysis in new tab
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resubmission Request Modal */}
      {resubmissionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Request Resubmission
              </h3>
              <button
                onClick={closeResubmissionModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {selectedThesis && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Student:</p>
                <p className="font-medium">{selectedThesis.studentName}</p>
                <p className="text-sm text-gray-600 mb-1">
                  ID: {selectedThesis.studentId}
                </p>
                {selectedThesis.isResubmission && (
                  <p className="text-sm text-blue-600 font-medium">
                    Current Version: {selectedThesis.version}
                  </p>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Resubmission *
              </label>
              <textarea
                value={resubmissionReason}
                onChange={(e) => setResubmissionReason(e.target.value)}
                placeholder="Please provide detailed feedback on what needs to be improved..."
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#575C9E] focus:border-transparent"
                disabled={submittingResubmission}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeResubmissionModal}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                disabled={submittingResubmission}
              >
                Cancel
              </button>
              <button
                onClick={submitResubmissionRequest}
                disabled={submittingResubmission || !resubmissionReason.trim()}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  submittingResubmission || !resubmissionReason.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-orange-600 text-white hover:bg-orange-700"
                }`}
              >
                {submittingResubmission ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  "Send Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-[#F3F0FF] border-t border-[#E9E3FF] py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-[#6B46C1] font-medium">
            © 2025 DeskInspect. All rights reserved. | Faculty Thesis Review
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ThesisReviewPage;
