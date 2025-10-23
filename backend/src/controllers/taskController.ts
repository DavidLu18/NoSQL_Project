import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TaskRepository } from '../repositories/TaskRepository';
import { generateId } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import { TaskStatus } from '@ats/shared';

const getTaskRepository = () => new TaskRepository();

export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { assigneeId, status } = req.query;

    let tasks;
    if (assigneeId) {
      tasks = await getTaskRepository().findByAssignee(
        assigneeId as string,
        status as TaskStatus
      );
    } else {
      tasks = await getTaskRepository().findAll(100);
    }

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch tasks' },
    });
  }
};

export const getMyTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status } = req.query;

    const tasks = await getTaskRepository().findByAssignee(
      userId!,
      status as TaskStatus
    );

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch tasks' },
    });
  }
};

export const getOverdueTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const tasks = await getTaskRepository().findOverdue(userId);

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch overdue tasks' },
    });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await getTaskRepository().findById(id);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch task' },
    });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const taskData = req.body;
    const taskId = generateId('task');

    const task = {
      id: taskId,
      ...taskData,
      status: taskData.status || TaskStatus.TODO,
      createdBy: req.user?.id || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await getTaskRepository().create(taskId, task);

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create task' },
    });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.status === TaskStatus.DONE && !updates.completedAt) {
      updates.completedAt = new Date().toISOString();
    }

    updates.updatedAt = new Date().toISOString();

    const updatedTask = await getTaskRepository().update(id, updates);

    res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update task' },
    });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await getTaskRepository().delete(id);

    res.json({
      success: true,
      data: { message: 'Task deleted successfully' },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete task' },
    });
  }
};

