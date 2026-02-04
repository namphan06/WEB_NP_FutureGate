import { useState, useEffect } from 'react';
import {
    Search, MapPin,
    Handshake, CheckCircle2, XCircle,
    ExternalLink, Mail, Phone, BookOpen, Clock, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Partnership {
    id: string;
    company_id: string;
    status: 'pending' | 'accepted' | 'rejected' | 'suspended';
    post_limit_count?: number;
    post_limit_period?: string;
    bypass_job_approval?: boolean;
    created_at: string;
    metadata?: any;
    company?: {
        full_name: string;
        avatar_url?: string;
        email?: string;
        phone?: string;
    };
}

export default function SchoolPartnershipsPage() {
    const { user } = useAuth();
    const [partnerships, setPartnerships] = useState<Partnership[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        if (user) {
            fetchPartnerships();
        }
    }, [user]);

    const fetchPartnerships = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Fetch relations
            const { data: rawData, error: pError } = await supabase
                .from('school_company_partnerships')
                .select('*')
                .eq('school_id', user.id)
                .order('created_at', { ascending: false });

            if (pError) throw pError;

            // 2. Enrich with company data manually
            let enriched = [];
            if (rawData && rawData.length > 0) {
                const companyIds = [...new Set(rawData.map(p => p.company_id).filter(id => !!id))];
                if (companyIds.length > 0) {
                    const { data: companies, error: cError } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url')
                        .in('id', companyIds);

                    if (cError) console.warn('Company enrich error:', cError.message);

                    const cMap = (companies || []).reduce((acc: any, c: any) => ({ ...acc, [c.id]: c }), {});
                    enriched = rawData.map(p => ({
                        ...p,
                        company: cMap[p.company_id]
                    }));
                } else {
                    enriched = rawData;
                }
            }

            setPartnerships(enriched as Partnership[]);
        } catch (error: any) {
            console.error('SEARCH ERROR:', error.message || error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (p: Partnership) => {
        switch (p.status) {
            case 'accepted':
                return { bg: '#DCFCE7', text: '#15803D', label: 'Đang hợp tác', icon: <CheckCircle2 size={16} /> };
            case 'rejected':
                return { bg: '#FEE2E2', text: '#B91C1C', label: 'Bị từ chối', icon: <XCircle size={16} /> };
            case 'pending':
                return { bg: '#FEF3C7', text: '#B45309', label: 'Đang chờ duyệt', icon: <Clock size={16} /> };
            case 'suspended':
                return { bg: '#F1F5F9', text: '#475569', label: 'Tạm dừng', icon: <AlertCircle size={16} /> };
            default:
                return { bg: '#F1F5F9', text: '#475569', label: 'Không xác định', icon: <AlertCircle size={16} /> };
        }
    };

    const filteredPartnerships = partnerships.filter(p => {
        const companyName = (p.company?.full_name || '').toLowerCase();
        const matchesSearch = companyName.includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8FAFC' }}>
                <div className="loading">Đang tải danh sách đối tác...</div>
            </div>
        );
    }

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '2rem' }}>
            <div className="container-fluid">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>Mạng lưới Đối tác</h1>
                        <p style={{ color: '#64748B', marginTop: '0.5rem', fontSize: '1.1rem' }}>Quản lý và theo dõi các mối quan hệ hợp tác với doanh nghiệp.</p>
                    </div>
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '16px', padding: '14px 28px', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
                        <Handshake size={20} /> Đề xuất hợp tác mới
                    </button>
                </div>

                {/* Filters */}
                <div style={{ background: 'white', padding: '1.25rem', borderRadius: '24px', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm doanh nghiệp..."
                            style={{ width: '100%', paddingLeft: '3rem', height: '52px', border: '1px solid #E2E8F0', borderRadius: '16px', background: '#F8FAFC', outline: 'none' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        style={{ height: '52px', padding: '0 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 600, outline: 'none' }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang hợp tác</option>
                        <option value="pending">Chờ phản hồi</option>
                    </select>
                </div>

                {/* Grid */}
                {filteredPartnerships.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '32px', border: '2px dashed #E2E8F0' }}>
                        <Handshake size={64} style={{ color: '#CBD5E1', marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B' }}>Chưa có đối tác nào</h3>
                        <p style={{ color: '#64748B' }}>Bắt đầu xây dựng mạng lưới hợp tác bằng cách gửi đề xuất tới các doanh nghiệp.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '2rem' }}>
                        {filteredPartnerships.map((p) => {
                            const style = getStatusStyle(p);
                            const company = p.company;
                            return (
                                <div key={p.id} className="card" style={{ borderRadius: '32px', border: 'none', background: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', transition: 'transform 0.3s ease' }}>
                                    <div style={{ padding: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                                <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    {company?.avatar_url ? (
                                                        <img src={company.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                                    ) : (
                                                        <Handshake size={32} style={{ color: '#94A3B8' }} />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px 0', color: '#0F172A' }}>
                                                        {company?.full_name || 'N/A'}
                                                    </h3>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.9rem', fontWeight: 600 }}>
                                                        <MapPin size={14} /> {p.metadata?.work_locations?.[0] || 'Toàn quốc'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ background: style.bg, color: style.text, padding: '8px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {style.icon} {style.label.toUpperCase()}
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                            <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '20px' }}>
                                                <div style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>Lĩnh vực</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>{p.metadata?.fields?.[0] || 'Đa ngành'}</div>
                                            </div>
                                            <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '20px' }}>
                                                <div style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>Hạn mức</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#3B82F6' }}>
                                                    {p.post_limit_period === 'unlimited' ? 'Vô hạn' : `${p.post_limit_count || 0} tin/${p.post_limit_period === 'month' ? 'tháng' : 'năm'}`}
                                                </div>
                                            </div>
                                            <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '20px' }}>
                                                <div style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>Ngày tạo</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>{new Date(p.created_at).toLocaleDateString('vi-VN')}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '0.95rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Mail size={14} style={{ color: '#3B82F6' }} />
                                                </div>
                                                {company?.email || 'Chưa cập nhật'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '0.95rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Phone size={14} style={{ color: '#10B981' }} />
                                                </div>
                                                {company?.phone || 'Chưa cập nhật'}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button className="btn btn-outline-primary" style={{ flex: 1, borderRadius: '16px', fontWeight: 700, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <BookOpen size={18} /> Quản lý SV
                                            </button>
                                            <button className="btn btn-secondary" style={{ width: '48px', height: '48px', padding: 0, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <ExternalLink size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <style>{`
                .card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.08);
                }
            `}</style>
        </div>
    );
}
