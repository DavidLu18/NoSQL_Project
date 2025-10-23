import dotenv from 'dotenv';
dotenv.config();

import { database } from '../config/database';
import { logger } from '../utils/logger';
import { UserRepository } from '../repositories/UserRepository';
import { JobRepository } from '../repositories/JobRepository';
import { CandidateRepository } from '../repositories/CandidateRepository';
import { ApplicationRepository } from '../repositories/ApplicationRepository';
import { InterviewRepository } from '../repositories/InterviewRepository';
import { TaskRepository } from '../repositories/TaskRepository';
import { hashPassword, generateId } from '../utils/helpers';
import {
  UserRole,
  JobStatus,
  JobType,
  ExperienceLevel,
  CandidateSource,
  ApplicationStatus,
  InterviewStatus,
  InterviewType,
  TaskStatus,
  TaskPriority,
} from '@ats/shared';

const defaultPipeline = [
  { id: 'new', name: 'New', order: 1, color: '#FF6B6B' },
  { id: 'screening', name: 'Screening', order: 2, color: '#4ECDC4' },
  { id: 'phone', name: 'Phone Interview', order: 3, color: '#45B7D1' },
  { id: 'technical', name: 'Technical Test', order: 4, color: '#FFA07A' },
  { id: 'onsite', name: 'Onsite Interview', order: 5, color: '#98D8C8' },
  { id: 'offer', name: 'Offer', order: 6, color: '#F7DC6F' },
  { id: 'hired', name: 'Hired', order: 7, color: '#52B788' },
];

