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
            const { data, error } = await supabase
                .from('user_job_activities')
                .select(`
          *,
          jobs (
            *,
            profiles:creator_id (
              full_name,
              avatar_url
            )
          )
        `)
                .eq('user_id', user.id)
                .eq('activity_type', 'applied')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAppliedJobs(data || []);
        } catch (error) {
            console.error('Error fetching applied jobs:', error);
        } finally {
            setLoading(false);
        }
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
                <div className="grid grid-cols-1">
                    {appliedJobs.map((activity) => {
                        const job = activity.jobs;
                        // Get status from job applicants array
                        const myApplication = job?.applicants?.find((app: any) => app.user_id === user?.id);
                        const status = myApplication?.status || 'pending';

                        return (
                            <div key={activity.id} className="card animate-fade-in">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-md" style={{ flex: 1 }}>
                                        {job.profiles?.avatar_url ? (
                                            <img
                                                src={job.profiles.avatar_url}
                                                alt={job.profiles.full_name}
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    borderRadius: 'var(--radius-lg)',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: 'var(--radius-lg)',
                                                background: 'var(--gradient-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.5rem',
                                                fontWeight: 'bold',
                                                color: 'white'
                                            }}>
                                                {job.profiles?.full_name?.[0]}
                                            </div>
                                        )}

                                        <div style={{ flex: 1 }}>
                                            <Link to={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <h4 style={{ marginBottom: '0.5rem' }}>{job.metadata.title}</h4>
                                            </Link>
                                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                                                {job.profiles?.full_name}
                                            </p>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                                Ứng tuyển {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: vi })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        {getStatusBadge(status)}
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
