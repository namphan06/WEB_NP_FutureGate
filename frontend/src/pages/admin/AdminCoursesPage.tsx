import { useState, useEffect } from 'react';
import { supabase, COURSE_LEVELS, COURSE_STATUS_LABELS } from '../../lib/supabase';
import type { Course, CourseCategory, CourseLesson, CourseLevel, CourseStatus } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
    FiX, FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiClock, FiBookOpen,
    FiStar, FiPlay, FiExternalLink, FiChevronDown, FiChevronUp, FiYoutube
} from 'react-icons/fi';
import { Navigate } from 'react-router-dom';

// Level colors
const LEVEL_COLORS: Record<CourseLevel, string> = {
    beginner: '#10B981',
    intermediate: '#F59E0B',
    advanced: '#EF4444'
};

// Status colors
const STATUS_COLORS: Record<CourseStatus, { bg: string; text: string }> = {
    draft: { bg: '#FEF3C7', text: '#D97706' },
    published: { bg: '#D1FAE5', text: '#059669' },
    archived: { bg: '#E5E7EB', text: '#6B7280' }
};

// YouTube URL helpers
const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const getYouTubeThumbnail = (url: string): string => {
    const videoId = extractYouTubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
};

interface LessonFormData {
    id?: string;
    title: string;
    description: string;
    youtube_url: string;
    duration_minutes: number;
    is_preview: boolean;
    order: number;
}

