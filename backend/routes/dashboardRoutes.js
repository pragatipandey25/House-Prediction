import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  getEmployerDashboard,
  getCandidateDashboard,
  getAdminDashboard
} from '../controllers/dashboardController.js';

const router = express.Router();

router.use(protect);

// Employer dashboard
router.get(
  '/employer',
  authorizeRoles('employer'),
  getEmployerDashboard
);

// Candidate dashboard
router.get(
  '/candidate',
  authorizeRoles('candidate'),
  getCandidateDashboard
);

// Admin dashboard
router.get(
  '/admin',
  authorizeRoles('admin'),
  getAdminDashboard
);

export default router;

