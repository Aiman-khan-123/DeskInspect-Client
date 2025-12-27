import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  FileText,
  Download,
  User,
  BookOpen,
  BarChart3,
  CheckCircle,
  AlertCircle,
  X,
  Home,
  RefreshCw,
  Edit,
} from "lucide-react";

const ThesisEvaluationReport = () => {
  const { id } = useParams();
  const location = useLocation();
  const [report, setReport] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedScores, setEditedScores] = useState({});
  const [editedComments, setEditedComments] = useState({});
  const [editedSupervisorRemarks, setEditedSupervisorRemarks] = useState("");
  const [message, setMessage] = useState("");
  const [isSavedReport, setIsSavedReport] = useState(false);

  // Define the 7 rubric sections
  const rubricSections = [
    { key: "abstract", name: "ABSTRACT", maxScore: 3 },
    { key: "introduction", name: "INTRODUCTION", maxScore: 3 },
    { key: "literature_review", name: "LITERATURE REVIEW", maxScore: 3 },
    { key: "problem_statement", name: "PROBLEM STATEMENT", maxScore: 3 },
    { key: "methodology", name: "METHODOLOGY", maxScore: 3 },
    { key: "results_discussion", name: "RESULTS & DISCUSSION", maxScore: 3 },
    { key: "writing_quality", name: "WRITING QUALITY", maxScore: 3 },
  ];

  useEffect(() => {
    console.log("🚀 Thesis Evaluation Report Component Mounted");
    console.log("📌 URL Parameters - id:", id);
    console.log("📍 Location Object:", location);

    loadReportData();
  }, [id, location]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setMessage("");
      console.log("🔄 Starting report data loading process...");

      // Step 1: Try to load from temporary sources
      console.log("🔍 Step 1: Checking temporary data sources...");
      const temporaryData = await loadTemporaryData();

      if (temporaryData) {
        console.log("✅ Successfully loaded temporary data");
        processReportData(temporaryData);
        return;
      }

      // Step 2: If no temporary data and ID looks like a database ID, try loading saved report
      console.log("🔍 Step 2: Checking if this is a saved report...");
      if (id && isValidObjectId(id)) {
        console.log(
          "📦 ID appears to be a database ID, fetching saved report..."
        );
        await loadSavedReport();
        return;
      }

      // Step 3: If we have a thesis report ID, try backend temporary storage
      console.log("🔍 Step 3: Checking backend temporary storage...");
      if (id && id.startsWith("thesis_")) {
        console.log("🔧 Thesis report ID detected, trying backend storage...");
        const backendData = await loadFromBackendStorage(id);
        if (backendData) {
          processReportData(backendData);
          return;
        }
      }

      // Step 4: No data found anywhere
      console.log("❌ No report data found from any source");
      setMessage(
        "No thesis evaluation report data found. The report may have expired or was not generated properly."
      );
      setLoading(false);
    } catch (error) {
      console.error("💥 Error in loadReportData:", error);
      setMessage("Error loading report: " + error.message);
      setLoading(false);
    }
  };

  const loadTemporaryData = async () => {
    console.log("📦 Checking localStorage...");

    // 1. Check localStorage first
    const localStorageKey = `thesis_report_${id}`;
    const storedData = localStorage.getItem(localStorageKey);

    if (storedData) {
      console.log("✅ Found data in localStorage with key:", localStorageKey);
      try {
        const parsedData = JSON.parse(storedData);
        console.log("📊 localStorage data structure:", Object.keys(parsedData));
        localStorage.removeItem(localStorageKey); // Clean up
        return parsedData;
      } catch (error) {
        console.error("❌ Error parsing localStorage data:", error);
      }
    }

    // 2. Check URL parameters
    console.log("🔗 Checking URL parameters...");
    const urlParams = new URLSearchParams(location.search);
    const encodedData = urlParams.get("data");

    if (encodedData) {
      console.log("✅ Found encoded data in URL parameters");
      try {
        const decodedData = JSON.parse(atob(encodedData));
        console.log("📊 URL data structure:", Object.keys(decodedData));
        return decodedData;
      } catch (error) {
        console.error("❌ Error decoding URL data:", error);
      }
    }

    // 3. Check location state
    console.log("📍 Checking location state...");
    if (location.state) {
      console.log("✅ Found location state data");
      console.log("📊 Location state keys:", Object.keys(location.state));
      return location.state;
    }

    console.log("❌ No temporary data found");
    return null;
  };

  const loadFromBackendStorage = async (reportId) => {
    try {
      console.log("🌐 Fetching from backend temporary storage:", reportId);

      const response = await fetch(
        `http://localhost:5000/api/temporary-reports/thesis/${reportId}`
      );

      if (!response.ok) {
        console.log(`❌ Backend storage HTTP error: ${response.status}`);
        return null;
      }

      const result = await response.json();
      console.log("📡 Backend storage response:", result);

      if (result.success && result.data) {
        console.log("✅ Backend storage data loaded successfully");
        return {
          analysisData:
            result.data.analysisData || result.data.data || result.data,
          thesisData: result.data.thesisData || {
            filename: result.data.filename,
            studentName: result.data.studentName || "Student",
            studentId: result.data.studentId || "Unknown",
            title: result.data.thesisTitle || "Thesis Document",
          },
        };
      }
    } catch (error) {
      console.log("❌ Backend storage error:", error.message);
    }

    return null;
  };

  const loadSavedReport = async () => {
    try {
      console.log("💾 Fetching saved report from database...");

      const response = await fetch(
        `http://localhost:5000/api/reports/report/${id}`
      );

      if (!response.ok) {
        throw new Error(`Database HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📊 Database response:", result);

      if (result.success && result.data) {
        console.log("✅ Saved report loaded from database");
        setIsSavedReport(true);

        const savedReport = result.data;
        const formattedReport = {
          reportData: savedReport.reportData || {},
          filename: savedReport.filename,
          studentName: savedReport.studentName,
          studentId: savedReport.studentId,
          thesisTitle: savedReport.thesisTitle,
          timestamp: savedReport.createdAt,
          status: savedReport.status,
          reportType: savedReport.reportType,
        };

        setReport(formattedReport);
        setStudentInfo({
          studentName: savedReport.studentName,
          registrationNumber: savedReport.studentId,
          thesisTitle: savedReport.thesisTitle,
          program: savedReport.program || "Not specified",
          department: savedReport.department || "Not specified",
        });
      } else {
        throw new Error(result.message || "No report data found in database");
      }
    } catch (error) {
      console.error("❌ Database load error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (data) => {
    try {
      console.log("🛠️ Processing report data...");
      console.log("📦 Raw data structure:", data);

      const analysisData = data.analysisData || data;
      const thesisData = data.thesisData || data.thesisData || {};

      console.log("🔍 Analysis data keys:", Object.keys(analysisData));
      console.log("👤 Thesis data:", thesisData);

      // Extract evaluation data from various possible structures
      let evaluationData =
        analysisData.final_summary ||
        analysisData.evaluation ||
        analysisData.data?.final_summary ||
        analysisData.data?.evaluation ||
        analysisData.data ||
        analysisData;

      console.log("📝 Evaluation data found:", evaluationData);

      // If no meaningful evaluation data found, create sample data with 7 sections
      if (!evaluationData || Object.keys(evaluationData).length === 0) {
        console.log("⚠️ No evaluation data found, using sample data");
        evaluationData = createSampleEvaluationData();
      }

      const formattedReport = {
        reportData: {
          final_summary: evaluationData,
        },
        filename: thesisData.filename || "thesis.pdf",
        studentName: thesisData.studentName || "Student Name",
        studentId: thesisData.studentId || "Student ID",
        thesisTitle:
          thesisData.title || thesisData.thesisTitle || "Thesis Document",
        thesisVersion: thesisData.version || 1,
        timestamp: data.timestamp || new Date().toISOString(),
        status: "temporary",
        reportType: "thesis-evaluation",
      };

      console.log("✅ Final formatted report:", formattedReport);

      setReport(formattedReport);
      setStudentInfo({
        studentName: formattedReport.studentName,
        registrationNumber: formattedReport.studentId,
        thesisTitle: formattedReport.thesisTitle,
        submittedDate: thesisData.submittedDate || thesisData.createdAt,
        program: thesisData.program || "Not specified",
        department: thesisData.department || "Not specified",
      });
      setLoading(false);
    } catch (error) {
      console.error("❌ Error processing report data:", error);
      setMessage("Error processing report data: " + error.message);
      setLoading(false);
    }
  };

  const createSampleEvaluationData = () => {
    console.log("🎭 Creating sample evaluation data for demonstration");

    // Initialize scores and comments for all 7 sections
    const overall_scores = {
      percentage: 0, // Will be calculated
    };

    const section_comments = {};
    const section_scores = {};

    // Initialize all sections with sample data
    rubricSections.forEach((section) => {
      const score = (Math.random() * 1.5 + 1.5).toFixed(1); // Random score between 1.5-3.0
      section_scores[section.key] = parseFloat(score);
      overall_scores[section.key] = parseFloat(score);

      section_comments[section.key] = getSampleComment(
        section.key,
        parseFloat(score)
      );
    });

    // Calculate overall percentage
    const totalScore = Object.values(section_scores).reduce(
      (sum, score) => sum + score,
      0
    );
    const maxPossible = rubricSections.length * 3;
    overall_scores.percentage = (totalScore / maxPossible) * 100;

    return {
      overall_scores,
      section_comments,
      supervisor_remarks:
        "Overall, this is a well-structured thesis demonstrating good research capabilities. The student has shown excellent understanding of the methodology and produced valuable results. Areas for improvement include expanding the literature review and strengthening the discussion section with more comparative analysis.",
      recommendations: [
        "Include more recent literature in the review section",
        "Strengthen the discussion with more comparative analysis",
        "Consider expanding the sample size for future research",
        "Improve the abstract to better summarize key findings",
      ],
    };
  };

  const getSampleComment = (section, score) => {
    const comments = {
      abstract: {
        good: "Concise and informative abstract that accurately represents the thesis content.",
        average:
          "Abstract covers main points but could be more specific about findings.",
        poor: "Abstract needs improvement to better summarize research objectives and outcomes.",
      },
      introduction: {
        good: "Well-structured introduction with clear research objectives and good context setting.",
        average:
          "Introduction provides background but research questions could be clearer.",
        poor: "Introduction lacks clear research objectives and context.",
      },
      literature_review: {
        good: "Comprehensive review with critical analysis of relevant literature.",
        average:
          "Adequate literature review but could benefit from more recent sources.",
        poor: "Literature review is limited and lacks critical analysis.",
      },
      problem_statement: {
        good: "Clear and well-defined problem statement with appropriate scope.",
        average:
          "Problem statement is identifiable but could be more precisely defined.",
        poor: "Problem statement is unclear or too broad in scope.",
      },
      methodology: {
        good: "Excellent research design and appropriate methods selection with clear justification.",
        average:
          "Methodology is adequate but some methodological choices need better justification.",
        poor: "Methodology section lacks clarity and proper justification of methods.",
      },
      results_discussion: {
        good: "Clear presentation of findings with excellent interpretation and discussion.",
        average:
          "Results are presented adequately but discussion could be more analytical.",
        poor: "Results and discussion lack depth and proper interpretation.",
      },
      writing_quality: {
        good: "Excellent writing quality with proper grammar, structure, and academic tone.",
        average:
          "Acceptable writing quality with some areas needing improvement.",
        poor: "Writing quality needs significant improvement in grammar and structure.",
      },
    };

    if (score >= 2.5) return comments[section].good;
    if (score >= 1.5) return comments[section].average;
    return comments[section].poor;
  };

  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  const getOverallGrade = (percentage) => {
    if (percentage >= 85)
      return { grade: "A", color: "bg-green-500", text: "Excellent" };
    if (percentage >= 75)
      return { grade: "B", color: "bg-blue-500", text: "Good" };
    if (percentage >= 65)
      return { grade: "C", color: "bg-yellow-500", text: "Satisfactory" };
    if (percentage >= 50)
      return { grade: "D", color: "bg-orange-500", text: "Needs Improvement" };
    return { grade: "F", color: "bg-red-500", text: "Unsatisfactory" };
  };

  const getScoreColor = (score) => {
    if (score >= 2.5) return "text-green-600";
    if (score >= 2.0) return "text-blue-600";
    if (score >= 1.5) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "Not available")
      return "Date not available";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleScoreChange = (section, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setEditedScores((prev) => ({
        ...prev,
        [section]: Math.min(3, Math.max(0, numValue)),
      }));
    }
  };

  const handleCommentChange = (section, comment) => {
    setEditedComments((prev) => ({
      ...prev,
      [section]: comment,
    }));
  };

  const startEditing = () => {
    setEditing(true);
    setEditedScores(report?.reportData?.final_summary?.overall_scores || {});
    setEditedComments(
      report?.reportData?.final_summary?.section_comments || {}
    );
    setEditedSupervisorRemarks(
      report?.reportData?.final_summary?.supervisor_remarks || ""
    );
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditedScores({});
    setEditedComments({});
    setEditedSupervisorRemarks("");
  };

  const handleSave = async () => {
    if (!report || !studentInfo) {
      setMessage("Error: Report data is incomplete");
      return;
    }

    if (!window.confirm("Are you sure you want to save this thesis evaluation report?")) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      console.log("👤 Current user:", user);

      if (!user._id && !user.facultyId) {
        throw new Error("User not authenticated. Please log in again.");
      }

      const facultyId = user._id || user.facultyId;
      const reportId = `thesis_evaluation_${Date.now()}_${report.studentId}`;

      // Merge edited data with original data
      const finalScores = {
        ...report.reportData.final_summary.overall_scores,
        ...editedScores,
      };

      const finalComments = {
        ...report.reportData.final_summary.section_comments,
        ...editedComments,
      };

      // Recalculate overall percentage if scores were edited
      if (Object.keys(editedScores).length > 0) {
        const sectionScores = rubricSections.map(
          (section) => finalScores[section.key] || 0
        );

        if (sectionScores.length > 0) {
          const totalScore = sectionScores.reduce(
            (sum, score) => sum + score,
            0
          );
          const maxPossible = sectionScores.length * 3;
          finalScores.percentage = (totalScore / maxPossible) * 100;
        }
      }

      const reportData = {
        reportId,
        studentId: report.studentId,
        studentName: report.studentName,
        facultyId: facultyId,
        thesisId: id || reportId,
        thesisTitle: report.thesisTitle,
        filename: report.filename,
        thesisVersion: report.thesisVersion || 1,
        reportType: "thesis-evaluation",
        reportData: {
          final_summary: {
            ...report.reportData.final_summary,
            overall_scores: finalScores,
            section_comments: finalComments,
            supervisor_remarks:
              editedSupervisorRemarks ||
              report.reportData.final_summary.supervisor_remarks,
          },
        },
      };

      console.log("📤 Saving report to database:", reportData);

      const response = await fetch(
        "http://localhost:5000/api/reports/save-report",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reportData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("💾 Save response:", result);

      if (result.success) {
        setMessage("✅ Thesis evaluation report saved successfully!");
        setIsSavedReport(true);
        setEditing(false);

        // Update the report with saved data
        setReport((prev) => ({
          ...prev,
          reportData: reportData.reportData,
        }));

        // Close the tab after 3 seconds for temporary reports
        if (!isSavedReport) {
          setTimeout(() => {
            window.close();
          }, 3000);
        }
      } else {
        throw new Error(result.message || "Failed to save report");
      }
    } catch (error) {
      console.error("❌ Save error:", error);
      setMessage("❌ Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = () => {
    window.print();
  };

  const goToEvaluationPage = () => {
    window.location.href = "/faculty/evaluation";
  };

  const closeTab = () => {
    if (isSavedReport) {
      window.location.href = "/faculty/evaluation";
    } else {
      window.close();
    }
  };

  const retryLoad = () => {
    console.log("🔄 Retrying data load...");
    setLoading(true);
    setMessage("");
    loadReportData();
  };

  const loadDemoData = () => {
    console.log("🎭 Loading demonstration data...");
    const demoReport = {
      reportData: {
        final_summary: createSampleEvaluationData(),
      },
      filename: "demonstration_thesis.pdf",
      studentName: "Demo Student",
      studentId: "DEMO2024001",
      thesisTitle: "Demonstration of Thesis Evaluation System",
      timestamp: new Date().toISOString(),
      status: "temporary",
      reportType: "thesis-evaluation",
    };

    setReport(demoReport);
    setStudentInfo({
      studentName: demoReport.studentName,
      registrationNumber: demoReport.studentId,
      thesisTitle: demoReport.thesisTitle,
      submittedDate: new Date().toISOString(),
      program: "Computer Science",
      department: "School of Computing",
    });
    setLoading(false);
    setMessage("✅ Demonstration data loaded successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#454B94] mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Thesis Evaluation Report
          </h3>
          <p className="text-gray-600 mb-4">
            Please wait while we load the report data...
          </p>
          <div className="text-sm text-gray-500 mb-4">
            <p>Report ID: {id}</p>
            <p>Sources checked: localStorage, URL, backend</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={retryLoad}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#454B94] text-white rounded-lg hover:bg-[#575C9E] transition"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Loading
            </button>
            <button
              onClick={loadDemoData}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Load Demonstration Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report || !studentInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Thesis Report Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            {message ||
              "The requested thesis evaluation report could not be loaded."}
          </p>
          <div className="text-sm text-gray-500 mb-4 p-3 bg-gray-50 rounded-lg">
            <p>
              <strong>Debug Information:</strong>
            </p>
            <p>Report ID: {id || "None"}</p>
            <p>Location State: {location.state ? "Available" : "Empty"}</p>
            <p>URL Search: {location.search || "None"}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={retryLoad}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#454B94] text-white rounded-lg hover:bg-[#575C9E] transition"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={loadDemoData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Load Demonstration
            </button>
            <button
              onClick={closeTab}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const evaluationData = report.reportData?.final_summary || {};
  const overallScore = evaluationData.overall_scores?.percentage || 0;
  const gradeInfo = getOverallGrade(overallScore);
  const sectionComments = evaluationData.section_comments || {};
  const recommendations = evaluationData.recommendations || [];

  console.log("🎨 Rendering report with:", {
    overallScore: overallScore.toFixed(1) + "%",
    sections: rubricSections.length,
    recommendations: recommendations.length,
    isSavedReport,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header Bar */}
      <div className="bg-white rounded-t-2xl shadow-lg p-4 mb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#454B94]" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Thesis Evaluation Report
                {isSavedReport && (
                  <span className="ml-2 text-sm text-green-600">(Saved)</span>
                )}
                {!isSavedReport && (
                  <span className="ml-2 text-sm text-blue-600">
                    (Temporary)
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-600">
                DeskInspect Thesis Evaluation System
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isSavedReport && (
              <button
                onClick={goToEvaluationPage}
                className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
                title="Back to Reports"
              >
                <Home className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={closeTab}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
              title={isSavedReport ? "Back to Reports" : "Close tab"}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Report Content */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
        {/* Student Information */}
        <div className="bg-gray-50 p-4 rounded-xl mb-6 border-l-4 border-[#454B94]">
          <h2 className="text-lg font-semibold text-[#454B94] mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            STUDENT INFORMATION
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <p>
                <strong className="text-gray-700">Name:</strong>{" "}
                {studentInfo.studentName}
              </p>
              <p>
                <strong className="text-gray-700">Registration No:</strong>{" "}
                {studentInfo.registrationNumber}
              </p>
              <p>
                <strong className="text-gray-700">Program:</strong>{" "}
                {studentInfo.program}
              </p>
            </div>
            <div>
              <p>
                <strong className="text-gray-700">Thesis Title:</strong>{" "}
                {studentInfo.thesisTitle}
              </p>
              <p>
                <strong className="text-gray-700">Department:</strong>{" "}
                {studentInfo.department}
              </p>
              <p>
                <strong className="text-gray-700">Evaluation Date:</strong>{" "}
                {formatDate(report.timestamp)}
              </p>
            </div>
          </div>
        </div>

        {/* Overall Score Card */}
        <div className="bg-gradient-to-br from-[#454B94] to-[#575C9E] rounded-xl p-6 text-center text-white mb-6">
          <div className="text-md font-semibold mb-2">
            OVERALL EVALUATION SCORE
          </div>
          <div className="text-5xl font-bold my-3">
            {overallScore.toFixed(1)}%
          </div>
          <div
            className={`inline-block px-4 py-2 rounded-full text-md font-semibold ${gradeInfo.color}`}
          >
            Grade: {gradeInfo.grade} - {gradeInfo.text}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-[#454B94]">
              {rubricSections.length}
            </div>
            <div className="text-xs text-gray-600">Evaluation Criteria</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-blue-600">
              {recommendations.length}
            </div>
            <div className="text-xs text-gray-600">Recommendations</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-green-600">
              {gradeInfo.grade}
            </div>
            <div className="text-xs text-gray-600">Final Grade</div>
          </div>
        </div>

        {/* Detailed Evaluation */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#454B94] mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            DETAILED EVALUATION (7 RUBRIC SECTIONS)
          </h3>

          <div className="space-y-4">
            {rubricSections.map((section) => {
              const currentScore =
                editing && editedScores[section.key] !== undefined
                  ? editedScores[section.key]
                  : evaluationData.overall_scores?.[section.key] || 0;

              const currentComment =
                editing && editedComments[section.key] !== undefined
                  ? editedComments[section.key]
                  : sectionComments[section.key] || "No comments provided.";

              return (
                <div
                  key={section.key}
                  className="bg-gray-50 p-4 rounded-lg border"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-800">
                      {section.name}
                    </h4>
                    <div className="flex items-center gap-3">
                      {editing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="3"
                            step="0.1"
                            value={currentScore}
                            onChange={(e) =>
                              handleScoreChange(section.key, e.target.value)
                            }
                            className="w-20 px-2 py-1 border border-[#454B94] rounded text-center font-semibold"
                          />
                          <span className="text-sm text-gray-500">
                            / {section.maxScore}
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`text-lg font-bold ${getScoreColor(
                            currentScore
                          )}`}
                        >
                          {currentScore.toFixed(1)}/{section.maxScore}
                        </span>
                      )}
                    </div>
                  </div>

                  {editing ? (
                    <textarea
                      value={currentComment}
                      onChange={(e) =>
                        handleCommentChange(section.key, e.target.value)
                      }
                      className="w-full p-3 border border-[#454B94] rounded resize-none focus:ring-2 focus:ring-[#454B94]"
                      rows="3"
                      placeholder={`Enter comments for ${section.name}...`}
                    />
                  ) : (
                    <p className="text-gray-700 text-sm">{currentComment}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Supervisor Comments */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#454B94] mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            SUPERVISOR COMMENTS
          </h3>
          {editing ? (
            <textarea
              value={editedSupervisorRemarks}
              onChange={(e) => setEditedSupervisorRemarks(e.target.value)}
              className="w-full p-4 border border-[#454B94] rounded-lg resize-none focus:ring-2 focus:ring-[#454B94]"
              rows="4"
              placeholder="Enter your overall comments and feedback..."
            />
          ) : (
            <div className="bg-purple-50 border-l-4 border-[#454B94] p-4 rounded">
              <p className="text-gray-700">
                {evaluationData.supervisor_remarks || "No comments provided."}
              </p>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#454B94] mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              RECOMMENDATIONS FOR IMPROVEMENT
            </h3>
            <div className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-yellow-50 p-3 rounded-lg"
                >
                  <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">
                    {recommendation}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center border-t pt-6">
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>

          {!isSavedReport && !editing && (
            <button
              onClick={startEditing}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit & Save Report
            </button>
          )}

          {editing && (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#454B94] text-white rounded-lg hover:bg-[#575C9E] transition disabled:opacity-50 text-sm font-medium"
              >
                {saving ? "Saving..." : "Save Report"}
              </button>
              <button
                onClick={cancelEditing}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mt-4 p-3 rounded text-center text-sm ${
              message.includes("❌") || message.includes("Error")
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-green-100 text-green-700 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThesisEvaluationReport;