import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  setCachedAccessToken,
  logout
} from '../services/firebase';
import {
  searchDriveFiles,
  fetchFileContent,
  SAMPLE_VIXORA_DOCS
} from '../services/driveService';
import { DriveFile, ProjectRequirementsDoc, SearchState } from '../types';
import { DriveScanner } from './DriveScanner';
import { PrdViewer } from './PrdViewer';
import { FilePreviewModal } from './FilePreviewModal';
import {
  X,
  HardDrive,
  Sparkles,
  AlertCircle,
  Download,
  LogIn,
  LogOut,
  Layers,
  FileCode
} from 'lucide-react';

interface DriveWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DriveWorkspaceModal({ isOpen, onClose }: DriveWorkspaceModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Files state
  const [files, setFiles] = useState<DriveFile[]>(SAMPLE_VIXORA_DOCS);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);

  // Search state
  const [searchState, setSearchState] = useState<SearchState>({
    isScanning: false,
    scanProgress: 0,
    statusMessage: '',
    query: 'vixora',
    scannedCount: 0,
    error: null,
  });

  // PRD Analysis state
  const [prd, setPrd] = useState<ProjectRequirementsDoc | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Auth Initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (authenticatedUser, token) => {
        setUser(authenticatedUser);
        setHasToken(Boolean(token));
      },
      () => {
        setUser(null);
        setHasToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  // Handle Google Sign-in
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setSearchState((prev) => ({ ...prev, error: null }));
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setHasToken(true);
        handleSearchDrive('vixora', result.accessToken);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setSearchState((prev) => ({
        ...prev,
        error: err.message || 'Failed to authenticate with Google Drive.',
      }));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setHasToken(false);
    setCachedAccessToken(null);
  };

  const handleSearchDrive = async (query: string, overrideToken?: string) => {
    const token = overrideToken || (await getAccessToken());
    if (!token) {
      handleLogin();
      return;
    }

    setSearchState((prev) => ({
      ...prev,
      isScanning: true,
      query,
      error: null,
      statusMessage: `Searching Google Drive for "${query}"...`,
    }));

    try {
      const driveFiles = await searchDriveFiles(token, query);
      setSearchState((prev) => ({
        ...prev,
        statusMessage: `Discovered ${driveFiles.length} files. Fetching document contents...`,
      }));

      const enrichedFiles = await Promise.all(
        driveFiles.map(async (f) => {
          if (f.isSelected) {
            const content = await fetchFileContent(token, f);
            return { ...f, extractedContent: content };
          }
          return f;
        })
      );

      setFiles(enrichedFiles);
      setSearchState((prev) => ({
        ...prev,
        isScanning: false,
        scannedCount: enrichedFiles.length,
        statusMessage: `Found ${enrichedFiles.length} file(s) in Drive.`,
      }));
    } catch (err: any) {
      console.error('Drive search failed:', err);
      setSearchState((prev) => ({
        ...prev,
        isScanning: false,
        error: err.message || 'Could not access Google Drive. Check permissions.',
      }));
    }
  };

  const handleLoadSamples = () => {
    setFiles(SAMPLE_VIXORA_DOCS);
    setSearchState((prev) => ({
      ...prev,
      query: 'vixora',
      error: null,
      statusMessage: 'Loaded Vixora platform specifications and architecture blueprints.',
    }));
  };

  const handleToggleSelect = async (id: string) => {
    const targetFile = files.find((f) => f.id === id);
    if (!targetFile) return;

    const willBeSelected = !targetFile.isSelected;
    let extractedContent = targetFile.extractedContent;
    if (willBeSelected && !extractedContent && hasToken) {
      const token = await getAccessToken();
      if (token) {
        extractedContent = await fetchFileContent(token, targetFile);
      }
    }

    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, isSelected: willBeSelected, extractedContent: extractedContent || f.extractedContent }
          : f
      )
    );
  };

  const handleSelectAll = (select: boolean) => {
    setFiles((prev) => prev.map((f) => ({ ...f, isSelected: select })));
  };

  const handleAnalyzeRequirements = async () => {
    const selectedFiles = files.filter((f) => f.isSelected);
    if (selectedFiles.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const token = await getAccessToken();
      const filesWithContent = await Promise.all(
        selectedFiles.map(async (file) => {
          if (!file.extractedContent && token) {
            const content = await fetchFileContent(token, file);
            return { ...file, extractedContent: content };
          }
          return file;
        })
      );

      const response = await fetch('/api/analyze-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: filesWithContent,
          customInstructions:
            'Extract all functional requirements, tech stack choices, milestone timelines, design guidelines, and acceptance criteria for Vixora web platform.',
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Server error compiling requirements');
      }

      const resData = await response.json();
      setPrd(resData.data);
    } catch (err: any) {
      console.error('Synthesis failed:', err);
      setAnalysisError(err.message || 'Failed to synthesize project requirements.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskQuestion = async (question: string): Promise<string> => {
    const response = await fetch('/api/ask-requirements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        prdContext: prd || files,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Error querying assistant');
    }

    const data = await response.json();
    return data.answer || 'No response generated.';
  };

  const handleExportMarkdown = () => {
    if (!prd) return;
    const blob = new Blob([prd.rawMarkdownReport || prd.summary], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vixora_Project_Requirements_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    if (!prd) return;
    const blob = new Blob([JSON.stringify(prd, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vixora_PRD_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      data-theme="dark"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto modal-dark"
    >
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-4 modal-dark">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Google Drive Workspace Scanner & PRD Hub</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Gemini 3.7 Flash
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Connect your Drive to scan Vixora specifications and compile requirements documents.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Auth Button */}
            {user ? (
              <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-neutral-300 font-medium hidden sm:inline">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="p-1 text-neutral-400 hover:text-red-400"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-400" />
                <span>{isLoggingIn ? 'Connecting...' : 'Connect Drive'}</span>
              </button>
            )}

            {prd && (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={handleExportMarkdown}
                  className="p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white"
                  title="Export Markdown"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handleExportJson}
                  className="p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white"
                  title="Export JSON"
                >
                  <FileCode className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* Drive Scanner Section */}
          <section>
            <DriveScanner
              files={files}
              searchState={searchState}
              onSearch={(q) => handleSearchDrive(q)}
              onLoadSamples={handleLoadSamples}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onPreviewFile={(f) => setPreviewFile(f)}
              onAnalyze={handleAnalyzeRequirements}
              isAnalyzing={isAnalyzing}
              hasAuth={hasToken}
              onPromptLogin={handleLogin}
            />
          </section>

          {/* Analysis Error Notification */}
          {analysisError && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <strong>Error compiling requirements:</strong> {analysisError}
              </div>
            </div>
          )}

          {/* PRD Synthesis Section */}
          {prd && (
            <section id="prd-section-modal" className="space-y-4 pt-4 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-100">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Synthesized Requirements Dossier</span>
                </div>
              </div>

              <PrdViewer prd={prd} onAskQuestion={handleAskQuestion} />
            </section>
          )}
        </div>
      </div>

      {/* File Content Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onToggleSelect={handleToggleSelect}
      />
    </div>
  );
}
