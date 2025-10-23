import express from 'express';
import {
  getPublicJobs,
  getPublicJobById,
  submitApplication,
  trackApplication,
} from '../controllers/publicController';
import { uploadResume } from '../controllers/uploadController';

const router = express.Router();

// Public job board - no authentication required
router.get('/jobs', getPublicJobs);
router.get('/jobs/:id', getPublicJobById);

// Resume upload - no authentication required
router.post('/upload/resume', uploadResume);

// Public application submission - no authentication required
router.post('/applications', submitApplication);

// Track application status with token - no authentication required
router.get('/applications/track/:token', trackApplication);

export default router;

