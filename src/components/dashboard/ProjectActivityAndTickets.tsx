import { useState } from 'react';
import {
  Activity,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  GitCommit,
  Layers,
  FileText,
  LifeBuoy
} from 'lucide-react';
import { ClientProject, ClientTicket } from '../../types';

interface ProjectActivityAndTicketsProps {
  project: ClientProject;
  onSubmitTicket: (ticket: Omit<ClientTicket, 'id' | 'createdAt' | 'status'>) => void;
}

export function ProjectActivityAndTickets({
  project,
  onSubmitTicket,
}: ProjectActivityAndTicketsProps) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<ClientTicket['category']>('Feature Change');
  const [priority, setPriority] = useState<ClientTicket['priority']>('Medium');
  const [description, setDescription] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    onSubmitTicket({
      subject: subject.trim(),
      category,
      priority,
      description: description.trim()
    });

    setSubject('');
    setDescription('');
    setTicketSubmitted(true);
    setTimeout(() => setTicketSubmitted(false), 4000);
  };

  const getActivityIcon = (category: string) => {
    switch (category) {
      case 'deployment':
        return <GitCommit className="w-4 h-4 text-emerald-400" />;
      case 'milestone':
        return <Layers className="w-4 h-4 text-purple-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-amber-400" />;
    }
  };

  const getPriorityBadge = (priority: ClientTicket['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Medium':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live Activity Audit Stream */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span>Real-Time Engineering Audit Feed</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Sync</span>
            </span>
          </div>

          <div className="space-y-3">
            {project.activities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 rounded-2xl bg-[#0E0722] border border-purple-900/40 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-950/80 border border-purple-800/40">
                      {getActivityIcon(activity.category)}
                    </div>
                    <span className="text-xs font-bold text-white">{activity.author}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">{activity.timestamp}</span>
                </div>

                <div className="text-xs font-semibold text-purple-300 pl-7">{activity.action}</div>

                {activity.details && (
                  <p className="text-xs text-neutral-400 pl-7 leading-relaxed">{activity.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Submit Support / Change Request Ticket */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#0E0722] border border-purple-900/40 space-y-5 shadow-xl">
            <div className="border-b border-purple-900/30 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-purple-400" />
                <span>Submit Scope or Support Request</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Direct ticket to your assigned Lead Architect & Project Delivery Manager.
              </p>
            </div>

            {ticketSubmitted && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ticket submitted! Your PM has been notified in real time.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-purple-300 uppercase tracking-wider mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Update Stripe webhook signature verification"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-purple-900/50 text-white text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-purple-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-purple-900/50 text-white text-xs focus:outline-none"
                  >
                    <option value="Feature Change">Feature Change</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Scope Adjustment">Scope Adjustment</option>
                    <option value="Access & Infrastructure">Access & Infrastructure</option>
                    <option value="General Query">General Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-purple-300 uppercase tracking-wider mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-purple-900/50 text-white text-xs focus:outline-none"
                  >
                    <option value="Low">Low (Backlog)</option>
                    <option value="Medium">Medium (Next Sprint)</option>
                    <option value="High">High (Current Sprint)</option>
                    <option value="Critical">Critical (Immediate Block)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-purple-300 uppercase tracking-wider mb-1">
                  Description & Context
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any relevant URLs, reproduction steps, or desired behavior..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-purple-900/50 text-white text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Ticket</span>
              </button>
            </form>
          </div>

          {/* Active Client Tickets History */}
          {project.tickets && project.tickets.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                Logged Tickets ({project.tickets.length})
              </div>

              {project.tickets.map((tkt) => (
                <div
                  key={tkt.id}
                  className="p-4 rounded-2xl bg-[#0B061A] border border-purple-900/30 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-purple-400 font-bold">#{tkt.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${getPriorityBadge(tkt.priority)}`}>
                      {tkt.priority}
                    </span>
                  </div>

                  <h4 className="font-bold text-white">{tkt.subject}</h4>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">{tkt.description}</p>

                  {tkt.response && (
                    <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-200">
                      <strong className="text-purple-300">Pod Response:</strong> {tkt.response}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
