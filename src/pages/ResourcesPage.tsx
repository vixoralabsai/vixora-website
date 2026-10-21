import { useState } from 'react';
import {
  BookOpen,
  FileText,
  Search,
  Sparkles,
  ArrowRight,
  Download,
  HardDrive,
  CheckCircle2,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { LATEST_INSIGHTS, InsightItem } from '../data/vixoraContent';

interface ResourcesPageProps {
  onOpenDriveWorkspace: () => void;
  onOpenProjectModal: () => void;
}

export function ResourcesPage({ onOpenDriveWorkspace, onOpenProjectModal }: ResourcesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const whitepapers = [
    {
      title: 'The Enterprise AI Automation Playbook (2025-2026)',
      desc: 'Architecting resilient autonomous agent swarms, vector RAG databases, and secure token governance.',
      format: 'PDF Guide • 28 Pages',
      category: 'AI & Automation',
    },
    {
      title: 'Zero Tech Debt: High-Concurrency SaaS Architecture',
      desc: 'How to scale FastAPI, Next.js, and PostgreSQL to 500k+ MAU with zero downtime.',
      format: 'Whitepaper • 18 Pages',
      category: 'Software Engineering',
    },
    {
      title: 'Media Buying & High-Conversion UGC Ad Formulas',
      desc: 'Data-driven creative production frameworks for lowering CPA by 40% across Meta & TikTok.',
      format: 'Case Study • 14 Pages',
      category: 'Growth & Marketing',
    },
  ];

  const faqs = [
    {
      q: 'How does Vixora approach client code and intellectual property ownership?',
      a: 'We operate with 100% full intellectual property transfer. You own all source code repositories, databases, design assets, and cloud deployment pipelines from day one with zero vendor lock-in.',
    },
    {
      q: 'How long does a typical software or AI automation project take?',
      a: 'Sprint MVPs and focused automations typically deliver within 2 to 4 weeks. Full enterprise software systems, multi-tenant SaaS platforms, and complex agent swarms average 6 to 12 weeks with weekly sprint demos.',
    },
    {
      q: 'Can Vixora integrate with our existing enterprise stack?',
      a: 'Yes. We routinely integrate with legacy REST/SOAP APIs, internal databases (PostgreSQL, SQL Server, Oracle), CRMs (Salesforce, HubSpot), ERPs (SAP, NetSuite), and modern AI providers.',
    },
    {
      q: 'What is the Google Drive Requirements PRD Hub tool?',
      a: 'The Drive PRD Hub connects directly to your Google Drive to scan your project notes, specifications, and architecture documents. It uses Gemini AI to synthesize a comprehensive Project Requirements Document (PRD) with milestone breakdowns and tech stack recommendations.',
    },
  ];

  const filteredPosts = LATEST_INSIGHTS.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-24 pb-20 bg-[#070314] text-neutral-100 min-h-screen">
      {/* Hero Header */}
      <section className="relative py-16 sm:py-24 overflow-hidden border-b border-purple-900/30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-300">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono uppercase tracking-widest text-[11px]">Knowledge & Engineering Hub</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Insights, Blueprints & Strategic Guides
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Deep-dive technical articles, downloadable architecture playbooks, and intelligence from the Vixora engineering collective.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto pt-4">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, AI agents, architecture..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-900/90 border border-purple-900/40 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500 shadow-inner"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Google Drive Workspace Tool Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-neutral-950 border border-purple-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <HardDrive className="w-3 h-3 text-purple-400" />
              <span>Drive PRD Hub Utility</span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              Scan Your Google Drive & Compile a Project PRD
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300">
              Connect your Google Workspace or browse sample blueprints. Our Gemini AI engine synthesizes full functional requirements, tech stack choices, and delivery timelines in seconds.
            </p>
          </div>

          <button
            onClick={onOpenDriveWorkspace}
            className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <HardDrive className="w-4 h-4" />
            <span>Launch Drive PRD Hub</span>
          </button>
        </div>
      </section>

      {/* Downloadable Whitepapers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-mono uppercase tracking-widest text-purple-400">
            TECHNICAL BLUEPRINTS
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Free Architecture & Strategy Downloads
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {whitepapers.map((wp, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                  {wp.category}
                </span>
                <h4 className="text-base font-bold text-white">{wp.title}</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">{wp.desc}</p>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-neutral-500">{wp.format}</span>
                <button
                  onClick={onOpenProjectModal}
                  className="p-2 rounded-lg bg-neutral-800 hover:bg-purple-600 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Download Blueprint"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Insights / Blog Articles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="space-y-1">
          <div className="text-xs font-mono uppercase tracking-widest text-purple-400">
            ENGINEERING DISPATCHES
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Articles & Research Papers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-neutral-900/80 rounded-3xl border border-neutral-800 hover:border-purple-500/40 transition-all overflow-hidden flex flex-col group shadow-xl"
            >
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-purple-950/60 via-neutral-900 to-indigo-950/60 p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-800/50">
                    {post.category}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-[11px] font-mono text-neutral-400">
                  By {post.author}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800 flex items-center text-xs font-semibold text-purple-400 gap-1.5 group-hover:text-purple-300">
                  <span>Read Full Article</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="text-center space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-purple-400">
            FAQ
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-neutral-900/80 border border-neutral-800 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-bold text-white hover:text-purple-300 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-purple-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
