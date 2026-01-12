import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { FiEdit, FiTrash2, FiEye, FiUsers } from 'react-icons/fi';

export default function ManageJobsPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('creator_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setJobs(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa tin này?')) return;

        try {
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', id)
                .eq('creator_id', user?.id);

            if (error) throw error;
            fetchMyJobs();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="badge badge-success">Đã duyệt</span>;
            case 'rejected':
                return <span className="badge badge-error">Từ chối</span>;
            case 'closed':
                return <span className="badge" style={{ background: 'var(--color-text-secondary)' }}>Đã đóng</span>;
            default:
                return <span className="badge badge-warning">Chờ duyệt</span>;
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
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div>
                    <h1>Quản lý tin tuyển dụng</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Bạn có {jobs.length} tin tuyển dụng
                    </p>
                </div>
                <Link to="/employer/jobs/create" className="btn btn-primary">
                    Đăng tin mới
                </Link>
            </div>

            {jobs.length === 0 ? (
                <div className="card text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                    <h3>Chưa có tin tuyển dụng nào</h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                        Bắt đầu đăng tin để tìm kiếm ứng viên
                    </p>
                    <Link to="/employer/jobs/create" className="btn btn-primary">
                        Đăng tin ngay
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1">
                    {jobs.map((job) => (
                        <div key={job.id} className="card animate-fade-in">
                            <div className="flex justify-between">
                                <div style={{ flex: 1 }}>
                                    <div className="flex items-center gap-md" style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <h3 style={{ marginBottom: 0 }}>{job.metadata.title}</h3>
                                        {getStatusBadge(job.status)}
                                    </div>

                                    <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                                                Lượt xem
                                            </p>
                                            <p style={{ fontWeight: 600, marginBottom: 0 }}>{job.view_count || 0}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                                                Ứng viên
                                            </p>
                                            <p style={{ fontWeight: 600, marginBottom: 0 }}>{job.applicants?.length || 0}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                                                Hạn nộp
                                            </p>
                                            <p style={{ fontWeight: 600, marginBottom: 0 }}>
                                                {new Date(job.deadline).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                                                Trạng thái
                                            </p>
                                            <p style={{ fontWeight: 600, marginBottom: 0 }}>
                                                {job.is_active ? 'Đang mở' : 'Đã đóng'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-sm">
                                        <Link to={`/jobs/${job.id}`} className="btn btn-sm btn-outline">
                                            <FiEye size={16} />
                                            Xem
                                        </Link>
                                        <Link to={`/employer/jobs/${job.id}/applicants`} className="btn btn-sm btn-outline">
                                            <FiUsers size={16} />
                                            Ứng viên ({job.applicants?.length || 0})
                                        </Link>
                                        <button className="btn btn-sm btn-outline">
                                            <FiEdit size={16} />
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(job.id)}
                                            className="btn btn-sm"
                                            style={{ background: 'var(--color-error)', color: 'white' }}
                                        >
                                            <FiTrash2 size={16} />
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
