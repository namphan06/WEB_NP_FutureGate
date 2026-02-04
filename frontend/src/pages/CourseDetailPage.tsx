import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, COURSE_LEVELS } from '../lib/supabase';
import type { Course, CourseLesson } from '../lib/supabase';
import {
    FiArrowLeft, FiPlay, FiBook, FiCheckCircle,
    FiMessageCircle, FiUnlock
} from 'react-icons/fi';

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [lessons, setLessons] = useState<CourseLesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);

    useEffect(() => {
        if (id) fetchCourseDetails();
    }, [id]);

    const fetchCourseDetails = async () => {
        setLoading(true);
        try {
            // Fetch course
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('*, category:course_categories(*)')
                .eq('id', id)
                .single();

            if (courseError) throw courseError;
            setCourse(courseData);

            // Fetch lessons
            const { data: lessonsData, error: lessonsError } = await supabase
                .from('course_lessons')
                .select('*')
                .eq('course_id', id)
                .order('order');

            if (lessonsError) throw lessonsError;
            setLessons(lessonsData || []);

            // Set first lesson/preview by default
            if (lessonsData && lessonsData.length > 0) {
                setActiveLesson(lessonsData[0]);
            }
        } catch (error) {
            console.error('Error fetching course details:', error);
        } finally {
            setLoading(false);
        }
    };

    const extractYouTubeId = (url: string): string | null => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} phút`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}p` : `${hours} giờ`;
    };

    if (loading) return (
        <div className="container section text-center">
            <div className="loading">Đang tải nội dung khoá học...</div>
        </div>
    );

    if (!course) return (
        <div className="container section text-center">
            <h3>Khoá học không tồn tại</h3>
            <Link to="/courses" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}> Quay lại danh sách </Link>
        </div>
    );

    const videoId = activeLesson ? extractYouTubeId(activeLesson.youtube_url) : null;

    return (
        <div className="container section">
            <Link to="/courses" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', textDecoration: 'none', marginBottom: 'var(--spacing-xl)', fontWeight: 600 }}>
                <FiArrowLeft /> Quay lại danh sách khoá học
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: 'var(--spacing-2xl)' }}>
                {/* Main Content: Video & Info */}
                <div>
                    {/* Video Player Area */}
                    <div style={{
                        background: '#000',
                        aspectRatio: '16/9',
                        borderRadius: 'var(--radius-xl)',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-lg)',
                        marginBottom: 'var(--spacing-xl)',
                        position: 'relative'
                    }}>
                        {videoId ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                                title={activeLesson?.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                <FiPlay size={60} style={{ opacity: 0.5 }} />
                                <p>Chọn bài học để bắt đầu xem</p>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-lg)' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 'var(--spacing-sm)' }}>
                                {activeLesson?.title || course.title}
                            </h1>
                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FiBook size={16} /> {course.category?.name}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FiUnlock size={16} /> {COURSE_LEVELS[course.level]}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FiCheckCircle size={16} /> Miễn phí
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Mô tả khoá học</h3>
                        <p style={{ lineHeight: 1.7, color: 'var(--color-text-secondary)', whiteSpace: 'pre-line' }}>
                            {course.description}
                        </p>
                        {activeLesson?.description && (
                            <div style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--color-divider)' }}>
                                <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Chi tiết bài học</h4>
                                <p style={{ lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{activeLesson.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    {course.tags && course.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-xl)' }}>
                            {course.tags.map(tag => (
                                <span key={tag} className="badge badge-outline">#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar: Lesson List */}
                <div style={{ position: 'sticky', top: '90px', height: 'fit-content' }}>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--color-divider)', background: 'var(--color-background-light)' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Nội dung bài học</h3>
                            <p style={{ margin: 'var(--spacing-xs) 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                {lessons.length} bài học • {formatDuration(course.duration_minutes)}
                            </p>
                        </div>
                        <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                            {lessons.map((lesson, idx) => (
                                <div
                                    key={lesson.id}
                                    onClick={() => setActiveLesson(lesson)}
                                    style={{
                                        padding: 'var(--spacing-md) var(--spacing-lg)',
                                        borderBottom: '1px solid var(--color-divider)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: activeLesson?.id === lesson.id ? 'var(--color-primary-light)' : 'transparent',
                                        borderLeft: `4px solid ${activeLesson?.id === lesson.id ? 'var(--color-primary)' : 'transparent'}`,
                                        display: 'flex',
                                        gap: 'var(--spacing-md)',
                                        alignItems: 'center'
                                    }}
                                    className="hover-bg-light"
                                >
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: activeLesson?.id === lesson.id ? 'var(--color-primary)' : 'var(--color-background)',
                                        color: activeLesson?.id === lesson.id ? 'white' : 'var(--color-text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        flexShrink: 0
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '0.9375rem',
                                            fontWeight: activeLesson?.id === lesson.id ? 700 : 500,
                                            lineHeight: 1.4,
                                            marginBottom: '2px'
                                        }}>
                                            {lesson.title}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                            <FiPlay size={12} /> {lesson.duration_minutes} phút
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ marginTop: 'var(--spacing-lg)', background: 'var(--gradient-primary)', color: 'white' }}>
                        <h4 style={{ margin: 0, marginBottom: 'var(--spacing-xs)' }}>Hỗ trợ học tập</h4>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: 'var(--spacing-md)' }}>Tham gia cộng đồng học viên để cùng thảo luận và giải đáp thắc mắc.</p>
                        <button className="btn" style={{ background: 'white', color: 'var(--color-primary)', width: '100%', fontWeight: 700 }}>
                            <FiMessageCircle /> Tham gia nhóm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
