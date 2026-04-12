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

function NewsDetailSkeleton() {
    return (
        <div className="news-detail-page-wrapper">
            <div className="container section">
                <div className="skeleton" style={{ height: '1rem', width: '200px', marginBottom: 'var(--spacing-xl)' }} />
                <div className="news-detail-grid">
                    <main>
                        <div className="skeleton" style={{ height: '2rem', width: '40%', marginBottom: 'var(--spacing-lg)' }} />
                        <div className="skeleton" style={{ height: '3rem', width: '70%', marginBottom: 'var(--spacing-xl)' }} />
                        <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--spacing-2xl)' }} />
                        <div className="card">
                            <div className="skeleton skeleton-text" />
                            <div className="skeleton skeleton-text" />
                            <div className="skeleton skeleton-text" style={{ width: '80%' }} />
                            <div className="skeleton skeleton-text" />
                            <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                        </div>
                    </main>
                    <aside>
                        <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                            <div className="skeleton" style={{ height: '1rem', width: '60%', marginBottom: 'var(--spacing-md)' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-sm)' }}>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="skeleton" style={{ aspectRatio: '1/1', borderRadius: 'var(--radius-md)' }} />
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

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

    if (loading) return <NewsDetailSkeleton />;

    if (!news) return (
        <div className="container section text-center">
            <h3>Tin tức không tồn tại</h3>
            <Link to="/news" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}> Quay lại danh sách </Link>
        </div>
    );

    return (
        <div className="news-detail-page-wrapper">
            <div className="container section">
                {/* Breadcrumbs */}
                <nav className="news-breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <FiArrowRight size={12} />
                    <Link to="/news">Tin tức nghề nghiệp</Link>
                    <FiArrowRight size={12} />
                    <span className="breadcrumb-current">Chi tiết bài viết</span>
                </nav>

                <div className="news-detail-grid">
                    {/* Main Content Area */}
                    <main className="news-detail-main">
                        {/* Article Header */}
                        <header className="article-header">
                            <div className="article-category-badge" style={{ background: CATEGORY_COLORS[news.category] }}>
                                {NEWS_CATEGORIES[news.category]}
                            </div>

                            <h1 className="article-title">
                                {news.title}
                            </h1>

                            <div className="news-meta-wrapper">
                                <div className="news-meta-item"><FiCalendar /> {format(new Date(news.created_at), 'dd MMMM, yyyy')}</div>
                                <div className="news-meta-item"><FiEye /> {news.view_count || 0} lượt đọc</div>
                                <div className="news-meta-item"><FiClock /> 5 phút đọc</div>
                            </div>
                        </header>

                        {/* Featured Image */}
                        <div className="premium-image-container article-featured-image">
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

                            <div className="article-body" dangerouslySetInnerHTML={{ __html: news.content }} />

                            {/* Tags Section */}
                            {news.tags && news.tags.length > 0 && (
                                <div className="article-tags">
                                    <span className="tags-label">HASHTAGS:</span>
                                    {news.tags.map(tag => (
                                        <span key={tag} className="badge badge-primary article-tag">#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>

                    {/* Right Sidebar */}
                    <aside className="news-detail-sidebar">
                        <div className="news-sticky-sidebar">
                            {/* Action Buttons */}
                            <div className="sidebar-actions">
                                <button className="btn btn-primary sidebar-action-btn">
                                    <FiBookmark /> Lưu tin bài
                                </button>
                                <button className="btn btn-secondary sidebar-share-btn">
                                    <FiShare2 size={20} />
                                </button>
                            </div>

                            {/* Share Card */}
                            <div className="card share-card">
                                <h4 className="share-title">Chia sẻ với bạn bè</h4>
                                <div className="share-buttons-grid">
                                    <div className="share-btn share-btn-facebook" title="Facebook">
                                        <FiFacebook size={22} />
                                    </div>
                                    <div className="share-btn share-btn-linkedin" title="LinkedIn">
                                        <FiLinkedin size={22} />
                                    </div>
                                    <div className="share-btn share-btn-twitter" title="Twitter">
                                        <FiTwitter size={22} />
                                    </div>
                                    <div className="share-btn share-btn-copy" title="Sao chép liên kết">
                                        <FiLink size={22} />
                                    </div>
                                </div>
                            </div>

                            {/* Author Info */}
                            <div className="card author-card">
                                <h4 className="author-title">Về tác giả</h4>
                                <div className="author-info">
                                    <div className="author-avatar">NP</div>
                                    <div className="author-details">
                                        <div className="author-name">NP Ban Biên Tập</div>
                                        <div className="author-role">Cố vấn sự nghiệp</div>
                                    </div>
                                </div>
                                <p className="author-bio">Đội ngũ chuyên gia từ NP FutureGate luôn nỗ lực mang đến những kiến thức nghề nghiệp giá trị nhất dành cho bạn.</p>
                            </div>

                            {/* Quick Links / Related Mini List */}
                            <div className="related-mini-list">
                                <h4 className="related-mini-title">Tin liên quan</h4>
                                <div className="related-mini-items">
                                    {relatedNews.slice(0, 3).map(n => (
                                        <Link key={n.id} to={`/news/${n.id}`} className="related-mini-item hover-lift">
                                            <img src={n.cover_image_url || ''} className="related-mini-thumb" alt={n.title} />
                                            <h5 className="related-mini-title-text">{n.title}</h5>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Related News Carousel/Grid Section */}
                {relatedNews.length > 3 && (
                    <section className="related-news-section">
                        <div className="related-news-header">
                            <h2 className="related-news-title">Khám phá thêm nội dung</h2>
                            <Link to="/news" className="btn btn-outline-primary related-news-view-all">Xem tất cả bài viết <FiArrowRight /></Link>
                        </div>
                        <div className="related-news-grid">
                            {relatedNews.slice(3, 6).map(n => (
                                <Link key={n.id} to={`/news/${n.id}`} className="news-card-v2 shadow-sm">
                                    <div className="news-thumb-container related-card-thumb">
                                        <img src={n.cover_image_url || ''} alt={n.title} className="news-thumb" />
                                    </div>
                                    <div className="news-card-body">
                                        <h4 className="related-card-title">{n.title}</h4>
                                        <div className="related-card-date">{format(new Date(n.created_at), 'dd/MM/yyyy')}</div>
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
