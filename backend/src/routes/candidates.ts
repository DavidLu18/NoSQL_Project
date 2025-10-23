import express from 'express';
import {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  uploadCV,
} from '../controllers/candidateController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@ats/shared';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllCandidates);
router.get('/:id', getCandidateById);
router.post('/', authorize(UserRole.ADMIN, UserRole.RECRUITER), createCandidate);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.RECRUITER), updateCandidate);
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.RECRUITER), deleteCandidate);
router.post('/:id/upload-cv', authorize(UserRole.ADMIN, UserRole.RECRUITER), uploadCV);

export default router;

