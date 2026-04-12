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
        <div className="admin-users-page" style={{ padding: 'var(--spacing-2xl)', minHeight: '100vh', background: 'var(--color-background-alt)' }}>
            <div className="admin-header">
                <div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 'var(--spacing-sm)', color: 'var(--color-text)' }}>Quản lý người dùng</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', margin: 0 }}>Hệ thống quản lý tài khoản và phân quyền người dùng</p>
                </div>
                <div className="admin-header-actions">
                    <div className="stat-pill-glass" style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiUsers size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>TỔNG SỐ</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)' }}>{stats.total}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-stats-grid" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                {[
                    { label: 'Ứng viên', count: stats.candidates, color: '#3B82F6', icon: <FiUsers /> },
                    { label: 'Nhà tuyển dụng', count: stats.employers, color: '#10B981', icon: <FiCheckCircle /> },
                    { label: 'Nhà trường', count: stats.schools, color: '#8B5CF6', icon: <FiShield /> },
                    { label: 'Quản trị viên', count: users.filter(u => u.role === 'admin').length, color: '#EF4444', icon: <FiAlertCircle /> }
                ].map((item, idx) => (
                    <div
                        key={idx}
                        className="stat-card-glass animate-fade-in-up"
                        style={{
                            padding: 'var(--spacing-lg)',
                            borderRadius: 'var(--radius-2xl)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-lg)',
                            animationDelay: `${idx * 100}ms`,
                            animationFillMode: 'both'
                        }}
                    >
                        <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                            {item.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{item.label}</div>
                            <div style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', fontWeight: 900, color: 'var(--color-text)' }}>{item.count}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card animate-fade-in-up" style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-2xl)', marginBottom: 'var(--spacing-xl)', animationDelay: '200ms', animationFillMode: 'both' }}>
                <div className="admin-filter-controls">
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <FiSearch style={{ position: 'absolute', left: 'var(--spacing-lg)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)', fontSize: '1.2rem' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Tìm theo tên, email, công ty..."
                            style={{ paddingLeft: '3rem', height: '54px', borderRadius: 'var(--radius-lg)', border: '2px solid var(--color-border)', fontSize: '1rem' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div style={{ width: '220px', position: 'relative', minWidth: '180px' }}>
                        <FiFilter style={{ position: 'absolute', left: 'var(--spacing-lg)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                        <select
                            className="form-select"
                            style={{ paddingLeft: '3rem', height: '54px', borderRadius: 'var(--radius-lg)', border: '2px solid var(--color-border)', fontWeight: 600 }}
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
                    <button className="btn btn-primary" onClick={fetchUsers} style={{ height: '54px', padding: '0 var(--spacing-xl)', borderRadius: 'var(--radius-lg)', fontWeight: 700 }}>
                        Làm mới dữ liệu
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="card" style={{ padding: 0, borderRadius: 'var(--radius-2xl)', overflow: 'hidden', border: '1px solid var(--color-border-light)' }}>
                    <div style={{ padding: 'var(--spacing-lg)', background: 'var(--color-border-light)' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-xl)' }}>
                            {['NGƯỜI DÙNG', 'VAI TRÒ', 'LIÊN HỆ', 'NGÀY THAM GIA', 'THAO TÁC'].map((_, i) => (
                                <div key={i} className="skeleton" style={{ height: '16px', width: i === 0 ? '120px' : i === 4 ? '60px' : '80px' }} />
                            ))}
                        </div>
                    </div>
                    {[0, 1, 2, 3, 4].map(idx => (
                        <div key={idx} style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
                            <div className="skeleton skeleton-avatar" style={{ width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div className="skeleton" style={{ height: '16px', width: '60%', marginBottom: 'var(--spacing-xs)' }} />
                                <div className="skeleton" style={{ height: '12px', width: '40%' }} />
                            </div>
                            <div className="skeleton" style={{ height: '28px', width: '100px', borderRadius: 'var(--radius-md)' }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card table-container animate-fade-in-up" style={{ padding: 0, borderRadius: 'var(--radius-2xl)', overflow: 'hidden', border: '1px solid var(--color-border-light)', animationDelay: '300ms', animationFillMode: 'both' }}>
                    <div className="table-scroll-wrapper">
                        <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'var(--color-border-light)' }}>
                                <tr>
                                    <th style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', fontWeight: 700, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap' }}>NGƯỜI DÙNG</th>
                                    <th style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', fontWeight: 700, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap' }}>VAI TRÒ</th>
                                    <th style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', fontWeight: 700, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap' }}>LIÊN HỆ</th>
                                    <th style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', fontWeight: 700, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap' }}>NGÀY THAM GIA</th>
                                    <th style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', fontWeight: 700, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)', textAlign: 'right', whiteSpace: 'nowrap' }}>THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: 'var(--spacing-4xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                            Không tìm thấy người dùng nào phù hợp.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, idx) => {
                                        const role = getRoleLabel(user.role);
                                        return (
                                            <tr key={user.id} className="table-row animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}>
                                                <td style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', borderBottom: '1px solid var(--color-border-light)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                        <div style={{
                                                            width: '48px', height: '48px', borderRadius: '14px', background: role.color, color: 'white',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem',
                                                            overflow: 'hidden', flexShrink: 0
                                                        }}>
                                                            {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.full_name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1.05rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name || 'Chưa cập nhật'}</div>
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', borderBottom: '1px solid var(--color-border-light)', whiteSpace: 'nowrap' }}>
                                                    <span style={{
                                                        padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: 'var(--radius-md)', background: role.bg, color: role.color,
                                                        fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-block'
                                                    }}>
                                                        {role.text}
                                                    </span>
                                                </td>
                                                <td style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', borderBottom: '1px solid var(--color-border-light)' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: '0.9rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                                                            <FiPhone size={14} style={{ opacity: 0.7 }} />
                                                            {user.phone || 'N/A'}
                                                        </div>
                                                        {user.company_name && (
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                🏢 {user.company_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', borderBottom: '1px solid var(--color-border-light)', whiteSpace: 'nowrap' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                                        <FiCalendar size={14} style={{ opacity: 0.7 }} />
                                                        {format(new Date(user.created_at), 'dd/MM/yyyy')}
                                                    </div>
                                                </td>
                                                <td style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', borderBottom: '1px solid var(--color-border-light)', textAlign: 'right' }}>
                                                    <button className="btn-icon" style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
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
                </div>
            )}

            <style>{`
                .admin-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--spacing-lg);
                }
                @media (max-width: 1279px) {
                    .admin-stats-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 767px) {
                    .admin-stats-grid { grid-template-columns: 1fr; }
                }

                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: var(--spacing-2xl);
                    gap: var(--spacing-lg);
                    flex-wrap: wrap;
                }
                @media (max-width: 767px) {
                    .admin-header { flex-direction: column; align-items: flex-start; }
                }

                .admin-header-actions {
                    display: flex;
                    gap: var(--spacing-md);
                    flex-wrap: wrap;
                }

                .admin-filter-controls {
                    display: flex;
                    gap: var(--spacing-lg);
                    align-items: center;
                    flex-wrap: wrap;
                }
                @media (max-width: 767px) {
                    .admin-filter-controls { flex-direction: column; align-items: stretch; }
                    .admin-filter-controls > * { width: 100% !important; }
                }

                .stat-card-glass {
                    background: var(--glass-bg);
                    backdrop-filter: var(--glass-blur);
                    -webkit-backdrop-filter: var(--glass-blur);
                    border: 1px solid var(--glass-border);
                    box-shadow: var(--glass-shadow);
                    transition: all var(--transition-base);
                }
                .stat-card-glass:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                }

                .stat-pill-glass {
                    background: var(--glass-bg);
                    backdrop-filter: var(--glass-blur);
                    -webkit-backdrop-filter: var(--glass-blur);
                    border: 1px solid var(--glass-border);
                    box-shadow: var(--glass-shadow);
                }

                .table-container {
                    overflow: hidden;
                }
                .table-scroll-wrapper {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
                .table-scroll-wrapper::-webkit-scrollbar {
                    height: 6px;
                }
                .table-scroll-wrapper::-webkit-scrollbar-thumb {
                    background: var(--color-text-muted);
                    border-radius: var(--radius-full);
                }

                .table-row:hover {
                    background-color: var(--color-background-alt);
                }
                .btn-icon:hover {
                    background-color: var(--color-border-light) !important;
                    color: var(--color-text) !important;
                }
            `}</style>
        </div>
    );
}
