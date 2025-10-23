# 🚀 BẮT ĐẦU SỬ DỤNG - Hệ Thống ATS

## ⚡ KHỞI CHẠY NHANH (3 Terminals)

### Terminal 1: Backend
```bash
cd "D:\ALL PROJECTS\NoSQL_Project\backend"
npm run dev
```
✅ Backend chạy tại: http://localhost:5000

### Terminal 2: Frontend  
```bash
cd "D:\ALL PROJECTS\NoSQL_Project\frontend"

# XÓA CACHE (Quan trọng cho drag & drop!)
rm -rf .next
# Hoặc Windows PowerShell:
Remove-Item -Recurse -Force .next

# Chạy dev server
npm run dev
```
✅ Frontend chạy tại: http://localhost:3000

### Terminal 3: Seed Data (Tùy chọn)
```bash
cd "D:\ALL PROJECTS\NoSQL_Project\backend"
npm run seed
```
✅ Tạo: 4 jobs, 5 candidates, 10 applications

---

## 🎯 ĐĂNG NHẬP

### Recruiter/Admin:
```
URL: http://localhost:3000/login
Email: admin@ats.com
Password: Admin123!
```

### Sau khi login, bạn có thể:
- ✅ Quản lý Jobs
- ✅ Quản lý Candidates
- ✅ **KÉO THẢ Applications** (Drag & Drop)
- ✅ Schedule Interviews
- ✅ Create Tasks
- ✅ View Reports

---

## 🎨 TEST DRAG & DROP

### Bước 1: Vào Applications Pipeline
```
http://localhost:3000/dashboard/applications
```

### Bước 2: Kiểm Tra
- ✅ Thấy columns: New, Screening, Phone Interview, etc.
- ✅ Thấy application cards (nếu đã seed)
- ✅ Không có lỗi trong browser console (F12)

### Bước 3: Drag & Drop
1. **Click vào application card** (giữ chuột)
2. **Cursor đổi thành hand** (grabbing)
3. **Kéo sang column khác**
4. **Thả chuột**
5. ✅ Card di chuyển mượt
6. ✅ Toast: "Application moved successfully! 🎉"

### Bước 4: Verify Backend Update
- Mở DevTools (F12) → Network tab
- Kéo thả một card
- Thấy: `PUT /api/applications/:id/status` → Status 200

---

## 💼 TEST JOB SEEKER FLOW

### 1. Tìm Việc
```
http://localhost:3000/jobs
```
- Tìm kiếm công việc
- Filter theo location, type, experience
- Click vào job để xem chi tiết

### 2. Ứng Tuyển
- Click "Apply Now"
- Điền form thông tin
- Upload CV (PDF/DOC/DOCX, max 5MB)
- Viết cover letter
- Submit

### 3. Lưu Tracking Token
```
Example Token: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```
⚠️ **LƯU LẠI TOKEN NÀY!**

### 4. Track Application
```
http://localhost:3000/track
```
- Nhập tracking token
- Xem status hiện tại
- Xem lịch sử timeline

### 5. Test Real-time Update
**A. Recruiter:**
- Login dashboard
- Go to Applications Pipeline
- Kéo thả application sang stage mới
- Toast notification

**B. Job Seeker:**
- Vào `/track` với token
- **Refresh trang** (Ctrl+R)
- ✅ Thấy activity mới trong timeline!

---

## 🔧 TROUBLESHOOTING

### Drag & Drop Không Hoạt Động?

**Solution 1: Clear Cache**
```bash
cd frontend
rm -rf .next
npm run dev
```

**Solution 2: Hard Refresh Browser**
```
Windows/Linux: Ctrl+Shift+R
Mac: Cmd+Shift+R
```

**Solution 3: Check Console**
```
F12 → Console
Không có lỗi màu đỏ = OK
```

**Solution 4: Check Installation**
```bash
cd frontend
npm list react-beautiful-dnd
# Should show: react-beautiful-dnd@13.1.1
```

### Backend Connection Error?

**Check Couchbase:**
```
http://localhost:8091
Login: Admin / 123456
Bucket: ats_bucket
Scope: main
```

**Check .env:**
```
COUCHBASE_URL=couchbase://localhost
COUCHBASE_USERNAME=Admin
COUCHBASE_PASSWORD=123456
COUCHBASE_BUCKET=ats_bucket
```

### No Applications Showing?

**Seed Data:**
```bash
cd backend
npm run seed
```

**Or Create Manual:**
1. Create Job (Dashboard → Jobs → New Job)
2. Add Candidate (Dashboard → Candidates → Add Candidate)
3. Or apply as job seeker from `/jobs`

---

## 📊 FEATURES CHECKLIST

### ✅ Đã Hoàn Thành:

#### Backend:
- [x] Express TypeScript server
- [x] Couchbase integration
- [x] JWT authentication
- [x] Repository pattern
- [x] Activity logging
- [x] API endpoints (public + protected)

#### Frontend:
- [x] Next.js 14 App Router
- [x] Neo-brutalism UI design
- [x] **Drag & Drop Pipeline** ⭐
- [x] Resume upload
- [x] Job board với filters
- [x] Application tracking
- [x] All modals working

