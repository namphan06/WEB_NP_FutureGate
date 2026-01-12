import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiArrowLeft } from 'react-icons/fi';


interface UserInfo {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
}

export default function EmployerViewCVPage() {
    const { cvId } = useParams<{ cvId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [applicantInfo, setApplicantInfo] = useState<any>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const applicantId = searchParams.get('applicant');

    useEffect(() => {
        fetchApplicantInfo();
    }, [cvId, applicantId]);

    const fetchApplicantInfo = async () => {
        if (!cvId || !applicantId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Fetch user information
            const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', applicantId)
                .single();

            if (userError) throw userError;
            setUserInfo(userData);

            // Try to fetch CV data
            const { data: cvData, error: cvError } = await supabase
                .from('cvs')
                .select('*')
                .eq('id', cvId)
                .single();

            if (!cvError && cvData) {
                setApplicantInfo(cvData);
            }

        } catch (error) {
            console.error('Error fetching applicant info:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container section">
                <div className="loading text-center">Đang tải thông tin ứng viên...</div>
            </div>
        );
    }

    return (
        <div className="container section">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="btn btn-outline"
                style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <FiArrowLeft size={18} />
                Quay lại
            </button>

            {/* Applicant Info Container */}
            <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
                <h2 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-primary)' }}>
                    Thông tin ứng viên
                </h2>

                {/* User Information */}
                {userInfo && (
                    <div style={{
                        background: '#f5f5f5',
                        padding: 'var(--spacing-lg)',
                        borderRadius: '8px',
                        marginBottom: 'var(--spacing-lg)'
                    }}>
                        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Thông tin cơ bản</h3>
                        <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                            <p style={{ marginBottom: 0 }}>
                                <strong>Họ tên:</strong> {userInfo.full_name}
                            </p>
                            <p style={{ marginBottom: 0 }}>
                                <strong>Email:</strong> {userInfo.email}
                            </p>
                            {userInfo.phone && (
                                <p style={{ marginBottom: 0 }}>
                                    <strong>Số điện thoại:</strong> {userInfo.phone}
                                </p>
                            )}
                            <p style={{ marginBottom: 0 }}>
                                <strong>User ID:</strong> {userInfo.id}
                            </p>
                        </div>
                    </div>
                )}

                {/* CV Information */}
                {applicantInfo ? (
                    <div>
                        <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-primary)' }}>
                            Thông tin CV
                        </h3>
                        <div style={{
                            background: '#f5f5f5',
                            padding: 'var(--spacing-lg)',
                            borderRadius: '8px',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            <p style={{ marginBottom: 'var(--spacing-sm)' }}>
                                <strong>CV ID:</strong> {applicantInfo.id}
                            </p>
                            <p style={{ marginBottom: 'var(--spacing-sm)' }}>
                                <strong>Tiêu đề:</strong> {applicantInfo.title}
                            </p>
                            <p style={{ marginBottom: 'var(--spacing-sm)' }}>
                                <strong>Ngày tạo:</strong> {new Date(applicantInfo.created_at).toLocaleString('vi-VN')}
                            </p>
                            <p style={{ marginBottom: 0 }}>
                                <strong>Cập nhật lần cuối:</strong> {new Date(applicantInfo.updated_at).toLocaleString('vi-VN')}
                            </p>
                        </div>

                        <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Dữ liệu CV (JSON):</h4>
                        <pre style={{
                            background: '#f5f5f5',
                            padding: 'var(--spacing-lg)',
                            borderRadius: '8px',
                            overflow: 'auto',
                            fontSize: '0.875rem',
                            lineHeight: '1.6',
                            maxHeight: '500px'
                        }}>
                            {JSON.stringify(applicantInfo.data, null, 2)}
                        </pre>
                    </div>
                ) : (
                    <div style={{
                        background: '#fff3cd',
                        padding: 'var(--spacing-lg)',
                        borderRadius: '8px',
                        border: '1px solid #ffc107'
                    }}>
                        <p style={{ marginBottom: 0, color: '#856404' }}>
                            <strong>Lưu ý:</strong> Ứng viên chưa có CV trong hệ thống hoặc CV không tồn tại.
                        </p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-md" style={{ marginTop: 'var(--spacing-lg)' }}>
                {applicantInfo && (
                    <button
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(applicantInfo.data, null, 2))}
                        className="btn btn-outline"
                    >
                        Copy CV JSON
                    </button>
                )}
                {userInfo && (
                    <button
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(userInfo, null, 2))}
                        className="btn btn-outline"
                    >
                        Copy User Info
                    </button>
                )}
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-primary"
                >
                    Quay lại
                </button>
            </div>
        </div>
    );
}
