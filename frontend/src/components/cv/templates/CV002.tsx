import React from 'react';
import type { CVTemplateProps } from '../types';
import { FiUser, FiBriefcase, FiFolder, FiMail, FiPhone, FiMapPin, FiLink } from 'react-icons/fi';
import '../cv-templates.css';

const CV002: React.FC<CVTemplateProps> = ({ data, onSectionTap, isViewOnly }) => {
    const info = data.personal_info || {};

    const handleTap = (section: string) => {
        if (!isViewOnly && onSectionTap) {
            onSectionTap(section);
        }
    };

    const SectionWrapper = ({ section, children }: { section: string, children: React.ReactNode }) => (
        <div
            className={`cv-section-wrapper ${!isViewOnly ? 'clickable' : ''}`}
            onClick={() => handleTap(section)}
        >
            {children}
        </div>
    );

    return (
        <div className="cv-container p-6 flex flex-col gap-6">
            {/* Header */}
            <SectionWrapper section="cv_name">
                <div className="cv2-header">
                    <h1 className="text-3xl font-bold tracking-wider mb-2 uppercase">
                        {info.full_name || "NGUYỄN VĂN B"}
                    </h1>
                    <p className="text-white/80 font-medium tracking-wide uppercase">
                        {info.title || "Lập trình viên Flutter"}
                    </p>
                </div>
            </SectionWrapper>

            <div className="cv2-main">
                {/* Main Content */}
                <div className="flex flex-col gap-8">
                    <SectionWrapper section="summary">
                        <div>
                            <div className="cv2-section-title">
                                <FiUser size={20} />
                                <span>GIỚI THIỆU</span>
                            </div>
                            <p className="pl-2 text-slate-600 text-sm leading-relaxed">
                                {data.summary || "Mô tả ngắn gọn về bản thân và mục tiêu nghề nghiệp..."}
                            </p>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="experiences">
                        <div>
                            <div className="cv2-section-title">
                                <FiBriefcase size={20} />
                                <span>KINH NGHIỆM</span>
                            </div>
                            <div className="flex flex-col gap-6 pl-2">
                                {(data.experiences || [{
                                    company: "Công ty ABC",
                                    position: "Senior Developer",
                                    duration: "2020 - Hiện tại",
                                    description: "Phát triển ứng dụng mobile..."
                                }]).map((exp, i) => (
                                    <div key={i} className="flex flex-col">
                                        <h4 className="font-bold text-slate-800">{exp.position}</h4>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-blue-700 font-semibold text-sm">{exp.company}</span>
                                            <span className="text-xs text-slate-400 font-medium">{exp.duration}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="projects">
                        <div>
                            <div className="cv2-section-title">
                                <FiFolder size={20} />
                                <span>DỰ ÁN</span>
                            </div>
                            <div className="flex flex-col gap-4 pl-2">
                                {(data.projects || [{
                                    name: "Project Name",
                                    description: "Mô tả dự án..."
                                }]).map((p, i) => (
                                    <div key={i}>
                                        <h4 className="font-bold text-slate-800 text-sm mb-1">{p.name}</h4>
                                        <p className="text-sm text-slate-600">{p.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>
                </div>

                {/* Sidebar */}
                <aside className="cv2-sidebar flex flex-col gap-8">
                    <SectionWrapper section="avatar">
                        <div className="flex justify-center">
                            <div className="w-32 h-32 rounded-full border-4 border-blue-100 overflow-hidden bg-blue-50 shadow-sm">
                                {info.avatar_url ? (
                                    <img src={info.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-blue-200">
                                        <FiUser size={64} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="personal_info">
                        <div className="flex flex-col gap-3">
                            {[
                                { icon: FiMail, text: info.email || "email@example.com" },
                                { icon: FiPhone, text: info.phone || "0987654321" },
                                { icon: FiMapPin, text: info.address || "Hồ Chí Minh" },
                                { icon: FiLink, text: info.website || "linkedin.com/in/b" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-slate-600">
                                    <item.icon size={16} className="shrink-0 text-slate-400" />
                                    <span className="text-xs truncate">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </SectionWrapper>

                    <hr className="border-slate-200" />

                    <SectionWrapper section="education">
                        <div>
                            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 border-slate-200">HỌC VẤN</h3>
                            <div className="flex flex-col gap-4">
                                {(data.education || [{
                                    school: "Đại học Công Nghệ",
                                    degree: "Cử nhân CNTT",
                                    year: "2015 - 2019"
                                }]).map((edu, i) => (
                                    <div key={i}>
                                        <h4 className="font-bold text-slate-800 text-[13px]">{edu.school}</h4>
                                        <p className="text-xs text-slate-600">{edu.degree}</p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">{edu.year}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>

                    <hr className="border-slate-200" />

                    <SectionWrapper section="skills">
                        <div>
                            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 border-slate-200">KỸ NĂNG</h3>
                            <div className="flex flex-wrap gap-2">
                                {(data.skills || [{ name: "Flutter" }, { name: "React" }]).map((s, i) => (
                                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-800 text-[11px] font-semibold rounded border border-blue-100">
                                        {s.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>
                </aside>
            </div>
        </div>
    );
};

export default CV002;
