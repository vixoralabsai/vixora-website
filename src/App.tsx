/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustedBy } from './components/TrustedBy';
import { SolutionsSection } from './components/SolutionsSection';
import { IndustriesSection } from './components/IndustriesSection';
import { BusinessMetrics } from './components/BusinessMetrics';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CallToAction } from './components/CallToAction';
import { Footer } from './components/Footer';
import { StartProjectModal } from './components/StartProjectModal';
import { DriveWorkspaceModal } from './components/DriveWorkspaceModal';
import { CourseEnrollmentModal } from './components/CourseEnrollmentModal';
import { AiAdvisorModal } from './components/AiAdvisorModal';
import { FloatingAiAdvisorWidget } from './components/FloatingAiAdvisorWidget';
import { FloatingWhatsAppWidget } from './components/FloatingWhatsAppWidget';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { GlobalLoadingIndicator } from './components/GlobalLoadingIndicator';
import { AcademyNavbar } from './components/AcademyNavbar';
import { AcademyFooter } from './components/AcademyFooter';
import { LoadingProvider, useLoading } from './context/LoadingContext';

// Standalone Pages
import { AboutPage } from './pages/AboutPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { AcademyPage } from './pages/AcademyPage';
import { CourseLandingPage } from './pages/CourseLandingPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ClientDashboardPage } from './pages/ClientDashboardPage';
import { PagesDirectoryPage } from './pages/PagesDirectoryPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { StudentPortalPage } from './pages/StudentPortalPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PaymentCallbackPage } from './pages/PaymentCallbackPage';
import { CohortBundlePage } from './pages/CohortBundlePage';
import { CohortTrackSubpage } from './pages/CohortTrackSubpage';

import { ACADEMY_COURSES, AcademyCourse } from './data/vixoraContent';
import { BRAND_CONFIG } from './data/brandConfig';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { getPostBySlug } from './data/categoriesData';
import { getCohortTrackBySlug } from './data/cohortData';

export type PageType =
  | 'home'
  | 'about'
  | 'portfolio'
  | 'academy'
  | 'academy-course'
  | 'cohort-1'
  | 'resources'
  | 'dashboard'
  | 'pages-directory'
  | 'categories'
  | 'student-portal'
  | 'certificate-portal'
  | 'admin'
  | 'payment-callback';

interface RouteState {
  page: PageType;
  path: string;
  categorySlug?: string;
  subcategorySlug?: string;
  postSlug?: string;
  courseSlug?: string;
  certId?: string;
}

