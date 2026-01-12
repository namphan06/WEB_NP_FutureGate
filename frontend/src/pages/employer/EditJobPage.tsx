import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiBriefcase, FiMapPin, FiClock, FiDollarSign, FiFileText, FiSettings, FiInfo, FiX, FiPlus } from 'react-icons/fi';
import {
    VIETNAM_PROVINCES,
    JOB_FIELDS,
    EMPLOYMENT_TYPES,
    EXPERIENCE_LEVELS
} from '../../constants';
import './JobFormStyles.css';

export default function EditJobPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Input states for adding items
    const [newWorkLocation, setNewWorkLocation] = useState('');
    const [newJobDesc, setNewJobDesc] = useState('');
    const [newRequirement, setNewRequirement] = useState('');
    const [newBenefit, setNewBenefit] = useState('');
    const [newTag, setNewTag] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        working_regions: [] as string[],
        experience_required: '',
        fields: [] as string[],
        requirements_tags: [] as string[],
        salary_min: '',
        salary_max: '',
        currency: 'VND',
        is_negotiable: false,
        salary_type: 'monthly' as 'monthly' | 'hourly' | 'yearly',
        employment_types: [] as string[],
        work_locations: [] as string[],
        job_description: [] as string[],
        candidate_requirements: [] as string[],
        benefits: [] as string[],
        deadline: '',
        is_active: true
    });

    // Fetch job data on mount
    useEffect(() => {
        if (!id) return;

        const fetchJob = async () => {
            try {
                const { data: job, error } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (!job) throw new Error('Job not found');

                // Check ownership
                if (job.creator_id !== user?.id) {
                    alert('Bạn không có quyền chỉnh sửa tin này');
                    navigate('/employer/jobs');
                    return;
                }

                const metadata = job.metadata;
                setFormData({
                    title: metadata.title || '',
                    working_regions: metadata.working_regions || [],
                    experience_required: metadata.experience_required || '',
                    fields: metadata.fields || [],
                    requirements_tags: metadata.requirements_tags || [],
                    salary_min: metadata.salary?.min?.toString() || '',
                    salary_max: metadata.salary?.max?.toString() || '',
                    currency: metadata.salary?.currency || 'VND',
                    is_negotiable: metadata.salary?.is_negotiable || false,
                    salary_type: metadata.salary?.type || 'monthly',
                    employment_types: metadata.employment_types || [],
                    work_locations: metadata.work_locations || [],
                    job_description: metadata.job_description || [],
                    candidate_requirements: metadata.candidate_requirements || [],
                    benefits: metadata.benefits || [],
                    deadline: job.deadline ? job.deadline.split('T')[0] : '',
                    is_active: job.is_active ?? true
                });
            } catch (error: any) {
                alert(error.message);
                navigate('/employer/jobs');
            } finally {
                setFetching(false);
            }
        };

        fetchJob();
    }, [id, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !id) return;

        setLoading(true);
        try {
            const metadata = {
                title: formData.title,
                working_regions: formData.working_regions,
                experience_required: formData.experience_required,
                fields: formData.fields,
                requirements_tags: formData.requirements_tags,
                salary: {
                    min: formData.salary_min ? Number(formData.salary_min) : undefined,
                    max: formData.salary_max ? Number(formData.salary_max) : undefined,
                    currency: formData.currency,
                    is_negotiable: formData.is_negotiable,
                    type: formData.salary_type
                },
                employment_types: formData.employment_types,
                work_locations: formData.work_locations,
                job_description: formData.job_description,
                candidate_requirements: formData.candidate_requirements,
                benefits: formData.benefits
            };

            const { error } = await supabase
                .from('jobs')
                .update({
                    deadline: formData.deadline,
                    metadata,
                    is_active: formData.is_active
                })
                .eq('id', id);

            if (error) throw error;

            alert('Cập nhật tin thành công!');
            navigate('/employer/jobs');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper functions for adding/removing array items
    const addItem = (value: string, setter: (val: string) => void, arrayKey: keyof typeof formData) => {
        if (!value.trim()) return;
        setFormData({
            ...formData,
            [arrayKey]: [...(formData[arrayKey] as string[]), value.trim()]
        });
        setter('');
    };

    const removeItem = (index: number, arrayKey: keyof typeof formData) => {
        const newArray = [...(formData[arrayKey] as string[])];
        newArray.splice(index, 1);
        setFormData({ ...formData, [arrayKey]: newArray });
    };

    const toggleArrayItem = (item: string, arrayKey: keyof typeof formData) => {
        const currentArray = formData[arrayKey] as string[];
        const newArray = currentArray.includes(item)
            ? currentArray.filter(x => x !== item)
            : [...currentArray, item];
        setFormData({ ...formData, [arrayKey]: newArray });
    };

    if (fetching) {
        return (
            <div className="container section" style={{ textAlign: 'center' }}>
                <p>Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="container section">
            <h1>Chỉnh sửa tin tuyển dụng</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
                Cập nhật thông tin tin tuyển dụng
            </p>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    {/* Basic Info Section */}
                    <div className="card" style={{ background: 'var(--color-surface)', padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-lg)' }}>
                            <FiInfo /> Thông tin cơ bản
                        </h3>

                        <div className="form-group">
                            <label className="form-label">
                                <FiBriefcase size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Tiêu đề công việc *
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="VD: Senior Flutter Developer"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2">
                            <div className="form-group">
                                <label className="form-label">
                                    <FiClock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                    Kinh nghiệm yêu cầu *
                                </label>
                                <select
                                    className="form-select"
                                    value={formData.experience_required}
                                    onChange={(e) => setFormData({ ...formData, experience_required: e.target.value })}
                                    required
                                >
                                    <option value="">Chọn...</option>
                                    {EXPERIENCE_LEVELS.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Hạn nộp hồ sơ *</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <FiMapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Khu vực làm việc *
                            </label>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                                padding: 'var(--spacing-md)',
                                background: 'var(--color-background)',
                                borderRadius: '8px',
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {VIETNAM_PROVINCES.map(province => {
                                    const isSelected = formData.working_regions.includes(province);
                                    return (
                                        <button
                                            key={province}
                                            type="button"
                                            onClick={() => toggleArrayItem(province, 'working_regions')}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '20px',
                                                border: '1px solid',
                                                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                                                background: isSelected ? 'var(--color-primary)' : 'white',
                                                color: isSelected ? 'white' : 'var(--color-text)',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {province}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Lĩnh vực chuyên môn *</label>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                                padding: 'var(--spacing-md)',
                                background: 'var(--color-background)',
                                borderRadius: '8px',
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {JOB_FIELDS.map(field => {
                                    const isSelected = formData.fields.includes(field);
                                    return (
                                        <button
                                            key={field}
                                            type="button"
                                            onClick={() => toggleArrayItem(field, 'fields')}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '20px',
                                                border: '1px solid',
                                                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                                                background: isSelected ? 'var(--color-primary)' : 'white',
                                                color: isSelected ? 'white' : 'var(--color-text)',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {field}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Salary & Employment Section */}
                    <div className="card" style={{ background: 'var(--color-surface)', padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-lg)' }}>
                            <FiDollarSign /> Lương & Hình thức
                        </h3>

                        <div className="grid grid-cols-3">
                            <div className="form-group">
                                <label className="form-label">Từ</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.salary_min}
                                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                                    placeholder="10000000"
                                    disabled={formData.is_negotiable}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Đến</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.salary_max}
                                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                                    placeholder="20000000"
                                    disabled={formData.is_negotiable}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Đơn vị</label>
                                <select
                                    className="form-select"
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                >
                                    <option value="VND">VND</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ marginTop: 'var(--spacing-sm)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.is_negotiable}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            is_negotiable: e.target.checked,
                                            salary_min: e.target.checked ? '' : formData.salary_min,
                                            salary_max: e.target.checked ? '' : formData.salary_max
                                        });
                                    }}
                                />
                                <span>Lương thỏa thuận</span>
                            </label>
                        </div>

                        <div className="form-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                            <label className="form-label">Hình thức làm việc *</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {EMPLOYMENT_TYPES.map(type => {
                                    const isSelected = formData.employment_types.includes(type);
                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => toggleArrayItem(type, 'employment_types')}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '20px',
                                                border: '1px solid',
                                                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                                                background: isSelected ? 'var(--color-primary)' : 'white',
                                                color: isSelected ? 'white' : 'var(--color-text)',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {type}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Job Details Section */}
                    <div className="card" style={{ background: 'var(--color-surface)', padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-lg)' }}>
                            <FiFileText /> Chi tiết công việc
                        </h3>

                        {/* Work Locations */}
                        <div className="form-group">
                            <label className="form-label">Địa điểm làm việc cụ thể *</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newWorkLocation}
                                    onChange={(e) => setNewWorkLocation(e.target.value)}
                                    placeholder="Nhập địa chỉ cụ thể..."
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(newWorkLocation, setNewWorkLocation, 'work_locations'))}
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => addItem(newWorkLocation, setNewWorkLocation, 'work_locations')}
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {formData.work_locations.map((loc, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem',
                                        background: 'white',
                                        borderRadius: '8px',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        <span style={{ flex: 1 }}>{loc}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(idx, 'work_locations')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--color-error)',
                                                padding: '0.25rem'
                                            }}
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="form-group">
                            <label className="form-label">Mô tả công việc *</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <textarea
                                    className="form-textarea"
                                    value={newJobDesc}
                                    onChange={(e) => setNewJobDesc(e.target.value)}
                                    placeholder="Nhập mô tả công việc..."
                                    rows={3}
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => addItem(newJobDesc, setNewJobDesc, 'job_description')}
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {formData.job_description.map((desc, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '0.5rem',
                                        padding: '0.5rem',
                                        background: 'white',
                                        borderRadius: '8px',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        <span style={{ flex: 1, whiteSpace: 'pre-wrap' }}>{desc}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(idx, 'job_description')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--color-error)',
                                                padding: '0.25rem'
                                            }}
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Candidate Requirements */}
                        <div className="form-group">
                            <label className="form-label">Yêu cầu ứng viên *</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <textarea
                                    className="form-textarea"
                                    value={newRequirement}
                                    onChange={(e) => setNewRequirement(e.target.value)}
                                    placeholder="Nhập yêu cầu ứng viên..."
                                    rows={3}
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => addItem(newRequirement, setNewRequirement, 'candidate_requirements')}
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {formData.candidate_requirements.map((req, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '0.5rem',
                                        padding: '0.5rem',
                                        background: 'white',
                                        borderRadius: '8px',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        <span style={{ flex: 1, whiteSpace: 'pre-wrap' }}>{req}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(idx, 'candidate_requirements')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--color-error)',
                                                padding: '0.25rem'
                                            }}
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="form-group">
                            <label className="form-label">Quyền lợi *</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <textarea
                                    className="form-textarea"
                                    value={newBenefit}
                                    onChange={(e) => setNewBenefit(e.target.value)}
                                    placeholder="Nhập quyền lợi..."
                                    rows={2}
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => addItem(newBenefit, setNewBenefit, 'benefits')}
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {formData.benefits.map((benefit, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '0.5rem',
                                        padding: '0.5rem',
                                        background: 'white',
                                        borderRadius: '8px',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        <span style={{ flex: 1, whiteSpace: 'pre-wrap' }}>{benefit}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(idx, 'benefits')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--color-error)',
                                                padding: '0.25rem'
                                            }}
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="form-group">
                            <label className="form-label">Thẻ từ khóa (Tags) *</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="VD: Flutter, Dart, Firebase..."
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(newTag, setNewTag, 'requirements_tags'))}
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => addItem(newTag, setNewTag, 'requirements_tags')}
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {formData.requirements_tags.map((tag, idx) => (
                                    <span key={idx} style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.25rem 0.75rem',
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        borderRadius: '20px',
                                        fontSize: '0.875rem'
                                    }}>
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeItem(idx, 'requirements_tags')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'white',
                                                padding: '0',
                                                display: 'flex'
                                            }}
                                        >
                                            <FiX size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Settings Section */}
                    <div className="card" style={{ background: 'var(--color-surface)', padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--spacing-lg)' }}>
                            <FiSettings /> Cài đặt tin
                        </h3>

                        <div style={{ marginTop: 'var(--spacing-sm)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <span>Trạng thái hoạt động</span>
                            </label>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                                {formData.is_active ? 'Tin đang hiển thị với ứng viên' : 'Tin đang bị ẩn'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-md">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            <FiSave size={20} />
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/employer/jobs')}
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
