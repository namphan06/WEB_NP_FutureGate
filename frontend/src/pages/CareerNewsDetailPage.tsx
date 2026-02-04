import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, NEWS_CATEGORIES } from '../lib/supabase';
import type { CareerNews, NewsCategory } from '../lib/supabase';
import {
    FiCalendar, FiEye, FiShare2, FiBookmark, FiClock,
    FiFacebook, FiTwitter, FiLinkedin, FiLink, FiArrowRight
} from 'react-icons/fi';
import { format } from 'date-fns';

const CATEGORY_COLORS: Record<NewsCategory, string> = {
    market_trends: '#3B82F6',
    company_news: '#8B5CF6',
    industry_insights: '#10B981',
    career_tips: '#F59E0B',
    events: '#EF4444'
};

export default function CareerNewsDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [news, setNews] = useState<CareerNews | null>(null);
    const [relatedNews, setRelatedNews] = useState<CareerNews[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchNewsDetail();
            incrementViewCount();
        }
    }, [id]);

    const fetchNewsDetail = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('career_news')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setNews(data);

            const { data: related } = await supabase
                .from('career_news')
                .select('*')
                .eq('category', data.category)
                .neq('id', id)
                .limit(6);

            setRelatedNews(related || []);
        } catch (error) {
            console.error('Error fetching news detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const incrementViewCount = async () => {
        if (!id) return;
        const { data } = await supabase.from('career_news').select('view_count').eq('id', id).single();
        await supabase.from('career_news').update({ view_count: (data?.view_count || 0) + 1 }).eq('id', id);
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="loading-spinner"></div>
        </div>
    );

    if (!news) return (
        <div className="container section text-center">
            <h3>Tin tức không tồn tại</h3>
            <Link to="/news" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}> Quay lại danh sách </Link>
        </div>
    );

    return (
        <div style={{ background: '#FFFFFF', minHeight: '100vh', padding: '0 20px' }}>
            <div style={{ maxWidth: '1600px', margin: '0 auto', paddingTop: 'var(--spacing-lg)' }}>
                {/* Breadcrumbs */}
                <nav className="news-breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <FiArrowRight size={12} />
                    <Link to="/news">Tin tức nghề nghiệp</Link>
                    <FiArrowRight size={12} />
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Chi tiết bài viết</span>
                </nav>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
                    {/* Main Content Area */}
                    <main>
                        {/* Article Header */}
                        <header style={{ marginBottom: '3rem' }}>
                            <div style={{
                                background: CATEGORY_COLORS[news.category], color: 'white',
                                display: 'inline-block', padding: '6px 14px', borderRadius: '10px',
                                fontSize: '0.75rem', fontWeight: 800, marginBottom: '1.5rem',
                                textTransform: 'uppercase', letterSpacing: '0.5px'
                            }}>
                                {NEWS_CATEGORIES[news.category]}
                            </div>

                            <h1 style={{ fontSize: '3.25rem', fontWeight: 900, lineHeight: 1.15, marginBottom: '2rem', color: '#0F172A', letterSpacing: '-1px' }}>
                                {news.title}
                            </h1>

                            <div className="news-meta-wrapper">
                                <div className="news-meta-item"><FiCalendar /> {format(new Date(news.created_at), 'dd MMMM, yyyy')}</div>
                                <div className="news-meta-item"><FiEye /> {news.view_count || 0} lượt đọc</div>
                                <div className="news-meta-item"><FiClock /> 5 phút đọc</div>
                            </div>
                        </header>

                        {/* Featured Image */}
                        <div className="premium-image-container" style={{
                            width: '100%',
                            maxWidth: '1000px',
                            height: '420px',
                            marginBottom: '3rem'
                        }}>
                            <img
                                src={news.cover_image_url || 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=95&w=1600'}
                                alt={news.title}
                            />
                        </div>

                        {/* Article Content */}
                        <div className="article-inner-content">
                            {/* Excerpt Block */}
                            <div className="excerpt-card">
                                <div className="excerpt-text">
                                    {news.excerpt}
                                </div>
                            </div>

                            <div dangerouslySetInnerHTML={{ __html: news.content }} />

                            {/* Tags Section */}
                            {news.tags && news.tags.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid #F1F5F9' }}>
                                    <span style={{ fontWeight: 800, color: '#0F172A', marginRight: '0.5rem' }}>HASHTAGS:</span>
                                    {news.tags.map(tag => (
                                        <span key={tag} className="badge badge-primary" style={{ padding: '8px 20px', fontSize: '0.85rem', borderRadius: '12px' }}>#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>

                    {/* Right Sidebar */}
                    <aside>
                        <div className="news-sticky-sidebar" style={{ top: '100px' }}>
                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <button className="btn btn-primary" style={{ flex: 1, borderRadius: '12px' }}>
                                    <FiBookmark /> Lưu tin bài
                                </button>
                                <button className="btn btn-secondary" style={{ borderRadius: '12px', padding: '12px' }}>
                                    <FiShare2 size={20} />
                                </button>
                            </div>

                            {/* Share Card */}
                            <div className="card" style={{ padding: '2rem', border: '1px solid #F1F5F9', borderRadius: '24px', boxShadow: 'none', background: '#F8FAFC' }}>
                                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Chia sẻ với bạn bè</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                                    <div title="Facebook" style={{ aspectRatio: '1/1', background: 'white', color: '#1877F2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #E2E8F0' }} className="hover-lift">
                                        <FiFacebook size={22} />
                                    </div>
                                    <div title="LinkedIn" style={{ aspectRatio: '1/1', background: 'white', color: '#0A66C2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #E2E8F0' }} className="hover-lift">
                                        <FiLinkedin size={22} />
                                    </div>
                                    <div title="Twitter" style={{ aspectRatio: '1/1', background: 'white', color: '#1DA1F2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #E2E8F0' }} className="hover-lift">
                                        <FiTwitter size={22} />
                                    </div>
                                    <div title="Sao chép liên kết" style={{ aspectRatio: '1/1', background: 'white', color: '#64748B', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #E2E8F0' }} className="hover-lift">
                                        <FiLink size={22} />
                                    </div>
                                </div>
                            </div>

                            {/* Author Info */}
                            <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #F1F5F9', borderRadius: '24px' }}>
                                <h4 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1rem' }}>Về tác giả</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.25rem' }}>NP</div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1E293B' }}>NP Ban Biên Tập</div>
                                        <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Cố vấn sự nghiệp</div>
                                    </div>
                                </div>
                                <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>Đội ngũ chuyên gia từ NP FutureGate luôn nỗ lực mang đến những kiến thức nghề nghiệp giá trị nhất dành cho bạn.</p>
                            </div>

                            {/* Quick Links / Related Mini List */}
                            <div style={{ marginTop: '2.5rem' }}>
                                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--color-primary)', paddingLeft: '1rem' }}>Tin liên quan</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {relatedNews.slice(0, 3).map(n => (
                                        <Link key={n.id} to={`/news/${n.id}`} style={{ textDecoration: 'none', display: 'flex', gap: '1rem' }} className="hover-lift">
                                            <img src={n.cover_image_url || ''} style={{ width: '80px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} alt={n.title} />
                                            <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.4, color: '#334155' }}>{n.title}</h5>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Related News Carousel/Grid Section */}
                {relatedNews.length > 3 && (
                    <section style={{ marginTop: '6rem', padding: '4rem 0', borderTop: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, margin: 0, color: '#1E293B' }}>Khám phá thêm nội dung</h2>
                            <Link to="/news" className="btn btn-outline-primary" style={{ borderRadius: '12px' }}>Xem tất cả bài viết <FiArrowRight /></Link>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
                            {relatedNews.slice(3, 6).map(n => (
                                <Link key={n.id} to={`/news/${n.id}`} style={{ textDecoration: 'none', color: 'inherit' }} className="news-card-v2 shadow-sm">
                                    <div className="news-thumb-container" style={{ height: '200px' }}>
                                        <img src={n.cover_image_url || ''} alt={n.title} className="news-thumb" />
                                    </div>
                                    <div style={{ padding: '1.75rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.4, color: '#1E293B' }}>{n.title}</h4>
                                        <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>{format(new Date(n.created_at), 'dd/MM/yyyy')}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
