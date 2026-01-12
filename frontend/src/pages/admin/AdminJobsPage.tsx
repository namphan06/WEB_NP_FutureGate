import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FiX, FiMapPin, FiClock, FiMail, FiPhone, FiDollarSign, FiCalendar, FiSearch, FiFilter, FiBriefcase, FiLink } from 'react-icons/fi';
import { format } from 'date-fns';
import { Navigate } from 'react-router-dom';

interface Job {
    id: string;
    title: string;
    company_name?: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    status: string;
    admin_status?: string;
    created_at: string;
    employer_id?: string;
    school_id?: string;
    description?: string;
    requirements?: string;
    employer?: any;
    school?: any;
    type: 'regular' | 'partnership';
}

export default function AdminJobsPage() {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState<'regular' | 'partnership'>('regular');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false); // Using this for buttons below

    // Only admins can access
    if (profile?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        fetchJobs();
    }, [activeTab, statusFilter]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            if (activeTab === 'regular') {
                let query = supabase.from('jobs').select('*').order('created_at', { ascending: false });
                if (statusFilter !== 'all') query = query.eq('status', statusFilter);

                const { data: jobsData, error: jobsError } = await query;
                if (jobsError) throw jobsError;

                const jobsWithEmployer = await Promise.all(
                    (jobsData || []).map(async (job) => {
                        const { data: employer } = await supabase.from('profiles').select('*').eq('id', job.employer_id).single();
                        return { ...job, employer, type: 'regular' as const };
                    })
                );
                setJobs(jobsWithEmployer);
            } else {
                let query = supabase.from('school_partnership_jobs').select('*').order('created_at', { ascending: false });
                if (statusFilter !== 'all') query = query.eq('admin_status', statusFilter);

                const { data: partnershipData, error: partnershipError } = await query;
                if (partnershipError) throw partnershipError;

                const jobsWithInfo = await Promise.all(
                    (partnershipData || []).map(async (job) => {
                        const [schoolRes, employerRes] = await Promise.all([
                            supabase.from('profiles').select('*').eq('id', job.school_id).single(),
                            supabase.from('profiles').select('*').eq('id', job.employer_id).single()
                        ]);
                        return { ...job, school: schoolRes.data, employer: employerRes.data, type: 'partnership' as const, status: job.admin_status };
                    })
                );
                setJobs(jobsWithInfo);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (job: Job) => {
        setActionLoading(true);
        try {
            if (job.type === 'regular') {
                await supabase.from('jobs').update({ status: 'approved' }).eq('id', job.id);
            } else {
                await supabase.from('school_partnership_jobs').update({ admin_status: 'approved' }).eq('id', job.id);
            }
            alert('Đã duyệt tin thành công!');
            fetchJobs();
            setShowDetailModal(false);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (job: Job) => {
        if (!confirm('Bạn có chắc muốn từ chối tin này?')) return;
        setActionLoading(true);
        try {
            if (job.type === 'regular') {
                await supabase.from('jobs').update({ status: 'rejected' }).eq('id', job.id);
            } else {
                await supabase.from('school_partnership_jobs').update({ admin_status: 'rejected' }).eq('id', job.id);
            }
            alert('Đã từ chối tin!');
            fetchJobs();
            setShowDetailModal(false);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.employer?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.employer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatSalary = (min?: number, max?: number) => {
        if (!min && !max) return 'Thỏa thuận';
        if (min && max) return `${(min / 1000000).toFixed(0)} - ${(max / 1000000).toFixed(0)} triệu VNĐ`;
        return 'Thỏa thuận';
    };

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '2.5rem 50px' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>Duyệt tin tuyển dụng</h1>
                    <p style={{ color: '#64748B', fontSize: '1.1rem', margin: 0 }}>Xác thực và phân phối nhu cầu tuyển dụng đến người dùng</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', background: '#E2E8F0', padding: '0.5rem', borderRadius: '20px' }}>
                    <button
                        onClick={() => setActiveTab('regular')}
                        style={{
                            padding: '0.75rem 1.5rem', borderRadius: '16px', border: 'none', fontWeight: 700, cursor: 'pointer',
                            background: activeTab === 'regular' ? 'white' : 'transparent',
                            color: activeTab === 'regular' ? 'var(--color-primary)' : '#64748B',
                            boxShadow: activeTab === 'regular' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Việc thông thường
                    </button>
                    <button
                        onClick={() => setActiveTab('partnership')}
                        style={{
                            padding: '0.75rem 1.5rem', borderRadius: '16px', border: 'none', fontWeight: 700, cursor: 'pointer',
                            background: activeTab === 'partnership' ? 'white' : 'transparent',
                            color: activeTab === 'partnership' ? 'var(--color-primary)' : '#64748B',
                            boxShadow: activeTab === 'partnership' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Việc liên kết
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid #E2E8F0', marginBottom: '2.5rem', background: 'white' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <FiSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Tìm theo tiêu đề, công ty..."
                            style={{ paddingLeft: '3rem', height: '54px', borderRadius: '16px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div style={{ width: '220px', position: 'relative' }}>
                        <FiFilter style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <select
                            className="form-select"
                            style={{ paddingLeft: '3rem', height: '54px', borderRadius: '16px', fontWeight: 600 }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="pending">Chờ duyệt</option>
                            <option value="all">Tất cả trạng thái</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="rejected">Từ chối</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Jobs Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="loading">Đang tải danh sách tin tuyển dụng...</div>
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '5rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                    <FiBriefcase size={60} style={{ color: '#E2E8F0', marginBottom: '1.5rem' }} />
                    <h3 style={{ color: '#1E293B', marginBottom: '0.5rem' }}>Không tìm thấy tin nào</h3>
                    <p style={{ color: '#64748B' }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '1.5rem' }}>
                    {filteredJobs.map(job => (
                        <div
                            key={job.id}
                            onClick={() => { setSelectedJob(job); setShowDetailModal(true); }}
                            className="card hover-lift"
                            style={{ padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', position: 'relative' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: activeTab === 'regular' ? '#3B82F6' : '#8B5CF6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                        {activeTab === 'regular' ? <FiBriefcase /> : <FiLink />}
                                    </div>
                                    <div>
                                        <div style={{
                                            padding: '4px 10px', borderRadius: '8px', display: 'inline-block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
                                            background: job.status === 'pending' ? '#FFFBEB' : job.status === 'approved' ? '#ECFDF5' : '#FEF2F2',
                                            color: job.status === 'pending' ? '#D97706' : job.status === 'approved' ? '#059669' : '#DC2626',
                                            marginBottom: '6px'
                                        }}>
                                            {job.status}
                                        </div>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', lineHeight: 1.4 }}>{job.title}</h3>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem', padding: '1.25rem', borderRadius: '20px', background: '#F8FAFC' }}>
                                <div style={{ fontWeight: 700, color: '#475569', fontSize: '0.95rem', marginBottom: '8px' }}>
                                    🏢 {job.employer?.company_name || job.employer?.full_name || 'Công ty ẩn danh'}
                                </div>
                                {activeTab === 'partnership' && (
                                    <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        🎓 Liên kết qua: <span style={{ fontWeight: 600, color: '#8B5CF6' }}>{job.school?.full_name}</span>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748B', fontSize: '0.9rem' }}>
                                    <FiMapPin style={{ color: '#3B82F6' }} /> {job.location || 'N/A'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748B', fontSize: '0.9rem' }}>
                                    <FiDollarSign style={{ color: '#10B981' }} /> {formatSalary(job.salary_min, job.salary_max)}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748B', fontSize: '0.9rem' }}>
                                    <FiCalendar /> {format(new Date(job.created_at), 'dd/MM/yyyy')}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748B', fontSize: '0.9rem' }}>
                                    <FiClock /> {job.type === 'regular' ? 'Full-time' : 'Liên kết'}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button className="btn btn-outline" style={{ flex: 1, height: '48px', borderRadius: '12px' }}>Chi tiết</button>
                                {job.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleApprove(job); }}
                                            className="btn btn-primary"
                                            style={{ flex: 1, height: '48px', borderRadius: '12px' }}
                                            disabled={actionLoading}
                                        >
                                            Phê duyệt
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleReject(job); }}
                                            className="btn btn-outline"
                                            style={{ color: '#EF4444', borderColor: '#FEE2E2', background: '#FEF2F2', padding: '0 1rem', borderRadius: '12px' }}
                                            disabled={actionLoading}
                                        >
                                            <FiX size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal - Improved Design */}
            {showDetailModal && selectedJob && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '900px', borderRadius: '32px', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)', color: 'white', position: 'relative' }}>
                            <button onClick={() => setShowDetailModal(false)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                            <div style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', display: 'inline-block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '1px' }}>
                                {selectedJob.type.toUpperCase()}
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>{selectedJob.title}</h2>
                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', opacity: 0.8, fontSize: '1rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiMapPin /> {selectedJob.location}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiDollarSign /> {formatSalary(selectedJob.salary_min, selectedJob.salary_max)}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiCalendar /> {format(new Date(selectedJob.created_at), 'dd/MM/yyyy')}</span>
                            </div>
                        </div>

                        <div style={{ padding: '0 2.5rem 2.5rem', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', marginTop: '2.5rem' }}>
                                <div>
                                    <section style={{ marginBottom: '2.5rem' }}>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>Mô tả công việc</h3>
                                        <div style={{ lineHeight: 1.8, color: '#475569', fontSize: '1.1rem', whiteSpace: 'pre-line' }}>{selectedJob.description}</div>
                                    </section>
                                    <section>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>Yêu cầu ứng viên</h3>
                                        <div style={{ lineHeight: 1.8, color: '#475569', fontSize: '1.1rem', whiteSpace: 'pre-line' }}>{selectedJob.requirements}</div>
                                    </section>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div style={{ padding: '1.5rem', borderRadius: '24px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: '#64748B', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 700 }}>Đơn vị tuyển dụng</h4>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                                            <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                {selectedJob.employer?.avatar_url ? <img src={selectedJob.employer.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏢'}
                                            </div>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1E293B' }}>{selectedJob.employer?.company_name || selectedJob.employer?.full_name}</div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#475569' }}><FiMail style={{ color: '#3B82F6' }} /> {selectedJob.employer?.email}</div>
                                            {selectedJob.employer?.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#475569' }}><FiPhone style={{ color: '#10B981' }} /> {selectedJob.employer.phone}</div>}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <button onClick={() => handleApprove(selectedJob)} className="btn btn-primary" style={{ height: '56px', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 800 }} disabled={actionLoading}>Phê duyệt ngay</button>
                                        <button onClick={() => handleReject(selectedJob)} className="btn btn-outline" style={{ height: '56px', borderRadius: '16px', color: '#EF4444', borderColor: '#FEE2E2', background: '#FEF2F2', fontWeight: 700 }} disabled={actionLoading}>Từ chối</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .hover-lift:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.01);
                    border-color: var(--color-primary) !important;
                }
            `}</style>
        </div>
    );
}
