import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Github,
  Figma,
  HardDrive,
  Globe,
  MessageSquare,
  Mail,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';
import { ClientProject, ProjectMilestoneItem } from '../../types';
import { getWhatsAppUrl } from '../../data/brandConfig';

interface ProjectStatusOverviewProps {
  project: ClientProject;
  onToggleMilestone: (milestoneId: string) => void;
  onOpenDriveWorkspace: () => void;
}

export function ProjectStatusOverview({
  project,
  onToggleMilestone,
  onOpenDriveWorkspace,
}: ProjectStatusOverviewProps) {
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(
    project.milestones.find((m) => m.status === 'in_progress')?.id || project.milestones[0]?.id || null
  );

  const getHealthBadge = (health: ClientProject['health']) => {
    switch (health) {
      case 'Ahead of Schedule':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <TrendingUp className="w-3 h-3" />
            <span>Ahead of Schedule</span>
          </span>
        );
      case 'Attention Needed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3 h-3" />
            <span>Attention Needed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <CheckCircle2 className="w-3 h-3" />
            <span>On Track</span>
          </span>
        );
    }
  };

  const getStatusColor = (status: ClientProject['status']) => {
    switch (status) {
      case 'Live in Production':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      case 'In Review & QA':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/40';
      case 'In Development':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/40';
      default:
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
    }
  };

  const completedMilestones = project.milestones.filter((m) => m.status === 'completed').length;
  const totalMilestones = project.milestones.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner Stats Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#130A2B] via-[#0E0620] to-[#070314] border border-purple-800/40 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 blur-[90px] pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-500/30">
                {project.accessCode}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              {getHealthBadge(project.health)}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {project.projectName}
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              {project.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-neutral-400 font-mono">
              <div>
                <span className="text-neutral-500">Kickoff: </span>
                <span className="text-white font-semibold">{project.startDate}</span>
              </div>
              <div>
                <span className="text-neutral-500">Target Launch: </span>
                <span className="text-purple-300 font-semibold">{project.targetDeliveryDate}</span>
              </div>
              <div>
                <span className="text-neutral-500">Tier: </span>
                <span className="text-emerald-400 font-semibold">{project.budgetTier}</span>
              </div>
            </div>
          </div>

          {/* Progress Circular Widget */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-neutral-950/70 border border-purple-900/40 text-center">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-200 to-amber-300">
              {project.progress}%
            </div>
            <div className="text-xs font-mono text-neutral-400 mt-1">
              Overall Project Completion
            </div>

            <div className="w-full bg-neutral-900 rounded-full h-2 mt-3 overflow-hidden border border-neutral-800">
              <div
                className="bg-gradient-to-r from-purple-500 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>

            <div className="text-[11px] font-mono text-purple-300 mt-2">
              {completedMilestones} of {totalMilestones} Milestones Completed
            </div>
          </div>
        </div>
      </div>

      {/* Quick Environment & Asset Access Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {project.stagingUrl ? (
          <a
            href={project.stagingUrl}
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-2xl bg-[#0E0722] border border-purple-900/40 hover:border-purple-500/60 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-300 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Live Staging</div>
                <div className="text-xs font-bold text-white group-hover:text-purple-300 truncate max-w-[100px] sm:max-w-none">
                  Test Sandbox
                </div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-300 shrink-0" />
          </a>
        ) : (
          <div className="p-3.5 rounded-2xl bg-[#0E0722]/50 border border-neutral-800/60 flex items-center gap-2.5 opacity-60">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-neutral-500 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-neutral-500 uppercase">Live Staging</div>
              <div className="text-xs text-neutral-400">Scheduled Sprint 4</div>
            </div>
          </div>
        )}

        {project.figmaUrl ? (
          <a
            href={project.figmaUrl}
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-2xl bg-[#0E0722] border border-purple-900/40 hover:border-purple-500/60 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-300 flex items-center justify-center">
                <Figma className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-neutral-400 uppercase">UI/UX Design</div>
                <div className="text-xs font-bold text-white group-hover:text-pink-300 truncate max-w-[100px] sm:max-w-none">
                  Figma Boards
                </div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-pink-300 shrink-0" />
          </a>
        ) : null}

        {project.repoUrl ? (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-2xl bg-[#0E0722] border border-purple-900/40 hover:border-purple-500/60 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-neutral-800 text-white flex items-center justify-center">
                <Github className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Source Code</div>
                <div className="text-xs font-bold text-white group-hover:text-purple-300 truncate max-w-[100px] sm:max-w-none">
                  Git Repository
                </div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-300 shrink-0" />
          </a>
        ) : null}

        <button
          onClick={onOpenDriveWorkspace}
          className="p-3.5 rounded-2xl bg-[#0E0722] border border-purple-900/40 hover:border-emerald-500/60 transition-all flex items-center justify-between group cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-300 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-neutral-400 uppercase">PRD Workspace</div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 truncate max-w-[100px] sm:max-w-none">
                Drive Scanner
              </div>
            </div>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        </button>
      </div>

      {/* Main Grid: Milestones & Dedicated Engineering Team Pod */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Milestone Roadmap */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <span>Project Roadmap & Milestone Breakdown</span>
            </h3>
            <span className="text-xs font-mono text-neutral-400">
              Click milestone to view deliverables
            </span>
          </div>

          <div className="space-y-3">
            {project.milestones.map((milestone, idx) => {
              const isExpanded = expandedMilestoneId === milestone.id;
              const isCompleted = milestone.status === 'completed';
              const isInProgress = milestone.status === 'in_progress';

              return (
                <div
                  key={milestone.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isCompleted
                      ? 'bg-[#0B061A]/80 border-emerald-900/30'
                      : isInProgress
                      ? 'bg-[#12082C] border-purple-500/50 shadow-lg shadow-purple-950/50 ring-1 ring-purple-500/30'
                      : 'bg-[#080415]/60 border-neutral-800/70'
                  }`}
                >
                  <div
                    onClick={() => setExpandedMilestoneId(isExpanded ? null : milestone.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      {/* Interactive check button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleMilestone(milestone.id);
                        }}
                        title={isCompleted ? 'Mark as In Progress' : 'Mark as Completed'}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
                            : isInProgress
                            ? 'bg-purple-600/20 border border-purple-400 text-purple-300'
                            : 'bg-neutral-900 border border-neutral-700 text-neutral-500 hover:border-neutral-500'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                            {milestone.phase}
                          </span>
                          {isInProgress && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold animate-pulse">
                              Current Sprint
                            </span>
                          )}
                        </div>
                        <h4
                          className={`text-sm sm:text-base font-bold mt-0.5 ${
                            isCompleted ? 'text-neutral-300 line-through' : 'text-white'
                          }`}
                        >
                          {milestone.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 shrink-0">
                      <div className="hidden sm:block text-right">
                        <div>Due: {milestone.dueDate}</div>
                        {milestone.completedDate && (
                          <div className="text-[10px] text-emerald-400">Done on {milestone.completedDate}</div>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-neutral-400 transition-transform ${
                          isExpanded ? 'rotate-180 text-purple-300' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Deliverables List */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-purple-900/30 bg-neutral-950/40 space-y-3">
                      <div>
                        <div className="text-xs font-mono text-purple-300 uppercase tracking-wider mb-2">
                          Deliverables & Scope Checkpoints:
                        </div>
                        <ul className="space-y-1.5">
                          {milestone.deliverables.map((item, dIdx) => (
                            <li key={dIdx} className="text-xs text-neutral-300 flex items-start gap-2">
                              <span className="text-purple-400 font-bold mt-0.5">&bull;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {milestone.notes && (
                        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200">
                          <strong className="text-purple-300">Engineer Note:</strong> {milestone.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dedicated Engineering Team Pod */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-[#0F0724] border border-purple-900/40 space-y-5">
            <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Dedicated Technical Pod</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                Direct SLA Active
              </span>
            </div>

            {/* Lead Architect */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                Principal Systems Architect
              </div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-white">{project.leadEngineer.name}</div>
                  <div className="text-xs text-neutral-400">{project.leadEngineer.role}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`mailto:${project.leadEngineer.email}`}
                  className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-purple-900/40 text-xs flex items-center gap-1.5 transition-colors"
                  title="Send Email to Lead Engineer"
                >
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  <span>Email</span>
                </a>
                <a
                  href={`https://wa.me/${project.leadEngineer.phoneWhatsApp}?text=Hello%20${encodeURIComponent(
                    project.leadEngineer.name
                  )}%2C%20following%20up%20on%20${encodeURIComponent(project.projectName)}.`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp Lead</span>
                </a>
              </div>
            </div>

            <div className="border-t border-purple-900/20 pt-4 space-y-2">
              <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                Technical Delivery Manager
              </div>
              <div>
                <div className="text-sm font-bold text-white">{project.projectManager.name}</div>
                <div className="text-xs text-neutral-400">{project.projectManager.role}</div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`mailto:${project.projectManager.email}`}
                  className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-purple-900/40 text-xs flex items-center gap-1.5 transition-colors"
                  title="Send Email to PM"
                >
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  <span>Email</span>
                </a>
                <a
                  href={`https://wa.me/${project.projectManager.phoneWhatsApp}?text=Hello%20${encodeURIComponent(
                    project.projectManager.name
                  )}%2C%20following%20up%20on%20${encodeURIComponent(project.projectName)}.`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp PM</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Scope Breakdown Card */}
          <div className="p-5 rounded-3xl bg-[#0A041A] border border-purple-900/30 space-y-3">
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
              Enrolled Capabilities
            </div>
            <div className="flex flex-wrap gap-1.5">
              {project.services.map((svc, sIdx) => (
                <span
                  key={sIdx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-950/70 border border-purple-800/40 text-purple-300"
                >
                  {svc}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
