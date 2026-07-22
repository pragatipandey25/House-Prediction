const RankingTable = ({ rankings, onShortlist, onReject }) => {
  const getRankColor = (rank) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    if (rank === 2) return "bg-gray-100 text-gray-600 border-gray-300";
    if (rank === 3) return "bg-orange-100 text-orange-700 border-orange-300";
    return "bg-gray-50 text-gray-500 border-gray-200";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getStatusBadge = (status) => {
    const badges = {
      shortlisted: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      applied: "bg-blue-100 text-blue-700",
      withdrawn: "bg-gray-100 text-gray-500",
    };
    return badges[status] || "bg-gray-100 text-gray-600";
  };

  if (!rankings || rankings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">No candidates yet</p>
        <p className="text-sm">
          Applications will appear here once candidates apply
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Candidate
            </th>
            <th className="text-center py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Overall
            </th>
            <th className="text-center py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Resume
            </th>
            <th className="text-center py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Skills
            </th>
            <th className="text-center py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Experience
            </th>
            <th className="text-center py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Education
            </th>
            <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="text-center py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((item) => (
            <tr
              key={item.applicationId}
              className="border-b border-gray-100 hover:bg-gray-50/50 transition-all"
            >
              <td className="py-4 px-4">
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold ${getRankColor(item.rank)}`}
                >
                  #{item.rank}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                    {item.candidate?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {item.candidate?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.candidate?.email || ""}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                <span
                  className={`text-lg font-bold ${getScoreColor(item.scores?.overallScore)}`}
                >
                  {item.scores?.overallScore || 0}
                </span>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="text-sm font-semibold text-gray-600">
                  {item.scores?.resumeScore || 0}
                </span>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="text-sm font-semibold text-gray-600">
                  {item.scores?.skillMatch || 0}
                </span>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="text-sm font-semibold text-gray-600">
                  {item.scores?.experienceMatch || 0}
                </span>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="text-sm font-semibold text-gray-600">
                  {item.scores?.educationMatch || 0}
                </span>
              </td>
              <td className="py-4 px-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(item.status)}`}
                >
                  {item.status}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex gap-2 justify-center">
                  {item.status === "applied" && (
                    <>
                      <button
                        onClick={() => onShortlist?.(item.applicationId)}
                        className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-all"
                      >
                        ✓ Shortlist
                      </button>
                      <button
                        onClick={() => onReject?.(item.applicationId)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-all"
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}
                  {item.status === "shortlisted" && (
                    <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                      Shortlisted ✓
                    </span>
                  )}
                  {item.status === "rejected" && (
                    <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
                      Rejected ✕
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingTable;
