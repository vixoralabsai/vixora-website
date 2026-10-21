# Implementation Plan: Vixora Academy Cohort 1.0 Flagship & 4 Track Landing Pages

## 1. Executive Summary & User Alignment

The user requests landing pages for **Vixora Academy Cohort 1.0**, featuring session recordings and PDF materials from the completed live cohort. Based on user clarification:
- **Curriculum Scope**: 4 distinct training pillars:
  1. **AI Content Creation** (Image, Video, Audio — Midjourney, Flux, ElevenLabs, Runway, CapCut)
  2. **AI Automation** (n8n, Make, OpenAI API, Webhook Workflows, CRM Integrations)
  3. **AI Web Development & Design** (React 19, Tailwind CSS, Modern UI, AI-Assisted Prototyping)
  4. **Client Acquisition & Freelancing** (Upwork, Cold Outreach, Service Packaging, Closing High-Ticket Clients)
- **Architecture**: A **Flagship Cohort 1.0 Bundle Landing Page** with interactive track tabs, plus **4 dedicated deep-dive subpages** (accessible via `/academy/cohort-1/content-creation`, `/academy/cohort-1/automation`, `/academy/cohort-1/web-development`, and `/academy/cohort-1/freelancing`).
- **Resource Access & Media Delivery**: Public previews with high-production teaser video clips and downloadable syllabus PDF overviews; full high-definition session archives and internal masterclass PDFs are unlocked upon enrollment, with direct access to the **Private Telegram Cohort Group & Archive**.

---

## 2. Visual & UI Architectural Constitution

Following the Vixora design system and `frontend-design` guidelines:
- **Palette Tokens**:
  - Dominant canvas: Deep Navy (`#0F1535` / `#000048`), rich dark violet (`#1E113E`), and crisp surface light (`#F7F7FC`).
  - Brand Primary: Royal Violet (`#5B5FED` / `#6B3FB8`) and Electric Purple (`#7000F8`).
  - High-Contrast Semantic Accents: Amber Gold (`#FFC107` / `#FFD700`) for cohort admissions and pricing badges; Emerald (`#10B981`) for verified credentials and active student enrollment.
- **Typography & Scale**:
  - Headings: Bold, tight display typography (`font-black tracking-tight leading-[1.15]`), clamp-scaled (`text-2xl sm:text-4xl lg:text-5xl`).
  - Metadata: Zero-pill discipline for static informational badges — unboxed text with typographic separators (`·`, `/`) and subtle mono styling. Interactive filters use clean segmented tabs.
- **Layout Math & Viewport**:
  - Mobile-first responsive grid: single-column fluid on screens 320px–430px, expanding to asymmetric split and bento grids on desktop (1440px target).
  - Touch targets $\ge 44\text{px}$ across all mobile buttons and tab switchers.
  - Video players contained in strict `aspect-video` frames with poster fallbacks and reduced-motion support.

---

## 3. Information Architecture & Routing

### New & Enhanced Routes
1. `/academy/cohort-1` (or `/academy/cohort-1-bundle`):
   - **Flagship Master Page**: Complete Cohort 1.0 curriculum overview, instructor credentials (Dean Sarumi Hammad & engineering mentors), interactive 4-track tab switcher, recorded session teaser player, downloadable cohort syllabus PDF, bundle tuition & single-track pricing, and direct enrollment modal integration.
2. `/academy/cohort-1/:trackSlug`:
   - `/academy/cohort-1/ai-content-creation`: Deep dive into prompts, character consistency, voice synthesis, and viral video creation.
   - `/academy/cohort-1/ai-automation`: Deep dive into n8n nodes, API webhooks, automated lead qualification, and enterprise workflow architecture.
   - `/academy/cohort-1/ai-web-development`: Deep dive into rapid AI-assisted development, component architecture, and responsive UX design.
   - `/academy/cohort-1/client-acquisition-freelancing`: Deep dive into pricing models, proposals, international client contracts, and closing $1,000+ retainers.
3. **Student Unlocked View**:
   - For enrolled students, displays the **Cohort 1.0 Telegram Resource Hub**, direct links to download all 4 master session PDFs, and the private Telegram discussion and community invite link.

---

## 4. Component & Technical Implementation Plan

### A. Data Schema Updates (`src/data/vixoraContent.ts`)
- Create `COHORT_1_BUNDLE` object detailing the 4 tracks, session recording metadata, deliverables, tools used, and download files.
- Add structured entries to `ACADEMY_COURSES` representing the 4 modular courses with full syllabi, deliverables, and Paystack integration.

### B. Core Components
1. **`CohortBundlePage.tsx`**:
   - Hero: High-impact split layout with cohort metadata, core proposition, and contained video player showcasing actual Cohort 1.0 session highlights.
   - Interactive Track Explorer: Segmented switcher toggling between the 4 tracks with syllabus breakdown, tools matrix, and practical lab projects.
   - Session Recordings & PDF Showcase: Interactive card deck showing preview clips and PDF outlines with clear locked/unlocked state badges.
   - Community & Private Telegram Hub Banner: Explaining the cohort workflow, lifetime access to archives, and mentor Q&A in Telegram.
   - High-Conversion Tuition & Enrollment Section: Options for Full 4-in-1 Cohort Bundle vs individual track selection.
2. **`CohortTrackSubpage.tsx`**:
   - Dedicated landing page component reusable for each of the 4 sub-tracks, with week-by-week curriculum, capstone preview, and direct enrollment button.
3. **`TelegramAccessCard.tsx`**:
   - High-security post-enrollment card displaying the unique invitation link to the Private Telegram Cohort Group, instructions, and download buttons for the session PDFs.

### C. Enrollment & Payment Flow Preservation
- Fully integrated with existing `CourseEnrollmentModal` and Paystack backend proxy (`/api/payments/paystack/initialize`).
- Retains NGN authoritative pricing, instant automated verification, and safe error sanitization.

---

## 5. Verification & Testing Plan

1. **Routing & Navigation**:
   - Verify address bar routes (`/academy/cohort-1`, `/academy/cohort-1/automation`, etc.) and internal navigation clicks from `AcademyPage`, `AcademyNavbar`, and course catalog.
2. **Mobile Layout (320px, 375px, 430px)**:
   - Ensure zero horizontal overflow across all new pages and components.
   - Confirm touch targets and segmented track switcher tabs wrap gracefully on mobile.
3. **Media & PDF Interactions**:
   - Test video playback in the contained player, test poster fallbacks, and test PDF download triggers.
4. **Automated Verification**:
   - Run `lint_applet` (`tsc --noEmit`).
   - Run `tests/paystackFrontend.test.ts` to ensure enrollment modal contracts remain 100% green.
   - Run production build (`npm run build`).

---

## 6. Implementation Sequence

1. **Step 1**: Register Cohort 1.0 bundle data and the 4 course tracks in `src/data/vixoraContent.ts`.
2. **Step 2**: Build the `CohortBundlePage.tsx` master landing page with the 4-track tab switcher, video showcase, and PDF resource hub.
3. **Step 3**: Build the track subpage component and hook up clean permalink routing in `src/App.tsx`.
4. **Step 4**: Integrate the private Telegram access card and PDF download triggers for enrolled students.
5. **Step 5**: Test and verify compilation, linting, and responsive viewports.
