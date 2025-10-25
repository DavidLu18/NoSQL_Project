# ATS Application with Couchbase

Hệ thống quản lý tuyển dụng (Applicant Tracking System) với giao diện Neo-brutalism, được xây dựng bằng Next.js, Express, TypeScript và Couchbase.

## 🏗️ Kiến trúc

- **Frontend**: Next.js 15 (App Router) + React + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + TypeScript + Socket.IO
- **Database**: Couchbase Server 7.x
- **Design**: Neo-brutalism UI/UX với animation mượt mà

## ✨ Tính năng

### Quản lý Tuyển dụng
- ✅ Dashboard tổng quan với KPI và biểu đồ
- ✅ Quản lý công việc (Jobs) - CRUD, gán recruiter
- ✅ Quản lý ứng viên (Candidates) - Profile, CV, kỹ năng
- ✅ Quy trình pipeline (Kanban board) với real-time updates
- ✅ Lịch phỏng vấn (Calendar) với tích hợp ICS
- ✅ Quản lý đơn ứng tuyển (Applications)
- ✅ Tasks & Notes cho recruiter
- ✅ Báo cáo và thống kê chi tiết

### Phân quyền & Bảo mật
- ✅ JWT Authentication với refresh token
- ✅ Role-based Access Control (Admin, Recruiter, Hiring Manager, Interviewer)
- ✅ Session management với Couchbase
- ✅ Audit logs

### Tính năng Real-time
- ✅ Cập nhật pipeline tự động
- ✅ Notifications
- ✅ Chat giữa Recruiter và Hiring Manager

### Trang công khai
- ✅ Job Board - Danh sách việc làm
- ✅ Application Form - Multi-step với upload CV

## 📋 Yêu cầu hệ thống

