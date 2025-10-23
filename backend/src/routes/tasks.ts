import express from 'express';
import {
  getAllTasks,
  getMyTasks,
  getOverdueTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@ats/shared';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllTasks);
router.get('/my', getMyTasks);
router.get('/overdue', getOverdueTasks);
router.get('/:id', getTaskById);
router.post('/', authorize(UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER), createTask);
router.put('/:id', updateTask);
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.RECRUITER, UserRole.HIRING_MANAGER), deleteTask);

export default router;

