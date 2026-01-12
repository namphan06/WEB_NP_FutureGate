import { Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiClock, FiDollarSign, FiBookmark, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Job } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function HomePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

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
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            // Fetch jobs without join first
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
                // Get unique employer IDs
                const employerIds = [...new Set(jobsData.map(job => job.employer_id))];

                // Fetch employer profiles
                const { data: employersData, error: employersError } = await supabase
                    .from('profiles')
                    .select('id, full_name, company_name, avatar_url')
                    .in('id', employerIds);

                if (employersError) {
                    console.warn('Error fetching employers:', employersError);
                }

                // Merge employer data with jobs
                const jobsWithEmployers = jobsData.map(job => ({
                    ...job,
                    employer: employersData?.find(emp => emp.id === job.employer_id)
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

    const formatSalary = (salary: any) => {
        if (!salary) return 'Thỏa thuận';
        if (salary.is_negotiable) return 'Thỏa thuận';
        if (salary.min && salary.max) {
            return `${(salary.min / 1000000).toFixed(0)}-${(salary.max / 1000000).toFixed(0)} Triệu`;
        }
        return 'Thỏa thuận';
    };

    return (
        <div className="home-page">
            {/* Promo Banner */}
            <div style={{
                background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
                padding: 'var(--spacing-md) 0',
                textAlign: 'center'
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                        Hãy chia sẻ nhu cầu công việc để nhận gợi ý việc làm tốt nhất
                    </span>
                    <Link to="/jobs/suggest" className="btn btn-sm" style={{ background: 'var(--color-primary)', color: 'white' }}>
                        Cập nhật nhu cầu công việc →
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
                padding: 'var(--spacing-2xl) 0 var(--spacing-3xl)',
                color: 'white'
            }}>
                <div className="container">
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: 'white',
                        textAlign: 'center',
                        marginBottom: 'var(--spacing-sm)'
                    }}>
                        Tìm việc làm nhanh 24h, việc làm mới nhất trên toàn quốc
                    </h1>
                    <p style={{
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.9)',
                        marginBottom: 'var(--spacing-xl)',
                        fontSize: '1rem'
                    }}>
                        Tiếp cận <strong>60,000+</strong> tin tuyển dụng việc làm mới ngày từ hàng nghìn doanh nghiệp uy tín tại Việt Nam
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch}>
                        <div style={{
                            background: 'white',
                            borderRadius: 'var(--radius-lg)',
                            padding: '0.75rem',
                            boxShadow: 'var(--shadow-xl)',
                            maxWidth: '900px',
                            margin: '0 auto',
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr auto 200px',
                            gap: '0.75rem',
                            alignItems: 'center'
                        }}>
                            {/* Category Dropdown */}
                            <div style={{ position: 'relative', minWidth: '180px' }}>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem',
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
                                    right: '1rem',
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
                                    left: '1rem',
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
                                        padding: '0.875rem 1rem 0.875rem 3rem',
                                        border: 'none',
                                        fontSize: '1rem',
                                        borderRight: '1px solid var(--color-divider)'
                                    }}
                                />
                            </div>

                            {/* Location */}
                            <div style={{ position: 'relative', minWidth: '160px' }}>
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem',
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
                                    right: '1rem',
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
                    <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 'var(--spacing-2xl)' }}>
                        {/* Sidebar Categories */}
                        <aside>
                            <div className="card" style={{ padding: 'var(--spacing-lg)', position: 'sticky', top: '80px' }}>
                                <h3 style={{ marginBottom: 'var(--spacing-lg)', fontSize: '1.125rem', fontWeight: 700 }}>
                                    Danh mục ngành nghề
                                </h3>
                                {categories.map((cat, i) => (
                                    <Link
                                        key={i}
                                        to={`/jobs?category=${encodeURIComponent(cat)}`}
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
                                <div className="loading">Đang tải...</div>
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
                                                            // Fallback to gradient with company initial
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
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    // Handle save
                                                }}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: '1px solid var(--color-border)',
                                                    background: 'transparent',
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
                                                    e.currentTarget.style.background = 'transparent';
                                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                                    e.currentTarget.style.color = 'inherit';
                                                }}
                                            >
                                                <FiBookmark size={18} />
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
                </div >
            </section >
        </div >
    );
}
