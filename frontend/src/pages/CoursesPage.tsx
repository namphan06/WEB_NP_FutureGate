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

            // Fetch lesson counts
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
            {/* Header Section */}
            <div style={{ marginBottom: 'var(--spacing-2xl)', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 'var(--spacing-sm)' }}>
                    Khám phá Khoá học kỹ năng
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
                    Nâng cao kỹ năng chuyên môn và kiến thức thực tế để tự tin chinh phục nhà tuyển dụng
                </p>
            </div>

            {/* Filter Bar */}
            <div style={{
                background: 'white',
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)',
                marginBottom: 'var(--spacing-xl)',
                display: 'flex',
                gap: 'var(--spacing-md)',
                flexWrap: 'wrap',
                alignItems: 'center',
                position: 'sticky',
                top: '90px',
                zIndex: 10
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
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

                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                    <FiFilter color="var(--color-text-secondary)" />
                    <select
                        className="form-select"
                        style={{ width: '180px' }}
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
                        style={{ width: '160px' }}
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
                <div className="text-center" style={{ padding: '4rem' }}>
                    <div className="loading">Đang tải danh sách khoá học...</div>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="card text-center" style={{ padding: '4rem' }}>
                    <FiBookOpen size={48} style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--spacing-md)' }} />
                    <h3>Không tìm thấy khoá học nào</h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm của bạn.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 'var(--spacing-xl)'
                }}>
                    {filteredCourses.map(course => (
                        <Link
                            key={course.id}
                            to={`/courses/${course.id}`}
                            className="card hover-lift"
                            style={{
                                padding: 0,
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                textDecoration: 'none',
                                color: 'inherit'
                            }}
                        >
                            {/* Course Thumbnail */}
                            <div style={{
                                height: '180px',
                                position: 'relative',
                                background: course.thumbnail_url ? `url(${course.thumbnail_url}) center/cover` : 'var(--gradient-primary)'
                            }}>
                                {course.is_featured && (
                                    <div style={{
                                        position: 'absolute', top: '12px', left: '12px',
                                        background: 'var(--color-warning)', color: 'white',
                                        padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                                        display: 'flex', alignItems: 'center', gap: '4px'
                                    }}>
                                        <FiStar size={12} /> BÁN CHẠY
                                    </div>
                                )}
                                <div style={{
                                    position: 'absolute', bottom: '12px', left: '12px',
                                    background: 'rgba(15, 23, 42, 0.8)', color: 'white',
                                    padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
                                    backdropFilter: 'blur(4px)'
                                }}>
                                    {course.category?.name || 'Kỹ năng'}
                                </div>
                            </div>

                            {/* Course Info */}
                            <div style={{ padding: 'var(--spacing-lg)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-sm)',
                                    marginBottom: 'var(--spacing-xs)',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: LEVEL_COLORS[course.level]
                                }}>
                                    <FiLayers size={14} /> {COURSE_LEVELS[course.level]}
                                </div>

                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 800,
                                    marginBottom: 'var(--spacing-sm)',
                                    lineHeight: '1.4',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {course.title}
                                </h3>

                                <p style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--color-text-secondary)',
                                    marginBottom: 'var(--spacing-md)',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    lineHeight: '1.5'
                                }}>
                                    {course.description}
                                </p>

                                <div style={{
                                    marginTop: 'auto',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: 'var(--spacing-md)',
                                    borderTop: '1px solid var(--color-divider)',
                                    fontSize: '0.85rem',
                                    color: 'var(--color-text-secondary)'
                                }}>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
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
