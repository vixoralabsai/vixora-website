import { useState } from 'react';
import {
  FolderGit2,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  Target,
  BarChart3,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { PORTFOLIO_PROJECTS, PortfolioProject } from '../data/vixoraContent';

interface PortfolioSectionProps {
  onOpenProjectModal: () => void;
}

export function PortfolioSection({ onOpenProjectModal }: PortfolioSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProjectModal, setActiveProjectModal] = useState<PortfolioProject | null>(null);

  const categories = ['All', 'Software Development', 'AI Automation', 'Branding & Web', 'Education & Academy'];

  const filteredProjects =
    selectedCategory === 'All'
      ? PORTFOLIO_PROJECTS
      : PORTFOLIO_PROJECTS.filter((p) => p.category === selectedCategory);

  return (
    <section id="portfolio" className="py-24 bg-neutral-900/30 border-t border-neutral-850 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 mb-3">
              <span>FEATURED CASE STUDIES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 tracking-tight">
              Real Client Outcomes
            </h2>
            <p className="mt-3 text-base text-neutral-400 font-normal">
              Explore how we solved critical operational bottlenecks, deployed AI swarms, and unlocked revenue growth across diverse industries.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl p-7 bg-neutral-900 border border-neutral-800/90 hover:border-neutral-700 transition-all flex flex-col justify-between group hover:shadow-2xl hover:shadow-black/70"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-neutral-800 text-blue-300 border border-neutral-700">
                    {project.category}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {project.outcomeStats}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs font-mono text-neutral-400 mt-1">
                    Client: <span className="text-neutral-200">{project.client}</span>
                  </p>
                </div>

                {/* Business Problem */}
                <div className="p-3.5 rounded-xl bg-neutral-950/90 border border-neutral-850 space-y-1">
                  <div className="text-[11px] font-mono uppercase font-bold text-rose-400/90 flex items-center gap-1.5">
                    <Target className="w-3 h-3" /> Business Problem:
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {project.businessProblem}
                  </p>
                </div>

                {/* Solution */}
                <div className="p-3.5 rounded-xl bg-neutral-950/90 border border-neutral-850 space-y-1">
                  <div className="text-[11px] font-mono uppercase font-bold text-blue-400/90 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Solution Delivered:
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {project.solution}
                  </p>
                </div>

                {/* Technologies Used */}
                <div>
                  <p className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider mb-2">
                    Technologies Used:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologiesUsed.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 rounded text-[11px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Outcome */}
                <div className="pt-3 border-t border-neutral-800">
                  <div className="text-[11px] font-mono uppercase font-bold text-emerald-400/90 flex items-center gap-1.5 mb-1">
                    <BarChart3 className="w-3 h-3" /> Outcome & Measurable ROI:
                  </div>
                  <p className="text-xs font-medium text-emerald-300/90 leading-relaxed">
                    {project.outcome}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-neutral-800/80 flex items-center justify-between">
                <button
                  onClick={() => setActiveProjectModal(project)}
                  className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1"
                >
                  <span>View Case Architecture</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                </button>
                <button
                  onClick={onOpenProjectModal}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-colors"
                >
                  Build Similar Solution
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Case Study Deep-Dive Modal */}
      {activeProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-750 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-blue-400 uppercase font-semibold">
                  {activeProjectModal.category} Case Study
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {activeProjectModal.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Client Organization: <strong className="text-neutral-200">{activeProjectModal.client}</strong>
                </p>
              </div>
              <button
                onClick={() => setActiveProjectModal(null)}
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                aria-label="Close project modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-neutral-300">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <div className="font-bold text-rose-400 text-xs font-mono uppercase">
                  Problem Context:
                </div>
                <p>{activeProjectModal.businessProblem}</p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <div className="font-bold text-blue-400 text-xs font-mono uppercase">
                  Engineered Solution:
                </div>
                <p>{activeProjectModal.solution}</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
                <div className="font-bold text-emerald-400 text-xs font-mono uppercase">
                  Business Outcome & Verified Impact:
                </div>
                <p className="text-emerald-200 font-medium">{activeProjectModal.outcome}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <button
                onClick={() => setActiveProjectModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setActiveProjectModal(null);
                  onOpenProjectModal();
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
              >
                Request Architecture Brief
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
