import { User } from 'firebase/auth';
import { HardDrive, Sparkles, LogOut, CheckCircle2, AlertCircle, FileText, Download } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  hasToken: boolean;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  hasPrd: boolean;
  onExportMarkdown: () => void;
  onExportJson: () => void;
}

export function Header({
  user,
  hasToken,
  onLogin,
  onLogout,
  isLoggingIn,
  hasPrd,
  onExportMarkdown,
  onExportJson,
}: HeaderProps) {
  return (
    <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm shadow-blue-500/10">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-neutral-100 tracking-tight">
                Vixora Requirements Analyzer
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Sparkles className="w-3 h-3" />
                Gemini 3.7
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">
              Google Drive integration for Vixora web development specifications
            </p>
          </div>
        </div>

        {/* Right Actions & Auth Status */}
        <div className="flex items-center gap-3">
          {hasPrd && (
            <div className="flex items-center gap-2">
              <button
                id="export-markdown-btn"
                onClick={onExportMarkdown}
                title="Download PRD as Markdown (.md)"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span> .MD
              </button>
              <button
                id="export-json-btn"
                onClick={onExportJson}
                title="Export structured JSON data"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                JSON
              </button>
            </div>
          )}

          {user && hasToken ? (
            <div className="flex items-center gap-2.5 bg-neutral-800/80 border border-neutral-700/80 rounded-xl px-3 py-1.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full border border-neutral-600 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 text-xs flex items-center justify-center font-medium">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-xs font-medium text-neutral-200 max-w-[130px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Drive Connected
                </span>
              </div>
              <button
                id="sign-out-btn"
                onClick={onLogout}
                title="Sign out from Google Drive"
                className="ml-1 p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/60 rounded-md transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="google-signin-btn"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white text-neutral-900 hover:bg-neutral-100 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
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
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
