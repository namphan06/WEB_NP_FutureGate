import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiDollarSign, FiUser, FiClock, FiPlusCircle, FiCalendar } from 'react-icons/fi';
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

export default function DashboardPage() {
    const { profile, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalJobs: 0,
        newApplicants: 0,
        totalApplicants: 0
    });
    const [recentJobs, setRecentJobs] = useState<Job[]>([]);
    const [recentApplicants, setRecentApplicants] = useState<ApplicantWithDetails[]>([]);

    // Only employers can access this page
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

            // Fetch all jobs by employer
            const { data: allJobs, error: jobsError } = await supabase
                .from('jobs')
                .select('*')
                .eq('creator_id', user.id)
                .order('created_at', { ascending: false });

            if (jobsError) throw jobsError;

            const jobs = allJobs || [];

            // Calculate stats
            const totalJobs = jobs.length;
            const totalApplicants = jobs.reduce((sum, job) => sum + (job.applicants?.length || 0), 0);

            // Get applicants from last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            let newApplicantsCount = 0;
            const allApplicants: ApplicantWithDetails[] = [];

            // Process applicants from all jobs
            for (const job of jobs) {
                if (job.applicants && job.applicants.length > 0) {
                    for (const applicant of job.applicants) {
                        const appliedDate = new Date(applicant.applied_at);
                        if (appliedDate >= sevenDaysAgo) {
                            newApplicantsCount++;
                        }

                        allApplicants.push({
                            ...applicant,
                            jobTitle: job.metadata.title
                        });
                    }
                }
            }

            // Sort applicants by applied_at and get recent 5
            allApplicants.sort((a, b) =>
                new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
            );
            const recentApplicantsList = allApplicants.slice(0, 5);

            // Fetch user details for recent applicants
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
                totalJobs,
                newApplicants: newApplicantsCount,
                totalApplicants
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
        // Navigate to CV detail page
        navigate(`/employer/cv/${applicant.cv_id}?applicant=${applicant.user_id}`);
    };

    if (loading) {
        return (
            <div className="container section">
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="loading">Đang tải dữ liệu dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container section">
            {/* Minimal Welcome Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Chào buổi sáng, {profile?.full_name?.split(' ').pop()}!</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem', margin: 0 }}>
                    Hôm nay là một ngày tuyệt vời để tìm kiếm những tài năng mới.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3" style={{ gap: '1.5rem' }}>
                        <div className="card" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', background: 'rgba(30, 136, 229, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: '1.25rem' }}>
                                <FiBriefcase size={32} />
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1, marginBottom: '0.5rem' }}>{stats.totalJobs}</div>
                            <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600, margin: 0 }}>Tin tuyển dụng</p>
                        </div>

                        <div className="card" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', background: 'rgba(30, 178, 93, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E7E34', marginBottom: '1.25rem' }}>
                                <FiUser size={32} />
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1, marginBottom: '0.5rem' }}>{stats.newApplicants}</div>
                            <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600, margin: 0 }}>Ứng viên mới (7 ngày)</p>
                        </div>

                        <div className="card" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', background: 'rgba(2, 136, 209, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0288D1', marginBottom: '1.25rem' }}>
                                <FiUsers size={32} />
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1, marginBottom: '0.5rem' }}>{stats.totalApplicants}</div>
                            <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600, margin: 0 }}>Tổng hồ sơ</p>
                        </div>
                    </div>

                    {/* Recent Jobs Section */}
                    <div>
                        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Tin tuyển dụng gần đây</h2>
                            <button
                                onClick={() => navigate('/employer/jobs')}
                                className="btn btn-outline"
                                style={{ borderRadius: '12px', padding: '0.5rem 1.25rem', fontWeight: 700 }}
                            >
                                Quản lý tất cả
                            </button>
                        </div>

                        {recentJobs.length === 0 ? (
                            <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px' }}>
                                <FiBriefcase size={48} style={{ color: 'var(--color-border)', marginBottom: '1.5rem' }} />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Bắt đầu tuyển dụng ngay</h3>
                                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Bạn chưa có tin tuyển dụng nào được đăng tải.</p>
                                <button onClick={() => navigate('/employer/jobs/create')} className="btn btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '12px', fontSize: '1.1rem' }}>
                                    Đăng tin ngay
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {recentJobs.map((job) => {
                                    const deadlineStatus = getDeadlineStatus(job.deadline);
                                    return (
                                        <div
                                            key={job.id}
                                            className="card"
                                            onClick={() => handleJobClick(job.id)}
                                            style={{
                                                padding: '1.5rem',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                border: '1px solid var(--color-divider)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.borderColor = 'var(--color-divider)';
                                            }}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{job.metadata.title}</h3>
                                                        {job.status === 'approved' && job.is_active && (
                                                            <span className="badge" style={{ background: '#E6F4EA', color: '#1E7E34', border: 'none', fontWeight: 700 }}>Đang tuyển</span>
                                                        )}
                                                        {job.status === 'pending' && (
                                                            <span className="badge" style={{ background: '#FFF4E5', color: '#B76E00', border: 'none', fontWeight: 700 }}>Chờ duyệt</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-xl" style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <FiUsers size={16} />
                                                            <strong>{job.applicants?.length || 0}</strong> ứng viên
                                                        </span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <FiDollarSign size={16} />
                                                            {formatSalary(job.metadata.salary)}
                                                        </span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <FiClock size={16} />
                                                            Đăng {getTimeAgo(job.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: deadlineStatus.color, background: `${deadlineStatus.color}10`, padding: '4px 12px', borderRadius: '20px' }}>
                                                        {deadlineStatus.text}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '100px' }}>
                    {/* Quick Access */}
                    <div className="card" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Tiện ích nhanh</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button
                                onClick={() => navigate('/employer/jobs/create')}
                                className="btn btn-primary"
                                style={{ justifyContent: 'flex-start', padding: '0.875rem 1.25rem', borderRadius: '14px', gap: '0.75rem', fontSize: '1rem', fontWeight: 700 }}
                            >
                                <FiPlusCircle size={20} />
                                Đăng tin tuyển dụng
                            </button>
                            <button
                                onClick={() => navigate('/employer/interviews')}
                                className="btn btn-outline"
                                style={{ justifyContent: 'flex-start', padding: '0.875rem 1.25rem', borderRadius: '14px', gap: '0.75rem', fontSize: '1rem', fontWeight: 700, border: '1px solid var(--color-divider)' }}
                            >
                                <FiCalendar size={20} />
                                Lịch phỏng vấn
                            </button>
                            <button
                                onClick={() => navigate('/employer/candidates')}
                                className="btn btn-outline"
                                style={{ justifyContent: 'flex-start', padding: '0.875rem 1.25rem', borderRadius: '14px', gap: '0.75rem', fontSize: '1rem', fontWeight: 700, border: '1px solid var(--color-divider)' }}
                            >
                                <FiUsers size={20} />
                                Quản lý ứng viên
                            </button>
                        </div>
                    </div>

                    {/* Recent Applicants */}
                    <div className="card" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Ứng viên mới</h3>
                            <button style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>Xem hết</button>
                        </div>

                        {recentApplicants.length === 0 ? (
                            <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '1rem 0' }}>Chưa có ứng viên mới</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {recentApplicants.map((applicant, index) => (
                                    <div
                                        key={`${applicant.user_id}-${index}`}
                                        onClick={() => handleApplicantClick(applicant)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            cursor: 'pointer',
                                            padding: '0.5rem',
                                            borderRadius: '12px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '14px',
                                            background: 'var(--color-primary)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 800,
                                            fontSize: '1.15rem',
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
                                            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {applicant.candidateName || 'Ứng viên'}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {applicant.jobTitle}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 600 }}>
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
                .btn-icon {
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    background: var(--color-background);
                    border: 1px solid var(--color-divider);
                    color: var(--color-text-secondary);
                    transition: all 0.2s;
                }
                .btn-icon:hover {
                    border-color: var(--color-primary);
                    color: var(--color-primary);
                    background: var(--color-primary-light);
                }
            `}</style>
        </div>
    );
}
