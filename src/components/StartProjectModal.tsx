import { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Send,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  ExternalLink,
  LayoutDashboard,
  Globe,
  PhoneCall
} from 'lucide-react';
import { BRAND_CONFIG, getWhatsAppUrl } from '../data/brandConfig';
import { createProjectFromConsultation, setClientAuthSession } from '../services/clientProjectService';

interface StartProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDashboard?: () => void;
}

export function StartProjectModal({ isOpen, onClose, onNavigateToDashboard }: StartProjectModalProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(['Software Development']);
  const [budgetRange, setBudgetRange] = useState<string>('$5,000 - $15,000');
  const [timeline, setTimeline] = useState<string>('4 - 8 Weeks');
  const [industry, setIndustry] = useState<string>('Healthcare');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    description: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdAccessCode, setCreatedAccessCode] = useState<string>('');
  const [showWhatsAppOptions, setShowWhatsAppOptions] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const serviceOptions = [
    'Software Development',
    'AI Automation & Agents',
    'AI Chatbots & RAG',
    'Website Development',
    'SaaS Product Architecture',
    'Branding & UI/UX Design',
    'Media Buying & UGC Ads',
    'Vixora Academy / Corporate Training'
  ];

  const budgetOptions = [
    'Under $5,000 (Sprint MVP)',
    '$5,000 - $15,000 (Growth Platform)',
    '$15,000 - $35,000 (Full Enterprise System)',
    '$35,000+ (Multi-Tenant Swarm Ecosystem)'
  ];

  const timelineOptions = [
    'Immediate (1-3 Weeks)',
    'Standard (4-8 Weeks)',
    'Quarterly Roadmap (2-4 Months)',
    'Ongoing Retainer / Dedicated Pod'
  ];

  const toggleService = (svc: string) => {
    if (selectedServices.includes(svc)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s !== svc));
      }
    } else {
      setSelectedServices([...selectedServices, svc]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newProj = createProjectFromConsultation({
        clientName: formData.name,
        clientEmail: formData.email,
        company: formData.company,
        phone: formData.phone,
        services: selectedServices,
        budgetRange,
        timeline,
        description: formData.description
      });
      setCreatedAccessCode(newProj.accessCode);

      // Auto-set session for immediate seamless dashboard access
      setClientAuthSession({
        clientName: newProj.clientName,
        clientEmail: newProj.clientEmail,
        company: newProj.company,
        accessCode: newProj.accessCode,
        authenticatedVia: 'access_code',
        loginTime: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to register project consultation:', err);
    }
    setIsSubmitted(true);
  };


  const getWhatsAppMessageText = () => {
    return `Hello Vixora Hub Team!%0A%0AI would like to start a project:%0A- Name: ${encodeURIComponent(
      formData.name || 'Client'
    )}%0A- Company: ${encodeURIComponent(
      formData.company || 'Not Specified'
    )}%0A- Services: ${encodeURIComponent(
      selectedServices.join(', ')
    )}%0A- Industry: ${encodeURIComponent(
      industry
    )}%0A- Budget: ${encodeURIComponent(
      budgetRange
    )}%0A- Timeline: ${encodeURIComponent(
      timeline
    )}%0A- Description: ${encodeURIComponent(
      formData.description || 'Discussing project scope.'
    )}`;
  };

  const generateWhatsAppUrl = (channel: 'us' | 'ng') => {
    const rawText = `Hello Vixora Hub Team!\n\nI would like to start a project:\n- Name: ${
      formData.name || 'Client'
    }\n- Company: ${
      formData.company || 'Not Specified'
    }\n- Services: ${
      selectedServices.join(', ')
    }\n- Industry: ${industry}\n- Budget: ${budgetRange}\n- Timeline: ${timeline}\n- Scope: ${
      formData.description || 'Discussing project requirements.'
    }`;
    return getWhatsAppUrl(channel, rawText);
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultation-modal-title"
      data-theme="dark"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 modal-dark"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-[#0C061F] border border-purple-900/40 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-neutral-100 overflow-hidden modal-dark">
        {/* Glow ambient background inside modal */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 blur-[90px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 blur-[90px] pointer-events-none -z-10" />

        {/* Prominent Header Close Button */}
        <button
          id="close-consultation-modal-btn"
          type="button"
          onClick={onClose}
          aria-label="Close consultation modal"
          title="Close (Esc)"
          className="absolute top-5 right-5 z-20 p-2.5 rounded-xl bg-neutral-900/90 hover:bg-purple-950 text-neutral-400 hover:text-white border border-purple-900/30 hover:border-purple-500/50 transition-all cursor-pointer shadow-md group"
        >
          <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-10 space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-white">
              Consultation Request Received!
            </h3>

            <p className="text-sm text-neutral-300 max-w-md mx-auto">
              Thank you, <strong className="text-white">{formData.name || 'valued client'}</strong>. A Vixora Senior Technology Strategist will review your scope and contact you within 4 business hours.
            </p>

            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-purple-900/30 max-w-md mx-auto text-left text-xs space-y-2">
              {createdAccessCode && (
                <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-600/40 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-purple-300">Your Project Access Code:</div>
                    <div className="text-base font-mono font-black text-amber-300 tracking-wider">{createdAccessCode}</div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    Live Tracked
                  </span>
                </div>
              )}
              <div className="font-mono text-neutral-400">
                Selected Scope: <span className="text-purple-300 font-semibold">{selectedServices.join(', ')}</span>
              </div>
              <div className="font-mono text-neutral-400">
                Timeline: <span className="text-white font-semibold">{timeline}</span>
              </div>
              <div className="font-mono text-neutral-400">
                Budget: <span className="text-emerald-400 font-semibold">{budgetRange}</span>
              </div>
            </div>

            {onNavigateToDashboard && (
              <div className="max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    onClose();
                    onNavigateToDashboard();
                  }}
                  className="w-full py-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Open Project in Client Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}


            <div className="space-y-3 pt-4 max-w-md mx-auto">
              <div className="text-xs font-semibold text-neutral-300 font-mono flex items-center justify-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fast-Track Direct WhatsApp Dispatch:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={generateWhatsAppUrl('us')}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all text-center"
                >
                  <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-white" /> US & Global</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={generateWhatsAppUrl('ng')}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all text-center"
                >
                  <span className="flex items-center gap-1.5"><PhoneCall className="w-3.5 h-3.5 text-white" /> Nigeria Desk (08114542934)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              >
                Done & Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="pr-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/30 uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Book a Strategy Consultation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Start Your Project with Vixora
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Select your required capabilities and brief us on your goals to receive an architectural plan and cost breakdown.
              </p>
            </div>

            {/* Service Multi-Select */}
            <div>
              <label className="block text-xs font-mono text-purple-300 uppercase tracking-wider mb-2.5">
                1. Select Desired Capabilities (Multi-Select)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {serviceOptions.map((svc) => {
                  const isSelected = selectedServices.includes(svc);
                  return (
                    <button
                      type="button"
                      key={svc}
                      onClick={() => toggleService(svc)}
                      className={`p-2.5 rounded-xl text-left text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600/25 border-purple-400 text-purple-200 shadow-sm shadow-purple-500/20'
                          : 'bg-neutral-950/70 border-neutral-800/80 text-neutral-400 hover:text-white hover:border-purple-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-purple-400 animate-pulse' : 'bg-neutral-700'}`} />
                        <span className="line-clamp-1">{svc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget & Timeline Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-2">
                  2. Target Investment Budget
                </label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/90 border border-purple-900/30 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {budgetOptions.map((b) => (
                    <option key={b} value={b} className="bg-neutral-950 text-white">
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-2">
                  3. Desired Launch Timeline
                </label>
                <select
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/90 border border-purple-900/30 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {timelineOptions.map((t) => (
                    <option key={t} value={t} className="bg-neutral-950 text-white">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Client Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/90 border border-purple-900/30 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-neutral-600"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/90 border border-purple-900/30 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-neutral-600"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Company / Organization</label>
                <input
                  type="text"
                  placeholder="Company name or startup idea"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/90 border border-purple-900/30 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-neutral-600"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/90 border border-purple-900/30 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-neutral-600"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs text-neutral-400 mb-1">
                Project Overview & Vision (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe what you want to build, automate, or design..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950/90 border border-purple-900/30 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-neutral-600"
              />
            </div>

            {/* Actions & Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-purple-900/30">
              <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                <span>NDA & Confidentiality Guaranteed</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {/* Cancel / Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowWhatsAppOptions(!showWhatsAppOptions)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {showWhatsAppOptions && (
                    <div className="absolute right-0 bottom-full mb-2 w-72 bg-[#0C061F] border border-emerald-500/40 rounded-2xl p-2.5 shadow-2xl shadow-emerald-950/90 z-30 space-y-1.5 text-xs text-left animate-in fade-in zoom-in-95">
                      <div className="px-2 py-1 text-[11px] font-mono text-neutral-400 border-b border-neutral-800 flex justify-between items-center">
                        <span>Select Inbound Line:</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <a
                        href={generateWhatsAppUrl('us')}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setShowWhatsAppOptions(false)}
                        className="p-2 rounded-xl bg-neutral-900 hover:bg-emerald-950/60 border border-neutral-800 hover:border-emerald-500/40 flex items-center justify-between text-neutral-200 hover:text-white transition-all group"
                      >
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-emerald-400" /> US & Global
                          </div>
                          <div className="text-[10px] font-mono text-emerald-400">
                            {BRAND_CONFIG.whatsapp.usAndGlobal.displayNumber}
                          </div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-emerald-400" />
                      </a>
                      <a
                        href={generateWhatsAppUrl('ng')}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setShowWhatsAppOptions(false)}
                        className="p-2 rounded-xl bg-neutral-900 hover:bg-emerald-950/60 border border-neutral-800 hover:border-emerald-500/40 flex items-center justify-between text-neutral-200 hover:text-white transition-all group"
                      >
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> Nigeria Desk
                          </div>
                          <div className="text-[10px] font-mono text-emerald-400">
                            {BRAND_CONFIG.whatsapp.nigeria.displayNumber}
                          </div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-emerald-400" />
                      </a>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all flex-1 sm:flex-initial justify-center cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
