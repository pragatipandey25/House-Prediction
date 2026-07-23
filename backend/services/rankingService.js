import Job from '../models/Job.js';
import Resume from '../models/Resume.js';
import Ranking from '../models/Ranking.js';
import User from '../models/User.js';
import { analyzeResumeWithJobDetails } from './aiService.js';

/**
 * Calculate overall score using improved weighted formula
 * Resume Score: 30%
 * Skill Match: 25%
 * Experience Match: 12%
 * Education Match: 8%
 * Certification Score: 5%
 * Project Quality: 5%
 * Leadership: 3%
 * Communication: 2%
 * ATS Score: 3%
 * Soft Skills: 2%
 * Confidence: 5%
 */
function calculateOverallScore(scores) {
  const {
    resumeScore = 0,
    skillMatch = 0,
    experienceMatch = 0,
    educationMatch = 0,
    certificationScore = 0,
    projectQuality = 0,
    leadershipScore = 0,
    communicationScore = 0,
    atsScore = 0,
    softSkillsMatch = 0,
    confidenceScore = 0
  } = scores;

  const overall = Math.round(
    (resumeScore * 0.30) +
    (skillMatch * 0.25) +
    (experienceMatch * 0.12) +
    (educationMatch * 0.08) +
    (certificationScore * 0.05) +
    (projectQuality * 0.05) +
    (leadershipScore * 0.03) +
    (communicationScore * 0.02) +
    (atsScore * 0.03) +
    (softSkillsMatch * 0.02) +
    (confidenceScore * 0.05)
  );

  return Math.min(Math.max(overall, 0), 100);
}

/**
 * Get ranking label based on overall score
 */
function getRankingLabel(overallScore) {
  if (overallScore >= 85) return 'Highly Recommended';
  if (overallScore >= 70) return 'Recommended';
  if (overallScore >= 50) return 'Moderate';
  return 'Not Recommended';
}

/**
 * Analyze all candidates for a given job
 * Compares each candidate's parsed resume with the job description using Gemini AI
 */
