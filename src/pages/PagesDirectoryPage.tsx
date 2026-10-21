import {
  FileText,
  Layers,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Users,
  HardDrive,
  ExternalLink,
  BookOpen,
  Sparkles,
  Award
} from 'lucide-react';

interface PagesDirectoryPageProps {
  onNavigate: (page: string, sectionId?: string, courseSlug?: string, customPath?: string) => void;
  onOpenProjectModal: () => void;
  onOpenDriveWorkspace: () => void;
}

export function PagesDirectoryPage({
  onNavigate,
  onOpenProjectModal,
  onOpenDriveWorkspace
}: PagesDirectoryPageProps) {
  const sitePages = [
    {
      title: "About Vixora Collective",
      path: "/pages/about",
      pageKey: "about",
      badge: "Corporate",
      icon: Users,
      description: "Our mission, leadership, enterprise delivery methodology, and global engineering talent collective."
    },
    {
      title: "Client Portfolio & Case Studies",
      path: "/pages/portfolio",
      pageKey: "portfolio",
      badge: "Proven Work",
      icon: Briefcase,
      description: "Explore 150+ shipped platforms, health-tech systems, SaaS backends, and AI automation case studies."
    },
    {
      title: "Vixora Academy & Cohorts",
      path: "/pages/academy",
      pageKey: "academy",
      badge: "Education",
      icon: GraduationCap,
      description: "16-week and 12-week intensive cohorts in Data Analysis, AI Automation, and Digital Business Systems."
    },
    {
      title: "Vixora Academy Student Portal",
      path: "/pages/student-portal",
      pageKey: "student-portal",
      badge: "Student Access",
      icon: GraduationCap,
      description: "Student coursework progress, email authentication with rate-limiting, and enrollment verification."
    },
    {
      title: "Certificate Portal & Verification",
      path: "/pages/certificate-portal",
      pageKey: "certificate-portal",
      badge: "Credentials",
      icon: Award,
      description: "Cryptographic credential lookup, automated email dispatch to graduates, and printable PDF diplomas."
    },
    {
      title: "Secure Client Project Portal",
      path: "/pages/dashboard",
      pageKey: "dashboard",
      badge: "Live Client Access",
      icon: ShieldCheck,
      description: "Sprint milestone tracking, upcoming deliverable deadlines, file repository, and support ticket desk."
    },
    {
      title: "Knowledge Hub & Blueprints",
      path: "/pages/resources",
      pageKey: "resources",
      badge: "Resources",
      icon: BookOpen,
      description: "Downloadable software architecture whitepapers, Drive PRD Hub utility, and technical FAQ."
    },
    {
      title: "Taxonomy & Categories Index",
      path: "/categories",
      pageKey: "categories",
      badge: "Taxonomy",
      icon: Layers,
      description: "Structured directory of AI, software engineering, media buying, and product design categories."
    }
  ];

  return (
    <div className="pt-24 pb-24 bg-[#070314] text-neutral-100 min-h-screen">
      {/* Hero Header */}
      <section className="relative py-16 sm:py-20 overflow-hidden border-b border-purple-900/30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-600/15 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300">
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono uppercase tracking-widest text-[11px]">
              Sitemap & Platform Directory
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Permanent Pages Index
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            All primary services, client workspaces, academy portals, and case study archives organized with clean canonical permalinks.
          </p>
        </div>
      </section>

      {/* Pages Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sitePages.map((page, idx) => {
            const Icon = page.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate(page.pageKey, undefined, undefined, page.path)}
                className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 hover:border-purple-500/50 transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-xl hover:-translate-y-1 duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40">
                      {page.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    {page.title}
                  </h3>

                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {page.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono text-purple-400 group-hover:text-purple-300">
                    {page.path}
                  </span>
                  <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950/70 via-neutral-900 to-indigo-950/60 border border-purple-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Need a Custom Technical Proposal?</h3>
            <p className="text-xs sm:text-sm text-neutral-300">
              Schedule a one-on-one architecture scoping session with our principal engineers.
            </p>
          </div>
          <button
            onClick={onOpenProjectModal}
            className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all shrink-0 cursor-pointer"
          >
            Start Project Consultation
          </button>
        </div>
      </div>
    </div>
  );
}
