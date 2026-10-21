import { useState } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Download,
  CalendarDays,
  ExternalLink,
  Plus,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { ClientProject, ProjectDeadline } from '../../types';

interface DeadlinesScheduleViewProps {
  project: ClientProject;
  onOpenConsultationModal: () => void;
}

export function DeadlinesScheduleView({ project, onOpenConsultationModal }: DeadlinesScheduleViewProps) {
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'high' | 'normal' | 'low'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredDeadlines = project.upcomingDeadlines.filter((dl) => {
    if (filterUrgency === 'all') return true;
    return dl.urgency === filterUrgency;
  });

  const generateIcsCalendar = (dl: ProjectDeadline) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Vixora Digital Hub//Client Portal Deadlines//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:Vixora [${project.accessCode}] - ${dl.title}
DESCRIPTION:${dl.description || 'Deliverable milestone review'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${dl.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getUrgencyBadge = (urgency: ProjectDeadline['urgency']) => {
    switch (urgency) {
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40">
            Critical Review
          </span>
        );
      case 'normal':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            Standard Delivery
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Planned Future
          </span>
        );
    }
  };

  const getTypeIcon = (type: ProjectDeadline['type']) => {
    switch (type) {
      case 'Sprint Review':
        return <CalendarDays className="w-4 h-4 text-purple-400" />;
      case 'Deliverable Signoff':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'Security Audit':
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
      case 'Live Launch':
        return <Bell className="w-4 h-4 text-amber-400" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-900/30 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-purple-400" />
            <span>Upcoming Deadlines & Delivery Schedule</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Track deliverable checkpoints, sprint demonstrations, and executive sign-off meetings.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 p-1 bg-neutral-950/80 rounded-xl border border-purple-900/40">
          {(['all', 'high', 'normal'] as const).map((urgency) => (
            <button
              key={urgency}
              onClick={() => setFilterUrgency(urgency)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                filterUrgency === urgency
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {urgency === 'all' ? 'All Deadlines' : `${urgency} Priority`}
            </button>
          ))}
        </div>
      </div>

      {/* Deadlines List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDeadlines.map((deadline) => {
          return (
            <div
              key={deadline.id}
              className="p-6 rounded-3xl bg-[#0E0722] border border-purple-900/40 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-950/70 border border-purple-800/40">
                      {getTypeIcon(deadline.type)}
                    </div>
                    <span className="text-xs font-mono text-purple-300 font-bold uppercase">
                      {deadline.type}
                    </span>
                  </div>
                  {getUrgencyBadge(deadline.urgency)}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  {deadline.title}
                </h3>

                {deadline.description && (
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {deadline.description}
                  </p>
                )}

                <div className="p-3 rounded-2xl bg-neutral-950/60 border border-purple-950 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="text-neutral-500 font-mono">Target Date:</span>
                    <span className="font-bold text-white">{deadline.date}</span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="text-neutral-500 font-mono">Countdown:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {deadline.daysRemaining > 0
                        ? `${deadline.daysRemaining} days remaining`
                        : 'Scheduled Today'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="text-neutral-500 font-mono">Facilitator:</span>
                    <span className="text-purple-300 font-medium">{deadline.assignedTo}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-purple-900/20">
                <button
                  onClick={() => generateIcsCalendar(deadline)}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-800/40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download .ics Calendar Event"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>Sync to Calendar (.ics)</span>
                </button>

                <a
                  href={`https://wa.me/${project.projectManager.phoneWhatsApp}?text=Hi%20${encodeURIComponent(
                    project.projectManager.name
                  )}%2C%20regarding%20deadline%20"${encodeURIComponent(deadline.title)}"`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-emerald-400 hover:text-emerald-300 hover:underline"
                >
                  Message PM &rarr;
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Strategy Note */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#140A2D] to-indigo-950/40 border border-purple-800/40 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Need to adjust sprint schedule or add a new deliverable?</h4>
          <p className="text-xs text-neutral-400">
            Submit a change request ticket or discuss directly with your Senior Delivery Manager.
          </p>
        </div>

        <button
          onClick={onOpenConsultationModal}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all cursor-pointer"
        >
          Request Scope / Schedule Adjustment
        </button>
      </div>
    </div>
  );
}
