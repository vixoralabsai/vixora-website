import React, { useState } from 'react';
import { GitCommit, Copy, Check, ExternalLink, Search, User } from 'lucide-react';
import { GitHubCommit } from '../types/github';

interface CommitsListProps {
  commits: GitHubCommit[];
  branch: string;
  owner: string;
  repo: string;
}

export const CommitsList: React.FC<CommitsListProps> = ({
  commits,
  branch,
  owner,
  repo,
}) => {
  const [copiedSha, setCopiedSha] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 1500);
  };

  const filtered = commits.filter((c) => {
    const msg = c.commit.message.toLowerCase();
    const author = (c.author?.login || c.commit.author.name).toLowerCase();
    const sha = c.sha.toLowerCase();
    const q = filterText.toLowerCase();
    return msg.includes(q) || author.includes(q) || sha.includes(q);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Header & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-slate-800 bg-[#0E1526]/50">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">
              Commit History
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              ({commits.length} commits on branch <span className="text-slate-300">{branch}</span>)
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search commit or author..."
              className="w-full bg-[#0B0F19] border border-slate-700/80 focus:border-blue-500 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>
        </div>

        {/* List of Commits */}
        <div className="divide-y divide-slate-800/80">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500">
              No commits match your filter.
            </div>
          ) : (
            filtered.map((item) => {
              const authorName = item.author?.login || item.commit.author.name;
              const dateStr = new Date(item.commit.author.date).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              });
              const shortSha = item.sha.slice(0, 7);

              return (
                <div
                  key={item.sha}
                  className="p-4 sm:px-6 hover:bg-slate-850/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 min-w-0 pr-4">
                    <p className="text-sm font-medium text-slate-200 line-clamp-2">
                      {item.commit.message.split('\n')[0]}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                      {item.author?.avatar_url ? (
                        <img
                          src={item.author.avatar_url}
                          alt={authorName}
                          className="w-4 h-4 rounded-full border border-slate-700 inline-block"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="w-3.5 h-3.5 text-slate-500 inline-block" />
                      )}
                      <span className="text-slate-300 font-medium">{authorName}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-500">{dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopySha(item.sha)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono tabular-nums text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded transition"
                      title="Copy full commit SHA"
                    >
                      {copiedSha === item.sha ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-500" />
                      )}
                      <span>{shortSha}</span>
                    </button>

                    <a
                      href={item.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded hover:border-slate-700 transition"
                      title="View commit diff on GitHub"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
