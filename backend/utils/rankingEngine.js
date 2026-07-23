/**
 * Ranking Engine v3.0
 * 
 * Improved Ranking Formula (11 dimensions):
 * - Resume Score: 30%
 * - Skill Match: 25%
 * - Experience: 12%
 * - Education: 8%
 * - Certifications: 5%
 * - Project Quality: 5%
 * - Leadership: 3%
 * - Communication: 2%
 * - ATS Score: 3%
 * - Soft Skills: 2%
 * - Confidence: 5%
 */

export function calculateSkillMatch(candidateSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  if (!candidateSkills || candidateSkills.length === 0) return 0;

  const normalizedCandidate = candidateSkills.map(s => s.toLowerCase());
  const normalizedRequired = requiredSkills.map(s => s.toLowerCase());

  const matchedSkills = normalizedRequired.filter(skill =>
    normalizedCandidate.some(cs => cs.includes(skill) || skill.includes(cs))
  );

  const matchPercentage = Math.round((matchedSkills.length / normalizedRequired.length) * 100);
  return Math.min(matchPercentage, 100);
}

export function calculateExperienceMatch(candidateExperience, requiredExperience) {
  if (!requiredExperience) return 100;
  if (!candidateExperience || candidateExperience.length === 0) return 0;

  const extractYears = (exp) => {
    // Direct mentions: "5 years"
    const directMatch = exp.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?/i);
    if (directMatch) return parseInt(directMatch[1]);

    // Date ranges: "2018 - Present"
    const dateRanges = exp.match(/(\d{4})\s*[-–to]+\s*(present|current|now|\d{4})/gi);
    if (dateRanges) {
      let totalYears = 0;
      for (const range of dateRanges) {
        const years = range.match(/\d{4}/g);
        if (years) {
          const startYear = parseInt(years[0]);
          const endYear = years.length > 1 ? parseInt(years[1]) : new Date().getFullYear();
          totalYears += endYear - startYear;
        }
      }
      return Math.round(totalYears);
    }

    return 0;
  };

  const candidateYears = Math.max(...candidateExperience.map(e =>
    extractYears(e.duration || e.role || e.company || '')
  ));

  const requiredYears = extractYears(requiredExperience);

  if (requiredYears === 0) return 100;
  if (candidateYears >= requiredYears) return 100;
  
  return Math.round((candidateYears / requiredYears) * 100);
}

export function calculateEducationMatch(candidateEducation, requiredEducation) {
  if (!requiredEducation) return 100;
  if (!candidateEducation || candidateEducation.length === 0) return 50;

  const eduLevels = {
    'phd': 10, 'ph.d': 10, 'doctorate': 10, 'doctor of philosophy': 10,
    'master': 8, 'm.tech': 8, 'm.e': 8, 'm.sc': 8, 'm.a': 8, 'm.b.a': 8, 'mba': 8, 'msc': 8,
    'bachelor': 6, 'b.tech': 6, 'b.e': 6, 'b.sc': 6, 'b.a': 6, 'b.com': 6, 'b.b.a': 6, 'bba': 6,
    'associate': 4, 'diploma': 3, 'high school': 2, 'higher secondary': 2
  };

  const requiredLevel = Object.entries(eduLevels).find(([key]) =>
    requiredEducation.toLowerCase().includes(key)
  )?.[1] || 5;

  const candidateHighest = Math.max(
    ...candidateEducation.map(edu => {
      const eduText = `${edu.degree || ''} ${edu.institution || ''}`.toLowerCase();
      const level = Object.entries(eduLevels).find(([key]) =>
        eduText.includes(key)
      )?.[1] || 0;
      return level;
    })
  );

  if (candidateHighest >= requiredLevel) return 100;
  if (candidateHighest === 0) return 50;
  return Math.round((candidateHighest / requiredLevel) * 100);
}

export function calculateCertificationScore(certifications) {
  if (!certifications || certifications.length === 0) return 0;
  const scorePerCert = Math.min(5 / certifications.length, 2);
  return Math.round(Math.min(certifications.length * scorePerCert, 5) * 20);
}

/**
 * Calculate overall score using the improved 11-dimension formula
 */
export function calculateOverallScore(scores) {
  const {
    resumeScore = 0,
    skillMatch = 0,
    experienceMatch = 0,
    educationMatch = 0,
    certifications = 0,
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
    (certifications * 0.05) +
    (projectQuality * 0.05) +
    (leadershipScore * 0.03) +
    (communicationScore * 0.02) +
    (atsScore * 0.03) +
    (softSkillsMatch * 0.02) +
    (confidenceScore * 0.05)
  );

  return Math.min(Math.max(overall, 0), 100);
}

export function getRanking(overallScore) {
  if (overallScore === null || overallScore === undefined) return 'AI Unavailable';
  if (overallScore >= 85) return 'Highly Recommended';
  if (overallScore >= 70) return 'Recommended';
  if (overallScore >= 50) return 'Moderate';
  return 'Not Recommended';
}

export function rankCandidates(applications) {
  const ranked = applications.map(app => {
    const skillMatch = calculateSkillMatch(
      app.candidateSkills || [],
      app.requiredSkills || []
    );
    
    const experienceMatch = calculateExperienceMatch(
      app.candidateExperience || [],
      app.requiredExperience || ''
    );
    
    const educationMatch = calculateEducationMatch(
      app.candidateEducation || [],
      app.requiredEducation || ''
    );
    
    const certifications = calculateCertificationScore(
      app.candidateCertifications || []
    );

    const overallScore = calculateOverallScore({
      resumeScore: app.resumeScore || 0,
      skillMatch,
      experienceMatch,
      educationMatch,
      certifications,
      projectQuality: app.projectQuality || 0,
      leadershipScore: app.leadershipScore || 0,
      communicationScore: app.communicationScore || 0,
      atsScore: app.atsScore || 0,
      softSkillsMatch: app.softSkillsMatch || 0,
      confidenceScore: app.confidenceScore || 0
    });

    return {
      ...app,
      skillMatch,
      experienceMatch,
      educationMatch,
      certifications,
      overallScore,
      ranking: getRanking(overallScore)
    };
  });

  // Sort by overall score descending
  return ranked.sort((a, b) => b.overallScore - a.overallScore);
}
