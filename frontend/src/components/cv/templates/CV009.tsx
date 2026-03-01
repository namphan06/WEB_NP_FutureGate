import React from 'react';
import type { CVTemplateProps } from '../types';
import { FiPhone, FiMail, FiMapPin, FiActivity, FiCheckCircle, FiUser } from 'react-icons/fi';
import '../cv-templates.css';

const CV009: React.FC<CVTemplateProps> = ({ data, onSectionTap, isViewOnly }) => {
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
        <div className="cv-container bg-white flex flex-col font-serif">
            {/* Medical Header */}
            <div className="p-10 pt-16 flex items-center gap-12 bg-slate-50/50">
                <SectionWrapper section="avatar">
                    <div className="relative">
                        <div className="w-40 h-40 rounded-full border-[3px] border-[#00796B] overflow-hidden bg-white shadow-[0_0_20px_rgba(0,121,107,0.1)] shrink-0">
                            {info.avatar_url ? (
                                <img src={info.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-100 bg-slate-50">
                                    <FiUser size={80} />
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md">
                            <FiActivity className="text-[#00796B] w-6 h-6" />
                        </div>
                    </div>
                </SectionWrapper>

                <div className="flex-1">
                    <SectionWrapper section="cv_name">
                        <div>
                            <h1 className="text-4xl font-black text-[#00796B] tracking-tight leading-none mb-3">
                                {info.full_name || "DR. CLINICAL EXPERT"}
                            </h1>
                            <p className="font-sans text-sm tracking-[0.25rem] font-bold text-[#0097A7] uppercase mb-4">
                                {info.title || "Senior Consultant Specialist"}
                            </p>
                            <div className="h-1 w-24 bg-[#00796B]" />
                        </div>
                    </SectionWrapper>
                </div>
            </div>

            <div className="p-12 flex gap-16">
                {/* Left Column: Practice & Summary */}
                <div className="flex-[3] flex flex-col gap-12">
                    <SectionWrapper section="summary">
                        <div>
                            <h3 className="font-sans text-sm font-black tracking-widest text-[#00796B] uppercase mb-4">CLINICAL SUMMARY</h3>
                            <div className="h-px w-full bg-[#00796B]/20 mb-6" />
                            <p className="text-[14px] leading-[1.8] text-slate-800 italic">
                                {data.summary || "Dedicated medical professional with extensive experience in patient care and clinical research. Committed to providing evidence-based treatment and improving patient outcomes."}
                            </p>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="experiences">
                        <div>
                            <h3 className="font-sans text-sm font-black tracking-widest text-[#00796B] uppercase mb-4">PRACTICE HISTORY</h3>
                            <div className="h-px w-full bg-[#00796B]/20 mb-10" />
                            <div className="flex flex-col gap-10">
                                {(data.experiences || [{
                                    company: "City General Hospital",
                                    position: "Chief of Medicine",
                                    duration: "2018 - Present",
                                    description: "Overseeing internal medicine department and leading specialized clinical trials."
                                }]).map((exp, i) => (
                                    <div key={i} className="flex gap-6">
                                        <div className="w-1 bg-[#00796B]/20 shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-baseline mb-2">
                                                <h4 className="text-lg font-bold text-[#00796B]">{exp.position}</h4>
                                                <span className="font-sans text-[10px] font-bold text-[#0097A7] shrink-0 ml-4 uppercase tracking-wider">{exp.duration}</span>
                                            </div>
                                            <div className="font-bold text-slate-900 text-sm mb-4">{exp.company}</div>
                                            <p className="text-sm leading-relaxed text-slate-700">{exp.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="activities">
                        <div>
                            <h3 className="font-sans text-sm font-black tracking-widest text-[#00796B] uppercase mb-4">VOLUNTEERING</h3>
                            <div className="h-px w-full bg-[#00796B]/20 mb-8" />
                            <div className="space-y-6">
                                {(data.activities || [{
                                    role: "Medical Outreach Lead",
                                    description: "Organized community health screenings and educational workshops."
                                }]).map((act, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="mt-1 shrink-0 text-[#0097A7]">
                                            <div className="w-2 h-2 rounded-full border-2 border-currentColor" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 mb-1">{(act as any).role || (act as any).name}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed italic">{act.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>
                </div>

                {/* Right Column: Sidebar */}
                <div className="flex-[2] flex flex-col gap-12 font-sans uppercase">
                    <SectionWrapper section="personal_details">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-5 bg-[#00796B]" />
                                <h3 className="text-xs font-black tracking-[0.15rem] text-[#00796B]">CONTACT DETAILS</h3>
                            </div>
                            <div className="flex flex-col gap-4 text-[11px] tracking-wider text-slate-700 font-bold">
                                <div className="flex items-center gap-4">
                                    <FiPhone size={14} className="text-[#0097A7] shrink-0" />
                                    <span className="truncate">{info.phone || "+84 000 000 000"}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <FiMail size={14} className="text-[#0097A7] shrink-0" />
                                    <span className="truncate break-all">{info.email || "health@medical.org"}</span>
                                </div>
                                <div className="flex items-start gap-4">
                                    <FiMapPin size={14} className="text-[#0097A7] shrink-0 mt-0.5" />
                                    <span className="leading-tight">{info.address || "Metropolis Health Center"}</span>
                                </div>
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="skills">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-5 bg-[#00796B]" />
                                <h3 className="text-xs font-black tracking-[0.15rem] text-[#00796B]">CORE COMPETENCIES</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(data.skills || [{ name: "Patient Diagnosis" }, { name: "Surgery" }]).map((s, i) => (
                                    <span key={i} className="bg-[#E0F2F1] text-[#00796B] px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider">
                                        {s.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="education">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-5 bg-[#00796B]" />
                                <h3 className="text-xs font-black tracking-[0.15rem] text-[#00796B]">MEDICAL EDUCATION</h3>
                            </div>
                            <div className="space-y-6">
                                {(data.education || [{
                                    school: "Medical University",
                                    degree: "MD in Internal Medicine",
                                    year: "2010 - 2016"
                                }]).map((edu, i) => (
                                    <div key={i}>
                                        <div className="text-[11px] font-black text-slate-900 mb-1 leading-tight">{edu.school}</div>
                                        <div className="text-[10px] text-slate-500 font-bold mb-1 tracking-wider lowercase first-letter:uppercase">{edu.degree}</div>
                                        <div className="text-[10px] text-[#0097A7] font-black tracking-widest">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="certifications">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-5 bg-[#00796B]" />
                                <h3 className="text-xs font-black tracking-[0.15rem] text-[#00796B]">CERTIFICATIONS</h3>
                            </div>
                            <div className="flex flex-col gap-4">
                                {(data.certifications || [{ name: "Board Certified Physician" }]).map((c, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <FiCheckCircle size={14} className="text-[#00796B] shrink-0 mt-0.5" />
                                        <span className="text-[10px] font-bold text-slate-800 tracking-wider lowercase first-letter:uppercase">{c.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionWrapper>

                    <SectionWrapper section="languages">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-5 bg-[#00796B]" />
                                <h3 className="text-xs font-black tracking-[0.15rem] text-[#00796B]">LANGUAGES</h3>
                            </div>
                            <div className="flex flex-col gap-3">
                                {(data.languages || [{ name: "English" }, { name: "Vietnamese" }]).map((l, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-[11px] font-black text-slate-900 tracking-widest">{l.name}</span>
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

export default CV009;
