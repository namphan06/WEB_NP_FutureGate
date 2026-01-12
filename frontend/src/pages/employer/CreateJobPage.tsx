import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiBriefcase, FiMapPin, FiClock, FiDollarSign, FiFileText, FiSettings, FiInfo, FiX, FiCheck, FiSearch } from 'react-icons/fi';
import {
    VIETNAM_PROVINCES,
    JOB_FIELDS,
    EMPLOYMENT_TYPES,
    EXPERIENCE_LEVELS
} from '../../constants';
import './JobFormStyles.css';

export default function CreateJobPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Input states for adding items
    const [newWorkLocation, setNewWorkLocation] = useState('');
    const [newJobDesc, setNewJobDesc] = useState('');
    const [newRequirement, setNewRequirement] = useState('');
    const [newBenefit, setNewBenefit] = useState('');
    const [newTag, setNewTag] = useState('');

    // Search states
    const [searchRegion, setSearchRegion] = useState('');
    const [searchField, setSearchField] = useState('');

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

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
                .insert([{
                    creator_id: user.id,
                    deadline: formData.deadline,
                    metadata,
                    is_active: formData.is_active,
                    status: 'pending'
                }]);

            if (error) throw error;

            alert('Đăng tin thành công! Đang chờ admin duyệt.');
            navigate('/employer/jobs');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper functions
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

    return (
        <div className="job-form-page">
            {/* Simple Header */}
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '1rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#212f3f', marginBottom: '0.5rem' }}>
                    Đăng tin tuyển dụng
                </h1>
                <p style={{ color: '#6c757d', fontSize: '0.9375rem', marginBottom: 0 }}>
                    Tạo tin tuyển dụng chuyên nghiệp để tiếp cận hàng ngàn ứng viên tiềm năng
                </p>
            </div>

            {/* Form Content */}
            <div className="container">
                <form onSubmit={handleSubmit}>
                    {/* Basic Info Section */}
                    <div className="job-form-section">
                        <div className="job-form-section-header">
                            <FiInfo className="section-icon" />
                            <h2>Thông tin cơ bản</h2>
                        </div>

                        <div className="form-group">
                            <label className="form-label form-label-required">
                                <FiBriefcase size={16} />
                                Tiêu đề công việc
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
                                <label className="form-label form-label-required">
                                    <FiClock size={16} />
                                    Kinh nghiệm yêu cầu
                                </label>
                                <select
                                    className="form-select"
                                    value={formData.experience_required}
                                    onChange={(e) => setFormData({ ...formData, experience_required: e.target.value })}
                                    required
                                >
                                    <option value="">Chọn mức kinh nghiệm...</option>
                                    {EXPERIENCE_LEVELS.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label form-label-required">
                                    <FiClock size={16} />
                                    Hạn nộp hồ sơ
                                </label>
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
                            <label className="form-label form-label-required">
                                <FiMapPin size={16} />
                                Khu vực làm việc
                            </label>

                            {/* Search input for regions */}
                            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                                <FiSearch
                                    size={16}
                                    style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#6c757d',
                                        pointerEvents: 'none'
                                    }}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    value={searchRegion}
                                    onChange={(e) => setSearchRegion(e.target.value)}
                                    placeholder="Tìm kiếm tỉnh thành..."
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>

                            <div className="chip-container">
                                {VIETNAM_PROVINCES
                                    .filter(province =>
                                        province.toLowerCase().includes(searchRegion.toLowerCase())
                                    )
                                    .slice(0, 10)
                                    .map(province => {
                                        const isSelected = formData.working_regions.includes(province);
                                        return (
                                            <button
                                                key={province}
                                                type="button"
                                                onClick={() => toggleArrayItem(province, 'working_regions')}
                                                className={`chip ${isSelected ? 'chip-selected' : ''}`}
                                            >
                                                {isSelected && <FiCheck size={12} />}
                                                {province}
                                            </button>
                                        );
                                    })}
                            </div>
                            {VIETNAM_PROVINCES.filter(province =>
                                province.toLowerCase().includes(searchRegion.toLowerCase())
                            ).length > 10 && (
                                    <details className="chip-more">
                                        <summary className="chip-more-toggle">
                                            Xem thêm {VIETNAM_PROVINCES.filter(province =>
                                                province.toLowerCase().includes(searchRegion.toLowerCase())
                                            ).length - 10} tỉnh thành
                                        </summary>
                                        <div className="chip-container" style={{ marginTop: '0.75rem' }}>
                                            {VIETNAM_PROVINCES
                                                .filter(province =>
                                                    province.toLowerCase().includes(searchRegion.toLowerCase())
                                                )
                                                .slice(10)
                                                .map(province => {
                                                    const isSelected = formData.working_regions.includes(province);
                                                    return (
                                                        <button
                                                            key={province}
                                                            type="button"
                                                            onClick={() => toggleArrayItem(province, 'working_regions')}
                                                            className={`chip ${isSelected ? 'chip-selected' : ''}`}
                                                        >
                                                            {isSelected && <FiCheck size={12} />}
                                                            {province}
                                                        </button>
                                                    );
                                                })}
                                        </div>
                                    </details>
                                )}
                            {formData.working_regions.length === 0 && (
                                <p className="form-error">Vui lòng chọn ít nhất một khu vực</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label form-label-required">
                                Lĩnh vực chuyên môn
                            </label>

                            {/* Search input for fields */}
                            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                                <FiSearch
                                    size={16}
                                    style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#6c757d',
                                        pointerEvents: 'none'
                                    }}
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    value={searchField}
                                    onChange={(e) => setSearchField(e.target.value)}
                                    placeholder="Tìm kiếm lĩnh vực..."
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>

                            <div className="chip-container">
                                {JOB_FIELDS
                                    .filter(field =>
                                        field.toLowerCase().includes(searchField.toLowerCase())
                                    )
                                    .map(field => {
                                        const isSelected = formData.fields.includes(field);
                                        return (
                                            <button
                                                key={field}
                                                type="button"
                                                onClick={() => toggleArrayItem(field, 'fields')}
                                                className={`chip ${isSelected ? 'chip-selected' : ''}`}
                                            >
                                                {isSelected && <FiCheck size={12} />}
                                                {field}
                                            </button>
                                        );
                                    })}
                            </div>
                            {formData.fields.length === 0 && (
                                <p className="form-error">Vui lòng chọn ít nhất một lĩnh vực</p>
                            )}
                        </div>
                    </div>

                    {/* Salary & Employment Section */}
                    <div className="job-form-section">
                        <div className="job-form-section-header">
                            <FiDollarSign className="section-icon" />
                            <h2>Lương & Hình thức</h2>
                        </div>

                        <div className="salary-grid">
                            <div className="form-group">
                                <label className="form-label">Mức lương tối thiểu</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.salary_min}
                                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                                    placeholder="10,000,000"
                                    disabled={formData.is_negotiable}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mức lương tối đa</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.salary_max}
                                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                                    placeholder="20,000,000"
                                    disabled={formData.is_negotiable}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Đơn vị tiền tệ</label>
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

                        <div className="checkbox-group">
                            <label className="checkbox-label">
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
                                <span>Mức lương thỏa thuận</span>
                            </label>
                        </div>

                        <div className="form-group">
                            <label className="form-label form-label-required">Hình thức làm việc</label>
                            <div className="chip-container">
                                {EMPLOYMENT_TYPES.map(type => {
                                    const isSelected = formData.employment_types.includes(type);
                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => toggleArrayItem(type, 'employment_types')}
                                            className={`chip ${isSelected ? 'chip-selected' : ''}`}
                                        >
                                            {isSelected && <FiCheck size={12} />}
                                            {type}
                                        </button>
                                    );
                                })}
                            </div>
                            {formData.employment_types.length === 0 && (
                                <p className="form-error">Vui lòng chọn ít nhất một hình thức</p>
                            )}
                        </div>
                    </div>

                    {/* Job Details Section */}
                    <div className="job-form-section">
                        <div className="job-form-section-header">
                            <FiFileText className="section-icon" />
                            <h2>Chi tiết công việc</h2>
                        </div>

                        {/* Work Locations */}
                        <div className="form-group">
                            <label className="form-label form-label-required">Địa điểm làm việc cụ thể</label>
                            <div className="input-with-button">
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newWorkLocation}
                                    onChange={(e) => setNewWorkLocation(e.target.value)}
                                    placeholder="VD: Tòa nhà A, Cầu Giấy, Hà Nội"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(newWorkLocation, setNewWorkLocation, 'work_locations'))}
                                />
                                <button
                                    type="button"
                                    className="btn btn-icon"
                                    onClick={() => addItem(newWorkLocation, setNewWorkLocation, 'work_locations')}
                                    title="Thêm địa điểm"
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            <div className="item-list">
                                {formData.work_locations.map((loc, idx) => (
                                    <div key={idx} className="item-card">
                                        <span className="item-text">{loc}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(idx, 'work_locations')}
                                            className="item-remove"
                                            title="Xóa"
                                        >
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="form-group">
                            <label className="form-label form-label-required">Mô tả công việc</label>
                            <div className="input-with-button">
                                <textarea
                                    className="form-textarea"
                                    value={newJobDesc}
                                    onChange={(e) => setNewJobDesc(e.target.value)}
                                    placeholder="Nhập mô tả công việc chi tiết..."
                                    rows={3}
                                />
                                <button
                                    type="button"
                                    className="btn btn-icon"
                                    onClick={() => addItem(newJobDesc, setNewJobDesc, 'job_description')}
                                    title="Thêm mô tả"
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            <div className="item-list">
                                {formData.job_description.map((desc, idx) => (
                                    <div key={idx} className="item-card">
                                        <span className="item-text">{desc}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(idx, 'job_description')}
                                            className="item-remove"
                                            title="Xóa"
                                        >
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Candidate Requirements */}
                        <div className="form-group">
                            <label className="form-label form-label-required">Yêu cầu ứng viên</label>
                            <div className="input-with-button">
                                <textarea
                                    className="form-textarea"
                                    value={newRequirement}
                                    onChange={(e) => setNewRequirement(e.target.value)}
                                    placeholder="Nhập yêu cầu cụ thể cho ứng viên..."
                                    rows={3}
                                />
                                <button
                                    type="button"
                                    className="btn btn-icon"
                                    onClick={() => addItem(newRequirement, setNewRequirement, 'candidate_requirements')}
                                    title="Thêm yêu cầu"
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            <div className="item-list">
                                {formData.candidate_requirements.map((req, idx) => (
                                    <div key={idx} className="item-card">
                                        <span className="item-text">{req}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(idx, 'candidate_requirements')}
                                            className="item-remove"
                                            title="Xóa"
                                        >
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="form-group">
                            <label className="form-label form-label-required">Quyền lợi</label>
                            <div className="input-with-button">
                                <textarea
                                    className="form-textarea"
                                    value={newBenefit}
                                    onChange={(e) => setNewBenefit(e.target.value)}
                                    placeholder="Nhập quyền lợi cho ứng viên..."
                                    rows={2}
                                />
                                <button
                                    type="button"
                                    className="btn btn-icon"
                                    onClick={() => addItem(newBenefit, setNewBenefit, 'benefits')}
                                    title="Thêm quyền lợi"
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            <div className="item-list">
                                {formData.benefits.map((benefit, idx) => (
                                    <div key={idx} className="item-card">
                                        <span className="item-text">{benefit}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(idx, 'benefits')}
                                            className="item-remove"
                                            title="Xóa"
                                        >
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="form-group">
                            <label className="form-label form-label-required">Kỹ năng / Từ khóa</label>
                            <div className="input-with-button">
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="VD: Flutter, Dart, Firebase, React..."
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(newTag, setNewTag, 'requirements_tags'))}
                                />
                                <button
                                    type="button"
                                    className="btn btn-icon"
                                    onClick={() => addItem(newTag, setNewTag, 'requirements_tags')}
                                    title="Thêm tag"
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            <div className="tag-list">
                                {formData.requirements_tags.map((tag, idx) => (
                                    <span key={idx} className="tag-item">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeItem(idx, 'requirements_tags')}
                                            className="tag-remove"
                                            title="Xóa tag"
                                        >
                                            <FiX size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Settings Section */}
                    <div className="job-form-section">
                        <div className="job-form-section-header">
                            <FiSettings className="section-icon" />
                            <h2>Cài đặt tin tuyển dụng</h2>
                        </div>

                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <div>
                                    <span className="checkbox-title">Kích hoạt tin ngay</span>
                                    <span className="checkbox-description">
                                        {formData.is_active ? 'Tin sẽ hiển thị với ứng viên sau khi được duyệt' : 'Tin sẽ ở trạng thái nháp'}
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="job-form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary btn-lg"
                            onClick={() => navigate('/employer/jobs')}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                                    Đang đăng...
                                </>
                            ) : (
                                <>
                                    <FiPlus size={18} />
                                    Đăng tin tuyển dụng
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
