import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FiChevronLeft, FiSave, FiEye, FiDownload, FiLayout } from 'react-icons/fi';
import CVRenderer from '../../components/cv/CVRenderer';
import type { CVData } from '../../components/cv/types';

export default function CVEditorPage() {
    const { id } = useParams();
    const { user } = useAuth();
    console.log('Current user:', user?.id);
    const navigate = useNavigate();

    const [cvData, setCvData] = useState<CVData | null>(null);
    const [cvTitle, setCvTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [isPreview, setIsPreview] = useState(false);

    useEffect(() => {
        fetchCV();
    }, [id]);

    const fetchCV = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('cv_templates')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setCvData(data.data as CVData);
            setCvTitle(data.title);
        } catch (error) {
            console.error('Error fetching CV:', error);
            navigate('/candidate/cv');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!cvData || !id) return;
        try {
            setSaving(true);
            const { error } = await supabase
                .from('cv_templates')
                .update({
                    data: cvData,
                    title: cvTitle,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
            alert('Đã lưu thành công!');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSectionTap = (section: string) => {
        setActiveSection(section);
    };

    if (loading) return <div className="flex items-center justify-center h-screen font-sans">Đang tải trình chỉnh sửa...</div>;
    if (!cvData) return <div>Không tìm thấy dữ liệu CV.</div>;

    return (
        <div className="flex flex-col h-screen bg-slate-100 font-sans">
            {/* Top Bar */}
            <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/candidate/cv')}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <FiChevronLeft size={24} className="text-slate-600" />
                    </button>
                    <input
                        value={cvTitle}
                        onChange={(e) => setCvTitle(e.target.value)}
                        className="text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-100 rounded px-2 py-1 w-64"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsPreview(!isPreview)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${isPreview ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <FiEye size={18} />
                        {isPreview ? 'Đang xem' : 'Xem trước'}
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        <FiSave size={18} />
                        {saving ? 'Đang lưu...' : 'Lưu CV'}
                    </button>

                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all">
                        <FiDownload size={18} />
                        Tải PDF
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Instructions/Controls (Hidden in Preview) */}
                {!isPreview && (
                    <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex flex-col p-6 shrink-0">
                        <div className="mb-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Trình chỉnh sửa</h3>
                            <p className="text-xs text-slate-500 leading-relaxed bg-blue-50 p-4 rounded-xl border border-blue-100">
                                Nhấn trực tiếp vào các phần trên CV bên phải để cập nhật thông tin của bạn.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            {[
                                { id: 'personal_info', label: 'Thông tin cá nhân' },
                                { id: 'summary', label: 'Giới thiệu bản thân' },
                                { id: 'experiences', label: 'Kinh nghiệm làm việc' },
                                { id: 'education', label: 'Học vấn' },
                                { id: 'skills', label: 'Kỹ năng' },
                                { id: 'projects', label: 'Dự án / Hoạt động' },
                                { id: 'certifications', label: 'Chứng chỉ' },
                                { id: 'awards', label: 'Giải thưởng' },
                            ].map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeSection === section.id
                                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {section.label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-auto pt-6">
                            <button className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-xs hover:border-slate-300 hover:text-slate-500 transition-all flex items-center justify-center gap-2">
                                <FiLayout /> Thay đổi mẫu thiết kế
                            </button>
                        </div>
                    </div>
                )}

                {/* Center: CV Preview Canvas */}
                <div className={`flex-1 overflow-y-auto p-12 flex justify-center items-start bg-slate-100 transition-all ${isPreview ? 'w-full' : ''}`}>
                    <div className={`shadow-2xl transition-all duration-500 origin-top transform ${isPreview ? 'scale-100' : 'scale-[0.85]'}`}>
                        <div className="w-[800px] min-h-[1131px] bg-white rounded-sm overflow-hidden pointer-events-auto">
                            <CVRenderer
                                templateCode={cvData.mcv}
                                data={cvData}
                                onSectionTap={handleSectionTap}
                                isViewOnly={isPreview}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Side: Floating Editor Modal/Sheet (When active) */}
                {activeSection && !isPreview && (
                    <div className="fixed top-16 right-0 bottom-0 w-[500px] bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.05)] border-l border-slate-200 z-[60] flex flex-col animate-slide-left">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Chỉnh sửa {activeSection}</h2>
                            <button onClick={() => setActiveSection(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center bg-slate-50">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            {/* Specific field inputs would go here based on activeSection */}
                            <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                <p className="text-slate-400 text-sm">Form cập nhật cho <b>{activeSection}</b> đang được phát triển...</p>
                                <p className="text-[10px] text-slate-300 mt-2">Dữ liệu hiện tại: {JSON.stringify(cvData[activeSection as keyof CVData] || {})}</p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex gap-4">
                            <button
                                onClick={() => setActiveSection(null)}
                                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all font-sans"
                            >
                                Hoàn tất
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes slide-left {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-left {
          animation: slide-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
        </div>
    );
}
