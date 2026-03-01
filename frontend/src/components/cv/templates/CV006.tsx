import React from 'react';
import type { CVTemplateProps } from '../types';
import { FiPhone, FiMail, FiMapPin, FiLink, FiUser, FiStar } from 'react-icons/fi';
import '../cv-templates.css';

const CV006: React.FC<CVTemplateProps> = ({ data, onSectionTap, isViewOnly }) => {
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
            {/* Dynamic Header */}
            <div className="bg-[#1A237E] relative overflow-hidden p-10 pt-20 pb-16">
                {/* Decorative circle */}
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#FF5722]/20 rounded-full" />

                <div className="relative flex items-center gap-10">
                    <SectionWrapper section="avatar">
                        <div className="w-32 h-32 bg-white rounded-2xl p-1 shadow-2xl shrink-0 overflow-hidden">
                            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-100 italic flex items-center justify-center text-slate-300">
                                {info.avatar_url ? (
                                    <img src={info.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <FiUser size={64} />
                                )}
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="cv_name">
                        <div className="flex-1">
                            <h1 className="text-4xl font-extrabold text-white tracking-widest uppercase mb-4 leading-none">
                                {info.full_name || "MARKETING PROFESSIONAL"}
                            </h1>
                            <div className="inline-block bg-[#FF5722] text-white px-4 py-2 rounded text-sm font-bold tracking-widest uppercase whitespace-nowrap">
                                {info.title || "Global Brand Specialist"}
                            </div>
                        </div>
                    </SectionWrapper>
                </div>
            </div>

            <div className="p-10 flex flex-col gap-10">
                {/* Summary */}
                <SectionWrapper section="summary">
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-1 w-10 bg-[#FF5722]" />
                            <h3 className="text-lg font-bold text-[#1A237E] tracking-widest uppercase">MARKETING OBJECTIVE</h3>
                        </div>
                        <p className="text-sm text-slate-700 leading-loose font-medium">
                            {data.summary || "Creative and data-driven Growth Marketer with a passion for brand storytelling and performance marketing. Specialized in digital transformation and customer acquisition strategies."}
                        </p>
                    </div>
                </SectionWrapper>

                <div className="grid grid-cols-5 gap-10">
                    {/* Main Column */}
                    <div className="col-span-3 flex flex-col gap-10">
                        <SectionWrapper section="experiences">
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-1 w-10 bg-[#FF5722]" />
                                    <h3 className="text-lg font-bold text-[#1A237E] tracking-widest uppercase">PROFESSIONAL EXPERIENCE</h3>
                                </div>
                                <div className="flex flex-col gap-8">
                                    {(data.experiences || [{
                                        company: "Agency X",
                                        position: "Senior Account Manager",
                                        duration: "2020 - Present",
                                        description: "Managed major accounts and increased client ROI by 30%..."
                                    }]).map((exp, i) => (
                                        <div key={i} className="flex flex-col gap-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-[#FF5722] text-lg">{exp.position}</h4>
                                                <span className="text-[10px] uppercase font-black text-[#1A237E] mt-1 shrink-0 ml-4">{exp.duration}</span>
                                            </div>
                                            <div className="font-bold text-slate-500 text-sm mb-3 uppercase tracking-wider">{exp.company}</div>
                                            <p className="text-sm text-slate-800 leading-relaxed font-medium">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SectionWrapper>

                        <SectionWrapper section="projects">
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-1 w-10 bg-[#FF5722]" />
                                    <h3 className="text-lg font-bold text-[#1A237E] tracking-widest uppercase">KEY CAMPAIGNS</h3>
                                </div>
                                <div className="grid gap-4">
                                    {(data.projects || [{
                                        name: "Summer Campaign 2023",
                                        description: "Lead marketing strategy for nationwide launch."
                                    }]).map((p, i) => (
                                        <div key={i} className="bg-[#FBE9E7] p-5 rounded-lg border border-[#FF5722]/10 flex gap-4">
                                            <div className="w-2 h-2 rounded-full bg-[#1A237E] mt-1.5 shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm mb-1">{p.name}</h4>
                                                <p className="text-xs text-slate-700 leading-relaxed">{p.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SectionWrapper>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-2 flex flex-col gap-10">
                        <SectionWrapper section="personal_details">
                            <div>
                                <h3 className="text-sm font-black text-[#FF5722] tracking-widest uppercase mb-4 border-b pb-2">GET IN TOUCH</h3>
                                <div className="space-y-4">
                                    {[
                                        { icon: FiPhone, text: info.phone || "+84 000 000 000" },
                                        { icon: FiMail, text: info.email || "hello@marketer.com" },
                                        { icon: FiMapPin, text: info.address || "Ho Chi Minh, Vietnam" },
                                        { icon: FiLink, text: info.website || "marketer.com/portfolio" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4 items-center text-slate-700">
                                            <item.icon size={16} className="text-slate-400 shrink-0" />
                                            <span className="text-xs font-bold truncate">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SectionWrapper>

                        <SectionWrapper section="skills">
                            <div>
                                <h3 className="text-sm font-black text-[#FF5722] tracking-widest uppercase mb-4 border-b pb-2">STRATEGIC SKILLS</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(data.skills || [{ name: "Digital Marketing" }, { name: "Brand Strategy" }]).map((s, i) => (
                                        <span key={i} className="bg-white border border-[#1A237E]/10 px-3 py-1.5 rounded text-[10px] font-black text-[#1A237E] uppercase tracking-wider">
                                            {s.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </SectionWrapper>

                        <SectionWrapper section="education">
                            <div>
                                <h3 className="text-sm font-black text-[#FF5722] tracking-widest uppercase mb-4 border-b pb-2">EDUCATION</h3>
                                <div className="space-y-4">
                                    {(data.education || [{
                                        school: "Marketing Institute",
                                        degree: "MA in Communication",
                                        year: "2015 - 2017"
                                    }]).map((edu, i) => (
                                        <div key={i}>
                                            <div className="font-bold text-slate-900 text-xs">{edu.school}</div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase">{edu.degree}</div>
                                            <div className="text-[10px] font-black text-[#FF5722] mt-1">{edu.year}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SectionWrapper>

                        <SectionWrapper section="awards">
                            <div>
                                <h3 className="text-sm font-black text-[#FF5722] tracking-widest uppercase mb-4 border-b pb-2">HONORS</h3>
                                <div className="space-y-3">
                                    {(data.awards || [{ name: "Best Campaign Award", year: "2022" }]).map((aw, i) => (
                                        <div key={i} className="flex gap-3 items-start">
                                            <FiStar size={14} className="text-[#FF5722] shrink-0 mt-0.5" />
                                            <span className="text-xs font-bold italic text-slate-700">{aw.name} ({aw.year})</span>
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

export default CV006;
