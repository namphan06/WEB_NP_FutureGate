import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function AppliedJobsPage() {
    const { user } = useAuth();
    const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppliedJobs();
    }, []);

    const fetchAppliedJobs = async () => {
        if (!user) return;

        try {
            setLoading(true);
            // Defensively fetch activities - removing the .eq('activity_type') to avoid SQL error
            const { data: activities, error: activitiesError } = await supabase
                .from('user_job_activities')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (activitiesError) throw activitiesError;

            // Filter in memory to handle schema variations (activity_type vs type vs is_applied)
            const appliedActivities = (activities || []).filter(a => {
                const type = a.activity_type || a.type || a.activity;
                return type === 'applied' || a.is_applied === true;
            });

            if (appliedActivities.length > 0) {
                const jobIds = appliedActivities.map(a => a.job_id);
                const { data: jobsData, error: jobsError } = await supabase
                    .from('jobs')
                    .select('*')
                    .in('id', jobIds);

                if (jobsError) throw jobsError;

                const creatorIds = [...new Set(jobsData?.map(j => j.creator_id))];
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, full_name, company_name, avatar_url')
                    .in('id', creatorIds);

                const enrichedActivities = appliedActivities.map(activity => {
                    const job = jobsData?.find(j => j.id === activity.job_id);
                    if (job) {
                        return {
                            ...activity,
                            job: {
                                ...job,
                                employer: profilesData?.find(p => p.id === job.creator_id)
                            }
                        };
                    }
                    return activity;
                }).filter(a => a.job);

                setAppliedJobs(enrichedActivities);
            } else {
                setAppliedJobs([]);
            }
        } catch (error) {
            console.error('Error fetching applied jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatSalary = (salary: any) => {
        if (!salary || salary.is_negotiable) return 'Thỏa thuận';
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return <span className="badge badge-success"><FiCheckCircle size={14} /> Đã duyệt</span>;
            case 'rejected':
                return <span className="badge badge-error"><FiXCircle size={14} /> Từ chối</span>;
            default:
                return <span className="badge badge-warning"><FiClock size={14} /> Chờ duyệt</span>;
        }
    };

    if (loading) {
        return (
            <div className="container section">
                <div className="loading text-center">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="container section">
            <h1>Lịch sử ứng tuyển</h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
                Bạn đã ứng tuyển {appliedJobs.length} công việc
            </p>

            {appliedJobs.length === 0 ? (
                <div className="card text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                    <FiAlertCircle size={64} style={{ color: 'var(--color-text-secondary)', margin: '0 auto var(--spacing-lg)' }} />
                    <h3>Chưa có đơn ứng tuyển nào</h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                        Bắt đầu ứng tuyển để tìm công việc mơ ước
                    </p>
                    <Link to="/jobs" className="btn btn-primary">
                        Tìm việc ngay
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1" style={{ gap: 'var(--spacing-md)' }}>
                    {appliedJobs.map((activity) => {
                        const job = activity.job;
                        const employer = job.employer;
                        // Get status from job applicants array
                        const myApplication = job?.applicants?.find((app: any) => app.user_id === user?.id);
                        const status = myApplication?.status || 'pending';

                        return (
                            <div key={activity.id} className="card animate-fade-in">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-md" style={{ flex: 1 }}>
                                        <div style={{
                                            width: '64px',
                                            height: '64px',
                                            borderRadius: 'var(--radius-lg)',
                                            background: 'var(--color-surface)',
                                            border: '1px solid var(--color-divider)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            flexShrink: 0
                                        }}>
                                            {employer?.avatar_url ? (
                                                <img
                                                    src={employer.avatar_url}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    background: 'var(--color-primary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.5rem',
                                                    fontWeight: 'bold',
                                                    color: 'white'
                                                }}>
                                                    {employer?.company_name?.[0] || job.metadata.title?.[0]}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <Link to={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <h4 style={{ marginBottom: '0.25rem', color: 'var(--color-primary)' }}>{job.metadata.title}</h4>
                                            </Link>
                                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)', fontWeight: 500 }}>
                                                {employer?.company_name || 'Công ty tuyển dụng'}
                                            </p>
                                            <div style={{ display: 'flex', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-sm)' }}>
                                                <span style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
                                                    {formatSalary(job.metadata.salary)}
                                                </span>
                                                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-light)' }}>
                                                    {job.metadata.working_regions?.[0]}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-light)', marginBottom: 0 }}>
                                                Ứng tuyển {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: vi })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                                            {getStatusBadge(status)}
                                        </div>
                                        <Link to={`/jobs/${job.id}`} className="btn btn-sm btn-outline-primary" style={{ fontSize: '0.75rem' }}>
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
