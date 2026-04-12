import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiDollarSign, FiUser, FiClock, FiPlusCircle, FiCalendar, FiLink } from 'react-icons/fi';
import { supabase } from '../lib/supabase';

// Types
interface JobMetadata {
    title: string;
    working_regions: string[];
    experience_required: string;
    fields: string[];
    requirements_tags: string[];
    salary: {
        min?: number;
        max?: number;
        currency: string;
        is_negotiable: boolean;
        type: 'monthly' | 'hourly' | 'yearly';
    };
    employment_types: string[];
    work_locations: string[];
    job_description: string[];
    candidate_requirements: string[];
    benefits: string[];
}

interface Job {
    id: string;
    creator_id: string;
    deadline: string;
    metadata: JobMetadata;
    is_active: boolean;
    status: string;
    created_at: string;
    view_count?: number;
    applicants?: any[];
}

interface Applicant {
    user_id: string;
    cv_id: string;
    applied_at: string;
}

interface ApplicantWithDetails extends Applicant {
    candidateName?: string;
    candidateEmail?: string;
    candidateAvatar?: string;
    jobTitle?: string;
}

// Skeleton Components
function StatsCardSkeleton() {
    return (
        <div className="card card-glass" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-2xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-md)' }} />
            <div className="skeleton" style={{ width: '60px', height: '2rem', marginBottom: 'var(--spacing-sm)' }} />
            <div className="skeleton" style={{ width: '100px', height: '1rem' }} />
        </div>
    );
}

function JobCardSkeleton() {
    return (
        <div className="card" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-xl)' }}>
            <div className="skeleton" style={{ width: '70%', height: '1.5rem', marginBottom: 'var(--spacing-md)' }} />
            <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
                <div className="skeleton" style={{ width: '80px', height: '1rem' }} />
                <div className="skeleton" style={{ width: '100px', height: '1rem' }} />
                <div className="skeleton" style={{ width: '90px', height: '1rem' }} />
            </div>
        </div>
    );
}

function ApplicantSkeleton() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}>
            <div className="skeleton skeleton-avatar" />
            <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '60%', height: '1rem', marginBottom: 'var(--spacing-xs)' }} />
                <div className="skeleton" style={{ width: '40%', height: '0.85rem' }} />
            </div>
        </div>
    );
}

