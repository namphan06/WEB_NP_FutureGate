import { useState, useEffect } from 'react';
import { supabase, MI_INTELLIGENCE_LABELS } from '../../lib/supabase';
import type { MIQuestion, MIIntelligenceType } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
    FiSearch, FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiCheckCircle
} from 'react-icons/fi';
import { Navigate } from 'react-router-dom';

const TYPE_COLORS: Record<MIIntelligenceType, { bg: string, text: string, dot: string }> = {
    IA: { bg: '#EEF2FF', text: '#4338CA', dot: '#6366F1' },
    IE: { bg: '#ECFDF5', text: '#047857', dot: '#10B981' },
    LO: { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
    LI: { bg: '#FFF7ED', text: '#C2410C', dot: '#F97316' },
    SP: { bg: '#FAF5FF', text: '#7E22CE', dot: '#A855F7' },
    BO: { bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444' },
    MU: { bg: '#F5F3FF', text: '#6D28D9', dot: '#8B5CF6' },
    NA: { bg: '#F0FDF4', text: '#15803D', dot: '#22C55E' },
    EX: { bg: '#F8FAFC', text: '#334155', dot: '#64748B' },
};

export default function AdminMIQuestionsPage() {
    const { profile } = useAuth();
    const [questions, setQuestions] = useState<MIQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<MIIntelligenceType | 'all'>('all');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<MIQuestion | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        question_text: '',
        intelligence_type: 'IA' as MIIntelligenceType,
        order: 0,
        is_active: true
    });

    // Only admins can access
    if (profile?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        fetchQuestions();
    }, [typeFilter]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('mi_questions')
                .select('*')
                .order('order', { ascending: true });

            if (typeFilter !== 'all') {
                query = query.eq('intelligence_type', typeFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setQuestions(data || []);
        } catch (error) {
            console.error('Error fetching MI questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            question_text: '',
            intelligence_type: 'IA',
            order: questions.length,
            is_active: true
        });
        setEditingQuestion(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (question: MIQuestion) => {
        setEditingQuestion(question);
        setFormData({
            question_text: question.question_text,
            intelligence_type: question.intelligence_type,
            order: question.order,
            is_active: question.is_active
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.question_text.trim()) {
            alert('Vui lòng nhập nội dung câu hỏi');
            return;
        }

        setSaving(true);
        try {
            if (editingQuestion) {
                const { error } = await supabase
                    .from('mi_questions')
                    .update({
                        question_text: formData.question_text,
                        intelligence_type: formData.intelligence_type,
                        order: formData.order,
                        is_active: formData.is_active,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editingQuestion.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('mi_questions')
                    .insert({
                        question_text: formData.question_text,
                        intelligence_type: formData.intelligence_type,
                        order: formData.order,
                        is_active: formData.is_active
                    });
                if (error) throw error;
            }

            setShowModal(false);
            resetForm();
            fetchQuestions();
            alert(editingQuestion ? 'Đã cập nhật câu hỏi thành công!' : 'Đã thêm câu hỏi mới thành công!');
        } catch (error) {
            console.error('Error saving:', error);
            alert('Có lỗi xảy ra khi lưu');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xoá câu hỏi này? Thao tác này không thể hoàn tác.')) return;

        try {
            const { error } = await supabase
                .from('mi_questions')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchQuestions();
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Có lỗi xảy ra khi xoá');
        }
    };

    const toggleStatus = async (question: MIQuestion) => {
        try {
            const { error } = await supabase
                .from('mi_questions')
                .update({ is_active: !question.is_active })
                .eq('id', question.id);
            if (error) throw error;
            fetchQuestions();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const filteredQuestions = questions.filter(q =>
        q.question_text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: questions.length,
        active: questions.filter(q => q.is_active).length,
        hidden: questions.filter(q => !q.is_active).length
    };

    return (
        <div style={{ background: '#F0F2F5', minHeight: '100vh', padding: '2rem 3rem' }}>
            {/* Header & Stats */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                            Ngân hàng câu hỏi MI
                        </h1>
                        <p style={{ color: '#64748B', fontSize: '1.05rem', margin: 0 }}>
                            Quản lý các tiêu chí đánh giá cho hệ thống Trắc nghiệm Đa trí tuệ
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="btn-premium-primary"
                        style={{
                            height: '52px', borderRadius: '14px', padding: '0 1.75rem', fontSize: '0.95rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#4F46E5', color: 'white', border: 'none',
                            cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s'
                        }}
                    >
                        <FiPlus size={22} /> Thêm câu hỏi
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    {[
                        { label: 'Tổng số câu hỏi', value: stats.total, color: '#4F46E5', bg: '#EEF2FF' },
                        { label: 'Đang hoạt động', value: stats.active, color: '#10B981', bg: '#ECFDF5' },
                        { label: 'Câu hỏi tạm ẩn', value: stats.hidden, color: '#F43F5E', bg: '#FFF1F2' },
                    ].map((stat, idx) => (
                        <div key={idx} style={{
                            background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0',
                            display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                {idx === 0 ? <FiSearch size={24} /> : idx === 1 ? <FiCheckCircle size={24} /> : <FiX size={24} />}
                            </div>
                            <div>
                                <div style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 600 }}>{stat.label}</div>
                                <div style={{ color: '#1E293B', fontSize: '1.5rem', fontWeight: 800 }}>{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Card */}
            <div style={{
                background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden'
            }}>
                {/* Search & Filter Bar */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm nội dung câu hỏi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', height: '48px', paddingLeft: '2.75rem', borderRadius: '12px',
                                border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem', transition: 'all 0.2s', background: '#F8FAFC'
                            }}
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        style={{
                            height: '48px', padding: '0 1rem', borderRadius: '12px', border: '1px solid #E2E8F0',
                            outline: 'none', fontWeight: 600, color: '#1E293B', background: '#F8FAFC', minWidth: '220px'
                        }}
                    >
                        <option value="all">Tất cả loại trí tuệ</option>
                        {Object.entries(MI_INTELLIGENCE_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>

                {/* List Header */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '80px 1fr 280px 180px 120px',
                    padding: '1rem 2rem', background: '#F8FAFC', borderBottom: '1px solid #F1F5F9',
                    fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                    <span>STT</span>
                    <span>Nội dung câu hỏi</span>
                    <span>Phân loại trí tuệ</span>
                    <span style={{ textAlign: 'center' }}>Trạng thái</span>
                    <span style={{ textAlign: 'right' }}>Thao tác</span>
                </div>

                {/* List Content */}
                <div style={{ maxHeight: 'calc(100vh - 450px)', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>
                            <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                            Đang tải dữ liệu...
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <FiSearch size={32} style={{ color: '#94A3B8' }} />
                            </div>
                            <h3 style={{ color: '#1E293B', margin: '0 0 0.5rem' }}>Không tìm thấy kết quả</h3>
                            <p style={{ color: '#64748B', margin: 0 }}>Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
                        </div>
                    ) : (
                        filteredQuestions.map((q) => {
                            const typeStyle = TYPE_COLORS[q.intelligence_type] || TYPE_COLORS.EX;
                            return (
                                <div key={q.id} className="question-row" style={{
                                    display: 'grid', gridTemplateColumns: '80px 1fr 280px 180px 120px',
                                    padding: '1.25rem 2rem', borderBottom: '1px solid #F1F5F9', alignItems: 'center',
                                    transition: 'all 0.2s', cursor: 'default'
                                }}>
                                    <span style={{ fontWeight: 600, color: '#94A3B8' }}>{String(q.order).padStart(2, '0')}</span>
                                    <div style={{
                                        fontWeight: 600, color: '#1E293B', fontSize: '0.95rem', lineHeight: '1.5',
                                        paddingRight: '2rem'
                                    }}>
                                        {q.question_text}
                                    </div>
                                    <div>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.4rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem',
                                            fontWeight: 700, background: typeStyle.bg, color: typeStyle.text
                                        }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: typeStyle.dot }}></span>
                                            {MI_INTELLIGENCE_LABELS[q.intelligence_type]}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <button
                                            onClick={() => toggleStatus(q)}
                                            style={{
                                                padding: '0.4rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem',
                                                fontWeight: 700, border: 'none', cursor: 'pointer',
                                                background: q.is_active ? '#D1FAE5' : '#FEE2E2',
                                                color: q.is_active ? '#065F46' : '#991B1B',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {q.is_active ? 'Đang hiện' : 'Đang ẩn'}
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => openEditModal(q)}
                                            style={{
                                                width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0',
                                                color: '#64748B', cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                            title="Sửa"
                                        >
                                            <FiEdit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(q.id)}
                                            style={{
                                                width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', background: '#FFF1F2', border: '1px solid #FECDD3',
                                                color: '#E11D48', cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                            title="Xóa"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div style={{
                        background: 'white', width: '100%', maxWidth: '640px', borderRadius: '28px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', animation: 'modalIn 0.3s ease-out'
                    }}>
                        <div style={{
                            padding: '1.75rem 2rem', background: '#0F172A', color: 'white',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{editingQuestion ? 'Cập nhật câu hỏi' : 'Tạo câu hỏi mới'}</h2>
                                <p style={{ margin: '0.25rem 0 0', opacity: 0.7, fontSize: '0.85rem' }}>Điền đầy đủ thông tin bên dưới</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                                    width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                            <div style={{ marginBottom: '1.75rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Nội dung câu hỏi</label>
                                <textarea
                                    placeholder="Ví dụ: Tôi thường thích giải các câu đố logic và toán học..."
                                    value={formData.question_text}
                                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                                    style={{
                                        width: '100%', minHeight: '120px', padding: '1rem', borderRadius: '16px',
                                        border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC',
                                        fontSize: '0.95rem', resize: 'vertical', lineHeight: '1.5'
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Loại trí tuệ liên quan</label>
                                <select
                                    value={formData.intelligence_type}
                                    onChange={(e) => setFormData({ ...formData, intelligence_type: e.target.value as MIIntelligenceType })}
                                    style={{
                                        width: '100%', height: '54px', padding: '0 1rem', borderRadius: '14px',
                                        border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC',
                                        fontSize: '0.95rem', fontWeight: 600
                                    }}
                                    required
                                >
                                    {Object.entries(MI_INTELLIGENCE_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem',
                                background: '#F8FAFC', borderRadius: '16px', marginBottom: '2.5rem', cursor: 'pointer'
                            }} onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}>
                                <div style={{
                                    width: '44px', height: '24px', background: formData.is_active ? '#10B981' : '#CBD5E1',
                                    borderRadius: '12px', position: 'relative', transition: 'all 0.3s'
                                }}>
                                    <div style={{
                                        width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                                        position: 'absolute', top: '3px', left: formData.is_active ? '23px' : '3px',
                                        transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}></div>
                                </div>
                                <span style={{ fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>Hiển thị ngay cho người dùng</span>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        flex: 1, height: '56px', borderRadius: '16px', background: 'white',
                                        border: '1px solid #E2E8F0', fontWeight: 700, color: '#64748B', cursor: 'pointer'
                                    }}
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        flex: 1.5, height: '56px', borderRadius: '16px', background: '#0F172A',
                                        border: 'none', fontWeight: 700, color: 'white', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                        boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)'
                                    }}
                                >
                                    {saving ? 'Đang xử lý...' : (
                                        <>
                                            <FiSave size={20} />
                                            {editingQuestion ? 'Cập nhật thay đổi' : 'Lưu câu hỏi mới'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modalIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .question-row:hover {
                    background-color: #F8FAFC;
                    transform: translateX(4px);
                }
                .question-row:hover div:first-of-type {
                    color: #4F46E5 !important;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #F1F5F9;
                    border-top: 4px solid #4F46E5;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .btn-premium-primary:hover {
                    background: #4338CA !important;
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
}
