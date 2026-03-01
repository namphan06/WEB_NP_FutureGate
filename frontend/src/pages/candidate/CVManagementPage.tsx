import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit, FiPlus, FiDownload, FiFileText, FiX } from 'react-icons/fi';
import TemplateGallery from '../../components/cv/TemplateGallery';
import { getEmptyCVData } from '../../components/cv/utils';
import CVRenderer from '../../components/cv/CVRenderer';

interface CV {
    id: string;
    title: string;
    data: any;
    mcv: string;
    created_at: string;
    updated_at: string;
}

export default function CVManagementPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cvs, setCvs] = useState<CV[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCVTitle, setNewCVTitle] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('CV001');

    useEffect(() => {
        fetchCVs();
    }, [user]);

    const fetchCVs = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('cv_templates')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCvs(data || []);
        } catch (error) {
            console.error('Error fetching CVs:', error);
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
                        user_id: user.id,
                        title: newCVTitle,
                        mcv: selectedTemplate,
                        data: getEmptyCVData(selectedTemplate)
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            setNewCVTitle('');
            setShowCreateModal(false);

            // Redirect to editor
            navigate(`/candidate/cv/${newCv.id}/edit`);
        } catch (error: any) {
            alert(error.message);
        }
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
                .eq('user_id', user?.id);

            if (error) throw error;
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

            {cvs.length === 0 ? (
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
                            onClick={() => navigate(`/candidate/cv/${cv.id}/edit`)}
                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 cursor-pointer"
                        >
                            {/* CV Thumbnail */}
                            <div className="relative aspect-[1/1.4] bg-slate-50 overflow-hidden border-b border-slate-50">
                                <div className="absolute top-0 left-0 w-[800px] h-[1131px] origin-top-left scale-[0.4] pointer-events-none p-4">
                                    <CVRenderer data={cv.data || {}} isViewOnly />
                                </div>
                                {/* Hover Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                        <FiEdit size={20} />
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
                                        Mẫu: {cv.mcv || 'CV001'} • {new Date(cv.updated_at).toLocaleDateString('vi-VN')}
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Chọn mẫu CV của bạn</h2>
                                <p className="text-slate-500 text-sm">Bạn có thể thay đổi mẫu sau này bất cứ lúc nào</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                            {/* Left: Template Selection */}
                            <div className="flex-1 overflow-y-auto p-2">
                                <TemplateGallery
                                    selectedCode={selectedTemplate}
                                    onSelect={setSelectedTemplate}
                                />
                            </div>

                            {/* Right: Meta Info */}
                            <div className="w-full md:w-80 border-l border-slate-100 p-8 flex flex-col bg-slate-50/30">
                                <div className="flex-1">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Chi tiết CV</h3>
                                    <div className="form-group mb-8">
                                        <label className="text-[10px] font-bold text-slate-700 uppercase mb-2 block tracking-wider">Tên gọi hồ sơ</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-300 font-medium"
                                            value={newCVTitle}
                                            onChange={(e) => setNewCVTitle(e.target.value)}
                                            placeholder="VD: CV Lập trình viên"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="p-4 rounded-2xl bg-blue-50 text-blue-800 text-[11px] leading-relaxed">
                                        <p className="font-bold mb-1 italic">Mách bạn:</p>
                                        Mẫu {selectedTemplate} rất phù hợp cho các vị trí yêu cầu tính chuyên môn cao và chuyên nghiệp.
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-3">
                                    <button
                                        onClick={handleCreateCV}
                                        className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
                                        disabled={!newCVTitle.trim()}
                                    >
                                        Bắt đầu chỉnh sửa
                                    </button>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="w-full py-4 rounded-xl bg-white border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
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
