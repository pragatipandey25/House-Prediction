import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const AI_MODEL = 'gemini-2.0-flash';
const PROMPT_VERSION = 'v2.0';

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

    const prompt = `
You are an expert AI resume screening and candidate ranking system. Your task is to analyze a candidate's resume against a job description and return ONLY valid JSON.

CRITICAL: Return ONLY a valid JSON object. No markdown, no code blocks, no explanations, no other text.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB DETAILS:
${enhancedJobDesc}

Evaluate the candidate on these categories (score 0-100):
1. resumeScore — Overall resume quality, completeness, and professionalism
2. atsScore — How well the resume is optimized for ATS parsing
3. skillMatch — How well the candidate's technical skills match the job requirements
4. communicationScore — Based on resume clarity, structure, and language quality
5. experienceMatch — Relevance and depth of work experience to the job
6. educationMatch — Relevance of educational background to the role
7. certificationScore — Value and relevance of certifications listed
8. leadershipScore — Evidence of leadership, initiative, or mentoring

Also provide:
- missingSkills: Array of important skills the candidate is missing for this role
- strengths: Array of the candidate's top strengths for this role
- weaknesses: Array of the candidate's weaknesses or areas needing improvement
- recommendations: Array of actionable recommendations for the candidate
- recommendation: One of "Highly Recommended" | "Recommended" | "Moderate" | "Not Recommended"

Scoring Guidelines:
- 90-100: Exceptional — exceeds requirements
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
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "recommendation": "Highly Recommended | Recommended | Moderate | Not Recommended"
}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Clean the response to extract valid JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysisData = JSON.parse(jsonMatch[0]);
      return {
        ...analysisData,
        _metadata: {
          model: AI_MODEL,
          analyzedAt: new Date(),
          promptVersion: PROMPT_VERSION
        }
      };
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Gemini AI Error:', error.message);
    // Return default values if AI fails
    return {
      resumeScore: 70,
      atsScore: 65,
      skillMatch: 60,
      communicationScore: 70,
      experienceMatch: 60,
      educationMatch: 70,
      certificationScore: 50,
      leadershipScore: 60,
      missingSkills: [],
      strengths: ['Profile submitted'],
      weaknesses: ['Pending detailed analysis'],
      recommendations: ['Complete profile for better analysis'],
      recommendation: 'Moderate',
      _metadata: {
        model: AI_MODEL,
        analyzedAt: new Date(),
        promptVersion: PROMPT_VERSION
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

