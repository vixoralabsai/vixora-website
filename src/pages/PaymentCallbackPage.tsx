import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Printer,
  GraduationCap,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import {
  verifyPaystackPayment,
  isValidClientReference,
  cleanErrorMessage,
  VerifiedPaymentData
} from '../lib/paystack';
import { getWhatsAppUrl } from '../data/brandConfig';

type CallbackPageState = 'processing' | 'success' | 'failed' | 'cancelled' | 'error';

interface PaymentCallbackPageProps {
  onNavigateHome?: () => void;
  onNavigateToPortal?: () => void;
}

export function PaymentCallbackPage({
  onNavigateHome,
  onNavigateToPortal
}: PaymentCallbackPageProps) {
  const [pageState, setPageState] = useState<CallbackPageState>('processing');
  const [payment, setPayment] = useState<VerifiedPaymentData | null>(null);
  const [reference, setReference] = useState<string>('');
  const [courseId, setCourseId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const executeVerification = useCallback(async (ref: string) => {
    if (!isValidClientReference(ref)) {
      setPageState('error');
      setErrorMessage('The transaction reference in the URL is missing or in an unrecognized format.');
      return;
    }

    try {
      const res = await verifyPaystackPayment(ref);

      if (res.verified && res.payment) {
        setPayment(res.payment);
        setPageState('success');
      } else if (res.code === 'PAYMENT_NOT_SUCCESSFUL' || res.status === 400) {
        // Payment was recorded as failed or abandoned by Paystack
        setPageState('failed');
        setErrorMessage(
          res.error || 'Payment could not be completed on Paystack. Your card or bank was not charged.'
        );
      } else {
        // Temporary server / network / fulfillment verification issue
        setPageState('error');
        setErrorMessage(
          res.error || "We're confirming your payment. Please wait or click retry below."
        );
      }
    } catch (err: any) {
      setPageState('error');
      setErrorMessage(
        cleanErrorMessage(err?.message) || 'A network error occurred while verifying the transaction. Please try again.'
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const rawRef = params.get('reference') || params.get('trxref') || '';
    const rawCourseId = params.get('courseId') || '';
    const isCancelled = params.get('cancelled') === 'true' || params.get('status') === 'cancelled';

    setReference(rawRef);
    setCourseId(rawCourseId);

    if (isCancelled) {
      setPageState('cancelled');
      return;
    }

    if (!rawRef) {
      setPageState('error');
      setErrorMessage('No transaction reference was provided in the callback link.');
      return;
    }

    executeVerification(rawRef);
  }, [executeVerification]);

  const handleRetryVerification = async () => {
    if (!reference) return;
    setIsRetrying(true);
    setPageState('processing');
    await executeVerification(reference);
    setIsRetrying(false);
  };

  const handleCopyRef = () => {
    const textToCopy = payment?.reference || reference;
    if (textToCopy && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#070314] text-white flex flex-col justify-between pt-28 sm:pt-32 pb-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto w-full">
        {/* Top Academy Admissions Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Vixora Academy Admissions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Tuition Payment Status
          </h1>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* STATE 1: PROCESSING                                               */}
        {/* ------------------------------------------------------------------ */}
        {pageState === 'processing' && (
          <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900 border border-purple-900/40 text-center space-y-4 shadow-2xl">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              We&apos;re confirming your payment. Please wait...
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
              Our admissions server is securely communicating with the Paystack network to verify your transaction and activate your academy cohort enrollment.
            </p>
            {reference && (
              <div className="pt-2 font-mono text-[11px] text-purple-300 bg-neutral-950/80 py-2 px-4 rounded-xl border border-neutral-800 inline-block">
                Reference: {reference}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STATE 2: SUCCESS                                                  */}
        {/* ------------------------------------------------------------------ */}
        {pageState === 'success' && payment && (
          <div className="rounded-3xl bg-neutral-900 border border-emerald-500/50 overflow-hidden shadow-2xl shadow-emerald-950/40">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-purple-950/80 p-6 sm:p-8 border-b border-emerald-900/40 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Payment Confirmed!</h2>
              <p className="text-xs text-emerald-300 font-mono mt-1">
                Official Tuition Receipt &bull; Paystack Verified
              </p>
            </div>

            {/* Receipt Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-5 rounded-2xl bg-neutral-950/90 border border-neutral-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                  <span className="text-neutral-400">Reference:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">{payment.reference}</span>
                    <button
                      type="button"
                      onClick={handleCopyRef}
                      className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
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
                  <span className="text-white font-semibold font-sans">
                    {payment.studentName || 'Academy Student'}
                  </span>
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
                  <span className="text-neutral-200 capitalize font-sans">{payment.channel || 'Online Gateway'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Enrollment Status:</span>
                  <span className="text-emerald-400 font-sans font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled &amp; Reserved
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href={getWhatsAppUrl(
                    'ng',
                    `Hello Vixora Admissions! I have successfully paid my tuition of ${payment.currency} ${payment.amount.toLocaleString()} for ${payment.courseTitle} on Paystack. Reference: ${payment.reference}. Email: ${payment.studentEmail}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Join Admissions WhatsApp Cohort Desk</span>
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>

                  {onNavigateToPortal ? (
                    <button
                      type="button"
                      onClick={onNavigateToPortal}
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

                <div className="text-center pt-2">
                  {onNavigateHome ? (
                    <button
                      type="button"
                      onClick={onNavigateHome}
                      className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      &larr; Return to Academy Homepage
                    </button>
                  ) : (
                    <a href="/pages/academy" className="text-xs text-neutral-400 hover:text-white transition-colors">
                      &larr; Return to Academy Homepage
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STATE 3: USER CANCELLED                                           */}
        {/* ------------------------------------------------------------------ */}
        {pageState === 'cancelled' && (
          <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900 border border-amber-900/50 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Payment was cancelled.</h2>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
                You cancelled the checkout session before completing the payment. No funds were debited, and no enrollment was created.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              {courseId ? (
                <a
                  href={`/academy/${courseId}`}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <span>Try Again</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              ) : (
                <a
                  href="/pages/academy"
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <span>Try Again</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}

              {onNavigateHome ? (
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="py-3 px-5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  Back to Academy
                </button>
              ) : (
                <a
                  href="/pages/academy"
                  className="py-3 px-5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all"
                >
                  Back to Academy
                </a>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STATE 4: PAYMENT FAILED                                           */}
        {/* ------------------------------------------------------------------ */}
        {pageState === 'failed' && (
          <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900 border border-rose-900/50 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Payment could not be completed.</h2>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
                {errorMessage || 'The payment gateway was unable to complete the transaction. Your bank may have declined the charge, or the session expired.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              {courseId ? (
                <a
                  href={`/academy/${courseId}`}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <span>Try Again</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              ) : (
                <a
                  href="/pages/academy"
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <span>Try Again</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}

              <a
                href={getWhatsAppUrl(
                  'ng',
                  `Hello Vixora Admissions! My payment could not be completed via Paystack (Reference: ${reference || 'N/A'}). I would like assistance with enrolling.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <span>Admissions WhatsApp Desk</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STATE 5: VERIFICATION ERROR / PENDING RETRY                        */}
        {/* ------------------------------------------------------------------ */}
        {pageState === 'error' && (
          <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900 border border-neutral-800 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 text-neutral-300 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Payment Verification Status</h2>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
                {errorMessage || "We're confirming your payment. Please wait or click below to retry verification."}
              </p>
              {reference && (
                <div className="pt-1 font-mono text-[11px] text-neutral-400">
                  Transaction Reference: <span className="text-amber-400">{reference}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              {reference && (
                <button
                  type="button"
                  onClick={handleRetryVerification}
                  disabled={isRetrying}
                  className="py-3 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                  <span>{isRetrying ? 'Retrying...' : 'Retry Verification'}</span>
                </button>
              )}

              <a
                href={getWhatsAppUrl(
                  'ng',
                  `Hello Vixora Admissions, I am verifying my Paystack payment for reference: ${reference || 'N/A'}. Could you please check on the status?`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <span>Admissions WhatsApp Desk</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {onNavigateHome ? (
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="py-3 px-5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  Back to Academy
                </button>
              ) : (
                <a
                  href="/pages/academy"
                  className="py-3 px-5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all"
                >
                  Back to Academy
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-neutral-400 mt-8 font-mono">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Vixora Academy Admissions &bull; Paystack Certified Integration &bull; 256-bit SSL Security
        </span>
      </div>
    </div>
  );
}
