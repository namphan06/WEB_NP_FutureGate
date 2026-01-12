// Danh sách các lĩnh vực công việc
export const JOB_FIELDS = [
    'IT - Phần mềm',
    'Marketing / Truyền thông',
    'Kinh doanh / Bán hàng',
    'Kế toán / Kiểm toán',
    'Nhân sự / Hành chính',
    'Xây dựng',
    'Kiến trúc / Nội thất',
    'Giáo dục / Đào tạo',
    'Y tế / Sức khỏe',
    'Dịch vụ khách hàng',
    'Sản xuất / Vận hành',
    'Vận tải / Kho vận',
    'Thiết kế / Sáng tạo',
    'Ngân hàng / Tài chính',
    'Bất động sản',
    'Nhà hàng / Khách sạn',
    'Luật / Pháp lý',
    'Biên / Phiên dịch',
    'Viễn thông',
    'Bảo hiểm',
    'Bán lẻ / Tiêu dùng',
    'Khác'
] as const;

export type JobField = typeof JOB_FIELDS[number];
