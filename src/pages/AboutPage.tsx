import {
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { ProcessSection } from '../components/ProcessSection';
import { TechnologiesSection } from '../components/TechnologiesSection';

interface AboutPageProps {
  onOpenProjectModal: () => void;
  onNavigate: (page: string) => void;
}

export function AboutPage({ onOpenProjectModal, onNavigate }: AboutPageProps) {
  const coreValues = [
    {
      title: 'Practical Technology That Delivers',
      desc: 'We focus on building useful digital solutions that solve real business problems—from websites and software to AI-powered workflows and automation.',
      icon: ShieldCheck,
      badge: 'Impact',
    },
    {
      title: 'AI That Works for Your Business',
      desc: 'We apply AI automation, intelligent workflows, and creative AI tools to help businesses reduce repetitive work, improve operations, and move faster.',
      icon: Cpu,
      badge: 'AI & Automation',
    },
    {
      title: 'Your Business, Your Assets',
      desc: 'We build with long-term ownership in mind. Your digital products, brand assets, content, and business systems should remain useful and accessible to your organization.',
      icon: Lock,
      badge: 'Ownership',
    },
    {
      title: 'Technology + Growth',
      desc: 'We connect technology with business growth through software, websites, branding, marketing, media, automation, and practical digital training.',
      icon: Zap,
      badge: 'Growth',
    },
  ];

  const milestones = [
    {
      year: '01',
      title: 'Understand the Business',
      desc: 'We start by understanding your goals, challenges, customers, and the outcome you want to achieve.',
    },
    {
      year: '02',
      title: 'Design the Right Solution',
      desc: 'We turn the business need into a clear digital strategy, product direction, workflow, or creative plan.',
    },
    {
      year: '03',
      title: 'Build & Implement',
      desc: 'We create and deploy practical solutions across software, websites, AI automation, branding, media, and digital systems.',
    },
    {
      year: '04',
      title: 'Grow With the System',
      desc: 'We help you improve, maintain, and get more value from your digital systems as your business grows.',
    },
  ];

  return (
    <div className="pt-24 pb-20 bg-[#070314] text-neutral-100 min-h-screen">
      {/* Hero Header */}
      <section className="relative py-16 sm:py-24 overflow-hidden border-b border-purple-900/30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono uppercase tracking-widest text-[11px]">About Vixora Digital Hub</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Technology, AI & Digital Growth for Modern Businesses
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Vixora Digital Hub helps businesses turn ideas into practical digital solutions. We combine software development, websites, AI automation, branding, marketing, media, and digital education to help organizations work better and grow.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <button
              onClick={onOpenProjectModal}
              className="px-7 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              Start a Conversation
            </button>
            <button
              onClick={() => onNavigate('portfolio')}
              className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 hover:border-purple-500/40 transition-all cursor-pointer"
            >
              View Our Work
            </button>
          </div>
        </div>
      </section>

      {/* Core Mission & Value Pillars */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-purple-400">
            WHAT WE STAND FOR
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Why Businesses Choose Vixora
          </h2>
          <p className="text-sm text-neutral-400">
            We combine technology, creativity, and practical business thinking to build solutions that are useful—not technology for technology’s sake.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coreValues.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-neutral-900/70 border border-purple-900/30 hover:border-purple-500/40 transition-all space-y-4 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-neutral-950 text-purple-300 border border-purple-900/40 uppercase">
                    {val.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                  {val.title}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {val.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <ProcessSection />

      <TechnologiesSection />

      {/* How We Work */}
      <section className="py-20 border-t border-purple-900/30 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-purple-400">
            HOW WE WORK
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            From Idea to Real-World Impact
          </h2>
          <p className="text-sm text-neutral-400">
            A simple approach that keeps the technology connected to the business outcome.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3 relative"
            >
              <div className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                {m.year}
              </div>
              <h4 className="text-base font-bold text-white">{m.title}</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 text-center max-w-4xl mx-auto px-4">
        <div className="p-10 rounded-3xl bg-gradient-to-b from-purple-950/60 to-neutral-950 border border-purple-500/30 space-y-5">
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to Build Something That Moves Your Business Forward?
          </h3>
          <p className="text-sm text-neutral-300 max-w-xl mx-auto">
            Tell us what you are trying to build, improve, automate, or grow—and let’s explore the right solution together.
          </p>
          <button
            onClick={onOpenProjectModal}
            className="px-8 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            Start a Conversation
          </button>
        </div>
      </section>
    </div>
  );
}
