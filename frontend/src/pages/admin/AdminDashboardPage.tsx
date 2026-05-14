import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link, Navigate } from 'react-router-dom';
import {
    FiUsers, FiCheckCircle, FiClock, FiBriefcase,
    FiUserCheck, FiActivity, FiArrowRight, FiXCircle
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function AdminDashboardPage() {
    const { profile } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCandidates: 0,
        totalEmployers: 0,
        totalSchools: 0,
        totalJobs: 0,
        activeJobs: 0,
        pendingJobs: 0,
        rejectedJobs: 0,
        totalApplications: 0
    });
    const [pendingJobs, setPendingJobs] = useState<any[]>([]);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    if (profile?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [
                { count: userCount },
                { count: candidateCount },
                { count: employerCount },
                { count: schoolCount },
                { count: totalJobsCount },
                { count: activeJobsCount },
                { count: pendingCount },
                { count: rejectedCount },
                { count: pendingPartnershipCount },
                { count: rejectedPartnershipCount }
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'candidate'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employer'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'school'),
                supabase.from('jobs').select('*', { count: 'exact', head: true }),
                supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'approved').eq('is_active', true),
                supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
                supabase.from('school_partnership_jobs').select('*', { count: 'exact', head: true }).eq('admin_status', 'pending'),
                supabase.from('school_partnership_jobs').select('*', { count: 'exact', head: true }).eq('admin_status', 'rejected')
            ]);

            setStats({
                totalUsers: userCount || 0,
                totalCandidates: candidateCount || 0,
                totalEmployers: employerCount || 0,
                totalSchools: schoolCount || 0,
                totalJobs: totalJobsCount || 0,
                activeJobs: activeJobsCount || 0,
                pendingJobs: (pendingCount || 0) + (pendingPartnershipCount || 0),
                rejectedJobs: (rejectedCount || 0) + (rejectedPartnershipCount || 0),
                totalApplications: 0
            });

            const [pendingJobsRes, pendingPartnershipRes, recentUsersRes] = await Promise.all([
                supabase
                    .from('jobs')
                    .select('*')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })
                    .limit(5),
                supabase
                    .from('school_partnership_jobs')
                    .select('*')
                    .eq('admin_status', 'pending')
                    .order('created_at', { ascending: false })
                    .limit(5),
                supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(6)
            ]);

            const normalizedPendingJobs = await Promise.all(
                (pendingJobsRes.data || []).map(async (job: any) => {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name, company_name')
                        .eq('id', job.creator_id)
                        .single();

                    return {
                        ...job,
                        metadata: { ...(job.metadata || {}), title: job.metadata?.title || job.title },
                        profiles: profile || null
                    };
                })
            );

            const normalizedPendingPartnership = await Promise.all(
                (pendingPartnershipRes.data || []).map(async (job: any) => {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name, company_name')
                        .eq('id', job.employer_id)
                        .single();

                    return {
                        ...job,
                        metadata: { ...(job.metadata || {}), title: job.metadata?.title || job.title },
                        profiles: profile || null
                    };
                })
            );

            const mergedPendingJobs = [...normalizedPendingJobs, ...normalizedPendingPartnership]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5);

            setPendingJobs(mergedPendingJobs);
            setRecentUsers(recentUsersRes.data || []);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveJob = async (jobId: string) => {
        try {
            const { error } = await supabase.from('jobs').update({ status: 'approved' }).eq('id', jobId);
            if (error) throw error;
            fetchDashboardData();
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        }
    };

    const handleRejectJob = async (jobId: string) => {
        try {
            const { error } = await supabase.from('jobs').update({ status: 'rejected' }).eq('id', jobId);
            if (error) throw error;
            fetchDashboardData();
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        }
    };

    const StatusBadge = ({ role }: { role: string }) => {
        const config: any = {
            admin: { color: '#EF4444', text: 'Admin' },
            employer: { color: '#10B981', text: 'Employer' },
            school: { color: '#8B5CF6', text: 'School' },
            candidate: { color: '#3B82F6', text: 'Candidate' }
        };
        const item = config[role] || config.candidate;
        return (
            <span style={{
                padding: '4px 10px', borderRadius: '8px', background: `${item.color}15`, color: item.color,
                fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase'
            }}>
                {item.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div style={{ padding: 'var(--spacing-2xl)', minHeight: '100vh', background: 'var(--color-background-alt)' }}>
                <div style={{ marginBottom: 'var(--spacing-3xl)' }}>
                    <div className="skeleton" style={{ height: '48px', width: '280px', marginBottom: 'var(--spacing-md)', borderRadius: 'var(--radius-lg)' }} />
                    <div className="skeleton" style={{ height: '24px', width: '200px', borderRadius: 'var(--radius-md)' }} />
                </div>
                <div className="admin-stats-grid" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    {[0, 1, 2, 3].map(idx => (
                        <div key={idx} className="stat-card-glass" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-2xl)', animationDelay: `${idx * 100}ms` }}>
                            <div className="skeleton" style={{ width: '52px', height: '52px', borderRadius: '14px', marginBottom: 'var(--spacing-lg)' }} />
                            <div className="skeleton" style={{ height: '40px', width: '80px', marginBottom: 'var(--spacing-sm)' }} />
                            <div className="skeleton" style={{ height: '20px', width: '120px' }} />
                        </div>
                    ))}
                </div>
                <div className="admin-content-grid">
                    <div className="card" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-2xl)' }}>
                        <div className="skeleton skeleton-title" style={{ marginBottom: 'var(--spacing-xl)' }} />
                        {[0, 1, 2].map(idx => (
                            <div key={idx} style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <div className="skeleton" style={{ height: '72px', borderRadius: 'var(--radius-xl)' }} />
                            </div>
                        ))}
                    </div>
                    <div className="card" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-2xl)' }}>
                        <div className="skeleton skeleton-title" style={{ marginBottom: 'var(--spacing-xl)' }} />
                        {[0, 1, 2, 3].map(idx => (
                            <div key={idx} style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', alignItems: 'center' }}>
                                <div className="skeleton skeleton-avatar" style={{ width: '50px', height: '50px', borderRadius: '16px' }} />
                                <div style={{ flex: 1 }}>
                                    <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: 'var(--spacing-xs)' }} />
                                    <div className="skeleton" style={{ height: '12px', width: '60%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-page" style={{ padding: 'var(--spacing-2xl)', minHeight: '100vh', background: 'var(--color-background-alt)' }}>
            <div className="admin-header">
                <div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--color-text)', marginBottom: 'var(--spacing-sm)', letterSpacing: '-0.5px' }}>
                        Hệ thống Quản trị
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Chào buổi sáng, {profile?.full_name}</span>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
                        <span style={{ fontSize: '0.9rem', color: '#10B981', fontWeight: 700 }}>Trực tuyến</span>
                    </div>
                </div>
                <div className="admin-header-actions">
                    <button onClick={fetchDashboardData} className="btn btn-secondary" style={{ width: '54px', height: '54px', borderRadius: 'var(--radius-lg)', padding: 0 }}>
                        <FiActivity size={20} />
                    </button>
                    <Link to="/admin/jobs" className="btn btn-primary" style={{ height: '54px', padding: '0 var(--spacing-xl)', borderRadius: 'var(--radius-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        Kiểm duyệt ngay
                        <FiArrowRight size={20} />
                    </Link>
                </div>
            </div>

            <div className="admin-stats-grid" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                {[
                    { label: 'Người dùng', val: stats.totalUsers, icon: <FiUsers />, color: '#3B82F6', trend: '+12%' },
                    { label: 'Việc làm hoạt động', val: stats.activeJobs, icon: <FiBriefcase />, color: '#8B5CF6', trend: '+5%' },
                    { label: 'Chờ kiểm duyệt', val: stats.pendingJobs, icon: <FiClock />, color: '#F59E0B', trend: 'Cần xử lý', alert: stats.pendingJobs > 0 },
                    { label: 'Nhà tuyển dụng', val: stats.totalEmployers, icon: <FiUserCheck />, color: '#10B981', trend: '+8%' }
                ].map((s, idx) => (
                    <div
                        key={idx}
                        className="stat-card-glass animate-fade-in-up"
                        style={{
                            padding: 'var(--spacing-xl)',
                            borderRadius: 'var(--radius-2xl)',
                            position: 'relative',
                            overflow: 'hidden',
                            animationDelay: `${idx * 100}ms`,
                            animationFillMode: 'both'
                        }}
                    >
                        <div style={{
                            position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px',
                            background: `${s.color}08`, borderRadius: '50%'
                        }} />
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '14px', background: `${s.color}15`, color: s.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: 'var(--spacing-lg)'
                        }}>
                            {s.icon}
                        </div>
                        <div style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 900, color: 'var(--color-text)', marginBottom: 'var(--spacing-xs)' }}>{s.val}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>{s.label}</span>
                            <span style={{ color: s.alert ? '#F59E0B' : '#10B981', fontSize: '0.85rem', fontWeight: 700 }}>{s.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin-content-grid">
                <div className="card" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-2xl)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                        <h3 style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>Hàng đợi kiểm duyệt</h3>
                        <Link to="/admin/jobs" style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>Xem tất cả</Link>
                    </div>

                    {pendingJobs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-4xl) 0' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-border-light)', color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--spacing-lg)' }}>
                                <FiCheckCircle size={32} />
                            </div>
                            <h4 style={{ color: 'var(--color-text)', marginBottom: 'var(--spacing-sm)' }}>Mọi thứ đã gọn gàng!</h4>
                            <p style={{ color: 'var(--color-text-secondary)' }}>Không có tin tuyển dụng nào đang chờ xử lý.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                            {pendingJobs.map((job, idx) => (
                                <div
                                    key={job.id}
                                    className="hover-lift animate-fade-in-up"
                                    style={{
                                        padding: 'var(--spacing-lg)',
                                        borderRadius: 'var(--radius-xl)',
                                        background: 'var(--color-background-alt)',
                                        border: '1px solid var(--color-border-light)',
                                        animationDelay: `${idx * 80}ms`,
                                        animationFillMode: 'both'
                                    }}
                                >
                                    <div className="pending-job-item">
                                        <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center', minWidth: 0 }}>
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: '14px', background: '#3B82F6', color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, flexShrink: 0
                                            }}>
                                                {job.metadata?.title?.charAt(0) || 'J'}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.metadata?.title || 'Untitled'}</h4>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                                                    <span>{job.profiles?.company_name || job.profiles?.full_name || 'Ẩn danh'}</span>
                                                    <span>•</span>
                                                    <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: vi })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pending-job-actions">
                                            <button onClick={() => handleApproveJob(job.id)} className="btn btn-primary" style={{ height: '40px', padding: '0 var(--spacing-lg)', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' }}>Duyệt</button>
                                            <button onClick={() => handleRejectJob(job.id)} className="btn btn-outline" style={{ height: '40px', color: '#EF4444', borderColor: '#FEE2E2', background: '#FEF2F2', padding: '0 var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}><FiXCircle size={18} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-2xl)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                        <h3 style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>Gia nhập mới</h3>
                        <Link to="/admin/users" style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>Tất cả</Link>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        {recentUsers.map((user, idx) => (
                            <div key={user.id} className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}>
                                <div style={{
                                    width: '50px', height: '50px', borderRadius: '16px', background: 'var(--color-primary)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, overflow: 'hidden', flexShrink: 0
                                }}>
                                    {user.avatar_url ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.full_name?.charAt(0) || 'U'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                                </div>
                                <StatusBadge role={user.role} />
                            </div>
                        ))}
                    </div>

                    <div style={{
                        marginTop: 'var(--spacing-2xl)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-xl)',
                        background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)', color: 'white',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <FiActivity size={60} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }} />
                        <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: 'var(--spacing-sm)', fontWeight: 600 }}>CƠ SỞ DỮ LIỆU</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Hệ thống ổn định</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                            Tất cả dịch vụ hoạt động bình thường
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .admin-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--spacing-lg);
                }
                @media (max-width: 1279px) {
                    .admin-stats-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 767px) {
                    .admin-stats-grid { grid-template-columns: 1fr; }
                }

                .admin-content-grid {
                    display: grid;
                    grid-template-columns: 1.6fr 1fr;
                    gap: var(--spacing-xl);
                }
                @media (max-width: 1023px) {
                    .admin-content-grid { grid-template-columns: 1fr; }
                }

                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--spacing-3xl);
                    gap: var(--spacing-lg);
                    flex-wrap: wrap;
                }
                @media (max-width: 767px) {
                    .admin-header { flex-direction: column; align-items: flex-start; }
                }

                .admin-header-actions {
                    display: flex;
                    gap: var(--spacing-md);
                    flex-wrap: wrap;
                }

                .stat-card-glass {
                    background: var(--glass-bg);
                    backdrop-filter: var(--glass-blur);
                    -webkit-backdrop-filter: var(--glass-blur);
                    border: 1px solid var(--glass-border);
                    box-shadow: var(--glass-shadow);
                    transition: all var(--transition-base);
                }
                .stat-card-glass:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                }

                .pending-job-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: var(--spacing-lg);
                }
                @media (max-width: 767px) {
                    .pending-job-item {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .pending-job-actions {
                        width: 100%;
                        display: flex;
                        gap: var(--spacing-sm);
                    }
                    .pending-job-actions .btn { flex: 1; }
                }

                .hover-lift:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
                    background: var(--color-surface) !important;
                    border-color: var(--color-border) !important;
                }
            `}</style>
        </div>
    );
}
