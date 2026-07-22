const ScoreCard = ({ label, score, color = "indigo", size = "md", icon }) => {
  const getColorClasses = () => {
    const colors = {
      indigo: {
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        ring: "ring-indigo-200",
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-600",
        ring: "ring-green-200",
      },
      blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-200" },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        ring: "ring-purple-200",
      },
      orange: {
        bg: "bg-orange-50",
        text: "text-orange-600",
        ring: "ring-orange-200",
      },
      red: { bg: "bg-red-50", text: "text-red-600", ring: "ring-red-200" },
      teal: { bg: "bg-teal-50", text: "text-teal-600", ring: "ring-teal-200" },
    };
    return colors[color] || colors.indigo;
  };

  const colors_ = getColorClasses();
  const sizeClasses =
    size === "lg" ? "w-24 h-24 text-2xl" : "w-20 h-20 text-xl";

  // Determine color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return { from: "from-green-400", to: "to-green-600" };
    if (score >= 60) return { from: "from-blue-400", to: "to-blue-600" };
    if (score >= 40) return { from: "from-orange-400", to: "to-orange-600" };
    return { from: "from-red-400", to: "to-red-600" };
  };

  const gradient = getScoreColor(score);

  return (
    <div
      className={`${colors_.bg} rounded-2xl p-4 flex flex-col items-center gap-2 backdrop-blur-sm border border-white/20`}
    >
      {icon && <span className="text-2xl">{icon}</span>}
      <div
        className={`${sizeClasses} rounded-full bg-gradient-to-br ${gradient.from} ${gradient.to} flex items-center justify-center text-white font-bold shadow-lg`}
      >
        {score || 0}
      </div>
      <p className={`text-sm font-semibold ${colors_.text} text-center`}>
        {label}
      </p>
    </div>
  );
};

export default ScoreCard;
