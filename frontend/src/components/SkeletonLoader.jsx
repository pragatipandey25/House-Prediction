const SkeletonLoader = ({ type = "card", count = 3 }) => {
  const getSkeleton = () => {
    switch (type) {
      case "table":
        return (
          <div className="space-y-3">
            {[...Array(count)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 animate-pulse"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
                <div className="h-8 bg-gray-200 rounded w-16" />
                <div className="h-8 bg-gray-200 rounded w-16" />
                <div className="h-8 bg-gray-200 rounded w-16" />
                <div className="h-8 bg-gray-200 rounded w-16" />
                <div className="h-8 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        );
      case "card":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(count)].map((_, i) => (
              <div
                key={i}
                className="bg-white/80 rounded-2xl p-6 border border-gray-200/50 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-8 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        );
      case "chart":
        return (
          <div className="bg-white/80 rounded-2xl p-6 border border-gray-200/50 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
            <div className="h-[300px] bg-gray-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        );
      case "list":
        return (
          <div className="space-y-3">
            {[...Array(count)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-200 rounded-full" />
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        );
    }
  };

  return getSkeleton();
};

export default SkeletonLoader;
