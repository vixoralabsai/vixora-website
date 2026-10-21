import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Download, Check, Sparkles, Terminal, Code2, Layers, CheckCircle2 } from 'lucide-react';
import { AcademyCourse, CourseSyllabusModule } from '../../data/vixoraContent';
import { BRAND_CONFIG } from '../../data/brandConfig';
import { StickerLabel, TactileButton } from './CourseVisualDecorations';

interface CourseCurriculumSectionProps {
  course: AcademyCourse;
}

export const CourseCurriculumSection: React.FC<CourseCurriculumSectionProps> = ({ course }) => {
  const [expandedModules, setExpandedModules] = useState<{ [key: number]: boolean }>({ 0: true, 1: true });
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const toggleModule = (idx: number) => {
    setExpandedModules(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const toggleAll = (expand: boolean) => {
    const next: { [key: number]: boolean } = {};
    course.weeklySyllabus.forEach((_, idx) => {
      next[idx] = expand;
    });
    setExpandedModules(next);
  };

  const handleDownloadSyllabus = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);

    const content =
      `VIXORA ACADEMY — OFFICIAL COURSE SYLLABUS\n` +
      `======================================================\n` +
      `Course: ${course.title}\n` +
      `Track: ${course.track}\n` +
      `Level: ${course.level}\n` +
      `Duration: ${course.duration}\n` +
      `Format: ${course.format}\n` +
      `Tuition: ${course.tuition}\n` +
      `Next Cohort: ${course.nextCohortDate}\n\n` +
      `COURSE OVERVIEW:\n${course.description}\n\n` +
      `WEEK-BY-WEEK CURRICULUM BREAKDOWN:\n` +
      `======================================================\n` +
      course.weeklySyllabus
        .map(
          m =>
            `${m.week}: ${m.title}\nDescription: ${m.description}\nKey Topics: ${m.topics.join(', ')}\nHands-On Lab: ${m.handsOnLab}\n`
        )
        .join('\n------------------------------------------------------\n') +
      `\n\nOFFICIAL ENROLLMENT PORTAL:\n${BRAND_CONFIG.academyDomain}/course/${course.slug}\n` +
      `Admissions WhatsApp: ${BRAND_CONFIG.whatsapp.usAndGlobal.displayNumber} / ${BRAND_CONFIG.whatsapp.nigeria.displayNumber}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vixora-Academy-${course.slug}-Syllabus.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="curriculum" className="bg-[#FFFDF9] border-b-2 border-[#1A1D4F] py-20 lg:py-24 text-left">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <StickerLabel color="bg-[#5B5FED]" textColor="text-white" rotate={0}>
            Week-By-Week Syllabus Blueprint
          </StickerLabel>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#1A1D4F] tracking-tight">
            Curriculum Engineered for Mastery.
          </h2>
          <p className="text-base text-[#1A1D4F]/80">
            A battle-tested progression from first principles to advanced production systems. Every module includes live lecture, hands-on lab, and project code.
          </p>
        </div>

        {/* Toolbar: Stats & Expand/Collapse & Download */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border-2 border-[#1A1D4F] shadow-retro rounded-2xl mb-8">
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold text-[#1A1D4F]">
            <span className="px-2.5 py-1 bg-[#FFF6EC] border border-[#1A1D4F] rounded-lg">
              {course.weeklySyllabus.length} Modules
            </span>
            <span className="px-2.5 py-1 bg-[#FFF6EC] border border-[#1A1D4F] rounded-lg">
              {course.duration}
            </span>
            <span className="hidden sm:inline-block text-[#10B981] font-black">
              · 100% Practical Labs
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleAll(true)}
              className="text-xs font-bold px-2.5 py-1 text-[#1A1D4F] hover:text-[#5B5FED] transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <span className="text-[#1A1D4F]/30">|</span>
            <button
              onClick={() => toggleAll(false)}
              className="text-xs font-bold px-2.5 py-1 text-[#1A1D4F] hover:text-[#5B5FED] transition-colors cursor-pointer"
            >
              Collapse All
            </button>
            <button
              onClick={handleDownloadSyllabus}
              className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFC107] text-[#1A1D4F] border-2 border-[#1A1D4F] shadow-retro-sm hover:translate-x-[1px] hover:translate-y-[1px] rounded-lg text-xs font-black transition-all cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Syllabus</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modules Accordion List */}
        <div className="space-y-4">
          {course.weeklySyllabus.map((module: CourseSyllabusModule, idx: number) => {
            const isExpanded = Boolean(expandedModules[idx]);
            return (
              <div
                key={idx}
                className="bg-white border-2 border-[#1A1D4F] shadow-retro rounded-2xl overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleModule(idx)}
                  className="w-full p-5 sm:p-6 flex items-start justify-between gap-4 text-left hover:bg-[#FFFDF9] transition-colors cursor-pointer select-none"
                >
                  <div className="space-y-1.5 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-[11px] font-black uppercase font-mono bg-[#FFF6EC] border border-[#1A1D4F] rounded-md text-[#FF8A65]">
                        {module.week}
                      </span>
                      <span className="text-xs font-bold text-[#1A1D4F]/60">
                        Module {idx + 1}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-[#1A1D4F]">
                      {module.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#1A1D4F]/75 line-clamp-2">
                      {module.description}
                    </p>
                  </div>

                  <div className="shrink-0 w-8 h-8 rounded-full border-2 border-[#1A1D4F] bg-[#F1F5F9] flex items-center justify-center text-[#1A1D4F] mt-1 shadow-retro-sm">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-6 sm:px-6 sm:pb-7 pt-2 border-t-2 border-[#1A1D4F]/10 bg-[#FFFDF9] space-y-4 animate-in fade-in duration-200">
                    {/* Topics Pill Cloud */}
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-wider text-[#1A1D4F]/60 mb-2">
                        Key Competencies & Concepts:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {module.topics.map((topic, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-white border border-[#1A1D4F]/30 rounded-md text-[#1A1D4F]"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#5B5FED]"></span>
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Hands-On Lab Assignment Callout */}
                    <div className="p-4 bg-[#FFF6EC] border-2 border-[#1A1D4F] rounded-xl text-left">
                      <div className="flex items-center gap-2 text-xs font-black uppercase text-[#1A1D4F] mb-1">
                        <Terminal className="w-4 h-4 text-[#FF8A65]" />
                        <span>Hands-On Production Lab:</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#1A1D4F] font-medium leading-relaxed">
                        {module.handsOnLab}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