function parseLocationPath(pathname: string, search: string, hash: string = ''): RouteState {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const cleanHash = (hash || '').replace(/^#\/?/, '').trim();
  const urlParams = new URLSearchParams(search);
  const pageParam = urlParams.get('page');
  const courseParam = urlParams.get('course');
  const certParam = urlParams.get('cert') || urlParams.get('id') || undefined;

  // 1. Query parameter overrides (legacy compatibility)
  if (courseParam) {
    return {
      page: 'academy-course',
      path: `/academy/${courseParam}`,
      courseSlug: courseParam
    };
  }

  // Check if accessing via admin subdomain or parameter
  const isAdminHost = typeof window !== 'undefined' && (
    window.location.hostname === 'admin.vixoradigitalhub.com' ||
    window.location.hostname.startsWith('admin.') ||
    urlParams.get('subdomain') === 'admin'
  );

  // 2. Canonical admin route (direct address bar access only: domain.com/admin or domain.com/#admin or admin subdomain)
  if (
    cleanPath === '/admin' ||
    cleanPath === '/admin/login' ||
    cleanPath === '/admin/dashboard' ||
    cleanPath === '/pages/admin' ||
    cleanHash === 'admin' ||
    cleanHash === 'admin/login' ||
    cleanHash === 'admin/dashboard' ||
    pageParam === 'admin' ||
    (isAdminHost && (
      cleanPath === '/' ||
      cleanPath === '' ||
      cleanPath === '/login' ||
      cleanPath === '/dashboard' ||
      cleanPath.startsWith('/admin')
    ))
  ) {
    return { page: 'admin', path: '/admin' };
  }

  // Admin host accessing enterprise client dashboard explicitly
  if (isAdminHost && (cleanPath === '/enterprise' || cleanPath === '/client' || cleanPath === '/client-dashboard')) {
    return { page: 'dashboard', path: '/pages/dashboard' };
  }

  if (pageParam && ['about', 'portfolio', 'resources', 'academy', 'dashboard', 'student-portal', 'certificate-portal'].includes(pageParam)) {
    return {
      page: pageParam as PageType,
      path: `/pages/${pageParam}`,
      certId: certParam
    };
  }

  // 3. Canonical /pages permalinks
  if (
    cleanPath === '/payment/callback' ||
    cleanPath === '/payment/success' ||
    cleanPath === '/payment/receipt' ||
    ((urlParams.get('reference') || urlParams.get('trxref')) && cleanPath.startsWith('/payment'))
  ) {
    return { page: 'payment-callback', path: cleanPath };
  }

  // Automatic routing for password recovery tokens and auth callbacks arriving at root or any path
  const hasRecoveryToken = cleanHash.includes('type=recovery') || search.includes('type=recovery') ||
    cleanHash.includes('otp_expired') || search.includes('otp_expired') ||
    cleanHash.includes('error=access_denied') || search.includes('error=access_denied');

  if (hasRecoveryToken && !isAdminHost) {
    return { page: 'student-portal', path: '/pages/student-portal', certId: certParam };
  }

  if (cleanPath === '/pages') {
    return { page: 'pages-directory', path: '/pages' };
  }
  if (cleanPath === '/pages/student-portal' || cleanPath === '/student-portal' || cleanPath === '/portal') {
    return { page: 'student-portal', path: '/pages/student-portal', certId: certParam };
  }
  if (
    cleanPath === '/pages/certificate-portal' ||
    cleanPath === '/certificate-portal' ||
    cleanPath === '/verify' ||
    cleanPath === '/verify-certificate'
  ) {
    return { page: 'certificate-portal', path: '/pages/certificate-portal', certId: certParam };
  }
  if (cleanPath === '/pages/about' || cleanPath === '/about') {
    return { page: 'about', path: '/pages/about' };
  }
  if (cleanPath === '/pages/portfolio' || cleanPath === '/portfolio') {
    return { page: 'portfolio', path: '/pages/portfolio' };
  }
  if (cleanPath === '/pages/academy' || cleanPath === '/academy') {
    return { page: 'academy', path: '/pages/academy' };
  }
  if (cleanPath === '/pages/resources' || cleanPath === '/resources') {
    return { page: 'resources', path: '/pages/resources' };
  }
  if (cleanPath === '/pages/dashboard' || cleanPath === '/dashboard') {
    return { page: 'dashboard', path: '/pages/dashboard' };
  }

  // 3. Cohort 1.0 Dedicated Route
  if (
    cleanPath === '/cohort-1' ||
    cleanPath === '/pages/cohort-1' ||
    cleanPath === '/academy/cohort-1' ||
    cleanPath.startsWith('/academy/cohort-1/') ||
    cleanPath.startsWith('/cohort-1/') ||
    cleanPath.startsWith('/pages/cohort-1/') ||
    pageParam === 'cohort-1'
  ) {
    let trackSlug: string | undefined = undefined;
    if (cleanPath.startsWith('/academy/cohort-1/')) {
      trackSlug = cleanPath.replace('/academy/cohort-1/', '').trim();
    } else if (cleanPath.startsWith('/cohort-1/')) {
      trackSlug = cleanPath.replace('/cohort-1/', '').trim();
    } else if (cleanPath.startsWith('/pages/cohort-1/')) {
      trackSlug = cleanPath.replace('/pages/cohort-1/', '').trim();
    }
    return {
      page: 'cohort-1',
      path: cleanPath,
      courseSlug: trackSlug || undefined
    };
  }

  // 4. Academy Course paths: /academy/:courseSlug
  if (cleanPath.startsWith('/academy/')) {
    const slug = cleanPath.replace('/academy/', '');
    return {
      page: 'academy-course',
      path: cleanPath,
      courseSlug: slug
    };
  }

  // 4. Categories, Subcategories & Posts:
  // Format:
  // - /categories
  // - /categories/:category
  // - /categories/:category/:subcategory
  // - /categories/:category/:subcategory/:postTitle
  // - /categories/:category/:postTitle
  if (cleanPath === '/categories') {
    return {
      page: 'categories',
      path: '/categories'
    };
  }

  if (cleanPath.startsWith('/categories/')) {
    const parts = cleanPath.replace('/categories/', '').split('/').filter(Boolean);
    if (parts.length === 1) {
      // Could be /categories/:categorySlug
      return {
        page: 'categories',
        path: cleanPath,
        categorySlug: parts[0]
      };
    } else if (parts.length === 2) {
      // Check if parts[1] is a post or a subcategory
      const potentialPost = getPostBySlug(parts[1], parts[0]);
      if (potentialPost) {
        return {
          page: 'categories',
          path: cleanPath,
          categorySlug: parts[0],
          postSlug: parts[1]
        };
      }
      return {
        page: 'categories',
        path: cleanPath,
        categorySlug: parts[0],
        subcategorySlug: parts[1]
      };
    } else if (parts.length >= 3) {
      // /categories/:categorySlug/:subcategorySlug/:postSlug
      return {
        page: 'categories',
        path: cleanPath,
        categorySlug: parts[0],
        subcategorySlug: parts[1],
        postSlug: parts[2]
      };
    }
  }

  // Check if accessing via academy subdomain
  const isAcademyHost = typeof window !== 'undefined' && (
    window.location.hostname === 'academy.vixoradigitalhub.com' ||
    window.location.hostname.startsWith('academy.') ||
    urlParams.get('subdomain') === 'academy'
  );

  if (isAcademyHost && (cleanPath === '/' || cleanPath === '')) {
    return { page: 'academy', path: '/pages/academy' };
  }

  // Fallback for admin subdomain
  if (isAdminHost && (cleanPath === '/' || cleanPath === '')) {
    return { page: 'admin', path: '/admin' };
  }

  // Default Home
  return { page: 'home', path: '/' };
}

function AppContent() {
  const { startLoading, stopLoading } = useLoading();
  const autoOpenedSlugRef = useRef<string | null>(null);
  const dismissedSlugsRef = useRef<Set<string>>(new Set());

  const [route, setRoute] = useState<RouteState>(() =>
    parseLocationPath(
      typeof window !== 'undefined' ? window.location.pathname : '/',
      typeof window !== 'undefined' ? window.location.search : '',
      typeof window !== 'undefined' ? window.location.hash : ''
    )
  );

  const [selectedCourse, setSelectedCourse] = useState<AcademyCourse | null>(() => {
    if (route.courseSlug) {
      return ACADEMY_COURSES.find(c => c.slug === route.courseSlug || c.id === route.courseSlug) || null;
    }
    return null;
  });

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [driveWorkspaceOpen, setDriveWorkspaceOpen] = useState(false);
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [aiAdvisorOpen, setAiAdvisorOpen] = useState(false);
  const [courseForEnrollment, setCourseForEnrollment] = useState<AcademyCourse | null>(null);

  // Sync course when route changes
  useEffect(() => {
    if (route.courseSlug) {
      const found = ACADEMY_COURSES.find(c => c.slug === route.courseSlug || c.id === route.courseSlug);
      if (found) setSelectedCourse(found);
    }
  }, [route.courseSlug]);

  // Automatically trigger payment/enrollment popup ONCE when landing on a course page
  useEffect(() => {
    if (route.page === 'academy-course' && route.courseSlug) {
      const activeSlug = route.courseSlug;
      if (
        autoOpenedSlugRef.current !== activeSlug &&
        !dismissedSlugsRef.current.has(activeSlug)
      ) {
        autoOpenedSlugRef.current = activeSlug;
        const targetCourse = ACADEMY_COURSES.find(c => c.slug === activeSlug || c.id === activeSlug);
        if (targetCourse) {
          setCourseForEnrollment(targetCourse);
          setEnrollmentModalOpen(true);
        }
      }
    } else if (route.page !== 'academy-course') {
      autoOpenedSlugRef.current = null;
    }
  }, [route.page, route.courseSlug]);

  const handleCloseEnrollmentModal = useCallback(() => {
    if (route.courseSlug) {
      dismissedSlugsRef.current.add(route.courseSlug);
    }
    setEnrollmentModalOpen(false);
  }, [route.courseSlug]);

  // Handle browser back, forward, and hash navigation
  useEffect(() => {
    const handleUrlChange = () => {
      startLoading('Loading page...');
      const parsed = parseLocationPath(window.location.pathname, window.location.search, window.location.hash);
      setRoute(parsed);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => stopLoading(), 220);
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [startLoading, stopLoading]);

  // Universal Navigation Handler supporting permalinks
  const handleNavigate = useCallback(
    (page: string, sectionId?: string, courseSlug?: string, customPath?: string) => {
      const isAlreadyAcademyHost = typeof window !== 'undefined' && (
        window.location.hostname.startsWith('academy.') ||
        window.location.hostname.includes('academy')
      );

      // Determine canonical target URL
      let targetPath = customPath;
      if (!targetPath) {
        if (page === 'home') {
          targetPath = sectionId ? `/#${sectionId}` : '/';
        } else if (page === 'pages-directory') {
          targetPath = '/pages';
        } else if (page === 'about') {
          targetPath = '/pages/about';
        } else if (page === 'portfolio') {
          targetPath = '/pages/portfolio';
        } else if (page === 'academy') {
          targetPath = '/pages/academy';
        } else if (page === 'resources') {
          targetPath = '/pages/resources';
        } else if (page === 'dashboard') {
          targetPath = '/pages/dashboard';
        } else if (page === 'admin') {
          targetPath = '/admin';
        } else if (page === 'categories') {
          targetPath = '/categories';
        } else if (page === 'cohort-1') {
          targetPath = courseSlug ? `/academy/cohort-1/${courseSlug}` : '/academy/cohort-1';
        } else if (page === 'academy-course' && courseSlug) {
          targetPath = `/academy/${courseSlug}`;
        } else {
          targetPath = `/${page}`;
        }
      }

      // Check if we are on the production main hub domain
      const isProductionHubHost = typeof window !== 'undefined' && (
        window.location.hostname === 'vixoradigitalhub.com' ||
        window.location.hostname === 'www.vixoradigitalhub.com'
      );

      const isAlreadyAdminHost = typeof window !== 'undefined' && (
        window.location.hostname === 'admin.vixoradigitalhub.com' ||
        window.location.hostname.startsWith('admin.')
      );

      // On production domain, redirect all academy requests to academy.vixoradigitalhub.com
      if (page === 'academy' && isProductionHubHost && !isAlreadyAcademyHost) {
        window.location.href = BRAND_CONFIG.academyDomain;
        return;
      }

      if (page === 'academy-course' && courseSlug && isProductionHubHost && !isAlreadyAcademyHost) {
        window.location.href = `${BRAND_CONFIG.academyDomain}/academy/${encodeURIComponent(courseSlug)}`;
        return;
      }

      if ((page === 'student-portal' || page === 'certificate-portal') && isProductionHubHost && !isAlreadyAcademyHost) {
        window.location.href = `${BRAND_CONFIG.academyDomain}/pages/${page}`;
        return;
      }

      // On production domain, redirect admin requests to admin.vixoradigitalhub.com
      if (page === 'admin' && isProductionHubHost && !isAlreadyAdminHost) {
        window.location.href = BRAND_CONFIG.adminDomain;
        return;
      }

      // If user is on admin subdomain and navigates to public home, redirect to main hub domain
      if (page === 'home' && isAlreadyAdminHost) {
        window.location.href = BRAND_CONFIG.domain;
        return;
      }

      // Update browser history with clean permalink
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', targetPath);
      }

      startLoading('Loading page...');

      // Parse and set internal state
      const parsed = parseLocationPath(
        targetPath.split('#')[0] || '/',
        targetPath.includes('?') ? targetPath.split('?')[1] : ''
      );
      setRoute(parsed);

      if (sectionId && (page === 'home' || targetPath.startsWith('/#'))) {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
          stopLoading();
        }, 50);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => stopLoading(), 220);
      }
    },
    [startLoading, stopLoading]
  );

  const handleSelectCourse = useCallback((course: AcademyCourse) => {
    if (course.slug) {
      dismissedSlugsRef.current.delete(course.slug);
    }
    setSelectedCourse(course);
    setCourseForEnrollment(course);
    setEnrollmentModalOpen(true);
    handleNavigate('academy-course', undefined, course.slug, `/academy/${course.slug}`);
  }, [handleNavigate]);

  const handleEnrollInCourse = useCallback((course: AcademyCourse) => {
    if (course.slug) {
      dismissedSlugsRef.current.delete(course.slug);
    }
    setCourseForEnrollment(course);
    setEnrollmentModalOpen(true);
  }, []);

  const handleExploreServices = () => {
    if (route.page !== 'home') {
      handleNavigate('home', 'solutions', undefined, '/#solutions');
    } else {
      const el = document.getElementById('solutions');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isAcademyNav = ['academy', 'academy-course', 'cohort-1', 'student-portal', 'certificate-portal', 'payment-callback'].includes(route.page);
  const isAcademyLightBg = ['academy', 'academy-course', 'cohort-1', 'student-portal', 'certificate-portal'].includes(route.page);
  const isAcademyView = isAcademyLightBg;

  return (
    <>
      <div className={`min-h-screen font-sans antialiased transition-colors duration-200 selection:bg-[#480878] selection:text-white ${
        isAcademyLightBg ? 'text-[#000048]' : 'text-neutral-100'
      }`}>
      {/* Viewport Top Scroll Progress Indicator for Long-Form Pages */}
      <ScrollProgressBar currentPage={route.page} />

      {/* Dynamic Navigation Bar: AcademyNavbar for Academy Subdomain vs agency Navbar for Main Hub */}
      {isAcademyNav ? (
        <AcademyNavbar
          currentPage={route.page}
          currentPath={route.path}
          onNavigate={handleNavigate}
          onOpenCorporateModal={() => setProjectModalOpen(true)}
          onOpenAiAdvisor={() => setAiAdvisorOpen(true)}
        />
      ) : (
        <Navbar
          currentPage={route.page}
          currentPath={route.path}
          onNavigate={handleNavigate}
          onOpenProjectModal={() => setProjectModalOpen(true)}
          onOpenDriveWorkspace={() => setDriveWorkspaceOpen(true)}
          onOpenAiAdvisor={() => setAiAdvisorOpen(true)}
        />
      )}

      {/* Main Dynamic View Content */}
      <main>
        {route.page === 'home' && (
          <div className="animate-in fade-in duration-200">
            {/* 1. Hero Section with 3D V Monolith & Floating Cyber Nodes */}
            <Hero
              onOpenProjectModal={() => setProjectModalOpen(true)}
              onExploreServices={handleExploreServices}
              onOpenDriveWorkspace={() => setDriveWorkspaceOpen(true)}
            />

            {/* 2. Client Logos Ribbon */}
            <TrustedBy />

            {/* 3. Key Metrics Bar */}
            <BusinessMetrics />

            {/* 4. Complete Digital Solutions Grid */}
            <SolutionsSection
              onOpenProjectModal={() => setProjectModalOpen(true)}
            />

            {/* 5. Industries Served */}
            <IndustriesSection
              onSelectIndustry={() => setProjectModalOpen(true)}
            />

            {/* 6. Testimonials & Client Reviews */}
            <TestimonialsSection />

            {/* 7. High-Conversion Call To Action */}
            <CallToAction
              onOpenProjectModal={() => setProjectModalOpen(true)}
            />
          </div>
        )}

        {route.page === 'about' && (
          <AboutPage
            onOpenProjectModal={() => setProjectModalOpen(true)}
            onNavigate={handleNavigate}
          />
        )}

        {route.page === 'portfolio' && (
          <PortfolioPage
            onOpenProjectModal={() => setProjectModalOpen(true)}
          />
        )}

        {route.page === 'academy' && (
          <AcademyPage
            onOpenProjectModal={() => setProjectModalOpen(true)}
            onSelectCourse={handleSelectCourse}
            onEnrollCourse={handleEnrollInCourse}
            onNavigateHome={() => handleNavigate('home', undefined, undefined, '/')}
            onNavigateToStudentPortal={() => handleNavigate('student-portal', undefined, undefined, '/student-portal')}
            onNavigateCohort1={() => handleNavigate('cohort-1', undefined, undefined, '/academy/cohort-1')}
          />
        )}

        {route.page === 'cohort-1' && (
          route.courseSlug ? (
            <CohortTrackSubpage
              trackSlug={route.courseSlug}
              onEnrollCourse={handleEnrollInCourse}
              onNavigateTrack={(trackSlug) => handleNavigate('cohort-1', undefined, trackSlug, `/academy/cohort-1/${trackSlug}`)}
              onNavigateBundle={() => handleNavigate('cohort-1', undefined, undefined, '/academy/cohort-1')}
              onNavigateAcademy={() => handleNavigate('academy', undefined, undefined, '/pages/academy')}
              onOpenProjectModal={() => setProjectModalOpen(true)}
            />
          ) : (
            <CohortBundlePage
              initialTrackSlug={route.courseSlug}
              onEnrollCourse={handleEnrollInCourse}
              onNavigateCourse={(slug) => handleNavigate('cohort-1', undefined, slug, `/academy/cohort-1/${slug}`)}
              onNavigateHome={() => handleNavigate('home', undefined, undefined, '/')}
              onNavigateAcademy={() => handleNavigate('academy', undefined, undefined, '/pages/academy')}
              onOpenProjectModal={() => setProjectModalOpen(true)}
            />
          )
        )}

        {route.page === 'academy-course' && route.courseSlug && getCohortTrackBySlug(route.courseSlug) && (
          <CohortTrackSubpage
            trackSlug={route.courseSlug}
            onEnrollCourse={handleEnrollInCourse}
            onNavigateTrack={(trackSlug) => handleNavigate('cohort-1', undefined, trackSlug, `/academy/cohort-1/${trackSlug}`)}
            onNavigateBundle={() => handleNavigate('cohort-1', undefined, undefined, '/academy/cohort-1')}
            onNavigateAcademy={() => handleNavigate('academy', undefined, undefined, '/pages/academy')}
            onOpenProjectModal={() => setProjectModalOpen(true)}
          />
        )}

        {route.page === 'academy-course' && (!route.courseSlug || !getCohortTrackBySlug(route.courseSlug)) && selectedCourse && (
          <CourseLandingPage
            course={selectedCourse}
            onBackToAcademy={() => handleNavigate('academy', undefined, undefined, '/pages/academy')}
            onEnroll={handleEnrollInCourse}
            onSelectCourse={handleSelectCourse}
            onNavigateHome={() => handleNavigate('home', undefined, undefined, '/')}
          />
        )}

        {route.page === 'resources' && (
          <ResourcesPage
            onOpenDriveWorkspace={() => setDriveWorkspaceOpen(true)}
            onOpenProjectModal={() => setProjectModalOpen(true)}
          />
        )}

        {route.page === 'dashboard' && (
          <ClientDashboardPage
            onOpenProjectModal={() => setProjectModalOpen(true)}
            onOpenDriveWorkspace={() => setDriveWorkspaceOpen(true)}
            onNavigateHome={() => handleNavigate('home', undefined, undefined, '/')}
            onNavigateToAdmin={() => handleNavigate('admin', undefined, undefined, '/admin')}
          />
        )}

        {route.page === 'pages-directory' && (
          <PagesDirectoryPage
            onNavigate={handleNavigate}
            onOpenProjectModal={() => setProjectModalOpen(true)}
            onOpenDriveWorkspace={() => setDriveWorkspaceOpen(true)}
          />
        )}

        {route.page === 'categories' && (
          <CategoriesPage
            categorySlug={route.categorySlug}
            subcategorySlug={route.subcategorySlug}
            postSlug={route.postSlug}
            onNavigate={handleNavigate}
            onOpenProjectModal={() => setProjectModalOpen(true)}
          />
        )}

        {(route.page === 'student-portal' || route.page === 'certificate-portal') && (
          <StudentPortalPage
            initialTab={route.page === 'certificate-portal' ? (route.certId ? 'certificates' : 'verify') : 'dashboard'}
            initialCertId={route.certId}
            onNavigateToCourse={(slug) => handleNavigate('academy-course', undefined, slug, `/academy/${slug}`)}
          />
        )}

        {route.page === 'admin' && (
          <AdminDashboardPage
            onNavigateHome={() => handleNavigate('home', undefined, undefined, '/')}
            onOpenProjectModal={() => setProjectModalOpen(true)}
            onOpenDriveWorkspace={() => setDriveWorkspaceOpen(true)}
            onNavigateToEnterpriseDashboard={() => handleNavigate('dashboard', undefined, undefined, '/pages/dashboard')}
          />
        )}

        {route.page === 'payment-callback' && (
          <PaymentCallbackPage
            onNavigateHome={() => handleNavigate('academy', undefined, undefined, '/pages/academy')}
            onNavigateToPortal={() => handleNavigate('student-portal', undefined, undefined, '/pages/student-portal')}
          />
        )}
      </main>

      {/* Dynamic Footer: Dedicated AcademyFooter for Academy Subdomain vs agency Footer for Main Hub vs clean admin console */}
      {(route.page === 'admin' || route.page === 'payment-callback') ? null : isAcademyView ? (
        <AcademyFooter
          onNavigate={handleNavigate}
          onOpenCorporateModal={() => setProjectModalOpen(true)}
        />
      ) : (
        <Footer
          onNavigate={handleNavigate}
          onOpenDriveWorkspace={() => setDriveWorkspaceOpen(true)}
          onOpenProjectModal={() => setProjectModalOpen(true)}
        />
      )}
      </div>

      {/* Interactive Consultation / Project Scoping Modal */}
      <StartProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onNavigateToDashboard={() => handleNavigate('dashboard', undefined, undefined, '/pages/dashboard')}
      />

      {/* Google Drive Workspace & PRD Generator Modal */}
      <DriveWorkspaceModal
        isOpen={driveWorkspaceOpen}
        onClose={() => setDriveWorkspaceOpen(false)}
      />

      {/* Course Enrollment & Admissions Modal */}
      <CourseEnrollmentModal
        isOpen={enrollmentModalOpen}
        course={courseForEnrollment}
        onClose={handleCloseEnrollmentModal}
        onGoToPortal={() => handleNavigate('student-portal', undefined, undefined, '/pages/student-portal')}
      />

      {/* Vixora AI Business & Career Advisor Modal */}
      <AiAdvisorModal
        isOpen={aiAdvisorOpen}
        onClose={() => setAiAdvisorOpen(false)}
        onOpenProjectModal={() => setProjectModalOpen(true)}
        onNavigateToCourse={(slug) => handleNavigate('academy-course', undefined, slug, `/academy/${slug}`)}
        onEnrollCourse={handleEnrollInCourse}
      />

      {/* Floating AI Advisor Quick Launch Widget */}
      <FloatingAiAdvisorWidget onOpen={() => setAiAdvisorOpen(true)} />

      {/* Persistent Floating WhatsApp Inbound Live Connect Widget */}
      <FloatingWhatsAppWidget />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LoadingProvider>
        <CurrencyProvider>
          <GlobalLoadingIndicator />
          <AppContent />
        </CurrencyProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}


