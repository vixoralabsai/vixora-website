import React, { useState } from 'react';
import { 
  GitFork, 
  Star, 
  Eye, 
  AlertCircle, 
  Scale, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  ChevronDown,
  GitBranch,
  Calendar,
  Lock,
  Globe
} from 'lucide-react';
import { GitHubRepo, GitHubBranch } from '../types/github';

interface RepoOverviewProps {
  repo: GitHubRepo;
  languages: Record<string, number>;
  branches: GitHubBranch[];
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
  onOpenRepoSelector: () => void;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3572A5',
  HTML: '#E34F26',
  CSS: '#1572B6',
  Rust: '#DEA584',
  Go: '#00ADD8',
  Java: '#B07219',
  'C++': '#F34B7D',
  C: '#555555',
  Ruby: '#701516',
  Shell: '#89E051',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
};

export const RepoOverview: React.FC<RepoOverviewProps> = ({
  repo,
  languages,
  branches,
  selectedBranch,
  onSelectBranch,
  onOpenRepoSelector,
}) => {
  const [cloneMenuOpen, setCloneMenuOpen] = useState(false);
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [cloneType, setCloneType] = useState<'https' | 'ssh' | 'cli'>('https');
  const [copied, setCopied] = useState(false);

  const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
  const langEntries = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percent: totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(1) : '0',
      color: LANGUAGE_COLORS[name] || '#6B7280',
    }));

  const httpsUrl = `https://github.com/${repo.full_name}.git`;
  const sshUrl = `git@github.com:${repo.full_name}.git`;
  const cliCmd = `gh repo clone ${repo.full_name}`;
  const zipUrl = `https://github.com/${repo.full_name}/archive/refs/heads/${encodeURIComponent(selectedBranch || repo.default_branch)}.zip`;

  const getCloneString = () => {
    if (cloneType === 'https') return `git clone ${httpsUrl}`;
    if (cloneType === 'ssh') return `git clone ${sshUrl}`;
    return cliCmd;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCloneString());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const formattedDate = new Date(repo.pushed_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-[#111827] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Main Info */}
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <img
                src={repo.owner.avatar_url}
                alt={repo.owner.login}
                className="w-7 h-7 rounded-md border border-slate-700 bg-slate-800"
                referrerPolicy="no-referrer"
              />
              <div className="flex items-center gap-1.5 text-base sm:text-lg font-bold text-white tracking-tight">
                <span className="text-slate-400 font-normal hover:text-slate-200 transition">
                  {repo.owner.login}
                </span>
                <span className="text-slate-600">/</span>
                <span className="text-white hover:text-blue-400 transition cursor-pointer" onClick={onOpenRepoSelector}>
                  {repo.name}
                </span>
              </div>

              {repo.private ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded">
                  <Lock className="w-3 h-3" />
                  <span>Private</span>
                </span>
              ) : (
                <span className="inline-flex items-center text-[11px] text-slate-400 border border-slate-700 bg-slate-800/60 px-2 py-0.5 rounded">
                  Public
                </span>
              )}
            </div>

            {repo.description && (
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                {repo.description}
              </p>
            )}

            {/* Unboxed Metadata row adhering to Zero-Pill Discipline */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono tabular-nums text-slate-200">
                  {repo.stargazers_count.toLocaleString()}
                </span>
                <span className="text-slate-400">stars</span>
              </span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <GitFork className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono tabular-nums text-slate-200">
                  {repo.forks_count.toLocaleString()}
                </span>
                <span className="text-slate-400">forks</span>
              </span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono tabular-nums text-slate-200">
                  {repo.open_issues_count.toLocaleString()}
                </span>
                <span className="text-slate-400">issues</span>
              </span>
              {repo.license && (
                <>
                  <span className="text-slate-600" aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-slate-400" />
                    <span>{repo.license.spdx_id || repo.license.name}</span>
                  </span>
                </>
              )}
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Pushed {formattedDate}</span>
              </span>
              {repo.homepage && (
                <>
                  <span className="text-slate-600" aria-hidden="true">·</span>
                  <a
                    href={repo.homepage.startsWith('http') ? repo.homepage : `https://${repo.homepage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[180px]">{repo.homepage.replace(/^https?:\/\//, '')}</span>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Action Controls & Clone Box */}
          <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2">
              {/* Branch Selector */}
              <div className="relative">
                <button
                  onClick={() => setBranchMenuOpen(!branchMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition"
                >
                  <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-mono font-medium max-w-[110px] truncate">
                    {selectedBranch || repo.default_branch}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {branchMenuOpen && (
                  <div className="absolute left-0 lg:left-auto lg:right-0 mt-1.5 w-52 bg-[#0B0F19] border border-slate-700 rounded-lg shadow-xl z-30 py-1 max-h-60 overflow-y-auto">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                      Switch Branch ({branches.length > 0 ? branches.length : 1})
                    </div>
                    {branches.length > 0 ? (
                      branches.map((b) => (
                        <button
                          key={b.name}
                          onClick={() => {
                            onSelectBranch(b.name);
                            setBranchMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-slate-800 transition ${
                            b.name === selectedBranch ? 'text-blue-400 font-semibold bg-blue-950/30' : 'text-slate-300'
                          }`}
                        >
                          <span className="truncate">{b.name}</span>
                          {b.name === repo.default_branch && (
                            <span className="text-[10px] text-slate-500 font-sans">default</span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-1.5 text-xs text-slate-500 font-mono">
                        {repo.default_branch}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Clone Menu Trigger */}
              <div className="relative">
                <button
                  onClick={() => setCloneMenuOpen(!cloneMenuOpen)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition shadow-sm"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Code / Clone</span>
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                </button>

                {cloneMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-80 bg-[#0B0F19] border border-slate-700 rounded-xl shadow-2xl z-30 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                      <span>Clone Repository</span>
                      <a
                        href={zipUrl}
                        download
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-normal"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download ZIP</span>
                      </a>
                    </div>

                    {/* Protocol tabs */}
                    <div className="flex border-b border-slate-800 text-[11px] font-medium text-slate-400 gap-4">
                      <button
                        onClick={() => setCloneType('https')}
                        className={`pb-1.5 transition ${cloneType === 'https' ? 'border-b-2 border-emerald-400 text-white' : 'hover:text-slate-200'}`}
                      >
                        HTTPS
                      </button>
                      <button
                        onClick={() => setCloneType('ssh')}
                        className={`pb-1.5 transition ${cloneType === 'ssh' ? 'border-b-2 border-emerald-400 text-white' : 'hover:text-slate-200'}`}
                      >
                        SSH
                      </button>
                      <button
                        onClick={() => setCloneType('cli')}
                        className={`pb-1.5 transition ${cloneType === 'cli' ? 'border-b-2 border-emerald-400 text-white' : 'hover:text-slate-200'}`}
                      >
                        GitHub CLI
                      </button>
                    </div>

                    {/* Copy input */}
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1.5">
                      <span className="text-[11px] font-mono text-slate-300 truncate px-2 select-all flex-1">
                        {getCloneString()}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded transition shrink-0"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-500">
                      Use Git or checkout with SVN using the web URL.
                    </p>
                  </div>
                )}
              </div>

              {/* GitHub Link */}
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-400 hover:text-white border border-slate-700 bg-slate-800 rounded-lg transition"
                title="Open on GitHub"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Language Composition Bar */}
        {langEntries.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
              {langEntries.map((l) => (
                <div
                  key={l.name}
                  style={{ width: `${l.percent}%`, backgroundColor: l.color }}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
                  title={`${l.name}: ${l.percent}%`}
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-slate-400">
              {langEntries.map((l) => (
                <div key={l.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: l.color }}
                  />
                  <span className="font-medium text-slate-300">{l.name}</span>
                  <span className="font-mono tabular-nums text-slate-500 text-[11px]">{l.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