#### Job Seeker:
- [x] Public job board
- [x] Job search & filters
- [x] Apply with resume upload
- [x] Track application status
- [x] Timeline history

#### Recruiter:
- [x] Job management (CRUD)
- [x] Candidate database
- [x] **Applications Pipeline (Drag & Drop)** ⭐
- [x] Interview scheduling
- [x] Task management
- [x] Reports & analytics

---

## 🎨 UI/UX HIGHLIGHTS

### Neo-brutalism Design:
- ✅ Bold borders (4px)
- ✅ Bright colors
- ✅ Drop shadows (brutal)
- ✅ High contrast
- ✅ Smooth animations

### Drag & Drop:
- ✅ Visual feedback (rotate, scale)
- ✅ Drop zone highlight
- ✅ Smooth transitions
- ✅ Toast notifications
- ✅ Console logs for debug

### Forms:
- ✅ All inputs working
- ✅ Native selects (not custom Select)
- ✅ File upload với progress
- ✅ Validation
- ✅ Error messages

---

## 📁 PROJECT STRUCTURE

```
NoSQL_Project/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── applicationController.ts (Activity logging)
│   │   │   └── publicController.ts (Job seeker API)
│   │   ├── repositories/
│   │   ├── routes/
│   │   └── server.ts
│   └── uploads/resumes/ (Uploaded CVs)
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── applications/page.tsx (Drag & Drop)
│   │   ├── jobs/
│   │   │   ├── page.tsx (Job board)
│   │   │   └── [id]/page.tsx (Job details + apply)
│   │   └── track/page.tsx (Application tracking)
│   ├── components/
│   │   ├── ApplicationPipeline.tsx ⭐ NEW
│   │   └── ui/ (Reusable components)
│   └── lib/api.ts (API client)
└── shared/
    └── src/types/index.ts (Shared types)
```

---

## 🗂️ COUCHBASE COLLECTIONS

```
ats_bucket.main:
├── users (Recruiters, admins)
├── jobs (Job postings)
├── candidates (Talent pool)
├── applications (With trackingToken + activities)
├── interviews (Scheduled interviews)
└── tasks (To-do items)
```

### Key Fields in Applications:
```json
{
  "id": "application_123",
  "trackingToken": "abc123...",
  "status": "in_review",
  "currentStageId": "screening",
  "activities": [
    {
      "description": "Application submitted",
      "createdAt": "2024-10-22T10:00:00Z"
    },
    {
      "description": "Application is being reviewed",
      "createdAt": "2024-10-22T14:30:00Z"
    }
  ]
}
```

---

## 📖 DOCUMENTATION FILES

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `SETUP_GUIDE.md` | Detailed setup instructions |
| `HUONG_DAN_SU_DUNG.md` | Vietnamese user guide |
| `THANH_CONG.md` | Success summary |
| `TRACKING_SYSTEM.md` | How tracking works |
| `FIX_DRAG_DROP.md` | Drag & drop troubleshooting |
| `RESTART_FRONTEND.md` | How to restart frontend |
| **`BAT_DAU_SU_DUNG.md`** | **This file** ⭐ |

---

## 🎯 QUICK START CHECKLIST

### Lần Đầu Chạy:
- [ ] Couchbase running at localhost:8091
- [ ] Created bucket `ats_bucket` with scope `main`
- [ ] Run indexes from `COUCHBASE_INDEXES.sql`
- [ ] `cd shared; npm run build`
- [ ] `cd backend; npm run dev` (Terminal 1)
- [ ] `cd frontend; npm run dev` (Terminal 2)
- [ ] `cd backend; npm run seed` (Terminal 3)

### Mỗi Lần Chạy:
- [ ] Backend: `cd backend; npm run dev`
- [ ] Frontend: `cd frontend; npm run dev`
- [ ] Truy cập: http://localhost:3000

### Test Drag & Drop:
- [ ] Login: admin@ats.com / Admin123!
- [ ] Go to: /dashboard/applications
- [ ] Kéo thả application card
- [ ] Thấy toast "Application moved successfully!"
- [ ] Check browser console (no errors)

---

## 🎉 SUCCESS!

**Khi thấy:**
- ✅ Backend running without errors
- ✅ Frontend running without errors
- ✅ Login successful
- ✅ Drag & drop working smoothly
- ✅ Toast notifications appearing
- ✅ Application tracking working

**→ HỆ THỐNG ĐÃ HOẠT ĐỘNG 100%! 🚀**

---

## 💡 PRO TIPS

### Tip 1: Keep Terminals Open
Không đóng terminals đang chạy backend/frontend.

### Tip 2: Use Chrome/Edge
Drag & drop works best trên Chromium browsers.

### Tip 3: Monitor Console
Luôn mở DevTools console khi test features mới.

### Tip 4: Seed Data
Chạy seed để có data test đầy đủ.

### Tip 5: Save Tracking Tokens
Test tracking flow, nhớ lưu token sau khi apply.

---

**Happy Recruiting! 💼✨**

**Last Updated:** October 22, 2025  
**Status:** 🟢 Production Ready

