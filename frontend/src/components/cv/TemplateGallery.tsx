import React from 'react';
import CVRenderer from './CVRenderer';
import { CV_TEMPLATES_INFO } from './utils';
import './cv-templates.css';

interface TemplateGalleryProps {
    onSelect: (code: string) => void;
    selectedCode?: string;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelect, selectedCode }) => {
    return (
        <div className="cv-template-gallery">
            {CV_TEMPLATES_INFO.map((template) => (
                <div
                    key={template.code}
                    onClick={() => onSelect(template.code)}
                    className={`cv-template-card ${selectedCode === template.code ? 'selected' : ''}`}
                >
                    {/* Mini Preview Container */}
                    <div className="cv-template-preview">
                        <div className="cv-template-preview-canvas">
                            <CVRenderer
                                templateCode={template.code}
                                data={{
                                    personal_info: { full_name: "HỌ TÊN CỦA BẠN", title: "Vị trí ứng tuyển" },
                                    summary: "Mô tả ngắn gọn về bản thân...",
                                    experiences: [{ company: "Công ty cũ", position: "Vị trí", duration: "2020-2023" }]
                                }}
                                isViewOnly
                            />
                        </div>

                        {/* Overlay */}
                        <div className={`cv-template-overlay ${selectedCode === template.code ? 'selected' : ''}`}>
                            {selectedCode === template.code && (
                                <div className="cv-template-selected-icon">
                                    <svg className="cv-template-selected-icon-svg" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="cv-template-card-body">
                        <h4 className={`cv-template-name ${selectedCode === template.code ? 'selected' : ''}`}>{template.name}</h4>
                        <p className="cv-template-description">{template.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TemplateGallery;
