
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Navigate, useNavigate } from 'react-router-dom';
import { FiMail, FiPhone, FiTrash2, FiUser } from 'react-icons/fi';

interface Candidate {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    metadata?: any;
}

export default function SavedCandidatesPage() {
    const { profile, user } = useAuth();
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    // Only employers can access this page
    if (profile?.role !== 'employer') {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        fetchSavedCandidates();
    }, [user, profile]);

    const fetchSavedCandidates = async () => {
        if (!user || !profile) return;

        try {
            setLoading(true);

            // Get saved candidate IDs from company_followers table
            // Based on database schema: candidate_id, employer_id, followed_by
            const { data: followData, error: followError } = await supabase
                .from('company_followers')
                .select('candidate_id')
                .eq('employer_id', user.id)
                .eq('followed_by', 'employer');

            if (followError) throw followError;

            const savedIds = followData?.map(f => f.candidate_id) || [];

            if (savedIds.length === 0) {
                setCandidates([]);
                return;
            }

            // Fetch profiles for these IDs
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('id', savedIds);

            if (error) throw error;
            setCandidates(data || []);
        } catch (error) {
            console.error('Error fetching saved candidates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (candidateId: string) => {
        if (!user || !profile) return;

        try {
            const { error } = await supabase
                .from('company_followers')
                .delete()
                .eq('employer_id', user.id)
                .eq('candidate_id', candidateId)
                .eq('followed_by', 'employer');

            if (error) throw error;

            // Update local state
            setCandidates(prev => prev.filter(c => c.id !== candidateId));

            alert('Đã xóa khỏi danh sách lưu');
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="container section">
                <div className="loading text-center">Đang tải ứng viên đã lưu...</div>
            </div>
        );
    }

    return (
        <div className="container section">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ marginBottom: 'var(--spacing-sm)' }}>Ứng viên đã lưu</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                    Danh sách các ứng viên bạn đã quan tâm và lưu lại
                </p>
            </div>

            {candidates.length === 0 ? (
                <div className="card text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                    <FiUser size={64} style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)', opacity: 0.5 }} />
                    <h3>Chưa có ứng viên nào được lưu</h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                        Tìm kiếm và lưu các ứng viên tiềm năng để theo dõi sau
                    </p>
                    <button onClick={() => navigate('/employer/candidates')} className="btn btn-primary">
                        Tìm kiếm ứng viên ngay
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1" style={{ gap: 'var(--spacing-md)' }}>
                    {candidates.map((candidate) => (
                        <div key={candidate.id} className="card" style={{ padding: 'var(--spacing-lg)' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-md" style={{ flex: 1 }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: candidate.avatar_url
                                            ? `url(${candidate.avatar_url}) center/cover`
                                            : 'var(--color-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        flexShrink: 0
                                    }}>
                                        {!candidate.avatar_url && (candidate.full_name?.charAt(0) || 'U')}
                                    </div>

                                    {/* Basic Info */}
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                                            {candidate.full_name}
                                        </h3>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                            <span className="flex items-center gap-xs">
                                                <FiMail size={14} />
                                                {candidate.email}
                                            </span>
                                            {candidate.phone && (
                                                <span className="flex items-center gap-xs">
                                                    <FiPhone size={14} />
                                                    {candidate.phone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-md">
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => navigate(`/employer/cv/${candidate.metadata?.cv_ids?.[0] || 'new'}?applicant=${candidate.id}`)}
                                    >
                                        Xem CV
                                    </button>
                                    <button
                                        className="btn btn-sm"
                                        style={{ background: 'var(--color-error)', color: 'white', minWidth: 'auto', padding: '0.5rem' }}
                                        onClick={() => handleRemove(candidate.id)}
                                        title="Bỏ lưu"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
