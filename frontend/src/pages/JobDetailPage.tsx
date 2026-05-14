import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
    FiMapPin, FiDollarSign, FiBriefcase, FiClock, FiCheckCircle,
    FiBookmark, FiShare2, FiHome, FiChevronRight, FiCalendar,
    FiUsers, FiAward, FiMessageSquare, FiFileText, FiPlus, FiX
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { ChatService } from '../lib/chatService';

function JobDetailSkeleton() {
    return (
        <div style={{ background: 'var(--color-background)', minHeight: '100vh', paddingTop: 'var(--spacing-lg)' }}>
            <div className="container">
                {/* Breadcrumb skeleton */}
                <div className="job-detail-breadcrumb" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div className="skeleton" style={{ width: '80px', height: '16px' }}></div>
                    <FiChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <div className="skeleton" style={{ width: '100px', height: '16px' }}></div>
                    <FiChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <div className="skeleton" style={{ width: '150px', height: '16px' }}></div>
                </div>

                <div className="job-detail-grid">
                    {/* Main Content Skeleton */}
                    <div>
                        {/* Header Card Skeleton */}
                        <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                            <div className="skeleton-job-header">
                                <div className="skeleton job-detail-logo" style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: 'var(--radius-lg)',
                                    flexShrink: 0
                                }}></div>
                                <div className="skeleton-job-main">
                                    <div className="skeleton" style={{ width: '70%', height: '2rem', marginBottom: 'var(--spacing-md)' }}></div>
                                    <div className="skeleton skeleton-line-short" style={{ marginBottom: 'var(--spacing-lg)' }}></div>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-xl)', flexWrap: 'wrap', marginBottom: 'var(--spacing-lg)' }}>
                                        <div className="skeleton" style={{ width: '120px', height: '40px' }}></div>
                                        <div className="skeleton" style={{ width: '120px', height: '40px' }}></div>
                                        <div className="skeleton" style={{ width: '120px', height: '40px' }}></div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                                        <div className="skeleton" style={{ width: '160px', height: '48px' }}></div>
                                        <div className="skeleton" style={{ width: '120px', height: '48px' }}></div>
                                        <div className="skeleton" style={{ width: '100px', height: '48px' }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="skeleton" style={{ marginTop: 'var(--spacing-lg)', height: '50px' }}></div>
                        </div>

                        {/* Job Details Skeleton */}
                        <div className="card">
                            <div className="skeleton" style={{ width: '40%', height: '1.5rem', marginBottom: 'var(--spacing-lg)' }}></div>
                            <div className="job-detail-meta-grid" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i}>
                                        <div className="skeleton" style={{ width: '60%', height: '14px', marginBottom: '0.5rem' }}></div>
                                        <div className="skeleton" style={{ width: '40%', height: '18px' }}></div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                <div className="skeleton" style={{ width: '30%', height: '1.5rem', marginBottom: 'var(--spacing-md)' }}></div>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="skeleton skeleton-line" style={{ marginBottom: 'var(--spacing-sm)', width: `${85 - i * 10}%` }}></div>
                                ))}
                            </div>

                            <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                <div className="skeleton" style={{ width: '30%', height: '1.5rem', marginBottom: 'var(--spacing-md)' }}></div>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="skeleton skeleton-line" style={{ marginBottom: 'var(--spacing-sm)', width: `${90 - i * 15}%` }}></div>
                                ))}
                            </div>

                            <div>
                                <div className="skeleton" style={{ width: '20%', height: '1.5rem', marginBottom: 'var(--spacing-md)' }}></div>
                                <div className="job-detail-benefits-grid">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="skeleton" style={{ height: '40px' }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div>
                        <div className="card job-detail-sidebar-card" style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--spacing-lg))' }}>
                            <div className="skeleton" style={{ width: '50%', height: '1.25rem', marginBottom: 'var(--spacing-lg)' }}></div>
                            <div style={{ textAlign: 'center', paddingBottom: 'var(--spacing-lg)', borderBottom: '1px solid var(--color-divider)', marginBottom: 'var(--spacing-lg)' }}>
                                <div className="skeleton job-detail-sidebar-logo" style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: 'var(--radius-lg)',
                                    margin: '0 auto var(--spacing-md)'
                                }}></div>
                                <div className="skeleton" style={{ width: '60%', height: '1.125rem', margin: '0 auto 0.5rem' }}></div>
                                <div className="skeleton" style={{ width: '40%', height: '0.875rem', margin: '0 auto' }}></div>
                            </div>
                            <div className="skeleton" style={{ height: '40px', marginBottom: 'var(--spacing-lg)' }}></div>
                            <div className="skeleton" style={{ width: '100%', height: '44px' }}></div>
                            <div style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--color-divider)' }}>
                                <div className="skeleton" style={{ width: '50%', height: '14px', marginBottom: 'var(--spacing-sm)' }}></div>
                                <div className="skeleton" style={{ width: '30%', height: '14px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CVSelectionModal({
    userCVs,
    selectedCVId,
    onSelectCV,
    onApply,
    onClose,
    applying
}: {
    userCVs: any[];
    selectedCVId: string;
    onSelectCV: (id: string) => void;
    onApply: () => void;
    onClose: () => void;
    applying: boolean;
}) {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 'var(--z-modal)',
                padding: 'var(--spacing-lg)',
                animation: 'fade-in 0.2s ease-out'
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--glass-bg-dark)',
                    backdropFilter: 'var(--glass-blur)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--glass-shadow)',
                    maxWidth: '560px',
                    width: '100%',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    animation: 'scale-in 0.3s ease-out'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--spacing-lg) var(--spacing-lg) var(--spacing-md)',
                    borderBottom: '1px solid var(--color-divider)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <FiFileText size={22} style={{ color: 'var(--color-primary)' }} />
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Chọn CV để ứng tuyển</h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-text-secondary)',
                            padding: 'var(--spacing-xs)',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-primary-50)';
                            e.currentTarget.style.color = 'var(--color-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.color = 'var(--color-text-secondary)';
                        }}
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <div style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {userCVs.map((cv) => (
                        <div
                            key={cv.id}
                            onClick={() => onSelectCV(cv.id)}
                            style={{
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                border: selectedCVId === cv.id
                                    ? '2px solid var(--color-primary)'
                                    : '2px solid var(--color-border)',
                                background: selectedCVId === cv.id
                                    ? 'rgba(30, 136, 229, 0.05)'
                                    : 'var(--color-surface)',
                                cursor: 'pointer',
                                transition: 'all var(--transition-base)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-md)'
                            }}
                            onMouseEnter={(e) => {
                                if (selectedCVId !== cv.id) {
                                    e.currentTarget.style.borderColor = 'var(--color-primary-light)';
                                    e.currentTarget.style.background = 'var(--color-primary-50)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedCVId !== cv.id) {
                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                    e.currentTarget.style.background = 'var(--color-surface)';
                                }
                            }}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: selectedCVId === cv.id
                                    ? '2px solid var(--color-primary)'
                                    : '2px solid var(--color-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'all var(--transition-fast)'
                            }}>
                                {selectedCVId === cv.id && (
                                    <div style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: 'var(--color-primary)'
                                    }} />
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontWeight: 600,
                                    fontSize: '0.9375rem',
                                    marginBottom: '0.25rem',
                                    color: selectedCVId === cv.id ? 'var(--color-primary)' : 'var(--color-text)'
                                }}>
                                    {cv.title || 'CV không tiêu đề'}
                                </div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                                    Cập nhật: {new Date(cv.updated_at).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                            <FiFileText
                                size={20}
                                style={{
                                    color: selectedCVId === cv.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                    flexShrink: 0
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div style={{
                    padding: 'var(--spacing-md) var(--spacing-lg) var(--spacing-lg)',
                    borderTop: '1px solid var(--color-divider)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-sm)'
                }}>
                    <button
                        onClick={onApply}
                        disabled={!selectedCVId || applying}
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                    >
                        {applying ? 'Đang xử lý...' : (
                            <>
                                <FiCheckCircle size={20} />
                                Ứng tuyển với CV đã chọn
                            </>
                        )}
                    </button>
                    <Link
                        to="/cv-builder"
                        onClick={onClose}
                        style={{
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 'var(--spacing-xs)',
                            padding: 'var(--spacing-sm)',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'var(--color-primary)',
                            textDecoration: 'none',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        <FiPlus size={16} />
                        Tạo CV mới
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function JobDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [saved, setSaved] = useState(false);
    const [success, setSuccess] = useState(false);
    const [applicationInfo, setApplicationInfo] = useState<any>(null);
    const [userCVs, setUserCVs] = useState<any[]>([]);
    const [showCVModal, setShowCVModal] = useState(false);
    const [selectedCVId, setSelectedCVId] = useState<string>('');

    useEffect(() => {
        if (id) fetchJob();
        if (id && user) {
            checkApplication();
            fetchUserCVs();
        }
    }, [id, user]);

    const fetchUserCVs = async () => {
        try {
            const { data, error } = await supabase
                .from('cv_templates')
                .select('id, title, updated_at')
                .eq('user_create', user?.id)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setUserCVs(data || []);
        } catch (error) {
            console.error('Error fetching user CVs:', error);
            setUserCVs([]);
        }
    };

    const checkApplication = async () => {
        try {
            const { data: activities, error } = await supabase
                .from('user_job_activities')
                .select('*')
                .eq('user_id', user?.id)
                .eq('job_id', id);

            if (error) throw error;

            const appAct = activities?.find(a =>
                a.activity_type === 'applied' || a.activity === 'applied' || a.is_applied === true
            );

            if (appAct) {
                let cvTitle = 'CV Mặc định';
                if (appAct.cv_id && appAct.cv_id !== '00000000-0000-0000-0000-000000000000') {
                    const { data: cvData } = await supabase
                        .from('cv_templates')
                        .select('title')
                        .eq('id', appAct.cv_id)
                        .maybeSingle();
                    if (cvData) cvTitle = cvData.title;
                }

                setApplicationInfo({
                    ...appAct,
                    cvTitle
                });
                setSuccess(true);
            }

            const savedAct = activities?.find(a =>
                a.activity_type === 'saved' || a.activity === 'saved' || a.is_saved === true
            );
            if (savedAct) setSaved(true);

        } catch (error) {
            console.error('Error checking application:', error);
        }
    };

    const fetchJob = async () => {
        try {
            setLoading(true);
            const { data: jobData, error: jobError } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', id)
                .single();

            if (jobError) throw jobError;

            if (jobData) {
                const { data: employerData, error: employerError } = await supabase
                    .from('profiles')
                    .select('id, full_name, company_name, avatar_url, email, phone, metadata, role')
                    .eq('id', jobData.creator_id)
                    .single();

                if (employerError) {
                    console.warn('Error fetching employer:', employerError);
                }

                setJob({
                    ...jobData,
                    profiles: employerData
                } as any);

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

    const submitApplication = async (cvId: string) => {
        if (!user || !id) return;

        try {
            setApplying(true);
            const { error } = await supabase.rpc('apply_to_job', {
                p_job_id: id,
                p_user_id: user.id,
                p_cv_id: cvId
            });

            if (error) throw error;
            setSuccess(true);
            setShowCVModal(false);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error: any) {
            alert(error.message || 'Ứng tuyển thất bại');
        } finally {
            setApplying(false);
        }
    };

    const handleApply = async () => {
        if (!user || !id) return;

        if (userCVs.length === 0) {
            alert('Bạn chưa có CV nào. Vui lòng tạo CV trước khi ứng tuyển.');
            return;
        }

        if (userCVs.length === 1) {
            setSelectedCVId(userCVs[0].id);
            await submitApplication(userCVs[0].id);
            return;
        }

        setShowCVModal(true);
    };

    const handleCVSelectAndApply = async () => {
        if (!selectedCVId) return;
        await submitApplication(selectedCVId);
    };

    const handleSave = async () => {
        if (!user || !id) return;

        try {
            if (saved) {
                const { error } = await supabase
                    .from('user_job_activities')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('job_id', id)
                    .eq('activity_type', 'saved');

                if (error) throw error;
                setSaved(false);
            } else {
                const { error } = await supabase
                    .from('user_job_activities')
                    .insert({
                        user_id: user.id,
                        job_id: id,
                        activity_type: 'saved'
                    });

                if (error) throw error;
                setSaved(true);
            }
        } catch (error: any) {
            console.error('Error saving job:', error);
            alert(error.message || 'Có lỗi xảy ra khi lưu công việc');
        }
    };

    const handleChat = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!job?.creator_id) return;

        const otherUserRole = job.profiles?.role || 'employer';
        const conv = await ChatService.getOrCreateConversation(job.creator_id, otherUserRole, job.id);

        if (conv) {
            navigate(`/chat/${conv.id}`);
        } else {
            alert('Không thể khởi tạo cuộc trò chuyện. Vui lòng thử lại sau.');
        }
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
        if (!salary || salary.is_negotiable) return 'Thỏa thuận';
        if (typeof salary === 'string') return salary;

        const formatNumber = (num: number) => {
            if (num >= 100000) return (num / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
            return num.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
        };

        if (salary.min && salary.max) {
            return `${formatNumber(salary.min)} - ${formatNumber(salary.max)} triệu`;
        }
        if (salary.min) return `Từ ${formatNumber(salary.min)} triệu`;
        if (salary.max) return `Đến ${formatNumber(salary.max)} triệu`;
        return 'Thỏa thuận';
    };

    if (loading) {
        return <JobDetailSkeleton />;
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
                <div className="job-detail-breadcrumb" style={{ marginBottom: 'var(--spacing-lg)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <FiHome size={16} />
                        Trang chủ
                    </Link>
                    <FiChevronRight size={14} />
                    <Link to="/jobs">Tìm việc làm</Link>
                    <FiChevronRight size={14} />
                    <span style={{ color: 'var(--color-text)' }}>{job.metadata.title}</span>
                </div>

                <div className="job-detail-grid">
                    {/* Main Content */}
                    <div>
                        {/* Header Card */}
                        <div className="card animate-fade-in" style={{ marginBottom: 'var(--spacing-xl)' }}>
                            <div className="job-detail-header-content">
                                {/* Company Logo */}
                                <div className="job-detail-logo" style={{
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
                                    <div className="job-detail-quick-info" style={{ marginBottom: 'var(--spacing-lg)' }}>
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
                                    <div className="job-detail-actions">
                                        {user?.id === job.creator_id ? (
                                            <Link
                                                to={job.profiles?.role === 'school' ? `/school/jobs/${job.id}/applicants` : `/employer/jobs/${job.id}/applicants`}
                                                className="btn btn-primary btn-lg"
                                                style={{ minWidth: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                            >
                                                <FiUsers size={20} />
                                                Quản lý ứng viên ({job.applicants?.length || 0})
                                            </Link>
                                        ) : !applicationInfo ? (
                                            <>
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
                                                    onClick={handleChat}
                                                    className="btn btn-outline-primary"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                                >
                                                    <FiMessageSquare size={18} />
                                                    Nhắn tin
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
                                            </>
                                        ) : (
                                            <>
                                                <div style={{
                                                    padding: 'var(--spacing-md) var(--spacing-lg)',
                                                    background: 'var(--color-success-light)',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: '1px solid var(--color-success)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--spacing-md)',
                                                    flex: 1,
                                                    minWidth: 0
                                                }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        background: 'var(--color-success)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        flexShrink: 0
                                                    }}>
                                                        <FiCheckCircle size={24} />
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontWeight: 700, color: 'var(--color-success-dark)', fontSize: '1.1rem' }}>
                                                            Bạn đã ứng tuyển công việc này
                                                        </div>
                                                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                                            <FiBriefcase size={14} />
                                                            CV đã nộp: <strong style={{ color: 'var(--color-primary)' }}>{applicationInfo.cvTitle}</strong>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleChat}
                                                    className="btn btn-outline-primary"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                                >
                                                    <FiMessageSquare size={18} />
                                                    Nhắn tin
                                                </button>
                                            </>
                                        )}


                                        <button
                                            onClick={handleShare}
                                            className="btn btn-secondary"
                                            style={{ height: (applicationInfo || user?.id === job.creator_id) ? 'auto' : 'unset' }}
                                        >
                                            <FiShare2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Deadline or Application Status Warning */}
                            <div className="job-detail-status-bar" style={{
                                marginTop: 'var(--spacing-lg)',
                                padding: 'var(--spacing-md)',
                                background: applicationInfo ? 'rgba(30, 136, 229, 0.05)' : 'rgba(255, 193, 7, 0.1)',
                                borderLeft: `4px solid ${applicationInfo ? 'var(--color-primary)' : 'var(--color-warning)'}`,
                                borderRadius: 'var(--radius-sm)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    {applicationInfo ? <FiClock size={18} style={{ color: 'var(--color-primary)' }} /> : <FiCalendar size={18} style={{ color: 'var(--color-warning)' }} />}
                                    <span style={{ fontSize: '0.9375rem', fontWeight: applicationInfo ? 600 : 400 }}>
                                        {applicationInfo
                                            ? `Trạng thái: ${applicationInfo.status === 'accepted' ? 'Đã duyệt' : applicationInfo.status === 'rejected' ? 'Từ chối' : 'Đang chờ duyệt'}`
                                            : `Hạn nộp hồ sơ: ${new Date(job.deadline).toLocaleDateString('vi-VN')}`
                                        }
                                    </span>
                                </div>
                                {applicationInfo && (
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                        Ngày nộp: {new Date(applicationInfo.created_at).toLocaleDateString('vi-VN')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Job Details */}
                        <div className="card">
                            {/* Chi tiết tin tuyển dụng */}
                            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Chi tiết tin tuyển dụng</h3>

                            <div className="job-detail-meta-grid" style={{ marginBottom: 'var(--spacing-2xl)' }}>
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
                                <div className="job-detail-benefits-grid">
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
                        <div className="card job-detail-sidebar-card animate-slide-in" style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--spacing-lg))' }}>
                            <h4 style={{ marginBottom: 'var(--spacing-lg)' }}>Thông tin công ty</h4>

                            <div style={{
                                textAlign: 'center',
                                paddingBottom: 'var(--spacing-lg)',
                                borderBottom: '1px solid var(--color-divider)',
                                marginBottom: 'var(--spacing-lg)'
                            }}>
                                <div className="job-detail-sidebar-logo" style={{
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
                                to={`/company/${job.creator_id}`}
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

            {showCVModal && (
                <CVSelectionModal
                    userCVs={userCVs}
                    selectedCVId={selectedCVId}
                    onSelectCV={setSelectedCVId}
                    onApply={handleCVSelectAndApply}
                    onClose={() => setShowCVModal(false)}
                    applying={applying}
                />
            )}
        </div>
    );
}
