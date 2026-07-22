import express from 'express';
import { body } from 'express-validator';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  applyForJob,
  getCandidateApplications,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
  getCandidateRankings
} from '../controllers/applicationController.js';

const router = express.Router();

router.use(protect);

// Candidate: Apply for job
router.post(
  '/',
  authorizeRoles('candidate'),
  [
    body('jobId', 'Job ID is required').notEmpty(),
    body('resumeId', 'Resume ID is required').notEmpty()
  ],
  validateRequest,
  applyForJob
);

// Candidate: Get my applications
router.get(
  '/candidate',
  authorizeRoles('candidate'),
  getCandidateApplications
);

// Employer: Get all applications for a job
router.get(
  '/job/:jobId',
  authorizeRoles('employer'),
  getJobApplications
);

// Employer: Get candidate rankings for a job
router.get(
  '/job/:jobId/rankings',
  authorizeRoles('employer'),
  getCandidateRankings
);

// Get single application
router.get(
  '/:id',
  getApplicationById
);

// Employer: Update application status (shortlist/reject)
router.patch(
  '/:id/status',
  authorizeRoles('employer'),
  [
    body('status', 'Status is required').isIn(['shortlisted', 'rejected'])
  ],
  validateRequest,
  updateApplicationStatus
);

// Candidate: Withdraw application
router.patch(
  '/:id/withdraw',
  authorizeRoles('candidate'),
  withdrawApplication
);

export default router;

