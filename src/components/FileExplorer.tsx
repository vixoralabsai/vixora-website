import React, { useState, useEffect, useMemo } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileText, 
  FileJson, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  File, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Loader2,
  Eye,
  Code2
} from 'lucide-react';
import { GitHubTreeItem, TreeNode } from '../types/github';
import { fetchFileContent } from '../services/githubApi';

interface FileExplorerProps {
  treeItems: GitHubTreeItem[];
  owner: string;
  repo: string;
  branch: string;
  customToken?: string;
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return <File className="w-4 h-4 text-slate-400" />;
  
  switch (ext) {
    case 'ts':
    case 'tsx':
      return <FileCode className="w-4 h-4 text-blue-400" />;
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return <FileCode className="w-4 h-4 text-yellow-400" />;
    case 'json':
      return <FileJson className="w-4 h-4 text-amber-300" />;
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return <FileCode className="w-4 h-4 text-cyan-400" />;
    case 'html':
      return <FileCode className="w-4 h-4 text-orange-400" />;
    case 'md':
    case 'markdown':
    case 'txt':
      return <FileText className="w-4 h-4 text-emerald-400" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
    case 'ico':
      return <ImageIcon className="w-4 h-4 text-purple-400" />;
    case 'csv':
      return <FileSpreadsheet className="w-4 h-4 text-green-400" />;
    case 'py':
      return <FileCode className="w-4 h-4 text-blue-300" />;
    case 'rs':
      return <FileCode className="w-4 h-4 text-orange-500" />;
    case 'go':
      return <FileCode className="w-4 h-4 text-teal-400" />;
    default:
      return <File className="w-4 h-4 text-slate-400" />;
  }
}

