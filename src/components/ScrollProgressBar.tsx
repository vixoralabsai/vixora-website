import { useState, useEffect } from 'react';

interface ScrollProgressBarProps {
  activePages?: string[];
  currentPage?: string;
}

export function ScrollProgressBar({
  activePages = ['about', 'academy', 'academy-course', 'resources', 'categories', 'portfolio', 'student-portal', 'certificate-portal'],
  currentPage = ''
}: ScrollProgressBarProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  // Only render if on long-form pages or if activePages allows
  if (activePages.length > 0 && !activePages.includes(currentPage)) {
    return null;
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-transparent pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#480878] via-[#7000F8] to-[#000048] transition-[width] duration-75 ease-out shadow-[0_0_8px_rgba(112,0,248,0.5)]"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
