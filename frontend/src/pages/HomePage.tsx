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
            <div style={{
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
            <section style={{
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

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
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
                        <div style={{
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
                            <div style={{ position: 'relative', minWidth: '160px' }}>
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
                            <div style={{ position: 'relative' }}>
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
                            <div style={{ position: 'relative', minWidth: '140px' }}>
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
                            <button type="submit" className="btn btn-primary" style={{
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
                    <div style={{
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
            <section style={{ padding: 'var(--spacing-2xl) 0', background: 'var(--color-background)' }}>
                <div className="container">
                    {/* Mobile Sidebar Toggle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="btn btn-secondary"
                        style={{
                            display: 'none',
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

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '350px 1fr',
                        gap: 'var(--spacing-2xl)'
                    }}>
                        {/* Sidebar Categories */}
                        <aside className={sidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'}>
                            <div className="card" style={{ padding: 'var(--spacing-lg)', position: 'sticky', top: '80px' }}>
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
                                        onClick={() => setSidebarOpen(false)}
                                        style={{
                                            display: 'none',
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
                            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Việc làm tốt nhất</h2>

                            {loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                                    <JobCardSkeleton />
                                    <JobCardSkeleton />
                                    <JobCardSkeleton />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                                    {jobs.map((job) => (
                                        <Link
                                            key={job.id}
                                            to={`/jobs/${job.id}`}
                                            className="job-card"
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '100px 1fr auto',
                                                gap: 'var(--spacing-xl)',
                                                alignItems: 'center',
                                                padding: 'var(--spacing-xl)'
                                            }}
                                        >
                                            {/* Company Logo */}
                                            <div style={{
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
                                            <div>
                                                <h4 style={{
                                                    fontSize: '1.125rem',
                                                    marginBottom: '0.5rem',
                                                    color: 'var(--color-text)',
                                                    fontWeight: 600
                                                }}>
                                                    {job.metadata.title}
                                                </h4>
                                                <div style={{
                                                    fontSize: '0.9375rem',
                                                    color: 'var(--color-text-secondary)',
                                                    marginBottom: 'var(--spacing-md)'
                                                }}>
                                                    {(job as any).employer?.company_name || (job as any).employer?.full_name || 'Công ty tuyển dụng'}
                                                </div>

                                                <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
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

            {/* Responsive Styles */}
            <style>{`
                /* Mobile sidebar toggle visibility */
                @media (max-width: 1023px) {
                    .home-page button[style*="display: 'none'"] {
                        display: flex !important;
                    }
                }

                /* Sidebar hidden by default on mobile */
                @media (max-width: 1023px) {
                    .sidebar-hidden {
                        display: none;
                    }
                    .sidebar-visible {
                        display: block;
                    }
                }

                /* Search bar stacks vertically on mobile */
                @media (max-width: 767px) {
                    .home-page form > div {
                        grid-template-columns: 1fr !important;
                        padding: var(--spacing-md) !important;
                    }
                    .home-page form > div > div {
                        min-width: 100% !important;
                        border-right: none !important;
                        border-bottom: 1px solid var(--color-divider);
                    }
                    .home-page form > div > div:last-of-type {
                        border-bottom: none;
                    }
                    .home-page form > div > button {
                        width: 100%;
                        justify-content: center;
                    }
                    .home-page form > div select,
                    .home-page form > div input {
                        border-right: none !important;
                    }
                }

                /* Sidebar + Jobs single column on tablet/mobile */
                @media (max-width: 1023px) {
                    .home-page section > .container > div {
                        grid-template-columns: 1fr !important;
                        gap: var(--spacing-xl) !important;
                    }
                }

                /* Job card responsive adjustments */
                @media (max-width: 767px) {
                    .home-page .job-card {
                        grid-template-columns: 80px 1fr !important;
                        gap: var(--spacing-md) !important;
                        padding: var(--spacing-md) !important;
                    }
                    .home-page .job-card > div:first-child {
                        width: 80px !important;
                        height: 80px !important;
                    }
                    .home-page .job-card > button:last-child {
                        grid-column: 1 / -1;
                        justify-self: end;
                    }
                }

                @media (max-width: 479px) {
                    .home-page .job-card {
                        grid-template-columns: 1fr !important;
                        text-align: center;
                    }
                    .home-page .job-card > div:first-child {
                        width: 60px !important;
                        height: 60px !important;
                        margin: 0 auto;
                    }
                    .home-page .job-card > div:nth-child(2) {
                        order: 2;
                    }
                    .home-page .job-card > button:last-child {
                        position: absolute;
                        top: var(--spacing-md);
                        right: var(--spacing-md);
                    }
                }

                /* Promo banner responsive */
                @media (max-width: 767px) {
                    .home-page > div:first-child {
                        padding: var(--spacing-xs) 0 !important;
                    }
                    .home-page > div:first-child .container {
                        flex-direction: column !important;
                        gap: var(--spacing-xs) !important;
                    }
                }

                /* Hero section responsive */
                @media (max-width: 767px) {
                    .home-page section:first-of-type {
                        padding: var(--spacing-xl) 0 var(--spacing-2xl) !important;
                    }
                }
            `}</style>
        </div >
    );
}
