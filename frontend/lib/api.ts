import axios, { AxiosError } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  ApiResponse,
  User,
  Job,
  Candidate,
  Application,
  Interview,
  Task,
  DashboardMetrics,
  JobFilters,
  CandidateFilters,
  ApplicationFilters,
  InterviewFilters,
} from '@ats/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const response = await axios.post(`${API_URL}/api/auth/refresh`, {
              refreshToken,
            });
            const { accessToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>('/api/auth/register', data),
  
  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/api/auth/login', data),
  
  logout: () => api.post('/api/auth/logout'),
  
  getMe: () => api.get<ApiResponse<User>>('/api/auth/me'),
  
  refreshToken: (data: RefreshTokenRequest) =>
    api.post<ApiResponse<{ accessToken: string }>>('/api/auth/refresh', data),
};

// Users API
export const usersApi = {
  getAll: (params?: any) => api.get<ApiResponse<User[]>>('/api/users', { params }),
  getById: (id: string) => api.get<ApiResponse<User>>(`/api/users/${id}`),
  create: (data: Partial<User>) => api.post<ApiResponse<User>>('/api/users', data),
  update: (id: string, data: Partial<User>) =>
    api.put<ApiResponse<User>>(`/api/users/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/api/users/${id}`),
};

// Jobs API
export const jobsApi = {
  getAll: (params?: JobFilters) =>
    api.get<ApiResponse<Job[]>>('/api/jobs', { params }),
  getById: (id: string) => api.get<ApiResponse<Job>>(`/api/jobs/${id}`),
  create: (data: Partial<Job>) => api.post<ApiResponse<Job>>('/api/jobs', data),
  update: (id: string, data: Partial<Job>) =>
    api.put<ApiResponse<Job>>(`/api/jobs/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/api/jobs/${id}`),
};

// Candidates API
export const candidatesApi = {
  getAll: (params?: CandidateFilters) =>
    api.get<ApiResponse<Candidate[]>>('/api/candidates', { params }),
  getById: (id: string) => api.get<ApiResponse<Candidate>>(`/api/candidates/${id}`),
  create: (data: Partial<Candidate>) =>
    api.post<ApiResponse<Candidate>>('/api/candidates', data),
  update: (id: string, data: Partial<Candidate>) =>
    api.put<ApiResponse<Candidate>>(`/api/candidates/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/api/candidates/${id}`),
  uploadCV: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('cv', file);
    return api.post<ApiResponse<Candidate>>(`/api/candidates/${id}/upload-cv`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Applications API
export const applicationsApi = {
  getAll: (params?: ApplicationFilters) =>
    api.get<ApiResponse<Application[]>>('/api/applications', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<Application>>(`/api/applications/${id}`),
  create: (data: Partial<Application>) =>
    api.post<ApiResponse<Application>>('/api/applications', data),
  update: (id: string, data: Partial<Application>) =>
    api.put<ApiResponse<Application>>(`/api/applications/${id}`, data),
  updateStatus: (id: string, status: string, stageId: string) =>
    api.patch<ApiResponse<Application>>(`/api/applications/${id}/status`, {
      status,
      stageId,
    }),
  addNote: (id: string, content: string) =>
    api.post<ApiResponse<Application>>(`/api/applications/${id}/notes`, { content }),
  delete: (id: string) => api.delete<ApiResponse>(`/api/applications/${id}`),
};

// Interviews API
export const interviewsApi = {
  getAll: (params?: InterviewFilters) =>
    api.get<ApiResponse<Interview[]>>('/api/interviews', { params }),
  getById: (id: string) => api.get<ApiResponse<Interview>>(`/api/interviews/${id}`),
  getMy: (params?: any) =>
    api.get<ApiResponse<Interview[]>>('/api/interviews/my', { params }),
  create: (data: Partial<Interview>) =>
    api.post<ApiResponse<Interview>>('/api/interviews', data),
  update: (id: string, data: Partial<Interview>) =>
    api.put<ApiResponse<Interview>>(`/api/interviews/${id}`, data),
  addFeedback: (id: string, feedback: any) =>
    api.post<ApiResponse<Interview>>(`/api/interviews/${id}/feedback`, feedback),
  delete: (id: string) => api.delete<ApiResponse>(`/api/interviews/${id}`),
};

// Tasks API
export const tasksApi = {
  getAll: (params?: any) => api.get<ApiResponse<Task[]>>('/api/tasks', { params }),
  getMy: (params?: any) =>
    api.get<ApiResponse<Task[]>>('/api/tasks/my', { params }),
  getOverdue: () => api.get<ApiResponse<Task[]>>('/api/tasks/overdue'),
  getById: (id: string) => api.get<ApiResponse<Task>>(`/api/tasks/${id}`),
  create: (data: Partial<Task>) => api.post<ApiResponse<Task>>('/api/tasks', data),
  update: (id: string, data: Partial<Task>) =>
    api.put<ApiResponse<Task>>(`/api/tasks/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/api/tasks/${id}`),
};

// Reports API
export const reportsApi = {
  getDashboard: () =>
    api.get<ApiResponse<DashboardMetrics>>('/api/reports/dashboard'),
  getPipeline: (jobId: string) =>
    api.get<ApiResponse<any>>('/api/reports/pipeline', { params: { jobId } }),
  getSources: () => api.get<ApiResponse<any[]>>('/api/reports/sources'),
  getTimeToHire: (period?: string) =>
    api.get<ApiResponse<any>>('/api/reports/time-to-hire', { params: { period } }),
  export: (type: string) =>
    api.get(`/api/reports/export`, { params: { type }, responseType: 'blob' }),
};

// Public API (no authentication required)
export const publicApi = {
  getJobs: (params?: any) =>
    api.get<ApiResponse<{ jobs: Job[]; total: number }>>('/api/public/jobs', { params }),
  getJobById: (id: string) => api.get<ApiResponse<Job>>(`/api/public/jobs/${id}`),
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post<ApiResponse<{ filename: string; url: string; size: number; mimeType: string }>>('/api/public/upload/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  submitApplication: (data: any) =>
    api.post<ApiResponse<{ applicationId: string; trackingToken: string; message: string }>>('/api/public/applications', data),
  trackApplication: (token: string) =>
    api.get<ApiResponse<any>>(`/api/public/applications/track/${token}`),
};

export default api;

