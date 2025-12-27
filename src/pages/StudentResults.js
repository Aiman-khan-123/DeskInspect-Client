import React, { useState, useEffect } from "react";
import StudentHeader from "../components/StudentHeader";
import {
  FileText,
  Download,
  Calendar,
  User,
  Cpu,
  Search,
  Shield,
  Eye,
  CheckCircle,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

const StudentResults = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadStudentReports();
  }, []);

  const loadStudentReports = async () => {
    try {
      setLoading(true);
      setMessage("");

      const user = JSON.parse(localStorage.getItem("user")) || {};
      const studentObjectId = user._id;
      const studentId = user.studentId || user.registrationNumber;

      if (!studentObjectId && !studentId) {
        setMessage("Student information not found. Please log in again.");
        setLoading(false);
        return;
      }

      let response;

      if (studentObjectId && studentObjectId.match(/^[0-9a-fA-F]{24}$/)) {
        response = await fetch(
          `http://localhost:5000/api/reports/student-reports?studentObjectId=${studentObjectId}`
        );
      } else if (studentId) {
        response = await fetch(
          `http://localhost:5000/api/reports/student-reports?studentId=${encodeURIComponent(
            studentId.trim()
          )}`
        );
      } else {
        throw new Error("No valid student identifier found");
      }

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        setReports(result.data || []);
        if (result.data && result.data.length > 0) {
          setMessage(`Found ${result.data.length} evaluation reports`);
        } else {
          setMessage(
            "No evaluation reports found yet. Your reports will appear here once your supervisor reviews and sends them."
          );
        }
      } else {
        throw new Error(result.message || "Failed to load reports");
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const getReportIcon = (reportType) => {
    switch (reportType) {
      case "ai-detection":
        return <Cpu className="w-5 h-5 text-purple-600" />;
      case "thesis-evaluation":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "plagiarism-detection":
        return <Shield className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getReportTypeName = (reportType) => {
    switch (reportType) {
      case "ai-detection":
        return "AI Content Detection";
      case "thesis-evaluation":
        return "Thesis Evaluation";
      case "plagiarism-detection":
        return "Plagiarism Detection";
      default:
        return "Evaluation Report";
    }
  };

  const getReportColor = (reportType) => {
    switch (reportType) {
      case "ai-detection":
        return "from-purple-500 to-purple-600";
      case "thesis-evaluation":
        return "from-blue-500 to-blue-600";
      case "plagiarism-detection":
        return "from-red-500 to-red-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };
  const getOverallScore = (report) => {
    if (report.reportType === "thesis-evaluation") {
      return report.reportData?.final_summary?.overall_scores?.percentage || 0;
    }
    if (report.reportType === "ai-detection") {
      const aiScore =
        report.reportData?.ai_detection?.ai_probability ||
        report.reportData?.ai_detection?.ai_score ||
        0;
      return Math.round(aiScore * 100);
    }
    if (report.reportType === "plagiarism-detection") {
      return (
        report.reportData?.plagiarism_detection?.plagiarism_score ||
        report.reportData?.plagiarism_detection?.similarity_score ||
        0
      );
    }
    return 0;
  };

  const getScoreColor = (score, reportType) => {
    if (reportType === "ai-detection") {
      if (score < 20) return "text-green-600";
      if (score < 40) return "text-blue-600";
      if (score < 60) return "text-yellow-600";
      if (score < 80) return "text-orange-600";
      return "text-red-600";
    }

    if (reportType === "plagiarism-detection") {
      if (score < 10) return "text-green-600";
      if (score < 20) return "text-blue-600";
      if (score < 30) return "text-yellow-600";
      if (score < 40) return "text-orange-600";
      return "text-red-600";
    }

    // Thesis evaluation
    if (score >= 85) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 65) return "text-yellow-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const viewReport = (report) => {
    const reportId = report._id;
    let reportPath = "";

    switch (report.reportType) {
      case "thesis-evaluation":
        reportPath = `/student/report/thesis/${reportId}`;
        break;
      case "plagiarism-detection":
        reportPath = `/student/report/plagiarism/${reportId}`;
        break;
      case "ai-detection":
        reportPath = `/student/report/ai/${reportId}`;
        break;
      default:
        reportPath = `/student/report/thesis/${reportId}`;
    }

    console.log("Opening student report:", reportPath);
    window.open(reportPath, "_blank");
  };

  const downloadReport = (report) => {
    // PDF download functionality would go here
    console.log("Downloading report:", report._id);
  };

  const filteredReports = reports.filter(
    (report) =>
      report.thesisTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <StudentHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Loading Your Reports
            </h3>
            <p className="text-gray-500">Fetching your evaluation results...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header - Consistent with Admin Portal */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-0">
              <div className="p-3 sm:p-4 bg-[#6B46C1]/10 rounded-2xl">
                <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-[#6B46C1]" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Evaluation Results
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  View all your thesis evaluation reports and feedback from
                  supervisors
                </p>
              </div>
            </div>

            <div className="text-center bg-[#6B46C1]/10 px-6 py-3 rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold text-[#6B46C1]">
                {reports.length}
              </div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </div>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reports by title or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        {/* Reports Grid - Made Wider */}
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
          {filteredReports.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-lg">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-3">
                {reports.length === 0
                  ? "No Evaluation Reports Yet"
                  : "No Matching Reports"}
              </h3>
              <p className="text-gray-500 text-lg mb-6 max-w-md mx-auto">
                {reports.length === 0
                  ? "Your evaluation reports will appear here once your supervisor reviews and sends them. Please check back later."
                  : "No reports match your search criteria. Try different keywords."}
              </p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const score = getOverallScore(report);

              return (
                <div
                  key={report._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Report Header - Using purple theme */}
                  <div className="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {getReportIcon(report.reportType)}
                        <span className="text-white font-semibold text-sm">
                          {getReportTypeName(report.reportType)}
                        </span>
                      </div>
                      {report.thesisVersion && report.thesisVersion > 1 && (
                        <div className="px-3 py-1 bg-white bg-opacity-20 rounded-full">
                          <span className="text-white text-xs font-semibold">
                            Version {report.thesisVersion}
                          </span>
                        </div>
                      )}
                      {(!report.thesisVersion ||
                        report.thesisVersion === 1) && (
                        <div className="px-3 py-1 bg-white bg-opacity-20 rounded-full">
                          <span className="text-white text-xs font-semibold">
                            Version 1
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {report.thesisTitle || "Thesis Document"}
                    </h3>

                    <div className="flex items-center justify-between text-white text-opacity-90 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(report.sentDate || report.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Report Content */}
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Report ID</div>
                          <div className="font-semibold text-gray-800 text-xs">
                            {report._id?.toString().substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
                      <button
                        onClick={() => viewReport(report)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#6B46C1] text-white rounded-lg hover:bg-[#553399] transition font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Report
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Footer Info */}
      <footer className="bg-[#F3F0FF] border-t border-[#E9E3FF] py-4 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-[#6B46C1] font-medium">
            © 2025 DeskInspect. All rights reserved. | Student Results
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StudentResults;
