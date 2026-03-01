import React from 'react';
import type { CVTemplateProps } from '../types';
import { FiPhone, FiMail, FiMapPin, FiInfo, FiUser } from 'react-icons/fi';
import '../cv-templates.css';

const CV004: React.FC<CVTemplateProps> = ({ data, onSectionTap, isViewOnly }) => {
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
        <div className="cv-container flex min-h-[1120px]">
            {/* Left Column (Sidebar) */}
            <aside className="w-[200px] bg-[#353A3D] text-white/80 p-6 flex flex-col gap-8 shrink-0">
                <SectionWrapper section="avatar">
                    <div className="flex justify-center">
                        <div className="w-32 h-32 border-2 border-[#EC8F00] overflow-hidden bg-[#2D3133]">
                            {info.avatar_url ? (
                                <img src={info.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                    <FiUser size={48} />
                                </div>
                            )}
                        </div>
                    </div>
                </SectionWrapper>

                <SectionWrapper section="cv_name">
                    <div>
                        <h1 className="text-xl font-bold text-[#EC8F00] tracking-wide mb-1 break-words">
                            {info.full_name || "Nguyễn Văn A"}
                        </h1>
                        <p className="text-[10px] font-bold text-[#EC8F00] uppercase tracking-widest">
                            {info.title || "Kỹ sư phần mềm"}
                        </p>
                        <div className="h-px bg-[#EC8F00] w-full mt-2" />
                    </div>
                </SectionWrapper>

                <SectionWrapper section="personal_details">
                    <div className="flex flex-col gap-4">
                        {[
                            { icon: FiPhone, text: info.phone || "0123 456 789" },
                            { icon: FiMail, text: info.email || "email@example.com" },
                            { icon: FiInfo, text: info.website || "website.com" },
                            { icon: FiMapPin, text: info.address || "Hà Nội" },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <item.icon size={14} className="text-[#EC8F00] mt-0.5 shrink-0" />
                                <span className="text-[11px] leading-tight break-all">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </SectionWrapper>

                <SectionWrapper section="skills">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-bold text-[#EC8F00] uppercase shrink-0">Các kỹ năng</span>
                            <div className="h-px bg-[#EC8F00] flex-1" />
                        </div>
                        <div className="flex flex-col gap-2">
                            {(data.skills || [{ name: "Kỹ năng chuyên môn" }, { name: "Kỹ năng mềm" }]).map((s, i) => (
                                <div key={i} className="text-[11px] leading-snug">- {s.name}</div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>

                <SectionWrapper section="interests">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-bold text-[#EC8F00] uppercase shrink-0">Sở thích</span>
                            <div className="h-px bg-[#EC8F00] flex-1" />
                        </div>
                        <p className="text-[11px] leading-snug">
                            {data.activities?.[0]?.description || "Teambuilding, ca hát, văn nghệ, thể thao."}
                        </p>
                    </div>
                </SectionWrapper>

                <SectionWrapper section="references">
                    <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-bold text-[#EC8F00] uppercase shrink-0">Người giới thiệu</span>
                            <div className="h-px bg-[#EC8F00] flex-1" />
                        </div>
                        <div className="flex flex-col gap-4">
                            {(data.references || [{ name: "Nguyễn Văn A", position: "CEO công ty A", phone: "0123456789" }]).map((r, i) => (
                                <div key={i} className="text-[11px] leading-tight">
                                    <div className="font-bold mb-0.5">{r.name}</div>
                                    <div className="opacity-80">{r.position}</div>
                                    <div className="opacity-80">{r.phone}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            </aside>

            {/* Right Column (Main Content) */}
            <main className="flex-1 p-10 flex flex-col gap-10">
                <SectionWrapper section="summary">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-sm font-bold text-[#EC8F00] uppercase whitespace-nowrap">Mục tiêu nghề nghiệp</h3>
                            <div className="h-px bg-[#EC8F00] flex-1" />
                        </div>
                        <p className="text-[13px] text-[#353A3D] leading-relaxed">
                            {data.summary || "Bản tóm tắt mục tiêu nghề nghiệp của bạn..."}
                        </p>
                    </div>
                </SectionWrapper>

                <SectionWrapper section="experiences">
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <h3 className="text-sm font-bold text-[#EC8F00] uppercase whitespace-nowrap">Kinh nghiệm làm việc</h3>
                            <div className="h-px bg-[#EC8F00] flex-1" />
                        </div>
                        <div className="flex flex-col gap-6">
                            {(data.experiences || [{
                                company: "Công ty ABC",
                                position: "Vị trí",
                                duration: "2023 - 2024",
                                description: "Mô tả trách nhiệm công việc..."
                            }]).map((exp, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-[13px] text-[#353A3D]">{exp.position}</h4>
                                        <span className="font-bold text-xs text-[#353A3D]">{exp.duration}</span>
                                    </div>
                                    <div className="font-bold text-xs text-slate-500 uppercase">{exp.company}</div>
                                    <p className="text-xs text-[#353A3D] mt-2 whitespace-pre-line leading-relaxed">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>

                <SectionWrapper section="education">
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <h3 className="text-sm font-bold text-[#EC8F00] uppercase whitespace-nowrap">Học vấn</h3>
                            <div className="h-px bg-[#EC8F00] flex-1" />
                        </div>
                        <div className="flex flex-col gap-6">
                            {(data.education || [{
                                school: "Đại học X",
                                degree: "Chuyên ngành",
                                year: "2018 - 2022"
                            }]).map((edu, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-[13px] text-[#353A3D]">{edu.degree}</h4>
                                        <span className="font-bold text-xs text-[#353A3D]">{edu.year}</span>
                                    </div>
                                    <div className="font-bold text-xs text-slate-500 uppercase">{edu.school}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>

                <div className="grid grid-cols-2 gap-10">
                    <SectionWrapper section="awards">
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <h3 className="text-xs font-bold text-[#EC8F00] uppercase whitespace-nowrap">Giải thưởng</h3>
                                <div className="h-px bg-[#EC8F00] flex-1" />
                            </div>
                            <div className="flex flex-col gap-4">
                                {(data.awards || [{ name: "Giải thưởng mẫu", year: "2024" }]).map((aw, i) => (
                                    <div key={i} className="text-xs border-l-2 border-[#EC8F00] pl-3 py-1">
                                        <div className="font-bold text-[#353A3D]">{aw.year}</div>
                                        <div className="text-slate-600">{aw.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="certifications">
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <h3 className="text-xs font-bold text-[#EC8F00] uppercase whitespace-nowrap">Chứng chỉ</h3>
                                <div className="h-px bg-[#EC8F00] flex-1" />
                            </div>
                            <div className="flex flex-col gap-4">
                                {(data.certifications || [{ name: "Chứng chỉ mẫu", year: "2024" }]).map((c, i) => (
                                    <div key={i} className="text-xs border-l-2 border-[#EC8F00] pl-3 py-1">
                                        <div className="font-bold text-[#353A3D]">{c.year}</div>
                                        <div className="text-slate-600">{c.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>
                </div>
            </main>
        </div>
    );
};

export default CV004;
