import React, { useState, useEffect } from 'react';
import { BookOpen, Copy, Check, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { fetchFileContent } from '../services/githubApi';
import { GitHubTreeItem } from '../types/github';

interface ReadmeViewerProps {
  treeItems: GitHubTreeItem[];
  owner: string;
  repo: string;
  branch: string;
  customToken?: string;
}

export const ReadmeViewer: React.FC<ReadmeViewerProps> = ({
  treeItems,
  owner,
  repo,
  branch,
  customToken,
}) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [readmePath, setReadmePath] = useState<string>('README.md');

  useEffect(() => {
    const found = treeItems.find((t) => t.type === 'blob' && /^readme(\.md|\.markdown|\.rst|\.txt)?$/i.test(t.path));
    const path = found ? found.path : 'README.md';
    setReadmePath(path);

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchFileContent(owner, repo, path, branch, customToken)
      .then((data) => {
        if (isMounted) {
          setContent(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'No README file found in this repository.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [treeItems, owner, repo, branch, customToken]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0E1526]/50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-white font-mono">{readmePath}</span>
          </div>

          <div className="flex items-center gap-2">
            {content && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Raw'}</span>
              </button>
            )}
            <a
              href={`https://github.com/${owner}/${repo}/blob/${encodeURIComponent(branch)}/${readmePath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              title="Open on GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
              <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
              <span className="text-sm">Fetching README documentation...</span>
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">README Not Found</p>
                <p className="text-amber-400/80 mt-0.5">
                  This repository might not have a README or it may be located in another directory.
                </p>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
              <div className="whitespace-pre-wrap font-sans break-words bg-[#0B0F19]/60 p-6 rounded-lg border border-slate-800/80">
                {content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
