import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import {
    FiEdit, FiTrash2, FiEye, FiUsers, FiPlus,
    FiSearch, FiCalendar, FiClock, FiFileText
} from 'react-icons/fi';

export default function SchoolManageJobsPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchMyJobs();
    }, [user]);

    const fetchMyJobs = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('creator_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setJobs(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa tin tuyển dụng này?')) return;

        try {
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', id)
                .eq('creator_id', user?.id);

            if (error) throw error;
            fetchMyJobs();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved':
                return { bg: '#DCFCE7', color: '#15803D', label: 'Đã duyệt' };
            case 'rejected':
                return { bg: '#FEE2E2', color: '#B91C1C', label: 'Từ chối' };
            case 'closed':
                return { bg: '#F1F5F9', color: '#475569', label: 'Đã đóng' };
            default:
                return { bg: '#FEF3C7', color: '#B45309', label: 'Chờ duyệt' };
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.metadata.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = statusFilter === 'all' || job.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div style={{ padding: '2.5rem 50px', background: '#F8FAFC', minHeight: '100vh' }}>
                <div className="loading text-center" style={{ marginTop: '5rem' }}>Đang tải danh sách...</div>
            </div>
        );
    }

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '2.5rem 50px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                        Quản lý tin đã tạo
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '1.1rem', margin: 0, fontWeight: 500 }}>
                        Theo dõi và quản lý các công việc do Nhà trường trực tiếp đăng tải
                    </p>
                </div>
                <Link to="/school/jobs/create" className="btn btn-primary" style={{ padding: '0.8rem 1.8rem', borderRadius: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px -5px rgba(30, 136, 229, 0.3)' }}>
                    <FiPlus size={20} /> Đăng tin mới
                </Link>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <FiSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tiêu đề..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', height: '54px', paddingLeft: '3.2rem', paddingRight: '1rem', borderRadius: '18px', border: '1px solid #E2E8F0', background: 'white', fontSize: '1rem', outline: 'none', transition: 'all 0.3s' }}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ height: '54px', padding: '0 1.5rem', borderRadius: '18px', border: '1px solid #E2E8F0', background: 'white', fontSize: '1rem', fontWeight: 600, color: '#475569', cursor: 'pointer', outline: 'none' }}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Từ chối</option>
                </select>
            </div>

            {filteredJobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '6rem', background: 'white', borderRadius: '32px', boxShadow: '0 4px 25px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <FiFileText size={48} style={{ color: '#94A3B8' }} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>Chưa có tin nào</h2>
                    <p style={{ color: '#64748B', maxWidth: '500px', margin: '0 auto 2rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        Bạn chưa đăng tin tuyển dụng nào trực tiếp từ tài khoản Nhà trường.
                    </p>
                    <Link to="/school/jobs/create" className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '16px', fontWeight: 700 }}>
                        Đăng tin ngay
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    {filteredJobs.map((job) => {
                        const style = getStatusStyle(job.status);
                        return (
                            <div key={job.id} className="job-card" style={{ padding: '2rem', borderRadius: '28px', background: 'white', border: '1px solid #E2E8F0', boxShadow: '0 10px 40px rgba(0,0,0,0.02)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                                                {job.metadata?.title || 'Chưa đặt tên'}
                                            </h3>
                                            <div style={{ padding: '6px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, background: style.bg, color: style.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {style.label}
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2.5rem', marginBottom: '2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                                                    <FiEye size={18} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Lượt xem</div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>{job.view_count || 0}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                                                    <FiUsers size={18} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Ứng viên</div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>{job.applicants?.length || 0}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                                                    <FiCalendar size={18} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Hạn nộp</div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>{new Date(job.deadline).toLocaleDateString('vi-VN')}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
                                                    <FiClock size={18} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Trạng thái</div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: job.is_active ? '#10B981' : '#64748B' }}>
                                                        {job.is_active ? 'Đang mở' : 'Đã đóng'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            <Link to={`/jobs/${job.id}`} className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 1.25rem', height: '42px', borderRadius: '12px', borderColor: '#E2E8F0', color: '#475569', fontWeight: 700 }}>
                                                <FiEye size={16} /> Xem tin
                                            </Link>
                                            <Link to={`/school/jobs/${job.id}/applicants`} className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 1.25rem', height: '42px', borderRadius: '12px', borderColor: '#3B82F6', color: '#3B82F6', fontWeight: 700 }}>
                                                <FiUsers size={16} /> Ứng viên ({job.applicants?.length || 0})
                                            </Link>
                                            <Link to={`/employer/jobs/${job.id}/edit`} className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 1.25rem', height: '42px', borderRadius: '12px', borderColor: '#E2E8F0', color: '#475569', fontWeight: 700 }}>
                                                <FiEdit size={16} /> Chỉnh sửa
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(job.id)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 1.25rem', height: '42px', borderRadius: '12px', border: 'none', background: '#FEF2F2', color: '#EF4444', fontWeight: 700, cursor: 'pointer' }}
                                            >
                                                <FiTrash2 size={16} /> Xóa tin
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                .job-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.06) !important;
                    border-color: #3B82F6 !important;
                }
                .btn-outline:hover {
                    background: #F8FAFC !important;
                    border-color: #94A3B8 !important;
                }
            `}</style>
        </div>
    );
}
