import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const AI_MODEL = 'gemini-2.0-flash';
const PROMPT_VERSION = 'v3.0';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Sleep helper for retry delay with exponential backoff
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry mechanism with exponential backoff
 */
async function withRetry(fn, retries = MAX_RETRIES) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Gemini AI attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`🔄 Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

/**
 * Parse JSON from AI response, handling various edge cases
 */
function parseAIResponse(text) {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Try extracting JSON from markdown code block
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch {
        // Continue to next approach
      }
    }

    // Try finding the first { and last }
    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0]);
      } catch {
        // Continue to next approach
      }
    }

    // Try finding any JSON-like structure
    const looseMatch = text.match(/(\{[^{}]*\})/);
    if (looseMatch) {
      try {
        return JSON.parse(looseMatch[0]);
      } catch {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    throw new Error('No JSON found in AI response');
  }
}

export async function analyzeWithGemini(resumeData, jobDescription, jobDetails = {}) {
  try {
    const model = genAI.getGenerativeModel({ model: AI_MODEL });

    const enhancedJobDesc = `
Job Title: ${jobDetails.title || 'N/A'}
Company: ${jobDetails.company || 'N/A'}
Location: ${jobDetails.location || 'N/A'}
Employment Type: ${jobDetails.employmentType || 'N/A'}
Experience Required: ${jobDetails.experience || 'N/A'}
Minimum Experience: ${jobDetails.minimumExperience || 'N/A'}
Education Required: ${jobDetails.education || 'N/A'}
Required Education: ${jobDetails.requiredEducation || 'N/A'}
Salary: ${jobDetails.salary || 'N/A'}
Required Skills: ${(jobDetails.requiredSkills || []).join(', ')}
Preferred Skills: ${(jobDetails.preferredSkills || []).join(', ')}
Responsibilities: ${(jobDetails.responsibilities || []).join(', ')}
Requirements: ${(jobDetails.requirements || []).join(', ')}

Full Description:
${jobDescription}
`;

    const prompt = `You are an expert AI resume screening and candidate ranking system. Your task is to analyze a candidate's resume against a job description and return ONLY valid JSON.

CRITICAL RULES:
- Return ONLY a valid JSON object. No markdown, no code blocks, no explanations, no other text.
- All scores must be integers between 0 and 100.
- The JSON must be parseable by JSON.parse().

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB DETAILS:
${enhancedJobDesc}

Evaluate the candidate on these 11 categories (score 0-100):

1. resumeScore — Overall resume quality, completeness, formatting, and professionalism
2. atsScore — How well the resume is optimized for ATS (Applicant Tracking System) parsing (keywords, standard sections, no graphics/tables)
3. skillMatch — How well the candidate's technical skills match the job requirements
4. communicationScore — Based on resume clarity, structure, grammar, and language quality
5. experienceMatch — Relevance and depth of work experience to the job responsibilities
6. educationMatch — Relevance of educational background to the role requirements
7. certificationScore — Value, relevance, and number of certifications listed
8. leadershipScore — Evidence of leadership, initiative, team management, or mentoring
9. projectQuality — Quality, complexity, and relevance of projects listed
10. problemSolving — Evidence of problem-solving ability, analytical thinking, and technical challenges
11. softSkillsMatch — Evidence of soft skills like teamwork, communication, adaptability, collaboration

Also provide:
- confidenceScore (0-100): How confident you are in this assessment based on data completeness
- missingSkills: Array of important skills the candidate is missing for this role
- strengths: Array of the candidate's top 3-5 strengths for this role
- weaknesses: Array of the candidate's 2-3 weaknesses or areas needing improvement
- recommendations: Array of 2-4 actionable recommendations for the candidate
- improvementSuggestions: Array of 2-3 specific resume improvement suggestions
- atsSuggestions: Array of 1-2 ATS optimization suggestions
- rankingReason: A brief 1-2 sentence explanation of why the candidate received this ranking
- recommendation: One of "Highly Recommended" | "Recommended" | "Moderate" | "Not Recommended"

