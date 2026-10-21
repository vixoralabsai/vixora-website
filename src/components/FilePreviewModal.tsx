import { DriveFile } from '../types';
import { X, ExternalLink, FileText, CheckCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface FilePreviewModalProps {
  file: DriveFile | null;
  onClose: () => void;
  onToggleSelect?: (id: string) => void;
}

export function FilePreviewModal({
  file,
  onClose,
  onToggleSelect,
}: FilePreviewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!file) return null;

  const handleCopy = () => {
    if (file.extractedContent) {
      navigator.clipboard.writeText(file.extractedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      data-theme="dark"
      className="modal-dark fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="modal-dark bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-neutral-100 truncate">
                {file.name}
              </h3>
              <p className="text-xs text-neutral-400">
                {file.mimeType} • {file.size || 'Size N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {file.webViewLink && (
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                title="Open in Google Drive"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
              title="Copy extracted content"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-950 font-mono text-xs leading-relaxed text-neutral-300">
          {file.extractedContent ? (
            <pre className="whitespace-pre-wrap break-words font-mono">
              {file.extractedContent}
            </pre>
          ) : (
            <div className="py-12 text-center text-neutral-500 font-sans">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No text extracted directly yet.</p>
              <p className="text-xs mt-1 text-neutral-600">
                This file will be processed when the AI Requirements Synthesis is triggered.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            {file.extractedContent
              ? `${file.extractedContent.length} characters parsed`
              : 'Google Drive File'}
          </span>
          <div className="flex items-center gap-2">
            {onToggleSelect && (
              <button
                onClick={() => {
                  onToggleSelect(file.id);
                  onClose();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  file.isSelected
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {file.isSelected ? 'Exclude from Synthesis' : 'Include in Synthesis'}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
