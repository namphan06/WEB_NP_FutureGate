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
        <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 'var(--spacing-3xl)' }}>
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
                            <h1 style={{ color: 'white', fontSize: '3.5rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1 }}>
                                {pinnedNews.title}
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem', marginBottom: '1.5rem', maxWidth: '700px' }}>
                                {pinnedNews.excerpt}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiCalendar /> {format(new Date(pinnedNews.created_at), 'dd/MM/yyyy')}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiEye /> {pinnedNews.view_count || 0} lượt xem</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60A5FA' }}>Xem chi tiết <FiArrowRight /></span>
                            </div>
                        </div>
                    </Link>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 'var(--spacing-2xl)' }}>
                    {/* Left Column - News List */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
                                {searchQuery ? `Kết quả cho "${searchQuery}"` : activeCategory !== 'all' ? NEWS_CATEGORIES[activeCategory as NewsCategory] : 'Bài viết mới nhất'}
                            </h2>
                            <div className="flex gap-sm">
                                <button onClick={() => setActiveCategory('all')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: activeCategory === 'all' ? 'var(--color-primary)' : '#64748B' }}>Tất cả</button>
                                <span style={{ color: '#E2E8F0' }}>|</span>
                                <button onClick={() => setActiveCategory('market_trends')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: activeCategory === 'market_trends' ? 'var(--color-primary)' : '#64748B' }}>Thị trường</button>
                            </div>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '20px', marginBottom: '2.5rem', display: 'flex', gap: '1rem' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Tìm kiếm nội dung..."
                                    style={{ paddingLeft: '2.75rem', height: '48px', border: 'none', background: '#F1F5F9' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {Object.entries(NEWS_CATEGORIES).slice(1, 4).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveCategory(key)}
                                        className={`btn btn-sm ${activeCategory === key ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{ borderRadius: '12px' }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center" style={{ padding: '4rem' }}>
                                <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                                {filteredNews.map(n => (
                                    <Link key={n.id} to={`/news/${n.id}`} className="news-card-v2">
                                        <div className="news-thumb-container">
                                            <div className="news-category-pill" style={{ background: CATEGORY_COLORS[n.category] }}>
                                                {NEWS_CATEGORIES[n.category]}
                                            </div>
                                            <img src={n.cover_image_url || undefined} alt={n.title} className="news-thumb" />
                                        </div>
                                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                                                {n.title}
                                            </h3>
                                            <p style={{ color: '#64748B', fontSize: '0.925rem', marginBottom: '1.5rem', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                                {n.excerpt}
                                            </p>
                                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>
                                                <div className="flex gap-md">
                                                    <span className="flex items-center gap-xs"><FiCalendar /> {format(new Date(n.created_at), 'dd/MM')}</span>
                                                    <span className="flex items-center gap-xs"><FiEye /> {n.view_count || 0}</span>
                                                </div>
                                                <span style={{ color: 'var(--color-primary)' }}>Đọc tiếp <FiArrowRight /></span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {filteredNews.length === 0 && (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                                        <h3>Không tìm thấy kết quả</h3>
                                        <p>Thử tìm kiếm với từ khóa khác.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <aside>
                        <div className="news-sticky-sidebar">
                            {/* Trending Section */}
                            <div className="card" style={{ borderRadius: '24px', border: 'none', background: '#1E293B', color: 'white', padding: '1.75rem' }}>
                                <h3 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                                    <FiActivity color="#F59E0B" /> Xu hướng đọc
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {trending.map((n, idx) => (
                                        <Link key={n.id} to={`/news/${n.id}`} style={{ textDecoration: 'none', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'rgba(255,255,255,0.1)', lineHeight: 1 }}>0{idx + 1}</span>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 600, margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.title}</h4>
                                                <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
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
                            <div className="card" style={{ borderRadius: '24px', border: 'none', background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)', color: 'white', overflow: 'hidden', padding: 0 }}>
                                <div style={{ padding: '1.75rem' }}>
                                    <h3 style={{ color: 'white', fontSize: '1.25rem' }}>Nhận tin nghề nghiệp</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Cập nhật những thay đổi mới nhất của thị trường lao động hàng tuần.</p>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="Email của bạn..."
                                        style={{ height: '44px', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', marginBottom: '0.75rem' }}
                                    />
                                    <button className="btn btn-block" style={{ background: 'white', color: 'var(--color-primary)', fontWeight: 700 }}>Đăng ký ngay</button>
                                </div>
                                <div style={{ height: '80px', background: 'url(https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=400) center/cover' }}></div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
