import express from 'express';
import {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  uploadCV,
  getCandidateApplications,
} from '../controllers/candidateController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@ats/shared';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllCandidates);
router.get('/:id', getCandidateById);
router.get('/:id/applications', getCandidateApplications);
router.post('/', authorize(UserRole.ADMIN, UserRole.RECRUITER), createCandidate);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.RECRUITER, UserRole.CANDIDATE), updateCandidate);
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.RECRUITER), deleteCandidate);
router.post('/:id/upload-cv', authorize(UserRole.ADMIN, UserRole.RECRUITER, UserRole.CANDIDATE), uploadCV);

export default router;

