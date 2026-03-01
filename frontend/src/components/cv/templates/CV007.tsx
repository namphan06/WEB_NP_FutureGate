import React from 'react';
import type { CVTemplateProps } from '../types';
import '../cv-templates.css';

const CV007: React.FC<CVTemplateProps> = ({ data, onSectionTap, isViewOnly }) => {
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
        <div className="cv-container bg-white flex flex-col font-serif min-h-[1120px]">
            {/* Sleek Top Accent */}
            <div className="h-3 bg-black w-full" />

            <div className="p-16 pt-20 flex flex-col gap-24">
                {/* Header */}
                <div className="flex justify-between items-start gap-12">
                    <div className="flex-1">
                        <SectionWrapper section="cv_name">
                            <div>
                                <h1 className="text-6xl font-black text-black tracking-tighter leading-none mb-6">
                                    {info.full_name || "CREATIVE NAME"}
                                </h1>
                                <div className="w-20 h-0.5 bg-[#C5A059] mb-6" />
                                <p className="font-sans text-sm tracking-[0.5rem] uppercase text-slate-500 font-light">
                                    {info.title || "Senior Visual Designer"}
                                </p>
                            </div>
                        </SectionWrapper>
                    </div>

                    <SectionWrapper section="avatar">
                        <div className="w-48 h-48 bg-slate-100 border border-black/10 overflow-hidden shrink-0">
                            {info.avatar_url ? (
                                <img src={info.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#C5A059]">
                                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                            )}
                        </div>
                    </SectionWrapper>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-5 gap-20">
                    <div className="col-span-3 flex flex-col gap-20">
                        {/* Philosophy */}
                        <SectionWrapper section="summary">
                            <div>
                                <h3 className="font-sans text-xs font-bold tracking-[0.3rem] text-[#C5A059] uppercase mb-8">THE PHILOSOPHY</h3>
                                <p className="font-sans text-[15px] leading-loose text-slate-800 font-light">
                                    {data.summary || "Believer in the balance of form and function. Crafting digital experiences that tell compelling stories through thoughtful design systems and visual precision."}
                                </p>
                            </div>
                        </SectionWrapper>

                        {/* Experience */}
                        <SectionWrapper section="experiences">
                            <div>
                                <h3 className="font-sans text-xs font-bold tracking-[0.3rem] text-[#C5A059] uppercase mb-10">CAREER HISTORY</h3>
                                <div className="flex flex-col gap-16">
                                    {(data.experiences || [{
                                        company: "Design Studio",
                                        position: "Art Director",
                                        duration: "2020 - Present",
                                        description: "Responsible for visual identity systems and brand evolution."
                                    }]).map((exp, i) => (
                                        <div key={i} className="flex flex-col gap-4">
                                            <div className="flex justify-between items-baseline">
                                                <h4 className="text-2xl font-bold text-black">{exp.company}</h4>
                                                <span className="font-sans text-[10px] font-bold text-slate-400 tracking-wider shrink-0 ml-4 uppercase">{exp.duration}</span>
                                            </div>
                                            <p className="font-sans text-xs font-bold tracking-[0.2rem] text-[#C5A059] uppercase">{exp.position}</p>
                                            <p className="font-sans text-sm leading-loose text-slate-700 font-light mt-4 italic">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SectionWrapper>

                        {/* Recognition/Activities */}
                        <SectionWrapper section="projects">
                            <div>
                                <h3 className="font-sans text-xs font-bold tracking-[0.3rem] text-[#C5A059] uppercase mb-10">RECOGNITION</h3>
                                <div className="space-y-8">
                                    {(data.projects || [{
                                        role: "Design Award 2023",
                                        description: "First place in Visual Design category for national project."
                                    }]).map((p, i) => (
                                        <div key={i} className="flex gap-4">
                                            <span className="text-[#C5A059] font-sans text-sm">—</span>
                                            <div className="flex-1">
                                                <h4 className="font-sans text-sm font-bold text-black mb-2">{(p as any).role || (p as any).name}</h4>
                                                <p className="font-sans text-xs leading-loose text-slate-500 font-light">{p.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SectionWrapper>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-2 flex flex-col gap-16 uppercase font-sans">
                        <SectionWrapper section="personal_details">
                            <div>
                                <h3 className="text-[11px] font-black tracking-[0.2rem] text-black mb-8">THE CONNECTION</h3>
                                <div className="flex flex-col gap-4 text-xs tracking-wider text-slate-800 font-light">
                                    <div className="hover:text-[#C5A059] transition-colors">{info.phone || "+84 000 000 000"}</div>
                                    <div className="hover:text-[#C5A059] transition-colors truncate">{info.email || "design@studio.com"}</div>
                                    <div className="hover:text-[#C5A059] transition-colors">{info.address || "Metropolis City"}</div>
                                    {info.website && <div className="hover:text-[#C5A059] transition-colors truncate">{info.website}</div>}
                                </div>
                            </div>
                        </SectionWrapper>

                        <SectionWrapper section="skills">
                            <div>
                                <h3 className="text-[11px] font-black tracking-[0.2rem] text-black mb-8">THE ARSENAL</h3>
                                <div className="flex flex-col gap-4">
                                    {(data.skills || [{ name: "Adobe CC" }, { name: "Figma" }]).map((s, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 bg-[#C5A059] shrink-0" />
                                            <span className="text-[11px] font-bold text-slate-800 tracking-widest">{s.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SectionWrapper>

                        <SectionWrapper section="education">
                            <div>
                                <h3 className="text-[11px] font-black tracking-[0.2rem] text-black mb-8">ACADEMIC ROOT</h3>
                                <div className="space-y-6">
                                    {(data.education || [{
                                        school: "Art Academy",
                                        degree: "BFA in Design",
                                        year: "2015 - 2019"
                                    }]).map((edu, i) => (
                                        <div key={i}>
                                            <div className="text-[11px] font-black text-slate-900 mb-1">{edu.school}</div>
                                            <div className="text-[10px] text-slate-500 font-medium mb-1 tracking-wider">{edu.degree}</div>
                                            <div className="text-[10px] text-[#C5A059] font-bold tracking-widest">{edu.year}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SectionWrapper>

                        <SectionWrapper section="languages">
                            <div>
                                <h3 className="text-[11px] font-black tracking-[0.2rem] text-black mb-8">LANGUAGES</h3>
                                <div className="flex flex-wrap gap-x-6 gap-y-3">
                                    {(data.languages || [{ name: "English" }, { name: "Vietnamese" }]).map((l, i) => (
                                        <span key={i} className="text-[11px] font-black text-slate-900 tracking-widest">{l.name}</span>
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

export default CV007;