function QuickActionsSkeleton() {
    return (
        <div className="card" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-2xl)' }}>
            <div className="skeleton" style={{ width: '50%', height: '1.25rem', marginBottom: 'var(--spacing-lg)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="skeleton" style={{ width: '100%', height: '3rem', borderRadius: 'var(--radius-md)' }} />
                ))}
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="container section">
            <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="skeleton" style={{ width: '300px', height: '2.5rem', marginBottom: 'var(--spacing-sm)' }} />
                <div className="skeleton" style={{ width: '400px', height: '1.2rem' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--spacing-2xl)', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)' }}>
                    <div className="grid grid-cols-4" style={{ gap: 'var(--spacing-md)' }}>
                        {[1, 2, 3, 4].map(i => <StatsCardSkeleton key={i} />)}
                    </div>
                    <div>
                        <div className="skeleton" style={{ width: '200px', height: '1.75rem', marginBottom: 'var(--spacing-lg)' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {[1, 2, 3].map(i => <JobCardSkeleton key={i} />)}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <QuickActionsSkeleton />
                    <div className="card" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-2xl)' }}>
                        <div className="skeleton" style={{ width: '50%', height: '1.25rem', marginBottom: 'var(--spacing-lg)' }} />
                        {[1, 2, 3].map(i => <ApplicantSkeleton key={i} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { profile, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalJobs: 0,
        newApplicants: 0,
        totalApplicants: 0,
        pendingDecisions: 0
    });
    const [recentJobs, setRecentJobs] = useState<Job[]>([]);
    const [recentApplicants, setRecentApplicants] = useState<ApplicantWithDetails[]>([]);

    if (profile?.role !== 'employer') {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        if (!user) return;

        try {
            setLoading(true);

            const { data: allJobs, error: jobsError } = await supabase
                .from('jobs')
                .select('*')
                .eq('creator_id', user.id)
                .order('created_at', { ascending: false });

            const { data: partnershipJobs } = await supabase
                .from('school_partnership_jobs')
                .select('*')
                .eq('employer_id', user.id)
                .eq('company_status', 'accepted');

            if (jobsError) throw jobsError;

            const jobs = allJobs || [];
            const pJobs = partnershipJobs || [];

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            let newApplicantsCount = 0;
            let pendingDecisionsCount = 0;
            let totalApplicantsCount = 0;
            const allApplicants: ApplicantWithDetails[] = [];

            jobs.forEach(job => {
                const jobApplicants = Array.isArray(job.applicants) ? job.applicants : [];
                totalApplicantsCount += jobApplicants.length;
                jobApplicants.forEach((applicant: any) => {
                    const appliedDate = new Date(applicant.applied_at);
                    if (appliedDate >= sevenDaysAgo) newApplicantsCount++;
                    const status = (applicant.status || 'pending').toLowerCase();
                    if (status === 'pending' || status === 'accepted') pendingDecisionsCount++;

                    allApplicants.push({
                        ...applicant,
                        jobTitle: job.metadata?.title || 'Công việc không tên'
                    });
                });
            });

            pJobs.forEach(job => {
                const jobApplicants = Array.isArray(job.applicants) ? job.applicants : [];
                totalApplicantsCount += jobApplicants.length;
                jobApplicants.forEach((applicant: any) => {
                    const appliedDate = new Date(applicant.applied_at);
                    if (appliedDate >= sevenDaysAgo) newApplicantsCount++;
                    const status = (applicant.status || 'pending').toLowerCase();
                    if (status === 'pending' || status === 'accepted') pendingDecisionsCount++;

                    allApplicants.push({
                        ...applicant,
                        jobTitle: job.metadata?.title || 'Công việc liên kết'
                    });
                });
            });

            allApplicants.sort((a, b) =>
                new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
            );
            const recentApplicantsList = allApplicants.slice(0, 5);

            if (recentApplicantsList.length > 0) {
                const userIds = recentApplicantsList.map(a => a.user_id);
                const { data: usersData, error: usersError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, avatar_url')
                    .in('id', userIds);

                if (!usersError && usersData) {
                    recentApplicantsList.forEach(applicant => {
                        const userData = usersData.find(u => u.id === applicant.user_id);
                        if (userData) {
                            applicant.candidateName = userData.full_name;
                            applicant.candidateEmail = userData.email;
                            applicant.candidateAvatar = userData.avatar_url;
                        }
                    });
                }
            }

            setStats({
                totalJobs: jobs.length + pJobs.length,
                newApplicants: newApplicantsCount,
                totalApplicants: totalApplicantsCount,
                pendingDecisions: pendingDecisionsCount
            });
            setRecentJobs(jobs.slice(0, 3));
            setRecentApplicants(recentApplicantsList);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatSalary = (salary: JobMetadata['salary']) => {
        if (salary.is_negotiable) {
            return 'Thỏa thuận';
        }
        if (salary.min && salary.max) {
            return `${(salary.min / 1000000).toFixed(1)} - ${(salary.max / 1000000).toFixed(1)} triệu`;
        }
        return 'Thỏa thuận';
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Hôm nay';
        if (diffInDays === 1) return 'Hôm qua';
        if (diffInDays < 7) return `${diffInDays} ngày trước`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
        return `${Math.floor(diffInDays / 30)} tháng trước`;
    };

    const getDeadlineStatus = (deadline: string) => {
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const diffInMs = deadlineDate.getTime() - now.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays < 0) return { text: 'Hết hạn', color: '#C5221F' };
        if (diffInDays === 0) return { text: 'Hết hạn hôm nay', color: '#B76E00' };
        if (diffInDays < 7) return { text: `Còn ${diffInDays} ngày`, color: '#B76E00' };
        return { text: `Còn ${diffInDays} ngày`, color: 'var(--color-text-secondary)' };
    };

    const handleJobClick = (jobId: string) => {
        navigate(`/jobs/${jobId}`);
    };

    const handleApplicantClick = (applicant: ApplicantWithDetails) => {
        navigate(`/employer/cv/${applicant.cv_id}?applicant=${applicant.user_id}`);
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    const statCards = [
        {
            icon: <FiBriefcase size={28} />,
            value: stats.totalJobs,
            label: 'Tin tuyển dụng',
            iconBg: 'rgba(30, 136, 229, 0.1)',
            iconColor: 'var(--color-primary)',
            animationClass: 'animate-fade-in-up animate-delay-100'
        },
        {
            icon: <FiUser size={28} />,
            value: stats.newApplicants,
            label: 'Ứng viên mới',
            iconBg: 'rgba(30, 178, 93, 0.1)',
            iconColor: '#1E7E34',
            animationClass: 'animate-fade-in-up animate-delay-200'
        },
        {
            icon: <FiClock size={28} />,
            value: stats.pendingDecisions,
            label: 'Đang chờ xử lý',
            iconBg: '#FFF8E1',
            iconColor: '#FFAB00',
            clickable: true,
            hasAlert: stats.pendingDecisions > 0,
            animationClass: 'animate-fade-in-up animate-delay-300'
        },
        {
            icon: <FiUsers size={28} />,
            value: stats.totalApplicants,
            label: 'Tổng hồ sơ',
            iconBg: 'rgba(2, 136, 209, 0.1)',
            iconColor: '#0288D1',
            animationClass: 'animate-fade-in-up animate-delay-400'
        }
    ];

    return (
        <div className="dashboard-page container section">
            {/* Welcome Header */}
            <div className="dashboard-header" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <h1 className="dashboard-greeting" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 'var(--spacing-sm)' }}>
                    Chào buổi sáng, {profile?.full_name?.split(' ').pop()}!
                </h1>
                <p className="dashboard-subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', margin: 0 }}>
                    Hôm nay là một ngày tuyệt vời để tìm kiếm những tài năng mới.
                </p>
            </div>

            <div className="dashboard-layout">
                {/* Main Content */}
                <div className="dashboard-main">

                    {/* Stats Grid */}
                    <div className="dashboard-stats-grid grid grid-cols-4" style={{ gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-2xl)' }}>
                        {statCards.map((card, index) => (
                            <div
                                key={index}
                                className={`card card-glass stat-card ${card.animationClass}`}
                                onClick={card.clickable ? () => navigate('/employer/recruitment-decisions') : undefined}
                                style={{
                                    padding: 'var(--spacing-lg)',
                                    borderRadius: 'var(--radius-2xl)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    cursor: card.clickable ? 'pointer' : 'default',
                                    border: card.hasAlert ? '1.5px solid #FFAB00' : undefined,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div className="stat-card-icon" style={{
                                    width: 'clamp(48px, 8vw, 56px)',
                                    height: 'clamp(48px, 8vw, 56px)',
                                    background: card.iconBg,
                                    borderRadius: 'var(--radius-lg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: card.iconColor,
                                    marginBottom: 'var(--spacing-md)',
                                    flexShrink: 0
                                }}>
                                    {card.icon}
                                </div>
                                <div className="stat-card-value" style={{
                                    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                                    fontWeight: 900,
                                    color: 'var(--color-text)',
                                    lineHeight: 1,
                                    marginBottom: 'var(--spacing-xs)'
                                }}>
                                    {card.value}
                                </div>
                                <p className="stat-card-label" style={{
                                    color: 'var(--color-text-secondary)',
                                    fontWeight: 600,
                                    margin: 0,
                                    fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)'
                                }}>
                                    {card.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Recent Jobs Section */}
                    <div className="dashboard-recent-jobs" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                            <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 800, margin: 0 }}>
                                Tin tuyển dụng gần đây
                            </h2>
                            <button
                                onClick={() => navigate('/employer/jobs')}
                                className="btn btn-outline"
                                style={{ borderRadius: 'var(--radius-md)', padding: 'var(--spacing-sm) var(--spacing-lg)', fontWeight: 700, minHeight: '44px' }}
                            >
                                Quản lý tất cả
                            </button>
                        </div>

                        {recentJobs.length === 0 ? (
                            <div className="card" style={{ padding: 'var(--spacing-3xl) var(--spacing-xl)', textAlign: 'center', borderRadius: 'var(--radius-2xl)' }}>
                                <FiBriefcase size={48} style={{ color: 'var(--color-border)', marginBottom: 'var(--spacing-lg)' }} />
                                <h3 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)', fontWeight: 700 }}>Bắt đầu tuyển dụng ngay</h3>
                                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xl)' }}>Bạn chưa có tin tuyển dụng nào được đăng tải.</p>
                                <button
                                    onClick={() => navigate('/employer/jobs/create')}
                                    className="btn btn-primary"
                                    style={{ padding: 'var(--spacing-md) var(--spacing-xl)', borderRadius: 'var(--radius-md)', fontSize: 'clamp(1rem, 2vw, 1.1rem)', minHeight: '48px' }}
                                >
                                    Đăng tin ngay
                                </button>
                            </div>
                        ) : (
                            <div className="recent-jobs-scroll-wrapper">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                    {recentJobs.map((job, index) => {
                                        const deadlineStatus = getDeadlineStatus(job.deadline);
                                        return (
                                            <div
                                                key={job.id}
                                                className="card recent-job-card animate-fade-in-up"
                                                onClick={() => handleJobClick(job.id)}
                                                style={{
                                                    padding: 'var(--spacing-lg)',
                                                    borderRadius: 'var(--radius-xl)',
                                                    cursor: 'pointer',
                                                    border: '1px solid var(--color-divider)',
                                                    animationDelay: `${index * 100}ms`,
                                                    animationFillMode: 'both',
                                                    minWidth: 'min(100%, 600px)'
                                                }}
                                            >
                                                <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                                                            <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 2vw, 1.25rem)', fontWeight: 800, lineHeight: 1.3 }}>
                                                                {job.metadata.title}
                                                            </h3>
                                                            {job.status === 'approved' && job.is_active && (
                                                                <span className="badge" style={{ background: '#E6F4EA', color: '#1E7E34', border: 'none', fontWeight: 700, flexShrink: 0 }}>
                                                                    Đang tuyển
                                                                </span>
                                                            )}
                                                            {job.status === 'pending' && (
                                                                <span className="badge" style={{ background: '#FFF4E5', color: '#B76E00', border: 'none', fontWeight: 700, flexShrink: 0 }}>
                                                                    Chờ duyệt
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center" style={{ fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)', color: 'var(--color-text-secondary)', flexWrap: 'wrap', gap: 'var(--spacing-md)', rowGap: 'var(--spacing-sm)' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', whiteSpace: 'nowrap' }}>
                                                                <FiUsers size={16} />
                                                                <strong>{job.applicants?.length || 0}</strong> ứng viên
                                                            </span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', whiteSpace: 'nowrap' }}>
                                                                <FiDollarSign size={16} />
                                                                {formatSalary(job.metadata.salary)}
                                                            </span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', whiteSpace: 'nowrap' }}>
                                                                <FiClock size={16} />
                                                                Đăng {getTimeAgo(job.created_at)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                        <div style={{
                                                            fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                                                            fontWeight: 700,
                                                            color: deadlineStatus.color,
                                                            background: `${deadlineStatus.color}10`,
                                                            padding: 'var(--spacing-xs) var(--spacing-md)',
                                                            borderRadius: 'var(--radius-full)',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {deadlineStatus.text}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="dashboard-sidebar">
                    {/* Quick Access */}
                    <div className="card" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-2xl)', marginBottom: 'var(--spacing-lg)' }}>
                        <h3 style={{ fontSize: 'clamp(1.125rem, 2vw, 1.25rem)', fontWeight: 800, marginBottom: 'var(--spacing-lg)' }}>
                            Tiện ích nhanh
                        </h3>
                        <div className="quick-actions-grid">
                            <button
                                onClick={() => navigate('/employer/jobs/create')}
                                className="btn btn-primary quick-action-btn"
                                style={{ borderRadius: 'var(--radius-md)', gap: 'var(--spacing-sm)', fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', fontWeight: 700, minHeight: '48px' }}
                            >
                                <FiPlusCircle size={20} />
                                <span>Đăng tin tuyển dụng</span>
                            </button>
                            <button
                                onClick={() => navigate('/employer/interviews')}
                                className="btn btn-outline quick-action-btn"
                                style={{ borderRadius: 'var(--radius-md)', gap: 'var(--spacing-sm)', fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', fontWeight: 700, border: '1px solid var(--color-divider)', minHeight: '48px' }}
                            >
                                <FiCalendar size={20} />
                                <span>Lịch phỏng vấn</span>
                            </button>
                            <button
                                onClick={() => navigate('/employer/candidates')}
                                className="btn btn-outline quick-action-btn"
                                style={{ borderRadius: 'var(--radius-md)', gap: 'var(--spacing-sm)', fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', fontWeight: 700, border: '1px solid var(--color-divider)', minHeight: '48px' }}
                            >
                                <FiUsers size={20} />
                                <span>Quản lý ứng viên</span>
                            </button>
                            <button
                                onClick={() => navigate('/employer/partnerships')}
                                className="btn btn-outline quick-action-btn"
                                style={{ borderRadius: 'var(--radius-md)', gap: 'var(--spacing-sm)', fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', fontWeight: 700, border: '1px solid var(--color-divider)', minHeight: '48px' }}
                            >
                                <FiLink size={20} />
                                <span>Liên kết đối tác</span>
                            </button>
                        </div>
                    </div>

                    {/* Recent Applicants */}
                    <div className="card" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-2xl)' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                            <h3 style={{ fontSize: 'clamp(1.125rem, 2vw, 1.25rem)', fontWeight: 800, margin: 0 }}>
                                Ứng viên mới
                            </h3>
                            <button
                                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 700, fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)', cursor: 'pointer', minHeight: '44px', display: 'flex', alignItems: 'center' }}
                            >
                                Xem hết
                            </button>
                        </div>

                        {recentApplicants.length === 0 ? (
                            <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--spacing-md) 0' }}>
                                Chưa có ứng viên mới
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                {recentApplicants.map((applicant, index) => (
                                    <div
                                        key={`${applicant.user_id}-${index}`}
                                        onClick={() => handleApplicantClick(applicant)}
                                        className="applicant-item"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--spacing-md)',
                                            cursor: 'pointer',
                                            padding: 'var(--spacing-sm)',
                                            borderRadius: 'var(--radius-md)',
                                            transition: 'all var(--transition-fast)',
                                            minHeight: '48px'
                                        }}
                                    >
                                        <div style={{
                                            width: 'clamp(40px, 8vw, 48px)',
                                            height: 'clamp(40px, 8vw, 48px)',
                                            borderRadius: 'var(--radius-md)',
                                            background: 'var(--color-primary)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 800,
                                            fontSize: 'clamp(0.9rem, 2vw, 1.15rem)',
                                            overflow: 'hidden',
                                            flexShrink: 0
                                        }}>
                                            {applicant.candidateAvatar ? (
                                                <img src={applicant.candidateAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                applicant.candidateName?.charAt(0) || 'U'
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {applicant.candidateName || 'Ứng viên'}
                                            </div>
                                            <div style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {applicant.jobTitle}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.75rem)', color: 'var(--color-text-light)', fontWeight: 600, flexShrink: 0 }}>
                                            {getTimeAgo(applicant.applied_at).replace(' ngày trước', 'd')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .dashboard-layout {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: var(--spacing-2xl);
                    align-items: start;
                }

                .dashboard-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--spacing-md);
                }

                .stat-card {
                    transition: all var(--transition-base);
                    will-change: transform;
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                }

                .stat-card:active {
                    transform: translateY(-2px);
                }

                .recent-jobs-scroll-wrapper {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: thin;
                    padding-bottom: var(--spacing-sm);
                }

                .recent-jobs-scroll-wrapper::-webkit-scrollbar {
                    height: 4px;
                }

                .recent-jobs-scroll-wrapper::-webkit-scrollbar-track {
                    background: var(--color-border-light);
                    border-radius: var(--radius-full);
                }

                .recent-jobs-scroll-wrapper::-webkit-scrollbar-thumb {
                    background: var(--color-text-muted);
                    border-radius: var(--radius-full);
                }

                .recent-job-card {
                    transition: all var(--transition-base);
                }

                .recent-job-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                    border-color: var(--color-primary);
                }

                .recent-job-card:active {
                    transform: translateY(-2px);
                }

                .quick-actions-grid {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-sm);
                }

                .quick-action-btn {
                    justify-content: flex-start;
                    padding: var(--spacing-md) var(--spacing-lg);
                    width: 100%;
                    transition: all var(--transition-base);
                    -webkit-tap-highlight-color: transparent;
                }

                .quick-action-btn:active {
                    transform: scale(0.98);
                }

                .applicant-item {
                    transition: all var(--transition-fast);
                    -webkit-tap-highlight-color: transparent;
                }

                .applicant-item:hover {
                    background: var(--color-hover);
                }

                .applicant-item:active {
                    background: var(--color-primary-50);
                }

                /* Tablet: 768px - 1023px */
                @media (max-width: 1023px) {
                    .dashboard-layout {
                        grid-template-columns: 1fr;
                    }

                    .dashboard-sidebar {
                        position: static !important;
                    }

                    .dashboard-stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .quick-actions-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                /* Mobile: 767px and below */
                @media (max-width: 767px) {
                    .dashboard-layout {
                        gap: var(--spacing-xl);
                    }

                    .dashboard-stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: var(--spacing-sm);
                    }

                    .stat-card {
                        padding: var(--spacing-md) !important;
                        border-radius: var(--radius-lg) !important;
                    }

                    .stat-card-icon {
                        width: 44px !important;
                        height: 44px !important;
                        margin-bottom: var(--spacing-sm) !important;
                        border-radius: var(--radius-md) !important;
                    }

                    .recent-job-card {
                        padding: var(--spacing-md) !important;
                        border-radius: var(--radius-md) !important;
                    }

                    .quick-actions-grid {
                        grid-template-columns: 1fr;
                    }

                    .quick-action-btn {
                        min-height: 48px !important;
                    }
                }

                /* Small mobile: 479px and below */
                @media (max-width: 479px) {
                    .dashboard-stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .dashboard-greeting {
                        font-size: 1.5rem !important;
                    }

                    .dashboard-subtitle {
                        font-size: 0.9rem !important;
                    }
                }

                /* Ensure proper touch targets */
                @media (hover: none) and (pointer: coarse) {
                    .stat-card {
                        min-height: 48px;
                    }

                    .recent-job-card {
                        min-height: 48px;
                    }

                    .quick-action-btn {
                        min-height: 48px !important;
                    }

                    .applicant-item {
                        min-height: 48px;
                    }
                }

                /* Glassmorphism enhancement for stat cards */
                .stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
                }

                .stat-card::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -50%;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle, rgba(30, 136, 229, 0.03) 0%, transparent 70%);
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
}
