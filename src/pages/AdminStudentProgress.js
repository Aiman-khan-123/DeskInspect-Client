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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import AdminHeader from "../components/AdminHeader";

const statusColor = {
  "Not Submitted": "bg-gray-100 text-gray-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Submitted: "bg-blue-100 text-blue-800",
  "Under Review": "bg-purple-100 text-purple-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  Resubmit: "bg-orange-100 text-orange-800",
  "Resubmission Requested": "bg-orange-100 text-orange-800",
  Resubmitted: "bg-indigo-100 text-indigo-800",
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
  "#ffc658",
];

const AdminStudentProgress = () => {
  const [filter, setFilter] = useState("All");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'analytics'

  // Use the correct backend API URL
  const API_BASE_URL = "http://localhost:5000/api";

  const fetchStudentProgress = async (status = "All") => {
    try {
      setLoading(true);
      setError("");

      const endpoint =
        status === "All"
          ? `${API_BASE_URL}/admin/students-progress`
          : `${API_BASE_URL}/admin/students-progress/filter/${encodeURIComponent(
              status
            )}`;

      console.log(`🔄 Fetching from: ${endpoint}`);

      const response = await fetch(endpoint);

      // Check if response is HTML (error page) instead of JSON
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
        setStudents(result.data || result.students || []);
      } else {
        throw new Error(result.message || "Failed to fetch data from server");
      }
    } catch (err) {
      console.error("❌ Error fetching student progress:", err);
      setError(err.message || "Failed to load student progress data");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentProgress(filter);
  }, [filter]);

  const handleRetry = () => {
    fetchStudentProgress(filter);
  };

  // Calculate analytics data
  const statusDistribution = students.reduce((acc, student) => {
    const status = student.status || "Not Submitted";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.keys(statusDistribution).map((status) => ({
    name: status,
    value: statusDistribution[status],
    color: statusColor[status]?.split(" ")[1] || "#8884d8",
  }));

  const departmentDistribution = students.reduce((acc, student) => {
    const dept = student.department || "Unknown";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const departmentChartData = Object.keys(departmentDistribution).map(
    (dept) => ({
      name: dept,
      students: departmentDistribution[dept],
    })
  );

  const submissionTrends = students.reduce((acc, student) => {
    if (student.lastSubmission) {
      const month = new Date(student.lastSubmission).toLocaleDateString(
        "en-US",
        { month: "short" }
      );
      acc[month] = (acc[month] || 0) + 1;
    }
    return acc;
  }, {});

  const trendsData = Object.keys(submissionTrends).map((month) => ({
    month,
    submissions: submissionTrends[month],
  }));

  const uniqueStatuses = [
    "All",
    "Not Submitted",
    "Submitted",
    "Under Review",
    "Resubmit",
    "Approved",
    "Rejected",
    "Resubmission Requested",
    "Resubmitted",
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 overflow-hidden">
        <AdminHeader />
        <main className="flex-grow px-6 py-10 w-full max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B46C1] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading student progress...</p>
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
            Student Progress Tracking
          </h1>
          <p className="text-gray-600">
            Monitor thesis submission status and progress of all students
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">
                Filter by Status:
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent"
              >
                {uniqueStatuses.map((status, idx) => (
                  <option key={idx} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded border">
              Total: {students.length} students
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-white rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-[#6B46C1] text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Table View
              </button>
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
                <p className="mt-1 text-xs">
                  API Endpoint: {API_BASE_URL}/admin/students-progress
                </p>
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

        {viewMode === "table" ? (
          /* Table View */
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full text-left border">
              <thead className="bg-[#6B46C1] text-white">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student ID</th>
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Version</th>
                  <th className="py-3 px-4 font-semibold">Last Submission</th>
                  <th className="py-3 px-4 font-semibold">Thesis Status</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr
                      key={student.id || student._id}
                      className="border-t hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {student.studentId || student.id}
                      </td>
                      <td className="py-3 px-4 text-gray-800">
                        {student.fullName || student.name}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {student.email}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {student.department}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                          v{student.version || 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {formatDate(
                          student.lastSubmission || student.createdAt
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${
                            statusColor[student.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      {!error
                        ? "No students found with selected status."
                        : "No data available due to error"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Analytics View */
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Total Students
                </h3>
                <p className="text-3xl font-bold text-[#6B46C1]">
                  {students.length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Thesis Submitted
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {students.filter((s) => s.status !== "Not Submitted").length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Approved
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {students.filter((s) => s.status === "Approved").length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Pending Review
                </h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {
                    students.filter((s) =>
                      ["Pending", "Under Review", "Submitted"].includes(
                        s.status
                      )
                    ).length
                  }
                </p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution Pie Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Thesis Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
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

              {/* Department Distribution Bar Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Students by Department
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="students"
                      fill="#8884d8"
                      name="Number of Students"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Submission Trends Line Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md border lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Submission Trends
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="submissions"
                      stroke="#8884d8"
                      name="Submissions"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Progress Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statusChartData.map((status, index) => (
                  <div
                    key={status.name}
                    className="text-center p-4 border rounded-lg"
                  >
                    <div className="text-2xl font-bold text-gray-800">
                      {status.value}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {status.name}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(status.value / students.length) * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-[#F3F0FF] border-t border-[#E9E3FF] py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-[#6B46C1] font-medium">
            © 2025 DeskInspect. All rights reserved. | Admin Student Progress
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminStudentProgress;
