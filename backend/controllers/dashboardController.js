import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';

// @desc    Get employer dashboard data
// @route   GET /api/dashboard/employer
export const getEmployerDashboard = async (req, res) => {
  try {
    const employerId = req.user._id;

    // Get all jobs for this employer
    const jobs = await Job.find({ employerId });
    const jobIds = jobs.map(job => job._id);

    // Get all applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } });

    // Stats
    const totalJobs = jobs.length;
    const totalApplicants = applications.length;
    const shortlisted = applications.filter(app => app.status === 'shortlisted').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;

    // Applications per job (for chart)
    const applicationsPerJob = await Promise.all(
      jobs.map(async (job) => {
        const count = await Application.countDocuments({ jobId: job._id });
        return {
          title: job.title,
          company: job.company,
          applicants: count
        };
      })
    );

    // Get top skills from job descriptions
    const allSkills = jobs.flatMap(job => job.requiredSkills || []);
    const skillCount = {};
    allSkills.forEach(skill => {
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    });
    const topSkills = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Candidate distribution by status
    const candidateDistribution = {
      applied: applications.filter(app => app.status === 'applied').length,
      shortlisted,
      rejected,
      withdrawn: applications.filter(app => app.status === 'withdrawn').length
    };

    // Recent applications
    const recentApplications = await Application.find({ jobId: { $in: jobIds } })
      .populate('candidateId', 'name email')
      .populate('jobId', 'title')
      .sort('-createdAt')
      .limit(10);

    return res.status(200).json({
      stats: { totalJobs, totalApplicants, shortlisted, rejected },
      charts: {
        applicationsPerJob,
        topSkills,
        candidateDistribution
      },
      recentApplications
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get candidate dashboard data
// @route   GET /api/dashboard/candidate
export const getCandidateDashboard = async (req, res) => {
  try {
    const candidateId = req.user._id;

    // Get resume
    const resume = await Resume.findOne({ userId: candidateId }).sort('-createdAt');

    // Get applications
    const applications = await Application.find({ candidateId })
      .populate('jobId', 'title company location salary status')
      .sort('-createdAt');

    const appliedJobs = applications.filter(app => app.status === 'applied').length;
    const shortlisted = applications.filter(app => app.status === 'shortlisted').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;

    return res.status(200).json({
      resume: resume ? {
        _id: resume._id,
        originalName: resume.originalName,
        fileUrl: resume.fileUrl,
        status: resume.status,
        parsedData: resume.parsedData,
        aiScore: resume.aiScore
      } : null,
      applications: {
        total: applications.length,
        applied: appliedJobs,
        shortlisted,
        rejected,
        list: applications
      },
      stats: {
        resumeScore: resume?.aiScore?.resumeScore || 0,
        atsScore: resume?.aiScore?.atsScore || 0,
        missingSkills: resume?.aiScore?.missingSkills || [],
        strengths: resume?.aiScore?.strengths || [],
        recommendations: resume?.aiScore?.recommendations || []
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get admin dashboard data
// @route   GET /api/dashboard/admin
export const getAdminDashboard = async (req, res) => {
  try {
    // Users stats
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalEmployers = await User.countDocuments({ role: 'employer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Job stats
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const closedJobs = await Job.countDocuments({ status: 'closed' });

    // Application stats
    const totalApplications = await Application.countDocuments();
    const shortlisted = await Application.countDocuments({ status: 'shortlisted' });
    const rejected = await Application.countDocuments({ status: 'rejected' });

    // Recent users
    const recentUsers = await User.find()
      .select('-password')
      .sort('-createdAt')
      .limit(10);

    // Recent jobs
    const recentJobs = await Job.find()
      .populate('employerId', 'name email')
      .sort('-createdAt')
      .limit(10);

    // Recent applications
    const recentApplications = await Application.find()
      .populate('candidateId', 'name email')
      .populate('jobId', 'title company')
      .sort('-createdAt')
      .limit(10);

    // Jobs per employer (for chart)
    const jobsPerEmployer = await Job.aggregate([
      { $group: { _id: '$employerId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employer'
        }
      },
      { $unwind: '$employer' },
      { $project: { name: '$employer.name', count: 1 } }
    ]);

    return res.status(200).json({
      users: {
        total: totalUsers,
        candidates: totalCandidates,
        employers: totalEmployers,
        admins: totalAdmins,
        recent: recentUsers
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        closed: closedJobs,
        recent: recentJobs
      },
      applications: {
        total: totalApplications,
        shortlisted,
        rejected,
        recent: recentApplications
      },
      charts: {
        jobsPerEmployer
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

