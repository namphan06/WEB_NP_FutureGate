import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FiFilter, FiUser, FiFileText, FiCheck, FiX, FiSearch, FiBriefcase, FiActivity, FiChevronDown, FiChevronUp, FiClock } from 'react-icons/fi';

interface ApplicantWithJob {
    userId: string;
    cvId: string;
    appliedAt: string;
    status: string;
    jobId: string;
    jobTitle: string;
    isPartnership: boolean;
    candidateName?: string;
    candidateEmail?: string;
    candidatePhone?: string;
    candidateAvatar?: string;
    evaluation?: {
        rating: number;
        position_rating: number;
        communication_rating: number;
        potential_rating: number;
        environment_rating: number;
        tags: string[];
    };
}

export default function PendingRecruitmentsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [applicants, setApplicants] = useState<ApplicantWithJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('accepted');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (user) {
            fetchAllApplicants();
        }
    }, [user]);

    const fetchAllApplicants = async () => {
        if (!user) return;
        try {
            setLoading(true);

            // 1. Fetch regular jobs
            const { data: jobs, error: jobsError } = await supabase
                .from('jobs')
                .select('id, metadata, applicants')
                .eq('creator_id', user.id);

            // 2. Fetch partnership jobs
            const { data: partnershipJobs } = await supabase
                .from('school_partnership_jobs')
                .select('id, metadata, applicants')
                .eq('employer_id', user.id)
                .eq('company_status', 'accepted'); // Only accepted partnerships

            if (jobsError) throw jobsError;

            const allApps: ApplicantWithJob[] = [];
            const userIdsSet = new Set<string>();

            // 3. Extract applicants from regular jobs
            jobs?.forEach(job => {
                const jobApplicants = Array.isArray(job.applicants) ? job.applicants : [];
                jobApplicants.forEach((app: any) => {
                    allApps.push({
                        userId: app.user_id,
                        cvId: app.cv_id,
                        appliedAt: app.applied_at,
                        status: app.status || 'pending',
                        jobId: job.id,
                        jobTitle: job.metadata?.title || 'Công việc không tên',
                        isPartnership: false
                    });
                    userIdsSet.add(app.user_id);
                });
            });

            // 4. Extract applicants from partnership jobs
            partnershipJobs?.forEach(job => {
                const jobApplicants = Array.isArray(job.applicants) ? job.applicants : [];
                jobApplicants.forEach((app: any) => {
                    allApps.push({
                        userId: app.user_id,
                        cvId: app.cv_id,
                        appliedAt: app.applied_at,
                        status: app.status || 'pending',
                        jobId: job.id,
                        jobTitle: job.metadata?.title || 'Công việc liên kết',
                        isPartnership: true
                    });
                    userIdsSet.add(app.user_id);
                });
            });

            // 5. Fetch candidate profiles
            if (userIdsSet.size > 0) {
                const [profilesRes, interviewsRes] = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('id, full_name, email, phone, avatar_url')
                        .in('id', Array.from(userIdsSet)),
                    supabase
                        .from('interview_schedules')
                        .select('*')
                        .eq('employer_id', user.id)
                ]);

                const profiles = profilesRes.data;
                const interviews = interviewsRes.data;

                allApps.forEach(app => {
                    // Attach profile
                    const profile = profiles?.find(p => p.id === app.userId);
                    if (profile) {
                        app.candidateName = profile.full_name;
                        app.candidateEmail = profile.email;
                        app.candidatePhone = profile.phone;
                        app.candidateAvatar = profile.avatar_url;
                    }

                    // Attach evaluation from interview
                    const interview = interviews?.find(i => i.candidate_id === app.userId && i.job_id === app.jobId);
                    if (interview?.evaluation) {
                        app.evaluation = {
                            rating: interview.evaluation.rating || 0,
                            position_rating: interview.evaluation.position_rating || 0,
                            communication_rating: interview.evaluation.communication_rating || 0,
                            potential_rating: interview.evaluation.potential_rating || 0,
                            environment_rating: interview.evaluation.environment_rating || 0,
                            tags: interview.evaluation.tags || []
                        };
                    }
                });
            }

            // Sort by latest applied
            allApps.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

            // Initialize expanded state for first few jobs
            const initialExpanded: Record<string, boolean> = {};
            const uniqueJobs = Array.from(new Set(allApps.map(a => a.jobId)));
            uniqueJobs.forEach((jid, idx) => {
                initialExpanded[jid] = idx < 3; // Expand first 3 jobs by default
            });
            setExpandedJobs(initialExpanded);

            setApplicants(allApps);

        } catch (error) {
            console.error('Error fetching applicants:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (app: ApplicantWithJob, newStatus: string) => {
        try {
            const table = app.isPartnership ? 'school_partnership_jobs' : 'jobs';

            // Find the job and update its applicants array
            const { data: jobData, error: fetchError } = await supabase
                .from(table)
                .select('applicants')
                .eq('id', app.jobId)
                .single();

            if (fetchError) throw fetchError;

            const currentApplicants = Array.isArray(jobData.applicants) ? jobData.applicants : [];
            const updatedApplicants = currentApplicants.map((a: any) => {
                if (a.user_id === app.userId) {
                    return { ...a, status: newStatus };
                }
                return a;
            });

            const { error: updateError } = await supabase
                .from(table)
                .update({ applicants: updatedApplicants })
                .eq('id', app.jobId);

            if (updateError) throw updateError;

            // Update local state
            setApplicants(prev => prev.map(a =>
                (a.userId === app.userId && a.jobId === app.jobId) ? { ...a, status: newStatus } : a
            ));
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        }
    };

    const filteredApplicants = applicants.filter(app => {
        const matchesStatus = statusFilter === 'All' || app.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesSearch = !searchTerm ||
            app.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Group by job
    const groupedJobs = filteredApplicants.reduce((acc, app) => {
        if (!acc[app.jobId]) {
            acc[app.jobId] = {
                title: app.jobTitle,
                isPartnership: app.isPartnership,
                apps: []
            };
        }
        acc[app.jobId].apps.push(app);
        return acc;
    }, {} as Record<string, { title: string; isPartnership: boolean; apps: ApplicantWithJob[] }>);

    const toggleJob = (jobId: string) => {
        setExpandedJobs(prev => ({ ...prev, [jobId]: !prev[jobId] }));
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'var(--color-warning)';
            case 'viewed': return 'var(--color-info)';
            case 'accepted': return 'var(--color-success)';
            case 'hired': return '#10B981'; // Green for hired
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

    if (loading) {
        return (
            <div className="section" style={{ padding: '0 2rem' }}>
                <div style={{
                    height: '60vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1.5rem'
                }}>
                    <div className="loading-spinner" style={{
                        width: '50px',
                        height: '50px',
                        border: '5px solid #E2E8F0',
                        borderTop: '5px solid var(--color-primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                        Đang phân tích dữ liệu ứng viên...
                    </div>
                </div>
                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    // Helper to render Radar Chart
    const RadarChart = ({ data, size = 120 }: { data: any, size?: number }) => {
        const points = [
            { key: 'position_rating', label: 'Chuyên môn' },
            { key: 'communication_rating', label: 'Giao tiếp' },
            { key: 'environment_rating', label: 'Văn hóa' },
            { key: 'potential_rating', label: 'Tiềm năng' },
            { key: 'rating_x2', label: 'Tổng quát' } // Mocking a 5th point for better radar shape
        ];

        const center = size / 2;
        const radius = size * 0.4;
        const angleStep = (Math.PI * 2) / points.length;

        const getCoords = (val: number, index: number) => {
            const r = (val / 10) * radius;
            const angle = index * angleStep - Math.PI / 2;
            return {
                x: center + r * Math.cos(angle),
                y: center + r * Math.sin(angle)
            };
        };

        // For Overall rating which is 0-5, we scale it to 10
        const values = [
            data.position_rating || 0,
            data.communication_rating || 0,
            data.environment_rating || 0,
            data.potential_rating || 0,
            (data.rating || 0) * 2
        ];

        const polygonPoints = values.map((v, i) => {
            const pos = getCoords(v, i);
            return `${pos.x},${pos.y}`;
        }).join(' ');

        return (
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} style={{ overflow: 'visible' }}>
                    {/* Background circles */}
                    {[0.2, 0.4, 0.6, 0.8, 1].map(r => (
                        <circle key={r} cx={center} cy={center} r={radius * r} fill="none" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2,2" />
                    ))}
                    {/* Axis lines */}
                    {points.map((_, i) => {
                        const pos = getCoords(10, i);
                        return <line key={i} x1={center} y1={center} x2={pos.x} y2={pos.y} stroke="#E2E8F0" strokeWidth="1" />;
                    })}
                    {/* The radar polygon */}
                    <polygon
                        points={polygonPoints}
                        fill="rgba(30, 136, 229, 0.2)"
                        stroke="var(--color-primary)"
                        strokeWidth="2"
                        style={{ pointerEvents: 'none' }}
                    />
                    {/* Point indicators */}
                    {values.map((v, i) => {
                        const pos = getCoords(v, i);
                        return <circle key={i} cx={pos.x} cy={pos.y} r="3" fill="var(--color-primary)" />;
                    })}
                </svg>
            </div>
        );
    };

    return (
        <div className="section" style={{ maxWidth: '100%', width: '100%', padding: '0 2rem' }}>
            {/* Premium Space Header */}
            <div style={{
                marginBottom: '1.5rem',
                padding: '2rem',
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                borderRadius: '32px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
                {/* Decorative element */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(30, 136, 229, 0.2) 0%, transparent 70%)',
                    borderRadius: '50%'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                                Recruitment Dashboard
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', fontWeight: 500 }}>
                                Phân tích & Đưa ra quyết định cuối cùng cho hồ sơ tiềm năng
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {[
                                { label: 'Chờ quyết định', val: applicants.filter(a => a.status === 'accepted').length, color: '#F59E0B' },
                                { label: 'Đã trúng tuyển', val: applicants.filter(a => a.status === 'hired').length, color: '#10B981' }
                            ].map((stat, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem 1.5rem', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: stat.color }}>{stat.val}</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <FiSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Tìm ứng viên hoặc vị trí..."
                                style={{
                                    paddingLeft: '3.5rem',
                                    borderRadius: '16px',
                                    height: '56px',
                                    fontSize: '1rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <select
                                className="form-input"
                                style={{
                                    borderRadius: '16px',
                                    height: '56px',
                                    paddingRight: '3.5rem',
                                    cursor: 'pointer',
                                    background: 'rgba(30, 136, 229, 0.1)',
                                    border: '1px solid rgba(30, 136, 229, 0.2)',
                                    color: 'white',
                                    appearance: 'none',
                                    fontWeight: 700
                                }}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">Tất cả trạng thái</option>
                                <option value="accepted">Chờ quyết định</option>
                                <option value="pending">Mới ứng tuyển</option>
                                <option value="hired">Đã trúng tuyển</option>
                                <option value="rejected">Đã từ chối</option>
                            </select>
                            <FiFilter style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'white', pointerEvents: 'none' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', height: '56px', fontWeight: 800, color: 'white', padding: '0 1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <FiUser style={{ marginRight: '8px' }} />
                            {filteredApplicants.length} ỨNG VIÊN
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            {filteredApplicants.length === 0 ? (
                <div style={{ padding: '8rem 2rem', textAlign: 'center', background: 'white', borderRadius: '32px', border: '1px dashed #E2E8F0' }}>
                    <div style={{ width: '100px', height: '100px', background: '#F8FAFC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: '#CBD5E1' }}>
                        <FiUser size={48} />
                    </div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1E293B' }}>Hệ thống đã sẵn sàng</h3>
                    <p style={{ color: '#64748B', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                        Hiện không có hồ sơ nào cần bạn xử lý dứt điểm dựa trên bộ lọc hiện tại.
                    </p>
                    <button onClick={() => navigate('/employer/jobs')} className="btn-creative-secondary" style={{ padding: '0.75rem 2rem', borderRadius: '14px', fontWeight: 700 }}>
                        Quản lý tin tuyển dụng
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '10rem' }}>
                    {Object.entries(groupedJobs).map(([jobId, group]) => (
                        <div key={jobId} className="job-cluster-v2">
                            <div
                                onClick={() => toggleJob(jobId)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    marginBottom: '1rem',
                                    padding: '1.5rem 2rem',
                                    background: group.isPartnership ? 'linear-gradient(90deg, #F5F3FF 0%, #EDE9FE 100%)' : '#FFFFFF',
                                    borderRadius: '24px',
                                    cursor: 'pointer',
                                    border: '1px solid #E2E8F0',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative'
                                }}
                                className="job-header-card"
                            >
                                {group.isPartnership && (
                                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '6px', background: '#8B5CF6', borderRadius: '24px 0 0 24px' }} />
                                )}
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '18px',
                                    background: group.isPartnership ? '#8B5CF6' : 'var(--color-primary)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: `0 8px 16px ${group.isPartnership ? 'rgba(139, 92, 246, 0.3)' : 'rgba(30, 136, 229, 0.3)'}`
                                }}>
                                    <FiBriefcase size={28} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '4px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#1E293B' }}>{group.title}</h3>
                                        {group.isPartnership && (
                                            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'white', background: '#8B5CF6', padding: '4px 12px', borderRadius: '10px' }}>
                                                LIÊN KẾT ĐÀO TẠO
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span>{group.apps.length} ứng viên đang xét duyệt</span>
                                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#CBD5E1' }} />
                                        <span style={{ color: 'var(--color-primary)' }}>Độ lọc: {Math.round((group.apps.filter(a => a.status === 'accepted').length / group.apps.length) * 100 || 0)}% tiềm năng</span>
                                    </div>
                                </div>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    background: '#F1F5F9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#64748B'
                                }}>
                                    {expandedJobs[jobId] ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
                                </div>
                            </div>

                            {expandedJobs[jobId] && (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
                                    gap: '1rem',
                                    animation: 'slideDown 0.4s ease-out'
                                }}>
                                    {group.apps.map((app, index) => (
                                        <div
                                            key={`${app.userId}-${index}`}
                                            className="candidate-creative-card"
                                            style={{
                                                padding: '2rem',
                                                borderRadius: '30px',
                                                background: 'white',
                                                border: '1px solid #F1F5F9',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '1.5rem',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                                {/* Profile Mini Section */}
                                                <div style={{ position: 'relative' }}>
                                                    <div style={{
                                                        width: '85px',
                                                        height: '85px',
                                                        borderRadius: '24px',
                                                        background: 'var(--color-primary)',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 8px 20px rgba(30, 136, 229, 0.2)',
                                                        border: '4px solid white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '2rem',
                                                        fontWeight: 900
                                                    }}>
                                                        {app.candidateAvatar ? (
                                                            <img src={app.candidateAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            app.candidateName?.charAt(0) || 'U'
                                                        )}
                                                    </div>
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '-5px',
                                                        right: '-5px',
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        background: getStatusColor(app.status),
                                                        border: '4px solid white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white'
                                                    }}>
                                                        {app.status === 'hired' ? <FiCheck size={14} /> : (app.status === 'rejected' ? <FiX size={14} /> : <FiClock size={14} />)}
                                                    </div>
                                                </div>

                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1E293B', marginBottom: '6px' }}>{app.candidateName}</h4>
                                                    <div style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>
                                                        Applied: {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                                                    </div>
                                                    <div style={{
                                                        display: 'inline-flex',
                                                        padding: '6px 14px',
                                                        borderRadius: '12px',
                                                        background: `${getStatusColor(app.status)}15`,
                                                        color: getStatusColor(app.status),
                                                        fontSize: '0.75rem',
                                                        fontWeight: 800,
                                                        letterSpacing: '0.05em'
                                                    }}>
                                                        {getStatusText(app.status).toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Creative Visualization Section */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: '#F8FAFC',
                                                padding: '1.5rem',
                                                borderRadius: '24px',
                                                gap: '2rem'
                                            }}>
                                                {app.evaluation ? (
                                                    <>
                                                        <RadarChart data={app.evaluation} size={130} />
                                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <div style={{ textAlign: 'left' }}>
                                                                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F59E0B', lineHeight: 1 }}>{app.evaluation.rating}</div>
                                                                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Overall</div>
                                                                </div>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end' }}>
                                                                    {app.evaluation.tags?.slice(0, 2).map((tag, t) => (
                                                                        <span key={t} style={{ fontSize: '0.65rem', padding: '3px 8px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '6px', fontWeight: 700, color: '#64748B' }}>
                                                                            #{tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', padding: '10px 0', borderTop: '1px solid #F1F5F9' }}>
                                                                {[
                                                                    { label: 'CMôn', val: app.evaluation.position_rating, color: '#6366F1' },
                                                                    { label: 'GTiếp', val: app.evaluation.communication_rating, color: '#10B981' },
                                                                    { label: 'VHóa', val: app.evaluation.environment_rating, color: '#F59E0B' },
                                                                    { label: 'TNăng', val: app.evaluation.potential_rating, color: '#EC4899' }
                                                                ].map((m, i) => (
                                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>{m.label}</span>
                                                                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: m.color }}>{m.val}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div style={{ height: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', gap: '10px' }}>
                                                        <FiActivity size={32} style={{ opacity: 0.3 }} />
                                                        <span style={{ fontSize: '0.9rem', fontStyle: 'italic', fontWeight: 600 }}>Chưa phỏng vấn đánh giá</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Creative Actions */}
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button
                                                    onClick={() => navigate(`/employer/cv/${app.cvId}?applicant=${app.userId}`)}
                                                    className="btn-creative-secondary"
                                                    style={{ flex: 1, height: '54px', borderRadius: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                                >
                                                    <FiFileText size={20} /> XEM HỒ SƠ
                                                </button>

                                                {app.status === 'accepted' && (
                                                    <button
                                                        onClick={() => updateStatus(app, 'hired')}
                                                        className="btn-creative-primary"
                                                        style={{ flex: 1.2, height: '54px', borderRadius: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                                    >
                                                        <FiCheck size={20} strokeWidth={3} /> TUYỂN DỤNG
                                                    </button>
                                                )}

                                                {(app.status === 'hired' || app.status === 'rejected') && (
                                                    <button
                                                        onClick={() => updateStatus(app, app.status === 'hired' ? 'accepted' : 'pending')}
                                                        className="btn-creative-secondary"
                                                        style={{ width: '54px', height: '54px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title="Hoàn tác"
                                                    >
                                                        <FiClock size={20} />
                                                    </button>
                                                )}

                                                {(app.status === 'pending' || app.status === 'accepted') && (
                                                    <button
                                                        onClick={() => updateStatus(app, 'rejected')}
                                                        className="btn-creative-danger"
                                                        style={{ width: '54px', height: '54px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title="Từ chối"
                                                    >
                                                        <FiX size={24} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .job-header-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.08);
                    border-color: var(--color-primary);
                }

                .candidate-creative-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 25px 50px rgba(0,0,0,0.08);
                    border-color: rgba(30, 136, 229, 0.3);
                }

                .btn-creative-primary {
                    background: var(--color-primary);
                    color: white;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 10px 20px rgba(30, 136, 229, 0.2);
                }
                .btn-creative-primary:hover {
                    filter: brightness(1.1);
                    transform: scale(1.02);
                    box-shadow: 0 15px 25px rgba(30, 136, 229, 0.3);
                }

                .btn-creative-secondary {
                    background: #F1F5F9;
                    color: #475569;
                    border: 1px solid #E2E8F0;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .btn-creative-secondary:hover {
                    background: #E2E8F0;
                    color: #1E293B;
                }

                .btn-creative-danger {
                    background: #FFF1F2;
                    color: #EF4444;
                    border: 1px solid #FECDD3;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .btn-creative-danger:hover {
                    background: #EF4444;
                    color: white;
                    border-color: #EF4444;
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .job-cluster-v2 {
                    animation: slideDown 0.6s ease-out;
                }
            `}</style>
        </div>
    );
}
