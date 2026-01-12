# Hướng dẫn sử dụng Hệ thống Tạo/Sửa Tin tuyển dụng

## Tổng quan

Hệ thống đã được cập nhật để phù hợp giữa bản web và bản Flutter app với các tính năng sau:

### ✅ Đã hoàn thành

1. **Constants/Enums** - Tạo các file constants cho:
   - ✅ 63 tỉnh thành Việt Nam + Remote (`vietnamProvinces.ts`)
   - ✅ Lĩnh vực công việc (`jobFields.ts`)
   - ✅ Hình thức làm việc (`employmentTypes.ts`)
   - ✅ Mức độ kinh nghiệm (`experienceLevels.ts`)

2. **Trang tạo tin tuyển dụng** (`CreateJobPage.tsx`)
   - ✅ UI đẹp, chia section rõ ràng với icons
   - ✅ Form với các trường đầy đủ như Flutter app
   - ✅ Sử dụng array thay vì string split
   - ✅ Nút thêm/xóa items động
   - ✅ Chip/Button selection cho provinces, fields, employment types
   - ✅ Validation đầy đủ

3. **Trang chỉnh sửa tin** (`EditJobPage.tsx`)
   - ✅ Fetch dữ liệu hiện có từ database
   - ✅ Kiểm tra quyền sở hữu
   - ✅ UI giống CreateJobPage
   - ✅ Cập nhật dữ liệu

4. **Routes** - Đã thêm vào App.tsx
   - ✅ `/employer/jobs/create` - Tạo tin mới
   - ✅ `/employer/jobs/:id/edit` - Chỉnh sửa tin

## Cấu trúc dữ liệu Job Metadata

```typescript
{
  title: string;
  working_regions: string[];              // Mảng tỉnh thành
  experience_required: string;            // Mức kinh nghiệm
  fields: string[];                       // Mảng lĩnh vực
  requirements_tags: string[];            // Mảng tags/từ khóa
  salary: {
    min?: number;
    max?: number;
    currency: string;                     // VND hoặc USD
    is_negotiable: boolean;
    type: 'monthly' | 'hourly' | 'yearly';
  };
  employment_types: string[];             // Full-time, Part-time, etc.
  work_locations: string[];               // Địa chỉ cụ thể
  job_description: string[];              // Mỗi item là 1 đoạn mô tả
  candidate_requirements: string[];       // Mỗi item là 1 yêu cầu
  benefits: string[];                     // Mỗi item là 1 quyền lợi
}
```

## Hướng dẫn sử dụng

### Tạo tin tuyển dụng mới

1. Đăng nhập với tài khoản Employer
2. Vào `/employer/jobs/create`
3. Điền đầy đủ thông tin:
   - **Thông tin cơ bản**: Tiêu đề, kinh nghiệm, deadline, khu vực, lĩnh vực
   - **Lương & Hình thức**: Mức lương (hoặc tick "Thỏa thuận"), hình thức làm việc
   - **Chi tiết công việc**: Địa điểm, mô tả, yêu cầu, quyền lợi, tags
   - **Cài đặt**: Trạng thái hoạt động
4. Nhấn "Đăng tin tuyển dụng"
5. Tin sẽ có status "pending" và cần admin duyệt

### Chỉnh sửa tin

1. Vào `/employer/jobs`
2. Click "Edit" trên tin muốn sửa
3. Hoặc vào trực tiếp `/employer/jobs/{job_id}/edit`
4. Cập nhật thông tin
5. Nhấn "Lưu thay đổi"

### Thêm items vào danh sách

Với các trường như địa điểm, mô tả, yêu cầu, quyền lợi, tags:
- Nhập nội dung vào ô input/textarea
- Nhấn nút **+** hoặc Enter
- Item sẽ được thêm vào danh sách
- Click **X** để xóa item

### Chọn nhiều options

Với khu vực, lĩnh vực, hình thức:
- Click vào các chip/button để toggle chọn/bỏ chọn
- Màu primary = đã chọn
- Màu trắng = chưa chọn

## Files liên quan

### Constants
- `frontend/src/constants/vietnamProvinces.ts`
- `frontend/src/constants/jobFields.ts`
- `frontend/src/constants/employmentTypes.ts`
- `frontend/src/constants/experienceLevels.ts`
- `frontend/src/constants/index.ts` (export all)

### Pages
- `frontend/src/pages/employer/CreateJobPage.tsx`
- `frontend/src/pages/employer/EditJobPage.tsx`
- `frontend/src/pages/employer/ManageJobsPage.tsx`

### Routes
- `frontend/src/App.tsx`

### Backend
- `backend/src/routes/job.routes.ts`

## Lưu ý khi phát triển

1. **Validation**: Cần validate các trường bắt buộc trước khi submit
2. **Array vs String**: Tất cả các trường multi-value đều dùng array, không dùng string split
3. **Constants**: Luôn import constants từ `@/constants` thay vì hard-code
4. **Ownership**: Chỉ creator mới được edit/delete tin của mình
5. **Status**: Tin mới tạo có status "pending", cần admin approve thành "approved" để hiển thị public

## Tương lai

Các tính năng có thể thêm:
- [ ] Draft system (lưu nháp)
- [ ] Duplicate job posting
- [ ] Template system
- [ ] Bulk actions
- [ ] Advanced filters
- [ ] Analytics dashboard

---

Tạo ngày: 2025-12-25
Phiên bản: 1.0
