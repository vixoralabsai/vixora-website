import React, { useState } from 'react';
import { Check, ShieldCheck, ArrowRight, Building2, CreditCard, ChevronDown, ChevronUp, Lock, Sparkles, MessageCircle } from 'lucide-react';
import { AcademyCourse } from '../../data/vixoraContent';
import { getWhatsAppUrl } from '../../data/brandConfig';
import { BankPaymentDetailsCard } from '../BankPaymentDetailsCard';
import { StickerLabel, TactileButton } from './CourseVisualDecorations';

interface CoursePricingSectionProps {
  course: AcademyCourse;
  onEnroll: () => void;
  pricing: {
    early: string;
    standard: string;
    savings: string;
    currency: string;
  };
}

export const CoursePricingSection: React.FC<CoursePricingSectionProps> = ({
  course,
  onEnroll,
  pricing
}) => {
  const [showBankDetails, setShowBankDetails] = useState(false);

  const valueItems = [
    "Full live cohort curriculum & interactive code labs",
    "Direct weekly 1-on-1 code reviews & mentorship sessions",
    "Real-world capstone portfolio project defense",
    "Lifetime access to session recordings & updated resources",
    "Official Vixora Academy Certificate with verifiable online ID",
    "Private alumni Slack & WhatsApp network for job referrals",
    "Resume, LinkedIn & technical portfolio positioning guide"
  ];

  return (
    <section id="pricing" className="bg-[#0F1535] text-white border-b-2 border-[#1A1D4F] py-20 lg:py-28 relative overflow-hidden text-left">
      {/* Decorative ambient background glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#5B5FED]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#FFC107]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Section Header */}
        <div className="space-y-3 mb-12">
          <StickerLabel color="bg-[#FFC107]" textColor="text-[#1A1D4F]" rotate={0}>
            Cohort Tuition &amp; Enrollment
          </StickerLabel>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            Invest in Career-Defining Mastery.
          </h2>
          <p className="text-base text-slate-300 max-w-xl mx-auto">
            Transparent pricing with zero hidden fees. Includes all software templates, live instruction, mentorship, and certification.
          </p>
        </div>

        {/* Tactile Neo-Brutalist Pricing Card */}
        <div className="bg-white text-[#1A1D4F] border-2 border-[#1A1D4F] shadow-retro-xl rounded-3xl p-7 sm:p-10 max-w-2xl mx-auto text-left relative">
          
          {/* Top Cohort Urgency Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b-2 border-[#1A1D4F]/10">
            <span className="text-xs font-black uppercase text-[#5B5FED] tracking-wider">
              Next Cohort: {course.nextCohortDate}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-black bg-[#FFF6EC] border border-[#FF8A65] text-[#FF8A65] rounded-full">
              Only {course.seatsRemaining} spots available
            </span>
          </div>

          {/* Pricing Header */}
          <div className="py-6 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="font-display font-black text-4xl sm:text-5xl text-[#1A1D4F] tracking-tight">
                {pricing.early}
              </span>
              <span className="text-lg sm:text-xl text-slate-500 line-through font-bold">
                {pricing.standard}
              </span>
              <span className="px-2 py-0.5 text-xs font-black bg-[#D1F2D9] text-[#10B981] border border-[#10B981] rounded-md">
                {pricing.savings}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {course.tuitionNote || 'One-time investment covering entire cohort, live labs, and lifetime alumni community access.'}
            </p>
          </div>

          {/* Primary Paystack Action Button */}
          <div className="pt-2 pb-6">
            <TactileButton
              variant="primary"
              size="lg"
              onClick={onEnroll}
              className="w-full text-center"
            >
              <span>Enroll Now with Paystack ({course.tuition})</span>
              <ArrowRight className="w-5 h-5" />
            </TactileButton>
            <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-700 mt-3">
              <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-[#10B981]" /> Paystack 256-Bit SSL</span>
              <span>·</span>
              <span>Instant Access</span>
              <span>·</span>
              <span>Debit Card / Transfer</span>
            </div>
          </div>

          {/* Value Stack Checklist */}
          <div className="pt-6 border-t-2 border-[#1A1D4F]/10 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-[#1A1D4F]/60 mb-2">
              Everything Included in Your Tuition:
            </div>
            {valueItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-[#1A1D4F]">
                <div className="w-4 h-4 rounded-full bg-[#D1F2D9] border border-[#10B981] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-[#10B981] stroke-[3]" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Alternative Bank Payment Accordion */}
          <div className="mt-8 pt-6 border-t-2 border-[#1A1D4F]/10">
            <button
              onClick={() => setShowBankDetails(!showBankDetails)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#1A1D4F] hover:text-[#5B5FED] p-3 bg-[#F8F9FE] border border-[#1A1D4F]/20 rounded-xl cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#5B5FED]" />
                Need Direct Bank Transfer or Employer Invoice?
              </span>
              {showBankDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showBankDetails && (
              <div className="mt-4 animate-in fade-in duration-200">
                <BankPaymentDetailsCard
                  courseTitle={course.title}
                  tuitionAmount={course.tuition}
                  onPayOnline={() => onEnroll()}
                />
              </div>
            )}
          </div>

          {/* Reassurance Guarantee Footer */}
          <div className="mt-6 pt-5 border-t border-[#1A1D4F]/10 flex items-center justify-between text-xs text-[#1A1D4F]/70">
            <span className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" /> 100% Satisfaction Guarantee
            </span>
            <a
              href={getWhatsAppUrl(`Hello Vixora, I have questions about tuition for ${course.title}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#5B5FED] hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Admissions Desk
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
