import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@ats/shared';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', authorize(UserRole.ADMIN), createUser);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.RECRUITER), updateUser);
router.delete('/:id', authorize(UserRole.ADMIN), deleteUser);

export default router;

