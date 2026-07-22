import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';

// Common tech skills for keyword matching
const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust',
  'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot',
  'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap',
  'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Firebase',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins',
  'Git', 'GitHub', 'GitLab', 'Bitbucket',
  'REST API', 'GraphQL', 'WebSocket', 'gRPC',
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
  'Agile', 'Scrum', 'JIRA', 'Confluence',
  'Linux', 'Unix', 'Bash', 'PowerShell',
  'Nginx', 'Apache', 'PM2',
  'Jest', 'Mocha', 'Chai', 'Cypress', 'Selenium',
  'Redux', 'Zustand', 'Context API',
  'Next.js', 'Nuxt.js', 'Gatsby',
  'Figma', 'Adobe XD', 'Sketch',
  'Tableau', 'Power BI', 'Excel'
];

// Common certifications
const CERT_KEYWORDS = [
  'certified', 'certification', 'certificate', 'AWS Certified', 'Azure Certified',
  'Google Certified', 'PMP', 'Scrum Master', 'CISSP', 'CEH', 'CompTIA',
  'Oracle Certified', 'Cisco Certified', 'CCNA', 'CCNP'
];

// Language keywords
const LANGUAGE_KEYWORDS = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean',
  'Hindi', 'Arabic', 'Portuguese', 'Russian', 'Italian', 'Dutch',
  'Mandarin', 'Cantonese', 'Bengali', 'Urdu', 'Turkish', 'Vietnamese'
];

export async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength);
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText.trim();
}

export async function extractTextFromDOCX(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

export async function parseResumeText(text) {
  const lines = text.split('\n').filter(line => line.trim());
  const parsed = {
    name: '',
    email: '',
    phone: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: []
  };

  // Extract email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    parsed.email = emailMatch[0];
  }

  // Extract phone number
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    parsed.phone = phoneMatch[0].trim();
  }

  // Extract name (first non-empty line that doesn't look like an email/phone/section)
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed &&
        !trimmed.includes('@') &&
        !phoneRegex.test(trimmed) &&
        !trimmed.match(/^(experience|education|skills|projects|work|summary|profile)/i)) {
      // Try to extract a name pattern (two consecutive capitalized words) from the start of the line
      const nameMatch = trimmed.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/);
      if (nameMatch) {
        parsed.name = nameMatch[1];
        break;
      }
      // Fallback: if line is short (< 50 chars) and doesn't look like a section
      if (trimmed.length < 50 && !trimmed.match(/^[A-Z\s]{2,}$/)) {
        parsed.name = trimmed;
        break;
      }
    }
  }

  // Extract skills
  const textLower = text.toLowerCase();
  const foundSkills = COMMON_SKILLS.filter(skill =>
    textLower.includes(skill.toLowerCase())
  );
  parsed.skills = [...new Set(foundSkills)];

  // Extract certifications
  for (const line of lines) {
    const trimmed = line.trim();
    if (CERT_KEYWORDS.some(keyword =>
      trimmed.toLowerCase().includes(keyword.toLowerCase())
    )) {
      parsed.certifications.push({ name: trimmed, issuer: '', year: '' });
    }
  }

  // Extract languages
  for (const line of lines) {
    const trimmed = line.trim();
    for (const lang of LANGUAGE_KEYWORDS) {
      if (trimmed.toLowerCase().includes(lang.toLowerCase())) {
        if (!parsed.languages.includes(lang)) {
          parsed.languages.push(lang);
        }
      }
    }
  }

  // Extract education
  const eduKeywords = ['bachelor', 'master', 'phd', 'ph.d', 'degree', 'university', 'college', 'institute', 'b.tech', 'm.tech', 'b.e', 'm.e', 'b.sc', 'm.sc', 'b.a', 'm.a', 'b.com', 'm.com', 'b.b.a', 'm.b.a'];
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase();

    // Detect sections
    if (line.match(/^(experience|work|employment|professional)/i)) {
      currentSection = 'experience';
      continue;
    }
    if (line.match(/^(education|academic)/i)) {
      currentSection = 'education';
      continue;
    }
    if (line.match(/^(projects)/i)) {
      currentSection = 'projects';
      continue;
    }
    if (line.match(/^(skills|technical)/i)) {
      currentSection = 'skills';
      continue;
    }

    // Parse education
    if (currentSection === 'education' && line.length > 5) {
      if (eduKeywords.some(k => line.includes(k))) {
        parsed.education.push({
          degree: lines[i].trim(),
          institution: lines[i + 1]?.trim() || '',
          year: lines[i + 2]?.trim() || ''
        });
      }
    }

    // Parse experience
    if (currentSection === 'experience' && line.length > 5) {
      // Look for date patterns to identify experience entries
      const datePattern = /\b(19|20)\d{2}\b/g;
      if (datePattern.test(line) || line.match(/(present|current|ongoing)/i)) {
        const expLine = lines[i].trim();
        const nextLine = lines[i + 1]?.trim() || '';
        const nextNextLine = lines[i + 2]?.trim() || '';
        parsed.experience.push({
          role: nextLine || expLine,
          company: expLine,
          duration: expLine,
          description: nextNextLine
        });
      }
    }

    // Parse projects
    if (currentSection === 'projects' && line.length > 5) {
      const projLine = lines[i].trim();
      const projDesc = lines[i + 1]?.trim() || '';
      parsed.projects.push({
        name: projLine,
        description: projDesc,
        technologies: parsed.skills.filter(s => projLine.toLowerCase().includes(s.toLowerCase()) || projDesc.toLowerCase().includes(s.toLowerCase()))
      });
    }
  }

  // Clean up - remove duplicates
  parsed.skills = [...new Set(parsed.skills)];
  parsed.languages = [...new Set(parsed.languages)];

  return parsed;
}

export async function parseResume(filePath, fileType) {
  let text = '';
  
  if (fileType === 'pdf') {
    text = await extractTextFromPDF(filePath);
  } else if (fileType === 'docx') {
    text = await extractTextFromDOCX(filePath);
  } else {
    throw new Error('Unsupported file type');
  }

  const parsedData = await parseResumeText(text);
  return { rawText: text, parsedData };
}

 