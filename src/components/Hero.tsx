import { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  Bot,
  Code2,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Layers,
  Terminal
} from 'lucide-react';
import { BRAND_CONFIG, getImageFallbacks, getDirectImageUrl, getVideoSources } from '../data/brandConfig';

interface HeroProps {
  onOpenProjectModal: () => void;
  onExploreServices: () => void;
  onOpenDriveWorkspace?: () => void;
}

export function Hero({
  onOpenProjectModal,
  onExploreServices,
}: HeroProps) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const fallbacks = getImageFallbacks(BRAND_CONFIG.heroBackground.imageUrl);
  const [bgIdx, setBgIdx] = useState(0);
  const [bgLoadError, setBgLoadError] = useState(false);
  const [sourceIdx, setSourceIdx] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const handleImageError = () => {
    if (bgIdx + 1 < fallbacks.length) {
      setBgIdx(prev => prev + 1);
    } else {
      setBgLoadError(true);
    }
  };

  const currentBgSrc = fallbacks[bgIdx] || getDirectImageUrl(BRAND_CONFIG.heroBackground.imageUrl);
  const videoUrl = BRAND_CONFIG.heroBackground?.videoUrl;
  const videoSources = getVideoSources(videoUrl, '/videos/hero-background.mp4');
  const currentVideoSource = videoSources[sourceIdx] || '/videos/hero-background.mp4';

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }, [currentVideoSource]);

  const handleVideoError = () => {
    if (sourceIdx + 1 < videoSources.length) {
      setSourceIdx(prev => prev + 1);
    } else {
      setVideoError(true);
    }
  };

  const capabilities = [
    {
      id: 'ai',
      title: 'Autonomous AI Systems',
      subtitle: 'Multi-agent orchestration, custom LLM pipelines, and automated enterprise workflows.',
      badge: 'Active Pipeline',
      badgeColor: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30',
      icon: Bot,
      iconBg: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-300',
    },
    {
      id: 'software',
      title: 'Custom Software & Cloud',
      subtitle: 'Resilient distributed systems, modern full-stack web platforms, and scalable APIs.',
      badge: '99.99% Uptime',
      badgeColor: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30',
      icon: Code2,
      iconBg: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300',
    },
    {
      id: 'intelligence',
      title: 'Growth & Intelligence Systems',
      subtitle: 'Data pipelines, predictive performance analytics, and high-conversion infrastructure.',
      badge: 'High Velocity',
      badgeColor: 'text-fuchsia-300 bg-fuchsia-950/60 border-fuchsia-500/30',
      icon: BarChart3,
      iconBg: 'from-fuchsia-500/20 to-purple-500/20 border-fuchsia-500/40 text-fuchsia-300',
    },
  ];

  return (
    <section
      id="hero"
      aria-label="Vixora Digital Hub Hero"
      className="relative isolate min-h-[85vh] sm:min-h-[92vh] pt-24 pb-14 sm:pt-36 sm:pb-28 overflow-hidden bg-[#070314] flex items-center"
    >
      {/* ========================================================================= */}
      {/* 1. HERO BACKGROUND: Video Background with Seamless Image Poster Fallback */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        
        {/* Base Poster Image - always present so there is never a blank screen (z-[1]) */}
        {currentBgSrc && !bgLoadError && (
          <img
            src={currentBgSrc}
            alt="Vixora Digital Hub Environment"
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="w-full h-full object-cover object-center absolute inset-0 z-[1]"
          />
        )}

        {/* Ambient Video Background (z-[2]) */}
        {currentVideoSource && !videoError && (
          <video
            ref={videoRef}
            key={currentVideoSource}
            src={currentVideoSource}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={currentBgSrc}
            onLoadedData={() => setVideoLoaded(true)}
            onCanPlay={() => setVideoLoaded(true)}
            onPlaying={() => setVideoLoaded(true)}
            onError={handleVideoError}
            className={`w-full h-full object-cover object-center absolute inset-0 z-[2] transition-opacity duration-700 ${videoLoaded ? 'opacity-100' : 'opacity-70'}`}
          />
        )}

        {/* Semi-transparent cinematic radial backlight focusing luminous depth behind the headline (z-[3]) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_35%,rgba(168,85,247,0.22)_0%,rgba(79,70,229,0.12)_40%,rgba(7,3,20,0.38)_75%,transparent_100%)] lg:bg-[radial-gradient(ellipse_60%_50%_at_30%_45%,rgba(168,85,247,0.18)_0%,rgba(79,70,229,0.10)_35%,rgba(7,3,20,0.35)_70%,transparent_100%)] pointer-events-none z-[3]" />

        {/* Subtle edge feathering to smoothly marry header and subsequent section content (z-[3]) */}
        <div className="absolute inset-x-0 top-0 h-20 sm:h-24 bg-gradient-to-b from-[#070314]/75 to-transparent pointer-events-none z-[3]" />
        <div className="absolute inset-x-0 bottom-0 h-20 sm:h-28 bg-gradient-to-t from-[#070314]/85 to-transparent pointer-events-none z-[3]" />

        {/* Subtle Cyber Neon Grid Texture (z-[3]) */}
        <div 
          className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#A855F7_1px,transparent_1px)] [background-size:32px_32px] z-[3]" 
        />
      </div>

      {/* Atmospheric Ambient Glows (z-[4]) */}
      <div className="absolute top-1/4 right-1/4 w-[360px] sm:w-[520px] h-[360px] sm:h-[520px] bg-purple-600/20 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none z-[4]" />
      <div className="absolute bottom-10 left-10 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-600/15 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none z-[4]" />

      {/* ========================================================================= */}
      {/* 2. FOREGROUND CONTENT GRID (relative z-10)                                 */}
      {/* ========================================================================= */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 items-center">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Clear Value Proposition & Single Prominent CTA */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-center lg:text-left relative">
            {/* Luminous, cinematic focal glow behind headline for superior contrast, readability, and depth */}
            <div className="absolute -inset-6 sm:-inset-10 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.28)_0%,rgba(79,70,229,0.14)_35%,rgba(7,3,20,0.5)_65%,transparent_85%)] lg:bg-[radial-gradient(ellipse_at_35%_40%,rgba(147,51,234,0.25)_0%,rgba(79,70,229,0.14)_35%,rgba(7,3,20,0.5)_65%,transparent_85%)] blur-2xl pointer-events-none" />
            
            {/* Clean Status Eyebrow Tag */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono tracking-wider uppercase text-purple-300">
              <span className="font-semibold text-purple-200">Software</span>
              <span className="text-purple-400/60 font-bold" aria-hidden="true">·</span>
              <span className="font-semibold text-indigo-200">AI Systems</span>
              <span className="text-purple-400/60 font-bold" aria-hidden="true">·</span>
              <span className="font-semibold text-cyan-200">Scalable Architecture</span>
            </div>

            {/* Bold, Distinct Headline with responsive clamp sizing and text shadows */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl lg:text-[62px] xl:text-[66px] font-black tracking-tight text-white leading-[1.12] sm:leading-[1.08] [text-wrap:balance] drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                <span>Build Smarter.</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300">
                  Automate Faster.
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-300 to-cyan-400">
                  Scale Infinitely.
                </span>
              </h1>
            </div>

            {/* Concise Value Proposition Paragraph with crisp readability */}
            <p className="text-sm sm:text-lg lg:text-xl text-neutral-100 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] px-1 sm:px-0">
              We engineer custom enterprise software, autonomous AI agent workflows, and cloud-scale platforms that turn complex operations into lasting market advantage.
            </p>

            {/* Single Prominent Call-to-Action with mobile full-width tap targets */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 w-full sm:w-auto max-w-md mx-auto lg:mx-0">
              <button
                id="hero-primary-cta-btn"
                onClick={onOpenProjectModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 sm:px-9 sm:py-4 rounded-xl text-sm sm:text-base font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] text-white shadow-xl shadow-purple-600/35 hover:shadow-purple-500/50 transition-all duration-300 cursor-pointer border border-purple-400/40 group min-h-[48px]"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-5 h-5 text-purple-200 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-explore-link-btn"
                onClick={onExploreServices}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-medium text-purple-300 hover:text-white transition-colors cursor-pointer min-h-[44px]"
              >
                <span>Explore capabilities</span>
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </button>
            </div>

            {/* Trust Assurance Strip */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-4 sm:gap-x-6 text-[11px] sm:text-xs text-neutral-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span>Fixed-scope milestones</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span>Zero vendor lock-in</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span>2-week rapid MVP delivery</span>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Clean Unified System Architecture Console   */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            
            {/* Ambient Backlight */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 blur-xl opacity-70 pointer-events-none" />

            {/* Unified Glass Console */}
            <div className="relative rounded-2xl bg-[#0B0520]/80 border border-purple-500/20 backdrop-blur-xl p-4 sm:p-6 shadow-2xl shadow-purple-950/40 space-y-3 sm:space-y-4">
              
              {/* Terminal Window Header */}
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/15">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  <span className="ml-2 font-mono text-[11px] text-purple-300/80 font-medium flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-purple-400" />
                    vixora-core // architecture
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Capability Stack */}
              <div className="space-y-2.5">
                {capabilities.map((cap, idx) => {
                  const Icon = cap.icon;
                  const isSelected = activeTab === idx;

                  return (
                    <div
                      key={cap.id}
                      onMouseEnter={() => setActiveTab(idx)}
                      onClick={() => onExploreServices()}
                      className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-left ${
                        isSelected
                          ? 'bg-[#150B33] border-purple-400/50 shadow-md shadow-purple-950/50'
                          : 'bg-[#0E0728]/50 border-purple-500/15 hover:bg-[#12092E]/60 hover:border-purple-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${cap.iconBg} border shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-semibold text-white truncate">
                              {cap.title}
                            </h3>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-medium whitespace-nowrap ${cap.badgeColor}`}>
                              {cap.badge}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-neutral-300/85 line-clamp-2 leading-relaxed">
                            {cap.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Console Footer */}
              <div className="pt-3 border-t border-purple-500/15 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <span className="flex items-center gap-1.5 text-purple-300">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>SLA 99.99% Guaranteed</span>
                </span>
                <button
                  onClick={onExploreServices}
                  className="text-purple-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Explore Stack</span>
                  <Layers className="w-3 h-3 text-purple-400" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