function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  treeItems,
  owner,
  repo,
  branch,
  customToken,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [fileContent, setFileContent] = useState<string>('');
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<'code' | 'rendered'>('code');

  // Find default file (README.md or package.json or first file)
  useEffect(() => {
    if (treeItems.length > 0 && !selectedFilePath) {
      const readme = treeItems.find((item) => item.type === 'blob' && /readme\.md$/i.test(item.path));
      if (readme) {
        setSelectedFilePath(readme.path);
        // Expand root
        const dir = readme.path.split('/').slice(0, -1).join('/');
        if (dir) {
          setExpandedFolders(new Set([dir]));
        }
      } else {
        const firstBlob = treeItems.find((item) => item.type === 'blob');
        if (firstBlob) setSelectedFilePath(firstBlob.path);
      }
    }
  }, [treeItems]);

  // Load file content when selectedFilePath changes
  useEffect(() => {
    if (!selectedFilePath) return;

    const isImage = /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(selectedFilePath);
    if (isImage) {
      setFileContent('');
      setLoadingFile(false);
      return;
    }

    let isMounted = true;
    setLoadingFile(true);
    setFileError(null);

    fetchFileContent(owner, repo, selectedFilePath, branch, customToken)
      .then((content) => {
        if (isMounted) {
          setFileContent(content);
          setLoadingFile(false);
          if (/\.md$/i.test(selectedFilePath)) {
            setPreviewMode('rendered');
          } else {
            setPreviewMode('code');
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setFileError(err.message || 'Failed to load file');
          setLoadingFile(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedFilePath, owner, repo, branch, customToken]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Filtered files for search
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const term = searchTerm.toLowerCase();
    return treeItems.filter((i) => i.path.toLowerCase().includes(term));
  }, [treeItems, searchTerm]);

  // Construct hierarchy for standard tree view
  const hierarchy = useMemo(() => {
    const rootNodes: { [key: string]: any } = {};

    treeItems.forEach((item) => {
      const parts = item.path.split('/');
      let currentLevel = rootNodes;

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1 && item.type === 'blob';
        const currentPath = parts.slice(0, index + 1).join('/');

        if (!currentLevel[part]) {
          currentLevel[part] = {
            name: part,
            path: currentPath,
            type: isFile ? 'blob' : 'tree',
            size: item.size,
            children: isFile ? null : {},
          };
        }
        if (!isFile) {
          currentLevel = currentLevel[part].children;
        }
      });
    });

    return rootNodes;
  }, [treeItems]);

  const isImageFile = /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(selectedFilePath);
  const isMarkdown = /\.md$/i.test(selectedFilePath);
  const rawImageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${selectedFilePath}`;

  const renderTreeNodes = (nodes: { [key: string]: any }, depth = 0) => {
    const entries = Object.values(nodes);
    // Sort: directories first, then alphabetical
    entries.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'tree' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return entries.map((node) => {
      const isDir = node.type === 'tree';
      const isExpanded = expandedFolders.has(node.path);
      const isSelected = selectedFilePath === node.path;

      if (isDir) {
        return (
          <div key={node.path}>
            <button
              onClick={() => toggleFolder(node.path)}
              style={{ paddingLeft: `${depth * 14 + 10}px` }}
              className="w-full flex items-center gap-1.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded transition group"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-400 shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-blue-400/80 shrink-0" />
              )}
              <span className="truncate">{node.name}</span>
            </button>
            {isExpanded && node.children && (
              <div>{renderTreeNodes(node.children, depth + 1)}</div>
            )}
          </div>
        );
      }

      return (
        <button
          key={node.path}
          onClick={() => setSelectedFilePath(node.path)}
          style={{ paddingLeft: `${depth * 14 + 24}px` }}
          className={`w-full flex items-center justify-between py-1 pr-2 text-xs rounded transition group ${
            isSelected
              ? 'bg-blue-600/20 text-blue-400 font-medium'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {getFileIcon(node.name)}
            <span className="truncate">{node.name}</span>
          </div>
          {node.size && (
            <span className="text-[10px] text-slate-600 font-mono tabular-nums shrink-0 ml-2">
              {formatBytes(node.size)}
            </span>
          )}
        </button>
      );
    });
  };

  const linesCount = useMemo(() => {
    if (!fileContent) return 0;
    return fileContent.split('\n').length;
  }, [fileContent]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#111827] border border-slate-800 rounded-xl overflow-hidden min-h-[680px]">
        {/* Left Sidebar: File Tree */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col bg-[#0E1526]/60">
          {/* Search box */}
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find file by name..."
                className="w-full bg-[#0B0F19] border border-slate-700/80 focus:border-blue-500 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          {/* Tree or Search Results */}
          <div className="flex-1 overflow-y-auto p-2 max-h-[580px]">
            {filteredItems ? (
              <div className="space-y-0.5">
                <div className="text-[11px] font-medium text-slate-500 px-2 py-1">
                  Matching Files ({filteredItems.length})
                </div>
                {filteredItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      if (item.type === 'blob') {
                        setSelectedFilePath(item.path);
                      }
                    }}
                    className={`w-full text-left px-2 py-1.5 text-xs rounded flex items-center justify-between ${
                      selectedFilePath === item.path
                        ? 'bg-blue-600/20 text-blue-400 font-medium'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {item.type === 'tree' ? (
                        <Folder className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        getFileIcon(item.path)
                      )}
                      <span className="truncate font-mono text-[11px]">{item.path}</span>
                    </div>
                    {item.size && (
                      <span className="text-[10px] text-slate-500 font-mono tabular-nums ml-2">
                        {formatBytes(item.size)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-0.5">
                {renderTreeNodes(hierarchy)}
              </div>
            )}
          </div>

          <div className="p-2.5 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between font-mono tabular-nums">
            <span>{treeItems.filter(t => t.type === 'blob').length} files</span>
            <span>{treeItems.filter(t => t.type === 'tree').length} directories</span>
          </div>
        </div>

        {/* Right Pane: Code / File Viewer */}
        <div className="lg:col-span-8 flex flex-col bg-[#0B0F19]">
          {/* File Toolbar Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-[#111827]">
            <div className="flex items-center gap-2 truncate">
              {getFileIcon(selectedFilePath)}
              <span className="text-xs font-mono text-slate-200 truncate">
                {selectedFilePath || 'Select a file to inspect'}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {linesCount > 0 && (
                <span className="text-[11px] font-mono tabular-nums text-slate-500 hidden sm:inline">
                  {linesCount} lines
                </span>
              )}

              {isMarkdown && (
                <div className="flex bg-slate-800 rounded p-0.5 text-xs font-medium">
                  <button
                    onClick={() => setPreviewMode('rendered')}
                    className={`px-2 py-0.5 rounded transition ${previewMode === 'rendered' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('code')}
                    className={`px-2 py-0.5 rounded transition ${previewMode === 'code' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {!isImageFile && fileContent && (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition"
                  title="Copy file content"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}

              <a
                href={`https://github.com/${owner}/${repo}/blob/${encodeURIComponent(branch)}/${selectedFilePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition"
                title="View on GitHub"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-4 max-h-[600px] font-mono text-xs">
            {loadingFile ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span>Loading file content...</span>
              </div>
            ) : fileError ? (
              <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {fileError}
              </div>
            ) : isImageFile ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg max-w-md max-h-96 overflow-hidden flex items-center justify-center">
                  <img
                    src={rawImageUrl}
                    alt={selectedFilePath}
                    className="max-h-80 max-w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={rawImageUrl}
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Image</span>
                  </a>
                </div>
              </div>
            ) : isMarkdown && previewMode === 'rendered' ? (
              <div className="prose prose-invert max-w-none font-sans text-slate-300 text-sm leading-relaxed p-2 space-y-4">
                <div className="whitespace-pre-wrap font-sans">
                  {fileContent}
                </div>
              </div>
            ) : (
              <div className="flex">
                {/* Line numbers */}
                <div className="select-none pr-4 text-right text-slate-600 font-mono tabular-nums border-r border-slate-800/80 mr-4">
                  {fileContent.split('\n').map((_, index) => (
                    <div key={index} className="leading-5">
                      {index + 1}
                    </div>
                  ))}
                </div>
                {/* Code Body */}
                <pre className="flex-1 overflow-x-auto text-slate-200 font-mono leading-5 whitespace-pre">
                  <code>{fileContent}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
