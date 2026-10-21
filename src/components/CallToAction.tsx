import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { WhatsAppContactButton } from './WhatsAppContactButton';

interface CallToActionProps {
  onOpenProjectModal: () => void;
}

export function CallToAction({ onOpenProjectModal }: CallToActionProps) {
  return (
    <section className="py-24 bg-[#F7F7FC] relative overflow-hidden border-t border-[#E5E5F0]">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#480878]/5 to-[#F7F7FC] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#9030F8]/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-8 sm:p-14 rounded-3xl bg-white border border-[#E5E5F0] shadow-xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#480878]/5 border border-[#480878]/15 text-[#480878]">
            <Sparkles className="w-3.5 h-3.5 text-[#9030F8]" />
            <span>Ready to Scale Your Digital Infrastructure?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#000048] tracking-tight leading-tight max-w-3xl mx-auto" style={{ color: '#000048' }}>
            Let’s Build Your Next Competitive Advantage
          </h2>

          <p className="text-base sm:text-lg text-[#5F6078] max-w-2xl mx-auto" style={{ color: '#475569' }}>
            Whether you need software, AI automation, high-converting media, or practical training, Vixora is ready to help you build, improve, and grow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={onOpenProjectModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-bold bg-[#480878] hover:bg-[#7000F8] text-white shadow-xl shadow-[#480878]/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Start Your Project Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <WhatsAppContactButton
              variant="secondary"
              label="Instant WhatsApp Discussion (US & Nigeria)"
              message="Hello Vixora Hub Engineering Team, I would like to schedule a project consultation."
              className="w-full sm:w-auto"
            />
          </div>

          <div className="pt-6 border-t border-[#E5E5F0] flex flex-wrap items-center justify-center gap-6 text-xs text-[#5F6078]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9030F8]" />
              <span>100% Code & IP Ownership</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9030F8]" />
              <span>Guaranteed Milestone Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9030F8]" />
              <span>24/7 Post-Launch Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
