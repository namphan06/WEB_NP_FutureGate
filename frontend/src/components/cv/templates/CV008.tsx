import React from 'react';
import type { CVTemplateProps } from '../types';
import { FiPhone, FiMail, FiMapPin, FiGlobe, FiUser } from 'react-icons/fi';
import '../cv-templates.css';

const CV008: React.FC<CVTemplateProps> = ({ data, onSectionTap, isViewOnly }) => {
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
        <div className="cv-container bg-white flex flex-col font-sans">
            {/* Executive Header */}
            <div className="bg-[#1B3E6A] p-10 pt-20 pb-16 flex items-center gap-10">
                <SectionWrapper section="avatar">
                    <div className="w-36 h-36 rounded-full border-4 border-white shadow-xl overflow-hidden shrink-0 bg-[#142D4C]">
                        {info.avatar_url ? (
                            <img src={info.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                <FiUser size={80} />
                            </div>
                        )}
                    </div>
                </SectionWrapper>

                <div className="flex-1">
                    <SectionWrapper section="cv_name">
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-4 leading-none">
                                {info.full_name || "EXECUTIVE PRINCIPAL"}
                            </h1>
                            <div className="inline-block bg-[#F0F4F8] text-[#1B3E6A] px-5 py-2 font-bold text-xs tracking-[0.2rem] uppercase">
                                {info.title || "Managing Director & CFO"}
                            </div>
                        </div>
                    </SectionWrapper>
                </div>
            </div>

            <div className="p-10 flex gap-12">
                {/* Main Content Column */}
                <div className="flex-[65] flex flex-col gap-10">
                    <SectionWrapper section="summary">
                        <div>
                            <h3 className="text-sm font-black text-[#1B3E6A] tracking-widest uppercase mb-2">EXECUTIVE SUMMARY</h3>
                            <div className="w-10 h-0.5 bg-[#1B3E6A] mb-6" />
                            <p className="text-sm text-slate-800 leading-loose text-justify font-medium">
                                {data.summary || "Detail-oriented Finance Professional with 7+ years of experience in strategic planning, financial risk management, and ROI analysis."}
                            </p>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="experiences">
                        <div>
                            <h3 className="text-sm font-black text-[#1B3E6A] tracking-widest uppercase mb-2">PROFESSIONAL CAREER</h3>
                            <div className="w-10 h-0.5 bg-[#1B3E6A] mb-10" />
                            <div className="flex flex-col gap-10">
                                {(data.experiences || [{
                                    company: "Global Assets Corp",
                                    position: "Financial Director",
                                    duration: "2020 - Present",
                                    description: "Spearheaded the restructuring of capital allocation across three international divisions."
                                }]).map((exp, i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="text-lg font-bold text-[#1B3E6A]">{exp.position}</h4>
                                            <span className="text-[11px] font-black text-slate-400 shrink-0 ml-4 uppercase">{exp.duration}</span>
                                        </div>
                                        <div className="font-bold text-[#DAA520] text-sm uppercase tracking-wider mb-2">{exp.company}</div>
                                        <p className="text-sm text-slate-700 leading-loose text-justify italic">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="projects">
                        <div>
                            <h3 className="text-sm font-black text-[#1B3E6A] tracking-widest uppercase mb-2">KEY ACHIEVEMENTS</h3>
                            <div className="w-10 h-0.5 bg-[#1B3E6A] mb-6" />
                            <div className="space-y-6">
                                {(data.projects || [{
                                    role: "Post-Merger Integration",
                                    description: "Led the financial integration of a $200M acquisition, achieving 15% cost savings."
                                }]).map((p, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="mt-1 shrink-0 text-[#DAA520]">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-[#1B3E6A] mb-1">{(p as any).role || (p as any).name}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed italic">{p.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>
                </div>

                {/* Sidebar Column */}
                <div className="flex-[35] flex flex-col gap-10">
                    <SectionWrapper section="personal_details">
                        <div>
                            <div className="bg-[#F0F4F8] px-4 py-2 mb-6">
                                <h3 className="text-xs font-black text-[#1B3E6A] tracking-[0.15rem] uppercase">THE ADVISOR</h3>
                            </div>
                            <div className="flex flex-col gap-4 text-xs tracking-wider text-slate-700 font-medium">
                                <div className="flex items-center gap-4">
                                    <FiPhone size={14} className="text-slate-400 shrink-0" />
                                    <span className="truncate">{info.phone || "+84 000 000 000"}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <FiMail size={14} className="text-slate-400 shrink-0" />
                                    <span className="truncate">{info.email || "finance@corporate.com"}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <FiMapPin size={14} className="text-slate-400 shrink-0" />
                                    <span className="truncate">{info.address || "Financial Hub"}</span>
                                </div>
                                {info.website && (
                                    <div className="flex items-center gap-4">
                                        <FiGlobe size={14} className="text-slate-400 shrink-0" />
                                        <span className="truncate">{info.website}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="skills">
                        <div>
                            <div className="bg-[#F0F4F8] px-4 py-2 mb-6">
                                <h3 className="text-xs font-black text-[#1B3E6A] tracking-[0.15rem] uppercase">COMPETENCIES</h3>
                            </div>
                            <div className="flex flex-col gap-4">
                                {(data.skills || [{ name: "Financial Analysis" }, { name: "M&A Strategy" }]).map((s, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-[#1B3E6A] rounded-full shrink-0" />
                                        <span className="text-[11px] font-bold text-slate-800 tracking-wider font-sans">{s.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="certifications">
                        <div>
                            <div className="bg-[#F0F4F8] px-4 py-2 mb-6">
                                <h3 className="text-xs font-black text-[#1B3E6A] tracking-[0.15rem] uppercase">CERTIFICATIONS</h3>
                            </div>
                            <div className="flex flex-col gap-3">
                                {(data.certifications || [{ name: "Chartered Financial Analyst (CFA)" }]).map((c, i) => (
                                    <div key={i} className="text-[11px] font-medium text-slate-700 leading-relaxed border-l-2 border-[#DAA520] pl-3 py-0.5">
                                        {c.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="education">
                        <div>
                            <div className="bg-[#F0F4F8] px-4 py-2 mb-6">
                                <h3 className="text-xs font-black text-[#1B3E6A] tracking-[0.15rem] uppercase">EDUCATION</h3>
                            </div>
                            <div className="space-y-6">
                                {(data.education || [{
                                    school: "Business School",
                                    degree: "Master of Finance",
                                    year: "2013 - 2015"
                                }]).map((edu, i) => (
                                    <div key={i}>
                                        <div className="text-[11px] font-black text-slate-900 mb-1 leading-tight">{edu.school}</div>
                                        <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-wider">{edu.degree}</div>
                                        <div className="text-[10px] text-[#1B3E6A] font-black tracking-widest">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>
                </div>
            </div>
        </div>
    );
};

export default CV008;
