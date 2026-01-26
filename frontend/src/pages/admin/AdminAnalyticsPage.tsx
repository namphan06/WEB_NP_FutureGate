import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    Users,
    Briefcase,
    FileText,
    Calendar,
    TrendingUp,
    Percent,
    RefreshCw
} from 'lucide-react';

interface OverviewStats {
    totalUsers: number;
    newUsers: number;
    totalJobs: number;
    newJobs: number;
    totalApplications: number;
    newApplications: number;
    totalInterviews: number;
    newInterviews: number;
    applicationSuccessRate: number;
}

interface TrendData {
    day: string;
    count: number;
}

interface DistributionData {
    [key: string]: number;
}

export default function AdminAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90 | 365>(7);

    // Stats
    const [overviewStats, setOverviewStats] = useState<OverviewStats>({
        totalUsers: 0,
        newUsers: 0,
        totalJobs: 0,
        newJobs: 0,
        totalApplications: 0,
        newApplications: 0,
        totalInterviews: 0,
        newInterviews: 0,
        applicationSuccessRate: 0
    });

    // Trends
    const [usersTrend, setUsersTrend] = useState<TrendData[]>([]);
    const [jobsTrend, setJobsTrend] = useState<TrendData[]>([]);
    const [applicationsTrend, setApplicationsTrend] = useState<TrendData[]>([]);

    // Distributions
    const [usersDistribution, setUsersDistribution] = useState<DistributionData>({});
    const [jobsDistribution, setJobsDistribution] = useState<DistributionData>({});

    useEffect(() => {
        loadAllAnalytics();
    }, [selectedPeriod]);

    const loadAllAnalytics = async () => {
        try {
            setLoading(true);
            const periodStart = new Date();
            periodStart.setDate(periodStart.getDate() - selectedPeriod);

            // Load all users
            const { data: allUsers } = await supabase
                .from('profiles')
                .select('id, role, created_at');

            const totalUsers = allUsers?.length || 0;
            const newUsers = allUsers?.filter(u =>
                new Date(u.created_at) > periodStart
            ).length || 0;

            // Load all jobs
            const { data: allJobs } = await supabase
                .from('jobs')
                .select('id, status, created_at, deadline, applicants');

            const totalJobs = allJobs?.length || 0;
            const newJobs = allJobs?.filter(j =>
                new Date(j.created_at) > periodStart
            ).length || 0;

            // Calculate applications
            let totalApplications = 0;
            let newApplications = 0;
            let acceptedApplications = 0;

            allJobs?.forEach(job => {
                const applicants = job.applicants || [];
                totalApplications += applicants.length;

                applicants.forEach((app: any) => {
                    if (app.applied_at && new Date(app.applied_at) > periodStart) {
                        newApplications++;
                    }
                    if (app.status?.toLowerCase() === 'accepted') {
                        acceptedApplications++;
                    }
                });
            });

            const applicationSuccessRate = totalApplications > 0
                ? (acceptedApplications / totalApplications * 100)
                : 0;

            // Load interviews
            const { data: allInterviews } = await supabase
                .from('interview_schedules')
                .select('id, created_at');

            const totalInterviews = allInterviews?.length || 0;
            const newInterviews = allInterviews?.filter(i =>
                new Date(i.created_at) > periodStart
            ).length || 0;

            setOverviewStats({
                totalUsers,
                newUsers,
                totalJobs,
                newJobs,
                totalApplications,
                newApplications,
                totalInterviews,
                newInterviews,
                applicationSuccessRate: parseFloat(applicationSuccessRate.toFixed(2))
            });

            // Calculate distributions
            const usersDist: DistributionData = {};
            allUsers?.forEach(user => {
                const role = user.role || 'candidate';
                usersDist[role] = (usersDist[role] || 0) + 1;
            });
            setUsersDistribution(usersDist);

            const jobsDist: DistributionData = { active: 0, expired: 0 };
            const now = new Date();
            allJobs?.forEach(job => {
                const deadline = job.deadline ? new Date(job.deadline) : null;
                const isExpired = deadline && deadline < now;
                const status = isExpired ? 'expired' : 'active';
                jobsDist[status]++;
            });
            setJobsDistribution(jobsDist);

            // Calculate trends
            setUsersTrend(groupByDay(allUsers?.filter(u => new Date(u.created_at) > periodStart) || [], 'created_at', selectedPeriod));
            setJobsTrend(groupByDay(allJobs?.filter(j => new Date(j.created_at) > periodStart) || [], 'created_at', selectedPeriod));

            // Applications trend
            const applications: any[] = [];
            allJobs?.forEach(job => {
                const applicants = job.applicants || [];
                applicants.forEach((app: any) => {
                    if (app.applied_at) {
                        applications.push({ created_at: app.applied_at });
                    }
                });
            });
            const filteredApplications = applications.filter(app =>
                new Date(app.created_at) > periodStart
            );
            setApplicationsTrend(groupByDay(filteredApplications, 'created_at', selectedPeriod));

        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupByDay = (items: any[], dateField: string, days: number): TrendData[] => {
        const grouped: Record<string, number> = {};
        const now = new Date();

        // Initialize all days with 0
        for (let i = 0; i < days; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - (days - i - 1));
            const key = `${date.getMonth() + 1}/${date.getDate()}`;
            grouped[key] = 0;
        }

        // Count items by day
        items.forEach(item => {
            const date = new Date(item[dateField]);
            const key = `${date.getMonth() + 1}/${date.getDate()}`;
            if (grouped.hasOwnProperty(key)) {
                grouped[key]++;
            }
        });

        return Object.entries(grouped).map(([day, count]) => ({ day, count }));
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadAllAnalytics();
        setRefreshing(false);
    };

    const getPeriodLabel = () => {
        switch (selectedPeriod) {
            case 7: return '7 ngày';
            case 30: return '30 ngày';
            case 90: return '90 ngày';
            case 365: return '1 năm';
            default: return '7 ngày';
        }
    };

    // Chart colors
    const COLORS = {
        primary: '#1E88E5',
        success: '#43A047',
        warning: '#FB8C00',
        danger: '#E53935',
        purple: '#8E24AA',
        teal: '#00897B'
    };

    const ROLE_COLORS = ['#1E88E5', '#FB8C00', '#43A047', '#8E24AA'];
    const STATUS_COLORS = ['#43A047', '#E53935'];

    // Transform distribution data for pie charts
    const getUsersPieData = () => {
        return Object.entries(usersDistribution).map(([name, value]) => ({
            name: getRoleLabel(name),
            value
        }));
    };

    const getJobsPieData = () => {
        return Object.entries(jobsDistribution).map(([name, value]) => ({
            name: name === 'active' ? 'Đang hoạt động' : 'Đã hết hạn',
            value
        }));
    };

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            candidate: 'Ứng viên',
            employer: 'Nhà tuyển dụng',
            school: 'Trường học',
            admin: 'Quản trị viên'
        };
        return labels[role] || role;
    };

    if (loading && !refreshing) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid var(--color-primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Đang tải dữ liệu thống kê...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem 50px', maxWidth: '100%', minHeight: '100vh', background: '#F8FAFC' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', color: '#1E293B' }}>
                            📊 Báo cáo & Phân tích
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: '#64748B' }}>
                            Reports & Analytics
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="btn btn-outline-primary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            height: '54px',
                            padding: '0 2rem',
                            borderRadius: '16px',
                            fontWeight: 700,
                            opacity: refreshing ? 0.6 : 1
                        }}
                    >
                        <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                        Làm mới
                    </button>
                </div>

                {/* Time Period Selector */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {[
                        { value: 7 as const, label: '7 ngày' },
                        { value: 30 as const, label: '30 ngày' },
                        { value: 90 as const, label: '90 ngày' },
                        { value: 365 as const, label: '1 năm' }
                    ].map(period => (
                        <button
                            key={period.value}
                            onClick={() => setSelectedPeriod(period.value)}
                            style={{
                                padding: '0.625rem 1.25rem',
                                borderRadius: '12px',
                                border: selectedPeriod === period.value ? '2px solid var(--color-primary)' : '1px solid #E2E8F0',
                                background: selectedPeriod === period.value ? 'rgba(30, 136, 229, 0.08)' : 'white',
                                color: selectedPeriod === period.value ? 'var(--color-primary)' : '#64748B',
                                fontWeight: selectedPeriod === period.value ? 700 : 500,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: selectedPeriod === period.value ? '0 4px 12px rgba(30, 136, 229, 0.2)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (selectedPeriod !== period.value) {
                                    e.currentTarget.style.background = '#F1F5F9';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedPeriod !== period.value) {
                                    e.currentTarget.style.background = 'white';
                                }
                            }}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                <StatCard
                    icon={<Users size={28} />}
                    label="Người dùng"
                    value={overviewStats.totalUsers}
                    change={overviewStats.newUsers}
                    color={COLORS.primary}
                />
                <StatCard
                    icon={<Briefcase size={28} />}
                    label="Việc làm"
                    value={overviewStats.totalJobs}
                    change={overviewStats.newJobs}
                    color={COLORS.warning}
                />
                <StatCard
                    icon={<FileText size={28} />}
                    label="Ứng tuyển"
                    value={overviewStats.totalApplications}
                    change={overviewStats.newApplications}
                    color={COLORS.success}
                />
                <StatCard
                    icon={<Calendar size={28} />}
                    label="Phỏng vấn"
                    value={overviewStats.totalInterviews}
                    change={overviewStats.newInterviews}
                    color={COLORS.purple}
                />
            </div>

            {/* Detailed Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                {/* Users Trend */}
                <ChartCard
                    title="Người dùng mới"
                    subtitle={`+${overviewStats.newUsers} trong ${getPeriodLabel()} qua`}
                    icon={<TrendingUp size={20} />}
                    color={COLORS.primary}
                >
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={usersTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="day" stroke="#999" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'white',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke={COLORS.primary}
                                strokeWidth={3}
                                dot={{ fill: COLORS.primary, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Jobs Trend */}
                <ChartCard
                    title="Việc làm đăng"
                    subtitle={`+${overviewStats.newJobs} trong ${getPeriodLabel()} qua`}
                    icon={<Briefcase size={20} />}
                    color={COLORS.warning}
                >
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={jobsTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="day" stroke="#999" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'white',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke={COLORS.warning}
                                strokeWidth={3}
                                dot={{ fill: COLORS.warning, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Applications Trend */}
                <ChartCard
                    title="Ứng tuyển"
                    subtitle={`+${overviewStats.newApplications} trong ${getPeriodLabel()} qua`}
                    icon={<FileText size={20} />}
                    color={COLORS.success}
                >
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={applicationsTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="day" stroke="#999" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'white',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Bar dataKey="count" fill={COLORS.success} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Success Rate */}
                <ChartCard
                    title="Tỷ lệ thành công"
                    subtitle="Ứng tuyển được duyệt"
                    icon={<Percent size={20} />}
                    color={COLORS.purple}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '200px',
                        gap: '2rem'
                    }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                            <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    stroke="#f0f0f0"
                                    strokeWidth="12"
                                />
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="none"
                                    stroke={COLORS.purple}
                                    strokeWidth="12"
                                    strokeDasharray={`${(overviewStats.applicationSuccessRate / 100) * 314} 314`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    fontSize: '1.75rem',
                                    fontWeight: 700,
                                    color: COLORS.purple
                                }}>
                                    {overviewStats.applicationSuccessRate.toFixed(1)}%
                                </div>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: COLORS.purple }}>
                                {Math.round((overviewStats.applicationSuccessRate / 100) * overviewStats.totalApplications)}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#64748B' }}>
                                Đã được duyệt
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.5rem' }}>
                                Từ {overviewStats.totalApplications} đơn
                            </div>
                        </div>
                    </div>
                </ChartCard>
            </div>

            {/* Distribution Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Users by Role */}
                <ChartCard
                    title="Người dùng theo vai trò"
                    subtitle="Phân bố theo loại tài khoản"
                    icon={<Users size={20} />}
                    color={COLORS.primary}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', height: '250px' }}>
                        <ResponsiveContainer width="50%" height="100%">
                            <PieChart>
                                <Pie
                                    data={getUsersPieData()}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {getUsersPieData().map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ flex: 1 }}>
                            {getUsersPieData().map((item, index) => (
                                <div key={item.name} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '0.75rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '3px',
                                            background: ROLE_COLORS[index % ROLE_COLORS.length]
                                        }}></div>
                                        <span style={{ fontSize: '0.875rem' }}>{item.name}</span>
                                    </div>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                        {item.value} ({overviewStats.totalUsers > 0 ? ((item.value / overviewStats.totalUsers) * 100).toFixed(1) : 0}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartCard>

                {/* Jobs by Status */}
                <ChartCard
                    title="Việc làm theo trạng thái"
                    subtitle="Phân bố theo tình trạng"
                    icon={<Briefcase size={20} />}
                    color={COLORS.success}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', height: '250px' }}>
                        <ResponsiveContainer width="50%" height="100%">
                            <PieChart>
                                <Pie
                                    data={getJobsPieData()}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {getJobsPieData().map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ flex: 1 }}>
                            {getJobsPieData().map((item, index) => (
                                <div key={item.name} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '0.75rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '3px',
                                            background: STATUS_COLORS[index % STATUS_COLORS.length]
                                        }}></div>
                                        <span style={{ fontSize: '0.875rem' }}>{item.name}</span>
                                    </div>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                        {item.value} ({overviewStats.totalJobs > 0 ? ((item.value / overviewStats.totalJobs) * 100).toFixed(1) : 0}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartCard>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

// Stat Card Component
interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    change: number;
    color: string;
}

function StatCard({ icon, label, value, change, color }: StatCardProps) {
    return (
        <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '24px',
            border: '1px solid #E2E8F0',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '100px',
                height: '100px',
                background: `${color}08`,
                borderRadius: '50%'
            }} />
            <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                marginBottom: '1.5rem'
            }}>
                {icon}
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.25rem' }}>
                {value.toLocaleString()}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B', fontWeight: 600, fontSize: '0.95rem' }}>{label}</span>
                <span style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '20px',
                    background: change > 0 ? '#E8F5E9' : '#FFF3E0',
                    color: change > 0 ? '#43A047' : '#FB8C00',
                    fontSize: '0.8125rem',
                    fontWeight: 700
                }}>
                    +{change}
                </span>
            </div>
        </div>
    );
}

// Chart Card Component
interface ChartCardProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    children: React.ReactNode;
}

function ChartCard({ title, subtitle, icon, color, children }: ChartCardProps) {
    return (
        <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '28px',
            border: '1px solid #E2E8F0'
        }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: `${color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: color
                    }}>
                        {icon}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
                        {title}
                    </h3>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, paddingLeft: '3.25rem' }}>
                    {subtitle}
                </p>
            </div>
            {children}
        </div>
    );
}
