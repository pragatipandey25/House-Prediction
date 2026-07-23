const RankingCard = ({
  rank,
  candidate,
  onViewAnalysis,
  onShortlist,
  onReject,
}) => {
  const getRankBadge = () => {
    if (rank === 1) {
      return {
        emoji: "🥇",
        bg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
        shadow: "shadow-yellow-200",
        border: "border-yellow-300",
        text: "text-yellow-700",
      };
    }
    if (rank === 2) {
      return {
        emoji: "🥈",
        bg: "bg-gradient-to-br from-gray-300 to-gray-500",
        shadow: "shadow-gray-200",
        border: "border-gray-300",
        text: "text-gray-600",
      };
    }
    if (rank === 3) {
      return {
        emoji: "🥉",
        bg: "bg-gradient-to-br from-orange-400 to-orange-600",
        shadow: "shadow-orange-200",
        border: "border-orange-300",
        text: "text-orange-700",
      };
    }
    return {
      emoji: `#${rank}`,
      bg: "bg-gray-100",
      shadow: "",
      border: "border-gray-200",
      text: "text-gray-500",
    };
  };

  const badge = getRankBadge();

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getStatusBadge = () => {
    const statuses = {
      shortlisted: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
      analyzed: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return statuses[candidate?.status] || statuses.analyzed;
  };

  const getRecommendationBadge = () => {
    const recs = {
      "Highly Recommended": "bg-emerald-50 text-emerald-700 border-emerald-200",
      Recommended: "bg-blue-50 text-blue-700 border-blue-200",
      Moderate: "bg-orange-50 text-orange-700 border-orange-200",
      "Not Recommended": "bg-red-50 text-red-700 border-red-200",
    };
    return recs[candidate?.recommendation] || recs.Moderate;
  };

  return (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-2xl p-5 border-2 ${badge.border} ${badge.shadow} shadow-lg hover:shadow-xl transition-all`}
    >
      <div className="flex items-start gap-4">
        {/* Rank Badge */}
        <div
          className={`w-14 h-14 rounded-2xl ${badge.bg} flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0`}
        >
          {badge.emoji}
        </div>

        {/* Candidate Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-800 truncate">
              {candidate?.candidate?.name ||
                candidate?.candidateName ||
                "Unknown"}
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getRecommendationBadge()}`}
            >
              {candidate?.recommendation || "N/A"}
            </span>
          </div>
          <p className="text-sm text-gray-400 truncate">
            {candidate?.candidate?.email || candidate?.candidateEmail || ""}
          </p>

          {/* Score Bars */}
          <div className="mt-3 grid grid-cols-5 gap-2">
            {[
              { label: "Overall", value: candidate?.overallScore || 0 },
              { label: "Resume", value: candidate?.resumeScore || 0 },
              { label: "ATS", value: candidate?.atsScore || 0 },
              { label: "Skills", value: candidate?.skillMatch || 0 },
              { label: "Exp", value: candidate?.experienceMatch || 0 },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div
                  className={`text-lg font-bold ${getScoreColor(item.value)}`}
                >
                  {item.value}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {item.label}
                </div>
                <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.value >= 80
                        ? "bg-green-500"
                        : item.value >= 60
                          ? "bg-blue-500"
                          : item.value >= 40
                            ? "bg-orange-500"
                            : "bg-red-500"
                    }`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusBadge()}`}
          >
            {candidate?.status || "Analyzed"}
          </span>
          {candidate?.resumeOriginalName && (
            <a
              href={candidate?.resumeFileUrl || candidate?.resume?.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              📄 View Resume
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewAnalysis?.(candidate)}
            className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all"
          >
            AI Analysis
          </button>
          {candidate?.status === "analyzed" && (
            <>
              <button
                onClick={() => onShortlist?.(candidate)}
                className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all"
              >
                ✓ Shortlist
              </button>
              <button
                onClick={() => onReject?.(candidate)}
                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
              >
                ✕ Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingCard;
