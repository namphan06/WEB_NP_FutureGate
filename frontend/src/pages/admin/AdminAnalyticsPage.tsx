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

    const [usersTrend, setUsersTrend] = useState<TrendData[]>([]);
    const [jobsTrend, setJobsTrend] = useState<TrendData[]>([]);
    const [applicationsTrend, setApplicationsTrend] = useState<TrendData[]>([]);

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

            const { data: allUsers } = await supabase
                .from('profiles')
                .select('id, role, created_at');

            const totalUsers = allUsers?.length || 0;
            const newUsers = allUsers?.filter(u =>
                new Date(u.created_at) > periodStart
            ).length || 0;

            const { data: allJobs } = await supabase
                .from('jobs')
                .select('id, status, created_at, deadline, applicants');

            const totalJobs = allJobs?.length || 0;
            const newJobs = allJobs?.filter(j =>
                new Date(j.created_at) > periodStart
            ).length || 0;

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

            setUsersTrend(groupByDay(allUsers?.filter(u => new Date(u.created_at) > periodStart) || [], 'created_at', selectedPeriod));
            setJobsTrend(groupByDay(allJobs?.filter(j => new Date(j.created_at) > periodStart) || [], 'created_at', selectedPeriod));

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

        for (let i = 0; i < days; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - (days - i - 1));
            const key = `${date.getMonth() + 1}/${date.getDate()}`;
            grouped[key] = 0;
        }

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
            <div className="admin-analytics-page" style={{ padding: 'var(--spacing-2xl)', minHeight: '100vh', background: 'var(--color-background-alt)' }}>
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

                <div className="admin-charts-grid" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    {[0, 1, 2, 3].map(idx => (
                        <div key={idx} className="card" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-2xl)' }}>
                            <div className="skeleton skeleton-title" style={{ marginBottom: 'var(--spacing-xl)' }} />
                            <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-md)' }} />
                        </div>
                    ))}
                </div>

                <div className="admin-charts-grid">
                    {[0, 1].map(idx => (
                        <div key={idx} className="card" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-2xl)' }}>
                            <div className="skeleton skeleton-title" style={{ marginBottom: 'var(--spacing-xl)' }} />
                            <div className="skeleton" style={{ height: '250px', borderRadius: 'var(--radius-md)' }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="admin-analytics-page" style={{ padding: 'var(--spacing-2xl)', minHeight: '100vh', background: 'var(--color-background-alt)' }}>
            <div className="admin-header" style={{ marginBottom: 'var(--spacing-3xl)' }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 'var(--spacing-sm)', color: 'var(--color-text)' }}>
                        Báo cáo & Phân tích
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)' }}>
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
                        gap: 'var(--spacing-sm)',
                        height: '54px',
                        padding: '0 var(--spacing-xl)',
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: 700,
                        opacity: refreshing ? 0.6 : 1,
                        flexShrink: 0
                    }}
                >
                    <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                    Làm mới
                </button>
            </div>

            <div className="admin-period-selector" style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', marginBottom: 'var(--spacing-2xl)' }}>
                {[
                    { value: 7 as const, label: '7 ngày' },
                    { value: 30 as const, label: '30 ngày' },
                    { value: 90 as const, label: '90 ngày' },
                    { value: 365 as const, label: '1 năm' }
                ].map(period => (
                    <button
                        key={period.value}
                        onClick={() => setSelectedPeriod(period.value)}
                        className={selectedPeriod === period.value ? 'active' : ''}
                    >
                        {period.label}
                    </button>
                ))}
            </div>

            <div className="admin-stats-grid" style={{ marginBottom: 'var(--spacing-2xl)' }}>
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

            <div className="admin-charts-grid" style={{ marginBottom: 'var(--spacing-2xl)' }}>
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
                        gap: 'var(--spacing-xl)',
                        flexWrap: 'wrap'
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
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                Đã được duyệt
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                                Từ {overviewStats.totalApplications} đơn
                            </div>
                        </div>
                    </div>
                </ChartCard>
            </div>

            <div className="admin-charts-grid">
                <ChartCard
                    title="Người dùng theo vai trò"
                    subtitle="Phân bố theo loại tài khoản"
                    icon={<Users size={20} />}
                    color={COLORS.primary}
                >
                    <div className="chart-pie-container">
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
                                    marginBottom: 'var(--spacing-md)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
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

                <ChartCard
                    title="Việc làm theo trạng thái"
                    subtitle="Phân bố theo tình trạng"
                    icon={<Briefcase size={20} />}
                    color={COLORS.success}
                >
                    <div className="chart-pie-container">
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
                                    marginBottom: 'var(--spacing-md)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
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

                .admin-charts-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--spacing-xl);
                }
                @media (max-width: 1023px) {
                    .admin-charts-grid { grid-template-columns: 1fr; }
                }

                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: var(--spacing-lg);
                    flex-wrap: wrap;
                }
                @media (max-width: 767px) {
                    .admin-header { flex-direction: column; align-items: flex-start; }
                }

                .admin-period-selector button {
                    padding: var(--spacing-md) var(--spacing-lg);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--color-border);
                    background: white;
                    color: var(--color-text-secondary);
                    font-weight: 500;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all var(--transition-base);
                    white-space: nowrap;
                }
                .admin-period-selector button.active {
                    border: 2px solid var(--color-primary);
                    background: rgba(30, 136, 229, 0.08);
                    color: var(--color-primary);
                    font-weight: 700;
                    box-shadow: 0 4px 12px rgba(30, 136, 229, 0.2);
                }
                .admin-period-selector button:hover:not(.active) {
                    background: var(--color-border-light);
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

                .chart-pie-container {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xl);
                    height: 250px;
                }
                @media (max-width: 767px) {
                    .chart-pie-container {
                        flex-direction: column;
                        height: auto;
                    }
                    .chart-pie-container > .recharts-responsive-container {
                        width: 100% !important;
                        height: 200px !important;
                    }
                }
            `}</style>
        </div>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    change: number;
    color: string;
}

function StatCard({ icon, label, value, change, color }: StatCardProps) {
    return (
        <div className="stat-card-glass animate-fade-in-up"
            style={{
                padding: 'var(--spacing-xl)',
                borderRadius: 'var(--radius-2xl)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all var(--transition-base)',
                cursor: 'pointer'
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
                marginBottom: 'var(--spacing-lg)'
            }}>
                {icon}
            </div>
            <div style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 900, color: 'var(--color-text)', marginBottom: 'var(--spacing-xs)' }}>
                {value.toLocaleString()}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>{label}</span>
                <span style={{
                    padding: 'var(--spacing-xs) var(--spacing-md)',
                    borderRadius: 'var(--radius-full)',
                    background: change > 0 ? '#E8F5E9' : '#FFF3E0',
                    color: change > 0 ? '#43A047' : '#FB8C00',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                }}>
                    +{change}
                </span>
            </div>
        </div>
    );
}

interface ChartCardProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    children: React.ReactNode;
}

function ChartCard({ title, subtitle, icon, color, children }: ChartCardProps) {
    return (
        <div className="card animate-fade-in-up" style={{
            padding: 'var(--spacing-xl)',
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid var(--color-border)'
        }}>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        background: `${color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: color,
                        flexShrink: 0
                    }}>
                        {icon}
                    </div>
                    <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                        {title}
                    </h3>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0, paddingLeft: '3.25rem' }}>
                    {subtitle}
                </p>
            </div>
            {children}
        </div>
    );
}
