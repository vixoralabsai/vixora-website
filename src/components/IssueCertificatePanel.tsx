import React, { useState, useEffect } from 'react';
import { Certificate, EmailDispatchLog } from '../data/academyPortalData';
import { getAdminToken } from '../services/adminAuthService';
import { 
  Send, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Eye, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw,
  X,
  FileCode,
  ExternalLink
} from 'lucide-react';

interface IssueCertificatePanelProps {
  onCertificateIssued?: (newCert: Certificate) => void;
}

export const IssueCertificatePanel: React.FC<IssueCertificatePanelProps> = ({
  onCertificateIssued
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'issue' | 'outbox'>('issue');

  // Form State
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [courseTitle, setCourseTitle] = useState('Autonomous AI Systems & Scalable Architecture');
  const [specialization, setSpecialization] = useState('Multi-Agent LLM Pipelines & Cloud Orchestration');
  const [grade, setGrade] = useState('High Distinction');
  const [honors, setHonors] = useState('Top 5% Cohort Mastery');
  const [capstoneTitle, setCapstoneTitle] = useState('');
  const [capstoneScore, setCapstoneScore] = useState('98.0 / 100');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    certificate: Certificate;
    emailLog: EmailDispatchLog;
    delivery?: any;
  } | null>(null);

  // Outbox logs state
  const [emailLogs, setEmailLogs] = useState<EmailDispatchLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [selectedPreviewLog, setSelectedPreviewLog] = useState<EmailDispatchLog | null>(null);
  const [emailConfig, setEmailConfig] = useState<{ isConfigured: boolean; provider: string } | null>(null);

  const predefinedCourses = [
    {
      title: 'Machine Learning & Data Science',
      spec: 'Predictive Modeling, Scikit-Learn & Feature Engineering',
      defaultCap: 'End-to-End Predictive Machine Learning Pipeline & Model Deployment'
    },
    {
      title: 'Autonomous AI Systems & Scalable Architecture',
      spec: 'Multi-Agent LLM Pipelines & Cloud Orchestration',
      defaultCap: 'Self-Healing Enterprise Support & Document Intelligence Swarm'
    },
    {
      title: 'Data Analytics & Business Intelligence Mastery',
      spec: 'Advanced SQL, Automated ETL & Predictive Dashboards',
      defaultCap: 'Predictive Multi-Tenant Revenue Forecasting & Churn Diagnostics'
    },
    {
      title: 'AI Digital Skills & Freelance Agency Systems',
      spec: 'Autonomous Client Workflows, Copywriting & Media Automation',
      defaultCap: 'Automated Real Estate Lead Qualification & Video Prospecting Pipeline'
    },
    {
      title: 'Enterprise Full-Stack Cloud Engineering',
      spec: 'High-Throughput Node.js, React 19 & Distributed Microservices',
      defaultCap: 'Scalable Real-Time Collaborative Canvas & API Gateway'
    }
  ];

  const handleSelectPreset = (preset: typeof predefinedCourses[0]) => {
    setCourseTitle(preset.title);
    setSpecialization(preset.spec);
    if (!capstoneTitle) {
      setCapstoneTitle(preset.defaultCap);
    }
  };

  const handleIssueAndSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentEmail.trim() || !courseTitle.trim()) {
      setErrorMessage('Please fill in Student Name, Graduate Email, and Program Track.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessResult(null);

    try {
      const token = await getAdminToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/certificates/issue', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          studentName: studentName.trim(),
          studentEmail: studentEmail.trim(),
          courseTitle: courseTitle.trim(),
          specialization: specialization.trim(),
          grade: grade.trim(),
          honors: honors.trim(),
          capstoneTitle: capstoneTitle.trim() || 'Comprehensive Enterprise Project Defense',
          capstoneScore: capstoneScore.trim(),
          competencies: [
            'Autonomous AI Tool Use & System Architecture',
            'Cloud Infrastructure Hardening & Containerization',
            'Full-Stack Data Engineering & API Deployment',
            'Real-Time Monitoring, Governance & Security'
          ]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to issue certificate. Rate limit may apply.');
      } else {
        setSuccessResult({
          certificate: data.certificate,
          emailLog: data.emailLog,
          delivery: data.delivery
        });
        if (onCertificateIssued) {
          onCertificateIssued(data.certificate);
        }
        fetchLogs();
      }
    } catch (err: any) {
      setErrorMessage('Network error while issuing credential.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const token = await getAdminToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/certificates/email-logs', { headers });
      const data = await res.json();
      if (data.logs) {
        setEmailLogs(data.logs);
      }
      if (data.config) {
        setEmailConfig(data.config);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'outbox') {
      fetchLogs();
    }
  }, [activeSubTab]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border border-purple-100 shadow-sm p-6 sm:p-8">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#000048] tracking-tight">
            Academic Certificate Dispatch Center
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Issue cryptographically certified diplomas and automatically dispatch official confirmation emails
          </p>
        </div>

        <div className="flex items-center bg-neutral-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('issue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'issue'
                ? 'bg-white text-[#000048] shadow-xs'
                : 'text-neutral-600 hover:text-[#000048]'
            }`}
          >
            Issue & Send Email
          </button>
          <button
            onClick={() => setActiveSubTab('outbox')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'outbox'
                ? 'bg-white text-[#000048] shadow-xs'
                : 'text-neutral-600 hover:text-[#000048]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Outbox</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'issue' ? (
        <div>
          {/* Rate Limiting Advisory */}
          <div className="mb-6 p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between text-xs text-[#000048]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#7000F8]" />
              <span>
                <strong>Automated Dispatch Engine:</strong> Verified credentials automatically generate HTML emails embedded with the official Vixora Academy logo.
              </span>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-lg bg-purple-200/60 font-mono text-[11px] font-bold text-purple-900">
              Rate Protected
            </span>
          </div>

          {/* Preset Quick Select */}
          <div className="mb-5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
              Quick Program Track Presets:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {predefinedCourses.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectPreset(c)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    courseTitle === c.title
                      ? 'border-[#7000F8] bg-purple-50/50 ring-1 ring-[#7000F8]'
                      : 'border-neutral-200 hover:border-purple-300 hover:bg-neutral-50'
                  }`}
                >
                  <div className="text-xs font-bold text-[#000048] truncate">{c.title}</div>
                  <div className="text-[11px] text-neutral-500 truncate">{c.spec}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleIssueAndSendEmail} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-1.5">
                  Graduate Full Name *
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Maya Lin Harrison"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-sm text-[#000048] focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#000048]">
                    Graduate Email (Auto-Recipient) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setStudentEmail('vixoralabsai@gmail.com')}
                    className="text-[11px] font-semibold text-[#7000F8] hover:underline"
                  >
                    Use vixoralabsai@gmail.com
                  </button>
                </div>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="e.g. graduate@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-sm text-[#000048] focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-1.5">
                  Program Track Title *
                </label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-sm text-[#000048] focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-1.5">
                  Specialization Field
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-sm text-[#000048] focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-1.5">
                  Graduation Grade
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-sm text-[#000048] focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                >
                  <option value="High Distinction">High Distinction</option>
                  <option value="Distinction">Distinction</option>
                  <option value="Merit Standing">Merit Standing</option>
                  <option value="Certified Graduate">Certified Graduate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-1.5">
                  Honors Citation
                </label>
                <input
                  type="text"
                  value={honors}
                  onChange={(e) => setHonors(e.target.value)}
                  placeholder="e.g. Top 5% Global Cohort"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-sm text-[#000048] focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-1.5">
                  Capstone Score
                </label>
                <input
                  type="text"
                  value={capstoneScore}
                  onChange={(e) => setCapstoneScore(e.target.value)}
                  placeholder="e.g. 98.5 / 100"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-sm font-mono text-[#000048] focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#000048] mb-1.5">
                Capstone Project Title
              </label>
              <input
                type="text"
                value={capstoneTitle}
                onChange={(e) => setCapstoneTitle(e.target.value)}
                placeholder="e.g. Multi-Tenant Enterprise Agent Orchestrator with RAG"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-[#FCFCFF] text-sm text-[#000048] focus:outline-none focus:ring-2 focus:ring-[#7000F8]"
              />
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between text-xs text-[#000048]">
              <div className="flex items-center gap-2">
                <img
                  src="/images/vixora-academy-logo.jpg"
                  alt="Vixora Academy"
                  className="w-7 h-7 rounded-lg object-contain bg-white p-0.5 border border-purple-100"
                />
                <span>
                  <strong>Academic Authority:</strong> Dean Sarumi Hammad (Dean, Vixora Academy)
                </span>
              </div>
              <span className="text-[11px] text-[#7000F8] font-mono font-bold">Official Seal Attached</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#000048] via-[#480878] to-[#7000F8] hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Issuing & Dispatching Email...' : 'Issue Certificate & Automatically Send Email to Graduate'}</span>
            </button>
          </form>

          {/* Success Card */}
          {successResult && (
            <div className="mt-6 p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-[#000048] animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-sm text-emerald-950">
                        Certificate Issued & Pipeline Executed!
                      </h3>
                      {successResult.delivery?.deliveredToInternet ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {successResult.delivery?.provider === 'resend' ? 'Resend API Sent' : 'Live SMTP Sent'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 font-bold text-[10px] uppercase tracking-wider">
                          Logged in Outbox
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-900 mt-1">
                      Credential <strong>{successResult.certificate.id}</strong> was registered. 
                      {successResult.delivery?.deliveredToInternet
                        ? ` Direct email delivery to ${successResult.certificate.studentEmail} succeeded.`
                        : ` Confirmation email is compiled in the Outbox. Send directly to their personal inbox with 1 click below:`}
                    </p>

                    {/* Quick Delivery Actions */}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <a
                        href={successResult.delivery?.gmailComposeUrl || `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(successResult.certificate.studentEmail)}&su=${encodeURIComponent(`Official Academic Credential: ${successResult.certificate.courseTitle}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Send to Inbox via Gmail (1-Click)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        type="button"
                        onClick={() => setSelectedPreviewLog(successResult.emailLog)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#000048] bg-white border border-neutral-200 hover:bg-neutral-100 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect HTML Email</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Outbox Logs Tab */
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Recent Automated Email Deliveries ({emailLogs.length})
            </span>
            <button
              onClick={fetchLogs}
              disabled={loadingLogs}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#000048] hover:bg-neutral-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {emailLogs.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-xs">
              No emails dispatched yet. Issue a certificate to trigger the automated delivery pipeline.
            </div>
          ) : (
            <div className="space-y-2.5">
              {emailLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl border border-neutral-200 hover:border-purple-300 bg-[#FCFCFF] hover:bg-purple-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-[#7000F8] flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[#000048] flex items-center gap-2 flex-wrap">
                        <span>{log.recipientName}</span>
                        <span className="font-mono text-[11px] text-neutral-500">&lt;{log.recipientEmail}&gt;</span>
                      </div>
                      <div className="text-neutral-500 text-[11px] truncate max-w-md mt-0.5">
                        {log.subject}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {log.deliveredToInternet ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {log.provider === 'resend' ? 'Resend API' : 'SMTP'} ({log.deliveryLatencyMs}ms)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        <Clock className="w-2.5 h-2.5" />
                        Outbox Logged
                      </span>
                    )}

                    {log.gmailComposeUrl && (
                      <a
                        href={log.gmailComposeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1"
                        title="Open in Gmail to deliver immediately"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Gmail</span>
                      </a>
                    )}

                    <button
                      onClick={() => setSelectedPreviewLog(log)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#000048] bg-white border border-neutral-200 hover:bg-neutral-100 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Inspect rendered HTML email"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rendered Email Preview Modal */}
      {selectedPreviewLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-purple-100">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#000048] text-white flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                  Automated Graduate Email Preview
                </div>
                <div className="text-sm font-semibold truncate max-w-lg mt-0.5">
                  To: {selectedPreviewLog.recipientName} ({selectedPreviewLog.recipientEmail})
                </div>
              </div>
              <button
                onClick={() => setSelectedPreviewLog(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Body Iframe / Sandbox */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#F7F7FC]">
              <div className="bg-white rounded-xl shadow-xs border border-neutral-200 overflow-hidden">
                <iframe
                  title="Rendered Graduate Email"
                  srcDoc={selectedPreviewLog.previewHtml}
                  className="w-full h-[540px] border-0"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
              <span className="font-mono">Message ID: {selectedPreviewLog.id}</span>
              <div className="flex items-center gap-2">
                {selectedPreviewLog.gmailComposeUrl && (
                  <a
                    href={selectedPreviewLog.gmailComposeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send via Gmail (1-Click)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <button
                  onClick={() => setSelectedPreviewLog(null)}
                  className="px-4 py-1.5 rounded-xl font-bold text-xs text-[#000048] bg-neutral-200 hover:bg-neutral-300 transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
