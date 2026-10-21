import { LATEST_INSIGHTS } from '../data/vixoraContent';
import { BookOpen, Clock, ArrowUpRight, Sparkles } from 'lucide-react';

export function LatestInsights() {
  return (
    <section id="resources" className="py-24 bg-neutral-950 border-t border-neutral-850 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 mb-3">
              <span>KNOWLEDGE & ENGINEERING INSIGHTS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 tracking-tight">
              Latest from Vixora Labs
            </h2>
            <p className="mt-3 text-base text-slate-200 font-normal">
              Technical breakdowns, architectural blueprints, and growth frameworks published by our senior engineering leads.
            </p>
          </div>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            <span>Subscribe to Tech Newsletter</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 3 Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LATEST_INSIGHTS.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col justify-between group hover:bg-neutral-900"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-200">
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-blue-300">
                    {item.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.readTime}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {item.excerpt}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-neutral-850 flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium">
                  {item.author}
                </span>
                <span className="text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Read Article <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
