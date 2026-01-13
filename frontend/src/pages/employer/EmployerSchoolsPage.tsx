import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
    FiCheck, FiX, FiSettings,
    FiPieChart, FiActivity, FiBriefcase
} from 'react-icons/fi';

interface Partnership {
    id: string;
    school_id: string;
    company_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    post_limit_count: number;
    post_limit_period: 'month' | 'year' | 'unlimited';
    created_at: string;
    updated_at: string;
    school?: any;
}

export default function EmployerSchoolsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'pending' | 'accepted'>('pending');
    const [partnerships, setPartnerships] = useState<Partnership[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState<'approve' | 'edit' | null>(null);
    const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);

    // Form states for limits
    const [limitCount, setLimitCount] = useState(5);
    const [limitPeriod, setLimitPeriod] = useState<'month' | 'year' | 'unlimited'>('month');
    const [isUnlimited, setIsUnlimited] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch partnerships
            const { data, error } = await supabase
                .from('school_company_partnerships')
                .select('*')
                .eq('company_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching partnerships:', error);
                // If table doesn't exist, we might get an error, but let's assume it does as per user code
                return;
            }

            const allPartnerships = data as Partnership[];

            // Fetch school profiles
            const schoolIds = [...new Set(allPartnerships.map(p => p.school_id))];
            if (schoolIds.length > 0) {
                const { data: schoolsData, error: schoolsError } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, email, phone, metadata')
                    .in('id', schoolIds);

                if (!schoolsError && schoolsData) {
                    const enriched = allPartnerships.map(p => ({
                        ...p,
                        school: schoolsData.find(s => s.id === p.school_id)
                    }));
                    setPartnerships(enriched);
                } else {
                    setPartnerships(allPartnerships);
                }
            } else {
                setPartnerships(allPartnerships);
            }
        } catch (error) {
            console.error('Error in fetchData:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: 'accepted' | 'rejected', count?: number, period?: string) => {
        setActionLoading(true);
        try {
            const updates: any = {
                status,
                updated_at: new Date().toISOString()
            };
            if (count !== undefined) updates.post_limit_count = count;
            if (period !== undefined) updates.post_limit_period = period;

            const { error } = await supabase
                .from('school_company_partnerships')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            setShowModal(null);
            fetchData(); // Refresh
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenApprove = (p: Partnership) => {
        setSelectedPartnership(p);
        setLimitCount(5);
        setLimitPeriod('month');
        setIsUnlimited(false);
        setShowModal('approve');
    };

    const handleOpenEdit = (p: Partnership) => {
        setSelectedPartnership(p);
        setLimitCount(p.post_limit_count || 5);
        setLimitPeriod(p.post_limit_period === 'unlimited' ? 'month' : (p.post_limit_period || 'month'));
        setIsUnlimited(p.post_limit_period === 'unlimited');
        setShowModal('edit');
    };

    const pendingRequests = partnerships.filter(p => p.status === 'pending');
    const acceptedPartners = partnerships.filter(p => p.status === 'accepted');

    const renderCard = (p: Partnership) => {
        const school = p.school || {};
        const isRequest = p.status === 'pending';

        return (
            <div key={p.id} className="card partnership-item" style={{
                padding: '1.5rem',
                borderRadius: '24px',
                border: '1px solid #E2E8F0',
                background: 'white',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
            }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '18px',
                        background: '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        {school.avatar_url ? (
                            <img src={school.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <FiBriefcase size={28} style={{ color: '#94A3B8' }} />
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1E293B' }}>{school.full_name || 'Nhà trường'}</h3>
                        <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.9rem' }}>{school.email || 'N/A'}</p>
                    </div>
                    {!isRequest && (
                        <button
                            onClick={() => handleOpenEdit(p)}
                            style={{
                                width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #E2E8F0',
                                background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                color: '#64748B'
                            }}
                        >
                            <FiSettings size={18} />
                        </button>
                    )}
                </div>

                {!isRequest && (
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{
                            padding: '6px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700,
                            background: p.post_limit_period === 'unlimited' ? '#ECFDF5' : '#EFF6FF',
                            color: p.post_limit_period === 'unlimited' ? '#059669' : '#2563EB',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            {p.post_limit_period === 'unlimited' ? <FiActivity /> : <FiPieChart />}
                            {p.post_limit_period === 'unlimited' ? 'Không giới hạn tin' : `${p.post_limit_count} tin / ${p.post_limit_period === 'year' ? 'năm' : 'tháng'}`}
                        </div>
                    </div>
                )}

                {isRequest ? (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                        <button
                            onClick={() => updateStatus(p.id, 'rejected')}
                            disabled={actionLoading}
                            style={{ flex: 1, height: '46px', borderRadius: '12px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', fontWeight: 700, cursor: 'pointer' }}
                        >
                            Từ chối
                        </button>
                        <button
                            onClick={() => handleOpenApprove(p)}
                            disabled={actionLoading}
                            className="btn btn-primary"
                            style={{ flex: 1, height: '46px', borderRadius: '12px', fontWeight: 700 }}
                        >
                            Chấp nhận
                        </button>
                    </div>
                ) : (
                    <button className="btn btn-outline" style={{ width: '100%', height: '44px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700 }}>
                        Xem thông tin trường
                    </button>
                )}
            </div>
        );
    };

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '2.5rem 50px' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>Liên kết trường học</h1>
                    <p style={{ color: '#64748B', fontSize: '1.1rem', margin: 0 }}>Quản lý quan hệ đối tác và giới hạn đăng tuyển của từng trường</p>
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
                        Yêu cầu mới ({pendingRequests.length})
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
                        Đã liên kết
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="loading">Đang tải dữ liệu...</div>
                </div>
            ) : (activeTab === 'pending' ? pendingRequests : acceptedPartners).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <FiBriefcase size={48} style={{ color: '#E2E8F0' }} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B' }}>
                        {activeTab === 'pending' ? 'Không có yêu cầu chờ duyệt' : 'Chưa có trường nào liên kết'}
                    </h3>
                    <p style={{ color: '#64748B', maxWidth: '400px', margin: '1rem auto' }}>
                        {activeTab === 'pending'
                            ? 'Các yêu cầu liên kết từ các trường đối tác sẽ xuất hiện tại đây để bạn xem xét.'
                            : 'Bắt đầu kết nối với các trường đại học để mở rộng nguồn ứng viên chất lượng.'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
                    {(activeTab === 'pending' ? pendingRequests : acceptedPartners).map(renderCard)}
                </div>
            )}

            {/* Modal for Approve / Edit */}
            {showModal && selectedPartnership && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="card scale-up" style={{ width: '500px', padding: '2.5rem', borderRadius: '32px', border: 'none', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                                {showModal === 'approve' ? 'Chấp nhận liên kết' : 'Cài đặt giới hạn'}
                            </h2>
                            <button onClick={() => setShowModal(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><FiX size={24} /></button>
                        </div>

                        <p style={{ color: '#64748B', marginBottom: '2rem' }}>
                            Thiết lập giới hạn số lượng tin tuyển dụng mà <strong>{selectedPartnership.school?.full_name}</strong> có thể đăng.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '1rem', borderRadius: '16px', background: isUnlimited ? '#F0F9FF' : '#F8FAFC', border: isUnlimited ? '2px solid #3B82F6' : '2px solid transparent' }}>
                                <input
                                    type="checkbox"
                                    checked={isUnlimited}
                                    onChange={(e) => setIsUnlimited(e.target.checked)}
                                    style={{ width: '20px', height: '20px' }}
                                />
                                <span style={{ fontWeight: 700, color: isUnlimited ? '#1E40AF' : '#475569' }}>Không giới hạn tin đăng</span>
                            </label>

                            {!isUnlimited && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Số lượng tin</label>
                                        <input
                                            type="number"
                                            value={limitCount}
                                            onChange={(e) => setLimitCount(parseInt(e.target.value) || 0)}
                                            style={{ width: '100%', height: '48px', padding: '0 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 700 }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Chu kỳ</label>
                                        <select
                                            value={limitPeriod}
                                            onChange={(e) => setLimitPeriod(e.target.value as any)}
                                            style={{ width: '100%', height: '48px', padding: '0 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 700 }}
                                        >
                                            <option value="month">Theo tháng</option>
                                            <option value="year">Theo năm</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                            <button
                                onClick={() => setShowModal(null)}
                                style={{ flex: 1, height: '52px', background: '#F1F5F9', border: 'none', borderRadius: '14px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => updateStatus(selectedPartnership.id, 'accepted', isUnlimited ? 0 : limitCount, isUnlimited ? 'unlimited' : limitPeriod)}
                                disabled={actionLoading}
                                className="btn btn-primary"
                                style={{ flex: 1, height: '52px', borderRadius: '14px', fontWeight: 700 }}
                            >
                                {actionLoading ? 'Đang lưu...' : (showModal === 'approve' ? 'Xác nhận' : 'Lưu thay đổi')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .partnership-item:hover {
                    border-color: #3B82F6 !important;
                    box-shadow: 0 12px 20px -8px rgba(0,0,0,0.05);
                    transform: translateY(-2px);
                }
                .scale-up {
                    animation: scaleUp 0.3s ease-out;
                }
                @keyframes scaleUp {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
