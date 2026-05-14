import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiChevronLeft, FiSave, FiEye, FiDownload, FiPlus, FiTrash2 } from 'react-icons/fi';
import CVRenderer from '../../components/cv/CVRenderer';
import type { CVData } from '../../components/cv/types';

export default function CVEditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [cvData, setCvData] = useState<CVData | null>(null);
    const [cvTitle, setCvTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [isPreview, setIsPreview] = useState(false);

    useEffect(() => {
        fetchCV();
    }, [id]);

    const fetchCV = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('cv_templates')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            const mcvCode = (data?.mcv || data?.data?.mcv || '').toUpperCase();
            const typeCode = (data?.type || data?.data?.type || '').toLowerCase();
            const fileUrl = data?.file_url || data?.data?.file_url || data?.data?.fileUrl;

            if ((mcvCode === 'UPLOAD' || typeCode === 'upload') && fileUrl) {
                window.open(fileUrl, '_blank', 'noopener,noreferrer');
                navigate('/candidate/cv');
                return;
            }

            setCvData(data.data as CVData);
            setCvTitle(data.title);
        } catch (error) {
            console.error('Error fetching CV:', error);
            navigate('/candidate/cv');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!cvData || !id) return;
        try {
            setSaving(true);
            const { error } = await supabase
                .from('cv_templates')
                .update({
                    data: cvData,
                    title: cvTitle,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const updateField = (section: string, field: string, value: any) => {
        if (!cvData) return;
        setCvData({
            ...cvData,
            [section]: {
                ...(cvData[section as keyof CVData] as any) || {},
                [field]: value
            }
        });
    };

    const updateArrayItem = (section: string, index: number, field: string, value: any) => {
        if (!cvData) return;
        const arr = [...(cvData[section as keyof CVData] as any[]) || []];
        arr[index] = { ...arr[index], [field]: value };
        setCvData({ ...cvData, [section]: arr });
    };

    const addArrayItem = (section: string, newItem: any) => {
        if (!cvData) return;
        const arr = [...(cvData[section as keyof CVData] as any[]) || []];
        setCvData({ ...cvData, [section]: [...arr, newItem] });
    };

    const removeArrayItem = (section: string, index: number) => {
        if (!cvData) return;
        const arr = [...(cvData[section as keyof CVData] as any[]) || []];
        setCvData({ ...cvData, [section]: arr.filter((_: any, i: number) => i !== index) });
    };

    const handleSectionTap = (section: string) => {
        setActiveSection(section);
    };

    if (loading) return <div className="flex items-center justify-center h-screen">Đang tải trình chỉnh sửa...</div>;
    if (!cvData) return <div>Không tìm thấy dữ liệu CV.</div>;

    const sections = [
        { id: 'personal_info', label: 'Thông tin cá nhân' },
        { id: 'summary', label: 'Giới thiệu bản thân' },
        { id: 'experiences', label: 'Kinh nghiệm làm việc' },
        { id: 'education', label: 'Học vấn' },
        { id: 'skills', label: 'Kỹ năng' },
        { id: 'projects', label: 'Dự án / Hoạt động' },
        { id: 'certifications', label: 'Chứng chỉ' },
        { id: 'awards', label: 'Giải thưởng' },
        { id: 'languages', label: 'Ngôn ngữ' },
        { id: 'references', label: 'Người tham chiếu' },
    ];

    const renderSectionForm = () => {
        if (!activeSection || !cvData) return null;

        switch (activeSection) {
            case 'personal_info':
                const pi = cvData.personal_info || {};
                return (
                    <div className="space-y-4">
                        <div className="form-group">
                            <label className="form-label">Họ và tên</label>
                            <input
                                className="form-input"
                                value={pi.full_name || ''}
                                onChange={(e) => updateField('personal_info', 'full_name', e.target.value)}
                                placeholder="Nguyễn Văn A"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                className="form-input"
                                type="email"
                                value={pi.email || ''}
                                onChange={(e) => updateField('personal_info', 'email', e.target.value)}
                                placeholder="email@example.com"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Số điện thoại</label>
                            <input
                                className="form-input"
                                value={pi.phone || ''}
                                onChange={(e) => updateField('personal_info', 'phone', e.target.value)}
                                placeholder="0901234567"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Địa chỉ</label>
                            <input
                                className="form-input"
                                value={pi.address || ''}
                                onChange={(e) => updateField('personal_info', 'address', e.target.value)}
                                placeholder="Hà Nội, Việt Nam"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Ngày sinh</label>
                            <input
                                className="form-input"
                                type="date"
                                value={(pi as any).dob || ''}
                                onChange={(e) => updateField('personal_info', 'dob', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">LinkedIn</label>
                            <input
                                className="form-input"
                                value={(pi as any).linkedin || ''}
                                onChange={(e) => updateField('personal_info', 'linkedin', e.target.value)}
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Website / Portfolio</label>
                            <input
                                className="form-input"
                                value={pi.website || ''}
                                onChange={(e) => updateField('personal_info', 'website', e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                );

            case 'summary':
                return (
                    <div className="form-group">
                        <label className="form-label">Giới thiệu bản thân</label>
                        <textarea
                            className="form-textarea"
                            value={(cvData.summary as any) || ''}
                            onChange={(e) => setCvData({ ...cvData, summary: e.target.value })}
                            placeholder="Mô tả ngắn gọn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..."
                            rows={6}
                        />
                    </div>
                );

            case 'experiences':
                const experiences = cvData.experiences || [];
                return (
                    <div className="space-y-4">
                        {experiences.map((exp: any, idx: number) => (
                            <div key={idx} className="card" style={{ padding: 'var(--spacing-md)' }}>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-bold">Kinh nghiệm #{idx + 1}</h4>
                                    <button
                                        onClick={() => removeArrayItem('experiences', idx)}
                                        className="btn btn-sm btn-ghost text-error"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Vị trí</label>
                                    <input
                                        className="form-input"
                                        value={exp.position || ''}
                                        onChange={(e) => updateArrayItem('experiences', idx, 'position', e.target.value)}
                                        placeholder="Software Engineer"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Công ty</label>
                                    <input
                                        className="form-input"
                                        value={exp.company || ''}
                                        onChange={(e) => updateArrayItem('experiences', idx, 'company', e.target.value)}
                                        placeholder="Company Name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="form-group">
                                        <label className="form-label">Từ</label>
                                        <input
                                            className="form-input"
                                            type="month"
                                            value={exp.start_date || ''}
                                            onChange={(e) => updateArrayItem('experiences', idx, 'start_date', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Đến</label>
                                        <input
                                            className="form-input"
                                            type="month"
                                            value={exp.end_date || ''}
                                            onChange={(e) => updateArrayItem('experiences', idx, 'end_date', e.target.value)}
                                            placeholder="Hiện tại"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mô tả công việc</label>
                                    <textarea
                                        className="form-textarea"
                                        value={exp.description || ''}
                                        onChange={(e) => updateArrayItem('experiences', idx, 'description', e.target.value)}
                                        rows={4}
                                        placeholder="Mô tả các công việc đã làm..."
                                    />
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => addArrayItem('experiences', { position: '', company: '', start_date: '', end_date: '', description: '' })}
                            className="btn btn-outline-primary btn-block"
                        >
                            <FiPlus size={16} /> Thêm kinh nghiệm
                        </button>
                    </div>
                );

            case 'education':
                const education = cvData.education || [];
                return (
                    <div className="space-y-4">
                        {education.map((edu: any, idx: number) => (
                            <div key={idx} className="card" style={{ padding: 'var(--spacing-md)' }}>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-bold">Học vấn #{idx + 1}</h4>
                                    <button
                                        onClick={() => removeArrayItem('education', idx)}
                                        className="btn btn-sm btn-ghost text-error"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Trường</label>
                                    <input
                                        className="form-input"
                                        value={edu.school || ''}
                                        onChange={(e) => updateArrayItem('education', idx, 'school', e.target.value)}
                                        placeholder="Đại học Bách Khoa Hà Nội"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Chuyên ngành</label>
                                    <input
                                        className="form-input"
                                        value={edu.degree || ''}
                                        onChange={(e) => updateArrayItem('education', idx, 'degree', e.target.value)}
                                        placeholder="Công nghệ thông tin"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="form-group">
                                        <label className="form-label">Từ</label>
                                        <input
                                            className="form-input"
                                            type="month"
                                            value={edu.start_date || ''}
                                            onChange={(e) => updateArrayItem('education', idx, 'start_date', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Đến</label>
                                        <input
                                            className="form-input"
                                            type="month"
                                            value={edu.end_date || ''}
                                            onChange={(e) => updateArrayItem('education', idx, 'end_date', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">GPA</label>
                                    <input
                                        className="form-input"
                                        value={edu.gpa || ''}
                                        onChange={(e) => updateArrayItem('education', idx, 'gpa', e.target.value)}
                                        placeholder="3.5/4.0"
                                    />
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => addArrayItem('education', { school: '', degree: '', start_date: '', end_date: '', gpa: '' })}
                            className="btn btn-outline-primary btn-block"
                        >
                            <FiPlus size={16} /> Thêm học vấn
                        </button>
                    </div>
                );

            case 'skills':
                const skills = cvData.skills || [];
                return (
                    <div className="space-y-4">
                        {skills.map((skill: any, idx: number) => (
                            <div key={idx} className="card" style={{ padding: 'var(--spacing-md)' }}>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-bold">Kỹ năng #{idx + 1}</h4>
                                    <button
                                        onClick={() => removeArrayItem('skills', idx)}
                                        className="btn btn-sm btn-ghost text-error"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tên kỹ năng</label>
                                    <input
                                        className="form-input"
                                        value={skill.name || ''}
                                        onChange={(e) => updateArrayItem('skills', idx, 'name', e.target.value)}
                                        placeholder="JavaScript, React, Python..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mức độ ({skill.level || 50}%)</label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        step="10"
                                        value={skill.level || 50}
                                        onChange={(e) => updateArrayItem('skills', idx, 'level', parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-muted mt-1">
                                        <span>Mới bắt đầu</span>
                                        <span>Chuyên gia</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => addArrayItem('skills', { name: '', level: 50 })}
                            className="btn btn-outline-primary btn-block"
                        >
                            <FiPlus size={16} /> Thêm kỹ năng
                        </button>
                    </div>
                );

            case 'projects':
                const projects = cvData.projects || [];
                return (
                    <div className="space-y-4">
                        {projects.map((proj: any, idx: number) => (
                            <div key={idx} className="card" style={{ padding: 'var(--spacing-md)' }}>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-bold">Dự án #{idx + 1}</h4>
                                    <button
                                        onClick={() => removeArrayItem('projects', idx)}
                                        className="btn btn-sm btn-ghost text-error"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tên dự án</label>
                                    <input
                                        className="form-input"
                                        value={proj.name || ''}
                                        onChange={(e) => updateArrayItem('projects', idx, 'name', e.target.value)}
                                        placeholder="E-commerce Website"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mô tả</label>
                                    <textarea
                                        className="form-textarea"
                                        value={proj.description || ''}
                                        onChange={(e) => updateArrayItem('projects', idx, 'description', e.target.value)}
                                        rows={3}
                                        placeholder="Mô tả dự án, công nghệ sử dụng..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Link (nếu có)</label>
                                    <input
                                        className="form-input"
                                        value={proj.url || ''}
                                        onChange={(e) => updateArrayItem('projects', idx, 'url', e.target.value)}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => addArrayItem('projects', { name: '', description: '', url: '' })}
                            className="btn btn-outline-primary btn-block"
                        >
                            <FiPlus size={16} /> Thêm dự án
                        </button>
                    </div>
                );

            case 'certifications':
                const certs = cvData.certifications || [];
                return (
                    <div className="space-y-4">
                        {certs.map((cert: any, idx: number) => (
                            <div key={idx} className="card" style={{ padding: 'var(--spacing-md)' }}>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-bold">Chứng chỉ #{idx + 1}</h4>
                                    <button
                                        onClick={() => removeArrayItem('certifications', idx)}
                                        className="btn btn-sm btn-ghost text-error"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tên chứng chỉ</label>
                                    <input
                                        className="form-input"
                                        value={cert.name || ''}
                                        onChange={(e) => updateArrayItem('certifications', idx, 'name', e.target.value)}
                                        placeholder="AWS Certified Developer"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tổ chức cấp</label>
                                    <input
                                        className="form-input"
                                        value={cert.issuer || ''}
                                        onChange={(e) => updateArrayItem('certifications', idx, 'issuer', e.target.value)}
                                        placeholder="Amazon Web Services"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ngày cấp</label>
                                    <input
                                        className="form-input"
                                        type="month"
                                        value={cert.date || ''}
                                        onChange={(e) => updateArrayItem('certifications', idx, 'date', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => addArrayItem('certifications', { name: '', issuer: '', date: '' })}
                            className="btn btn-outline-primary btn-block"
                        >
                            <FiPlus size={16} /> Thêm chứng chỉ
                        </button>
                    </div>
                );

            case 'awards':
                const awards = cvData.awards || [];
                return (
                    <div className="space-y-4">
                        {awards.map((award: any, idx: number) => (
                            <div key={idx} className="card" style={{ padding: 'var(--spacing-md)' }}>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-bold">Giải thưởng #{idx + 1}</h4>
                                    <button
                                        onClick={() => removeArrayItem('awards', idx)}
                                        className="btn btn-sm btn-ghost text-error"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tên giải thưởng</label>
                                    <input
                                        className="form-input"
                                        value={award.title || ''}
                                        onChange={(e) => updateArrayItem('awards', idx, 'title', e.target.value)}
                                        placeholder="Giải nhất Olympic Tin học"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tổ chức</label>
                                    <input
                                        className="form-input"
                                        value={award.issuer || ''}
                                        onChange={(e) => updateArrayItem('awards', idx, 'issuer', e.target.value)}
                                        placeholder="Đại học Bách Khoa"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Năm</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        value={award.date || ''}
                                        onChange={(e) => updateArrayItem('awards', idx, 'date', e.target.value)}
                                        placeholder="2024"
                                    />
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => addArrayItem('awards', { title: '', issuer: '', date: '' })}
                            className="btn btn-outline-primary btn-block"
                        >
                            <FiPlus size={16} /> Thêm giải thưởng
                        </button>
                    </div>
                );

            case 'languages':
                const languages = cvData.languages || [];
                return (
                    <div className="space-y-4">
                        {languages.map((lang: any, idx: number) => (
                            <div key={idx} className="card" style={{ padding: 'var(--spacing-md)' }}>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-bold">Ngôn ngữ #{idx + 1}</h4>
                                    <button
                                        onClick={() => removeArrayItem('languages', idx)}
                                        className="btn btn-sm btn-ghost text-error"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ngôn ngữ</label>
                                    <input
                                        className="form-input"
                                        value={lang.name || ''}
                                        onChange={(e) => updateArrayItem('languages', idx, 'name', e.target.value)}
                                        placeholder="Tiếng Anh"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Trình độ ({lang.level || 50}%)</label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        step="10"
                                        value={lang.level || 50}
                                        onChange={(e) => updateArrayItem('languages', idx, 'level', parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => addArrayItem('languages', { name: '', level: 50 })}
                            className="btn btn-outline-primary btn-block"
                        >
                            <FiPlus size={16} /> Thêm ngôn ngữ
                        </button>
                    </div>
                );

            case 'references':
                const refs = cvData.references || [];
                return (
                    <div className="space-y-4">
                        {refs.map((ref: any, idx: number) => (
                            <div key={idx} className="card" style={{ padding: 'var(--spacing-md)' }}>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-bold">Tham chiếu #{idx + 1}</h4>
                                    <button
                                        onClick={() => removeArrayItem('references', idx)}
                                        className="btn btn-sm btn-ghost text-error"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Họ tên</label>
                                    <input
                                        className="form-input"
                                        value={ref.name || ''}
                                        onChange={(e) => updateArrayItem('references', idx, 'name', e.target.value)}
                                        placeholder="Nguyễn Văn B"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Chức vụ</label>
                                    <input
                                        className="form-input"
                                        value={ref.position || ''}
                                        onChange={(e) => updateArrayItem('references', idx, 'position', e.target.value)}
                                        placeholder="Quản lý trực tiếp"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        className="form-input"
                                        type="email"
                                        value={ref.email || ''}
                                        onChange={(e) => updateArrayItem('references', idx, 'email', e.target.value)}
                                        placeholder="email@company.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Số điện thoại</label>
                                    <input
                                        className="form-input"
                                        value={ref.phone || ''}
                                        onChange={(e) => updateArrayItem('references', idx, 'phone', e.target.value)}
                                        placeholder="0901234567"
                                    />
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => addArrayItem('references', { name: '', position: '', email: '', phone: '' })}
                            className="btn btn-outline-primary btn-block"
                        >
                            <FiPlus size={16} /> Thêm người tham chiếu
                        </button>
                    </div>
                );

            default:
                return <p className="text-muted text-sm">Chọn một section để chỉnh sửa</p>;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-100 font-sans">
            <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-50" style={{ background: 'var(--glass-bg-dark)', backdropFilter: 'var(--glass-blur)' }}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/candidate/cv')}
                        className="btn btn-ghost"
                        style={{ padding: '8px' }}
                    >
                        <FiChevronLeft size={24} />
                    </button>
                    <input
                        value={cvTitle}
                        onChange={(e) => setCvTitle(e.target.value)}
                        className="text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-100 rounded px-2 py-1 w-64"
                        style={{ color: 'var(--color-text)' }}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsPreview(!isPreview)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${isPreview ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        style={{ borderRadius: 'var(--radius-md)' }}
                    >
                        <FiEye size={18} />
                        {isPreview ? 'Đang xem' : 'Xem trước'}
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
                        style={{ borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}
                    >
                        <FiSave size={18} />
                        {saving ? 'Đang lưu...' : 'Lưu CV'}
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all"
                        style={{ borderRadius: 'var(--radius-md)', background: 'var(--color-text)' }}
                    >
                        <FiDownload size={18} />
                        Tải PDF
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {!isPreview && (
                    <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex flex-col p-6 shrink-0" style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border-light)' }}>
                        <div className="mb-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-light)' }}>Trình chỉnh sửa</h3>
                            <p className="text-xs text-slate-500 leading-relaxed bg-blue-50 p-4 rounded-xl border border-blue-100" style={{ background: 'var(--color-primary-50)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-primary-100)' }}>
                                Nhấn vào các phần bên dưới hoặc trực tiếp trên CV để chỉnh sửa thông tin.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => {
                                        setActiveSection(section.id);
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === section.id
                                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    style={{
                                        borderRadius: 'var(--radius-md)',
                                        background: activeSection === section.id ? 'var(--color-primary-50)' : 'transparent',
                                        color: activeSection === section.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                        border: activeSection === section.id ? '1px solid var(--color-primary-100)' : '1px solid transparent',
                                    }}
                                >
                                    {section.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className={`flex-1 overflow-y-auto p-12 flex justify-center items-start bg-slate-100 transition-all ${isPreview ? 'w-full' : ''}`} style={{ background: 'var(--color-background)' }}>
                    <div className={`shadow-2xl transition-all duration-500 origin-top transform ${isPreview ? 'scale-100' : 'scale-[0.85]'}`}>
                        <div className="w-[800px] min-h-[1131px] bg-white rounded-sm overflow-hidden pointer-events-auto">
                            <CVRenderer
                                templateCode={cvData.mcv}
                                data={cvData}
                                onSectionTap={handleSectionTap}
                                isViewOnly={isPreview}
                            />
                        </div>
                    </div>
                </div>

                {activeSection && !isPreview && (
                    <div className="fixed top-16 right-0 bottom-0 w-[500px] bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.05)] border-l border-slate-200 z-[60] flex flex-col animate-slide-left" style={{ background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-xl)' }}>
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight" style={{ color: 'var(--color-text)' }}>
                                {sections.find(s => s.id === activeSection)?.label || 'Chỉnh sửa'}
                            </h2>
                            <button onClick={() => setActiveSection(null)} className="btn btn-ghost" style={{ padding: '8px' }}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6" style={{ padding: 'var(--spacing-lg)' }}>
                            {renderSectionForm()}
                        </div>

                        <div className="p-6 border-t border-slate-100 flex gap-4" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                            <button
                                onClick={() => setActiveSection(null)}
                                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all font-sans"
                                style={{ borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}
                            >
                                Hoàn tất
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slide-left {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-left {
                    animation: slide-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .space-y-4 > * + * { margin-top: var(--spacing-md); }
                .mb-3 { margin-bottom: var(--spacing-sm); }
                .text-sm { font-size: 0.875rem; }
                .text-xs { font-size: 0.75rem; }
                .text-muted { color: var(--color-text-light); }
                .text-error { color: var(--color-error); }
                .font-bold { font-weight: 700; }
                .w-full { width: 100%; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .justify-between { justify-content: space-between; }
                .gap-3 { gap: var(--spacing-sm); }
                .grid { display: grid; }
                .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
                .gap-4 { gap: var(--spacing-md); }
                .mb-8 { margin-bottom: var(--spacing-lg); }
                .mt-1 { margin-top: var(--spacing-xs); }
                .p-6 { padding: var(--spacing-lg); }
                .p-12 { padding: var(--spacing-xl); }
                .px-6 { padding-left: var(--spacing-lg); padding-right: var(--spacing-lg); }
                .py-2 { padding-top: var(--spacing-sm); padding-bottom: var(--spacing-sm); }
                .py-3 { padding-top: var(--spacing-sm); padding-bottom: var(--spacing-sm); }
                .w-80 { width: 320px; }
                .w-64 { width: 256px; }
                .h-16 { height: 64px; }
                .h-screen { height: 100vh; }
                .flex-1 { flex: 1; }
                .shrink-0 { flex-shrink: 0; }
                .overflow-y-auto { overflow-y: auto; }
                .overflow-hidden { overflow: hidden; }
                .border-b { border-bottom-width: 1px; }
                .border-r { border-right-width: 1px; }
                .border-l { border-left-width: 1px; }
                .border-slate-200 { border-color: var(--color-border); }
                .border-slate-100 { border-color: var(--color-border-light); }
                .bg-white { background: var(--color-surface); }
                .bg-slate-100 { background: var(--color-background); }
                .z-50 { z-index: 50; }
                .z-\\[60\\] { z-index: 60; }
                .fixed { position: fixed; }
                .top-16 { top: 64px; }
                .right-0 { right: 0; }
                .bottom-0 { bottom: 0; }
                input[type="range"] {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 6px;
                    border-radius: 3px;
                    background: var(--color-border);
                    outline: none;
                }
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--color-primary);
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(30, 136, 229, 0.3);
                }
                @media (max-width: 1200px) {
                    .w-80 { width: 260px; }
                    .w-\\[500px\\] { width: 400px; }
                }
                @media (max-width: 900px) {
                    .w-80 { display: none; }
                    .w-\\[500px\\] { width: 100%; }
                }
            `}</style>
        </div>
    );
}
