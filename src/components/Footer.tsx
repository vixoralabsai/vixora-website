import { useState } from 'react';
import {
  Mail,
  Phone,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { COMPANY_CONTACT } from '../data/vixoraContent';
import { BRAND_CONFIG } from '../data/brandConfig';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onOpenDriveWorkspace: () => void;
  onOpenProjectModal: () => void;
  onNavigate: (page: string, sectionId?: string, courseSlug?: string, customPath?: string) => void;
}

export function Footer({ onOpenDriveWorkspace, onOpenProjectModal, onNavigate }: FooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer id="contact" className="bg-[#05020F] border-t border-purple-900/30 text-neutral-300 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Top Tier: Company Info & Direct Communication Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-purple-900/20">
          {/* Brand & Mission */}
          <div className="lg:col-span-4 space-y-4">
            <button
              onClick={() => onNavigate('home', undefined, undefined, '/')}
              className="flex items-center gap-3 text-left cursor-pointer group"
            >
              <BrandLogo size="md" />
            </button>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-sm">
              The digital headquarters for custom software engineering, autonomous AI workflows, high-converting media buying, and executive technical education.
            </p>

            {/* Direct Contact Links */}
            <div className="space-y-2 pt-2 text-xs">
              <a
                href={`mailto:${COMPANY_CONTACT.email}`}
                className="flex items-center gap-2.5 text-slate-200 hover:text-purple-300 transition-colors"
              >
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{COMPANY_CONTACT.email}</span>
              </a>

              <div className="pt-1 space-y-1.5 border-t border-neutral-800/80">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-semibold block">
                  Direct WhatsApp Inbound Lines:
                </span>

                {/* US & Global Line */}
                <a
                  href={BRAND_CONFIG.whatsapp.defaultUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2 text-emerald-400 hover:text-emerald-300 transition-colors group"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                      US &amp; Global Inbounds
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {BRAND_CONFIG.whatsapp.usAndGlobal.displayNumber}
                    </span>
                  </div>
                </a>

                {/* Nigeria Line */}
                <a
                  href={`https://wa.me/${BRAND_CONFIG.whatsapp.nigeria.cleanDigits}?text=Hello%20Vixora%20Digital%20Hub%20Team%2C%20I%20would%20like%20to%20discuss%20a%20new%20project.`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2 text-emerald-400 hover:text-emerald-300 transition-colors group"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                      Nigeria Inbounds
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {BRAND_CONFIG.whatsapp.nigeria.displayNumber}
                      <span className="text-slate-300 font-normal text-[10px] ml-1">
                        ({BRAND_CONFIG.whatsapp.nigeria.fullInternationalNumber})
                      </span>
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Platform Pages
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                <li><button onClick={() => onNavigate('home', undefined, undefined, '/')} className="hover:text-white transition-colors cursor-pointer">Home</button></li>
                <li><button onClick={() => onNavigate('dashboard', undefined, undefined, '/pages/dashboard')} className="text-amber-300 hover:text-amber-200 font-semibold transition-colors cursor-pointer flex items-center gap-1"><span>Client Portal</span> <span className="text-[9px] bg-amber-950 px-1.5 py-0.2 rounded border border-amber-500/40 text-amber-300">Live</span></button></li>
                <li><button onClick={() => onNavigate('about', undefined, undefined, '/pages/about')} className="hover:text-white transition-colors cursor-pointer">About Us</button></li>
                <li><button onClick={() => onNavigate('portfolio', undefined, undefined, '/pages/portfolio')} className="hover:text-white transition-colors cursor-pointer">Portfolio & Work</button></li>
                <li><button onClick={() => onNavigate('pages-directory', undefined, undefined, '/pages')} className="text-purple-300 hover:text-white transition-colors cursor-pointer">Pages Directory (/pages)</button></li>
                <li><button onClick={() => onNavigate('categories', undefined, undefined, '/categories')} className="text-purple-300 hover:text-white transition-colors cursor-pointer">Taxonomy (/categories)</button></li>
                <li><button onClick={onOpenProjectModal} className="hover:text-purple-400 text-purple-300 font-semibold transition-colors cursor-pointer">Book Consultation</button></li>
              </ul>
            </div>

            {/* Solutions */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Our Solutions
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                <li><button onClick={() => onNavigate('home', 'solutions', undefined, '/#solutions')} className="hover:text-white transition-colors cursor-pointer text-left">Website Development</button></li>
                <li><button onClick={() => onNavigate('home', 'solutions', undefined, '/#solutions')} className="hover:text-white transition-colors cursor-pointer text-left">Software Development</button></li>
                <li><button onClick={() => onNavigate('home', 'solutions', undefined, '/#solutions')} className="hover:text-white transition-colors cursor-pointer text-left">AI & Automation</button></li>
                <li><button onClick={() => onNavigate('home', 'solutions', undefined, '/#solutions')} className="hover:text-white transition-colors cursor-pointer text-left">Digital Marketing</button></li>
                <li><button onClick={() => onNavigate('home', 'solutions', undefined, '/#solutions')} className="hover:text-white transition-colors cursor-pointer text-left">Creative & Branding</button></li>
              </ul>
            </div>

            {/* Academy & Training */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Academy Programs
                </h4>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-950 text-purple-300 border border-purple-800/40">
                  Cohorts
                </span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                <li><button onClick={() => onNavigate('academy-course', undefined, 'data-analysis-cohort', '/academy/data-analysis-cohort')} className="hover:text-white transition-colors cursor-pointer text-left">Data Analysis Cohort</button></li>
                <li><button onClick={() => onNavigate('academy-course', undefined, 'ai-automation-digital-business-systems', '/academy/ai-automation-digital-business-systems')} className="hover:text-white transition-colors cursor-pointer text-left">AI Automation Systems</button></li>
                <li><button onClick={() => onNavigate('academy-course', undefined, 'complete-ai-digital-skills-freelancing-mastery', '/academy/complete-ai-digital-skills-freelancing-mastery')} className="hover:text-white transition-colors cursor-pointer text-left">AI Skills & Freelance</button></li>
                <li><button onClick={() => onNavigate('academy-course', undefined, 'ai-native-product-design-ui-ux', '/academy/ai-native-product-design-ui-ux')} className="hover:text-white transition-colors cursor-pointer text-left">AI Product Design & UI/UX</button></li>
                <li><button onClick={() => onNavigate('academy', undefined, undefined, '/pages/academy')} className="hover:text-purple-300 text-purple-400 font-semibold transition-colors cursor-pointer text-left">All Academy Programs &rarr;</button></li>
              </ul>
            </div>

            {/* Knowledge & Taxonomy */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Taxonomy & Posts
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                <li><button onClick={() => onNavigate('categories', undefined, undefined, '/categories/ai-automation')} className="hover:text-white transition-colors cursor-pointer text-left">AI & Automation</button></li>
                <li><button onClick={() => onNavigate('categories', undefined, undefined, '/categories/software-engineering')} className="hover:text-white transition-colors cursor-pointer text-left">Software Engineering</button></li>
                <li><button onClick={() => onNavigate('categories', undefined, undefined, '/categories/growth-marketing')} className="hover:text-white transition-colors cursor-pointer text-left">Growth & Media Buying</button></li>
                <li><button onClick={() => onNavigate('categories', undefined, undefined, '/categories/branding-design')} className="hover:text-white transition-colors cursor-pointer text-left">Branding & Product Design</button></li>
                <li><button onClick={onOpenDriveWorkspace} className="text-purple-300 hover:text-white font-medium transition-colors cursor-pointer text-left flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  <span>Drive PRD Hub</span>
                </button></li>
                <li><button onClick={() => onNavigate('resources', undefined, undefined, '/pages/resources')} className="hover:text-white transition-colors cursor-pointer text-left">Resources & Whitepapers</button></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter & Sub-Footer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
          <div className="lg:col-span-6 space-y-2">
            <h4 className="text-sm font-bold text-white">
              Subscribe to Vixora Engineering Dispatches
            </h4>
            <p className="text-xs text-slate-200">
              Bi-weekly briefings on generative AI, autonomous agent design patterns, and enterprise scalability.
            </p>
          </div>

          <div className="lg:col-span-6">
            {newsletterSubscribed ? (
              <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Thank you for subscribing! You will receive our next dispatch.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your work email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-purple-900/40 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-purple-900/20 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-4">
          <p>© {new Date().getFullYear()} Vixora Digital Hub. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Security Overview</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
