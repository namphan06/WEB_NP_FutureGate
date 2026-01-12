import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiMail, FiPhone, FiBriefcase } from 'react-icons/fi';

export default function ProfilePage() {
    const { profile } = useAuth();

    if (!profile) {
        return (
            <div className="container section">
                <div className="loading text-center">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="container section">
            <div className="text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <h1>Hồ sơ của tôi</h1>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="card animate-fade-in">
                    <div className="text-center" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        {profile.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt={profile.full_name || ''}
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    margin: '0 auto',
                                    border: '4px solid var(--color-primary)'
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    background: 'var(--gradient-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    margin: '0 auto',
                                    border: '4px solid var(--color-primary)'
                                }}
                            >
                                {profile.full_name?.[0] || 'U'}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FiUser size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={profile.full_name || ''}
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FiMail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Email
                        </label>
                        <input
                            type="email"
                            className="form-input"
                            value={profile.email || ''}
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FiPhone size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Số điện thoại
                        </label>
                        <input
                            type="tel"
                            className="form-input"
                            value={profile.phone || ''}
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FiBriefcase size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Vai trò
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={
                                profile.role === 'candidate' ? 'Ứng viên' :
                                    profile.role === 'employer' ? 'Nhà tuyển dụng' :
                                        profile.role === 'school' ? 'Nhà trường' : 'Quản trị viên'
                            }
                            readOnly
                        />
                    </div>

                    <div style={{ marginTop: 'var(--spacing-xl)' }}>
                        <button className="btn btn-primary" style={{ width: '100%' }}>
                            Chỉnh sửa hồ sơ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