Scoring Guidelines:
- 90-100: Exceptional — exceeds requirements significantly
- 75-89: Strong — meets and partially exceeds requirements
- 50-74: Adequate — meets minimum requirements
- 25-49: Below Average — partially meets requirements
- 0-24: Poor — does not meet requirements

Return ONLY this JSON structure (no other text):
{
  "resumeScore": <0-100>,
  "atsScore": <0-100>,
  "skillMatch": <0-100>,
  "communicationScore": <0-100>,
  "experienceMatch": <0-100>,
  "educationMatch": <0-100>,
  "certificationScore": <0-100>,
  "leadershipScore": <0-100>,
  "projectQuality": <0-100>,
  "problemSolving": <0-100>,
  "softSkillsMatch": <0-100>,
  "confidenceScore": <0-100>,
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "improvementSuggestions": ["suggestion1", "suggestion2"],
  "atsSuggestions": ["ats_suggestion1"],
  "rankingReason": "Brief explanation of ranking",
  "recommendation": "Highly Recommended | Recommended | Moderate | Not Recommended"
}
`;

    const generateContent = async () => {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      const parsed = parseAIResponse(text);
      
      // Validate required fields
      const requiredFields = [
        'resumeScore', 'atsScore', 'skillMatch', 'communicationScore',
        'experienceMatch', 'educationMatch', 'certificationScore',
        'leadershipScore', 'projectQuality', 'problemSolving', 'softSkillsMatch',
        'confidenceScore', 'missingSkills', 'strengths', 'weaknesses',
        'recommendations', 'recommendation', 'rankingReason'
      ];

      for (const field of requiredFields) {
        if (parsed[field] === undefined || parsed[field] === null) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return {
        ...parsed,
        _metadata: {
          model: AI_MODEL,
          analyzedAt: new Date(),
          promptVersion: PROMPT_VERSION
        }
      };
    };

    // Execute with retry
    return await withRetry(generateContent);

  } catch (error) {
    console.error('Gemini AI Error after retries:', error.message);
    
    // Return error response with null scores instead of fake defaults
    return {
      resumeScore: null,
      atsScore: null,
      skillMatch: null,
      communicationScore: null,
      experienceMatch: null,
      educationMatch: null,
      certificationScore: null,
      leadershipScore: null,
      projectQuality: null,
      problemSolving: null,
      softSkillsMatch: null,
      confidenceScore: null,
      missingSkills: [],
      strengths: [],
      weaknesses: [],
      recommendations: [],
      improvementSuggestions: [],
      atsSuggestions: [],
      rankingReason: 'AI analysis unavailable — the AI service encountered an error. Please try analyzing again.',
      recommendation: 'AI analysis unavailable',
      aiError: error.message,
      _metadata: {
        model: AI_MODEL,
        analyzedAt: new Date(),
        promptVersion: PROMPT_VERSION,
        error: error.message
      }
    };
  }
}

export async function analyzeResumeWithJobDetails(resumeData, job) {
  const jobDescription = `
${job.description}

Responsibilities:
${(job.responsibilities || []).join('\n')}

Requirements:
${(job.requirements || []).join('\n')}
`;

  return await analyzeWithGemini(resumeData, jobDescription, {
    title: job.title,
    company: job.company,
    location: job.location,
    employmentType: job.employmentType,
    experience: job.experience,
    minimumExperience: job.minimumExperience,
    education: job.education,
    requiredEducation: job.requiredEducation,
    salary: job.salary,
    requiredSkills: job.requiredSkills,
    preferredSkills: job.preferredSkills,
    responsibilities: job.responsibilities,
    requirements: job.requirements
  });
}

export async function analyzeResumeForJob(resumeData, jobDescription) {
  return await analyzeWithGemini(resumeData, jobDescription);
}
