import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { JobRepository } from '../repositories/JobRepository';
import { generateId, generateRandomColor } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import { JobStatus, JobFilters } from '@ats/shared';

const getJobRepository = () => new JobRepository();

const defaultPipeline = [
  { id: 'new', name: 'New', order: 1, color: '#FF6B6B' },
  { id: 'screening', name: 'Screening', order: 2, color: '#4ECDC4' },
  { id: 'phone', name: 'Phone Interview', order: 3, color: '#45B7D1' },
  { id: 'technical', name: 'Technical Test', order: 4, color: '#FFA07A' },
  { id: 'onsite', name: 'Onsite Interview', order: 5, color: '#98D8C8' },
  { id: 'offer', name: 'Offer', order: 6, color: '#F7DC6F' },
  { id: 'hired', name: 'Hired', order: 7, color: '#52B788' },
];

export const getAllJobs = async (req: AuthRequest, res: Response) => {
  try {
    const filters = req.query as JobFilters;
    const jobRepository = getJobRepository();
    const { jobs, total } = await jobRepository.search(filters);

    res.json({
      success: true,
      data: jobs,
      meta: {
        total,
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch jobs' },
    });
  }
};

export const getJobById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const jobRepository = getJobRepository();
    const job = await jobRepository.findById(id);

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    res.json({
      success: true,
      data: job,
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
      error: { message: 'Failed to fetch job' },
    });
  }
};

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const jobData = req.body;
    const jobId = generateId('job');
    const jobRepository = getJobRepository();

    const job = {
      id: jobId,
      ...jobData,
      status: jobData.status || JobStatus.DRAFT,
      pipeline: jobData.pipeline || defaultPipeline,
      recruiterId: jobData.recruiterId || req.user?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await jobRepository.create(jobId, job);

    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create job' },
    });
  }
};

export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    updates.updatedAt = new Date().toISOString();

    const jobRepository = getJobRepository();
    const updatedJob = await jobRepository.update(id, updates);

    res.json({
      success: true,
      data: updatedJob,
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
      error: { message: 'Failed to update job' },
    });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const jobRepository = getJobRepository();
    await jobRepository.delete(id);

    res.json({
      success: true,
      data: { message: 'Job deleted successfully' },
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
      error: { message: 'Failed to delete job' },
    });
  }
};

