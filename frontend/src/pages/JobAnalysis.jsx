import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getJobById } from "../services/jobService";
import {
  analyzeJobCandidates,
  getJobRankings,
  updateRankingStatus,
  getEmployerAnalysisAnalytics,
} from "../services/analysisService";
import RankingCard from "../components/RankingCard";
import FilterBar from "../components/FilterBar";
import SkeletonLoader from "../components/SkeletonLoader";
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
import { toast } from "react-toastify";

const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ef4444"];

const JobAnalysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [filteredRankings, setFilteredRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState("rankings");
  const [sortBy, setSortBy] = useState("rank");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const jobData = await getJobById(id);
      setJob(jobData.job);

      // Load existing rankings if available
      await loadRankings();

      // Load analytics
      try {
        const analyticsData = await getEmployerAnalysisAnalytics();
        setAnalytics(analyticsData);
      } catch (err) {
        console.log("Analytics not available");
      }
    } catch (error) {
      toast.error("Failed to load job");
      navigate("/employer/jobs");
    } finally {
      setLoading(false);
    }
  };

  const loadRankings = async (filters = {}) => {
    try {
      const rankingData = await getJobRankings(id, {
        sortBy,
        sortOrder,
        ...filters,
      });
      setRankings(rankingData.rankings || []);
      setFilteredRankings(rankingData.rankings || []);
    } catch (error) {
      console.log("No rankings available");
      setRankings([]);
      setFilteredRankings([]);
    }
  };

  const handleAnalyze = async () => {
    if (
      !window.confirm(
        "This will analyze all candidates with parsed resumes against this job. Continue?",
      )
    )
      return;

    try {
      setAnalyzing(true);
      const result = await analyzeJobCandidates(id);
      toast.success(result.message || "Analysis complete!");
      await loadRankings();

      // Refresh analytics
      try {
        const analyticsData = await getEmployerAnalysisAnalytics();
        setAnalytics(analyticsData);
      } catch (err) {}
    } catch (error) {
      toast.error(error.response?.data?.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleShortlist = async (candidate) => {
    const rankingId = candidate._id;
    if (!rankingId) return;
    try {
      await updateRankingStatus(rankingId, "shortlisted");
      toast.success("Candidate shortlisted!");
      await loadRankings();
    } catch (error) {
      toast.error("Failed to shortlist");
    }
  };

  const handleReject = async (candidate) => {
    const rankingId = candidate._id;
    if (!rankingId) return;
    try {
      await updateRankingStatus(rankingId, "rejected");
      toast.success("Candidate rejected");
      await loadRankings();
    } catch (error) {
      toast.error("Failed to reject");
    }
  };

  const handleViewAnalysis = (candidate) => {
    const rankingId = candidate._id || candidate.applicationId;
    if (rankingId) {
      navigate(`/employer/analysis/${rankingId}`);
    }
  };

  const handleFilter = (filters) => {
    loadRankings(filters);
  };

  const handleSearch = (term) => {
    const filtered = rankings.filter((r) => {
      const name = (r.candidate?.name || r.candidateName || "").toLowerCase();
      const email = (
        r.candidate?.email ||
        r.candidateEmail ||
        ""
      ).toLowerCase();
      const missingSkills = (r.missingSkills || []).join(" ").toLowerCase();
      const searchLower = term.toLowerCase();
      return (
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        missingSkills.includes(searchLower)
      );
    });
    setFilteredRankings(filtered);
  };

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    loadRankings({ sortBy: field, sortOrder: order });
  };

  const topThree = filteredRankings.filter((r) => r.rank <= 3);
  const restRankings = filteredRankings.filter((r) => r.rank > 3);

  const scoreDistributionData = analytics?.scoreDistribution
    ? [
        {
          name: "Excellent (85+)",
          value: analytics.scoreDistribution.excellent,
          color: "#10b981",
        },
        {
          name: "Strong (70-84)",
          value: analytics.scoreDistribution.strong,
          color: "#6366f1",
        },
        {
          name: "Adequate (50-69)",
          value: analytics.scoreDistribution.adequate,
          color: "#f59e0b",
        },
        {
          name: "Below (0-49)",
          value:
            analytics.scoreDistribution.belowAverage +
            analytics.scoreDistribution.poor,
          color: "#ef4444",
        },
      ].filter((d) => d.value > 0)
    : [];

  const recommendationDistData = analytics?.recommendationDistribution
    ? [
        {
          name: "Highly Rec",
          value: analytics.recommendationDistribution.highlyRecommended,
          color: "#10b981",
        },
        {
          name: "Recommended",
          value: analytics.recommendationDistribution.recommended,
          color: "#6366f1",
        },
        {
          name: "Moderate",
          value: analytics.recommendationDistribution.moderate,
          color: "#f59e0b",
        },
        {
          name: "Not Rec",
          value: analytics.recommendationDistribution.notRecommended,
          color: "#ef4444",
        },
      ].filter((d) => d.value > 0)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/30 flex items-center justify-center">
        <LoadingSpinner text="Loading analysis..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              AI Candidate Analysis
            </h1>
            <p className="text-gray-500 mt-1">
              {job?.title} at {job?.company}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/employer/jobs/${id}`}
              className="px-4 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
            >
              ← Back to Job
            </Link>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-cyan-600 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Analyze Candidates
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("rankings")}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "rankings"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Rankings ({filteredRankings.length})
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "analytics"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Rankings Tab */}
        {activeTab === "rankings" && (
          <div className="space-y-6">
            {/* Filter & Search */}
            <FilterBar
              onFilter={handleFilter}
              onSearch={handleSearch}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />

            {/* Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 text-center">
                <p className="text-2xl font-bold text-indigo-600">
                  {filteredRankings.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total Analyzed</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {
                    filteredRankings.filter((r) => r.status === "shortlisted")
                      .length
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">Shortlisted</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 text-center">
                <p className="text-2xl font-bold text-red-600">
                  {
                    filteredRankings.filter((r) => r.status === "rejected")
                      .length
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">Rejected</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {
                    filteredRankings.filter(
                      (r) => r.recommendation === "Highly Recommended",
                    ).length
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">Highly Rec</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {filteredRankings.length
                    ? Math.round(
                        filteredRankings.reduce(
                          (s, r) => s + (r.overallScore || 0),
                          0,
                        ) / filteredRankings.length,
                      )
                    : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Avg Score</p>
              </div>
            </div>

            {/* Top 3 Cards */}
            {topThree.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  🏆 Top Candidates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topThree.map((candidate) => (
                    <RankingCard
                      key={candidate._id || candidate.applicationId}
                      rank={candidate.rank}
                      candidate={candidate}
                      onViewAnalysis={handleViewAnalysis}
                      onShortlist={handleShortlist}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Rankings Table */}
            {filteredRankings.length > 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800">
                    All Candidates
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Rank
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Candidate
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Overall
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Resume
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          ATS
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Skills
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Exp
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Edu
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Recommendation
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {restRankings.map((candidate) => (
                        <tr
                          key={candidate._id || candidate.applicationId}
                          className="border-b border-gray-100 hover:bg-gray-50/50 transition-all"
                        >
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                              #{candidate.rank}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                {(
                                  candidate.candidate?.name ||
                                  candidate.candidateName ||
                                  "U"
                                ).charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-700">
                                  {candidate.candidate?.name ||
                                    candidate.candidateName ||
                                    "Unknown"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {candidate.candidate?.email ||
                                    candidate.candidateEmail ||
                                    ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`text-sm font-bold ${
                                candidate.overallScore >= 80
                                  ? "text-green-600"
                                  : candidate.overallScore >= 60
                                    ? "text-blue-600"
                                    : "text-red-600"
                              }`}
                            >
                              {candidate.overallScore || 0}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-gray-600">
                            {candidate.resumeScore || 0}
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-gray-600">
                            {candidate.atsScore || 0}
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-gray-600">
                            {candidate.skillMatch || 0}
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-gray-600">
                            {candidate.experienceMatch || 0}
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-gray-600">
                            {candidate.educationMatch || 0}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                                candidate.recommendation ===
                                "Highly Recommended"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : candidate.recommendation === "Recommended"
                                    ? "bg-blue-50 text-blue-700"
                                    : candidate.recommendation === "Moderate"
                                      ? "bg-orange-50 text-orange-700"
                                      : "bg-red-50 text-red-700"
                              }`}
                            >
                              {candidate.recommendation || "N/A"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => handleViewAnalysis(candidate)}
                                className="px-2 py-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                              >
                                View AI
                              </button>
                              {candidate.status === "analyzed" && (
                                <>
                                  <button
                                    onClick={() => handleShortlist(candidate)}
                                    className="px-2 py-1 text-[10px] font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => handleReject(candidate)}
                                    className="px-2 py-1 text-[10px] font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                                  >
                                    ✕
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50">
                <p className="text-5xl mb-4">{analyzing ? "🤖" : "📊"}</p>
                <p className="text-lg font-medium">
                  {analyzing
                    ? "AI is analyzing candidates..."
                    : "No candidates analyzed yet"}
                </p>
                <p className="text-sm mt-1">
                  {analyzing
                    ? "This may take a moment..."
                    : "Click 'Analyze Candidates' to start AI screening"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {analytics ? (
              <>
                {/* Score Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Score Distribution
                    </h3>
                    {scoreDistributionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={scoreDistributionData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {scoreDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-400">
                        No data available
                      </div>
                    )}
                  </div>

                  {/* Recommendation Distribution */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Recommendation Distribution
                    </h3>
                    {recommendationDistData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={recommendationDistData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {recommendationDistData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-400">
                        No data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                    <p className="text-sm text-gray-500">Avg Resume Score</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      {analytics.averageResumeScore || 0}
                    </p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                    <p className="text-sm text-gray-500">Avg ATS Score</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {analytics.averageAtsScore || 0}
                    </p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                    <p className="text-sm text-gray-500">Avg Overall</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {analytics.averageOverallScore || 0}
                    </p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                    <p className="text-sm text-gray-500">Total Analyzed</p>
                    <p className="text-3xl font-bold text-teal-600">
                      {analytics.totalCandidates || 0}
                    </p>
                  </div>
                </div>

                {/* Top Skills */}
                {analytics.topSkills?.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Most Missing Skills
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {analytics.topSkills.map((skill, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl border border-orange-100"
                        >
                          <span className="text-sm font-semibold text-orange-700">
                            {skill.name}
                          </span>
                          <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-bold">
                            {skill.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Candidate */}
                {analytics.topCandidate && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-200/50">
                    <h3 className="text-lg font-bold text-yellow-800 mb-2">
                      🏆 Highest Ranked Candidate
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-lg font-bold">
                        {analytics.topCandidate.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-800">
                          {analytics.topCandidate.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Score: {analytics.topCandidate.overallScore} —{" "}
                          {analytics.topCandidate.jobTitle} at{" "}
                          {analytics.topCandidate.company}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-gray-400 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50">
                <p className="text-5xl mb-4">📈</p>
                <p className="text-lg font-medium">
                  No analytics available yet
                </p>
                <p className="text-sm mt-1">
                  Analyze candidates first to see analytics
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobAnalysis;
