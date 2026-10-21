import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

interface CurrencySwitcherProps {
  className?: string;
  variant?: 'compact' | 'pill' | 'segmented';
}

export const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({
  className = '',
  variant = 'segmented',
}) => {
  const { currency, setCurrency, isAutoDetected, detectedCountry } = useCurrency();

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <button
          onClick={() => setCurrency(currency === 'NGN' ? 'USD' : 'NGN')}
          title={
            isAutoDetected && detectedCountry
              ? `Detected country: ${detectedCountry}. Click to switch currency.`
              : 'Click to switch between USD ($) and NGN (₦)'
          }
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer"
        >
          <span>{currency === 'USD' ? '🌐 $ USD' : '🇳🇬 ₦ NGN'}</span>
        </button>
      </div>
    );
  }

  // Default: Segmented tab button
  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-lg bg-[#0F1535]/80 border border-purple-500/30 text-xs font-mono shadow-sm ${className}`}
      title={
        isAutoDetected && detectedCountry
          ? `Detected location: ${detectedCountry} (${currency === 'USD' ? 'Outside Nigeria' : 'Nigeria'}). You can manually switch anytime.`
          : 'Currency detected from location. Click to switch.'
      }
    >
      <button
        type="button"
        onClick={() => setCurrency('NGN')}
        className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
          currency === 'NGN'
            ? 'bg-[#5B5FED] text-white shadow-sm'
            : 'text-slate-300 hover:text-white'
        }`}
      >
        <span>🇳🇬</span>
        <span>₦ NGN</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrency('USD')}
        className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
          currency === 'USD'
            ? 'bg-[#10B981] text-white shadow-sm'
            : 'text-slate-300 hover:text-white'
        }`}
      >
        <span>🌐</span>
        <span>$ USD</span>
      </button>
    </div>
  );
};
