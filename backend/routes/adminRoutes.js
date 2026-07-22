import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Resume from '../models/Resume.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin'));

// @desc    Get all users
// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const query = {};
    if (role) query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's resumes
    await Resume.deleteMany({ userId: user._id });
    // Delete user's jobs (if employer)
    const jobs = await Job.find({ employerId: user._id });
    const jobIds = jobs.map(j => j._id);
    await Application.deleteMany({ $or: [{ jobId: { $in: jobIds } }, { candidateId: user._id }] });
    await Job.deleteMany({ employerId: user._id });
    // Delete user's applications (if candidate)
    await Application.deleteMany({ candidateId: user._id });
    await user.deleteOne();

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get all jobs
// @route   GET /api/admin/jobs
router.get('/jobs', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const total = await Job.countDocuments();
    const jobs = await Job.find()
      .populate('employerId', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      jobs,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get all applications
// @route   GET /api/admin/applications
router.get('/applications', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const total = await Application.countDocuments();
    const applications = await Application.find()
      .populate('candidateId', 'name email')
      .populate('jobId', 'title company')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      applications,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get system stats
// @route   GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalEmployers = await User.countDocuments({ role: 'employer' });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const totalApplications = await Application.countDocuments();
    const totalResumes = await Resume.countDocuments();

    return res.status(200).json({
      totalUsers,
      totalCandidates,
      totalEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
      totalResumes
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

