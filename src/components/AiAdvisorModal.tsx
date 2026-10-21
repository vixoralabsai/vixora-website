import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  X, 
  Send, 
  ArrowRight, 
  Bot, 
  User, 
  Building2, 
  GraduationCap, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Loader2,
  Terminal
} from 'lucide-react';
import { ACADEMY_COURSES, AcademyCourse } from '../data/vixoraContent';

export interface SuggestedAction {
  label: string;
  actionType: 'navigate_course' | 'enroll_course' | 'start_project' | 'whatsapp_consultation';
  target?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  category?: 'business' | 'academy' | 'general';
  suggestedActions?: SuggestedAction[];
  timestamp: string;
}

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProjectModal: () => void;
  onNavigateToCourse: (courseSlug: string) => void;
  onEnrollCourse: (course: AcademyCourse) => void;
}

const STARTER_PROMPTS = [
  {
    icon: GraduationCap,
    label: 'Which course should I take to earn in 90 days?',
    track: 'academy' as const
  },
  {
    icon: Building2,
    label: 'What AI tools can automate my customer support on WhatsApp?',
    track: 'business' as const
  },
  {
    icon: Terminal,
    label: 'Tell me about the ₦10,000 AI Content Creation sprint.',
    track: 'academy' as const
  },
  {
    icon: Building2,
    label: 'How much does custom web & mobile software cost to build?',
    track: 'business' as const
  }
];

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({
  isOpen,
  onClose,
  onOpenProjectModal,
  onNavigateToCourse,
  onEnrollCourse
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<'all' | 'business' | 'academy'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when modal opens & fetch quota status
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      fetchQuotaStatus();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchQuotaStatus = async () => {
    try {
      const res = await fetch('/api/ai/advisor/status');
      if (res.ok) {
        const data = await res.json();
        if (typeof data.remaining === 'number') {
          setRemainingQuota(data.remaining);
        }
      }
    } catch {
      // Ignore background network status errors
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const messageToSend = (customPrompt || inputMessage).trim();
    if (!messageToSend || isLoading) return;

    setInputMessage('');
    setErrorMessage(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build conversation history for context
      const history = messages.slice(-5).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          conversationHistory: history,
          track: selectedTrack
        })
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to receive advice from AI Advisor.');
      }

      if (responseData.quota?.remaining !== undefined) {
        setRemainingQuota(responseData.quota.remaining);
      }

      const advisorReply = responseData.data;

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: advisorReply.reply || 'Here is your recommendation.',
        category: advisorReply.category,
        suggestedActions: advisorReply.suggestedActions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('[AI Advisor Client Error]:', err);
      setErrorMessage(err?.message || 'The AI Advisor is temporarily resting. Please try again or reach out on WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: SuggestedAction) => {
    if (action.actionType === 'start_project') {
      onClose();
      onOpenProjectModal();
    } else if (action.actionType === 'navigate_course') {
      const slug = action.target || 'ai-image-short-videos-creation';
      onClose();
      onNavigateToCourse(slug);
    } else if (action.actionType === 'enroll_course') {
      const targetSlug = action.target || '';
      const course = ACADEMY_COURSES.find(c => c.slug === targetSlug || c.id === targetSlug) || ACADEMY_COURSES[0];
      onClose();
      onEnrollCourse(course);
    } else if (action.actionType === 'whatsapp_consultation') {
      const encodedText = encodeURIComponent(`Hello Vixora Team, I spoke with your AI Advisor and would like to discuss a project consultation.`);
      window.open(`https://wa.me/12792574850?text=${encodedText}`, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-advisor-title"
      data-theme="dark"
      className="fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 modal-dark"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl h-[90vh] max-h-[720px] bg-[#070A1E] text-white border border-purple-500/30 rounded-3xl shadow-[0_24px_64px_rgba(0,0,72,0.9)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 modal-dark"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing Top Hairline */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#7000F8] via-[#9030F8] to-[#10B981]" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/15 flex items-center justify-between shrink-0 bg-[#0B0F2A] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7000F8] to-[#480878] text-white flex items-center justify-center shadow-lg shadow-purple-900/50 border border-purple-400/30">
              <Bot className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="ai-advisor-title" className="text-sm sm:text-base font-black text-white tracking-tight">
                  Vixora Advisory Engine
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                  ● Active
                </span>
              </div>
              <p className="text-xs text-purple-200 font-medium">
                Systems Architecture &amp; Course Track Selector
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {remainingQuota !== null && (
              <span className="hidden sm:inline-block text-xs font-mono font-bold text-purple-200 bg-white/10 border border-white/15 px-2.5 py-1 rounded-lg">
                {remainingQuota} queries left
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              aria-label="Close Advisor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Track Filter Segmented Control */}
        <div className="px-4 py-2.5 bg-[#090D24] border-b border-white/10 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <span className="text-xs font-mono uppercase text-purple-200 tracking-wider shrink-0 font-bold">
            Advisory Focus:
          </span>
          <div className="inline-flex p-1 bg-white/10 rounded-xl border border-white/15 gap-1">
            <button
              onClick={() => setSelectedTrack('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedTrack === 'all'
                  ? 'bg-[#7000F8] text-white shadow-md'
                  : 'text-purple-200 hover:text-white hover:bg-white/10'
              }`}
            >
              All Topics
            </button>
            <button
              onClick={() => setSelectedTrack('business')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTrack === 'business'
                  ? 'bg-[#7000F8] text-white shadow-md'
                  : 'text-purple-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Business & AI</span>
            </button>
            <button
              onClick={() => setSelectedTrack('academy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTrack === 'academy'
                  ? 'bg-[#7000F8] text-white shadow-md'
                  : 'text-purple-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academy Cohorts</span>
            </button>
          </div>
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#070A1E]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center max-w-md mx-auto space-y-6 py-6">
              <div className="w-16 h-16 rounded-3xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-xl">
                <Bot className="w-8 h-8 text-purple-300" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-black text-white tracking-tight">
                  How can Vixora help you today?
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  Ask anything about architecting custom AI software, building automated WhatsApp workflows, or selecting the highest-income academy track.
                </p>
              </div>

              {/* Starter Prompts */}
              <div className="w-full space-y-2.5 text-left">
                <div className="text-xs font-mono uppercase text-purple-300 font-bold px-1">
                  Suggested Questions:
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {STARTER_PROMPTS.map((prompt, idx) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedTrack(prompt.track);
                          handleSendMessage(prompt.label);
                        }}
                        className="p-3.5 rounded-2xl bg-[#0F1535] hover:bg-[#161F4D] border border-purple-500/30 hover:border-purple-400/70 text-left transition-all flex items-center justify-between group cursor-pointer shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-purple-600/30 text-purple-200 shrink-0 border border-purple-500/40">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs sm:text-sm text-white font-bold">
                            {prompt.label}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-purple-300 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-xl bg-purple-900/60 border border-purple-400/40 flex items-center justify-center text-purple-200 shrink-0 mt-1 shadow-sm">
                      <Bot className="w-4 h-4 text-purple-300" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#5B0898] to-[#7000F8] text-white shadow-lg border border-purple-400/50'
                        : 'bg-[#0E1333] border border-purple-500/30 text-slate-100 shadow-xl'
                    }`}
                  >
                    <div className="font-sans leading-relaxed text-slate-100">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-base font-black text-white mt-3 mb-1.5">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-black text-white mt-3 mb-1.5">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-xs font-bold text-purple-200 mt-2.5 mb-1 tracking-wide">{children}</h3>,
                          p: ({ children }) => <p className="text-xs sm:text-sm text-slate-100 leading-relaxed mb-2 last:mb-0 font-normal">{children}</p>,
                          strong: ({ children }) => <strong className="font-black text-white">{children}</strong>,
                          ul: ({ children }) => <ul className="space-y-1.5 my-2 pl-4 list-disc text-slate-200 text-xs sm:text-sm">{children}</ul>,
                          ol: ({ children }) => <ol className="space-y-1.5 my-2 pl-4 list-decimal text-slate-200 text-xs sm:text-sm">{children}</ol>,
                          li: ({ children }) => <li className="text-slate-200 leading-relaxed">{children}</li>,
                          code: ({ children }) => <code className="bg-[#1C1238] border border-purple-400/50 text-purple-200 px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold">{children}</code>,
                          blockquote: ({ children }) => <blockquote className="border-l-2 border-purple-400 pl-3 italic text-purple-200 my-2">{children}</blockquote>
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>

                    {/* Interactive Suggested Action Buttons */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="pt-3 border-t border-white/15 flex flex-wrap gap-2">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleActionClick(action)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white border border-purple-400/50 transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <span>{action.label}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="text-[10px] text-purple-200 text-right font-mono font-semibold pt-1">
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-purple-600 border border-purple-400 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming / Typing Indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-8 h-8 rounded-xl bg-purple-900/60 border border-purple-400/40 flex items-center justify-center text-purple-200 shrink-0">
                    <Loader2 className="w-4 h-4 text-purple-300 animate-spin" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#0E1333] border border-purple-500/30 text-xs sm:text-sm text-slate-200 flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="font-mono text-xs text-purple-200 font-semibold">
                      Architecting recommendation...
                    </span>
                  </div>
                </div>
              )}

              {/* Error Callout */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-xs sm:text-sm text-rose-100 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">{errorMessage}</p>
                    <button
                      onClick={() => handleSendMessage()}
                      className="text-xs underline text-rose-300 hover:text-white cursor-pointer font-mono font-bold"
                    >
                      Retry request
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-[#090D24] border-t border-white/15 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about a custom software build or tech course..."
              disabled={isLoading}
              maxLength={2000}
              style={{ color: '#FFFFFF', backgroundColor: '#0F1535' }}
              className="flex-1 bg-[#0F1535] text-white border border-purple-500/40 focus:border-purple-300 focus:ring-1 focus:ring-purple-300 rounded-2xl px-4 py-3 text-xs sm:text-sm placeholder:text-slate-400 outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-3 rounded-2xl bg-gradient-to-r from-[#7000F8] to-[#9030F8] hover:opacity-95 disabled:bg-white/10 disabled:text-neutral-500 text-white transition-all shadow-md shadow-purple-900/40 cursor-pointer disabled:cursor-not-allowed shrink-0"
              aria-label="Send message"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs text-slate-300 px-2 pt-2 font-mono">
            <span>Powered by Gemini 3.8 Intelligence</span>
            <span>Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
