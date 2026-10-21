import { useState } from 'react';
import {
  Search,
  FileSpreadsheet,
  Palette,
  Code2,
  CheckCircle,
  Rocket,
  Headphones,
  CheckCircle2,
  Calendar,
  Clock,
  ChevronRight
} from 'lucide-react';
import { PROCESS_STEPS, ProcessStep } from '../data/vixoraContent';

export function ProcessSection() {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const activeStep = PROCESS_STEPS[activeStepIndex];

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <Search className="w-4 h-4" />;
      case 2:
        return <FileSpreadsheet className="w-4 h-4" />;
      case 3:
        return <Palette className="w-4 h-4" />;
      case 4:
        return <Code2 className="w-4 h-4" />;
      case 5:
        return <CheckCircle className="w-4 h-4" />;
      case 6:
        return <Rocket className="w-4 h-4" />;
      case 7:
        return <Headphones className="w-4 h-4" />;
      default:
        return <Code2 className="w-4 h-4" />;
    }
  };

  return (
    <section id="process" className="py-24 bg-neutral-900/40 border-t border-neutral-850 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 mb-3">
            <span>METHODOLOGY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 tracking-tight">
            Our 7-Step Engineering Lifecycle
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-200 font-normal">
            A battle-tested, zero-surprise delivery framework guaranteeing predictable timelines, clean code, and measurable business outcomes.
          </p>
        </div>

        {/* 7-Step Navigation Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-10">
          {PROCESS_STEPS.map((step, idx) => {
            const isCurrent = idx === activeStepIndex;
            return (
              <button
                key={step.step}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-blue-950/50 border-blue-500/80 shadow-md shadow-blue-500/10'
                    : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isCurrent
                        ? 'bg-blue-500 text-white'
                        : 'bg-neutral-800 text-slate-200'
                    }`}
                  >
                    0{step.step}
                  </span>
                  <div
                    className={`${
                      isCurrent ? 'text-blue-400' : 'text-slate-300'
                    }`}
                  >
                    {getStepIcon(step.step)}
                  </div>
                </div>
                <p
                  className={`text-xs font-bold leading-tight line-clamp-1 ${
                    isCurrent ? 'text-blue-300' : 'text-slate-200'
                  }`}
                >
                  {step.title.split(' ')[0]}
                </p>
                <span className="text-[10px] font-mono text-slate-300 mt-1">
                  {step.duration}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detailed Active Step Deep-Dive */}
        <div className="p-7 sm:p-9 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left description */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-blue-600 text-white">
                  STAGE 0{activeStep.step}
                </span>
                <span className="text-xs font-mono text-slate-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Estimated Timeline: {activeStep.duration}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                {activeStep.title}
              </h3>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {activeStep.description}
              </p>

              <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                <div className="text-xs font-mono text-slate-200 uppercase tracking-wider">
                  Strategic Objective:
                </div>
                <div className="text-sm font-medium text-slate-100">
                  {activeStep.subtitle}
                </div>
              </div>
            </div>

            {/* Right Deliverables Card */}
            <div className="lg:col-span-5 p-6 rounded-xl bg-neutral-950 border border-neutral-800/90 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <span className="text-xs font-mono uppercase font-bold text-blue-400 tracking-wider">
                  Verifiable Deliverables
                </span>
                <span className="text-[10px] font-mono text-slate-300">
                  Signed Off Prior to Next Stage
                </span>
              </div>

              <div className="space-y-3">
                {activeStep.deliverables.map((d, dIdx) => (
                  <div
                    key={dIdx}
                    className="flex items-start gap-3 text-xs sm:text-sm text-slate-100"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                <button
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 text-neutral-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                >
                  Previous Stage
                </button>
                <button
                  disabled={activeStepIndex === PROCESS_STEPS.length - 1}
                  onClick={() =>
                    setActiveStepIndex((prev) =>
                      Math.min(PROCESS_STEPS.length - 1, prev + 1)
                    )
                  }
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span>Next Stage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
