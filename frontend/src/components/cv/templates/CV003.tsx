import React from 'react';
import type { CVTemplateProps } from '../types';
import { FiMail, FiPhone, FiMapPin, FiLink } from 'react-icons/fi';
import '../cv-templates.css';

const CV003: React.FC<CVTemplateProps> = ({ data, onSectionTap, isViewOnly }) => {
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
        <div className="cv-container p-6 flex flex-col gap-8 font-mono">
            {/* Header */}
            <SectionWrapper section="cv_name">
                <div className="bg-[#2D3748] p-8 rounded-lg flex justify-between items-center text-white">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-widest uppercase mb-2">
                            {info.full_name || "NGUYỄN VĂN C"}
                        </h1>
                        <p className="text-[#63B3ED] text-lg font-medium uppercase tracking-wider">
                            {info.title || "Senior Software Engineer"}
                        </p>
                    </div>
                    {info.avatar_url && (
                        <div className="w-24 h-24 rounded-full border-4 border-[#4A5568] overflow-hidden ml-6 shrink-0">
                            <img src={info.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
            </SectionWrapper>

            {/* Contact Info Bar */}
            <SectionWrapper section="personal_info">
                <div className="bg-slate-100 p-4 rounded border border-slate-200 grid grid-cols-2 gap-4">
                    {[
                        { icon: FiMail, text: info.email || "email@example.com" },
                        { icon: FiPhone, text: info.phone || "0987654321" },
                        { icon: FiMapPin, text: info.address || "Hồ Chí Minh" },
                        { icon: FiLink, text: info.website || "github.com/username" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-[#2D3748] text-sm overflow-hidden">
                            <item.icon className="shrink-0 text-slate-500" />
                            <span className="truncate font-medium">{item.text}</span>
                        </div>
                    ))}
                </div>
            </SectionWrapper>

            {/* Main Content */}
            <div className="flex flex-col gap-8">
                {/* Skills */}
                <SectionWrapper section="skills">
                    <div>
                        <h3 className="text-xl font-bold text-[#2D3748] uppercase tracking-widest mb-4 border-b-2 border-slate-200 pb-2">Technical Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {(data.skills || [{ name: "Flutter" }, { name: "Dart" }, { name: "Firebase" }, { name: "React" }]).map((s, i) => (
                                <span key={i} className="px-3 py-1 bg-[#EBF8FF] text-[#2C5282] text-sm font-bold rounded border border-[#BEE3F8]">
                                    {s.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>

                {/* Experience */}
                <SectionWrapper section="experiences">
                    <div>
                        <h3 className="text-xl font-bold text-[#2D3748] uppercase tracking-widest mb-6 border-b-2 border-slate-200 pb-2">Work Experience</h3>
                        <div className="flex flex-col gap-8">
                            {(data.experiences || [{
                                company: "Tech Corp",
                                position: "Senior Developer",
                                duration: "2020 - Present",
                                description: "• Led a team of 5 developers.\n• Architected the new mobile app using Flutter.\n• Improved app performance by 40%."
                            }]).map((exp, i) => (
                                <div key={i} className="flex gap-6">
                                    <div className="w-32 shrink-0 text-slate-500 font-bold text-sm pt-1">{exp.duration}</div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-bold text-[#2D3748]">{exp.position}</h4>
                                        <div className="text-blue-600 font-bold mb-3">{exp.company}</div>
                                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>

                {/* Projects */}
                <SectionWrapper section="projects">
                    <div>
                        <h3 className="text-xl font-bold text-[#2D3748] uppercase tracking-widest mb-6 border-b-2 border-slate-200 pb-2">Key Projects</h3>
                        <div className="grid grid-cols-1 gap-6">
                            {(data.projects || [{
                                name: "Project Name",
                                description: "Mô tả dự án kỹ thuật chuyên sâu..."
                            }]).map((p, i) => (
                                <div key={i}>
                                    <h4 className="font-bold text-[#2D3748] mb-1">{p.name}</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">{p.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>

                {/* Education */}
                <SectionWrapper section="education">
                    <div>
                        <h3 className="text-xl font-bold text-[#2D3748] uppercase tracking-widest mb-4 border-b-2 border-slate-200 pb-2">Education</h3>
                        <div className="flex flex-col gap-4">
                            {(data.education || [{
                                school: "University of Technology",
                                degree: "BS in Computer Science",
                                year: "2015 - 2019"
                            }]).map((edu, i) => (
                                <div key={i} className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-[#2D3748]">{edu.school}</h4>
                                        <p className="text-sm text-slate-600">{edu.degree}</p>
                                    </div>
                                    <span className="text-slate-500 font-bold text-sm tracking-widest">{edu.year}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionWrapper>
            </div>
        </div>
    );
};

export default CV003;
