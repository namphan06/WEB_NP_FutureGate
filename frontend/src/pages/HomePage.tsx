import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiClock, FiDollarSign, FiBookmark, FiChevronRight, FiChevronDown, FiMenu, FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Job } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';

function JobCardSkeleton() {
    return (
        <div className="job-card" style={{ padding: 'var(--spacing-xl)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 'var(--spacing-xl)', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-lg)' }} />
                <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-title" style={{ width: '80%', marginBottom: 'var(--spacing-sm)' }} />
                    <div className="skeleton skeleton-text" style={{ width: '50%', marginBottom: 'var(--spacing-md)' }} />
                    <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
                        <div className="skeleton skeleton-text" style={{ width: '120px', height: '0.875rem' }} />
                        <div className="skeleton skeleton-text" style={{ width: '100px', height: '0.875rem' }} />
                        <div className="skeleton skeleton-text" style={{ width: '90px', height: '0.875rem' }} />
                    </div>
                </div>
                <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)' }} />
            </div>
        </div>
    );
}

export default function HomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const categories = [
        'Kinh doanh/Bán hàng',
        'Marketing/PR/Quảng cáo',
        'Chăm sóc khách hàng',
        'Nhân sự/Hành chính/Pháp chế',
        'Công nghệ Thông tin',
        'Lao động phổ thông'
    ];

    const quickTags = [
        'Tester', 'Fpt it', 'Triển khai phần mềm', 'Thực tập sinh tester',
        'Manual tester', 'Game tester', 'Manual test', 'Flutter'
    ];

    useEffect(() => {
        fetchJobs();
        if (user) fetchSavedJobs();
    }, [user]);

    const fetchSavedJobs = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('user_job_activities')
                .select('job_id')
                .eq('user_id', user.id)
                .eq('activity_type', 'saved');

            if (error) throw error;
            const ids = new Set((data || []).map(a => a.job_id));
            setSavedJobIds(ids);
        } catch (error) {
            console.error('Error fetching saved jobs:', error);
        }
    };

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const { data: jobsData, error: jobsError } = await supabase
                .from('jobs')
                .select('*')
                .eq('is_active', true)
                .eq('status', 'approved')
                .gt('deadline', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(10);

            if (jobsError) throw jobsError;

            if (jobsData && jobsData.length > 0) {
                const employerIds = [...new Set(jobsData.map(job => (job as any).creator_id))];

                const { data: employersData, error: employersError } = await supabase
                    .from('profiles')
                    .select('id, full_name, company_name, avatar_url')
                    .in('id', employerIds);

                if (employersError) {
                    console.warn('Error fetching employers:', employersError);
                }

                const jobsWithEmployers = jobsData.map(job => ({
                    ...job,
                    employer: employersData?.find(emp => emp.id === (job as any).creator_id)
                }));

                setJobs(jobsWithEmployers);
            } else {
                setJobs([]);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (location) params.set('location', location);
        if (category) params.set('category', category);
        window.location.href = `/jobs?${params.toString()}`;
    };

    const handleSave = async (e: React.MouseEvent, jobId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            const isSaved = savedJobIds.has(jobId);
            if (isSaved) {
                const { error } = await supabase
                    .from('user_job_activities')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('job_id', jobId)
                    .eq('activity_type', 'saved');
                if (error) throw error;
                setSavedJobIds(prev => {
                    const next = new Set(prev);
                    next.delete(jobId);
                    return next;
                });
            } else {
                const { error } = await supabase
                    .from('user_job_activities')
                    .insert({
                        user_id: user.id,
                        job_id: jobId,
                        activity_type: 'saved'
                    });
                if (error) throw error;
                setSavedJobIds(prev => new Set(prev).add(jobId));
            }
        } catch (error: any) {
            console.error('Error saving job:', error);
            alert(error.message || 'Có lỗi xảy ra khi lưu công việc');
        }
    };

    const formatSalary = (salary: any) => {
        if (!salary || salary.is_negotiable) return 'Thỏa thuận';

        const formatNumber = (num: number) => {
            if (num >= 100000) return (num / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
            return num.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
        };

        if (salary.min && salary.max) {
            return `${formatNumber(salary.min)} - ${formatNumber(salary.max)} triệu`;
        }
        if (salary.min) return `Từ ${formatNumber(salary.min)} triệu`;
        if (salary.max) return `Đến ${formatNumber(salary.max)} triệu`;
        return 'Thỏa thuận';
    };

    return (
        <div className="home-page">
            {/* Promo Banner */}
            <div className="home-promo-banner" style={{
                background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
                padding: 'var(--spacing-sm) 0',
                textAlign: 'center'
            }}>
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    flexWrap: 'wrap'
                }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.5 }}>
                        Hãy chia sẻ nhu cầu công việc để nhận gợi ý việc làm tốt nhất
                    </span>
                    <Link to="/jobs/suggest" className="btn btn-sm" style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        flexShrink: 0
                    }}>
                        Cập nhật nhu cầu công việc →
                    </Link>
                </div>
            </div>

            {/* Hero Section with Glassmorphism */}
            <section className="home-hero" style={{
                background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
                padding: 'var(--spacing-2xl) 0 var(--spacing-3xl)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative background elements */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-20%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-30%',
                    left: '-10%',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    pointerEvents: 'none'
                }} />

                <div className="container home-hero-content" style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{
                        fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                        fontWeight: 700,
                        color: 'white',
                        textAlign: 'center',
                        marginBottom: 'var(--spacing-sm)',
                        lineHeight: 1.3
                    }}>
                        Tìm việc làm nhanh 24h, việc làm mới nhất trên toàn quốc
                    </h1>
                    <p style={{
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.9)',
                        marginBottom: 'var(--spacing-xl)',
                        fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                    }}>
                        Tiếp cận <strong>60,000+</strong> tin tuyển dụng việc làm mới ngày từ hàng nghìn doanh nghiệp uy tín tại Việt Nam
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch}>
                        <div className="home-search-panel" style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--spacing-md)',
                            boxShadow: 'var(--shadow-xl), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                            maxWidth: '900px',
                            margin: '0 auto',
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr auto auto',
                            gap: 'var(--spacing-sm)',
                            alignItems: 'center'
                        }}>
                            {/* Category Dropdown */}
                            <div className="home-search-field home-search-category" style={{ position: 'relative', minWidth: '160px' }}>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 2.5rem 0.875rem 1rem',
                                        border: 'none',
                                        borderRight: '1px solid var(--color-divider)',
                                        fontSize: '0.9375rem',
                                        color: 'var(--color-text)',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        appearance: 'none'
                                    }}
                                >
                                    <option value="">Danh mục Nghề</option>
                                    {categories.map((cat, i) => (
                                        <option key={i} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <FiChevronDown size={16} style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-text-secondary)',
                                    pointerEvents: 'none'
                                }} />
                            </div>

                            {/* Search Input */}
                            <div className="home-search-field home-search-keyword" style={{ position: 'relative' }}>
                                <FiSearch size={20} style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-text-secondary)'
                                }} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Vị trí tuyển dụng, tên công ty..."
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem 0.875rem 2.75rem',
                                        border: 'none',
                                        borderRight: '1px solid var(--color-divider)',
                                        fontSize: '1rem',
                                        background: 'transparent'
                                    }}
                                />
                            </div>

                            {/* Location */}
                            <div className="home-search-field home-search-location" style={{ position: 'relative', minWidth: '140px' }}>
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 2.5rem 0.875rem 1rem',
                                        border: 'none',
                                        fontSize: '0.9375rem',
                                        color: 'var(--color-text)',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        appearance: 'none'
                                    }}
                                >
                                    <option value="">Địa điểm</option>
                                    <option value="Hà Nội">Hà Nội</option>
                                    <option value="TP HCM">TP HCM</option>
                                    <option value="Đà Nẵng">Đà Nẵng</option>
                                    <option value="Hải Phòng">Hải Phòng</option>
                                    <option value="Remote">Remote</option>
                                </select>
                                <FiChevronDown size={16} style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-text-secondary)',
                                    pointerEvents: 'none'
                                }} />
                            </div>

                            {/* Search Button */}
                            <button type="submit" className="btn btn-primary home-search-submit" style={{
                                padding: '0.875rem 1.5rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap'
                            }}>
                                <FiSearch size={20} />
                                Tìm kiếm
                            </button>
                        </div>
                    </form>

                    {/* Quick Tags */}
                    <div className="home-quick-tags" style={{
                        marginTop: 'var(--spacing-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Gợi ý:</span>
                        {quickTags.map((tag, i) => (
                            <Link
                                key={i}
                                to={`/jobs?search=${encodeURIComponent(tag)}`}
                                style={{
                                    padding: '0.375rem 0.875rem',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: 'var(--radius-full)',
                                    color: 'white',
                                    fontSize: '0.8125rem',
                                    textDecoration: 'none',
                                    transition: 'all var(--transition-fast)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                }}
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content: Sidebar + Jobs */}
            <section className="home-main-section" style={{ padding: 'var(--spacing-2xl) 0', background: 'var(--color-background)' }}>
                <div className="container">
                    {/* Mobile Sidebar Toggle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="btn btn-secondary home-sidebar-toggle"
                        style={{
                            marginBottom: 'var(--spacing-lg)',
                            width: '100%',
                            justifyContent: 'space-between'
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <FiMenu size={18} />
                            Danh mục ngành nghề
                        </span>
                        {sidebarOpen ? <FiX size={18} /> : <FiChevronDown size={18} />}
                    </button>

                    <div className="home-main-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '350px 1fr',
                        gap: 'var(--spacing-2xl)'
                    }}>
                        {/* Sidebar Categories */}
                        <aside className={sidebarOpen ? 'home-sidebar-visible' : 'home-sidebar-hidden'}>
                            <div className="card home-category-card" style={{ padding: 'var(--spacing-lg)', position: 'sticky', top: 'calc(var(--header-height) + 16px)' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 'var(--spacing-lg)'
                                }}>
                                    <h3 style={{ marginBottom: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                                        Danh mục ngành nghề
                                    </h3>
                                    <button
                                        className="home-sidebar-close"
                                        onClick={() => setSidebarOpen(false)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--color-text-secondary)',
                                            padding: 'var(--spacing-xs)'
                                        }}
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>
                                {categories.map((cat, i) => (
                                    <Link
                                        key={i}
                                        to={`/jobs?category=${encodeURIComponent(cat)}`}
                                        onClick={() => setSidebarOpen(false)}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: 'var(--spacing-md)',
                                            textDecoration: 'none',
                                            color: 'var(--color-text)',
                                            borderRadius: 'var(--radius-md)',
                                            transition: 'all var(--transition-fast)',
                                            fontSize: '0.9375rem',
                                            marginBottom: 'var(--spacing-xs)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(30, 136, 229, 0.08)';
                                            e.currentTarget.style.color = 'var(--color-primary)';
                                            e.currentTarget.style.paddingLeft = 'calc(var(--spacing-md) + 0.5rem)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = 'var(--color-text)';
                                            e.currentTarget.style.paddingLeft = 'var(--spacing-md)';
                                        }}
                                    >
                                        <span>{cat}</span>
                                        <FiChevronRight size={16} style={{ color: 'var(--color-text-secondary)' }} />
                                    </Link>
                                ))}
                            </div>
                        </aside>

                        {/* Job Listings */}
                        <div>
                            <div className="home-jobs-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <h2 style={{ marginBottom: 'var(--spacing-xs)' }}>Việc làm tốt nhất</h2>
                                <p style={{ marginBottom: 0, fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                                    {loading ? 'Đang tải dữ liệu việc làm mới...' : `${jobs.length} cơ hội đang phù hợp với bạn`}
                                </p>
                            </div>

                            {loading ? (
                                <div className="home-jobs-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                                    <JobCardSkeleton />
                                    <JobCardSkeleton />
                                    <JobCardSkeleton />
                                </div>
                            ) : (
                                <div className="home-jobs-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                                    {jobs.map((job) => (
                                        <Link
                                            key={job.id}
                                            to={`/jobs/${job.id}`}
                                            className="job-card home-job-card"
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '100px 1fr auto',
                                                gap: 'var(--spacing-xl)',
                                                alignItems: 'center',
                                                padding: 'var(--spacing-xl)'
                                            }}
                                        >
                                            {/* Company Logo */}
                                            <div className="home-job-logo" style={{
                                                width: '100px',
                                                height: '100px',
                                                borderRadius: 'var(--radius-lg)',
                                                overflow: 'hidden',
                                                boxShadow: 'var(--shadow-sm)',
                                                border: '1px solid var(--color-divider)'
                                            }}>
                                                {(job as any).employer?.avatar_url ? (
                                                    <img
                                                        src={(job as any).employer.avatar_url}
                                                        alt={(job as any).employer.company_name || 'Company'}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.parentElement!.innerHTML = `
                                                                <div style="
                                                                    width: 100%;
                                                                    height: 100%;
                                                                    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
                                                                    color: white;
                                                                    display: flex;
                                                                    align-items: center;
                                                                    justify-content: center;
                                                                    font-size: 2rem;
                                                                    font-weight: 700;
                                                                ">${((job as any).employer?.company_name?.[0] || job.metadata.title?.[0] || 'C').toUpperCase()}</div>
                                                            `;
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '2rem',
                                                        fontWeight: 700
                                                    }}>
                                                        {((job as any).employer?.company_name?.[0] || job.metadata.title?.[0] || 'C').toUpperCase()}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Job Info */}
                                            <div className="home-job-content">
                                                <h4 className="home-job-title" style={{
                                                    fontSize: '1.125rem',
                                                    marginBottom: '0.5rem',
                                                    color: 'var(--color-text)',
                                                    fontWeight: 600
                                                }}>
                                                    {job.metadata.title}
                                                </h4>
                                                <div className="home-job-company" style={{
                                                    fontSize: '0.9375rem',
                                                    color: 'var(--color-text-secondary)',
                                                    marginBottom: 'var(--spacing-md)'
                                                }}>
                                                    {(job as any).employer?.company_name || (job as any).employer?.full_name || 'Công ty tuyển dụng'}
                                                </div>

                                                <div className="home-job-meta" style={{ display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                                        <FiDollarSign size={16} />
                                                        <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
                                                            {formatSalary(job.metadata.salary)}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                                        <FiMapPin size={16} />
                                                        <span>{job.metadata.working_regions?.slice(0, 2).join(', ') || 'Hà Nội'}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                                        <FiClock size={16} />
                                                        <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: vi })}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Save Button */}
                                            <button
                                                onClick={(e) => handleSave(e, job.id)}
                                                className="home-job-save"
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: '1px solid var(--color-border)',
                                                    background: savedJobIds.has(job.id) ? 'rgba(30, 136, 229, 0.1)' : 'transparent',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all var(--transition-fast)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'var(--color-primary)';
                                                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                                                    e.currentTarget.style.color = 'white';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = savedJobIds.has(job.id) ? 'rgba(30, 136, 229, 0.1)' : 'transparent';
                                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                                    e.currentTarget.style.color = 'inherit';
                                                }}
                                            >
                                                <FiBookmark size={18} fill={savedJobIds.has(job.id) ? 'var(--color-primary)' : 'none'} />
                                            </button>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
                                <Link to="/jobs" className="btn btn-outline-primary btn-lg">
                                    Xem tất cả việc làm →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* Homepage Styles */}
            <style>{`
                .home-hero-content {
                    max-width: 1080px;
                }

                .home-search-panel {
                    border-radius: var(--radius-xl) !important;
                }

                .home-search-field {
                    min-height: 52px;
                }

                .home-search-submit {
                    min-height: 52px;
                    border-radius: var(--radius-md);
                }

                .home-quick-tags a {
                    line-height: 1.2;
                }

                .home-main-section {
                    padding-top: var(--spacing-2xl) !important;
                }

                .home-main-grid {
                    align-items: start;
                }

                .home-sidebar-toggle {
                    display: none;
                }

                .home-sidebar-close {
                    display: none;
                }

                .home-sidebar-hidden,
                .home-sidebar-visible {
                    display: block;
                }

                .home-category-card {
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-md);
                }

                .home-jobs-header h2 {
                    letter-spacing: -0.01em;
                }

                .home-job-card {
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--color-border-light);
                    transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
                }

                .home-job-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg);
                    border-color: var(--color-primary-100);
                }

                .home-job-title {
                    line-height: 1.35;
                }

                .home-job-company {
                    font-weight: 500;
                }

                .home-job-meta {
                    row-gap: var(--spacing-sm);
                }

                .home-job-save {
                    align-self: start;
                }

                /* Tablet layout */
                @media (max-width: 1199px) {
                    .home-main-grid {
                        grid-template-columns: 300px 1fr !important;
                        gap: var(--spacing-xl) !important;
                    }

                    .home-job-card {
                        grid-template-columns: 88px 1fr auto !important;
                        padding: var(--spacing-lg) !important;
                        gap: var(--spacing-lg) !important;
                    }

                    .home-job-logo {
                        width: 88px !important;
                        height: 88px !important;
                    }
                }

                /* Sidebar + Jobs single column on mobile/tablet */
                @media (max-width: 1023px) {
                    .home-main-grid {
                        grid-template-columns: 1fr !important;
                        gap: var(--spacing-lg) !important;
                    }

                    .home-sidebar-toggle {
                        display: flex;
                        align-items: center;
                    }

                    .home-sidebar-close {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .home-sidebar-hidden {
                        display: none;
                    }

                    .home-sidebar-visible {
                        display: block;
                    }

                    .home-category-card {
                        position: static !important;
                    }
                }

                /* Search + cards on phone */
                @media (max-width: 767px) {
                    .home-promo-banner {
                        padding: var(--spacing-xs) 0 !important;
                    }

                    .home-promo-banner .container {
                        flex-direction: column !important;
                        gap: var(--spacing-xs) !important;
                    }

                    .home-hero {
                        padding: var(--spacing-xl) 0 var(--spacing-2xl) !important;
                    }

                    .home-search-panel {
                        grid-template-columns: 1fr !important;
                        padding: var(--spacing-md) !important;
                        gap: 0 !important;
                    }

                    .home-search-field {
                        min-width: 100% !important;
                        border-bottom: 1px solid var(--color-divider);
                        padding: var(--spacing-xs) 0;
                    }

                    .home-search-field:last-of-type {
                        border-bottom: none;
                    }

                    .home-search-submit {
                        width: 100%;
                        justify-content: center;
                        margin-top: var(--spacing-sm);
                    }

                    .home-search-field select,
                    .home-search-field input {
                        border-right: none !important;
                    }

                    .home-job-card {
                        grid-template-columns: 80px 1fr !important;
                        gap: var(--spacing-md) !important;
                        padding: var(--spacing-md) !important;
                    }

                    .home-job-logo {
                        width: 80px !important;
                        height: 80px !important;
                    }

                    .home-job-save {
                        grid-column: 1 / -1;
                        justify-self: end;
                    }
                }

                @media (max-width: 479px) {
                    .home-job-card {
                        grid-template-columns: 1fr !important;
                        padding: var(--spacing-md) !important;
                    }

                    .home-job-logo {
                        width: 60px !important;
                        height: 60px !important;
                    }

                    .home-job-content {
                        text-align: left;
                    }

                    .home-job-meta {
                        flex-direction: column;
                        gap: var(--spacing-xs) !important;
                        align-items: flex-start;
                    }

                    .home-job-save {
                        grid-column: auto;
                        justify-self: start;
                    }
                }
            `}</style>
        </div >
    );
}
