import { useState, useEffect } from 'react';
import {
    Search, Filter, Plus,
    MoreHorizontal, Download,
    CheckCircle2,
    GraduationCap, Briefcase, User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Student {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    metadata?: any;
    work_progress?: any;
}

export default function SchoolStudentsPage() {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user) {
            fetchStudents();
        }
    }, [user]);

    const fetchStudents = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 0. Get School Domain from current user's email
            // Note: In a real scenario, we might store 'domain' in metadata, 
            // but here we follow user's instruction to match 'tail of email'
            const schoolDomain = user.email?.split('@')[1];
            if (!schoolDomain) throw new Error('Không tìm thấy domain email của trường');

            // 1. Fetch Candidates (Profiles) that match the school domain
            // We use ilike to match '%@domain'
            const { data: profiles, error: pError } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'candidate')
                .ilike('email', `%@${schoolDomain}`)
                .limit(100);

            if (pError) throw pError;

            // 2. Fetch Work Progress for ALL students matched by domain
            // Note: Even if they haven't started, we want to see their basic info
            const studentIds = profiles?.map(p => p.id).filter(id => !!id) || [];
            let progressData: any[] = [];

            if (studentIds.length > 0) {
                const { data: progress, error: wError } = await supabase
                    .from('student_work_progress')
                    .select('*')
                    .in('student_id', studentIds);

                if (wError) console.warn('Work progress fetch error:', wError.message);
                progressData = progress || [];
            }

            // 3. Fetch Company Names for active progress
            let companyMap: any = {};
            const activeWp = progressData.filter(wp => wp.company_id);
            if (activeWp.length > 0) {
                const companyIds = [...new Set(activeWp.map(wp => wp.company_id))];
                const { data: comps } = await supabase
                    .from('profiles')
                    .select('id, full_name, company_name')
                    .in('id', companyIds);
                companyMap = (comps || []).reduce((acc: any, c: any) => ({ ...acc, [c.id]: c }), {});
            }

            // 4. Map everything together
            const enriched = (profiles || []).map(p => {
                const wp = progressData.find(item => item.student_id === p.id);
                return {
                    ...p,
                    work_progress: wp ? {
                        ...wp,
                        company: companyMap[wp.company_id]
                    } : null
                };
            });

            setStudents(enriched);
        } catch (error: any) {
            console.error('STUDENTS FETCH ERROR:', error.message || error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (student: Student) => {
        const wp = student.work_progress;
        if (!wp) return { color: '#64748B', bg: '#F1F5F9', label: 'Chưa thực tập', icon: <User size={14} /> };

        // If evaluations exist, maybe completed? or interning
        if (wp.evaluations && wp.evaluations.length > 0) {
            return { color: '#10B981', bg: '#ECFDF5', label: 'Đã đánh giá', icon: <CheckCircle2 size={14} /> };
        }
        return { color: '#3B82F6', bg: '#EFF6FF', label: 'Đang thực tập', icon: <Briefcase size={14} /> };
    };

    const filteredStudents = students.filter(s =>
        s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8FAFC' }}>
                <div className="loading">Đang tải danh sách sinh viên...</div>
            </div>
        );
    }

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '2rem' }}>
            <div className="container-fluid">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>Quản lý Sinh viên</h1>
                        <p style={{ color: '#64748B', marginTop: '0.5rem', fontSize: '1.1rem' }}>Theo dõi hồ sơ và tiến độ thực tập của sinh viên trong hệ thống.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-secondary" style={{ borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px' }}>
                            <Download size={20} /> Xuất dữ liệu
                        </button>
                        <button className="btn btn-primary" style={{ borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', boxShadow: '0 10px 15px -3px rgba(30, 136, 229, 0.3)' }}>
                            <Plus size={20} /> Thêm sinh viên mới
                        </button>
                    </div>
                </div>

                <div className="card" style={{ borderRadius: '32px', border: 'none', background: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                    {/* Table Filters */}
                    <div style={{ padding: '2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm tên sinh viên, email, chuyên ngành..."
                                style={{ width: '100%', paddingLeft: '3.25rem', height: '54px', border: '1px solid #E2E8F0', borderRadius: '16px', background: '#F8FAFC', outline: 'none', fontSize: '1rem' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-secondary" style={{ borderRadius: '16px', height: '54px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #E2E8F0' }}>
                            <Filter size={18} /> Lọc kết quả
                        </button>
                    </div>

                    <div className="table-responsive" style={{ padding: '0 1rem' }}>
                        <table className="table" style={{ margin: 0, borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                            <thead>
                                <tr style={{ color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    <th style={{ border: 'none', padding: '1.25rem 1.5rem' }}>Họ và tên</th>
                                    <th style={{ border: 'none', padding: '1.25rem 1.5rem' }}>Email</th>
                                    <th style={{ border: 'none', padding: '1.25rem 1.5rem' }}>Chuyên ngành</th>
                                    <th style={{ border: 'none', padding: '1.25rem 1.5rem' }}>Trạng thái</th>
                                    <th style={{ border: 'none', padding: '1.25rem 1.5rem' }}>Cơ sở tiếp nhận</th>
                                    <th style={{ border: 'none', padding: '1.25rem 1.5rem' }}>Kết quả</th>
                                    <th style={{ border: 'none', textAlign: 'right', padding: '1.25rem 1.5rem' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student) => {
                                    const style = getStatusStyle(student);
                                    const wp = student.work_progress;
                                    const evaluation = wp?.evaluations?.[0];

                                    return (
                                        <tr key={student.id} style={{ background: '#FAFBFC', transition: 'all 0.2s' }} className="student-row">
                                            <td style={{ padding: '1.25rem 1.5rem', border: 'none', borderRadius: '16px 0 0 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', whiteSpace: 'nowrap' }}>
                                                    <div style={{
                                                        width: '52px',
                                                        height: '52px',
                                                        borderRadius: '16px',
                                                        background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 900,
                                                        fontSize: '1.2rem',
                                                        flexShrink: 0
                                                    }}>
                                                        {student.avatar_url ? (
                                                            <img src={student.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} alt="" />
                                                        ) : (
                                                            student.full_name[0].toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>{student.full_name}</div>
                                                        <div style={{ color: '#94A3B8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                                            <GraduationCap size={12} /> ID: {student.id.slice(0, 8)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', border: 'none', color: '#64748B', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                                                {student.email}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', border: 'none' }}>
                                                <div style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{student.metadata?.education || 'Kỹ thuật phần mềm'}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', border: 'none' }}>
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '8px 16px',
                                                    borderRadius: '12px',
                                                    background: style.bg,
                                                    color: style.color,
                                                    fontSize: '0.85rem',
                                                    fontWeight: 800,
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {style.icon} {style.label.toUpperCase()}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', border: 'none' }}>
                                                <div style={{ color: !student.work_progress ? '#CBD5E1' : '#0F172A', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                                                    {student.work_progress?.company?.company_name || student.work_progress?.company?.full_name || '—'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', border: 'none' }}>
                                                {evaluation ? (
                                                    <div style={{ color: '#10B981', fontWeight: 800, fontSize: '1rem', whiteSpace: 'nowrap' }}>
                                                        {evaluation.score}/10 <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>({evaluation.rating})</span>
                                                    </div>
                                                ) : (
                                                    <div style={{ color: '#CBD5E1', fontSize: '0.9rem', fontStyle: 'italic' }}>Chưa có kết quả</div>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', border: 'none', textAlign: 'right', borderRadius: '0 16px 16px 0' }}>
                                                <button className="btn btn-icon" style={{ padding: '10px', color: '#94A3B8', background: 'rgba(226, 232, 240, 0.4)', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '2rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: 600 }}>Hiển thị {filteredStudents.length} sinh viên</span>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn btn-secondary btn-sm" style={{ borderRadius: '10px', padding: '8px 20px' }}>Trang trước</button>
                            <button className="btn btn-primary btn-sm" style={{ borderRadius: '10px', padding: '8px 20px' }}>Trang sau</button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .student-row:hover {
                    background-color: #F1F5F9 !important;
                    transform: scale(1.002);
                }
                .loading {
                    color: #64748B;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                }
            `}</style>
        </div>
    );
}
