import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserRepository } from '../repositories/UserRepository';
import { hashPassword, sanitizeUser, generateId } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '@ats/shared';

const getUserRepository = () => new UserRepository();

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    const userRepository = getUserRepository();
    let users;
    if (search) {
      users = await userRepository.search(search as string, Number(limit));
    } else if (role) {
      users = await userRepository.findByRole(role as UserRole, Number(limit));
    } else {
      const offset = (Number(page) - 1) * Number(limit);
      users = await userRepository.findAll(Number(limit), offset);
    }

    const total = await userRepository.count();

    res.json({
      success: true,
      data: users.map(sanitizeUser),
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch users' },
    });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userRepository = getUserRepository();
    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: sanitizeUser(user),
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
      error: { message: 'Failed to fetch user' },
    });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, phone, avatar } = req.body;

    const userRepository = getUserRepository();
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }

    const hashedPassword = await hashPassword(password);
    const userId = generateId('user');

    const user = {
      id: userId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || UserRole.RECRUITER,
      phone,
      avatar,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await userRepository.create(userId, user);

    res.status(201).json({
      success: true,
      data: sanitizeUser(user),
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
      error: { message: 'Failed to create user' },
    });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating password through this endpoint
    if (updates.password) {
      delete updates.password;
    }

    updates.updatedAt = new Date().toISOString();

    const userRepository = getUserRepository();
    const updatedUser = await userRepository.update(id, updates);

    res.json({
      success: true,
      data: sanitizeUser(updatedUser),
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
      error: { message: 'Failed to update user' },
    });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user?.id === id) {
      throw new AppError('Cannot delete your own account', 400);
    }

    const userRepository = getUserRepository();
    await userRepository.delete(id);

    res.json({
      success: true,
      data: { message: 'User deleted successfully' },
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
      error: { message: 'Failed to delete user' },
    });
  }
};

