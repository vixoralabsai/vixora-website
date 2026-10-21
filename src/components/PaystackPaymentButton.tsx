import { useState } from 'react';
import { CreditCard, ShieldCheck, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import {
  initializePaystackPayment,
  launchPaystackCheckout,
  verifyPaystackPayment,
  VerifiedPaymentData
} from '../lib/paystack';

interface PaystackPaymentButtonProps {
  email: string;
  studentName?: string;
  phone?: string;
  courseId: string;
  courseTitle: string;
  tuitionDisplay: string;
  onSuccess?: (payment: VerifiedPaymentData) => void;
  className?: string;
  variant?: 'primary' | 'card';
}

export function PaystackPaymentButton({
  email,
  studentName,
  phone,
  courseId,
  courseTitle,
  tuitionDisplay,
  onSuccess,
  className = '',
  variant = 'primary'
}: PaystackPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePay = async () => {
    setErrorMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address before proceeding to payment.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Initialize transaction on our server
      // Note: Frontend sends ONLY customer info & courseId; authoritative amount is determined by backend.
      const initRes = await initializePaystackPayment({
        email,
        studentName,
        phone,
        courseId,
        callbackUrl: typeof window !== 'undefined'
          ? `${window.location.origin}/payment/callback?courseId=${encodeURIComponent(courseId)}`
          : undefined
      });

      if (!initRes.success || !initRes.reference) {
        if (initRes.code === 'PAYSTACK_NOT_CONFIGURED') {
          setErrorMessage(
            'Payment processing is currently undergoing system setup. Please contact admissions directly or try again shortly.'
          );
        } else {
          setErrorMessage(initRes.error || 'Failed to initialize Paystack checkout.');
        }
        setIsLoading(false);
        return;
      }

      // 2. Launch Paystack Checkout
      await launchPaystackCheckout({
        reference: initRes.reference,
        authorizationUrl: initRes.authorizationUrl,
        accessCode: initRes.accessCode,
        publicKey: initRes.publicKey,
        email,
        studentName,
        phone,
        onSuccess: (confirmedRef) => {
          setIsLoading(true);
          verifyPaystackPayment(confirmedRef)
            .then((verifyRes) => {
              setIsLoading(false);
              if (verifyRes.verified && verifyRes.payment) {
                if (onSuccess) {
                  onSuccess(verifyRes.payment);
                } else {
                  window.location.href = `/payment/callback?reference=${encodeURIComponent(confirmedRef)}`;
                }
              } else {
                setErrorMessage(verifyRes.error || 'Payment verification could not be confirmed.');
              }
            })
            .catch((err: any) => {
              setIsLoading(false);
              setErrorMessage(err?.message || 'Payment verification failed. Please contact support.');
            });
        },
        onCancel: () => {
          setIsLoading(false);
          setErrorMessage('Payment was cancelled. You can try again whenever you are ready.');
        },
        onError: (err) => {
          setIsLoading(false);
          setErrorMessage(err);
        }
      });
    } catch (err: any) {
      console.error('Paystack Checkout Error:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred with Paystack checkout.');
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {variant === 'card' ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-neutral-900 to-indigo-950/80 border-2 border-emerald-500/60 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-800/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Instant Online Payment (Paystack)</h4>
                <p className="text-[11px] font-mono text-emerald-300">Automated verification &amp; instant seat reservation</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
              <ShieldCheck className="w-3 h-3" />
              <span>256-bit SSL Secured</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-300">
            <div>
              <span className="text-neutral-400">Total Tuition: </span>
              <strong className="text-base text-emerald-400 font-bold">{tuitionDisplay}</strong>
            </div>
            <div className="text-[11px] font-mono text-neutral-400">
              Cards • Bank Transfer • USSD • Mobile Money
            </div>
          </div>

          <button
            type="button"
            onClick={handlePay}
            disabled={isLoading}
            className="w-full py-3.5 px-5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting to Paystack...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay {tuitionDisplay} Online with Paystack</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handlePay}
          disabled={isLoading}
          className="w-full py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connecting to Paystack...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Pay {tuitionDisplay} via Paystack</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      )}

      {/* Trust & Channels Logos Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono text-neutral-400 pt-1">
        <span className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="w-3 h-3" /> Paystack Secured:
        </span>
        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">Mastercard</span>
        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">Visa</span>
        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">Verve</span>
        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">Bank Transfer</span>
        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">USSD</span>
      </div>
    </div>
  );
}
