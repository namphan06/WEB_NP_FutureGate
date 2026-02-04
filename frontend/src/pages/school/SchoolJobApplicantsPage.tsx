import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiArrowLeft, FiFilter, FiUser, FiFileText, FiCheck, FiX, FiTrash2, FiClock, FiSearch } from 'react-icons/fi';

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

export default function SchoolJobApplicantsPage() {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();

    const [job, setJob] = useState<any>(null);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [profiles, setProfiles] = useState<Record<string, Profile>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (jobId) {
            fetchJobAndApplicants();
        }
    }, [jobId]);

    const fetchJobAndApplicants = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Fetch Job
            const { data: jobData, error: jobError } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', jobId)
                .single();

            if (jobError) throw jobError;
            if (!jobData) throw new Error('Không tìm thấy công việc');

            setJob(jobData);

            // Parse applicants
            const appsDB: ApplicantDB[] = Array.isArray(jobData.applicants) ? jobData.applicants : [];
            const apps: Applicant[] = appsDB.map(app => ({
                userId: app.user_id,
                cvId: app.cv_id,
                appliedAt: app.applied_at,
                status: app.status
            }));
            setApplicants(apps);

            // 2. Fetch Profiles
            if (apps.length > 0) {
                const userIds = apps.map(a => a.userId);
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, phone, avatar_url')
                    .in('id', userIds);

                if (profileError) throw profileError;

                const profileMap: Record<string, Profile> = {};
                profileData?.forEach(p => {
                    profileMap[p.id] = p;
                });
                setProfiles(profileMap);
            }
        } catch (error: any) {
            console.error('Error fetching applicants:', error);
            setError(error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (userId: string, newStatus: string) => {
        try {
            const updatedApplicants = applicants.map(app => {
                if (app.userId === userId) {
                    return { ...app, status: newStatus };
                }
                return app;
            });

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
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        }
    };

    const deleteApplicant = async (userId: string) => {
        if (!confirm('Bạn có chắc muốn xóa ứng viên này?')) return;

        try {
            const updatedApplicants = applicants.filter(app => app.userId !== userId);
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

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return { bg: '#FEF3C7', color: '#B45309', label: 'Đang chờ' };
            case 'viewed': return { bg: '#E0F2FE', color: '#0369A1', label: 'Đã xem' };
            case 'accepted': return { bg: '#DCFCE7', color: '#15803D', label: 'Được nhận' };
            case 'rejected': return { bg: '#FEE2E2', color: '#B91C1C', label: 'Từ chối' };
            default: return { bg: '#F1F5F9', color: '#475569', label: status };
        }
    };

    const getStatusText = (status: string) => getStatusStyle(status).label;

    const filteredApplicants = applicants.filter(app => {
        const profile = profiles[app.userId];
        const matchesSearch = profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || app.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '2.5rem 50px' }}>
                <div className="loading text-center" style={{ marginTop: '5rem' }}>Đang tải danh sách ứng viên...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '2.5rem 50px' }}>
                <div style={{ textAlign: 'center', marginTop: '5rem' }}>
                    <h2>⚠️ Đã xảy ra lỗi</h2>
                    <p style={{ color: '#64748B', marginBottom: '2rem' }}>{error}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/school/jobs')}>Quay lại quản lý tin</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '2.5rem 50px' }}>
            {/* Header */}
            <div style={{ marginBottom: '3rem' }}>
                <button
                    onClick={() => navigate('/school/jobs')}
                    style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #E2E8F0', padding: '10px 18px', borderRadius: '14px', color: '#475569', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                >
                    <FiArrowLeft size={18} /> Quay lại quản lý tin
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                            Danh sách ứng viên
                        </h1>
                        <p style={{ color: '#64748B', fontSize: '1.1rem', margin: 0, fontWeight: 500 }}>
                            {job?.metadata?.title} • <span style={{ color: '#3B82F6' }}>{applicants.length} hồ sơ</span>
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <FiSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="text"
                                placeholder="Tìm tên hoặc email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', height: '52px', paddingLeft: '3.2rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.95rem', outline: 'none' }}
                            />
                        </div>
                        <select
                            style={{ height: '52px', padding: '0 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'white', fontSize: '1rem', fontWeight: 700, color: '#475569', cursor: 'pointer', outline: 'none' }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">Tất cả trạng thái</option>
                            <option value="Pending">Đang chờ</option>
                            <option value="Viewed">Đã xem</option>
                            <option value="Accepted">Được nhận</option>
                            <option value="Rejected">Từ chối</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List */}
            {filteredApplicants.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '6rem', background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0' }}>
                    <FiUser size={64} style={{ color: '#E2E8F0', marginBottom: '1.5rem' }} />
                    <h3 style={{ fontSize: '1.5rem', color: '#1E293B' }}>Không tìm thấy ứng viên nào</h3>
                    <p style={{ color: '#64748B' }}>Chưa có ai ứng tuyển hoặc không có ứng viên nào khớp với bộ lọc.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    {filteredApplicants.map((app) => {
                        const profile = profiles[app.userId];
                        if (!profile) return null;
                        const style = getStatusStyle(app.status);

                        return (
                            <div key={app.userId} className="applicant-card" style={{ padding: '1.8rem', borderRadius: '28px', background: 'white', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', transition: 'all 0.3s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                                    <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800 }}>
                                        {!profile.avatar_url && (profile.full_name?.charAt(0).toUpperCase() || 'U')}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#1E293B' }}>{profile.full_name}</h3>
                                            <span style={{ padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, background: style.bg, color: style.color, textTransform: 'uppercase' }}>
                                                {style.label}
                                            </span>
                                        </div>
                                        <p style={{ color: '#64748B', marginBottom: '10px', fontSize: '1rem' }}>{profile.email} • {profile.phone || 'Chưa cập nhật SĐT'}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94A3B8', fontSize: '0.85rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiClock size={14} /> Ứng tuyển: {new Date(app.appliedAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <button
                                        onClick={() => navigate(`/employer/cv/${app.cvId}?applicant=${app.userId}`)}
                                        style={{ height: '50px', padding: '0 1.5rem', borderRadius: '14px', border: '1px solid #3B82F6', background: 'white', color: '#3B82F6', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                                    >
                                        <FiFileText size={18} /> Xem Hồ sơ & CV
                                    </button>

                                    {['pending', 'viewed'].includes(app.status.toLowerCase()) ? (
                                        <>
                                            <button
                                                onClick={() => updateStatus(app.userId, 'Accepted')}
                                                style={{ height: '50px', padding: '0 1.5rem', borderRadius: '14px', border: 'none', background: '#10B981', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                                            >
                                                <FiCheck size={18} /> Chấp nhận
                                            </button>
                                            <button
                                                onClick={() => updateStatus(app.userId, 'Rejected')}
                                                style={{ height: '50px', padding: '0 1.5rem', borderRadius: '14px', border: 'none', background: '#EF4444', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                                            >
                                                <FiX size={18} /> Từ chối
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => deleteApplicant(app.userId)}
                                            style={{ height: '50px', width: '50px', borderRadius: '14px', border: 'none', background: '#F1F5F9', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            title="Xóa khỏi danh sách"
                                        >
                                            <FiTrash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                .applicant-card:hover {
                    box-shadow: 0 15px 40px rgba(0,0,0,0.06);
                    transform: translateY(-3px);
                    border-color: #3B82F6;
                }
            `}</style>
        </div>
    );
}
