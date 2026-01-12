import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
    FiArrowLeft,
    FiCalendar,
    FiFileText,
    FiTrash2,
    FiSave,
    FiCheck,
    FiPlus,
    FiX,
    FiStar,
    FiAlertCircle,
    FiAward,
    FiMessageSquare,
    FiTag
} from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Interview {
    id: string;
    candidate_id: string;
    job_id: string;
    employer_id: string;
    cv_id?: string;
    interview_time: string;
    job_title: string;
    status: string;
    evaluation: any;
}

interface CandidateProfile {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
}

interface Job {
    id: string;
    title: string;
    metadata: {
        candidate_requirements: string[];
    };
}

export default function InterviewDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [interview, setInterview] = useState<Interview | null>(null);
    const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
    const [job, setJob] = useState<Job | null>(null);

    // Form States
    const [note, setNote] = useState('');
    const [rating, setRating] = useState(0);
    const [positionRating, setPositionRating] = useState(0);
    const [envRating, setEnvRating] = useState(0);
    const [commRating, setCommRating] = useState(0);
    const [potentialRating, setPotentialRating] = useState(0);
    const [reqEval, setReqEval] = useState<Record<string, number>>({});
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (id && user) {
            fetchDetail();
        }
    }, [id, user]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const { data: interviewData, error: interviewError } = await supabase
                .from('interview_schedules')
                .select('*')
                .eq('id', id)
                .single();

            if (interviewError) throw interviewError;
            setInterview(interviewData);
            setStatus(interviewData.status);

            const { data: candidateData } = await supabase
                .from('profiles')
                .select('id, full_name, email, avatar_url')
                .eq('id', interviewData.candidate_id)
                .single();
            setCandidate(candidateData);

            const { data: jobData } = await supabase
                .from('jobs')
                .select('id, title, metadata')
                .eq('id', interviewData.job_id)
                .single();
            setJob(jobData);

            const evalData = interviewData.evaluation || {};
            setNote(evalData.note || '');
            setRating(evalData.rating || 0);
            setPositionRating(evalData.position_rating || 0);
            setEnvRating(evalData.environment_rating || 0);
            setCommRating(evalData.communication_rating || 0);
            setPotentialRating(evalData.potential_rating || 0);
            setTags(evalData.tags || []);

            const savedReqEval = evalData.requirements_evaluation || {};
            const initialReqEval: Record<string, number> = {};
            if (jobData?.metadata?.candidate_requirements) {
                jobData.metadata.candidate_requirements.forEach((req: string) => {
                    initialReqEval[req] = savedReqEval[req] || 0;
                });
            }
            setReqEval(initialReqEval);

        } catch (error: any) {
            console.error('Error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (isDraft: boolean) => {
        setSaving(true);
        try {
            const evaluation = {
                note,
                rating,
                position_rating: positionRating,
                environment_rating: envRating,
                communication_rating: commRating,
                potential_rating: potentialRating,
                requirements_evaluation: reqEval,
                tags,
                updated_at: new Date().toISOString()
            };

            const updates: any = {
                evaluation,
                updated_at: new Date().toISOString()
            };

            if (!isDraft) {
                updates.status = 'completed';
            }

            const { error } = await supabase
                .from('interview_schedules')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            if (!isDraft) {
                setStatus('completed');
                alert('Đã hoàn thành buổi phỏng vấn!');
                navigate('/employer/interviews');
            } else {
                alert('Đã lưu nháp!');
            }
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy lịch phỏng vấn này?')) return;
        try {
            const { error } = await supabase
                .from('interview_schedules')
                .update({ status: 'cancelled', updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
            navigate('/employer/interviews');
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        }
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    if (loading) return (
        <div className="container section center" style={{ height: '60vh' }}>
            <div className="loading">Đang tải chi tiết phỏng vấn...</div>
        </div>
    );

    if (!interview) return <div className="container section">Không tìm thấy dữ liệu</div>;

    return (
        <div className="container section">
            {/* Page Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-outline"
                    style={{
                        padding: '0.75rem',
                        borderRadius: '12px',
                        minWidth: 'auto',
                        border: '1px solid var(--color-border)',
                        background: 'white'
                    }}
                >
                    <FiArrowLeft size={20} />
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 800 }}>Chi tiết phỏng vấn</h1>
                    <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Quản lý và đánh giá ứng viên trong buổi phỏng vấn</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                    {/* 1. Candidate Hero Info */}
                    <div className="card" style={{ padding: '2.5rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '6px',
                            background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))'
                        }} />

                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                border: '4px solid white',
                                boxShadow: 'var(--shadow-md)',
                                background: 'var(--color-primary)',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem',
                                color: 'white',
                                fontWeight: 800
                            }}>
                                {candidate?.avatar_url ? (
                                    <img src={candidate.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    candidate?.full_name?.charAt(0) || 'U'
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800 }}>{candidate?.full_name}</h2>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: 'var(--color-text-secondary)',
                                                fontSize: '1.1rem'
                                            }}>
                                                Vị trí: <strong style={{ color: 'var(--color-primary)' }}>{interview.job_title}</strong>
                                            </span>
                                            <span style={{ color: 'var(--color-border)' }}>|</span>
                                            <span style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>{candidate?.email}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        style={{ height: '54px', padding: '0 1.75rem', fontSize: '1.1rem', borderRadius: '14px', gap: '0.75rem' }}
                                        onClick={() => navigate(`/employer/cv/${interview.cv_id || 'new'}?applicant=${interview.candidate_id}`)}
                                    >
                                        <FiFileText size={22} />
                                        Xem CV đầy đủ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Main Evaluation Form */}
                    <div className="card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{
                                padding: '0.75rem',
                                background: 'rgba(30, 136, 229, 0.1)',
                                color: 'var(--color-primary)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FiStar size={24} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Đánh giá ứng viên</h3>
                        </div>

                        {/* Requirements evaluation */}
                        {job?.metadata?.candidate_requirements && job.metadata.candidate_requirements.length > 0 && (
                            <div style={{ marginBottom: '3.5rem' }}>
                                <h4 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FiAward style={{ color: 'var(--color-text-secondary)' }} />
                                    Mức độ đáp ứng yêu cầu công việc
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'x: 3rem, y: 2rem', columnGap: '3rem', rowGap: '2rem' }}>
                                    {job.metadata.candidate_requirements.map(req => (
                                        <div key={req}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{req}</span>
                                                <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.1rem' }}>{reqEval[req] || 0}/10</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0" max="10" step="1"
                                                className="modern-slider"
                                                value={reqEval[req] || 0}
                                                onChange={(e) => setReqEval({ ...reqEval, [req]: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Detailed Ratings */}
                        <div style={{ marginBottom: '3.5rem' }}>
                            <h4 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FiStar style={{ color: 'var(--color-text-secondary)' }} />
                                Tiêu chí chuyên môn & Văn hóa
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem 3rem' }}>
                                <div className="rating-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{ fontWeight: 600 }}>Cấp độ phù hợp vị trí</span>
                                        <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{positionRating}/10</span>
                                    </div>
                                    <input type="range" min="0" max="10" className="modern-slider" value={positionRating} onChange={(e) => setPositionRating(parseInt(e.target.value))} />
                                </div>
                                <div className="rating-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{ fontWeight: 600 }}>Phù hợp văn hóa</span>
                                        <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{envRating}/10</span>
                                    </div>
                                    <input type="range" min="0" max="10" className="modern-slider" value={envRating} onChange={(e) => setEnvRating(parseInt(e.target.value))} />
                                </div>
                                <div className="rating-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{ fontWeight: 600 }}>Kỹ năng giao tiếp</span>
                                        <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{commRating}/10</span>
                                    </div>
                                    <input type="range" min="0" max="10" className="modern-slider" value={commRating} onChange={(e) => setCommRating(parseInt(e.target.value))} />
                                </div>
                                <div className="rating-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{ fontWeight: 600 }}>Tiềm năng phát triển</span>
                                        <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{potentialRating}/10</span>
                                    </div>
                                    <input type="range" min="0" max="10" className="modern-slider" value={potentialRating} onChange={(e) => setPotentialRating(parseInt(e.target.value))} />
                                </div>
                            </div>
                        </div>

                        {/* Overall Rating Premium Section */}
                        <div style={{
                            marginBottom: '3.5rem',
                            background: 'linear-gradient(135deg, rgba(30, 136, 229, 0.05) 0%, rgba(30, 136, 229, 0.1) 100%)',
                            padding: '2.5rem',
                            borderRadius: '24px',
                            border: '1px solid rgba(30, 136, 229, 0.2)',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Đánh giá chung</span>
                                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-text-secondary)' }}>Điểm số quyết định mức độ ưu tiên của ứng viên</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FABB05', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{rating}/5.0</span>
                                    <div style={{ display: 'flex', color: '#FABB05', justifyContent: 'flex-end', fontSize: '1.25rem', marginTop: '-5px' }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <FiStar key={s} style={{ fill: rating >= s ? '#FABB05' : 'transparent', opacity: rating >= s ? 1 : 0.3 }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <input
                                type="range"
                                min="0" max="5" step="0.5"
                                className="overall-slider"
                                value={rating}
                                onChange={(e) => setRating(parseFloat(e.target.value))}
                            />
                        </div>

                        {/* Note Input */}
                        <div style={{ marginBottom: '3.5rem' }}>
                            <h4 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FiMessageSquare style={{ color: 'var(--color-text-secondary)' }} />
                                Ghi chú & Nhận xét chi tiết
                            </h4>
                            <textarea
                                className="form-input"
                                style={{
                                    minHeight: '200px',
                                    fontSize: '1.125rem',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    border: '1px solid var(--color-border)',
                                    lineHeight: '1.7'
                                }}
                                placeholder="Hãy mô tả chi tiết về năng lực, thái độ và cảm nhận của bạn về ứng viên sau buổi phỏng vấn..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>

                        {/* Tags System */}
                        <div>
                            <h4 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FiTag style={{ color: 'var(--color-text-secondary)' }} />
                                Tags nhận diện
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', marginBottom: '1.5rem' }}>
                                {tags.map(tag => (
                                    <span key={tag} className="chip" style={{
                                        padding: '0.625rem 1.25rem',
                                        borderRadius: 'var(--radius-full)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.625rem',
                                        fontSize: '1.05rem',
                                        background: 'var(--color-surface)',
                                        color: 'var(--color-primary)',
                                        border: '1px solid var(--color-primary)',
                                        fontWeight: 600,
                                        boxShadow: 'var(--shadow-sm)'
                                    }}>
                                        {tag}
                                        <FiX style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => removeTag(tag)} />
                                    </span>
                                ))}
                                {tags.length === 0 && (
                                    <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Chưa có tag nào. Hãy thêm tag để phân loại ứng viên nhanh chóng.</p>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ position: 'relative', maxWidth: '400px', flex: 1 }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Ví dụ: Kỹ năng quản lý, Tiếng Anh tốt..."
                                        style={{ height: '52px', borderRadius: '12px', paddingLeft: '1rem' }}
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                    />
                                </div>
                                <button
                                    className="btn btn-outline"
                                    style={{ height: '52px', padding: '0 1.5rem', borderRadius: '12px' }}
                                    onClick={addTag}
                                >
                                    <FiPlus /> Thêm Tag
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SIDEBAR INFO --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '120px' }}>

                    {/* Time & Logistics Card */}
                    <div className="card" style={{ padding: '2rem', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ color: 'var(--color-primary)', background: 'rgba(30, 136, 229, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                                <FiCalendar size={20} />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Thời gian phỏng vấn</span>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)' }}>
                                {format(parseISO(interview.interview_time), 'HH:mm')}
                            </div>
                            <div style={{
                                fontSize: '1.125rem',
                                color: 'var(--color-text-secondary)',
                                fontWeight: 500,
                                textTransform: 'capitalize'
                            }}>
                                {format(parseISO(interview.interview_time), 'EEEE, dd/MM/yyyy', { locale: vi })}
                            </div>
                        </div>

                        <div style={{ background: 'var(--color-background)', padding: '1.25rem', borderRadius: '16px' }}>
                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>Trạng thái hiện tại</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.125rem', fontWeight: 800 }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 8px currentColor',
                                    background: status === 'completed' ? '#1E7E34' : status === 'scheduled' ? '#FABB05' : '#D93025',
                                    color: status === 'completed' ? '#1E7E34' : status === 'scheduled' ? '#FABB05' : '#D93025'
                                }} />
                                {status.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {/* Actions Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {status !== 'completed' && (
                            <>
                                <button
                                    disabled={saving}
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        height: '64px',
                                        fontSize: '1.25rem',
                                        borderRadius: '16px',
                                        boxShadow: '0 8px 20px rgba(30, 136, 229, 0.3)'
                                    }}
                                    onClick={() => handleSave(false)}
                                >
                                    <FiCheck size={24} /> Hoàn thành & Lưu
                                </button>
                                <button
                                    disabled={saving}
                                    className="btn btn-outline"
                                    style={{
                                        width: '100%',
                                        height: '64px',
                                        fontSize: '1.125rem',
                                        borderRadius: '16px',
                                        background: 'white'
                                    }}
                                    onClick={() => handleSave(true)}
                                >
                                    <FiSave /> Lưu nháp đánh giá
                                </button>

                                <div style={{ height: '1px', background: 'var(--color-divider)', margin: '0.5rem 0' }} />

                                <button
                                    className="btn btn-outline"
                                    style={{
                                        width: '100%',
                                        color: 'var(--color-error)',
                                        borderColor: 'transparent',
                                        fontSize: '1.1rem'
                                    }}
                                    onClick={handleCancel}
                                >
                                    <FiTrash2 /> Hủy lịch phỏng vấn
                                </button>
                            </>
                        )}

                        {status === 'completed' && (
                            <div className="card" style={{
                                padding: '2rem',
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #E6F4EA 0%, #CEEAD6 100%)',
                                borderRadius: '24px',
                                border: '1px solid #1E7E34'
                            }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                    color: '#1E7E34',
                                    boxShadow: 'var(--shadow-md)'
                                }}>
                                    <FiCheck size={32} />
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1E7E34' }}>Đã hoàn thành</div>
                                <p style={{ margin: '0.5rem 0 0 0', color: '#176B2D', fontSize: '0.9rem' }}>Đánh giá đã được lưu vào hệ thống</p>
                            </div>
                        )}
                    </div>

                    {/* Pro Tips Section */}
                    <div className="card" style={{
                        padding: '2rem',
                        background: 'var(--color-text)',
                        color: 'white',
                        borderRadius: '24px',
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', color: 'var(--color-primary-light)' }}>
                            <FiAlertCircle size={22} />
                            <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>Lời khuyên tuyển dụng</span>
                        </div>
                        <ul style={{
                            margin: 0,
                            paddingLeft: '1.25rem',
                            fontSize: '1rem',
                            color: 'rgba(255,255,255,0.7)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            lineHeight: '1.5'
                        }}>
                            <li>Ghi chú ngay các <strong>điểm mạnh/yếu</strong> nổi bật của ứng viên.</li>
                            <li>Đánh giá dựa trên bài <strong>Job Description</strong> để có cái nhìn khách quan.</li>
                            <li>Sử dụng <strong>Tags</strong> để lọc nhanh ứng viên ở vòng tiếp theo.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style>{`
                .modern-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 8px;
                    border-radius: 10px;
                    background: #E9ECEF;
                    outline: none;
                    margin: 12px 0;
                }
                .modern-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: var(--color-primary);
                    cursor: pointer;
                    border: 3px solid white;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                    transition: transform 0.2s;
                }
                .modern-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.15);
                }
                
                .overall-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 12px;
                    border-radius: 10px;
                    background: #DEE2E6;
                    outline: none;
                    margin: 15px 0;
                }
                .overall-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #FABB05;
                    cursor: pointer;
                    border: 4px solid white;
                    box-shadow: 0 4px 15px rgba(250, 187, 5, 0.4);
                    transition: transform 0.2s;
                }
                .overall-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                }
                
                input[type=range] {
                    cursor: pointer;
                }
                
                .rating-group:hover span {
                    color: var(--color-primary);
                }
            `}</style>
        </div>
    );
}
