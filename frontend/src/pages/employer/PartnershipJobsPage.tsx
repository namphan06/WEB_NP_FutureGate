import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FiLink, FiCheck, FiX, FiSearch, FiMapPin, FiClock, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PartnershipJob {
    id: string;
    created_at: string;
    school_id: string;
    company_id: string;
    company_status: 'pending' | 'accepted' | 'rejected';
    admin_status: 'pending' | 'approved' | 'rejected';
    metadata: {
        title: string;
        salary: {
            min?: number;
            max?: number;
            is_negotiable: boolean;
        };
        working_regions: string[];
        job_description: string[];
    };
    school?: {
        full_name: string;
        avatar_url: string;
    };
}

export default function EmployerPartnershipsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'invitations' | 'active'>('invitations');
    const [jobs, setJobs] = useState<PartnershipJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

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
                .eq('company_id', user.id);

            if (activeTab === 'invitations') {
                query = query.eq('company_status', 'pending');
            } else {
                query = query.eq('company_status', 'accepted');
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch school profiles
            const schoolIds = [...new Set(data?.map(j => j.school_id) || [])];
            if (schoolIds.length > 0) {
                const { data: schools } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
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

    const handleAction = async (jobId: string, status: 'accepted' | 'rejected') => {
        setActionLoading(jobId);
        try {
            const { error } = await supabase
                .from('school_partnership_jobs')
                .update({
                    company_status: status,
                    company_reviewed_at: new Date().toISOString()
                })
                .eq('id', jobId);

            if (error) throw error;

            // Re-fetch or remove from local state
            setJobs(prev => prev.filter(j => j.id !== jobId));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.metadata.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.school?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatSalary = (salary: PartnershipJob['metadata']['salary']) => {
        if (salary.is_negotiable) return 'Thỏa thuận';
        if (salary.min && salary.max) {
            return `${(salary.min / 1000000).toFixed(0)} - ${(salary.max / 1000000).toFixed(0)} triệu VNĐ`;
        }
        return 'Thỏa thuận';
    };

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '2.5rem 50px' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>Liên kết đối tác</h1>
                    <p style={{ color: '#64748B', fontSize: '1.1rem', margin: 0 }}>Quản lý nhu cầu tuyển dụng từ các trường đại học & đối tác</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', background: '#E2E8F0', padding: '0.5rem', borderRadius: '20px' }}>
                    <button
                        onClick={() => setActiveTab('invitations')}
                        style={{
                            padding: '0.75rem 1.5rem', borderRadius: '16px', border: 'none', fontWeight: 700, cursor: 'pointer',
                            background: activeTab === 'invitations' ? 'white' : 'transparent',
                            color: activeTab === 'invitations' ? 'var(--color-primary)' : '#64748B',
                            boxShadow: activeTab === 'invitations' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Lời mời mới ({activeTab === 'invitations' ? jobs.length : '...'})
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        style={{
                            padding: '0.75rem 1.5rem', borderRadius: '16px', border: 'none', fontWeight: 700, cursor: 'pointer',
                            background: activeTab === 'active' ? 'white' : 'transparent',
                            color: activeTab === 'active' ? 'var(--color-primary)' : '#64748B',
                            boxShadow: activeTab === 'active' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Việc đang liên kết
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="card" style={{ padding: '2rem', borderRadius: '32px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', background: 'white' }}>
                {/* Search & Filter */}
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <FiSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            type="text"
                            placeholder="Tìm đối tác hoặc tên công việc..."
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
                        <FiLink size={64} style={{ color: '#E2E8F0', marginBottom: '1.5rem' }} />
                        <h3 style={{ color: '#1E293B' }}>{activeTab === 'invitations' ? 'Không có lời mời nào' : 'Chưa có liên kết nào'}</h3>
                        <p style={{ color: '#64748B' }}>Các yêu cầu liên kết từ trường học sẽ xuất hiện tại đây.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
                        {filteredJobs.map(job => (
                            <div key={job.id} className="partnership-card" style={{
                                padding: '1.5rem',
                                borderRadius: '24px',
                                border: '1px solid #E2E8F0',
                                background: 'white',
                                transition: 'all 0.3s'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                            <FiLink size={24} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#6366F1', letterSpacing: '0.5px' }}>{job.school?.full_name || 'Trường đối tác'}</div>
                                            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#1E293B' }}>{job.metadata.title}</h3>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '6px 14px',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        background: job.admin_status === 'approved' ? '#ECFDF5' : '#FFFBEB',
                                        color: job.admin_status === 'approved' ? '#059669' : '#D97706'
                                    }}>
                                        {job.admin_status === 'approved' ? 'Admin đã duyệt' : 'Đang chờ Admin'}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748B', fontSize: '0.9rem' }}>
                                        <FiDollarSign style={{ color: '#10B981' }} /> {formatSalary(job.metadata.salary)}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748B', fontSize: '0.9rem' }}>
                                        <FiMapPin style={{ color: '#3B82F6' }} /> {job.metadata.working_regions?.[0] || 'N/A'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748B', fontSize: '0.9rem' }}>
                                        <FiCalendar /> {format(new Date(job.created_at), 'dd/MM/yyyy', { locale: vi })}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748B', fontSize: '0.9rem' }}>
                                        <FiClock /> Việc liên kết
                                    </div>
                                </div>

                                <div style={{ padding: '1rem', borderRadius: '16px', background: '#F8FAFC', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
                                    <strong>Mô tả ngắn:</strong> {job.metadata.job_description?.[0]?.substring(0, 100)}...
                                </div>

                                {activeTab === 'invitations' ? (
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button
                                            onClick={() => handleAction(job.id, 'accepted')}
                                            disabled={!!actionLoading}
                                            className="btn btn-primary"
                                            style={{ flex: 1, height: '48px', borderRadius: '12px', fontWeight: 700, gap: '0.5rem' }}
                                        >
                                            <FiCheck /> Chấp nhận
                                        </button>
                                        <button
                                            onClick={() => handleAction(job.id, 'rejected')}
                                            disabled={!!actionLoading}
                                            style={{ width: '48px', height: '48px', borderRadius: '12px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            <FiX size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <button className="btn btn-outline" style={{ width: '100%', height: '48px', borderRadius: '12px', fontWeight: 700 }}>
                                        Xem chi tiết
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .partnership-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.06);
                    border-color: #6366F1 !important;
                }
            `}</style>
        </div>
    );
}
