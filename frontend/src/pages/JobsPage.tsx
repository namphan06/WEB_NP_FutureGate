import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Job } from '../lib/supabase';
import { FiMapPin, FiDollarSign, FiBriefcase, FiClock, FiSearch, FiInfo, FiCheckCircle, FiXCircle, FiFileText, FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { formatDistanceToNow, subHours } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';

const REGIONS = ['Hà Nội', 'TP HCM', 'Đà Nẵng', 'Remote', 'Hải Phòng', 'Cần Thơ'];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const EXPERIENCE_LEVELS = ['Entry', 'Mid', 'Senior', 'Lead', 'Manager'];
const JOBS_PER_PAGE = 10;

function JobCardSkeleton() {
    return (
        <div className="card" style={{ padding: 'var(--spacing-lg)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: '1.25rem', width: '70%', marginBottom: 'var(--spacing-sm)' }} />
                    <div className="skeleton" style={{ height: '0.875rem', width: '50%' }} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                <div className="skeleton" style={{ height: '1rem', width: '60%' }} />
                <div className="skeleton" style={{ height: '1rem', width: '45%' }} />
                <div className="skeleton" style={{ height: '1rem', width: '55%' }} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                <div className="skeleton" style={{ height: '1.5rem', width: '4rem', borderRadius: 'var(--radius-full)' }} />
                <div className="skeleton" style={{ height: '1.5rem', width: '5rem', borderRadius: 'var(--radius-full)' }} />
                <div className="skeleton" style={{ height: '1.5rem', width: '3.5rem', borderRadius: 'var(--radius-full)' }} />
            </div>
            <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--color-divider)', display: 'flex', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ height: '0.875rem', width: '6rem' }} />
                <div className="skeleton" style={{ height: '1.5rem', width: '5rem', borderRadius: 'var(--radius-full)' }} />
            </div>
        </div>
    );
}

function FilterChip({ label, active, onClick, style }: { label: string; active: boolean; onClick: () => void; style?: React.CSSProperties }) {
    return (
        <button
            onClick={onClick}
            className="badge"
            style={{
                padding: '0.625rem 1rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minHeight: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-base)',
                background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                color: active ? 'white' : 'var(--color-text-secondary)',
                boxShadow: active ? '0 2px 8px rgba(30, 136, 229, 0.3)' : 'var(--shadow-xs)',
                border: active ? 'none' : '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                fontWeight: active ? 600 : 500,
                ...style
            }}
            onTouchStart={(e) => e.stopPropagation()}
        >
            {label}
        </button>
    );
}

export default function JobsPage() {
    const { profile } = useAuth();
    const location = useLocation();
    const filterSidebarRef = useRef<HTMLDivElement>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegion, setSelectedRegion] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedExperience, setSelectedExperience] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const queryParams = new URLSearchParams(location.search);
    const filterType = queryParams.get('filter');

    useEffect(() => {
        fetchJobs();
    }, [location.search, profile]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedRegion, selectedType, selectedExperience]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showFilters && filterSidebarRef.current && !filterSidebarRef.current.contains(event.target as Node)) {
                setShowFilters(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showFilters]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showFilters) setShowFilters(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [showFilters]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('jobs')
                .select('*')
                .eq('is_active', true)
                .eq('status', 'approved')
                .gt('deadline', new Date().toISOString());

            if (filterType === 'latest') {
                const twentyFourHoursAgo = subHours(new Date(), 24).toISOString();
                query = query.gt('created_at', twentyFourHoursAgo);
            }

            if (filterType === 'hot' || filterType === 'applied') {
                if (!profile) return;

                const { data: activities, error: actError } = await supabase
                    .from('user_job_activities')
                    .select('*')
                    .eq('user_id', profile.id)
                    .order('created_at', { ascending: false });

                if (actError) throw actError;

                const appliedAct = (activities || []).filter(a =>
                    a.activity_type === 'applied' || a.activity === 'applied' || a.is_applied === true
                );

                if (appliedAct.length === 0) {
                    setJobs([]);
                    setLoading(false);
                    return;
                }

                const jobIds = appliedAct.map(a => a.job_id);
                const cvIds = appliedAct.map(a => a.cv_id).filter(id => id && id !== '00000000-0000-0000-0000-000000000000');

                const [jobsRes, cvsRes] = await Promise.all([
                    supabase.from('jobs').select('*').in('id', jobIds),
                    cvIds.length > 0 ? supabase.from('cv_templates').select('id, title').in('id', cvIds) : { data: [] }
                ]);

                if (jobsRes.error) throw jobsRes.error;

                let finalJobs = (jobsRes.data || []).map(job => {
                    const activity = appliedAct.find(a => a.job_id === job.id);
                    const cv = cvsRes.data?.find(c => c.id === activity?.cv_id);
                    const myApp = job.applicants?.find((app: any) => app.user_id === profile.id);

                    return {
                        ...job,
                        applicationInfo: {
                            ...activity,
                            cv_title: cv?.title || 'CV Mặc định',
                            status: myApp?.status || 'pending'
                        }
                    };
                });

                const employerIds = [...new Set(finalJobs.map(job => (job as any).creator_id))];
                const { data: employersData } = await supabase
                    .from('profiles')
                    .select('id, full_name, company_name, avatar_url')
                    .in('id', employerIds);

                finalJobs = finalJobs.map(job => ({
                    ...job,
                    employer: employersData?.find(emp => emp.id === (job as any).creator_id)
                }));

                setJobs(finalJobs);
                setLoading(false);
                return;
            }

            const { data: jobsData, error: jobsError } = await query
                .order('created_at', { ascending: false });

            if (jobsError) throw jobsError;

            let finalJobs = jobsData || [];

            if (filterType === 'latest' && profile?.role === 'candidate' && profile.metadata) {
                const { tags, work_types, interested_fields } = profile.metadata;

                finalJobs = finalJobs.filter(job => {
                    const jobMeta = job.metadata;

                    const matchTags = tags?.some((tag: string) =>
                        jobMeta.requirements_tags?.some((jt: string) => jt.toLowerCase().includes(tag.toLowerCase())) ||
                        jobMeta.fields?.some((jf: string) => jf.toLowerCase().includes(tag.toLowerCase()))
                    );

                    const matchWorkTypes = work_types?.some((type: string) =>
                        jobMeta.employment_types?.some((et: string) => et.toLowerCase() === type.toLowerCase())
                    );

                    const matchFields = interested_fields?.some((field: string) =>
                        jobMeta.fields?.some((jf: string) => jf.toLowerCase() === field.toLowerCase())
                    );

                    const hasPreferences = (tags?.length > 0) || (work_types?.length > 0) || (interested_fields?.length > 0);
                    if (!hasPreferences) return true;
                    return matchTags || matchWorkTypes || matchFields;
                });
            }

            if (finalJobs.length > 0) {
                const employerIds = [...new Set(finalJobs.map(job => (job as any).creator_id))];
                const { data: employersData } = await supabase
                    .from('profiles')
                    .select('id, full_name, company_name, avatar_url')
                    .in('id', employerIds);

                finalJobs = finalJobs.map(job => ({
                    ...job,
                    employer: employersData?.find(emp => emp.id === (job as any).creator_id)
                }));
            }

            setJobs(finalJobs);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const title = job.metadata.title || '';
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegion = !selectedRegion || job.metadata.working_regions?.includes(selectedRegion);
        const matchesType = !selectedType || job.metadata.employment_types?.includes(selectedType);
        const matchesExperience = !selectedExperience || job.metadata.experience_required?.includes(selectedExperience);
        return matchesSearch && matchesRegion && matchesType && matchesExperience;
    });

    const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
    const paginatedJobs = filteredJobs.slice(
        (currentPage - 1) * JOBS_PER_PAGE,
        currentPage * JOBS_PER_PAGE
    );

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

    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedRegion('');
        setSelectedType('');
        setSelectedExperience('');
    };

    const hasActiveFilters = searchTerm || selectedRegion || selectedType || selectedExperience;

    const PaginationControls = () => {
        if (totalPages <= 1) return null;

        const getPageNumbers = () => {
            const pages: (number | string)[] = [];
            const maxVisible = 5;

            if (totalPages <= maxVisible + 2) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                if (currentPage > 3) pages.push('...');

                const start = Math.max(2, currentPage - 1);
                const end = Math.min(totalPages - 1, currentPage + 1);

                for (let i = start; i <= end; i++) pages.push(i);

                if (currentPage < totalPages - 2) pages.push('...');
                pages.push(totalPages);
            }
            return pages;
        };

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                marginTop: 'var(--spacing-2xl)',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--color-border)',
                        background: 'var(--color-surface)',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === 1 ? 0.5 : 1,
                        transition: 'all var(--transition-base)',
                        color: 'var(--color-text)'
                    }}
                    aria-label="Trang trước"
                >
                    <FiChevronLeft size={18} />
                </button>

                {getPageNumbers().map((page, idx) => (
                    typeof page === 'string' ? (
                        <span key={`ellipsis-${idx}`} style={{ padding: '0 var(--spacing-xs)', color: 'var(--color-text-secondary)' }}>...</span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            style={{
                                width: '44px',
                                height: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 'var(--radius-md)',
                                border: currentPage === page ? 'none' : '1.5px solid var(--color-border)',
                                background: currentPage === page ? 'var(--color-primary)' : 'var(--color-surface)',
                                color: currentPage === page ? 'white' : 'var(--color-text)',
                                fontWeight: currentPage === page ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'all var(--transition-base)',
                                boxShadow: currentPage === page ? '0 2px 8px rgba(30, 136, 229, 0.3)' : 'none'
                            }}
                            aria-label={`Trang ${page}`}
                            aria-current={currentPage === page ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    )
                ))}

                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--color-border)',
                        background: 'var(--color-surface)',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        opacity: currentPage === totalPages ? 0.5 : 1,
                        transition: 'all var(--transition-base)',
                        color: 'var(--color-text)'
                    }}
                    aria-label="Trang sau"
                >
                    <FiChevronRight size={18} />
                </button>
            </div>
        );
    };

    const FilterPanelContent = () => (
        <>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
                        Tìm kiếm
                    </label>
                    <div style={{ position: 'relative' }}>
                        <FiSearch
                            size={18}
                            style={{
                                position: 'absolute',
                                left: 'var(--spacing-md)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-secondary)',
                                pointerEvents: 'none'
                            }}
                        />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Tìm kiếm công việc..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                paddingLeft: '2.75rem',
                                minHeight: '48px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label className="form-label" style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
                    Khu vực
                </label>
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-sm)',
                    overflowX: 'auto',
                    paddingBottom: 'var(--spacing-sm)',
                    scrollbarWidth: 'thin',
                    WebkitOverflowScrolling: 'touch'
                }}>
                    <FilterChip
                        label="Tất cả"
                        active={!selectedRegion}
                        onClick={() => setSelectedRegion('')}
                    />
                    {REGIONS.map(region => (
                        <FilterChip
                            key={region}
                            label={region}
                            active={selectedRegion === region}
                            onClick={() => setSelectedRegion(selectedRegion === region ? '' : region)}
                        />
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label className="form-label" style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
                    Loại công việc
                </label>
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-sm)',
                    overflowX: 'auto',
                    paddingBottom: 'var(--spacing-sm)',
                    scrollbarWidth: 'thin',
                    WebkitOverflowScrolling: 'touch'
                }}>
                    <FilterChip
                        label="Tất cả"
                        active={!selectedType}
                        onClick={() => setSelectedType('')}
                    />
                    {EMPLOYMENT_TYPES.map(type => (
                        <FilterChip
                            key={type}
                            label={type}
                            active={selectedType === type}
                            onClick={() => setSelectedType(selectedType === type ? '' : type)}
                        />
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: hasActiveFilters ? 'var(--spacing-lg)' : 0 }}>
                <label className="form-label" style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
                    Kinh nghiệm
                </label>
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-sm)',
                    overflowX: 'auto',
                    paddingBottom: 'var(--spacing-sm)',
                    scrollbarWidth: 'thin',
                    WebkitOverflowScrolling: 'touch'
                }}>
                    <FilterChip
                        label="Tất cả"
                        active={!selectedExperience}
                        onClick={() => setSelectedExperience('')}
                    />
                    {EXPERIENCE_LEVELS.map(level => (
                        <FilterChip
                            key={level}
                            label={level}
                            active={selectedExperience === level}
                            onClick={() => setSelectedExperience(selectedExperience === level ? '' : level)}
                        />
                    ))}
                </div>
            </div>

            {hasActiveFilters && (
                <button
                    onClick={clearAllFilters}
                    style={{
                        width: '100%',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--spacing-sm)',
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--color-error)',
                        background: 'transparent',
                        color: 'var(--color-error)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all var(--transition-base)',
                        marginTop: 'var(--spacing-md)'
                    }}
                >
                    <FiX size={16} />
                    Xóa bộ lọc
                </button>
            )}
        </>
    );

    if (loading) {
        return (
            <div className="container section">
                <div className="text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
                        Khám phá cơ hội việc làm
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>
                        Đang tải công việc...
                    </p>
                </div>

                <div className="card" style={{ marginBottom: 'var(--spacing-xl)', padding: 'var(--spacing-lg)' }}>
                    <div className="skeleton" style={{ height: '3rem', width: '100%', marginBottom: 'var(--spacing-md)' }} />
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <div className="skeleton" style={{ height: '2.5rem', width: '5rem', borderRadius: 'var(--radius-full)' }} />
                        <div className="skeleton" style={{ height: '2.5rem', width: '6rem', borderRadius: 'var(--radius-full)' }} />
                        <div className="skeleton" style={{ height: '2.5rem', width: '4rem', borderRadius: 'var(--radius-full)' }} />
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
                    gap: 'var(--spacing-lg)'
                }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <JobCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @media (max-width: 1023px) {
                    .jobs-grid-responsive {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                @media (max-width: 767px) {
                    .jobs-grid-responsive {
                        grid-template-columns: 1fr !important;
                    }
                    .filter-chips-scroll::-webkit-scrollbar {
                        height: 4px;
                    }
                    .filter-chips-scroll::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .filter-chips-scroll::-webkit-scrollbar-thumb {
                        background: var(--color-text-muted);
                        border-radius: var(--radius-full);
                    }
                }
                @media (min-width: 768px) {
                    .jobs-grid-responsive {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                .mobile-filter-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    z-index: var(--z-modal-backdrop);
                    animation: fade-in 0.2s ease-out;
                }
                .mobile-filter-sidebar {
                    animation: slide-in-left 0.3s ease-out;
                }
            `}</style>

            <div className="container section">
                <div className="text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                        {filterType === 'hot' || filterType === 'applied' ? 'Việc làm đã ứng tuyển' : 'Khám phá cơ hội việc làm'}
                        {filterType === 'latest' && profile?.role === 'candidate' && (
                            <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <FiInfo size={14} /> Gợi ý cho bạn
                            </span>
                        )}
                        {(filterType === 'hot' || filterType === 'applied') && (
                            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <FiCheckCircle size={14} /> Lịch sử của bạn
                            </span>
                        )}
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                        {filterType === 'hot' || filterType === 'applied'
                            ? `Bạn đã ứng tuyển ${jobs.length} công việc`
                            : `${jobs.length} công việc đang chờ đón bạn`}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-xl)', position: 'relative' }}>
                    {/* Desktop Sidebar Filters */}
                    <aside style={{
                        width: '300px',
                        flexShrink: 0,
                        display: 'none'
                    }}
                        className="desktop-filters"
                    >
                        <div
                            className="card-glass"
                            style={{
                                position: 'sticky',
                                top: 'calc(var(--header-height) + var(--spacing-lg))',
                                padding: 'var(--spacing-lg)',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--glass-bg)',
                                backdropFilter: 'var(--glass-blur)',
                                WebkitBackdropFilter: 'var(--glass-blur)',
                                border: '1px solid var(--glass-border)',
                                boxShadow: 'var(--glass-shadow)'
                            }}
                        >
                            <h3 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <FiFilter size={18} />
                                Bộ lọc
                            </h3>
                            <FilterPanelContent />
                        </div>
                    </aside>

                    {/* Mobile Filter Toggle Button */}
                    <button
                        onClick={() => setShowFilters(true)}
                        className="mobile-filter-btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            minHeight: '44px',
                            borderRadius: 'var(--radius-md)',
                            border: '1.5px solid var(--color-primary)',
                            background: 'transparent',
                            color: 'var(--color-primary)',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all var(--transition-base)',
                            marginBottom: 'var(--spacing-lg)',
                            position: 'relative'
                        }}
                    >
                        <FiFilter size={16} />
                        Bộ lọc
                        {hasActiveFilters && (
                            <span style={{
                                position: 'absolute',
                                top: '-6px',
                                right: '-6px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: 'var(--color-primary)',
                                color: 'white',
                                fontSize: '0.625rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {[selectedRegion, selectedType, selectedExperience, searchTerm].filter(Boolean).length}
                            </span>
                        )}
                    </button>

                    {/* Mobile Filter Overlay & Sidebar */}
                    {showFilters && (
                        <div className="mobile-filter-overlay" onClick={() => setShowFilters(false)}>
                            <div
                                ref={filterSidebarRef}
                                className="mobile-filter-sidebar"
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    width: 'min(320px, 85vw)',
                                    background: 'var(--glass-bg-dark)',
                                    backdropFilter: 'var(--glass-blur)',
                                    WebkitBackdropFilter: 'var(--glass-blur)',
                                    borderRight: '1px solid var(--glass-border)',
                                    boxShadow: 'var(--shadow-2xl)',
                                    overflowY: 'auto',
                                    padding: 'var(--spacing-xl)',
                                    zIndex: 'var(--z-modal)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                                    <h3 style={{ fontSize: '1.125rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                        <FiFilter size={20} />
                                        Bộ lọc
                                    </h3>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        style={{
                                            width: '44px',
                                            height: '44px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 'var(--radius-md)',
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            color: 'var(--color-text-secondary)',
                                            transition: 'all var(--transition-base)'
                                        }}
                                        aria-label="Đóng bộ lọc"
                                    >
                                        <FiX size={24} />
                                    </button>
                                </div>
                                <FilterPanelContent />
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Active Filters Summary */}
                        {hasActiveFilters && (
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 'var(--spacing-sm)',
                                marginBottom: 'var(--spacing-lg)',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Đang lọc:</span>
                                {searchTerm && (
                                    <span className="badge badge-primary" style={{ cursor: 'default' }}>
                                        "{searchTerm}"
                                        <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 'var(--spacing-xs)', padding: '0 2px' }}>
                                            <FiX size={12} />
                                        </button>
                                    </span>
                                )}
                                {selectedRegion && (
                                    <span className="badge badge-primary" style={{ cursor: 'default' }}>
                                        {selectedRegion}
                                        <button onClick={() => setSelectedRegion('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 'var(--spacing-xs)', padding: '0 2px' }}>
                                            <FiX size={12} />
                                        </button>
                                    </span>
                                )}
                                {selectedType && (
                                    <span className="badge badge-primary" style={{ cursor: 'default' }}>
                                        {selectedType}
                                        <button onClick={() => setSelectedType('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 'var(--spacing-xs)', padding: '0 2px' }}>
                                            <FiX size={12} />
                                        </button>
                                    </span>
                                )}
                                {selectedExperience && (
                                    <span className="badge badge-primary" style={{ cursor: 'default' }}>
                                        {selectedExperience}
                                        <button onClick={() => setSelectedExperience('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 'var(--spacing-xs)', padding: '0 2px' }}>
                                            <FiX size={12} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Results Count */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'var(--spacing-lg)',
                            flexWrap: 'wrap',
                            gap: 'var(--spacing-sm)'
                        }}>
                            <span style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)' }}>
                                Hiển thị {paginatedJobs.length} / {filteredJobs.length} công việc
                            </span>
                        </div>

                        {/* Jobs Grid */}
                        {filteredJobs.length === 0 ? (
                            <div className="card text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                    <FiSearch size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto' }} />
                                </div>
                                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Không tìm thấy công việc phù hợp</h3>
                                <p style={{ marginBottom: 'var(--spacing-lg)' }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="btn btn-primary"
                                        style={{ minHeight: '44px' }}
                                    >
                                        Xóa bộ lọc
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="jobs-grid-responsive" style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
                                    gap: 'var(--spacing-lg)'
                                }}>
                                    {paginatedJobs.map((job, index) => (
                                        <Link
                                            to={`/jobs/${job.id}`}
                                            key={job.id}
                                            className="card animate-fade-in"
                                            style={{
                                                textDecoration: 'none',
                                                color: 'inherit',
                                                animationDelay: `${index * 50}ms`,
                                                animationFillMode: 'both',
                                                minHeight: '44px'
                                            }}
                                        >
                                            <div className="card-header">
                                                <div className="flex items-center gap-md">
                                                    <div
                                                        style={{
                                                            width: '56px',
                                                            height: '56px',
                                                            borderRadius: 'var(--radius-md)',
                                                            background: 'var(--color-surface)',
                                                            border: '1px solid var(--color-divider)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            overflow: 'hidden',
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        {(job as any).employer?.avatar_url ? (
                                                            <img
                                                                src={(job as any).employer?.avatar_url}
                                                                alt=""
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                    e.currentTarget.parentElement!.innerHTML = `<div style="width:100%;height:100%;background:var(--color-primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:700">${(job as any).employer?.company_name?.[0] || job.metadata.title?.[0] || 'J'}</div>`;
                                                                }}
                                                            />
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>
                                                                {(job as any).employer?.company_name?.[0] || job.metadata.title?.[0] || 'J'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <h4 style={{ marginBottom: '0.25rem', color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.metadata.title}</h4>
                                                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {(job as any).employer?.company_name || 'Công ty tuyển dụng'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                <div className="flex flex-col gap-sm">
                                                    <div className="flex items-center gap-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                                        <FiMapPin size={16} style={{ flexShrink: 0 }} />
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.metadata.working_regions?.join(', ') || 'Không xác định'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                                        <FiDollarSign size={16} style={{ flexShrink: 0 }} />
                                                        <span>{formatSalary(job.metadata.salary)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                                        <FiBriefcase size={16} style={{ flexShrink: 0 }} />
                                                        <span>{job.metadata.experience_required || 'Không yêu cầu'}</span>
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                                                    {job.metadata.requirements_tags?.slice(0, 3).map((tag, index) => (
                                                        <span key={index} className="badge badge-primary">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="card-footer" style={{ borderTop: '1px solid var(--color-divider)', padding: 'var(--spacing-md)', background: 'rgba(0,0,0,0.02)' }}>
                                                <div className="flex justify-between items-center w-full">
                                                    <div className="flex items-center gap-sm" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                                                        <FiClock size={14} />
                                                        <span>
                                                            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: vi })}
                                                        </span>
                                                    </div>

                                                    {(filterType === 'hot' || filterType === 'applied') && (job as any).applicationInfo ? (
                                                        <div className="flex items-center gap-sm">
                                                            {(() => {
                                                                const status = (job as any).applicationInfo.status;
                                                                switch (status) {
                                                                    case 'accepted':
                                                                        return <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiCheckCircle size={12} /> Đã duyệt</span>;
                                                                    case 'rejected':
                                                                        return <span className="badge badge-error" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiXCircle size={12} /> Từ chối</span>;
                                                                    default:
                                                                        return <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiClock size={12} /> Chờ duyệt</span>;
                                                                }
                                                            })()}
                                                        </div>
                                                    ) : (
                                                        <span className="badge badge-success">{job.view_count} lượt xem</span>
                                                    )}
                                                </div>

                                                {(filterType === 'hot' || filterType === 'applied') && (job as any).applicationInfo && (
                                                    <div style={{
                                                        marginTop: 'var(--spacing-sm)',
                                                        paddingTop: 'var(--spacing-sm)',
                                                        borderTop: '1px dashed var(--color-divider)',
                                                        fontSize: '0.8125rem',
                                                        color: 'var(--color-text-secondary)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 'var(--spacing-xs)'
                                                    }}>
                                                        <FiFileText size={14} />
                                                        <span>CV: <strong>{(job as any).applicationInfo.cv_title}</strong></span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                <PaginationControls />
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop visibility styles */}
            <style>{`
                @media (min-width: 1024px) {
                    .desktop-filters {
                        display: block !important;
                    }
                    .mobile-filter-btn {
                        display: none !important;
                    }
                }
                @media (max-width: 1023px) {
                    .desktop-filters {
                        display: none !important;
                    }
                    .mobile-filter-btn {
                        display: flex !important;
                    }
                }
            `}</style>
        </>
    );
}
