import type { CVData } from './types';

export const getEmptyCVData = (mcv: string): CVData => {
    const base = {
        mcv,
        type: 'general',
        personal_info: {
            full_name: '',
            title: '',
            email: '',
            phone: '',
            address: '',
            avatar_url: '',
        },
        summary: '',
        experiences: [],
        education: [],
        skills: [],
        certifications: [],
        activities: [],
        awards: [],
        projects: [],
        languages: [],
        references: [],
    };

    return base;
};

export const CV_TEMPLATES_INFO = [
    { code: 'CV001', name: 'Tiêu chuẩn', description: 'Mẫu CV cơ bản, thanh lịch, phù hợp mọi ngành nghề.' },
    { code: 'CV002', name: 'Hiện đại', description: 'Thiết kế trẻ trung với bố cục 2 cột rõ ràng.' },
    { code: 'CV003', name: 'Kỹ thuật / IT', description: 'Tập trung vào kỹ năng và kinh nghiệm thực tế.' },
    { code: 'CV004', name: 'Nổi bật', description: 'Sử dụng màu cam năng động, tạo ấn tượng mạnh.' },
    { code: 'CV005', name: 'Chuyên nghiệp', description: 'Mẫu executive sang trọng, tập trung vào kết quả.' },
    { code: 'CV006', name: 'Marketing', description: 'Thiết kế sáng tạo, năng động cho ngành truyền thông.' },
    { code: 'CV007', name: 'Minimalist', description: 'Phong cách tối giản, cao cấp như tạp chí thời trang.' },
    { code: 'CV008', name: 'Tài chính', description: 'Vững chãi, tin cậy cho các vị trí quản lý, tài chính.' },
    { code: 'CV009', name: 'Y tế / Clinical', description: 'Sạch sẽ, chuyên nghiệp cho ngành y tế, giáo dục.' },
];
