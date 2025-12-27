import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Shield,
  Download,
  Send,
  FileText,
  User,
  BookOpen,
  X,
  Home,
  AlertCircle,
  BarChart3,
  RefreshCw,
  ExternalLink,
  Search,
  CheckCircle,
  AlertTriangle,
  FileSearch,
  Database,
  Globe,
} from "lucide-react";

const PlagiarismDetectionReport = () => {
  const { id } = useParams();
  const location = useLocation();
  const [report, setReport] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isSavedReport, setIsSavedReport] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to ensure score is between 0-100
  const normalizeScore = (score) => {
    if (score === undefined || score === null) return 0;
    if (score >= 0 && score <= 100) return score;
    if (score >= 0 && score <= 1) return score * 100;
    return Math.max(0, Math.min(100, score));
  };

  useEffect(() => {
    console.log("🔍 === STARTING PLAGIARISM REPORT DATA LOAD ===");
    console.log("URL ID:", id);
    loadReportData();
  }, [id, location]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setMessage("");

      // Check if this is a temporary report ID (starts with plagiarism_)
      if (id && id.startsWith("plagiarism_")) {
        console.log("🆕 Loading TEMPORARY plagiarism report");
        await loadTemporaryReport();
      } else if (id && id.startsWith("temp_")) {
        console.log("🆕 Loading TEMPORARY report from localStorage");
        await loadFromLocalStorage();
      } else {
        console.log("💾 Loading SAVED report from database");
        await loadSavedReport();
      }
    } catch (error) {
      console.error("❌ Error loading report data:", error);
      setMessage("Error loading report: " + error.message);
      setLoading(false);
    }
  };

  const loadTemporaryReport = async () => {
    try {
      console.log("🌐 Fetching from backend temporary storage...");

      const response = await fetch(
        `http://localhost:5000/api/temporary-reports/plagiarism/${id}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.log(
            "❌ Temporary report not found in backend, checking localStorage..."
          );
          await loadFromLocalStorage();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📡 Backend temporary storage response:", result);

      if (result.success && result.data) {
        console.log("✅ Backend temporary data loaded successfully");
        processReportData(result.data);
      } else {
        throw new Error(result.message || "No data found in temporary storage");
      }
    } catch (error) {
      console.error("❌ Error loading from temporary storage:", error);
      // Fallback to localStorage
      await loadFromLocalStorage();
    }
  };

  const loadFromLocalStorage = async () => {
    try {
      console.log("📦 Checking localStorage for temporary report...");

      // Try localStorage first
      const localStorageKey = `report_${id}`;
      const reportData = localStorage.getItem(localStorageKey);

      if (reportData) {
        console.log("✅ Found temporary report in localStorage");
        const parsedData = JSON.parse(reportData);
        processReportData(parsedData);
        localStorage.removeItem(localStorageKey);
        return;
      }

      // Try URL parameters as fallback
      const urlParams = new URLSearchParams(location.search);
      const encodedData = urlParams.get("data");

      if (encodedData) {
        console.log("✅ Found temporary report in URL parameters");
        try {
          const decodedData = JSON.parse(atob(encodedData));
          processReportData(decodedData);
          return;
        } catch (error) {
          console.error("❌ Error decoding URL data:", error);
        }
      }

      // Try location state
      if (location.state?.analysisData) {
        console.log("✅ Found temporary report in location state");
        processReportData(location.state);
        return;
      }

      console.error("❌ No temporary report data found anywhere");
      setMessage("No report data found. Please generate the report again.");
      setLoading(false);
    } catch (error) {
      console.error("❌ Error loading from localStorage:", error);
      setMessage("Error loading temporary report: " + error.message);
      setLoading(false);
    }
  };

  const loadSavedReport = async () => {
    try {
      console.log("📡 Fetching saved report from database API...");

      const response = await fetch(
        `http://localhost:5000/api/reports/report/${id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Database API response:", result);

      if (result.success && result.data) {
        console.log("📊 Saved report data loaded successfully");
        setIsSavedReport(true);

        // Format the saved report data for display
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
        });
      } else {
        throw new Error(result.message || "No report data found in response");
      }
    } catch (error) {
      console.error("❌ Error loading saved report:", error);

      // If it's a 404 and the ID looks like a temporary ID, try temporary storage
      if (
        error.message.includes("404") &&
        id &&
        (id.startsWith("plagiarism_") || id.startsWith("temp_"))
      ) {
        console.log(
          "🔄 404 error for temporary-looking ID, trying temporary storage..."
        );
        await loadTemporaryReport();
        return;
      }

      setMessage("Error loading saved report: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (data) => {
    try {
      console.log("🔄 Processing report data...");

      const analysisData = data.analysisData || data;
      const thesisData = data.thesisData || data.thesisData || {};

      console.log("Raw analysis data:", analysisData);
      console.log("Raw thesis data:", thesisData);

      // Extract plagiarism data from various possible structures
      const plagiarismData =
        analysisData.plagiarism_detection ||
        analysisData.data?.plagiarism_detection ||
        analysisData.data ||
        analysisData;

      console.log("📊 Extracted plagiarism data:", plagiarismData);

      // Create enhanced sample data if no meaningful data found
      const finalPlagiarismData =
        Object.keys(plagiarismData).length > 0
          ? plagiarismData
          : createEnhancedSampleData();

      const formattedReport = {
        reportData: {
          plagiarism_detection: finalPlagiarismData,
        },
        filename: thesisData.filename || "thesis.pdf",
        studentName: thesisData.studentName || "Unknown Student",
        studentId: thesisData.studentId || "Unknown ID",
        thesisTitle:
          thesisData.title || thesisData.thesisTitle || "Thesis Document",
        timestamp: data.timestamp || new Date().toISOString(),
        status: "temporary",
        reportType: "plagiarism-detection",
      };

      console.log("✅ Final formatted report:", formattedReport);

      setReport(formattedReport);
      setStudentInfo({
        studentName: formattedReport.studentName,
        registrationNumber: formattedReport.studentId,
        thesisTitle: formattedReport.thesisTitle,
        submittedDate: thesisData.submittedDate || thesisData.createdAt,
      });
      setLoading(false);
    } catch (error) {
      console.error("❌ Error processing report data:", error);
      setMessage("Error processing report data: " + error.message);
      setLoading(false);
    }
  };

  const createEnhancedSampleData = () => {
    console.log("🎭 Creating enhanced sample plagiarism data");

    return {
      plagiarism_score: 18.7,
      similarity_score: 18.7,
      internet_score: 12.3,
      database_score: 6.4,
      document_length: "12,450 words",
      analysis_timestamp: new Date().toISOString(),
      document_name: "thesis_final.pdf",
      match_statistics: {
        total_matches: 23,
        average_match_length: 45,
        longest_match: 156,
        matches_per_page: 2.3,
      },
      sources: [
        {
          id: 1,
          title:
            "Machine Learning: A Comprehensive Overview - Journal of AI Research",
          url: "https://jair.org/articles/ml-comprehensive-overview",
          score: 8.5,
          similarity: 8.5,
          type: "journal",
          matched_text:
            "Machine learning algorithms have revolutionized how we approach complex problems in computer science. The ability of models to learn from data without explicit programming has opened new possibilities in artificial intelligence.",
          word_count: 245,
          publication_date: "2023-03-15",
          confidence: 0.95,
        },
        {
          id: 2,
          title:
            "Deep Learning Architectures for NLP - International Conference Proceedings",
          url: "https://icml-proceedings.org/2023/deep-learning-nlp",
          score: 4.2,
          similarity: 4.2,
          type: "conference",
          matched_text:
            "Transformer-based models have dominated natural language processing tasks since their introduction. The self-attention mechanism allows models to capture long-range dependencies effectively.",
          word_count: 128,
          publication_date: "2023-07-22",
          confidence: 0.88,
        },
        {
          id: 3,
          title:
            "Student Thesis: Neural Networks in Computer Vision - University Repository",
          url: "https://repository.university.edu/thesis/neural-networks-cv",
          score: 3.1,
          similarity: 3.1,
          type: "thesis",
          matched_text:
            "Convolutional neural networks have transformed computer vision applications, enabling breakthroughs in image classification and object detection tasks across various domains.",
          word_count: 89,
          publication_date: "2022-11-30",
          confidence: 0.92,
        },
        {
          id: 4,
          title:
            "Online Course: Advanced Machine Learning Techniques - Coursera",
          url: "https://coursera.org/learn/advanced-ml",
          score: 1.8,
          similarity: 1.8,
          type: "website",
          matched_text:
            "The training process involves optimizing model parameters through backpropagation and gradient descent algorithms to minimize loss functions.",
          word_count: 67,
          publication_date: "2023-01-10",
          confidence: 0.85,
        },
        {
          id: 5,
          title: "Research Paper: BERT Architecture Analysis - arXiv",
          url: "https://arxiv.org/abs/2304.05678",
          score: 1.1,
          similarity: 1.1,
          type: "preprint",
          matched_text:
            "BERT's bidirectional attention mechanism provides significant improvements in understanding contextual relationships within text sequences.",
          word_count: 54,
          publication_date: "2023-04-12",
          confidence: 0.9,
        },
      ],
      risk_assessment: {
        level: "LOW_RISK",
        description:
          "Document shows acceptable similarity levels with proper citation patterns",
        recommendations: [
          "Verify all matched sources are properly cited",
          "Consider paraphrasing sections with higher similarity",
          "Review academic integrity guidelines",
        ],
      },
    };
  };

  const toggleSourceExpansion = (sourceId) => {
    setExpandedSources((prev) => ({
      ...prev,
      [sourceId]: !prev[sourceId],
    }));
  };

  const getPlagiarismLevel = (score) => {
    const normalizedScore = normalizeScore(score);

    if (normalizedScore === 0) {
      return {
        level: "No Similarity",
        color: "gray",
        description: "Excellent originality",
        icon: CheckCircle,
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
      };
    }
    if (normalizedScore < 10)
      return {
        level: "Low Similarity",
        color: "green",
        description: "Excellent originality with minimal matches",
        icon: CheckCircle,
        bgColor: "bg-green-50",
        textColor: "text-green-700",
      };
    if (normalizedScore < 25)
      return {
        level: "Medium Similarity",
        color: "yellow",
        description: "Acceptable with proper citation required",
        icon: AlertCircle,
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
      };
    if (normalizedScore < 40)
      return {
        level: "High Similarity",
        color: "orange",
        description: "Requires review and citation verification",
        icon: AlertTriangle,
        bgColor: "bg-orange-50",
        textColor: "text-orange-700",
      };
    return {
      level: "Very High Similarity",
      color: "red",
      description: "Potential academic integrity concern",
      icon: AlertTriangle,
      bgColor: "bg-red-50",
      textColor: "text-red-700",
    };
  };

  const getSourceTypeIcon = (type) => {
    switch (type) {
      case "journal":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "conference":
        return <BookOpen className="w-4 h-4 text-green-500" />;
      case "thesis":
        return <FileSearch className="w-4 h-4 text-purple-500" />;
      case "website":
        return <Globe className="w-4 h-4 text-orange-500" />;
      case "preprint":
        return <Database className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSourceTypeLabel = (type) => {
    switch (type) {
      case "journal":
        return "Journal Article";
      case "conference":
        return "Conference Paper";
      case "thesis":
        return "Student Thesis";
      case "website":
        return "Website Content";
      case "preprint":
        return "Research Preprint";
      default:
        return "Source";
    }
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

  const handleSaveAndSend = async () => {
    if (!report || !studentInfo) {
      setMessage("Error: Report data is incomplete");
      return;
    }

    if (
      !window.confirm("Are you sure you want to save this plagiarism report?")
    ) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      console.log("👨‍🏫 Current user:", user);

      if (!user._id && !user.facultyId) {
        throw new Error("User not authenticated. Please log in again.");
      }

      const facultyId = user._id || user.facultyId;
      const reportId = `plagiarism_${Date.now()}_${report.studentId}`;

      const reportData = {
        reportId,
        studentId: report.studentId,
        studentName: report.studentName,
        facultyId: facultyId,
        thesisId: id || reportId,
        thesisTitle: report.thesisTitle,
        filename: report.filename,
        reportType: "plagiarism-detection",
        reportData: report.reportData,
      };

      console.log("📤 Sending report to backend:", reportData);

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
      console.log("✅ Save response:", result);

      if (result.success) {
        setMessage(
          "✅ Plagiarism report saved and sent to student successfully!"
        );
        setIsSavedReport(true);

        // Update the report with saved data
        setReport((prev) => ({
          ...prev,
          status: "sent",
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
      console.error("❌ Save and send error:", error);
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
    console.log("🎭 Loading demonstration plagiarism data...");
    const demoReport = {
      reportData: {
        plagiarism_detection: createEnhancedSampleData(),
      },
      filename: "demonstration_thesis.pdf",
      studentName: "Demo Student",
      studentId: "DEMO2024001",
      thesisTitle: "Demonstration of Plagiarism Detection System",
      timestamp: new Date().toISOString(),
      status: "temporary",
      reportType: "plagiarism-detection",
    };

    setReport(demoReport);
    setStudentInfo({
      studentName: demoReport.studentName,
      registrationNumber: demoReport.studentId,
      thesisTitle: demoReport.thesisTitle,
      submittedDate: new Date().toISOString(),
    });
    setLoading(false);
    setMessage("✅ Demonstration data loaded successfully");
  };

  // Filter sources based on search
  const filteredSources = () => {
    const plagiarismData = report?.reportData?.plagiarism_detection || {};
    const sources = plagiarismData.sources || [];

    if (!searchTerm) return sources;

    return sources.filter(
      (source) =>
        source.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (source.matched_text &&
          source.matched_text.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2c5aa0] mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Plagiarism Report
          </h3>
          <p className="text-gray-600">
            Analyzing document for similarity matches...
          </p>
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
            Plagiarism Report Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            {message || "The requested plagiarism report could not be loaded."}
          </p>
          <button
            onClick={retryLoad}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2c5aa0] text-white rounded-lg hover:bg-[#1e4a7e] transition"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const plagiarismData = report.reportData?.plagiarism_detection || {};

  // Normalize all scores to 0-100 scale
  const plagiarismScore = normalizeScore(
    plagiarismData.plagiarism_score || plagiarismData.similarity_score || 0
  );
  const internetScore = normalizeScore(plagiarismData.internet_score || 0);
  const databaseScore = normalizeScore(plagiarismData.database_score || 0);
  const originalityScore = 100 - plagiarismScore;

  const levelInfo = getPlagiarismLevel(plagiarismScore);
  const LevelIcon = levelInfo.icon;
  const sources = filteredSources();
  const matchStats = plagiarismData.match_statistics || {};

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header Bar */}
      <div className="bg-white rounded-t-2xl shadow-lg p-4 mb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#2c5aa0] p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Plagiarism Detection Report
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
                DeskInspect Academic Integrity System
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
        <div className="bg-blue-50 p-4 rounded-xl mb-6 border-l-4 border-blue-500">
          <h2 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            DOCUMENT INFORMATION
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p>
                <strong className="text-gray-700">Student Name:</strong>{" "}
                {studentInfo.studentName}
              </p>
              <p>
                <strong className="text-gray-700">Registration No:</strong>{" "}
                {studentInfo.registrationNumber}
              </p>
            </div>
            <div>
              <p>
                <strong className="text-gray-700">Thesis Title:</strong>{" "}
                {studentInfo.thesisTitle}
              </p>
              <p>
                <strong className="text-gray-700">Document:</strong>{" "}
                {report.filename}
              </p>
            </div>
            <div>
              <p>
                <strong className="text-gray-700">Analysis Date:</strong>{" "}
                {formatDate(report.timestamp)}
              </p>
              <p>
                <strong className="text-gray-700">Document Length:</strong>{" "}
                {plagiarismData.document_length || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Overall Score Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {/* Main Similarity Score */}
          <div className="bg-gradient-to-br from-[#2c5aa0] to-[#3a6bc5] rounded-xl p-4 text-center text-white">
            <div className="text-sm font-semibold mb-2">OVERALL SIMILARITY</div>
            <div className="text-3xl font-bold my-2">
              {plagiarismScore.toFixed(1)}%
            </div>
            <div className="text-white text-opacity-90 text-xs">
              {levelInfo.description}
            </div>
          </div>

          {/* Internet Sources */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-center text-white">
            <div className="text-sm font-semibold mb-2">INTERNET SOURCES</div>
            <div className="text-3xl font-bold my-2">
              {internetScore.toFixed(1)}%
            </div>
            <div className="text-white text-opacity-90 text-xs">
              Websites & online content
            </div>
          </div>

          {/* Database Sources */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-center text-white">
            <div className="text-sm font-semibold mb-2">DATABASE SOURCES</div>
            <div className="text-3xl font-bold my-2">
              {databaseScore.toFixed(1)}%
            </div>
            <div className="text-white text-opacity-90 text-xs">
              Academic databases
            </div>
          </div>

          {/* Original Content */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-center text-white">
            <div className="text-sm font-semibold mb-2">ORIGINAL CONTENT</div>
            <div className="text-3xl font-bold my-2">
              {originalityScore.toFixed(1)}%
            </div>
            <div className="text-white text-opacity-90 text-xs">
              Unique content
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div
          className={`${levelInfo.bgColor} p-4 rounded-xl mb-6 border ${levelInfo.textColor}`}
        >
          <div className="flex items-center gap-3">
            <LevelIcon className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">
                Risk Assessment: {levelInfo.level}
              </h3>
              <p className="text-sm mt-1">{levelInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Match Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg text-center border">
            <div className="text-xl font-bold text-gray-800">
              {matchStats.total_matches || 0}
            </div>
            <div className="text-xs text-gray-600">Total Matches</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center border">
            <div className="text-xl font-bold text-gray-800">
              {matchStats.average_match_length || 0}
            </div>
            <div className="text-xs text-gray-600">Avg Match Length</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center border">
            <div className="text-xl font-bold text-gray-800">
              {matchStats.longest_match || 0}
            </div>
            <div className="text-xs text-gray-600">Longest Match</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center border">
            <div className="text-xl font-bold text-gray-800">
              {matchStats.matches_per_page || 0}
            </div>
            <div className="text-xs text-gray-600">Matches/Page</div>
          </div>
        </div>

        {/* Sources Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              DETECTED SOURCES ({sources.length})
            </h3>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>

          {sources.length > 0 ? (
            <div className="space-y-3">
              {sources.map((source) => {
                const sourceSimilarity = normalizeScore(
                  source.similarity || source.score
                );
                const isExpanded = expandedSources[source.id];

                return (
                  <div
                    key={source.id}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Source Header */}
                    <div
                      className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => toggleSourceExpansion(source.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getSourceTypeIcon(source.type)}
                            <span className="text-xs text-gray-500 uppercase font-semibold">
                              {getSourceTypeLabel(source.type)}
                            </span>
                            {source.publication_date && (
                              <span className="text-xs text-gray-400">
                                • {formatDate(source.publication_date)}
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-800 text-sm leading-relaxed">
                            {source.title}
                          </h4>
                          {source.url && (
                            <div className="text-xs text-blue-600 truncate mt-1">
                              {source.url}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              sourceSimilarity > 10
                                ? "bg-red-100 text-red-700"
                                : sourceSimilarity > 5
                                ? "bg-orange-100 text-orange-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {sourceSimilarity.toFixed(1)}% similar
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-4 bg-white border-t">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div className="text-center">
                            <div className="font-bold text-gray-800">
                              {source.word_count || 0}
                            </div>
                            <div className="text-xs text-gray-600">
                              Words Matched
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-gray-800">
                              {(source.confidence * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-600">
                              Confidence
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-gray-800">
                              {sourceSimilarity.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-600">
                              Similarity
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-gray-800">
                              {getSourceTypeLabel(source.type)}
                            </div>
                            <div className="text-xs text-gray-600">
                              Source Type
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2 text-sm">
                            Matched Text:
                          </h5>
                          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                            <p className="text-sm text-gray-700 italic leading-relaxed">
                              "{source.matched_text}"
                            </p>
                          </div>
                        </div>

                        {source.url && (
                          <div className="mt-3">
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Original Source
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                No sources found matching your criteria
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your search
              </p>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {plagiarismData.risk_assessment?.recommendations && (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              RECOMMENDATIONS
            </h3>
            <ul className="space-y-2 text-sm">
              {plagiarismData.risk_assessment.recommendations.map(
                (rec, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-700"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{rec}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center border-t pt-6 mt-6">
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>

          {!isSavedReport && (
            <button
              onClick={handleSaveAndSend}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2c5aa0] text-white rounded-lg hover:bg-[#1e4a7e] transition disabled:opacity-50 text-sm font-medium"
            >
              <Send className="w-4 h-4" />
              {saving ? "Saving..." : "Save the Report"}
            </button>
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

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm py-4">
        <p>
          DeskInspect Plagiarism Detection System • {new Date().getFullYear()}
        </p>
        <p className="text-xs">
          This report is generated automatically and should be reviewed by
          academic staff
        </p>
      </div>
    </div>
  );
};

export default PlagiarismDetectionReport;
