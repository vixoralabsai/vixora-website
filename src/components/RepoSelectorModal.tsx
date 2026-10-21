import React, { useState } from 'react';
import { X, Search, GitBranch, User, Clock, ArrowRight, ExternalLink, Loader2 } from 'lucide-react';
import { parseGitHubInput, getRecentRepos, fetchUserRepos } from '../services/githubApi';
import { GitHubRepo } from '../types/github';

interface RepoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRepo: (owner: string, repo: string) => void;
  currentRepo: string;
}

export const RepoSelectorModal: React.FC<RepoSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectRepo,
  currentRepo,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'user'>('url');
  const [repoInput, setRepoInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [userRepos, setUserRepos] = useState<GitHubRepo[]>([]);
  const [loadingUserRepos, setLoadingUserRepos] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const recent = getRecentRepos();

  const curatedPresets = [
    { name: 'facebook/react', desc: 'The library for web and native user interfaces' },
    { name: 'tailwindlabs/tailwindcss', desc: 'A utility-first CSS framework for rapid UI development' },
    { name: 'shadcn-ui/ui', desc: 'Beautifully designed components that you can copy and paste' },
    { name: 'vercel/next.js', desc: 'The React Framework for the Web' },
    { name: 'vitejs/vite', desc: 'Next Generation Frontend Tooling' },
  ];

  if (!isOpen) return null;

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    const parsed = parseGitHubInput(repoInput);
    if (!parsed) {
      setInputError('Please enter a valid GitHub URL or "owner/repository" format.');
      return;
    }
    onSelectRepo(parsed.owner, parsed.repo);
    onClose();
  };

  const handleFetchUserRepos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    setLoadingUserRepos(true);
    setUserError(null);
    setUserRepos([]);
    try {
      const repos = await fetchUserRepos(usernameInput.trim());
      setUserRepos(repos);
      if (repos.length === 0) {
        setUserError(`No public repositories found for user "${usernameInput}".`);
      }
    } catch (err: any) {
      setUserError(err.message || 'Failed to fetch user repositories');
    } finally {
      setLoadingUserRepos(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#111827] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white">Inspect GitHub Repository</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter any repository URL or lookup an account to inspect code, trees, and dependencies
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'url'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Repository URL / Path
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'user'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Lookup by GitHub Username
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'url' ? (
            <>
              <form onSubmit={handleUrlSubmit} className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Target GitHub Repository
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={repoInput}
                      onChange={(e) => {
                        setRepoInput(e.target.value);
                        setInputError(null);
                      }}
                      placeholder="e.g. facebook/react or https://github.com/owner/repo"
                      className="w-full bg-[#0B0F19] border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <span>Load</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {inputError && (
                  <p className="text-xs text-rose-400 mt-1">{inputError}</p>
                )}
              </form>

              {/* Recent Repositories */}
              {recent.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Recent Repositories</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((repo) => {
                      const isCurrent = repo.toLowerCase() === currentRepo.toLowerCase();
                      const parts = repo.split('/');
                      return (
                        <button
                          key={repo}
                          onClick={() => {
                            if (parts.length === 2) {
                              onSelectRepo(parts[0], parts[1]);
                              onClose();
                            }
                          }}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                            isCurrent
                              ? 'bg-blue-600/10 border-blue-500/40 text-blue-400 font-medium'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          <GitBranch className="w-3 h-3 text-slate-500" />
                          <span>{repo}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Curated Presets */}
              <div>
                <div className="text-xs font-medium text-slate-400 mb-2">
                  Sample Open Source Repositories
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {curatedPresets.map((preset) => {
                    const parts = preset.name.split('/');
                    return (
                      <button
                        key={preset.name}
                        onClick={() => {
                          onSelectRepo(parts[0], parts[1]);
                          onClose();
                        }}
                        className="text-left p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition-colors group"
                      >
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                          {preset.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {preset.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleFetchUserRepos} className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  GitHub Username or Organization
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="e.g. sarumibabatunde, octocat, or vercel"
                      className="w-full bg-[#0B0F19] border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingUserRepos || !usernameInput.trim()}
                    className="px-4 py-2.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {loadingUserRepos ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>Fetch</span>
                  </button>
                </div>
              </form>

              {userError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                  {userError}
                </div>
              )}

              {userRepos.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-400">
                    Found {userRepos.length} Repositories
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {userRepos.map((repo) => (
                      <div
                        key={repo.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="text-xs font-semibold text-white truncate">
                            {repo.name}
                          </div>
                          {repo.description && (
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {repo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                            {repo.language && <span>{repo.language}</span>}
                            <span>·</span>
                            <span>★ {repo.stargazers_count}</span>
                            <span>·</span>
                            <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            onSelectRepo(repo.owner.login, repo.name);
                            onClose();
                          }}
                          className="px-3 py-1.5 text-xs font-medium bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded transition-colors shrink-0"
                        >
                          Inspect
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#0B0F19] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Inspects public codebases in real time via GitHub REST v3</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-slate-300 transition-colors"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
