import { useState, useEffect } from 'react';
import { supabase, COURSE_LEVELS } from '../lib/supabase';
import type { Course, CourseCategory, CourseLevel } from '../lib/supabase';
import {
    FiSearch, FiBookOpen, FiStar, FiPlay, FiClock, FiChevronRight,
    FiFilter, FiLayers
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const LEVEL_COLORS: Record<CourseLevel, string> = {
    beginner: '#10B981',
    intermediate: '#F59E0B',
    advanced: '#EF4444'
};

function CourseSkeleton() {
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="skeleton" style={{ height: '180px', borderRadius: 0 }} />
            <div style={{ padding: 'var(--spacing-lg)' }}>
                <div className="skeleton" style={{ height: '0.8rem', width: '30%', marginBottom: 'var(--spacing-sm)' }} />
                <div className="skeleton" style={{ height: '1.3rem', width: '80%', marginBottom: 'var(--spacing-sm)' }} />
                <div className="skeleton" style={{ height: '0.9rem', width: '100%', marginBottom: 'var(--spacing-xs)' }} />
                <div className="skeleton" style={{ height: '0.9rem', width: '60%', marginBottom: 'var(--spacing-md)' }} />
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--color-divider)' }}>
                    <div className="skeleton" style={{ height: '0.85rem', width: '60px' }} />
                    <div className="skeleton" style={{ height: '0.85rem', width: '80px' }} />
                </div>
            </div>
        </div>
    );
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [categories, setCategories] = useState<CourseCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [activeLevel, setActiveLevel] = useState<string>('all');

    useEffect(() => {
        fetchCategories();
        fetchCourses();
    }, []);

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
            const { data, error } = await supabase
                .from('courses')
                .select('*, category:course_categories(*)')
                .eq('status', 'published')
                .order('is_featured', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;

            const coursesWithCount = await Promise.all(
                (data || []).map(async (course) => {
                    const { count } = await supabase
                        .from('course_lessons')
                        .select('*', { count: 'exact', head: true })
                        .eq('course_id', course.id);
                    return { ...course, lessonCount: count || 0 };
                })
            );

            setCourses(coursesWithCount);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || course.category_id === activeCategory;
        const matchesLevel = activeLevel === 'all' || course.level === activeLevel;
        return matchesSearch && matchesCategory && matchesLevel;
    });

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} phút`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}p` : `${hours} giờ`;
    };

    return (
        <div className="container section">
            <div style={{ marginBottom: 'var(--spacing-2xl)', textAlign: 'center' }}>
                <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 'var(--spacing-sm)' }}>
                    Khám phá Khoá học kỹ năng
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', maxWidth: '700px', margin: '0 auto' }}>
                    Nâng cao kỹ năng chuyên môn và kiến thức thực tế để tự tin chinh phục nhà tuyển dụng
                </p>
            </div>

            {/* Filter Bar */}
            <div className="card-glass" style={{
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--radius-xl)',
                marginBottom: 'var(--spacing-xl)',
                display: 'flex',
                gap: 'var(--spacing-md)',
                flexWrap: 'wrap',
                alignItems: 'center',
                position: 'sticky',
                top: '90px',
                zIndex: 10
            }}>
                <div style={{ position: 'relative', flex: '1 1 250px', minWidth: '200px' }}>
                    <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Tìm kiếm khoá học..."
                        style={{ paddingLeft: '2.5rem' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-controls" style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <FiFilter color="var(--color-text-secondary)" />
                    <select
                        className="form-select"
                        style={{ width: 'auto', minWidth: '150px', flex: '1 1 140px' }}
                        value={activeCategory}
                        onChange={(e) => setActiveCategory(e.target.value)}
                    >
                        <option value="all">Tất cả danh mục</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <select
                        className="form-select"
                        style={{ width: 'auto', minWidth: '140px', flex: '1 1 130px' }}
                        value={activeLevel}
                        onChange={(e) => setActiveLevel(e.target.value)}
                    >
                        <option value="all">Mọi trình độ</option>
                        {Object.entries(COURSE_LEVELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Courses Grid */}
            {loading ? (
                <div className="courses-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <CourseSkeleton key={i} />
                    ))}
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="card text-center" style={{ padding: '4rem' }}>
                    <FiBookOpen size={48} style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-md)' }} />
                    <h3>Không tìm thấy khoá học nào</h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm của bạn.</p>
                </div>
            ) : (
                <div className="courses-grid">
                    {filteredCourses.map((course, index) => (
                        <Link
                            key={course.id}
                            to={`/courses/${course.id}`}
                            className="course-card hover-lift animate-fade-in-up"
                            style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
                        >
                            {/* Course Thumbnail */}
                            <div className="course-card-thumbnail" style={{
                                background: course.thumbnail_url ? `url(${course.thumbnail_url}) center/cover` : 'var(--gradient-primary)'
                            }}>
                                {course.is_featured && (
                                    <div className="course-badge-featured">
                                        <FiStar size={12} /> BÁN CHẠY
                                    </div>
                                )}
                                <div className="course-category-badge">
                                    {course.category?.name || 'Kỹ năng'}
                                </div>
                            </div>

                            {/* Course Info */}
                            <div className="course-card-body">
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-xs)',
                                    marginBottom: 'var(--spacing-xs)',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: LEVEL_COLORS[course.level]
                                }}>
                                    <FiLayers size={14} /> {COURSE_LEVELS[course.level]}
                                </div>

                                <h3 className="course-card-title">
                                    {course.title}
                                </h3>

                                <p className="course-card-description">
                                    {course.description}
                                </p>

                                <div className="course-card-footer">
                                    <div className="course-card-meta">
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FiPlay size={14} /> {(course as any).lessonCount} bài
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FiClock size={14} /> {formatDuration(course.duration_minutes)}
                                        </span>
                                    </div>
                                    <FiChevronRight size={18} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
