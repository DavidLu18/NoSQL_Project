import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { InterviewRepository } from '../repositories/InterviewRepository';
import { generateId } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import { InterviewFilters, InterviewStatus } from '@ats/shared';

const getInterviewRepository = () => new InterviewRepository();

export const getAllInterviews = async (req: AuthRequest, res: Response) => {
  try {
    const filters = req.query as InterviewFilters;
    const { interviews, total } = await getInterviewRepository().search(filters);

    res.json({
      success: true,
      data: interviews,
      meta: {
        total,
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch interviews' },
    });
  }
};

export const getInterviewById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const interview = await getInterviewRepository().findById(id);

    if (!interview) {
      throw new AppError('Interview not found', 404);
    }

    res.json({
      success: true,
      data: interview,
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
      error: { message: 'Failed to fetch interview' },
    });
  }
};

export const getMyInterviews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { dateFrom, dateTo } = req.query;

    const interviews = await getInterviewRepository().findByInterviewer(
      userId!,
      dateFrom as string,
      dateTo as string
    );

    res.json({
      success: true,
      data: interviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch interviews' },
    });
  }
};

export const createInterview = async (req: AuthRequest, res: Response) => {
  try {
    const interviewData = req.body;
    const interviewId = generateId('interview');

    const interview = {
      id: interviewId,
      ...interviewData,
      status: interviewData.status || InterviewStatus.SCHEDULED,
      feedback: [],
      createdBy: req.user?.id || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await getInterviewRepository().create(interviewId, interview);

    res.status(201).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create interview' },
    });
  }
};

export const updateInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    updates.updatedAt = new Date().toISOString();

    const updatedInterview = await getInterviewRepository().update(id, updates);

    res.json({
      success: true,
      data: updatedInterview,
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
      error: { message: 'Failed to update interview' },
    });
  }
};

export const addFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const feedbackData = req.body;

    const interview = await getInterviewRepository().findById(id);
    if (!interview) {
      throw new AppError('Interview not found', 404);
    }

    const feedback = {
      userId: req.user?.id || 'system',
      ...feedbackData,
      submittedAt: new Date().toISOString(),
    };

    const updatedInterview = await getInterviewRepository().update(id, {
      feedback: [...interview.feedback || [], feedback],
      updatedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: updatedInterview,
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
      error: { message: 'Failed to add feedback' },
    });
  }
};

export const deleteInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await getInterviewRepository().delete(id);

    res.json({
      success: true,
      data: { message: 'Interview deleted successfully' },
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
      error: { message: 'Failed to delete interview' },
    });
  }
};

