// Danh sách các mức độ kinh nghiệm
export const EXPERIENCE_LEVELS = [
    'Chưa có kinh nghiệm',
    'Dưới 1 năm',
    '1 năm',
    '2 năm',
    '3 năm',
    '4 năm',
    '5 năm',
    'Trên 5 năm',
    'Thực tập sinh',
    'Mới tốt nghiệp',
    'Junior',
    'Middle',
    'Senior',
    'Trưởng nhóm',
    'Quản lý',
    'Giám đốc'
] as const;

export type ExperienceLevel = typeof EXPERIENCE_LEVELS[number];
