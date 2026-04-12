import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { FiBell, FiMessageSquare, FiUser, FiSettings, FiLogOut, FiChevronDown, FiLayout, FiPlusCircle, FiList, FiPauseCircle, FiHome, FiFileText, FiClock, FiCheckSquare, FiStar, FiCalendar, FiBarChart2, FiZap, FiLink2, FiUsers, FiCheckCircle, FiMenu, FiChevronsLeft, FiX } from 'react-icons/fi';

interface NavbarProps {
    onToggleSidebar?: () => void;
    isSidebarOpen?: boolean;
}

export default function Navbar({ onToggleSidebar, isSidebarOpen }: NavbarProps = {}) {
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

    // Mobile menu
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Timeout refs for delayed close (300ms delay)
    const jobsTimeoutRef = useRef<number | null>(null);
    const cvTimeoutRef = useRef<number | null>(null);
    const toolsTimeoutRef = useRef<number | null>(null);
    const empJobsTimeoutRef = useRef<number | null>(null);
    const empCandidatesTimeoutRef = useRef<number | null>(null);
    const empToolsTimeoutRef = useRef<number | null>(null);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

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

    // Mobile dropdown state
    const [mobileDropdowns, setMobileDropdowns] = useState<Record<string, boolean>>({});

    const toggleMobileDropdown = (key: string) => {
        setMobileDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!user) return null;

    // Mobile menu content based on role
    const renderMobileMenuContent = () => {
        if (profile?.role === 'admin') {
            return (
                <>
                    <Link to="/admin/dashboard" className={`mobile-nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <FiLayout size={18} />
                        Dashboard
                    </Link>
                    <Link to="/admin/users" className={`mobile-nav-link ${isActive('/admin/users') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <FiUsers size={18} />
                        Người dùng
                    </Link>
                    <Link to="/admin/jobs" className={`mobile-nav-link ${isActive('/admin/jobs') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <FiCheckCircle size={18} />
                        Duyệt tin
                    </Link>
                    <Link to="/admin/news" className={`mobile-nav-link ${isActive('/admin/news') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <FiFileText size={18} />
                        Tin tức
                    </Link>
                    <Link to="/admin/courses" className={`mobile-nav-link ${isActive('/admin/courses') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <FiList size={18} />
                        Khoá học
                    </Link>
                    <Link to="/admin/mbti" className={`mobile-nav-link ${isActive('/admin/mbti') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <FiLayout size={18} />
                        MBTI
                    </Link>
                    <Link to="/admin/analytics" className={`mobile-nav-link ${isActive('/admin/analytics') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <FiBarChart2 size={18} />
                        Thống kê
                    </Link>
                </>
            );
        } else if (profile?.role === 'employer') {
            return (
                <>
                    <Link to="/employer/dashboard" className={`mobile-nav-link ${isActive('/employer/dashboard') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        Dashboard
                    </Link>
                    <div className="mobile-dropdown">
                        <button className="mobile-dropdown-toggle" onClick={() => toggleMobileDropdown('empJobs')}>
                            Quản lý tin tuyển dụng
                            <FiChevronDown size={16} className={`mobile-dropdown-arrow ${mobileDropdowns.empJobs ? 'open' : ''}`} />
                        </button>
                        <div className={`mobile-dropdown-content ${mobileDropdowns.empJobs ? 'open' : ''}`}>
                            <Link to="/employer/jobs/create" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                                <FiPlusCircle size={16} />
                                Đăng tin mới
                            </Link>
                            <Link to="/employer/jobs" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                                <FiList size={16} />
                                Tin tuyển dụng đã đăng
                            </Link>
                            <Link to="/employer/jobs?status=paused" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                                <FiPauseCircle size={16} />
                                Tin tuyển dụng tạm dừng
                            </Link>
                            <Link to="/employer/school-requests" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                                <FiHome size={16} />
                                Yêu cầu từ nhà trường
                            </Link>
                        </div>
                    </div>
                    <div className="mobile-dropdown">
                        <button className="mobile-dropdown-toggle" onClick={() => toggleMobileDropdown('empCandidates')}>
                            Quản lý ứng viên
                            <FiChevronDown size={16} className={`mobile-dropdown-arrow ${mobileDropdowns.empCandidates ? 'open' : ''}`} />
                        </button>
                        <div className={`mobile-dropdown-content ${mobileDropdowns.empCandidates ? 'open' : ''}`}>
                            <Link to="/employer/candidates?filter=new" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                                <FiFileText size={16} />
                                Ứng viên mới nhất
                            </Link>
                            <Link to="/employer/candidates?filter=processing" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                                <FiClock size={16} />
                                Đang xử lý
                            </Link>
                            <Link to="/employer/candidates?filter=approved" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                                <FiCheckSquare size={16} />
                                Đã duyệt hồ sơ
                            </Link>
                            <Link to="/employer/candidates/saved" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                                <FiStar size={16} />
                                Ứng viên đã lưu
                            </Link>
                        </div>
                    </div>
                    <div className="mobile-dropdown">
                        <button className="mobile-dropdown-toggle" onClick={() => toggleMobileDropdown('empTools')}>
                            Tiện ích
                            <FiChevronDown size={16} className={`mobile-dropdown-arrow ${mobileDropdowns.empTools ? 'open' : ''}`} />
                        </button>
                        <div className={`mobile-dropdown-content ${mobileDropdowns.empTools ? 'open' : ''}`}>
                            <Link to="/employer/interviews" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                                <FiCalendar size={16} />
                                Lịch phỏng vấn
                            </Link>
                            <Link to="/employer/schools" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                                <FiLink2 size={16} />
                                Liên kết trường học
                            </Link>
                            <Link to="/employer/analytics" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                                <FiBarChart2 size={16} />
                                Thống kê tuyển dụng
                            </Link>
                            <Link to="/employer/evaluations" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                                <FiCheckSquare size={16} />
                                Đánh giá ứng viên
                            </Link>
                            <Link to="/employer/automations" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                                <FiZap size={16} />
                                Thông báo tự động
                            </Link>
                        </div>
                    </div>
                </>
            );
        } else if (profile?.role === 'school') {
            return (
                <>
                    <Link to="/school/dashboard" className={`mobile-nav-link ${isActive('/school/dashboard') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <FiLayout size={18} />
                        Dashboard
                    </Link>
                    <Link to="/school/partnerships" className={`mobile-nav-link ${isActive('/school/partnerships') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <FiLink2 size={18} />
                        Đối tác
                    </Link>
                    <Link to="/school/students" className={`mobile-nav-link ${isActive('/school/students') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <FiUsers size={18} />
                        Sinh viên
                    </Link>
                    <Link to="/news" className={`mobile-nav-link ${isActive('/news') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <FiFileText size={18} />
                        Tin tuyển dụng
                    </Link>
                </>
            );
        } else {
            return (
                <>
                    <div className="mobile-dropdown">
                        <button className="mobile-dropdown-toggle" onClick={() => toggleMobileDropdown('jobs')}>
                            Việc làm
                            <FiChevronDown size={16} className={`mobile-dropdown-arrow ${mobileDropdowns.jobs ? 'open' : ''}`} />
                        </button>
                        <div className={`mobile-dropdown-content ${mobileDropdowns.jobs ? 'open' : ''}`}>
                            <Link to="/jobs" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>Tìm việc làm</Link>
                            <Link to="/jobs?filter=latest" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>Việc làm mới nhất</Link>
                            <Link to="/jobs?filter=applied" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>Việc làm đã ứng tuyển</Link>
                            <Link to="/candidate/saved-jobs" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>Việc làm đã lưu</Link>
                        </div>
                    </div>
                    <div className="mobile-dropdown">
                        <button className="mobile-dropdown-toggle" onClick={() => toggleMobileDropdown('cv')}>
                            Tạo CV
                            <FiChevronDown size={16} className={`mobile-dropdown-arrow ${mobileDropdowns.cv ? 'open' : ''}`} />
                        </button>
                        <div className={`mobile-dropdown-content ${mobileDropdowns.cv ? 'open' : ''}`}>
                            <Link to="/candidate/cv" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>CV của tôi</Link>
                            <Link to="/candidate/cv/create" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>Tạo CV mới</Link>
                            <Link to="/cv-templates" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>Mẫu CV</Link>
                        </div>
                    </div>
                    <div className="mobile-dropdown">
                        <button className="mobile-dropdown-toggle" onClick={() => toggleMobileDropdown('tools')}>
                            Công cụ
                            <FiChevronDown size={16} className={`mobile-dropdown-arrow ${mobileDropdowns.tools ? 'open' : ''}`} />
                        </button>
                        <div className={`mobile-dropdown-content ${mobileDropdowns.tools ? 'open' : ''}`}>
                            <Link to="/tools/salary-calculator" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>Tính lương NET</Link>
                            <Link to="/tools/resume-review" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>Đánh giá CV</Link>
                            <Link to="/tools/career-test" className="mobile-dropdown-item" onClick={() => setMobileMenuOpen(false)}>Trắc nghiệm tính cách</Link>
                        </div>
                    </div>
                    <Link to="/courses" className={`mobile-nav-link ${isActive('/courses') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        Khoá học
                    </Link>
                    <Link to="/news" className={`mobile-nav-link ${isActive('/news') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        Tin tức nghề nghiệp
                    </Link>
                </>
            );
        }
    };

    return (
        <>
            <nav className="navbar glass-navbar">
                <div className="navbar-container">
                    {/* Left: Logo + Menus */}
                    <div className="navbar-left">
                        {onToggleSidebar && (
                            <button
                                onClick={onToggleSidebar}
                                className="sidebar-toggle-btn"
                            >
                                {isSidebarOpen ? <FiChevronsLeft size={20} /> : <FiMenu size={20} />}
                            </button>
                        )}
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

                        {/* Mobile hamburger button */}
                        <button
                            className="mobile-menu-btn"
                            onClick={() => {
                                setMobileMenuOpen(!mobileMenuOpen);
                                setMobileDropdowns({});
                            }}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
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

            {/* Mobile Menu Overlay */}
            <div className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)} />

            {/* Mobile Menu Panel */}
            <div className={`mobile-menu-panel ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-header">
                    <div className="mobile-menu-brand">
                        <span className="navbar-brand-text">NP</span>
                        <span className="mobile-menu-tagline">Nơi tìm việc - Nơi tuyển dụng</span>
                    </div>
                    <button
                        className="mobile-menu-close"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-label="Close menu"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Mobile user info */}
                <div className="mobile-user-info">
                    <div className="mobile-user-avatar">
                        {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="mobile-user-details">
                        <div className="mobile-user-name">{profile?.full_name || 'Người dùng'}</div>
                        <div className="mobile-user-email">{user.email}</div>
                        <span className="badge badge-primary">
                            {profile?.role === 'candidate' && 'Ứng viên'}
                            {profile?.role === 'employer' && 'Nhà tuyển dụng'}
                            {profile?.role === 'school' && 'Nhà trường'}
                            {profile?.role === 'admin' && 'Quản trị viên'}
                        </span>
                    </div>
                </div>

                <div className="mobile-menu-content">
                    {renderMobileMenuContent()}
                </div>

                <div className="mobile-menu-footer">
                    <Link to="/profile" className="mobile-footer-link" onClick={() => setMobileMenuOpen(false)}>
                        <FiUser size={18} />
                        Hồ sơ
                    </Link>
                    <Link to="/settings" className="mobile-footer-link" onClick={() => setMobileMenuOpen(false)}>
                        <FiSettings size={18} />
                        Cài đặt
                    </Link>
                    <button className="mobile-footer-link mobile-logout" onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}>
                        <FiLogOut size={18} />
                        Đăng xuất
                    </button>
                </div>
            </div>

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

                /* Sidebar toggle button */
                .sidebar-toggle-btn {
                    background: rgba(30, 136, 229, 0.08);
                    border: none;
                    cursor: pointer;
                    color: var(--color-primary);
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }

                .sidebar-toggle-btn:hover {
                    background: rgba(30, 136, 229, 0.15);
                    transform: scale(1.05);
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

                /* Mobile menu button */
                .mobile-menu-btn {
                    display: none;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: var(--color-text);
                    padding: 8px;
                    border-radius: var(--radius-sm);
                    transition: all var(--transition-fast);
                }

                .mobile-menu-btn:hover {
                    background: var(--color-primary-50);
                    color: var(--color-primary);
                }

                /* Mobile overlay */
                .mobile-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                    z-index: calc(var(--z-fixed) - 10);
                    opacity: 0;
                    visibility: hidden;
                    transition: all var(--transition-base);
                }

                .mobile-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }

                /* Mobile menu panel */
                .mobile-menu-panel {
                    position: fixed;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    width: 320px;
                    max-width: 85vw;
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    z-index: var(--z-fixed);
                    transform: translateX(100%);
                    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                    display: flex;
                    flex-direction: column;
                    box-shadow: -10px 0 40px rgba(0, 0, 0, 0.1);
                }

                .mobile-menu-panel.open {
                    transform: translateX(0);
                }

                /* Mobile menu header */
                .mobile-menu-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--spacing-lg);
                    border-bottom: 1px solid var(--color-border-light);
                }

                .mobile-menu-brand {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .mobile-menu-tagline {
                    font-size: 0.65rem;
                    font-weight: 600;
                    color: var(--color-text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    opacity: 0.8;
                }

                .mobile-menu-close {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: var(--color-text-secondary);
                    padding: 8px;
                    border-radius: var(--radius-sm);
                    transition: all var(--transition-fast);
                }

                .mobile-menu-close:hover {
                    background: var(--color-error-light);
                    color: var(--color-error);
                }

                /* Mobile user info */
                .mobile-user-info {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                    padding: var(--spacing-lg);
                    border-bottom: 1px solid var(--color-border-light);
                }

                .mobile-user-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: var(--radius-full);
                    background: var(--color-primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                }

                .mobile-user-details {
                    flex: 1;
                    min-width: 0;
                }

                .mobile-user-name {
                    font-weight: 600;
                    font-size: 0.95rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .mobile-user-email {
                    font-size: 0.8rem;
                    color: var(--color-text-secondary);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Mobile menu content */
                .mobile-menu-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: var(--spacing-md);
                }

                /* Mobile nav link */
                .mobile-nav-link {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                    padding: var(--spacing-md) var(--spacing-md);
                    font-weight: 600;
                    font-size: 0.95rem;
                    color: var(--color-text);
                    text-decoration: none;
                    border-radius: var(--radius-md);
                    transition: all var(--transition-fast);
                    margin-bottom: 4px;
                }

                .mobile-nav-link:hover,
                .mobile-nav-link.active {
                    background: rgba(30, 136, 229, 0.08);
                    color: var(--color-primary);
                }

                /* Mobile dropdown */
                .mobile-dropdown {
                    margin-bottom: 4px;
                }

                .mobile-dropdown-toggle {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding: var(--spacing-md) var(--spacing-md);
                    font-weight: 600;
                    font-size: 0.95rem;
                    color: var(--color-text);
                    background: transparent;
                    border: none;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    font-family: inherit;
                }

                .mobile-dropdown-toggle:hover {
                    background: rgba(30, 136, 229, 0.08);
                    color: var(--color-primary);
                }

                .mobile-dropdown-arrow {
                    transition: transform 0.25s ease;
                }

                .mobile-dropdown-arrow.open {
                    transform: rotate(180deg);
                }

                .mobile-dropdown-content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease;
                    padding-left: var(--spacing-md);
                }

                .mobile-dropdown-content.open {
                    max-height: 500px;
                }

                .mobile-dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    padding: var(--spacing-sm) var(--spacing-md);
                    font-size: 0.9rem;
                    color: var(--color-text-secondary);
                    text-decoration: none;
                    border-radius: var(--radius-sm);
                    transition: all var(--transition-fast);
                    margin-bottom: 2px;
                }

                .mobile-dropdown-item:hover {
                    background: rgba(30, 136, 229, 0.06);
                    color: var(--color-primary);
                }

                /* Mobile menu footer */
                .mobile-menu-footer {
                    display: flex;
                    flex-direction: column;
                    padding: var(--spacing-md);
                    border-top: 1px solid var(--color-border-light);
                    gap: 4px;
                }

                .mobile-footer-link {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    padding: var(--spacing-sm) var(--spacing-md);
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--color-text-secondary);
                    text-decoration: none;
                    border-radius: var(--radius-sm);
                    transition: all var(--transition-fast);
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    font-family: inherit;
                    width: 100%;
                    text-align: left;
                }

                .mobile-footer-link:hover {
                    background: var(--color-primary-50);
                    color: var(--color-primary);
                }

                .mobile-logout {
                    color: var(--color-error);
                }

                .mobile-logout:hover {
                    background: var(--color-error-light);
                    color: var(--color-error-dark);
                }

                /* Responsive styles */
                @media (max-width: 1024px) {
                    .desktop-menu {
                        display: none;
                    }

                    .mobile-menu-btn {
                        display: flex;
                        align-items: center;
                        justify-content: center;
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

                    .mobile-menu-panel {
                        width: 100vw;
                        max-width: 100vw;
                    }
                }
            `}</style>
        </>
    );
}
