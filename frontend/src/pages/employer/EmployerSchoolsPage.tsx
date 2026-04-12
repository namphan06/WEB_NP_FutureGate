import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
    X, Search,
    School, Clock, CheckCircle, AlertCircle,
    MapPin, Calendar, DollarSign, Target, BarChart3, Gem, Tags,
    Mail, Phone, Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PartnershipRequest {
    id: string;
    school_id: string;
    company_id: string;
    company_status: 'pending' | 'accepted' | 'rejected';
    admin_status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
    metadata?: {
        title?: string;
        salary?: {
            min?: number;
            max?: number;
            is_negotiable?: boolean;
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
        avatar_url?: string;
        email?: string;
        phone?: string;
    };
}

export default function EmployerSchoolsPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<PartnershipRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
    const [selectedRequest, setSelectedRequest] = useState<PartnershipRequest | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch partnership requests from school_partnership_jobs table
            const { data, error } = await supabase
                .from('school_partnership_jobs')
                .select('*')
                .eq('company_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching requests:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
                return;
            }

            const allRequests = data as PartnershipRequest[];

            // Fetch school profiles
            const schoolIds = [...new Set(allRequests.map(r => r.school_id))];
            if (schoolIds.length > 0) {
                const { data: schoolsData, error: schoolsError } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, email, phone')
                    .in('id', schoolIds);

                if (!schoolsError && schoolsData) {
                    const profilesMap: Record<string, any> = {};
                    for (const profile of schoolsData) {
                        profilesMap[profile.id] = profile;
                    }

                    const enriched = allRequests.map(r => ({
                        ...r,
                        school: profilesMap[r.school_id] || {} as any,
                    }));
                    setRequests(enriched);
                } else {
                    setRequests(allRequests);
                }
            } else {
                setRequests(allRequests);
            }
        } catch (error) {
            console.error('Error in fetchData:', error);
        } finally {
            setLoading(false);
        }
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

    const formatSalary = (salary?: { min?: number; max?: number; is_negotiable?: boolean }) => {
        if (!salary || salary.is_negotiable) return 'Thỏa thuận';
        const { min, max } = salary;
        if (min && max) return `${min.toFixed(0)} - ${max.toFixed(0)} triệu VNĐ`;
        if (min) return `Từ ${min.toFixed(0)} triệu VNĐ`;
        if (max) return `Đến ${max.toFixed(0)} triệu VNĐ`;
        return 'Thỏa thuận';
    };

    const filteredRequests = requests.filter(r => {
        const matchesSearch =
            r.metadata?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.school?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.company_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const renderCard = (r: PartnershipRequest) => {
        const school = r.school || {};
        const metadata = r.metadata || {};

        return (
            <div
                key={r.id}
                className="partnership-item"
                style={{
                    padding: '1.5rem',
                    borderRadius: '24px',
                    border: '1px solid #E2E8F0',
                    background: 'white',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                }}
                onClick={() => { setSelectedRequest(r); setShowDetailModal(true); }}
            >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '18px',
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0
                    }}>
                        {(school as any).avatar_url ? (
                            <img src={(school as any).avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <School size={32} style={{ color: 'white' }} />
                        )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#8B5CF6', letterSpacing: '0.5px', marginBottom: '4px' }}>
                            {(school as any).full_name || 'Trường đối tác'}
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {metadata.title || 'Không có tiêu đề'}
                        </h3>
                        <p style={{ margin: '6px 0 0 0', color: '#94A3B8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={14} /> {getTimeAgo(r.created_at)}
                        </p>
                    </div>
                </div>

                {/* Timeline Progress */}
                <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Tiến độ xét duyệt
                    </h4>

                    <div style={{ position: 'relative' }}>
                        {/* Timeline Line */}
                        <div style={{
                            position: 'absolute',
                            left: '16px',
                            top: '32px',
                            bottom: '32px',
                            width: '2px',
                            background: r.company_status === 'accepted' && r.admin_status === 'approved' ? '#10B981' : r.company_status === 'accepted' ? '#F59E0B' : '#E2E8F0'
                        }} />

                        {/* Step 1: Company Approval */}
                        <div style={{ position: 'relative', paddingLeft: '3rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: '4px',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: r.company_status === 'accepted' ? '#10B981' : r.company_status === 'rejected' ? '#EF4444' : '#F59E0B',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                border: '3px solid white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                                {r.company_status === 'accepted' ? <CheckCircle size={18} /> : r.company_status === 'rejected' ? <X size={18} /> : <Clock size={18} />}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1E293B', marginBottom: '4px' }}>
                                    Doanh nghiệp xác thực
                                </div>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '4px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    background: r.company_status === 'accepted' ? '#D1FAE5' : r.company_status === 'rejected' ? '#FEE2E2' : '#FEF3C7',
                                    color: r.company_status === 'accepted' ? '#059669' : r.company_status === 'rejected' ? '#DC2626' : '#D97706'
                                }}>
                                    {r.company_status === 'accepted' ? 'Đã chấp nhận' : r.company_status === 'rejected' ? 'Đã từ chối' : 'Đang chờ'}
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Admin Approval */}
                        <div style={{ position: 'relative', paddingLeft: '3rem', opacity: r.company_status === 'accepted' ? 1 : 0.4 }}>
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: '4px',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: r.admin_status === 'approved' ? '#10B981' : r.admin_status === 'rejected' ? '#EF4444' : r.company_status === 'accepted' ? '#F59E0B' : '#E2E8F0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                border: '3px solid white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                                {r.admin_status === 'approved' ? <CheckCircle size={18} /> : r.admin_status === 'rejected' ? <X size={18} /> : r.company_status === 'accepted' ? <Clock size={18} /> : <AlertCircle size={18} />}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1E293B', marginBottom: '4px' }}>
                                    Admin phê duyệt
                                </div>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '4px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    background: r.admin_status === 'approved' ? '#D1FAE5' : r.admin_status === 'rejected' ? '#FEE2E2' : r.company_status === 'accepted' ? '#FEF3C7' : '#F1F5F9',
                                    color: r.admin_status === 'approved' ? '#059669' : r.admin_status === 'rejected' ? '#DC2626' : r.company_status === 'accepted' ? '#D97706' : '#94A3B8'
                                }}>
                                    {r.admin_status === 'approved' ? 'Đã chấp nhận' : r.admin_status === 'rejected' ? 'Đã từ chối' : r.company_status === 'accepted' ? 'Đang chờ' : 'Chưa xử lý'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Info */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.9rem', color: '#64748B' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {formatSalary(metadata.salary)}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} style={{ color: '#3B82F6', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {metadata.working_regions?.[0] || metadata.work_locations?.[0] || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '2.5rem 50px' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>Yêu cầu liên kết</h1>
                <p style={{ color: '#64748B', fontSize: '1.1rem', margin: 0 }}>Danh sách yêu cầu liên kết từ các trường đối tác</p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                        type="text"
                        placeholder="Tìm theo tiêu đề hoặc tên trường..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', height: '54px', paddingLeft: '3rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'white', fontSize: '1rem' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', background: '#E2E8F0', padding: '0.5rem', borderRadius: '16px' }}>
                    {(['all', 'pending', 'accepted', 'rejected'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            style={{
                                padding: '0.75rem 1.25rem',
                                borderRadius: '12px',
                                border: 'none',
                                fontWeight: 700,
                                cursor: 'pointer',
                                background: statusFilter === status ? 'white' : 'transparent',
                                color: statusFilter === status ? 'var(--color-primary)' : '#64748B',
                                boxShadow: statusFilter === status ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s',
                                fontSize: '0.9rem'
                            }}
                        >
                            {status === 'all' ? 'Tất cả' : status === 'pending' ? 'Chờ duyệt' : status === 'accepted' ? 'Đã chấp nhận' : 'Đã từ chối'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="loading">Đang tải dữ liệu...</div>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <Briefcase size={48} style={{ color: '#E2E8F0' }} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B' }}>Không có yêu cầu nào</h3>
                    <p style={{ color: '#64748B', maxWidth: '400px', margin: '1rem auto' }}>
                        Các yêu cầu liên kết từ các trường đối tác sẽ xuất hiện tại đây.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '2rem' }}>
                    {filteredRequests.map(renderCard)}
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedRequest && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '900px', borderRadius: '32px', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: 'white', position: 'relative' }}>
                            <button onClick={() => setShowDetailModal(false)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={24} />
                            </button>
                            <div style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', display: 'inline-block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '1px' }}>
                                YÊU CẦU LIÊN KẾT TỪ NHÀ TRƯỜNG
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>{selectedRequest.metadata?.title || 'Không có tiêu đề'}</h2>
                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', opacity: 0.9, fontSize: '1rem', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={18} /> {selectedRequest.metadata?.working_regions?.[0] || selectedRequest.metadata?.work_locations?.[0] || 'N/A'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={18} /> {formatSalary(selectedRequest.metadata?.salary)}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={18} /> {format(new Date(selectedRequest.created_at), 'dd/MM/yyyy', { locale: vi })}</span>
                            </div>
                        </div>

                        <div style={{ padding: '0 2.5rem 2.5rem', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', marginTop: '2.5rem' }}>
                                <div>
                                    {selectedRequest.metadata?.job_description && selectedRequest.metadata.job_description.length > 0 && (
                                        <section style={{ marginBottom: '2.5rem' }}>
                                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Target size={24} style={{ color: '#6366F1' }} /> Mô tả công việc
                                            </h3>
                                            <ul style={{ paddingLeft: '1.5rem', margin: 0, lineHeight: 2 }}>
                                                {selectedRequest.metadata.job_description.map((desc, idx) => (
                                                    <li key={idx} style={{ color: '#475569', fontSize: '1.05rem' }}>{desc}</li>
                                                ))}
                                            </ul>
                                        </section>
                                    )}

                                    {selectedRequest.metadata?.candidate_requirements && selectedRequest.metadata.candidate_requirements.length > 0 && (
                                        <section style={{ marginBottom: '2.5rem' }}>
                                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <BarChart3 size={24} style={{ color: '#14B8A6' }} /> Yêu cầu ứng viên
                                            </h3>
                                            <ul style={{ paddingLeft: '1.5rem', margin: 0, lineHeight: 2 }}>
                                                {selectedRequest.metadata.candidate_requirements.map((req, idx) => (
                                                    <li key={idx} style={{ color: '#475569', fontSize: '1.05rem' }}>{req}</li>
                                                ))}
                                            </ul>
                                        </section>
                                    )}

                                    {selectedRequest.metadata?.benefits && selectedRequest.metadata.benefits.length > 0 && (
                                        <section style={{ marginBottom: '2.5rem' }}>
                                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Gem size={24} style={{ color: '#F59E0B' }} /> Quyền lợi
                                            </h3>
                                            <ul style={{ paddingLeft: '1.5rem', margin: 0, lineHeight: 2 }}>
                                                {selectedRequest.metadata.benefits.map((benefit, idx) => (
                                                    <li key={idx} style={{ color: '#475569', fontSize: '1.05rem' }}>{benefit}</li>
                                                ))}
                                            </ul>
                                        </section>
                                    )}

                                    {selectedRequest.metadata?.fields && selectedRequest.metadata.fields.length > 0 && (
                                        <section style={{ marginBottom: '2.5rem' }}>
                                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Target size={24} style={{ color: '#EC4899' }} /> Lĩnh vực
                                            </h3>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {selectedRequest.metadata.fields.map((field, idx) => (
                                                    <span key={idx} style={{ padding: '0.5rem 1rem', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899', fontSize: '0.9rem', fontWeight: 600 }}>
                                                        {field}
                                                    </span>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {selectedRequest.metadata?.requirements_tags && selectedRequest.metadata.requirements_tags.length > 0 && (
                                        <section style={{ marginBottom: '2.5rem' }}>
                                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Tags size={24} style={{ color: '#64748B' }} /> Tags
                                            </h3>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {selectedRequest.metadata.requirements_tags.map((tag, idx) => (
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
                                                {selectedRequest.school?.avatar_url ? <img src={selectedRequest.school.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <School size={24} />}
                                            </div>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1E293B' }}>{selectedRequest.school?.full_name || 'N/A'}</div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {selectedRequest.school?.email && <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#475569' }}><Mail size={16} style={{ color: '#3B82F6' }} /> {selectedRequest.school.email}</div>}
                                            {selectedRequest.school?.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#475569' }}><Phone size={16} style={{ color: '#10B981' }} /> {selectedRequest.school.phone}</div>}
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div style={{ padding: '1.5rem', borderRadius: '24px', background: selectedRequest.admin_status === 'approved' ? '#ECFDF5' : selectedRequest.company_status === 'rejected' || selectedRequest.admin_status === 'rejected' ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${selectedRequest.admin_status === 'approved' ? '#A7F3D0' : selectedRequest.company_status === 'rejected' || selectedRequest.admin_status === 'rejected' ? '#FECACA' : '#FDE68A'}` }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#64748B', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700 }}>Trạng thái</h4>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: selectedRequest.admin_status === 'approved' ? '#059669' : selectedRequest.company_status === 'rejected' || selectedRequest.admin_status === 'rejected' ? '#DC2626' : '#D97706' }}>
                                            {selectedRequest.admin_status === 'approved' ? 'Đã được admin duyệt' : selectedRequest.admin_status === 'rejected' ? 'Admin đã từ chối' : selectedRequest.company_status === 'rejected' ? 'Công ty đã từ chối' : selectedRequest.company_status === 'accepted' ? 'Đã chấp nhận - Chờ admin duyệt' : 'Đang chờ xác nhận'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .partnership-item:hover {
                    border-color: #8B5CF6 !important;
                    box-shadow: 0 12px 20px -8px rgba(139, 92, 246, 0.2);
                    transform: translateY(-2px);
                }
                .loading {
                    color: #64748B;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}
