import { Link } from "react-router-dom";

const JobCard = ({ job, showActions = false, onClose, onDelete, userRole }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isDeadlinePassed = new Date(job.deadline) < new Date();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg hover:border-indigo-200/50 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">{job.title}</h3>
          <p className="text-indigo-600 font-medium text-sm">{job.company}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            job.status === "active"
              ? "bg-green-100 text-green-700"
              : job.status === "closed"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
          }`}
        >
          {job.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
          📍 {job.location}
        </span>
        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
          💰 {job.salary}
        </span>
        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
          🎓 {job.experience}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>

      {job.requiredSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.requiredSkills.slice(0, 5).map((skill, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-medium"
            >
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 5 && (
            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-md text-xs">
              +{job.requiredSkills.length - 5} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Deadline: {formatDate(job.deadline)}
          {isDeadlinePassed && (
            <span className="text-red-500 ml-1">(Expired)</span>
          )}
        </p>
        <div className="flex gap-2">
          {userRole === "candidate" &&
            job.status === "active" &&
            !showActions && (
              <Link
                to={`/candidate/jobs/${job._id}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all"
              >
                Apply Now
              </Link>
            )}
          {showActions && (
            <>
              <Link
                to={`/employer/jobs/${job._id}`}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-all"
              >
                View
              </Link>
              <Link
                to={`/employer/jobs/edit/${job._id}`}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all"
              >
                Edit
              </Link>
              {job.status === "active" && (
                <button
                  onClick={() => onClose?.(job._id)}
                  className="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-100 transition-all"
                >
                  Close
                </button>
              )}
              <button
                onClick={() => onDelete?.(job._id)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-all"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
