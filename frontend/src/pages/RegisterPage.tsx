import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight, FiCheck, FiBriefcase, FiUsers, FiTrendingUp } from 'react-icons/fi';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'candidate' as 'candidate' | 'employer' | 'school'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            await signUp(formData.email, formData.password, formData.fullName, formData.role);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 50%, #E8F4F8 100%)',
            padding: 'var(--spacing-xl)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative elements - subtle blue */}
            <div style={{
                position: 'absolute',
                top: '-5%',
                right: '10%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(30, 136, 229, 0.08) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-5%',
                left: '10%',
                width: '350px',
                height: '350px',
                background: 'radial-gradient(circle, rgba(30, 136, 229, 0.06) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(50px)'
            }} />

            {/* Main Card */}
            <div style={{
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(30, 136, 229, 0.1), 0 0 1px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '1100px',
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Left Side - Branding & Information */}
                <div style={{
                    background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
                    padding: 'var(--spacing-3xl)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Subtle pattern */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0.1,
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '32px 32px'
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {/* Logo & Title */}
                        <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-md)',
                                marginBottom: 'var(--spacing-lg)'
                            }}>
                                <img
                                    src="/assets/Screenshot 2025-11-30 100112.png"
                                    alt="NP FutureGate"
                                    style={{
                                        height: '50px',
                                        width: 'auto',
                                        backgroundColor: 'white',
                                        padding: '8px',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    }}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                                <div>
                                    <h1 style={{
                                        fontSize: '1.75rem',
                                        fontWeight: 800,
                                        margin: 0,
                                        lineHeight: 1.2
                                    }}>
                                        NP FutureGate
                                    </h1>
                                    <p style={{
                                        fontSize: '0.875rem',
                                        opacity: 0.9,
                                        margin: 0
                                    }}>
                                        Nền tảng tuyển dụng thông minh
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Why Join Us */}
                        <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                marginBottom: 'var(--spacing-lg)'
                            }}>
                                Tại sao nên tham gia?
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                {[
                                    { icon: <FiBriefcase size={20} />, text: 'Truy cập 100,000+ việc làm chất lượng cao' },
                                    { icon: <FiUsers size={20} />, text: 'Kết nối với 50,000+ nhà tuyển dụng uy tín' },
                                    { icon: <FiTrendingUp size={20} />, text: 'AI giúp tìm việc phù hợp với bạn' },
                                    { icon: <FiCheck size={20} />, text: 'Miễn phí hoàn toàn, không giới hạn' }
                                ].map((feature, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 'var(--spacing-md)',
                                        padding: 'var(--spacing-sm)'
                                    }}>
                                        <div style={{
                                            marginTop: '2px',
                                            opacity: 0.9,
                                            flexShrink: 0
                                        }}>
                                            {feature.icon}
                                        </div>
                                        <span style={{ fontSize: '0.9375rem', lineHeight: 1.5 }}>{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Process Steps */}
                        <div style={{
                            padding: 'var(--spacing-lg)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 'var(--radius-lg)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <h4 style={{
                                fontSize: '1rem',
                                fontWeight: 700,
                                marginBottom: 'var(--spacing-md)'
                            }}>
                                Bắt đầu trong 3 bước:
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {['Đăng ký tài khoản miễn phí', 'Hoàn thiện hồ sơ cá nhân', 'Bắt đầu tìm việc ngay!'].map((step, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-md)',
                                        fontSize: '0.875rem'
                                    }}>
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            background: 'rgba(255, 255, 255, 0.25)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            flexShrink: 0
                                        }}>
                                            {index + 1}
                                        </div>
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom stats */}
                    <div style={{
                        position: 'relative',
                        zIndex: 1,
                        marginTop: 'var(--spacing-xl)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 'var(--spacing-md)',
                        fontSize: '0.875rem',
                        textAlign: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>98%</div>
                            <div style={{ opacity: 0.8, fontSize: '0.75rem' }}>Hài lòng</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>5★</div>
                            <div style={{ opacity: 0.8, fontSize: '0.75rem' }}>Đánh giá</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>24/7</div>
                            <div style={{ opacity: 0.8, fontSize: '0.75rem' }}>Hỗ trợ</div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Register Form */}
                <div style={{
                    padding: 'var(--spacing-3xl)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: '#FAFBFC',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}>
                    {/* Header */}
                    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <h2 style={{
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            marginBottom: 'var(--spacing-sm)',
                            color: '#1a1a1a'
                        }}>
                            Tạo tài khoản 🚀
                        </h2>
                        <p style={{
                            color: '#6B7280',
                            fontSize: '0.9375rem'
                        }}>
                            Đã có tài khoản?{' '}
                            <Link
                                to="/login"
                                style={{
                                    color: '#1E88E5',
                                    fontWeight: 600,
                                    textDecoration: 'none'
                                }}
                            >
                                Đăng nhập
                            </Link>
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: '#FEE2E2',
                            border: '1px solid #FCA5A5',
                            borderRadius: 'var(--radius-md)',
                            color: '#DC2626',
                            marginBottom: 'var(--spacing-lg)',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Role Selection */}
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 'var(--spacing-sm)',
                                fontWeight: 600,
                                color: '#374151',
                                fontSize: '0.875rem'
                            }}>
                                Bạn là
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-sm)' }}>
                                {[
                                    { value: 'candidate', label: 'Ứng viên', icon: '👤' },
                                    { value: 'employer', label: 'NTD', icon: '🏢' },
                                    { value: 'school', label: 'Trường', icon: '🎓' }
                                ].map((role) => (
                                    <button
                                        key={role.value}
                                        type="button"
                                        onClick={() => updateField('role', role.value)}
                                        style={{
                                            padding: 'var(--spacing-sm)',
                                            border: `2px solid ${formData.role === role.value ? '#1E88E5' : '#E5E7EB'}`,
                                            borderRadius: 'var(--radius-lg)',
                                            background: formData.role === role.value ? 'rgba(30, 136, 229, 0.05)' : 'white',
                                            cursor: 'pointer',
                                            transition: 'all var(--transition-fast)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.25rem' }}>{role.icon}</span>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: formData.role === role.value ? '#1E88E5' : '#6B7280'
                                        }}>
                                            {role.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Full Name */}
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 'var(--spacing-sm)',
                                fontWeight: 600,
                                color: '#374151',
                                fontSize: '0.875rem'
                            }}>
                                Họ và tên
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => updateField('fullName', e.target.value)}
                                    placeholder="Nguyễn Văn A"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: 'var(--spacing-md) var(--spacing-md) var(--spacing-md) 2.75rem',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: 'var(--radius-lg)',
                                        fontSize: '0.9375rem',
                                        transition: 'all var(--transition-fast)',
                                        outline: 'none',
                                        background: 'white'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#1E88E5';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 136, 229, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                />
                                <FiUser style={{
                                    position: 'absolute',
                                    left: 'var(--spacing-md)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF',
                                    pointerEvents: 'none'
                                }} size={16} />
                            </div>
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 'var(--spacing-sm)',
                                fontWeight: 600,
                                color: '#374151',
                                fontSize: '0.875rem'
                            }}>
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                    placeholder="your.email@example.com"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: 'var(--spacing-md) var(--spacing-md) var(--spacing-md) 2.75rem',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: 'var(--radius-lg)',
                                        fontSize: '0.9375rem',
                                        transition: 'all var(--transition-fast)',
                                        outline: 'none',
                                        background: 'white'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#1E88E5';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 136, 229, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                />
                                <FiMail style={{
                                    position: 'absolute',
                                    left: 'var(--spacing-md)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF',
                                    pointerEvents: 'none'
                                }} size={16} />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 'var(--spacing-sm)',
                                fontWeight: 600,
                                color: '#374151',
                                fontSize: '0.875rem'
                            }}>
                                Mật khẩu
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => updateField('password', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: 'var(--spacing-md) 2.75rem var(--spacing-md) 2.75rem',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: 'var(--radius-lg)',
                                        fontSize: '0.9375rem',
                                        transition: 'all var(--transition-fast)',
                                        outline: 'none',
                                        background: 'white'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#1E88E5';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 136, 229, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                />
                                <FiLock style={{
                                    position: 'absolute',
                                    left: 'var(--spacing-md)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF',
                                    pointerEvents: 'none'
                                }} size={16} />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: 'var(--spacing-md)',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#9CA3AF',
                                        padding: 0,
                                        display: 'flex'
                                    }}
                                >
                                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 'var(--spacing-sm)',
                                fontWeight: 600,
                                color: '#374151',
                                fontSize: '0.875rem'
                            }}>
                                Xác nhận mật khẩu
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: 'var(--spacing-md) 2.75rem var(--spacing-md) 2.75rem',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: 'var(--radius-lg)',
                                        fontSize: '0.9375rem',
                                        transition: 'all var(--transition-fast)',
                                        outline: 'none',
                                        background: 'white'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#1E88E5';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 136, 229, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                />
                                <FiLock style={{
                                    position: 'absolute',
                                    left: 'var(--spacing-md)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF',
                                    pointerEvents: 'none'
                                }} size={16} />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: 'var(--spacing-md)',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#9CA3AF',
                                        padding: 0,
                                        display: 'flex'
                                    }}
                                >
                                    {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-md)',
                                background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-lg)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'var(--spacing-sm)',
                                transition: 'all var(--transition-fast)',
                                boxShadow: '0 4px 12px rgba(30, 136, 229, 0.3)',
                                marginBottom: 'var(--spacing-md)'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(30, 136, 229, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 136, 229, 0.3)';
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: '18px',
                                        height: '18px',
                                        border: '2px solid white',
                                        borderTopColor: 'transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite'
                                    }} />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    Tạo tài khoản
                                    <FiArrowRight size={18} />
                                </>
                            )}
                        </button>

                        {/* Terms */}
                        <div style={{
                            fontSize: '0.6875rem',
                            color: '#9CA3AF',
                            textAlign: 'center',
                            lineHeight: 1.5
                        }}>
                            Bằng việc đăng ký, bạn đồng ý với{' '}
                            <Link to="/terms" style={{ color: '#1E88E5', textDecoration: 'none' }}>
                                Điều khoản
                            </Link>
                            {' '}và{' '}
                            <Link to="/privacy" style={{ color: '#1E88E5', textDecoration: 'none' }}>
                                Chính sách
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 1024px) {
                    body > div > div {
                        grid-template-columns: 1fr !important;
                    }
                    body > div > div > div:first-child {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}
