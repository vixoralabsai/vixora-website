import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  ShieldCheck,
  Zap,
  Briefcase,
  Terminal,
  Award,
  Layers,
  ArrowRight,
  MessageCircle,
  HelpCircle,
  Users,
  Compass,
  Clock,
  Calendar,
  BookOpen
} from 'lucide-react';
import { AcademyCourse, CourseCapstone, CourseFaq, CourseInstructor } from '../../data/vixoraContent';
import { getWhatsAppUrl } from '../../data/brandConfig';
import { CourseTool } from './CourseToolsData';
import { Star, StickerLabel, TactileButton } from './CourseVisualDecorations';

// ---------------------------------------------------------------------------
// 1. TOOLS MARQUEE SECTION
// ---------------------------------------------------------------------------
export const ToolsMarqueeSection: React.FC<{ tools: CourseTool[] }> = ({ tools }) => {
  return (
    <section className="bg-[#FFF6EC] border-b-2 border-[#1A1D4F] py-10 overflow-hidden text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#FF8A65]">
              Production Stack &amp; Tooling
            </span>
            <h3 className="font-display font-black text-xl sm:text-2xl text-[#1A1D4F]">
              Tools &amp; Platforms You Will Master
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 max-w-md font-medium">
            No toy simulators. You will gain hands-on muscle memory with the exact platforms industry teams run on daily.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {tools.map((tool, idx) => (
            <div
              key={idx}
              className="p-3 bg-white border-2 border-[#1A1D4F] shadow-retro-sm rounded-xl hover:-translate-y-1 hover:shadow-retro transition-all cursor-default text-center group"
            >
              <div 
                className="w-10 h-10 mx-auto rounded-lg mb-2 flex items-center justify-center font-mono font-bold text-xs border border-[#1A1D4F]/20"
                style={{ backgroundColor: `${tool.color}18`, color: tool.color }}
              >
                {tool.glyph}
              </div>
              <div className="text-xs font-black text-[#1A1D4F] truncate">{tool.name}</div>
              <div className="text-[10px] font-bold text-slate-600 truncate mt-0.5">
                {tool.category}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// 2. THE REALITY & PROBLEM SECTION
// ---------------------------------------------------------------------------
export const CourseProblemSection: React.FC<{
  problem: {
    tag: string;
    headline: string;
    sub: string;
    points: { title: string; desc: string; icon: string }[];
    quote: string;
  };
  course: AcademyCourse;
}> = ({ problem, course }) => {
  return (
    <section id="problem" className="bg-[#FFFDF9] border-b-2 border-[#1A1D4F] py-20 lg:py-24 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <StickerLabel color="bg-[#FF8A65]" textColor="text-white" rotate={0}>
            Market Context &amp; Reality
          </StickerLabel>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#1A1D4F] tracking-tight">
            {problem.headline}
          </h2>
          <p className="text-base text-slate-800 leading-relaxed font-medium">
            {problem.sub}
          </p>
        </div>

        {/* 3 Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {problem.points.map((pt, idx) => (
            <div
              key={idx}
              className="bg-white border-2 border-[#1A1D4F] shadow-retro rounded-2xl p-6 sm:p-7 space-y-3 relative hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#5B5FED]/10 border border-[#5B5FED]/30 flex items-center justify-center text-[#5B5FED] font-mono font-bold text-sm">
                  0{idx + 1}
                </div>
                <span className="font-mono text-xs font-black px-2 py-0.5 bg-[#FFF6EC] border border-[#1A1D4F] rounded text-[#1A1D4F]">
                  0{idx + 1}
                </span>
              </div>
              <h3 className="text-lg font-black text-[#1A1D4F]">{pt.title}</h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {pt.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Instructor / Industry Quote Callout */}
        {problem.quote && (
          <div className="max-w-3xl mx-auto bg-[#FFF6EC] border-2 border-[#1A1D4F] shadow-retro rounded-2xl p-6 sm:p-8 text-center space-y-3 relative">
            <span className="text-4xl text-[#FF8A65] font-serif leading-none block">“</span>
            <p className="text-sm sm:text-base font-bold text-[#1A1D4F] leading-relaxed italic">
              {problem.quote.replace(/^["']|["']$/g, '')}
            </p>
            <div className="text-xs font-black uppercase tracking-wider text-[#5B5FED]">
              — Vixora Academy Instruction Team · {course.track}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// 3. THE 4-STAGE TRANSFORMATION ROADMAP
// ---------------------------------------------------------------------------
export interface CourseTransformationPhase {
  phase: string;
  duration?: string;
  title: string;
  focus?: string;
  description?: string;
  outcome?: string;
  badgeColor?: string;
}

export const CourseRoadmapSection: React.FC<{
  phases: CourseTransformationPhase[];
}> = ({ phases }) => {
  return (
    <section id="transformation" className="bg-[#F8F9FE] border-b-2 border-[#1A1D4F] py-20 lg:py-24 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <StickerLabel color="bg-[#FFC107]" textColor="text-[#1A1D4F]" rotate={0}>
            Curriculum Roadmap
          </StickerLabel>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#1A1D4F] tracking-tight">
            The Mastery Progression.
          </h2>
          <p className="text-base text-[#1A1D4F]/80">
            A structured path designed to transform curious beginners into confident, commercially competent practitioners.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {phases.map((ph, idx) => (
            <div
              key={idx}
              className="bg-white border-2 border-[#1A1D4F] shadow-retro rounded-2xl p-6 space-y-3 relative hover:-translate-y-1 transition-transform flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase px-2 py-0.5 bg-[#FFF6EC] border border-[#1A1D4F] rounded text-[#FF8A65]">
                    {ph.phase}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#1A1D4F]/50">
                    STAGE 0{idx + 1}
                  </span>
                </div>
                {ph.duration && (
                  <div className="text-[11px] font-bold text-[#5B5FED] bg-[#EEF2FF] px-2 py-0.5 rounded border border-[#5B5FED]/20 w-fit inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#5B5FED]" />
                    <span>{ph.duration}</span>
                  </div>
                )}
                <h3 className="text-base sm:text-lg font-black text-[#1A1D4F]">
                  {ph.title}
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {ph.focus || ph.description}
                </p>
              </div>

              {(ph.outcome || ph.duration) && (
                <div className="pt-3 border-t-2 border-[#1A1D4F]/10">
                  <div className="text-[10px] font-black uppercase text-[#10B981] flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> Milestone Outcome:
                  </div>
                  <div className="text-xs font-bold text-[#1A1D4F] mt-0.5">
                    {ph.outcome || "Production deployment & portfolio verification"}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// 4. PRACTICAL CAPSTONE PROJECTS SECTION
// ---------------------------------------------------------------------------
export const CourseProjectsSection: React.FC<{
  capstones: CourseCapstone[];
  courseTitle: string;
}> = ({ capstones, courseTitle }) => {
  return (
    <section id="projects" className="bg-[#FFF6EC] border-b-2 border-[#1A1D4F] py-20 lg:py-24 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <StickerLabel color="bg-[#10B981]" textColor="text-white" rotate={0}>
            Portfolio Proof &amp; Capstones
          </StickerLabel>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#1A1D4F] tracking-tight">
            What You Will Actually Build.
          </h2>
          <p className="text-base text-slate-800 font-medium">
            No toy exercises or artificial tutorials. You will engineer production deliverables designed to command client retainers and pass technical interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capstones.map((project, idx) => (
            <div
              key={idx}
              className="bg-white border-2 border-[#1A1D4F] shadow-retro rounded-2xl p-6 sm:p-7 space-y-4 hover:-translate-y-1 transition-transform flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase px-2 py-0.5 bg-[#FFF6EC] border border-[#1A1D4F] rounded text-[#FF8A65]">
                    Capstone Project 0{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-[#10B981] flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" /> Commercial Ready
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#1A1D4F] leading-snug">
                  {project.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#1A1D4F]/80 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="pt-4 border-t-2 border-[#1A1D4F]/10">
                <div className="text-[10px] font-black uppercase text-[#1A1D4F]/50 mb-2">
                  Technologies Utilized:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 text-[11px] font-bold bg-[#F8F9FE] border border-[#1A1D4F]/20 rounded text-[#1A1D4F]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// 5. THE LEARNING EXPERIENCE (HOW YOU LEARN)
// ---------------------------------------------------------------------------
export const CoursePedagogySection: React.FC = () => {
  const pillars = [
    {
      step: '01',
      title: 'Live Interactive Masterclasses',
      desc: 'No passive video lectures. Join active weekly sessions with industry engineers where you ask questions, see live debugging, and follow step-by-step.',
      code: 'LAB-01',
      color: 'bg-[#FFC107]'
    },
    {
      step: '02',
      title: 'Hands-On Production Code Labs',
      desc: 'Build on messy, realistic business datasets and real-world architectures rather than toy textbook problems. Every module produces working code.',
      code: 'LAB-02',
      color: 'bg-[#5B5FED]'
    },
    {
      step: '03',
      title: '1-on-1 Code Reviews & Feedback',
      desc: 'Receive direct, line-by-line feedback on your repositories and assignments from experienced mentors who help you write clean, commercial code.',
      code: 'REV-03',
      color: 'bg-[#FF8A65]'
    },
    {
      step: '04',
      title: 'Capstone Defense & Career Launch',
      desc: 'Defend your capstone before industry evaluators, receive your verified credential, and join our private alumni referral network.',
      code: 'CAP-04',
      color: 'bg-[#10B981]'
    }
  ];

  return (
    <section className="bg-[#FFFDF9] border-b-2 border-[#1A1D4F] py-20 lg:py-24 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <StickerLabel color="bg-[#5B5FED]" textColor="text-white" rotate={0}>
            Cohort Execution Framework
          </StickerLabel>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#1A1D4F] tracking-tight">
            Engineered for Speed, Retention &amp; Proof.
          </h2>
          <p className="text-base text-[#1A1D4F]/80">
            How our cohort-based pedagogy outperforms random online courses and self-paced video playlists.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pil, idx) => (
            <div
              key={idx}
              className="bg-white border-2 border-[#1A1D4F] shadow-retro rounded-2xl p-6 space-y-3 relative hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#5B5FED]/10 border border-[#5B5FED]/30 flex items-center justify-center text-[#5B5FED] font-mono font-bold text-xs">
                  {pil.code}
                </div>
                <span className="font-mono text-xs font-black px-2 py-0.5 bg-[#FFF6EC] border border-[#1A1D4F] rounded">
                  STEP {pil.step}
                </span>
              </div>
              <h3 className="text-lg font-black text-[#1A1D4F]">{pil.title}</h3>
              <p className="text-xs sm:text-sm text-[#1A1D4F]/75 leading-relaxed">
                {pil.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// 6. WHO THIS COURSE IS FOR & WHAT YOU DO NOT NEED
// ---------------------------------------------------------------------------
export const CourseAudienceSection: React.FC<{
  personas: { role: string; desc: string }[];
  notNeeded: string[];
}> = ({ personas, notNeeded }) => {
  return (
    <section id="audience" className="bg-[#F8F9FE] border-b-2 border-[#1A1D4F] py-20 lg:py-24 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <StickerLabel color="bg-[#FF8A65]" textColor="text-white" rotate={0}>
            Target Audience &amp; Fit
          </StickerLabel>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#1A1D4F] tracking-tight">
            Is This Cohort Right for You?
          </h2>
          <p className="text-base text-[#1A1D4F]/80">
            Designed for ambitious builders, career switchers, and professionals seeking demonstrable modern capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Audience Persona Cards */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#1A1D4F]/60 mb-2">
              Who Gets the Highest Return on Investment:
            </h3>
            {personas.map((persona, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-[#1A1D4F] shadow-retro-sm rounded-2xl p-5 space-y-1.5 hover:shadow-retro transition-shadow"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5B5FED]"></span>
                  <h4 className="text-base font-black text-[#1A1D4F]">{persona.role}</h4>
                </div>
                <p className="text-xs sm:text-sm text-[#1A1D4F]/80 leading-relaxed pl-4">
                  {persona.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Right: What You DO NOT Need Reassurances */}
          <div className="lg:col-span-5">
            <div className="bg-[#FFF6EC] border-2 border-[#1A1D4F] shadow-retro rounded-2xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#5B5FED]" />
                <div>
                  <h3 className="text-base font-black text-[#1A1D4F]">
                    What You DO NOT Need
                  </h3>
                  <p className="text-xs text-[#1A1D4F]/70">Zero unnecessary barriers to entry</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {notNeeded.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-[#1A1D4F]">
                    <div className="w-4 h-4 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t-2 border-[#1A1D4F]/10 text-xs text-[#1A1D4F]/80 leading-relaxed italic">
                “All you need is a functional laptop, reliable internet connection, and the curiosity to learn by doing.”
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// 7. COURSE SPECIFICATIONS MATRIX
// ---------------------------------------------------------------------------
export const CourseSpecsMatrixSection: React.FC<{ course: AcademyCourse }> = ({ course }) => {
  const specs = [
    { label: 'Cohort Duration', val: course.duration, sub: course.commitment },
    { label: 'Weekly Schedule', val: 'Live Interactive Labs', sub: course.format },
    { label: 'Experience Level', val: course.level, sub: 'Beginner-friendly onboarding' },
    { label: 'Class Format', val: 'Cohort-Based Live Zoom', sub: 'Recordings with lifetime access' },
    { label: 'Prerequisites', val: 'No Prior Degree Required', sub: 'Laptop & internet access' },
    { label: 'Hands-On Labs', val: `${course.weeklySyllabus.length}+ Real Projects`, sub: 'Direct mentor code reviews' },
    { label: 'Credential', val: course.certificateType || 'Verifiable Certificate', sub: 'Online tamper-proof ID' },
    { label: 'Admissions Status', val: 'Active Enrollment', sub: `${course.seatsRemaining} spots available` }
  ];

  return (
    <section className="bg-[#FFFDF9] border-b-2 border-[#1A1D4F] py-16 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-black uppercase tracking-wider text-[#5B5FED]">
            Program Specifications
          </span>
          <h3 className="font-display font-black text-2xl sm:text-3xl text-[#1A1D4F]">
            Course Specifications at a Glance
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {specs.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-white border-2 border-[#1A1D4F] shadow-retro-sm rounded-xl"
            >
              <div className="text-[11px] font-black uppercase text-[#1A1D4F]/60">
                {item.label}
              </div>
              <div className="text-sm sm:text-base font-black text-[#1A1D4F] mt-1 truncate">
                {item.val}
              </div>
              <div className="text-xs text-[#1A1D4F]/70 mt-0.5 truncate">
                {item.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// 8. TESTIMONIALS SECTION
// ---------------------------------------------------------------------------
export interface CourseTestimonialItem {
  name?: string;
  author?: string;
  role: string;
  quote: string;
  initials?: string;
  gradient?: string;
}

export const CourseTestimonialsSection: React.FC<{
  testimonials: CourseTestimonialItem[];
}> = ({ testimonials }) => {
  return (
    <section id="reviews" className="bg-[#FFFDF9] border-b-2 border-[#1A1D4F] py-20 lg:py-24 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <StickerLabel color="bg-[#FFC107]" textColor="text-[#1A1D4F]" rotate={0}>
            Alumni Reviews &amp; Outcomes
          </StickerLabel>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#1A1D4F] tracking-tight">
            Real Stories from Real Alumni.
          </h2>
          <p className="text-base text-[#1A1D4F]/80">
            Hear from students who transformed their careers and automated client workflows through Vixora Academy cohorts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => {
            const displayName = t.name || t.author || 'Vixora Alum';
            return (
              <div
                key={idx}
                className="bg-white border-2 border-[#1A1D4F] shadow-retro rounded-2xl p-6 sm:p-7 space-y-4 hover:-translate-y-1 transition-transform flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex text-[#FFC107]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#1A1D4F] font-medium leading-relaxed italic">
                    “{t.quote.replace(/^["']|["']$/g, '')}”
                  </p>
                </div>

                <div className="pt-4 border-t-2 border-[#1A1D4F]/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {t.initials && (
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.gradient || 'from-purple-600 to-indigo-600'} text-white text-xs font-black flex items-center justify-center border border-[#1A1D4F]`}>
                        {t.initials}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-black text-[#1A1D4F]">{displayName}</div>
                      <div className="text-xs font-semibold text-[#1A1D4F]/65">{t.role}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-[#D1F2D9] text-[#10B981] border border-[#10B981] rounded">
                    Verified Alum
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// 9. FAQ ACCORDION SECTION
// ---------------------------------------------------------------------------
export const CourseFaqSection: React.FC<{ faqs: CourseFaq[] }> = ({ faqs }) => {
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({ 0: true, 1: true });

  const toggle = (idx: number) => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <section id="faq" className="bg-[#F8F9FE] border-b-2 border-[#1A1D4F] py-20 lg:py-24 text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <StickerLabel color="bg-[#FF8A65]" textColor="text-white" rotate={0}>
            Frequently Asked Questions
          </StickerLabel>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#1A1D4F] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-[#1A1D4F]/80">
            Everything you need to know about schedules, hardware requirements, mentorship, and credentials.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = Boolean(expanded[idx]);
            return (
              <div
                key={idx}
                className="bg-white border-2 border-[#1A1D4F] shadow-retro-sm rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left hover:bg-[#FFFDF9] transition-colors cursor-pointer select-none"
                >
                  <span className="text-base font-black text-[#1A1D4F]">{faq.q}</span>
                  <div className="shrink-0 w-7 h-7 rounded-full border border-[#1A1D4F] bg-[#F1F5F9] flex items-center justify-center text-[#1A1D4F]">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 sm:pb-7 pt-1 text-xs sm:text-sm text-[#1A1D4F]/85 leading-relaxed border-t border-[#1A1D4F]/10 animate-in fade-in duration-200">
                    {faq.a}
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

// ---------------------------------------------------------------------------
// 10. FINAL CLOSING CTA BANNER
// ---------------------------------------------------------------------------
export const CourseFinalCtaSection: React.FC<{
  course: AcademyCourse;
  onEnroll: () => void;
}> = ({ course, onEnroll }) => {
  return (
    <section className="bg-[#5B5FED] text-white border-b-2 border-[#1A1D4F] py-20 lg:py-24 text-center relative overflow-hidden select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        <StickerLabel color="bg-[#FFC107]" textColor="text-[#1A1D4F]" rotate={0}>
          Cohort Starting {course.nextCohortDate}
        </StickerLabel>

        <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
          Ready to Master {course.title}?
        </h2>

        <p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto leading-relaxed">
          Join the next cohort of high-performing professionals building production systems with Vixora Academy.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
          <TactileButton
            variant="secondary"
            size="lg"
            onClick={onEnroll}
            className="w-full sm:w-auto"
          >
            <span>Lock In Your Seat ({course.tuition})</span>
            <ArrowRight className="w-5 h-5" />
          </TactileButton>

          <a
            href={getWhatsAppUrl(`Hello Vixora Admissions, I am ready to enroll in ${course.title} (${course.tuition}).`)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-[#1A1D4F] bg-white text-[#1A1D4F] font-bold shadow-retro hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <MessageCircle className="w-4 h-4 text-[#10B981]" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        <div className="pt-4 text-xs font-semibold text-white/80 inline-flex items-center gap-1.5 justify-center">
          <Check className="w-3.5 h-3.5 text-emerald-300 stroke-[3]" />
          <span>Paystack Instant Checkout · Verifiable Certificate · 100% Practical</span>
        </div>
      </div>
    </section>
  );
};

// ---------------------------------------------------------------------------
// 11. MOBILE STICKY ENROLLMENT BAR
// ---------------------------------------------------------------------------
export const CourseMobileStickyBar: React.FC<{
  course: AcademyCourse;
  onEnroll: () => void;
}> = ({ course, onEnroll }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/95 backdrop-blur-md border-t-2 border-[#1A1D4F] p-3 px-4 flex items-center justify-between gap-3 shadow-retro">
      <div className="truncate text-left">
        <div className="text-[10px] font-bold uppercase text-[#1A1D4F]/60 truncate">
          {course.title}
        </div>
        <div className="text-base font-black text-[#1A1D4F] leading-tight">
          {course.tuition}
        </div>
      </div>

      <button
        onClick={onEnroll}
        className="px-5 py-2.5 bg-[#5B5FED] text-white border-2 border-[#1A1D4F] rounded-xl font-black text-xs shadow-retro-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1.5 shrink-0"
      >
        <span>Enroll Now</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
