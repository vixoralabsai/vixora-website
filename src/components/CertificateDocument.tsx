import React, { useState } from 'react';
import { Certificate, generateCertificateEmailText } from '../data/academyPortalData';
import { 
  Download, 
  Printer, 
  Share2, 
  Mail, 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  ExternalLink,
  Award,
  Sparkles,
  QrCode,
  Check,
  X,
  AlertCircle,
  Send,
  HelpCircle,
  FileText
} from 'lucide-react';

interface CertificateDocumentProps {
  certificate: Certificate;
  onSendEmail?: (certId: string, email: string) => Promise<{
    success: boolean;
    message?: string;
    remaining?: number;
    delivery?: any;
    emailLog?: any;
  }>;
  isSendingEmail?: boolean;
}

export const CertificateDocument: React.FC<CertificateDocumentProps> = ({
  certificate,
  onSendEmail,
  isSendingEmail = false
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  // Email modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [targetRecipientEmail, setTargetRecipientEmail] = useState(certificate.studentEmail);
  const [serverDeliveryResult, setServerDeliveryResult] = useState<{
    deliveredToInternet: boolean;
    provider?: string;
    message?: string;
    messageId?: string;
    error?: string;
    gmailComposeUrl?: string;
    mailtoUrl?: string;
  } | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(certificate.verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(certificate.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleCopyPlainText = () => {
    const text = generateCertificateEmailText(certificate);
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Plain-text and direct email URLs
  const emailText = generateCertificateEmailText(certificate);
  const emailSubject = `Official Verification: ${certificate.studentName} - Vixora Academy Certificate of Completion`;
  const directGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    targetRecipientEmail || certificate.studentEmail
  )}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailText)}`;
  const directMailtoUrl = `mailto:${encodeURIComponent(
    targetRecipientEmail || certificate.studentEmail
  )}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailText)}`;

  const handleTriggerServerSend = async () => {
    if (!onSendEmail) return;
    const emailToUse = targetRecipientEmail.trim() || certificate.studentEmail;
    setEmailStatus('Dispatching certificate email via server...');
    setServerDeliveryResult(null);

    try {
      const res = await onSendEmail(certificate.id, emailToUse);
      if (res.success) {
        if (res.delivery?.deliveredToInternet) {
          setEmailStatus(`Live email delivered via SMTP to ${emailToUse}`);
          setServerDeliveryResult({
            deliveredToInternet: true,
            provider: res.delivery.provider,
            message: res.message,
            messageId: res.delivery.messageId
          });
        } else {
          setEmailStatus(`Email rendered and logged in Outbox. Click "Open in Gmail" for 1-click delivery.`);
          setServerDeliveryResult({
            deliveredToInternet: false,
            provider: 'simulated',
            message: res.message,
            gmailComposeUrl: res.delivery?.gmailComposeUrl || directGmailUrl,
            mailtoUrl: res.delivery?.mailtoUrl || directMailtoUrl
          });
        }
      } else {
        setEmailStatus(res.message || 'Rate limit reached or send failed.');
        setServerDeliveryResult({
          deliveredToInternet: false,
          error: res.message
        });
      }
    } catch (e: any) {
      setEmailStatus('Error communicating with mail service.');
      setServerDeliveryResult({
        deliveredToInternet: false,
        error: e?.message || 'Network error'
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Action Toolbar */}
      <div className="w-full max-w-4xl mb-4 flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-purple-100 shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Credential
          </span>
          <span className="text-xs font-mono font-bold text-[#000048] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
            ID: {certificate.id}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleCopyId}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl text-[#000048] bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copy Certificate ID"
          >
            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
            <span>{copiedId ? 'Copied ID' : 'Copy ID'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl text-[#000048] bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copy Public Verification Link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-neutral-500" />}
            <span>{copiedLink ? 'Link Copied' : 'Share Link'}</span>
          </button>

          <a
            href={`/api/certificates/${certificate.id}/pdf`}
            download={`Vixora-Academy-Certificate-${certificate.id}.pdf`}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Download Official PDF Certificate (Print-Ready A4)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </a>

          <button
            onClick={() => {
              setTargetRecipientEmail(certificate.studentEmail);
              setIsEmailModalOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-[#480878] to-[#7000F8] hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Send certificate via Email with PDF attachment"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send Email &rarr;</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-white bg-[#000048] hover:bg-[#000030] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Print or Save as High-Res PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {emailStatus && (
        <div className="w-full max-w-4xl mb-3 px-4 py-2.5 rounded-xl text-xs font-medium bg-purple-50 text-[#480878] border border-purple-200 flex items-center justify-between gap-2 animate-in fade-in duration-150 print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7000F8] shrink-0" />
            <span>{emailStatus}</span>
          </div>
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="text-[11px] font-bold underline hover:text-[#7000F8] shrink-0"
          >
            View Email Options
          </button>
        </div>
      )}

      {/* Email Delivery Options Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden text-[#000048]">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#000048] via-[#480878] to-[#7000F8] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base">Certificate Email Dispatch Gateway</h3>
                  <p className="text-xs text-purple-200">Send credential to {certificate.studentName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Recipient Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Recipient Email Address
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={targetRecipientEmail}
                    onChange={(e) => setTargetRecipientEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium focus:ring-2 focus:ring-[#7000F8] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setTargetRecipientEmail('vixoralabsai@gmail.com')}
                    className="px-2.5 py-2 rounded-xl text-[11px] font-bold bg-purple-50 text-[#7000F8] border border-purple-200 hover:bg-purple-100 transition-colors whitespace-nowrap"
                    title="Fill user email vixoralabsai@gmail.com"
                  >
                    Use vixoralabsai@gmail.com
                  </button>
                </div>
              </div>

              {/* PDF Attachment Notice */}
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#000048]">
                  <FileText className="w-4 h-4 text-[#7000F8] shrink-0" />
                  <span>
                    <strong>Official PDF Attachment:</strong> Vixora-Academy-Certificate-{certificate.id}.pdf
                  </span>
                </div>
                <a
                  href={`/api/certificates/${certificate.id}/pdf`}
                  download={`Vixora-Academy-Certificate-${certificate.id}.pdf`}
                  className="px-3 py-1 text-[11px] font-bold rounded-xl bg-white text-[#7000F8] border border-purple-200 hover:bg-purple-100 flex items-center gap-1 shrink-0"
                >
                  <Download className="w-3 h-3" />
                  <span>Save PDF</span>
                </a>
              </div>

              {/* Delivery Advisory Status */}
              {serverDeliveryResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs ${
                    serverDeliveryResult.deliveredToInternet
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {serverDeliveryResult.deliveredToInternet ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="font-bold">
                        {serverDeliveryResult.deliveredToInternet
                          ? `Live Email Transmitted via ${serverDeliveryResult.provider?.toUpperCase()}!`
                          : 'Email Rendered in Local Outbox (SMTP Not Configured)'}
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90">
                        {serverDeliveryResult.deliveredToInternet
                          ? `Official certificate email successfully delivered to ${targetRecipientEmail}. Message ID: ${serverDeliveryResult.messageId || 'OK'}`
                          : `Because external SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS or RESEND_API_KEY) are not set in the container environment, live internet delivery didn't reach your external inbox. Use 1-Click Gmail below to send it directly!`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dispatch Action Options */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                  Delivery Methods
                </span>

                {/* 1-Click Gmail Compose (Instant, 100% Reliable to any inbox) */}
                <a
                  href={directGmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm flex items-center justify-between transition-all shadow-md group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Send Directly via Gmail (1-Click)</div>
                      <div className="text-[11px] text-red-100 font-normal">
                        Pre-fills subject, graduate capstone, credentials & verification URL
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* Server SMTP / Automated Pipeline */}
                {onSendEmail && (
                  <button
                    onClick={handleTriggerServerSend}
                    disabled={isSendingEmail}
                    className="w-full p-3.5 rounded-2xl border border-neutral-200 hover:border-purple-300 bg-neutral-50 hover:bg-purple-50/50 transition-colors flex items-center justify-between text-xs font-bold text-[#000048] cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <Send className="w-4 h-4 text-[#7000F8]" />
                      <div className="text-left">
                        <div>Trigger Background Server Dispatch</div>
                        <div className="text-[11px] font-normal text-neutral-500">
                          Attempts SMTP transport & logs to Outbox registry
                        </div>
                      </div>
                    </div>
                    <span className="text-purple-700 font-semibold">
                      {isSendingEmail ? 'Dispatching...' : 'Run &rarr;'}
                    </span>
                  </button>
                )}

                {/* Native Email Client (mailto:) */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={directMailtoUrl}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-200 hover:border-neutral-300 text-neutral-700 hover:text-[#000048] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Default Mail App (mailto:)</span>
                  </a>

                  <button
                    onClick={handleCopyPlainText}
                    className="py-2.5 px-3 rounded-xl border border-neutral-200 hover:border-neutral-300 text-neutral-700 hover:text-[#000048] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
              </div>

              {/* SMTP Configuration Instructions Accordion */}
              <div className="border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowConfigHelp(!showConfigHelp)}
                  className="w-full flex items-center justify-between text-xs font-bold text-neutral-500 hover:text-[#7000F8] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Why was the email not delivered to my inbox automatically?
                  </span>
                  <span>{showConfigHelp ? '−' : '+'}</span>
                </button>

                {showConfigHelp && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-2 animate-in fade-in">
                    <p>
                      In container sandbox environments, automated email transmission across the public internet requires real SMTP or Resend credentials.
                    </p>
                    <div className="font-mono text-[11px] bg-white p-2.5 rounded-xl border border-neutral-200 text-[#000048] space-y-1">
                      <div># Add in Settings → Secrets:</div>
                      <div>SMTP_HOST=smtp.gmail.com</div>
                      <div>SMTP_PORT=587</div>
                      <div>SMTP_USER=your_email@gmail.com</div>
                      <div>SMTP_PASS=your_gmail_app_password</div>
                      <div># Or: RESEND_API_KEY=re_xxxxxxxxx</div>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Without SMTP credentials, you can always click <strong>Send via Gmail (1-Click)</strong> above to immediately send the official credential from your personal or work Gmail!
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* The Printable / High-Res Certificate Canvas */}
      <div 
        id="vixora-official-certificate"
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden text-[#000048] relative print:shadow-none print:m-0 print:w-full print:max-w-none print:rounded-none"
        style={{
          boxShadow: '0 20px 60px -15px rgba(0, 0, 72, 0.15)',
        }}
      >
        {/* Decorative Outer Border Frame */}
        <div className="p-4 sm:p-7 bg-[#FFFFFF] border-[8px] sm:border-[12px] border-[#000048] relative">
          
          {/* Inner Gold Filigree Border */}
          <div className="p-3 sm:p-5 border-2 border-[#D97706]/70 relative">
            
            {/* Fine Violet Accent Border */}
            <div className="p-6 sm:p-10 border border-[#7000F8]/30 relative bg-[#FCFCFF]">
              
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#D97706]" />
              <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#D97706]" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#D97706]" />
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#D97706]" />

              {/* Watermark Background Seal */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.035] flex items-center justify-center overflow-hidden"
                style={{
                  backgroundImage: `url('/images/vixora-academy-logo.jpg')`,
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '480px auto',
                }}
              />

              {/* Certificate Header */}
              <div className="flex flex-col items-center text-center relative z-10">
                {/* Official Vixora Academy Emblem */}
                <div className="mb-4 flex items-center justify-center">
                  <div className="p-2.5 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                    <img 
                      src="/images/vixora-academy-logo.jpg" 
                      alt="Vixora Academy" 
                      className="h-16 sm:h-20 w-auto object-contain"
                    />
                  </div>
                </div>

                <div className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] text-[#7000F8] mb-1">
                  Vixora Academy Global Directorate
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-[#000048] tracking-tight uppercase font-serif">
                  Certificate of Completion & Mastery
                </h1>
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mt-1">
                  Cloud Engineering, Autonomous Systems & Artificial Intelligence
                </div>

                <div className="w-28 h-0.5 bg-gradient-to-r from-transparent via-[#D97706] to-transparent my-4" />
              </div>

              {/* Recipient Statement */}
              <div className="text-center my-4 sm:my-6 relative z-10">
                <p className="text-xs sm:text-sm text-neutral-600 italic">
                  This official academic credential is systematically conferred upon
                </p>

                <div className="my-3 sm:my-4">
                  <span className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#000048] tracking-tight border-b-2 border-[#7000F8]/40 pb-1 px-4 sm:px-8 inline-block">
                    {certificate.studentName}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed">
                  having demonstrated exceptional dedication, high-level analytical rigor, and successfully defended the production capstone for the specialization in:
                </p>

                <div className="mt-3">
                  <div className="text-lg sm:text-2xl font-black text-[#480878] tracking-tight">
                    {certificate.courseTitle}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-[#7000F8] mt-0.5">
                    Specialization: {certificate.specialization}
                  </div>
                </div>
              </div>

              {/* Honors & Capstone Defense */}
              <div className="my-6 sm:my-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto relative z-10">
                <div className="p-3 sm:p-4 rounded-xl bg-white border border-purple-100 shadow-2xs text-center">
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Conferred Honors & Grade
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-[#000048] mt-1 flex items-center justify-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>{certificate.grade}</span>
                  </div>
                  {certificate.honors && (
                    <div className="text-[11px] text-[#7000F8] font-semibold mt-0.5">
                      {certificate.honors}
                    </div>
                  )}
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-white border border-purple-100 shadow-2xs text-center">
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Defended Capstone Defense
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#000048] mt-1 truncate" title={certificate.capstoneTitle}>
                    {certificate.capstoneTitle}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-600 font-bold mt-0.5">
                    Evaluation: {certificate.capstoneScore}
                  </div>
                </div>
              </div>

              {/* Competencies Checklist */}
              <div className="my-4 sm:my-6 p-4 rounded-xl bg-neutral-50/80 border border-neutral-200/80 max-w-2xl mx-auto relative z-10">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#000048] mb-2 text-center">
                  Demonstrated Production Competencies
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-700">
                  {certificate.competencies.map((comp, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight">{comp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatures & Seal Section */}
              <div className="mt-8 sm:mt-12 pt-6 border-t border-neutral-200/80 grid grid-cols-3 items-end gap-3 text-center relative z-10">
                
                {/* Dean Signature */}
                <div>
                  <div className="h-10 sm:h-12 flex items-center justify-center">
                    <span className="font-serif italic text-base sm:text-xl text-[#000048] font-semibold border-b border-neutral-400 pb-0.5 px-3">
                      {certificate.directorName || 'Sarumi Hammad'}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-[#000048] mt-1">
                    {certificate.directorName || 'Sarumi Hammad'}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-neutral-500 leading-tight">
                    {certificate.directorTitle || 'Dean, Vixora Academy'}
                  </div>
                </div>

                {/* Central Gold Seal */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#D97706] bg-gradient-to-tr from-amber-50 to-white flex flex-col items-center justify-center p-1 shadow-sm relative">
                    <div className="w-full h-full rounded-full border border-dashed border-[#D97706]/70 flex flex-col items-center justify-center text-center">
                      <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#D97706]" />
                      <span className="text-[7px] sm:text-[8px] font-black uppercase text-[#000048] tracking-widest mt-0.5">
                        OFFICIAL SEAL
                      </span>
                    </div>
                  </div>
                  <div className="text-[9px] font-mono font-bold text-neutral-400 mt-1">
                    {certificate.issueDate}
                  </div>
                </div>

                {/* Lead Instructor Signature */}
                <div>
                  <div className="h-10 sm:h-12 flex items-center justify-center">
                    <span className="font-serif italic text-base sm:text-xl text-[#480878] font-semibold border-b border-neutral-400 pb-0.5 px-3">
                      {certificate.instructorName}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-[#000048] mt-1">
                    {certificate.instructorName}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-neutral-500 leading-tight">
                    {certificate.instructorTitle}
                  </div>
                </div>

              </div>

              {/* Bottom Metadata & Cryptographic Hash Footer */}
              <div className="mt-8 pt-4 border-t border-neutral-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-neutral-500 relative z-10">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#7000F8]" />
                  <div>
                    <div><strong>Credential ID:</strong> <span className="font-mono text-[#000048] font-bold">{certificate.id}</span></div>
                    <div><strong>Security Hash:</strong> <span className="font-mono text-[9px]">{certificate.credentialHash.slice(0, 24)}...</span></div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-emerald-700 font-bold flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Tamper-Evident Digital Credential
                  </div>
                  <div>Verify online at: <span className="font-mono text-[#7000F8] underline">{certificate.verificationUrl}</span></div>
                  <div className="text-[9px] text-neutral-400 mt-0.5">Vixora Academy • All Rights Reserved</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: #000048 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          nav, footer, .print\\:hidden {
            display: none !important;
          }
          #vixora-official-certificate {
            width: 100% !important;
            max-width: none !important;
            border: none !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};
