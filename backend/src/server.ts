import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';

import { database } from './config/database';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { initializeSocket } from './socket';

// Routes
import publicRoutes from './routes/public';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import jobRoutes from './routes/jobs';
import candidateRoutes from './routes/candidates';
import applicationRoutes from './routes/applications';
import interviewRoutes from './routes/interviews';
import taskRoutes from './routes/tasks';
import reportRoutes from './routes/reports';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(fileUpload({
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  abortOnLimit: true,
}));

// Create uploads directory if it doesn't exist
const uploadsDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create resumes directory
const resumesDir = path.join(uploadsDir, 'resumes');
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}

// Create logs directory if it doesn't exist
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs', { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '..', uploadsDir)));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
// Public routes (no authentication required)
app.use('/api/public', publicRoutes);

// Protected routes (authentication required)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);

// API documentation
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'ATS API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login',
        'POST /api/auth/refresh': 'Refresh token',
        'GET /api/auth/me': 'Get current user',
      },
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/:id': 'Get user by ID',
        'POST /api/users': 'Create user (Admin only)',
        'PUT /api/users/:id': 'Update user',
        'DELETE /api/users/:id': 'Delete user (Admin only)',
      },
      jobs: {
        'GET /api/jobs': 'Get all jobs',
        'GET /api/jobs/:id': 'Get job by ID',
        'POST /api/jobs': 'Create job',
        'PUT /api/jobs/:id': 'Update job',
        'DELETE /api/jobs/:id': 'Delete job',
      },
      candidates: {
        'GET /api/candidates': 'Get all candidates',
        'GET /api/candidates/:id': 'Get candidate by ID',
        'POST /api/candidates': 'Create candidate',
        'PUT /api/candidates/:id': 'Update candidate',
        'DELETE /api/candidates/:id': 'Delete candidate',
        'POST /api/candidates/:id/upload-cv': 'Upload CV',
      },
      applications: {
        'GET /api/applications': 'Get all applications',
        'GET /api/applications/:id': 'Get application by ID',
        'POST /api/applications': 'Create application',
        'PUT /api/applications/:id': 'Update application',
        'PATCH /api/applications/:id/status': 'Update application status',
        'POST /api/applications/:id/notes': 'Add note',
        'DELETE /api/applications/:id': 'Delete application',
      },
      interviews: {
        'GET /api/interviews': 'Get all interviews',
        'GET /api/interviews/my': 'Get my interviews',
        'GET /api/interviews/:id': 'Get interview by ID',
        'POST /api/interviews': 'Create interview',
        'PUT /api/interviews/:id': 'Update interview',
        'POST /api/interviews/:id/feedback': 'Add feedback',
        'DELETE /api/interviews/:id': 'Delete interview',
      },
      tasks: {
        'GET /api/tasks': 'Get all tasks',
        'GET /api/tasks/my': 'Get my tasks',
        'GET /api/tasks/overdue': 'Get overdue tasks',
        'GET /api/tasks/:id': 'Get task by ID',
        'POST /api/tasks': 'Create task',
        'PUT /api/tasks/:id': 'Update task',
        'DELETE /api/tasks/:id': 'Delete task',
      },
      reports: {
        'GET /api/reports/dashboard': 'Get dashboard metrics',
        'GET /api/reports/pipeline': 'Get pipeline report',
        'GET /api/reports/sources': 'Get source report',
        'GET /api/reports/time-to-hire': 'Get time to hire report',
        'GET /api/reports/export': 'Export report',
      },
    },
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize Socket.IO
initializeSocket(httpServer);

// Start server
const startServer = async () => {
  try {
    // Connect to Couchbase
    await database.connect();
    
    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📍 API: http://localhost:${PORT}`);
      logger.info(`📍 Health: http://localhost:${PORT}/health`);
      logger.info(`📍 API Docs: http://localhost:${PORT}/api-docs`);
      logger.info(`🔌 Socket.IO is ready`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(async () => {
    logger.info('HTTP server closed');
    await database.disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  httpServer.close(async () => {
    logger.info('HTTP server closed');
    await database.disconnect();
    process.exit(0);
  });
});

startServer();

export default app;

