import express from 'express';
import {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  addNote,
  deleteApplication,
} from '../controllers/applicationController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@ats/shared';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllApplications);
router.get('/:id', getApplicationById);
router.post('/', createApplication);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER), updateApplication);
router.patch('/:id/status', authorize(UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER), updateApplicationStatus);
router.post('/:id/notes', authorize(UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER, UserRole.INTERVIEWER), addNote);
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.RECRUITER), deleteApplication);

export default router;

