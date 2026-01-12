import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef } from 'react';
import { FiBell, FiMessageSquare, FiUser, FiSettings, FiLogOut, FiChevronDown, FiLayout, FiPlusCircle, FiList, FiPauseCircle, FiHome, FiFileText, FiClock, FiCheckSquare, FiStar, FiCalendar, FiBarChart2, FiZap, FiLink2, FiUsers, FiCheckCircle } from 'react-icons/fi';

interface NavbarProps {
    onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps = {}) {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
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

    if (!user) return null;

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    {/* Left: Logo + Menus */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}>
                            <Link to="/" className="navbar-brand" style={{ gap: '0.25rem', marginBottom: '-4px' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-2px', color: 'var(--color-primary)', display: 'block', lineHeight: 1 }}>NP</span>
                            </Link>
                            <div className="navbar-tagline" style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0, whiteSpace: 'nowrap', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Nơi tìm việc - Nơi tuyển dụng
                            </div>
                        </div>

                        {/* Menu Items - Role Based */}
                        <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center' }}>
                            {profile?.role === 'admin' ? (
                                // ============ ADMIN MENU ============
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Link
                                        to="/admin/dashboard"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.625rem',
                                            padding: '0.625rem 1rem',
                                            fontWeight: 700,
                                            fontSize: '0.9rem',
                                            color: 'var(--color-primary)',
                                            textDecoration: 'none',
                                            borderRadius: '12px',
                                            background: 'rgba(30, 136, 229, 0.08)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(30, 136, 229, 0.15)';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(30, 136, 229, 0.08)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <FiLayout size={18} />
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/admin/users"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.625rem',
                                            padding: '0.625rem 1rem',
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                            color: 'var(--color-text)',
                                            textDecoration: 'none',
                                            borderRadius: '12px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <FiUsers size={18} />
                                        Người dùng
                                    </Link>
                                    <Link
                                        to="/admin/jobs"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.625rem',
                                            padding: '0.625rem 1rem',
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                            color: 'var(--color-text)',
                                            textDecoration: 'none',
                                            borderRadius: '12px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <FiCheckCircle size={18} />
                                        Duyệt tin
                                    </Link>
                                </div>
                            ) : profile?.role === 'employer' ? (
                                // ============ EMPLOYER MENU ============
                                <>
                                    <Link
                                        to="/employer/dashboard"
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            fontWeight: 600,
                                            fontSize: '0.9375rem',
                                            color: 'var(--color-text)',
                                            textDecoration: 'none',
                                            borderRadius: 'var(--radius-sm)',
                                            transition: 'background var(--transition-fast)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        Dashboard
                                    </Link>

                                    {/* Quản lý tin tuyển dụng */}
                                    <div
                                        style={{ position: 'relative' }}
                                        onMouseEnter={handleEmpJobsEnter}
                                        onMouseLeave={handleEmpJobsLeave}
                                    >
                                        <button className="navbar-nav-btn">
                                            Quản lý tin tuyển dụng
                                            <FiChevronDown size={14} />
                                        </button>

                                        {showEmpJobsMenu && (
                                            <div className="dropdown-menu" style={{ paddingTop: '0.5rem', minWidth: '240px' }}>
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

                                    {/* Quản lý ứng viên */}
                                    <div
                                        style={{ position: 'relative' }}
                                        onMouseEnter={handleEmpCandidatesEnter}
                                        onMouseLeave={handleEmpCandidatesLeave}
                                    >
                                        <button className="navbar-nav-btn">
                                            Quản lý ứng viên
                                            <FiChevronDown size={14} />
                                        </button>

                                        {showEmpCandidatesMenu && (
                                            <div className="dropdown-menu" style={{ paddingTop: '0.5rem', minWidth: '220px' }}>
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

                                    {/* Tiện ích */}
                                    <div
                                        style={{ position: 'relative' }}
                                        onMouseEnter={handleEmpToolsEnter}
                                        onMouseLeave={handleEmpToolsLeave}
                                    >
                                        <button className="navbar-nav-btn">
                                            Tiện ích
                                            <FiChevronDown size={14} />
                                        </button>

                                        {showEmpToolsMenu && (
                                            <div className="dropdown-menu" style={{ paddingTop: '0.5rem', minWidth: '220px' }}>
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
                                // ============ SCHOOL MENU ============
                                <>
                                    <Link
                                        to="/school/dashboard"
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            fontWeight: 500,
                                            fontSize: '0.9375rem',
                                            color: 'var(--color-text)',
                                            textDecoration: 'none',
                                            borderRadius: 'var(--radius-sm)',
                                            transition: 'background var(--transition-fast)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        📊 Dashboard
                                    </Link>
                                    <Link
                                        to="/school/jobs/create"
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            fontWeight: 500,
                                            fontSize: '0.9375rem',
                                            color: 'var(--color-text)',
                                            textDecoration: 'none',
                                            borderRadius: 'var(--radius-sm)',
                                            transition: 'background var(--transition-fast)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        ➕ Đăng việc
                                    </Link>
                                    <Link
                                        to="/school/jobs"
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            fontWeight: 500,
                                            fontSize: '0.9375rem',
                                            color: 'var(--color-text)',
                                            textDecoration: 'none',
                                            borderRadius: 'var(--radius-sm)',
                                            transition: 'background var(--transition-fast)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        📋 Quản lý
                                    </Link>
                                    <Link
                                        to="/school/students"
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            fontWeight: 500,
                                            fontSize: '0.9375rem',
                                            color: 'var(--color-text)',
                                            textDecoration: 'none',
                                            borderRadius: 'var(--radius-sm)',
                                            transition: 'background var(--transition-fast)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        🎓 Học sinh
                                    </Link>
                                </>
                            ) : (
                                // ============ CANDIDATE MENU (Default) ============
                                <>
                                    {/* Việc làm */}
                                    <div
                                        style={{ position: 'relative' }}
                                        onMouseEnter={handleJobsEnter}
                                        onMouseLeave={handleJobsLeave}
                                    >
                                        <button
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                padding: '0.5rem 0.75rem',
                                                fontWeight: 500,
                                                fontSize: '0.9375rem',
                                                color: 'var(--color-text)',
                                                borderRadius: 'var(--radius-sm)',
                                                transition: 'background var(--transition-fast)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-hover)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            Việc làm
                                            <FiChevronDown size={14} />
                                        </button>

                                        {showJobsMenu && (
                                            <div className="dropdown-menu" style={{ paddingTop: '0.5rem' }}>
                                                <Link to="/jobs" className="dropdown-item">Tìm việc làm</Link>
                                                <Link to="/jobs?filter=latest" className="dropdown-item">Việc làm mới nhất</Link>
                                                <Link to="/jobs?filter=hot" className="dropdown-item">Việc làm hot</Link>
                                                <Link to="/candidate/saved-jobs" className="dropdown-item">Việc làm đã lưu</Link>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tạo CV */}
                                    <div
                                        style={{ position: 'relative' }}
                                        onMouseEnter={handleCVEnter}
                                        onMouseLeave={handleCVLeave}
                                    >
                                        <button
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                padding: '0.5rem 0.75rem',
                                                fontWeight: 500,
                                                fontSize: '0.9375rem',
                                                color: 'var(--color-text)',
                                                borderRadius: 'var(--radius-sm)',
                                                transition: 'background var(--transition-fast)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-hover)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            Tạo CV
                                            <FiChevronDown size={14} />
                                        </button>

                                        {showCVMenu && (
                                            <div className="dropdown-menu" style={{ paddingTop: '0.5rem' }}>
                                                <Link to="/candidate/cv" className="dropdown-item">CV của tôi</Link>
                                                <Link to="/candidate/cv/create" className="dropdown-item">Tạo CV mới</Link>
                                                <Link to="/cv-templates" className="dropdown-item">Mẫu CV</Link>
                                            </div>
                                        )}
                                    </div>

                                    {/* Công cụ */}
                                    <div
                                        style={{ position: 'relative' }}
                                        onMouseEnter={handleToolsEnter}
                                        onMouseLeave={handleToolsLeave}
                                    >
                                        <button
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                padding: '0.5rem 0.75rem',
                                                fontWeight: 500,
                                                fontSize: '0.9375rem',
                                                color: 'var(--color-text)',
                                                borderRadius: 'var(--radius-sm)',
                                                transition: 'background var(--transition-fast)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-hover)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            Công cụ
                                            <FiChevronDown size={14} />
                                        </button>

                                        {showToolsMenu && (
                                            <div className="dropdown-menu" style={{ paddingTop: '0.5rem' }}>
                                                <Link to="/tools/salary-calculator" className="dropdown-item">Tính lương NET</Link>
                                                <Link to="/tools/resume-review" className="dropdown-item">Đánh giá CV</Link>
                                                <Link to="/tools/career-test" className="dropdown-item">Trắc nghiệm tính cách</Link>
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        to="/career-guide"
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            fontWeight: 500,
                                            fontSize: '0.9375rem',
                                            color: 'var(--color-text)',
                                            textDecoration: 'none',
                                            borderRadius: 'var(--radius-sm)',
                                            transition: 'background var(--transition-fast)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        Cẩm nang nghề nghiệp
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
                        <button className="navbar-icon-btn">
                            <FiMessageSquare size={20} />
                        </button>

                        {/* User Avatar & Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    border: '2px solid var(--color-border)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    transition: 'all var(--transition-fast)'
                                }}
                            >
                                {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                            </button>

                            {showUserMenu && (
                                <>
                                    <div
                                        onClick={() => setShowUserMenu(false)}
                                        style={{
                                            position: 'fixed',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            zIndex: 999
                                        }}
                                    />

                                    <div className="dropdown-menu" style={{ right: 0, left: 'auto', minWidth: '280px', zIndex: 1000, transformOrigin: 'top right' }}>
                                        <div style={{
                                            padding: 'var(--spacing-lg)',
                                            borderBottom: '1px solid var(--color-divider)',
                                            background: 'var(--color-background)'
                                        }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                                {profile?.full_name || 'Người dùng'}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                                                {user.email}
                                            </div>
                                            <span className="badge badge-primary">
                                                {profile?.role === 'candidate' && 'Ứng viên'}
                                                {profile?.role === 'employer' && 'Nhà tuyển dụng'}
                                                {profile?.role === 'school' && 'Nhà trường'}
                                                {profile?.role === 'admin' && 'Quản trị viên'}
                                            </span>
                                        </div>

                                        <div style={{ padding: 'var(--spacing-sm) 0' }}>
                                            <Link to="/profile" onClick={() => setShowUserMenu(false)} className="dropdown-item">
                                                <FiUser size={18} />
                                                Hồ sơ của tôi
                                            </Link>
                                            <Link to="/settings" onClick={() => setShowUserMenu(false)} className="dropdown-item">
                                                <FiSettings size={18} />
                                                Cài đặt
                                            </Link>
                                        </div>

                                        <div style={{ borderTop: '1px solid var(--color-divider)', padding: 'var(--spacing-sm) 0' }}>
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false);
                                                    handleSignOut();
                                                }}
                                                className="dropdown-item"
                                                style={{ color: 'var(--color-error)' }}
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
                            <Link to="/employer/register" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                                Đăng tuyển ngay →
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Add dropdown styles */}
            <style>{`
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

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          left: 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 16px;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.12), 0 10px 20px -5px rgba(0, 0, 0, 0.06);
          min-width: 240px;
          z-index: 1000;
          overflow: hidden;
          padding: 0.5rem;
          transform-origin: top left;
          animation: dropdown-pop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes dropdown-pop {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

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

        @media (max-width: 1024px) {
          .navbar-container > div:first-child > div:last-child {
            display: none;
          }
        }
      `}</style>
        </>
    );
}
