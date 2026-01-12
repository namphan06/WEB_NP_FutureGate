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
                .eq('activity_type', 'saved');

            if (error) throw error;
            setSavedJobs(data || []);
        } catch (error) {
            console.error('Error fetching saved jobs:', error);
        } finally {
            setLoading(false);
        }
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
                <div className="grid grid-cols-2">
                    {savedJobs.map((activity) => {
                        const job = activity.jobs;
                        return (
                            <div key={activity.id} className="card animate-fade-in">
                                <div className="card-header">
                                    <div className="flex items-center justify-between">
                                        <Link to={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                                            <h4>{job.metadata.title}</h4>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                                {job.profiles?.full_name}
                                            </p>
                                        </Link>
                                        <button
                                            onClick={() => handleUnsave(activity.id)}
                                            className="btn btn-sm"
                                            style={{ background: 'var(--color-error)', color: 'white' }}
                                        >
                                            Bỏ lưu
                                        </button>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="flex flex-col gap-sm">
                                        <div className="flex items-center gap-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                            <FiMapPin size={16} />
                                            <span>{job.metadata.working_regions.join(', ')}</span>
                                        </div>
                                        <div className="flex items-center gap-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                            <FiDollarSign size={16} />
                                            <span>Thỏa thuận</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                        Lưu {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: vi })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
