import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEmployerDashboard } from "../services/dashboardService";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#6366f1",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#8b5cf6",
];

const EmployerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const dashboardData = await getEmployerDashboard();
      setData(dashboardData);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/30 flex items-center justify-center">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  const { stats, charts, recentApplications } = data || {};

  const candidateDistributionData = charts?.candidateDistribution
    ? Object.entries(charts.candidateDistribution).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Employer Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your jobs and candidates
            </p>
          </div>
          <Link
            to="/employer/jobs/create"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-cyan-600 transition-all"
          >
            + Post New Job
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Jobs</p>
                <p className="text-3xl font-bold text-indigo-600 mt-1">
                  {stats?.totalJobs || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl">
                📋
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Applicants
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {stats?.totalApplicants || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                👥
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Shortlisted</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats?.shortlisted || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {stats?.rejected || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl">
                ❌
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Applications Per Job */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Applications Per Job
            </h3>
            {charts?.applicationsPerJob?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.applicationsPerJob}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: 12 }}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="applicants"
                    fill="#6366f1"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p>No data available</p>
              </div>
            )}
          </div>

          {/* Candidate Distribution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Candidate Distribution
            </h3>
            {candidateDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={candidateDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {candidateDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Skills */}
        {charts?.topSkills?.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Top Skills in Demand
            </h3>
            <div className="flex flex-wrap gap-3">
              {charts.topSkills.map((skill, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100"
                >
                  <span className="text-sm font-semibold text-indigo-700">
                    {skill.name}
                  </span>
                  <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                    {skill.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Applications */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Recent Applications
          </h3>
          {recentApplications?.length > 0 ? (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div
                  key={app._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                      {app.candidateId?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        {app.candidateId?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {app.jobId?.title} -{" "}
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        app.status === "shortlisted"
                          ? "bg-green-100 text-green-700"
                          : app.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {app.status}
                    </span>
                    <Link
                      to={`/employer/jobs/${app.jobId?._id}`}
                      className="text-sm text-indigo-600 font-medium hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-lg">No applications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
