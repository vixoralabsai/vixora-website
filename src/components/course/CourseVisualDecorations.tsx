import React from 'react';

export const Star = ({ className = "w-5 h-5", color = "#FFC107" }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 24 24" fill={color} stroke="#1A1D4F" strokeWidth="1.5" className={className}>
    <path d="M12 2l2.4 6.6L21 11l-5.3 4.4L17 22l-5-3.6-5 3.6 1.3-6.6L3 11l6.6-2.4L12 2z" />
  </svg>
);

export const Sparkle = ({ className = "w-4 h-4", color = "#FF8A65" }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 24 24" fill={color} stroke="#1A1D4F" strokeWidth="1.5" className={className}>
    <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5L12 0z" />
  </svg>
);

export const SquiggleUnderline = ({ color = "#5B5FED", className = "w-full h-3" }: { color?: string; className?: string }) => (
  <svg viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="none">
    <path d="M2 8C20 3 40 3 60 7C80 11 100 11 120 7C140 3 160 3 180 7C190 9 195 10 198 10" stroke={color} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const StickerLabel = ({
  children,
  color = "bg-[#FFC107]",
  textColor = "text-[#1A1D4F]",
  rotate = 0,
  className = ""
}: {
  children: React.ReactNode;
  color?: string;
  textColor?: string;
  rotate?: number;
  className?: string;
}) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold tracking-wider uppercase border border-[#1A1D4F]/80 rounded-md ${color} ${textColor} select-none ${className}`}
  >
    {children}
  </span>
);

export const TactileButton = ({
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  className = "",
  type = "button",
  disabled = false
}: {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) => {
  const base = "inline-flex items-center justify-center font-bold border-2 border-[#1A1D4F] transition-all cursor-pointer select-none rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";
  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5 shadow-retro-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
    md: "px-5 py-2.5 text-sm gap-2 shadow-retro hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-retro-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
    lg: "px-7 py-3.5 text-base sm:text-lg gap-2.5 shadow-retro-lg hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-retro active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
  };
  const variantClasses = {
    primary: "bg-[#5B5FED] hover:bg-[#4d51ea] text-white",
    secondary: "bg-[#FFC107] hover:bg-[#ffb700] text-[#1A1D4F]",
    accent: "bg-[#FF8A65] hover:bg-[#f2744e] text-white",
    outline: "bg-white hover:bg-[#FFFDF9] text-[#1A1D4F]",
    dark: "bg-[#1A1D4F] hover:bg-[#0F1535] text-white"
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
