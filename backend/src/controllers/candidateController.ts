import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CandidateRepository } from '../repositories/CandidateRepository';
import { generateId } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import { CandidateFilters } from '@ats/shared';

const getCandidateRepository = () => new CandidateRepository();

export const getAllCandidates = async (req: AuthRequest, res: Response) => {
  try {
    const filters = req.query as CandidateFilters;
    
    if (filters.skills && typeof filters.skills === 'string') {
      filters.skills = (filters.skills as string).split(',');
    }

    const { candidates, total } = await getCandidateRepository().search(filters);

    res.json({
      success: true,
      data: candidates,
      meta: {
        total,
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch candidates' },
    });
  }
};

export const getCandidateById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const candidate = await getCandidateRepository().findById(id);

    if (!candidate) {
      throw new AppError('Candidate not found', 404);
    }

    res.json({
      success: true,
      data: candidate,
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
      error: { message: 'Failed to fetch candidate' },
    });
  }
};

export const createCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const candidateData = req.body;
    const candidateId = generateId('candidate');

    // Check if email already exists
    if (candidateData.email) {
      const existing = await getCandidateRepository().findByEmail(candidateData.email);
      if (existing) {
        throw new AppError('Candidate with this email already exists', 400);
      }
    }

    const candidate = {
      id: candidateId,
      ...candidateData,
      skills: candidateData.skills || [],
      tags: candidateData.tags || [],
      education: candidateData.education || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await getCandidateRepository().create(candidateId, candidate);

    res.status(201).json({
      success: true,
      data: candidate,
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
      error: { message: 'Failed to create candidate' },
    });
  }
};

export const updateCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    updates.updatedAt = new Date().toISOString();

    const updatedCandidate = await getCandidateRepository().update(id, updates);

    res.json({
      success: true,
      data: updatedCandidate,
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
      error: { message: 'Failed to update candidate' },
    });
  }
};

export const deleteCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await getCandidateRepository().delete(id);

    res.json({
      success: true,
      data: { message: 'Candidate deleted successfully' },
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
      error: { message: 'Failed to delete candidate' },
    });
  }
};

export const uploadCV = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as any;

    if (!files || !files.cv) {
      throw new AppError('No file uploaded', 400);
    }

    const cvFile = files.cv;
    const fileName = `${id}_${Date.now()}_${cvFile.name}`;
    const uploadPath = `${process.env.UPLOAD_DIR || './uploads'}/${fileName}`;

    await cvFile.mv(uploadPath);

    const fileAttachment = {
      fileName: cvFile.name,
      fileSize: cvFile.size,
      mimeType: cvFile.mimetype,
      url: `/uploads/${fileName}`,
      uploadedAt: new Date().toISOString(),
    };

    const updatedCandidate = await getCandidateRepository().update(id, {
      resume: fileAttachment,
      updatedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: updatedCandidate,
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
      error: { message: 'Failed to upload CV' },
    });
  }
};

