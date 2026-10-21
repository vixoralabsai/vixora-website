import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Layers,
  Calendar,
  Folder,
  Activity,
  LogOut,
  ChevronDown,
  Building2,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  HardDrive,
  Plus,
  Award
} from 'lucide-react';
import { ClientAuthGate } from '../components/dashboard/ClientAuthGate';
import { ProjectStatusOverview } from '../components/dashboard/ProjectStatusOverview';
import { DeadlinesScheduleView } from '../components/dashboard/DeadlinesScheduleView';
import { ProjectFilesRepository } from '../components/dashboard/ProjectFilesRepository';
import { ProjectActivityAndTickets } from '../components/dashboard/ProjectActivityAndTickets';
import { IssueCertificatePanel } from '../components/IssueCertificatePanel';
import {
  getClientAuthSession,
  setClientAuthSession,
  getSavedClientProjects,
  getActiveProjectId,
  setActiveProjectId,
  toggleMilestoneStatus,
  submitClientTicket,
  addFileToProject,
  ClientAuthSession
} from '../services/clientProjectService';
import { ClientProject, ProjectFile, ClientTicket } from '../types';
import { BRAND_CONFIG } from '../data/brandConfig';

interface ClientDashboardPageProps {
  onOpenProjectModal: () => void;
  onOpenDriveWorkspace: () => void;
  onNavigateHome: () => void;
  onNavigateToAdmin?: () => void;
}

