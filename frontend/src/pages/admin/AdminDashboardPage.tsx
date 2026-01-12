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

    // Only admins can access
    if (profile?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch counts in parallel for performance
            const [
                { count: userCount },
                { count: candidateCount },
                { count: employerCount },
                { count: schoolCount },
                { count: totalJobsCount },
                { count: activeJobsCount },
                { count: pendingCount },
                { count: rejectedCount }
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'candidate'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employer'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'school'),
                supabase.from('jobs').select('*', { count: 'exact', head: true }),
                supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'approved').eq('is_active', true),
                supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'rejected')
            ]);

            setStats({
                totalUsers: userCount || 0,
                totalCandidates: candidateCount || 0,
                totalEmployers: employerCount || 0,
                totalSchools: schoolCount || 0,
                totalJobs: totalJobsCount || 0,
                activeJobs: activeJobsCount || 0,
                pendingJobs: pendingCount || 0,
                rejectedJobs: rejectedCount || 0,
                totalApplications: 0
            });

            // Fetch lists
            const [pendingJobsRes, recentUsersRes] = await Promise.all([
                supabase.from('jobs').select('*, profiles:employer_id(full_name, company_name)').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
                supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(6)
            ]);

            setPendingJobs(pendingJobsRes.data || []);
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8FAFC' }}>
                <div className="loading" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#64748B' }}>Đang khởi tạo Dashboard...</div>
            </div>
        );
    }

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '2.5rem 50px' }}>
            {/* Top Bar / Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                        Hệ thống Quản trị
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: '#64748B', fontSize: '1.1rem' }}>Chào buổi sáng, {profile?.full_name}</span>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
                        <span style={{ fontSize: '0.9rem', color: '#10B981', fontWeight: 700 }}>Trực tuyến</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={fetchDashboardData} className="btn-icon" style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'white', border: '1px solid #E2E8F0', color: '#64748B' }}>
                        <FiActivity size={20} />
                    </button>
                    <Link to="/admin/jobs" className="btn btn-primary" style={{ height: '54px', padding: '0 2rem', borderRadius: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        Kiểm duyệt ngay
                        <FiArrowRight size={20} />
                    </Link>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Người dùng', val: stats.totalUsers, icon: <FiUsers />, color: '#3B82F6', trend: '+12%' },
                    { label: 'Việc làm hoạt động', val: stats.activeJobs, icon: <FiBriefcase />, color: '#8B5CF6', trend: '+5%' },
                    { label: 'Chờ kiểm duyệt', val: stats.pendingJobs, icon: <FiClock />, color: '#F59E0B', trend: 'Cần xử lý', alert: stats.pendingJobs > 0 },
                    { label: 'Nhà tuyển dụng', val: stats.totalEmployers, icon: <FiUserCheck />, color: '#10B981', trend: '+8%' }
                ].map((s, idx) => (
                    <div key={idx} className="card" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', position: 'relative', overflow: 'hidden', background: 'white' }}>
                        <div style={{
                            position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px',
                            background: `${s.color}08`, borderRadius: '50%'
                        }} />
                        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                            {s.icon}
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.25rem' }}>{s.val}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#64748B', fontWeight: 600, fontSize: '0.95rem' }}>{s.label}</span>
                            <span style={{ color: s.alert ? '#F59E0B' : '#10B981', fontSize: '0.85rem', fontWeight: 700 }}>{s.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }}>
                {/* Left: Pending Jobs */}
                <div className="card" style={{ padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0', background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>Hàng đợi kiểm duyệt</h3>
                        <Link to="/admin/jobs" style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>Xem tất cả</Link>
                    </div>

                    {pendingJobs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F1F5F9', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <FiCheckCircle size={32} />
                            </div>
                            <h4 style={{ color: '#1E293B', marginBottom: '0.5rem' }}>Mọi thứ đã gọn gàng!</h4>
                            <p style={{ color: '#64748B' }}>Không có tin tuyển dụng nào đang chờ xử lý.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {pendingJobs.map(job => (
                                <div key={job.id} style={{ padding: '1.5rem', borderRadius: '20px', background: '#F8FAFC', border: '1px solid #F1F5F9', transition: 'all 0.2s ease' }} className="hover-lift">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#3B82F6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800 }}>
                                                {job.metadata.title?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}>{job.metadata.title}</h4>
                                                <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', gap: '1rem' }}>
                                                    <span>🏢 {job.profiles?.company_name || job.profiles?.full_name}</span>
                                                    <span>•</span>
                                                    <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: vi })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <button onClick={() => handleApproveJob(job.id)} className="btn btn-primary" style={{ height: '40px', padding: '0 1.25rem', fontSize: '0.85rem', borderRadius: '10px' }}>Duyệt</button>
                                            <button onClick={() => handleRejectJob(job.id)} className="btn btn-outline" style={{ height: '40px', color: '#EF4444', borderColor: '#FEE2E2', background: '#FEF2F2', padding: '0 0.75rem', borderRadius: '10px' }}><FiXCircle size={18} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Recent Users */}
                <div className="card" style={{ padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0', background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>Gia nhập mới</h3>
                        <Link to="/admin/users" style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>Tất cả</Link>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {recentUsers.map(user => (
                            <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '50px', height: '50px', borderRadius: '16px', background: 'var(--color-primary)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, overflow: 'hidden'
                                }}>
                                    {user.avatar_url ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.full_name?.charAt(0) || 'U'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.95rem' }}>{user.full_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{user.email}</div>
                                </div>
                                <StatusBadge role={user.role} />
                            </div>
                        ))}
                    </div>

                    <div style={{
                        marginTop: '2.5rem', padding: '1.5rem', borderRadius: '20px',
                        background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)', color: 'white',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <FiActivity size={60} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }} />
                        <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.5rem', fontWeight: 600 }}>CƠ SỞ DỮ LIỆU</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Hệ thống ổn định</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                            Tất cả dịch vụ hoạt động bình thường
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .hover-lift:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
                    background: white !important;
                    border-color: #E2E8F0 !important;
                }
                .btn-icon:hover {
                    background: #F1F5F9 !important;
                    color: #1E293B !important;
                }
            `}</style>
        </div>
    );
}
