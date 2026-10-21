import { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Printer,
  ExternalLink,
  X,
  GraduationCap,
  Calendar,
  CreditCard,
  Building2,
  Sparkles,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { VerifiedPaymentData } from '../lib/paystack';
import { getWhatsAppUrl, BRAND_CONFIG } from '../data/brandConfig';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  payment: VerifiedPaymentData | null;
  onClose: () => void;
  onGoToPortal?: () => void;
}

export function PaymentReceiptModal({
  isOpen,
  payment,
  onClose,
  onGoToPortal
}: PaymentReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !payment) return null;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(payment.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const whatsappOnboardingLink = getWhatsAppUrl(
    'ng',
    `Hello Vixora Admissions! I just completed my tuition payment of ${payment.currency} ${payment.amount.toLocaleString()} for ${payment.courseTitle} via Paystack. Transaction Reference: ${payment.reference}. My email is ${payment.studentEmail}.`
  );

  return (
    <div 
      role="dialog"
      aria-modal="true"
      data-theme="dark"
      className="modal-dark fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="modal-dark relative w-full max-w-xl bg-neutral-900 border border-emerald-500/50 rounded-3xl shadow-2xl shadow-emerald-950/40 overflow-hidden z-10 my-8">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-purple-950/80 p-6 sm:p-8 border-b border-emerald-900/40 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
            aria-label="Close receipt"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Payment Verified via Paystack</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Official Tuition Receipt
          </h2>
          <p className="text-xs text-neutral-300 mt-1 font-mono">
            Vixora Digital Hub Admissions &bull; Issued {new Date(payment.paidAt).toLocaleDateString()}
          </p>
        </div>

        {/* Receipt Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Success Banner */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-600/40 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Enrollment Confirmed!</div>
              <div className="text-xs text-emerald-200">
                Welcome to <strong>{payment.courseTitle}</strong>. Your seat is officially reserved.
              </div>
            </div>
          </div>

          {/* Transaction Metadata Box */}
          <div className="p-5 rounded-2xl bg-neutral-950/90 border border-neutral-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
              <span className="text-neutral-400">Transaction Reference:</span>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold text-[13px]">{payment.reference}</span>
                <button
                  onClick={handleCopyRef}
                  className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                  title="Copy Reference"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
              <span className="text-neutral-400">Amount Paid:</span>
              <span className="text-base font-bold text-emerald-400 font-sans">
                {payment.currency} {payment.amount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
              <span className="text-neutral-400">Student Name:</span>
              <span className="text-white font-semibold font-sans">{payment.studentName}</span>
            </div>

            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
              <span className="text-neutral-400">Student Email:</span>
              <span className="text-white">{payment.studentEmail}</span>
            </div>

            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
              <span className="text-neutral-400">Course Track:</span>
              <span className="text-purple-300 font-bold font-sans">{payment.courseTitle}</span>
            </div>

            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
              <span className="text-neutral-400">Payment Channel:</span>
              <span className="text-neutral-200 capitalize font-sans">
                {payment.channel} {payment.last4 ? `(ending ${payment.last4})` : ''}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Payment Date:</span>
              <span className="text-neutral-300">
                {payment.paidAt ? new Date(payment.paidAt).toLocaleString() : 'Confirmed'}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-1">
            <a
              href={whatsappOnboardingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Fast-Track Admissions &amp; Cohort WhatsApp</span>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </a>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>

              {onGoToPortal ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToPortal();
                  }}
                  className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Portal</span>
                </button>
              ) : (
                <a
                  href="/pages/student-portal"
                  className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Portal</span>
                </a>
              )}
            </div>

            <p className="text-[11px] text-center text-neutral-400 pt-1">
              A copy of this receipt has been emailed to <strong className="text-neutral-200">{payment.studentEmail}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
