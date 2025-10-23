import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ApplicationRepository } from '../repositories/ApplicationRepository';
import { generateId } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import { ApplicationFilters, ApplicationStatus } from '@ats/shared';

const getApplicationRepository = () => new ApplicationRepository();

export const getAllApplications = async (req: AuthRequest, res: Response) => {
  try {
    const filters = req.query as ApplicationFilters;
    const { applications, total } = await getApplicationRepository().search(filters);

    res.json({
      success: true,
      data: applications,
      meta: {
        total,
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch applications' },
    });
  }
};

export const getApplicationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const application = await getApplicationRepository().findById(id);

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    res.json({
      success: true,
      data: application,
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
      error: { message: 'Failed to fetch application' },
    });
  }
};

export const createApplication = async (req: AuthRequest, res: Response) => {
  try {
    const applicationData = req.body;
    const applicationId = generateId('application');

    const application = {
      id: applicationId,
      ...applicationData,
      status: applicationData.status || ApplicationStatus.NEW,
      appliedAt: new Date().toISOString(),
      notes: [],
      activities: [{
        id: generateId('activity'),
        type: 'application_created',
        userId: req.user?.id || 'system',
        description: 'Application submitted',
        createdAt: new Date().toISOString(),
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await getApplicationRepository().create(applicationId, application);

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create application' },
    });
  }
};

export const updateApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    updates.updatedAt = new Date().toISOString();

    const updatedApplication = await getApplicationRepository().update(id, updates);

    res.json({
      success: true,
      data: updatedApplication,
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
      error: { message: 'Failed to update application' },
    });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, stageId } = req.body;

    const application = await getApplicationRepository().findById(id);
    if (!application) {
      throw new AppError('Application not found', 404);
    }

    // Create user-friendly description based on stage
    const stageNames: Record<string, string> = {
      'new': 'Application received',
      'screening': 'Application is being reviewed',
      'phone': 'Phone interview scheduled',
      'technical': 'Technical interview stage',
      'onsite': 'On-site interview scheduled',
      'offer': 'Offer extended',
      'hired': 'Congratulations! You have been hired',
    };

    const stageName = stageNames[stageId] || `Moved to ${stageId} stage`;

    const activity = {
      id: generateId('activity'),
      type: 'status_changed',
      userId: req.user?.id || 'system',
      description: stageName,
      metadata: { 
        oldStatus: application.status, 
        newStatus: status,
        oldStage: application.currentStageId,
        newStage: stageId 
      },
      createdAt: new Date().toISOString(),
    };

    const updates = {
      status,
      currentStageId: stageId || application.currentStageId,
      activities: [...application.activities, activity],
      updatedAt: new Date().toISOString(),
    };

    const updatedApplication = await getApplicationRepository().update(id, updates);

    res.json({
      success: true,
      data: updatedApplication,
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
      error: { message: 'Failed to update application status' },
    });
  }
};

export const addNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const application = await getApplicationRepository().findById(id);
    if (!application) {
      throw new AppError('Application not found', 404);
    }

    const note = {
      id: generateId('note'),
      userId: req.user?.id || 'system',
      content,
      createdAt: new Date().toISOString(),
    };

    const updatedApplication = await getApplicationRepository().update(id, {
      notes: [...application.notes, note],
      updatedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: updatedApplication,
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
      error: { message: 'Failed to add note' },
    });
  }
};

export const deleteApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await getApplicationRepository().delete(id);

    res.json({
      success: true,
      data: { message: 'Application deleted successfully' },
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
      error: { message: 'Failed to delete application' },
    });
  }
};

