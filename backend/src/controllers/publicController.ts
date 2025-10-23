import { Request, Response } from 'express';
import { JobRepository } from '../repositories/JobRepository';
import { ApplicationRepository } from '../repositories/ApplicationRepository';
import { CandidateRepository } from '../repositories/CandidateRepository';
import { JobStatus, ApplicationStatus } from '@ats/shared';
import crypto from 'crypto';
import { database } from '../config/database';

const getJobRepo = () => new JobRepository();
const getApplicationRepo = () => new ApplicationRepository();
const getCandidateRepo = () => new CandidateRepository();

// Get all open jobs for public job board
export const getPublicJobs = async (req: Request, res: Response) => {
  try {
    const { search, location, type, experienceLevel, page, limit } = req.query;

    const filters: any = {
      status: JobStatus.OPEN,
      search: search as string,
      location: location as string,
      type: type as string,
      experienceLevel: experienceLevel as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    };

    const result = await getJobRepo().search(filters);

    // Remove internal fields
    const publicJobs = result.jobs.map((job) => ({
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      experienceLevel: job.experienceLevel,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      skills: job.skills,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      currency: job.currency,
      createdAt: job.createdAt,
    }));

    res.json({
      success: true,
      data: {
        jobs: publicJobs,
        total: result.total,
        page: filters.page,
        limit: filters.limit,
      },
    });
  } catch (error) {
    console.error('Public jobs error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch jobs' },
    });
  }
};

// Get public job details
export const getPublicJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = await getJobRepo().findById(id);

    if (!job || job.status !== JobStatus.OPEN) {
      return res.status(404).json({
        success: false,
        error: { message: 'Job not found or no longer available' },
      });
    }

    // Remove internal fields
    const publicJob = {
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      experienceLevel: job.experienceLevel,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      skills: job.skills,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      currency: job.currency,
      createdAt: job.createdAt,
    };

    res.json({
      success: true,
      data: publicJob,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch job details' },
    });
  }
};

// Submit job application (public)
export const submitApplication = async (req: Request, res: Response) => {
  try {
    const {
      jobId,
      firstName,
      lastName,
      email,
      phone,
      location,
      resumeUrl,
      coverLetter,
      skills,
      experienceYears,
      currentTitle,
      currentCompany,
      linkedinUrl,
      portfolioUrl,
    } = req.body;

    // Validate job exists and is open
    const job = await getJobRepo().findById(jobId);
    if (!job || job.status !== JobStatus.OPEN) {
      return res.status(400).json({
        success: false,
        error: { message: 'Job not found or no longer accepting applications' },
      });
    }

    // Create or find candidate
    const candidateRepo = getCandidateRepo();
    let candidate = await candidateRepo.findByEmail(email);

    if (!candidate) {
      const candidateId = `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      candidate = await candidateRepo.create(candidateId, {
        id: candidateId,
        firstName,
        lastName,
        email,
        phone,
        location,
        source: 'website' as any,
        skills: skills || [],
        experienceYears: experienceYears || 0,
        currentTitle,
        currentCompany,
        linkedinUrl,
        portfolioUrl,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any);
    }

    // Generate tracking token
    const trackingToken = crypto.randomBytes(32).toString('hex');

    // Create application
    const applicationId = `application_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const application = await getApplicationRepo().create(applicationId, {
      id: applicationId,
      jobId,
      candidateId: candidate.id,
      source: 'website' as any,
      status: ApplicationStatus.NEW,
      currentStageId: job.pipeline[0]?.id || 'initial',
      appliedAt: new Date().toISOString(),
      trackingToken,
      resumeUrl,
      coverLetter,
      notes: [],
      activities: [
        {
          id: `activity_${Date.now()}`,
          type: 'application_submitted',
          userId: 'system',
          description: 'Application submitted',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any);

    res.status(201).json({
      success: true,
      data: {
        applicationId: application.id,
        trackingToken,
        message: 'Application submitted successfully! Save your tracking token to check status.',
      },
    });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to submit application' },
    });
  }
};

// Track application status with token
export const trackApplication = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // Query by trackingToken using N1QL
    const bucketName = database.getBucket().name;
    const cluster = database.getCluster();
    
    const queryString = `
      SELECT applications.* 
      FROM \`${bucketName}\`.main.applications 
      WHERE trackingToken = $token
      LIMIT 1
    `;
    
    const result = await cluster.query(queryString, { parameters: { token } });
    const application = result.rows[0];

    if (!application) {
      return res.status(404).json({
        success: false,
        error: { message: 'Application not found' },
      });
    }

    // Get job and candidate details
    const job = await getJobRepo().findById(application.jobId);
    const candidate = await getCandidateRepo().findById(application.candidateId);

    const publicApplication = {
      id: application.id,
      status: application.status,
      submittedAt: application.createdAt,
      job: job ? {
        title: job.title,
        department: job.department,
        location: job.location,
      } : null,
      candidate: candidate ? {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
      } : null,
      currentStage: application.currentStageId,
      history: (application.activities || []).map((activity: any) => ({
        action: activity.description,
        timestamp: activity.createdAt,
      })),
    };

    res.json({
      success: true,
      data: publicApplication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to track application' },
    });
  }
};

