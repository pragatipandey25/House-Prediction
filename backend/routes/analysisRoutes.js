import express from 'express';
import { body } from 'express-validator';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  analyzeJobCandidates,
  getJobRankings,
  getRankingDetail,
  updateRanking,
  getAvailableCandidates,
  getEmployerAnalysisAnalytics
} from '../controllers/analysisController.js';

const router = express.Router();

router.use(protect);

// Employer: Get available candidates with parsed resumes
router.get(
  '/candidates',
  authorizeRoles('employer'),
  getAvailableCandidates
);

// Employer: Analyze all candidates for a job
router.post(
  '/:jobId/analyze',
  authorizeRoles('employer'),
  analyzeJobCandidates
);

// Employer: Get rankings for a job (with filters, search, sort)
router.get(
  '/:jobId/rankings',
  authorizeRoles('employer'),
  getJobRankings
);

// Employer: Get analytics
router.get(
  '/analytics',
  authorizeRoles('employer'),
  getEmployerAnalysisAnalytics
);

// Get single ranking detail
router.get(
  '/ranking/:id',
  authorizeRoles('employer'),
  getRankingDetail
);

// Employer: Update ranking status (shortlist/reject)
router.patch(
  '/ranking/:id/status',
  authorizeRoles('employer'),
  [
    body('status', 'Status is required').isIn(['shortlisted', 'rejected'])
  ],
  validateRequest,
  updateRanking
);

export default router;

