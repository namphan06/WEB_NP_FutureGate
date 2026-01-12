import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    FiFileText,
    FiBriefcase,
    FiSettings,
    FiChevronDown,
    FiUser,
    FiMail,
    FiShield,
    FiBook
} from 'react-icons/fi';

interface SidebarProps {
    isOpen: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user, profile } = useAuth();
    const location = useLocation();
    const [openSections, setOpenSections] = useState<string[]>(['jobs', 'cv']);

    const toggleSection = (section: string) => {
        setOpenSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const isActive = (path: string) => location.pathname === path;

    // Menu structure based on role
    const getMenuItems = () => {
        const role = profile?.role;

        // Candidate Menu
        if (role === 'candidate') {
            return [
                {
                    id: 'jobs',
                    title: 'Quản lý tìm việc',
                    icon: <FiBriefcase />,
                    items: [
                        { label: 'Việc làm đã lưu', path: '/candidate/saved-jobs' },
                        { label: 'Việc làm đã ứng tuyển', path: '/candidate/applied-jobs' },
                        { label: 'Việc làm phù hợp với bạn', path: '/jobs' },
                        { label: 'Cài đặt gợi ý việc làm', path: '/candidate/job-alerts' },
                    ]
                },
                {
                    id: 'cv',
                    title: 'Quản lý CV & Cover letter',
                    icon: <FiFileText />,
                    items: [
                        { label: 'CV của tôi', path: '/candidate/cv' },
                        { label: 'Cover Letter của tôi', path: '/candidate/cover-letters' },
                        { label: 'Nhà tuyển dụng muốn kết nối với bạn', path: '/candidate/connections' },
                        { label: 'Nhà tuyển dụng xem hồ sơ', path: '/candidate/profile-views' },
                    ]
                },
                {
                    id: 'settings',
                    title: 'Cài đặt email & thông báo',
                    icon: <FiMail />,
                    items: [
                        { label: 'Cài đặt nhận email', path: '/settings/email' },
                        { label: 'Cài đặt thông báo', path: '/settings/notifications' },
                    ]
                },
                {
                    id: 'account',
                    title: 'Cá nhân & Bảo mật',
                    icon: <FiUser />,
                    items: [
                        { label: 'Thông tin cá nhân', path: '/profile' },
                        { label: 'Đổi mật khẩu', path: '/settings/password' },
                    ]
                },
            ];
        }

        // Employer Menu
        if (role === 'employer') {
            return [
                {
                    id: 'recruitment',
                    title: 'Quản lý tuyển dụng',
                    icon: <FiBriefcase />,
                    items: [
                        { label: 'Đăng tin tuyển dụng', path: '/employer/jobs/create' },
                        { label: 'Tin đã đăng', path: '/employer/jobs' },
                        { label: 'Ứng viên đã ứng tuyển', path: '/employer/applicants' },
                        { label: 'Ứng viên đã lưu', path: '/employer/saved-candidates' },
                    ]
                },
                {
                    id: 'company',
                    title: 'Quản lý công ty',
                    icon: <FiBriefcase />,
                    items: [
                        { label: 'Thông tin công ty', path: '/employer/company' },
                        { label: 'Dashboard', path: '/employer/dashboard' },
                    ]
                },
                {
                    id: 'settings',
                    title: 'Cài đặt',
                    icon: <FiSettings />,
                    items: [
                        { label: 'Thông tin tài khoản', path: '/profile' },
                        { label: 'Bảo mật', path: '/settings/security' },
                    ]
                },
            ];
        }

        // School Menu
        if (role === 'school') {
            return [
                {
                    id: 'partnerships',
                    title: 'Quản lý hợp tác',
                    icon: <FiBook />,
                    items: [
                        { label: 'Danh sách đối tác', path: '/school/partnerships' },
                        { label: 'Việc làm từ trường', path: '/school/jobs' },
                    ]
                },
                {
                    id: 'settings',
                    title: 'Cài đặt',
                    icon: <FiSettings />,
                    items: [
                        { label: 'Thông tin trường', path: '/school/info' },
                        { label: 'Dashboard', path: '/school/dashboard' },
                    ]
                },
            ];
        }

        // Admin Menu
        if (role === 'admin') {
            return [
                {
                    id: 'management',
                    title: 'Quản trị hệ thống',
                    icon: <FiShield />,
                    items: [
                        { label: 'Dashboard', path: '/admin/dashboard' },
                        { label: 'Quản lý người dùng', path: '/admin/users' },
                        { label: 'Duyệt tin tuyển dụng', path: '/admin/jobs-approval' },
                        { label: 'Thống kê', path: '/admin/analytics' },
                    ]
                },
            ];
        }

        // Default menu
        return [];
    };

    const menuItems = getMenuItems();

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1029,
                        display: 'none'
                    }}
                    id="sidebar-backdrop"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`sidebar ${isOpen ? '' : 'sidebar-hidden'}`}
                style={{
                    paddingTop: 'var(--header-height)'
                }}
            >
                {/* User Info */}
                <div className="sidebar-header">
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">
                            {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="sidebar-user-info">
                            <h4>{profile?.full_name || 'Người dùng'}</h4>
                            <p>ID {user?.id.slice(0, 7) || '---'}</p>
                            <p style={{ fontSize: '0.8125rem' }}>{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Menu Sections */}
                <ul className="sidebar-menu">
                    {menuItems.map((section) => (
                        <li key={section.id} className="sidebar-menu-section">
                            <div
                                className="sidebar-menu-title"
                                onClick={() => toggleSection(section.id)}
                            >
                                <div className="sidebar-menu-title-icon">
                                    {section.icon}
                                </div>
                                <span className="sidebar-menu-title-text">{section.title}</span>
                                <FiChevronDown
                                    className={`sidebar-menu-title-chevron ${openSections.includes(section.id) ? 'open' : ''
                                        }`}
                                    size={16}
                                />
                            </div>

                            <ul className={`sidebar-submenu ${openSections.includes(section.id) ? 'open' : ''}`}>
                                {section.items.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            to={item.path}
                                            className="sidebar-submenu-item"
                                            style={{
                                                background: isActive(item.path) ? 'var(--color-hover)' : 'transparent',
                                                color: isActive(item.path) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                                fontWeight: isActive(item.path) ? 600 : 400,
                                            }}
                                            onClick={onClose}
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>

                {/* Footer */}
                <div className="sidebar-footer">
                    <Link
                        to="/login"
                        className="btn btn-outline-primary btn-block"
                        style={{ fontSize: '0.9375rem' }}
                    >
                        Đăng tuyển & tìm hồ sơ
                    </Link>
                </div>
            </aside>

            <style>{`
        @media (max-width: 1024px) {
          #sidebar-backdrop {
            display: block !important;
          }
        }
      `}</style>
        </>
    );
}
