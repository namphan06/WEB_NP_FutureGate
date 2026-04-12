import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { JOB_FIELDS } from '../constants/jobFields';
import { EMPLOYMENT_TYPES } from '../constants/employmentTypes';
import { VIETNAM_PROVINCES } from '../constants/vietnamProvinces';
import { FiBriefcase, FiMapPin, FiDollarSign, FiAward, FiCheckCircle, FiAlertCircle, FiTarget } from 'react-icons/fi';

const EXPERIENCE_LEVELS = [
    'Thực tập sinh',
    'Mới tốt nghiệp',
    'Nhân viên (1-3 năm)',
    'Chuyên viên (3-5 năm)',
    'Quản lý (5-10 năm)',
    'Giám đốc (10+ năm)'
];

const SALARY_RANGES = [
    { label: 'Dưới 10 triệu', min: 0, max: 10 },
    { label: '10 - 15 triệu', min: 10, max: 15 },
    { label: '15 - 20 triệu', min: 15, max: 20 },
    { label: '20 - 30 triệu', min: 20, max: 30 },
    { label: '30 - 50 triệu', min: 30, max: 50 },
    { label: 'Trên 50 triệu', min: 50, max: 999 },
    { label: 'Thỏa thuận', min: 0, max: 0 }
];

export default function JobSuggestPage() {
    const { profile, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
    const [experienceLevel, setExperienceLevel] = useState('');
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [salaryRange, setSalaryRange] = useState<string>('');

    useEffect(() => {
        if (profile?.metadata) {
            const meta = profile.metadata;
            if (meta.job_preferences) {
                const prefs = meta.job_preferences;
                setSelectedFields(prefs.fields || []);
                setSelectedWorkTypes(prefs.work_types || []);
                setExperienceLevel(prefs.experience_level || '');
                setSelectedRegions(prefs.regions || []);
                setSalaryRange(prefs.salary_range || '');
            }
        }
    }, [profile]);

    const toggleField = (field: string) => {
        setSelectedFields(prev =>
            prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
        );
    };

    const toggleWorkType = (type: string) => {
        setSelectedWorkTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const toggleRegion = (region: string) => {
        setSelectedRegions(prev =>
            prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
        );
    };

    const handleSave = async () => {
        if (selectedFields.length === 0) {
            setMessage({ type: 'error', text: 'Vui lòng chọn ít nhất một lĩnh vực công việc.' });
            return;
        }
        if (selectedRegions.length === 0) {
            setMessage({ type: 'error', text: 'Vui lòng chọn ít nhất một khu vực làm việc.' });
            return;
        }

        try {
            setLoading(true);
            setMessage(null);
            await updateProfile({
                metadata: {
                    ...(profile?.metadata || {}),
                    job_preferences: {
                        fields: selectedFields,
                        work_types: selectedWorkTypes,
                        experience_level: experienceLevel,
                        regions: selectedRegions,
                        salary_range: salaryRange,
                        updated_at: new Date().toISOString()
                    }
                }
            });
            setMessage({ type: 'success', text: 'Đã lưu sở thích công việc thành công!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra khi lưu.' });
        } finally {
            setLoading(false);
        }
    };

    if (!profile || profile.role !== 'candidate') {
        return (
            <div className="section" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
                <FiAlertCircle size={48} style={{ color: '#EF4444', marginBottom: '1rem' }} />
                <h2 style={{ color: '#1E293B', marginBottom: '0.5rem' }}>Trang này chỉ dành cho ứng viên</h2>
                <p style={{ color: '#64748B' }}>Vui lòng đăng nhập bằng tài khoản ứng viên để thiết lập sở thích công việc.</p>
            </div>
        );
    }

    return (
        <div className="section" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem' }}>
                    <FiTarget style={{ display: 'inline', marginRight: '0.5rem', color: '#1E88E5' }} />
                    Thiết lập sở thích công việc
                </h1>
                <p style={{ color: '#64748B', fontWeight: 500 }}>
                    Chọn các tiêu chí để hệ thống gợi ý việc làm phù hợp nhất với bạn.
                </p>
            </div>

            {message && (
                <div style={{
                    padding: '1rem 1.5rem',
                    borderRadius: '16px',
                    marginBottom: '2rem',
                    background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                    border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}`,
                    color: message.type === 'success' ? '#065F46' : '#991B1B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    {message.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
                    <span style={{ fontWeight: 600 }}>{message.text}</span>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Job Fields */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                    <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 800, color: '#1E293B' }}>
                        <FiBriefcase style={{ color: '#1E88E5' }} /> Lĩnh vực công việc
                    </h3>
                    <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1rem' }}>Chọn ít nhất một lĩnh vực bạn quan tâm.</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {JOB_FIELDS.map(field => (
                            <button
                                key={field}
                                onClick={() => toggleField(field)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '12px',
                                    border: selectedFields.includes(field) ? '2px solid #1E88E5' : '1px solid #E2E8F0',
                                    background: selectedFields.includes(field) ? '#E3F2FD' : '#F8FAFC',
                                    color: selectedFields.includes(field) ? '#1565C0' : '#475569',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {selectedFields.includes(field) && '✓ '}{field}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Work Types */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                    <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 800, color: '#1E293B' }}>
                        <FiAward style={{ color: '#10B981' }} /> Hình thức làm việc
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {EMPLOYMENT_TYPES.map(type => (
                            <button
                                key={type}
                                onClick={() => toggleWorkType(type)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '12px',
                                    border: selectedWorkTypes.includes(type) ? '2px solid #10B981' : '1px solid #E2E8F0',
                                    background: selectedWorkTypes.includes(type) ? '#ECFDF5' : '#F8FAFC',
                                    color: selectedWorkTypes.includes(type) ? '#059669' : '#475569',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {selectedWorkTypes.includes(type) && '✓ '}{type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Experience Level */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                    <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 800, color: '#1E293B' }}>
                        <FiAward style={{ color: '#F59E0B' }} /> Cấp bậc kinh nghiệm
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {EXPERIENCE_LEVELS.map(level => (
                            <label
                                key={level}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    background: experienceLevel === level ? '#FFF8E1' : '#F8FAFC',
                                    border: experienceLevel === level ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <input
                                    type="radio"
                                    name="experienceLevel"
                                    checked={experienceLevel === level}
                                    onChange={() => setExperienceLevel(level)}
                                    style={{ accentColor: '#F59E0B' }}
                                />
                                <span style={{ fontWeight: 600, color: '#475569' }}>{level}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Working Regions */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                    <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 800, color: '#1E293B' }}>
                        <FiMapPin style={{ color: '#EF4444' }} /> Khu vực làm việc
                    </h3>
                    <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1rem' }}>Chọn tỉnh thành bạn muốn làm việc.</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {VIETNAM_PROVINCES.map(region => (
                            <button
                                key={region}
                                onClick={() => toggleRegion(region)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '12px',
                                    border: selectedRegions.includes(region) ? '2px solid #EF4444' : '1px solid #E2E8F0',
                                    background: selectedRegions.includes(region) ? '#FEF2F2' : '#F8FAFC',
                                    color: selectedRegions.includes(region) ? '#DC2626' : '#475569',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {selectedRegions.includes(region) && '✓ '}{region}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Salary Range */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                    <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 800, color: '#1E293B' }}>
                        <FiDollarSign style={{ color: '#8B5CF6' }} /> Mức lương mong muốn (triệu VNĐ/tháng)
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {SALARY_RANGES.map(range => (
                            <button
                                key={range.label}
                                onClick={() => setSalaryRange(range.label)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '12px',
                                    border: salaryRange === range.label ? '2px solid #8B5CF6' : '1px solid #E2E8F0',
                                    background: salaryRange === range.label ? '#EDE9FE' : '#F8FAFC',
                                    color: salaryRange === range.label ? '#7C3AED' : '#475569',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {salaryRange === range.label && '✓ '}{range.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '14px',
                            border: '1px solid #E2E8F0',
                            background: 'white',
                            color: '#475569',
                            fontWeight: 700,
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '14px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #1E88E5, #42A5F5)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            boxShadow: '0 4px 15px rgba(30, 136, 229, 0.3)'
                        }}
                    >
                        {loading ? 'Đang lưu...' : 'Lưu sở thích'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
