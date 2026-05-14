import { useState, useEffect, useRef } from 'react';
import { supabase, NEWS_CATEGORIES, NEWS_STATUS_LABELS } from '../../lib/supabase';
import type { CareerNews, NewsCategory, NewsStatus, Profile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiImage,
    FiEye, FiStar, FiX, FiCheck, FiUpload, FiMapPin,
    FiCalendar, FiFileText, FiTrendingUp, FiBriefcase
} from 'react-icons/fi';
import { format } from 'date-fns';

// Category icons mapping
const CATEGORY_ICONS: Record<NewsCategory, React.ReactNode> = {
    market_trends: <FiTrendingUp />,
    company_news: <FiBriefcase />,
    industry_insights: <FiFileText />,
    career_tips: <FiStar />,
    events: <FiCalendar />
};

// Category colors
const CATEGORY_COLORS: Record<NewsCategory, string> = {
    market_trends: '#3B82F6',
    company_news: '#8B5CF6',
    industry_insights: '#10B981',
    career_tips: '#F59E0B',
    events: '#EF4444'
};

export default function AdminNewsPage() {
    const { profile } = useAuth();
    const [news, setNews] = useState<CareerNews[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingNews, setEditingNews] = useState<CareerNews | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<NewsCategory | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<NewsStatus | 'all'>('all');

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        cover_image_url: '',
        category: 'market_trends' as NewsCategory,
        tags: [] as string[],
        related_company_ids: [] as string[],
        status: 'draft' as NewsStatus,
        is_featured: false,
        is_pinned: false,
        meta_title: '',
        meta_description: ''
    });
    const [tagInput, setTagInput] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Employers for company selection
    const [employers, setEmployers] = useState<Profile[]>([]);
    const [employerSearch, setEmployerSearch] = useState('');
    const [showEmployerDropdown, setShowEmployerDropdown] = useState(false);

    // Only admins can access
    if (profile?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        fetchNews();
        fetchEmployers();
    }, [categoryFilter, statusFilter]);

    const fetchNews = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('career_news')
                .select('*')
                .order('created_at', { ascending: false });

            if (categoryFilter !== 'all') {
                query = query.eq('category', categoryFilter);
            }
            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setNews(data || []);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'employer');

            if (error) throw error;
            setEmployers(data || []);
        } catch (error) {
            console.error('Error fetching employers:', error);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile) return formData.cover_image_url || null;

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error } = await supabase.storage
            .from('career-news-images')
            .upload(fileName, imageFile);

        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('career-news-images')
            .getPublicUrl(fileName);

        return publicUrl;
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim()]
            });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(t => t !== tag)
        });
    };

    const handleAddCompany = (companyId: string) => {
        if (!formData.related_company_ids.includes(companyId)) {
            setFormData({
                ...formData,
                related_company_ids: [...formData.related_company_ids, companyId]
            });
        }
        setShowEmployerDropdown(false);
        setEmployerSearch('');
    };

    const handleRemoveCompany = (companyId: string) => {
        setFormData({
            ...formData,
            related_company_ids: formData.related_company_ids.filter(id => id !== companyId)
        });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            excerpt: '',
            content: '',
            cover_image_url: '',
            category: 'market_trends',
            tags: [],
            related_company_ids: [],
            status: 'draft',
            is_featured: false,
            is_pinned: false,
            meta_title: '',
            meta_description: ''
        });
        setImageFile(null);
        setImagePreview(null);
        setEditingNews(null);
    };

    const openEditModal = (newsItem: CareerNews) => {
        setEditingNews(newsItem);
        setFormData({
            title: newsItem.title,
            excerpt: newsItem.excerpt || '',
            content: newsItem.content,
            cover_image_url: newsItem.cover_image_url || '',
            category: newsItem.category,
            tags: newsItem.tags || [],
            related_company_ids: newsItem.related_company_ids || [],
            status: newsItem.status,
            is_featured: newsItem.is_featured,
            is_pinned: newsItem.is_pinned,
            meta_title: newsItem.meta_title || '',
            meta_description: newsItem.meta_description || ''
        });
        setImagePreview(newsItem.cover_image_url);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content || !formData.category) {
            alert('Vui lòng điền đầy đủ tiêu đề, nội dung và danh mục!');
            return;
        }

        setActionLoading(true);
        try {
            // Upload image if new one selected
            const imageUrl = await uploadImage();

            const newsData = {
                title: formData.title,
                excerpt: formData.excerpt || null,
                content: formData.content,
                cover_image_url: imageUrl,
                category: formData.category,
                tags: formData.tags,
                related_company_ids: formData.related_company_ids,
                status: formData.status,
                is_featured: formData.is_featured,
                is_pinned: formData.is_pinned,
                meta_title: formData.meta_title || null,
                meta_description: formData.meta_description || null,
                author_id: profile?.id
            };

            if (editingNews) {
                const { error } = await supabase
                    .from('career_news')
                    .update(newsData)
                    .eq('id', editingNews.id);

                if (error) throw error;
                alert('Cập nhật tin tức thành công!');
            } else {
                const { error } = await supabase
                    .from('career_news')
                    .insert([newsData]);

                if (error) throw error;
                alert('Tạo tin tức mới thành công!');
            }

            setShowModal(false);
            resetForm();
            fetchNews();
        } catch (error: any) {
            console.error('Error saving news:', error);
            alert('Lỗi: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa tin tức này?')) return;

        setActionLoading(true);
        try {
            const { error } = await supabase
                .from('career_news')
                .delete()
                .eq('id', id);

            if (error) throw error;
            alert('Đã xóa tin tức!');
            fetchNews();
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const toggleStatus = async (newsItem: CareerNews) => {
        const newStatus: NewsStatus = newsItem.status === 'published' ? 'draft' : 'published';
        try {
            const { error } = await supabase
                .from('career_news')
                .update({ status: newStatus })
                .eq('id', newsItem.id);

            if (error) throw error;
            fetchNews();
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        }
    };

    const toggleFeatured = async (newsItem: CareerNews) => {
        try {
            const { error } = await supabase
                .from('career_news')
                .update({ is_featured: !newsItem.is_featured })
                .eq('id', newsItem.id);

            if (error) throw error;
            fetchNews();
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        }
    };

    const togglePinned = async (newsItem: CareerNews) => {
        try {
            const { error } = await supabase
                .from('career_news')
                .update({ is_pinned: !newsItem.is_pinned })
                .eq('id', newsItem.id);

            if (error) throw error;
            fetchNews();
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        }
    };

    const filteredNews = news.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredEmployers = employers.filter(e =>
        e.full_name?.toLowerCase().includes(employerSearch.toLowerCase()) ||
        e.metadata?.company_name?.toLowerCase().includes(employerSearch.toLowerCase())
    );

    const getCompanyName = (companyId: string) => {
        const company = employers.find(e => e.id === companyId);
        return company?.metadata?.company_name || company?.full_name || 'Công ty';
    };

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '2.5rem 50px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>
                        Quản lý Tin tức Nghề nghiệp
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '1.1rem', margin: 0 }}>
                        Tạo và quản lý tin tức về thị trường lao động, xu hướng nghề nghiệp
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="btn btn-primary"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '1rem 2rem', borderRadius: '16px', fontSize: '1rem', fontWeight: 700
                    }}
                >
                    <FiPlus size={20} /> Tạo tin mới
                </button>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid #E2E8F0', marginBottom: '2rem', background: 'white' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                        <FiSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Tìm kiếm theo tiêu đề..."
                            style={{ paddingLeft: '3rem', height: '54px', borderRadius: '16px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div style={{ width: '200px', position: 'relative' }}>
                        <FiFilter style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <select
                            className="form-select"
                            style={{ paddingLeft: '3rem', height: '54px', borderRadius: '16px', fontWeight: 600 }}
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value as NewsCategory | 'all')}
                        >
                            <option value="all">Tất cả danh mục</option>
                            {Object.entries(NEWS_CATEGORIES).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ width: '180px', position: 'relative' }}>
                        <select
                            className="form-select"
                            style={{ height: '54px', borderRadius: '16px', fontWeight: 600 }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as NewsStatus | 'all')}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            {Object.entries(NEWS_STATUS_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: 'white' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900 }}>{news.length}</div>
                    <div style={{ opacity: 0.9 }}>Tổng tin tức</div>
                </div>
                <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900 }}>{news.filter(n => n.status === 'published').length}</div>
                    <div style={{ opacity: 0.9 }}>Đã xuất bản</div>
                </div>
                <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: 'white' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900 }}>{news.filter(n => n.status === 'draft').length}</div>
                    <div style={{ opacity: 0.9 }}>Bản nháp</div>
                </div>
                <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: 'white' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900 }}>{news.filter(n => n.is_featured).length}</div>
                    <div style={{ opacity: 0.9 }}>Tin nổi bật</div>
                </div>
            </div>

            {/* News Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="loading">Đang tải tin tức...</div>
                </div>
            ) : filteredNews.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '5rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                    <FiFileText size={60} style={{ color: '#E2E8F0', marginBottom: '1.5rem' }} />
                    <h3 style={{ color: '#1E293B', marginBottom: '0.5rem' }}>Chưa có tin tức nào</h3>
                    <p style={{ color: '#64748B' }}>Bấm "Tạo tin mới" để bắt đầu đăng tin tức.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
                    {filteredNews.map(newsItem => (
                        <div
                            key={newsItem.id}
                            className="card hover-lift"
                            style={{
                                borderRadius: '24px', border: '1px solid #E2E8F0', background: 'white',
                                overflow: 'hidden', position: 'relative'
                            }}
                        >
                            {/* Cover Image */}
                            <div style={{
                                height: '180px',
                                background: newsItem.cover_image_url
                                    ? `url(${newsItem.cover_image_url}) center/cover`
                                    : `linear-gradient(135deg, ${CATEGORY_COLORS[newsItem.category]} 0%, ${CATEGORY_COLORS[newsItem.category]}80 100%)`
                            }}>
                                {/* Badges */}
                                <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    {newsItem.is_pinned && (
                                        <span style={{ background: '#EF4444', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700 }}>
                                            <FiMapPin size={12} /> GHIM
                                        </span>
                                    )}
                                    {newsItem.is_featured && (
                                        <span style={{ background: '#F59E0B', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700 }}>
                                            <FiStar size={12} /> NỔI BẬT
                                        </span>
                                    )}
                                </div>
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                                    <span style={{
                                        background: newsItem.status === 'published' ? '#10B981' : newsItem.status === 'draft' ? '#F59E0B' : '#6B7280',
                                        color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700
                                    }}>
                                        {NEWS_STATUS_LABELS[newsItem.status]}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: '1.5rem' }}>
                                {/* Category */}
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                    background: `${CATEGORY_COLORS[newsItem.category]}15`,
                                    color: CATEGORY_COLORS[newsItem.category],
                                    marginBottom: '0.75rem'
                                }}>
                                    {CATEGORY_ICONS[newsItem.category]} {NEWS_CATEGORIES[newsItem.category]}
                                </div>

                                <h3 style={{
                                    margin: '0 0 0.75rem 0', fontSize: '1.2rem', fontWeight: 800,
                                    color: '#1E293B', lineHeight: 1.4,
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                }}>
                                    {newsItem.title}
                                </h3>

                                {newsItem.excerpt && (
                                    <p style={{
                                        color: '#64748B', fontSize: '0.9rem', margin: '0 0 1rem 0', lineHeight: 1.5,
                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                    }}>
                                        {newsItem.excerpt}
                                    </p>
                                )}

                                {/* Tags */}
                                {newsItem.tags && newsItem.tags.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                        {newsItem.tags.slice(0, 3).map(tag => (
                                            <span key={tag} style={{
                                                background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px',
                                                fontSize: '0.75rem', color: '#64748B'
                                            }}>
                                                #{tag}
                                            </span>
                                        ))}
                                        {newsItem.tags.length > 3 && (
                                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>+{newsItem.tags.length - 3}</span>
                                        )}
                                    </div>
                                )}

                                {/* Related Companies */}
                                {newsItem.related_company_ids && newsItem.related_company_ids.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                        {newsItem.related_company_ids.slice(0, 2).map(companyId => (
                                            <Link
                                                key={companyId}
                                                to={`/employer/${companyId}`}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                    background: '#EDE9FE', padding: '4px 10px', borderRadius: '6px',
                                                    fontSize: '0.75rem', color: '#7C3AED', textDecoration: 'none', fontWeight: 600
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <FiBriefcase size={12} /> {getCompanyName(companyId)}
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Meta info */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#94A3B8' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <FiCalendar size={14} /> {format(new Date(newsItem.created_at), 'dd/MM/yyyy')}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <FiEye size={14} /> {newsItem.view_count || 0} lượt xem
                                    </span>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                                    <button
                                        onClick={() => toggleStatus(newsItem)}
                                        className="btn btn-outline"
                                        style={{ flex: 1, height: '40px', borderRadius: '10px', fontSize: '0.85rem' }}
                                        title={newsItem.status === 'published' ? 'Chuyển thành nháp' : 'Xuất bản'}
                                    >
                                        {newsItem.status === 'published' ? <FiX /> : <FiCheck />}
                                        {newsItem.status === 'published' ? 'Ẩn' : 'Xuất bản'}
                                    </button>
                                    <button
                                        onClick={() => toggleFeatured(newsItem)}
                                        className="btn btn-outline"
                                        style={{ width: '40px', height: '40px', padding: 0, borderRadius: '10px', color: newsItem.is_featured ? '#F59E0B' : '#94A3B8' }}
                                        title="Đánh dấu nổi bật"
                                    >
                                        <FiStar />
                                    </button>
                                    <button
                                        onClick={() => togglePinned(newsItem)}
                                        className="btn btn-outline"
                                        style={{ width: '40px', height: '40px', padding: 0, borderRadius: '10px', color: newsItem.is_pinned ? '#EF4444' : '#94A3B8' }}
                                        title="Ghim tin"
                                    >
                                        <FiMapPin />
                                    </button>
                                    <button
                                        onClick={() => openEditModal(newsItem)}
                                        className="btn btn-outline"
                                        style={{ width: '40px', height: '40px', padding: 0, borderRadius: '10px' }}
                                        title="Chỉnh sửa"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(newsItem.id)}
                                        className="btn btn-outline"
                                        style={{ width: '40px', height: '40px', padding: 0, borderRadius: '10px', color: '#EF4444', borderColor: '#FEE2E2' }}
                                        title="Xóa"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)',
                    backdropFilter: 'blur(8px)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
                }}>
                    <div style={{
                        background: 'white', width: '100%', maxWidth: '900px', borderRadius: '32px',
                        overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column'
                    }}>
                        {/* Modal Header */}
                        <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)', color: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
                                    {editingNews ? 'Chỉnh sửa tin tức' : 'Tạo tin tức mới'}
                                </h2>
                                <button
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                                        width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {/* Left Column */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Title */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1E293B' }}>
                                            Tiêu đề *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Nhập tiêu đề tin tức"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            style={{ height: '50px', borderRadius: '12px' }}
                                            required
                                        />
                                    </div>

                                    {/* Excerpt */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1E293B' }}>
                                            Mô tả ngắn
                                        </label>
                                        <textarea
                                            className="form-input"
                                            placeholder="Mô tả ngắn gọn cho SEO..."
                                            value={formData.excerpt}
                                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                            style={{ minHeight: '80px', borderRadius: '12px', resize: 'vertical' }}
                                        />
                                    </div>

                                    {/* Category & Status */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1E293B' }}>
                                                Danh mục *
                                            </label>
                                            <select
                                                className="form-select"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value as NewsCategory })}
                                                style={{ height: '50px', borderRadius: '12px' }}
                                            >
                                                {Object.entries(NEWS_CATEGORIES).map(([key, label]) => (
                                                    <option key={key} value={key}>{label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1E293B' }}>
                                                Trạng thái
                                            </label>
                                            <select
                                                className="form-select"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value as NewsStatus })}
                                                style={{ height: '50px', borderRadius: '12px' }}
                                            >
                                                {Object.entries(NEWS_STATUS_LABELS).map(([key, label]) => (
                                                    <option key={key} value={key}>{label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1E293B' }}>
                                            Tags
                                        </label>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Thêm tag..."
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                                style={{ flex: 1, height: '44px', borderRadius: '12px' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddTag}
                                                className="btn btn-outline"
                                                style={{ width: '44px', height: '44px', borderRadius: '12px' }}
                                            >
                                                <FiPlus />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {formData.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                        background: '#E2E8F0', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem'
                                                    }}
                                                >
                                                    #{tag}
                                                    <FiX
                                                        style={{ cursor: 'pointer', marginLeft: '0.3rem' }}
                                                        onClick={() => handleRemoveTag(tag)}
                                                    />
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Related Companies */}
                                    <div style={{ position: 'relative' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1E293B' }}>
                                            Công ty liên quan
                                        </label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Tìm công ty..."
                                            value={employerSearch}
                                            onChange={(e) => { setEmployerSearch(e.target.value); setShowEmployerDropdown(true); }}
                                            onFocus={() => setShowEmployerDropdown(true)}
                                            style={{ height: '44px', borderRadius: '12px' }}
                                        />
                                        {showEmployerDropdown && employerSearch && (
                                            <div style={{
                                                position: 'absolute', top: '100%', left: 0, right: 0,
                                                background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px',
                                                maxHeight: '200px', overflowY: 'auto', zIndex: 10, marginTop: '4px',
                                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                            }}>
                                                {filteredEmployers.length === 0 ? (
                                                    <div style={{ padding: '1rem', color: '#64748B', textAlign: 'center' }}>Không tìm thấy</div>
                                                ) : (
                                                    filteredEmployers.map(employer => (
                                                        <div
                                                            key={employer.id}
                                                            onClick={() => handleAddCompany(employer.id)}
                                                            style={{
                                                                padding: '0.75rem 1rem', cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                                borderBottom: '1px solid #F1F5F9'
                                                            }}
                                                            onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                                        >
                                                            <div style={{
                                                                width: '36px', height: '36px', borderRadius: '10px',
                                                                background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                overflow: 'hidden'
                                                            }}>
                                                                {employer.avatar_url ? (
                                                                    <img src={employer.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <FiBriefcase size={16} color="#64748B" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600, color: '#1E293B' }}>
                                                                    {employer.metadata?.company_name || employer.full_name}
                                                                </div>
                                                                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{employer.email}</div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            {formData.related_company_ids.map(companyId => (
                                                <span
                                                    key={companyId}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                        background: '#EDE9FE', padding: '6px 12px', borderRadius: '8px',
                                                        fontSize: '0.85rem', color: '#7C3AED'
                                                    }}
                                                >
                                                    <FiBriefcase size={14} /> {getCompanyName(companyId)}
                                                    <FiX
                                                        style={{ cursor: 'pointer', marginLeft: '0.3rem' }}
                                                        onClick={() => handleRemoveCompany(companyId)}
                                                    />
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Cover Image */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1E293B' }}>
                                            Ảnh bìa
                                        </label>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                        />
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{
                                                height: '180px', borderRadius: '16px', border: '2px dashed #E2E8F0',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                                                background: imagePreview ? `url(${imagePreview}) center/cover` : '#F8FAFC'
                                            }}
                                        >
                                            {!imagePreview && (
                                                <div style={{ textAlign: 'center', color: '#64748B' }}>
                                                    <FiUpload size={32} style={{ marginBottom: '0.5rem' }} />
                                                    <div>Click để tải ảnh lên</div>
                                                </div>
                                            )}
                                            {imagePreview && (
                                                <div style={{
                                                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    opacity: 0, transition: 'opacity 0.2s'
                                                }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                                                >
                                                    <FiImage size={32} color="white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Toggles */}
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <label style={{
                                            flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0',
                                            cursor: 'pointer', background: formData.is_featured ? '#FFFBEB' : 'white'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.is_featured}
                                                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                            />
                                            <FiStar color={formData.is_featured ? '#F59E0B' : '#94A3B8'} />
                                            <span style={{ fontWeight: 600 }}>Nổi bật</span>
                                        </label>
                                        <label style={{
                                            flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0',
                                            cursor: 'pointer', background: formData.is_pinned ? '#FEF2F2' : 'white'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.is_pinned}
                                                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                                            />
                                            <FiMapPin color={formData.is_pinned ? '#EF4444' : '#94A3B8'} />
                                            <span style={{ fontWeight: 600 }}>Ghim</span>
                                        </label>
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1E293B' }}>
                                            Nội dung *
                                        </label>
                                        <textarea
                                            className="form-input"
                                            placeholder="Nhập nội dung đầy đủ của tin tức... (Hỗ trợ Markdown)"
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            style={{ minHeight: '250px', borderRadius: '12px', resize: 'vertical', fontFamily: 'inherit' }}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #E2E8F0' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="btn btn-outline"
                                    style={{ flex: 1, height: '56px', borderRadius: '16px', fontSize: '1rem' }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 2, height: '56px', borderRadius: '16px', fontSize: '1rem', fontWeight: 700 }}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Đang lưu...' : (editingNews ? 'Cập nhật' : 'Tạo tin tức')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .hover-lift:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.01);
                    border-color: var(--color-primary) !important;
                }
            `}</style>
        </div>
    );
}
