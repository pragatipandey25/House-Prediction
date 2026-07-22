import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getJobs } from "../services/jobService";
import { getResumes } from "../services/resumeService";
import { applyForJob } from "../services/applicationService";
import JobCard from "../components/JobCard";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const BrowseJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedResume, setSelectedResume] = useState("");
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadJobs();
    loadResumes();
  }, [page, search, skillFilter, locationFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 9 };
      if (search) params.search = search;
      if (skillFilter) params.skills = skillFilter;
      if (locationFilter) params.location = locationFilter;

      const data = await getJobs(params);
      setJobs(data.jobs || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadResumes = async () => {
    try {
      const data = await getResumes();
      setResumes(data.resumes || []);
    } catch (error) {
      console.error("Failed to load resumes:", error);
    }
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setSelectedResume(resumes[0]?._id || "");
    setShowApplyModal(true);
  };

  const handleApply = async () => {
    if (!selectedResume) {
      toast.error("Please upload a resume first");
      return;
    }
    try {
      setApplying(true);
      await applyForJob(selectedJob._id, selectedResume);
      toast.success("Application submitted successfully!");
      setShowApplyModal(false);
      setSelectedJob(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Application failed");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Browse Jobs</h1>
          <p className="text-gray-500 mt-1">Find your next opportunity</p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="🔍 Search jobs..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="💻 Filter by skills..."
              value={skillFilter}
              onChange={(e) => {
                setSkillFilter(e.target.value);
                setPage(1);
              }}
              className="p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="📍 Filter by location..."
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setPage(1);
              }}
              className="p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => {
                setSearch("");
                setSkillFilter("");
                setLocationFilter("");
                setPage(1);
              }}
              className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner text="Loading jobs..." />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-lg font-medium">No jobs found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job._id} className="relative">
                  <JobCard job={job} userRole="candidate" />
                  <div className="mt-3">
                    <button
                      onClick={() => handleApplyClick(job)}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-cyan-600 transition-all"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium ${
                        page === p
                          ? "bg-indigo-600 text-white"
                          : "bg-white border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Apply for Job
            </h3>
            <p className="text-gray-600 mb-4">
              <strong>{selectedJob.title}</strong> at {selectedJob.company}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Resume
              </label>
              {resumes.length === 0 ? (
                <div className="p-3 bg-yellow-50 rounded-xl text-sm text-yellow-700">
                  No resume found. Please{" "}
                  <Link
                    to="/candidate/resume"
                    className="font-semibold underline"
                  >
                    upload your resume
                  </Link>{" "}
                  first.
                </div>
              ) : (
                <select
                  value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.originalName} - {r.status}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying || !selectedResume}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:bg-indigo-400"
              >
                {applying ? "Applying..." : "Confirm Apply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseJobs;
