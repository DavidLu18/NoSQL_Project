# 📁 Cấu trúc Dự án

```
NoSQL_Project/
│
├── 📂 backend/                       # Express TypeScript API
│   ├── src/
│   │   ├── config/                   # Cấu hình (database, jwt)
│   │   │   ├── database.ts           # Kết nối Couchbase
│   │   │   └── jwt.ts                # JWT config
│   │   │
│   │   ├── controllers/              # Route controllers
│   │   │   ├── authController.ts     # Auth endpoints
│   │   │   ├── userController.ts     # Users CRUD
│   │   │   ├── jobController.ts      # Jobs CRUD
│   │   │   ├── candidateController.ts
│   │   │   ├── applicationController.ts
│   │   │   ├── interviewController.ts
│   │   │   ├── taskController.ts
│   │   │   └── reportController.ts   # Analytics
│   │   │
│   │   ├── middleware/               # Express middleware
│   │   │   ├── auth.ts               # JWT authentication
│   │   │   ├── errorHandler.ts       # Error handling
│   │   │   └── validation.ts         # Zod validation
│   │   │
│   │   ├── models/                   # TypeScript interfaces (unused)
│   │   │
│   │   ├── repositories/             # Data access layer
│   │   │   ├── BaseRepository.ts     # Generic CRUD
│   │   │   ├── UserRepository.ts     # Users queries
│   │   │   ├── JobRepository.ts      # Jobs queries
│   │   │   ├── CandidateRepository.ts
│   │   │   ├── ApplicationRepository.ts
│   │   │   ├── InterviewRepository.ts
│   │   │   └── TaskRepository.ts
│   │   │
│   │   ├── routes/                   # API routes
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── jobs.ts
│   │   │   ├── candidates.ts
│   │   │   ├── applications.ts
│   │   │   ├── interviews.ts
│   │   │   ├── tasks.ts
│   │   │   └── reports.ts
│   │   │
│   │   ├── scripts/                  # Utility scripts
│   │   │   ├── seed.ts               # Seed dữ liệu mẫu
│   │   │   └── clearDb.ts            # Xóa database
│   │   │
│   │   ├── socket/                   # Socket.IO server
│   │   │   └── index.ts              # Realtime handlers
│   │   │
│   │   ├── utils/                    # Helper functions
│   │   │   ├── logger.ts             # Winston logger
│   │   │   └── helpers.ts            # Utility functions
│   │   │
│   │   └── server.ts                 # Entry point
│   │
│   ├── uploads/                      # File storage
│   ├── logs/                         # Application logs
│   ├── .env                          # Environment variables
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── 📂 frontend/                      # Next.js React App
│   ├── app/                          # App Router
│   │   ├── dashboard/                # Protected routes
│   │   │   ├── layout.tsx            # Dashboard layout
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── jobs/page.tsx         # Jobs management
│   │   │   ├── candidates/page.tsx   # Candidates list
│   │   │   ├── applications/page.tsx # Kanban board
│   │   │   ├── interviews/page.tsx   # Calendar view
│   │   │   ├── tasks/page.tsx        # Tasks list
│   │   │   ├── reports/page.tsx      # Analytics
│   │   │   └── users/page.tsx        # Users admin
│   │   │
│   │   ├── login/page.tsx            # Login page
│   │   ├── register/page.tsx         # Registration
│   │   ├── page.tsx                  # Home page
│   │   ├── layout.tsx                # Root layout
│   │   ├── providers.tsx             # React Query, etc
│   │   └── globals.css               # Global styles
│   │
│   ├── components/                   # React components
│   │   ├── layout/                   # Layout components
│   │   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   │   └── Header.tsx            # Top header bar
│   │   │
│   │   └── ui/                       # UI components
│   │       ├── Button.tsx            # Neo-brutalism button
│   │       ├── Card.tsx              # Card component
│   │       ├── Input.tsx             # Form inputs
│   │       ├── Select.tsx            # Dropdown select
│   │       ├── Badge.tsx             # Status badges
│   │       └── Modal.tsx             # Modal dialog
│   │
│   ├── lib/                          # Libraries
│   │   ├── api.ts                    # Axios API client
│   │   └── socket.ts                 # Socket.IO client
│   │
│   ├── store/                        # State management
│   │   ├── authStore.ts              # Zustand auth store
│   │   └── realtimeStore.ts          # Realtime state
│   │
│   ├── .env.local                    # Environment variables
│   ├── next.config.js                # Next.js config
│   ├── tailwind.config.ts            # Tailwind config
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
├── 📂 shared/                        # Shared TypeScript types
│   ├── src/
│   │   ├── types/
│   │   │   └── index.ts              # All shared types
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── 📄 docker-compose.yml             # Docker orchestration
├── 📄 package.json                   # Root package.json
├── 📄 README.md                      # Main documentation
├── 📄 SETUP_GUIDE.md                 # Detailed setup guide
├── 📄 QUICKSTART.md                  # Quick start guide
├── 📄 PROJECT_STRUCTURE.md           # This file
└── 📄 .gitignore                     # Git ignore rules

```

## 🎯 Key Patterns

### Backend Architecture

- **Repository Pattern**: Data access separated from business logic
- **Middleware Chain**: Auth → Validation → Controller → Response
- **Error Handling**: Centralized error handler with custom AppError
- **JWT Auth**: Access token + refresh token flow
- **Socket.IO**: Realtime updates for applications and notifications

### Frontend Architecture

- **App Router**: Next.js 14+ file-based routing
- **Component Library**: Reusable Neo-brutalism UI components
- **State Management**: 
  - Zustand for client state (auth, realtime)
  - React Query for server state (API data)
- **API Layer**: Centralized Axios client with interceptors
- **Real-time**: Socket.IO integration with Zustand

## 📦 Key Dependencies

### Backend
- `express` - Web framework
- `couchbase` - Database SDK
- `jsonwebtoken` - JWT auth
- `socket.io` - Realtime
- `zod` - Validation
- `winston` - Logging

### Frontend
- `next` - React framework
- `react-query` - Server state
- `zustand` - Client state
- `framer-motion` - Animations
- `recharts` - Charts
- `socket.io-client` - Realtime
- `tailwindcss` - Styling

## 🎨 Design System

Neo-brutalism principles:
- Bold borders (4px)
- Bright colors with high contrast
- Layered shadows
- Bold typography
- Minimal animations
- Clear hierarchy

## 🔐 Security

- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt
- CORS configuration
- Input validation with Zod
- SQL injection prevention (N1QL parameterized queries)

## 🚀 Performance

- React Query caching
- Optimistic UI updates
- Code splitting (Next.js automatic)
- Image optimization
- Database indexing
- Connection pooling

