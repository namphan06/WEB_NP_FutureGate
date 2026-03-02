import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    FiUser, FiMail, FiLock, FiBell, FiShield, FiAlertCircle,
    FiCheckCircle, FiChevronRight, FiGlobe, FiSmartphone, FiDatabase, FiBriefcase,
    FiAward, FiTrendingUp
} from 'react-icons/fi';

export default function SettingsPage() {
    const { profile, updateProfile, changePassword } = useAuth();
    const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'privacy' | 'subscription'>('account');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Account states
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Notification states (from profile metadata)
    const [notifs, setNotifs] = useState({
        email_job_alerts: true,
        email_interviews: true,
        email_messages: true,
        email_application_updates: true,
        push_notifs: true
    });

    // Privacy states
    const [privacy, setPrivacy] = useState({
        public_profile: true,
        show_phone: false,
        show_email: false
    });

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setPhone(profile.phone || '');

            const meta = profile.metadata || {};
            setNotifs({
                email_job_alerts: meta.notifications?.email_job_alerts ?? true,
                email_interviews: meta.notifications?.email_interviews ?? true,
                email_messages: meta.notifications?.email_messages ?? true,
                email_application_updates: meta.notifications?.email_application_updates ?? true,
                push_notifs: meta.notifications?.push_notifs ?? true
            });
            setPrivacy({
                public_profile: meta.privacy?.public_profile ?? true,
                show_phone: meta.privacy?.show_phone ?? false,
                show_email: meta.privacy?.show_email ?? false
            });
        }
    }, [profile]);

    const handleUpdateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setMessage(null);
            await updateProfile({
                full_name: fullName,
                phone: phone
            });
            setMessage({ type: 'success', text: 'Cập nhật thông tin tài khoản thành công!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Mật khẩu phải có ít nhất 6 ký tự.' });
            return;
        }

        try {
            setLoading(true);
            setMessage(null);
            await changePassword(newPassword);
            setNewPassword('');
            setConfirmPassword('');
            setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            setLoading(true);
            setMessage(null);
            await updateProfile({
                metadata: {
                    ...(profile?.metadata || {}),
                    notifications: notifs,
                    privacy: privacy
                }
            });
            setMessage({ type: 'success', text: 'Đã lưu cấu hình hệ thống!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'account', label: 'Tài khoản', icon: <FiUser /> },
        { id: 'notifications', label: 'Thông báo', icon: <FiBell /> },
        { id: 'privacy', label: 'Bảo mật', icon: <FiShield /> },
        ...(profile?.role === 'employer' ? [{ id: 'subscription', label: 'Gói dịch vụ', icon: <FiAward /> }] : []),
    ];

    return (
        <div className="section" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.5rem' }}>Cài đặt hệ thống</h1>
                <p style={{ color: '#64748B', fontWeight: 500 }}>Quản lý thông tin tài khoản, quyền riêng tư và tùy chọn nhận thông báo của bạn.</p>
            </div>

            {message && (
                <div style={{
                    padding: '1rem 1.5rem',
                    borderRadius: '16px',
                    marginBottom: '2rem',
                    background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                    border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}`,
                    color: message.type === 'success' ? '#065F46' : '#991B1B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    {message.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
                    <span style={{ fontWeight: 600 }}>{message.text}</span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem' }}>
                {/* Navigation */}
                <aside>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id as any); setMessage(null); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '1rem 1.25rem',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: activeTab === tab.id ? '#1E88E5' : 'transparent',
                                    color: activeTab === tab.id ? 'white' : '#64748B',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    textAlign: 'left'
                                }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
                                <span style={{ flex: 1 }}>{tab.label}</span>
                                {activeTab === tab.id && <FiChevronRight />}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748B', marginBottom: '1rem' }}>
                            <FiDatabase />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>DỮ LIỆU CỦA BẠN</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>
                            Hệ thống bảo vệ dữ liệu của bạn theo tiêu chuẩn GDPR. Bạn có quyền yêu cầu xuất hoặc xóa dữ liệu bất cứ lúc nào.
                        </p>
                    </div>
                </aside>

                {/* Content Area */}
                <main>
                    {activeTab === 'account' && (
                        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                                <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem' }}>
                                    <FiUser style={{ color: '#1E88E5' }} /> Thông tin cá nhân
                                </h3>
                                <form onSubmit={handleUpdateAccount}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: '#475569' }}>Họ và tên</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={fullName}
                                                onChange={e => setFullName(e.target.value)}
                                                style={{ borderRadius: '14px', height: '50px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: '#475569' }}>Số điện thoại</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                style={{ borderRadius: '14px', height: '50px' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: '#475569' }}>Email (Không thể thay đổi)</label>
                                        <div style={{ padding: '12px 16px', background: '#F8FAFC', borderRadius: '14px', color: '#94A3B8', fontWeight: 500, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FiMail opacity={0.5} /> {profile?.email}
                                        </div>
                                    </div>
                                    <button type="submit" disabled={loading} className="btn-creative-primary" style={{ padding: '0.75rem 2rem', borderRadius: '14px', height: '52px' }}>
                                        {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                                    </button>
                                </form>
                            </div>

                            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                                <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem' }}>
                                    <FiLock style={{ color: '#F43F5E' }} /> Đổi mật khẩu
                                </h3>
                                <form onSubmit={handleChangePassword}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: '#475569' }}>Mật khẩu mới</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                                placeholder="••••••••"
                                                style={{ borderRadius: '14px', height: '50px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: '#475569' }}>Xác nhận mật khẩu</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                style={{ borderRadius: '14px', height: '50px' }}
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={loading} className="btn-creative-secondary" style={{ padding: '0.75rem 2rem', borderRadius: '14px', height: '52px', border: '1px solid #E2E8F0' }}>
                                        Lưu mật khẩu mới
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="animate-fade-in" style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem' }}>
                                <FiBell style={{ color: '#10B981' }} /> Thông báo qua Email
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {[
                                    { id: 'email_job_alerts', label: 'Thông báo việc làm mới', desc: 'Nhận thư mời ứng tuyển hoặc việc làm phù hợp với hồ sơ hàng ngày.', icon: <FiBriefcase /> },
                                    { id: 'email_interviews', label: 'Thông báo lịch phỏng vấn', desc: 'Nhận email ngay khi nhà tuyển dụng gửi lịch hẹn phỏng vấn.', icon: <FiSmartphone /> },
                                    { id: 'email_application_updates', label: 'Thông báo phản hồi hồ sơ', desc: 'Nhận thông báo khi hồ sơ ứng tuyển của bạn có cập nhật mới (duyệt, từ chối, v.v).', icon: <FiTrendingUp /> },
                                    { id: 'email_messages', label: 'Tin nhắn trực tiếp', desc: 'Nhận email khi có người dùng hoặc nhà tuyển dụng nhắn tin cho bạn.', icon: <FiGlobe /> },
                                ].map(item => (
                                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '1.5rem', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E88E5', fontSize: '1.25rem', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                                            {item.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>{item.label}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>{item.desc}</div>
                                        </div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={(notifs as any)[item.id]}
                                                onChange={(e) => setNotifs({ ...notifs, [item.id]: e.target.checked })}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '1px solid #F1F5F9' }}>
                                <button onClick={handleSaveSettings} disabled={loading} className="btn-creative-primary" style={{ padding: '0.75rem 2rem', borderRadius: '14px', height: '52px' }}>
                                    Lưu tùy chọn thông báo
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div className="animate-fade-in" style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem' }}>
                                <FiShield style={{ color: '#AB47BC' }} /> Bảo mật & Quyền riêng tư
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {[
                                    { id: 'public_profile', label: 'Cho phép tìm kiếm hồ sơ', desc: 'Nhà tuyển dụng chuyên gia có thể tìm thấy hồ sơ của bạn trên hệ thống.' },
                                    { id: 'show_phone', label: 'Hiển thị số điện thoại', desc: 'Số điện thoại của bạn sẽ hiển thị công khai trên hồ sơ cá nhân.' },
                                    { id: 'show_email', label: 'Hiển thị địa chỉ email', desc: 'Địa chỉ email sẽ được hiển thị công khai trên hồ sơ cá nhân.' },
                                ].map(item => (
                                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '1.5rem', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>{item.label}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>{item.desc}</div>
                                        </div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={(privacy as any)[item.id]}
                                                onChange={(e) => setPrivacy({ ...privacy, [item.id]: e.target.checked })}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '1px solid #F1F5F9' }}>
                                <button onClick={handleSaveSettings} disabled={loading} className="btn-creative-primary" style={{ padding: '0.75rem 2rem', borderRadius: '14px', height: '52px' }}>
                                    Lưu quyền riêng tư
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'subscription' && profile?.role === 'employer' && (
                        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                                    <div>
                                        <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem' }}>
                                            <FiAward style={{ color: '#F59E0B' }} /> Gói dịch vụ hiện tại
                                        </h3>
                                        <p style={{ color: '#64748B', fontWeight: 500 }}>Bạn đang sử dụng gói <strong>Doanh nghiệp Miễn phí</strong></p>
                                    </div>
                                    <div style={{ padding: '8px 16px', background: '#FEF3C7', color: '#92400E', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem' }}>
                                        FREE PLAN
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div style={{ padding: '2rem', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
                                        <div style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>HẠN MỨC ĐĂNG TIN</div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '1.5rem' }}>
                                            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>3</span>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#94A3B8', paddingBottom: '4px' }}>/ 5 tin</span>
                                        </div>
                                        <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, #1E88E5, #42A5F5)', borderRadius: '4px' }}></div>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '1rem', marginBottom: 0 }}>Bạn đã sử dụng 60% hạn mức tháng này.</p>
                                    </div>

                                    <div style={{ padding: '2rem', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
                                        <div style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>HẠN MỨC TÌM KIẾM</div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '1.5rem' }}>
                                            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>42</span>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#94A3B8', paddingBottom: '4px' }}>/ 100 lượt</span>
                                        </div>
                                        <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: '42%', height: '100%', background: 'linear-gradient(90deg, #10B981, #34D399)', borderRadius: '4px' }}></div>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '1rem', marginBottom: 0 }}>Hạn mức sẽ được làm mới vào ngày 01/04.</p>
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem', background: 'rgba(30, 136, 229, 0.05)', borderRadius: '20px', border: '1px dashed #1E88E5', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E88E5' }}>
                                        <FiTrendingUp />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#1E40AF' }}>Nâng cấp lên gói PRO để nhận hạn mức đăng tin không giới hạn!</p>
                                    </div>
                                    <button className="btn-creative-primary" style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem' }}>Nâng cấp ngay</button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <style>{`
                .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #E2E8F0; transition: .4s; }
                .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
                input:checked + .slider { background-color: #1E88E5; }
                input:focus + .slider { box-shadow: 0 0 1px #1E88E5; }
                input:checked + .slider:before { transform: translateX(20px); }
                .slider.round { border-radius: 24px; }
                .slider.round:before { border-radius: 50%; }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fade-in {
                    animation: fadeIn 0.4s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}

