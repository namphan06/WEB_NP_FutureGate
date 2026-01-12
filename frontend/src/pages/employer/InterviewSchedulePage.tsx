import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    FiCalendar,
    FiClock,
    FiBriefcase,
    FiSearch,
    FiChevronRight,
    FiFilter,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiMinusCircle,
    FiUser
} from 'react-icons/fi';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Interview {
    id: string;
    candidate_id: string;
    job_id: string;
    employer_id: string;
    cv_id?: string;
    interview_time: string;
    job_title: string;
    status: string;
    evaluation?: any;
    updated_at?: string;
}

interface CandidateProfile {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
}

export default function InterviewSchedulePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [candidateProfiles, setCandidateProfiles] = useState<Record<string, CandidateProfile>>({});

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, statusFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Interviews
            let query = supabase
                .from('interview_schedules')
                .select('*')
                .eq('employer_id', user?.id)
                .order('interview_time', { ascending: true });

            if (statusFilter !== 'All') {
                query = query.eq('status', statusFilter.toLowerCase());
            }

            const { data: interviewsData, error: interviewsError } = await query;

            if (interviewsError) throw interviewsError;
            setInterviews(interviewsData || []);

            // 2. Fetch Candidate Profiles
            const candidateIds = [...new Set((interviewsData || []).map(i => i.candidate_id))];
            if (candidateIds.length > 0) {
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, avatar_url')
                    .in('id', candidateIds);

                if (profilesError) throw profilesError;

                const profilesMap: Record<string, CandidateProfile> = {};
                (profilesData || []).forEach(p => {
                    profilesMap[p.id] = p;
                });
                setCandidateProfiles(profilesMap);
            }
        } catch (error: any) {
            console.error('Error fetching data:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('interview_schedules')
                .update({
                    status: newStatus.toLowerCase(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            setInterviews(prev => prev.map(i =>
                i.id === id ? { ...i, status: newStatus.toLowerCase() } : i
            ));
        } catch (error: any) {
            alert('Lỗi cập nhật trạng thái: ' + error.message);
        }
    };

    const getFilteredInterviews = () => {
        return interviews.filter(interview => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const candidate = candidateProfiles[interview.candidate_id];
                const matchesName = candidate?.full_name?.toLowerCase().includes(query);
                const matchesTitle = interview.job_title?.toLowerCase().includes(query);
                if (!matchesName && !matchesTitle) return false;
            }

            // Date range filter
            if (dateRange) {
                const time = parseISO(interview.interview_time);
                const start = startOfDay(parseISO(dateRange.start));
                const end = endOfDay(parseISO(dateRange.end));
                if (!isWithinInterval(time, { start, end })) return false;
            }

            return true;
        });
    };

    const groupInterviews = (filtered: Interview[]) => {
        const grouped: Record<string, Record<string, Interview[]>> = {};

        filtered.forEach(interview => {
            const dateKey = format(parseISO(interview.interview_time), 'yyyy-MM-dd');
            if (!grouped[dateKey]) grouped[dateKey] = {};

            const jobKey = interview.job_title;
            if (!grouped[dateKey][jobKey]) grouped[dateKey][jobKey] = [];

            grouped[dateKey][jobKey].push(interview);
        });

        return grouped;
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'scheduled':
                return <span className="badge" style={{ background: '#FFF4E5', color: '#B76E00', border: 'none', fontWeight: 600 }}>Sắp tới</span>;
            case 'completed':
                return <span className="badge" style={{ background: '#E6F4EA', color: '#1E7E34', border: 'none', fontWeight: 600 }}>Hoàn thành</span>;
            case 'postponed':
                return <span className="badge" style={{ background: '#FFF9E6', color: '#856404', border: 'none', fontWeight: 600 }}>Tạm hoãn</span>;
            case 'cancelled':
                return <span className="badge" style={{ background: '#FCE8E6', color: '#C5221F', border: 'none', fontWeight: 600 }}>Đã hủy</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'scheduled': return <FiClock style={{ color: '#B76E00' }} />;
            case 'completed': return <FiCheckCircle style={{ color: '#1E7E34' }} />;
            case 'postponed': return <FiAlertCircle style={{ color: '#856404' }} />;
            case 'cancelled': return <FiXCircle style={{ color: '#C5221F' }} />;
            default: return <FiMinusCircle />;
        }
    };

    const filteredInterviews = getFilteredInterviews();
    const groupedInterviews = groupInterviews(filteredInterviews);
    const sortedDates = Object.keys(groupedInterviews).sort();

    return (
        <div className="container section">
            {/* Page Header */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem', fontSize: '2.25rem', fontWeight: 800 }}>Lịch phỏng vấn</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', margin: 0 }}>
                        Quản lý các buổi phỏng vấn và đánh giá tiềm năng ứng viên
                    </p>
                </div>
            </div>

            {/* Premium Filters Bar */}
            <div className="card" style={{ marginBottom: '2.5rem', padding: '1.5rem', borderRadius: '20px', boxShadow: 'var(--shadow-md)' }}>
                <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '350px' }}>
                        <FiSearch style={{
                            position: 'absolute',
                            left: '1.25rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-secondary)',
                            fontSize: '1.1rem'
                        }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Tìm ứng viên, vị trí công việc..."
                            style={{ paddingLeft: '3rem', height: '52px', borderRadius: '12px', fontSize: '1rem' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{
                            background: 'var(--color-background)',
                            padding: '0 1rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            height: '52px',
                            border: '1px solid var(--color-border)'
                        }}>
                            <FiFilter style={{ color: 'var(--color-text-secondary)' }} />
                            <select
                                className="form-select"
                                style={{ border: 'none', background: 'transparent', width: 'auto', padding: '0 2rem 0 0', fontWeight: 600 }}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">Tất cả trạng thái</option>
                                <option value="Scheduled">Sắp tới</option>
                                <option value="Completed">Hoàn thành</option>
                                <option value="Postponed">Tạm hoãn</option>
                                <option value="Cancelled">Đã hủy</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{
                            background: 'var(--color-background)',
                            padding: '0 1rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            height: '52px',
                            border: '1px solid var(--color-border)'
                        }}>
                            <FiCalendar style={{ color: 'var(--color-text-secondary)' }} />
                            <input
                                type="date"
                                className="form-input"
                                style={{ border: 'none', background: 'transparent', width: 'auto', padding: 0 }}
                                onChange={(e) => setDateRange(prev => ({
                                    start: e.target.value,
                                    end: prev?.end || e.target.value
                                }))}
                            />
                            <span style={{ color: 'var(--color-text-light)', fontWeight: 500 }}>đến</span>
                            <input
                                type="date"
                                className="form-input"
                                style={{ border: 'none', background: 'transparent', width: 'auto', padding: 0 }}
                                onChange={(e) => setDateRange(prev => ({
                                    start: prev?.start || e.target.value,
                                    end: e.target.value
                                }))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="loading">Đang tải dữ liệu...</div>
                </div>
            ) : sortedDates.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '6rem 2rem', borderRadius: '24px' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        background: 'var(--color-background)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: 'var(--color-border)'
                    }}>
                        <FiCalendar size={48} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Không tìm thấy lịch phỏng vấn</h3>
                    <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0.5rem auto 0' }}>
                        Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm theo tên ứng viên khác.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {sortedDates.map(dateKey => {
                        const date = parseISO(dateKey);
                        const jobsMap = groupedInterviews[dateKey];

                        return (
                            <div key={dateKey}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.5rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                                        color: 'white',
                                        borderRadius: '14px',
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        boxShadow: '0 4px 12px rgba(30, 136, 229, 0.2)',
                                        textTransform: 'capitalize'
                                    }}>
                                        {format(date, 'EEEE, dd/MM/yyyy', { locale: vi })}
                                    </div>
                                    <div style={{ flex: 1, height: '2px', background: 'var(--color-divider)', opacity: 0.5 }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {Object.entries(jobsMap).map(([jobTitle, jobInterviews]) => (
                                        <div key={jobTitle} className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '20px', border: '1px solid var(--color-divider)' }}>
                                            <div style={{
                                                padding: '1.25rem 1.5rem',
                                                background: 'rgba(30, 136, 229, 0.03)',
                                                borderBottom: '1px solid var(--color-divider)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem'
                                            }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    background: 'white',
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'var(--color-primary)',
                                                    boxShadow: 'var(--shadow-sm)'
                                                }}>
                                                    <FiBriefcase size={18} />
                                                </div>
                                                <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 800 }}>{jobTitle}</h3>
                                                <span style={{
                                                    fontSize: '0.85rem',
                                                    color: 'var(--color-primary)',
                                                    background: 'rgba(30, 136, 229, 0.1)',
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontWeight: 700,
                                                    marginLeft: 'auto'
                                                }}>
                                                    {jobInterviews.length} ứng viên
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                {jobInterviews.map((interview, index) => {
                                                    const candidate = candidateProfiles[interview.candidate_id];
                                                    const time = parseISO(interview.interview_time);

                                                    return (
                                                        <div
                                                            key={interview.id}
                                                            style={{
                                                                padding: '1.25rem 1.5rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '2rem',
                                                                borderBottom: index === jobInterviews.length - 1 ? 'none' : '1px solid var(--color-divider)',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            className="interview-row"
                                                            onClick={() => navigate(`/employer/interviews/${interview.id}`)}
                                                        >
                                                            {/* Time Column */}
                                                            <div style={{ width: '120px' }}>
                                                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                                                                    {format(time, 'HH:mm')}
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    {getStatusIcon(interview.status)}
                                                                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                                                                        {getStatusBadge(interview.status)}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Vertical Line */}
                                                            <div style={{ width: '2px', height: '44px', background: 'var(--color-divider)', opacity: 0.6 }} />

                                                            {/* Candidate Info */}
                                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                                <div style={{
                                                                    width: '56px',
                                                                    height: '56px',
                                                                    borderRadius: '16px',
                                                                    background: 'var(--color-background)',
                                                                    color: 'var(--color-text-secondary)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontWeight: 800,
                                                                    fontSize: '1.5rem',
                                                                    overflow: 'hidden',
                                                                    border: '2px solid white',
                                                                    boxShadow: 'var(--shadow-sm)'
                                                                }}>
                                                                    {candidate?.avatar_url ? (
                                                                        <img src={candidate.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                    ) : (
                                                                        <FiUser size={24} />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '4px' }}>
                                                                        {candidate?.full_name || 'Ứng viên chưa rõ danh tính'}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                        <span>{candidate?.email || 'N/A'}</span>
                                                                        {interview.updated_at && (
                                                                            <>
                                                                                <span style={{ color: 'var(--color-divider)' }}>|</span>
                                                                                <span style={{ fontSize: '0.85rem' }}>Cập nhật: {format(parseISO(interview.updated_at), 'HH:mm dd/MM')}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Actions Panel */}
                                                            <div
                                                                style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
                                                                onClick={(e) => e.stopPropagation()} // Prevent row click
                                                            >
                                                                {interview.status !== 'completed' && (
                                                                    <button
                                                                        className="btn btn-primary btn-sm"
                                                                        style={{ height: '38px', padding: '0 1rem', borderRadius: '10px' }}
                                                                        onClick={() => handleUpdateStatus(interview.id, 'completed')}
                                                                    >
                                                                        Xong
                                                                    </button>
                                                                )}
                                                                <select
                                                                    className="form-select"
                                                                    style={{ width: 'auto', padding: '0 2rem 0 0.75rem', height: '38px', fontSize: '0.875rem', borderRadius: '10px', background: 'var(--color-background)' }}
                                                                    value={interview.status}
                                                                    onChange={(e) => handleUpdateStatus(interview.id, e.target.value)}
                                                                >
                                                                    <option value="scheduled">Sắp tới</option>
                                                                    <option value="completed">Hoàn thành</option>
                                                                    <option value="postponed">Tạm hoãn</option>
                                                                    <option value="cancelled">Đã hủy</option>
                                                                </select>
                                                                <button
                                                                    className="btn btn-outline btn-sm"
                                                                    style={{ width: '38px', height: '38px', padding: 0, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                    onClick={() => navigate(`/employer/interviews/${interview.id}`)}
                                                                >
                                                                    <FiChevronRight size={20} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                .interview-row:hover {
                    background-color: var(--color-hover) !important;
                    transform: translateX(4px);
                }
                .interview-row:hover .badge {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
}
