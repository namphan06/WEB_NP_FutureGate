import React from 'react';
import CVRenderer from './CVRenderer';
import { CV_TEMPLATES_INFO } from './utils';

interface TemplateGalleryProps {
    onSelect: (code: string) => void;
    selectedCode?: string;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelect, selectedCode }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto p-4">
            {CV_TEMPLATES_INFO.map((template) => (
                <div
                    key={template.code}
                    onClick={() => onSelect(template.code)}
                    className={`group cursor-pointer rounded-xl border-2 transition-all p-3 flex flex-col gap-3 ${selectedCode === template.code
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                            : 'border-slate-100 hover:border-slate-300 bg-white'
                        }`}
                >
                    {/* Mini Preview Container */}
                    <div className="relative w-full aspect-[1/1.41] overflow-hidden rounded-lg border border-slate-100 bg-slate-50 origin-top">
                        <div className="absolute top-0 left-0 w-[800px] h-[1131px] origin-top-left scale-[0.22] md:scale-[0.25] pointer-events-none">
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
                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 bg-black/5 ${selectedCode === template.code ? 'opacity-100' : ''
                            }`}>
                            {selectedCode === template.code && (
                                <div className="bg-[var(--color-primary)] text-white p-2 rounded-full shadow-lg">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-1">
                        <h4 className={`text-sm font-bold mb-1 ${selectedCode === template.code ? 'text-[var(--color-primary)]' : 'text-slate-900'}`}>{template.name}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{template.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TemplateGallery;
