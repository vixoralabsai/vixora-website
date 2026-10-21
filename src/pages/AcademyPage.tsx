import { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  ArrowRight,
  ShieldCheck,
  Building,
  Code2,
  Cpu,
  Bot,
  Globe,
  Clock,
  CreditCard,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { ACADEMY_COURSES, AcademyCourse } from '../data/vixoraContent';
import { BRAND_CONFIG, getVideoSources, getImageFallbacks, getDirectImageUrl } from '../data/brandConfig';

interface AcademyPageProps {
  onOpenProjectModal: () => void;
  onSelectCourse: (course: AcademyCourse) => void;
  onEnrollCourse: (course: AcademyCourse) => void;
  onNavigateHome: () => void;
  onNavigateToStudentPortal?: () => void;
  onNavigateCohort1?: () => void;
}

export function AcademyPage({
  onOpenProjectModal,
  onSelectCourse,
  onEnrollCourse,
  onNavigateHome,
  onNavigateToStudentPortal,
  onNavigateCohort1
}: AcademyPageProps) {
  const [selectedTrack, setSelectedTrack] = useState<string>('All Tracks');
  const [sourceIdx, setSourceIdx] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const posterFallbacks = getImageFallbacks(BRAND_CONFIG.academyHeroBackground?.imageUrl);
  const [posterIdx, setPosterIdx] = useState(0);
  const [posterError, setPosterError] = useState(false);

  const handlePosterError = () => {
    console.warn('[Vixora Academy Poster] ⚠️ Poster image failed to load:', currentPosterSrc);
    if (posterIdx + 1 < posterFallbacks.length) {
      const nextPoster = posterFallbacks[posterIdx + 1];
      console.info('[Vixora Academy Poster] 🔄 Trying fallback poster image:', nextPoster);
      setPosterIdx(prev => prev + 1);
    } else {
      console.error('[Vixora Academy Poster] ❌ All poster image fallbacks failed.');
      setPosterError(true);
    }
  };

  const currentPosterSrc = posterFallbacks[posterIdx] || getDirectImageUrl(BRAND_CONFIG.academyHeroBackground?.imageUrl) || '/images/academy-hero-poster.jpg';

  const academyVideoUrl = BRAND_CONFIG.academyHeroBackground?.videoUrl;
  const academyVideoSources = getVideoSources(academyVideoUrl, '/videos/academy-hero.mp4');
  const currentAcademyVideoSource = academyVideoSources[sourceIdx] || '/videos/academy-hero.mp4';

  const videoRef = useRef<HTMLVideoElement>(null);

  // Initial diagnostics on mount
  useEffect(() => {
    console.info('[Vixora Academy Video] 🎬 Video container initialized:', {
      configuredVideoUrl: academyVideoUrl,
      sourcesList: academyVideoSources,
      initialActiveSource: currentAcademyVideoSource,
      initialPosterImage: currentPosterSrc
    });
  }, []);

  // Autoplay and source transition handling respecting reduced motion
  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      console.info('[Vixora Academy Video] 🔇 prefers-reduced-motion is active; video autoplay suppressed.');
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    console.log(`[Vixora Academy Video] 🚀 Attempting playback for source [${sourceIdx + 1}/${academyVideoSources.length}]:`, currentAcademyVideoSource);
    video.muted = true;
    video.defaultMuted = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('[Vixora Academy Video] ✅ video.play() resolved successfully for:', currentAcademyVideoSource);
        })
        .catch((playErr: any) => {
          console.warn('[Vixora Academy Video] ⚠️ video.play() initially rejected (autoplay restriction or buffering):', {
            name: playErr.name,
            message: playErr.message,
            source: currentAcademyVideoSource
          });
          video.muted = true;
          video.play().catch((retryErr: any) => {
            console.error('[Vixora Academy Video] ❌ Muted retry failed:', retryErr.message);
          });
        });
    }
  }, [currentAcademyVideoSource, sourceIdx, academyVideoSources.length]);

  const handleLoadStart = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const networkLabels: Record<number, string> = {
      0: 'NETWORK_EMPTY (0)',
      1: 'NETWORK_IDLE (1)',
      2: 'NETWORK_LOADING (2)',
      3: 'NETWORK_NO_SOURCE (3)'
    };
    console.log('[Vixora Academy Video] ⏳ onLoadStart:', {
      currentSrc: video.currentSrc || currentAcademyVideoSource,
      networkState: networkLabels[video.networkState] || video.networkState,
      readyState: video.readyState
    });
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    console.log('[Vixora Academy Video] 📋 onLoadedMetadata:', {
      duration: video.duration,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight
    });
  };

  const handleLoadedData = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const readyLabels: Record<number, string> = {
      0: 'HAVE_NOTHING (0)',
      1: 'HAVE_METADATA (1)',
      2: 'HAVE_CURRENT_DATA (2)',
      3: 'HAVE_FUTURE_DATA (3)',
      4: 'HAVE_ENOUGH_DATA (4)'
    };
    console.log('[Vixora Academy Video] 🟢 onLoadedData: First frame rendered successfully', {
      currentSrc: video.currentSrc,
      readyState: readyLabels[video.readyState] || video.readyState
    });
    setVideoLoaded(true);
  };

  const handleCanPlay = () => {
    console.log('[Vixora Academy Video] ▶️ onCanPlay: Media buffer sufficient to begin');
    setVideoLoaded(true);
  };

  const handlePlaying = () => {
    console.log('[Vixora Academy Video] 🎬 onPlaying: Video playback actively underway');
    setVideoLoaded(true);
  };

  const handleWaiting = () => {
    console.log('[Vixora Academy Video] ⏸️ onWaiting: Playback temporarily stalled/buffering');
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const err = video.error;
    const errorLabels: Record<number, string> = {
      1: 'MEDIA_ERR_ABORTED (1) - Fetching process aborted by user/script',
      2: 'MEDIA_ERR_NETWORK (2) - Network error while downloading media',
      3: 'MEDIA_ERR_DECODE (3) - Media decoding failure',
      4: 'MEDIA_ERR_SRC_NOT_SUPPORTED (4) - Format unsupported or source hotlinking blocked'
    };

    console.error('[Vixora Academy Video] ❌ onError encountered:', {
      failedSource: currentAcademyVideoSource,
      sourceIndex: sourceIdx,
      totalSources: academyVideoSources.length,
      errorCode: err?.code,
      errorDescription: err ? (errorLabels[err.code] || `UNKNOWN_CODE_${err.code}`) : 'NO_ERROR_OBJECT',
      errorMessage: err?.message || 'No message provided by browser media engine',
      currentSrc: video.currentSrc,
      networkState: video.networkState,
      readyState: video.readyState
    });

    if (sourceIdx + 1 < academyVideoSources.length) {
      const nextSource = academyVideoSources[sourceIdx + 1];
      console.warn(`[Vixora Academy Video] 🔄 Transitioning to fallback source [${sourceIdx + 2}/${academyVideoSources.length}]:`, nextSource);
      setSourceIdx(prev => prev + 1);
    } else {
      console.error('[Vixora Academy Video] 🚫 All configured video sources failed. Preserving fallback poster image.');
      setVideoError(true);
    }
  };

  const tracks = [
    'All Tracks',
    'Data & Analytics',
    'Business Automation',
    'Engineering & AI',
    'Executive & Leadership',
    'Design & Marketing'
  ];

  const filteredCourses = selectedTrack === 'All Tracks'
    ? ACADEMY_COURSES
    : ACADEMY_COURSES.filter((c) => c.track === selectedTrack);

  const corporateOfferings = [
    {
      title: 'In-House AI Enablement & Engineering Bootcamps',
      desc: 'Customized 4 to 12-week curriculum delivered on-site or remotely to transition your engineering and product teams into high-velocity AI builders.',
      icon: Building,
      badge: 'Corporate Cohorts'
    },
    {
      title: 'AI Automation Hackathons & Sprint Labs',
      desc: '3-day intensive build sprints where your employees build live, production-ready n8n and Python workflows for your actual internal business processes.',
      icon: Cpu,
      badge: '3-Day Sprints'
    },
    {
      title: 'Executive AI Governance & Risk Masterclasses',
      desc: 'Confidential strategic roadmapping sessions for C-suite leaders and directors on AI risk mitigation, model procurement, and 10x ROI vectors.',
      icon: Award,
      badge: 'Executive Advisory'
    },
  ];

  return (
    <div className="pt-[74px] sm:pt-[84px] pb-24 bg-[#F7F7FC] text-[#0F1535] min-h-screen">
      {/* Academy Hero Section — Clean Split Layout (Desktop) & Text-First Contained (Mobile) */}
      <section className="relative bg-white border-b border-slate-200/80 overflow-hidden py-10 sm:py-16 lg:py-20">
        {/* Subtle engineering grid texture */}
        <div 
          className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#5B5FED_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" 
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Text Column: Headline, Kicker, Description, and Action CTAs (1st on Mobile & Left on Desktop) */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Academy Identity & Dean Kicker */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-[#5B5FED] border border-purple-200/80 mb-5 max-w-full">
                <GraduationCap className="w-3.5 h-3.5 text-[#5B5FED] shrink-0" />
                <span className="font-mono text-[10px] sm:text-[11px] tracking-wide uppercase truncate">
                  Vixora Academy • Dean: Sarumi Hammad
                </span>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="hidden sm:inline text-[10px] text-emerald-700 font-medium shrink-0">
                  2026 Admissions
                </span>
              </div>

              {/* Core Headline — Responsive sizing preventing awkward mobile wrapping */}
              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] font-black text-[#0F1535] tracking-tight leading-[1.15] max-w-2xl">
                Engineering-Grade Training in Software, AI &amp; Autonomous Systems
              </h1>

              {/* Supporting Description — High contrast against clean plain background */}
              <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#475569] leading-relaxed max-w-xl font-normal">
                Practical, cohort-based training and masterclasses designed to transform developers, executives, and organizations into high-impact innovators using real production toolchains.
              </p>

              {/* Action CTAs */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={onOpenProjectModal}
                  className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-[#5B5FED] hover:bg-[#480878] text-white shadow-md shadow-[#5B5FED]/25 hover:shadow-lg transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
                >
                  <span>Request Corporate In-House Cohort</span>
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('catalog');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-[#0F1535] border border-slate-200/80 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <BookOpen className="w-4 h-4 text-[#5B5FED]" />
                  <span>Browse Program Tracks</span>
                </button>
              </div>

              {/* Key Highlights */}
              <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs text-slate-500 w-full">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live Production Labs</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-[#5B5FED] shrink-0" />
                  <span>Cryptographically Verified Certs</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Users className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Strict Cohort Caps</span>
                </div>
              </div>

            </div>

            {/* Right Contained Video Panel (2nd on Mobile & Right on Desktop) */}
            <div className="lg:col-span-5 w-full">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-900/5 bg-[#0F1535] group">
                
                {/* Contained Video Header Strip */}
                <div className="px-4 py-2.5 bg-[#0A0E27] border-b border-white/10 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                    <span className="font-mono text-[11px] font-semibold text-white tracking-wide truncate">
                      Vixora Lab Environment
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider shrink-0">
                    Active Cohort
                  </span>
                </div>

                {/* Media Aspect Container — Preserves 16:9 aspect ratio */}
                <div className="relative aspect-video w-full bg-[#070A1E] overflow-hidden">
                  
                  {/* Base Poster Fallback Image */}
                  {currentPosterSrc && !posterError && (
                    <img
                      src={currentPosterSrc}
                      alt="Vixora Academy Technical Environment"
                      referrerPolicy="no-referrer"
                      onError={handlePosterError}
                      className={`w-full h-full object-cover object-center absolute inset-0 transition-opacity duration-500 ${
                        videoLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                      }`}
                    />
                  )}

                  {/* Contained Ambient Video Loop */}
                  {currentAcademyVideoSource && !videoError && (
                    <video
                      ref={videoRef}
                      key={currentAcademyVideoSource}
                      src={currentAcademyVideoSource}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      poster={currentPosterSrc}
                      onLoadStart={handleLoadStart}
                      onLoadedMetadata={handleLoadedMetadata}
                      onLoadedData={handleLoadedData}
                      onCanPlay={handleCanPlay}
                      onPlaying={handlePlaying}
                      onWaiting={handleWaiting}
                      onError={handleVideoError}
                      className={`w-full h-full object-cover object-center absolute inset-0 transition-opacity duration-500 motion-reduce:hidden ${
                        videoLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  )}

                  {/* Contained Media Badges */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0F1535]/90 via-[#0F1535]/40 to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/95 pointer-events-none font-mono">
                    <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] border border-white/10">
                      Autonomous AI &amp; Cloud Systems
                    </span>
                    <span className="bg-[#5B5FED]/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white border border-[#5B5FED]/40">
                      2026 Cohort
                    </span>
                  </div>
                </div>

                {/* Contained Card Footer */}
                <div className="p-3.5 bg-[#0F1535] text-purple-200 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px] text-purple-100 font-medium">Production-grade toolchains &amp; codebases</span>
                  </div>
                  <button
                    onClick={() => {
                      const el = document.getElementById('catalog');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[11px] text-amber-300 hover:text-amber-200 font-semibold cursor-pointer shrink-0"
                  >
                    View Tracks &rarr;
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Cohort 1.0 Masterclass Vault Banner */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#0F1535] via-[#1A114A] to-[#0A0D28] text-white p-6 sm:p-8 border border-purple-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-400 text-[#000048]">
              <Sparkles className="w-3.5 h-3.5 fill-[#000048]" />
              <span>Flagship Vault Available</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Vixora Academy Cohort 1.0: 4-in-1 Masterclass
            </h3>
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl leading-relaxed">
              Complete archives of our live cohort: AI Content Creation, AI Automation, AI Web Development, and Client Acquisition. 28+ hours of video replays, 14 strategy PDFs &amp; Private Telegram Community.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
            {onNavigateCohort1 && (
              <button
                onClick={onNavigateCohort1}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-white text-[#0F1535] hover:bg-purple-50 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span>Explore Cohort 1.0 Vault</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#5B5FED]" />
              </button>
            )}
            <button
              onClick={() => {
                const bundle = ACADEMY_COURSES.find(c => c.id === 'course-cohort-1-master-bundle');
                if (bundle) onEnrollCourse(bundle);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-[#000048] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <Award className="w-3.5 h-3.5 text-[#000048]" />
              <span>Enroll (₦45,000)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Course Catalog Showcase */}
      <section id="catalog" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[#480878]">
              <BookOpen className="w-3.5 h-3.5" /> Course Catalog & Individual Landing Pages
            </div>
            <h2 className="text-3xl font-extrabold text-[#000048] tracking-tight" style={{ color: '#000048' }}>
              Select a Program Track
            </h2>
            <p className="text-sm text-[#5F6078] max-w-2xl" style={{ color: '#475569' }}>
              Each course features a dedicated landing page with weekly syllabus breakdowns, hands-on production labs, capstone previews, and verified certifications.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
            {tracks.map((track) => (
              <button
                key={track}
                onClick={() => setSelectedTrack(track)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTrack === track
                    ? 'bg-white text-[#000048] shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-[#000048] hover:bg-slate-200/50'
                }`}
              >
                {track}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="relative bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,72,0.03)] hover:shadow-[0_20px_40px_rgba(72,8,120,0.12)] transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1.5"
            >
              {/* Hairline glowing gradient top border on hover (21st.dev signature) */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#480878] via-[#7000F8] to-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#480878] bg-[#480878]/5 px-2.5 py-1 rounded-md border border-[#480878]/15">
                    {course.badge}
                  </span>
                  <div className="text-sm font-black font-mono tracking-tight text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                    {course.tuition}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3
                    onClick={() => onSelectCourse(course)}
                    className="text-lg font-bold text-[#000048] group-hover:text-[#7000F8] transition-colors cursor-pointer leading-snug tracking-tight"
                  >
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#5F6078] line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50/90 border border-slate-100 text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#5F6078]">
                    <div className="p-1 rounded-md bg-purple-100/60 text-[#7000F8] shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Duration</span>
                      <span className="truncate font-semibold text-[#000048]">{course.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#5F6078]">
                    <div className="p-1 rounded-md bg-purple-100/60 text-[#7000F8] shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Next Cohort</span>
                      <span className="truncate font-semibold text-[#000048]">{course.nextCohortDate}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7000F8]" />
                    Key Curriculum Modules:
                  </div>
                  <ul className="space-y-1.5">
                    {course.curriculum.slice(0, 3).map((curr, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#5F6078]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1 text-slate-700">{curr}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-3">
                <button
                  onClick={() => onSelectCourse(course)}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-[#000048] hover:bg-[#480878] text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer group/btn"
                >
                  <span>Explore Course Landing Page</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center justify-between text-[11px] px-1 font-mono text-[#5F6078]">
                  <span className="inline-flex items-center gap-1.5 text-amber-700 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    {course.seatsRemaining} seats left
                  </span>
                  <button
                    onClick={() => onEnrollCourse(course)}
                    className="text-[#480878] hover:text-[#7000F8] font-bold hover:underline cursor-pointer"
                  >
                    Quick Enroll &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Academic Directorate & Dean Leadership Banner */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#000048] via-[#480878] to-[#7000F8] text-white p-8 sm:p-12 shadow-xl relative overflow-hidden border border-white/10">
          <div 
            className="absolute -right-8 -bottom-10 w-80 h-80 opacity-10 pointer-events-none rounded-full bg-contain bg-no-repeat bg-center"
            style={{ backgroundImage: `url('/images/vixora-academy-logo.jpg')` }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="p-3 bg-white rounded-2xl shadow-lg shrink-0 flex items-center justify-center">
                <img
                  src="/images/vixora-academy-logo.jpg"
                  alt="Vixora Academy — Learn. Apply. Earn."
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-widest bg-white/15 text-purple-200 border border-white/20">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  Academic Directorate
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Sarumi Hammad
                </h3>
                <p className="text-sm font-semibold text-purple-200">
                  Dean, Vixora Academy
                </p>
                <p className="text-xs sm:text-sm text-purple-100/90 max-w-xl leading-relaxed pt-1">
                  Directing curriculum rigor, enterprise capstone evaluations, and cryptographically verified graduate certifications across all autonomous AI, cloud engineering, and data programs.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
              {onNavigateToStudentPortal && (
                <button
                  onClick={onNavigateToStudentPortal}
                  className="px-6 py-3 rounded-xl text-xs font-bold bg-white text-[#000048] hover:bg-purple-50 transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-[#7000F8]" />
                  <span>Student & Certificate Portal</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-[#E5E5F0] p-8 sm:p-12 space-y-10 shadow-lg">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[#480878]">
              <Building className="w-4 h-4" /> Enterprise Workforce Transformation
            </div>
            <h2 className="text-3xl font-extrabold text-[#000048] tracking-tight" style={{ color: '#000048' }}>
              Custom Corporate Training & In-House Cohorts
            </h2>
            <p className="text-sm text-[#5F6078] leading-relaxed" style={{ color: '#475569' }}>
              We design and deliver bespoke corporate training programs for technology companies, enterprises, and government agencies seeking to upskill entire teams in modern autonomous toolchains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {corporateOfferings.map((off, idx) => {
              const Icon = off.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#F7F7FC] border border-[#E5E5F0] hover:border-[#9030F8]/40 transition-all space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-[#480878]/5 text-[#480878] w-fit">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#480878]/5 text-[#480878] border border-[#480878]/15">
                      {off.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#000048]">{off.title}</h3>
                  <p className="text-xs text-[#5F6078] leading-relaxed">{off.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E5E5F0]">
            <div className="text-xs text-[#5F6078]">
              Need a custom syllabus tailored to your company's proprietary tech stack?
            </div>
            <button
              onClick={onOpenProjectModal}
              className="px-6 py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#480878] via-[#7000F8] to-[#9030F8] hover:from-[#7000F8] hover:to-[#480878] text-white shadow-lg shadow-[#480878]/25 transition-all cursor-pointer shrink-0"
            >
              Book Corporate Scoping Call
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
