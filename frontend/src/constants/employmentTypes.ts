// Danh sách các hình thức làm việc
export const EMPLOYMENT_TYPES = [
    'Toàn thời gian',
    'Bán thời gian',
    'Thực tập',
    'Freelance',
    'Hợp đồng',
    'Làm việc từ xa',
    'Thời vụ'
] as const;

export type EmploymentType = typeof EMPLOYMENT_TYPES[number];
