import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Profile, Job } from '../lib/supabase';
import {
    FiMapPin, FiGlobe, FiPhone, FiMail, FiUsers, FiInfo,
    FiCheckCircle, FiBriefcase, FiDollarSign, FiClock,
    FiStar, FiExternalLink, FiShare2
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function CompanyDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [company, setCompany] = useState<Profile | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchCompanyData();
    }, [id]);

    const fetchCompanyData = async () => {
        try {
            setLoading(true);

            // Fetch company profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (profileError) throw profileError;
            setCompany(profileData);

            // Fetch active jobs from this company
            const { data: jobsData, error: jobsError } = await supabase
                .from('jobs')
                .select('*')
                .eq('creator_id', id)
                .eq('is_active', true)
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            if (jobsError) throw jobsError;
            setJobs(jobsData || []);

        } catch (error) {
            console.error('Error fetching company data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatSalary = (salary: any) => {
        if (!salary || salary.is_negotiable) return 'Thỏa thuận';

        const formatNumber = (num: number) => {
            // If the number is large (e.g. 5,000,000), convert to millions
            if (num >= 100000) {
                return (num / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
            }
            // If already in millions (e.g. 5, 10.5)
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
            <div className="container" style={{ padding: 'var(--spacing-3xl) 0', textAlign: 'center' }}>
                <div className="loading-spinner" style={{ margin: '0 auto var(--spacing-md)' }}></div>
                <div className="loading">Đang tải thông tin doanh nghiệp...</div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="container section">
                <div className="card text-center" style={{ padding: 'var(--spacing-3xl)' }}>
                    <FiInfo size={48} style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-lg)' }} />
                    <h2>Không tìm thấy thông tin doanh nghiệp</h2>
                    <p>Hồ sơ doanh nghiệp không tồn tại hoặc đã bị gỡ bỏ.</p>
                    <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 'var(--spacing-lg)' }}>
                        Khám phá các việc làm khác
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#F4F7F9', minHeight: '100vh', paddingBottom: 'var(--spacing-3xl)' }}>
            {/* Header Hero Section - More Premium Style */}
            <div style={{
                background: 'linear-gradient(160deg, #1E88E5 0%, #0D47A1 100%)',
                height: '380px',
                position: 'relative',
                overflow: 'visible', // Allow overlap
                boxShadow: 'inset 0 -100px 100px -50px rgba(0,0,0,0.2)'
            }}>
                {/* Visual Pattern Overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.08,
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px',
                    pointerEvents: 'none'
                }}></div>

                <div className="container" style={{ height: '100%', position: 'relative' }}>
                    {/* Floating Info Bar at the bottom of Banner */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-80px', // Overlap bottom
                        left: '50px',
                        right: '50px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 'var(--spacing-xl)',
                        zIndex: 100
                    }}>
                        {/* Enlarged Logo Container */}
                        <div style={{
                            width: '210px',
                            height: '210px',
                            borderRadius: '28px',
                            background: 'white',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '6px solid white',
                            flexShrink: 0,
                            overflow: 'hidden' // Ensure image follows border radius
                        }}>
                            {company.avatar_url ? (
                                <img
                                    src={company.avatar_url}
                                    alt={company.company_name || ''}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #BBDEFB 0%, #1E88E5 100%)',
                                    borderRadius: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '5rem',
                                    fontWeight: 900,
                                    color: 'white'
                                }}>
                                    {company.company_name?.[0] || 'C'}
                                </div>
                            )}
                        </div>

                        {/* Title & Info - Positioned slightly higher to be on the blue side */}
                        <div style={{
                            flex: 1,
                            paddingBottom: '95px', // Lift text up into the blue area
                            color: 'white'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                                <h1 style={{
                                    fontSize: '2.75rem',
                                    fontWeight: 800,
                                    color: 'white',
                                    marginBottom: 0,
                                    textShadow: '0 4px 12px rgba(0,0,0,0.25)',
                                    letterSpacing: '-1px'
                                }}>
                                    {company.company_name || company.full_name}
                                </h1>
                                <div style={{
                                    background: 'white',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FiCheckCircle style={{ color: '#00B14F' }} size={24} />
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: 'var(--spacing-xl)',
                                fontSize: '1.05rem',
                                fontWeight: 500,
                                color: 'rgba(255, 255, 255, 0.95)',
                                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                    <FiMapPin style={{ color: '#BBDEFB' }} /> {company.metadata?.address || 'Việt Nam'}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                    <FiUsers style={{ color: '#BBDEFB' }} /> {company.metadata?.size || 'Đang cập nhật'}
                                </span>
                                {company.metadata?.website && (
                                    <a
                                        href={company.metadata.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}
                                        className="hover-underline"
                                    >
                                        <FiGlobe style={{ color: '#BBDEFB' }} /> Trang web
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons - Also lifted */}
                        <div style={{ paddingBottom: '95px', display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button className="btn" style={{
                                background: 'white',
                                color: 'var(--color-primary)',
                                fontWeight: 700,
                                padding: '0.875rem 1.75rem',
                                borderRadius: '14px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                <FiStar /> Theo dõi
                            </button>
                            <button className="btn" style={{
                                background: 'rgba(255,255,255,0.15)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.25)',
                                borderRadius: '14px',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <FiShare2 /> Chia sẻ
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section - Increased margin to accommodate floating bar */}
            <div className="container" style={{ marginTop: '140px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--spacing-xl)' }}>

                    {/* Left Column: About & Jobs */}
                    <div>
                        {/* Company Intro Card */}
                        <section className="card" style={{ marginBottom: 'var(--spacing-xl)', border: 'none', boxShadow: 'var(--shadow-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: 'rgba(30, 136, 229, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--color-primary)'
                                }}>
                                    <FiInfo size={24} />
                                </div>
                                <h3 style={{ marginBottom: 0 }}>Giới thiệu công ty</h3>
                            </div>

                            <div style={{
                                color: 'var(--color-text)',
                                fontSize: '1.05rem',
                                lineHeight: 1.8,
                                whiteSpace: 'pre-line'
                            }}>
                                {company.metadata?.description ||
                                    `Chào mừng bạn đến với ${company.company_name || company.full_name}. Chúng tôi tự hào là đơn vị tiên phong trong ngành, không ngừng đổi mới và nỗ lực mang lại những giá trị thiết thực nhất cho khách hàng và đối tác.`
                                }
                            </div>

                            {/* Company Features/Benefits - Placeholder icons */}
                            <div style={{
                                marginTop: 'var(--spacing-xl)',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: 'var(--spacing-md)'
                            }}>
                                {[
                                    { icon: <FiClock />, label: 'Làm việc linh hoạt' },
                                    { icon: <FiStar />, label: 'Môi trường sáng tạo' },
                                    { icon: <FiCheckCircle />, label: 'Cơ hội thăng tiến' }
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        padding: 'var(--spacing-md)',
                                        background: '#F8F9FA',
                                        borderRadius: 'var(--radius-lg)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-xs)',
                                        color: 'var(--color-text-secondary)',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ color: 'var(--color-primary)', fontSize: '1.25rem' }}>{item.icon}</div>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Jobs List Section */}
                        <section>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                <h3 style={{ marginBottom: 0 }}>
                                    Việc làm đang tuyển dụng
                                    <span style={{
                                        marginLeft: 'var(--spacing-sm)',
                                        fontSize: '0.9rem',
                                        padding: '2px 10px',
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        borderRadius: '20px'
                                    }}>{jobs.length}</span>
                                </h3>
                            </div>

                            {jobs.length === 0 ? (
                                <div className="card text-center" style={{ padding: 'var(--spacing-3xl)', border: '2px dashed var(--color-divider)', background: 'transparent' }}>
                                    <FiBriefcase size={48} style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-md)' }} />
                                    <h4 style={{ color: 'var(--color-text-secondary)' }}>Hiện chưa có tin tuyển dụng nào</h4>
                                    <p>Hãy quay lại sau hoặc theo dõi công ty để nhận thông báo mới nhất.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                    {jobs.map(job => (
                                        <Link
                                            key={job.id}
                                            to={`/jobs/${job.id}`}
                                            className="job-card-item animate-fade-in"
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h4 className="job-title-link">{job.metadata.title}</h4>
                                                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                                                        <span className="job-meta-item">
                                                            <FiDollarSign style={{ color: '#00B14F' }} />
                                                            <strong style={{ color: '#00B14F' }}>{formatSalary(job.metadata.salary)}</strong>
                                                        </span>
                                                        <span className="job-meta-item">
                                                            <FiMapPin /> {job.metadata.working_regions?.[0] || 'Việt Nam'}
                                                        </span>
                                                        <span className="job-meta-item">
                                                            <FiClock /> {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: vi })}
                                                        </span>
                                                    </div>

                                                    <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-xs)' }}>
                                                        {job.metadata.requirements_tags?.slice(0, 3).map((tag, i) => (
                                                            <span key={i} className="badge badge-secondary" style={{ fontSize: '0.75rem', background: '#F0F2F5' }}>
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: '1px solid var(--color-primary)',
                                                    color: 'var(--color-primary)',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 700,
                                                    transition: 'all 0.2s',
                                                    backgroundColor: 'transparent'
                                                }} className="btn-apply-hover">
                                                    Ứng tuyển ngay
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Contact & Stats */}
                    <aside>
                        <div style={{ position: 'sticky', top: '100px' }}>
                            {/* Contact Info Card */}
                            <section className="card" style={{ border: 'none', boxShadow: 'var(--shadow-md)', marginBottom: 'var(--spacing-lg)' }}>
                                <h4 style={{ marginBottom: 'var(--spacing-xl)', fontSize: '1.1rem', borderLeft: '4px solid var(--color-primary)', paddingLeft: '1rem' }}>
                                    Thông tin liên hệ
                                </h4>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                        <div className="contact-icon-box"><FiPhone /></div>
                                        <div>
                                            <div className="contact-label">Số điện thoại</div>
                                            <div className="contact-value">{company.phone || 'Đang cập nhật'}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                        <div className="contact-icon-box"><FiMail /></div>
                                        <div>
                                            <div className="contact-label">Email công ty</div>
                                            <div className="contact-value" style={{ wordBreak: 'break-all' }}>{company.email}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                        <div className="contact-icon-box"><FiExternalLink /></div>
                                        <div>
                                            <div className="contact-label">Trang web</div>
                                            <div className="contact-value">
                                                {company.metadata?.website ? (
                                                    <a href={company.metadata.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>
                                                        {company.metadata.website.replace(/^https?:\/\//, '')}
                                                    </a>
                                                ) : 'Đang cập nhật'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: 'var(--spacing-xl)',
                                    paddingTop: 'var(--spacing-lg)',
                                    borderTop: '1px solid var(--color-divider)',
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: '#4CAF50',
                                        fontWeight: 700,
                                        fontSize: '0.9rem'
                                    }}>
                                        <FiCheckCircle size={18} /> Doanh nghiệp đã xác thực
                                    </div>
                                </div>
                            </section>

                            {/* Industry Tag Cloud or other sidebar info */}
                            <section className="card" style={{ border: 'none', boxShadow: 'var(--shadow-md)' }}>
                                <h4 style={{ marginBottom: 'var(--spacing-lg)', fontSize: '1.1rem' }}>Lĩnh vực hoạt động</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {company.metadata?.industries?.map((ind: string, i: number) => (
                                        <span key={i} className="tag" style={{ borderRadius: '8px', background: '#F0F2F5', fontWeight: 500 }}>
                                            {ind}
                                        </span>
                                    )) || (
                                            <>
                                                <span className="tag" style={{ borderRadius: '8px', background: '#F0F2F5' }}>Công nghệ thông tin</span>
                                                <span className="tag" style={{ borderRadius: '8px', background: '#F0F2F5' }}>Phần mềm</span>
                                                <span className="tag" style={{ borderRadius: '8px', background: '#F0F2F5' }}>Digital Marketing</span>
                                            </>
                                        )}
                                </div>
                            </section>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
                .job-card-item {
                    display: block;
                    background: white;
                    padding: var(--spacing-xl);
                    border-radius: var(--radius-lg);
                    text-decoration: none;
                    color: inherit;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid transparent;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }

                .job-card-item:hover {
                    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                    transform: translateY(-2px);
                    border-color: var(--color-primary-light);
                }

                .job-title-link {
                    color: var(--color-text);
                    margin-bottom: 0;
                    font-size: 1.25rem;
                    font-weight: 700;
                    transition: color 0.2s;
                }

                .job-card-item:hover .job-title-link {
                    color: var(--color-primary);
                }

                .job-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.95rem;
                    color: var(--color-text-secondary);
                }

                .contact-icon-box {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: #F8F9FA;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-primary);
                    flex-shrink: 0;
                }

                .contact-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--color-text-light);
                    font-weight: 700;
                }

                .contact-value {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: var(--color-text);
                }

                .btn-apply-hover {
                    transition: all 0.2s;
                }

                .job-card-item:hover .btn-apply-hover {
                    background: var(--color-primary);
                    color: white !important;
                }

                @media (max-width: 992px) {
                    .container {
                        padding: 0 var(--spacing-md);
                    }
                    div[style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                    }
                    aside {
                        margin-top: var(--spacing-xl);
                    }
                }
            `}</style>
        </div>
    );
}
