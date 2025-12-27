// src/pages/admin/AdminReports.js - UPDATED VERSION
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AdminHeader from "../components/AdminHeader";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
  "#ffc658",
];

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("month");
  const [reportType, setReportType] = useState("all");
  const [viewMode, setViewMode] = useState("analytics"); // 'analytics' or 'detailed'
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [facultyMap, setFacultyMap] = useState({}); // Map faculty IDs to names

  const API_BASE_URL = "http://localhost:5000/api";

  // Fetch faculty data to map IDs to names
  const fetchFacultyData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/faculty`);
      const result = await response.json();

      if (result.success) {
        const facultyMapping = {};
        result.data.forEach((faculty) => {
          facultyMapping[faculty._id] =
            faculty.fullName ||
            faculty.name ||
            `Faculty ${faculty._id.slice(-4)}`;
        });
        setFacultyMap(facultyMapping);
      }
    } catch (err) {
      console.error("Error fetching faculty data:", err);
      // If faculty API fails, create a default mapping
      const defaultFacultyMap = {};
      reports.forEach((report) => {
        if (report.facultyId && !defaultFacultyMap[report.facultyId]) {
          defaultFacultyMap[
            report.facultyId
          ] = `Faculty ${report.facultyId.slice(-4)}`;
        }
      });
      setFacultyMap(defaultFacultyMap);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const endpoint = `${API_BASE_URL}/admin/reports?timeRange=${timeRange}&reportType=${reportType}&page=${currentPage}`;

      console.log(`🔄 Fetching reports from: ${endpoint}`);

      const response = await fetch(endpoint);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("❌ Received non-JSON response:", text.substring(0, 200));
        throw new Error(
          "Server returned HTML instead of JSON. Check API endpoint."
        );
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setReports(result.reports || []);
        setAnalytics(result.analytics || {});

        // Fetch faculty data after reports are loaded
        await fetchFacultyData();
      } else {
        throw new Error(
          result.message || "Failed to fetch reports from server"
        );
      }
    } catch (err) {
      console.error("❌ Error fetching reports:", err);
      setError(err.message || "Failed to load reports data");
      setReports([]);
      setAnalytics({});
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/reports/analytics?timeRange=${timeRange}`
      );
      const result = await response.json();

      if (result.success) {
        setAnalytics(result.analytics || {});
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [timeRange, reportType, currentPage]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const handleRetry = () => {
    fetchReports();
    fetchAnalytics();
  };

  // Get faculty name from ID
  const getFacultyName = (facultyId) => {
    return (
      facultyMap[facultyId] || `Faculty ${facultyId?.slice(-4) || "Unknown"}`
    );
  };

  // Process data for charts
  const reportTrendsData = analytics.monthlyTrends || [];

  const reportTypeData = analytics.reportTypeDistribution
    ? Object.keys(analytics.reportTypeDistribution).map((type) => ({
        name: type.replace("-", " ").toUpperCase(),
        count: analytics.reportTypeDistribution[type],
      }))
    : [];

  // Update faculty activity data with names
  const facultyActivityData = (analytics.facultyActivity || []).map(
    (faculty) => ({
      name: getFacultyName(faculty.facultyId),
      ...faculty,
    })
  );

  const statusDistributionData = analytics.statusDistribution
    ? Object.keys(analytics.statusDistribution).map((status) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: analytics.statusDistribution[status],
      }))
    : [];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Get report metrics for display in details
  const getReportMetrics = (report) => {
    const metrics = [];

    if (report.reportType === "thesis-evaluation" && report.reportData?.score) {
      metrics.push(`Score: ${report.reportData.score}%`);
    }

    if (
      report.reportType === "plagiarism-detection" &&
      report.reportData?.similarityPercentage
    ) {
      metrics.push(`Similarity: ${report.reportData.similarityPercentage}%`);
    }

    if (
      report.reportType === "ai-detection" &&
      report.reportData?.aiProbability
    ) {
      metrics.push(`AI Probability: ${report.reportData.aiProbability}%`);
    }

    return metrics.length > 0 ? metrics.join(", ") : "No metrics available";
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 overflow-hidden">
        <AdminHeader />
        <main className="flex-grow px-6 py-10 w-full max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B46C1] mx-auto"></div>
              <p className="mt-4 text-gray-600">
                Loading reports and analytics...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-hidden">
      <AdminHeader />

      <main className="flex-grow px-6 py-10 w-full max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Reports & Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive analysis of thesis evaluations, plagiarism checks, and
            AI detection reports
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">
                Time Range:
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">
                Report Type:
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="thesis-evaluation">Thesis Evaluation</option>
                <option value="plagiarism-detection">
                  Plagiarism Detection
                </option>
                <option value="ai-detection">AI Detection</option>
              </select>
            </div>

            <div className="flex bg-white rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => setViewMode("analytics")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "analytics"
                    ? "bg-[#6B46C1] text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Analytics View
              </button>
              <button
                onClick={() => setViewMode("detailed")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "detailed"
                    ? "bg-[#6B46C1] text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Detailed View
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded border">
              Total: {analytics.totalReports || reports.length} reports
            </div>

            <button
              onClick={handleRetry}
              className="bg-[#6B46C1] text-white px-4 py-2 rounded text-sm hover:bg-[#553399] transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <div className="flex justify-between items-center">
              <div>
                <strong>Error loading data:</strong>
                <p className="mt-1 text-sm">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 whitespace-nowrap"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {viewMode === "analytics" ? (
          /* Analytics View */
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Total Reports
                </h3>
                <p className="text-3xl font-bold text-[#6B46C1]">
                  {analytics.totalReports || 0}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Thesis Evaluations
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {analytics.summary?.thesisEvaluations ||
                    reportTypeData.find((r) => r.name === "THESIS EVALUATION")
                      ?.count ||
                    0}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Plagiarism Checks
                </h3>
                <p className="text-3xl font-bold text-orange-600">
                  {analytics.summary?.plagiarismChecks ||
                    reportTypeData.find(
                      (r) => r.name === "PLAGIARISM DETECTION"
                    )?.count ||
                    0}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  AI Detections
                </h3>
                <p className="text-3xl font-bold text-purple-600">
                  {analytics.summary?.aiDetections ||
                    reportTypeData.find((r) => r.name === "AI DETECTION")
                      ?.count ||
                    0}
                </p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Report Trends */}
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Report Generation Trends
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={reportTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="Total Reports"
                    />
                    <Area
                      type="monotone"
                      dataKey="thesis-evaluation"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Thesis Evaluation"
                    />
                    <Area
                      type="monotone"
                      dataKey="plagiarism-detection"
                      stackId="3"
                      stroke="#ffc658"
                      fill="#ffc658"
                      name="Plagiarism Detection"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Report Type Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Report Type Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {reportTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Faculty Activity */}
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Top Faculty Report Activity
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={facultyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="thesis-evaluation"
                      stackId="a"
                      fill="#8884d8"
                      name="Thesis"
                    />
                    <Bar
                      dataKey="plagiarism-detection"
                      stackId="a"
                      fill="#82ca9d"
                      name="Plagiarism"
                    />
                    <Bar
                      dataKey="ai-detection"
                      stackId="a"
                      fill="#ffc658"
                      name="AI Detection"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Status Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Report Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="value"
                      fill="#8884d8"
                      name="Number of Reports"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quality Metrics */}
            {analytics.qualityMetrics && (
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Quality Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h4 className="font-medium text-gray-600 mb-2">
                      Thesis Evaluation Scores
                    </h4>
                    <p className="text-2xl font-bold text-[#6B46C1]">
                      {analytics.qualityMetrics.avgThesisScores?.average || 0}%
                    </p>
                    <p className="text-sm text-gray-500">
                      Average Score (
                      {analytics.qualityMetrics.avgThesisScores
                        ?.totalEvaluated || 0}{" "}
                      evaluated)
                    </p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium text-gray-600 mb-2">
                      Plagiarism Similarity
                    </h4>
                    <p className="text-2xl font-bold text-orange-600">
                      {analytics.qualityMetrics.plagiarismStats
                        ?.averageSimilarity || 0}
                      %
                    </p>
                    <p className="text-sm text-gray-500">
                      Average Similarity (
                      {analytics.qualityMetrics.plagiarismStats?.totalChecked ||
                        0}{" "}
                      checked)
                    </p>
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium text-gray-600 mb-2">
                      AI Detection Probability
                    </h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {analytics.qualityMetrics.aiDetectionStats
                        ?.averageProbability || 0}
                      %
                    </p>
                    <p className="text-sm text-gray-500">
                      Average Probability (
                      {analytics.qualityMetrics.aiDetectionStats
                        ?.totalChecked || 0}{" "}
                      checked)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Detailed View */
          <div className="space-y-6">
            {/* Reports Table */}
            <div className="bg-white rounded-lg shadow-md border overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-700">
                  Detailed Reports
                </h3>
                <p className="text-sm text-gray-600">
                  Individual report records with detailed information
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report ID
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Faculty
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thesis Title
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.length > 0 ? (
                      reports.map((report) => (
                        <tr
                          key={report._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {report.reportId}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">
                                {report.studentName}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {report.studentId}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                report.reportType === "thesis-evaluation"
                                  ? "bg-blue-100 text-blue-800"
                                  : report.reportType === "plagiarism-detection"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {report.reportType
                                .replace("-", " ")
                                .toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {getFacultyName(report.facultyId)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {report.thesisTitle || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                report.status === "sent"
                                  ? "bg-green-100 text-green-800"
                                  : report.status === "saved"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {report.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {formatDate(report.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="text-[#6B46C1] hover:text-[#553399] font-medium text-sm"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="py-8 text-center text-gray-500"
                        >
                          No reports found with the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {reports.length > 0 && (
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    Showing page {currentPage}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Report Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Report Details
                  </h3>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Report ID
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedReport.reportId}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Report Type
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedReport.reportType
                        .replace("-", " ")
                        .toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Student
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedReport.studentName} ({selectedReport.studentId})
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Faculty
                    </label>
                    <p className="text-sm text-gray-900">
                      {getFacultyName(selectedReport.facultyId)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedReport.status.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Created Date
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedReport.createdAt)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">
                      Thesis Title
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedReport.thesisTitle || "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">
                      Report Metrics
                    </label>
                    <p className="text-sm text-gray-900">
                      {getReportMetrics(selectedReport)}
                    </p>
                  </div>
                </div>

                {selectedReport.reportData && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Report Data
                    </label>
                    <pre className="text-sm bg-gray-50 p-4 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(selectedReport.reportData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              <div className="p-6 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-[#6B46C1] text-white rounded text-sm hover:bg-[#553399]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-[#F3F0FF] border-t border-[#E9E3FF] py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-[#6B46C1] font-medium">
            © 2025 DeskInspect. All rights reserved. | Admin Reports
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminReports;
