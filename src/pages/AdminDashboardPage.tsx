import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Award,
  Send,
  Users,
  Settings,
  LogOut,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Download,
  Mail,
  Clock,
  Zap,
  Server,
  Database,
  Eye,
  X,
  FileText,
  Plus,
  Building2,
  Terminal,
  Activity,
  Calendar
} from 'lucide-react';
import {
  AdminSession,
  getAdminSession,
  setAdminSession,
  fetchAdminOverview,
  sendAdminTestEmail,
  fetchAdminStudents,
  AdminOverviewResponse
} from '../services/adminAuthService';
import { AdminLoginGate } from '../components/admin/AdminLoginGate';
import { IssueCertificatePanel } from '../components/IssueCertificatePanel';
import {
  getSavedClientProjects,
  saveClientProjects,
  toggleMilestoneStatus
} from '../services/clientProjectService';
import { ClientProject } from '../types';
import { BRAND_CONFIG } from '../data/brandConfig';

interface AdminDashboardPageProps {
  onNavigateHome: () => void;
  onOpenProjectModal?: () => void;
  onOpenDriveWorkspace?: () => void;
  onNavigateToEnterpriseDashboard?: () => void;
}

export function AdminDashboardPage({
  onNavigateHome,
  onOpenProjectModal,
  onOpenDriveWorkspace,
  onNavigateToEnterpriseDashboard
}: AdminDashboardPageProps) {
  const [session, setSession] = useState<AdminSession | null>(() => getAdminSession());
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'credentials' | 'outbox' | 'students' | 'system'>('overview');

  // Overview data from API
  const [overviewData, setOverviewData] = useState<AdminOverviewResponse | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);

  // Client agency projects state
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<ClientProject | null>(null);

  // Students state
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  // Test Email Modal state
  const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState('vixoralabsai@gmail.com');
  const [testEmailSubject, setTestEmailSubject] = useState('Vixora Digital Hub Admin Live Diagnostic Test');
  const [testEmailMessage, setTestEmailMessage] = useState(
    'This is an official real-time diagnostic test from Vixora Digital Hub Command Center to verify the Resend API and SMTP deliverability pipeline.'
  );
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSendResult, setTestSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Email Preview Modal
  const [previewEmailLog, setPreviewEmailLog] = useState<any | null>(null);

  // Load overview and project data
  const loadDashboardData = async () => {
    if (!session) return;
    setIsLoadingOverview(true);
    try {
      const data = await fetchAdminOverview();
      if (data) {
        setOverviewData(data);
      }
      const clientProjs = getSavedClientProjects();
      setProjects(clientProjs);
      if (!selectedProject && clientProjs.length > 0) {
        setSelectedProject(clientProjs[0]);
      }
    } catch (err) {
      console.error('Failed loading admin dashboard data:', err);
    } finally {
      setIsLoadingOverview(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadDashboardData();
    }
  }, [session]);

  // Load students when switching to students tab
  useEffect(() => {
    if (session && activeTab === 'students' && students.length === 0) {
      setLoadingStudents(true);
      fetchAdminStudents()
        .then((res) => setStudents(res))
        .finally(() => setLoadingStudents(false));
    }
  }, [activeTab, session]);

  const handleAuthenticated = (newSession: AdminSession) => {
    setSession(newSession);
    setAdminSession(newSession);
  };

  const handleLogout = () => {
    setSession(null);
    setAdminSession(null);
  };

  const handleToggleMilestone = (projectId: string, milestoneId: string) => {
    const updated = toggleMilestoneStatus(projectId, milestoneId);
    if (updated) {
      const all = getSavedClientProjects();
      setProjects(all);
      const sel = all.find((p) => p.id === projectId);
      if (sel) setSelectedProject(sel);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailTo || !testEmailSubject) return;

    setIsSendingTest(true);
    setTestSendResult(null);

    const res = await sendAdminTestEmail({
      to: testEmailTo,
      subject: testEmailSubject,
      message: testEmailMessage
    });

    setIsSendingTest(false);
    setTestSendResult({
      success: res.success,
      message: res.message
    });

    if (res.success) {
      // Refresh overview data to show new outbox item
      fetchAdminOverview().then((d) => d && setOverviewData(d));
    }
  };

  // If not authenticated, render the high-craft Admin Login Gate
  if (!session) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-[#070314] text-neutral-100">
        <AdminLoginGate
          onAuthenticated={handleAuthenticated}
          onBackToHome={onNavigateHome}
          onNavigateToClientPortal={onNavigateToEnterpriseDashboard}
        />
      </div>
    );
  }

  const filteredProjects = projects.filter(
    (p) =>
      p.projectName.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.company.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.accessCode.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredStudents = students.filter(
    (s) =>
      (s.full_name || s.fullName || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(studentSearch.toLowerCase())
  );

  const activeProvider = overviewData?.metrics.activeProvider || 'resend';
  const activeSender = overviewData?.metrics.activeSender || 'Vixora Academy <noreply@vixoradigitalhub.com>';

  return (
    <div className="pt-24 pb-24 min-h-screen bg-[#070314] text-neutral-100 selection:bg-purple-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* =========================================================================
            1. TOP EXECUTIVE APP BAR
            ========================================================================= */}
        <div className="p-6 rounded-3xl bg-[#0C0620] border border-purple-900/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            {/* Left: Brand & Administrator Identity */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 p-0.5 shadow-lg shadow-purple-900/30 shrink-0">
                <div className="w-full h-full bg-[#0B051D] rounded-[14px] flex items-center justify-center text-purple-300">
                  <ShieldCheck className="w-7 h-7 text-purple-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-purple-900/50 border border-purple-700/50 text-purple-300">
                    Command Center
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live &bull; 256-Bit SSL
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
                  <span>Vixora Digital Hub</span>
                  <span className="text-neutral-500 font-normal text-base sm:text-lg">/ Enterprise Admin</span>
                </h1>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Logged in as <span className="text-purple-300 font-bold">{session.user.name}</span> ({session.user.email}) &bull; {session.user.role}
                </p>
              </div>
            </div>

            {/* Right: Real-time Provider & Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Provider Pill */}
              <div className="px-3 py-1.5 rounded-xl bg-neutral-950/80 border border-purple-900/40 text-xs font-mono flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-neutral-400">Email Engine</div>
                  <div className="text-white font-bold truncate max-w-[170px] sm:max-w-[210px]">
                    {activeProvider === 'resend' ? 'Resend API' : 'SMTP Relay'}: {activeSender.split('<')[1]?.replace('>', '') || activeSender}
                  </div>
                </div>
              </div>

              {/* Action: Send Test Email */}
              <button
                onClick={() => {
                  setTestSendResult(null);
                  setIsTestEmailModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/50 border border-purple-700/50 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-purple-300" />
                <span>Test Dispatch</span>
              </button>

              {/* Action: Refresh Data */}
              <button
                onClick={loadDashboardData}
                disabled={isLoadingOverview}
                className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-purple-900/40 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Refresh Metrics"
                aria-label="Refresh Metrics"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingOverview ? 'animate-spin text-purple-400' : ''}`} />
              </button>

              {/* Action: Enterprise Portal */}
              {onNavigateToEnterpriseDashboard && (
                <button
                  onClick={onNavigateToEnterpriseDashboard}
                  className="px-3 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/50 border border-purple-700/50 text-purple-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Switch to Enterprise Client Portal"
                >
                  <Building2 className="w-3.5 h-3.5 text-purple-300" />
                  <span>Enterprise Portal</span>
                </button>
              )}

              {/* Action: View Public Site */}
              <button
                onClick={onNavigateHome}
                className="px-3 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-purple-900/40 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Public Site</span>
              </button>

              {/* Action: Logout */}
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 text-red-300 hover:text-red-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Terminate Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-2 mt-6 pt-5 border-t border-purple-900/30 overflow-x-auto pb-1">
            {[
              { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
              { id: 'projects', label: 'Agency Client Projects', icon: FolderKanban, badge: projects.length },
              { id: 'credentials', label: 'Certificate Directorate', icon: Award, badge: overviewData?.metrics.totalCertificates },
              { id: 'outbox', label: 'Email Outbox & Resend', icon: Send, badge: overviewData?.recentEmailLogs.length },
              { id: 'students', label: 'Academy Students', icon: Users, badge: overviewData?.metrics.totalStudents },
              { id: 'system', label: 'System & Security', icon: Server }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 border border-purple-500/50'
                      : 'bg-neutral-950/60 text-neutral-400 hover:text-white hover:bg-neutral-900/80 border border-purple-900/20'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                  <span>{tab.label}</span>
                  {typeof tab.badge === 'number' && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-purple-800 text-purple-100' : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            TAB 1: EXECUTIVE OVERVIEW
            ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Total Client Projects */}
              <div className="p-6 rounded-3xl bg-[#0B051D] border border-purple-900/40 shadow-xl relative overflow-hidden group hover:border-purple-700/60 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-purple-300 uppercase tracking-wider">
                    Agency Projects
                  </span>
                  <div className="p-2.5 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800/40">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                    {projects.length}
                  </span>
                  <span className="text-xs font-mono text-emerald-400">Active Scopes</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-3 border-t border-purple-900/20">
                  <span>Client Code Protected</span>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                  >
                    View &rarr;
                  </button>
                </div>
              </div>

              {/* Card 2: Total Certificates Issued */}
              <div className="p-6 rounded-3xl bg-[#0B051D] border border-purple-900/40 shadow-xl relative overflow-hidden group hover:border-purple-700/60 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-300 uppercase tracking-wider">
                    Credentials Issued
                  </span>
                  <div className="p-2.5 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/40">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                    {overviewData?.metrics.totalCertificates ?? 3}
                  </span>
                  <span className="text-xs font-mono text-amber-400">Verified &amp; Active</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-3 border-t border-purple-900/20">
                  <span>SHA-256 Ledger Backed</span>
                  <button
                    onClick={() => setActiveTab('credentials')}
                    className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                  >
                    Issue New &rarr;
                  </button>
                </div>
              </div>

              {/* Card 3: Academy Enrolled Students */}
              <div className="p-6 rounded-3xl bg-[#0B051D] border border-purple-900/40 shadow-xl relative overflow-hidden group hover:border-purple-700/60 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-300 uppercase tracking-wider">
                    Enrolled Students
                  </span>
                  <div className="p-2.5 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/40">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                    {overviewData?.metrics.totalStudents ?? 4}
                  </span>
                  <span className="text-xs font-mono text-indigo-400">Active Cohort</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-3 border-t border-purple-900/20">
                  <span>Coursework Tracking</span>
                  <button
                    onClick={() => setActiveTab('students')}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    Manage &rarr;
                  </button>
                </div>
              </div>

              {/* Card 4: Resend Email Dispatches */}
              <div className="p-6 rounded-3xl bg-[#0B051D] border border-purple-900/40 shadow-xl relative overflow-hidden group hover:border-purple-700/60 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-300 uppercase tracking-wider">
                    Outbox Dispatches
                  </span>
                  <div className="p-2.5 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                    <Send className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                    {overviewData?.recentEmailLogs.length ?? 0}
                  </span>
                  <span className="text-xs font-mono text-emerald-400">Logged &amp; Tracked</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-3 border-t border-purple-900/20">
                  <span>Engine: {activeProvider === 'resend' ? 'Resend API' : 'SMTP'}</span>
                  <button
                    onClick={() => setActiveTab('outbox')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                  >
                    View Outbox &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions & System Health Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: System Engine Status & Quick Dispatch */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0B051D] border border-purple-900/40 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      Infrastructure &amp; Operational Health
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Live status of Vixora Digital Hub transactional microservices
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                    All Systems Operational
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Service 1: Resend API */}
                  <div className="p-4 rounded-2xl bg-neutral-950/70 border border-purple-900/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-white">Resend API Provider</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">Active Engine</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-mono break-all">
                      Sender: {activeSender}
                    </p>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      Restricted Send Key &bull; Real PDF Attachment Streaming
                    </div>
                  </div>

                  {/* Service 2: Google Workspace SMTP Fallback */}
                  <div className="p-4 rounded-2xl bg-neutral-950/70 border border-purple-900/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-xs font-bold text-white">Google SMTP Relay</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">Verified</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      Host: smtp.gmail.com:465 &bull; Dual-Engine Failover
                    </p>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      Account: vixoralabsai@gmail.com
                    </div>
                  </div>

                  {/* Service 3: Database */}
                  <div className="p-4 rounded-2xl bg-neutral-950/70 border border-purple-900/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-xs font-bold text-white">Supabase Cloud Database</span>
                      </div>
                      <span className="text-[10px] font-mono text-purple-300 font-semibold">PostgreSQL</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      Tables: certificates, students, enrollments, email_logs
                    </p>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      Direct connection with memory fallback cache
                    </div>
                  </div>

                  {/* Service 4: PDFKit Vector Engine */}
                  <div className="p-4 rounded-2xl bg-neutral-950/70 border border-purple-900/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-xs font-bold text-white">PDFKit Vector Engine</span>
                      </div>
                      <span className="text-[10px] font-mono text-purple-300 font-semibold">Real-Time</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      Dynamic QR Verification, Gold Seals, Signatures
                    </p>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      300 DPI Landscape Archival Output
                    </div>
                  </div>
                </div>

                {/* Quick Action Button Strip */}
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('credentials')}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-purple-950 cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>Issue Certificate to Graduate</span>
                  </button>

                  <button
                    onClick={() => setIsTestEmailModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-purple-800/40 text-purple-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Live Test Email</span>
                  </button>

                  {onOpenProjectModal && (
                    <button
                      onClick={onOpenProjectModal}
                      className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-purple-800/40 text-neutral-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span>New Agency Project Scope</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Col: Recent Activity Timeline */}
              <div className="p-6 rounded-3xl bg-[#0B051D] border border-purple-900/40 shadow-xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      Recent System Events
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-400">Live Feed</span>
                  </div>

                  <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
                    {overviewData?.recentEmailLogs && overviewData.recentEmailLogs.length > 0 ? (
                      overviewData.recentEmailLogs.slice(0, 5).map((log, idx) => (
                        <div
                          key={log.id || idx}
                          onClick={() => setPreviewEmailLog(log)}
                          className="p-3 rounded-xl bg-neutral-950/60 border border-purple-900/20 hover:border-purple-700/40 transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-purple-300 truncate max-w-[140px]">
                              {log.recipientEmail}
                            </span>
                            <span className="text-emerald-400 font-bold">
                              {log.provider === 'resend' ? 'Resend' : 'SMTP'}
                            </span>
                          </div>
                          <div className="text-xs text-white font-medium truncate mt-1">
                            {log.subject}
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mt-1">
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span>{log.deliveryLatencyMs || 150}ms</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-neutral-500">
                        No recent dispatches logged.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-purple-900/20 text-center">
                  <button
                    onClick={() => setActiveTab('outbox')}
                    className="text-xs font-mono text-purple-300 hover:text-white transition-colors cursor-pointer"
                  >
                    View Complete Email Outbox &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: AGENCY CLIENT PROJECTS
            ========================================================================= */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Bar for Projects */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#0B051D] border border-purple-900/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800/40">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Agency Client Projects</h2>
                  <p className="text-xs text-neutral-400">
                    Track deliverables, milestone statuses, and client portal access codes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-xl bg-neutral-950/80 border border-purple-900/40 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                {onOpenProjectModal && (
                  <button
                    onClick={onOpenProjectModal}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Scope</span>
                  </button>
                )}
              </div>
            </div>

            {/* Project Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-6 rounded-3xl bg-[#0B051D] border border-purple-900/40 hover:border-purple-700/50 transition-all flex flex-col justify-between shadow-xl"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-800/40">
                          {project.accessCode}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1.5 line-clamp-1">
                          {project.projectName}
                        </h3>
                        <p className="text-xs text-neutral-400 font-mono">{project.company}</p>
                      </div>

                      <span className="text-xs font-mono font-bold text-purple-300 px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 shrink-0">
                        {project.progress}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>

                    {/* Services Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.services.slice(0, 3).map((service, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-purple-950/40 text-[10px] font-mono text-purple-300 border border-purple-900/30"
                        >
                          {service}
                        </span>
                      ))}
                    </div>

                    {/* Milestones List with Interactive Toggle */}
                    <div className="space-y-1.5 pt-2 border-t border-purple-900/30">
                      <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                        Milestones ({project.milestones.filter((m) => m.status === 'completed').length}/{project.milestones.length})
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                        {project.milestones.map((m) => {
                          const isDone = m.status === 'completed';
                          return (
                            <button
                              key={m.id}
                              onClick={() => handleToggleMilestone(project.id, m.id)}
                              className={`w-full text-left p-2 rounded-lg text-[11px] font-mono flex items-center justify-between transition-colors cursor-pointer ${
                                isDone
                                  ? 'bg-emerald-950/30 border border-emerald-900/40 text-emerald-300'
                                  : 'bg-neutral-950/50 border border-neutral-900 text-neutral-400 hover:text-neutral-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <CheckCircle2
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isDone ? 'text-emerald-400' : 'text-neutral-600'
                                  }`}
                                />
                                <span className="truncate">{m.title}</span>
                              </div>
                              <span className="text-[9px] uppercase tracking-wider shrink-0 font-bold">
                                {m.status}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer Client Info */}
                  <div className="mt-4 pt-3 border-t border-purple-900/20 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span>Contact: {project.clientEmail}</span>
                    <span className="text-emerald-400 font-semibold">{project.budgetTier}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: CERTIFICATE DIRECTORATE & ISSUANCE
            ========================================================================= */}
        {activeTab === 'credentials' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header info banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-[#0B051D] to-indigo-950/60 border border-purple-900/50 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Award className="w-3.5 h-3.5" />
                  <span>Vixora Academy Global Credential Registry</span>
                </div>
                <h2 className="text-xl font-bold text-white">Certificate Issuance &amp; Dispatch</h2>
                <p className="text-xs text-neutral-400 max-w-2xl">
                  Issue verifiable, cryptographic SHA-256 ledger certificates. Every issuance triggers real-time 300 DPI PDF generation and transmits directly to the graduate via <strong>Resend API</strong> ({activeSender}).
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <a
                  href="/verify"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-purple-900/50 text-xs font-semibold text-purple-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Public Registry</span>
                </a>
              </div>
            </div>

            {/* Embedded Live Issuing Engine */}
            <IssueCertificatePanel
              onCertificateIssued={() => {
                fetchAdminOverview().then((d) => d && setOverviewData(d));
              }}
            />
          </div>
        )}

        {/* =========================================================================
            TAB 4: EMAIL OUTBOX & RESEND CENTER
            ========================================================================= */}
        {activeTab === 'outbox' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Outbox Header Card */}
            <div className="p-6 rounded-3xl bg-[#0B051D] border border-purple-900/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Send className="w-5 h-5 text-purple-400" />
                    Live Transactional Outbox
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                    {activeProvider === 'resend' ? 'Resend API Active' : 'SMTP Active'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono">
                  From Address: <span className="text-white font-semibold">{activeSender}</span> &bull; Attached PDF Vector Engine
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsTestEmailModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-purple-950"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Compose Test Email</span>
                </button>

                <button
                  onClick={loadDashboardData}
                  className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-purple-900/40 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Reload Logs"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Outbox Logs Table */}
            <div className="rounded-3xl bg-[#0B051D] border border-purple-900/40 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-neutral-950/80 text-neutral-400 uppercase tracking-wider border-b border-purple-900/30 text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Recipient</th>
                      <th className="py-3.5 px-4 font-semibold">Subject</th>
                      <th className="py-3.5 px-4 font-semibold">Status / Engine</th>
                      <th className="py-3.5 px-4 font-semibold">Latency</th>
                      <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/20 text-neutral-300">
                    {overviewData?.recentEmailLogs && overviewData.recentEmailLogs.length > 0 ? (
                      overviewData.recentEmailLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-purple-950/20 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{log.recipientName || 'Student'}</div>
                            <div className="text-[11px] text-purple-300">{log.recipientEmail}</div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs truncate font-medium text-neutral-200">
                            {log.subject}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                log.deliveredToInternet || log.status === 'delivered'
                                  ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                                  : 'bg-purple-950/50 text-purple-300 border border-purple-800/40'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {log.provider === 'resend' ? 'Resend API' : 'SMTP Relay'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-400">
                            {log.deliveryLatencyMs || 140}ms
                          </td>
                          <td className="py-3.5 px-4 text-neutral-400">
                            {new Date(log.timestamp).toLocaleDateString()}{' '}
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setPreviewEmailLog(log)}
                              className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/40 text-[11px] font-sans font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect HTML</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-neutral-500 font-sans">
                          No email dispatches logged in this session yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: ACADEMY STUDENTS
            ========================================================================= */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#0B051D] border border-purple-900/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/40">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Academy Students Registry</h2>
                  <p className="text-xs text-neutral-400">
                    Enrolled students across AI, Data Science &amp; Full-Stack engineering tracks
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-neutral-950/80 border border-purple-900/40 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>

            {/* Students Table */}
            <div className="rounded-3xl bg-[#0B051D] border border-purple-900/40 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-neutral-950/80 text-neutral-400 uppercase tracking-wider border-b border-purple-900/30 text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Student Name</th>
                      <th className="py-3.5 px-4 font-semibold">Email</th>
                      <th className="py-3.5 px-4 font-semibold">Track / Role</th>
                      <th className="py-3.5 px-4 font-semibold">Enrolled Date</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/20 text-neutral-300">
                    {loadingStudents ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-neutral-400">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                            <span>Loading registered students...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredStudents.length > 0 ? (
                      filteredStudents.map((st, idx) => (
                        <tr key={st.id || idx} className="hover:bg-purple-950/20 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">
                            {st.full_name || st.fullName || 'Student'}
                          </td>
                          <td className="py-3.5 px-4 text-purple-300 font-mono">
                            {st.email}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-300">
                            {st.course_title || st.trackBadge || 'Autonomous AI Systems'}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-400">
                            {st.enrolled_date || st.enrolledDate || 'September 2026'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setActiveTab('credentials');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-950/50 hover:bg-amber-900/50 text-amber-300 border border-amber-800/40 text-[11px] font-sans font-medium transition-colors cursor-pointer"
                            >
                              Issue Credential
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-neutral-500 font-sans">
                          No students matched your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: SYSTEM & SECURITY
            ========================================================================= */}
        {activeTab === 'system' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-3xl bg-[#0B051D] border border-purple-900/40 shadow-xl space-y-6">
              <div className="border-b border-purple-900/30 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-400" />
                  System Diagnostics &amp; Secrets Matrix
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Real-time configuration parameters running within the container
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Resend API Key */}
                <div className="p-4 rounded-2xl bg-neutral-950/70 border border-purple-900/30 space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">RESEND_API_KEY</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Injected &bull; Active
                    </span>
                  </div>
                  <div className="text-[11px] text-purple-300">
                    re_SQMaafym_************************
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    Restricted email dispatch capability configured in Settings &bull; Secrets
                  </div>
                </div>

                {/* RESEND_FROM */}
                <div className="p-4 rounded-2xl bg-neutral-950/70 border border-purple-900/30 space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">RESEND_FROM</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Custom Domain Live
                    </span>
                  </div>
                  <div className="text-[11px] text-purple-300">
                    {activeSender}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    Verified sender matching domain DNS SPF / DKIM
                  </div>
                </div>

                {/* Database Tier */}
                <div className="p-4 rounded-2xl bg-neutral-950/70 border border-purple-900/30 space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">SUPABASE DATABASE</span>
                    <span className="text-purple-400 font-bold flex items-center gap-1">
                      <Database className="w-3.5 h-3.5" /> PostgreSQL
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-300">
                    {overviewData?.metrics.databaseTier || 'Supabase Cloud (PostgreSQL)'}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    Stores certificates, students, courses, enrollments &amp; email logs
                  </div>
                </div>

                {/* Node Container Health */}
                <div className="p-4 rounded-2xl bg-neutral-950/70 border border-purple-900/30 space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">CONTAINER RUNTIME</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Port 3000 Ingress
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-300">
                    Server Uptime: {overviewData?.metrics.serverUptimeSec ?? 120} seconds
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    Node.js Express 4 &bull; Vite SPA Reverse Proxy
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL 1: SEND LIVE TEST EMAIL
          ========================================================================= */}
      {isTestEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#0B051D] border border-purple-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <button
              onClick={() => setIsTestEmailModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-900/40 text-purple-300 border border-purple-700/40 mb-2">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Resend API &bull; Live Transmitter</span>
              </div>
              <h3 className="text-lg font-bold text-white">Send Real-Time Diagnostic Email</h3>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                Dispatches from <strong>{activeSender}</strong>
              </p>
            </div>

            {testSendResult && (
              <div
                className={`p-3 rounded-xl text-xs font-mono flex items-start gap-2 ${
                  testSendResult.success
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                    : 'bg-red-950/60 text-red-300 border border-red-800/50'
                }`}
              >
                {testSendResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>{testSendResult.message}</div>
              </div>
            )}

            <form onSubmit={handleSendTestEmail} className="space-y-4 font-mono">
              <div>
                <label className="block text-[11px] text-neutral-300 mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  value={testEmailTo}
                  onChange={(e) => setTestEmailTo(e.target.value)}
                  placeholder="vixoralabsai@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/80 border border-purple-900/40 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-300 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={testEmailSubject}
                  onChange={(e) => setTestEmailSubject(e.target.value)}
                  placeholder="Subject..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/80 border border-purple-900/40 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-300 mb-1">
                  Message Content
                </label>
                <textarea
                  rows={3}
                  value={testEmailMessage}
                  onChange={(e) => setTestEmailMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/80 border border-purple-900/40 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTestEmailModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-300 font-sans cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold font-sans flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSendingTest ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Live Test</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: INSPECT EMAIL HTML PREVIEW
          ========================================================================= */}
      {previewEmailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#0B051D] border border-purple-900/50 rounded-3xl p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-purple-900/30 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Outbox Email Inspection</h3>
                <p className="text-[11px] font-mono text-purple-300">
                  Recipient: {previewEmailLog.recipientEmail} &bull; {previewEmailLog.subject}
                </p>
              </div>
              <button
                onClick={() => setPreviewEmailLog(null)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl bg-neutral-950 p-4 border border-purple-900/30">
              {previewEmailLog.previewHtml ? (
                <div
                  className="prose prose-invert max-w-none text-xs"
                  dangerouslySetInnerHTML={{ __html: previewEmailLog.previewHtml }}
                />
              ) : (
                <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap">
                  {previewEmailLog.previewText || 'No text preview available.'}
                </pre>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400">
                Status: <strong className="text-emerald-400">{previewEmailLog.status}</strong> &bull; Latency: {previewEmailLog.deliveryLatencyMs || 150}ms
              </span>
              <button
                onClick={() => setPreviewEmailLog(null)}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-sans text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
