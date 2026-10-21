import { useState } from 'react';
import { BRAND_CONFIG, getImageFallbacks, getDirectImageUrl } from '../data/brandConfig';

interface BrandLogoProps {
  className?: string;
  imgClassName?: string;
  variant?: 'primary' | 'secondary' | 'mobile';
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
}

export function BrandLogo({
  className = '',
  imgClassName = '',
  variant = 'primary',
  showText = true,
  size = 'md'
}: BrandLogoProps) {
  // Universal brand logo across both desktop and mobile
  const targetUrl = variant === 'secondary' && BRAND_CONFIG.logo.secondaryImageUrl
    ? BRAND_CONFIG.logo.secondaryImageUrl
    : (BRAND_CONFIG.logo.imageUrl || '/images/brand-logo-mobile.png');

  const fallbackList = getImageFallbacks(targetUrl);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  const handleImgError = () => {
    if (currentIdx + 1 < fallbackList.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  const heightClasses = {
    sm: 'h-8 sm:h-9 max-w-[160px] sm:max-w-[180px]',
    md: 'h-11 sm:h-12 md:h-13 max-w-[220px] sm:max-w-[260px] md:max-w-[300px]',
    lg: 'h-14 sm:h-16 md:h-18 max-w-[280px] sm:max-w-[340px] md:max-w-[380px]'
  };

  const currentSrc = fallbackList[currentIdx] || getDirectImageUrl(targetUrl);

  if (targetUrl && !hasFailedAll) {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <img
          src={currentSrc}
          alt={BRAND_CONFIG.logo.altText || BRAND_CONFIG.name}
          referrerPolicy="no-referrer"
          onError={handleImgError}
          className={`${heightClasses[size]} w-auto object-contain object-left rounded-lg drop-shadow-md transition-opacity duration-300 ${imgClassName}`}
        />
      </div>
    );
  }

  // Fallback Authentic 3D Geometric Faceted 'V' Icon & typography
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
        <img
          src="/images/vixora-icon.png"
          alt="Vixora Mark"
          className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]"
          onError={(e) => {
            // Hide image and show svg fallback if needed
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg sm:text-xl tracking-wider text-white leading-tight font-sans">
              VIXORA
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 leading-none">
              HUB
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono text-purple-300/80 tracking-widest uppercase leading-none mt-0.5">
            SOFTWARE &bull; AI &bull; AUTOMATION
          </span>
        </div>
      )}
    </div>
  );
}
