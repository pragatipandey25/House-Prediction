const ProgressBar = ({
  value,
  max = 100,
  label,
  showValue = true,
  color = "indigo",
  size = "md",
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getColorClass = () => {
    if (color !== "auto") {
      const colors = {
        indigo: "bg-indigo-500",
        green: "bg-green-500",
        blue: "bg-blue-500",
        purple: "bg-purple-500",
        orange: "bg-orange-500",
        red: "bg-red-500",
        teal: "bg-teal-500",
        cyan: "bg-cyan-500",
      };
      return colors[color] || colors.indigo;
    }

    // Auto color based on percentage
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getLabelColorClass = () => {
    if (color !== "auto") return "text-gray-600";
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const sizeClasses = size === "sm" ? "h-1.5" : size === "lg" ? "h-4" : "h-2.5";

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs font-medium text-gray-500">{label}</span>
          )}
          {showValue && (
            <span className={`text-xs font-bold ${getLabelColorClass()}`}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-gray-100 rounded-full overflow-hidden ${sizeClasses}`}
      >
        <div
          className={`${sizeClasses} rounded-full transition-all duration-500 ease-out ${getColorClass()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
