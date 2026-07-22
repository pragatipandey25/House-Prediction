import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeWithGemini(resumeData, jobDescription) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
You are an expert AI resume screening and candidate ranking system. Analyze the following candidate resume data against the job description.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Provide a comprehensive analysis in the following JSON format (ONLY return valid JSON, no other text):

{
  "resumeScore": <0-100>,
  "atsScore": <0-100>,
  "technicalSkills": <0-100>,
  "communication": <0-100>,
  "experienceMatch": <0-100>,
  "educationMatch": <0-100>,
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "summary": "brief summary of the candidate",
  "ranking": "Highly Recommended | Recommended | Moderate | Not Recommended"
}

Be objective, fair, and accurate in your scoring. Consider:
- Resume Score: Overall quality and completeness of resume
- ATS Score: How well the resume is optimized for ATS parsing
- Technical Skills: Match with required technical skills
- Communication: Clarity and professionalism of resume content
- Experience Match: Relevance of work experience to job requirements
- Education Match: Relevance of education to job requirements
- Missing Skills: Important skills mentioned in job description but missing from resume
- Strengths: Areas where candidate excels relative to job requirements
- Weaknesses: Areas where candidate falls short
- Recommendations: Actionable suggestions for improvement
- Ranking: Overall recommendation level
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Clean the response to extract valid JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysisData = JSON.parse(jsonMatch[0]);
      return analysisData;
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Gemini AI Error:', error.message);
    // Return default values if AI fails
    return {
      resumeScore: 70,
      atsScore: 65,
      technicalSkills: 60,
      communication: 70,
      experienceMatch: 60,
      educationMatch: 70,
      missingSkills: [],
      strengths: ['Profile submitted'],
      weaknesses: ['Pending detailed analysis'],
      recommendations: ['Complete profile for better analysis'],
      summary: 'AI analysis temporarily unavailable. Showing estimated scores.',
      ranking: 'Moderate'
    };
  }
}

export async function analyzeResumeForJob(resumeData, jobDescription) {
  return await analyzeWithGemini(resumeData, jobDescription);
}

