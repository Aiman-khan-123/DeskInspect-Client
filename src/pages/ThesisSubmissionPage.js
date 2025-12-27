// pages/ThesisSubmissionPage.js
import React, { useEffect, useRef, useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaChevronDown,
  FaUpload,
  FaFilePdf,
  FaUserGraduate,
  FaExclamationTriangle,
  FaArrowRight,
  FaCalendarAlt,
  FaLock,
  FaClock,
  FaEye,
  FaSearch,
  FaSpinner,
  FaUserCheck,
  FaSync,
  FaInfoCircle,
} from "react-icons/fa";
import StudentHeader from "../components/StudentHeader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ThesisSubmissionPage = () => {
  const cloudinaryRef = useRef();
  const widgetRef = useRef();
  const [fileUrl, setFileUrl] = useState("");
  const [status, setStatus] = useState("Not Submitted");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState("");
  const [showSupervisorDropdown, setShowSupervisorDropdown] = useState(false);
  const [loadingSupervisors, setLoadingSupervisors] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [resubmissionRequested, setResubmissionRequested] = useState(false);
  const [resubmissionData, setResubmissionData] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [folderStatus, setFolderStatus] = useState(null);
  const [isSubmissionEnabled, setIsSubmissionEnabled] = useState(false);
  const [currentThesis, setCurrentThesis] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [showStatusDetails, setShowStatusDetails] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: "dogvx8iao",
        uploadPreset: "fileUpload",
        resourceType: "raw",
        clientAllowedFormats: ["PDF", "docx"],
        maxFileSize: 26214400, // 25 MB in bytes
        multiple: false,
      },
      (error, result) => {
        console.log("Cloudinary event:", result.event, result);

        if (result.event === "upload-added") {
          setIsUploading(true);
        }

        if (!error && result.event === "success") {
          setFileUrl(result.info.secure_url);
          console.log("File uploaded to Cloudinary:", result.info.secure_url);
        }

        if (result.event === "close") {
          setIsUploading(false);
          if (result.info && result.info.secure_url) {
            toast.success("File uploaded successfully!", {
              position: "top-right",
              autoClose: 3000,
            });
          }
        }

        if (result.event === "abort" || result.event === "upload-cancelled") {
          setIsUploading(false);
          setFileUrl("");
        }
      }
    );

    fetchCurrentEvent();
    fetchSupervisors();

    if (user?.studentId) {
      fetchSubmission();
      checkResubmissionStatus();
    }
  }, [user?.studentId]);

  const fetchCurrentEvent = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/events");
      if (res.ok) {
        const events = await res.json();
        // Filter for Thesis Submission events only
        const now = new Date();
        const thesisEvents = events
          .filter(
            (event) =>
              event.type === "Thesis Submission" &&
              new Date(event.endDate) >= now
          )
          .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

        if (thesisEvents.length > 0) {
          const currentEvent = thesisEvents[0];
          setCurrentEvent(currentEvent);
          console.log("📅 Found Thesis Submission event:", currentEvent);

          // Check folder status for this event
          await checkFolderStatus(currentEvent._id);
        } else {
          console.log("📅 No active Thesis Submission events found");
          setCurrentEvent(null);
          setIsSubmissionEnabled(false);
        }
      }
    } catch (error) {
      console.error("Error fetching current event:", error);
      setCurrentEvent(null);
      setIsSubmissionEnabled(false);
    }
  };

  const checkFolderStatus = async (eventId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/thesis/folder-status/${eventId}`
      );
      const data = await response.json();

      setFolderStatus(data);

      if (data.success && data.event?.thesisFolderCreated) {
        setIsSubmissionEnabled(true);
        console.log("✅ Folder is ready for submission");
      } else {
        setIsSubmissionEnabled(false);
        console.log("❌ Folder not ready:", data);
      }
    } catch (error) {
      console.error("Error checking folder status:", error);
      setIsSubmissionEnabled(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      setLoadingSupervisors(true);
      const res = await fetch("http://localhost:5000/api/supervisors");

      if (res.ok) {
        const data = await res.json();
        console.log("📋 Supervisors API response:", data);

        // Handle different response formats
        let supervisorsList = [];

        if (data && Array.isArray(data)) {
          supervisorsList = data;
        } else if (
          data &&
          data.supervisors &&
          Array.isArray(data.supervisors)
        ) {
          supervisorsList = data.supervisors;
        } else if (data && data.users && Array.isArray(data.users)) {
          // If using users endpoint, filter for faculty
          supervisorsList = data.users.filter(
            (user) => user.role === "Faculty" || user.role === "Supervisor"
          );
        }

        // Ensure each supervisor has proper _id
        const formattedSupervisors = supervisorsList.map((s) => ({
          ...s,
          _id:
            s._id || s.id || `sup-${Math.random().toString(36).substr(2, 9)}`,
          fullName:
            s.fullName ||
            s.name ||
            `${s.firstName || ""} ${s.lastName || ""}`.trim() ||
            "Unknown Supervisor",
        }));

        setSupervisors(formattedSupervisors);
        console.log(
          `✅ Loaded ${formattedSupervisors.length} supervisors:`,
          formattedSupervisors
        );
      } else {
        console.error("Failed to fetch supervisors", {
          status: res.status,
          statusText: res.statusText,
        });
        toast.error("Failed to load supervisors list", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Error fetching supervisors", err);
      toast.error("Error loading supervisors list", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoadingSupervisors(false);
    }
  };

  const fetchSubmission = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/thesis/by-student/${user?.studentId}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.thesis) {
          setCurrentThesis(data.thesis);
          setFileUrl(data.thesis.fileUrl || "");

          const sup = data.thesis.supervisorId;
          if (sup && typeof sup === "object") {
            setSelectedSupervisor(sup._id || sup.id || "");
          } else {
            setSelectedSupervisor(sup || "");
          }

          // Check if resubmission is requested
          if (
            data.thesis.resubmissionRequested &&
            data.thesis.resubmissionReason
          ) {
            setResubmissionRequested(true);
            setResubmissionData({
              reason: data.thesis.resubmissionReason,
              requestedAt: data.thesis.resubmissionRequestedAt,
              supervisor: data.thesis.supervisorId,
              _id: data.thesis._id,
            });
            // Clear the file URL to force student to upload a new revised version
            setFileUrl("");
          } else {
            // Clear resubmission data if no longer requested
            setResubmissionRequested(false);
            setResubmissionData(null);
          }

          // Set status from database - always use actual status
          if (data.thesis.status) {
            setStatus(data.thesis.status);
          } else {
            setStatus("Not Submitted");
          }

          setSubmitted(true);
          loadStatusHistory(data.thesis._id);
          console.log("📋 Fetched thesis data:", data.thesis);
        }
      }
    } catch (err) {
      console.error("Error fetching submission:", err);
    }
  };

  const loadStatusHistory = async (thesisId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/thesis/status-history/${thesisId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStatusHistory(data.history || []);
        }
      }
    } catch (error) {
      console.error("Error loading status history:", error);
    }
  };

  const checkResubmissionStatus = async () => {
    try {
      const studentId =
        user?.studentId || user?._id || user?.registrationNumber || user?.email;
      if (!studentId) {
        console.log("❌ No valid student identifier found");
        return;
      }

      const url = `http://localhost:5000/api/thesis/resubmission-status/${studentId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.success && data.resubmissionRequested) {
        setResubmissionRequested(true);
        setResubmissionData(data.thesis);
        setStatus("Resubmit");
      } else {
        setResubmissionRequested(false);
        setResubmissionData(null);
      }
    } catch (error) {
      console.error("💥 Error checking resubmission status:", error);
      setResubmissionRequested(false);
      setResubmissionData(null);
    }
  };

  const handleUploadClick = () => {
    if (
      submitted &&
      status !== "Resubmit" &&
      status !== "Resubmission Requested"
    ) {
      toast.info("You have already submitted your thesis.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!isSubmissionEnabled) {
      if (!currentEvent) {
        toast.error("No active submission event found.", {
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
        toast.error("Submission is currently disabled.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
      return;
    }

    widgetRef.current.open();
  };

  const handleSupervisorSelect = (supervisor) => {
    setSelectedSupervisor(supervisor._id);
    setShowSupervisorDropdown(false);
    toast.success(`Supervisor ${supervisor.fullName} selected`, {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const getSelectedSupervisorName = () => {
    if (!selectedSupervisor) return "Select Supervisor";

    const supervisor = supervisors.find((s) => s._id === selectedSupervisor);
    return supervisor ? supervisor.fullName : "Select Supervisor";
  };

  const handleSubmit = async () => {
    if (!fileUrl) {
      toast.error("Please upload a thesis file before submitting.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!selectedSupervisor) {
      toast.error("Please select a supervisor before submitting.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!isSubmissionEnabled) {
      toast.error(
        "Submission is currently disabled. Please check if the submission folder is ready.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      return;
    }

    const supervisorObj = supervisors.find((s) => s._id === selectedSupervisor);

    if (!supervisorObj) {
      console.error("Selected supervisor not found in loaded list", {
        selectedSupervisor,
        supervisors,
      });
      toast.error("Selected supervisor is not valid. Please select again.", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    try {
      const effectiveStudentId = user?.studentId || user?._id || "";

      // Check if this is a resubmission
      if (status === "Resubmit" || status === "Resubmission Requested") {
        // Handle resubmission
        const resubmissionPayload = {
          originalThesisId: currentThesis._id,
          studentId: effectiveStudentId,
          studentName: user?.fullName,
          department: user?.department,
          fileUrl,
        };

        const resubmitRes = await fetch(
          "http://localhost:5000/api/thesis/resubmit",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resubmissionPayload),
          }
        );

        const resubmitData = await resubmitRes.json();
        if (resubmitRes.ok) {
          setStatus("Under Review");
          setMessage(
            "Revised thesis submitted successfully and is now under review!"
          );
          setResubmissionRequested(false);
          setResubmissionData(null);
          setCurrentThesis(resubmitData.thesis);
          loadStatusHistory(resubmitData.thesis._id);

          toast.success("Revised thesis submitted successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          toast.error(
            resubmitData.message || "Error submitting revised thesis",
            {
              position: "top-right",
              autoClose: 3000,
            }
          );
        }
      } else {
        // Handle initial submission
        const payload = {
          studentName: user?.fullName,
          studentId: effectiveStudentId,
          department: user?.department,
          fileUrl,
          supervisorId: selectedSupervisor,
          submissionEvent: currentEvent
            ? {
                eventId: currentEvent._id,
                eventName: currentEvent.name,
                dueDate: currentEvent.endDate,
              }
            : null,
        };

        const res = await fetch("http://localhost:5000/api/thesis/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok) {
          setStatus("Under Review");
          setMessage("Thesis submitted successfully and is now under review!");
          setSubmitted(true);
          setCurrentThesis(data.thesis);
          loadStatusHistory(data.thesis._id);

          toast.success("Thesis submitted successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          toast.error(data.message || "Error submitting thesis", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      }
    } catch (error) {
      setMessage("Error uploading file");
      toast.error("Error uploading file", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const getSubmissionStatusMessage = () => {
    if (!currentEvent) {
      return "No active submission event";
    }

    if (!folderStatus?.event?.thesisFolderCreated) {
      return "Waiting for submission folder creation";
    }

    if (!isSubmissionEnabled) {
      return "Submission disabled";
    }

    return "Ready for submission";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Not Submitted":
        return <FaTimesCircle className="text-red-500" />;
      case "Submitted":
      case "Resubmitted":
        return <FaCheckCircle className="text-blue-500" />;
      case "Under Review":
        return <FaSpinner className="text-yellow-500 animate-spin" />;
      case "Approved":
        return <FaCheckCircle className="text-green-500" />;
      case "Resubmit":
      case "Resubmission Requested":
        return <FaSync className="text-orange-500" />;
      case "Rejected":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Not Submitted":
        return "bg-red-100 text-red-800 border-red-200";
      case "Submitted":
      case "Resubmitted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Resubmit":
      case "Resubmission Requested":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case "Not Submitted":
        return "You haven't submitted your thesis yet.";
      case "Submitted":
        return "Your thesis has been submitted successfully.";
      case "Under Review":
        return "Your thesis is currently being reviewed by your supervisor.";
      case "Approved":
        return "Congratulations! Your thesis has been approved.";
      case "Resubmit":
      case "Resubmission Requested":
        return "Your supervisor has requested revisions. Please check the resubmission page.";
      case "Resubmitted":
        return "You have submitted a revised version of your thesis.";
      case "Rejected":
        return "Your thesis has been rejected. Please contact your supervisor.";
      default:
        return "Status unknown.";
    }
  };

  const refreshStatus = async () => {
    if (currentThesis?._id) {
      await loadStatusHistory(currentThesis._id);
      await fetchSubmission();
      toast.info("Status refreshed", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StudentHeader />
      <ToastContainer />

      <main className="flex-grow p-4 max-w-6xl mx-auto w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-visible min-h-[600px] w-full mx-auto">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <FaFilePdf className="text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Thesis Submission</h2>
                  <p className="text-white text-opacity-90 text-sm">
                    Upload your thesis document and select a supervisor
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={refreshStatus}
                    className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                    title="Refresh status"
                  >
                    <FaSync className="text-sm" />
                  </button>
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${getStatusColor(
                      status
                    )}`}
                  >
                    {getStatusIcon(status)}
                    <span>{status}</span>
                  </div>
                </div>
                {!isSubmissionEnabled && (
                  <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    <FaLock className="inline mr-1" />
                    Disabled
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-8 space-y-8">
            {/* Status Tracking Section */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <FaEye className="text-purple-600" />
                  <span>Submission Status Tracking</span>
                </h3>
                <button
                  onClick={() => setShowStatusDetails(!showStatusDetails)}
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center space-x-1"
                >
                  <FaSearch className="text-xs" />
                  <span>
                    {showStatusDetails ? "Hide Details" : "View Details"}
                  </span>
                </button>
              </div>

              <div className="space-y-3">
                {/* Current Status */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status)}
                    <div>
                      <p className="font-semibold text-gray-900">
                        Current Status
                      </p>
                      <p className="text-sm text-gray-600">
                        {getStatusDescription(status)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      status
                    )}`}
                  >
                    {status}
                  </span>
                </div>

                {/* Status History */}
                {showStatusDetails && statusHistory.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Status History
                    </h4>
                    <div className="space-y-2">
                      {statusHistory.map((history, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(history.status)}
                            <div>
                              <p className="font-medium text-gray-900">
                                {history.status}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  history.timestamp
                                ).toLocaleDateString()}{" "}
                                at{" "}
                                {new Date(
                                  history.timestamp
                                ).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          {history.comments && (
                            <p className="text-sm text-gray-600 max-w-xs text-right">
                              {history.comments}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Progress Bar */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Submission Progress
                  </h4>
                  <div className="flex items-center justify-between mb-2">
                    {[
                      "Not Submitted",
                      "Submitted",
                      "Under Review",
                      "Approved",
                    ].map((stepStatus, index) => (
                      <div
                        key={stepStatus}
                        className="flex flex-col items-center"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            getProgressStep(status) > index
                              ? "bg-green-500 text-white"
                              : getProgressStep(status) === index
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="text-xs mt-1 text-gray-600 text-center max-w-16">
                          {stepStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(getProgressStep(status) / 3) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Event Info */}
            {currentEvent && (
              <div
                className={`p-4 rounded-lg border-l-4 ${
                  isSubmissionEnabled
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-400"
                    : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-full flex-shrink-0 ${
                      isSubmissionEnabled ? "bg-green-100" : "bg-blue-100"
                    }`}
                  >
                    <FaCalendarAlt
                      className={`text-lg ${
                        isSubmissionEnabled ? "text-green-600" : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {currentEvent.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Due Date:{" "}
                      {new Date(currentEvent.endDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isSubmissionEnabled
                          ? "text-green-600 font-medium"
                          : "text-blue-600"
                      }`}
                    >
                      {isSubmissionEnabled ? (
                        <>✓ Submission folder is ready</>
                      ) : (
                        <>⏳ {getSubmissionStatusMessage()}</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Student Info */}
            <div className="bg-[#6B46C1]/5 rounded-xl p-4 border border-[#6B46C1]/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#6B46C1] rounded-lg">
                  <FaUserGraduate className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {user?.fullName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {user?.studentId} • {user?.department}
                  </p>
                </div>
              </div>
            </div>

            {/* Supervisor Comments - Show when resubmission is requested */}
            {resubmissionRequested &&
              resubmissionData &&
              (status === "Resubmit" ||
                status === "Resubmission Requested") && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border-l-4 border-orange-400 shadow-md">
                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-100 p-3 rounded-full flex-shrink-0">
                      <FaExclamationTriangle className="text-orange-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <span>Resubmission Required</span>
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                          Action Required
                        </span>
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <FaUserCheck className="text-gray-500" />
                          <span className="text-gray-700">
                            <strong>Supervisor:</strong>{" "}
                            {resubmissionData.supervisor?.fullName ||
                              "Your Supervisor"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <FaCalendarAlt className="text-gray-500" />
                          <span className="text-gray-700">
                            <strong>Requested on:</strong>{" "}
                            {resubmissionData.requestedAt
                              ? new Date(
                                  resubmissionData.requestedAt
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </span>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-orange-200">
                          <p className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                            <FaInfoCircle className="text-orange-600" />
                            <span>Supervisor's Comments:</span>
                          </p>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {resubmissionData.reason}
                          </p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-lg">
                          <p className="text-sm text-orange-800 flex items-center space-x-2">
                            <FaArrowRight className="flex-shrink-0" />
                            <span>
                              Please address the comments above and upload your
                              revised thesis below.
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Only show submission form if not submitted or resubmission requested */}
            {(status === "Not Submitted" ||
              status === "Resubmit" ||
              status === "Resubmission Requested") && (
              <>
                {/* Upload Section */}
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-gray-800 mb-4">
                    Thesis Document
                    {!isSubmissionEnabled && (
                      <span className="ml-2 text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                        (Upload Disabled)
                      </span>
                    )}
                  </label>

                  <div
                    onClick={handleUploadClick}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                      submitted &&
                      status !== "Resubmit" &&
                      status !== "Resubmission Requested"
                        ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                        : !isSubmissionEnabled
                        ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                        : fileUrl
                        ? "border-green-500 bg-green-50 cursor-pointer"
                        : "border-gray-300 hover:border-[#6B46C1] hover:bg-[#6B46C1]/5 cursor-pointer"
                    }`}
                  >
                    {isUploading ? (
                      <div className="space-y-3">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B46C1] mx-auto"></div>
                        <p className="text-gray-600 font-medium">
                          Uploading your file...
                        </p>
                      </div>
                    ) : fileUrl ? (
                      <div className="space-y-3">
                        <FaCheckCircle className="text-green-500 text-4xl mx-auto" />
                        <div>
                          <p className="text-green-600 font-semibold">
                            File Successfully Uploaded
                          </p>
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#6B46C1] underline text-sm inline-flex items-center space-x-1 mt-2"
                          >
                            <FaFilePdf />
                            <span>View Uploaded Thesis</span>
                          </a>
                        </div>
                      </div>
                    ) : !isSubmissionEnabled ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-400 bg-opacity-10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                          <FaLock className="text-gray-500 text-2xl" />
                        </div>
                        <div>
                          <p className="text-gray-500 font-semibold">
                            Upload Currently Disabled
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            {getSubmissionStatusMessage()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-[#6B46C1] bg-opacity-10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                          <FaUpload className="text-[#6B46C1] text-2xl" />
                        </div>
                        <div>
                          <p className="text-gray-700 font-semibold">
                            Click to upload your thesis
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            Supports PDF, DOCX • Max 25MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Supervisor Selection - Only show for initial submission */}
                {!(
                  status === "Resubmit" || status === "Resubmission Requested"
                ) && (
                  <div className="space-y-4">
                    <label className="block text-lg font-semibold text-gray-800">
                      Thesis Supervisor
                    </label>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setShowSupervisorDropdown(!showSupervisorDropdown)
                        }
                        className={`w-full bg-white border-2 rounded-xl px-6 py-4 text-left flex justify-between items-center transition-all duration-300 ${
                          (submitted &&
                            status !== "Resubmit" &&
                            status !== "Resubmission Requested") ||
                          !isSubmissionEnabled
                            ? "border-gray-300 cursor-not-allowed"
                            : selectedSupervisor
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:border-[#6B46C1]"
                        }`}
                        disabled={
                          (submitted &&
                            status !== "Resubmit" &&
                            status !== "Resubmission Requested") ||
                          !isSubmissionEnabled ||
                          loadingSupervisors
                        }
                      >
                        <div className="flex items-center space-x-3">
                          {selectedSupervisor && (
                            <FaCheckCircle className="text-green-500 flex-shrink-0" />
                          )}
                          <span
                            className={
                              selectedSupervisor
                                ? "text-gray-900 font-medium"
                                : "text-gray-500"
                            }
                          >
                            {loadingSupervisors
                              ? "Loading supervisors..."
                              : getSelectedSupervisorName()}
                          </span>
                        </div>
                        <FaChevronDown
                          className={`transform transition-transform text-gray-400 ${
                            showSupervisorDropdown ? "rotate-180" : ""
                          } ${
                            (submitted &&
                              status !== "Resubmit" &&
                              status !== "Resubmission Requested") ||
                            !isSubmissionEnabled
                              ? "opacity-50"
                              : ""
                          }`}
                        />
                      </button>

                      {showSupervisorDropdown &&
                        !(
                          submitted &&
                          status !== "Resubmit" &&
                          status !== "Resubmission Requested"
                        ) &&
                        isSubmissionEnabled && (
                          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                            {supervisors.length > 0 ? (
                              supervisors.map((supervisor) => (
                                <button
                                  key={supervisor._id}
                                  type="button"
                                  onClick={() =>
                                    handleSupervisorSelect(supervisor)
                                  }
                                  className="w-full px-6 py-4 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                                >
                                  <div className="space-y-1">
                                    <div className="font-semibold text-gray-900">
                                      {supervisor.fullName}
                                    </div>
                                    {supervisor.department && (
                                      <div className="text-sm text-gray-600">
                                        {supervisor.department}
                                      </div>
                                    )}
                                    {supervisor.email && (
                                      <div className="text-xs text-gray-500">
                                        {supervisor.email}
                                      </div>
                                    )}
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="px-6 py-4 text-gray-500 text-center">
                                No supervisors available
                              </div>
                            )}
                          </div>
                        )}
                    </div>

                    {supervisors.length > 0 && !loadingSupervisors && (
                      <p className="text-sm text-gray-500">
                        {supervisors.length} supervisor(s) available
                      </p>
                    )}

                    {selectedSupervisor && (
                      <div className="flex items-center space-x-2 text-green-600 bg-green-50 rounded-lg p-3">
                        <FaCheckCircle />
                        <span className="font-medium">
                          Supervisor selected: {getSelectedSupervisorName()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={
                    (submitted &&
                      status !== "Resubmit" &&
                      status !== "Resubmission Requested") ||
                    !fileUrl ||
                    (!(
                      status === "Resubmit" ||
                      status === "Resubmission Requested"
                    ) &&
                      !selectedSupervisor) ||
                    !isSubmissionEnabled
                  }
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    (submitted &&
                      status !== "Resubmit" &&
                      status !== "Resubmission Requested") ||
                    !fileUrl ||
                    (!(
                      status === "Resubmit" ||
                      status === "Resubmission Requested"
                    ) &&
                      !selectedSupervisor) ||
                    !isSubmissionEnabled
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#454B94] to-[#575C9E] text-white hover:shadow-lg hover:scale-105 transform"
                  }`}
                >
                  {submitted &&
                  status !== "Resubmit" &&
                  status !== "Resubmission Requested"
                    ? "Thesis Submitted ✓"
                    : !isSubmissionEnabled
                    ? "Submission Disabled"
                    : status === "Resubmit" ||
                      status === "Resubmission Requested"
                    ? "Submit Revised Thesis"
                    : "Submit Thesis for Evaluation"}
                </button>
              </>
            )}

            {message && (
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-700 font-semibold">{message}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-[#F3F0FF] border-t border-[#E9E3FF] py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-[#6B46C1] font-medium">
            © 2025 DeskInspect. All rights reserved. | Thesis Submission
          </p>
        </div>
      </footer>
    </div>
  );

  // Helper function to get progress step
  function getProgressStep(status) {
    // Normalize status by removing version numbers and parentheses
    const normalizedStatus = status.replace(/\s*\(v\d+\)\s*/i, "").trim();

    switch (normalizedStatus) {
      case "Not Submitted":
        return 0;
      case "Submitted":
      case "Resubmitted":
        return 1;
      case "Under Review":
        return 2;
      case "Approved":
        return 3;
      case "Resubmit":
      case "Resubmission Requested":
        return 1; // Back to submission step
      case "Rejected":
        return 0; // Back to start
      default:
        // If status contains 'Approved', mark as complete
        if (status.toLowerCase().includes("approved")) return 3;
        if (status.toLowerCase().includes("under review")) return 2;
        if (status.toLowerCase().includes("submitted")) return 1;
        return 0;
    }
  }
};

export default ThesisSubmissionPage;
