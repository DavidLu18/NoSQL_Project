import express from 'express';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@ats/shared';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllJobs);
router.get('/:id', getJobById);
router.post('/', authorize(UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER), createJob);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER), updateJob);
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.RECRUITER), deleteJob);

export default router;

