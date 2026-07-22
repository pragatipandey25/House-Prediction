import express from 'express';
import { body } from 'express-validator';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  createJob,
  getJobs,
  getEmployerJobs,
  getJobById,
  updateJob,
  deleteJob,
  closeJob
} from '../controllers/jobController.js';

const router = express.Router();

router.use(protect);

// Employer: Create job
router.post(
  '/',
  authorizeRoles('employer'),
  [
    body('title', 'Job title is required').notEmpty(),
    body('description', 'Job description is required').notEmpty(),
    body('experience', 'Experience requirement is required').notEmpty(),
    body('education', 'Education requirement is required').notEmpty(),
    body('location', 'Location is required').notEmpty(),
    body('company', 'Company name is required').notEmpty(),
    body('deadline', 'Application deadline is required').isDate()
  ],
  validateRequest,
  createJob
);

// Candidate: Browse active jobs
router.get(
  '/',
  authorizeRoles('candidate', 'employer', 'admin'),
  getJobs
);

// Employer: Get my jobs
router.get(
  '/employer',
  authorizeRoles('employer'),
  getEmployerJobs
);

// Get job by ID
router.get(
  '/:id',
  getJobById
);

// Employer: Update job
router.put(
  '/:id',
  authorizeRoles('employer'),
  updateJob
);

// Employer: Delete job
router.delete(
  '/:id',
  authorizeRoles('employer'),
  deleteJob
);

// Employer: Close job
router.patch(
  '/:id/close',
  authorizeRoles('employer'),
  closeJob
);

export default router;