- Node.js >= 18.x
- npm >= 9.x
- Couchbase Server >= 7.x (đang chạy trên http://localhost:8091)

## 🚀 Cài đặt

### 1. Clone và cài đặt dependencies

```bash
# Cài đặt dependencies cho toàn bộ monorepo
npm install

# Cài đặt cho từng workspace
cd backend && npm install
cd ../frontend && npm install
cd ../shared && npm install
```

### 2. Thiết lập Couchbase

Đăng nhập vào Couchbase Web Console tại `http://localhost:8091` với:
- Username: `Admin`
- Password: `123456`

**Tạo Bucket và Collections:**

```sql
-- Chạy các lệnh sau trong Query Editor của Couchbase

-- Tạo bucket (nếu chưa có)
-- Làm thủ công qua UI: Buckets > Add Bucket
-- Name: ats_bucket
-- Memory Quota: 512 MB (tối thiểu)

-- Tạo scope và collections
CREATE SCOPE ats_bucket.main IF NOT EXISTS;
CREATE COLLECTION ats_bucket.main.users IF NOT EXISTS;
CREATE COLLECTION ats_bucket.main.sessions IF NOT EXISTS;
CREATE COLLECTION ats_bucket.main.jobs IF NOT EXISTS;
CREATE COLLECTION ats_bucket.main.candidates IF NOT EXISTS;
CREATE COLLECTION ats_bucket.main.applications IF NOT EXISTS;
CREATE COLLECTION ats_bucket.main.interviews IF NOT EXISTS;
CREATE COLLECTION ats_bucket.main.tasks IF NOT EXISTS;
CREATE COLLECTION ats_bucket.main.reports IF NOT EXISTS;
CREATE COLLECTION ats_bucket.main.activities IF NOT EXISTS;

-- Tạo Primary Index
CREATE PRIMARY INDEX ON ats_bucket.main.users;
CREATE PRIMARY INDEX ON ats_bucket.main.jobs;
CREATE PRIMARY INDEX ON ats_bucket.main.candidates;
CREATE PRIMARY INDEX ON ats_bucket.main.applications;
CREATE PRIMARY INDEX ON ats_bucket.main.interviews;
CREATE PRIMARY INDEX ON ats_bucket.main.tasks;
CREATE PRIMARY INDEX ON ats_bucket.main.reports;
CREATE PRIMARY INDEX ON ats_bucket.main.activities;

-- Tạo các index cho query hiệu quả
CREATE INDEX idx_users_email ON ats_bucket.main.users(email);
CREATE INDEX idx_users_role ON ats_bucket.main.users(`role`);
CREATE INDEX idx_jobs_status ON ats_bucket.main.jobs(`status`);
CREATE INDEX idx_applications_job ON ats_bucket.main.applications(jobId);
CREATE INDEX idx_applications_candidate ON ats_bucket.main.applications(candidateId);
CREATE INDEX idx_applications_status ON ats_bucket.main.applications(`status`);
CREATE INDEX idx_interviews_date ON ats_bucket.main.interviews(scheduledDate);
CREATE INDEX idx_candidates_skills ON ats_bucket.main.candidates(skills);
```

### 3. Cấu hình môi trường

**Backend** - Tạo file `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Couchbase
COUCHBASE_URL=couchbase://localhost
COUCHBASE_USERNAME=Admin
COUCHBASE_PASSWORD=123456
COUCHBASE_BUCKET=ats_bucket

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

**Frontend** - Tạo file `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

### 4. Seed dữ liệu mẫu

```bash
cd backend
npm run seed
```

Lệnh này sẽ tạo:
- 5 users mẫu (Admin, Recruiters, Hiring Managers)
- 10 jobs mẫu
- 30 candidates mẫu
- 50 applications mẫu
- 20 interviews mẫu
- Report snapshots

**Tài khoản demo:**
- Admin: `admin@ats.com` / `Admin123!`
- Recruiter: `recruiter@ats.com` / `Recruiter123!`
- Hiring Manager: `manager@ats.com` / `Manager123!`

### 5. Khởi chạy ứng dụng

**Chạy cả Backend và Frontend cùng lúc:**

```bash
# Từ thư mục root
npm run dev
```

Hoặc chạy riêng từng service:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

**Truy cập ứng dụng:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

## 📁 Cấu trúc thư mục

```
ats-couchbase-monorepo/
├── backend/              # Express API server
│   ├── src/
│   │   ├── config/       # Couchbase, JWT config
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── models/       # TypeScript interfaces
│   │   ├── repositories/ # Couchbase data access layer
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── socket/       # Socket.IO handlers
│   │   ├── utils/        # Helpers
│   │   └── server.ts     # Entry point
│   ├── uploads/          # File storage
│   └── package.json
├── frontend/             # Next.js application
│   ├── src/
│   │   ├── app/          # App Router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # API client, utils
│   │   ├── hooks/        # Custom React hooks
│   │   ├── store/        # Zustand state management
│   │   └── styles/       # Global styles
│   └── package.json
├── shared/               # Shared TypeScript types
│   ├── src/
│   │   └── types/
│   └── package.json
└── package.json          # Root package.json
```

## 🎨 Design System - Neo-brutalism

Ứng dụng sử dụng phong cách thiết kế Neo-brutalism với:
- **Màu sắc**: Palette tươi sáng, tương phản cao
- **Typography**: Font đậm, rõ ràng
- **Borders**: Viền đen dày
- **Shadows**: Drop shadow nhiều lớp
- **Layout**: Grid rõ ràng, không bo góc hoặc bo góc tối thiểu
- **Animation**: Micro-interactions mượt mà với Framer Motion

## 🔧 Scripts hữu ích

```bash
# Development
npm run dev                  # Chạy toàn bộ stack
npm run dev:backend          # Chỉ chạy backend
npm run dev:frontend         # Chỉ chạy frontend

# Build
npm run build                # Build toàn bộ
npm run build:backend        # Build backend
npm run build:frontend       # Build frontend

# Linting
npm run lint                 # Lint toàn bộ
npm run lint:backend         # Lint backend
npm run lint:frontend        # Lint frontend

# Backend specific
cd backend
npm run seed                 # Seed dữ liệu mẫu
npm run clear-db             # Xóa toàn bộ dữ liệu
npm test                     # (Chưa cài đặt)

# Frontend specific
cd frontend
npm run build                # Production build
npm start                    # Start production server
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Đăng xuất

### Users
- `GET /api/users` - Danh sách users
- `GET /api/users/:id` - Chi tiết user
- `POST /api/users` - Tạo user
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

### Jobs
- `GET /api/jobs` - Danh sách jobs
- `GET /api/jobs/:id` - Chi tiết job
- `POST /api/jobs` - Tạo job
- `PUT /api/jobs/:id` - Cập nhật job
- `DELETE /api/jobs/:id` - Xóa job

### Candidates
- `GET /api/candidates` - Danh sách ứng viên
- `GET /api/candidates/:id` - Chi tiết ứng viên
- `POST /api/candidates` - Tạo ứng viên
- `PUT /api/candidates/:id` - Cập nhật ứng viên
- `DELETE /api/candidates/:id` - Xóa ứng viên
- `POST /api/candidates/:id/upload-cv` - Upload CV

### Applications
- `GET /api/applications` - Danh sách đơn ứng tuyển
- `GET /api/applications/:id` - Chi tiết đơn
- `POST /api/applications` - Tạo đơn ứng tuyển
- `PUT /api/applications/:id` - Cập nhật đơn
- `PATCH /api/applications/:id/status` - Thay đổi trạng thái
- `POST /api/applications/:id/notes` - Thêm ghi chú

### Interviews
- `GET /api/interviews` - Danh sách phỏng vấn
- `GET /api/interviews/:id` - Chi tiết phỏng vấn
- `POST /api/interviews` - Tạo lịch phỏng vấn
- `PUT /api/interviews/:id` - Cập nhật lịch
- `DELETE /api/interviews/:id` - Hủy phỏng vấn

### Tasks
- `GET /api/tasks` - Danh sách tasks
- `POST /api/tasks` - Tạo task
- `PUT /api/tasks/:id` - Cập nhật task
- `DELETE /api/tasks/:id` - Xóa task

### Reports
- `GET /api/reports/dashboard` - Dashboard metrics
- `GET /api/reports/pipeline` - Pipeline statistics
- `GET /api/reports/sources` - Candidate sources
- `GET /api/reports/time-to-hire` - Time to hire metrics
- `GET /api/reports/export` - Export CSV

## 🔌 WebSocket Events

### Client → Server
- `join_room` - Tham gia room (job/application)
- `leave_room` - Rời room
- `send_message` - Gửi message

### Server → Client
- `application_updated` - Đơn ứng tuyển cập nhật
- `interview_scheduled` - Lịch phỏng vấn mới
- `status_changed` - Trạng thái thay đổi
- `new_message` - Message mới
- `notification` - Thông báo

## 🐛 Troubleshooting

### Couchbase connection error
- Đảm bảo Couchbase Server đang chạy
- Kiểm tra username/password trong `.env`
- Kiểm tra bucket `ats_bucket` đã được tạo

### Frontend không kết nối được Backend
- Kiểm tra Backend đang chạy trên port 5000
- Kiểm tra CORS settings trong backend
- Kiểm tra `NEXT_PUBLIC_API_URL` trong `.env.local`

### Upload file không hoạt động
- Kiểm tra thư mục `backend/uploads` đã được tạo
- Kiểm tra `MAX_FILE_SIZE` trong `.env`

## 🧭 Định hướng phát triển

Tham khảo tài liệu [Đề xuất cải tiến & chức năng bổ sung](./DE_XUAT_CAI_TIEN_CHUC_NANG.md) để xem roadmap đề xuất và các tính năng gợi ý trong tương lai.

## 📝 License

MIT

## 👥 Tác giả

Dự án "Tìm hiểu công cụ và thiết kế CSDL tài liệu bằng Couchbase cho Quản lý hồ sơ ứng viên và tuyển dụng trực tuyến"

