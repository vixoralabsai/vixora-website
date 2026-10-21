import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Globe, ChevronDown, ExternalLink, ShieldCheck } from 'lucide-react';
import { BRAND_CONFIG, getWhatsAppUrl } from '../data/brandConfig';

interface WhatsAppContactButtonProps {
  message?: string;
  variant?: 'primary' | 'secondary' | 'compact' | 'pill';
  label?: string;
  className?: string;
  showDetails?: boolean;
}

export function WhatsAppContactButton({
  message,
  variant = 'primary',
  label = 'Chat on WhatsApp',
  className = '',
  showDetails = true
}: WhatsAppContactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const usUrl = getWhatsAppUrl('us', message);
  const ngUrl = getWhatsAppUrl('ng', message);

  // Variant styling
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return 'px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all';
      case 'secondary':
        return 'px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 transition-all';
      case 'compact':
        return 'px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 transition-all';
      case 'pill':
        return 'px-4 py-2 rounded-full text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all';
      default:
        return 'px-5 py-3 rounded-xl text-xs font-semibold bg-emerald-600 text-white';
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center gap-2 cursor-pointer group ${getButtonStyles()}`}
        aria-expanded={isOpen}
      >
        <MessageSquare className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        <span>{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Menu with Dual Regional Lines */}
      {isOpen && (
        <div 
          role="dialog"
          aria-label="Select WhatsApp Line"
          data-theme="dark"
          className="modal-dark absolute right-0 sm:left-0 sm:right-auto mt-2 w-80 sm:w-88 rounded-2xl bg-[#0C061F] border border-emerald-500/30 shadow-2xl shadow-emerald-950/80 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-neutral-100"
        >
          <div className="px-3 py-2 border-b border-purple-900/30 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                Select Inbound WhatsApp Line
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Agents Online" />
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Direct connection to Vixora Technology Strategists
            </p>
          </div>

          <div className="space-y-1.5">
            {/* 1. US & Foreign Inbounds */}
            <a
              href={usUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-start justify-between p-3 rounded-xl bg-neutral-900/80 hover:bg-emerald-950/50 border border-neutral-800 hover:border-emerald-500/40 transition-all group"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    US &amp; Foreign Inbounds
                  </span>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                  {BRAND_CONFIG.whatsapp.usAndGlobal.displayNumber}
                </div>
                {showDetails && (
                  <div className="text-[10px] text-neutral-400">
                    Americas, Europe, Asia &amp; Global Clients
                  </div>
                )}
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-emerald-400 transition-colors shrink-0 mt-1" />
            </a>

            {/* 2. Nigeria Inbounds */}
            <a
              href={ngUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-start justify-between p-3 rounded-xl bg-neutral-900/80 hover:bg-emerald-950/50 border border-neutral-800 hover:border-emerald-500/40 transition-all group"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Nigeria Inbounds
                  </span>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                  {BRAND_CONFIG.whatsapp.nigeria.displayNumber}
                  <span className="text-[10px] text-neutral-500 font-normal ml-1">
                    ({BRAND_CONFIG.whatsapp.nigeria.fullInternationalNumber})
                  </span>
                </div>
                {showDetails && (
                  <div className="text-[10px] text-neutral-400">
                    Local Nigeria &amp; West Africa Regional Inquiries
                  </div>
                )}
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-emerald-400 transition-colors shrink-0 mt-1" />
            </a>
          </div>

          <div className="mt-2 pt-2 border-t border-purple-900/30 px-2 flex items-center justify-between text-[10px] text-neutral-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> End-to-End Encrypted
            </span>
            <span className="text-emerald-400 font-medium">Avg response &lt; 15 mins</span>
          </div>
        </div>
      )}
    </div>
  );
}
