import React from 'react';
import type { CVTemplateProps } from '../types';
import { FiCalendar, FiUser, FiPhone, FiMail, FiMapPin, FiGlobe, FiCheckCircle } from 'react-icons/fi';
import '../cv-templates.css';

const CV005: React.FC<CVTemplateProps> = ({ data, onSectionTap, isViewOnly }) => {
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

    const SectionTitle = ({ title }: { title: string }) => (
        <div className="mt-8 mb-4">
            <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-[#0E2452]" />
                <h3 className="text-lg font-black text-[#0E2452] tracking-wider uppercase">{title}</h3>
            </div>
            <div className="h-px bg-slate-200 w-full mt-2" />
        </div>
    );

    return (
        <div className="cv-container bg-white p-10 flex flex-col">
            {/* Header */}
            <div className="flex justify-between gap-8">
                <div className="flex-1">
                    <SectionWrapper section="personal_info">
                        <div>
                            <h1 className="text-3xl font-black text-[#0E2452] tracking-widest uppercase mb-4 leading-tight">
                                {info.full_name || "Nguyễn Văn A"}
                            </h1>
                            <div className="space-y-2 text-sm text-slate-700">
                                <div className="flex items-center gap-2">
                                    <FiCalendar className="text-[#1D4ED8]" />
                                    <span className="font-bold shrink-0">Ngày sinh:</span>
                                    <span>{info.dob || "15/05/1990"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiUser className="text-[#1D4ED8]" />
                                    <span className="font-bold shrink-0">Giới tính:</span>
                                    <span>{info.gender || "Nam"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiPhone className="text-[#1D4ED8]" />
                                    <span className="font-bold shrink-0">Điện thoại:</span>
                                    <span>{info.phone || "0123456789"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiMail className="text-[#1D4ED8]" />
                                    <span className="font-bold shrink-0">Email:</span>
                                    <span className="truncate">{info.email || "email@example.com"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiMapPin className="text-[#1D4ED8]" />
                                    <span className="font-bold shrink-0">Địa chỉ:</span>
                                    <span>{info.address || "Quận X, TP Y"}</span>
                                </div>
                                {info.website && (
                                    <div className="flex items-center gap-2">
                                        <FiGlobe className="text-[#1D4ED8]" />
                                        <span className="font-bold shrink-0">Website:</span>
                                        <span>{info.website}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </SectionWrapper>
                </div>

                <SectionWrapper section="avatar">
                    <div className="w-40 h-52 bg-slate-100 rounded border-4 border-slate-50 overflow-hidden shrink-0 shadow-sm">
                        {info.avatar_url ? (
                            <img src={info.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <FiUser size={80} />
                            </div>
                        )}
                    </div>
                </SectionWrapper>
            </div>

            {/* Objective */}
            <SectionWrapper section="summary">
                <div>
                    <SectionTitle title="MỤC TIÊU NGHỀ NGHIỆP" />
                    <p className="text-sm text-slate-800 leading-relaxed italic">
                        {data.summary || "Tôi có kinh nghiệm tại vị sự Nhân viên kinh doanh đa ngành. Mong muốn thăng tiến lên Trưởng phòng trong 5 năm tới."}
                    </p>
                </div>
            </SectionWrapper>

            {/* Education */}
            <SectionWrapper section="education">
                <div>
                    <SectionTitle title="HỌC VẤN" />
                    <div className="space-y-4">
                        {(data.education || [{
                            school: "Đại học X",
                            degree: "Cử nhân Công nghệ",
                            year: "2018 - 2022"
                        }]).map((edu, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-24 shrink-0 font-bold text-xs text-[#1D4ED8] pt-1 uppercase">{edu.year}</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900">{edu.school}</h4>
                                    <div className="text-sm text-slate-700">{edu.degree}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionWrapper>

            {/* Experience */}
            <SectionWrapper section="experiences">
                <div>
                    <SectionTitle title="KINH NGHIỆM LÀM VIỆC" />
                    <div className="space-y-6">
                        {(data.experiences || [{
                            company: "Công ty ABC",
                            position: "Vị trí",
                            duration: "2023 - 2024",
                            description: "Mô tả công việc chi tiết..."
                        }]).map((exp, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-24 shrink-0 font-bold text-xs text-[#1D4ED8] pt-1 uppercase">{exp.duration}</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900">{exp.company}</h4>
                                    <div className="text-sm italic text-slate-500 mb-2">{exp.position}</div>
                                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                        {exp.description?.split('\n').map((line, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <span className="text-[#1D4ED8]">•</span>
                                                <span>{line.replace(/^•\s?/, '')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionWrapper>

            {/* Skills */}
            <SectionWrapper section="skills">
                <div className="mb-6">
                    <SectionTitle title="CÁC KỸ NĂNG" />
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        {(data.skills || [{ name: "Kỹ năng mẫu" }]).map((s, i) => (
                            <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50">
                                <FiCheckCircle className="text-[#1D4ED8] shrink-0" size={16} />
                                <span className="font-bold text-slate-800 text-sm">{s.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionWrapper>

            {/* Bottom Grid: Certificates & Languages & Projects */}
            <div className="grid grid-cols-2 gap-10 mt-4">
                <SectionWrapper section="certifications">
                    <div>
                        <SectionTitle title="CHỨNG CHỈ" />
                        <div className="space-y-2">
                            {(data.certifications || [{ name: "Chứng chỉ mẫu", year: "2024" }]).map((c, i) => (
                                <div key={i} className="flex justify-between items-center text-sm border-l-2 border-[#1D4ED8] pl-3 py-1 bg-slate-50/50">
                                    <span className="text-slate-900 font-medium">{c.name}</span>
                                    <span className="text-[#1D4ED8] font-bold text-xs shrink-0 ml-4">{c.year}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>

                <SectionWrapper section="references">
                    <div>
                        <SectionTitle title="NGƯỜI GIỚI THIỆU" />
                        <div className="space-y-4 italic text-sm text-slate-600">
                            {(data.references || [{ name: "Nguyễn Văn A", position: "CEO công ty", phone: "0123456789" }]).map((r, i) => (
                                <div key={i}>
                                    <div className="font-bold text-slate-900 non-italic">{r.name}</div>
                                    <div>{r.position}</div>
                                    <div>{r.phone}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            </div>
        </div>
    );
};

export default CV005;
