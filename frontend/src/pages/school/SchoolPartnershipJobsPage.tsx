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
    BarChart3,
    Gem,
    Tags,
    Briefcase,
    AlertCircle,
    Building2,
    Shield
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
    company?: {
        full_name: string;
        avatar_url: string;
        email?: string;
        phone?: string;
    };
}

export default function SchoolPartnershipJobsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected' | 'all'>('accepted');
    const [jobs, setJobs] = useState<PartnershipJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJob, setSelectedJob] = useState<PartnershipJob | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

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
                .eq('school_id', user.id);

            if (activeTab !== 'all') {
                query = query.eq('company_status', activeTab);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            const employerIds = [...new Set(data?.map(j => j.employer_id) || [])];
            if (employerIds.length > 0) {
                const { data: companies } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, email, phone')
                    .in('id', employerIds);

                const enrichedJobs = data?.map(job => ({
                    ...job,
                    company: companies?.find(c => c.id === job.employer_id)
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

    const filteredJobs = jobs.filter(job =>
        job.metadata.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatSalary = (salary: PartnershipJob['metadata']['salary']) => {
        if (!salary) return 'Thỏa thuận';
        if (salary.is_negotiable) return 'Thỏa thuận';
        const { min, max } = salary;
        if (min && max) return `${min} - ${max} triệu VNĐ`;
        if (min) return `Từ ${min} triệu VNĐ`;
        if (max) return `Đến ${max} triệu VNĐ`;
        return 'Thỏa thuận';
    };

    const getStatusStyle = (status: string, type: 'company' | 'admin') => {
        if (type === 'company') {
            switch (status) {
                case 'accepted':
                    return { text: 'Doanh nghiệp: Chấp nhận', color: '#10B981', bg: '#D1FAE5', icon: Check };
                case 'rejected':
                    return { text: 'Doanh nghiệp: Từ chối', color: '#EF4444', bg: '#FEE2E2', icon: X };
                default:
                    return { text: 'Doanh nghiệp: Đang chờ', color: '#F59E0B', bg: '#FEF3C7', icon: Clock };
            }
        } else {
            switch (status) {
                case 'approved':
                case 'accepted':
                    return { text: 'Hệ thống: Đã duyệt', color: '#3B82F6', bg: '#DBEAFE', icon: Shield };
                case 'rejected':
                    return { text: 'Hệ thống: Từ chối', color: '#EF4444', bg: '#FEE2E2', icon: X };
                default:
                    return { text: 'Hệ thống: Đang chờ', color: '#94A3B8', bg: '#F1F5F9', icon: Clock };
            }
        }
    };

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '2.5rem 50px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>Tin tuyển dụng liên kết</h1>
                    <p style={{ color: '#64748B', fontSize: '1.1rem', margin: 0 }}>Theo dõi trạng thái kết nối từ Doanh nghiệp và phê duyệt từ Admin</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', background: '#E2E8F0', padding: '0.5rem', borderRadius: '20px' }}>
                    {['pending', 'accepted', 'rejected', 'all'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            style={{
                                padding: '0.75rem 1.5rem', borderRadius: '16px', border: 'none', fontWeight: 700, cursor: 'pointer',
                                background: activeTab === tab ? 'white' : 'transparent',
                                color: activeTab === tab ? 'var(--color-primary)' : '#64748B',
                                boxShadow: activeTab === tab ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab === 'pending' ? 'Đang chờ' : tab === 'accepted' ? 'Đã kết nối' : tab === 'rejected' ? 'Bị từ chối' : 'Tất cả'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: '2rem', borderRadius: '32px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', background: 'white' }}>
                <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                        type="text"
                        placeholder="Tìm theo tiêu đề hoặc công ty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', height: '54px', paddingLeft: '3rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '1rem' }}
                    />
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem' }} className="loading">Đang tải...</div>
                ) : filteredJobs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem' }}>
                        <Briefcase size={64} style={{ color: '#E2E8F0', marginBottom: '1.5rem' }} />
                        <h3 style={{ color: '#1E293B' }}>Không tìm thấy tin liên kết nào</h3>
                        <p style={{ color: '#64748B' }}>Các tin tuyển dụng từ doanh nghiệp liên kết với nhà trường sẽ hiện ở đây.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '2rem' }}>
                        {filteredJobs.map(job => {
                            const companyStatus = getStatusStyle(job.company_status, 'company');
                            const adminStatus = getStatusStyle(job.admin_status, 'admin');
                            const CompanyIcon = companyStatus.icon;
                            const AdminIcon = adminStatus.icon;

                            return (
                                <div key={job.id} onClick={() => { setSelectedJob(job); setShowDetailModal(true); }} style={{ padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0', background: 'white', transition: 'all 0.3s', cursor: 'pointer' }} className="partnership-card">
                                    <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {job.company?.avatar_url ? <img src={job.company.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building2 size={32} style={{ color: '#94A3B8' }} />}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3B82F6', marginBottom: '4px' }}>{job.company?.full_name}</div>
                                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1E293B' }}>{job.metadata.title}</h3>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                        <div style={{ padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, background: companyStatus.bg, color: companyStatus.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <CompanyIcon size={14} /> {companyStatus.text.toUpperCase()}
                                        </div>
                                        <div style={{ padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, background: adminStatus.bg, color: adminStatus.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <AdminIcon size={14} /> {adminStatus.text.toUpperCase()}
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '0.9rem' }}>
                                            <DollarSign size={16} /> {formatSalary(job.metadata.salary)}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '0.9rem' }}>
                                            <MapPin size={16} /> {job.metadata.working_regions?.[0] || 'Toàn quốc'}
                                        </div>
                                    </div>

                                    <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #F1F5F9', color: '#94A3B8', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Cập nhật {format(new Date(job.created_at), 'dd/MM/yyyy')}</span>
                                        <span style={{ fontWeight: 700, color: '#475569' }}>Chi tiết →</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showDetailModal && selectedJob && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '900px', borderRadius: '32px', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: 'white', position: 'relative' }}>
                            <button onClick={() => setShowDetailModal(false)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>{selectedJob.metadata.title}</h2>
                            <p style={{ margin: '1rem 0 0 0', opacity: 0.9, fontSize: '1.1rem', fontWeight: 600 }}>{selectedJob.company?.full_name}</p>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                {(() => {
                                    const cs = getStatusStyle(selectedJob.company_status, 'company');
                                    const as = getStatusStyle(selectedJob.admin_status, 'admin');
                                    return (
                                        <>
                                            <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <cs.icon size={16} /> {cs.text.toUpperCase()}
                                            </div>
                                            <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <as.icon size={16} /> {as.text.toUpperCase()}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                        <div style={{ padding: '2.5rem', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
                                <div>
                                    {selectedJob.metadata.job_description && selectedJob.metadata.job_description.length > 0 && (
                                        <section style={{ marginBottom: '2.5rem' }}>
                                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Target size={24} style={{ color: '#3B82F6' }} /> Mô tả công việc
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
                                                <BarChart3 size={24} style={{ color: '#10B981' }} /> Yêu cầu ứng viên
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

                                    {(selectedJob.metadata.fields || selectedJob.metadata.requirements_tags) && (
                                        <section style={{ marginBottom: '1.5rem' }}>
                                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Tags size={24} style={{ color: '#6366F1' }} /> Lĩnh vực & Kỹ năng
                                            </h3>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {selectedJob.metadata.fields?.map((field, idx) => (
                                                    <span key={`f-${idx}`} style={{ padding: '6px 14px', borderRadius: '10px', background: '#E0F2FE', color: '#0369A1', fontSize: '0.85rem', fontWeight: 700 }}>
                                                        {field}
                                                    </span>
                                                ))}
                                                {selectedJob.metadata.requirements_tags?.map((tag, idx) => (
                                                    <span key={`t-${idx}`} style={{ padding: '6px 14px', borderRadius: '10px', background: '#F1F5F9', color: '#475569', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #E2E8F0' }}>
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ background: '#F8FAFC', padding: '1.75rem', borderRadius: '24px', border: '1px solid #E2E8F0', height: 'fit-content' }}>
                                        <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Thông tin nhanh</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                                                    <DollarSign size={20} style={{ color: '#10B981' }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800 }}>MỨC LƯƠNG</div>
                                                    <div style={{ fontWeight: 800, color: '#1E293B' }}>{formatSalary(selectedJob.metadata.salary)}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                                                    <MapPin size={20} style={{ color: '#3B82F6' }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800 }}>ĐỊA ĐIỂM</div>
                                                    <div style={{ fontWeight: 800, color: '#1E293B' }}>{selectedJob.metadata.work_locations?.[0] || 'Toàn quốc'}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                                                    <Clock size={20} style={{ color: '#F59E0B' }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800 }}>KINH NGHIỆM</div>
                                                    <div style={{ fontWeight: 800, color: '#1E293B' }}>{selectedJob.metadata.experience_required || 'Không yêu cầu'}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                                                    <Briefcase size={20} style={{ color: '#8B5CF6' }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800 }}>HÌNH THỨC</div>
                                                    <div style={{ fontWeight: 800, color: '#1E293B' }}>{selectedJob.metadata.employment_types?.join(', ') || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ background: '#F1F5F9', padding: '1.5rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#3B82F6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Building2 size={24} />
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>ĐƠN VỊ ĐỐI TÁC</div>
                                            <div style={{ fontWeight: 800, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedJob.company?.full_name}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .partnership-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.06);
                    border-color: #3B82F6 !important;
                }
            `}</style>
        </div>
    );
}
