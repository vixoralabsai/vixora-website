import { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, ShieldCheck, ExternalLink } from 'lucide-react';
import { BRAND_CONFIG, getWhatsAppUrl } from '../data/brandConfig';

export function FloatingWhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<'us' | 'ng'>('us');
  const [customText, setCustomText] = useState('');

  const quickPrompts = [
    "I'd like to discuss building custom software.",
    "Interested in Enterprise AI & n8n automation.",
    "Academy & cohort enrollment inquiry.",
    "Request a fast project timeline & quote."
  ];

  const handleLaunchChat = (prompt?: string) => {
    const textToSend = prompt || customText || "Hello Vixora Digital Hub Team, I would like to discuss a project.";
    const url = getWhatsAppUrl(selectedChannel, textToSend);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans print:hidden">
      {/* Floating Toggle Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-600/50 border border-emerald-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Open WhatsApp live chat support"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 fill-white text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 border-2 border-emerald-700" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold leading-none">Chat on WhatsApp</span>
            <span className="text-[10px] text-emerald-100 font-mono leading-tight mt-0.5">US &amp; Nigeria Lines</span>
          </div>
        </button>
      )}

      {/* Expanded Quick Chat Window */}
      {isOpen && (
        <div 
          role="dialog"
          aria-label="WhatsApp quick chat"
          data-theme="dark"
          className="modal-dark w-[calc(100vw-32px)] max-w-[380px] sm:w-[380px] rounded-3xl bg-[#0C061F] border border-emerald-500/40 shadow-2xl shadow-emerald-950/90 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 text-neutral-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900/90 via-purple-950 to-neutral-900 p-4 sm:p-5 border-b border-emerald-500/30 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close chat widget"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Vixora WhatsApp Hub</h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-medium border border-emerald-500/30">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 mt-0.5">
                  Direct connection with senior solution architects
                </p>
              </div>
            </div>
          </div>

          {/* Regional Selector Segmented Control */}
          <div className="p-3 bg-neutral-950/80 border-b border-neutral-800 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block px-1">
              Select Destination Line:
            </span>
            <div className="grid grid-cols-2 gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
              <button
                type="button"
                onClick={() => setSelectedChannel('us')}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer ${
                  selectedChannel === 'us'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <span className="flex items-center gap-1 text-[11px]">
                  US &amp; Foreign
                </span>
                <span className="text-[10px] font-mono opacity-90">
                  {BRAND_CONFIG.whatsapp.usAndGlobal.displayNumber}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('ng')}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer ${
                  selectedChannel === 'ng'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <span className="flex items-center gap-1 text-[11px]">
                  Nigeria Desk
                </span>
                <span className="text-[10px] font-mono opacity-90">
                  {BRAND_CONFIG.whatsapp.nigeria.displayNumber}
                </span>
              </button>
            </div>
          </div>

          {/* Chat Body & Prompt Launcher */}
          <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto text-xs">
            {/* Greeting card */}
            <div className="p-3 rounded-2xl bg-neutral-900/90 border border-purple-900/30 space-y-1.5 text-neutral-300">
              <p className="text-xs leading-relaxed">
                Connect directly with our advisory desk. Tap a topic below or type your inquiry to jump straight into a live WhatsApp chat on{' '}
                <strong className="text-emerald-400 font-mono">
                  {selectedChannel === 'us'
                    ? BRAND_CONFIG.whatsapp.usAndGlobal.displayNumber
                    : BRAND_CONFIG.whatsapp.nigeria.displayNumber}
                </strong>.
              </p>
            </div>

            {/* Quick Topic Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-semibold text-neutral-400 flex items-center gap-1">
                Quick Inquiries:
              </span>
              <div className="space-y-1.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLaunchChat(prompt)}
                    className="w-full p-2 rounded-xl bg-neutral-950 hover:bg-emerald-950/60 border border-neutral-800 hover:border-emerald-500/40 text-left text-neutral-300 hover:text-white transition-all flex items-center justify-between group cursor-pointer text-[11px]"
                  >
                    <span className="truncate pr-2">{prompt}</span>
                    <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-emerald-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom text composer */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <div className="relative">
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Type a custom inquiry..."
                  rows={2}
                  style={{ color: '#FFFFFF', backgroundColor: '#0a0a0a' }}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-emerald-500 text-xs text-white placeholder-neutral-400 focus:outline-none resize-none"
                />
              </div>

              <button
                type="button"
                onClick={() => handleLaunchChat()}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  Start Chat ({selectedChannel === 'us' ? 'US Line' : 'Nigeria Line'})
                </span>
              </button>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="p-3 bg-neutral-950 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
            <span className="flex items-center gap-1 text-neutral-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Official Verified Lines
            </span>
            <span className="text-emerald-400">Vixora Hub</span>
          </div>
        </div>
      )}
    </div>
  );
}
