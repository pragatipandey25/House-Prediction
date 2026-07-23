import express from 'express';
import { body } from 'express-validator';
import upload, { validateFileIntegrity } from '../middleware/uploadMiddleware.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  uploadResume,
  parseResumeById,
  analyzeResume,
  getResumes,
  getResumeById,
  deleteResume,
  getCandidateResume
} from '../controllers/resumeController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Upload resume - candidate only (with magic byte validation)
router.post(
  '/upload',
  authorizeRoles('candidate'),
  upload.single('resume'),
  validateFileIntegrity,
  uploadResume
);

// Parse resume
router.post(
  '/parse/:id',
  authorizeRoles('candidate'),
  parseResumeById
);

// Analyze resume with AI
router.post(
  '/analyze/:id',
  authorizeRoles('candidate'),
  [
    body('jobDescription', 'Job description is required').notEmpty()
  ],
  validateRequest,
  analyzeResume
);

// Get all resumes (for candidate)
router.get(
  '/',
  authorizeRoles('candidate'),
  getResumes
);

// Get resume by ID
router.get(
  '/:id',
  getResumeById
);

// Delete resume
router.delete(
  '/:id',
  authorizeRoles('candidate'),
  deleteResume
);

// Get candidate resume (for employer/admin)
router.get(
  '/candidate/:id',
  authorizeRoles('employer', 'admin'),
  getCandidateResume
);

export default router;

