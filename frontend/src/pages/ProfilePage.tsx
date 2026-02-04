import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
    FiUser, FiMail, FiPhone, FiBriefcase, FiEdit2, FiSave, FiX,
    FiMapPin, FiCalendar, FiBook, FiList, FiPlus, FiTrash2, FiShield,
    FiFileText
} from 'react-icons/fi';

interface Experience {
    date: string;
    company: string;
    position: string;
    description: string;
}

export default function ProfilePage() {
    const { profile, user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cvs, setCvs] = useState<any[]>([]);

    // Form states
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [metadata, setMetadata] = useState<any>({
        bio: '',
        tags: [],
        cv_ids: [],
        address: '',
        security: true,
        education: '',
        experience: [],
        work_types: [],
        date_of_birth: '',
        work_locations: [],
        interested_fields: []
    });

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setPhone(profile.phone || '');
            setMetadata({
                bio: profile.metadata?.bio || '',
                tags: profile.metadata?.tags || [],
                cv_ids: profile.metadata?.cv_ids || [],
                address: profile.metadata?.address || '',
                security: profile.metadata?.security ?? true,
                education: profile.metadata?.education || '',
                experience: profile.metadata?.experience || [],
                work_types: profile.metadata?.work_types || [],
                date_of_birth: profile.metadata?.date_of_birth || '',
                work_locations: profile.metadata?.work_locations || [],
                interested_fields: profile.metadata?.interested_fields || []
            });
        }
    }, [profile]);

    useEffect(() => {
        if (user) fetchCVs();
    }, [user]);

    const fetchCVs = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('cv_templates')
            .select('id, title')
            .eq('user_id', user.id);
        if (data) setCvs(data);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await updateProfile({
                full_name: fullName,
                phone: phone,
                metadata: metadata
            });
            setIsEditing(false);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const addExperience = () => {
        setMetadata({
            ...metadata,
            experience: [...(metadata.experience || []), { date: '', company: '', position: '', description: '' }]
        });
    };

    const updateExperience = (index: number, field: keyof Experience, value: string) => {
        const newExp = [...(metadata.experience || [])];
        newExp[index] = { ...newExp[index], [field]: value };
        setMetadata({ ...metadata, experience: newExp });
    };

    const removeExperience = (index: number) => {
        const newExp = (metadata.experience || []).filter((_: any, i: number) => i !== index);
        setMetadata({ ...metadata, experience: newExp });
    };

    const handleMultiSelect = (field: string, value: string) => {
        const currentArr = metadata[field] || [];
        if (currentArr.includes(value)) {
            setMetadata({ ...metadata, [field]: currentArr.filter((v: string) => v !== value) });
        } else {
            setMetadata({ ...metadata, [field]: [...currentArr, value] });
        }
    };

    if (!profile) {
        return (
            <div className="container section">
                <div className="loading text-center">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="container section">
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <h1>Hồ sơ cá nhân</h1>
                {!isEditing ? (
                    <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                        <FiEdit2 size={18} /> Chỉnh sửa hồ sơ
                    </button>
                ) : (
                    <div className="flex gap-sm">
                        <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                            <FiX size={18} /> Hủy
                        </button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                            <FiSave size={18} /> {loading ? 'Đang lưu...' : 'Lưu hồ sơ'}
                        </button>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--spacing-2xl)' }}>
                {/* Left Sidebar: Basic Info */}
                <div>
                    <div className="card text-center" style={{ position: 'sticky', top: 'var(--spacing-xl)' }}>
                        <div style={{ marginBottom: 'var(--spacing-xl)', position: 'relative', display: 'inline-block' }}>
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--color-primary)' }} />
                            ) : (
                                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold', color: 'white', border: '4px solid var(--color-primary)' }}>
                                    {profile.full_name?.[0] || 'U'}
                                </div>
                            )}
                        </div>

                        <div style={{ textAlign: 'left' }}>
                            <div className="form-group">
                                <label className="form-label"><FiUser size={14} /> Họ và tên</label>
                                {isEditing ? (
                                    <input type="text" className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} />
                                ) : (
                                    <div style={{ fontWeight: 600 }}>{profile.full_name}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label"><FiMail size={14} /> Email</label>
                                <div style={{ color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>{profile.email}</div>
                            </div>

                            <div className="form-group">
                                <label className="form-label"><FiPhone size={14} /> Số điện thoại</label>
                                {isEditing ? (
                                    <input type="tel" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
                                ) : (
                                    <div style={{ fontWeight: 600 }}>{profile.phone || 'Chưa cập nhật'}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label"><FiBriefcase size={14} /> Vai trò</label>
                                <span className="badge badge-primary">
                                    {profile.role === 'candidate' ? 'Ứng viên' : profile.role === 'employer' ? 'Nhà tuyển dụng' : 'Nhà trường'}
                                </span>
                            </div>

                            <div className="form-group">
                                <label className="form-label"><FiShield size={14} /> Bảo mật hồ sơ</label>
                                {isEditing ? (
                                    <div className="flex items-center gap-sm">
                                        <input type="checkbox" checked={metadata.security} onChange={e => setMetadata({ ...metadata, security: e.target.checked })} />
                                        <span style={{ fontSize: '0.875rem' }}>Cho phép nhà tuyển dụng tìm thấy tôi</span>
                                    </div>
                                ) : (
                                    <div>{metadata.security ? '✅ Công khai' : '🔒 Riêng tư'}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content: Metadata fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
                    {/* Giới thiệu bản thân */}
                    <div className="card">
                        <h3><FiList size={20} /> Giới thiệu</h3>
                        {isEditing ? (
                            <textarea
                                className="form-input"
                                style={{ minHeight: '120px' }}
                                value={metadata.bio}
                                onChange={e => setMetadata({ ...metadata, bio: e.target.value })}
                                placeholder="Hãy viết vài câu giới thiệu về bản thân..."
                            />
                        ) : (
                            <p style={{ whiteSpace: 'pre-line', color: 'var(--color-text-secondary)' }}>
                                {metadata.bio || 'Chưa có thông tin giới thiệu.'}
                            </p>
                        )}
                    </div>

                    {/* Thông tin chi tiết */}
                    <div className="card">
                        <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-xl)' }}>
                            <div className="form-group">
                                <label className="form-label"><FiMapPin size={14} /> Địa chỉ hiện tại</label>
                                {isEditing ? (
                                    <input type="text" className="form-input" value={metadata.address} onChange={e => setMetadata({ ...metadata, address: e.target.value })} />
                                ) : (
                                    <div>{metadata.address || 'Chưa cập nhật'}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label"><FiCalendar size={14} /> Ngày sinh</label>
                                {isEditing ? (
                                    <input type="date" className="form-input" value={metadata.date_of_birth?.split('T')[0]} onChange={e => setMetadata({ ...metadata, date_of_birth: e.target.value })} />
                                ) : (
                                    <div>{metadata.date_of_birth ? new Date(metadata.date_of_birth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label"><FiBook size={14} /> Trình độ học vấn</label>
                                {isEditing ? (
                                    <select className="form-select" value={metadata.education} onChange={e => setMetadata({ ...metadata, education: e.target.value })}>
                                        <option value="">Chọn trình độ</option>
                                        <option value="Đại học">Đại học</option>
                                        <option value="Cao đẳng">Cao đẳng</option>
                                        <option value="Thạc sĩ">Thạc sĩ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                ) : (
                                    <div>{metadata.education || 'Chưa cập nhật'}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label"><FiFileText size={14} /> CV liên kết</label>
                                {isEditing ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        {cvs.map(cv => (
                                            <label key={cv.id} className="flex items-center gap-sm" style={{ cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={metadata.cv_ids?.includes(cv.id)}
                                                    onChange={() => handleMultiSelect('cv_ids', cv.id)}
                                                />
                                                {cv.title}
                                            </label>
                                        ))}
                                        {cvs.length === 0 && <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Bạn chưa có CV nào.</div>}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-xs">
                                        {metadata.cv_ids?.length > 0 ? (
                                            metadata.cv_ids.map((id: string) => {
                                                const cv = cvs.find(c => c.id === id);
                                                return <span key={id} className="badge badge-success">{cv?.title || 'CV cũ'}</span>;
                                            })
                                        ) : 'Chưa chọn CV'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: 'var(--spacing-md)' }}>
                            <label className="form-label">Khu vực làm việc mong muốn</label>
                            {isEditing ? (
                                <div className="flex flex-wrap gap-md">
                                    {['Hà Nội', 'TP HCM', 'Đà Nẵng', 'Remote'].map(loc => (
                                        <label key={loc} className="flex items-center gap-sm">
                                            <input type="checkbox" checked={metadata.work_locations?.includes(loc)} onChange={() => handleMultiSelect('work_locations', loc)} />
                                            {loc}
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-xs">
                                    {metadata.work_locations?.map((loc: string) => <span key={loc} className="badge badge-outline">{loc}</span>) || 'Chưa cập nhật'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Kỹ năng & Mục tiêu */}
                    <div className="card">
                        <h3>Kỹ năng & Mục tiêu</h3>
                        <div className="form-group">
                            <label className="form-label">Kỹ năng (Tags)</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="python, flutter, ts1 (phân cách bằng dấu phẩy)"
                                    value={metadata.tags?.join(', ')}
                                    onChange={e => setMetadata({ ...metadata, tags: e.target.value.split(',').map(s => s.trim()) })}
                                />
                            ) : (
                                <div className="flex flex-wrap gap-xs">
                                    {metadata.tags?.map((tag: string) => <span key={tag} className="badge badge-primary">{tag}</span>) || 'Chưa cập nhật'}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-xl)' }}>
                            <div className="form-group">
                                <label className="form-label">Lĩnh vực quan tâm</label>
                                {isEditing ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        {['IT - Phần mềm', 'Marketing / Truyền thông', 'Kế toán', 'Khác'].map(field => (
                                            <label key={field} className="flex items-center gap-sm">
                                                <input type="checkbox" checked={metadata.interested_fields?.includes(field)} onChange={() => handleMultiSelect('interested_fields', field)} />
                                                {field}
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-xs">
                                        {metadata.interested_fields?.map((f: string) => <span key={f} className="badge badge-info">{f}</span>) || 'Chưa cập nhật'}
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Hình thức làm việc</label>
                                {isEditing ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        {['Toàn thời gian', 'Part-time', 'Freelance'].map(type => (
                                            <label key={type} className="flex items-center gap-sm">
                                                <input type="checkbox" checked={metadata.work_types?.includes(type)} onChange={() => handleMultiSelect('work_types', type)} />
                                                {type}
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-xs">
                                        {metadata.work_types?.map((t: string) => <span key={t} className="badge badge-secondary">{t}</span>) || 'Chưa cập nhật'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Kinh nghiệm làm việc */}
                    <div className="card">
                        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <h3>Kinh nghiệm làm việc</h3>
                            {isEditing && (
                                <button className="btn btn-sm btn-outline-primary" onClick={addExperience}>
                                    <FiPlus size={14} /> Thêm kinh nghiệm
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {metadata.experience?.map((exp: Experience, index: number) => (
                                <div key={index} className="card" style={{ background: 'var(--color-background)', border: '1px dashed var(--color-divider)' }}>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                            <div className="flex justify-between">
                                                <input className="form-input" placeholder="Thời gian (VD: 2022 - Nay)" value={exp.date} onChange={e => updateExperience(index, 'date', e.target.value)} style={{ width: '45%' }} />
                                                <button className="btn btn-sm btn-outline-error" onClick={() => removeExperience(index)}><FiTrash2 size={14} /></button>
                                            </div>
                                            <input className="form-input" placeholder="Tên công ty" value={exp.company} onChange={e => updateExperience(index, 'company', e.target.value)} />
                                            <input className="form-input" placeholder="Vị trí" value={exp.position} onChange={e => updateExperience(index, 'position', e.target.value)} />
                                            <textarea className="form-input" placeholder="Mô tả công việc" value={exp.description} onChange={e => updateExperience(index, 'description', e.target.value)} />
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex justify-between items-start" style={{ marginBottom: '0.25rem' }}>
                                                <h4 style={{ margin: 0 }}>{exp.position}</h4>
                                                <span style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600 }}>{exp.date}</span>
                                            </div>
                                            <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>{exp.company}</div>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>{exp.description}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {metadata.experience?.length === 0 && <div className="text-center" style={{ color: 'var(--color-text-secondary)', padding: 'var(--spacing-lg)' }}>Chưa có kinh nghiệm làm việc nào được thêm.</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

