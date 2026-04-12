import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, COURSE_LEVELS } from '../lib/supabase';
import type { Course, CourseLesson } from '../lib/supabase';
import {
    FiArrowLeft, FiPlay, FiBook, FiCheckCircle,
    FiMessageCircle, FiUnlock
} from 'react-icons/fi';

function DetailSkeleton() {
    return (
        <div className="container section">
            <div className="skeleton" style={{ height: '1rem', width: '250px', marginBottom: 'var(--spacing-xl)' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-2xl)' }}>
                <div>
                    <div className="skeleton" style={{ aspectRatio: '16/9', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--spacing-xl)' }} />
                    <div className="skeleton" style={{ height: '2rem', width: '60%', marginBottom: 'var(--spacing-sm)' }} />
                    <div className="skeleton" style={{ height: '1rem', width: '40%', marginBottom: 'var(--spacing-xl)' }} />
                    <div className="card">
                        <div className="skeleton" style={{ height: '1.3rem', width: '30%', marginBottom: 'var(--spacing-md)' }} />
                        <div className="skeleton skeleton-text" />
                        <div className="skeleton skeleton-text" />
                        <div className="skeleton skeleton-text" style={{ width: '70%' }} />
                    </div>
                </div>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="skeleton" style={{ height: '80px', borderRadius: 0 }} />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--color-divider)', display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                            <div className="skeleton" style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div className="skeleton" style={{ height: '0.9rem', width: '80%', marginBottom: '4px' }} />
                                <div className="skeleton" style={{ height: '0.75rem', width: '40%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

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
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('*, category:course_categories(*)')
                .eq('id', id)
                .single();

            if (courseError) throw courseError;
            setCourse(courseData);

            const { data: lessonsData, error: lessonsError } = await supabase
                .from('course_lessons')
                .select('*')
                .eq('course_id', id)
                .order('order');

            if (lessonsError) throw lessonsError;
            setLessons(lessonsData || []);

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

    if (loading) return <DetailSkeleton />;

    if (!course) return (
        <div className="container section text-center">
            <h3>Khoá học không tồn tại</h3>
            <Link to="/courses" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}> Quay lại danh sách </Link>
        </div>
    );

    const videoId = activeLesson ? extractYouTubeId(activeLesson.youtube_url) : null;

    return (
        <div className="container section">
            <Link to="/courses" className="back-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', textDecoration: 'none', marginBottom: 'var(--spacing-xl)', fontWeight: 600 }}>
                <FiArrowLeft /> Quay lại danh sách khoá học
            </Link>

            <div className="course-detail-grid">
                {/* Main Content: Video & Info */}
                <div className="course-detail-main">
                    {/* Video Player Area - 16:9 responsive */}
                    <div className="video-wrapper">
                        {videoId ? (
                            <iframe
                                className="video-iframe"
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                                title={activeLesson?.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="video-placeholder">
                                <FiPlay size={60} style={{ opacity: 0.5 }} />
                                <p>Chọn bài học để bắt đầu xem</p>
                            </div>
                        )}
                    </div>

                    <div className="course-detail-header">
                        <div>
                            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, marginBottom: 'var(--spacing-sm)' }}>
                                {activeLesson?.title || course.title}
                            </h1>
                            <div className="course-detail-meta">
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

                    <div className="card course-description-card">
                        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Mô tả khoá học</h3>
                        <p className="course-description-text">
                            {course.description}
                        </p>
                        {activeLesson?.description && (
                            <div className="lesson-detail-section">
                                <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Chi tiết bài học</h4>
                                <p style={{ lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{activeLesson.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    {course.tags && course.tags.length > 0 && (
                        <div className="course-tags">
                            {course.tags.map(tag => (
                                <span key={tag} className="badge badge-outline">#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar: Lesson List */}
                <aside className="course-detail-sidebar">
                    <div className="card lesson-list-card">
                        <div className="lesson-list-header">
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Nội dung bài học</h3>
                            <p style={{ margin: 'var(--spacing-xs) 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                {lessons.length} bài học • {formatDuration(course.duration_minutes)}
                            </p>
                        </div>
                        <div className="lesson-list-scroll">
                            {lessons.map((lesson, idx) => (
                                <div
                                    key={lesson.id}
                                    onClick={() => setActiveLesson(lesson)}
                                    className={`lesson-item ${activeLesson?.id === lesson.id ? 'lesson-item-active' : ''}`}
                                >
                                    <div className={`lesson-number ${activeLesson?.id === lesson.id ? 'lesson-number-active' : ''}`}>
                                        {idx + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className={`lesson-title ${activeLesson?.id === lesson.id ? 'lesson-title-active' : ''}`}>
                                            {lesson.title}
                                        </div>
                                        <div className="lesson-duration">
                                            <FiPlay size={12} /> {lesson.duration_minutes} phút
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card course-support-card">
                        <h4 style={{ margin: 0, marginBottom: 'var(--spacing-xs)' }}>Hỗ trợ học tập</h4>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: 'var(--spacing-md)' }}>Tham gia cộng đồng học viên để cùng thảo luận và giải đáp thắc mắc.</p>
                        <button className="btn btn-support-join">
                            <FiMessageCircle /> Tham gia nhóm
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
