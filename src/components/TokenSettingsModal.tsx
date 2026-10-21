import React, { useState } from 'react';
import { X, Key, ShieldCheck, ExternalLink, Trash2 } from 'lucide-react';
import { getStoredToken, setStoredToken } from '../services/githubApi';

interface TokenSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenSaved: () => void;
}

export const TokenSettingsModal: React.FC<TokenSettingsModalProps> = ({
  isOpen,
  onClose,
  onTokenSaved,
}) => {
  const [tokenInput, setTokenInput] = useState(getStoredToken());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredToken(tokenInput);
    setSavedSuccess(true);
    onTokenSaved();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setTokenInput('');
    setStoredToken('');
    onTokenSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-semibold text-white">GitHub API Token</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            By default, GitHub restricts anonymous requests to 60/hr. Adding a Personal Access Token increases your limit to 5,000 requests/hr and allows inspecting private repositories.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Personal Access Token (classic or fine-grained)
            </label>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-[#0B0F19] border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-600 outline-none font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Stored locally in your browser’s localStorage. Never sent to any 3rd party server.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            {tokenInput ? (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Token</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-sm flex items-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Token</span>
                )}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Need a token?</span>
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition"
            >
              <span>GitHub Token Settings</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};
