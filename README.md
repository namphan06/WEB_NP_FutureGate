# NP FutureGate - Web Application

🎯 **Nền tảng tuyển dụng toàn diện** kết nối ứng viên, nhà tuyển dụng và trường học.

## 📋 Tổng quan

NP FutureGate Web là phiên bản web của ứng dụng tuyển dụng được xây dựng bằng:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: EmailJS

## 🚀 Cài đặt và Chạy dự án

### 1. Yêu cầu hệ thống

- Node.js >= 18.x
- npm >= 9.x
- Tài khoản Supabase (đã có)
- Tài khoản EmailJS (đã có)

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

Kiểm tra file `.env` đã có cấu hình đúng:
```
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://hrhoohbvmdmwkbqiymsb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EMAILJS_SERVICE_ID=service_ztzx4h8
EMAILJS_TEMPLATE_ID=template_mh0b2di
EMAILJS_PUBLIC_KEY=ijZhyIJiFG3nd0n17
CORS_ORIGIN=http://localhost:5173
```

Chạy backend:
```bash
npm run dev
```

Backend sẽ chạy tại: `http://localhost:5000`

### 3. Cài đặt Frontend

```bash
cd frontend
npm install
```

Kiểm tra file `.env` đã có cấu hình đúng:
```
VITE_SUPABASE_URL=https://hrhoohbvmdmwkbqiymsb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_EMAILJS_SERVICE_ID=service_ztzx4h8
VITE_EMAILJS_TEMPLATE_ID=template_mh0b2di
VITE_EMAILJS_PUBLIC_KEY=ijZhyIJiFG3nd0n17
VITE_API_BASE_URL=http://localhost:5000/api
```

Chạy frontend:
```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## 📁 Cấu trúc dự án

```
Web_NP_FutureGate/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Cấu hình (Supabase, etc.)
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Middleware (auth, etc.)
│   │   └── server.ts       # Entry point
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts (Auth, etc.)
│   │   ├── lib/           # Libraries (Supabase client)
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main app component
│   │   └── index.css      # Global styles
│   ├── .env               # Environment variables
│   └── package.json
│
├── PROJECT_DOCUMENTATION.md
├── WEB_API_SPECIFICATION.md
└── README.md
```

## ✨ Tính năng chính

### Cho Ứng viên (Candidate)
- ✅ Đăng ký/Đăng nhập
- ✅ Tìm kiếm và lọc công việc
- ✅ Xem chi tiết công việc
- ✅ Ứng tuyển công việc
- ✅ Quản lý hồ sơ cá nhân

### Cho Nhà tuyển dụng (Employer)
- ✅ Đăng ký/Đăng nhập
- ✅ Dashboard thống kê
- ✅ Đăng tin tuyển dụng (trong tương lai)
- ✅ Quản lý ứng viên (trong tương lai)
- ✅ Quản lý hồ sơ công ty

## 🎨 Thiết kế

Ứng dụng sử dụng thiết kế **dark theme** hiện đại với:
- ⚡ Gradients màu sắc vibrant (Purple/Pink/Orange)
- 🎭 Glassmorphism effects
- ✨ Smooth animations và transitions
- 📱 Responsive design cho mọi thiết bị
- 🎯 Micro-interactions tăng UX

## 🔐 Authentication

Hệ thống xác thực sử dụng **Supabase Auth** với:
- Email/Password authentication
- Protected routes
- Session management
- Role-based access control (candidate, employer, school, admin)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Đăng ký
- `POST /api/auth/signin` - Đăng nhập
- `POST /api/auth/signout` - Đăng xuất
- `GET /api/auth/profile` - Lấy thông tin user

### Jobs
- `GET /api/jobs` - Lấy danh sách công việc
- `GET /api/jobs/:id` - Lấy chi tiết công việc
- `POST /api/jobs` - Tạo công việc mới (employer)
- `PUT /api/jobs/:id` - Cập nhật công việc
- `DELETE /api/jobs/:id` - Xóa công việc
- `POST /api/jobs/:id/apply` - Ứng tuyển
- `POST /api/jobs/:id/save` - Lưu công việc

### Profile
- `GET /api/profile/:id` - Lấy profile
- `PUT /api/profile` - Cập nhật profile
- `POST /api/profile/:id/follow` - Follow công ty

### CV
- `GET /api/cv` - Lấy danh sách CV
- `POST /api/cv` - Tạo CV mới
- `PUT /api/cv/:id` - Cập nhật CV
- `DELETE /api/cv/:id` - Xóa CV

### Interviews
- `GET /api/interviews` - Lấy lịch phỏng vấn
- `POST /api/interviews` - Tạo lịch phỏng vấn
- `PUT /api/interviews/:id/status` - Cập nhật trạng thái

### Chat
- `GET /api/chat/conversations` - Lấy danh sách hội thoại
- `GET /api/chat/conversations/:id/messages` - Lấy tin nhắn
- `POST /api/chat/conversations/:id/messages` - Gửi tin nhắn

## 🗄️ Database Schema

Chi tiết database schema xem tại [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)

Các bảng chính:
- `profiles` - Thông tin người dùng
- `jobs` - Tin tuyển dụng
- `school_partnership_jobs` - Việc làm từ trường
- `cv_templates` - CV templates
- `interview_schedules` - Lịch phỏng vấn
- `conversations` & `messages` - Chat system
- `user_job_activities` - Hoạt động của user với jobs
- `company_followers` - Theo dõi công ty

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Supabase Client** - Database & Auth
- **React Icons** - Icons
- **date-fns** - Date formatting

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Supabase** - BaaS platform
- **Helmet** - Security headers
- **Morgan** - Logging
- **CORS** - Cross-origin support

## 📝 Scripts

### Backend
```bash
npm run dev      # Chạy dev server với hot reload
npm run build    # Build TypeScript
npm start        # Chạy production server
npm run lint     # Lint code
```

### Frontend
```bash
npm run dev      # Chạy dev server
npm run build    # Build production
npm run preview  # Preview production build
npm run lint     # Lint code
```

## 🔄 Luồng hoạt động

1. **User đăng ký** → Tạo account trong Supabase Auth → Tạo profile trong database
2. **User đăng nhập** → Supabase Auth verify → Nhận session token
3. **Tìm việc** → Fetch jobs từ database → Hiển thị danh sách
4. **Ứng tuyển** → Call RPC function `apply_to_job` → Cập nhật applicants
5. **Chat** → Realtime updates qua Supabase Realtime

## 🚧 Roadmap

- [ ] Tích hợp upload CV
- [ ] Tích hợp chat realtime
- [ ] Push notifications (web)
- [ ] Advanced search & filters
- [ ] Dashboard analytics
- [ ] Email notifications
- [ ] Job recommendations AI
- [ ] Video interviews

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue hoặc liên hệ team phát triển.

## 📄 License

MIT License

---

**Developed with ❤️ by NP Team**
