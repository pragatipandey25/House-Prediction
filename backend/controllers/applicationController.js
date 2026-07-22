import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Resume from '../models/Resume.js';
import {
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

    // Build full job description for Gemini evaluation
    const jobDescription = `
Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Experience Required: ${job.experience}
Education Required: ${job.education}
Salary: ${job.salary}
Required Skills: ${(job.requiredSkills || []).join(', ')}
Description: ${job.description}
`;

    // Call Gemini once to evaluate resume against job description
    const analysis = await analyzeWithGemini(
      resume.parsedData || { rawText: resume.rawText },
      jobDescription
    );

    // Use Gemini's evaluated scores for the overall score calculation
    const resumeScore = analysis.resumeScore || 0;
    const skillMatch = analysis.skillMatch || 0;
    const experienceMatch = analysis.experienceMatch || 0;
    const educationMatch = analysis.educationMatch || 0;
    const certificationScore = analysis.certificationScore || 0;

    const overallScore = calculateOverallScore({
      resumeScore,
      skillMatch,
      experienceMatch,
      educationMatch,
      certifications: certificationScore
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
        certificationScore,
        communicationScore: analysis.communicationScore || 0,
        leadershipScore: analysis.leadershipScore || 0,
        atsScore: analysis.atsScore || 0,
        ranking: getRanking(overallScore),
        recommendation: analysis.recommendation || '',
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        missingSkills: analysis.missingSkills || [],
        recommendations: analysis.recommendations || []
      },
      aiMetadata: {
        model: analysis._metadata?.model || '',
        analyzedAt: analysis._metadata?.analyzedAt || new Date(),
        promptVersion: analysis._metadata?.promptVersion || ''
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

    // Use stored AI scores from Gemini evaluation (no re-calling Gemini)
    const rankedApplications = applications.map((app, index) => {
      const aiScore = app.aiScore || {};
      
      // Use Gemini-stored scores; fall back to rule-based if not available
      const resumeScore = aiScore.resumeScore || 0;
      const skillMatch = aiScore.skillMatch || 0;
      const experienceMatch = aiScore.experienceMatch || 0;
      const educationMatch = aiScore.educationMatch || 0;
      const certificationScore = aiScore.certificationScore || 0;
      const overallScore = aiScore.overallScore || calculateOverallScore({
        resumeScore,
        skillMatch,
        experienceMatch,
        educationMatch,
        certifications: certificationScore
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
          certificationScore,
          communicationScore: aiScore.communicationScore || 0,
          leadershipScore: aiScore.leadershipScore || 0,
          atsScore: aiScore.atsScore || 0
        },
        ranking: getRanking(overallScore),
        recommendation: aiScore.recommendation || '',
        strengths: aiScore.strengths || [],
        weaknesses: aiScore.weaknesses || [],
        missingSkills: aiScore.missingSkills || [],
        recommendations: aiScore.recommendations || [],
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