export default function AdminCoursesPage() {
    const { profile } = useAuth();
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | CourseStatus>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState<Course[]>([]);
    const [categories, setCategories] = useState<CourseCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        thumbnail_url: '',
        category_id: '',
        level: 'beginner' as CourseLevel,
        tags: [] as string[],
        status: 'draft' as CourseStatus,
        is_featured: false
    });
    const [tagInput, setTagInput] = useState('');
    const [lessons, setLessons] = useState<LessonFormData[]>([]);
    const [expandedLessons, setExpandedLessons] = useState(true);

    // Only admins can access
    if (profile?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        fetchCategories();
        fetchCourses();
    }, [activeCategory, statusFilter]);

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('course_categories')
            .select('*')
            .eq('is_active', true)
            .order('order');
        if (data) setCategories(data);
    };

    const fetchCourses = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('courses')
                .select('*, category:course_categories(*)')
                .order('created_at', { ascending: false });

            if (activeCategory !== 'all') {
                query = query.eq('category_id', activeCategory);
            }
            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;
            if (error) throw error;

            // Fetch lesson counts for each course
            const coursesWithLessons = await Promise.all(
                (data || []).map(async (course) => {
                    const { count } = await supabase
                        .from('course_lessons')
                        .select('*', { count: 'exact', head: true })
                        .eq('course_id', course.id);
                    return { ...course, lessonCount: count || 0 };
                })
            );

            setCourses(coursesWithLessons);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseLessons = async (courseId: string): Promise<CourseLesson[]> => {
        const { data } = await supabase
            .from('course_lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('order');
        return data || [];
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            thumbnail_url: '',
            category_id: categories[0]?.id || '',
            level: 'beginner',
            tags: [],
            status: 'draft',
            is_featured: false
        });
        setTagInput('');
        setLessons([]);
        setEditingCourse(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = async (course: Course) => {
        setEditingCourse(course);
        setFormData({
            title: course.title,
            description: course.description || '',
            thumbnail_url: course.thumbnail_url || '',
            category_id: course.category_id || '',
            level: course.level,
            tags: course.tags || [],
            status: course.status,
            is_featured: course.is_featured
        });

        // Fetch lessons
        const courseLessons = await fetchCourseLessons(course.id);
        setLessons(courseLessons.map(l => ({
            id: l.id,
            title: l.title,
            description: l.description || '',
            youtube_url: l.youtube_url,
            duration_minutes: l.duration_minutes,
            is_preview: l.is_preview,
            order: l.order
        })));

        setShowModal(true);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    };

    const addLesson = () => {
        setLessons([...lessons, {
            title: '',
            description: '',
            youtube_url: '',
            duration_minutes: 0,
            is_preview: false,
            order: lessons.length
        }]);
    };

    const updateLesson = (index: number, field: keyof LessonFormData, value: any) => {
        const updated = [...lessons];
        updated[index] = { ...updated[index], [field]: value };
        setLessons(updated);
    };

    const removeLesson = (index: number) => {
        setLessons(lessons.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert('Vui lòng nhập tiêu đề khoá học');
            return;
        }

        setSaving(true);
        try {
            let courseId = editingCourse?.id;

            if (editingCourse) {
                // Update course
                const { error } = await supabase
                    .from('courses')
                    .update({
                        title: formData.title,
                        description: formData.description || null,
                        thumbnail_url: formData.thumbnail_url || null,
                        category_id: formData.category_id || null,
                        level: formData.level,
                        tags: formData.tags,
                        status: formData.status,
                        is_featured: formData.is_featured
                    })
                    .eq('id', editingCourse.id);
                if (error) throw error;
            } else {
                // Create course
                const { data, error } = await supabase
                    .from('courses')
                    .insert({
                        title: formData.title,
                        description: formData.description || null,
                        thumbnail_url: formData.thumbnail_url || null,
                        category_id: formData.category_id || null,
                        level: formData.level,
                        tags: formData.tags,
                        status: formData.status,
                        is_featured: formData.is_featured,
                        author_id: profile?.id
                    })
                    .select()
                    .single();
                if (error) throw error;
                courseId = data.id;
            }

            // Handle lessons
            if (courseId) {
                // Delete removed lessons
                if (editingCourse) {
                    const existingIds = lessons.filter(l => l.id).map(l => l.id);
                    await supabase
                        .from('course_lessons')
                        .delete()
                        .eq('course_id', courseId)
                        .not('id', 'in', `(${existingIds.join(',')})`);
                }

                // Upsert lessons
                for (let i = 0; i < lessons.length; i++) {
                    const lesson = lessons[i];
                    if (lesson.id) {
                        await supabase
                            .from('course_lessons')
                            .update({
                                title: lesson.title,
                                description: lesson.description || null,
                                youtube_url: lesson.youtube_url,
                                duration_minutes: lesson.duration_minutes,
                                is_preview: lesson.is_preview,
                                order: i
                            })
                            .eq('id', lesson.id);
                    } else {
                        await supabase
                            .from('course_lessons')
                            .insert({
                                course_id: courseId,
                                title: lesson.title,
                                description: lesson.description || null,
                                youtube_url: lesson.youtube_url,
                                duration_minutes: lesson.duration_minutes,
                                is_preview: lesson.is_preview,
                                order: i
                            });
                    }
                }
            }

            alert(editingCourse ? 'Đã cập nhật khoá học!' : 'Đã tạo khoá học mới!');
            setShowModal(false);
            resetForm();
            fetchCourses();
        } catch (error) {
            console.error('Error saving course:', error);
            alert('Có lỗi xảy ra khi lưu khoá học');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (course: Course) => {
        if (!confirm(`Bạn có chắc muốn xoá khoá học "${course.title}"?\nTất cả bài học sẽ bị xoá.`)) return;

        try {
            const { error } = await supabase.from('courses').delete().eq('id', course.id);
            if (error) throw error;
            alert('Đã xoá khoá học!');
            fetchCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Có lỗi xảy ra khi xoá');
        }
    };

    const toggleFeatured = async (course: Course) => {
        await supabase
            .from('courses')
            .update({ is_featured: !course.is_featured })
            .eq('id', course.id);
        fetchCourses();
    };

    const filteredCourses = courses.filter(course =>
        course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} phút`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}p` : `${hours} giờ`;
    };

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '2.5rem 50px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1E293B', marginBottom: '0.5rem' }}>
                        Quản lý khoá học
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '1.1rem', margin: 0 }}>
                        Tạo và quản lý các khoá học cho người dùng
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="btn btn-primary"
                    style={{ height: '56px', borderRadius: '16px', padding: '0 2rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <FiPlus size={20} /> Thêm khoá học
                </button>
            </div>

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setActiveCategory('all')}
                    style={{
                        padding: '0.75rem 1.25rem', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer',
                        background: activeCategory === 'all' ? 'var(--color-primary)' : 'white',
                        color: activeCategory === 'all' ? 'white' : '#64748B',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s'
                    }}
                >
                    Tất cả
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                            padding: '0.75rem 1.25rem', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer',
                            background: activeCategory === cat.id ? cat.color : 'white',
                            color: activeCategory === cat.id ? 'white' : '#64748B',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid #E2E8F0', marginBottom: '2rem', background: 'white' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <FiSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Tìm theo tiêu đề, mô tả..."
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
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="draft">Bản nháp</option>
                            <option value="published">Đã xuất bản</option>
                            <option value="archived">Đã lưu trữ</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Courses Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <div className="loading">Đang tải danh sách khoá học...</div>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '5rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                    <FiBookOpen size={60} style={{ color: '#E2E8F0', marginBottom: '1.5rem' }} />
                    <h3 style={{ color: '#1E293B', marginBottom: '0.5rem' }}>Chưa có khoá học nào</h3>
                    <p style={{ color: '#64748B' }}>Bắt đầu bằng cách tạo khoá học đầu tiên.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
                    {filteredCourses.map(course => (
                        <div
                            key={course.id}
                            className="card hover-lift"
                            style={{ borderRadius: '24px', border: '1px solid #E2E8F0', background: 'white', overflow: 'hidden', cursor: 'pointer' }}
                            onClick={() => openEditModal(course)}
                        >
                            {/* Thumbnail */}
                            <div style={{
                                height: '180px',
                                background: course.thumbnail_url ? `url(${course.thumbnail_url}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                position: 'relative'
                            }}>
                                {course.is_featured && (
                                    <div style={{
                                        position: 'absolute', top: '1rem', left: '1rem',
                                        background: '#F59E0B', color: 'white', padding: '4px 10px',
                                        borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                                        display: 'flex', alignItems: 'center', gap: '4px'
                                    }}>
                                        <FiStar size={12} /> Nổi bật
                                    </div>
                                )}
                                <div style={{
                                    position: 'absolute', top: '1rem', right: '1rem',
                                    background: STATUS_COLORS[course.status].bg,
                                    color: STATUS_COLORS[course.status].text,
                                    padding: '4px 10px', borderRadius: '8px',
                                    fontSize: '0.75rem', fontWeight: 700
                                }}>
                                    {COURSE_STATUS_LABELS[course.status]}
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    {course.category && (
                                        <span style={{
                                            background: course.category.color + '20',
                                            color: course.category.color,
                                            padding: '4px 10px', borderRadius: '8px',
                                            fontSize: '0.75rem', fontWeight: 600
                                        }}>
                                            {course.category.name}
                                        </span>
                                    )}
                                    <span style={{
                                        background: LEVEL_COLORS[course.level] + '20',
                                        color: LEVEL_COLORS[course.level],
                                        padding: '4px 10px', borderRadius: '8px',
                                        fontSize: '0.75rem', fontWeight: 600
                                    }}>
                                        {COURSE_LEVELS[course.level]}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                                    {course.title}
                                </h3>

                                {course.description && (
                                    <p style={{
                                        color: '#64748B', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5,
                                        overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any
                                    }}>
                                        {course.description}
                                    </p>
                                )}

                                <div style={{ display: 'flex', gap: '1.5rem', color: '#64748B', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FiPlay size={14} /> {(course as any).lessonCount || 0} bài học
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FiClock size={14} /> {formatDuration(course.duration_minutes)}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openEditModal(course); }}
                                        className="btn btn-outline"
                                        style={{ flex: 1, height: '44px', borderRadius: '12px' }}
                                    >
                                        <FiEdit2 size={16} /> Sửa
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleFeatured(course); }}
                                        className="btn btn-outline"
                                        style={{
                                            width: '44px', height: '44px', borderRadius: '12px', padding: 0,
                                            color: course.is_featured ? '#F59E0B' : '#94A3B8',
                                            borderColor: course.is_featured ? '#FEF3C7' : undefined,
                                            background: course.is_featured ? '#FFFBEB' : undefined
                                        }}
                                    >
                                        <FiStar size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(course); }}
                                        className="btn btn-outline"
                                        style={{ width: '44px', height: '44px', borderRadius: '12px', padding: 0, color: '#EF4444', borderColor: '#FEE2E2', background: '#FEF2F2' }}
                                    >
                                        <FiTrash2 size={18} />
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
                    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
                    zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem', overflowY: 'auto'
                }}>
                    <div style={{
                        background: 'white', width: '100%', maxWidth: '900px', borderRadius: '32px',
                        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', marginTop: '2rem', marginBottom: '2rem'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '2rem', background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                            color: 'white', position: 'relative'
                        }}>
                            <button
                                onClick={() => { setShowModal(false); resetForm(); }}
                                style={{
                                    position: 'absolute', top: '1.5rem', right: '1.5rem',
                                    background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                                    width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem'
                                }}
                            >×</button>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
                                {editingCourse ? 'Chỉnh sửa khoá học' : 'Tạo khoá học mới'}
                            </h2>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                {/* Title */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                                        Tiêu đề khoá học *
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="VD: Kỹ năng giao tiếp nơi công sở"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        style={{ height: '54px', borderRadius: '12px' }}
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                                        Danh mục
                                    </label>
                                    <select
                                        className="form-select"
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        style={{ height: '54px', borderRadius: '12px' }}
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Level */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                                        Cấp độ
                                    </label>
                                    <select
                                        className="form-select"
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value as CourseLevel })}
                                        style={{ height: '54px', borderRadius: '12px' }}
                                    >
                                        {Object.entries(COURSE_LEVELS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                                        Trạng thái
                                    </label>
                                    <select
                                        className="form-select"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as CourseStatus })}
                                        style={{ height: '54px', borderRadius: '12px' }}
                                    >
                                        {Object.entries(COURSE_STATUS_LABELS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Featured */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <input
                                        type="checkbox"
                                        id="is_featured"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                    <label htmlFor="is_featured" style={{ fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                                        Khoá học nổi bật
                                    </label>
                                </div>

                                {/* Description */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                                        Mô tả
                                    </label>
                                    <textarea
                                        className="form-input"
                                        placeholder="Mô tả ngắn về khoá học..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        style={{ minHeight: '100px', borderRadius: '12px', resize: 'vertical' }}
                                    />
                                </div>

                                {/* Thumbnail URL */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
                                        Ảnh thumbnail (URL)
                                    </label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        placeholder="https://..."
                                        value={formData.thumbnail_url}
                                        onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                        style={{ height: '54px', borderRadius: '12px' }}
                                    />
                                </div>

                                {/* Tags */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
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
                                        <button type="button" onClick={handleAddTag} className="btn btn-outline" style={{ height: '44px', borderRadius: '12px' }}>
                                            Thêm
                                        </button>
                                    </div>
                                    {formData.tags.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {formData.tags.map(tag => (
                                                <span key={tag} style={{
                                                    background: '#E0E7FF', color: '#4F46E5', padding: '4px 12px',
                                                    borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500,
                                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                                }}>
                                                    {tag}
                                                    <FiX style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(tag)} />
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Lessons Section */}
                            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1.5rem', marginTop: '1rem' }}>
                                <div
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', cursor: 'pointer' }}
                                    onClick={() => setExpandedLessons(!expandedLessons)}
                                >
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FiYoutube color="#FF0000" /> Bài học ({lessons.length})
                                    </h3>
                                    {expandedLessons ? <FiChevronUp /> : <FiChevronDown />}
                                </div>

                                {expandedLessons && (
                                    <>
                                        {lessons.map((lesson, index) => (
                                            <div key={index} style={{
                                                background: '#F8FAFC', borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem',
                                                border: '1px solid #E2E8F0'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                    <span style={{ fontWeight: 700, color: '#475569' }}>Bài {index + 1}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLesson(index)}
                                                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <div style={{ gridColumn: '1 / -1' }}>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            placeholder="Tiêu đề bài học *"
                                                            value={lesson.title}
                                                            onChange={(e) => updateLesson(index, 'title', e.target.value)}
                                                            style={{ height: '44px', borderRadius: '10px' }}
                                                            required
                                                        />
                                                    </div>
                                                    <div style={{ gridColumn: '1 / -1' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <input
                                                                type="url"
                                                                className="form-input"
                                                                placeholder="Link YouTube (https://youtube.com/watch?v=...)"
                                                                value={lesson.youtube_url}
                                                                onChange={(e) => updateLesson(index, 'youtube_url', e.target.value)}
                                                                style={{ flex: 1, height: '44px', borderRadius: '10px' }}
                                                                required
                                                            />
                                                            {extractYouTubeId(lesson.youtube_url) && (
                                                                <a
                                                                    href={lesson.youtube_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn btn-outline"
                                                                    style={{ height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <FiExternalLink /> Xem
                                                                </a>
                                                            )}
                                                        </div>
                                                        {extractYouTubeId(lesson.youtube_url) && (
                                                            <div style={{ marginTop: '0.75rem' }}>
                                                                <img
                                                                    src={getYouTubeThumbnail(lesson.youtube_url)}
                                                                    alt="Video thumbnail"
                                                                    style={{ width: '200px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="number"
                                                            className="form-input"
                                                            placeholder="Thời lượng (phút)"
                                                            value={lesson.duration_minutes || ''}
                                                            onChange={(e) => updateLesson(index, 'duration_minutes', parseInt(e.target.value) || 0)}
                                                            style={{ height: '44px', borderRadius: '10px' }}
                                                            min="0"
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <input
                                                            type="checkbox"
                                                            id={`preview-${index}`}
                                                            checked={lesson.is_preview}
                                                            onChange={(e) => updateLesson(index, 'is_preview', e.target.checked)}
                                                            style={{ width: '18px', height: '18px' }}
                                                        />
                                                        <label htmlFor={`preview-${index}`} style={{ color: '#475569', cursor: 'pointer' }}>
                                                            Cho xem thử miễn phí
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={addLesson}
                                            className="btn btn-outline"
                                            style={{
                                                width: '100%', height: '54px', borderRadius: '12px',
                                                borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                            }}
                                        >
                                            <FiPlus /> Thêm bài học
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Submit Buttons */}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="btn btn-outline"
                                    style={{ flex: 1, height: '56px', borderRadius: '16px', fontWeight: 700 }}
                                >
                                    Huỷ
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 2, height: '56px', borderRadius: '16px', fontWeight: 700 }}
                                    disabled={saving}
                                >
                                    {saving ? 'Đang lưu...' : (editingCourse ? 'Cập nhật' : 'Tạo khoá học')}
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
