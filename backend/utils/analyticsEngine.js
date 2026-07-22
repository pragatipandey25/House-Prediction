import Job from '../models/Job.js';
import Ranking from '../models/Ranking.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';

/**
 * Calculate analytics for employer dashboard
 */
export async function getEmployerAnalytics(employerId) {
  const jobs = await Job.find({ employerId });
  const jobIds = jobs.map(j => j._id);

  const rankings = await Ranking.find({ job: { $in: jobIds } })
    .populate('candidate', 'name email')
    .populate('job', 'title company');

  if (!rankings.length) {
    return {
      totalCandidates: 0,
      averageResumeScore: 0,
      averageAtsScore: 0,
      averageOverallScore: 0,
      scoreDistribution: { excellent: 0, strong: 0, adequate: 0, belowAverage: 0, poor: 0 },
      recommendationDistribution: { highlyRecommended: 0, recommended: 0, moderate: 0, notRecommended: 0 },
      topCandidate: null,
      topSkills: [],
      rankingsPerJob: []
    };
  }

  // Average scores
  const totalRankings = rankings.length;
  const averageResumeScore = Math.round(
    rankings.reduce((sum, r) => sum + (r.resumeScore || 0), 0) / totalRankings
  );
  const averageAtsScore = Math.round(
    rankings.reduce((sum, r) => sum + (r.atsScore || 0), 0) / totalRankings
  );
  const averageOverallScore = Math.round(
    rankings.reduce((sum, r) => sum + (r.overallScore || 0), 0) / totalRankings
  );

  // Score distribution
  const scoreDistribution = {
    excellent: rankings.filter(r => r.overallScore >= 85).length,
    strong: rankings.filter(r => r.overallScore >= 70 && r.overallScore < 85).length,
    adequate: rankings.filter(r => r.overallScore >= 50 && r.overallScore < 70).length,
    belowAverage: rankings.filter(r => r.overallScore >= 25 && r.overallScore < 50).length,
    poor: rankings.filter(r => r.overallScore < 25).length
  };

  // Recommendation distribution
  const recommendationDistribution = {
    highlyRecommended: rankings.filter(r => r.recommendation === 'Highly Recommended').length,
    recommended: rankings.filter(r => r.recommendation === 'Recommended').length,
    moderate: rankings.filter(r => r.recommendation === 'Moderate').length,
    notRecommended: rankings.filter(r => r.recommendation === 'Not Recommended').length
  };

  // Top candidate (highest overall score)
  const sortedByScore = [...rankings].sort((a, b) => b.overallScore - a.overallScore);
  const topCandidate = sortedByScore[0] ? {
    name: sortedByScore[0].candidate?.name || 'Unknown',
    email: sortedByScore[0].candidate?.email || '',
    overallScore: sortedByScore[0].overallScore,
    jobTitle: sortedByScore[0].job?.title || '',
    company: sortedByScore[0].job?.company || ''
  } : null;

  // Top skills (from missing skills aggregated across all rankings)
  const skillCount = {};
  rankings.forEach(r => {
    (r.missingSkills || []).forEach(skill => {
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Rankings per job
  const rankingsPerJob = jobs.map(job => {
    const jobRankings = rankings.filter(r => r.job?._id?.toString() === job._id.toString());
    return {
      jobId: job._id,
      title: job.title,
      company: job.company,
      totalRanked: jobRankings.length,
      averageScore: jobRankings.length
        ? Math.round(jobRankings.reduce((sum, r) => sum + (r.overallScore || 0), 0) / jobRankings.length)
        : 0,
      topScore: jobRankings.length ? Math.max(...jobRankings.map(r => r.overallScore || 0)) : 0
    };
  });

  return {
    totalCandidates: totalRankings,
    averageResumeScore,
    averageAtsScore,
    averageOverallScore,
    scoreDistribution,
    recommendationDistribution,
    topCandidate,
    topSkills,
    rankingsPerJob
  };
}

/**
 * Calculate analytics for admin dashboard
 */
export async function getAdminAnalytics() {
  const totalCandidates = await User.countDocuments({ role: 'candidate' });
  const totalEmployers = await User.countDocuments({ role: 'employer' });
  const totalJobs = await Job.countDocuments();

  const allRankings = await Ranking.find()
    .populate('candidate', 'name email')
    .populate('job', 'title company');

  // Average scores across all rankings
  let averageResumeScore = 0;
  let averageAtsScore = 0;
  let highestRankedCandidate = null;

  if (allRankings.length) {
    averageResumeScore = Math.round(
      allRankings.reduce((sum, r) => sum + (r.resumeScore || 0), 0) / allRankings.length
    );
    averageAtsScore = Math.round(
      allRankings.reduce((sum, r) => sum + (r.atsScore || 0), 0) / allRankings.length
    );

    const sorted = [...allRankings].sort((a, b) => b.overallScore - a.overallScore);
    if (sorted.length) {
      highestRankedCandidate = {
        name: sorted[0].candidate?.name || 'Unknown',
        email: sorted[0].candidate?.email || '',
        overallScore: sorted[0].overallScore,
        jobTitle: sorted[0].job?.title || '',
        company: sorted[0].job?.company || ''
      };
    }
  }

  // Score distribution
  const scoreDistribution = {
    excellent: allRankings.filter(r => r.overallScore >= 85).length,
    strong: allRankings.filter(r => r.overallScore >= 70 && r.overallScore < 85).length,
    adequate: allRankings.filter(r => r.overallScore >= 50 && r.overallScore < 70).length,
    belowAverage: allRankings.filter(r => r.overallScore >= 25 && r.overallScore < 50).length,
    poor: allRankings.filter(r => r.overallScore < 25).length
  };

  // Recommendation distribution
  const recommendationDistribution = {
    highlyRecommended: allRankings.filter(r => r.recommendation === 'Highly Recommended').length,
    recommended: allRankings.filter(r => r.recommendation === 'Recommended').length,
    moderate: allRankings.filter(r => r.recommendation === 'Moderate').length,
    notRecommended: allRankings.filter(r => r.recommendation === 'Not Recommended').length
  };

  // Top skills across all jobs
  const skillCount = {};
  allRankings.forEach(r => {
    (r.missingSkills || []).forEach(skill => {
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Applications per job (rankings per job)
  const jobs = await Job.find().populate('employerId', 'name email');
  const applicationsPerJob = jobs.map(job => {
    const count = allRankings.filter(r => r.job?._id?.toString() === job._id.toString()).length;
    return {
      title: job.title,
      company: job.company,
      employer: job.employerId?.name || 'Unknown',
      count
    };
  });

  return {
    totalCandidates,
    totalEmployers,
    totalJobs,
    totalAnalyses: allRankings.length,
    averageResumeScore,
    averageAtsScore,
    highestRankedCandidate,
    charts: {
      scoreDistribution,
      recommendationDistribution,
      topSkills,
      applicationsPerJob
    }
  };
}

