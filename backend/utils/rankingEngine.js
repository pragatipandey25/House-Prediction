/**
 * Ranking Engine
 * 
 * Ranking Formula:
 * - Resume Score: 40%
 * - Skill Match: 30%
 * - Experience: 15%
 * - Education: 10%
 * - Certifications: 5%
 */

export function calculateSkillMatch(candidateSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  if (!candidateSkills || candidateSkills.length === 0) return 0;

  const normalizedCandidate = candidateSkills.map(s => s.toLowerCase());
  const normalizedRequired = requiredSkills.map(s => s.toLowerCase());

  const matchedSkills = normalizedRequired.filter(skill =>
    normalizedCandidate.some(cs => cs.includes(skill) || skill.includes(cs))
  );

  return Math.round((matchedSkills.length / normalizedRequired.length) * 100);
}

export function calculateExperienceMatch(candidateExperience, requiredExperience) {
  if (!requiredExperience) return 100;
  if (!candidateExperience || candidateExperience.length === 0) return 0;

  // Extract years from experience entries
  const extractYears = (exp) => {
    const yearPattern = /\b(\d+)\s*(?:\+|years?|yrs?)\b/gi;
    const matches = exp.match(yearPattern);
    if (matches) {
      const nums = matches.map(m => parseInt(m.match(/\d+/)[0]));
      return Math.max(...nums);
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
    'phd': 10, 'ph.d': 10, 'doctorate': 10,
    'master': 8, 'm.tech': 8, 'm.e': 8, 'm.sc': 8, 'm.a': 8, 'm.b.a': 8, 'mba': 8,
    'bachelor': 6, 'b.tech': 6, 'b.e': 6, 'b.sc': 6, 'b.a': 6, 'b.com': 6, 'b.b.a': 6, 'bba': 6,
    'associate': 4, 'diploma': 3, 'high school': 2
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
  // Max 5% for certifications
  const scorePerCert = Math.min(5 / certifications.length, 2);
  return Math.round(Math.min(certifications.length * scorePerCert, 5) * 20); // Scale to 0-100
}

export function calculateOverallScore(scores) {
  const {
    resumeScore = 0,
    skillMatch = 0,
    experienceMatch = 0,
    educationMatch = 0,
    certifications = 0
  } = scores;

  const overall = Math.round(
    (resumeScore * 0.40) +
    (skillMatch * 0.30) +
    (experienceMatch * 0.15) +
    (educationMatch * 0.10) +
    (certifications * 0.05)
  );

  return Math.min(overall, 100);
}

export function getRanking(overallScore) {
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
      certifications
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