export function ClientDashboardPage({
  onOpenProjectModal,
  onOpenDriveWorkspace,
  onNavigateHome,
  onNavigateToAdmin,
}: ClientDashboardPageProps) {
  const [session, setSession] = useState<ClientAuthSession | null>(null);
  const [allProjects, setAllProjects] = useState<ClientProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'deadlines' | 'files' | 'activity' | 'credentials'>('overview');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  // Initialize session and projects
  useEffect(() => {
    const savedSession = getClientAuthSession();
    const projects = getSavedClientProjects();
    setAllProjects(projects);

    if (savedSession) {
      setSession(savedSession);
      const activeId = getActiveProjectId();
      const exists = projects.some((p) => p.id === activeId);
      setCurrentProjectId(exists ? activeId : projects[0]?.id || '');
    }
  }, []);

  const currentProject = allProjects.find((p) => p.id === currentProjectId) || allProjects[0];

  const handleAuthenticated = (newSession: ClientAuthSession, matchedProjects: ClientProject[]) => {
    setSession(newSession);
    setClientAuthSession(newSession);
    const projects = getSavedClientProjects();
    setAllProjects(projects);
    const targetProject = matchedProjects[0] || projects[0];
    if (targetProject) {
      setCurrentProjectId(targetProject.id);
      setActiveProjectId(targetProject.id);
    }
  };

  const handleLogout = () => {
    setSession(null);
    setClientAuthSession(null);
  };

  const handleSelectProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    setActiveProjectId(projectId);
    setIsProjectDropdownOpen(false);
  };

  const handleToggleMilestone = (milestoneId: string) => {
    if (!currentProject) return;
    const updated = toggleMilestoneStatus(currentProject.id, milestoneId);
    if (updated) {
      setAllProjects(getSavedClientProjects());
    }
  };

  const handleAddFile = (file: Omit<ProjectFile, 'id' | 'uploadedAt'>) => {
    if (!currentProject) return;
    const updated = addFileToProject(currentProject.id, file);
    if (updated) {
      setAllProjects(getSavedClientProjects());
    }
  };

  const handleSubmitTicket = (ticket: Omit<ClientTicket, 'id' | 'createdAt' | 'status'>) => {
    if (!currentProject) return;
    const updated = submitClientTicket(currentProject.id, ticket);
    if (updated) {
      setAllProjects(getSavedClientProjects());
    }
  };

  // If not authenticated, render Auth Gate
  if (!session || !currentProject) {
    return (
      <div className="pt-28 pb-20 min-h-screen bg-[#070314] text-neutral-100 selection:bg-purple-600 selection:text-white">
        <ClientAuthGate
          onAuthenticated={handleAuthenticated}
          onOpenConsultationModal={onOpenProjectModal}
          onNavigateToAdmin={onNavigateToAdmin}
        />
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#070314] text-neutral-100 selection:bg-purple-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Portal Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#0D0621] border border-purple-900/40 shadow-xl">
          {/* Project Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center gap-3 p-2.5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-900 border border-purple-900/50 transition-all cursor-pointer text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold font-mono">
                {currentProject.accessCode.slice(-3)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {currentProject.accessCode}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">&bull; {currentProject.company}</span>
                </div>
                <div className="text-sm font-bold text-white max-w-[200px] sm:max-w-xs truncate">
                  {currentProject.projectName}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-400 ml-2" />
            </button>

            {/* Dropdown Options */}
            {isProjectDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-[#0C0620] border border-purple-800/60 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-2 text-[10px] font-mono text-purple-300 uppercase tracking-wider border-b border-purple-900/30">
                  Switch Active Project
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                  {allProjects.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => handleSelectProject(proj.id)}
                      className={`w-full p-2.5 rounded-xl text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        proj.id === currentProject.id
                          ? 'bg-purple-600/30 text-white font-bold border border-purple-500/40'
                          : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-mono text-[10px] text-amber-300">{proj.accessCode}</div>
                        <div className="truncate">{proj.projectName}</div>
                      </div>
                      <span className="text-[10px] font-mono text-purple-300 shrink-0">
                        {proj.progress}%
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-purple-900/30">
                  <button
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      onOpenProjectModal();
                    }}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-800/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Start Another Project Scope</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Client Identity & Action Buttons */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-white">{session.clientName}</span>
              <span className="text-[11px] font-mono text-neutral-400">{session.clientEmail}</span>
            </div>

            <a
              href={`https://wa.me/${currentProject.projectManager.phoneWhatsApp}?text=Hi%20${encodeURIComponent(
                currentProject.projectManager.name
              )}%2C%20following%20up%20from%20Vixora%20Client%20Portal%20[${encodeURIComponent(
                currentProject.accessCode
              )}]`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Chat with PM on WhatsApp"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">WhatsApp PM</span>
            </a>

            {onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="p-2.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 text-purple-300 border border-purple-600/40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Switch to Enterprise Admin Command Center"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">Admin Command</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 p-1.5 bg-[#0C061F] border border-purple-900/40 rounded-2xl max-w-2xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Overview & Milestones</span>
          </button>

          <button
            onClick={() => setActiveTab('deadlines')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'deadlines'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Deadlines & Schedule</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-950 text-purple-300 border border-purple-700/40 font-mono font-bold">
              {currentProject.upcomingDeadlines.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Files & Deliverables</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-950 text-purple-300 border border-purple-700/40 font-mono font-bold">
              {currentProject.files.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit & Tickets</span>
          </button>

          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'credentials'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Academy & Credentials</span>
          </button>
        </div>

        {/* Main Tab Views */}
        <div>
          {activeTab === 'overview' && (
            <ProjectStatusOverview
              project={currentProject}
              onToggleMilestone={handleToggleMilestone}
              onOpenDriveWorkspace={onOpenDriveWorkspace}
            />
          )}

          {activeTab === 'deadlines' && (
            <DeadlinesScheduleView
              project={currentProject}
              onOpenConsultationModal={onOpenProjectModal}
            />
          )}

          {activeTab === 'files' && (
            <ProjectFilesRepository
              project={currentProject}
              onAddFile={handleAddFile}
              onOpenDriveWorkspace={onOpenDriveWorkspace}
            />
          )}

          {activeTab === 'activity' && (
            <ProjectActivityAndTickets
              project={currentProject}
              onSubmitTicket={handleSubmitTicket}
            />
          )}

          {activeTab === 'credentials' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Vixora Academy Credential Directorate</h3>
                  <p className="text-xs text-purple-300 mt-0.5">
                    Issue verifiable completion certificates and dispatch automated email credentials to cohort graduates.
                  </p>
                </div>
                <a
                  href="/pages/student-portal"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors"
                >
                  Open Full Student Portal &rarr;
                </a>
              </div>
              <IssueCertificatePanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
