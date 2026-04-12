import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
    Link as LinkIcon,
    Check,
    X,
    Search,
    MapPin,
    Clock,
    Calendar,
    DollarSign,
    Mail,
    Phone,
    Target,
    BarChart3, Gem, Tags,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PartnershipJob {
    id: string;
    created_at: string;
    school_id: string;
    employer_id: string;
    company_status: 'pending' | 'accepted' | 'rejected';
    admin_status: 'pending' | 'approved' | 'rejected';
    company_rejection_reason?: string;
    company_reviewed_at?: string;
    metadata: {
        title: string;
        salary: {
            min?: number;
            max?: number;
            is_negotiable: boolean;
        };
        working_regions?: string[];
        work_locations?: string[];
        job_description?: string[];
        candidate_requirements?: string[];
        fields?: string[];
        experience_required?: string;
        benefits?: string[];
        requirements_tags?: string[];
        employment_types?: string[];
    };
    school?: {
        full_name: string;
        avatar_url: string;
        email?: string;
        phone?: string;
    };
}

export default function PartnershipJobsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected' | 'all'>('pending');
    const [jobs, setJobs] = useState<PartnershipJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<PartnershipJob | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchPartnershipJobs();
    }, [user, activeTab]);

    const fetchPartnershipJobs = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let query = supabase
                .from('school_partnership_jobs')
                .select('*')
                .eq('employer_id', user.id);

            if (activeTab !== 'all') {
                query = query.eq('company_status', activeTab);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch school profiles
            const schoolIds = [...new Set(data?.map(j => j.school_id) || [])];
            if (schoolIds.length > 0) {
                const { data: schools } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, email, phone')
                    .in('id', schoolIds);

                const enrichedJobs = data?.map(job => ({
                    ...job,
                    school: schools?.find(s => s.id === job.school_id)
                }));
                setJobs(enrichedJobs || []);
            } else {
                setJobs(data || []);
            }
        } catch (error) {
            console.error('Error fetching partnership jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (jobId: string, status: 'accepted' | 'rejected', reason?: string) => {
        setActionLoading(jobId);
        try {
            const updates: any = {
                company_status: status,
                company_reviewed_at: new Date().toISOString()
            };

            if (status === 'rejected' && reason) {
                updates.company_rejection_reason = reason;
            }

            const { error } = await supabase
                .from('school_partnership_jobs')
                .update(updates)
                .eq('id', jobId);

            if (error) throw error;

            // Close modals and refresh
            setShowDetailModal(false);
            setShowRejectModal(false);
            setRejectReason('');

            // Show success message
            alert(status === 'accepted'
                ? 'Đã chấp nhận yêu cầu. Tin sẽ được gửi đến admin để duyệt.'
                : 'Đã từ chối yêu cầu');

            fetchPartnershipJobs();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = (job: PartnershipJob) => {
        setSelectedJob(job);
        setShowDetailModal(false);
        setShowRejectModal(true);
    };

    const submitReject = () => {
        if (!selectedJob || !rejectReason.trim()) {
            alert('Vui lòng nhập lý do từ chối');
            return;
        }
        handleAction(selectedJob.id, 'rejected', rejectReason);
    };

    const filteredJobs = jobs.filter(job =>
        job.metadata.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.school?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatSalary = (salary: PartnershipJob['metadata']['salary']) => {
        if (salary.is_negotiable) return 'Thỏa thuận';
        const { min, max } = salary;
        if (min && max) return `${min.toFixed(0)} - ${max.toFixed(0)} triệu VNĐ`;
        if (min) return `Từ ${min.toFixed(0)} triệu VNĐ`;
        if (max) return `Đến ${max.toFixed(0)} triệu VNĐ`;
        return 'Thỏa thuận';
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: { text: 'Chờ duyệt', color: '#F59E0B', bg: '#FEF3C7', icon: Clock },
            accepted: { text: 'Đã chấp nhận', color: '#10B981', bg: '#D1FAE5', icon: Check },
            rejected: { text: 'Đã từ chối', color: '#EF4444', bg: '#FEE2E2', icon: X }
        };
        return badges[status as keyof typeof badges] || badges.pending;
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor(diff / (1000 * 60));

        if (days > 0) return `${days} ngày trước`;
        if (hours > 0) return `${hours} giờ trước`;
        if (minutes > 0) return `${minutes} phút trước`;
        return 'Vừa xong';
    };

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '2.5rem 50px' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>Yêu cầu từ nhà trường</h1>
                    <p style={{ color: '#64748B', fontSize: '1.1rem', margin: 0 }}>Xem và duyệt tin liên kết từ các trường đối tác</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', background: '#E2E8F0', padding: '0.5rem', borderRadius: '20px' }}>
                    <button
                        onClick={() => setActiveTab('pending')}
                        style={{
                            padding: '0.75rem 1.5rem', borderRadius: '16px', border: 'none', fontWeight: 700, cursor: 'pointer',
                            background: activeTab === 'pending' ? 'white' : 'transparent',
                            color: activeTab === 'pending' ? 'var(--color-primary)' : '#64748B',
                            boxShadow: activeTab === 'pending' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Chờ duyệt
                    </button>
                    <button
                        onClick={() => setActiveTab('accepted')}
                        style={{
                            padding: '0.75rem 1.5rem', borderRadius: '16px', border: 'none', fontWeight: 700, cursor: 'pointer',
                            background: activeTab === 'accepted' ? 'white' : 'transparent',
                            color: activeTab === 'accepted' ? 'var(--color-primary)' : '#64748B',
                            boxShadow: activeTab === 'accepted' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Đã chấp nhận
                    </button>
                    <button
                        onClick={() => setActiveTab('rejected')}
                        style={{
                            padding: '0.75rem 1.5rem', borderRadius: '16px', border: 'none', fontWeight: 700, cursor: 'pointer',
                            background: activeTab === 'rejected' ? 'white' : 'transparent',
                            color: activeTab === 'rejected' ? 'var(--color-primary)' : '#64748B',
                            boxShadow: activeTab === 'rejected' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Đã từ chối
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        style={{
                            padding: '0.75rem 1.5rem', borderRadius: '16px', border: 'none', fontWeight: 700, cursor: 'pointer',
                            background: activeTab === 'all' ? 'white' : 'transparent',
                            color: activeTab === 'all' ? 'var(--color-primary)' : '#64748B',
                            boxShadow: activeTab === 'all' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Tất cả
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="card" style={{ padding: '2rem', borderRadius: '32px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', background: 'white' }}>
                {/* Search */}
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            type="text"
                            placeholder="Tìm theo tiêu đề hoặc tên trường..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', height: '54px', paddingLeft: '3rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '1rem' }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem' }}>
                        <div className="loading">Đang tải danh sách...</div>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem' }}>
                        <LinkIcon size={64} style={{ color: '#E2E8F0', marginBottom: '1.5rem' }} />
                        <h3 style={{ color: '#1E293B' }}>
                            {activeTab === 'pending' ? 'Không có yêu cầu chờ duyệt' :
                                activeTab === 'accepted' ? 'Chưa chấp nhận yêu cầu nào' :
                                    activeTab === 'rejected' ? 'Chưa từ chối yêu cầu nào' : 'Không có yêu cầu nào'}
                        </h3>
                        <p style={{ color: '#64748B' }}>Các yêu cầu liên kết từ trường học sẽ xuất hiện tại đây.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
                        {filteredJobs.map(job => {
                            const badge = getStatusBadge(job.company_status);
                            const StatusIcon = badge.icon;

                            return (
                                <div key={job.id} className="partnership-card" style={{
                                    padding: '1.5rem',
                                    borderRadius: '24px',
                                    border: '1px solid #E2E8F0',
                                    background: 'white',
                                    transition: 'all 0.3s',
                                    cursor: 'pointer'
                                }} onClick={() => { setSelectedJob(job); setShowDetailModal(true); }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                                                <LinkIcon size={24} />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#8B5CF6', letterSpacing: '0.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {job.school?.full_name || 'Trường đối tác'}
                                                </div>
                                                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {job.metadata.title}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{
                                            padding: '8px 16px',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            background: badge.bg,
                                            color: badge.color,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <StatusIcon size={16} />
                                            {badge.text}
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748B', fontSize: '0.9rem' }}>
                                            <DollarSign size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {formatSalary(job.metadata.salary)}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748B', fontSize: '0.9rem' }}>
                                            <MapPin size={16} style={{ color: '#3B82F6', flexShrink: 0 }} />
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {job.metadata.working_regions?.[0] || job.metadata.work_locations?.[0] || 'N/A'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748B', fontSize: '0.9rem' }}>
                                            <Calendar size={16} style={{ flexShrink: 0 }} />
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {format(new Date(job.created_at), 'dd/MM/yyyy', { locale: vi })}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748B', fontSize: '0.9rem' }}>
                                            <Clock size={16} style={{ flexShrink: 0 }} />
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {getTimeAgo(job.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {job.company_status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleReject(job)}
                                                disabled={!!actionLoading}
                                                style={{ flex: 1, height: '48px', borderRadius: '12px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 700, gap: '0.5rem' }}
                                            >
                                                <X size={18} /> Từ chối
                                            </button>
                                            <button
                                                onClick={() => handleAction(job.id, 'accepted')}
                                                disabled={!!actionLoading}
                                                className="btn btn-primary"
                                                style={{ flex: 1, height: '48px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                            >
                                                <Check size={18} /> Chấp nhận
                                            </button>
                                        </div>
                                    )}

                                    {job.company_status === 'rejected' && job.company_rejection_reason && (
                                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FEE2E2' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#EF4444', fontWeight: 700, fontSize: '0.85rem' }}>
                                                <AlertCircle size={14} /> Lý do từ chối:
                                            </div>
                                            <p style={{ margin: 0, color: '#991B1B', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                                {job.company_rejection_reason}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {showRejectModal && selectedJob && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertCircle size={24} style={{ color: '#EF4444' }} />
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, color: '#1E293B' }}>Từ chối yêu cầu</h2>
                        </div>

                        <p style={{ color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                            Vui lòng cho biết lý do từ chối yêu cầu từ <strong>{selectedJob.school?.full_name}</strong>
                        </p>

                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Nhập lý do từ chối..."
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                padding: '1rem',
                                borderRadius: '16px',
                                border: '2px solid #E2E8F0',
                                fontSize: '1rem',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                marginBottom: '1.5rem'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                                style={{ flex: 1, height: '52px', background: '#F1F5F9', border: 'none', borderRadius: '14px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={submitReject}
                                disabled={!!actionLoading || !rejectReason.trim()}
                                style={{
                                    flex: 1,
                                    height: '52px',
                                    background: '#EF4444',
                                    border: 'none',
                                    borderRadius: '14px',
                                    fontWeight: 700,
                                    color: 'white',
                                    cursor: actionLoading || !rejectReason.trim() ? 'not-allowed' : 'pointer',
                                    opacity: actionLoading || !rejectReason.trim() ? 0.5 : 1
                                }}
                            >
                                {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal - Similar to existing implementation but with added rejection reason display */}
            {showDetailModal && selectedJob && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '900px', borderRadius: '32px', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: 'white', position: 'relative' }}>
                            <button onClick={() => setShowDetailModal(false)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={24} />
                            </button>
                            <div style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', display: 'inline-block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '1px' }}>
                                YÊU CẦU TỪ NHÀ TRƯỜNG
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>{selectedJob.metadata.title}</h2>
                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', opacity: 0.8, fontSize: '1rem', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={18} /> {selectedJob.metadata.working_regions?.[0] || selectedJob.metadata.work_locations?.[0] || 'N/A'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={18} /> {formatSalary(selectedJob.metadata.salary)}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={18} /> {format(new Date(selectedJob.created_at), 'dd/MM/yyyy')}</span>
                            </div>
                        </div>

                        <div style={{ padding: '0 2.5rem 2.5rem', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', marginTop: '2.5rem' }}>
                                <div>
                                    {selectedJob.metadata.job_description && selectedJob.metadata.job_description.length > 0 && (
                                        <section style={{ marginBottom: '2.5rem' }}>
                                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Target size={24} style={{ color: '#6366F1' }} /> Mô tả công việc
                                            </h3>
                                            <ul style={{ paddingLeft: '1.5rem', margin: 0, lineHeight: 2 }}>
                                                {selectedJob.metadata.job_description.map((desc, idx) => (
                                                    <li key={idx} style={{ color: '#475569', fontSize: '1.05rem' }}>{desc}</li>
                                                ))}
                                            </ul>
                                        </section>
                                    )}

                                    {selectedJob.metadata.candidate_requirements && selectedJob.metadata.candidate_requirements.length > 0 && (
                                        <section style={{ marginBottom: '2.5rem' }}>
                                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <BarChart3 size={24} style={{ color: '#14B8A6' }} /> Yêu cầu ứng viên
                                            </h3>
                                            <ul style={{ paddingLeft: '1.5rem', margin: 0, lineHeight: 2 }}>
                                                {selectedJob.metadata.candidate_requirements.map((req, idx) => (
                                                    <li key={idx} style={{ color: '#475569', fontSize: '1.05rem' }}>{req}</li>
                                                ))}
                                            </ul>
                                        </section>
                                    )}

                                    {selectedJob.metadata.benefits && selectedJob.metadata.benefits.length > 0 && (
                                        <section style={{ marginBottom: '2.5rem' }}>
                                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Gem size={24} style={{ color: '#F59E0B' }} /> Quyền lợi
                                            </h3>
                                            <ul style={{ paddingLeft: '1.5rem', margin: 0, lineHeight: 2 }}>
                                                {selectedJob.metadata.benefits.map((benefit, idx) => (
                                                    <li key={idx} style={{ color: '#475569', fontSize: '1.05rem' }}>{benefit}</li>
                                                ))}
                                            </ul>
                                        </section>
                                    )}

                                    {selectedJob.metadata.fields && selectedJob.metadata.fields.length > 0 && (
                                        <section style={{ marginBottom: '2.5rem' }}>
                                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Target size={24} style={{ color: '#EC4899' }} /> Lĩnh vực
                                            </h3>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {selectedJob.metadata.fields.map((field, idx) => (
                                                    <span key={idx} style={{ padding: '0.5rem 1rem', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899', fontSize: '0.9rem', fontWeight: 600 }}>
                                                        {field}
                                                    </span>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {selectedJob.metadata.requirements_tags && selectedJob.metadata.requirements_tags.length > 0 && (
                                        <section style={{ marginBottom: '2.5rem' }}>
                                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Tags size={24} style={{ color: '#64748B' }} /> Tags
                                            </h3>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {selectedJob.metadata.requirements_tags.map((tag, idx) => (
                                                    <span key={idx} style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: '#F1F5F9', color: '#475569', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #E2E8F0' }}>
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div style={{ padding: '1.5rem', borderRadius: '24px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: '#64748B', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 700 }}>Trường học đối tác</h4>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                                            <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: '#8B5CF6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                {selectedJob.school?.avatar_url ? <img src={selectedJob.school.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <LinkIcon size={24} />}
                                            </div>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1E293B' }}>{selectedJob.school?.full_name}</div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#475569' }}><Mail size={16} style={{ color: '#3B82F6' }} /> {selectedJob.school?.email || 'N/A'}</div>
                                            {selectedJob.school?.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#475569' }}><Phone size={16} style={{ color: '#10B981' }} /> {selectedJob.school.phone}</div>}
                                        </div>
                                    </div>

                                    {selectedJob.company_status === 'pending' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <button
                                                onClick={() => handleAction(selectedJob.id, 'accepted')}
                                                className="btn btn-primary"
                                                style={{ height: '56px', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 800 }}
                                                disabled={!!actionLoading}
                                            >
                                                Chấp nhận ngay
                                            </button>
                                            <button
                                                onClick={() => handleReject(selectedJob)}
                                                className="btn btn-outline"
                                                style={{ height: '56px', borderRadius: '16px', color: '#EF4444', borderColor: '#FEE2E2', background: '#FEF2F2', fontWeight: 700 }}
                                                disabled={!!actionLoading}
                                            >
                                                Từ chối
                                            </button>
                                        </div>
                                    )}

                                    {selectedJob.company_status === 'rejected' && selectedJob.company_rejection_reason && (
                                        <div style={{ padding: '1.5rem', background: '#FEF2F2', borderRadius: '16px', border: '1px solid #FEE2E2' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#EF4444', fontWeight: 700 }}>
                                                <AlertCircle size={18} /> Lý do từ chối
                                            </div>
                                            <p style={{ margin: 0, color: '#991B1B', lineHeight: 1.6 }}>
                                                {selectedJob.company_rejection_reason}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .partnership-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.06);
                    border-color: #8B5CF6 !important;
                }
                .loading {
                    color: #64748B;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}
