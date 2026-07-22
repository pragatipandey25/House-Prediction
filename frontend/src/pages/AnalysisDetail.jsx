import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getRankingDetail,
  updateRankingStatus,
} from "../services/analysisService";
import LoadingSpinner from "../components/LoadingSpinner";
import ProgressBar from "../components/ProgressBar";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const AnalysisDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    try {
      const data = await getRankingDetail(id);
      setRanking(data.ranking);
    } catch (error) {
      toast.error("Failed to load analysis");
      navigate("/employer/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async () => {
    try {
      await updateRankingStatus(id, "shortlisted");
      toast.success("Candidate shortlisted!");
      loadDetail();
    } catch (error) {
      toast.error("Failed to shortlist");
    }
  };

  const handleReject = async () => {
    try {
      await updateRankingStatus(id, "rejected");
      toast.success("Candidate rejected");
      loadDetail();
    } catch (error) {
      toast.error("Failed to reject");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/30 flex items-center justify-center">
        <LoadingSpinner text="Loading analysis..." />
      </div>
    );
  }

  if (!ranking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/30 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Analysis not found</p>
      </div>
    );
  }

  const candidate = ranking.candidate || {};
  const resume = ranking.resume || {};
  const job = ranking.job || {};

  const scores = [
    {
      label: "Resume Score",
      value: ranking.resumeScore,
      color: "indigo",
      icon: "📊",
    },
    { label: "ATS Score", value: ranking.atsScore, color: "blue", icon: "⚡" },
    {
      label: "Skill Match",
      value: ranking.skillMatch,
      color: "purple",
      icon: "💻",
    },
    {
      label: "Experience Match",
      value: ranking.experienceMatch,
      color: "orange",
      icon: "💼",
    },
    {
      label: "Education Match",
      value: ranking.educationMatch,
      color: "green",
      icon: "🎓",
    },
    {
      label: "Certification",
      value: ranking.certificationScore,
      color: "teal",
      icon: "📜",
    },
    {
      label: "Communication",
      value: ranking.communicationScore,
      color: "cyan",
      icon: "💬",
    },
    {
      label: "Leadership",
      value: ranking.leadershipScore,
      color: "pink",
      icon: "👑",
    },
  ];

  const getRecommendationStyle = () => {
    const styles = {
      "Highly Recommended": "bg-emerald-50 text-emerald-700 border-emerald-300",
      Recommended: "bg-blue-50 text-blue-700 border-blue-300",
      Moderate: "bg-orange-50 text-orange-700 border-orange-300",
      "Not Recommended": "bg-red-50 text-red-700 border-red-300",
    };
    return (
      styles[ranking.recommendation] ||
      "bg-gray-50 text-gray-600 border-gray-300"
    );
  };

  const getRankBadge = () => {
    if (ranking.rank === 1) return "🥇 Gold";
    if (ranking.rank === 2) return "🥈 Silver";
    if (ranking.rank === 3) return "🥉 Bronze";
    return `#${ranking.rank}`;
  };

  const parsedData = resume?.parsedData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back & Actions */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to={`/employer/jobs/${job._id}/analyze`}
            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm font-medium">Back to Rankings</span>
          </Link>

          <div className="flex gap-2">
            {ranking.status === "analyzed" && (
              <>
                <button
                  onClick={handleShortlist}
                  className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-all"
                >
                  ✓ Shortlist
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-all"
                >
                  ✕ Reject
                </button>
              </>
            )}
            {ranking.status === "shortlisted" && (
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium">
                ✅ Shortlisted
              </span>
            )}
            {ranking.status === "rejected" && (
              <span className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium">
                ❌ Rejected
              </span>
            )}
          </div>
        </div>

        {/* Candidate Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
              {candidate.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800">
                  {candidate.name || "Unknown"}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRecommendationStyle()}`}
                >
                  {ranking.recommendation || "N/A"}
                </span>
              </div>
              <p className="text-gray-500">{candidate.email || ""}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span>
                  📍 Rank: <strong>{getRankBadge()}</strong>
                </span>
                <span>
                  🎯 Overall:{" "}
                  <strong className="text-indigo-600">
                    {ranking.overallScore || 0}
                  </strong>
                </span>
                <span>
                  💼 {job.title} at {job.company}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {resume.fileUrl && (
                <a
                  href={resume.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-all"
                >
                  📄 Download Resume
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Scores */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Grid */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                AI Score Breakdown
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {scores.map((score) => (
                  <div
                    key={score.label}
                    className="bg-gray-50 rounded-xl p-4 text-center"
                  >
                    <span className="text-2xl mb-1 block">{score.icon}</span>
                    <p className="text-2xl font-bold text-gray-800">
                      {score.value || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{score.label}</p>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          score.value >= 80
                            ? "bg-green-500"
                            : score.value >= 60
                              ? "bg-blue-500"
                              : score.value >= 40
                                ? "bg-orange-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${score.value || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50">
                <h3 className="text-lg font-bold text-green-800 mb-4">
                  ✅ Strengths
                </h3>
                {ranking.strengths?.length > 0 ? (
                  <ul className="space-y-2">
                    {ranking.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-green-700"
                      >
                        <span className="text-green-500 mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-green-600 text-sm">
                    No strengths identified
                  </p>
                )}
              </div>

              <div className="bg-red-50/80 backdrop-blur-sm rounded-2xl p-6 border border-red-200/50">
                <h3 className="text-lg font-bold text-red-800 mb-4">
                  ⚠️ Weaknesses
                </h3>
                {ranking.weaknesses?.length > 0 ? (
                  <ul className="space-y-2">
                    {ranking.weaknesses.map((w, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-red-700"
                      >
                        <span className="text-red-500 mt-0.5">•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-red-600 text-sm">
                    No weaknesses identified
                  </p>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            {ranking.missingSkills?.length > 0 && (
              <div className="bg-orange-50/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/50">
                <h3 className="text-lg font-bold text-orange-800 mb-4">
                  🔧 Missing Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {ranking.missingSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-orange-200 text-orange-800 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {ranking.recommendations?.length > 0 && (
              <div className="bg-blue-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50">
                <h3 className="text-lg font-bold text-blue-800 mb-4">
                  💡 Recommendations
                </h3>
                <ul className="space-y-2">
                  {ranking.recommendations.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-blue-700"
                    >
                      <span className="text-blue-500 mt-0.5">→</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right - Candidate Details */}
          <div className="space-y-6">
            {/* Parsed Resume Data */}
            {parsedData && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  📄 Parsed Resume
                </h2>

                <div className="space-y-4">
                  {parsedData.name && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">
                        Name
                      </p>
                      <p className="text-gray-800 font-medium">
                        {parsedData.name}
                      </p>
                    </div>
                  )}
                  {parsedData.email && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">
                        Email
                      </p>
                      <p className="text-gray-800">{parsedData.email}</p>
                    </div>
                  )}
                  {parsedData.phone && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">
                        Phone
                      </p>
                      <p className="text-gray-800">{parsedData.phone}</p>
                    </div>
                  )}

                  {parsedData.skills?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                        Skills ({parsedData.skills.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {parsedData.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsedData.experience?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                        Experience
                      </p>
                      {parsedData.experience.map((exp, i) => (
                        <div key={i} className="p-2 bg-gray-50 rounded-lg mb-1">
                          <p className="text-sm font-medium text-gray-700">
                            {exp.role || exp.company || "Role"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {exp.company} — {exp.duration}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {parsedData.education?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                        Education
                      </p>
                      {parsedData.education.map((edu, i) => (
                        <div key={i} className="p-2 bg-gray-50 rounded-lg mb-1">
                          <p className="text-sm font-medium text-gray-700">
                            {edu.degree}
                          </p>
                          <p className="text-xs text-gray-400">
                            {edu.institution} — {edu.year}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {parsedData.certifications?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                        Certifications
                      </p>
                      {parsedData.certifications.map((cert, i) => (
                        <div key={i} className="p-2 bg-gray-50 rounded-lg mb-1">
                          <p className="text-sm font-medium text-gray-700">
                            {cert.name}
                          </p>
                          <p className="text-xs text-gray-400">{cert.issuer}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {parsedData.projects?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                        Projects
                      </p>
                      {parsedData.projects.map((proj, i) => (
                        <div key={i} className="p-2 bg-gray-50 rounded-lg mb-1">
                          <p className="text-sm font-medium text-gray-700">
                            {proj.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {proj.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {parsedData.languages?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                        Languages
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {parsedData.languages.map((lang, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded text-xs font-medium"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Job Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Job Details
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Title</span>
                  <span className="font-medium text-gray-700">
                    {job.title || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Company</span>
                  <span className="font-medium text-gray-700">
                    {job.company || "N/A"}
                  </span>
                </div>
                {job.requiredSkills?.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">
                      Required Skills
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {job.requiredSkills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetail;