export async function analyzeAndRankCandidates(jobId) {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error('Job not found');
  }

  // Get all candidates who have uploaded and parsed resumes
  const candidates = await User.find({ role: 'candidate' });
  
  if (!candidates.length) {
    return { job, rankings: [], message: 'No candidates found' };
  }

  const candidateIds = candidates.map(c => c._id);
  
  // Get the latest parsed resume for each candidate
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
        parsedData: { $first: '$parsedData' },
        rawText: { $first: '$rawText' },
        status: { $first: '$status' },
        fileUrl: { $first: '$fileUrl' }
      }
    }
  ]);

  if (!resumes.length) {
    return { job, rankings: [], message: 'No parsed resumes found' };
  }

  const results = [];

  // Process each candidate's resume
  for (const resume of resumes) {
    try {
      const candidate = candidates.find(c => c._id.toString() === resume._id.toString());
      if (!candidate) continue;

      // Get the full resume document
      const resumeDoc = await Resume.findById(resume.resumeId);
      if (!resumeDoc) continue;

      const resumeData = resumeDoc.parsedData || { rawText: resumeDoc.rawText };

      // Analyze with Gemini AI
      const analysis = await analyzeResumeWithJobDetails(resumeData, job);

      // Check if AI returned an error — show null scores instead of fake defaults
      if (analysis.recommendation === 'AI analysis unavailable') {
        results.push({
          candidateId: candidate._id,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          resumeId: resumeDoc._id,
          resumeOriginalName: resumeDoc.originalName,
          resumeFileUrl: resumeDoc.fileUrl,
          resumeScore: null,
          atsScore: null,
          skillMatch: null,
          experienceMatch: null,
          educationMatch: null,
          certificationScore: null,
          communicationScore: null,
          leadershipScore: null,
          projectQuality: null,
          problemSolving: null,
          softSkillsMatch: null,
          confidenceScore: null,
          overallScore: null,
          rank: 0,
          recommendation: 'AI analysis unavailable',
          rankingReason: analysis.rankingReason || 'AI service unavailable',
          strengths: [],
          weaknesses: [],
          missingSkills: [],
          recommendations: [],
          improvementSuggestions: analysis.improvementSuggestions || [],
          atsSuggestions: analysis.atsSuggestions || [],
          aiMetadata: analysis._metadata || { model: '', analyzedAt: new Date(), promptVersion: '' },
          aiError: analysis.aiError || null
        });
        continue;
      }

      // Calculate overall score using improved formula
      const overallScore = calculateOverallScore({
        resumeScore: analysis.resumeScore || 0,
        skillMatch: analysis.skillMatch || 0,
        experienceMatch: analysis.experienceMatch || 0,
        educationMatch: analysis.educationMatch || 0,
        certificationScore: analysis.certificationScore || 0,
        projectQuality: analysis.projectQuality || 0,
        leadershipScore: analysis.leadershipScore || 0,
        communicationScore: analysis.communicationScore || 0,
        atsScore: analysis.atsScore || 0,
        softSkillsMatch: analysis.softSkillsMatch || 0,
        confidenceScore: analysis.confidenceScore || 0
      });

      results.push({
        candidateId: candidate._id,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        resumeId: resumeDoc._id,
        resumeOriginalName: resumeDoc.originalName,
        resumeFileUrl: resumeDoc.fileUrl,
        resumeScore: analysis.resumeScore || 0,
        atsScore: analysis.atsScore || 0,
        skillMatch: analysis.skillMatch || 0,
        experienceMatch: analysis.experienceMatch || 0,
        educationMatch: analysis.educationMatch || 0,
        certificationScore: analysis.certificationScore || 0,
        communicationScore: analysis.communicationScore || 0,
        leadershipScore: analysis.leadershipScore || 0,
        projectQuality: analysis.projectQuality || 0,
        problemSolving: analysis.problemSolving || 0,
        softSkillsMatch: analysis.softSkillsMatch || 0,
        confidenceScore: analysis.confidenceScore || 0,
        overallScore,
        rank: 0,
        recommendation: analysis.recommendation || 'Moderate',
        rankingReason: analysis.rankingReason || '',
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        missingSkills: analysis.missingSkills || [],
        recommendations: analysis.recommendations || [],
        improvementSuggestions: analysis.improvementSuggestions || [],
        atsSuggestions: analysis.atsSuggestions || [],
        aiMetadata: analysis._metadata || {
          model: '',
          analyzedAt: new Date(),
          promptVersion: ''
        }
      });
    } catch (error) {
      console.error(`Failed to analyze resume for candidate ${resume._id}:`, error.message);
      const candidate = candidates.find(c => c._id.toString() === resume._id.toString());
      if (candidate) {
        results.push({
          candidateId: candidate._id,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          resumeId: resume.resumeId,
          resumeOriginalName: resume.originalName,
          resumeFileUrl: resume.fileUrl,
          resumeScore: null,
          atsScore: null,
          skillMatch: null,
          experienceMatch: null,
          educationMatch: null,
          certificationScore: null,
          communicationScore: null,
          leadershipScore: null,
          projectQuality: null,
          problemSolving: null,
          softSkillsMatch: null,
          confidenceScore: null,
          overallScore: null,
          rank: 0,
          recommendation: 'AI analysis unavailable',
          rankingReason: 'Error during AI analysis',
          strengths: [],
          weaknesses: [],
          missingSkills: [],
          recommendations: [],
          improvementSuggestions: [],
          atsSuggestions: [],
          aiMetadata: { model: '', analyzedAt: new Date(), promptVersion: '' }
        });
      }
    }
  }

  // Sort by overall score descending (null scores go to bottom)
  results.sort((a, b) => {
    if (a.overallScore === null && b.overallScore === null) return 0;
    if (a.overallScore === null) return 1;
    if (b.overallScore === null) return -1;
    return b.overallScore - a.overallScore;
  });
  results.forEach((r, index) => {
    r.rank = index + 1;
  });

  // Store rankings in MongoDB
  await storeRankings(jobId, results);

  return { job, rankings: results };
}

/**
 * Store ranking results in the Ranking collection
 */
