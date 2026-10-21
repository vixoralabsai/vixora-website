import React, { useState } from 'react';
import { Sparkles, ArrowRight, ChevronDown, Check, ShieldCheck, Clock, Calendar, Users, Award, Briefcase, Zap } from 'lucide-react';
import { AcademyCourse } from '../../data/vixoraContent';
import { Star, SquiggleUnderline, StickerLabel, TactileButton } from './CourseVisualDecorations';

interface CourseHeroSectionProps {
  course: AcademyCourse;
  onEnroll: () => void;
  onScrollToCurriculum: () => void;
  timeLeft: { hours: number; minutes: number; seconds: number };
}

export const CourseHeroSection: React.FC<CourseHeroSectionProps> = ({
  course,
  onEnroll,
  onScrollToCurriculum,
  timeLeft
}) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'specs' | 'career'>('specs');

  // Format countdown numbers
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div>
      {/* 1. TOP FOMO TICKER BANNER */}
      <div className="bg-[#FFF6EC] border-b-2 border-[#1A1D4F] py-2.5 px-4 text-[#1A1D4F] overflow-hidden select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF8A65]"></span>
            <span className="uppercase tracking-wider">
              Limited Cohort Seats · Next Cohort Starts {course.nextCohortDate} · Verified Enrollment Window
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-mono bg-white px-2.5 py-1 rounded-md border-2 border-[#1A1D4F] shadow-retro-sm">
              <Clock className="w-3.5 h-3.5 text-[#5B5FED]" />
              <span className="text-[#1A1D4F] font-black">{pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s</span>
            </div>
            <button
              onClick={onEnroll}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-black text-[#5B5FED] hover:underline cursor-pointer"
            >
              <span>Lock In Spot ({course.tuition})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. HERO MAIN AREA */}
      <section className="relative bg-[#FFFDF9] border-b-2 border-[#1A1D4F] pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
        {/* Playful background decorative shapes */}
        <div className="absolute top-12 right-12 w-64 h-64 bg-[#FFE4CC]/40 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-6 left-12 w-72 h-72 bg-[#E0D8FF]/30 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Course Identity & Narrative */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Eyebrow Stickers */}
              <div className="flex flex-wrap items-center gap-2.5">
                <StickerLabel color="bg-[#FFC107]" textColor="text-[#1A1D4F]" rotate={0}>
                  100% Practical Accelerator
                </StickerLabel>
                <StickerLabel color="bg-[#5B5FED]" textColor="text-white" rotate={0}>
                  {course.track}
                </StickerLabel>
                <span className="hidden sm:inline-block text-xs font-bold text-slate-700 px-2.5 py-1 border border-slate-300 rounded-md bg-white">
                  {course.level}
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-2">
                <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#1A1D4F] tracking-tight leading-[1.08] text-balance">
                  Master <span className="text-[#5B5FED] relative inline-block">
                    {course.title}
                    <span className="absolute -bottom-2 left-0 right-0 w-full pointer-events-none">
                      <SquiggleUnderline color="#FFC107" />
                    </span>
                  </span> in {course.duration}.
                </h1>
              </div>

              {/* Subtitle / Value Pitch */}
              <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal max-w-2xl">
                {course.heroPitch || course.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <TactileButton
                  variant="primary"
                  size="lg"
                  onClick={onEnroll}
                  className="w-full sm:w-auto"
                >
                  <span>Enroll Now & Secure Spot</span>
                  <ArrowRight className="w-5 h-5 text-white" />
                </TactileButton>

                <TactileButton
                  variant="outline"
                  size="lg"
                  onClick={onScrollToCurriculum}
                  className="w-full sm:w-auto"
                >
                  <span>Explore Curriculum</span>
                  <ChevronDown className="w-4 h-4 text-[#1A1D4F]" />
                </TactileButton>
              </div>

              {/* Trust & Proof Strip */}
              <div className="pt-4 border-t-2 border-[#1A1D4F]/10 flex flex-wrap items-center gap-y-3 gap-x-6 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-1">
                  <div className="flex text-[#FFC107]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4" />
                    ))}
                  </div>
                  <span className="font-black text-[#1A1D4F] ml-1">4.9/5 Rating</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-[#5B5FED] text-white flex items-center justify-center font-bold text-[10px]">OM</div>
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-[#FF8A65] text-white flex items-center justify-center font-bold text-[10px]">TA</div>
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-[#10B981] text-white flex items-center justify-center font-bold text-[10px]">CK</div>
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-[#FFC107] text-[#1A1D4F] flex items-center justify-center font-bold text-[10px]">+1k</div>
                  </div>
                  <span className="font-semibold text-[#1A1D4F]">1,200+ Graduates</span>
                </div>

                <div className="flex items-center gap-1.5 font-bold text-[#10B981]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Certificate Included</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Neo-Brutalist Feature Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white border-2 border-[#1A1D4F] shadow-retro-xl rounded-2xl p-6 sm:p-7 relative transition-all">
                {/* Mac-style Window Bar */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b-2 border-[#1A1D4F]/15">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#FF8A65] border border-[#1A1D4F]"></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#FFC107] border border-[#1A1D4F]"></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#10B981] border border-[#1A1D4F]"></span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#1A1D4F]/70 uppercase tracking-wider">
                    VIXORA SPEC // 2026
                  </span>
                  <div className="w-12 text-right">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                  </div>
                </div>

                {/* Tab Switcher */}
                <div className="grid grid-cols-2 p-1 bg-[#F1F5F9] border-2 border-[#1A1D4F] rounded-xl mb-5 text-xs font-bold select-none">
                  <button
                    onClick={() => setActivePreviewTab('specs')}
                    className={`py-2 rounded-lg transition-all cursor-pointer ${
                      activePreviewTab === 'specs'
                        ? 'bg-[#5B5FED] text-white shadow-retro-sm'
                        : 'text-[#1A1D4F] hover:text-[#5B5FED]'
                    }`}
                  >
                    Cohort Specifications
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('career')}
                    className={`py-2 rounded-lg transition-all cursor-pointer ${
                      activePreviewTab === 'career'
                        ? 'bg-[#5B5FED] text-white shadow-retro-sm'
                        : 'text-[#1A1D4F] hover:text-[#5B5FED]'
                    }`}
                  >
                    Outcomes & Career
                  </button>
                </div>

                {/* Tab 1: Specs Grid */}
                {activePreviewTab === 'specs' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 gap-3 text-left">
                      <div className="p-3 bg-[#FFFDF9] border-2 border-[#1A1D4F] rounded-xl shadow-retro-sm">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#1A1D4F]/60 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#5B5FED]" /> Duration
                        </div>
                        <div className="text-sm font-black text-[#1A1D4F] mt-1">{course.duration}</div>
                        <div className="text-[11px] text-[#1A1D4F]/70">{course.commitment}</div>
                      </div>

                      <div className="p-3 bg-[#FFFDF9] border-2 border-[#1A1D4F] rounded-xl shadow-retro-sm">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#1A1D4F]/60 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#FF8A65]" /> Next Cohort
                        </div>
                        <div className="text-sm font-black text-[#1A1D4F] mt-1">{course.nextCohortDate}</div>
                        <div className="text-[11px] font-bold text-[#FF8A65]">
                          {course.seatsRemaining} spots remaining
                        </div>
                      </div>

                      <div className="p-3 bg-[#FFFDF9] border-2 border-[#1A1D4F] rounded-xl shadow-retro-sm">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#1A1D4F]/60 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#10B981]" /> Format
                        </div>
                        <div className="text-sm font-black text-[#1A1D4F] mt-1">Live Labs & Mentorship</div>
                        <div className="text-[11px] text-[#1A1D4F]/70">{course.format}</div>
                      </div>

                      <div className="p-3 bg-[#FFFDF9] border-2 border-[#1A1D4F] rounded-xl shadow-retro-sm">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#1A1D4F]/60 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-[#FFC107]" /> Credential
                        </div>
                        <div className="text-sm font-black text-[#1A1D4F] mt-1">Vixora Certified</div>
                        <div className="text-[11px] text-[#1A1D4F]/70">Verifiable ID</div>
                      </div>
                    </div>

                    {/* Capstone Preview Callout */}
                    <div className="p-3.5 bg-[#FFF6EC] border-2 border-[#1A1D4F] rounded-xl text-left">
                      <div className="flex items-center justify-between text-xs font-black text-[#1A1D4F] mb-1">
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-[#FF8A65]" /> Real-World Capstone
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-[#FFC107] border border-[#1A1D4F] rounded">
                          Portfolio Proof
                        </span>
                      </div>
                      <p className="text-xs text-[#1A1D4F]/85 line-clamp-2">
                        {course.capstoneProjects?.[0]?.title || 'Production client-ready capstone project.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Career Impact */}
                {activePreviewTab === 'career' && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-left">
                    <div className="p-3.5 bg-[#F8F9FE] border-2 border-[#1A1D4F] rounded-xl space-y-2">
                      <div className="text-xs font-black uppercase text-[#5B5FED] flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" /> Target Roles & Opportunities
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {course.outcomes.slice(0, 4).map((out, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-white border border-[#1A1D4F] rounded-md text-[#1A1D4F]"
                          >
                            <Check className="w-3 h-3 text-[#10B981]" /> {out}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#FFFDF9] border-2 border-[#1A1D4F] rounded-xl">
                      <div className="text-xs font-black uppercase text-[#1A1D4F] mb-1">
                        Commercial Advantage
                      </div>
                      <p className="text-xs text-[#1A1D4F]/80 leading-relaxed">
                        Graduates build production-grade artifacts that showcase demonstrable competence to hiring teams and high-ticket clients.
                      </p>
                    </div>
                  </div>
                )}

                {/* Card Footer: Quick Pricing & CTA */}
                <div className="pt-4 mt-5 border-t-2 border-[#1A1D4F]/15 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#1A1D4F]/60">
                      Standard Tuition
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-[#1A1D4F]">{course.tuition}</span>
                      <span className="text-xs font-bold text-[#10B981]">· All Inclusive</span>
                    </div>
                  </div>

                  <TactileButton
                    variant="secondary"
                    size="md"
                    onClick={onEnroll}
                    className="shrink-0"
                  >
                    <span>Enroll Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </TactileButton>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
