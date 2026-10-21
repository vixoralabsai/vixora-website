import { useState } from 'react';
import { DriveFile, SearchState } from '../types';
import {
  Search,
  RefreshCw,
  FileText,
  FileCode,
  Table,
  Eye,
  CheckSquare,
  Square,
  Sparkles,
  HardDrive,
  FolderSearch,
  ExternalLink,
  Layers,
  AlertCircle
} from 'lucide-react';

interface DriveScannerProps {
  files: DriveFile[];
  searchState: SearchState;
  onSearch: (query: string) => void;
  onLoadSamples: () => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: (select: boolean) => void;
  onPreviewFile: (file: DriveFile) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  hasAuth: boolean;
  onPromptLogin: () => void;
}

export function DriveScanner({
  files,
  searchState,
  onSearch,
  onLoadSamples,
  onToggleSelect,
  onSelectAll,
  onPreviewFile,
  onAnalyze,
  isAnalyzing,
  hasAuth,
  onPromptLogin,
}: DriveScannerProps) {
  const [searchInput, setSearchInput] = useState(searchState.query || 'vixora');
  const [filterType, setFilterType] = useState<'all' | 'google_doc' | 'google_sheet' | 'text' | 'pdf'>('all');

  const selectedCount = files.filter((f) => f.isSelected).length;

  const filteredFiles = files.filter((f) => {
    if (filterType === 'all') return true;
    return f.sourceType === filterType;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAuth) {
      onPromptLogin();
      return;
    }
    onSearch(searchInput);
  };

  const getFileIcon = (type?: DriveFile['sourceType']) => {
    switch (type) {
      case 'google_doc':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'google_sheet':
        return <Table className="w-4 h-4 text-emerald-400" />;
      case 'markdown':
      case 'text':
        return <FileCode className="w-4 h-4 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Drive Trigger Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
              <FolderSearch className="w-5 h-5 text-blue-400" />
              Google Drive Explorer & Document Discovery
            </h2>
            <p className="text-xs text-slate-200 mt-0.5">
              Query Google Drive for Vixora web platform documentation, PRDs, and architecture specs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="load-sample-docs-btn"
              onClick={onLoadSamples}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-slate-200 border border-neutral-700 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Load Vixora Sample Docs
            </button>
            <button
              id="scan-drive-main-btn"
              onClick={() => {
                if (!hasAuth) onPromptLogin();
                else onSearch(searchInput);
              }}
              disabled={searchState.isScanning}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${searchState.isScanning ? 'animate-spin' : ''}`} />
              {searchState.isScanning ? 'Scanning Drive...' : 'Scan Google Drive'}
            </button>
          </div>
        </div>

        {/* Search Bar & Quick Queries */}
        <form onSubmit={handleFormSubmit} className="mt-5 space-y-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-300 absolute left-3.5 pointer-events-none" />
            <input
              id="drive-search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by keywords (e.g., 'vixora', 'web development', 'prd', 'requirements')..."
              className="w-full pl-10 pr-24 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
            />
            <button
              type="submit"
              className="absolute right-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-slate-100 text-xs font-medium rounded-lg transition-colors"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-200 font-semibold text-[11px]">Suggested queries:</span>
            {['vixora', 'vixora web development', 'requirements', 'architecture spec', 'milestones'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchInput(tag);
                  if (hasAuth) onSearch(tag);
                }}
                className="px-2.5 py-1 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-slate-200 hover:text-white border border-neutral-800 text-[11px] transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </form>

        {/* Scan Status / Alerts */}
        {searchState.error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{searchState.error}</span>
          </div>
        )}

        {!hasAuth && files.length === 0 && (
          <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <HardDrive className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-200">
                Connect your Google Drive account above or click <strong>Load Vixora Sample Docs</strong> to explore the full PRD synthesis workflow.
              </p>
            </div>
            <button
              onClick={onPromptLogin}
              className="px-3.5 py-1.5 rounded-lg bg-white text-slate-950 font-bold text-xs hover:bg-neutral-100 transition-colors shrink-0"
            >
              Sign in with Google
            </button>
          </div>
        )}
      </div>

      {/* Discovered Files Table & Selection Panel */}
      {files.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-neutral-100">
                Discovered Documents ({files.length})
              </span>
              <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">
                {selectedCount} selected for PRD
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
              {(
                [
                  { key: 'all', label: 'All' },
                  { key: 'google_doc', label: 'Docs' },
                  { key: 'google_sheet', label: 'Sheets' },
                  { key: 'text', label: 'Markdown/Text' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterType(tab.key)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filterType === tab.key
                      ? 'bg-neutral-800 text-neutral-100 font-medium'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Batch Selection Controls */}
          <div className="flex items-center justify-between text-xs text-slate-200 px-1">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSelectAll(true)}
                className="hover:text-white text-slate-200 flex items-center gap-1"
              >
                <CheckSquare className="w-3.5 h-3.5 text-blue-400" /> Select All
              </button>
              <button
                type="button"
                onClick={() => onSelectAll(false)}
                className="hover:text-white text-slate-200 flex items-center gap-1"
              >
                <Square className="w-3.5 h-3.5" /> Clear Selection
              </button>
            </div>
            <span>
              Showing {filteredFiles.length} of {files.length} items
            </span>
          </div>

          {/* Files Grid / List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`relative rounded-xl border p-4 transition-all flex flex-col justify-between ${
                  file.isSelected
                    ? 'bg-blue-950/20 border-blue-500/40 shadow-xs'
                    : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 shrink-0">
                        {getFileIcon(file.sourceType)}
                      </div>
                      <h4
                        className="text-xs font-semibold text-slate-100 truncate cursor-pointer hover:text-blue-400"
                        onClick={() => onPreviewFile(file)}
                        title={file.name}
                      >
                        {file.name}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleSelect(file.id)}
                      className="text-slate-200 hover:text-white p-1 rounded transition-colors"
                      title={file.isSelected ? 'Deselect file' : 'Select file'}
                    >
                      {file.isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed">
                    {file.snippet || file.extractedContent?.slice(0, 100) || 'Google Drive document'}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between text-[10px] text-slate-300">
                  <span>{file.size || 'G-Suite Doc'}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onPreviewFile(file)}
                      className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-slate-200 flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3" /> Inspect
                    </button>
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-slate-200 hover:text-white transition-colors"
                        title="View in Drive"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Bar: Compile PRD */}
          <div className="mt-6 pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-200">
              {selectedCount > 0 ? (
                <span>
                  Ready to synthesize <strong>{selectedCount} document{selectedCount === 1 ? '' : 's'}</strong> with Gemini AI.
                </span>
              ) : (
                <span className="text-amber-300 font-semibold">
                  Please select at least 1 document to compile the project requirements.
                </span>
              )}
            </div>

            <button
              id="compile-requirements-btn"
              onClick={onAnalyze}
              disabled={selectedCount === 0 || isAnalyzing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing
                ? 'Synthesizing Vixora Requirements...'
                : `Compile Vixora Requirements (${selectedCount})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
