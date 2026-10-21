import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string | null;
  progress: number;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  loadingMessage: null,
  progress: 0,
  startLoading: () => {},
  stopLoading: () => {}
});

/**
 * Safe global helper to start loading from anywhere (functions, services, event handlers)
 * without modifying read-only window properties.
 */
export function triggerGlobalLoading(message?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vixora:loading-start', { detail: { message } }));
  }
}

/**
 * Safe global helper to stop loading from anywhere
 */
export function endGlobalLoading() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vixora:loading-stop'));
  }
}

/**
 * Safe wrapper around fetch that tracks global loading state without mutating window.fetch
 */
export async function appFetch(input: RequestInfo | URL, init?: RequestInit, message?: string): Promise<Response> {
  triggerGlobalLoading(message);
  try {
    return await fetch(input, init);
  } finally {
    endGlobalLoading();
  }
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [activeRequests, setActiveRequests] = useState(0);
  const [manualLoading, setManualLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const progressIntervalRef = useRef<any>(null);

  const isLoading = activeRequests > 0 || manualLoading;

  const startLoading = useCallback((message?: string) => {
    setLoadingMessage(message || null);
    setManualLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setManualLoading(false);
    setLoadingMessage(null);
  }, []);

  // Smooth simulated progress bar while loading
  useEffect(() => {
    if (isLoading) {
      setProgress(15);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          if (prev < 40) return prev + 14;
          if (prev < 70) return prev + 7;
          return prev + 2;
        });
      }, 100);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProgress(100);
      const timer = setTimeout(() => {
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isLoading]);

  // Safe CustomEvent listener to support global loading triggers without modifying window.fetch
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStart = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt.detail?.message) {
        setLoadingMessage(customEvt.detail.message);
      }
      setActiveRequests(prev => prev + 1);
    };

    const handleStop = () => {
      setActiveRequests(prev => Math.max(0, prev - 1));
    };

    window.addEventListener('vixora:loading-start', handleStart);
    window.addEventListener('vixora:loading-stop', handleStop);

    return () => {
      window.removeEventListener('vixora:loading-start', handleStart);
      window.removeEventListener('vixora:loading-stop', handleStop);
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, loadingMessage, progress, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
