import { useState } from 'react';
import { Copy, Check, Building2, CreditCard, ShieldCheck, Zap, Info } from 'lucide-react';
import { BANK_PAYMENT_DETAILS } from '../data/vixoraContent';

interface BankPaymentDetailsCardProps {
  courseTitle?: string;
  tuitionAmount?: string;
  className?: string;
  onPayOnline?: () => void;
}

export function BankPaymentDetailsCard({
  courseTitle,
  tuitionAmount = '₦60,000',
  className = '',
  onPayOnline
}: BankPaymentDetailsCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(BANK_PAYMENT_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`rounded-3xl bg-gradient-to-b from-[#1E113E] to-[#0F0724] border-2 border-purple-500/50 p-6 sm:p-7 shadow-2xl shadow-purple-950/60 text-left space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-800/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Direct Bank Transfer Option</h4>
            <p className="text-[11px] font-mono text-slate-200">Manual verification via Admissions WhatsApp desk</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onPayOnline && (
            <button
              type="button"
              onClick={onPayOnline}
              className="px-3 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              <span>Or Pay with Paystack</span>
            </button>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold">
            <ShieldCheck className="w-3 h-3" />
            <span>Official Corporate Account</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Bank Name */}
        <div className="p-3.5 rounded-2xl bg-purple-950/70 border border-purple-800/50">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-200 font-semibold">Bank</div>
          <div className="text-sm sm:text-base font-black text-white mt-0.5">{BANK_PAYMENT_DETAILS.bankName}</div>
        </div>

        {/* Account Name */}
        <div className="p-3.5 rounded-2xl bg-purple-950/70 border border-purple-800/50">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-200 font-semibold">Account Name</div>
          <div className="text-xs sm:text-sm font-black text-amber-300 mt-0.5">{BANK_PAYMENT_DETAILS.accountName}</div>
        </div>

        {/* Account Number with Copy */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/60 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-semibold">Account Number</div>
            <div className="text-base sm:text-lg font-mono font-black text-white tracking-wider mt-0.5">
              {BANK_PAYMENT_DETAILS.accountNumber}
            </div>
          </div>
          <button
            onClick={handleCopyAccount}
            className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer shrink-0 shadow-md"
            title="Copy account number"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-slate-950 font-bold" />
                <span className="text-[10px] font-mono font-bold text-slate-950 hidden xs:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-950" />
                <span className="text-[10px] font-mono font-bold text-slate-950 hidden xs:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-neutral-950/60 border border-purple-900/40 text-xs text-slate-200 flex items-start gap-2">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          After making payment ({tuitionAmount}{courseTitle ? ` for ${courseTitle}` : ''}), send your transaction receipt/screenshot to our WhatsApp Admissions Desk for instant enrolment receipt and cohort onboarding.
        </span>
      </div>
    </div>
  );
}
