import { useEffect, useState } from 'react';
import { useLoading } from '../context/LoadingContext';
import { Loader2, Sparkles } from 'lucide-react';

export function GlobalLoadingIndicator() {
  const { isLoading, loadingMessage, progress } = useLoading();
  const [visible, setVisible] = useState(false);

  // Slight debounce to avoid brief flickering on near-instant responses
  useEffect(() => {
    let timeout: any;
    if (isLoading) {
      timeout = setTimeout(() => setVisible(true), 60);
    } else {
      timeout = setTimeout(() => setVisible(false), 240);
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);

  return (
    <>
      {/* 1. Global Viewport Top Glow Line Stream (inspired by loading-ui.com & 21st.dev) */}
      {(isLoading || progress > 0) && (
        <div
          className="fixed top-0 left-0 right-0 z-[99999] h-[3px] bg-transparent pointer-events-none overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full bg-gradient-to-r from-[#480878] via-[#7000F8] to-[#10B981] transition-all duration-200 ease-out shadow-[0_0_16px_rgba(112,0,248,0.9)] relative"
            style={{ width: `${progress > 0 ? progress : 100}%` }}
          >
            {/* Travelling highlight beam */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
          </div>
        </div>
      )}

      {/* 2. Floating Tactile Island Dock (inspired by 21st.dev micro-components) */}
      {visible && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[99998] pointer-events-none select-none animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#000048]/95 text-white backdrop-blur-xl border border-white/15 shadow-[0_12px_32px_rgba(0,0,72,0.45)] text-xs font-semibold">
            {/* Dual-arc ring spinner from loading-ui.com */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 animate-spin text-purple-300" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#7000F8]" />
            </div>

            {/* Live status beacon */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>

            {/* Message with subtle text shimmer */}
            <span className="text-neutral-100 font-sans tracking-wide pr-1">
              {loadingMessage || 'Processing request...'}
            </span>

            {/* Progress percentage pill if active */}
            {progress > 0 && (
              <span className="font-mono text-[10px] font-bold text-purple-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                {Math.round(progress)}%
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
