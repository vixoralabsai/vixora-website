import React, { useState } from 'react';
import { GitBranch, Tag, Shield, Calendar, Download, ExternalLink, Check, Copy } from 'lucide-react';
import { GitHubBranch, GitHubRelease } from '../types/github';

interface BranchesAndReleasesProps {
  branches: GitHubBranch[];
  releases: GitHubRelease[];
  defaultBranch: string;
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
  owner: string;
  repo: string;
}

export const BranchesAndReleases: React.FC<BranchesAndReleasesProps> = ({
  branches,
  releases,
  defaultBranch,
  selectedBranch,
  onSelectBranch,
  owner,
  repo,
}) => {
  const [activeTab, setActiveTab] = useState<'branches' | 'releases'>('branches');
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Tab bar */}
      <div className="flex border-b border-slate-800 gap-8 text-sm font-medium">
        <button
          onClick={() => setActiveTab('branches')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'branches'
              ? 'border-blue-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-4 h-4 text-blue-400" />
          <span>Branches ({branches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('releases')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'releases'
              ? 'border-blue-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="w-4 h-4 text-emerald-400" />
          <span>Releases & Tags ({releases.length})</span>
        </button>
      </div>

      {activeTab === 'branches' ? (
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800 bg-[#0E1526]/50 flex items-center justify-between text-xs text-slate-400">
            <span>Branch Name</span>
            <span>Latest Commit</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {branches.map((b) => {
              const isDefault = b.name === defaultBranch;
              const isSelected = b.name === selectedBranch;
              const shortSha = b.commit.sha.slice(0, 7);

              return (
                <div
                  key={b.name}
                  className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-850/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onSelectBranch(b.name)}
                      className={`text-xs font-mono font-medium hover:text-blue-400 transition flex items-center gap-1.5 ${
                        isSelected ? 'text-blue-400 font-semibold' : 'text-slate-200'
                      }`}
                    >
                      <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                      <span>{b.name}</span>
                    </button>

                    {isDefault && (
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20">
                        Default
                      </span>
                    )}

                    {b.protected && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400">
                        <Shield className="w-3 h-3" />
                        <span>Protected</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCopySha(b.commit.sha)}
                      className="flex items-center gap-1 text-xs font-mono tabular-nums text-slate-400 hover:text-white px-2 py-1 bg-slate-900 rounded border border-slate-800 transition"
                      title="Copy SHA"
                    >
                      {copiedSha === b.commit.sha ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-500" />
                      )}
                      <span>{shortSha}</span>
                    </button>

                    <button
                      onClick={() => onSelectBranch(b.name)}
                      className={`px-3 py-1 text-xs font-medium rounded transition ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Inspect'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {releases.length === 0 ? (
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-12 text-center text-xs text-slate-500">
              No formal releases published for this repository.
            </div>
          ) : (
            releases.map((rel) => {
              const relDate = new Date(rel.published_at || rel.created_at).toLocaleDateString(
                undefined,
                { year: 'numeric', month: 'short', day: 'numeric' }
              );

              return (
                <div
                  key={rel.id}
                  className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">
                          {rel.name || rel.tag_name}
                        </h3>
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          {rel.tag_name}
                        </span>
                        {rel.prerelease && (
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                            Pre-release
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Released on {relDate}</span>
                        {rel.author && (
                          <>
                            <span>·</span>
                            <span>by {rel.author.login}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={rel.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>GitHub Release</span>
                      </a>
                    </div>
                  </div>

                  {rel.body && (
                    <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap bg-[#0B0F19]/60 p-4 rounded-lg border border-slate-800/80">
                      {rel.body}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={`https://github.com/${owner}/${repo}/archive/refs/tags/${encodeURIComponent(rel.tag_name)}.zip`}
                      download
                      className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Source Code (ZIP)</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
