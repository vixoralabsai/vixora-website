import React, { useState, useRef } from 'react';
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
  ArrowLeft,
  ShieldCheck,
  Send,
  Download,
  Users,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Video,
  FileCheck2,
  Award,
  HelpCircle,
  Zap,
  Check,
  CreditCard,
  MessageSquare,
  Building2,
  X
} from 'lucide-react';
import {
  CohortTrackItem,
  COHORT_1_BUNDLE,
  getCohortTrackBySlug,
  getAllCohortTracks,
  TrackMediaSession,
  TrackPdfResource
} from '../data/cohortData';
import { AcademyCourse, ACADEMY_COURSES } from '../data/vixoraContent';
import { BRAND_CONFIG, getWhatsAppUrl } from '../data/brandConfig';
import { BankPaymentDetailsCard } from '../components/BankPaymentDetailsCard';
import { WhatsAppContactButton } from '../components/WhatsAppContactButton';

interface CohortTrackSubpageProps {
  trackSlug?: string;
  initialTrack?: CohortTrackItem;
  onEnrollCourse: (course: AcademyCourse) => void;
  onNavigateTrack: (trackSlug: string) => void;
  onNavigateBundle: () => void;
  onNavigateAcademy: () => void;
  onOpenProjectModal?: () => void;
}

