import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { FiMapPin, FiDollarSign, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function SavedJobsPage() {
    const { user } = useAuth();
    const [savedJobs, setSavedJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const fetchSavedJobs = async () => {
        if (!user) return;

        try {
            setLoading(true);
            // Defensively fetch activities - removing the .eq('activity_type') to avoid SQL error if column is missing
            const { data: activities, error: activitiesError } = await supabase
                .from('user_job_activities')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (activitiesError) throw activitiesError;

            // Filter in memory to handle schema variations (activity_type vs type vs is_saved)
            const savedActivities = (activities || []).filter(a => {
                const type = a.activity_type || a.type || a.activity;
                return type === 'saved' || a.is_saved === true;
            });

            if (savedActivities.length > 0) {
                const jobIds = savedActivities.map(a => a.job_id);

                // Fetch jobs
                const { data: jobsData, error: jobsError } = await supabase
                    .from('jobs')
                    .select('*')
                    .in('id', jobIds);

                if (jobsError) throw jobsError;

                // Fetch profiles for these jobs
                const creatorIds = [...new Set(jobsData?.map(j => j.creator_id))];
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, full_name, company_name, avatar_url')
                    .in('id', creatorIds);

                // Combine data
                const enrichedActivities = savedActivities.map(activity => {
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
                }).filter(a => a.job); // Filter out activities where job might have been deleted

                setSavedJobs(enrichedActivities);
            } else {
                setSavedJobs([]);
            }
        } catch (error) {
            console.error('Error fetching saved jobs:', error);
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

    const handleUnsave = async (activityId: string) => {
        try {
            const { error } = await supabase
                .from('user_job_activities')
                .delete()
                .eq('id', activityId);

            if (error) throw error;
            fetchSavedJobs();
        } catch (error: any) {
            alert(error.message);
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
            <h1>Công việc đã lưu</h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
                {savedJobs.length} công việc đã được lưu
            </p>

            {savedJobs.length === 0 ? (
                <div className="card text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                    <h3>Chưa có công việc đã lưu</h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                        Lưu các công việc yêu thích để xem sau
                    </p>
                    <Link to="/jobs" className="btn btn-primary">
                        Khám phá công việc
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)' }}>
                    {savedJobs.map((activity) => {
                        const job = activity.job;
                        const employer = job.employer;
                        return (
                            <div key={activity.id} className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="card-header" style={{ paddingBottom: 'var(--spacing-md)' }}>
                                    <div className="flex items-center gap-md">
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: 'var(--radius-md)',
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
                                                <div style={{ width: '100%', height: '100%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                                    {employer?.company_name?.[0] || job.metadata.title?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <Link to={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <h4 style={{ marginBottom: '0.25rem', color: 'var(--color-primary)' }}>{job.metadata.title}</h4>
                                            </Link>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                                {employer?.company_name || 'Công ty tuyển dụng'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleUnsave(activity.id)}
                                            className="btn btn-sm btn-outline-primary"
                                            style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                                            title="Bỏ lưu"
                                        >
                                            Bỏ lưu
                                        </button>
                                    </div>
                                </div>

                                <div className="card-body" style={{ flex: 1 }}>
                                    <div className="flex flex-col gap-sm">
                                        <div className="flex items-center gap-sm" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                            <FiMapPin size={16} />
                                            <span>{job.metadata.working_regions?.join(', ')}</span>
                                        </div>
                                        <div className="flex items-center gap-sm" style={{ color: 'var(--color-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
                                            <FiDollarSign size={16} />
                                            <span>{formatSalary(job.metadata.salary)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer" style={{ borderTop: '0.5px solid var(--color-divider)', marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-sm)' }}>
                                    <div className="flex items-center gap-sm" style={{ fontSize: '0.8125rem', color: 'var(--color-text-light)' }}>
                                        <FiClock size={14} />
                                        <span>Đã lưu {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: vi })}</span>
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
