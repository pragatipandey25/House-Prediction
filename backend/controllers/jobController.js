import Job from '../models/Job.js';

// @desc    Create job
// @route   POST /api/jobs
export const createJob = async (req, res) => {
  try {
    const {
      title, description, requiredSkills,
      experience, education, salary, location, company, deadline
    } = req.body;

    const job = await Job.create({
      employerId: req.user._id,
      title, description, requiredSkills,
      experience, education, salary, location, company, deadline
    });

    return res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all active jobs (for candidates)
// @route   GET /api/jobs
export const getJobs = async (req, res) => {
  try {
    const {
      search, skills, location,
      experience, education, page = 1, limit = 10
    } = req.query;

    const query = { status: 'active' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.requiredSkills = { $in: skillsArray };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (experience) {
      query.experience = { $regex: experience, $options: 'i' };
    }

    if (education) {
      query.education = { $regex: education, $options: 'i' };
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
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
};

// @desc    Get employer's jobs
// @route   GET /api/jobs/employer
export const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user._id })
      .sort('-createdAt');
    
    return res.status(200).json({ jobs });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employerId', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json({ job });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await job.deleteOne();

    return res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Close job
// @route   PATCH /api/jobs/:id/close
export const closeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    job.status = 'closed';
    await job.save();

    return res.status(200).json({
      message: 'Job closed successfully',
      job
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

