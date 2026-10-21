import { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
  LogIn
} from 'lucide-react';
import { googleSignIn } from '../../services/firebase';
import { getSavedClientProjects, ClientAuthSession } from '../../services/clientProjectService';
import { ClientProject } from '../../types';

interface ClientAuthGateProps {
  onAuthenticated: (session: ClientAuthSession, matchedProjects: ClientProject[]) => void;
  onOpenConsultationModal: () => void;
  onNavigateToAdmin?: () => void;
}

export function ClientAuthGate({ onAuthenticated, onOpenConsultationModal, onNavigateToAdmin }: ClientAuthGateProps) {
  const [accessCode, setAccessCode] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [activeTab, setActiveTab] = useState<'code' | 'google' | 'demo'>('code');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sampleProjects = getSavedClientProjects();

  const handleAccessCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = accessCode.trim().toUpperCase();
    if (!code) {
      setError('Please enter your project access code (e.g. VX-84920).');
      return;
    }

    const projects = getSavedClientProjects();
    const matched = projects.filter(
      (p) => p.accessCode.toUpperCase() === code || p.id.toUpperCase() === code
    );

    if (matched.length === 0) {
      setError(`Access code "${code}" was not found. Please check your project onboarding email or contact your Vixora engagement lead.`);
      return;
    }

    const session: ClientAuthSession = {
      clientName: matched[0].clientName,
      clientEmail: matched[0].clientEmail,
      company: matched[0].company,
      accessCode: matched[0].accessCode,
      authenticatedVia: 'access_code',
      loginTime: new Date().toISOString()
    };

    onAuthenticated(session, matched);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const email = emailInput.trim().toLowerCase();
    if (!email) {
      setError('Please enter your client account email.');
      return;
    }

    const projects = getSavedClientProjects();
    const matched = projects.filter((p) => p.clientEmail.toLowerCase() === email);

    if (matched.length === 0) {
      setError(`No active projects found for "${email}". If you recently submitted a consultation, use your assigned VX access code.`);
      return;
    }

    const session: ClientAuthSession = {
      clientName: matched[0].clientName,
      clientEmail: matched[0].clientEmail,
      company: matched[0].company,
      accessCode: matched[0].accessCode,
      authenticatedVia: 'email',
      loginTime: new Date().toISOString()
    };

    onAuthenticated(session, matched);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result?.user) {
        const userEmail = result.user.email || 'client@company.com';
        const userName = result.user.displayName || 'Vixora Enterprise Client';

        const projects = getSavedClientProjects();
        let matched = projects.filter(
          (p) => p.clientEmail.toLowerCase() === userEmail.toLowerCase()
        );

        // If no direct email match, pair with first project or provide universal client access
        if (matched.length === 0) {
          matched = [projects[0]];
        }

        const session: ClientAuthSession = {
          clientName: userName,
          clientEmail: userEmail,
          company: matched[0]?.company || 'Enterprise Partner',
          accessCode: matched[0]?.accessCode,
          authenticatedVia: 'google',
          loginTime: new Date().toISOString()
        };

        onAuthenticated(session, matched);
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Failed to authenticate with Google. You can use your VX Access Code instead.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemoProject = (proj: ClientProject) => {
    const session: ClientAuthSession = {
      clientName: proj.clientName,
      clientEmail: proj.clientEmail,
      company: proj.company,
      accessCode: proj.accessCode,
      authenticatedVia: 'access_code',
      loginTime: new Date().toISOString()
    };
    onAuthenticated(session, [proj]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted Client Workspace & Delivery Portal</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Vixora Client Dashboard
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 max-w-xl mx-auto">
          Real-time visibility into your engineering sprints, upcoming milestone deadlines, staging builds, and project deliverables.
        </p>
      </div>

      <div className="bg-[#0C0620] border border-purple-900/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background inside card */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/10 blur-[80px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/10 blur-[80px] pointer-events-none -z-10" />

        {/* Tab Switcher */}
        <div className="flex items-center justify-center p-1 bg-neutral-950/80 rounded-2xl border border-purple-900/40 max-w-md mx-auto mb-8">
          <button
            onClick={() => {
              setActiveTab('code');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Access Code / Email
          </button>
          <button
            onClick={() => {
              setActiveTab('google');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'google'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Google Workspace Auth
          </button>
          <button
            onClick={() => {
              setActiveTab('demo');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'demo'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Live Demo Portals
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 max-w-lg mx-auto animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Access Code Login */}
        {activeTab === 'code' && (
          <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-200">
            <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-purple-300 uppercase tracking-wider mb-2">
                  Project Access Code (from onboarding email)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="e.g. VX-84920"
                    className="w-full px-4 py-3.5 rounded-xl bg-neutral-950/90 border border-purple-900/50 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 font-mono text-sm tracking-wider uppercase"
                  />
                  <KeyRound className="w-4 h-4 text-purple-400 absolute right-3.5 top-4" />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1.5">
                  Access codes are confidential and provided in your signed project statement of work.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <span>Access Project Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-purple-900/30 w-full" />
              <span className="bg-[#0C0620] px-3 text-[11px] font-mono text-neutral-500 uppercase">
                or sign in with client email
              </span>
              <div className="border-t border-purple-900/30 w-full" />
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950/90 border border-purple-900/50 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-purple-900/40 text-xs font-medium cursor-pointer transition-colors"
              >
                Lookup by Email
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Google Sign In */}
        {activeTab === 'google' && (
          <div className="max-w-md mx-auto space-y-6 text-center animate-in fade-in duration-200 py-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-purple-400" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Google Workspace SSO</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Sign in securely with your authorized Google or corporate Google Workspace account to access shared Drive requirements and milestones.
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 font-semibold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Authenticating...' : 'Sign in with Google Workspace'}</span>
            </button>
          </div>
        )}

        {/* Tab 3: Demo Client Portals */}
        {activeTab === 'demo' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <p className="text-xs text-neutral-400 text-center mb-4">
              Select one of our active enterprise sample client dashboards to explore real-time tracking, files, and milestones:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sampleProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl bg-neutral-950/70 border border-purple-900/40 hover:border-purple-500/60 transition-all flex flex-col justify-between space-y-4 group text-left"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-800/40">
                        {proj.accessCode}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {proj.progress}% Done
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {proj.projectName}
                    </h4>

                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{proj.company}</span>
                    </div>

                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {proj.tagline}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelectDemoProject(proj)}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Launch Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security & Verification Footer */}
        <div className="mt-8 pt-6 border-t border-purple-900/30 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>End-to-end encrypted client repository with 100% IP retention</span>
          </div>

          <div className="flex items-center gap-4">
            {onNavigateToAdmin && (
              <button
                type="button"
                onClick={onNavigateToAdmin}
                className="text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Login &rarr;</span>
              </button>
            )}
            <span>
              Don't have a project yet?{' '}
              <button
                onClick={onOpenConsultationModal}
                className="text-purple-300 font-semibold hover:text-white underline cursor-pointer"
              >
                Start a Project
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
