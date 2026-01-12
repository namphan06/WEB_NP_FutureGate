# 🚀 Quick Start Guide - NP FutureGate

## Bước 1: Khởi động Backend

Mở terminal và chạy:

```bash
cd backend
npm run dev
```

✅ Backend sẽ chạy tại: **http://localhost:5000**

Bạn sẽ thấy:
```
🚀 Server is running on port 5000
📝 Environment: development
🔗 Health check: http://localhost:5000/health
```

## Bước 2: Khởi động Frontend

Mở terminal MỚI (tab mới) và chạy:

```bash
cd frontend  
npm run dev
```

✅ Frontend sẽ chạy tại: **http://localhost:5173**

Bạn sẽ thấy:
```
  VITE v7.2.4  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Bước 3: Mở trình duyệt

Truy cập: **http://localhost:5173**

### Đăng ký tài khoản mới:

1. Nhấn **"Đăng ký ngay"**
2. Điền thông tin:
   - Họ tên: `Nguyễn Văn A`
   - Email: `test@example.com`
   - Số điện thoại: `0123456789`
   - Mật khẩu: `123456`
   - Vai trò: Chọn **Ứng viên** hoặc **Nhà tuyển dụng**
3. Nhấn **Đăng ký**

### Hoặc đăng nhập với tài khoản có sẵn:

1. Email: `test@example.com`
2. Mật khẩu: `123456`

## 🎯 Các tính năng có thể test:

### Ứng viên (Candidate):
- ✅ Xem danh sách việc làm
- ✅ Tìm kiếm và lọc công việc
- ✅ Xem chi tiết công việc
- ✅ Ứng tuyển công việc
- ✅ Xem hồ sơ cá nhân

### Nhà tuyển dụng (Employer):
- ✅ Dashboard thống kê
- ✅ Xem danh sách việc làm
- ✅ Xem hồ sơ công ty

## 📝 Lưu ý:

1. **Cả backend và frontend phải chạy đồng thời**
2. Backend chạy port **5000**, Frontend chạy port **5173**
3. Dữ liệu được lưu trên **Supabase** (cloud database)
4. Mọi thay đổi code sẽ tự động reload

## 🛠️ Troubleshooting:

### Lỗi "Port already in use":
```bash
# Kill process trên port 5000 (backend)
npx kill-port 5000

# Kill process trên port 5173 (frontend)
npx kill-port 5173
```

### Lỗi dependencies:
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Lỗi Supabase connection:
Kiểm tra file `.env` có đúng thông tin:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 📞 Cần hỗ trợ?

Kiểm tra file `README.md` để xem tài liệu đầy đủ!

---

**Happy Coding! 🎉**
