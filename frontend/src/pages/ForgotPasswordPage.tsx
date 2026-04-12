import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FiMail, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Không thể gửi email đặt lại mật khẩu');
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
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '15%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(30, 136, 229, 0.08) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(80px)'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                left: '15%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(30, 136, 229, 0.06) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)'
            }} />

            <div className="animate-fade-in-up" style={{
                background: 'white',
                borderRadius: 'var(--radius-2xl)',
                boxShadow: '0 20px 60px rgba(30, 136, 229, 0.1), 0 0 1px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '480px',
                position: 'relative',
                zIndex: 1,
                padding: 'var(--spacing-2xl)'
            }}>
                <Link
                    to="/login"
                    className="btn btn-ghost"
                    style={{ marginBottom: 'var(--spacing-xl)', display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--color-text-secondary)', padding: 'var(--spacing-sm) var(--spacing-md)' }}
                >
                    <FiArrowLeft size={18} />
                    Quay lại đăng nhập
                </Link>

                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: 'var(--radius-xl)',
                        background: 'linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--spacing-lg)'
                    }}>
                        <FiMail size={36} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 'var(--spacing-sm)', color: 'var(--color-text)' }}>
                        Quên mật khẩu?
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', marginBottom: 0 }}>
                        Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
                    </p>
                </div>

                {error && (
                    <div className="animate-fade-in" style={{
                        padding: 'var(--spacing-md)',
                        background: 'var(--color-error-light)',
                        border: '1px solid var(--color-error)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-error-dark)',
                        marginBottom: 'var(--spacing-lg)',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)'
                    }}>
                        <FiAlertCircle size={18} />
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="animate-scale-in" style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--color-success-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto var(--spacing-lg)'
                        }}>
                            <FiCheckCircle size={36} style={{ color: 'var(--color-success)' }} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--spacing-sm)', color: 'var(--color-text)' }}>
                            Email đã được gửi!
                        </h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', marginBottom: 'var(--spacing-xl)' }}>
                            Kiểm tra hộp thư của bạn tại <strong>{email}</strong> và làm theo hướng dẫn để đặt lại mật khẩu.
                        </p>
                        <Link to="/login" className="btn btn-primary btn-block">
                            Quay lại đăng nhập
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div className="input-group">
                                <FiMail className="input-icon" size={18} />
                                <input
                                    type="email"
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    required
                                    style={{ paddingLeft: '3rem' }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary btn-block btn-lg"
                        >
                            {loading ? (
                                <>
                                    <div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                                    Đang gửi email...
                                </>
                            ) : (
                                'Gửi link đặt lại mật khẩu'
                            )}
                        </button>

                        <p style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                            Nhớ mật khẩu?{' '}
                            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
