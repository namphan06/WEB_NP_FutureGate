import { useState, useEffect, useRef } from 'react';
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
    const [isMobile, setIsMobile] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const sidebarRef = useRef<HTMLElement>(null);
    const prevIsOpenRef = useRef(isOpen);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (prevIsOpenRef.current !== isOpen) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 350);
            prevIsOpenRef.current = isOpen;
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isMobile && isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobile, isOpen]);

    const toggleSection = (section: string) => {
        if (!isOpen && !isMobile) return;
        setOpenSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const isActive = (path: string) => location.pathname === path;

    const handleBackdropClick = () => {
        if (isMobile && onToggle) {
            onToggle();
        }
    };

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
                        { label: 'Trắc nghiệm MBTI', path: '/candidate/mbti-test', icon: <PieChart size={16} /> },
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
                        { label: 'Nội dung MBTI', path: '/admin/mbti', icon: <LayoutDashboard size={16} /> },
                    ]
                }
            ];
        }
        return [];
    })();

    const sidebarWidth = isOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed)';
    const showHandle = !isMobile;

    const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
        if (isOpen || isMobile) return <>{children}</>;
        return (
            <div
                style={{ position: 'relative' }}
                onMouseEnter={() => setHoveredItem(text)}
                onMouseLeave={() => setHoveredItem(null)}
            >
                {children}
                {hoveredItem === text && (
                    <div style={{
                        position: 'absolute',
                        left: '100%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        marginLeft: '12px',
                        padding: '6px 12px',
                        background: 'var(--color-text)',
                        color: 'white',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        zIndex: 'var(--z-tooltip)',
                        boxShadow: 'var(--shadow-lg)',
                        pointerEvents: 'none',
                        animation: 'fade-in 0.15s ease-out'
                    }}>
                        {text}
                        <div style={{
                            position: 'absolute',
                            left: '-4px',
                            top: '50%',
                            transform: 'translateY(-50%) rotate(45deg)',
                            width: '8px',
                            height: '8px',
                            background: 'var(--color-text)'
                        }} />
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {isMobile && isOpen && (
                <div
                    onClick={handleBackdropClick}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        zIndex: 'calc(var(--z-fixed) - 1)',
                        animation: 'fade-in 0.3s ease-out'
                    }}
                />
            )}

            <aside
                ref={sidebarRef}
                style={{
                    position: isMobile ? 'fixed' : 'fixed',
                    top: 0,
                    left: 0,
                    width: isMobile ? 'min(300px, 85vw)' : sidebarWidth,
                    height: '100vh',
                    maxHeight: '100vh',
                    background: 'var(--glass-bg-dark)',
                    backdropFilter: 'var(--glass-blur)',
                    WebkitBackdropFilter: 'var(--glass-blur)',
                    borderRight: isMobile ? 'none' : '1px solid var(--color-border)',
                    zIndex: isMobile ? 'var(--z-modal)' : 'var(--z-fixed)',
                    transition: isMobile
                        ? 'transform var(--transition-slow)'
                        : 'width var(--transition-slow), transform var(--transition-slow)',
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: 'var(--header-height)',
                    boxShadow: isMobile
                        ? 'var(--shadow-2xl)'
                        : '10px 0 30px rgba(0,0,0,0.02)',
                    overflow: 'hidden',
                    transform: isMobile
                        ? (isOpen ? 'translateX(0)' : 'translateX(-100%)')
                        : 'translateX(0)',
                    opacity: isAnimating ? 0.95 : 1
                }}
            >
                {showHandle && (
                    <div
                        onClick={onToggle}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: '-14px',
                            transform: 'translateY(-50%)',
                            width: '28px',
                            height: '56px',
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '4px 0 10px rgba(0,0,0,0.04)',
                            zIndex: 'calc(var(--z-fixed) + 2)',
                            color: 'var(--color-text-light)',
                            transition: 'all var(--transition-bounce)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--color-primary)';
                            e.currentTarget.style.right = '-16px';
                            e.currentTarget.style.boxShadow = '6px 0 15px rgba(30, 136, 229, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--color-text-light)';
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
                )}

                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: isOpen || isMobile ? 'var(--spacing-md)' : 'var(--spacing-sm)',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'var(--color-text-muted) transparent'
                }}>
                    <Tooltip text={profile?.full_name || 'Hệ thống'}>
                        <div style={{
                            padding: isOpen || isMobile ? 'var(--spacing-lg)' : 'var(--spacing-sm)',
                            background: 'var(--color-background-alt)',
                            borderRadius: 'var(--radius-2xl)',
                            marginBottom: 'var(--spacing-xl)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: (isOpen || isMobile) ? 'flex-start' : 'center',
                            gap: isOpen || isMobile ? 'var(--spacing-md)' : '0',
                            transition: 'all var(--transition-base)',
                            border: '1px solid var(--color-border-light)',
                            minHeight: '44px'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
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
                            {(isOpen || isMobile) && (
                                <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    <div style={{ fontWeight: 800, color: 'var(--color-text)', fontSize: '1rem' }}>{profile?.full_name || 'Hệ thống'}</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                                        • {profile?.role?.toUpperCase()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Tooltip>

                    <nav>
                        {menuItems.map((section) => (
                            <div key={section.id} style={{ marginBottom: 'var(--spacing-sm)' }}>
                                <Tooltip text={section.title}>
                                    <div
                                        onClick={() => toggleSection(section.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: (isOpen || isMobile) ? 'flex-start' : 'center',
                                            gap: '12px',
                                            padding: isOpen || isMobile ? '12px' : '12px',
                                            borderRadius: 'var(--radius-lg)',
                                            cursor: 'pointer',
                                            transition: 'all var(--transition-fast)',
                                            background: (isOpen || isMobile) && openSections.includes(section.id) ? 'var(--color-border-light)' : 'transparent',
                                            color: ((isOpen || isMobile) && openSections.includes(section.id)) ? 'var(--color-text)' : 'var(--color-text-secondary)',
                                            minHeight: '44px'
                                        }}
                                    >
                                        <span style={{ opacity: openSections.includes(section.id) ? 1 : 0.7, flexShrink: 0 }}>{section.icon}</span>
                                        {(isOpen || isMobile) && (
                                            <>
                                                <span style={{ flex: 1, fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>{section.title}</span>
                                                <ChevronDown size={14} style={{ transform: openSections.includes(section.id) ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', opacity: 0.4 }} />
                                            </>
                                        )}
                                    </div>
                                </Tooltip>

                                {((isOpen || isMobile) && openSections.includes(section.id)) && (
                                    <div style={{
                                        paddingLeft: 'var(--spacing-md)',
                                        marginTop: '4px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2px',
                                        animation: 'fade-in 0.2s ease-out'
                                    }}>
                                        {section.items.map((item, idx) => (
                                            <Link
                                                key={idx}
                                                to={item.path}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
                                                    borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '0.9rem',
                                                    fontWeight: isActive(item.path) ? 700 : 500,
                                                    color: isActive(item.path) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                                    background: isActive(item.path) ? 'rgba(30, 136, 229, 0.08)' : 'transparent',
                                                    minHeight: '44px',
                                                    transition: 'all var(--transition-fast)'
                                                }}
                                            >
                                                <span style={{ opacity: isActive(item.path) ? 1 : 0.5, flexShrink: 0 }}>{item.icon}</span>
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>

                <div style={{
                    padding: isOpen || isMobile ? 'var(--spacing-lg)' : 'var(--spacing-sm)',
                    borderTop: '1px solid var(--color-border-light)',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'var(--glass-blur)',
                    WebkitBackdropFilter: 'var(--glass-blur)'
                }}>
                    <Tooltip text="Cấu hình">
                        <Link to="/settings" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: (isOpen || isMobile) ? 'flex-start' : 'center',
                            gap: '12px',
                            padding: '12px',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            color: location.pathname === '/settings' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            background: location.pathname === '/settings' ? 'rgba(30, 136, 229, 0.08)' : 'transparent',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            minHeight: '44px',
                            transition: 'all var(--transition-fast)'
                        }}>
                            <Settings size={20} style={{ flexShrink: 0, color: location.pathname === '/settings' ? 'var(--color-primary)' : 'inherit' }} />
                            {(isOpen || isMobile) && <span>Cấu hình</span>}
                        </Link>
                    </Tooltip>
                    <Tooltip text="Đăng xuất">
                        <button
                            onClick={() => signOut()}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: (isOpen || isMobile) ? 'flex-start' : 'center',
                                gap: '12px',
                                padding: '12px',
                                borderRadius: 'var(--radius-md)',
                                background: (isOpen || isMobile) ? 'var(--color-error-light)' : 'transparent',
                                border: 'none',
                                color: 'var(--color-error)',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                marginTop: 'var(--spacing-xs)',
                                minHeight: '44px',
                                transition: 'all var(--transition-fast)'
                            }}
                        >
                            <LogOut size={20} style={{ flexShrink: 0 }} />
                            {(isOpen || isMobile) && <span>Đăng xuất</span>}
                        </button>
                    </Tooltip>
                </div>
            </aside>
        </>
    );
}

const CheckCircle2 = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
);
