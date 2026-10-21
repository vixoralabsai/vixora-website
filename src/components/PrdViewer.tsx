import { useState } from 'react';
import { ProjectRequirementsDoc, FunctionalRequirement } from '../types';
import Markdown from 'react-markdown';
import {
  FileText,
  Layers,
  Cpu,
  Milestone,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  HelpCircle,
  Clock,
  Tag,
  ArrowRight,
  ListFilter
} from 'lucide-react';

interface PrdViewerProps {
  prd: ProjectRequirementsDoc;
  onAskQuestion: (q: string) => Promise<string>;
}

export function PrdViewer({ prd, onAskQuestion }: PrdViewerProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'functional' | 'tech' | 'milestones' | 'checklist' | 'markdown' | 'qna'
  >('overview');

  // Checklist state initialized from functional requirements
  const [checkedReqs, setCheckedReqs] = useState<Record<string, boolean>>({});
  const [moduleFilter, setModuleFilter] = useState<string>('All');
  const [copiedMd, setCopiedMd] = useState(false);

  // Q&A assistant state
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; time: string }>
  >([
    {
      role: 'assistant',
      text: `Hello! I've analyzed all the Vixora web development documents from your Google Drive. You can ask me anything about the architecture, tech stack, functional specifications, or sprint timeline.`,
      time: 'Just now',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const toggleCheck = (id: string) => {
    setCheckedReqs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalReqs = prd.functionalRequirements?.length || 0;
  const completedReqs = Object.values(checkedReqs).filter(Boolean).length;
  const progressPercent = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(prd.rawMarkdownReport || '');
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isAsking) return;

    const userQ = inputQuestion.trim();
    setInputQuestion('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: userQ, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);

    setIsAsking(true);
    try {
      const answer = await onAskQuestion(userQ);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: answer, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Sorry, I encountered an error: ${err.message}`, time: 'Error' },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  // Modules list for filtering
  const allModules = ['All', ...Array.from(new Set(prd.functionalRequirements?.map((r) => r.module) || []))];
  const filteredRequirements = (prd.functionalRequirements || []).filter((r) => {
    if (moduleFilter === 'All') return true;
    return r.module === moduleFilter;
  });

  const getPriorityBadge = (priority: FunctionalRequirement['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'High':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Medium':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg overflow-hidden space-y-0">
      {/* Dossier Header Banner */}
      <div className="p-6 border-b border-neutral-800 bg-neutral-950/70">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Compiled Project Requirements
              </span>
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Synthesized from {prd.sourceFilesCount || 1} Google Drive doc(s)
              </span>
            </div>
            <h2 className="text-xl font-bold text-neutral-100 tracking-tight">
              {prd.projectName || 'Vixora Web Development Requirements'}
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-3xl leading-relaxed">
              {prd.summary}
            </p>
          </div>

          {/* Progress Pill */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex items-center gap-4 shrink-0">
            <div>
              <div className="text-[11px] text-neutral-400">Implementation Readiness</div>
              <div className="text-base font-bold text-neutral-100 flex items-center gap-1.5">
                <span>{completedReqs}/{totalReqs}</span>
                <span className="text-xs font-medium text-emerald-400">({progressPercent}%)</span>
              </div>
            </div>
            <div className="w-16 bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 mt-6 overflow-x-auto pb-1 text-xs border-t border-neutral-800/80 pt-4">
          {[
            { id: 'overview', label: 'Overview & Objectives', icon: FileText },
            { id: 'functional', label: `Functional Specs (${totalReqs})`, icon: Layers },
            { id: 'tech', label: 'Tech Stack & Architecture', icon: Cpu },
            { id: 'milestones', label: 'Milestones & Roadmap', icon: Milestone },
            { id: 'checklist', label: `Dev Checklist (${progressPercent}%)`, icon: CheckCircle2 },
            { id: 'markdown', label: 'Markdown Report', icon: FileText },
            { id: 'qna', label: 'Ask AI Assistant', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview & Objectives */}
      {activeTab === 'overview' && (
        <div className="p-6 space-y-6 animate-in fade-in duration-150">
          {/* Primary Objective Banner */}
          <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1.5">
              Primary Objective & Vision
            </h3>
            <p className="text-sm text-neutral-200 leading-relaxed">
              {prd.primaryObjective}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Audience / Personas */}
            <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" /> Target User Personas
              </h3>
              <ul className="space-y-2">
                {prd.targetAudience?.map((audience, idx) => (
                  <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <span>{audience}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Core Feature Highlights */}
            <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Core Feature Highlights
              </h3>
              <ul className="space-y-2">
                {prd.keyFeatures?.map((feature, idx) => (
                  <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Security & Non-Functional Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Non-Functional & Security Criteria
              </h3>
              <ul className="space-y-2">
                {prd.securityAndNonFunctional?.map((item, idx) => (
                  <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400" /> Open Questions & Identified Risks
              </h3>
              <ul className="space-y-2">
                {prd.openQuestionsAndRisks?.map((risk, idx) => (
                  <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Source Documents Contribution */}
          {prd.sourceFilesSummary && prd.sourceFilesSummary.length > 0 && (
            <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                Contributing Drive Documents
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {prd.sourceFilesSummary.map((src, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs">
                    <div className="font-semibold text-neutral-200 truncate">{src.name}</div>
                    <div className="text-[11px] text-neutral-400 mt-1 leading-snug">{src.relevance}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Functional Requirements Matrix */}
      {activeTab === 'functional' && (
        <div className="p-6 space-y-5 animate-in fade-in duration-150">
          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2 text-xs">
              <ListFilter className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-400">Filter Module:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {allModules.map((mod) => (
                  <button
                    key={mod}
                    onClick={() => setModuleFilter(mod)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                      moduleFilter === mod
                        ? 'bg-blue-600 text-white font-medium'
                        : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                    }`}
                  >
                    {mod}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-xs text-neutral-500">
              Showing {filteredRequirements.length} specification{filteredRequirements.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {filteredRequirements.map((req) => (
              <div
                key={req.id}
                className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 space-y-3 hover:border-neutral-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-semibold">
                      {req.id}
                    </span>
                    <h3 className="text-sm font-semibold text-neutral-100">
                      {req.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-900 text-neutral-400 border border-neutral-800">
                      {req.module}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getPriorityBadge(
                        req.priority
                      )}`}
                    >
                      {req.priority}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  {req.description}
                </p>

                {req.acceptanceCriteria && req.acceptanceCriteria.length > 0 && (
                  <div className="pt-2 border-t border-neutral-900">
                    <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1.5">
                      Acceptance Criteria:
                    </span>
                    <ul className="space-y-1 pl-1">
                      {req.acceptanceCriteria.map((ac, idx) => (
                        <li key={idx} className="text-xs text-neutral-400 flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
                          <span>{ac}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Tech Stack & Architecture */}
      {activeTab === 'tech' && (
        <div className="p-6 space-y-6 animate-in fade-in duration-150">
          <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-blue-400" /> Architectural Stack & Dependency Mapping
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 font-semibold">
                    <th className="py-2.5 px-3">Layer / Category</th>
                    <th className="py-2.5 px-3">Technology & Libraries</th>
                    <th className="py-2.5 px-3">Version / Spec</th>
                    <th className="py-2.5 px-3">Architecture Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-300">
                  {prd.techStack?.map((tech, idx) => (
                    <tr key={idx} className="hover:bg-neutral-900/40">
                      <td className="py-3 px-3 font-semibold text-blue-400 whitespace-nowrap">
                        {tech.category}
                      </td>
                      <td className="py-3 px-3 font-medium text-neutral-100">
                        {tech.technology}
                      </td>
                      <td className="py-3 px-3 text-neutral-400 font-mono text-[11px]">
                        {tech.versionOrDetail || 'Latest stable'}
                      </td>
                      <td className="py-3 px-3 text-neutral-300 text-xs">
                        {tech.rationale || 'Selected for Vixora platform architecture.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Design & UX Guidelines */}
          <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-400" /> Design System & User Experience Guidelines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {prd.designAndUXGuidelines?.map((guideline, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-neutral-900/70 border border-neutral-800 text-xs text-neutral-300 flex items-start gap-2.5">
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                  <span>{guideline}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Milestones & Roadmap */}
      {activeTab === 'milestones' && (
        <div className="p-6 space-y-4 animate-in fade-in duration-150">
          <div className="space-y-4">
            {prd.milestones?.map((milestone, idx) => (
              <div
                key={idx}
                className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 space-y-3 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                      {milestone.phase}
                    </span>
                    <h3 className="text-sm font-semibold text-neutral-100">
                      {milestone.title}
                    </h3>
                  </div>

                  {milestone.targetTimeline && (
                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      {milestone.targetTimeline}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-neutral-900">
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-2">
                    Key Deliverables:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {milestone.keyDeliverables?.map((item, dIdx) => (
                      <div
                        key={dIdx}
                        className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800/60 text-xs text-neutral-300 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Interactive Dev Checklist */}
      {activeTab === 'checklist' && (
        <div className="p-6 space-y-5 animate-in fade-in duration-150">
          <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-semibold text-neutral-200">
                Interactive Engineering Implementation Checklist
              </h3>
              <p className="text-xs text-neutral-400">
                Check off requirements as your engineering team delivers features.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400">{progressPercent}% complete</span>
            </div>
          </div>

          <div className="space-y-2">
            {prd.functionalRequirements?.map((req) => {
              const isDone = !!checkedReqs[req.id];
              return (
                <div
                  key={req.id}
                  onClick={() => toggleCheck(req.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-neutral-400'
                      : 'bg-neutral-950 border-neutral-800/80 hover:border-neutral-700 text-neutral-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleCheck(req.id)}
                      className="mt-1 rounded border-neutral-700 text-blue-600 focus:ring-blue-500 bg-neutral-900 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-semibold text-neutral-400">
                          {req.id}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            isDone ? 'line-through text-neutral-500' : 'text-neutral-200'
                          }`}
                        >
                          {req.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                          {req.module}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1">{req.description}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${getPriorityBadge(
                      req.priority
                    )}`}
                  >
                    {req.priority}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 6: Full Raw Markdown Report */}
      {activeTab === 'markdown' && (
        <div className="p-6 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <span className="text-xs text-neutral-400">
              Complete Generated Project Requirements Document (Markdown)
            </span>
            <button
              id="copy-md-btn"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
            >
              {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedMd ? 'Copied to Clipboard!' : 'Copy Markdown'}
            </button>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 font-sans text-xs leading-relaxed text-neutral-300 max-h-[600px] overflow-y-auto">
            <div className="prose prose-invert prose-xs max-w-none prose-headings:text-neutral-100 prose-a:text-blue-400 prose-code:text-blue-300 prose-pre:bg-neutral-900">
              <Markdown>{prd.rawMarkdownReport || prd.summary}</Markdown>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Ask AI Assistant */}
      {activeTab === 'qna' && (
        <div className="p-6 space-y-4 animate-in fade-in duration-150 flex flex-col h-[520px]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/20">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl p-3.5 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-200'
                  }`}
                >
                  <div className="prose prose-invert prose-xs max-w-none">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                  <div
                    className={`text-[9px] mt-1.5 ${
                      msg.role === 'user' ? 'text-blue-200' : 'text-neutral-500'
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0 mt-0.5 border border-neutral-700">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {isAsking && (
              <div className="flex items-center gap-2 text-xs text-neutral-400 p-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span>Gemini is reviewing Vixora requirements...</span>
              </div>
            )}
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleSendQuestion} className="flex gap-2">
            <input
              id="prd-question-input"
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask a question (e.g., 'What are the authentication requirements?' or 'What is the Phase 1 milestone?')..."
              className="flex-1 px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
            />
            <button
              id="send-prd-question-btn"
              type="submit"
              disabled={isAsking || !inputQuestion.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
