import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
    Search, School, User, CheckCircle, AlertCircle,
    Star, Calendar, Briefcase, FileText, Plus, X, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface StudentWorkProgress {
    id: string;
    student_id: string;
    company_id: string;
    school_id: string;
    position: string;
    work_duration?: string;
    evaluator_name?: string;
    evaluations?: Array<{
        criteria: string;
        score: number;
        comment: string;
    }>;
    work_roadmap?: Array<{
        task: string;
        result: string;
        deadline: string;
    }>;
    student?: {
        full_name: string;
        email: string;
        avatar_url?: string;
    };
    school?: {
        full_name: string;
        email: string;
    };
}

export default function InternEvaluationPage() {
    const { user } = useAuth();
    const [records, setRecords] = useState<StudentWorkProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<StudentWorkProgress | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('student_work_progress')
                .select('*')
                .eq('company_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching work progress:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                console.log('No data found for company_id:', user.id);
                setRecords([]);
                setLoading(false);
                return;
            }

            console.log('Raw data from DB:', data);
            const allRecords = data as any[];

            // Fetch student & school profiles
            // Fallback to user_id if student_id is null
            const studentIds = [...new Set(allRecords.map(r => r.student_id || r.user_id).filter(Boolean))];
            const schoolIds = [...new Set(allRecords.map(r => r.school_id).filter(Boolean))];

            console.log('Student IDs identified:', studentIds);
            console.log('School IDs identified:', schoolIds);

            const studentsMap: Record<string, any> = {};
            const schoolsMap: Record<string, any> = {};

            // Fetch students
            if (studentIds.length > 0) {
                const { data: studentsData, error: studentsError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, avatar_url')
                    .in('id', studentIds);

                if (studentsError) {
                    console.error('Error fetching students:', studentsError);
                } else if (studentsData) {
                    studentsData.forEach(s => studentsMap[s.id] = s);
                }
            }

            // Fetch schools
            if (schoolIds.length > 0) {
                const { data: schoolsData, error: schoolsError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .in('id', schoolIds);

                if (schoolsError) {
                    console.error('Error fetching schools:', schoolsError);
                } else if (schoolsData) {
                    schoolsData.forEach(s => schoolsMap[s.id] = s);
                }
            }

            const enriched = allRecords.map(r => {
                const sId = r.student_id || r.user_id;
                return {
                    ...r,
                    student: studentsMap[sId] || { full_name: 'Chưa cập nhật tên', email: 'No email' },
                    school: schoolsMap[r.school_id] || { full_name: 'Không xác định', email: '' }
                };
            });

            console.log('Final enriched records:', enriched);
            setRecords(enriched);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRecords = records.filter(r => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            r.student?.full_name?.toLowerCase().includes(q) ||
            r.student?.email?.toLowerCase().includes(q) ||
            r.school?.full_name?.toLowerCase().includes(q) ||
            r.school?.email?.toLowerCase().includes(q)
        );
    });

    const groupedBySchool = filteredRecords.reduce((acc, record) => {
        const schoolName = record.school?.full_name || 'Không xác định';
        if (!acc[schoolName]) acc[schoolName] = [];
        acc[schoolName].push(record);
        return acc;
    }, {} as Record<string, StudentWorkProgress[]>);

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '2.5rem 50px' }}>
            {/* Header */}
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>
                    Đánh giá sinh viên thực tập
                </h1>
                <p style={{ color: '#64748B', fontSize: '1.1rem', margin: 0 }}>
                    Quản lý và đánh giá quá trình thực tập của sinh viên
                </p>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ position: 'relative', maxWidth: '500px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email, trường..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', height: '54px', paddingLeft: '3rem', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'white', fontSize: '1rem' }}
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="loading">Đang tải dữ liệu...</div>
                </div>
            ) : filteredRecords.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <User size={48} style={{ color: '#E2E8F0' }} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B' }}>
                        {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có sinh viên nào'}
                    </h3>
                    <p style={{ color: '#64748B', maxWidth: '400px', margin: '1rem auto' }}>
                        Danh sách sinh viên thực tập sẽ xuất hiện tại đây.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {Object.entries(groupedBySchool).map(([schoolName, students]) => (
                        <div key={schoolName} style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                            {/* School Header */}
                            <div style={{ padding: '1.5rem 2rem', background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <School size={24} style={{ color: 'white' }} />
                                <h3 style={{ flex: 1, margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>{schoolName}</h3>
                                <div style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>
                                    {students.length} SV
                                </div>
                            </div>

                            {/* Students List */}
                            <div style={{ padding: '0.5rem' }}>
                                {students.map((record, idx) => {
                                    const hasEvaluation = record.evaluations && record.evaluations.length > 0;

                                    return (
                                        <div
                                            key={record.id}
                                            className="student-item"
                                            style={{
                                                padding: '1.5rem',
                                                borderRadius: '16px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1.5rem',
                                                borderTop: idx > 0 ? '1px solid #F1F5F9' : 'none'
                                            }}
                                            onClick={() => { setSelectedRecord(record); setShowModal(true); }}
                                        >
                                            {/* Avatar */}
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: '16px',
                                                background: record.student?.avatar_url ? `url(${record.student.avatar_url})` : 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '1.5rem',
                                                fontWeight: 700,
                                                flexShrink: 0
                                            }}>
                                                {!record.student?.avatar_url && (record.student?.full_name?.[0] || 'U').toUpperCase()}
                                            </div>

                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}>
                                                    {record.student?.full_name || 'Chưa cập nhật tên'}
                                                </h4>
                                                <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#64748B' }}>
                                                    {record.student?.email || 'No email'}
                                                </p>
                                                {record.position && (
                                                    <div style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '4px 10px',
                                                        background: '#EFF6FF',
                                                        color: '#3B82F6',
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600
                                                    }}>
                                                        <Briefcase size={12} />
                                                        {record.position}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status Badge */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 16px',
                                                borderRadius: '12px',
                                                background: hasEvaluation ? '#ECFDF5' : '#FEF3C7',
                                                color: hasEvaluation ? '#059669' : '#D97706',
                                                fontSize: '0.9rem',
                                                fontWeight: 700
                                            }}>
                                                {hasEvaluation ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                                {hasEvaluation ? 'Đã đánh giá' : 'Chưa đánh giá'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Evaluation Modal */}
            {showModal && selectedRecord && (
                <EvaluationModal
                    record={selectedRecord}
                    onClose={() => setShowModal(false)}
                    onSave={() => {
                        setShowModal(false);
                        fetchData();
                    }}
                />
            )}

            <style>{`
                .student-item:hover {
                    background: #F8FAFC;
                }
                .loading {
                    color: #64748B;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}

// Evaluation Modal Component
function EvaluationModal({ record, onClose, onSave }: {
    record: StudentWorkProgress;
    onClose: () => void;
    onSave: () => void;
}) {
    const [activeTab, setActiveTab] = useState<'roadmap' | 'evaluation'>('roadmap');
    const [saving, setSaving] = useState(false);

    const [evaluatorName, setEvaluatorName] = useState(record.evaluator_name || '');
    const [workDuration, setWorkDuration] = useState(record.work_duration || '');

    const defaultCriteria = [
        'Thái độ làm việc',
        'Kỹ năng chuyên môn',
        'Khả năng làm việc nhóm',
        'Tuân thủ kỷ luật',
        'Tiến độ công việc'
    ];

    const [evaluations, setEvaluations] = useState(
        record.evaluations && record.evaluations.length > 0
            ? record.evaluations
            : defaultCriteria.map(c => ({ criteria: c, score: 0, comment: '' }))
    );

    const [workRoadmap, setWorkRoadmap] = useState(
        record.work_roadmap || []
    );

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('student_work_progress')
                .update({
                    evaluations,
                    work_roadmap: workRoadmap,
                    evaluator_name: evaluatorName,
                    work_duration: workDuration,
                    updated_at: new Date().toISOString()
                })
                .eq('id', record.id);

            if (error) throw error;
            onSave();
        } catch (error) {
            console.error('Error saving:', error);
            alert('Có lỗi xảy ra khi lưu dữ liệu');
        } finally {
            setSaving(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return '#10B981';
        if (score >= 5) return '#3B82F6';
        return '#F59E0B';
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ background: 'white', width: '100%', maxWidth: '1000px', borderRadius: '32px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                {/* Header */}
                <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: '#1E293B' }}>
                                Đánh giá & Lộ trình
                            </h2>
                            <p style={{ margin: 0, color: '#64748B', fontSize: '0.95rem' }}>
                                {record.student?.full_name} - {record.school?.full_name}
                            </p>
                        </div>
                        <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={24} style={{ color: '#64748B' }} />
                        </button>
                    </div>

                    {/* Info Fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748B', marginBottom: '0.5rem' }}>Vị trí công việc</label>
                            <input
                                value={record.position}
                                readOnly
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.95rem' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748B', marginBottom: '0.5rem' }}>Thời gian làm việc</label>
                            <input
                                value={workDuration}
                                onChange={(e) => setWorkDuration(e.target.value)}
                                placeholder="VD: 3 tháng"
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.95rem' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748B', marginBottom: '0.5rem' }}>Người đánh giá</label>
                            <input
                                value={evaluatorName}
                                onChange={(e) => setEvaluatorName(e.target.value)}
                                placeholder="Mentor/Leader"
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.95rem' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 2.5rem' }}>
                    <button
                        onClick={() => setActiveTab('roadmap')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            border: 'none',
                            background: 'none',
                            borderBottom: activeTab === 'roadmap' ? '3px solid var(--color-primary)' : '3px solid transparent',
                            color: activeTab === 'roadmap' ? 'var(--color-primary)' : '#64748B',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Lộ trình làm việc
                    </button>
                    <button
                        onClick={() => setActiveTab('evaluation')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            border: 'none',
                            background: 'none',
                            borderBottom: activeTab === 'evaluation' ? '3px solid var(--color-primary)' : '3px solid transparent',
                            color: activeTab === 'evaluation' ? 'var(--color-primary)' : '#64748B',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Đánh giá kết quả
                    </button>
                </div>

                {/* Tab Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem' }}>
                    {activeTab === 'roadmap' ? (
                        <div>
                            {workRoadmap.map((task, idx) => (
                                <div key={idx} style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ padding: '10px', background: '#FFF7ED', borderRadius: '12px' }}>
                                            <FileText size={20} style={{ color: '#F59E0B' }} />
                                        </div>
                                        <input
                                            value={task.task}
                                            onChange={(e) => {
                                                const newRoadmap = [...workRoadmap];
                                                newRoadmap[idx].task = e.target.value;
                                                setWorkRoadmap(newRoadmap);
                                            }}
                                            placeholder="Tên đầu việc / Nhiệm vụ"
                                            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1.05rem', fontWeight: 700, padding: '0.5rem' }}
                                        />
                                        <button
                                            onClick={() => setWorkRoadmap(workRoadmap.filter((_, i) => i !== idx))}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingLeft: '3.5rem' }}>
                                        <select
                                            value={task.result}
                                            onChange={(e) => {
                                                const newRoadmap = [...workRoadmap];
                                                newRoadmap[idx].result = e.target.value;
                                                setWorkRoadmap(newRoadmap);
                                            }}
                                            style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white' }}
                                        >
                                            <option>Đang thực hiện</option>
                                            <option>Đã hoàn thành</option>
                                            <option>Chưa hoàn thành</option>
                                            <option>Hủy bỏ</option>
                                        </select>
                                        <input
                                            type="date"
                                            value={task.deadline}
                                            onChange={(e) => {
                                                const newRoadmap = [...workRoadmap];
                                                newRoadmap[idx].deadline = e.target.value;
                                                setWorkRoadmap(newRoadmap);
                                            }}
                                            style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => setWorkRoadmap([...workRoadmap, { task: '', result: 'Đang thực hiện', deadline: format(new Date(), 'yyyy-MM-dd') }])}
                                className="btn btn-outline"
                                style={{ width: '100%', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}
                            >
                                <Plus size={20} /> Thêm đầu việc mới
                            </button>
                        </div>
                    ) : (
                        <div>
                            {evaluations.map((item, idx) => (
                                <div key={idx} style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ padding: '10px', background: '#EFF6FF', borderRadius: '12px' }}>
                                            <Star size={20} style={{ color: '#3B82F6' }} />
                                        </div>
                                        <input
                                            value={item.criteria}
                                            onChange={(e) => {
                                                const newEvals = [...evaluations];
                                                newEvals[idx].criteria = e.target.value;
                                                setEvaluations(newEvals);
                                            }}
                                            placeholder="Nhập tiêu chí đánh giá"
                                            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1.05rem', fontWeight: 700, padding: '0.5rem' }}
                                        />
                                        <button
                                            onClick={() => setEvaluations(evaluations.filter((_, i) => i !== idx))}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div style={{ paddingLeft: '3.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Điểm số:</span>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                background: `${getScoreColor(item.score)}20`,
                                                color: getScoreColor(item.score),
                                                fontWeight: 700,
                                                fontSize: '0.9rem'
                                            }}>
                                                {item.score}/10
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="10"
                                            value={item.score}
                                            onChange={(e) => {
                                                const newEvals = [...evaluations];
                                                newEvals[idx].score = parseInt(e.target.value);
                                                setEvaluations(newEvals);
                                            }}
                                            style={{ width: '100%', marginBottom: '1rem' }}
                                        />
                                        <textarea
                                            value={item.comment}
                                            onChange={(e) => {
                                                const newEvals = [...evaluations];
                                                newEvals[idx].comment = e.target.value;
                                                setEvaluations(newEvals);
                                            }}
                                            placeholder="Nhận xét chi tiết..."
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => setEvaluations([...evaluations, { criteria: '', score: 0, comment: '' }])}
                                className="btn btn-outline"
                                style={{ width: '100%', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}
                            >
                                <Plus size={20} /> Thêm tiêu chí đánh giá
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '1rem' }}>
                    <button onClick={onClose} className="btn btn-outline" style={{ flex: 1, height: '52px' }}>
                        Hủy
                    </button>
                    <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ flex: 2, height: '52px' }}>
                        {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                    </button>
                </div>
            </div>
        </div>
    );
}
