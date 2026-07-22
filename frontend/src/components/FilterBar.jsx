import { useState } from "react";

const FilterBar = ({ onFilter, onSearch, onSort, sortBy, sortOrder }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    minScore: "",
    skills: "",
    experience: "",
    education: "",
    recommendation: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    onFilter?.(filters);
  };

  const resetFilters = () => {
    setFilters({
      minScore: "",
      skills: "",
      experience: "",
      education: "",
      recommendation: "",
    });
    setSearchTerm("");
    onFilter?.({});
    onSearch?.("");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(searchTerm);
  };

  const handleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === "desc" ? "asc" : "desc";
    onSort?.(field, newOrder);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return "↕";
    return sortOrder === "desc" ? "↓" : "↑";
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or skill..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              isExpanded
                ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>
        </form>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="p-4 bg-gray-50/50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Min Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={(e) => handleFilterChange("minScore", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Skills
              </label>
              <input
                type="text"
                value={filters.skills}
                onChange={(e) => handleFilterChange("skills", e.target.value)}
                placeholder="React, Node.js..."
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Min Experience Match
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.experience}
                onChange={(e) =>
                  handleFilterChange("experience", e.target.value)
                }
                placeholder="0"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Min Education Match
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.education}
                onChange={(e) =>
                  handleFilterChange("education", e.target.value)
                }
                placeholder="0"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Recommendation
              </label>
              <select
                value={filters.recommendation}
                onChange={(e) =>
                  handleFilterChange("recommendation", e.target.value)
                }
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="">All</option>
                <option value="Highly Recommended">Highly Recommended</option>
                <option value="Recommended">Recommended</option>
                <option value="Moderate">Moderate</option>
                <option value="Not Recommended">Not Recommended</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={applyFilters}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="px-5 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-300 transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-500 mr-1">Sort by:</span>
        {[
          { field: "rank", label: "Rank" },
          { field: "overallScore", label: "Overall" },
          { field: "resumeScore", label: "Resume" },
          { field: "atsScore", label: "ATS" },
          { field: "newest", label: "Newest" },
          { field: "oldest", label: "Oldest" },
        ].map(({ field, label }) => (
          <button
            key={field}
            onClick={() => handleSort(field)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              sortBy === field
                ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {label} {getSortIcon(field)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
