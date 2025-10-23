// User types
export enum UserRole {
  ADMIN = 'admin',
  RECRUITER = 'recruiter',
  HIRING_MANAGER = 'hiring_manager',
  INTERVIEWER = 'interviewer'
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends Omit<User, 'password'> {}

// Job types
export enum JobStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  CLOSED = 'closed',
  ON_HOLD = 'on_hold'
}

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship'
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  EXECUTIVE = 'executive'
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: JobType;
  experienceLevel: ExperienceLevel;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  status: JobStatus;
  recruiterId: string;
  hiringManagerId?: string;
  openings: number;
  pipeline: PipelineStage[];
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
}

// Candidate types
export enum CandidateSource {
  LINKEDIN = 'linkedin',
  INDEED = 'indeed',
  REFERRAL = 'referral',
  CAREER_SITE = 'career_site',
  JOB_BOARD = 'job_board',
  AGENCY = 'agency',
  OTHER = 'other'
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  currentTitle?: string;
  currentCompany?: string;
  experienceYears?: number;
  education?: Education[];
  skills: string[];
  resume?: FileAttachment;
  coverLetter?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  source: CandidateSource;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
}

export interface FileAttachment {
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

// Application types
export enum ApplicationStatus {
  NEW = 'new',
  SCREENING = 'screening',
  PHONE_INTERVIEW = 'phone_interview',
  TECHNICAL_TEST = 'technical_test',
  ONSITE_INTERVIEW = 'onsite_interview',
  OFFER = 'offer',
  HIRED = 'hired',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  currentStageId: string;
  appliedAt: string;
  source: CandidateSource;
  notes: ApplicationNote[];
  activities: Activity[];
  rating?: number;
  feedback?: string;
  trackingToken?: string;
  resumeUrl?: string;
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationNote {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: string;
  userId: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Interview types
export enum InterviewType {
  PHONE = 'phone',
  VIDEO = 'video',
  ONSITE = 'onsite',
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  PANEL = 'panel'
}

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  type: InterviewType;
  status: InterviewStatus;
  scheduledDate: string;
  duration: number; // minutes
  location?: string;
  meetingLink?: string;
  interviewers: string[]; // user IDs
  feedback?: InterviewFeedback[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewFeedback {
  userId: string;
  rating: number;
  strengths?: string;
  weaknesses?: string;
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no';
  comments?: string;
  submittedAt: string;
}

// Task types
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  CANCELLED = 'cancelled'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  relatedTo?: {
    type: 'job' | 'candidate' | 'application' | 'interview';
    id: string;
  };
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  completedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Report types
export interface DashboardMetrics {
  openJobs: number;
  totalApplications: number;
  activeInterviews: number;
  hiredThisMonth: number;
  avgTimeToHire: number; // days
  applicationsByStatus: Record<ApplicationStatus, number>;
  topSources: { source: CandidateSource; count: number }[];
  pipelineFunnel: { stage: string; count: number }[];
  interviewsThisWeek: number;
}

export interface PipelineReport {
  jobId: string;
  jobTitle: string;
  stages: {
    stageId: string;
    stageName: string;
    count: number;
    avgTimeInStage: number; // days
    conversionRate: number; // percentage
  }[];
}

export interface SourceReport {
  source: CandidateSource;
  totalApplications: number;
  hired: number;
  rejected: number;
  inProgress: number;
  hireRate: number; // percentage
  avgTimeToHire: number; // days
}

export interface TimeToHireReport {
  period: string;
  jobs: {
    jobId: string;
    jobTitle: string;
    hired: number;
    avgDays: number;
    minDays: number;
    maxDays: number;
  }[];
  overall: {
    totalHired: number;
    avgDays: number;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Socket events
export interface SocketEvents {
  // Client to Server
  join_room: (room: string) => void;
  leave_room: (room: string) => void;
  send_message: (data: { room: string; message: string }) => void;

  // Server to Client
  application_updated: (data: { applicationId: string; status: ApplicationStatus }) => void;
  interview_scheduled: (data: { interviewId: string }) => void;
  status_changed: (data: { applicationId: string; oldStatus: ApplicationStatus; newStatus: ApplicationStatus }) => void;
  new_message: (data: { room: string; message: string; userId: string; timestamp: string }) => void;
  notification: (data: { type: string; message: string; metadata?: any }) => void;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filter types
export interface JobFilters extends PaginationParams {
  status?: JobStatus;
  type?: JobType;
  department?: string;
  location?: string;
  experienceLevel?: ExperienceLevel;
  recruiterId?: string;
  search?: string;
}

export interface CandidateFilters extends PaginationParams {
  skills?: string[];
  source?: CandidateSource;
  experienceMin?: number;
  experienceMax?: number;
  search?: string;
}

export interface ApplicationFilters extends PaginationParams {
  jobId?: string;
  candidateId?: string;
  status?: ApplicationStatus;
  source?: CandidateSource;
  dateFrom?: string;
  dateTo?: string;
}

export interface InterviewFilters extends PaginationParams {
  jobId?: string;
  candidateId?: string;
  status?: InterviewStatus;
  type?: InterviewType;
  dateFrom?: string;
  dateTo?: string;
  interviewerId?: string;
}

