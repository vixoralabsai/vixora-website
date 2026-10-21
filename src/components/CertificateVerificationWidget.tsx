import React, { useState } from 'react';
import { Certificate } from '../data/academyPortalData';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Award, 
  Calendar, 
  GraduationCap, 
  FileText,
  UserCheck,
  Download
} from 'lucide-react';

interface CertificateVerificationWidgetProps {
  onViewCertificate?: (cert: Certificate) => void;
  prefillId?: string;
}

export const CertificateVerificationWidget: React.FC<CertificateVerificationWidgetProps> = ({
  onViewCertificate,
  prefillId = ''
}) => {
  const [certId, setCertId] = useState(prefillId || 'VA-2026-9042-ENG');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedResult, setVerifiedResult] = useState<{
    verified: boolean;
    certificate: Certificate;
    issuer: string;
    verificationMethod: string;
    verifiedAt: string;
  } | null>(null);

  const sampleCertificates = [
    { id: 'VA-2026-9042-ENG', name: 'David Okonjo (AI Systems)' },
    { id: 'VA-2026-8812-AUT', name: 'Alex Chen (Data Analytics)' },
    { id: 'VA-2026-7731-DEV', name: 'Sarah Jenkins (AI Freelancing)' },
  ];

  const handleVerify = async (idToVerify?: string) => {
    const target = (idToVerify || certId).trim().toUpperCase();
    if (!target) {
      setError('Please enter a Certificate Credential ID (e.g. VA-2026-9042-ENG).');
      return;
    }

    setLoading(true);
    setError(null);
    setVerifiedResult(null);

    try {
      const response = await fetch(`/api/certificates/verify/${encodeURIComponent(target)}`);
      const data = await response.json();

      if (!response.ok || !data.verified) {
        setError(data.error || `Certificate ID '${target}' could not be verified in the Vixora registry.`);
      } else {
        setVerifiedResult(data);
      }
    } catch (err: any) {
      setError('Network error contacting Vixora Academy Verification Gateway. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl border border-purple-100 shadow-sm p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-4">
        <div className="p-1.5 bg-white rounded-2xl border border-purple-100 shadow-xs shrink-0">
          <img
            src="/images/vixora-academy-logo.jpg"
            alt="Vixora Academy"
            className="w-12 h-12 rounded-xl object-contain"
          />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#000048] tracking-tight">
            Vixora Credential Verification Portal
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Cryptographic authenticity verification for official Vixora Academy diplomas and certifications
          </p>
        </div>
      </div>

      {/* Input Box */}
      <div className="mt-5">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-2">
          Enter Certificate Credential ID
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value.toUpperCase())}
              placeholder="e.g. VA-2026-9042-ENG"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-sm font-mono font-bold text-[#000048] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#7000F8] focus:border-transparent transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
          </div>
          <button
            onClick={() => handleVerify()}
            disabled={loading}
            className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#000048] via-[#480878] to-[#7000F8] hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
            <span>{loading ? 'Verifying Registry...' : 'Verify Credential'}</span>
          </button>
        </div>
      </div>

      {/* Public Registry Examples */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
        <span className="font-semibold text-neutral-600">Registry Examples:</span>
        {sampleCertificates.map((sample) => (
          <button
            key={sample.id}
            onClick={() => {
              setCertId(sample.id);
              handleVerify(sample.id);
            }}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-purple-100 text-[#000048] font-mono text-[11px] font-semibold border border-neutral-200 hover:border-purple-300 transition-colors cursor-pointer"
          >
            {sample.id}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Verification Failed</div>
            <div className="mt-0.5">{error}</div>
            <div className="mt-1 text-[11px] text-rose-700">
              Ensure you have typed the exact Credential ID, including the prefix (e.g. VA-2026-XXXX).
            </div>
          </div>
        </div>
      )}

      {/* Verified Success Result Card */}
      {verifiedResult && (
        <div className="mt-6 p-6 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 text-[#000048] animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-emerald-800">
                  Status: Officially Verified
                </div>
                <div className="text-lg font-black text-[#000048]">
                  {verifiedResult.certificate.studentName}
                </div>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white text-emerald-800 border border-emerald-300 shadow-xs">
              ID: {verifiedResult.certificate.id}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-neutral-500 font-semibold block">Program Conferred:</span>
              <span className="text-sm font-bold text-[#000048] block mt-0.5">
                {verifiedResult.certificate.courseTitle}
              </span>
              <span className="text-neutral-500 mt-1 block">
                Specialization: {verifiedResult.certificate.specialization}
              </span>
            </div>

            <div>
              <span className="text-neutral-500 font-semibold block">Academic Standing & Honors:</span>
              <span className="text-sm font-bold text-purple-900 block mt-0.5">
                {verifiedResult.certificate.grade}
              </span>
              <span className="text-neutral-600 mt-1 block">
                {verifiedResult.certificate.honors || 'Official Graduate'}
              </span>
            </div>

            <div>
              <span className="text-neutral-500 font-semibold block">Issue & Completion Date:</span>
              <span className="text-xs font-bold text-[#000048] block mt-0.5">
                {verifiedResult.certificate.issueDate}
              </span>
              <span className="text-neutral-500 text-[11px]">Lifetime Validity</span>
            </div>

            <div>
              <span className="text-neutral-500 font-semibold block">Production Capstone Defense:</span>
              <span className="text-xs font-semibold text-[#000048] block mt-0.5">
                {verifiedResult.certificate.capstoneTitle}
              </span>
              {verifiedResult.certificate.capstoneScore && (
                <span className="text-emerald-700 font-bold text-[11px]">
                  Score: {verifiedResult.certificate.capstoneScore}
                </span>
              )}
            </div>

            <div>
              <span className="text-neutral-500 font-semibold block">Academic Directorate & Dean:</span>
              <span className="text-xs font-bold text-[#000048] block mt-0.5">
                Dean Sarumi Hammad
              </span>
              <span className="text-neutral-500 text-[11px]">
                Dean, Vixora Academy
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-neutral-500">
              Cryptographic Hash: <span className="font-mono text-neutral-700">{verifiedResult.certificate.credentialHash.slice(0, 28)}...</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`/api/certificates/${verifiedResult.certificate.id}/pdf`}
                download={`Vixora-Academy-Certificate-${verifiedResult.certificate.id}.pdf`}
                className="px-3.5 py-2 text-xs font-bold rounded-xl text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Download verified PDF certificate"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Download Official PDF</span>
              </a>

              {onViewCertificate && (
                <button
                  onClick={() => onViewCertificate(verifiedResult.certificate)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-[#000048] hover:bg-[#480878] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Open Certificate View</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
