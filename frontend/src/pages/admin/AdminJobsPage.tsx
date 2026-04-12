import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { X, MapPin, Clock, Mail, Phone, DollarSign, Calendar, Search, Filter, Briefcase, Link as LinkIcon, Target, BarChart3, Gem, Tags } from 'lucide-react';
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
    metadata?: any;
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
    const [actionLoading, setActionLoading] = useState(false);

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
                        const { data: employer } = await supabase.from('profiles').select('*').eq('id', job.creator_id).single();
                        return {
                            ...job,
                            employer,
                            type: 'regular' as const,
                            title: job.metadata?.title || 'Untitled',
                            location: job.metadata?.work_locations?.[0] || job.metadata?.working_regions?.[0] || 'N/A',
                            salary_min: job.metadata?.salary?.min,
                            salary_max: job.metadata?.salary?.max,
                            description: job.metadata?.job_description?.join('\n') || 'N/A',
                            requirements: job.metadata?.candidate_requirements?.join('\n') || 'N/A'
                        };
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
                        return {
                            ...job,
                            school: schoolRes.data,
                            employer: employerRes.data,
                            type: 'partnership' as const,
                            status: job.admin_status,
                            title: job.metadata?.title || job.title || 'Untitled',
                            location: job.metadata?.work_locations?.[0] || job.metadata?.working_regions?.[0] || job.location || 'N/A',
                            salary_min: job.metadata?.salary?.min || job.salary_min,
                            salary_max: job.metadata?.salary?.max || job.salary_max,
                            description: job.metadata?.job_description?.join('\n') || job.description || 'N/A',
                            requirements: job.metadata?.candidate_requirements?.join('\n') || job.requirements || 'N/A'
                        };
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
        if (min && max) return `${min.toFixed(0)} - ${max.toFixed(0)} triệu VNĐ`;
        if (min) return `Từ ${min.toFixed(0)} triệu VNĐ`;
        if (max) return `Đến ${max.toFixed(0)} triệu VNĐ`;
        return 'Thỏa thuận';
    };

    return (
        <div className="admin-jobs-page" style={{ padding: 'var(--spacing-2xl)', minHeight: '100vh', background: 'var(--color-background-alt)' }}>
            <div className="admin-header">
                <div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--color-text)', marginBottom: 'var(--spacing-sm)' }}>Duyệt tin tuyển dụng</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', margin: 0 }}>Xác thực và phân phối nhu cầu tuyển dụng đến người dùng</p>
                </div>
                <div className="admin-tab-switcher">
                    <button
                        onClick={() => setActiveTab('regular')}
                        className={activeTab === 'regular' ? 'active' : ''}
                    >
                        Việc thông thường
                    </button>
                    <button
                        onClick={() => setActiveTab('partnership')}
                        className={activeTab === 'partnership' ? 'active' : ''}
                    >
                        Việc liên kết
                    </button>
                </div>
            </div>

            <div className="card animate-fade-in-up" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--color-border)', marginBottom: 'var(--spacing-2xl)', animationDelay: '100ms', animationFillMode: 'both' }}>
                <div className="admin-filter-controls">
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={18} style={{ position: 'absolute', left: 'var(--spacing-lg)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Tìm theo tiêu đề, công ty..."
                            style={{ paddingLeft: '3rem', height: '54px', borderRadius: 'var(--radius-lg)' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div style={{ width: '220px', position: 'relative', minWidth: '180px' }}>
                        <Filter size={18} style={{ position: 'absolute', left: 'var(--spacing-lg)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                        <select
                            className="form-select"
                            style={{ paddingLeft: '3rem', height: '54px', borderRadius: 'var(--radius-lg)', fontWeight: 600 }}
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

            {loading ? (
                <div className="admin-jobs-grid">
                    {[0, 1, 2, 3, 4, 5].map(idx => (
                        <div key={idx} className="card animate-fade-in-up" style={{ padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--color-border)', animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}>
                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <div className="skeleton" style={{ height: '20px', width: '60px', marginBottom: 'var(--spacing-xs)', borderRadius: 'var(--radius-sm)' }} />
                                    <div className="skeleton" style={{ height: '24px', width: '80%', borderRadius: 'var(--radius-sm)' }} />
                                </div>
                            </div>
                            <div className="skeleton" style={{ height: '64px', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--spacing-lg)' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                                {[0, 1, 2, 3].map(i => (
                                    <div key={i} className="skeleton" style={{ height: '24px', borderRadius: 'var(--radius-sm)' }} />
                                ))}
                            </div>
                            <div className="skeleton" style={{ height: '48px', borderRadius: 'var(--radius-md)' }} />
                        </div>
                    ))}
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-4xl)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--color-border)' }}>
                    <Briefcase size={60} style={{ color: 'var(--color-border)', marginBottom: 'var(--spacing-lg)', margin: '0 auto var(--spacing-lg)' }} />
                    <h3 style={{ color: 'var(--color-text)', marginBottom: 'var(--spacing-sm)' }}>Không tìm thấy tin nào</h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                </div>
            ) : (
                <div className="admin-jobs-grid">
                    {filteredJobs.map((job, idx) => (
                        <div
                            key={job.id}
                            onClick={() => { setSelectedJob(job); setShowDetailModal(true); }}
                            className="card hover-lift animate-fade-in-up"
                            style={{
                                padding: 'var(--spacing-xl)',
                                borderRadius: 'var(--radius-2xl)',
                                border: '1px solid var(--color-border)',
                                cursor: 'pointer',
                                position: 'relative',
                                animationDelay: `${idx * 60}ms`,
                                animationFillMode: 'both'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-lg)', gap: 'var(--spacing-md)' }}>
                                <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', minWidth: 0 }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', background: activeTab === 'regular' ? '#3B82F6' : '#8B5CF6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {activeTab === 'regular' ? <Briefcase size={24} /> : <LinkIcon size={24} />}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{
                                            padding: '4px 10px', borderRadius: 'var(--radius-sm)', display: 'inline-block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
                                            background: job.status === 'pending' ? '#FFFBEB' : job.status === 'approved' ? '#ECFDF5' : '#FEF2F2',
                                            color: job.status === 'pending' ? '#D97706' : job.status === 'approved' ? '#059669' : '#DC2626',
                                            marginBottom: '6px'
                                        }}>
                                            {job.status}
                                        </div>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{job.title}</h3>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-xl)', background: 'var(--color-background-alt)' }}>
                                <div style={{ fontWeight: 700, color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: 'var(--spacing-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    🏢 {job.employer?.company_name || job.employer?.full_name || 'Công ty ẩn danh'}
                                </div>
                                {activeTab === 'partnership' && (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                                        🎓 Liên kết qua: <span style={{ fontWeight: 600, color: '#8B5CF6' }}>{job.school?.full_name}</span>
                                    </div>
                                )}
                            </div>

                            <div className="admin-job-meta-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', color: 'var(--color-text-secondary)', fontSize: '0.9rem', minWidth: 0 }}>
                                    <MapPin size={16} style={{ color: '#3B82F6', flexShrink: 0 }} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.location || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                    <DollarSign size={16} style={{ color: '#10B981', flexShrink: 0 }} /> {formatSalary(job.salary_min, job.salary_max)}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                    <Calendar size={16} style={{ flexShrink: 0 }} /> {format(new Date(job.created_at), 'dd/MM/yyyy')}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                    <Clock size={16} style={{ flexShrink: 0 }} /> {job.type === 'regular' ? 'Full-time' : 'Liên kết'}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                                <button className="btn btn-outline" style={{ flex: 1, height: '48px', borderRadius: 'var(--radius-md)', minWidth: '100px' }}>Chi tiết</button>
                                {job.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleApprove(job); }}
                                            className="btn btn-primary"
                                            style={{ flex: 1, height: '48px', borderRadius: 'var(--radius-md)', minWidth: '100px' }}
                                            disabled={actionLoading}
                                        >
                                            Phê duyệt
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleReject(job); }}
                                            className="btn btn-outline"
                                            style={{ color: '#EF4444', borderColor: '#FEE2E2', background: '#FEF2F2', padding: '0 var(--spacing-md)', borderRadius: 'var(--radius-md)' }}
                                            disabled={actionLoading}
                                        >
                                            <X size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showDetailModal && selectedJob && (
                <div className="admin-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-xl)' }}>
                    <div className="admin-modal-content animate-scale-in" style={{ background: 'white', width: '100%', maxWidth: '900px', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ padding: 'var(--spacing-2xl)', background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)', color: 'white', position: 'relative' }}>
                            <button onClick={() => setShowDetailModal(false)} style={{ position: 'absolute', top: 'var(--spacing-xl)', right: 'var(--spacing-xl)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                            <div style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-sm)', display: 'inline-block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 'var(--spacing-md)', letterSpacing: '1px' }}>
                                {selectedJob.type.toUpperCase()}
                            </div>
                            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>{selectedJob.title}</h2>
                            <div className="admin-modal-meta" style={{ display: 'flex', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)', opacity: 0.8, fontSize: '1rem', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}><MapPin size={18} /> {selectedJob.location}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}><DollarSign size={18} /> {formatSalary(selectedJob.salary_min, selectedJob.salary_max)}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}><Calendar size={18} /> {format(new Date(selectedJob.created_at), 'dd/MM/yyyy')}</span>
                            </div>
                        </div>

                        <div style={{ padding: '0 var(--spacing-2xl) var(--spacing-2xl)', overflowY: 'auto' }}>
                            <div className="admin-modal-body">
                                <div>
                                    <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--spacing-md)' }}>Mô tả công việc</h3>
                                        <div style={{ lineHeight: 1.8, color: 'var(--color-text-secondary)', fontSize: '1.1rem', whiteSpace: 'pre-line' }}>{selectedJob.description}</div>
                                    </section>

                                    <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--spacing-md)' }}>Yêu cầu ứng viên</h3>
                                        <div style={{ lineHeight: 1.8, color: 'var(--color-text-secondary)', fontSize: '1.1rem', whiteSpace: 'pre-line' }}>{selectedJob.requirements}</div>
                                    </section>

                                    {selectedJob.metadata && (
                                        <>
                                            {selectedJob.metadata.fields && selectedJob.metadata.fields.length > 0 && (
                                                <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                        <Target size={24} style={{ color: '#3B82F6' }} /> Lĩnh vực
                                                    </h3>
                                                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                                                        {selectedJob.metadata.fields.map((field: string, idx: number) => (
                                                            <span key={idx} style={{
                                                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                                                borderRadius: 'var(--radius-md)',
                                                                background: 'rgba(59, 130, 246, 0.1)',
                                                                color: '#3B82F6',
                                                                fontSize: '0.9rem',
                                                                fontWeight: 600
                                                            }}>
                                                                {field}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </section>
                                            )}

                                            {selectedJob.metadata.experience_required && (
                                                <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                        <BarChart3 size={24} style={{ color: '#8B5CF6' }} /> Kinh nghiệm yêu cầu
                                                    </h3>
                                                    <div style={{
                                                        padding: 'var(--spacing-md) var(--spacing-lg)',
                                                        borderRadius: 'var(--radius-md)',
                                                        background: 'rgba(139, 92, 246, 0.1)',
                                                        color: '#8B5CF6',
                                                        fontSize: '1.1rem',
                                                        fontWeight: 600,
                                                        display: 'inline-block'
                                                    }}>
                                                        {selectedJob.metadata.experience_required}
                                                    </div>
                                                </section>
                                            )}

                                            {selectedJob.metadata.working_regions && selectedJob.metadata.working_regions.length > 0 && (
                                                <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                        <MapPin size={24} style={{ color: '#10B981' }} /> Khu vực làm việc
                                                    </h3>
                                                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                                                        {selectedJob.metadata.working_regions.map((region: string, idx: number) => (
                                                            <span key={idx} style={{
                                                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                                                borderRadius: 'var(--radius-md)',
                                                                background: 'rgba(16, 185, 129, 0.1)',
                                                                color: '#10B981',
                                                                fontSize: '0.9rem',
                                                                fontWeight: 600
                                                            }}>
                                                                📌 {region}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </section>
                                            )}

                                            {selectedJob.metadata.benefits && selectedJob.metadata.benefits.length > 0 && (
                                                <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                        <Gem size={24} style={{ color: '#3B82F6' }} /> Quyền lợi
                                                    </h3>
                                                    <ul style={{ paddingLeft: 'var(--spacing-lg)', margin: 0 }}>
                                                        {selectedJob.metadata.benefits.map((benefit: string, idx: number) => (
                                                            <li key={idx} style={{ lineHeight: 2, color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
                                                                {benefit}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </section>
                                            )}

                                            {selectedJob.metadata.requirements_tags && selectedJob.metadata.requirements_tags.length > 0 && (
                                                <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                        <Tags size={24} style={{ color: 'var(--color-text-secondary)' }} /> Tags
                                                    </h3>
                                                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                                                        {selectedJob.metadata.requirements_tags.map((tag: string, idx: number) => (
                                                            <span key={idx} style={{
                                                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                                                borderRadius: 'var(--radius-full)',
                                                                background: 'var(--color-border-light)',
                                                                color: 'var(--color-text-secondary)',
                                                                fontSize: '0.85rem',
                                                                fontWeight: 600,
                                                                border: '1px solid var(--color-border)'
                                                            }}>
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </section>
                                            )}

                                            {selectedJob.metadata.employment_types && selectedJob.metadata.employment_types.length > 0 && (
                                                <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--spacing-md)' }}>💼 Loại hình công việc</h3>
                                                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                                                        {selectedJob.metadata.employment_types.map((type: string, idx: number) => (
                                                            <span key={idx} style={{
                                                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                                                borderRadius: 'var(--radius-md)',
                                                                background: 'rgba(251, 140, 0, 0.1)',
                                                                color: '#FB8C00',
                                                                fontSize: '0.9rem',
                                                                fontWeight: 600
                                                            }}>
                                                                {type}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </section>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="admin-modal-sidebar">
                                    <div style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-2xl)', background: 'var(--color-background-alt)', border: '1px solid var(--color-border)' }}>
                                        <h4 style={{ margin: '0 0 var(--spacing-md) 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 700 }}>Đơn vị tuyển dụng</h4>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                            <div style={{ width: '54px', height: '54px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                                {selectedJob.employer?.avatar_url ? <img src={selectedJob.employer.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏢'}
                                            </div>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedJob.employer?.company_name || selectedJob.employer?.full_name}</div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}><Mail size={16} style={{ color: '#3B82F6', flexShrink: 0 }} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedJob.employer?.email}</span></div>
                                            {selectedJob.employer?.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}><Phone size={16} style={{ color: '#10B981', flexShrink: 0 }} /> {selectedJob.employer.phone}</div>}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                        <button onClick={() => handleApprove(selectedJob)} className="btn btn-primary" style={{ height: '56px', borderRadius: 'var(--radius-lg)', fontSize: '1.1rem', fontWeight: 800 }} disabled={actionLoading}>Phê duyệt ngay</button>
                                        <button onClick={() => handleReject(selectedJob)} className="btn btn-outline" style={{ height: '56px', borderRadius: 'var(--radius-lg)', color: '#EF4444', borderColor: '#FEE2E2', background: '#FEF2F2', fontWeight: 700 }} disabled={actionLoading}>Từ chối</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: var(--spacing-3xl);
                    gap: var(--spacing-lg);
                    flex-wrap: wrap;
                }
                @media (max-width: 767px) {
                    .admin-header { flex-direction: column; align-items: flex-start; }
                }

                .admin-tab-switcher {
                    display: flex;
                    gap: 'var(--spacing-xs)';
                    background: var(--color-border);
                    padding: var(--spacing-sm);
                    borderRadius: var(--radius-full);
                }
                .admin-tab-switcher button {
                    padding: var(--spacing-md) var(--spacing-lg);
                    border-radius: var(--radius-lg);
                    border: none;
                    font-weight: 700;
                    cursor: pointer;
                    background: transparent;
                    color: var(--color-text-secondary);
                    transition: all var(--transition-base);
                    white-space: nowrap;
                    font-size: 0.9rem;
                }
                .admin-tab-switcher button.active {
                    background: white;
                    color: var(--color-primary);
                    box-shadow: var(--shadow-sm);
                }
                .admin-tab-switcher button:hover:not(.active) {
                    background: rgba(255,255,255,0.5);
                }

                .admin-filter-controls {
                    display: flex;
                    gap: var(--spacing-lg);
                    align-items: center;
                    flex-wrap: wrap;
                }
                @media (max-width: 767px) {
                    .admin-filter-controls { flex-direction: column; align-items: stretch; }
                    .admin-filter-controls > * { width: 100% !important; }
                }

                .admin-jobs-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(min(100%, 400px), 1fr));
                    gap: var(--spacing-lg);
                }

                .admin-job-meta-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--spacing-md);
                }
                @media (max-width: 479px) {
                    .admin-job-meta-grid { grid-template-columns: 1fr; }
                }

                .admin-modal-overlay {
                    padding: var(--spacing-xl);
                }
                @media (max-width: 767px) {
                    .admin-modal-overlay { padding: var(--spacing-md); align-items: flex-start; }
                }

                .admin-modal-body {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: var(--spacing-2xl);
                    margin-top: var(--spacing-2xl);
                }
                @media (max-width: 1023px) {
                    .admin-modal-body { grid-template-columns: 1fr; }
                }

                .admin-modal-meta {
                    flex-wrap: wrap;
                }

                .admin-modal-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-xl);
                }

                .hover-lift:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.01);
                    border-color: var(--color-primary) !important;
                }
            `}</style>
        </div>
    );
}
