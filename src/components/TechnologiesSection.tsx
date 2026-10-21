import { useState } from 'react';
import {
  Code,
  Zap,
  Globe,
  Atom,
  Database,
  Box,
  Cloud,
  Bot,
  Cpu,
  Workflow,
  GitBranch,
  Figma as FigmaIcon,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { TECHNOLOGIES, TechItem } from '../data/vixoraContent';

export function TechnologiesSection() {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Backend', 'Frontend', 'Database', 'Cloud & DevOps', 'AI & Automation', 'Design & Tooling'];

  const filteredTech =
    activeCategory === 'All'
      ? TECHNOLOGIES
      : TECHNOLOGIES.filter((t) => t.category === activeCategory);

  const getTechIcon = (name: string) => {
    switch (name) {
      case 'Python':
        return <Code className="w-5 h-5 text-amber-400" />;
      case 'FastAPI':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'Next.js':
        return <Globe className="w-5 h-5 text-white" />;
      case 'React 19':
        return <Atom className="w-5 h-5 text-cyan-400" />;
      case 'PostgreSQL':
        return <Database className="w-5 h-5 text-blue-400" />;
      case 'Supabase':
        return <Database className="w-5 h-5 text-emerald-400" />;
      case 'Docker':
        return <Box className="w-5 h-5 text-blue-500" />;
      case 'AWS':
        return <Cloud className="w-5 h-5 text-amber-500" />;
      case 'OpenAI APIs':
        return <Bot className="w-5 h-5 text-emerald-300" />;
      case 'TensorFlow':
        return <Cpu className="w-5 h-5 text-orange-400" />;
      case 'n8n':
        return <Workflow className="w-5 h-5 text-pink-400" />;
      case 'GitHub':
        return <GitBranch className="w-5 h-5 text-purple-400" />;
      case 'Figma':
        return <FigmaIcon className="w-5 h-5 text-rose-400" />;
      default:
        return <Code className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <section id="technologies" className="py-24 bg-neutral-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 mb-3">
            <span>CORE ENGINEERING STACK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 tracking-tight">
            Production-Grade Technologies
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-200 font-normal">
            We build strictly on scalable, industry-standard modern stacks with strong developer ecosystems, native cloud elasticity, and active long-term support.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-neutral-900 text-slate-200 hover:text-white hover:bg-neutral-850 border border-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Technologies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTech.map((tech, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col justify-between group hover:bg-neutral-900"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                    {getTechIcon(tech.name)}
                  </div>
                  {tech.badge && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-800 text-slate-200">
                      {tech.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {tech.name}
                </h3>
                <span className="text-[11px] font-mono text-slate-200 block mt-0.5 mb-2">
                  {tech.category}
                </span>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {tech.role}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-850 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>Production Vetted</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
