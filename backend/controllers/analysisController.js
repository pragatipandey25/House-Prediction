import Job from '../models/Job.js';
import Resume from '../models/Resume.js';
import Ranking from '../models/Ranking.js';
import User from '../models/User.js';
import { analyzeAndRankCandidates, getRankings, updateRankingStatus } from '../services/rankingService.js';
import { getEmployerAnalytics } from '../utils/analyticsEngine.js';

// @desc    Analyze all candidates for a job
// @route   POST /api/analysis/:jobId/analyze
export const analyzeJobCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to analyze this job' });
    }

    const result = await analyzeAndRankCandidates(jobId);

    return res.status(200).json({
      message: result.rankings.length
        ? `Analysis complete! ${result.rankings.length} candidates ranked.`
        : result.message || 'No candidates to analyze',
      job: {
        _id: job._id,
        title: job.title,
        company: job.company
      },
      rankings: result.rankings || [],
      totalRanked: result.rankings?.length || 0
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get rankings for a job
// @route   GET /api/analysis/:jobId/rankings
export const getJobRankings = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { minScore, skills, experience, education, recommendation, search, sortBy, sortOrder } = req.query;

    const rankings = await getRankings(jobId, {
      minScore,
      skills,
      experience,
      education,
      recommendation,
      search,
      sortBy,
      sortOrder
    });

    return res.status(200).json({
      job: {
        _id: job._id,
        title: job.title,
        company: job.company
      },
      rankings,
      total: rankings.length
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single ranking analysis detail
// @route   GET /api/analysis/ranking/:id
export const getRankingDetail = async (req, res) => {
  try {
    const ranking = await Ranking.findById(req.params.id)
      .populate('candidate', 'name email')
      .populate('resume', 'originalName fileUrl parsedData')
      .populate('job', 'title company description requiredSkills experience education');

    if (!ranking) {
      return res.status(404).json({ message: 'Ranking not found' });
    }

    return res.status(200).json({ ranking });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update ranking status (shortlist/reject)
// @route   PATCH /api/analysis/ranking/:id/status
export const updateRanking = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['shortlisted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use: shortlisted or rejected' });
    }

    const ranking = await updateRankingStatus(req.params.id, status);

    return res.status(200).json({
      message: `Candidate ${status} successfully`,
      ranking
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get available candidates with parsed resumes
// @route   GET /api/analysis/candidates
export const getAvailableCandidates = async (req, res) => {
  try {
    const candidates = await User.find({ role: 'candidate' }).select('name email');

    const candidateIds = candidates.map(c => c._id);

    const resumes = await Resume.aggregate([
      {
        $match: {
          userId: { $in: candidateIds },
          status: { $in: ['parsed', 'analyzed'] }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$userId',
          resumeId: { $first: '$_id' },
          originalName: { $first: '$originalName' },
          fileUrl: { $first: '$fileUrl' },
          status: { $first: '$status' },
          parsedData: { $first: '$parsedData' },
          aiScore: { $first: '$aiScore' }
        }
      }
    ]);

    const result = candidates.map(candidate => {
      const resume = resumes.find(r => r._id.toString() === candidate._id.toString());
      return {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        resume: resume ? {
          _id: resume.resumeId,
          originalName: resume.originalName,
          fileUrl: resume.fileUrl,
          status: resume.status,
          parsedData: resume.parsedData,
          aiScore: resume.aiScore
        } : null
      };
    });

    return res.status(200).json({ candidates: result });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get employer analytics
// @route   GET /api/analysis/analytics
export const getEmployerAnalysisAnalytics = async (req, res) => {
  try {
    const analytics = await getEmployerAnalytics(req.user._id);
    return res.status(200).json(analytics);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

