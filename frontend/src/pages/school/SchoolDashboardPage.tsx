import { useState, useEffect } from 'react';
import {
    Users, Handshake, Briefcase,
    ArrowUpRight,
    Calendar, CheckCircle2
} from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line,
    PieChart, Pie, Cell
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

function DashboardSkeleton() {
    return (
        <div style={{ background: 'var(--color-background-alt)', minHeight: '100vh', padding: 'var(--spacing-xl)' }}>
            <div className="container-fluid">
                <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <div className="skeleton" style={{ height: '2.25rem', width: '60%', marginBottom: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}></div>
                    <div className="skeleton" style={{ height: '1rem', width: '40%', borderRadius: 'var(--radius-sm)' }}></div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-2xl)'
                }}>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="card" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-2xl)' }}>
                            <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-md)' }}></div>
                            <div className="skeleton" style={{ height: '2rem', width: '50%', marginBottom: 'var(--spacing-sm)' }}></div>
                            <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
                        </div>
                    ))}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 'var(--spacing-xl)',
                    marginBottom: 'var(--spacing-2xl)'
                }}>
                    <div className="card" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-2xl)' }}>
                        <div className="skeleton" style={{ height: '1.25rem', width: '50%', marginBottom: 'var(--spacing-xl)' }}></div>
                        <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }}></div>
                    </div>
                    <div className="card" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-2xl)' }}>
                        <div className="skeleton" style={{ height: '1.25rem', width: '40%', marginBottom: 'var(--spacing-xl)' }}></div>
                        <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)' }}></div>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                                <div className="skeleton" style={{ width: '12px', height: '12px', borderRadius: 'var(--radius-xs)', flexShrink: 0 }}></div>
                                <div className="skeleton skeleton-text" style={{ flex: 1 }}></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-2xl)' }}>
                    <div className="skeleton" style={{ height: '1.25rem', width: '35%', marginBottom: 'var(--spacing-xl)' }}></div>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', alignItems: 'center' }}>
                            <div className="skeleton skeleton-text" style={{ flex: 2 }}></div>
                            <div className="skeleton skeleton-text" style={{ flex: 1 }}></div>
                            <div className="skeleton skeleton-text" style={{ flex: 1 }}></div>
                            <div className="skeleton" style={{ width: '80px', height: '28px', borderRadius: 'var(--radius-md)' }}></div>
                            <div className="skeleton skeleton-text" style={{ width: '60px' }}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function SchoolDashboardPage() {
    const { profile, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeInterns: 0,
        pendingEvaluations: 0,
        partnerships: 0,
        pendingPartnerships: 0,
        totalJobs: 0,
        totalApplicants: 0
    });
    const [recentRequests, setRecentRequests] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const schoolDomain = user.email?.split('@')[1];
            if (!schoolDomain) throw new Error('Không hiển thị được domain trường');

            const { count: studentCount } = await supabase
                .from('profiles')
                .select('id', { count: 'exact' })
                .eq('role', 'candidate')
                .ilike('email', `%@${schoolDomain}`);

            const { data: partnerships, error: pError } = await supabase
                .from('school_company_partnerships')
                .select('*')
                .eq('school_id', user.id);

            if (pError) throw pError;

            let enrichedPartners = [];
            const companyIds = [...new Set(partnerships?.map(p => p.company_id).filter(id => !!id) || [])];
            if (companyIds.length > 0) {
                const { data: comps } = await supabase
                    .from('profiles')
                    .select('id, full_name, company_name, avatar_url')
                    .in('id', companyIds);

                const cMap = (comps || []).reduce((acc: any, c: any) => ({ ...acc, [c.id]: c }), {});
                enrichedPartners = (partnerships || []).map(p => ({
                    ...p,
                    company: cMap[p.company_id]
                }));
            }

            const { count: internCount } = await supabase
                .from('student_work_progress')
                .select('id', { count: 'exact' })
                .eq('school_id', user.id);

            const { data: schoolJobs, error: jError } = await supabase
                .from('jobs')
                .select('id, applicants')
                .eq('creator_id', user.id);

            if (jError) throw jError;

            const totalOwnJobs = schoolJobs?.length || 0;
            const totalApplicants = schoolJobs?.reduce((sum, job) => sum + (job.applicants?.length || 0), 0) || 0;

            const { count: pJobsCount } = await supabase
                .from('school_partnership_jobs')
                .select('id', { count: 'exact' })
                .eq('school_id', user.id)
                .eq('company_status', 'accepted');

            const acceptedPartners = enrichedPartners.filter(p => p.company_status === 'accepted' && p.admin_status === 'approved');
            const pendingReqs = enrichedPartners.filter(p => p.company_status === 'pending');

            setStats({
                totalStudents: studentCount || 0,
                activeInterns: internCount || 0,
                pendingEvaluations: 0,
                partnerships: acceptedPartners.length,
                pendingPartnerships: pendingReqs.length,
                totalJobs: totalOwnJobs + (pJobsCount || 0),
                totalApplicants: totalApplicants
            });

            setRecentRequests(enrichedPartners.slice(0, 5).map(p => ({
                id: p.id,
                company: (p.company as any)?.company_name || (p.company as any)?.full_name || 'N/A',
                domain: p.metadata?.fields?.[0] || 'Đa ngành',
                positions: p.metadata?.title || 'Liên kết hợp tác',
                date: new Date(p.created_at).toLocaleDateString('vi-VN'),
                status: p.company_status,
                metadata: p.metadata
            })));

            setChartData([
                { name: 'T1', partners: 2 },
                { name: 'T2', partners: 5 },
                { name: 'T3', partners: 8 },
                { name: 'T4', partners: acceptedPartners.length },
            ]);

        } catch (error: any) {
            console.error('Dashboard Error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return { label: 'Chờ duyệt', color: '#F59E0B', bg: '#FEF3C7' };
            case 'accepted': return { label: 'Đã chấp nhận', color: '#10B981', bg: '#D1FAE5' };
            case 'rejected': return { label: 'Từ chối', color: '#EF4444', bg: '#FEE2E2' };
            default: return { label: 'Đang xử lý', color: '#64748B', bg: '#F1F5F9' };
        }
    };

    const studentStatusData = [
        { name: 'Đang thực tập', value: stats.activeInterns },
        { name: 'Chờ xét duyệt', value: stats.pendingEvaluations },
        { name: 'Đã hoàn thành', value: Math.max(0, stats.totalStudents - stats.activeInterns - stats.pendingEvaluations) },
    ];

    const statCards = [
        {
            value: stats.totalStudents,
            label: 'Tổng sinh viên',
            icon: Users,
            bg: 'var(--color-info-light)',
            color: 'var(--color-info)',
            delay: 'animate-delay-100'
        },
        {
            value: stats.activeInterns,
            label: 'Đang thực tập',
            icon: Briefcase,
            bg: 'var(--color-success-light)',
            color: 'var(--color-success)',
            delay: 'animate-delay-200'
        },
        {
            value: stats.partnerships,
            label: 'Doanh nghiệp đối tác',
            icon: Handshake,
            bg: 'var(--color-warning-light)',
            color: 'var(--color-warning)',
            delay: 'animate-delay-300'
        },
        {
            value: stats.totalJobs,
            label: 'Tin tuyển dụng',
            icon: CheckCircle2,
            bg: '#EEF2FF',
            color: '#6366F1',
            delay: 'animate-delay-400'
        },
        {
            value: stats.totalApplicants,
            label: 'Hồ sơ đã nhận',
            icon: Users,
            bg: '#FDF2F8',
            color: '#DB2777',
            delay: 'animate-delay-500'
        },
    ];

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div style={{ background: 'var(--color-background-alt)', minHeight: '100vh', padding: 'var(--spacing-xl)' }}>
            <div className="container-fluid">
                {/* Header Section */}
                <div className="animate-fade-in-down" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                    <div>
                        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, color: 'var(--color-text)', margin: 0, lineHeight: 1.2 }}>
                            Hệ thống {profile?.company_name || profile?.full_name || 'Quản lý Dữ liệu'}
                        </h1>
                        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)', fontSize: 'clamp(0.875rem, 2vw, 1.1rem)' }}>
                            Chào mừng quản trị viên! Tổng hợp tình hình hợp tác & sinh viên thời gian thực.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-secondary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                minHeight: '48px'
                            }}
                        >
                            <Calendar size={18} /> Báo cáo tháng
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(1, 1fr)',
                    gap: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-2xl)'
                }}
                    className="stats-grid"
                >
                    {statCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={index}
                                className={`card card-glass animate-fade-in-up ${card.delay}`}
                                style={{
                                    padding: 'var(--spacing-lg)',
                                    borderRadius: 'var(--radius-2xl)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    background: 'var(--glass-bg)',
                                    backdropFilter: 'var(--glass-blur)',
                                    WebkitBackdropFilter: 'var(--glass-blur)',
                                    boxShadow: 'var(--glass-shadow)',
                                    cursor: 'default',
                                    minHeight: '48px'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                                    <div style={{
                                        padding: 'var(--spacing-md)',
                                        background: card.bg,
                                        borderRadius: 'var(--radius-lg)',
                                        color: card.color,
                                        minWidth: '48px',
                                        minHeight: '48px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Icon size={24} />
                                    </div>
                                    <ArrowUpRight size={20} style={{ color: 'var(--color-text-light)' }} />
                                </div>
                                <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{card.value}</h3>
                                <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: 'var(--spacing-xs)', fontSize: '0.9rem', marginBottom: 0 }}>{card.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Charts Area */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 'var(--spacing-xl)',
                    marginBottom: 'var(--spacing-2xl)'
                }}
                    className="charts-grid"
                >
                    {/* Growth Chart */}
                    <div className="card animate-fade-in-up animate-delay-200" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-2xl)', border: 'none', background: 'var(--color-surface)', boxShadow: 'var(--shadow-lg)', minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                            <h3 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 800, margin: 0 }}>Tăng trưởng mạng lưới doanh nghiệp</h3>
                            <Link to="/school/partnerships" style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.875rem', minHeight: '44px', display: 'flex', alignItems: 'center' }}>Chi tiết &rarr;</Link>
                        </div>
                        <div style={{ height: 'clamp(250px, 40vw, 350px)', minWidth: 0, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-light)', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-light)', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: 'var(--radius-lg)',
                                            border: 'none',
                                            boxShadow: 'var(--shadow-xl)',
                                            background: 'var(--color-surface)'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="partners"
                                        stroke="var(--color-primary)"
                                        strokeWidth={3}
                                        dot={{ r: 5, fill: 'white', strokeWidth: 3, stroke: 'var(--color-primary)' }}
                                        activeDot={{ r: 7 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="card animate-fade-in-up animate-delay-300" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-2xl)', border: 'none', background: 'var(--color-surface)', boxShadow: 'var(--shadow-lg)', minWidth: 0 }}>
                        <h3 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 800, marginBottom: 'var(--spacing-xl)' }}>Phân bổ thực tập</h3>
                        <div style={{ height: 'clamp(200px, 30vw, 240px)', position: 'relative', minWidth: 0, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={studentStatusData}
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {studentStatusData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ marginTop: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {studentStatusData.map((item, index) => (
                                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '44px', padding: 'var(--spacing-xs) 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: 'var(--radius-xs)', background: COLORS[index] }}></div>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{item.name}</span>
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="card animate-fade-in-up animate-delay-400" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-2xl)', border: 'none', background: 'var(--color-surface)', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                        <h3 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 800, margin: 0 }}>Yêu cầu hợp tác gần đây</h3>
                        <Link to="/school/partnerships" className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-md)', minHeight: '44px' }}>Xem tất cả</Link>
                    </div>
                    {recentRequests.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl) var(--spacing-xl)', color: 'var(--color-text-light)' }}>
                            Chưa có yêu cầu hợp tác nào được ghi nhận.
                        </div>
                    ) : (
                        <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: 'var(--radius-lg)' }}>
                            <table className="table" style={{ margin: 0, borderCollapse: 'separate', borderSpacing: '0 var(--spacing-sm)', minWidth: '600px', width: '100%' }}>
                                <thead>
                                    <tr style={{ color: 'var(--color-text-light)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        <th style={{ border: 'none', paddingLeft: 'var(--spacing-md)', textAlign: 'left', whiteSpace: 'nowrap' }}>Công ty</th>
                                        <th style={{ border: 'none', textAlign: 'left', whiteSpace: 'nowrap' }}>Lĩnh vực</th>
                                        <th style={{ border: 'none', textAlign: 'left', whiteSpace: 'nowrap' }}>Vị trí</th>
                                        <th style={{ border: 'none', textAlign: 'left', whiteSpace: 'nowrap' }}>Trạng thái</th>
                                        <th style={{ border: 'none', textAlign: 'right', paddingRight: 'var(--spacing-md)', whiteSpace: 'nowrap' }}>Ngày gửi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentRequests.map((req) => {
                                        const badge = getStatusBadge(req.status);
                                        return (
                                            <tr key={req.id} style={{ background: 'var(--color-background-alt)', borderRadius: 'var(--radius-lg)' }}>
                                                <td style={{ padding: 'var(--spacing-md)', border: 'none', borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)', fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>{req.company}</td>
                                                <td style={{ border: 'none', whiteSpace: 'nowrap' }}>
                                                    <span style={{ background: 'var(--color-surface)', padding: 'var(--spacing-xs) var(--spacing-sm)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', display: 'inline-block' }}>
                                                        {req.domain}
                                                    </span>
                                                </td>
                                                <td style={{ border: 'none', fontSize: '0.9rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{req.positions}</td>
                                                <td style={{ border: 'none', whiteSpace: 'nowrap' }}>
                                                    <span style={{ background: badge.bg, color: badge.color, padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 800, display: 'inline-block' }}>
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td style={{ border: 'none', textAlign: 'right', paddingRight: 'var(--spacing-md)', borderRadius: '0 var(--radius-lg) var(--radius-lg) 0', fontSize: '0.85rem', color: 'var(--color-text-light)', whiteSpace: 'nowrap' }}>{req.date}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
