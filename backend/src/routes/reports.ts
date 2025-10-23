import express from 'express';
import {
  getDashboardMetrics,
  getPipelineReport,
  getSourceReport,
  getTimeToHireReport,
  exportReport,
} from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@ats/shared';

const router = express.Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER));

router.get('/dashboard', getDashboardMetrics);
router.get('/pipeline', getPipelineReport);
router.get('/sources', getSourceReport);
router.get('/time-to-hire', getTimeToHireReport);
router.get('/export', exportReport);

export default router;

