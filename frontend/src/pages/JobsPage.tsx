import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Job } from '../lib/supabase';
import { FiMapPin, FiDollarSign, FiBriefcase, FiClock, FiSearch } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegion, setSelectedRegion] = useState<string>('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('is_active', true)
                .eq('status', 'approved')
                .gt('deadline', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setJobs(data || []);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.metadata.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegion = !selectedRegion || job.metadata.working_regions.includes(selectedRegion);
        return matchesSearch && matchesRegion;
    });

    const formatSalary = (salary: any) => {
        if (!salary) return 'Thỏa thuận';
        if (salary.is_negotiable) return 'Thỏa thuận';

        if (salary.min && salary.max) {
            return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency}`;
        }
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
                <h1>Khám phá cơ hội việc làm</h1>
                <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)' }}>
                    {jobs.length} công việc đang chờ đón bạn
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
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: 'var(--radius-lg)',
                                            background: 'var(--color-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold',
                                            color: 'white'
                                        }}
                                    >
                                        {job.metadata.title?.[0] || 'J'}
                                    </div>
                                    <div>
                                        <h4 style={{ marginBottom: '0.25rem' }}>{job.metadata.title}</h4>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                            Công ty tuyển dụng
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

                            <div className="card-footer">
                                <div className="flex items-center gap-sm" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                                    <FiClock size={14} />
                                    <span>
                                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: vi })}
                                    </span>
                                </div>
                                <span className="badge badge-success">{job.view_count} lượt xem</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
