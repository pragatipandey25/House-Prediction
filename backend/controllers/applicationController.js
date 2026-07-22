import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Resume from '../models/Resume.js';
import {
  calculateSkillMatch,
  calculateExperienceMatch,
  calculateEducationMatch,
  calculateCertificationScore,
  calculateOverallScore,
  getRanking
} from '../utils/rankingEngine.js';
import { analyzeWithGemini } from '../services/aiService.js';

// @desc    Apply for a job
// @route   POST /api/applications
export const applyForJob = async (req, res) => {
  try {
    const { jobId, resumeId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This resume does not belong to you' });
    }

    // Check if already applied
    const existing = await Application.findOne({
      jobId,
      candidateId: req.user._id
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Calculate AI scores
    const skillMatch = calculateSkillMatch(
      resume.parsedData?.skills || [],
      job.requiredSkills || []
    );

    const experienceMatch = calculateExperienceMatch(
      resume.parsedData?.experience || [],
      job.experience || ''
    );

    const educationMatch = calculateEducationMatch(
      resume.parsedData?.education || [],
      job.education || ''
    );

    const certifications = calculateCertificationScore(
      resume.parsedData?.certifications || []
    );

    const resumeScore = resume.aiScore?.resumeScore || 70;
    const overallScore = calculateOverallScore({
      resumeScore,
      skillMatch,
      experienceMatch,
      educationMatch,
      certifications
    });

    const application = await Application.create({
      jobId,
      candidateId: req.user._id,
      resumeId,
      status: 'applied',
      aiScore: {
        overallScore,
        resumeScore,
        skillMatch,
        experienceMatch,
        educationMatch,
        atsScore: resume.aiScore?.atsScore || 0,
        ranking: getRanking(overallScore),
        strengths: resume.aiScore?.strengths || [],
        weaknesses: resume.aiScore?.weaknesses || [],
        recommendations: resume.aiScore?.recommendations || []
      }
    });

    const populatedApp = await Application.findById(application._id)
      .populate('jobId', 'title company location')
      .populate('candidateId', 'name email');

    return res.status(201).json({
      message: 'Application submitted successfully',
      application: populatedApp
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get candidate's applications
// @route   GET /api/applications/candidate
export const getCandidateApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id })
      .populate({
        path: 'jobId',
        select: 'title company location salary status deadline'
      })
      .populate({
        path: 'resumeId',
        select: 'originalName fileUrl aiScore parsedData'
      })
      .sort('-createdAt');

    return res.status(200).json({ applications });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all applications for a job (employer)
// @route   GET /api/applications/job/:jobId
export const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate({
        path: 'candidateId',
        select: 'name email'
      })
      .populate({
        path: 'resumeId',
        select: 'originalName fileUrl parsedData aiScore'
      })
      .sort('-createdAt');

    return res.status(200).json({ applications });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
export const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'jobId',
        select: 'title description requiredSkills experience education salary location company deadline status employerId'
      })
      .populate({
        path: 'candidateId',
        select: 'name email'
      })
      .populate({
        path: 'resumeId',
        select: 'originalName fileUrl parsedData aiScore'
      });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    return res.status(200).json({ application });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update application status (employer)
// @route   PATCH /api/applications/:id/status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['shortlisted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use: shortlisted or rejected' });
    }

    const application = await Application.findById(req.params.id)
      .populate('jobId', 'employerId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.jobId.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      message: `Application ${status} successfully`,
      application
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Withdraw application (candidate)
// @route   PATCH /api/applications/:id/withdraw
export const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.candidateId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = 'withdrawn';
    await application.save();

    return res.status(200).json({
      message: 'Application withdrawn successfully',
      application
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Rank candidates for a job (using ranking engine)
// @route   GET /api/applications/job/:jobId/rankings
export const getCandidateRankings = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate({
        path: 'candidateId',
        select: 'name email'
      })
      .populate({
        path: 'resumeId',
        select: 'parsedData aiScore originalName'
      })
      .sort('-createdAt');

    // Calculate rankings
    const rankedApplications = applications.map((app, index) => {
      const candidateSkills = app.resumeId?.parsedData?.skills || [];
      const candidateExperience = app.resumeId?.parsedData?.experience || [];
      const candidateEducation = app.resumeId?.parsedData?.education || [];
      const candidateCertifications = app.resumeId?.parsedData?.certifications || [];
      const resumeScore = app.resumeId?.aiScore?.resumeScore || app.aiScore?.resumeScore || 0;

      const skillMatch = calculateSkillMatch(candidateSkills, job.requiredSkills);
      const experienceMatch = calculateExperienceMatch(candidateExperience, job.experience);
      const educationMatch = calculateEducationMatch(candidateEducation, job.education);
      const certifications = calculateCertificationScore(candidateCertifications);

      const overallScore = calculateOverallScore({
        resumeScore,
        skillMatch,
        experienceMatch,
        educationMatch,
        certifications
      });

      return {
        rank: 0, // Will be set after sorting
        applicationId: app._id,
        candidate: app.candidateId,
        resumeId: app.resumeId,
        scores: {
          overallScore,
          resumeScore,
          skillMatch,
          experienceMatch,
          educationMatch,
          atsScore: app.aiScore?.atsScore || app.resumeId?.aiScore?.atsScore || 0
        },
        ranking: getRanking(overallScore),
        status: app.status,
        appliedDate: app.createdAt
      };
    });

    // Sort by overall score descending and assign ranks
    rankedApplications.sort((a, b) => b.scores.overallScore - a.scores.overallScore);
    rankedApplications.forEach((app, index) => {
      app.rank = index + 1;
    });

    return res.status(200).json({
      job: {
        title: job.title,
        company: job.company,
        totalApplicants: rankedApplications.length
      },
      rankings: rankedApplications
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

