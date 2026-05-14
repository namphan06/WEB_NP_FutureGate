import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiTrash2, FiEdit, FiPlus, FiDownload, FiFileText, FiX } from 'react-icons/fi';
import TemplateGallery from '../../components/cv/TemplateGallery';
import { getEmptyCVData } from '../../components/cv/utils';
import CVRenderer from '../../components/cv/CVRenderer';

interface CV {
    id: string;
    title: string;
    data: any;
    mcv: string;
    type?: string;
    file_url?: string;
    created_at: string;
    updated_at: string;
}

export default function CVManagementPage() {
    const { user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [cvs, setCvs] = useState<CV[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCVTitle, setNewCVTitle] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('CV001');

    const syncProfileCvIds = async (updater: (currentIds: string[]) => string[]) => {
        if (!user) return;

        const currentIds = Array.isArray(profile?.metadata?.cv_ids)
            ? profile?.metadata?.cv_ids.filter(Boolean)
            : [];

        const nextIds = Array.from(new Set(updater(currentIds)));

        const { error } = await supabase
            .from('profiles')
            .update({
                metadata: {
                    ...(profile?.metadata || {}),
                    cv_ids: nextIds
                }
            })
            .eq('id', user.id);

        if (error) {
            console.warn('Failed to sync profile cv_ids:', error.message);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchCVs();
        }
    }, [authLoading, user?.id, profile?.id]);

    useEffect(() => {
        const shouldOpenCreateModal =
            location.pathname === '/candidate/cv/create' ||
            location.pathname === '/cv-templates';

        setShowCreateModal(shouldOpenCreateModal);
    }, [location.pathname]);

    const closeCreateModal = () => {
        setShowCreateModal(false);
        if (location.pathname === '/candidate/cv/create' || location.pathname === '/cv-templates') {
            navigate('/candidate/cv');
        }
    };

    const fetchCVs = async () => {
        if (!user) {
            setCvs([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setFetchError(null);

            const { data, error } = await supabase
                .from('cv_templates')
                .select('id, title, data, mcv, type, created_at, updated_at')
                .eq('user_create', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            let finalCVs = data || [];

            const metadataCvIds = Array.isArray(profile?.metadata?.cv_ids)
                ? profile?.metadata?.cv_ids.filter(Boolean)
                : [];

            if (finalCVs.length === 0 && metadataCvIds.length > 0) {
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('cv_templates')
                    .select('id, title, data, mcv, type, created_at, updated_at')
                    .in('id', metadataCvIds)
                    .order('updated_at', { ascending: false });

                if (fallbackError) throw fallbackError;
                finalCVs = fallbackData || [];
            }

            setCvs(finalCVs);
        } catch (error) {
            console.error('Error fetching CVs:', error);
            setFetchError('Không thể tải danh sách CV. Vui lòng thử lại.');
            setCvs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCV = async () => {
        if (!user || !newCVTitle.trim()) return;

        try {
            const { data: newCv, error } = await supabase
                .from('cv_templates')
                .insert([
                    {
                        user_create: user.id,
                        title: newCVTitle,
                        mcv: selectedTemplate,
                        data: getEmptyCVData(selectedTemplate)
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            await syncProfileCvIds((ids) => [...ids, newCv.id]);

            setNewCVTitle('');
            setShowCreateModal(false);

            // Redirect to editor
            navigate(`/candidate/cv/${newCv.id}/edit`);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const getUploadedFileUrl = (cv: CV) => {
        return cv.file_url || cv.data?.file_url || cv.data?.fileUrl || null;
    };

    const isUploadedCV = (cv: CV) => {
        const mcvCode = (cv.mcv || cv.data?.mcv || '').toUpperCase();
        const typeCode = (cv.type || cv.data?.type || '').toLowerCase();
        return mcvCode === 'UPLOAD' || typeCode === 'upload' || Boolean(getUploadedFileUrl(cv));
    };

    const openCV = (cv: CV) => {
        if (isUploadedCV(cv)) {
            const fileUrl = getUploadedFileUrl(cv);
            if (fileUrl) {
                window.open(fileUrl, '_blank', 'noopener,noreferrer');
            } else {
                alert('CV upload chưa có file_url hợp lệ.');
            }
            return;
        }

        navigate(`/candidate/cv/${cv.id}/edit`);
    };

    const handleDeleteCV = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (!confirm('Bạn có chắc muốn xóa CV này?')) return;

        try {
            const { error } = await supabase
                .from('cv_templates')
                .delete()
                .eq('id', id)
                .eq('user_create', user?.id);

            if (error) throw error;

            await syncProfileCvIds((ids) => ids.filter((cvId) => cvId !== id));
            fetchCVs();
        } catch (error: any) {
            alert(error.message);
        }
    };

    if (loading) {
        return (
            <div className="container section">
                <div className="loading text-center">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="container section min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý CV</h1>
                    <p className="text-slate-500">
                        Nâng tầm sự nghiệp với các mẫu CV chuyên nghiệp nhất
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary shadow-lg shadow-blue-200"
                >
                    <FiPlus size={20} />
                    Tạo CV mới
                </button>
            </div>

            {fetchError ? (
                <div className="card text-center py-10">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Tải danh sách CV thất bại</h3>
                    <p className="text-slate-500 mb-6">{fetchError}</p>
                    <button onClick={fetchCVs} className="btn btn-primary">Thử lại</button>
                </div>
            ) : cvs.length === 0 ? (
                <div className="card text-center py-20 bg-slate-50/50 border-dashed border-2">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <FiFileText size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có CV nào</h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                        Chọn một mẫu CV đẹp mắt và bắt đầu xây dựng hồ sơ chuyên nghiệp của bạn ngay hôm nay
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary"
                    >
                        <FiPlus size={20} />
                        Bắt đầu tạo ngay
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cvs.map((cv) => (
                        <div
                            key={cv.id}
                            onClick={() => openCV(cv)}
                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 cursor-pointer"
                        >
                            {/* CV Thumbnail */}
                            <div className="relative aspect-[1/1.4] bg-slate-50 overflow-hidden border-b border-slate-50">
                                {isUploadedCV(cv) ? (
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.75rem',
                                            padding: '1rem',
                                            textAlign: 'center',
                                            background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)'
                                        }}
                                    >
                                        <FiFileText size={54} style={{ color: 'var(--color-primary)' }} />
                                        <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                                            CV Upload (PDF)
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                                            Nhấn để mở file gốc
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute top-0 left-0 w-[800px] h-[1131px] origin-top-left scale-[0.4] pointer-events-none p-4">
                                        <CVRenderer data={cv.data || {}} isViewOnly />
                                    </div>
                                )}
                                {/* Hover Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openCV(cv);
                                        }}
                                        className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                    >
                                        {isUploadedCV(cv) ? <FiDownload size={20} /> : <FiEdit size={20} />}
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteCV(cv.id, e)}
                                        className="w-12 h-12 rounded-full bg-white text-red-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                    >
                                        <FiTrash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 flex justify-between items-center bg-white group-hover:bg-slate-50 transition-colors">
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{cv.title || 'Không tiêu đề'}</h4>
                                    <p className="text-xs text-slate-400">
                                        Mẫu: {isUploadedCV(cv) ? 'UPLOAD' : (cv.mcv || 'CV001')} • {new Date(cv.updated_at).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
                                    <FiDownload size={18} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create CV Modal - Large Multi-step style */}
            {showCreateModal && (
                <div className="cv-create-modal-overlay">
                    <div className="cv-create-modal">
                        <div className="cv-create-modal-header">
                            <div>
                                <h2 className="cv-create-modal-title">Chọn mẫu CV của bạn</h2>
                                <p className="cv-create-modal-subtitle">Bạn có thể thay đổi mẫu sau này bất cứ lúc nào</p>
                            </div>
                            <button
                                onClick={closeCreateModal}
                                className="cv-create-modal-close"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="cv-create-modal-content">
                            {/* Left: Template Selection */}
                            <div className="cv-create-modal-gallery">
                                <TemplateGallery
                                    selectedCode={selectedTemplate}
                                    onSelect={setSelectedTemplate}
                                />
                            </div>

                            {/* Right: Meta Info */}
                            <div className="cv-create-modal-sidebar">
                                <div>
                                    <h3 className="cv-create-sidebar-title">Chi tiết CV</h3>
                                    <div className="form-group" style={{ marginTop: '1rem' }}>
                                        <label className="cv-create-label">Tên gọi hồ sơ</label>
                                        <input
                                            type="text"
                                            className="cv-create-input"
                                            value={newCVTitle}
                                            onChange={(e) => setNewCVTitle(e.target.value)}
                                            placeholder="VD: CV Lập trình viên"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="cv-create-tip" style={{ marginTop: '1rem' }}>
                                        <strong style={{ display: 'block', marginBottom: '0.25rem', fontStyle: 'italic' }}>Mách bạn:</strong>
                                        Mẫu {selectedTemplate} rất phù hợp cho các vị trí yêu cầu tính chuyên môn cao và chuyên nghiệp.
                                    </div>
                                </div>

                                <div className="cv-create-actions">
                                    <button
                                        onClick={handleCreateCV}
                                        className="btn btn-primary btn-block"
                                        disabled={!newCVTitle.trim()}
                                    >
                                        Bắt đầu chỉnh sửa
                                    </button>
                                    <button
                                        onClick={closeCreateModal}
                                        className="btn btn-secondary btn-block"
                                    >
                                        Quay lại
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
