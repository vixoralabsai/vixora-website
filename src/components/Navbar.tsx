import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  HardDrive,
  LayoutDashboard,
  ShieldCheck,
  Sun,
  Moon,
  Bot,
  Code2,
  Palette,
  Megaphone,
  Video,
  GraduationCap,
  Layers,
  BookOpen,
  Briefcase,
  Users,
  FileText,
  Sparkles,
  Award
} from 'lucide-react';
import { BRAND_CONFIG } from '../data/brandConfig';
import { BrandLogo } from './BrandLogo';
import { useTheme } from '../context/ThemeContext';
import { getAllCategories } from '../data/categoriesData';

interface NavbarProps {
  onOpenProjectModal: () => void;
  onOpenDriveWorkspace: () => void;
  onOpenAiAdvisor?: () => void;
  currentPage: string;
  currentPath?: string;
  onNavigate: (page: string, sectionId?: string, courseSlug?: string, customPath?: string) => void;
}

export function Navbar({
  onOpenProjectModal,
  onOpenDriveWorkspace,
  onOpenAiAdvisor,
  currentPage,
  currentPath = '/',
  onNavigate,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { theme, toggleTheme } = useTheme();

  const categories = getAllCategories();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.nav-dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleMouseEnter = (menuName: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setOpenDropdown(menuName);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  };

  const handleNavClick = (page: string, sectionId?: string, courseSlug?: string, customPath?: string) => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    onNavigate(page, sectionId, courseSlug, customPath);
  };

  const toggleMobileSection = (section: string) => {
    setMobileExpandedSection(mobileExpandedSection === section ? null : section);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#070314]/95 backdrop-blur-md border-b border-purple-900/40 shadow-lg shadow-black/60 py-3'
          : 'bg-[#070314]/90 backdrop-blur-md border-b border-purple-900/20 py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <button
            onClick={() => handleNavClick('home', undefined, undefined, '/')}
            className="flex items-center gap-3 group focus:outline-none cursor-pointer text-left shrink-0"
          >
            <BrandLogo size="md" />
          </button>

          {/* Reduced & Streamlined Desktop Navigation with Subcategories */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 nav-dropdown-container">
            {/* 1. Services & Solutions Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('services')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setOpenDropdown(openDropdown === 'services' ? null : 'services')}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  openDropdown === 'services' || currentPage === 'home' && currentPath.includes('solution')
                    ? 'text-purple-300 bg-purple-950/40'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'
                }`}
              >
                <span>Services</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                    openDropdown === 'services' ? 'rotate-180 text-purple-400' : ''
                  }`}
                />
              </button>

              {openDropdown === 'services' && (
                <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-[#0b0620]/95 border border-purple-900/40 shadow-2xl backdrop-blur-xl p-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-purple-400 border-b border-purple-900/30">
                    Capabilities & Engineering
                  </div>
                  <button
                    onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 shrink-0 mt-0.5">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">Software & Web Platforms</div>
                      <div className="text-[11px] text-neutral-400">Custom React 19, Next.js & FastAPI cloud apps</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20 shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">AI Agents & Workflows</div>
                      <div className="text-[11px] text-neutral-400">Autonomous LLM swarms, n8n & vector RAG</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 group-hover:bg-pink-500/20 shrink-0 mt-0.5">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">Brand Systems & UI/UX</div>
                      <div className="text-[11px] text-neutral-400">Tokenized design systems & Figma prototypes</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 shrink-0 mt-0.5">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">Media Buying & UGC Ads</div>
                      <div className="text-[11px] text-neutral-400">Paid acquisition across Meta, TikTok & Google</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Academy Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('academy')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setOpenDropdown(openDropdown === 'academy' ? null : 'academy')}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  openDropdown === 'academy' || currentPage === 'academy' || currentPage === 'academy-course'
                    ? 'text-purple-300 bg-purple-950/40'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'
                }`}
              >
                <span>Academy</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                    openDropdown === 'academy' ? 'rotate-180 text-purple-400' : ''
                  }`}
                />
              </button>

              {openDropdown === 'academy' && (
                <div className="absolute top-full left-0 mt-2 w-84 rounded-2xl bg-[#0b0620]/95 border border-purple-900/40 shadow-2xl backdrop-blur-xl p-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-purple-400 border-b border-purple-900/30 flex items-center justify-between">
                    <span>Cohort Programs</span>
                    <span className="text-[9px] text-amber-400 font-semibold">Early Bird Active</span>
                  </div>

                  <button
                    onClick={() => handleNavClick('academy', undefined, undefined, '/pages/academy')}
                    className="w-full p-2 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white group-hover:text-purple-300">All Academy Programs</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => handleNavClick('academy-course', undefined, 'data-analysis-cohort', '/academy/data-analysis-cohort')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">Data Analysis Cohort</div>
                      <span className="text-[10px] font-mono text-purple-400">16 Wks</span>
                    </div>
                    <div className="text-[11px] text-neutral-400">Excel, SQL, Power BI & AI Business Dashboards</div>
                  </button>

                  <button
                    onClick={() => handleNavClick('academy-course', undefined, 'ai-automation-digital-business-systems', '/academy/ai-automation-digital-business-systems')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">AI Automation Systems</div>
                      <span className="text-[10px] font-mono text-purple-400">12 Wks</span>
                    </div>
                    <div className="text-[11px] text-neutral-400">Make, n8n, GHL & Client System Monetization</div>
                  </button>

                  <button
                    onClick={() => handleNavClick('academy-course', undefined, 'complete-ai-digital-skills-freelancing-mastery', '/academy/complete-ai-digital-skills-freelancing-mastery')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">AI Digital Skills & Freelance</div>
                      <span className="text-[10px] font-mono text-purple-400">6 Wks</span>
                    </div>
                    <div className="text-[11px] text-neutral-400">Beginner-friendly AI workflows for earning income</div>
                  </button>

                  <div className="pt-2 pb-1 border-t border-purple-900/40">
                    <div className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-purple-300">
                      Credentials & Portals
                    </div>
                  </div>

                  <button
                    onClick={() => handleNavClick('student-portal', undefined, undefined, '/pages/student-portal')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-purple-300">Student Portal</div>
                        <div className="text-[10px] text-neutral-400">Email login & adaptive rate limiting</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-300" />
                  </button>

                  <button
                    onClick={() => handleNavClick('certificate-portal', undefined, undefined, '/pages/certificate-portal')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-purple-300">Certificate Portal</div>
                        <div className="text-[10px] text-neutral-400">Verified credentials & auto-email dispatch</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-300" />
                  </button>
                </div>
              )}
            </div>

            {/* 3. Categories & Posts Dropdown (Permanent Link Taxonomy) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('categories')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setOpenDropdown(openDropdown === 'categories' ? null : 'categories')}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  openDropdown === 'categories' || currentPage === 'categories' || currentPage === 'resources'
                    ? 'text-purple-300 bg-purple-950/40'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'
                }`}
              >
                <span>Categories</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                    openDropdown === 'categories' ? 'rotate-180 text-purple-400' : ''
                  }`}
                />
              </button>

              {openDropdown === 'categories' && (
                <div className="absolute top-full left-0 mt-2 w-88 rounded-2xl bg-[#0b0620]/95 border border-purple-900/40 shadow-2xl backdrop-blur-xl p-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-purple-400 border-b border-purple-900/30 flex items-center justify-between">
                    <span>Taxonomy & Permalinks</span>
                    <span className="text-[9px] text-neutral-400 font-mono">/categories</span>
                  </div>

                  <button
                    onClick={() => handleNavClick('categories', undefined, undefined, '/categories')}
                    className="w-full p-2 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white group-hover:text-purple-300">Browse All Categories</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-400">/categories</span>
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleNavClick('categories', undefined, undefined, `/categories/${cat.slug}`)}
                      className="w-full p-2 rounded-xl hover:bg-purple-950/60 text-left transition-colors group cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-purple-300">{cat.name}</div>
                        <div className="text-[10px] font-mono text-neutral-400">/categories/{cat.slug}</div>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded">
                        {cat.posts.length} posts
                      </span>
                    </button>
                  ))}

                  <div className="pt-2 border-t border-purple-900/30">
                    <button
                      onClick={() => handleNavClick('resources', undefined, undefined, '/pages/resources')}
                      className="w-full p-2 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-medium text-neutral-300 group-hover:text-white">Knowledge Hub & Blueprints</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-300" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Company & Pages Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('company')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => setOpenDropdown(openDropdown === 'company' ? null : 'company')}
                className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  openDropdown === 'company' || ['about', 'portfolio', 'pages-directory'].includes(currentPage)
                    ? 'text-purple-300 bg-purple-950/40'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900/60'
                }`}
              >
                <span>Company</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                    openDropdown === 'company' ? 'rotate-180 text-purple-400' : ''
                  }`}
                />
              </button>

              {openDropdown === 'company' && (
                <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-[#0b0620]/95 border border-purple-900/40 shadow-2xl backdrop-blur-xl p-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-purple-400 border-b border-purple-900/30">
                    Organization & Work
                  </div>

                  <button
                    onClick={() => handleNavClick('about', undefined, undefined, '/pages/about')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center gap-2.5 group cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">About Vixora</div>
                      <div className="text-[10px] text-neutral-400 font-mono">/pages/about</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('portfolio', undefined, undefined, '/pages/portfolio')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center gap-2.5 group cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">Portfolio & Case Studies</div>
                      <div className="text-[10px] text-neutral-400 font-mono">/pages/portfolio</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('pages-directory', undefined, undefined, '/pages')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center gap-2.5 group cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">Permanent Pages Index</div>
                      <div className="text-[10px] text-neutral-400 font-mono">/pages</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('home', 'contact', undefined, '/#contact')}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-950/60 text-left transition-colors flex items-center gap-2.5 group cursor-pointer border-t border-purple-900/30"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">Contact & Inquiries</div>
                      <div className="text-[10px] text-neutral-400">Direct WhatsApp & Email channels</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
              aria-label="Toggle color theme"
              className="p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer shadow-xs"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300 animate-in spin-in-180 duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-purple-600 animate-in spin-in-180 duration-200" />
              )}
            </button>

            {/* AI Architecture & Career Advisor Quick CTA */}
            {onOpenAiAdvisor && (
              <button
                id="nav-ai-advisor-btn"
                onClick={onOpenAiAdvisor}
                title="Vixora AI Architecture & Career Advisor"
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#1E113F] hover:bg-[#2A1854] text-purple-200 border border-purple-500/40 shadow-sm transition-all cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-purple-300" />
                <span>AI Advisor</span>
              </button>
            )}

            {/* Student & Certificate Portal Quick CTA */}
            <button
              id="nav-student-portal-btn"
              onClick={() => handleNavClick('student-portal', undefined, undefined, '/pages/student-portal')}
              title="Student Academic Portal & Certificate Verification"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                currentPage === 'student-portal' || currentPage === 'certificate-portal'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-purple-600/30'
                  : 'bg-neutral-900/90 hover:bg-neutral-800 text-purple-300 hover:text-white border-purple-500/30 hover:border-purple-500/50'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Student Portal</span>
            </button>

            {/* Client Portal Quick CTA */}
            <button
              id="nav-client-portal-btn"
              onClick={() => handleNavClick('dashboard', undefined, undefined, '/pages/dashboard')}
              title="Secure Client Project Portal & Deadlines"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                currentPage === 'dashboard'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-purple-600/30'
                  : 'bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 hover:text-white border-amber-500/30 hover:border-amber-500/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Client Portal</span>
            </button>

            {/* Admin Command Portal CTA (active or when on admin subdomain) */}
            {(currentPage === 'admin' || (typeof window !== 'undefined' && window.location.hostname.startsWith('admin.'))) && (
              <button
                id="nav-admin-portal-btn"
                onClick={() => handleNavClick('admin', undefined, undefined, '/admin')}
                title="Enterprise Admin Command Center"
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                  currentPage === 'admin'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-purple-600/30'
                    : 'bg-neutral-900/90 hover:bg-neutral-800 text-purple-300 hover:text-white border-purple-500/30 hover:border-purple-500/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                <span>Admin Command</span>
              </button>
            )}

            {/* Google Drive PRD Workspace Tool */}
            <button
              id="nav-drive-workspace-btn"
              onClick={onOpenDriveWorkspace}
              title="Google Drive PRD Workspace & Document Analyzer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-neutral-900/90 hover:bg-neutral-800 text-purple-300 hover:text-white border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer shadow-xs"
            >
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden xl:inline">Drive Workspace</span>
            </button>

            {/* Book Consultation / Start Project CTA */}
            <button
              id="nav-book-consultation-btn"
              onClick={onOpenProjectModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-neutral-900 text-neutral-300 border border-purple-500/20"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-purple-600" />}
            </button>
            <button
              onClick={() => handleNavClick('dashboard', undefined, undefined, '/pages/dashboard')}
              className="p-2 rounded-lg bg-neutral-900 text-amber-400 border border-amber-500/30 sm:hidden"
              title="Client Portal"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenDriveWorkspace}
              className="p-2 rounded-lg bg-neutral-900 text-purple-400 border border-purple-500/20 sm:hidden"
              title="Drive Workspace"
            >
              <HardDrive className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-neutral-900/80 text-neutral-300 hover:text-white border border-neutral-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Clean Mobile Accordion Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A051C]/98 border-b border-purple-900/30 px-5 py-6 space-y-4 backdrop-blur-2xl animate-in slide-in-from-top-4 duration-200 shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* Mobile Drawer Header with Mobile Logo */}
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
            <button
              onClick={() => handleNavClick('home', undefined, undefined, '/')}
              className="flex items-center gap-3 text-left cursor-pointer"
            >
              <BrandLogo variant="mobile" size="md" responsive={false} />
              <div>
                <div className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                  <span>VIXORA DIGITAL HUB</span>
                </div>
                <div className="text-[10px] text-purple-400 font-mono">Software • AI • Automation</div>
              </div>
            </button>
            <button
              onClick={() => handleNavClick('home', undefined, undefined, '/')}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-purple-950/60 text-purple-300 border border-purple-800/40 hover:bg-purple-900/60 cursor-pointer"
            >
              Home
            </button>
          </div>

          {/* Section 1: Services */}
          <div className="border-t border-purple-900/30 pt-3 space-y-1">
            <button
              onClick={() => toggleMobileSection('services')}
              className="w-full flex items-center justify-between text-left py-2 px-3 text-xs font-mono uppercase tracking-wider text-purple-300 font-bold"
            >
              <span>Services & Solutions</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  mobileExpandedSection === 'services' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {mobileExpandedSection === 'services' && (
              <div className="pl-3 space-y-1 pt-1 animate-in fade-in duration-150">
                <button
                  onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  Software & Cloud Platforms
                </button>
                <button
                  onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  AI Agents & Workflow Automations
                </button>
                <button
                  onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  Branding & UI/UX Design Systems
                </button>
                <button
                  onClick={() => handleNavClick('home', 'solutions', undefined, '/#solutions')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  Media Buying & UGC Video Ads
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Academy */}
          <div className="border-t border-purple-900/30 pt-3 space-y-1">
            <button
              onClick={() => toggleMobileSection('academy')}
              className="w-full flex items-center justify-between text-left py-2 px-3 text-xs font-mono uppercase tracking-wider text-purple-300 font-bold"
            >
              <span>Vixora Academy</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  mobileExpandedSection === 'academy' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {mobileExpandedSection === 'academy' && (
              <div className="pl-3 space-y-1 pt-1 animate-in fade-in duration-150">
                <button
                  onClick={() => handleNavClick('academy', undefined, undefined, '/pages/academy')}
                  className="w-full text-left py-2 px-3 text-xs font-bold text-purple-400"
                >
                  View All Cohort Programs →
                </button>
                <button
                  onClick={() => handleNavClick('academy-course', undefined, 'data-analysis-cohort', '/academy/data-analysis-cohort')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  Data Analysis Cohort (16 Wks)
                </button>
                <button
                  onClick={() => handleNavClick('academy-course', undefined, 'ai-automation-digital-business-systems', '/academy/ai-automation-digital-business-systems')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  AI Automation Systems (12 Wks)
                </button>
                <button
                  onClick={() => handleNavClick('academy-course', undefined, 'complete-ai-digital-skills-freelancing-mastery', '/academy/complete-ai-digital-skills-freelancing-mastery')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  AI Digital Skills & Freelance (6 Wks)
                </button>
                <div className="pt-2 border-t border-purple-900/30">
                  <button
                    onClick={() => handleNavClick('student-portal', undefined, undefined, '/pages/student-portal')}
                    className="w-full text-left py-2 px-3 text-xs font-bold text-emerald-400 flex items-center gap-2"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student Portal (Login)</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('certificate-portal', undefined, undefined, '/pages/certificate-portal')}
                    className="w-full text-left py-2 px-3 text-xs font-bold text-amber-400 flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    <span>Certificate Portal & Verification</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Categories & Knowledge Directory */}
          <div className="border-t border-purple-900/30 pt-3 space-y-1">
            <button
              onClick={() => toggleMobileSection('categories')}
              className="w-full flex items-center justify-between text-left py-2 px-3 text-xs font-mono uppercase tracking-wider text-purple-300 font-bold"
            >
              <span>Categories & Articles</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  mobileExpandedSection === 'categories' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {mobileExpandedSection === 'categories' && (
              <div className="pl-3 space-y-1 pt-1 animate-in fade-in duration-150">
                <button
                  onClick={() => handleNavClick('categories', undefined, undefined, '/categories')}
                  className="w-full text-left py-2 px-3 text-xs font-bold text-purple-400"
                >
                  All Categories Index (/categories) →
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleNavClick('categories', undefined, undefined, `/categories/${cat.slug}`)}
                    className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] font-mono text-purple-400">/{cat.slug}</span>
                  </button>
                ))}
                <button
                  onClick={() => handleNavClick('resources', undefined, undefined, '/pages/resources')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  Knowledge Hub & Whitepapers
                </button>
              </div>
            )}
          </div>

          {/* Section 4: Company & Pages */}
          <div className="border-t border-purple-900/30 pt-3 space-y-1">
            <button
              onClick={() => toggleMobileSection('company')}
              className="w-full flex items-center justify-between text-left py-2 px-3 text-xs font-mono uppercase tracking-wider text-purple-300 font-bold"
            >
              <span>Company & Platform</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  mobileExpandedSection === 'company' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {mobileExpandedSection === 'company' && (
              <div className="pl-3 space-y-1 pt-1 animate-in fade-in duration-150">
                <button
                  onClick={() => handleNavClick('about', undefined, undefined, '/pages/about')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  About Vixora (/pages/about)
                </button>
                <button
                  onClick={() => handleNavClick('portfolio', undefined, undefined, '/pages/portfolio')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  Portfolio & Case Studies (/pages/portfolio)
                </button>
                <button
                  onClick={() => handleNavClick('pages-directory', undefined, undefined, '/pages')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  Permanent Pages Index (/pages)
                </button>
                <button
                  onClick={() => handleNavClick('dashboard', undefined, undefined, '/pages/dashboard')}
                  className="w-full text-left py-2 px-3 text-xs text-amber-300 hover:text-amber-200 font-semibold"
                >
                  Client Portal & Deadlines (/pages/dashboard)
                </button>
                <button
                  onClick={() => handleNavClick('home', 'contact', undefined, '/#contact')}
                  className="w-full text-left py-2 px-3 text-xs text-neutral-300 hover:text-white"
                >
                  Contact Us
                </button>
              </div>
            )}
          </div>

          {/* Direct CTA buttons in Mobile Menu */}
          <div className="pt-4 border-t border-purple-900/30 flex flex-col gap-2.5">
            {onOpenAiAdvisor && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAiAdvisor();
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#1E113F] text-purple-200 border border-purple-500/40 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bot className="w-4 h-4 text-purple-300" />
                <span>Advisory Engine (Solutions &amp; Courses)</span>
              </button>
            )}

            {(currentPage === 'admin' || (typeof window !== 'undefined' && window.location.hostname.startsWith('admin.'))) && (
              <button
                onClick={() => handleNavClick('admin', undefined, undefined, '/admin')}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-purple-600/30 text-purple-200 border border-purple-500/50 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-purple-300" />
                <span>Admin Command Center</span>
              </button>
            )}
            <button
              onClick={() => handleNavClick('dashboard', undefined, undefined, '/pages/dashboard')}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>Client Dashboard & Deadlines</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDriveWorkspace();
              }}
              className="w-full py-2.5 rounded-xl text-xs font-medium bg-purple-950/60 text-purple-300 border border-purple-800/40 flex items-center justify-center gap-2"
            >
              <HardDrive className="w-4 h-4 text-purple-400" />
              <span>Drive Requirements PRD Hub</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenProjectModal();
              }}
              className="w-full py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              <span>Book Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}


