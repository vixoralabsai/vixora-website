import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Mail,
  MessageSquare,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { BRAND_CONFIG } from '../data/brandConfig';
import { ACADEMY_COURSES } from '../data/vixoraContent';

interface AcademyFooterProps {
  onNavigate: (page: string, sectionId?: string, courseSlug?: string, customPath?: string) => void;
  onOpenCorporateModal?: () => void;
}

export function AcademyFooter({ onNavigate, onOpenCorporateModal }: AcademyFooterProps) {
  return (
    <footer className="bg-[#000030] text-purple-100 border-t border-[#480878]/40 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Main Grid: Clean 3-Column Balanced Arrangement */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-white/10">
          
          {/* Col 1 (5 cols): Identity & Inbound Admissions */}
          <div className="md:col-span-5 space-y-4">
            <button
              onClick={() => onNavigate('academy', undefined, undefined, '/pages/academy')}
              className="flex items-center gap-3 text-left cursor-pointer focus:outline-none"
            >
              <div className="p-2 bg-white rounded-2xl shadow-lg border border-purple-100 flex items-center justify-center">
                <img
                  src={BRAND_CONFIG.academyLogo?.imageUrl || "/images/vixora-academy-logo.png"}
                  alt={BRAND_CONFIG.academyLogo?.altText || "Vixora Academy"}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/vixora-academy-logo.jpg'; }}
                  className="h-10 w-auto max-w-[190px] object-contain rounded-xl"
                />
              </div>
            </button>

            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed max-w-md" style={{ color: '#E9D5FF' }}>
              Rigorous, implementation-first technical training in Autonomous AI, Data Analytics, and Digital Systems under Academic Director Dean <strong className="text-white font-bold" style={{ color: '#FFFFFF' }}>Sarumi Hammad</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs">
              <a
                href={BRAND_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 transition-colors font-semibold"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Admissions: {BRAND_CONFIG.whatsapp.nigeria.displayNumber}</span>
              </a>

              <a
                href={`mailto:${BRAND_CONFIG.email}`}
                className="inline-flex items-center gap-1.5 text-purple-200 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{BRAND_CONFIG.email}</span>
              </a>
            </div>
          </div>

          {/* Col 2 (4 cols): Cohort Programs */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span>Cohort Programs</span>
            </h4>
            <ul className="space-y-2 text-xs">
              {ACADEMY_COURSES.map((course) => (
                <li key={course.id}>
                  <button
                    onClick={() => onNavigate('academy-course', undefined, course.slug, `/academy/${course.slug}`)}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-baseline gap-2 group"
                  >
                    <span className="font-semibold text-purple-200 group-hover:text-white transition-colors">{course.title}</span>
                    <span className="text-[10px] text-purple-400 font-mono shrink-0">({course.duration})</span>
                  </button>
                </li>
              ))}
              <li className="pt-1">
                <button
                  onClick={() => onNavigate('academy', undefined, undefined, '/pages/academy')}
                  className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore All Cohorts</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 (3 cols): Student & Academic Services */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Student Services</span>
            </h4>
            <ul className="space-y-2 text-xs text-purple-200">
              <li>
                <button
                  onClick={() => onNavigate('student-portal', undefined, undefined, '/pages/student-portal')}
                  className="hover:text-white transition-colors cursor-pointer text-left block"
                >
                  Student Portal &amp; LMS
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('certificate-portal', undefined, undefined, '/pages/certificate-portal')}
                  className="hover:text-white transition-colors cursor-pointer text-left block"
                >
                  Verify Certificate ID
                </button>
              </li>
              {onOpenCorporateModal && (
                <li>
                  <button
                    onClick={onOpenCorporateModal}
                    className="hover:text-white transition-colors cursor-pointer text-left text-amber-300/90 hover:text-amber-300"
                  >
                    Corporate Team Training
                  </button>
                </li>
              )}
              <li className="pt-2 border-t border-white/10">
                <a
                  href={BRAND_CONFIG.domain}
                  className="inline-flex items-center gap-1.5 text-purple-300 hover:text-white font-medium transition-colors"
                >
                  <span>Main Agency Platform</span>
                  <ExternalLink className="w-3 h-3 text-purple-400" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Sleek Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-purple-300/80">
          <div>
            &copy; 2026 Vixora Academy &bull; Supervised under Dean <strong className="text-white">Sarumi Hammad</strong>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-emerald-400">{BRAND_CONFIG.cleanAcademyDomain}</span>
            <span className="text-purple-500">&bull;</span>
            <a
              href={BRAND_CONFIG.domain}
              className="text-purple-300 hover:text-white transition-colors"
            >
              {BRAND_CONFIG.cleanDomain}
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
