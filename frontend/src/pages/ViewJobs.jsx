import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEmployerJobs, deleteJob, closeJob } from "../services/jobService";
import JobCard from "../components/JobCard";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const ViewJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await getEmployerJobs();
      setJobs(data.jobs || []);
    } catch (error) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteJob(id);
      toast.success("Job deleted");
      loadJobs();
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };

  const handleClose = async (id) => {
    try {
      await closeJob(id);
      toast.success("Job closed");
      loadJobs();
    } catch (error) {
      toast.error("Failed to close job");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/30 flex items-center justify-center">
        <LoadingSpinner text="Loading jobs..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-cyan-50/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Jobs</h1>
            <p className="text-gray-500 mt-1">Manage your job listings</p>
          </div>
          <Link
            to="/employer/jobs/create"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-cyan-600 transition-all"
          >
            + Post New Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-lg font-medium">No jobs posted yet</p>
            <p className="text-sm">
              Post your first job to start receiving applications
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                showActions={true}
                onClose={handleClose}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewJobs;
