import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { FiTrash2, FiEdit, FiPlus, FiDownload, FiFileText } from 'react-icons/fi';

interface CV {
    id: string;
    title: string;
    data: any;
    created_at: string;
    updated_at: string;
}

export default function CVManagementPage() {
    const { user } = useAuth();
    const [cvs, setCvs] = useState<CV[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCVTitle, setNewCVTitle] = useState('');

    useEffect(() => {
        fetchCVs();
    }, []);

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
            const { error } = await supabase
                .from('cv_templates')
                .insert([
                    {
                        user_id: user.id,
                        title: newCVTitle,
                        data: {}
                    }
                ]);

            if (error) throw error;

            setNewCVTitle('');
            setShowCreateModal(false);
            fetchCVs();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDeleteCV = async (id: string) => {
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
        <div className="container section">
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div>
                    <h1>Quản lý CV</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Quản lý và tạo CV của bạn
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary"
                >
                    <FiPlus size={20} />
                    Tạo CV mới
                </button>
            </div>

            {cvs.length === 0 ? (
                <div className="card text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                    <FiFileText size={64} style={{ color: 'var(--color-text-secondary)', margin: '0 auto var(--spacing-lg)' }} />
                    <h3>Chưa có CV nào</h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                        Tạo CV đầu tiên của bạn để bắt đầu ứng tuyển
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary"
                    >
                        <FiPlus size={20} />
                        Tạo CV ngay
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-3">
                    {cvs.map((cv) => (
                        <div key={cv.id} className="card animate-fade-in">
                            <div className="card-header">
                                <div className="flex items-center gap-md">
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        background: 'var(--gradient-primary)',
                                        borderRadius: 'var(--radius-lg)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FiFileText size={24} color="white" />
                                    </div>
                                    <div>
                                        <h4 style={{ marginBottom: '0.25rem' }}>{cv.title}</h4>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                            Cập nhật {new Date(cv.updated_at).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="card-footer">
                                <div className="flex gap-sm">
                                    <button className="btn btn-sm btn-outline">
                                        <FiEdit size={16} />
                                        Chỉnh sửa
                                    </button>
                                    <button className="btn btn-sm btn-outline">
                                        <FiDownload size={16} />
                                        Tải về
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleDeleteCV(cv.id)}
                                    className="btn btn-sm"
                                    style={{ background: 'var(--color-error)', color: 'white' }}
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create CV Modal */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 'var(--z-modal)'
                }}>
                    <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
                        <h3>Tạo CV mới</h3>
                        <div className="form-group">
                            <label className="form-label">Tên CV</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newCVTitle}
                                onChange={(e) => setNewCVTitle(e.target.value)}
                                placeholder="VD: CV Lập trình viên"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-md">
                            <button
                                onClick={handleCreateCV}
                                className="btn btn-primary"
                                disabled={!newCVTitle.trim()}
                            >
                                Tạo CV
                            </button>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewCVTitle('');
                                }}
                                className="btn btn-secondary"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
