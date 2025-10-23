import express from 'express';
import {
  getAllInterviews,
  getInterviewById,
  getMyInterviews,
  createInterview,
  updateInterview,
  addFeedback,
  deleteInterview,
} from '../controllers/interviewController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@ats/shared';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllInterviews);
router.get('/my', getMyInterviews);
router.get('/:id', getInterviewById);
router.post('/', authorize(UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER), createInterview);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER), updateInterview);
router.post('/:id/feedback', addFeedback);
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER), deleteInterview);

export default router;