async function storeRankings(jobId, rankings) {
  // Delete existing rankings for this job
  await Ranking.deleteMany({ job: jobId });

  // Create new ranking entries with all fields
  const rankingDocs = rankings.map(r => ({
    job: jobId,
    candidate: r.candidateId,
    resume: r.resumeId,
    resumeScore: r.resumeScore,
    atsScore: r.atsScore,
    skillMatch: r.skillMatch,
    experienceMatch: r.experienceMatch,
    educationMatch: r.educationMatch,
    certificationScore: r.certificationScore,
    communicationScore: r.communicationScore,
    leadershipScore: r.leadershipScore,
    projectQuality: r.projectQuality,
    problemSolving: r.problemSolving,
    softSkillsMatch: r.softSkillsMatch,
    confidenceScore: r.confidenceScore,
    overallScore: r.overallScore,
    rank: r.rank,
    recommendation: r.recommendation,
    rankingReason: r.rankingReason || '',
    strengths: r.strengths,
    weaknesses: r.weaknesses,
    missingSkills: r.missingSkills,
    recommendations: r.recommendations,
    improvementSuggestions: r.improvementSuggestions || [],
    atsSuggestions: r.atsSuggestions || [],
    aiMetadata: r.aiMetadata
  }));

  await Ranking.insertMany(rankingDocs);
}

/**
 * Get stored rankings for a job with optional filtering
 */
export async function getRankings(jobId, filters = {}) {
  const { minScore, skills, experience, education, recommendation, search, sortBy, sortOrder } = filters;

  const query = { job: jobId };

  if (minScore) {
    query.overallScore = { $gte: Number(minScore) };
  }

  if (recommendation) {
    query.recommendation = recommendation;
  }

  let rankings = await Ranking.find(query)
    .populate('candidate', 'name email')
    .populate('resume', 'originalName fileUrl parsedData');

  // Client-side filtering for arrays
  if (skills) {
    const skillsArr = skills.split(',').map(s => s.trim().toLowerCase());
    rankings = rankings.filter(r =>
      skillsArr.some(skill =>
        (r.missingSkills || []).some(ms => ms.toLowerCase().includes(skill)) ||
        (r.strengths || []).some(s => s.toLowerCase().includes(skill))
      )
    );
  }

  if (experience) {
    rankings = rankings.filter(r => r.experienceMatch >= Number(experience));
  }

  if (education) {
    rankings = rankings.filter(r => r.educationMatch >= Number(education));
  }

  // Search by name or email
  if (search) {
    const searchLower = search.toLowerCase();
    rankings = rankings.filter(r => {
      const candidate = r.candidate || {};
      return (
        (candidate.name || '').toLowerCase().includes(searchLower) ||
        (candidate.email || '').toLowerCase().includes(searchLower) ||
        (r.missingSkills || []).some(s => s.toLowerCase().includes(searchLower))
      );
    });
  }

  // Sort
  const sortField = sortBy || 'rank';
  const order = sortOrder === 'asc' ? 1 : -1;

  rankings.sort((a, b) => {
    let valA, valB;
    switch (sortField) {
      case 'overallScore':
        valA = a.overallScore;
        valB = b.overallScore;
        break;
      case 'resumeScore':
        valA = a.resumeScore;
        valB = b.resumeScore;
        break;
      case 'atsScore':
        valA = a.atsScore;
        valB = b.atsScore;
        break;
      case 'communicationScore':
        valA = a.communicationScore;
        valB = b.communicationScore;
        break;
      case 'educationMatch':
        valA = a.educationMatch;
        valB = b.educationMatch;
        break;
      case 'confidenceScore':
        valA = a.confidenceScore;
        valB = b.confidenceScore;
        break;
      case 'newest':
        valA = a.createdAt?.getTime() || 0;
        valB = b.createdAt?.getTime() || 0;
        break;
      case 'oldest':
        valA = a.createdAt?.getTime() || 0;
        valB = b.createdAt?.getTime() || 0;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      default:
        valA = a.rank;
        valB = b.rank;
    }
    return (valA - valB) * order;
  });

  // Re-assign ranks after sorting
  rankings.forEach((r, index) => {
    r.rank = index + 1;
  });

  return rankings;
}

/**
 * Update ranking status (shortlist/reject)
 */
export async function updateRankingStatus(rankingId, status) {
  const ranking = await Ranking.findById(rankingId);
  if (!ranking) {
    throw new Error('Ranking not found');
  }
  ranking.status = status;
  await ranking.save();
  return ranking;
}
