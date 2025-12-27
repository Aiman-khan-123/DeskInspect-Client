// pages/ThesisResubmissionPage.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUpload,
  FaFilePdf,
  FaHistory,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaUser,
  FaCalendarAlt,
  FaArrowRight,
  FaLock,
  FaFolder,
} from "react-icons/fa";
import StudentHeader from "../components/StudentHeader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ThesisResubmissionPage = () => {
  const navigate = useNavigate();
  const cloudinaryRef = useRef();
  const widgetRef = useRef();
  const [fileUrl, setFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resubmissionData, setResubmissionData] = useState(null);
  const [versionHistory, setVersionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isUploadEnabled, setIsUploadEnabled] = useState(false);
  const [folderStatus, setFolderStatus] = useState(null);
  const [activeResubmissionEvent, setActiveResubmissionEvent] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const checkUploadAvailability = async () => {
    if (!resubmissionData?.dueDate) {
      console.log("❌ No due date found in resubmission data");
      setIsUploadEnabled(false);
      return;
    }

    try {
      // First, check if there's an active Thesis Resubmission event
      const eventsResponse = await fetch("http://localhost:5000/api/events");
      const eventsData = await eventsResponse.json();

      const now = new Date();
      const activeResubmissionEvents = eventsData
        .filter(
          (event) =>
            event.type === "Thesis Resubmission" &&
            new Date(event.endDate) >= now
        )
        .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

      if (activeResubmissionEvents.length === 0) {
        console.log("❌ No active Thesis Resubmission event found");
        setActiveResubmissionEvent(null);
        setIsUploadEnabled(false);
        return;
      }

      const currentEvent = activeResubmissionEvents[0];
      setActiveResubmissionEvent(currentEvent);

      // Then check folder status for this event
      const folderResponse = await fetch(
        `http://localhost:5000/api/thesis/folder-status/${currentEvent._id}`
      );
      const folderData = await folderResponse.json();

      console.log("📁 Folder status response:", folderData);
      setFolderStatus(folderData);

      const submissionDueDate = new Date(resubmissionData.dueDate);
      const twoWeeksBefore = new Date(submissionDueDate);
      twoWeeksBefore.setDate(submissionDueDate.getDate() - 14);

      const currentDate = new Date();

      // Enable upload only if:
      // 1. Current date is within 2 weeks before due date AND
      // 2. Folder is created or ready AND
      // 3. There's an active resubmission event
      const isWithinTimeWindow =
        currentDate >= twoWeeksBefore && currentDate <= submissionDueDate;
      const isFolderReady =
        folderData.success && folderData.event?.thesisFolderCreated === true;

      const shouldEnable =
        isWithinTimeWindow &&
        isFolderReady &&
        activeResubmissionEvents.length > 0;

      setIsUploadEnabled(shouldEnable);

      console.log("📅 Upload Availability Check:");
      console.log("Active Resubmission Event:", currentEvent?.name);
      console.log("Submission Due Date:", submissionDueDate);
      console.log("2 Weeks Before:", twoWeeksBefore);
      console.log("Current Date:", currentDate);
      console.log("Is Within Time Window:", isWithinTimeWindow);
      console.log("Is Folder Ready:", isFolderReady);
      console.log("Upload Enabled:", shouldEnable);
    } catch (error) {
      console.error("❌ Error checking upload availability:", error);
      setIsUploadEnabled(false);
    }
  };

  useEffect(() => {
    console.log("🚀 ThesisResubmissionPage - User object:", user);

    // Initialize Cloudinary widget
    if (!cloudinaryRef.current) {
      cloudinaryRef.current = window.cloudinary;
      if (cloudinaryRef.current) {
        widgetRef.current = cloudinaryRef.current.createUploadWidget(
          {
            cloudName: "dogvx8iao",
            uploadPreset: "fileUpload",
            resourceType: "raw",
            clientAllowedFormats: ["PDF", "docx"],
            maxFileSize: 26214400, // 25MB
            multiple: false,
          },
          (error, result) => {
            if (error) {
              console.error("Upload error:", error);
              toast.error("Upload failed. Please try again.", {
                position: "top-right",
                autoClose: 3000,
              });
              setUploading(false);
              return;
            }

            console.log("Cloudinary event:", result.event, result);

            if (result.event === "upload-start") {
              setUploading(true);
            }

            if (result.event === "success") {
              setFileUrl(result.info.secure_url);
              console.log(
                "File uploaded to Cloudinary:",
                result.info.secure_url
              );
            }

            if (result.event === "close") {
              setUploading(false);
              if (result.info && result.info.secure_url) {
                toast.success("File uploaded successfully!", {
                  position: "top-right",
                  autoClose: 2000,
                });
              }
            }

            if (
              result.event === "abort" ||
              result.event === "upload-cancelled"
            ) {
              setUploading(false);
              setFileUrl("");
            }
          }
        );
      }
    }

    // Check resubmission status
    if (user && (user.studentId || user._id)) {
      checkResubmissionStatus();
    } else {
      console.error("❌ No valid user data found for resubmission check");
      setMessage("Please log in to access the resubmission page.");
      setLoading(false);
    }
  }, []);

  // Check upload availability when resubmissionData changes
  useEffect(() => {
    if (resubmissionData) {
      checkUploadAvailability();
    }
  }, [resubmissionData]);

  const checkResubmissionStatus = async () => {
    try {
      setLoading(true);

      const studentId =
        user?.studentId || user?._id || user?.registrationNumber || user?.email;

      if (!studentId) {
        console.error(
          "❌ No valid student identifier found in user object:",
          user
        );
        setMessage("Student information not found. Please log in again.");
        setLoading(false);
        return;
      }

      console.log("✅ Using studentId for resubmission check:", studentId);

      const response = await fetch(
        `http://localhost:5000/api/thesis/resubmission-status/${studentId}`
      );
      const data = await response.json();

      console.log("📥 Response status:", response.status);
      console.log("📥 Response data:", data);

      if (response.ok && data.success) {
        if (data.resubmissionRequested) {
          setResubmissionData(data.thesis);
          await loadVersionHistory(data.thesis._id);
        } else {
          setMessage("No resubmission requested for your thesis.");
        }
      } else {
        setMessage(data.message || "Error checking resubmission status");
      }
    } catch (error) {
      console.error("Error checking resubmission status:", error);
      setMessage("Error loading resubmission information");
    } finally {
      setLoading(false);
    }
  };

  const loadVersionHistory = async (thesisId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/thesis/version-history/${thesisId}`
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setVersionHistory(data.versions || []);
      }
    } catch (error) {
      console.error("Error loading version history:", error);
    }
  };

  const handleUploadClick = () => {
    if (!isUploadEnabled) {
      if (!activeResubmissionEvent) {
        toast.error("No active resubmission event found.", {
          position: "top-right",
          autoClose: 3000,
        });
      } else if (!folderStatus?.event?.thesisFolderCreated) {
        toast.error(
          "Submission folder is not ready yet. Please wait for admin to create the submission folder.",
          {
            position: "top-right",
            autoClose: 4000,
          }
        );
      } else {
        toast.error("Upload is only available 2 weeks before the due date.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
      return;
    }

    if (widgetRef.current) {
      widgetRef.current.open();
    } else {
      toast.error("Upload widget not initialized. Please refresh the page.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleResubmit = async () => {
    if (!fileUrl) {
      toast.error("Please upload a revised thesis file before submitting.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!resubmissionData) {
      toast.error("Resubmission data not found.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!isUploadEnabled) {
      if (!folderStatus?.event?.thesisFolderCreated) {
        toast.error("Cannot submit: Submission folder is not ready yet.", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(
          "Cannot submit: Outside submission window (2 weeks before due date).",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      }
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to submit this revised thesis? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);

      const studentId =
        user?.studentId || user?._id || user?.registrationNumber || user?.email;

      const payload = {
        originalThesisId: resubmissionData._id,
        studentId: studentId,
        fileUrl,
        studentName: user?.fullName || user?.name,
        department: user?.department,
      };

      const response = await fetch(
        "http://localhost:5000/api/thesis/submit-resubmission",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Revised thesis submitted successfully!", {
          position: "top-right",
          autoClose: 5000,
        });

        setMessage(
          "✅ Revised thesis submitted successfully! Your faculty will review the updated submission."
        );
        setFileUrl("");
        setSubmitting(false);
      } else {
        throw new Error(data.message || "Failed to submit resubmission");
      }
    } catch (error) {
      console.error("Error submitting resubmission:", error);
      toast.error(error.message || "Error submitting revised thesis", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getFileName = (url) => {
    if (!url) return "No file";
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    const decodedFilename = decodeURIComponent(filename);
    return decodedFilename.length > 30
      ? decodedFilename.substring(0, 30) + "..."
      : decodedFilename;
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

  const getStatusMessage = () => {
    if (!resubmissionData?.dueDate)
      return "Waiting for due date information...";

    if (!activeResubmissionEvent) {
      return "No active resubmission event";
    }

    if (!folderStatus?.event?.thesisFolderCreated) {
      return "Waiting for folder creation...";
    }

    const submissionDueDate = new Date(resubmissionData.dueDate);
    const twoWeeksBefore = new Date(submissionDueDate);
    twoWeeksBefore.setDate(submissionDueDate.getDate() - 14);
    const currentDate = new Date();

    if (currentDate < twoWeeksBefore) {
      return `Submission opens on ${twoWeeksBefore.toLocaleDateString()}`;
    } else if (currentDate > submissionDueDate) {
      return "Submission period has ended";
    } else {
      return "Submission is enabled";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <StudentHeader />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#575C9E] mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Loading resubmission information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <StudentHeader />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
            {message.includes("✅") ? (
              <>
                <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-green-700 mb-2">
                  Success!
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <button
                  onClick={() => navigate("/student/thesissubmission")}
                  className="bg-[#575C9E] text-white px-6 py-2 rounded-lg hover:bg-[#4a5087] transition-colors duration-200 flex items-center space-x-2 mx-auto"
                >
                  <span>Go to Thesis Submission</span>
                  <FaArrowRight />
                </button>
              </>
            ) : (
              <>
                <FaInfoCircle className="text-6xl text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Information
                </h2>
                <p className="text-gray-600">{message}</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <StudentHeader />
      <ToastContainer />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#575C9E] to-[#454B94] text-white p-6 rounded-t-lg">
          <h1 className="text-2xl font-bold mb-2">Thesis Resubmission</h1>
          <p className="opacity-90">
            Submit your revised thesis based on supervisor feedback
          </p>
          {resubmissionData?.dueDate && (
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-yellow-300" />
                <span>Due Date: {formatDate(resubmissionData.dueDate)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaFolder
                  className={
                    isUploadEnabled ? "text-green-300" : "text-yellow-300"
                  }
                />
                <span
                  className={
                    isUploadEnabled ? "text-green-300" : "text-yellow-300"
                  }
                >
                  {getStatusMessage()}
                </span>
              </div>
              {activeResubmissionEvent && (
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-blue-300" />
                  <span>Event: {activeResubmissionEvent.name}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-b-lg shadow-lg">
          {/* Resubmission Request Information */}
          {resubmissionData && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-3 rounded-full">
                  <FaExclamationTriangle className="text-orange-600 text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Resubmission Requested
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <FaUser className="text-gray-400" />
                      <span className="text-gray-600">
                        Supervisor: {resubmissionData.supervisor?.fullName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-gray-400" />
                      <span className="text-gray-600">
                        Requested on: {formatDate(resubmissionData.requestedAt)}
                      </span>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                      <p className="font-medium text-gray-700 mb-1">
                        Reason for Resubmission:
                      </p>
                      <p className="text-gray-600">{resubmissionData.reason}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upload Revised Thesis
              {!isUploadEnabled && (
                <span className="ml-2 text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                  (Submission Disabled)
                </span>
              )}
            </h3>

            <div
              className={`border-3 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                !isUploadEnabled
                  ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                  : uploading
                  ? "border-blue-400 bg-blue-50 cursor-pointer"
                  : fileUrl
                  ? "border-green-400 bg-green-50 cursor-pointer"
                  : "border-gray-300 hover:border-[#575C9E] hover:bg-gray-50 cursor-pointer"
              }`}
              onClick={isUploadEnabled ? handleUploadClick : undefined}
            >
              {!isUploadEnabled ? (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-400 bg-opacity-10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <FaLock className="text-gray-500 text-2xl" />
                  </div>
                  <div>
                    <p className="text-gray-500 font-semibold">
                      Upload Currently Disabled
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {getStatusMessage()}
                    </p>
                    {resubmissionData?.dueDate && (
                      <p className="text-gray-500 text-xs mt-2">
                        Due date: {formatDate(resubmissionData.dueDate)}
                      </p>
                    )}
                  </div>
                </div>
              ) : uploading ? (
                <div className="space-y-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-blue-700 font-semibold">Uploading...</p>
                </div>
              ) : fileUrl ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-600 bg-opacity-10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <FaFilePdf className="text-green-600 text-2xl" />
                  </div>
                  <div>
                    <p className="text-green-700 font-semibold mb-1">
                      File Uploaded Successfully
                    </p>
                    <p className="text-gray-600 text-sm">
                      {getFileName(fileUrl)}
                    </p>
                    <p className="text-blue-600 text-sm mt-2 hover:underline">
                      Click to replace file
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-[#575C9E] bg-opacity-10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                    <FaUpload className="text-[#575C9E] text-2xl" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold">
                      Click to upload your revised thesis
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Supports PDF, DOCX • Max 25MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Version History */}
          {versionHistory.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FaHistory />
                <span>Submission History</span>
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {versionHistory.map((version, index) => (
                  <div
                    key={version._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-[#575C9E] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                        {version.version}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Version {version.version}{" "}
                          {version.isResubmission
                            ? "(Resubmission)"
                            : "(Original)"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(version.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          version.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : version.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : version.status === "Resubmit" ||
                              version.status === "Resubmission Requested"
                            ? "bg-orange-100 text-orange-800"
                            : version.status === "Resubmitted" ||
                              version.status === "Under Review"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {version.status}
                      </span>
                      <a
                        href={version.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#575C9E] hover:text-[#454B94] text-sm underline"
                      >
                        View File
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="p-6">
            <button
              onClick={handleResubmit}
              disabled={!fileUrl || submitting || !isUploadEnabled}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                !fileUrl || submitting || !isUploadEnabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#575C9E] to-[#454B94] text-white hover:from-[#454B94] hover:to-[#575C9E] transform hover:scale-105 shadow-lg"
              }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </div>
              ) : !isUploadEnabled ? (
                <div className="flex items-center justify-center space-x-2">
                  <FaLock />
                  <span>Submission Disabled</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <FaUpload />
                  <span>Submit Revised Thesis</span>
                </div>
              )}
            </button>

            {!isUploadEnabled && (
              <p className="text-center text-sm text-gray-500 mt-3">
                {getStatusMessage()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThesisResubmissionPage;
