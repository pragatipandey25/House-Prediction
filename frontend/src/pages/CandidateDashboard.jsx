import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCandidateDashboard } from "../services/dashboardService";
import ScoreCard from "../components/ScoreCard";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";

const CandidateDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const dashboardData = await getCandidateDashboard();
      setData(dashboardData);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/30 flex items-center justify-center">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  const { resume, applications, stats } = data || {};
  const hasResume = resume && resume.aiScore?.resumeScore > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Candidate Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Track your career progress and AI insights
          </p>
        </div>

        {/* Resume Status */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                📄 Resume Status
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {resume
                  ? `Last uploaded: ${resume.originalName}`
                  : "No resume uploaded yet"}
              </p>
            </div>
            <Link
              to="/candidate/resume"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-cyan-600 transition-all"
            >
              {resume ? "Update Resume" : "Upload Resume"}
            </Link>
          </div>
          {resume && (
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  resume.status === "analyzed"
                    ? "bg-green-100 text-green-700"
                    : resume.status === "parsed"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {resume.status}
              </span>
              <span className="text-xs text-gray-400">
                {resume.originalName}
              </span>
            </div>
          )}
        </div>

        {/* AI Score Cards */}
        {hasResume && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <ScoreCard
              label="Resume Score"
              score={stats.resumeScore}
              color="indigo"
              icon="📊"
            />
            <ScoreCard
              label="ATS Score"
              score={stats.atsScore}
              color="blue"
              icon="⚡"
            />
            <ScoreCard
              label="Applied"
              score={applications?.applied || 0}
              color="purple"
              icon="📋"
            />
            <ScoreCard
              label="Shortlisted"
              score={applications?.shortlisted || 0}
              color="green"
              icon="✅"
            />
            <ScoreCard
              label="Rejected"
              score={applications?.rejected || 0}
              color="red"
              icon="❌"
            />
            <ScoreCard
              label="Total"
              score={applications?.total || 0}
              color="teal"
              icon="📈"
            />
          </div>
        )}

        {/* Missing Skills & Recommendations */}
        {hasResume && stats.missingSkills?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                🔧 Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {stats.missingSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                💡 Recommendations
              </h3>
              <ul className="space-y-2">
                {stats.recommendations?.map((rec, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="text-indigo-500 mt-0.5">→</span>
                    {rec}
                  </li>
                )) || (
                  <p className="text-gray-400 text-sm">
                    No recommendations yet
                  </p>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Strengths & Weaknesses */}
        {hasResume && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50">
              <h3 className="text-lg font-bold text-green-800 mb-4">
                ✅ Strengths
              </h3>
              <ul className="space-y-2">
                {stats.strengths?.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-green-700"
                  >
                    <span className="text-green-500">•</span>
                    {s}
                  </li>
                )) || (
                  <p className="text-green-600 text-sm">
                    No strengths identified yet
                  </p>
                )}
              </ul>
            </div>

            <div className="bg-red-50/80 backdrop-blur-sm rounded-2xl p-6 border border-red-200/50">
              <h3 className="text-lg font-bold text-red-800 mb-4">
                ⚠️ Areas to Improve
              </h3>
              <ul className="space-y-2">
                {stats.weaknesses?.map((w, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-red-700"
                  >
                    <span className="text-red-500">•</span>
                    {w}
                  </li>
                )) || (
                  <p className="text-red-600 text-sm">
                    No weaknesses identified yet
                  </p>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Recent Applications */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              📋 Recent Applications
            </h2>
            <Link
              to="/candidate/applications"
              className="text-sm text-indigo-600 font-medium hover:underline"
            >
              View All
            </Link>
          </div>

          {!applications?.list || applications.list.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-lg">No applications yet</p>
              <Link
                to="/candidate/jobs"
                className="text-indigo-600 font-medium hover:underline text-sm"
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.list.slice(0, 5).map((app) => (
                <div
                  key={app._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      {app.jobId?.title || "Job Title"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {app.jobId?.company} - {app.jobId?.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(app.status)}`}
                    >
                      {app.status}
                    </span>
                    <span className="text-sm font-bold text-gray-600">
                      {app.aiScore?.overallScore || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
