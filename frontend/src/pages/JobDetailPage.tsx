import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Job } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
    FiMapPin, FiDollarSign, FiBriefcase, FiClock, FiCheckCircle,
    FiBookmark, FiShare2, FiHome, FiChevronRight, FiCalendar,
    FiUsers, FiAward
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function JobDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [saved, setSaved] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (id) fetchJob();
    }, [id]);

    const fetchJob = async () => {
        try {
            setLoading(true);
            // Fetch job first
            const { data: jobData, error: jobError } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', id)
                .single();

            if (jobError) throw jobError;

            if (jobData) {
                // Fetch employer profile
                const { data: employerData, error: employerError } = await supabase
                    .from('profiles')
                    .select('id, full_name, company_name, avatar_url, email, phone, metadata')
                    .eq('id', jobData.employer_id)
                    .single();

                if (employerError) {
                    console.warn('Error fetching employer:', employerError);
                }

                // Merge data
                setJob({
                    ...jobData,
                    profiles: employerData
                } as any);

                // Increment view count
                await supabase
                    .from('jobs')
                    .update({ view_count: (jobData.view_count || 0) + 1 })
                    .eq('id', id);
            }
        } catch (error) {
            console.error('Error fetching job:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!user || !id) return;

        try {
            setApplying(true);
            const { error } = await supabase.rpc('apply_to_job', {
                p_job_id: id,
                p_user_id: user.id,
                p_cv_id: '00000000-0000-0000-0000-000000000000' // Placeholder
            });

            if (error) throw error;
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error: any) {
            alert(error.message || 'Ứng tuyển thất bại');
        } finally {
            setApplying(false);
        }
    };

    const handleSave = () => {
        setSaved(!saved);
        // TODO: Implement save to database
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: job?.metadata.title,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Đã copy link!');
        }
    };

    const formatSalary = (salary: any) => {
        if (!salary) return 'Thỏa thuận';
        if (typeof salary === 'string') return salary;
        if (salary.is_negotiable) return 'Thỏa thuận';

        if (salary.min && salary.max) {
            return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency}/${salary.type === 'monthly' ? 'tháng' : 'năm'}`;
        }
        return 'Thỏa thuận';
    };

    if (loading) {
        return (
            <div className="container section">
                <div className="loading text-center">Đang tải...</div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="container section">
                <div className="text-center">
                    <h2>Không tìm thấy công việc</h2>
                    <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 'var(--spacing-lg)' }}>
                        Quay lại trang tìm việc
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: 'var(--color-background)', minHeight: '100vh', paddingTop: 'var(--spacing-lg)' }}>
            <div className="container">
                {/* Breadcrumb */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)',
                    marginBottom: 'var(--spacing-lg)',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)'
                }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <FiHome size={16} />
                        Trang chủ
                    </Link>
                    <FiChevronRight size={14} />
                    <Link to="/jobs">Tìm việc làm</Link>
                    <FiChevronRight size={14} />
                    <span style={{ color: 'var(--color-text)' }}>{job.metadata.title}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--spacing-2xl)' }}>
                    {/* Main Content */}
                    <div>
                        {/* Header Card */}
                        <div className="card animate-fade-in" style={{ marginBottom: 'var(--spacing-xl)' }}>
                            <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'start' }}>
                                {/* Company Logo */}
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--color-divider)',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}>
                                    {(job.profiles as any)?.avatar_url ? (
                                        <img
                                            src={(job.profiles as any).avatar_url}
                                            alt={(job.profiles as any)?.company_name || ''}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '3rem',
                                            fontWeight: 'bold',
                                            color: 'white'
                                        }}>
                                            {((job.profiles as any)?.company_name?.[0] || 'C').toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Job Info */}
                                <div style={{ flex: 1 }}>
                                    <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--spacing-md)', lineHeight: 1.3 }}>
                                        {job.metadata.title}
                                    </h1>
                                    <p style={{
                                        fontSize: '1.125rem',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: 'var(--spacing-lg)',
                                        fontWeight: 500
                                    }}>
                                        {(job.profiles as any)?.company_name || job.profiles?.full_name || 'Công ty'}
                                    </p>

                                    {/* Quick Info */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-lg)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FiDollarSign size={20} style={{ color: 'var(--color-secondary)' }} />
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Mức lương</div>
                                                <div style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>
                                                    {formatSalary(job.metadata.salary)}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FiMapPin size={20} style={{ color: 'var(--color-primary)' }} />
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Địa điểm</div>
                                                <div style={{ fontWeight: 600 }}>
                                                    {job.metadata.working_regions?.slice(0, 2).join(', ') || 'Hà Nội'}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FiBriefcase size={20} style={{ color: 'var(--color-accent)' }} />
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Kinh nghiệm</div>
                                                <div style={{ fontWeight: 600 }}>
                                                    {job.metadata.experience_required || 'Không yêu cầu'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                        <button
                                            onClick={handleApply}
                                            className="btn btn-primary btn-lg"
                                            disabled={applying || success}
                                            style={{ minWidth: '200px' }}
                                        >
                                            {success ? (
                                                <>
                                                    <FiCheckCircle size={20} />
                                                    Đã ứng tuyển
                                                </>
                                            ) : applying ? 'Đang xử lý...' : (
                                                <>
                                                    Ứng tuyển ngay
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={handleSave}
                                            className="btn btn-outline-primary"
                                            style={{
                                                background: saved ? 'rgba(30, 136, 229, 0.1)' : 'transparent'
                                            }}
                                        >
                                            <FiBookmark size={18} fill={saved ? 'var(--color-primary)' : 'none'} />
                                            Lưu tin
                                        </button>

                                        <button
                                            onClick={handleShare}
                                            className="btn btn-secondary"
                                        >
                                            <FiShare2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Deadline Warning */}
                            <div style={{
                                marginTop: 'var(--spacing-lg)',
                                padding: 'var(--spacing-md)',
                                background: 'rgba(255, 193, 7, 0.1)',
                                borderLeft: '4px solid var(--color-warning)',
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)'
                            }}>
                                <FiCalendar size={18} style={{ color: 'var(--color-warning)' }} />
                                <span style={{ fontSize: '0.9375rem' }}>
                                    Hạn nộp hồ sơ: {new Date(job.deadline).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>

                        {/* Job Details */}
                        <div className="card">
                            {/* Chi tiết tin tuyển dụng */}
                            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Chi tiết tin tuyển dụng</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-2xl)' }}>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                                        Số lượng tuyển
                                    </div>
                                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FiUsers size={16} style={{ color: 'var(--color-primary)' }} />
                                        {job.metadata.number_of_positions || 1} người
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                                        Hình thức làm việc
                                    </div>
                                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FiClock size={16} style={{ color: 'var(--color-info)' }} />
                                        {job.metadata.employment_types?.join(', ') || 'Toàn thời gian'}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                                        Cấp bậc
                                    </div>
                                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FiAward size={16} style={{ color: 'var(--color-accent)' }} />
                                        {job.metadata.experience_level || 'Nhân viên'}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                                        Giới tính
                                    </div>
                                    <div style={{ fontWeight: 600 }}>
                                        Không yêu cầu
                                    </div>
                                </div>
                            </div>

                            {/* Mô tả công việc */}
                            <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Mô tả công việc</h3>
                                <div style={{ paddingLeft: 'var(--spacing-lg)' }}>
                                    {Array.isArray(job.metadata.job_description) ? (
                                        <ul style={{ listStyleType: 'disc', margin: 0 }}>
                                            {job.metadata.job_description.map((desc: string, index: number) => (
                                                <li key={index} style={{ marginBottom: 'var(--spacing-sm)', lineHeight: 1.6 }}>{desc}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>{job.metadata.job_description || job.metadata.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Yêu cầu ứng viên */}
                            <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Yêu cầu ứng viên</h3>
                                <div style={{ paddingLeft: 'var(--spacing-lg)' }}>
                                    {Array.isArray(job.metadata.candidate_requirements) ? (
                                        <ul style={{ listStyleType: 'disc', margin: 0 }}>
                                            {job.metadata.candidate_requirements.map((req: string, index: number) => (
                                                <li key={index} style={{ marginBottom: 'var(--spacing-sm)', lineHeight: 1.6 }}>{req}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>{job.metadata.candidate_requirements || job.metadata.requirements}</p>
                                    )}
                                </div>
                            </div>

                            {/* Quyền lợi */}
                            <div>
                                <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Quyền lợi</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
                                    {Array.isArray(job.metadata.benefits) && job.metadata.benefits.map((benefit: string, index: number) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--spacing-sm)',
                                            padding: 'var(--spacing-sm)',
                                            background: 'var(--color-background)',
                                            borderRadius: 'var(--radius-sm)'
                                        }}>
                                            <FiCheckCircle size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                                            <span style={{ lineHeight: 1.4 }}>{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Company Info Card */}
                        <div className="card animate-slide-in" style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--spacing-lg))' }}>
                            <h4 style={{ marginBottom: 'var(--spacing-lg)' }}>Thông tin công ty</h4>

                            <div style={{
                                textAlign: 'center',
                                paddingBottom: 'var(--spacing-lg)',
                                borderBottom: '1px solid var(--color-divider)',
                                marginBottom: 'var(--spacing-lg)'
                            }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--color-divider)',
                                    overflow: 'hidden',
                                    margin: '0 auto var(--spacing-md)'
                                }}>
                                    {(job.profiles as any)?.avatar_url ? (
                                        <img
                                            src={(job.profiles as any).avatar_url}
                                            alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2rem',
                                            fontWeight: 'bold',
                                            color: 'white'
                                        }}>
                                            {((job.profiles as any)?.company_name?.[0] || 'C').toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <h4 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                                    {(job.profiles as any)?.company_name || job.profiles?.full_name}
                                </h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                    Quy mô: 100-499 nhân viên
                                </p>
                            </div>

                            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'start',
                                    gap: 'var(--spacing-sm)',
                                    marginBottom: 'var(--spacing-md)'
                                }}>
                                    <FiMapPin size={16} style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem', flexShrink: 0 }} />
                                    <div style={{ fontSize: '0.9375rem' }}>
                                        {(job.profiles as any)?.metadata?.address || 'Hà Nội, Việt Nam'}
                                    </div>
                                </div>
                            </div>

                            <Link
                                to={`/company/${job.employer_id}`}
                                className="btn btn-outline-primary"
                                style={{ width: '100%' }}
                            >
                                Xem trang công ty
                            </Link>

                            <div style={{
                                marginTop: 'var(--spacing-lg)',
                                paddingTop: 'var(--spacing-lg)',
                                borderTop: '1px solid var(--color-divider)',
                                fontSize: '0.875rem',
                                color: 'var(--color-text-secondary)'
                            }}>
                                <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                                    Đăng {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: vi })}
                                </div>
                                <div>
                                    {job.view_count || 0} lượt xem
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
