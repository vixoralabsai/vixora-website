import React, { useState, useEffect } from 'react';
import { Package, Search, ExternalLink, Layers, Wrench, Loader2, AlertCircle } from 'lucide-react';
import { GitHubTreeItem } from '../types/github';
import { fetchFileContent } from '../services/githubApi';

interface DependenciesAnalyzerProps {
  treeItems: GitHubTreeItem[];
  owner: string;
  repo: string;
  branch: string;
  customToken?: string;
}

export const DependenciesAnalyzer: React.FC<DependenciesAnalyzerProps> = ({
  treeItems,
  owner,
  repo,
  branch,
  customToken,
}) => {
  const [manifestType, setManifestType] = useState<string>('');
  const [manifestContent, setManifestContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  // Identify manifest file in root or src
  const manifestFile = treeItems.find(
    (t) =>
      t.type === 'blob' &&
      /^(package\.json|cargo\.toml|requirements\.txt|pyproject\.toml|go\.mod)$/i.test(t.path)
  );

  useEffect(() => {
    if (!manifestFile) {
      setLoading(false);
      setError('No package manifest (package.json, Cargo.toml, requirements.txt, go.mod) detected in root.');
      return;
    }

    setManifestType(manifestFile.path);
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchFileContent(owner, repo, manifestFile.path, branch, customToken)
      .then((data) => {
        if (isMounted) {
          setManifestContent(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch manifest file');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [manifestFile, owner, repo, branch, customToken]);

  // Parse package.json if applicable
  const parsedPackageJson = React.useMemo(() => {
    if (manifestType !== 'package.json' || !manifestContent) return null;
    try {
      return JSON.parse(manifestContent);
    } catch {
      return null;
    }
  }, [manifestType, manifestContent]);

  const depsList = React.useMemo(() => {
    if (!parsedPackageJson) return [];
    const deps = parsedPackageJson.dependencies || {};
    const devDeps = parsedPackageJson.devDependencies || {};

    const list = [
      ...Object.entries(deps).map(([name, ver]) => ({
        name,
        version: String(ver),
        type: 'production',
      })),
      ...Object.entries(devDeps).map(([name, ver]) => ({
        name,
        version: String(ver),
        type: 'development',
      })),
    ];

    if (!filterQuery) return list;
    const q = filterQuery.toLowerCase();
    return list.filter((d) => d.name.toLowerCase().includes(q) || d.version.toLowerCase().includes(q));
  }, [parsedPackageJson, filterQuery]);

  const scriptsList = React.useMemo(() => {
    if (!parsedPackageJson || !parsedPackageJson.scripts) return [];
    return Object.entries(parsedPackageJson.scripts) as [string, string][];
  }, [parsedPackageJson]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Dependency & Stack Analyzer</h2>
              <p className="text-xs text-slate-400">
                {manifestFile
                  ? `Manifest detected: ${manifestFile.path}`
                  : 'Scans root for dependency configuration and package manifests'}
              </p>
            </div>
          </div>

          {manifestFile && (
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter packages..."
                className="w-full bg-[#0B0F19] border border-slate-700/80 focus:border-blue-500 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3 bg-[#111827] border border-slate-800 rounded-xl">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-sm">Analyzing dependencies...</span>
        </div>
      ) : error ? (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-300">No Standard Manifest Found in Root</p>
              <p className="mt-1 text-slate-400">
                This repository may be a monorepo or documentation repository without a root package.json or Cargo.toml file.
              </p>
            </div>
          </div>
        </div>
      ) : parsedPackageJson ? (
        <div className="space-y-6">
          {/* Scripts row if available */}
          {scriptsList.length > 0 && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>NPM Run Scripts ({scriptsList.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {scriptsList.map(([cmd, script]) => (
                  <div
                    key={cmd}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <span className="text-xs font-mono text-blue-400 font-semibold">{cmd}</span>
                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-[280px]">
                      {script}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies table */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#0E1526]/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-white">
                  Installed Packages ({depsList.length})
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-800/80">
              {depsList.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No dependencies match your search query.
                </div>
              ) : (
                depsList.map((dep) => (
                  <div
                    key={dep.name}
                    className="px-6 py-3 flex items-center justify-between hover:bg-slate-850/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-medium text-slate-200">
                        {dep.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          dep.type === 'production'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {dep.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono tabular-nums text-slate-400">
                        {dep.version}
                      </span>
                      <a
                        href={`https://www.npmjs.com/package/${dep.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-slate-500 hover:text-slate-300 transition"
                        title="View on npm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Non-JSON manifest raw view (e.g. requirements.txt or Cargo.toml) */
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6">
          <div className="text-xs font-semibold text-slate-200 mb-3 font-mono">
            {manifestFile?.path}
          </div>
          <pre className="p-4 bg-[#0B0F19] rounded-lg border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre">
            <code>{manifestContent}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
