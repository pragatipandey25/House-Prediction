import Resume from '../models/Resume.js';
import { parseResume } from '../services/resumeParser.js';
import { analyzeWithGemini } from '../services/aiService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Upload resume
// @route   POST /api/resumes/upload
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a resume file' });
    }

    const fileType = req.file.originalname.endsWith('.pdf') ? 'pdf' : 'docx';

    const resume = await Resume.create({
      userId: req.user._id,
      originalName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType,
      status: 'uploaded'
    });

    return res.status(201).json({
      message: 'Resume uploaded successfully',
      resume
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Parse uploaded resume
// @route   POST /api/resumes/parse/:id
export const parseResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const filePath = path.join(__dirname, '..', resume.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file not found on server' });
    }

    console.log(`[parseResume] Starting parse for file: ${resume.originalName}, type: ${resume.fileType}, path: ${filePath}`);
    const { rawText, parsedData } = await parseResume(filePath, resume.fileType);
    console.log(`[parseResume] Successfully parsed resume for: ${parsedData.name || 'Unknown'}`);

    resume.rawText = rawText;
    resume.parsedData = parsedData;
    resume.status = 'parsed';
    await resume.save();

    return res.status(200).json({
      message: 'Resume parsed successfully',
      parsedData
    });
  } catch (error) {
    console.error(`[parseResume] Failed to parse resume:`, error);
    return res.status(500).json({ message: 'Failed to parse resume', error: error.message });
  }
};

// @desc    Analyze resume with AI
// @route   POST /api/resumes/analyze/:id
export const analyzeResume = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ message: 'Job description is required' });
    }

    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Analyze with AI
    const analysis = await analyzeWithGemini(resume.parsedData || { rawText: resume.rawText }, jobDescription);

    resume.aiScore = {
      resumeScore: analysis.resumeScore || 0,
      atsScore: analysis.atsScore || 0,
      skillMatch: analysis.skillMatch || 0,
      communicationScore: analysis.communicationScore || 0,
      experienceMatch: analysis.experienceMatch || 0,
      educationMatch: analysis.educationMatch || 0,
      certificationScore: analysis.certificationScore || 0,
      leadershipScore: analysis.leadershipScore || 0,
      missingSkills: analysis.missingSkills || [],
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      recommendations: analysis.recommendations || [],
      recommendation: analysis.recommendation || ''
    };
    resume.aiMetadata = {
      model: analysis._metadata?.model || '',
      analyzedAt: analysis._metadata?.analyzedAt || new Date(),
      promptVersion: analysis._metadata?.promptVersion || ''
    };
    resume.status = 'analyzed';
    await resume.save();

    return res.status(200).json({
      message: 'Resume analyzed successfully',
      analysis: resume.aiScore
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's resumes
// @route   GET /api/resumes
export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort('-createdAt');
    
    return res.status(200).json({ resumes });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get resume by ID
// @route   GET /api/resumes/:id
export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete file from server
    const filePath = path.join(__dirname, '..', resume.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await resume.deleteOne();

    return res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get resume analysis for employer (view candidate resume analysis)
// @route   GET /api/resumes/candidate/:id
export const getCandidateResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