async function seedUsers(userRepo: UserRepository) {
  logger.info('Seeding users...');

  const users = [
    {
      id: generateId('user'),
      email: 'admin@ats.com',
      password: await hashPassword('Admin123!'),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('user'),
      email: 'recruiter@ats.com',
      password: await hashPassword('Recruiter123!'),
      firstName: 'John',
      lastName: 'Recruiter',
      role: UserRole.RECRUITER,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('user'),
      email: 'manager@ats.com',
      password: await hashPassword('Manager123!'),
      firstName: 'Jane',
      lastName: 'Manager',
      role: UserRole.HIRING_MANAGER,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('user'),
      email: 'interviewer@ats.com',
      password: await hashPassword('Interviewer123!'),
      firstName: 'Mike',
      lastName: 'Interviewer',
      role: UserRole.INTERVIEWER,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('user'),
      email: 'recruiter2@ats.com',
      password: await hashPassword('Recruiter123!'),
      firstName: 'Sarah',
      lastName: 'Smith',
      role: UserRole.RECRUITER,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const user of users) {
    try {
      const existing = await userRepo.findByEmail(user.email);
      if (!existing) {
        await userRepo.create(user.id, user);
        logger.info(`Created user: ${user.email}`);
      } else {
        logger.info(`User already exists: ${user.email}`);
      }
    } catch (error) {
      logger.error(`Failed to create user ${user.email}:`, error);
    }
  }

  return users;
}

async function seedJobs(jobRepo: JobRepository, users: any[]) {
  logger.info('Seeding jobs...');

  const recruiter = users.find((u) => u.role === UserRole.RECRUITER);
  const manager = users.find((u) => u.role === UserRole.HIRING_MANAGER);

  const jobs = [
    {
      id: generateId('job'),
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.SENIOR,
      description: 'We are looking for a Senior Software Engineer to join our team.',
      requirements: ['5+ years of experience', 'React expertise', 'Node.js knowledge'],
      responsibilities: ['Design and implement features', 'Mentor junior developers'],
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      salaryMin: 120000,
      salaryMax: 180000,
      currency: 'USD',
      status: JobStatus.OPEN,
      recruiterId: recruiter?.id,
      hiringManagerId: manager?.id,
      openings: 2,
      pipeline: defaultPipeline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('job'),
      title: 'Product Manager',
      department: 'Product',
      location: 'New York, NY',
      type: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.MID,
      description: 'Seeking a Product Manager to drive product strategy.',
      requirements: ['3+ years PM experience', 'Data-driven mindset'],
      responsibilities: ['Define product roadmap', 'Work with stakeholders'],
      skills: ['Product Management', 'Analytics', 'Agile'],
      salaryMin: 100000,
      salaryMax: 140000,
      currency: 'USD',
      status: JobStatus.OPEN,
      recruiterId: recruiter?.id,
      hiringManagerId: manager?.id,
      openings: 1,
      pipeline: defaultPipeline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('job'),
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'San Francisco, CA',
      type: JobType.FULL_TIME,
      experienceLevel: ExperienceLevel.MID,
      description: 'Creative UX/UI Designer needed for our design team.',
      requirements: ['Portfolio required', 'Figma proficiency'],
      responsibilities: ['Design user interfaces', 'Conduct user research'],
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
      salaryMin: 90000,
      salaryMax: 130000,
      currency: 'USD',
      status: JobStatus.OPEN,
      recruiterId: recruiter?.id,
      openings: 1,
      pipeline: defaultPipeline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const job of jobs) {
    try {
      await jobRepo.create(job.id, job);
      logger.info(`Created job: ${job.title}`);
    } catch (error) {
      logger.error(`Failed to create job ${job.title}:`, error);
    }
  }

  return jobs;
}

async function seedCandidates(candidateRepo: CandidateRepository) {
  logger.info('Seeding candidates...');

  const candidates = [
    {
      id: generateId('candidate'),
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@email.com',
      phone: '+1234567890',
      location: 'San Francisco, CA',
      currentTitle: 'Software Engineer',
      currentCompany: 'Tech Corp',
      experienceYears: 6,
      skills: ['React', 'Node.js', 'TypeScript', 'Python'],
      source: CandidateSource.LINKEDIN,
      tags: ['frontend', 'backend'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('candidate'),
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@email.com',
      phone: '+1234567891',
      location: 'New York, NY',
      currentTitle: 'Senior Product Manager',
      currentCompany: 'StartupXYZ',
      experienceYears: 5,
      skills: ['Product Management', 'Analytics', 'Agile', 'Leadership'],
      source: CandidateSource.INDEED,
      tags: ['product', 'leadership'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('candidate'),
      firstName: 'Carol',
      lastName: 'White',
      email: 'carol.white@email.com',
      phone: '+1234567892',
      location: 'Los Angeles, CA',
      currentTitle: 'UX Designer',
      currentCompany: 'Design Studio',
      experienceYears: 4,
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
      source: CandidateSource.REFERRAL,
      tags: ['design', 'ux'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('candidate'),
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@email.com',
      location: 'Remote',
      currentTitle: 'Full Stack Developer',
      experienceYears: 7,
      skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
      source: CandidateSource.CAREER_SITE,
      tags: ['fullstack', 'senior'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const candidate of candidates) {
    try {
      await candidateRepo.create(candidate.id, candidate);
      logger.info(`Created candidate: ${candidate.firstName} ${candidate.lastName}`);
    } catch (error) {
      logger.error(`Failed to create candidate:`, error);
    }
  }

  return candidates;
}

async function seedApplications(applicationRepo: ApplicationRepository, jobs: any[], candidates: any[], users: any[]) {
  logger.info('Seeding applications...');

  const recruiter = users.find((u) => u.role === UserRole.RECRUITER);
  const applications = [];

  // Create applications for each job
  for (let i = 0; i < Math.min(jobs.length, 3); i++) {
    const job = jobs[i];
    const candidate = candidates[i % candidates.length];
    
    const statuses = [
      ApplicationStatus.NEW,
      ApplicationStatus.SCREENING,
      ApplicationStatus.PHONE_INTERVIEW,
      ApplicationStatus.ONSITE_INTERVIEW,
    ];

    const appId = generateId('application');
    const application = {
      id: appId,
      jobId: job.id,
      candidateId: candidate.id,
      status: statuses[i % statuses.length],
      currentStageId: defaultPipeline[i % 4].id,
      appliedAt: new Date().toISOString(),
      source: candidate.source,
      notes: [],
      activities: [
        {
          id: generateId('activity'),
          type: 'application_created',
          userId: recruiter?.id || 'system',
          description: 'Application submitted',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await applicationRepo.create(appId, application);
      applications.push(application);
      logger.info(`Created application for ${candidate.firstName} - ${job.title}`);
    } catch (error) {
      logger.error('Failed to create application:', error);
    }
  }

  return applications;
}

async function seedInterviews(interviewRepo: InterviewRepository, applications: any[], users: any[]) {
  logger.info('Seeding interviews...');

  const interviewer = users.find((u) => u.role === UserRole.INTERVIEWER);
  const recruiter = users.find((u) => u.role === UserRole.RECRUITER);

  const interviews = [];

  for (let i = 0; i < Math.min(applications.length, 2); i++) {
    const app = applications[i];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10 + i, 0, 0, 0);

    const interviewId = generateId('interview');
    const interview = {
      id: interviewId,
      applicationId: app.id,
      jobId: app.jobId,
      candidateId: app.candidateId,
      type: InterviewType.VIDEO,
      status: InterviewStatus.SCHEDULED,
      scheduledDate: tomorrow.toISOString(),
      duration: 60,
      meetingLink: 'https://zoom.us/j/123456789',
      interviewers: [interviewer?.id || recruiter?.id],
      feedback: [],
      createdBy: recruiter?.id || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await interviewRepo.create(interviewId, interview);
      interviews.push(interview);
      logger.info(`Created interview for application ${app.id}`);
    } catch (error) {
      logger.error('Failed to create interview:', error);
    }
  }

  return interviews;
}

async function seedTasks(taskRepo: TaskRepository, jobs: any[], applications: any[], users: any[]) {
  logger.info('Seeding tasks...');

  const recruiter = users.find((u) => u.role === UserRole.RECRUITER);

  const tasks = [
    {
      id: generateId('task'),
      title: 'Review applications for Senior Software Engineer',
      description: 'Go through new applications and shortlist candidates',
      assigneeId: recruiter?.id,
      relatedTo: { type: 'job' as const, id: jobs[0]?.id },
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: recruiter?.id || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId('task'),
      title: 'Schedule technical interview',
      description: 'Coordinate with candidate and interviewers',
      assigneeId: recruiter?.id,
      relatedTo: { type: 'application' as const, id: applications[0]?.id },
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: recruiter?.id || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const task of tasks) {
    try {
      await taskRepo.create(task.id, task);
      logger.info(`Created task: ${task.title}`);
    } catch (error) {
      logger.error('Failed to create task:', error);
    }
  }

  return tasks;
}

async function main() {
  try {
    logger.info('🌱 Starting database seed...');

    // Connect to database
    await database.connect();

    // Initialize repositories after database connection
    const userRepo = new UserRepository();
    const jobRepo = new JobRepository();
    const candidateRepo = new CandidateRepository();
    const applicationRepo = new ApplicationRepository();
    const interviewRepo = new InterviewRepository();
    const taskRepo = new TaskRepository();

    // Seed data
    const users = await seedUsers(userRepo);
    const jobs = await seedJobs(jobRepo, users);
    const candidates = await seedCandidates(candidateRepo);
    const applications = await seedApplications(applicationRepo, jobs, candidates, users);
    const interviews = await seedInterviews(interviewRepo, applications, users);
    const tasks = await seedTasks(taskRepo, jobs, applications, users);

    logger.info('✅ Database seeded successfully!');
    logger.info(`   - ${users.length} users`);
    logger.info(`   - ${jobs.length} jobs`);
    logger.info(`   - ${candidates.length} candidates`);
    logger.info(`   - ${applications.length} applications`);
    logger.info(`   - ${interviews.length} interviews`);
    logger.info(`   - ${tasks.length} tasks`);

    // Disconnect
    await database.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seed failed:', error);
    await database.disconnect();
    process.exit(1);
  }
}

main();

