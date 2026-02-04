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

export default function SchoolDashboardPage() {
    const { profile, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeInterns: 0,
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

            // 1. Fetch Students count by domain
            const { count: studentCount } = await supabase
                .from('profiles')
                .select('id', { count: 'exact' })
                .eq('role', 'candidate')
                .ilike('email', `%@${schoolDomain}`);

            // 2. Fetch Partnerships
            const { data: partnerships, error: pError } = await supabase
                .from('school_company_partnerships')
                .select('*')
                .eq('school_id', user.id);

            if (pError) throw pError;

            // Enrich partnerships with company info
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

            // 3. Fetch Active Internships (belonging to this school's students)
            const { count: internCount } = await supabase
                .from('student_work_progress')
                .select('id', { count: 'exact' })
                .eq('school_id', user.id);

            // 4. Fetch School's own Jobs and Applicants
            const { data: schoolJobs, error: jError } = await supabase
                .from('jobs')
                .select('id, applicants')
                .eq('creator_id', user.id);

            if (jError) throw jError;

            const totalOwnJobs = schoolJobs?.length || 0;
            const totalApplicants = schoolJobs?.reduce((sum, job) => sum + (job.applicants?.length || 0), 0) || 0;

            // 5. Fetch Partnership Jobs
            const { count: pJobsCount } = await supabase
                .from('school_partnership_jobs')
                .select('id', { count: 'exact' })
                .eq('school_id', user.id)
                .eq('company_status', 'accepted');

            // 6. Update Stats
            const acceptedPartners = enrichedPartners.filter(p => p.company_status === 'accepted' && p.admin_status === 'approved');
            const pendingReqs = enrichedPartners.filter(p => p.company_status === 'pending');

            setStats({
                totalStudents: studentCount || 0,
                activeInterns: internCount || 0,
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

            // 7. Dummy chart data representing growth
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

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8FAFC' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p style={{ color: '#64748B', fontWeight: 600 }}>Cổng quản lý đang kết nối...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '2rem' }}>
            <div className="container-fluid">
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                            Hệ thống {profile?.company_name || profile?.full_name || 'Quản lý Dữ liệu'}
                        </h1>
                        <p style={{ color: '#64748B', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                            Chào mừng quản trị viên! Tổng hợp tình hình hợp tác & sinh viên thời gian thực.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', padding: '12px 20px' }}>
                            <Calendar size={18} /> Báo cáo tháng
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="card" style={{ padding: '1.5rem', borderRadius: '24px', border: 'none', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ padding: '12px', background: '#E0F2FE', borderRadius: '16px', color: '#0EA5E9' }}>
                                <Users size={24} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{stats.totalStudents}</h3>
                        <p style={{ color: '#64748B', fontWeight: 600, marginTop: '4px', fontSize: '0.9rem' }}>Tổng sinh viên</p>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', borderRadius: '24px', border: 'none', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ padding: '12px', background: '#DCFCE7', borderRadius: '16px', color: '#22C55E' }}>
                                <Briefcase size={24} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{stats.activeInterns}</h3>
                        <p style={{ color: '#64748B', fontWeight: 600, marginTop: '4px', fontSize: '0.9rem' }}>Đang thực tập</p>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', borderRadius: '24px', border: 'none', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ padding: '12px', background: '#FEF3C7', borderRadius: '16px', color: '#F59E0B' }}>
                                <Handshake size={24} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{stats.partnerships}</h3>
                        <p style={{ color: '#64748B', fontWeight: 600, marginTop: '4px', fontSize: '0.9rem' }}>Doanh nghiệp đối tác</p>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', borderRadius: '24px', border: 'none', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ padding: '12px', background: '#EEF2FF', borderRadius: '16px', color: '#6366F1' }}>
                                <CheckCircle2 size={24} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{stats.totalJobs}</h3>
                        <p style={{ color: '#64748B', fontWeight: 600, marginTop: '4px', fontSize: '0.9rem' }}>Tin tuyển dụng</p>
                    </div>

                    <div className="card" style={{ padding: '1.5rem', borderRadius: '24px', border: 'none', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ padding: '12px', background: '#FDF2F8', borderRadius: '16px', color: '#DB2777' }}>
                                <Users size={24} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{stats.totalApplicants}</h3>
                        <p style={{ color: '#64748B', fontWeight: 600, marginTop: '4px', fontSize: '0.9rem' }}>Hồ sơ đã nhận</p>
                    </div>
                </div>

                {/* Charts Area */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                    {/* Growth Chart */}
                    <div className="card" style={{ padding: '2rem', borderRadius: '32px', border: 'none', background: 'white', boxShadow: '0 4px 30px rgba(0,0,0,0.03)', minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Tăng trưởng mạng lưới doanh nghiệp</h3>
                            <Link to="/school/partnerships" style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.875rem' }}>Chi tiết →</Link>
                        </div>
                        <div style={{ height: '350px', minWidth: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="partners" stroke="var(--color-primary)" strokeWidth={4} dot={{ r: 6, fill: 'white', strokeWidth: 3, stroke: 'var(--color-primary)' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="card" style={{ padding: '2rem', borderRadius: '32px', border: 'none', background: 'white', boxShadow: '0 4px 30px rgba(0,0,0,0.03)', minWidth: 0 }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Phân bổ thực tập</h3>
                        <div style={{ height: '240px', position: 'relative', minWidth: 0 }}>
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
                        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {studentStatusData.map((item, index) => (
                                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: COLORS[index] }}></div>
                                        <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>{item.name}</span>
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="card" style={{ padding: '2rem', borderRadius: '32px', border: 'none', background: 'white', boxShadow: '0 4px 30px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Yêu cầu hợp tác gần đây</h3>
                        <Link to="/school/partnerships" className="btn btn-secondary btn-sm" style={{ borderRadius: '10px' }}>Xem tất cả</Link>
                    </div>
                    {recentRequests.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                            Chưa có yêu cầu hợp tác nào được ghi nhận.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table" style={{ margin: 0, borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                                <thead>
                                    <tr style={{ color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        <th style={{ border: 'none', paddingLeft: '1rem' }}>Công ty</th>
                                        <th style={{ border: 'none' }}>Lĩnh vực</th>
                                        <th style={{ border: 'none' }}>Vị trí</th>
                                        <th style={{ border: 'none' }}>Trạng thái</th>
                                        <th style={{ border: 'none', textAlign: 'right', paddingRight: '1rem' }}>Ngày gửi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentRequests.map((req) => {
                                        const badge = getStatusBadge(req.status);
                                        return (
                                            <tr key={req.id} style={{ background: '#F8FAFC', borderRadius: '16px' }}>
                                                <td style={{ padding: '1.25rem 1rem', border: 'none', borderRadius: '16px 0 0 16px', fontWeight: 700, color: '#1E293B' }}>{req.company}</td>
                                                <td style={{ border: 'none' }}><span style={{ background: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', color: '#64748B', border: '1px solid #E2E8F0' }}>{req.domain}</span></td>
                                                <td style={{ border: 'none', fontSize: '0.9rem', color: '#475569' }}>{req.positions}</td>
                                                <td style={{ border: 'none' }}>
                                                    <span style={{ background: badge.bg, color: badge.color, padding: '6px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800 }}>
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td style={{ border: 'none', textAlign: 'right', paddingRight: '1rem', borderRadius: '0 16px 16px 0', fontSize: '0.85rem', color: '#94A3B8' }}>{req.date}</td>
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
