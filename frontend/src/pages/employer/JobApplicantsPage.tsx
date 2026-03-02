
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiArrowLeft, FiFilter, FiUser, FiFileText, FiCheck, FiX, FiTrash2, FiClock } from 'react-icons/fi';

// Database uses snake_case
interface ApplicantDB {
    user_id: string;
    cv_id: string;
    applied_at: string;
    status: string;
}

// Display uses camelCase
interface Applicant {
    userId: string;
    cvId: string;
    appliedAt: string;
    status: string;
}

interface Profile {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
}

export default function JobApplicantsPage() {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();

    const [job, setJob] = useState<any>(null);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [profiles, setProfiles] = useState<Record<string, Profile>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        if (jobId) {
            fetchJobAndApplicants();
        }
    }, [jobId]);

    const fetchJobAndApplicants = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching job with ID:', jobId);

            // 1. Fetch Job
            const { data: jobData, error: jobError } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', jobId)
                .single();

            console.log('Job query result:', { jobData, jobError });

            if (jobError) {
                console.error('Job error details:', jobError);
                throw new Error(`Lỗi tải công việc: ${jobError.message}`);
            }

            if (!jobData) {
                throw new Error('Không tìm thấy công việc');
            }

            setJob(jobData);

            // Parse applicants - transform from DB format (snake_case) to app format (camelCase)
            const appsDB: ApplicantDB[] = Array.isArray(jobData.applicants) ? jobData.applicants : [];
            const apps: Applicant[] = appsDB.map(app => ({
                userId: app.user_id,
                cvId: app.cv_id,
                appliedAt: app.applied_at,
                status: app.status
            }));
            console.log('Parsed applicants:', apps);
            setApplicants(apps);

            // 2. Fetch Profiles for all applicants
            if (apps.length > 0) {
                const userIds = apps.map(a => a.userId);
                console.log('Fetching profiles for user IDs:', userIds);

                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, phone, avatar_url')
                    .in('id', userIds);

                console.log('Profile query result:', { profileData, profileError });

                if (profileError) {
                    console.error('Profile error details:', profileError);
                    throw new Error(`Lỗi tải thông tin ứng viên: ${profileError.message}`);
                }

                const profileMap: Record<string, Profile> = {};
                profileData?.forEach(p => {
                    profileMap[p.id] = p;
                });
                setProfiles(profileMap);
                console.log('Profile map created:', profileMap);
            }
        } catch (error: any) {
            console.error('Error fetching applicants:', error);
            setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (userId: string, newStatus: string) => {
        try {
            // Update the applicants array in the jobs table
            const updatedApplicants = applicants.map(app => {
                if (app.userId === userId) {
                    return { ...app, status: newStatus };
                }
                return app;
            });

            // Transform back to DB format (snake_case)
            const updatedApplicantsDB: ApplicantDB[] = updatedApplicants.map(app => ({
                user_id: app.userId,
                cv_id: app.cvId,
                applied_at: app.appliedAt,
                status: app.status
            }));

            const { error } = await supabase
                .from('jobs')
                .update({ applicants: updatedApplicantsDB })
                .eq('id', jobId);

            if (error) throw error;

            setApplicants(updatedApplicants);
            alert(`Đã cập nhật trạng thái thành ${getStatusText(newStatus)}`);

            // Note: In a real app, you would also notify the candidate here
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        }
    };

    const deleteApplicant = async (userId: string) => {
        if (!confirm('Bạn có chắc muốn xóa ứng viên này khỏi danh sách?')) return;

        try {
            const updatedApplicants = applicants.filter(app => app.userId !== userId);

            // Transform back to DB format (snake_case)
            const updatedApplicantsDB: ApplicantDB[] = updatedApplicants.map(app => ({
                user_id: app.userId,
                cv_id: app.cvId,
                applied_at: app.appliedAt,
                status: app.status
            }));

            const { error } = await supabase
                .from('jobs')
                .update({ applicants: updatedApplicantsDB })
                .eq('id', jobId);

            if (error) throw error;

            setApplicants(updatedApplicants);
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'var(--color-warning)';
            case 'viewed': return 'var(--color-info)';
            case 'accepted': return 'var(--color-success)';
            case 'hired': return '#10B981';
            case 'rejected': return 'var(--color-error)';
            default: return 'var(--color-text-secondary)';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'Chờ duyệt CV';
            case 'viewed': return 'Đã xem';
            case 'accepted': return 'Đang đánh giá';
            case 'hired': return 'Trúng tuyển';
            case 'rejected': return 'Từ chối';
            default: return status;
        }
    };

    const filteredApplicants = applicants.filter(app => {
        if (statusFilter === 'All') return true;
        return app.status.toLowerCase() === statusFilter.toLowerCase();
    });

    if (loading) {
        return (
            <div className="container section">
                <div className="loading text-center">Đang tải danh sách ứng viên...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container section">
                <div className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>⚠️</div>
                    <h2 style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-sm)' }}>Lỗi tải dữ liệu</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>{error}</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/employer/jobs')}
                    >
                        Quay lại quản lý tin
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container section">
            {/* Header */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <button
                    onClick={() => navigate('/employer/jobs')}
                    className="btn btn-sm btn-outline"
                    style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <FiArrowLeft size={16} />
                    Quay lại quản lý tin
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--spacing-lg)' }}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>Danh sách ứng viên</h1>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                            {job?.metadata?.title} • {applicants.length} hồ sơ
                        </p>
                    </div>

                    <div style={{ position: 'relative', minWidth: '200px' }}>
                        <select
                            className="form-input"
                            style={{ paddingRight: '2.5rem', width: '100%' }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">Tất cả trạng thái</option>
                            <option value="Pending">Chờ duyệt CV</option>
                            <option value="Accepted">Đang đánh giá</option>
                            <option value="Hired">Trúng tuyển</option>
                            <option value="Rejected">Từ chối</option>
                        </select>
                        <FiFilter style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-secondary)' }} />
                    </div>
                </div>
            </div>

            {/* List */}
            {filteredApplicants.length === 0 ? (
                <div className="card text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                    <FiUser size={48} style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)', opacity: 0.5 }} />
                    <h3>Không tìm thấy ứng viên nào</h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        {statusFilter === 'All' ? 'Chưa có ai ứng tuyển vào vị trí này.' : 'Không có ứng viên nào khớp với bộ lọc.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1" style={{ gap: 'var(--spacing-md)' }}>
                    {filteredApplicants.map((app) => {
                        const profile = profiles[app.userId];
                        if (!profile) return null;

                        return (
                            <div key={app.userId} className="card animate-fade-in" style={{ padding: 'var(--spacing-lg)' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-lg)' }}>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flex: 1 }}>
                                        {/* Avatar */}
                                        <div
                                            onClick={() => navigate(`/employer/candidates?search=${profile.full_name}`)}
                                            style={{
                                                width: '64px',
                                                height: '64px',
                                                borderRadius: '12px',
                                                background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'var(--color-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '1.5rem',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                flexShrink: 0
                                            }}
                                        >
                                            {!profile.avatar_url && (profile.full_name?.charAt(0) || 'U')}
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                                                <h3
                                                    style={{ marginBottom: 0, cursor: 'pointer' }}
                                                    onClick={() => navigate(`/employer/candidates?search=${profile.full_name}`)}
                                                >
                                                    {profile.full_name}
                                                </h3>
                                                <span className="badge" style={{
                                                    background: getStatusColor(app.status),
                                                    color: 'white',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    {getStatusText(app.status)}
                                                </span>
                                            </div>

                                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                                                {profile.email} {profile.phone && `• ${profile.phone}`}
                                            </p>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                                    <FiClock size={14} />
                                                    Ứng tuyển: {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', minWidth: '150px' }}>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            style={{ width: '100%', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                                            onClick={() => navigate(`/employer/cv/${app.cvId}?applicant=${app.userId}`)}
                                        >
                                            <FiFileText size={16} />
                                            Xem CV
                                        </button>

                                        {['pending', 'viewed'].includes(app.status.toLowerCase()) ? (
                                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                                <button
                                                    className="btn btn-sm"
                                                    style={{ flex: 1, background: 'var(--color-primary)', color: 'white' }}
                                                    onClick={() => updateStatus(app.userId, 'Accepted')}
                                                >
                                                    <FiCheck size={16} />
                                                    Duyệt CV
                                                </button>
                                                <button
                                                    className="btn btn-sm"
                                                    style={{ flex: 1, background: 'var(--color-error)', color: 'white' }}
                                                    onClick={() => updateStatus(app.userId, 'Rejected')}
                                                >
                                                    <FiX size={16} />
                                                    Từ chối
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn btn-sm"
                                                style={{ width: '100%', background: 'var(--color-background)', color: 'var(--color-text-secondary)' }}
                                                onClick={() => deleteApplicant(app.userId)}
                                            >
                                                <FiTrash2 size={16} />
                                                Xóa khỏi danh sách
                                            </button>
                                        )}
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
