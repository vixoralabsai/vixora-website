import { useState } from 'react';
import {
  ExternalLink,
  TrendingUp,
  Cpu,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PortfolioProject } from '../data/vixoraContent';
import { PORTFOLIO_PROJECTS_WITH_ADDITIONS, PortfolioProjectWithUrl } from '../data/portfolioAdditions';

interface PortfolioPageProps {
  onOpenProjectModal: () => void;
}

export function PortfolioPage({ onOpenProjectModal }: PortfolioPageProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeProject, setActiveProject] = useState<PortfolioProjectWithUrl | null>(null);

  const filterCategories = ['All', 'AI & Automation', 'SaaS & Web', 'Healthcare', 'Fintech', 'Real Estate', 'Education'];

  const filteredProjects = selectedFilter === 'All'
    ? PORTFOLIO_PROJECTS_WITH_ADDITIONS
    : PORTFOLIO_PROJECTS_WITH_ADDITIONS.filter((p) =>
        p.category.toLowerCase().includes(selectedFilter.toLowerCase()) ||
        p.title.toLowerCase().includes(selectedFilter.toLowerCase())
      );

  return (
    <div className="pt-24 pb-20 bg-[#070314] text-neutral-100 min-h-screen">
      <section className="relative py-16 sm:py-24 overflow-hidden border-b border-purple-900/30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono uppercase tracking-widest text-[11px]">Proven Client Impact</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">Case Studies & Featured Deployments</h1>
          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed">Explore how Vixora Digital Hub builds practical software, AI-powered solutions, and digital platforms that help businesses work better and grow.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-wrap items-center justify-center gap-2 pb-6 border-b border-purple-900/20">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-purple-900/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-neutral-900/80 rounded-3xl border border-neutral-800 hover:border-purple-500/40 transition-all duration-300 flex flex-col overflow-hidden group shadow-xl hover:-translate-y-1">
              <div className="relative aspect-video overflow-hidden bg-[#08082F] flex items-center justify-center">
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#480878] via-[#7000F8] to-[#08082F] flex items-center justify-center p-6 text-center">
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-xl bg-white/10 text-white border border-white/20 flex items-center justify-center mx-auto"><Cpu className="w-5 h-5" /></div>
                      <div className="text-xs font-mono text-white font-bold">{project.outcomeStats}</div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08082F] via-[#08082F]/40 to-transparent pointer-events-none" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase bg-[#000048]/85 text-white border border-white/20 backdrop-blur-md">{project.category}</span>
              </div>

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="text-xs text-neutral-400 font-medium">Client: <span className="text-neutral-200 font-semibold">{project.client}</span></div>
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">{project.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">{project.businessProblem}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-purple-900/20">
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologiesUsed.map((tech, tIdx) => (
                      <span key={tIdx} className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700/60">{tech}</span>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-900/40 flex items-start gap-2.5">
                    <TrendingUp className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-neutral-200"><strong className="text-purple-400 font-semibold">Outcome: </strong>{project.outcome}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noreferrer" className="w-full py-3 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-900/30">
                      <span>View Live Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button onClick={onOpenProjectModal} className="w-full py-3 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition-all flex items-center justify-center gap-2 cursor-pointer border border-neutral-700">
                    <span>Request Similar Architecture</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="py-16 text-center max-w-4xl mx-auto px-4">
        <div className="p-10 rounded-3xl bg-gradient-to-br from-[#0C0620] via-purple-950/40 to-[#070314] border border-purple-900/40 space-y-5 shadow-2xl">
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Have a Digital, Software, or AI Challenge?</h3>
          <p className="text-sm text-neutral-300 max-w-xl mx-auto">Tell us what you are trying to build, improve, automate, or grow—and let’s explore the right solution together.</p>
          <button onClick={onOpenProjectModal} className="px-8 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer">Start Your Project Blueprint</button>
        </div>
      </section>
    </div>
  );
}
