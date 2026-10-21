import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  Workflow,
  Code2,
  Briefcase,
  Play,
  FileText,
  Lock,
  Unlock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Send,
  Download,
  Users,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Bot,
  Zap,
  Award,
  Video,
  FileCheck2,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { COHORT_1_BUNDLE, CohortTrackItem, CohortResource } from '../data/cohortData';
import { AcademyCourse, ACADEMY_COURSES } from '../data/vixoraContent';
import { BRAND_CONFIG } from '../data/brandConfig';

interface CohortBundlePageProps {
  initialTrackSlug?: string;
  onEnrollCourse: (course: AcademyCourse) => void;
  onNavigateCourse: (courseSlug: string) => void;
  onNavigateHome: () => void;
  onNavigateAcademy: () => void;
  onOpenProjectModal?: () => void;
}

export function CohortBundlePage({
  initialTrackSlug,
  onEnrollCourse,
  onNavigateCourse,
  onNavigateHome,
  onNavigateAcademy,
  onOpenProjectModal
}: CohortBundlePageProps) {
  // Find initial track index if provided
  const initialIndex = initialTrackSlug
    ? Math.max(0, COHORT_1_BUNDLE.tracks.findIndex(t => t.slug === initialTrackSlug))
    : 0;

  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(initialIndex);
  const [selectedResourceType, setSelectedResourceType] = useState<'all' | 'video' | 'pdf'>('all');
  const [activeVideoModal, setActiveVideoModal] = useState<CohortResource | null>(null);
  const [activePdfModal, setActivePdfModal] = useState<CohortResource | null>(null);
  const [downloadAlert, setDownloadAlert] = useState<string | null>(null);

  const activeTrack = COHORT_1_BUNDLE.tracks[activeTrackIndex] || COHORT_1_BUNDLE.tracks[0];

  // Map icon component
  const getTrackIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Workflow':
        return <Workflow className="w-4 h-4" />;
      case 'Code2':
        return <Code2 className="w-4 h-4" />;
      case 'Briefcase':
      default:
        return <Briefcase className="w-4 h-4" />;
    }
  };

  // Find canonical course object for enrollment
  const getCourseForTrack = (courseId: string): AcademyCourse => {
    const found = ACADEMY_COURSES.find(c => c.id === courseId);
    if (found) return found;
    // Default fallback to bundle
    return ACADEMY_COURSES.find(c => c.id === 'course-cohort-1-master-bundle') || ACADEMY_COURSES[0];
  };

  const masterBundleCourse = ACADEMY_COURSES.find(c => c.id === 'course-cohort-1-master-bundle') || ACADEMY_COURSES[0];

  // Handle PDF sample download
  const handleDownloadSamplePdf = (resource: CohortResource) => {
    // Generate simulated clean PDF sample download
    const sampleText = `%PDF-1.4\n% Vixora Academy Cohort 1.0 Sample Guide\nTitle: ${resource.title}\nTrack: ${resource.trackName}\nDean: Sarumi Hammad\nOfficial Academic Directorate Portal: ${BRAND_CONFIG.cleanAcademyDomain}\nFor full video replays and complete 45-page blueprints, access the Cohort 1.0 Telegram vault.\n%%EOF`;
    const blob = new Blob([sampleText], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resource.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Sample.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadAlert(`Downloading sample outline: ${resource.title}`);
    setTimeout(() => setDownloadAlert(null), 4000);
  };

  // Filtered resources
  const filteredResources = COHORT_1_BUNDLE.resources.filter(r => {
    if (selectedResourceType === 'all') return true;
    return r.type === selectedResourceType;
  });

  return (
    <div className="pt-[74px] sm:pt-[84px] pb-24 bg-[#F7F7FC] text-[#0F1535] min-h-screen selection:bg-[#5B5FED] selection:text-white">
      
      {/* Toast Alert for PDF Downloads */}
      {downloadAlert && (
        <div className="fixed top-24 right-4 z-50 bg-[#0F1535] text-white px-4 py-3 rounded-xl border border-emerald-500/40 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
          <FileCheck2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{downloadAlert}</span>
        </div>
      )}

      {/* 1. Master Flagship Hero Section */}
      <section className="relative bg-white border-b border-slate-200/80 overflow-hidden py-10 sm:py-16 lg:py-20">
        <div 
          className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#5B5FED_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" 
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-mono">
            <button
              onClick={onNavigateAcademy}
              className="hover:text-[#5B5FED] transition-colors cursor-pointer"
            >
              Vixora Academy
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-[#0F1535] font-semibold">Cohort 1.0 Vault</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Proposition, Bundle Value & CTAs */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Directorate & Edition Kicker */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-[#5B5FED] border border-purple-200/80 mb-5 max-w-full">
                <GraduationCap className="w-3.5 h-3.5 text-[#5B5FED] shrink-0" />
                <span className="font-mono text-[10px] sm:text-[11px] tracking-wide uppercase truncate">
                  {COHORT_1_BUNDLE.edition} • Dean: Sarumi Hammad
                </span>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="hidden sm:inline text-[10px] text-emerald-700 font-medium shrink-0">
                  Private Telegram Vault
                </span>
              </div>

              {/* Master Headline */}
              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] font-black text-[#0F1535] tracking-tight leading-[1.15] max-w-2xl">
                {COHORT_1_BUNDLE.heroHeadline}
              </h1>

              {/* Supporting Copy */}
              <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#475569] leading-relaxed max-w-xl font-normal">
                {COHORT_1_BUNDLE.heroDescription}
              </p>

              {/* Bundle Pricing Card */}
              <div className="mt-6 p-4 rounded-2xl bg-[#0F1535] text-white border border-purple-900/60 shadow-lg w-full max-w-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                      Full 4-Track All-Access Pass
                    </div>
                    <div className="flex items-baseline gap-2.5 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black text-white">{COHORT_1_BUNDLE.tuitionBundle}</span>
                      <span className="text-xs text-slate-400 line-through">{COHORT_1_BUNDLE.standardPrice}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Save 52%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onEnrollCourse(masterBundleCourse)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-[#0F1535] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 shrink-0"
                  >
                    <Award className="w-3.5 h-3.5 text-[#0F1535]" />
                    <span>Get All-Access Pass</span>
                  </button>
                </div>
                <div className="pt-2.5 text-[11px] text-purple-200/90 flex items-center justify-between">
                  <span>Includes all 4 tracks, 28+ hours video replays &amp; 14 strategy PDFs</span>
                  <span className="font-mono text-emerald-300 text-[10px] hidden sm:inline">Instant Access</span>
                </div>
              </div>

              {/* Secondary Navigation Actions */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <a
                  href="#tracks-breakdown"
                  className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-[#0F1535] border border-slate-200/80 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <Layers className="w-4 h-4 text-[#5B5FED]" />
                  <span>Explore the 4 Curriculum Tracks</span>
                </a>
                <a
                  href="#resources-vault"
                  className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-purple-50 text-[#5B5FED] border border-purple-200/80 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <Video className="w-4 h-4 text-[#5B5FED]" />
                  <span>View Recorded Sessions &amp; PDFs</span>
                </a>
              </div>

              {/* Live Cohort Key Metrics */}
              <div className="mt-8 pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                {COHORT_1_BUNDLE.stats.map((st, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">{st.label}</div>
                    <div className="text-base sm:text-lg font-black text-[#0F1535]">{st.value}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">{st.helper}</div>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Column: Contained Video Player & Private Telegram Callout */}
            <div className="lg:col-span-5 w-full space-y-4">
              
              {/* Contained Preview Player */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-900/5 bg-[#0F1535] group">
                
                {/* Frame Header */}
                <div className="px-4 py-2.5 bg-[#0A0E27] border-b border-white/10 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                    <span className="font-mono text-[11px] font-semibold text-white tracking-wide truncate">
                      Cohort 1.0 Recorded Masterclass
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider shrink-0">
                    Official Replay
                  </span>
                </div>

                {/* Video Media Container */}
                <div className="relative aspect-video w-full bg-[#070A1E] overflow-hidden flex items-center justify-center">
                  <img
                    src="/images/academy-hero-poster.jpg"
                    alt="Cohort 1.0 Session Replay Preview"
                    className="w-full h-full object-cover object-center absolute inset-0 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1535]/90 via-transparent to-black/30 pointer-events-none" />

                  {/* Play Button Triggering Preview Modal */}
                  <button
                    onClick={() => setActiveVideoModal(COHORT_1_BUNDLE.resources[1])}
                    className="relative z-10 w-16 h-16 rounded-full bg-amber-400 hover:bg-amber-300 text-[#000048] flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer group/play"
                    aria-label="Play Cohort 1.0 sample session highlight"
                  >
                    <Play className="w-6 h-6 fill-[#000048] ml-1 group-hover/play:scale-110 transition-transform" />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/95 pointer-events-none font-mono">
                    <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] border border-white/10">
                      Live Workshop Session Highlights
                    </span>
                    <span className="bg-[#5B5FED]/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white border border-[#5B5FED]/40">
                      4 Tracks Combined
                    </span>
                  </div>
                </div>

                {/* Contained Player Footer */}
                <div className="p-3.5 bg-[#0F1535] text-purple-200 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px] text-purple-100 font-medium">Session archives recorded in 1080p HD</span>
                  </div>
                  <button
                    onClick={() => setActiveVideoModal(COHORT_1_BUNDLE.resources[1])}
                    className="text-[11px] text-amber-300 hover:text-amber-200 font-semibold cursor-pointer shrink-0"
                  >
                    Watch Preview &rarr;
                  </button>
                </div>

              </div>

              {/* Private Telegram Community Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#101438] via-[#1A114A] to-[#0A0D28] text-white border border-purple-500/30 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Private Telegram Mastermind</div>
                      <div className="text-[10px] text-purple-300 font-mono">Cohort 1.0 Dedicated Archive</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Mentorship
                  </span>
                </div>
                <p className="text-xs text-purple-100/90 leading-relaxed">
                  Every enrolled student receives lifetime admission to our private Telegram vault containing unlisted video archives, prompt libraries, and mentor Q&amp;A.
                </p>
                <div className="pt-1 flex items-center justify-between text-xs border-t border-white/10">
                  <span className="text-[11px] font-mono text-slate-300">Dean Sarumi Hammad • Active Daily</span>
                  <span className="text-[11px] text-amber-300 font-bold">120+ Active Students</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2. Interactive 4-Track Deep Dive & Curriculum Switcher */}
      <section id="tracks-breakdown" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-[#5B5FED] bg-purple-50 border border-purple-200">
            <Layers className="w-3.5 h-3.5" />
            <span>Cohort 1.0 Curriculum Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F1535] tracking-tight">
            The 4 Training Pillars of Cohort 1.0
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Click through each track below to explore the week-by-week curriculum, tools used, hands-on lab deliverables, and session recording topics.
          </p>
        </div>

        {/* Interactive Segmented Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl max-w-4xl mx-auto border border-slate-300/60">
          {COHORT_1_BUNDLE.tracks.map((track, idx) => {
            const isActive = idx === activeTrackIndex;
            return (
              <button
                key={track.id}
                onClick={() => setActiveTrackIndex(idx)}
                className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'bg-[#0F1535] text-white shadow-md'
                    : 'text-slate-700 hover:text-[#0F1535] hover:bg-white/60'
                }`}
              >
                <span className={isActive ? 'text-amber-400' : 'text-slate-500'}>
                  {getTrackIcon(track.iconName)}
                </span>
                <span>{track.shortTitle}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-white/20 text-purple-200' : 'bg-slate-300/50 text-slate-600'
                }`}>
                  Track 0{idx + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Track Comprehensive Display Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 space-y-8 animate-in fade-in duration-200">
          
          {/* Track Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-100/80 text-[#5B5FED]">
                  {getTrackIcon(activeTrack.iconName)}
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#5B5FED]">
                  {activeTrack.badge} • Track 0{activeTrackIndex + 1} of 04
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F1535]">
                {activeTrack.title}
              </h3>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                {activeTrack.description}
              </p>
            </div>

            {/* Individual Track Tuition & CTA */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F7FC] border border-slate-200/80 shrink-0 flex flex-col items-start sm:items-end gap-3 min-w-[260px]">
              <div className="text-left sm:text-right">
                <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Single Track Tuition</div>
                <div className="text-2xl font-black text-[#0F1535]">{activeTrack.tuition}</div>
                <div className="text-[10px] text-slate-500 font-mono">Includes Telegram access for this track</div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onNavigateCourse(activeTrack.slug)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-purple-50 text-[#5B5FED] border border-[#5B5FED]/50 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Dedicated Subpage</span>
                </button>
                <button
                  onClick={() => onEnrollCourse(getCourseForTrack(activeTrack.courseId))}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-[#5B5FED] hover:bg-[#480878] text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Enroll ({activeTrack.tuition})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tools & Production Stack */}
          <div className="space-y-2.5">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Production Toolchains &amp; Platforms Mastered:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {activeTrack.tools.map((tool, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-[#0F1535] border border-slate-200"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* 4-Week Detailed Syllabus Breakdown */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-[#0F1535] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#5B5FED]" />
              <span>Weekly Syllabus &amp; Live Lab Deliverables</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTrack.curriculumWeeks.map((weekItem, wIdx) => (
                <div
                  key={wIdx}
                  className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 space-y-2 hover:border-[#5B5FED]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#5B5FED] uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
                      {weekItem.week} • {weekItem.sessionCount} Sessions
                    </span>
                    {weekItem.hasPdf && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <FileText className="w-3 h-3 text-emerald-600" />
                        PDF Guide
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-[#0F1535]">{weekItem.title}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{weekItem.summary}</p>
                  <div className="pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Hands-On Deliverable:</span>
                    <span className="text-xs font-semibold text-slate-800">{weekItem.handsOnDeliverable}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Competencies Acquired */}
          <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#5B5FED]">
              Core Practical Competencies You Master:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
              {activeTrack.keyTakeaways.map((takeaway, tIdx) => (
                <div key={tIdx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{takeaway}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Track Bottom Action Banner */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
            <button
              onClick={() => onNavigateCourse(activeTrack.slug)}
              className="text-xs text-[#5B5FED] hover:text-[#480878] font-bold flex items-center gap-1.5 cursor-pointer group"
            >
              <span>Explore Dedicated {activeTrack.shortTitle} Page (Videos &amp; PDFs)</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onEnrollCourse(masterBundleCourse)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0F1535] hover:bg-[#480878] text-white transition-all cursor-pointer shadow-md flex items-center gap-2 shrink-0"
            >
              <span>Get Full 4-Track Bundle ({COHORT_1_BUNDLE.tuitionBundle})</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>

        </div>

      </section>

      {/* 3. Session Recordings & PDF Guide Showcase */}
      <section id="resources-vault" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200">
                <Video className="w-3.5 h-3.5" />
                <span>Recorded Sessions &amp; Strategy Guides</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F1535] tracking-tight">
                Cohort 1.0 Vault: Videos &amp; PDF Blueprints
              </h2>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                Preview sample curriculum outlines, watch introductory session highlights, and see the library of blueprints available inside the private Telegram student hub.
              </p>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
              <button
                onClick={() => setSelectedResourceType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedResourceType === 'all' ? 'bg-white text-[#0F1535] shadow-xs' : 'text-slate-600 hover:text-[#0F1535]'
                }`}
              >
                All Resources
              </button>
              <button
                onClick={() => setSelectedResourceType('video')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedResourceType === 'video' ? 'bg-white text-[#0F1535] shadow-xs' : 'text-slate-600 hover:text-[#0F1535]'
                }`}
              >
                <Video className="w-3 h-3 text-[#5B5FED]" />
                Videos
              </button>
              <button
                onClick={() => setSelectedResourceType('pdf')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedResourceType === 'pdf' ? 'bg-white text-[#0F1535] shadow-xs' : 'text-slate-600 hover:text-[#0F1535]'
                }`}
              >
                <FileText className="w-3 h-3 text-emerald-600" />
                PDF Guides
              </button>
            </div>
          </div>

          {/* Resource Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredResources.map((res) => {
              const isVideo = res.type === 'video';
              return (
                <div
                  key={res.id}
                  className="bg-[#F8FAFC] rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all group"
                >
                  <div className="space-y-3">
                    
                    {/* Card Header Badges */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isVideo
                          ? 'bg-purple-100 text-[#5B5FED]'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isVideo ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        {res.type.toUpperCase()}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 font-semibold">
                        {res.durationOrPages}
                      </span>
                    </div>

                    {/* Track Name */}
                    <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                      {res.trackName}
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-bold text-[#0F1535] group-hover:text-[#5B5FED] transition-colors leading-snug">
                      {res.title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {res.description}
                    </p>

                  </div>

                  {/* Actions / Status */}
                  <div className="pt-3 border-t border-slate-200/80 space-y-2">
                    {res.isPublicPreview ? (
                      <button
                        onClick={() => handleDownloadSamplePdf(res)}
                        className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-[#0F1535] border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-[#5B5FED]" />
                        <span>Download Sample PDF</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveVideoModal(res)}
                        className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-[#0F1535] hover:bg-[#480878] text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>Watch Preview Highlight</span>
                      </button>
                    )}

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
                      <span className="flex items-center gap-1">
                        {res.isPublicPreview ? (
                          <>
                            <Unlock className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Public Outline</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-amber-600" />
                            <span>Full Session in Telegram</span>
                          </>
                        )}
                      </span>
                      {res.telegramMessageRef && (
                        <span>{res.telegramMessageRef}</span>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

          {/* Full Access Vault Callout Banner */}
          <div className="p-6 rounded-2xl bg-[#0F1535] text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="text-base font-bold text-white flex items-center justify-center md:justify-start gap-2">
                <Send className="w-4 h-4 text-sky-400" />
                <span>Want complete unmetered access to all 28+ hours of videos &amp; 14 PDFs?</span>
              </div>
              <p className="text-xs text-purple-200">
                Enroll in the complete Cohort 1.0 4-in-1 Master Bundle for ₦45,000 and receive instant admission to the private Telegram vault.
              </p>
            </div>
            <button
              onClick={() => onEnrollCourse(masterBundleCourse)}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-[#0F1535] transition-all cursor-pointer shadow-md shrink-0 flex items-center gap-2"
            >
              <span>Enroll in Master Bundle ({COHORT_1_BUNDLE.tuitionBundle})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* 4. Private Telegram Community & Vault Details */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#0F1535] via-[#1A114A] to-[#0A0D28] text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-purple-500/30 space-y-8">
          
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-sky-300 bg-sky-950/60 border border-sky-400/40">
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>Official Student Community &amp; Content Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Why Cohort 1.0 is Hosted on Telegram Private Vault
            </h2>
            <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">
              Unlike generic corporate course portals where videos buffer or expire, Vixora Academy Cohort 1.0 gives you permanent, mobile-optimized, cloud-archived access directly in Telegram.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COHORT_1_BUNDLE.telegramBenefits.slice(0, 3).map((benefit, bIdx) => (
              <div
                key={bIdx}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 backdrop-blur-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono font-bold text-xs">
                  0{bIdx + 1}
                </div>
                <div className="text-xs font-bold text-white">{benefit}</div>
                <p className="text-[11px] text-purple-200/80 leading-relaxed">
                  Stream high-definition recordings on laptop or mobile, download PDF worksheets directly, and search previous cohort discussions.
                </p>
              </div>
            ))}
          </div>

          {/* Student Access Workflow */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-purple-200">
              <strong>How it works:</strong> Complete your enrollment online &rarr; Instantly receive the verified Telegram invitation link &rarr; Gain immediate lifetime access.
            </div>
            <button
              onClick={() => onEnrollCourse(masterBundleCourse)}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-white text-[#0F1535] hover:bg-purple-50 transition-all cursor-pointer shadow-md shrink-0 flex items-center gap-2"
            >
              <span>Unlock Telegram Access Now</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#5B5FED]" />
            </button>
          </div>

        </div>
      </section>

      {/* 5. Tuition Comparison: Bundle vs Single Track */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F1535] tracking-tight">
            Transparent Cohort 1.0 Tuition
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Choose the all-inclusive master pass or select the individual technical track that matches your immediate career focus.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Card 1: AI Content Creation Track */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#5B5FED] uppercase tracking-wider bg-purple-50 px-2 py-1 rounded">
                Individual Track 01
              </span>
              <h3 className="text-lg font-bold text-[#0F1535]">AI Content Creation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Diffusion models, prompt engineering, ElevenLabs voice cloning, and viral short-form video creation.
              </p>
              <div className="pt-2">
                <span className="text-2xl font-black text-[#0F1535]">₦10,000</span>
                <span className="text-xs text-slate-400 font-mono block">One-time enrollment</span>
              </div>
            </div>
            <button
              onClick={() => onEnrollCourse(getCourseForTrack('course-ai-image-short-videos-creation'))}
              className="w-full py-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#0F1535] transition-all cursor-pointer"
            >
              Enroll in Track 01 Only
            </button>
          </div>

          {/* Card 2: 4-in-1 Master Bundle (Recommended Highlighted) */}
          <div className="p-8 rounded-3xl bg-[#0F1535] text-white border-2 border-amber-400 shadow-2xl relative flex flex-col justify-between space-y-6 lg:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400 text-[#0F1535] shadow-md">
              Most Popular • Best Value
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                  Full 4-Track All-Access Pass
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Save ₦50,000
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">Cohort 1.0 Master Bundle</h3>
              <p className="text-xs text-purple-200 leading-relaxed">
                Complete access to all 4 tracks (AI Content, Automation, Web Dev, Client Acquisition) with all 28+ hours of videos, 14 PDFs, and lifetime Telegram mastermind.
              </p>
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{COHORT_1_BUNDLE.tuitionBundle}</span>
                <span className="text-xs text-slate-400 line-through">{COHORT_1_BUNDLE.standardPrice}</span>
              </div>
              <ul className="space-y-2 text-xs text-purple-100 pt-2 border-t border-white/10">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All 4 Complete Course Tracks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>28+ Hours HD Video Replays</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>14 Master PDF Guides &amp; Blueprints</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Private Telegram Mastermind Group</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Official Cryptographic Certificate</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onEnrollCourse(masterBundleCourse)}
              className="w-full py-3.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-[#0F1535] transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4 text-[#0F1535]" />
              <span>Get Full 4-in-1 Master Pass</span>
            </button>
          </div>

          {/* Card 3: AI Automation Track */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#5B5FED] uppercase tracking-wider bg-purple-50 px-2 py-1 rounded">
                Individual Track 02
              </span>
              <h3 className="text-lg font-bold text-[#0F1535]">AI Automation &amp; Workflows</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Self-hosted n8n, webhook pipelines, autonomous agents, and enterprise CRM integrations.
              </p>
              <div className="pt-2">
                <span className="text-2xl font-black text-[#0F1535]">₦30,000</span>
                <span className="text-xs text-slate-400 font-mono block">One-time enrollment</span>
              </div>
            </div>
            <button
              onClick={() => onEnrollCourse(getCourseForTrack('course-ai-automation-digital-skills'))}
              className="w-full py-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#0F1535] transition-all cursor-pointer"
            >
              Enroll in Track 02 Only
            </button>
          </div>

        </div>

      </section>

      {/* Video Preview Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0F1535] border border-purple-500/40 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4">
            <div className="p-4 bg-[#0A0E27] border-b border-white/10 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold truncate max-w-md">{activeVideoModal.title}</span>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-center">
              <div className="aspect-video w-full rounded-2xl bg-black overflow-hidden relative flex items-center justify-center border border-white/10">
                <video
                  src="/videos/academy-hero.mp4"
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left space-y-1">
                <div className="text-xs font-mono text-purple-300 uppercase">{activeVideoModal.trackName}</div>
                <div className="text-xs text-slate-300 leading-relaxed">{activeVideoModal.description}</div>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">Full unedited session hosted in Telegram</span>
                <button
                  onClick={() => {
                    setActiveVideoModal(null);
                    onEnrollCourse(masterBundleCourse);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-[#0F1535] cursor-pointer"
                >
                  Unlock Complete Vault &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
