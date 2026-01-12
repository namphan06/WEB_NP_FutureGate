import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Navigate } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

interface CandidateMetadata {
    bio?: string;
    tags?: string[];
    cv_ids?: string[];
    address?: string;
    security?: boolean;
    education?: string;
    experience?: Array<{
        date?: string;
        company?: string;
        position?: string;
        description?: string;
    }>;
    work_types?: string[];
    date_of_birth?: string;
    work_locations?: string[];
    interested_fields?: string[];
}

interface Candidate {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    created_at: string;
    metadata?: CandidateMetadata;
}

export default function SearchCandidatesPage() {
    const { profile } = useAuth();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Only employers can access this page
    if (profile?.role !== 'employer') {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'candidate')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Fetched candidates:', data);

            // Filter candidates with security = true
            const securedCandidates = data?.filter(candidate =>
                candidate.metadata?.security === true
            ) || [];

            console.log('Candidates with security enabled:', securedCandidates);
            setCandidates(securedCandidates);
        } catch (error) {
            console.error('Error fetching candidates:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const filteredCandidates = candidates.filter(candidate =>
        candidate.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        candidate.metadata?.interested_fields?.some(field => field.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const calculateAge = (dateOfBirth?: string) => {
        if (!dateOfBirth) return null;
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    if (loading) {
        return (
            <div className="container section">
                <div className="loading text-center">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="container section">
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ marginBottom: 'var(--spacing-sm)' }}>Tìm kiếm ứng viên</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                    Tìm kiếm và xem thông tin ứng viên
                </p>
            </div>

            {/* Search Box */}
            <div className="card" style={{ marginBottom: 'var(--spacing-xl)', padding: 'var(--spacing-lg)' }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Tìm kiếm theo tên, email, kỹ năng, lĩnh vực..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ fontSize: '1rem' }}
                />
            </div>

            {/* Candidates List */}
            <div>
                <p style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                    Tìm thấy {filteredCandidates.length} ứng viên
                </p>

                {filteredCandidates.length === 0 ? (
                    <div className="card text-center" style={{ padding: 'var(--spacing-xl)' }}>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                            Không tìm thấy ứng viên nào
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1" style={{ gap: 'var(--spacing-md)' }}>
                        {filteredCandidates.map((candidate) => {
                            const metadata = candidate.metadata;
                            const age = calculateAge(metadata?.date_of_birth);
                            const isExpanded = expandedIds.has(candidate.id);

                            return (
                                <div
                                    key={candidate.id}
                                    className="card"
                                    style={{ overflow: 'hidden' }}
                                >
                                    {/* Collapsed View - Always Visible */}
                                    <div
                                        onClick={() => toggleExpand(candidate.id)}
                                        style={{
                                            cursor: 'pointer',
                                            padding: 'var(--spacing-lg)',
                                            transition: 'background var(--transition-fast)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
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
                                                        {age && <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}>({age} tuổi)</span>}
                                                        {metadata?.education && (
                                                            <span className="badge" style={{ marginLeft: '0.5rem', background: 'var(--color-success)', color: 'white', fontSize: '0.75rem' }}>
                                                                {metadata.education}
                                                            </span>
                                                        )}
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
                                                        {metadata?.address && (
                                                            <span className="flex items-center gap-xs">
                                                                <FiMapPin size={14} />
                                                                {metadata.address}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Tags Preview */}
                                                    {metadata?.tags && metadata.tags.length > 0 && (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-sm)' }}>
                                                            {metadata.tags.slice(0, 5).map((tag, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="badge"
                                                                    style={{
                                                                        background: 'var(--color-primary)',
                                                                        color: 'white',
                                                                        fontSize: '0.75rem'
                                                                    }}
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {metadata.tags.length > 5 && (
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                                                    +{metadata.tags.length - 5} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expand Icon */}
                                            <div style={{
                                                padding: 'var(--spacing-sm)',
                                                color: 'var(--color-primary)'
                                            }}>
                                                {isExpanded ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded View - Details */}
                                    {isExpanded && (
                                        <div style={{
                                            padding: '0 var(--spacing-lg) var(--spacing-lg) var(--spacing-lg)',
                                            borderTop: '1px solid var(--color-border)'
                                        }}>
                                            <div style={{ paddingTop: 'var(--spacing-lg)' }}>
                                                {/* Bio */}
                                                {metadata?.bio && (
                                                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                                        <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>
                                                            Giới thiệu
                                                        </h4>
                                                        <div style={{
                                                            padding: 'var(--spacing-md)',
                                                            background: 'var(--color-background)',
                                                            borderRadius: '8px',
                                                            borderLeft: '3px solid var(--color-primary)'
                                                        }}>
                                                            <p style={{
                                                                marginBottom: 0,
                                                                fontSize: '0.9375rem',
                                                                lineHeight: '1.6',
                                                                whiteSpace: 'pre-line'
                                                            }}>
                                                                {metadata.bio}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* All Tags */}
                                                {metadata?.tags && metadata.tags.length > 0 && (
                                                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                                        <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>
                                                            Kỹ năng
                                                        </h4>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                                                            {metadata.tags.map((tag, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="badge"
                                                                    style={{
                                                                        background: 'var(--color-primary)',
                                                                        color: 'white',
                                                                        fontSize: '0.875rem'
                                                                    }}
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Work Info */}
                                                <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                                                    {metadata?.work_types && metadata.work_types.length > 0 && (
                                                        <div>
                                                            <h4 style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-secondary)' }}>
                                                                Hình thức làm việc
                                                            </h4>
                                                            <p style={{ marginBottom: 0, fontSize: '0.9375rem' }}>
                                                                {metadata.work_types.join(', ')}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {metadata?.work_locations && metadata.work_locations.length > 0 && (
                                                        <div>
                                                            <h4 style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-secondary)' }}>
                                                                Địa điểm mong muốn
                                                            </h4>
                                                            <p style={{ marginBottom: 0, fontSize: '0.9375rem' }}>
                                                                {metadata.work_locations.join(', ')}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {metadata?.cv_ids && metadata.cv_ids.length > 0 && (
                                                        <div>
                                                            <h4 style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-secondary)' }}>
                                                                CV đã tạo
                                                            </h4>
                                                            <p style={{ marginBottom: 0, fontSize: '0.9375rem' }}>
                                                                {metadata.cv_ids.length} CV
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Interested Fields */}
                                                {metadata?.interested_fields && metadata.interested_fields.length > 0 && (
                                                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                                        <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>
                                                            Lĩnh vực quan tâm
                                                        </h4>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                                                            {metadata.interested_fields.map((field, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="badge"
                                                                    style={{
                                                                        background: 'var(--color-info)',
                                                                        color: 'white',
                                                                        fontSize: '0.875rem'
                                                                    }}
                                                                >
                                                                    {field}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Experience */}
                                                {metadata?.experience && metadata.experience.length > 0 && (
                                                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                                        <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>
                                                            Kinh nghiệm làm việc
                                                        </h4>
                                                        {metadata.experience.map((exp, index) => (
                                                            <div
                                                                key={index}
                                                                style={{
                                                                    padding: 'var(--spacing-md)',
                                                                    background: 'var(--color-background)',
                                                                    borderRadius: '8px',
                                                                    marginBottom: index < metadata.experience!.length - 1 ? 'var(--spacing-sm)' : 0
                                                                }}
                                                            >
                                                                <p style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                                                                    {exp.position} tại {exp.company}
                                                                </p>
                                                                {exp.date && (
                                                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                                                                        {exp.date}
                                                                    </p>
                                                                )}
                                                                {exp.description && (
                                                                    <p style={{ fontSize: '0.875rem', marginBottom: 0 }}>
                                                                        {exp.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex gap-md">
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(`mailto:${candidate.email}`, '_blank');
                                                        }}
                                                    >
                                                        Liên hệ qua Email
                                                    </button>
                                                    {metadata?.cv_ids && metadata.cv_ids.length > 0 && (
                                                        <button
                                                            className="btn btn-outline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(`/employer/cv/${metadata.cv_ids![0]}?applicant=${candidate.id}`, '_blank');
                                                            }}
                                                        >
                                                            Xem CV
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
