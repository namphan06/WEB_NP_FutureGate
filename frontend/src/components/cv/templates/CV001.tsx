import React from 'react';
import type { CVTemplateProps } from '../types';
import '../cv-templates.css';

const CV001: React.FC<CVTemplateProps> = ({ data, onSectionTap, isViewOnly }) => {
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
        <div className="cv-container flex flex-col">
            {/* Header */}
            <SectionWrapper section="cv_name">
                <div className="cv1-header">
                    <div className="cv1-name-card">
                        {info.full_name || "NGUYỄN VĂN A"}
                    </div>
                    <div className="text-white opacity-80 font-semibold uppercase tracking-wider">
                        {info.title || "Vị trí ứng tuyển"}
                    </div>
                </div>
            </SectionWrapper>

            <div className="flex flex-1">
                {/* Left Column */}
                <div className="cv1-left-col">
                    <SectionWrapper section="avatar">
                        <div className="w-full aspect-square bg-slate-200 rounded-lg overflow-hidden mb-6">
                            {info.avatar_url ? (
                                <img src={info.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                </div>
                            )}
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="personal_details">
                        <div className="space-y-4 mb-8">
                            <div>
                                <div className="text-[10px] font-bold opacity-60 uppercase mb-1">Ngày sinh</div>
                                <div className="text-sm">{info.dob || "15/05/1990"}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold opacity-60 uppercase mb-1">Giới tính</div>
                                <div className="text-sm">{info.gender || "Nam"}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold opacity-60 uppercase mb-1">Số điện thoại</div>
                                <div className="text-sm">{info.phone || "0123456789"}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold opacity-60 uppercase mb-1">Email</div>
                                <div className="text-sm truncate">{info.email || "email@example.com"}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold opacity-60 uppercase mb-1">Địa chỉ</div>
                                <div className="text-sm">{info.address || "Hà Nội"}</div>
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="summary">
                        <div className="mb-8">
                            <h3 className="text-sm font-bold opacity-60 uppercase mb-2">Mục tiêu nghề nghiệp</h3>
                            <p className="text-sm leading-relaxed">
                                {data.summary || "Mục tiêu nghề nghiệp của bạn..."}
                            </p>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="skills">
                        <div>
                            <h3 className="text-sm font-bold opacity-60 uppercase mb-4">Các kỹ năng</h3>
                            <div className="space-y-3">
                                {(data.skills || [{ name: "Kỹ năng mẫu" }]).map((skill, i) => (
                                    <div key={i}>
                                        <div className="text-sm mb-1">{skill.name}</div>
                                        <div className="skill-bar-bg">
                                            <div className="skill-bar-fill" style={{ width: '60%' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>
                </div>

                {/* Right Column */}
                <div className="cv1-right-col">
                    <SectionWrapper section="experiences">
                        <div className="mb-8">
                            <h3 className="cv1-section-title">KINH NGHIỆM LÀM VIỆC</h3>
                            <div className="space-y-6">
                                {(data.experiences || [{
                                    company: "Công ty Mẫu",
                                    position: "Vị trí",
                                    duration: "2023 - 2024",
                                    description: "Mô tả công việc..."
                                }]).map((exp, i) => (
                                    <div key={i} className="relative pl-4 border-l-2 border-slate-100">
                                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-green-500"></div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-slate-800">{exp.company}</h4>
                                            <span className="text-xs text-slate-500 font-medium">{exp.duration}</span>
                                        </div>
                                        <div className="text-sm font-semibold text-green-600 mb-2">{exp.position}</div>
                                        <p className="text-sm text-slate-600 whitespace-pre-line">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="education">
                        <div className="mb-8">
                            <h3 className="cv1-section-title">HỌC VẤN</h3>
                            <div className="space-y-4">
                                {(data.education || [{
                                    school: "Trường Đại học Mẫu",
                                    degree: "Chuyên ngành",
                                    year: "2020 - 2024"
                                }]).map((edu, i) => (
                                    <div key={i} className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-800">{edu.school}</h4>
                                            <div className="text-sm text-slate-600">{edu.degree}</div>
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="activities">
                        <div className="mb-8">
                            <h3 className="cv1-section-title">HOẠT ĐỘNG</h3>
                            <div className="space-y-4">
                                {(data.activities || [{
                                    organization: "Hoạt động mẫu",
                                    role: "Vai trò",
                                    duration: "2023",
                                    description: "Mô tả..."
                                }]).map((act, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-slate-800">{act.organization}</h4>
                                            <span className="text-xs text-slate-500 font-medium">{act.duration}</span>
                                        </div>
                                        <div className="text-sm font-semibold text-slate-600 mb-1">{act.role}</div>
                                        <p className="text-sm text-slate-600">{act.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>

                    <div className="grid grid-cols-2 gap-8">
                        <SectionWrapper section="awards">
                            <div>
                                <h3 className="cv1-section-title">GIẢI THƯỞNG</h3>
                                <div className="space-y-2">
                                    {(data.awards || [{ name: "Giải thưởng mẫu", year: "2024" }]).map((aw, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-slate-700">{aw.name}</span>
                                            <span className="text-slate-500">{aw.year}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SectionWrapper>

                        <SectionWrapper section="certifications">
                            <div>
                                <h3 className="cv1-section-title">CHỨNG CHỈ</h3>
                                <div className="space-y-2">
                                    {(data.certifications || [{ name: "Chứng chỉ mẫu", year: "2024" }]).map((cert, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-slate-700">{cert.name}</span>
                                            <span className="text-slate-500">{cert.year}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SectionWrapper>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CV001;
