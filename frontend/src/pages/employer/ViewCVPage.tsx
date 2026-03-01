import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiArrowLeft, FiDownload, FiPrinter, FiLink, FiCheckCircle, FiMoreHorizontal } from 'react-icons/fi';
import CVRenderer from '../../components/cv/CVRenderer';

export default function EmployerViewCVPage() {
    const { cvId } = useParams<{ cvId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [cvData, setCvData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const applicantId = searchParams.get('applicant');

    useEffect(() => {
        fetchApplicantInfo();
    }, [cvId, applicantId]);

    const fetchApplicantInfo = async () => {
        if (!cvId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data: cvResponse } = await supabase
                .from('cv_templates')
                .select('*')
                .eq('id', cvId)
                .single();

            if (cvResponse) {
                setCvData(cvResponse);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--color-background)' }}>
                <div className="text-center">
                    <div className="loading-spinner" style={{ margin: '0 auto 20px' }}></div>
                    <p style={{ color: 'var(--color-text-secondary)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '12px' }}>Đang chuẩn bị hồ sơ...</p>
                </div>
            </div>
        );
    }

    const personalInfo = cvData?.data?.personal_info || {};

    return (
        <div className="view-cv-page">
            {/* NP PREMIUM STUDIO HEADER - SPREAD LAYOUT */}
            <header className="studio-header no-print">
                <div className="studio-header-content-spread">

                    {/* POINT 1: FAR LEFT - NAVIGATION */}
                    <div className="header-section-left">
                        <button onClick={() => navigate(-1)} className="studio-back-btn-premium">
                            <FiArrowLeft size={18} />
                            <span>THOÁT</span>
                        </button>
                    </div>

                    {/* POINT 2: FAR RIGHT - INFO & ACTIONS */}
                    <div className="header-section-right">

                        {/* Profile Info Block */}
                        <div className="studio-profile-compact">
                            <div className="profile-text-end">
                                <div className="profile-name-row">
                                    <h1 className="candidate-name-h1">{personalInfo.full_name || 'Hồ sơ tuyển dụng'}</h1>
                                    <span className="premium-badge-mini">
                                        <FiCheckCircle size={10} />
                                        <span>VERIFIED</span>
                                    </span>
                                </div>
                                <div className="profile-sub-row">
                                    <span className="sub-text-bold">{cvData?.mcv || 'CV001'} PREMIUM</span>
                                    <span className="sub-divider"></span>
                                    <span className="sub-text-light">{cvData?.title || 'Personal Profile'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="header-vertical-divider"></div>

                        {/* Action Buttons */}
                        <div className="studio-actions-wrapper">
                            <div className="secondary-actions-pill">
                                <button className="pill-btn" title="Copy Link"><FiLink size={16} /></button>
                                <button className="pill-btn" onClick={handlePrint} title="In hồ sơ"><FiPrinter size={16} /></button>
                                <button className="pill-btn"><FiMoreHorizontal size={16} /></button>
                            </div>

                            <button className="btn-studio-primary" onClick={handlePrint}>
                                <FiDownload size={16} />
                                <span>TẢI PDF</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* THE STUDIO STAGE */}
            <main className="studio-stage-view">
                <div className="studio-canvas">
                    <div className="studio-paper-elevation">
                        {/* 50px GOLDEN MARGIN - NO COMPROMISE */}
                        <div className="studio-paper-content">
                            <CVRenderer
                                data={cvData?.data || {}}
                                templateCode={cvData?.mcv}
                                isViewOnly={true}
                            />
                        </div>
                    </div>

                    {/* Visual Floor Status */}
                    <div className="studio-floor-info">
                        <div className="status-item">
                            <span className="status-indicator"></span>
                            A4 ASPECT RATIO OPTIMIZED
                        </div>
                        <div className="copyright-item">
                            © FUTUREGATE PRO VIEWER
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                /* ========================================
                   ULTRA-PREMIUM SPREAD HEADER STYLES
                   ======================================== */
                .view-cv-page {
                    min-height: 100vh;
                    background: #F1F4F9;
                    display: flex;
                    flex-direction: column;
                    font-family: 'Inter', sans-serif;
                }

                .studio-header {
                    height: 84px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(30px);
                    -webkit-backdrop-filter: blur(30px);
                    border-bottom: 1px solid rgba(0,0,0,0.06);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                }

                .studio-header-content-spread {
                    width: 100%;
                    padding: 0 40px;
                    display: flex;
                    justify-content: space-between; /* Đẩy về 2 đầu */
                    align-items: center;
                }

                /* --- LEFT SECTION --- */
                .studio-back-btn-premium {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: white;
                    border: 1.5px solid #E2E8F0;
                    padding: 10px 22px;
                    border-radius: 14px;
                    color: #475569;
                    font-weight: 800;
                    font-size: 12px;
                    letter-spacing: 0.8px;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }

                .studio-back-btn-premium:hover {
                    border-color: #1E88E5;
                    color: #1E88E5;
                    transform: translateX(-4px);
                    box-shadow: 0 4px 12px rgba(30, 136, 229, 0.1);
                }

                /* --- RIGHT SECTION --- */
                .header-section-right {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                }

                .studio-profile-compact {
                    display: flex;
                    align-items: center;
                    text-align: right;
                }

                .profile-text-end {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 2px;
                }

                .profile-name-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .candidate-name-h1 {
                    font-size: 20px;
                    font-weight: 900;
                    color: #0F172A;
                    margin: 0;
                    letter-spacing: -0.5px;
                }

                .premium-badge-mini {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    background: #F0FDF4;
                    color: #16A34A;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 9px;
                    font-weight: 900;
                    border: 1px solid #DCFCE7;
                }

                .profile-sub-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .sub-text-bold { color: #1E88E5; }
                .sub-text-light { color: #94A3B8; }
                .sub-divider { width: 3px; height: 3px; background: #CBD5E1; border-radius: 50%; }

                .header-vertical-divider {
                    width: 1px;
                    height: 32px;
                    background: #E2E8F0;
                }

                .studio-actions-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .secondary-actions-pill {
                    display: flex;
                    background: #F8FAFC;
                    padding: 4px;
                    border-radius: 12px;
                    border: 1px solid #F1F5F9;
                }

                .pill-btn {
                    width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    border: none;
                    color: #64748B;
                    cursor: pointer;
                    border-radius: 9px;
                    transition: all 0.2s;
                }

                .pill-btn:hover {
                    background: white;
                    color: #1E88E5;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }

                .btn-studio-primary {
                    background: #1E88E5;
                    color: white;
                    height: 48px;
                    padding: 0 24px;
                    border-radius: 14px;
                    border: none;
                    font-weight: 800;
                    font-size: 12px;
                    letter-spacing: 0.5px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 20px -6px rgba(30, 136, 229, 0.4);
                }

                .btn-studio-primary:hover {
                    background: #1976D2;
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px -6px rgba(30, 136, 229, 0.5);
                }

                /* --- STAGE --- */
                .studio-stage-view {
                    flex: 1;
                    padding: 50px 20px 80px;
                    display: flex;
                    justify-content: center;
                    overflow-y: auto;
                }

                .studio-canvas {
                    width: 100%;
                    max-width: 900px;
                }

                .studio-paper-elevation {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 30px 60px -12px rgba(0,0,0,0.1), 0 18px 36px -18px rgba(0,0,0,0.05);
                    border: 1px solid rgba(0,0,0,0.02);
                }

                .studio-paper-content {
                    padding: 50px; /* Golden margin */
                }

                /* --- FLOOR --- */
                .studio-floor-info {
                    margin-top: 30px;
                    display: flex;
                    justify-content: space-between;
                    color: #94A3B8;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 1px;
                }

                .status-item { display: flex; align-items: center; gap: 8px; }
                .status-indicator { width: 6px; height: 6px; background: #1E88E5; border-radius: 50%; opacity: 0.6; }

                @media print {
                    .no-print { display: none !important; }
                    .studio-stage-view { padding: 0 !important; display: block !important; }
                    .studio-paper-elevation { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
                    .studio-paper-content { padding: 0 !important; }
                    body { background: white !important; }
                }
            `}</style>
        </div>
    );
}
