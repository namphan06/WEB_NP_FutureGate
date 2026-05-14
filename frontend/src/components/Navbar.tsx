import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef } from 'react';
import { FiBell, FiMessageSquare, FiUser, FiSettings, FiLogOut, FiChevronDown, FiLayout, FiPlusCircle, FiList, FiPauseCircle, FiHome, FiFileText, FiClock, FiCheckSquare, FiStar, FiCalendar, FiBarChart2, FiZap, FiLink2, FiUsers, FiCheckCircle } from 'react-icons/fi';

export default function Navbar() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showJobsMenu, setShowJobsMenu] = useState(false);
    const [showCVMenu, setShowCVMenu] = useState(false);
    const [showToolsMenu, setShowToolsMenu] = useState(false);

    // Employer specific menus
    const [showEmpJobsMenu, setShowEmpJobsMenu] = useState(false);
    const [showEmpCandidatesMenu, setShowEmpCandidatesMenu] = useState(false);
    const [showEmpToolsMenu, setShowEmpToolsMenu] = useState(false);

    // Timeout refs for delayed close (300ms delay)
    const jobsTimeoutRef = useRef<number | null>(null);
    const cvTimeoutRef = useRef<number | null>(null);
    const toolsTimeoutRef = useRef<number | null>(null);
    const empJobsTimeoutRef = useRef<number | null>(null);
    const empCandidatesTimeoutRef = useRef<number | null>(null);
    const empToolsTimeoutRef = useRef<number | null>(null);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const handleJobsEnter = () => {
        if (jobsTimeoutRef.current) clearTimeout(jobsTimeoutRef.current);
        setShowJobsMenu(true);
    };

    const handleJobsLeave = () => {
        jobsTimeoutRef.current = window.setTimeout(() => setShowJobsMenu(false), 300);
    };

    const handleCVEnter = () => {
        if (cvTimeoutRef.current) clearTimeout(cvTimeoutRef.current);
        setShowCVMenu(true);
    };

    const handleCVLeave = () => {
        cvTimeoutRef.current = window.setTimeout(() => setShowCVMenu(false), 300);
    };

    const handleToolsEnter = () => {
        if (toolsTimeoutRef.current) clearTimeout(toolsTimeoutRef.current);
        setShowToolsMenu(true);
    };

    const handleToolsLeave = () => {
        toolsTimeoutRef.current = window.setTimeout(() => setShowToolsMenu(false), 300);
    };

    // Employer handlers
    const handleEmpJobsEnter = () => {
        if (empJobsTimeoutRef.current) clearTimeout(empJobsTimeoutRef.current);
        setShowEmpJobsMenu(true);
    };
    const handleEmpJobsLeave = () => {
        empJobsTimeoutRef.current = window.setTimeout(() => setShowEmpJobsMenu(false), 300);
    };

    const handleEmpCandidatesEnter = () => {
        if (empCandidatesTimeoutRef.current) clearTimeout(empCandidatesTimeoutRef.current);
        setShowEmpCandidatesMenu(true);
    };
    const handleEmpCandidatesLeave = () => {
        empCandidatesTimeoutRef.current = window.setTimeout(() => setShowEmpCandidatesMenu(false), 300);
    };

    const handleEmpToolsEnter = () => {
        if (empToolsTimeoutRef.current) clearTimeout(empToolsTimeoutRef.current);
        setShowEmpToolsMenu(true);
    };
    const handleEmpToolsLeave = () => {
        empToolsTimeoutRef.current = window.setTimeout(() => setShowEmpToolsMenu(false), 300);
    };

    // Helper function to check if a path is active
    const isActive = (path: string) => location.pathname === path;

    if (!user) return null;

    return (
        <>
            <nav className="navbar glass-navbar">
                <div className="navbar-container">
                    {/* Left: Logo + Menus */}
                    <div className="navbar-left">
                        <div className="navbar-brand-wrapper">
                            <Link to="/" className="navbar-brand">
                                <span className="navbar-brand-text">NP</span>
                            </Link>
                            <div className="navbar-tagline">
                                Nơi tìm việc - Nơi tuyển dụng
                            </div>
                        </div>

                        {/* Desktop Menu Items - Role Based */}
                        <div className="desktop-menu">
                            {profile?.role === 'admin' ? (
                                <div className="admin-menu">
                                    <Link to="/admin/dashboard" className={`nav-link-item ${isActive('/admin/dashboard') ? 'active' : ''}`}>
                                        <FiLayout size={18} />
                                        Dashboard
                                    </Link>
                                    <Link to="/admin/users" className={`nav-link-item ${isActive('/admin/users') ? 'active' : ''}`}>
                                        <FiUsers size={18} />
                                        Người dùng
                                    </Link>
                                    <Link to="/admin/jobs" className={`nav-link-item ${isActive('/admin/jobs') ? 'active' : ''}`}>
                                        <FiCheckCircle size={18} />
                                        Duyệt tin
                                    </Link>
                                    <Link to="/admin/news" className={`nav-link-item ${isActive('/admin/news') ? 'active' : ''}`}>
                                        <FiFileText size={18} />
                                        Tin tức
                                    </Link>
                                    <Link to="/admin/courses" className={`nav-link-item ${isActive('/admin/courses') ? 'active' : ''}`}>
                                        <FiList size={18} />
                                        Khoá học
                                    </Link>
                                    <Link to="/admin/mbti" className={`nav-link-item ${isActive('/admin/mbti') ? 'active' : ''}`}>
                                        <FiLayout size={18} />
                                        MBTI
                                    </Link>
                                    <Link to="/admin/analytics" className={`nav-link-item ${isActive('/admin/analytics') ? 'active' : ''}`}>
                                        <FiBarChart2 size={18} />
                                        Thống kê
                                    </Link>
                                </div>
                            ) : profile?.role === 'employer' ? (
                                <>
                                    <Link to="/employer/dashboard" className="nav-link-item">
                                        Dashboard
                                    </Link>

                                    <div className="nav-dropdown" onMouseEnter={handleEmpJobsEnter} onMouseLeave={handleEmpJobsLeave}>
                                        <button className="navbar-nav-btn">
                                            Quản lý tin tuyển dụng
                                            <FiChevronDown size={14} />
                                        </button>
                                        {showEmpJobsMenu && (
                                            <div className="dropdown-menu animate-dropdown">
                                                <Link to="/employer/jobs/create" className="dropdown-item">
                                                    <FiPlusCircle size={18} />
                                                    Đăng tin mới
                                                </Link>
                                                <Link to="/employer/jobs" className="dropdown-item">
                                                    <FiList size={18} />
                                                    Tin tuyển dụng đã đăng
                                                </Link>
                                                <Link to="/employer/jobs?status=paused" className="dropdown-item">
                                                    <FiPauseCircle size={18} />
                                                    Tin tuyển dụng tạm dừng
                                                </Link>
                                                <Link to="/employer/school-requests" className="dropdown-item">
                                                    <FiHome size={18} />
                                                    Yêu cầu từ nhà trường
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    <div className="nav-dropdown" onMouseEnter={handleEmpCandidatesEnter} onMouseLeave={handleEmpCandidatesLeave}>
                                        <button className="navbar-nav-btn">
                                            Quản lý ứng viên
                                            <FiChevronDown size={14} />
                                        </button>
                                        {showEmpCandidatesMenu && (
                                            <div className="dropdown-menu animate-dropdown">
                                                <Link to="/employer/candidates?filter=new" className="dropdown-item">
                                                    <FiFileText size={18} />
                                                    Ứng viên mới nhất
                                                </Link>
                                                <Link to="/employer/candidates?filter=processing" className="dropdown-item">
                                                    <FiClock size={18} />
                                                    Đang xử lý
                                                </Link>
                                                <Link to="/employer/candidates?filter=approved" className="dropdown-item">
                                                    <FiCheckSquare size={18} />
                                                    Đã duyệt hồ sơ
                                                </Link>
                                                <Link to="/employer/candidates/saved" className="dropdown-item">
                                                    <FiStar size={18} />
                                                    Ứng viên đã lưu
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    <div className="nav-dropdown" onMouseEnter={handleEmpToolsEnter} onMouseLeave={handleEmpToolsLeave}>
                                        <button className="navbar-nav-btn">
                                            Tiện ích
                                            <FiChevronDown size={14} />
                                        </button>
                                        {showEmpToolsMenu && (
                                            <div className="dropdown-menu animate-dropdown">
                                                <Link to="/employer/interviews" className="dropdown-item">
                                                    <FiCalendar size={18} />
                                                    Lịch phỏng vấn
                                                </Link>
                                                <Link to="/employer/schools" className="dropdown-item">
                                                    <FiLink2 size={18} />
                                                    Liên kết trường học
                                                </Link>
                                                <Link to="/employer/analytics" className="dropdown-item">
                                                    <FiBarChart2 size={18} />
                                                    Thống kê tuyển dụng
                                                </Link>
                                                <Link to="/employer/evaluations" className="dropdown-item">
                                                    <FiCheckSquare size={18} />
                                                    Đánh giá ứng viên
                                                </Link>
                                                <Link to="/employer/automations" className="dropdown-item">
                                                    <FiZap size={18} />
                                                    Thông báo tự động
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : profile?.role === 'school' ? (
                                <>
                                    <Link to="/school/dashboard" className={`nav-link-item ${isActive('/school/dashboard') ? 'active' : ''}`}>
                                        <FiLayout size={18} />
                                        Dashboard
                                    </Link>
                                    <Link to="/school/partnerships" className={`nav-link-item ${isActive('/school/partnerships') ? 'active' : ''}`}>
                                        <FiLink2 size={18} />
                                        Đối tác
                                    </Link>
                                    <Link to="/school/students" className={`nav-link-item ${isActive('/school/students') ? 'active' : ''}`}>
                                        <FiUsers size={18} />
                                        Sinh viên
                                    </Link>
                                    <Link to="/news" className={`nav-link-item ${isActive('/news') ? 'active' : ''}`}>
                                        <FiFileText size={18} />
                                        Tin tuyển dụng
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <div className="nav-dropdown" onMouseEnter={handleJobsEnter} onMouseLeave={handleJobsLeave}>
                                        <button className="navbar-nav-btn">
                                            Việc làm
                                            <FiChevronDown size={14} />
                                        </button>
                                        {showJobsMenu && (
                                            <div className="dropdown-menu animate-dropdown">
                                                <Link to="/jobs" className="dropdown-item">Tìm việc làm</Link>
                                                <Link to="/jobs?filter=latest" className="dropdown-item">Việc làm mới nhất</Link>
                                                <Link to="/jobs?filter=applied" className="dropdown-item">Việc làm đã ứng tuyển</Link>
                                                <Link to="/candidate/saved-jobs" className="dropdown-item">Việc làm đã lưu</Link>
                                            </div>
                                        )}
                                    </div>

                                    <div className="nav-dropdown" onMouseEnter={handleCVEnter} onMouseLeave={handleCVLeave}>
                                        <button className="navbar-nav-btn">
                                            Tạo CV
                                            <FiChevronDown size={14} />
                                        </button>
                                        {showCVMenu && (
                                            <div className="dropdown-menu animate-dropdown">
                                                <Link to="/candidate/cv" className="dropdown-item">CV của tôi</Link>
                                                <Link to="/candidate/cv/create" className="dropdown-item">Tạo CV mới</Link>
                                                <Link to="/cv-templates" className="dropdown-item">Mẫu CV</Link>
                                            </div>
                                        )}
                                    </div>

                                    <div className="nav-dropdown" onMouseEnter={handleToolsEnter} onMouseLeave={handleToolsLeave}>
                                        <button className="navbar-nav-btn">
                                            Công cụ
                                            <FiChevronDown size={14} />
                                        </button>
                                        {showToolsMenu && (
                                            <div className="dropdown-menu animate-dropdown">
                                                <Link to="/tools/salary-calculator" className="dropdown-item">Tính lương NET</Link>
                                                <Link to="/tools/resume-review" className="dropdown-item">Đánh giá CV</Link>
                                                <Link to="/tools/career-test" className="dropdown-item">Trắc nghiệm tính cách</Link>
                                            </div>
                                        )}
                                    </div>

                                    <Link to="/courses" className="nav-link-item">
                                        Khoá học
                                    </Link>

                                    <Link to="/news" className="nav-link-item">
                                        Tin tức nghề nghiệp
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="navbar-actions">
                        {/* Notifications */}
                        <button className="navbar-icon-btn">
                            <FiBell size={20} />
                            <div className="navbar-icon-btn-badge">14</div>
                        </button>

                        {/* Messages */}
                        <button className="navbar-icon-btn" onClick={() => navigate('/chat')}>
                            <FiMessageSquare size={20} />
                        </button>

                        {/* User Avatar & Dropdown */}
                        <div className="user-menu-wrapper">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="user-avatar-btn"
                            >
                                {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                            </button>

                            {showUserMenu && (
                                <>
                                    <div
                                        className="overlay-backdrop"
                                        onClick={() => setShowUserMenu(false)}
                                    />

                                    <div className="dropdown-menu user-dropdown animate-dropdown">
                                        <div className="user-dropdown-header">
                                            <div className="user-dropdown-name">
                                                {profile?.full_name || 'Người dùng'}
                                            </div>
                                            <div className="user-dropdown-email">
                                                {user.email}
                                            </div>
                                            <span className="badge badge-primary">
                                                {profile?.role === 'candidate' && 'Ứng viên'}
                                                {profile?.role === 'employer' && 'Nhà tuyển dụng'}
                                                {profile?.role === 'school' && 'Nhà trường'}
                                                {profile?.role === 'admin' && 'Quản trị viên'}
                                            </span>
                                        </div>

                                        <div className="user-dropdown-links">
                                            <Link to="/profile" onClick={() => setShowUserMenu(false)} className="dropdown-item">
                                                <FiUser size={18} />
                                                Hồ sơ của tôi
                                            </Link>
                                            <Link to="/settings" onClick={() => setShowUserMenu(false)} className="dropdown-item">
                                                <FiSettings size={18} />
                                                Cài đặt
                                            </Link>
                                        </div>

                                        <div className="user-dropdown-footer">
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false);
                                                    handleSignOut();
                                                }}
                                                className="dropdown-item dropdown-item-danger"
                                            >
                                                <FiLogOut size={18} />
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Employer CTA */}
                        {profile?.role !== 'employer' && (
                            <Link to="/employer/register" className="btn btn-primary btn-sm cta-btn">
                                Đăng tuyển ngay →
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Styles */}
            <style>{`
                /* Glassmorphism navbar */
                .glass-navbar {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
                }

                /* Navbar left section */
                .navbar-left {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-xl);
                }

                /* Brand wrapper */
                .navbar-brand-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    position: relative;
                }

                .navbar-brand-text {
                    font-size: 2.5rem;
                    font-weight: 900;
                    letter-spacing: -2px;
                    color: var(--color-primary);
                    display: block;
                    line-height: 1;
                }

                /* Desktop menu */
                .desktop-menu {
                    display: flex;
                    gap: var(--spacing-lg);
                    align-items: center;
                }

                /* Admin menu */
                .admin-menu {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }

                /* Nav link item */
                .nav-link-item {
                    display: flex;
                    align-items: center;
                    gap: 0.625rem;
                    padding: 0.625rem 1rem;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: var(--color-text);
                    text-decoration: none;
                    border-radius: 12px;
                    transition: all 0.2s ease;
                    background: transparent;
                }

                .nav-link-item:hover {
                    background: rgba(30, 136, 229, 0.15);
                    color: var(--color-primary);
                    transform: translateY(-1px);
                }

                .nav-link-item.active {
                    background: rgba(30, 136, 229, 0.08);
                    color: var(--color-primary);
                    font-weight: 700;
                }

                /* Nav dropdown */
                .nav-dropdown {
                    position: relative;
                }

                /* Navbar nav button */
                .navbar-nav-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.5rem 0.875rem;
                    font-weight: 600;
                    font-size: 0.9375rem;
                    color: var(--color-text);
                    border-radius: 8px;
                    transition: all 0.2s;
                    font-family: inherit;
                }

                .navbar-nav-btn:hover {
                    background: var(--color-primary-light);
                    color: var(--color-primary);
                }

                /* Animated dropdown */
                .animate-dropdown {
                    animation: dropdown-pop-enhanced 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes dropdown-pop-enhanced {
                    from {
                        opacity: 0;
                        transform: scale(0.92) translateY(-12px);
                        filter: blur(4px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                        filter: blur(0);
                    }
                }

                /* Dropdown menu */
                .dropdown-menu {
                    position: absolute;
                    top: calc(100% + 12px);
                    left: 0;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    border-radius: 16px;
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.12), 0 10px 20px -5px rgba(0, 0, 0, 0.06);
                    min-width: 240px;
                    z-index: var(--z-dropdown);
                    overflow: hidden;
                    padding: 0.5rem;
                    transform-origin: top left;
                }

                /* User dropdown specific */
                .user-dropdown {
                    right: 0;
                    left: auto;
                    min-width: 280px;
                    transform-origin: top right;
                }

                .user-dropdown-header {
                    padding: var(--spacing-lg);
                    border-bottom: 1px solid var(--color-divider);
                    background: var(--color-background);
                }

                .user-dropdown-name {
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }

                .user-dropdown-email {
                    font-size: 0.875rem;
                    color: var(--color-text-secondary);
                    margin-bottom: 0.5rem;
                }

                .user-dropdown-links {
                    padding: var(--spacing-sm) 0;
                }

                .user-dropdown-footer {
                    border-top: 1px solid var(--color-divider);
                    padding: var(--spacing-sm) 0;
                }

                /* Dropdown item */
                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.875rem 1rem;
                    color: var(--color-text);
                    text-decoration: none;
                    transition: all 0.2s;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    cursor: pointer;
                    border: none;
                    background: transparent;
                    width: 100%;
                    text-align: left;
                    font-family: inherit;
                    border-radius: 10px;
                }

                .dropdown-item:hover {
                    background: white;
                    color: var(--color-primary);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    transform: translateX(4px);
                }

                .dropdown-item svg {
                    color: var(--color-text-secondary);
                    transition: all 0.2s;
                    font-size: 1.1rem;
                }

                .dropdown-item:hover svg {
                    color: var(--color-primary);
                    transform: scale(1.1);
                }

                .dropdown-item-danger {
                    color: var(--color-error) !important;
                }

                .dropdown-item-danger:hover {
                    background: var(--color-error-light);
                    color: var(--color-error-dark) !important;
                }

                .dropdown-item-danger:hover svg {
                    color: var(--color-error) !important;
                }

                /* Overlay backdrop for user menu */
                .overlay-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 999;
                }

                /* User avatar button */
                .user-avatar-btn {
                    width: 48px;
                    height: 48px;
                    border-radius: var(--radius-full);
                    background: var(--color-primary);
                    color: white;
                    border: 2px solid var(--color-border);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1rem;
                    transition: all var(--transition-fast);
                }

                .user-avatar-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
                }

                /* User menu wrapper */
                .user-menu-wrapper {
                    position: relative;
                }

                /* CTA button */
                .cta-btn {
                    white-space: nowrap;
                }

                /* Responsive styles */
                @media (max-width: 1024px) {
                    .desktop-menu {
                        display: none;
                    }

                    .cta-btn {
                        display: none;
                    }

                    .navbar-tagline {
                        display: none;
                    }

                    .navbar-brand-text {
                        font-size: 2rem;
                    }

                    .navbar-left {
                        gap: var(--spacing-md);
                    }
                }

                @media (max-width: 768px) {
                    .navbar-icon-btn {
                        width: 38px;
                        height: 38px;
                    }

                    .user-avatar-btn {
                        width: 42px;
                        height: 42px;
                        font-size: 0.9rem;
                    }
                }

                @media (max-width: 480px) {
                    .navbar-brand-text {
                        font-size: 1.75rem;
                    }
                }
            `}</style>
        </>
    );
}
