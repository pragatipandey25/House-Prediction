import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getJobById, closeJob } from "../services/jobService";
import {
  getCandidateRankings,
  updateApplicationStatus,
} from "../services/applicationService";
import RankingTable from "../components/RankingTable";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const jobData = await getJobById(id);
      setJob(jobData.job);

      // Load rankings
      try {
        const rankingData = await getCandidateRankings(id);
        setRankings(rankingData.rankings || []);
      } catch (err) {
        // Rankings might not be available
        console.log("No rankings available");
      }
    } catch (error) {
      toast.error("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (applicationId) => {
    try {
      await updateApplicationStatus(applicationId, "shortlisted");
      toast.success("Candidate shortlisted!");
      loadData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleReject = async (applicationId) => {
    try {
      await updateApplicationStatus(applicationId, "rejected");
      toast.success("Candidate rejected");
      loadData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleCloseJob = async () => {
    if (!window.confirm("Are you sure you want to close this job?")) return;
    try {
      await closeJob(id);
      toast.success("Job closed");
      loadData();
    } catch (error) {
      toast.error("Failed to close job");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/30 flex items-center justify-center">
        <LoadingSpinner text="Loading job details..." />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/30 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Job not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-800">
                  {job.title}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    job.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {job.status}
                </span>
              </div>
              <p className="text-indigo-600 font-semibold text-lg">
                {job.company}
              </p>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                <span>📍 {job.location}</span>
                <span>💰 {job.salary}</span>
                <span>🎓 {job.experience}</span>
                <span>📅 Deadline: {formatDate(job.deadline)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/employer/jobs/edit/${job._id}`}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all"
              >
                Edit Job
              </Link>
              {job.status === "active" && (
                <button
                  onClick={handleCloseJob}
                  className="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-100 transition-all"
                >
                  Close Job
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("candidates")}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "candidates"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Candidates ({rankings.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Description */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Job Description
              </h2>
              <p className="text-gray-600 whitespace-pre-line">
                {job.description}
              </p>

              <h3 className="text-lg font-bold text-gray-800 mt-6 mb-3">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills?.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">
                  Job Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Experience</span>
                    <span className="font-semibold text-gray-700">
                      {job.experience}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Education</span>
                    <span className="font-semibold text-gray-700">
                      {job.education}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Salary</span>
                    <span className="font-semibold text-gray-700">
                      {job.salary}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location</span>
                    <span className="font-semibold text-gray-700">
                      {job.location}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Posted</span>
                    <span className="font-semibold text-gray-700">
                      {formatDate(job.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Deadline</span>
                    <span className="font-semibold text-gray-700">
                      {formatDate(job.deadline)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Applicants</span>
                    <span className="font-semibold text-indigo-600">
                      {rankings.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Candidates Tab */
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                AI-Ranked Candidates ({rankings.length})
              </h2>
              <p className="text-xs text-gray-400">
                Ranking: 40% Resume | 30% Skills | 15% Experience | 10%
                Education | 5% Certifications
              </p>
            </div>

            <RankingTable
              rankings={rankings}
              onShortlist={handleShortlist}
              onReject={handleReject}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