export function CohortTrackSubpage({
  trackSlug,
  initialTrack,
  onEnrollCourse,
  onNavigateTrack,
  onNavigateBundle,
  onNavigateAcademy,
  onOpenProjectModal
}: CohortTrackSubpageProps) {
  // Resolve track object
  const track = initialTrack || (trackSlug ? getCohortTrackBySlug(trackSlug) : undefined) || COHORT_1_BUNDLE.tracks[0];
  const allTracks = getAllCohortTracks();

  // State
  const [activeVideoModal, setActiveVideoModal] = useState<TrackMediaSession | null>(null);
  const [activePdfModal, setActivePdfModal] = useState<TrackPdfResource | null>(null);
  const [downloadAlert, setDownloadAlert] = useState<string | null>(null);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [showBankDetails, setShowBankDetails] = useState<boolean>(false);

  // Video playback ref inside modal
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  // Map icon component
  const getTrackIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Workflow':
        return <Workflow className={className} />;
      case 'Code2':
        return <Code2 className={className} />;
      case 'Briefcase':
      default:
        return <Briefcase className={className} />;
    }
  };

  // Find corresponding canonical course for Paystack enrollment
  const getCourseForThisTrack = (): AcademyCourse => {
    const found = ACADEMY_COURSES.find(c => c.id === track.courseId || c.slug === track.slug);
    if (found) return found;
    return ACADEMY_COURSES.find(c => c.id === 'course-cohort-1-master-bundle') || ACADEMY_COURSES[0];
  };

  const masterBundleCourse = ACADEMY_COURSES.find(c => c.id === 'course-cohort-1-master-bundle') || ACADEMY_COURSES[0];
  const trackCourse = getCourseForThisTrack();

  // Trigger simulated sample PDF download
  const handleDownloadSamplePdf = (pdf: TrackPdfResource) => {
    const sampleText = `%PDF-1.4\n% Vixora Academy Cohort 1.0 Sample Guide\nTitle: ${pdf.title}\nCategory: ${pdf.category}\nTrack: ${track.title}\nAcademic Director: Dean Sarumi Hammad\nOfficial Academic Portal: ${BRAND_CONFIG.cleanAcademyDomain}\nFor full video replays and complete blueprints, access the Cohort 1.0 Telegram vault.\n%%EOF`;
    const blob = new Blob([sampleText], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = pdf.sampleFileName || `${pdf.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Sample.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadAlert(`Downloaded sample outline: ${pdf.title}`);
    setTimeout(() => setDownloadAlert(null), 4000);
  };

  // Safe sessions and pdfs fallback
  const sessions: TrackMediaSession[] = track.sessions || [
    {
      sessionNumber: 'Session 01',
      title: `${track.shortTitle} Foundations & Setup`,
      duration: '1h 15m',
      topics: ['Environment setup', 'Core workflows', 'Best practices'],
      description: 'Foundational concepts and practical live demonstration of tools.',
      isPreviewAvailable: true,
      previewVideoUrl: '/videos/academy-hero.mp4',
      telegramMessageRef: 'Archive Post #01'
    },
    {
      sessionNumber: 'Session 02',
      title: `${track.shortTitle} Advanced Implementation`,
      duration: '1h 25m',
      topics: ['Advanced pipelines', 'Error handling', 'Production delivery'],
      description: 'Step-by-step implementation of real-world use cases.',
      isPreviewAvailable: false,
      telegramMessageRef: 'Archive Post #02'
    }
  ];

  const pdfDownloads: TrackPdfResource[] = track.pdfDownloads || [
    {
      title: track.pdfGuideTitle || `${track.shortTitle} Master Blueprint`,
      category: 'Master Blueprint',
      pages: '32 Pages',
      fileSize: '3.8 MB',
      description: 'Comprehensive guide and cheat sheet with actionable implementation checklists.',
      isDownloadableSample: true,
      sampleFileName: `${track.slug}_blueprint_sample.pdf`
    }
  ];

  const faqs = track.faqs || [
    {
      q: `What is included in the ${track.shortTitle} track?`,
      a: `You receive immediate access to all ${sessions.length} recorded live video sessions, ${pdfDownloads.length} downloadable PDF blueprints, and admission into our private Telegram mastermind group.`
    },
    {
      q: 'How do I access the materials after payment?',
      a: 'Immediately upon Paystack payment verification, your access token is generated and you receive a direct link to the private Telegram vault where all files are organized.'
    },
    {
      q: 'Can I upgrade to the full 4-in-1 Cohort 1.0 Master Bundle later?',
      a: 'Yes, you can upgrade at any time by paying only the price difference directly through the portal or by messaging Dean Sarumi on Telegram.'
    }
  ];

  return (
    <div className="pt-[74px] sm:pt-[84px] pb-24 bg-[#F7F7FC] text-[#0F1535] min-h-screen selection:bg-[#5B5FED] selection:text-white">
      
      {/* Toast Alert for PDF Downloads */}
      {downloadAlert && (
        <div className="fixed top-24 right-4 z-50 bg-[#0F1535] text-white px-4 py-3 rounded-xl border border-emerald-500/40 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
          <FileCheck2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{downloadAlert}</span>
        </div>
      )}

      {/* Top Breadcrumb & 4-Track Segmented Switcher Strip */}
      <div className="bg-white border-b border-slate-200/90 sticky top-[74px] sm:top-[84px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Breadcrumb Path */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 min-w-0">
              <button
                onClick={onNavigateAcademy}
                className="hover:text-[#5B5FED] transition-colors cursor-pointer shrink-0"
              >
                Academy
              </button>
              <span className="text-slate-300">/</span>
              <button
                onClick={onNavigateBundle}
                className="hover:text-[#5B5FED] transition-colors cursor-pointer shrink-0 truncate max-w-[140px] sm:max-w-none"
              >
                Cohort 1.0 Vault
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-[#0F1535] font-bold truncate">
                {track.shortTitle}
              </span>
            </div>

            {/* Quick 4-Track Segmented Switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold hidden xl:inline shrink-0 mr-1">
                Cohort Tracks:
              </span>
              {allTracks.map((t, idx) => {
                const isActive = t.id === track.id || t.slug === track.slug;
                return (
                  <button
                    key={t.id}
                    onClick={() => onNavigateTrack(t.slug)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#0F1535] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#0F1535]'
                    }`}
                  >
                    <span className={isActive ? 'text-amber-400' : 'text-slate-500'}>
                      {getTrackIcon(t.iconName, 'w-3 h-3')}
                    </span>
                    <span>{t.shortTitle}</span>
                    <span className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                      isActive ? 'bg-white/20 text-purple-200' : 'bg-slate-200 text-slate-600'
                    }`}>
                      0{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* 1. Track Hero Section (Clean Split Layout on Desktop, Text-First on Mobile) */}
      <section className="relative bg-white border-b border-slate-200/80 overflow-hidden py-10 sm:py-16 lg:py-20">
        <div 
          className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#5B5FED_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" 
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Proposition, Details & Enrollment */}
            <div className="lg:col-span-7 flex flex-col items-start text-left space-y-5">
              
              {/* Directorate & Track Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-[#5B5FED] border border-purple-200/80 max-w-full">
                <span className="p-1 rounded-full bg-[#5B5FED] text-white">
                  {getTrackIcon(track.iconName, 'w-3 h-3')}
                </span>
                <span className="font-mono text-[10px] sm:text-[11px] tracking-wide uppercase truncate">
                  Cohort 1.0 Dedicated Track • Dean: Sarumi Hammad
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F1535] tracking-tight leading-[1.12]">
                {track.title}
              </h1>

              {/* Tagline / Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                {track.tagline}
              </p>

              {/* Detailed Description */}
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {track.description}
              </p>

              {/* Key Highlights Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-1">
                {track.keyTakeaways.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Pricing & CTA Card */}
              <div className="w-full p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/40 border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                      Individual Track Tuition
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-[#0F1535]">{track.tuition}</span>
                      <span className="text-xs text-slate-500 font-mono">One-time payment • Lifetime access</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    Private Telegram Included
                  </span>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <button
                    onClick={() => onEnrollCourse(trackCourse)}
                    className="flex-1 px-6 py-3.5 rounded-xl text-sm font-bold bg-[#5B5FED] hover:bg-[#480878] text-white shadow-lg shadow-purple-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    <span>Enroll in This Track ({track.tuition})</span>
                  </button>

                  <button
                    onClick={() => onEnrollCourse(masterBundleCourse)}
                    className="px-5 py-3.5 rounded-xl text-sm font-bold bg-[#0F1535] hover:bg-slate-800 text-white transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-slate-700"
                  >
                    <span>Get All 4 Tracks (₦45,000)</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200/60">
                  <span>⚡ Instant Paystack &amp; Card Checkout</span>
                  <button
                    onClick={() => setShowBankDetails(!showBankDetails)}
                    className="text-[#5B5FED] hover:underline cursor-pointer font-bold inline-flex items-center gap-1"
                  >
                    <Building2 className="w-3 h-3" />
                    <span>{showBankDetails ? 'Hide Bank Details' : 'Prefer Direct Bank Transfer?'}</span>
                  </button>
                </div>

                {/* Collapsible Direct Bank Payment Card */}
                {showBankDetails && (
                  <div className="pt-2 animate-in fade-in">
                    <BankPaymentDetailsCard
                      courseTitle={`${track.title} (Cohort 1.0)`}
                      tuitionAmount={track.tuition}
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Contained Video Player Card */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-lg rounded-3xl bg-[#0F1535] p-3 sm:p-4 text-white shadow-2xl border border-purple-900/40 space-y-3">
                
                {/* Video Header Bar */}
                <div className="flex items-center justify-between px-2 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-200">
                      Sample Session Recording
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-purple-300">
                    {track.sampleVideoDuration || '48 mins'}
                  </span>
                </div>

                {/* Contained Video Thumbnail Container */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-white/10 group">
                  <img
                    src="/images/academy-hero-poster.jpg"
                    alt={`${track.title} Session Preview`}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1535] via-transparent to-black/20" />

                  {/* Play Button Trigger */}
                  <button
                    onClick={() => {
                      const previewSession = sessions.find(s => s.isPreviewAvailable) || sessions[0];
                      setActiveVideoModal(previewSession);
                    }}
                    className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#5B5FED] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer group-hover:bg-purple-600"
                    aria-label="Play sample session video"
                  >
                    <Play className="w-7 h-7 fill-white translate-x-0.5" />
                  </button>

                  {/* Bottom Video Badge */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs pointer-events-none">
                    <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm text-white font-mono text-[10px] truncate max-w-[200px]">
                      {track.sampleVideoTitle}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/90 text-white font-mono text-[10px] font-bold">
                      Free Preview
                    </span>
                  </div>
                </div>

                {/* Telegram Mastermind Community Callout */}
                <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                        <Send className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-white">Private Telegram Vault</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">Full Archive</span>
                  </div>
                  <p className="text-[11px] text-purple-200/80 leading-relaxed">
                    All session replays, timestamped lecture breakdowns, downloadable code files, and PDF blueprints are housed in our dedicated Telegram channel.
                  </p>
                </div>

                {/* Quick PDF Guide Mention */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[11px] text-slate-200 truncate">
                      {track.pdfGuideTitle}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (pdfDownloads[0]) handleDownloadSamplePdf(pdfDownloads[0]);
                    }}
                    className="text-[10px] font-mono text-amber-300 hover:underline cursor-pointer shrink-0 font-bold ml-2"
                  >
                    Sample PDF ↓
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Key Metrics Bar */}
      <section className="bg-slate-100 border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Track Duration</div>
              <div className="text-lg sm:text-xl font-black text-[#0F1535]">4 Weeks</div>
              <div className="text-[11px] text-slate-500 font-mono">Hands-On Labs</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Live Sessions</div>
              <div className="text-lg sm:text-xl font-black text-[#0F1535]">{sessions.length} Recorded</div>
              <div className="text-[11px] text-slate-500 font-mono">HD Telegram Replays</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">PDF Blueprints</div>
              <div className="text-lg sm:text-xl font-black text-[#0F1535]">{pdfDownloads.length} Master Guides</div>
              <div className="text-[11px] text-slate-500 font-mono">Actionable Toolkits</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Community Support</div>
              <div className="text-lg sm:text-xl font-black text-[#0F1535]">Telegram Vault</div>
              <div className="text-[11px] text-slate-500 font-mono">Daily Mentor Q&amp;A</div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Section: Video Previews & Session Recordings Vault */}
      <section id="sessions-vault" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-[#5B5FED] bg-purple-50 border border-purple-200">
              <Video className="w-3.5 h-3.5 text-[#5B5FED]" />
              <span>Session Archive &amp; Replays</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F1535] tracking-tight">
              Recorded Video Sessions &amp; Live Labs
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Every masterclass was recorded in high definition. Preview the introductory session below, or enroll to unlock the complete archive of full-length recordings in Telegram.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shrink-0">
            <Send className="w-3.5 h-3.5 text-sky-500" />
            <span>Hosted in Cohort 1.0 Telegram Vault</span>
          </div>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4 ${
                session.isPreviewAvailable
                  ? 'bg-white border-[#5B5FED]/40 shadow-lg shadow-purple-900/5 hover:border-[#5B5FED]'
                  : 'bg-white/70 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                
                {/* Session Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase text-[#5B5FED] bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                      {session.sessionNumber}
                    </span>
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {session.duration}
                    </span>
                  </div>

                  {session.isPreviewAvailable ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <Play className="w-3 h-3 fill-emerald-600" />
                      Free Preview
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Telegram Vault
                    </span>
                  )}
                </div>

                {/* Session Title */}
                <h3 className="text-base sm:text-lg font-bold text-[#0F1535]">
                  {session.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {session.description}
                </p>

                {/* Topics Covered */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Key Topics Covered:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {session.topics.map((topic, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  {session.telegramMessageRef || 'Vault Recording'}
                </span>

                {session.isPreviewAvailable ? (
                  <button
                    onClick={() => setActiveVideoModal(session)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5B5FED] hover:bg-[#480878] text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Watch Preview</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onEnrollCourse(trackCourse)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#5B5FED] bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Unlock Full Video</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 4. Section: PDF Strategy Guides & Blueprint Toolkits */}
      <section id="pdf-resources" className="py-14 sm:py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>Downloadable Blueprints &amp; Cheatsheets</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F1535] tracking-tight">
                PDF Resources &amp; Actionable Toolkits
              </h2>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                Step-by-step guides, tested prompt databases, workflow architecture maps, and standard legal contracts provided to students.
              </p>
            </div>

            <div className="text-xs text-slate-500 font-mono bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shrink-0">
              📁 Formatted for Mobile &amp; Desktop PDF Readers
            </div>
          </div>

          {/* PDF Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pdfDownloads.map((pdf, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-emerald-500/50 p-6 flex flex-col justify-between space-y-5 transition-all group"
              >
                <div className="space-y-3">
                  
                  {/* Category & File Meta */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                      {pdf.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {pdf.pages} • {pdf.fileSize}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-[#0F1535] group-hover:text-emerald-950 transition-colors">
                    {pdf.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pdf.description}
                  </p>

                </div>

                {/* Download Actions */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center gap-2">
                  {pdf.isDownloadableSample ? (
                    <button
                      onClick={() => handleDownloadSamplePdf(pdf)}
                      className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-[#0F1535] border border-slate-300 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Download Sample PDF</span>
                    </button>
                  ) : null}

                  <button
                    onClick={() => onEnrollCourse(trackCourse)}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-[#0F1535] hover:bg-[#480878] text-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Unlock Full Guide</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. Section: Week-by-Week Curriculum Breakdown */}
      <section id="curriculum" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-[#5B5FED] bg-purple-50 border border-purple-200">
            <Calendar className="w-3.5 h-3.5" />
            <span>Structured Sprint Syllabus</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F1535] tracking-tight">
            Week-by-Week Curriculum &amp; Deliverables
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every week combines architectural theory with a mandatory hands-on project to ensure you build demonstrable proof of work.
          </p>
        </div>

        {/* 4 Weeks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {track.curriculumWeeks.map((week, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#5B5FED]/50 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#5B5FED] uppercase tracking-wider bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                  {week.week} • {week.sessionCount} Sessions
                </span>
                {week.hasPdf && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <FileText className="w-3 h-3 text-emerald-600" />
                    Includes PDF Blueprint
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-[#0F1535]">
                {week.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {week.summary}
              </p>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Hands-On Production Deliverable:
                </span>
                <span className="font-semibold text-[#0F1535]">
                  {week.handsOnDeliverable}
                </span>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* 6. Section: Production Toolchains & Platforms Mastered */}
      <section className="py-12 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            Production Software &amp; Toolchain Mastered in This Track
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
            {track.tools.map((tool, idx) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white text-[#0F1535] border border-slate-200 shadow-xs"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Section: Dean Sarumi & Academic Directorate Mastermind */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0F1535] text-white p-8 sm:p-12 border border-purple-900/50 shadow-2xl relative overflow-hidden">
          
          <div 
            className="absolute inset-0 opacity-10 bg-[radial-gradient(#9030F8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" 
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Academic Leadership &amp; Mentorship</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Taught &amp; Mentored by Dean Sarumi Hammad
              </h2>

              <p className="text-sm text-purple-200/90 leading-relaxed">
                Vixora Academy is not a generic online video course. It is an engineering and commercial training accelerator led by active practitioners who build software, automate client pipelines, and deploy AI systems every day.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-purple-200/80 font-mono">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Direct daily Q&amp;A in Telegram</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Proposal &amp; code teardowns</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>120+ active student peer network</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Referrals &amp; freelance pipeline</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-center sm:text-left">
              <div className="text-xs font-mono uppercase text-amber-300 font-bold">
                Private Student Telegram Hub
              </div>
              <div className="text-sm font-bold text-white">
                {COHORT_1_BUNDLE.telegramChannelName}
              </div>
              <p className="text-xs text-purple-200/70 leading-relaxed">
                Access is granted immediately upon enrollment. No waiting for email links or manual approvals.
              </p>
              <button
                onClick={() => onEnrollCourse(trackCourse)}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#5B5FED] hover:bg-purple-600 text-white transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Join Student Group via Enrollment</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 8. Section: Side-by-Side Pricing & Value Comparison */}
      <section id="pricing" className="py-14 sm:py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-[#5B5FED] bg-purple-50 border border-purple-200">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Transparent Tuition &amp; Access Options</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F1535] tracking-tight">
              Choose Your Enrollment Path
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Enroll solely in {track.shortTitle}, or upgrade to the complete 4-track Cohort 1.0 Master Bundle to unlock all courses at a massive discount.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Card A: Single Track */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    Single Track Access
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    Standalone
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#0F1535]">{track.title}</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#0F1535]">{track.tuition}</span>
                    <span className="text-xs text-slate-500 font-mono">One-time payment</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Complete {sessions.length} recorded HD video sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All {pdfDownloads.length} master PDF blueprints &amp; toolkits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dedicated Telegram channel archive access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Hands-on weekly deliverables review</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onEnrollCourse(trackCourse)}
                className="w-full py-3.5 rounded-xl text-xs font-bold bg-[#5B5FED] hover:bg-[#480878] text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Enroll in {track.shortTitle} ({track.tuition})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card B: Complete 4-in-1 Master Bundle (Recommended) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0F1535] to-[#1A1D4F] text-white border-2 border-amber-400/80 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
              
              {/* Highlight ribbon */}
              <div className="absolute top-4 right-4 bg-amber-400 text-[#0F1535] text-[10px] font-black uppercase px-2.5 py-1 rounded-full font-mono">
                Best Value • Save 50%+
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                    Full 4-in-1 Master Bundle
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">Cohort 1.0 Master Archive</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-amber-300">{COHORT_1_BUNDLE.tuitionBundle}</span>
                    <span className="text-xs text-slate-400 line-through font-mono">{COHORT_1_BUNDLE.standardPrice}</span>
                  </div>
                  <p className="text-[11px] text-purple-200 mt-1 font-mono">
                    Includes this track + all 3 other tracks (Content, Automation, Web &amp; Sales)
                  </p>
                </div>

                <div className="space-y-2 text-xs text-purple-100 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>All 4 Tracks (Content, Automation, Web &amp; Freelancing)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>28+ Hours of HD Session Replays across all modules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>14 Master PDF Guides, Cheatsheets &amp; Workflow JSONs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Full Lifetime Private Telegram Mastermind admission</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onEnrollCourse(masterBundleCourse)}
                className="w-full py-3.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-[#0F1535] shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Unlock All 4 Tracks ({COHORT_1_BUNDLE.tuitionBundle})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 9. Section: Track FAQs */}
      <section className="py-14 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl font-black text-[#0F1535]">
            Got Questions About {track.shortTitle}?
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#0F1535] hover:text-[#5B5FED] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. Sticky Mobile Enrollment Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:px-6 shadow-2xl flex items-center justify-between gap-3">
        <div className="truncate">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold truncate">
            {track.shortTitle}
          </div>
          <div className="text-base font-black text-[#0F1535]">
            {track.tuition}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEnrollCourse(trackCourse)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#5B5FED] text-white shadow-md active:scale-95 transition-all cursor-pointer min-h-[44px] flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Enroll Now</span>
          </button>
          <button
            onClick={onNavigateBundle}
            className="px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 min-h-[44px]"
          >
            Bundle
          </button>
        </div>
      </div>

      {/* Modal: Video Preview Player */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#0F1535] text-white rounded-3xl overflow-hidden border border-purple-900/40 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  {activeVideoModal.sessionNumber} Preview
                </span>
                <span className="text-xs font-mono text-purple-300">
                  {activeVideoModal.duration}
                </span>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black">
              <video
                ref={modalVideoRef}
                controls
                autoPlay
                playsInline
                poster="/images/academy-hero-poster.jpg"
                className="w-full h-full object-contain"
                src={activeVideoModal.previewVideoUrl || '/videos/academy-hero.mp4'}
              >
                Your browser does not support HTML5 video.
              </video>
            </div>

            {/* Modal Footer / CTA */}
            <div className="p-4 sm:p-6 space-y-3">
              <h4 className="text-base font-bold text-white">
                {activeVideoModal.title}
              </h4>
              <p className="text-xs text-purple-200/80 leading-relaxed">
                {activeVideoModal.description}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
                <span className="text-[11px] font-mono text-purple-300">
                  Full 1080p recorded archive unlocked with enrollment
                </span>
                <button
                  onClick={() => {
                    setActiveVideoModal(null);
                    onEnrollCourse(trackCourse);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#5B5FED] hover:bg-purple-600 text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Enroll in Track ({track.tuition})</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
