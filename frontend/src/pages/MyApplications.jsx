import { useState, useEffect } from "react";
import {
  getCandidateApplications,
  withdrawApplication,
} from "../services/applicationService";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await getCandidateApplications();
      setApplications(data.applications || []);
    } catch (error) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm("Are you sure you want to withdraw this application?"))
      return;
    try {
      await withdrawApplication(id);
      toast.success("Application withdrawn");
      loadApplications();
    } catch (error) {
      toast.error("Failed to withdraw application");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: "bg-blue-100 text-blue-700",
      shortlisted: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      withdrawn: "bg-gray-100 text-gray-500",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const filteredApps =
    filter === "all"
      ? applications
      : applications.filter((app) => app.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Applications</h1>
          <p className="text-gray-500 mt-1">Track your job applications</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "applied", "shortlisted", "rejected", "withdrawn"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  filter === status
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {status}
              </button>
            ),
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner text="Loading applications..." />
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-lg font-medium">No applications found</p>
            <p className="text-sm">Apply to jobs to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app) => (
              <div
                key={app._id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {app.jobId?.title || "Job Title"}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(app.status)}`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-indigo-600 font-medium text-sm mb-2">
                      {app.jobId?.company}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span>📍 {app.jobId?.location || "N/A"}</span>
                      <span>💰 {app.jobId?.salary || "N/A"}</span>
                      <span>
                        📅 Applied:{" "}
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* AI Score */}
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">AI Score</p>
                      <span
                        className={`text-xl font-bold ${getScoreColor(app.aiScore?.overallScore)}`}
                      >
                        {app.aiScore?.overallScore || 0}
                      </span>
                    </div>

                    {/* Ranking */}
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">Ranking</p>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          app.aiScore?.ranking === "Highly Recommended"
                            ? "bg-green-100 text-green-700"
                            : app.aiScore?.ranking === "Recommended"
                              ? "bg-blue-100 text-blue-700"
                              : app.aiScore?.ranking === "Moderate"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {app.aiScore?.ranking || "N/A"}
                      </span>
                    </div>

                    {/* Resume */}
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">Resume</p>
                      <span className="text-xs text-gray-600">
                        {app.resumeId?.originalName?.substring(0, 15) || "N/A"}
                      </span>
                    </div>

                    {/* Withdraw Button */}
                    {app.status === "applied" && (
                      <button
                        onClick={() => handleWithdraw(app._id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-all"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>

                {/* Score Breakdown */}
                {app.aiScore && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Resume</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {app.aiScore.resumeScore || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Skills</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {app.aiScore.skillMatch || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Experience</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {app.aiScore.experienceMatch || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Education</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {app.aiScore.educationMatch || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">ATS</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {app.aiScore.atsScore || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
