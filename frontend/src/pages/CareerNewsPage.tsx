import { useState, useEffect } from 'react';
import { supabase, NEWS_CATEGORIES } from '../lib/supabase';
import type { CareerNews, NewsCategory } from '../lib/supabase';
import {
    FiSearch, FiCalendar, FiEye, FiArrowRight, FiActivity
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const CATEGORY_COLORS: Record<NewsCategory, string> = {
    market_trends: '#3B82F6',
    company_news: '#8B5CF6',
    industry_insights: '#10B981',
    career_tips: '#F59E0B',
    events: '#EF4444'
};

function NewsSkeleton() {
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="skeleton" style={{ height: '220px', borderRadius: 0 }} />
            <div style={{ padding: '1.5rem' }}>
                <div className="skeleton" style={{ height: '1.3rem', width: '85%', marginBottom: 'var(--spacing-sm)' }} />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--color-divider)' }}>
                    <div className="skeleton" style={{ height: '0.85rem', width: '80px' }} />
                    <div className="skeleton" style={{ height: '0.85rem', width: '60px' }} />
                </div>
            </div>
        </div>
    );
}

export default function CareerNewsPage() {
    const [news, setNews] = useState<CareerNews[]>([]);
    const [trending, setTrending] = useState<CareerNews[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('all');

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('career_news')
                .select('*')
                .eq('status', 'published')
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;

            setNews(data || []);
            setTrending(data?.slice(0, 4) || []);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredNews = news.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || n.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const pinnedNews = news.find(n => n.is_pinned) || news[0];

    return (
        <div className="career-news-page-wrapper">
            <div className="container section">
                {/* Hero Section */}
                {!searchQuery && activeCategory === 'all' && pinnedNews && (
                    <Link to={`/news/${pinnedNews.id}`} className="career-news-hero" style={{
                        background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${pinnedNews.cover_image_url || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=1200'}) center/cover no-repeat`
                    }}>
                        <div className="career-news-hero-content">
                            <div className="hero-category-pill" style={{ background: CATEGORY_COLORS[pinnedNews.category] }}>
                                {NEWS_CATEGORIES[pinnedNews.category]}
                            </div>
                            <h1 className="hero-title">
                                {pinnedNews.title}
                            </h1>
                            <p className="hero-excerpt">
                                {pinnedNews.excerpt}
                            </p>
                            <div className="hero-meta">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiCalendar /> {format(new Date(pinnedNews.created_at), 'dd/MM/yyyy')}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiEye /> {pinnedNews.view_count || 0} lượt xem</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60A5FA' }}>Xem chi tiết <FiArrowRight /></span>
                            </div>
                        </div>
                    </Link>
                )}

                <div className="news-layout-grid">
                    {/* Left Column - News List */}
                    <div className="news-main-column">
                        <div className="news-section-header">
                            <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 800, margin: 0 }}>
                                {searchQuery ? `Kết quả cho "${searchQuery}"` : activeCategory !== 'all' ? NEWS_CATEGORIES[activeCategory as NewsCategory] : 'Bài viết mới nhất'}
                            </h2>
                            <div className="news-quick-filters">
                                <button onClick={() => setActiveCategory('all')} className={`news-quick-filter-btn ${activeCategory === 'all' ? 'active' : ''}`}>Tất cả</button>
                                <span className="news-filter-separator">|</span>
                                <button onClick={() => setActiveCategory('market_trends')} className={`news-quick-filter-btn ${activeCategory === 'market_trends' ? 'active' : ''}`}>Thị trường</button>
                            </div>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="glass-card news-filter-bar">
                            <div className="news-search-wrapper">
                                <FiSearch className="news-search-icon" />
                                <input
                                    type="text"
                                    className="form-input news-search-input"
                                    placeholder="Tìm kiếm nội dung..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="news-category-filters">
                                {Object.entries(NEWS_CATEGORIES).slice(1, 4).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveCategory(key)}
                                        className={`btn btn-sm category-filter-btn ${activeCategory === key ? 'btn-primary' : 'btn-secondary'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="news-grid">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <NewsSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="news-grid">
                                    {filteredNews.map((n, index) => (
                                        <Link key={n.id} to={`/news/${n.id}`} className="news-card-v2 animate-fade-in-up" style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}>
                                            <div className="news-thumb-container">
                                                <div className="news-category-pill" style={{ background: CATEGORY_COLORS[n.category] }}>
                                                    {NEWS_CATEGORIES[n.category]}
                                                </div>
                                                <img src={n.cover_image_url || undefined} alt={n.title} className="news-thumb" />
                                            </div>
                                            <div className="news-card-body">
                                                <h3 className="news-card-title">
                                                    {n.title}
                                                </h3>
                                                <p className="news-card-excerpt">
                                                    {n.excerpt}
                                                </p>
                                                <div className="news-card-footer">
                                                    <div className="news-card-meta">
                                                        <span className="news-meta-flex"><FiCalendar /> {format(new Date(n.created_at), 'dd/MM')}</span>
                                                        <span className="news-meta-flex"><FiEye /> {n.view_count || 0}</span>
                                                    </div>
                                                    <span className="news-read-more">Đọc tiếp <FiArrowRight /></span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    {filteredNews.length === 0 && (
                                        <div className="news-empty-state">
                                            <h3>Không tìm thấy kết quả</h3>
                                            <p>Thử tìm kiếm với từ khóa khác.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <aside className="news-sidebar">
                        <div className="news-sticky-sidebar">
                            {/* Trending Section */}
                            <div className="card trending-card">
                                <h3 className="trending-title">
                                    <FiActivity color="#F59E0B" /> Xu hướng đọc
                                </h3>
                                <div className="trending-list">
                                    {trending.map((n, idx) => (
                                        <Link key={n.id} to={`/news/${n.id}`} className="trending-item">
                                            <span className="trending-rank">0{idx + 1}</span>
                                            <div className="trending-info">
                                                <h4 className="trending-item-title">{n.title}</h4>
                                                <div className="trending-item-meta">
                                                    <span>{NEWS_CATEGORIES[n.category]}</span>
                                                    <span>•</span>
                                                    <span>{n.view_count || 0} xem</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Newsletter / CTA */}
                            <div className="card newsletter-card">
                                <div className="newsletter-content">
                                    <h3 className="newsletter-title">Nhận tin nghề nghiệp</h3>
                                    <p className="newsletter-desc">Cập nhật những thay đổi mới nhất của thị trường lao động hàng tuần.</p>
                                    <input
                                        type="email"
                                        className="form-input newsletter-input"
                                        placeholder="Email của bạn..."
                                    />
                                    <button className="btn btn-block newsletter-btn">Đăng ký ngay</button>
                                </div>
                                <div className="newsletter-image"></div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
