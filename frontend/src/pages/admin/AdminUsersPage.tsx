import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import {
    FiUsers, FiSearch, FiFilter, FiMoreVertical,
    FiPhone, FiCalendar, FiShield,
    FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import { format } from 'date-fns';

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
    phone?: string;
    company_name?: string;
    avatar_url?: string;
}

export default function AdminUsersPage() {
    const { profile } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        candidates: 0,
        employers: 0,
        schools: 0
    });

    // Only admins can access
    if (profile?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setUsers(data || []);

            // Calculate stats
            const s = {
                total: data?.length || 0,
                candidates: data?.filter(u => u.role === 'candidate').length || 0,
                employers: data?.filter(u => u.role === 'employer').length || 0,
                schools: data?.filter(u => u.role === 'school').length || 0,
            };
            setStats(s);

        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.company_name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return { text: 'Quản trị viên', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' };
            case 'employer': return { text: 'Nhà tuyển dụng', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
            case 'school': return { text: 'Nhà trường', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' };
            case 'candidate': return { text: 'Ứng viên', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' };
            default: return { text: role, color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' };
        }
    };

    return (
        <div style={{ padding: '2rem 50px', maxWidth: '100%', minHeight: '100vh', background: '#F8FAFC' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', color: '#1E293B' }}>Quản lý người dùng</h1>
                    <p style={{ color: '#64748B', fontSize: '1.1rem', margin: 0 }}>Hệ thống quản lý tài khoản và phân quyền người dùng</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="stat-pill" style={{ background: 'white', padding: '0.75rem 1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiUsers size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>TỔNG SỐ</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B' }}>{stats.total}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                    { label: 'Ứng viên', count: stats.candidates, color: '#3B82F6', icon: <FiUsers /> },
                    { label: 'Nhà tuyển dụng', count: stats.employers, color: '#10B981', icon: <FiCheckCircle /> },
                    { label: 'Nhà trường', count: stats.schools, color: '#8B5CF6', icon: <FiShield /> },
                    { label: 'Quản trị viên', count: users.filter(u => u.role === 'admin').length, color: '#EF4444', icon: <FiAlertCircle /> }
                ].map((item, idx) => (
                    <div key={idx} className="card" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'all 0.3s ease' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                            {item.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>{item.label}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1E293B' }}>{item.count}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters & Actions */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <FiSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '1.2rem' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Tìm theo tên, email, công ty..."
                            style={{ paddingLeft: '3rem', height: '54px', borderRadius: '16px', border: '2px solid #E2E8F0', fontSize: '1rem' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div style={{ width: '220px', position: 'relative' }}>
                        <FiFilter style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <select
                            className="form-select"
                            style={{ paddingLeft: '3rem', height: '54px', borderRadius: '16px', border: '2px solid #E2E8F0', fontWeight: 600 }}
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">Tất cả vai trò</option>
                            <option value="candidate">Ứng viên</option>
                            <option value="employer">Nhà tuyển dụng</option>
                            <option value="school">Nhà trường</option>
                            <option value="admin">Quản trị viên</option>
                        </select>
                    </div>
                    <button className="btn btn-primary" onClick={fetchUsers} style={{ height: '54px', padding: '0 2rem', borderRadius: '16px', fontWeight: 700 }}>
                        Làm mới dữ liệu
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="card" style={{ padding: 0, borderRadius: '24px', overflow: 'hidden', border: '1px solid #E2E8F0', background: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#F1F5F9' }}>
                        <tr>
                            <th style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#475569', borderBottom: '1px solid #E2E8F0' }}>NGƯỜI DÙNG</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#475569', borderBottom: '1px solid #E2E8F0' }}>VAI TRÒ</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#475569', borderBottom: '1px solid #E2E8F0' }}>LIÊN HỆ</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#475569', borderBottom: '1px solid #E2E8F0' }}>NGÀY THAM GIA</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#475569', borderBottom: '1px solid #E2E8F0', textAlign: 'right' }}>THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '4rem', textAlign: 'center' }}>
                                    <div className="loading">Đang tải danh sách người dùng...</div>
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>
                                    Không tìm thấy người dùng nào phù hợp.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => {
                                const role = getRoleLabel(user.role);
                                return (
                                    <tr key={user.id} className="table-row" style={{ transition: 'all 0.2s' }}>
                                        <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{
                                                    width: '48px', height: '48px', borderRadius: '14px', background: role.color, color: 'white',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem',
                                                    overflow: 'hidden'
                                                }}>
                                                    {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '1.05rem' }}>{user.full_name || 'Chưa cập nhật'}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9' }}>
                                            <span style={{
                                                padding: '0.5rem 1rem', borderRadius: '12px', background: role.bg, color: role.color,
                                                fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'
                                            }}>
                                                {role.text}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>
                                                    <FiPhone size={14} style={{ opacity: 0.7 }} />
                                                    {user.phone || 'N/A'}
                                                </div>
                                                {user.company_name && (
                                                    <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>
                                                        🏢 {user.company_name}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}>
                                                <FiCalendar size={14} style={{ opacity: 0.7 }} />
                                                {format(new Date(user.created_at), 'dd/MM/yyyy')}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', textAlign: 'right' }}>
                                            <button className="btn-icon" style={{ padding: '0.5rem', borderRadius: '10px', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                                                <FiMoreVertical size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .table-row:hover {
                    background-color: #F8FAFC;
                }
                .btn-icon:hover {
                    background-color: #F1F5F9 !important;
                    color: #1E293B !important;
                }
            `}</style>
        </div>
    );
}
