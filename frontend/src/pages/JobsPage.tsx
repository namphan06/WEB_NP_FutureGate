import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Job } from '../lib/supabase';
import { FiMapPin, FiDollarSign, FiBriefcase, FiClock, FiSearch, FiInfo, FiCheckCircle, FiXCircle, FiFileText } from 'react-icons/fi';
import { formatDistanceToNow, subHours } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';

export default function JobsPage() {
    const { profile } = useAuth();
    const location = useLocation();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegion, setSelectedRegion] = useState<string>('');

    const queryParams = new URLSearchParams(location.search);
    const filterType = queryParams.get('filter');

    useEffect(() => {
        fetchJobs();
    }, [location.search, profile]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('jobs')
                .select('*')
                .eq('is_active', true)
                .eq('status', 'approved')
                .gt('deadline', new Date().toISOString());

            // Handle filters
            if (filterType === 'latest') {
                const twentyFourHoursAgo = subHours(new Date(), 24).toISOString();
                query = query.gt('created_at', twentyFourHoursAgo);
            }

            // Repurpose 'hot' or use 'applied' specifically for Applied Jobs
            if (filterType === 'hot' || filterType === 'applied') {
                if (!profile) return;

                // 1. Get applied activities
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

                // 2. Fetch jobs and their CVs
                const jobIds = appliedAct.map(a => a.job_id);
                const cvIds = appliedAct.map(a => a.cv_id).filter(id => id && id !== '00000000-0000-0000-0000-000000000000');

                const [jobsRes, cvsRes] = await Promise.all([
                    supabase.from('jobs').select('*').in('id', jobIds),
                    cvIds.length > 0 ? supabase.from('cv_templates').select('id, title').in('id', cvIds) : { data: [] }
                ]);

                if (jobsRes.error) throw jobsRes.error;

                // 3. Combine data
                let finalJobs = (jobsRes.data || []).map(job => {
                    const activity = appliedAct.find(a => a.job_id === job.id);
                    const cv = cvsRes.data?.find(c => c.id === activity?.cv_id);

                    // Get application status from job applicants array
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

                // Fetch Employer Profiles
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

            // If filter=latest and we have a candidate profile, apply personalized matching
            if (filterType === 'latest' && profile?.role === 'candidate' && profile.metadata) {
                const { tags, work_types, interested_fields } = profile.metadata;

                finalJobs = finalJobs.filter(job => {
                    const jobMeta = job.metadata;

                    // Match Tags
                    const matchTags = tags?.some((tag: string) =>
                        jobMeta.requirements_tags?.some((jt: string) => jt.toLowerCase().includes(tag.toLowerCase())) ||
                        jobMeta.fields?.some((jf: string) => jf.toLowerCase().includes(tag.toLowerCase()))
                    );

                    // Match Work Types (Employment Types)
                    const matchWorkTypes = work_types?.some((type: string) =>
                        jobMeta.employment_types?.some((et: string) => et.toLowerCase() === type.toLowerCase())
                    );

                    // Match Interested Fields
                    const matchFields = interested_fields?.some((field: string) =>
                        jobMeta.fields?.some((jf: string) => jf.toLowerCase() === field.toLowerCase())
                    );

                    const hasPreferences = (tags?.length > 0) || (work_types?.length > 0) || (interested_fields?.length > 0);
                    if (!hasPreferences) return true;
                    return matchTags || matchWorkTypes || matchFields;
                });
            }

            // Fetch Employer Profiles for these jobs
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
        return matchesSearch && matchesRegion;
    });

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

    if (loading) {
        return (
            <div className="container section">
                <div className="loading text-center">Đang tải công việc...</div>
            </div>
        );
    }

    return (
        <div className="container section">
            <div className="text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
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
                <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>
                    {filterType === 'hot' || filterType === 'applied'
                        ? `Bạn đã ứng tuyển ${jobs.length} công việc`
                        : `${jobs.length} công việc đang chờ đón bạn`}
                </p>
            </div>

            {/* Search & Filter */}
            <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="grid grid-cols-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <div style={{ position: 'relative' }}>
                            <FiSearch
                                size={20}
                                style={{
                                    position: 'absolute',
                                    left: 'var(--spacing-md)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-text-secondary)'
                                }}
                            />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Tìm kiếm công việc..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '3rem' }}
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <select
                            className="form-select"
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                        >
                            <option value="">Tất cả khu vực</option>
                            <option value="Hà Nội">Hà Nội</option>
                            <option value="TP HCM">TP HCM</option>
                            <option value="Đà Nẵng">Đà Nẵng</option>
                            <option value="Remote">Remote</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Jobs Grid */}
            {filteredJobs.length === 0 ? (
                <div className="text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                    <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>
                        Không tìm thấy công việc phù hợp
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)' }}>
                    {filteredJobs.map((job) => (
                        <Link
                            to={`/jobs/${job.id}`}
                            key={job.id}
                            className="card animate-fade-in"
                            style={{ textDecoration: 'none', color: 'inherit' }}
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
                                            <div style={{ width: '100%', height: '100%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                                {(job as any).employer?.company_name?.[0] || job.metadata.title?.[0] || 'J'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 style={{ marginBottom: '0.25rem', color: 'var(--color-primary)' }}>{job.metadata.title}</h4>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                            {(job as any).employer?.company_name || 'Công ty tuyển dụng'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="flex flex-col gap-sm">
                                    <div className="flex items-center gap-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                        <FiMapPin size={16} />
                                        <span>{job.metadata.working_regions.join(', ')}</span>
                                    </div>
                                    <div className="flex items-center gap-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                        <FiDollarSign size={16} />
                                        <span>{formatSalary(job.metadata.salary)}</span>
                                    </div>
                                    <div className="flex items-center gap-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                        <FiBriefcase size={16} />
                                        <span>{job.metadata.experience_required}</span>
                                    </div>
                                </div>

                                <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                                    {job.metadata.requirements_tags.slice(0, 3).map((tag, index) => (
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
            )}
        </div>
    );
}
