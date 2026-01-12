import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck, FiBriefcase, FiUsers, FiTrendingUp } from 'react-icons/fi';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signIn(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
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

                        {/* Statistics */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 'var(--spacing-lg)',
                            marginBottom: 'var(--spacing-2xl)',
                            padding: 'var(--spacing-xl)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 'var(--radius-xl)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: 800,
                                    marginBottom: '0.25rem'
                                }}>100K+</div>
                                <div style={{ fontSize: '0.8125rem', opacity: 0.9 }}>Việc làm</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: 800,
                                    marginBottom: '0.25rem'
                                }}>50K+</div>
                                <div style={{ fontSize: '0.8125rem', opacity: 0.9 }}>Nhà tuyển dụng</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: 800,
                                    marginBottom: '0.25rem'
                                }}>200K+</div>
                                <div style={{ fontSize: '0.8125rem', opacity: 0.9 }}>Ứng viên</div>
                            </div>
                        </div>

                        {/* Features */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {[
                                { icon: <FiBriefcase size={20} />, text: 'Tìm việc làm phù hợp với AI recommendation' },
                                { icon: <FiUsers size={20} />, text: 'Kết nối trực tiếp với nhà tuyển dụng uy tín' },
                                { icon: <FiTrendingUp size={20} />, text: 'Công cụ xây dựng sự nghiệp miễn phí' },
                                { icon: <FiCheck size={20} />, text: 'Hỗ trợ 24/7 từ đội ngũ chuyên nghiệp' }
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

                    {/* Bottom testimonial */}
                    <div style={{
                        position: 'relative',
                        zIndex: 1,
                        marginTop: 'var(--spacing-2xl)',
                        padding: 'var(--spacing-lg)',
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: 'var(--radius-lg)',
                        borderLeft: '3px solid rgba(255, 255, 255, 0.5)'
                    }}>
                        <p style={{
                            fontSize: '0.9375rem',
                            fontStyle: 'italic',
                            marginBottom: 'var(--spacing-sm)',
                            lineHeight: 1.6
                        }}>
                            "Nền tảng tuyệt vời! Tôi đã tìm được công việc mơ ước chỉ sau 2 tuần."
                        </p>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.875rem',
                                fontWeight: 600
                            }}>
                                NT
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Nguyễn Thành</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Software Engineer</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div style={{
                    padding: 'var(--spacing-3xl)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: '#FAFBFC'
                }}>
                    {/* Header */}
                    <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                        <h2 style={{
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            marginBottom: 'var(--spacing-sm)',
                            color: '#1a1a1a'
                        }}>
                            Chào mừng trở lại! 👋
                        </h2>
                        <p style={{
                            color: '#6B7280',
                            fontSize: '0.9375rem'
                        }}>
                            Chưa có tài khoản?{' '}
                            <Link
                                to="/register"
                                style={{
                                    color: '#1E88E5',
                                    fontWeight: 600,
                                    textDecoration: 'none'
                                }}
                            >
                                Đăng ký ngay
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
                        {/* Email Field */}
                        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                }} size={18} />
                            </div>
                        </div>

                        {/* Password Field */}
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                                }} size={18} />
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
                                        padding: '0.25rem',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div style={{
                            textAlign: 'right',
                            marginBottom: 'var(--spacing-xl)'
                        }}>
                            <Link
                                to="/forgot-password"
                                style={{
                                    color: '#1E88E5',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    textDecoration: 'none'
                                }}
                            >
                                Quên mật khẩu?
                            </Link>
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
                                boxShadow: '0 4px 12px rgba(30, 136, 229, 0.3)'
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
                                    Đăng nhập
                                    <FiArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Accounts */}
                    <div style={{
                        marginTop: 'var(--spacing-xl)',
                        padding: 'var(--spacing-md)',
                        background: 'white',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid #E5E7EB'
                    }}>
                        <p style={{
                            fontSize: '0.75rem',
                            color: '#6B7280',
                            marginBottom: 'var(--spacing-sm)',
                            fontWeight: 600
                        }}>
                            🚀 Tài khoản demo
                        </p>
                        <div style={{ fontSize: '0.6875rem', color: '#9CA3AF', lineHeight: 1.6 }}>
                            <div><strong>UV:</strong> ts1@gmail.com / 123456</div>
                            <div><strong>NTD:</strong> ntd1@gmail.com / 123456</div>
                        </div>
                    </div>
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
