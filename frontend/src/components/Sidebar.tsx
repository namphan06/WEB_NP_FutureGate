import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    MessageCircle, PieChart, FileText, Briefcase, Settings, ChevronDown, User,
    Shield, BookOpen, LayoutDashboard, Handshake, Calendar, CheckCircle,
    Users, Search, Bookmark, Send, LogOut, ChevronLeft, ChevronRight, Plus
} from 'lucide-react';




interface SidebarProps {
    isOpen: boolean;
    onToggle?: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const { profile, signOut } = useAuth();
    const location = useLocation();
    const [openSections, setOpenSections] = useState<string[]>(['jobs', 'cv', 'recruitment', 'partnerships', 'management', 'school_mgmt', 'news_mgmt', 'recruitment_mgmt', 'utilities']);

    const toggleSection = (section: string) => {
        if (!isOpen) return;
        setOpenSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const isActive = (path: string) => location.pathname === path;

    const menuItems = (() => {
        const role = profile?.role;

        if (role === 'candidate') {

            return [
                {
                    id: 'jobs',
                    title: 'Tìm việc làm',
                    icon: <Search size={22} />,
                    items: [
                        { label: 'Việc làm phù hợp', path: '/jobs', icon: <Briefcase size={16} /> },
                        { label: 'Việc làm đã lưu', path: '/candidate/saved-jobs', icon: <Bookmark size={16} /> },
                        { label: 'Việc làm đã ứng tuyển', path: '/candidate/applied-jobs', icon: <Send size={16} /> },
                    ]
                },
                {
                    id: 'cv',
                    title: 'Hồ sơ & CV',
                    icon: <FileText size={22} />,
                    items: [
                        { label: 'Mẫu CV chuyên nghiệp', path: '/candidate/cv', icon: <FileText size={16} /> },
                        { label: 'Cập nhật hồ sơ', path: '/profile', icon: <User size={16} /> },
                    ]
                },
                {
                    id: 'utilities',
                    title: 'Tiện ích',
                    icon: <Plus size={22} />,
                    items: [
                        { label: 'Tin nhắn', path: '/chat', icon: <MessageCircle size={16} /> },
                        { label: 'Trắc nghiệm MI', path: '/candidate/mi-test', icon: <PieChart size={16} /> },
                        { label: 'Lịch phỏng vấn', path: '/candidate/interviews', icon: <Calendar size={16} /> },
                        { label: 'Khoá học', path: '/courses', icon: <BookOpen size={16} /> },


                        { label: 'Tin tức', path: '/news', icon: <FileText size={16} /> },
                    ]
                }
            ];
        }

        if (role === 'employer') {
            return [
                {
                    id: 'recruitment',
                    title: 'Tuyển dụng',
                    icon: <Briefcase size={22} />,
                    items: [
                        { label: 'Tổng quan', path: '/employer/dashboard', icon: <LayoutDashboard size={16} /> },
                        { label: 'Tin nhắn', path: '/chat', icon: <MessageCircle size={16} /> },
                        { label: 'Đăng tin mới', path: '/employer/jobs/create', icon: <Send size={16} /> },
                        { label: 'Tin tuyển dụng', path: '/employer/jobs', icon: <FileText size={16} /> },
                        { label: 'Quyết định tuyển dụng', path: '/employer/recruitment-decisions', icon: <CheckCircle size={16} /> },
                        { label: 'Ứng viên', path: '/employer/candidates', icon: <Users size={16} /> },
                    ]
                },
                {
                    id: 'partnerships',
                    title: 'Đào tạo',
                    icon: <Handshake size={22} />,
                    items: [
                        { label: 'Đối tác trường', path: '/employer/schools', icon: <BookOpen size={16} /> },
                        { label: 'Đánh giá thực tập', path: '/employer/evaluations', icon: <CheckCircle2 size={16} /> },
                    ]
                }
            ];
        }

        if (role === 'school') {
            return [
                {
                    id: 'school_mgmt',
                    title: 'Đào tạo',
                    icon: <BookOpen size={22} />,
                    items: [
                        { label: 'Dashboard', path: '/school/dashboard', icon: <LayoutDashboard size={16} /> },
                        { label: 'Tin nhắn', path: '/chat', icon: <MessageCircle size={16} /> },
                        { label: 'Hợp tác DN', path: '/school/partnerships', icon: <Handshake size={16} /> },
                        { label: 'Sinh viên', path: '/school/students', icon: <Users size={16} /> },
                    ]
                },
                {
                    id: 'news_mgmt',
                    title: 'Quản lý tin tức',
                    icon: <FileText size={22} />,
                    items: [
                        { label: 'Tạo tin mới', path: '/school/jobs/create', icon: <Plus size={16} /> },
                        { label: 'Tin đã tạo', path: '/school/jobs', icon: <FileText size={16} /> },
                        { label: 'Tin đã liên kết', path: '/school/partnership-jobs', icon: <Handshake size={16} /> },
                    ]
                }
            ];
        }

        if (role === 'admin') {
            return [
                {
                    id: 'management',
                    title: 'Hệ thống',
                    icon: <Shield size={22} />,
                    items: [
                        { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={16} /> },
                        { label: 'Tin nhắn', path: '/chat', icon: <MessageCircle size={16} /> },
                        { label: 'Người dùng', path: '/admin/users', icon: <Users size={16} /> },
                        { label: 'Phân tích', path: '/admin/analytics', icon: <Search size={16} /> },
                    ]
                },
                {
                    id: 'recruitment_mgmt',
                    title: 'Tuyển dụng',
                    icon: <Briefcase size={22} />,
                    items: [
                        { label: 'Duyệt tin', path: '/admin/jobs', icon: <Briefcase size={16} /> },
                    ]
                },
                {
                    id: 'utilities',
                    title: 'Tiện ích',
                    icon: <Plus size={22} />,
                    items: [
                        { label: 'Khoá học', path: '/admin/courses', icon: <BookOpen size={16} /> },
                        { label: 'Tin tức', path: '/admin/news', icon: <FileText size={16} /> },
                        { label: 'Trắc nghiệm MI', path: '/admin/mi-questions', icon: <LayoutDashboard size={16} /> },
                    ]
                }
            ];
        }
        return [];
    })();


    const sidebarWidth = isOpen ? '280px' : '88px';

    return (
        <aside
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: sidebarWidth,
                height: '100vh',
                background: 'white',
                borderRight: '1px solid #E2E8F0',
                zIndex: 1030,
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                paddingTop: 'var(--header-height)',
                boxShadow: '10px 0 30px rgba(0,0,0,0.02)',
                overflow: 'visible'
            }}
        >
            {/* Premium Handle Toggle */}
            <div
                onClick={onToggle}
                style={{
                    position: 'absolute',
                    top: '50%',
                    right: '-14px',
                    transform: 'translateY(-50%)',
                    width: '28px',
                    height: '56px',
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '4px 0 10px rgba(0,0,0,0.04)',
                    zIndex: 1032,
                    color: '#94A3B8',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)';
                    e.currentTarget.style.right = '-16px';
                    e.currentTarget.style.boxShadow = '6px 0 15px rgba(30, 136, 229, 0.15)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#94A3B8';
                    e.currentTarget.style.right = '-14px';
                    e.currentTarget.style.boxShadow = '4px 0 10px rgba(0,0,0,0.04)';
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'currentColor' }}></div>
                    {isOpen ? <ChevronLeft size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
                    <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'currentColor' }}></div>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: isOpen ? '1rem' : '0.75rem' }}>
                <div style={{
                    padding: isOpen ? '1.25rem' : '0.5rem',
                    background: '#F8FAFC',
                    borderRadius: '24px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isOpen ? 'flex-start' : 'center',
                    gap: isOpen ? '1rem' : '0',
                    transition: 'all 0.3s ease',
                    border: '1px solid #F1F5F9'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '1.2rem',
                        flexShrink: 0,
                        boxShadow: '0 8px 16px rgba(30, 136, 229, 0.2)'
                    }}>
                        {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    {isOpen && (
                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>{profile?.full_name || 'Hệ thống'}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B' }}>
                                • {profile?.role?.toUpperCase()}
                            </div>
                        </div>
                    )}
                </div>

                <nav>
                    {menuItems.map((section) => (
                        <div key={section.id} style={{ marginBottom: '0.5rem' }}>
                            <div
                                onClick={() => toggleSection(section.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isOpen ? 'flex-start' : 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: isOpen && openSections.includes(section.id) ? '#F1F5F9' : 'transparent',
                                    color: (isOpen && openSections.includes(section.id)) ? '#0F172A' : '#64748B'
                                }}
                            >
                                <span style={{ opacity: openSections.includes(section.id) ? 1 : 0.7, flexShrink: 0 }}>{section.icon}</span>
                                {isOpen && (
                                    <>
                                        <span style={{ flex: 1, fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>{section.title}</span>
                                        <ChevronDown size={14} style={{ transform: openSections.includes(section.id) ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', opacity: 0.4 }} />
                                    </>
                                )}
                            </div>

                            {(isOpen && openSections.includes(section.id)) && (
                                <div style={{
                                    paddingLeft: '1rem',
                                    marginTop: '4px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px'
                                }}>
                                    {section.items.map((item, idx) => (
                                        <Link
                                            key={idx}
                                            to={item.path}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
                                                borderRadius: '12px', textDecoration: 'none', fontSize: '0.9rem',
                                                fontWeight: isActive(item.path) ? 700 : 500,
                                                color: isActive(item.path) ? 'var(--color-primary)' : '#475569',
                                                background: isActive(item.path) ? 'rgba(30, 136, 229, 0.08)' : 'transparent',
                                            }}
                                        >
                                            <span style={{ opacity: isActive(item.path) ? 1 : 0.5 }}>{item.icon}</span>
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            <div style={{ padding: isOpen ? '1.25rem' : '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                <Link to="/settings" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isOpen ? 'flex-start' : 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: location.pathname === '/settings' ? 'var(--color-primary)' : '#64748B',
                    background: location.pathname === '/settings' ? 'rgba(30, 136, 229, 0.08)' : 'transparent',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                }}>
                    <Settings size={20} style={{ flexShrink: 0, color: location.pathname === '/settings' ? 'var(--color-primary)' : 'inherit' }} />
                    {isOpen && <span>Cấu hình</span>}
                </Link>
                <button
                    onClick={() => signOut()}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isOpen ? 'flex-start' : 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: isOpen ? '#FEF2F2' : 'transparent',
                        border: 'none',
                        color: '#DC2626',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        marginTop: '4px'
                    }}
                >
                    <LogOut size={20} style={{ flexShrink: 0 }} />
                    {isOpen && <span>Đăng xuất</span>}
                </button>
            </div>
        </aside>
    );
}

const CheckCircle2 = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
);
