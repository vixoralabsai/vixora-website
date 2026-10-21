/**
 * Vixora Academy — Cohort 1.0 Master Data & Curriculum Architecture
 * 
 * Contains complete structured definitions for Cohort 1.0 flagship bundle
 * and its 4 training tracks:
 * 1. AI Content Creation (Image, Video, Audio)
 * 2. AI Automation (n8n, APIs, Autonomous Workflows)
 * 3. AI Web Development & Design (Modern UI, React, AI-Assisted Prototyping)
 * 4. Client Acquisition & Freelancing (Upwork, Cold Outreach, High-Ticket Retainers)
 */

import { AcademyCourse } from './vixoraContent';

export interface CohortResource {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'blueprint' | 'template';
  durationOrPages: string;
  trackId: string;
  trackName: string;
  description: string;
  isPublicPreview: boolean;
  previewUrl?: string;
  lockedUrl?: string; // Telegram / Portal download
  telegramMessageRef?: string;
}

export interface TrackMediaSession {
  sessionNumber: string;
  title: string;
  duration: string;
  topics: string[];
  description: string;
  isPreviewAvailable: boolean;
  previewVideoUrl?: string;
  telegramMessageRef?: string;
}

export interface TrackPdfResource {
  title: string;
  category: 'Master Blueprint' | 'Cheatsheet' | 'Templates' | 'Syllabus';
  pages: string;
  fileSize: string;
  description: string;
  isDownloadableSample: boolean;
  sampleFileName: string;
}

export interface CohortTrackItem {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  badge: string;
  tagline: string;
  description: string;
  iconName: 'Sparkles' | 'Workflow' | 'Code2' | 'Briefcase';
  accentColor: string;
  tools: string[];
  courseId: string;
  tuition: string;
  curriculumWeeks: {
    week: string;
    title: string;
    summary: string;
    handsOnDeliverable: string;
    sessionCount: number;
    hasPdf: boolean;
  }[];
  keyTakeaways: string[];
  pdfGuideTitle: string;
  sampleVideoTitle: string;
  sampleVideoDuration: string;
  sessions?: TrackMediaSession[];
  pdfDownloads?: TrackPdfResource[];
  faqs?: { q: string; a: string }[];
}

export interface CohortBundleConfig {
  id: string;
  edition: string;
  title: string;
  tagline: string;
  heroHeadline: string;
  heroDescription: string;
  tuitionBundle: string;
  standardPrice: string;
  savingsNote: string;
  telegramChannelName: string;
  telegramInviteLink: string;
  telegramBenefits: string[];
  tracks: CohortTrackItem[];
  resources: CohortResource[];
  stats: { label: string; value: string; helper: string }[];
}

export const COHORT_1_BUNDLE: CohortBundleConfig = {
  id: 'cohort-1-master-bundle',
  edition: 'Cohort 1.0 Archive & Ongoing Access',
  title: 'Vixora Academy Cohort 1.0: 4-in-1 AI & Growth Masterclass',
  tagline: 'Complete Recordings, Practical Labs, Strategy PDFs & Direct Private Telegram Community Access',
  heroHeadline: 'Master AI Creation, Automation, Web Dev & Client Acquisition in One Unified Program',
  heroDescription: 'Access the complete curriculum of Vixora Academy Cohort 1.0. Four rigorous engineering and business tracks taught by production builders, complete with session video archives, step-by-step PDF blueprints, and our private Telegram community.',
  tuitionBundle: '₦45,000',
  standardPrice: '₦95,000',
  savingsNote: 'Save over 50% with the full 4-track all-access pass. Individual tracks available from ₦10,000.',
  telegramChannelName: 'Vixora Academy | Cohort 1.0 Private Mastermind',
  telegramInviteLink: 'https://t.me/+vixora_cohort1_private',
  telegramBenefits: [
    'Direct daily interaction with Dean Sarumi Hammad and engineering mentors',
    'Exclusive HD cloud video recordings for every module session',
    'Downloadable PDF blueprints, prompt cheatsheets & workflow JSONs',
    'Weekly live code reviews and freelance proposal teardowns',
    'Lifetime student network and referral pipeline'
  ],
  stats: [
    { label: 'Comprehensive Tracks', value: '4 Pillars', helper: 'Content, Automation, Web & Sales' },
    { label: 'Recorded Sessions', value: '28+ Hours', helper: 'HD Telegram Cloud Replays' },
    { label: 'Master Guides', value: '14 PDFs', helper: 'Actionable Blueprints & Prompts' },
    { label: 'Student Rating', value: '4.95 / 5.0', helper: 'Over 120+ Active Builders' }
  ],
  tracks: [
    {
      id: 'track-content-creation',
      slug: 'ai-content-creation',
      title: 'AI Content Creation (Image, Video & Audio)',
      shortTitle: 'AI Content Creation',
      badge: 'Visual & Media Engine',
      tagline: 'Prompt engineering, photorealism, voice synthesis & viral short-form video pipelines.',
      description: 'Master diffusion models, prompt syntax, voice cloning, and AI video generators. Learn to build faceless channels, produce brand visuals, and automate viral video production without expensive camera equipment.',
      iconName: 'Sparkles',
      accentColor: '#9030F8',
      tools: ['Midjourney', 'Flux', 'Ideogram', 'ElevenLabs', 'Runway Gen-3', 'CapCut', 'Hailuo AI'],
      courseId: 'course-ai-image-short-videos-creation',
      tuition: '₦10,000',
      pdfGuideTitle: 'The 2026 Production AI Prompting & Video Master Blueprint (PDF)',
      sampleVideoTitle: 'Session 02: Cinematic Lighting & Character Consistency in Flux & Midjourney',
      sampleVideoDuration: '48 mins',
      keyTakeaways: [
        'Photorealistic commercial photography & 3D product renders',
        'Human portrait consistency across lighting & camera angles',
        'Synthetic voice cloning with human nuance & emotion',
        'Rapid 9:16 vertical short-form video generation & kinetic captioning',
        'Faceless content monetization and client retainer packaging'
      ],
      curriculumWeeks: [
        {
          week: 'Week 1',
          title: 'Foundations of Generative Vision & Prompt Architecture',
          summary: 'Core prompt physics: lighting, camera lenses, stylization, aspect ratios, and seed consistency.',
          handsOnDeliverable: '5 Commercial Product Shots & 3 Character Concept Visuals',
          sessionCount: 2,
          hasPdf: true
        },
        {
          week: 'Week 2',
          title: 'Character Consistency & Commercial Brand Mockups',
          summary: 'Retaining identity across poses, environments, and outfits for advertising campaigns.',
          handsOnDeliverable: 'Brand Identity Visual Deck for a real luxury or e-commerce client',
          sessionCount: 2,
          hasPdf: true
        },
        {
          week: 'Week 3',
          title: 'AI Scripting, Voice Cloning & Sound Design',
          summary: 'GPT-4o script frameworks, ElevenLabs voice training, and layered audio mastering.',
          handsOnDeliverable: '60-second high-retention narration voiceover with dynamic audio bed',
          sessionCount: 2,
          hasPdf: true
        },
        {
          week: 'Week 4',
          title: 'AI Video Generation & CapCut Motion Sequencing',
          summary: 'Image-to-video prompt control, camera pans, and viral TikTok/Reels pacing.',
          handsOnDeliverable: '3 Finished 9:16 Viral Video Creatives ready for paid ads or organic reach',
          sessionCount: 2,
          hasPdf: true
        }
      ],
      sessions: [
        {
          sessionNumber: 'Session 01',
          title: 'Diffusion Physics & Prompt Architecture in Midjourney & Flux',
          duration: '1h 14m',
          topics: ['Prompt syntax breakdown', 'Lens and lighting tokens', 'Aspect ratios', 'Negative weight balancing'],
          description: 'Deep dive into diffusion models, understanding latent space seeds, and crafting commercial visual concepts from scratch.',
          isPreviewAvailable: true,
          previewVideoUrl: '/videos/academy-hero.mp4',
          telegramMessageRef: 'Archive Post #01'
        },
        {
          sessionNumber: 'Session 02',
          title: 'Character Consistency & Commercial Studio Lighting',
          duration: '1h 22m',
          topics: ['LoRA & reference images', 'Multi-angle portraits', 'Retaining facial identity', 'Studio lighting setups'],
          description: 'Step-by-step masterclass on maintaining identical model identity across diverse environments and product placements.',
          isPreviewAvailable: false,
          telegramMessageRef: 'Archive Post #03'
        },
        {
          sessionNumber: 'Session 03',
          title: 'AI Voice Cloning, Audio Synthesis & Soundbeds',
          duration: '58 mins',
          topics: ['ElevenLabs voice cloning', 'Pacing and pauses', 'Layering background ambient tracks', 'Vocal EQ'],
          description: 'Learn to clone your own voice or synthesize hyper-natural professional narrator voices for commercial videos.',
          isPreviewAvailable: false,
          telegramMessageRef: 'Archive Post #05'
        },
        {
          sessionNumber: 'Session 04',
          title: 'Viral 9:16 Video Sequencing & CapCut Kinetic Captions',
          duration: '1h 35m',
          topics: ['Runway Gen-3 prompt mechanics', 'Dynamic camera movements', 'CapCut auto-captions', 'Hook pacing'],
          description: 'Transform still AI generations into cinematic moving video ads, TikToks, and Reels with viral retention formulas.',
          isPreviewAvailable: false,
          telegramMessageRef: 'Archive Post #08'
        }
      ],
      pdfDownloads: [
        {
          title: 'The Complete 2026 AI Prompt Engineering Master Blueprint',
          category: 'Master Blueprint',
          pages: '38 Pages',
          fileSize: '4.8 MB',
          description: 'Over 200+ battle-tested commercial prompts for Midjourney v6 and Flux, categorized by industry, lighting, and camera lens.',
          isDownloadableSample: true,
          sampleFileName: 'Vixora_AI_Prompting_Blueprint_Sample.pdf'
        },
        {
          title: 'Faceless Short-Form Video Production Cheatsheet',
          category: 'Cheatsheet',
          pages: '16 Pages',
          fileSize: '2.1 MB',
          description: 'Visual storyboard templates, 3-second hook formulas, and CapCut export presets for viral reach.',
          isDownloadableSample: true,
          sampleFileName: 'Faceless_Video_Production_Cheatsheet.pdf'
        },
        {
          title: 'AI Media Client Commercial Contract & Licensing Deck',
          category: 'Templates',
          pages: '12 Pages',
          fileSize: '1.4 MB',
          description: 'Commercial release agreement and copyright assignment contract for delivering AI assets to corporate clients.',
          isDownloadableSample: false,
          sampleFileName: 'Commercial_Licensing_Contract.pdf'
        }
      ],
      faqs: [
        {
          q: 'Do I need an expensive GPU or desktop computer for this track?',
          a: 'No. All tools taught (Midjourney, Flux, ElevenLabs, Runway) run entirely in the cloud. A basic laptop or smartphone with internet is all that is required.'
        },
        {
          q: 'How are the session recordings accessed?',
          a: 'All sessions are archived in high-definition inside our Private Telegram Cohort group with downloadable work files and ongoing mentor support.'
        },
        {
          q: 'Can I sell the images and videos I generate to clients?',
          a: 'Yes. You receive full commercial rights to everything you produce and we provide standard licensing agreements to protect your work.'
        }
      ]
    },
    {
      id: 'track-ai-automation',
      slug: 'ai-automation',
      title: 'AI Automation & Autonomous Systems',
      shortTitle: 'AI Automation',
      badge: 'Operational Efficiency',
      tagline: 'n8n nodes, webhook pipelines, autonomous agents & automated business workflows.',
      description: 'Stop doing repetitive manual tasks. Learn to build production-grade automated systems with n8n and Make that connect databases, CRMs, WhatsApp, and LLMs into self-executing business engines.',
      iconName: 'Workflow',
      accentColor: '#5B5FED',
      tools: ['n8n Self-Hosted', 'Make.com', 'OpenAI API', 'Webhook Trigger Architecture', 'Airtable', 'Telegram Bots'],
      courseId: 'course-ai-automation-digital-skills',
      tuition: '₦30,000',
      pdfGuideTitle: 'Autonomous Business Workflows & n8n Architecture Handbook (PDF)',
      sampleVideoTitle: 'Session 03: Building an End-to-End Inbound Lead Qualifier with n8n & OpenAI',
      sampleVideoDuration: '62 mins',
      keyTakeaways: [
        'Deploying and hosting self-hosted n8n instances on cloud servers',
        'Designing webhook listeners and reliable retry loops',
        'Integrating GPT-4o with function calling into CRM pipelines',
        'Automated WhatsApp and email qualification engines',
        'Selling automation retainers to local and international SMEs'
      ],
      curriculumWeeks: [
        {
          week: 'Week 1',
          title: 'Automation Mindset & Modern Visual Orchestration',
          summary: 'HTTP requests, JSON parsing, API authentication, and webhook event-driven architecture.',
          handsOnDeliverable: 'Live Automated Social & Email Lead Ingestion Pipeline',
          sessionCount: 2,
          hasPdf: true
        },
        {
          week: 'Week 2',
          title: 'Embedding LLMs into Workflows (n8n + AI Nodes)',
          summary: 'Structured output parsing, system prompt injection, and automated document synthesis.',
          handsOnDeliverable: 'AI-Powered Inbound Email Responder with Sentiment Classification',
          sessionCount: 2,
          hasPdf: true
        },
        {
          week: 'Week 3',
          title: 'CRM, Airtable & Multi-Channel Notification Hubs',
          summary: 'Bi-directional sync between databases, WhatsApp Business API, and automated PDF invoice generation.',
          handsOnDeliverable: 'Complete End-to-End Client Onboarding & Billing Automation Engine',
          sessionCount: 2,
          hasPdf: true
        },
        {
          week: 'Week 4',
          title: 'Error Handling, Rate Limiting & Enterprise Security',
          summary: 'Fail-safe architectures, webhook signing verification, and monitoring alerts.',
          handsOnDeliverable: 'Self-Healing Enterprise Workflow with Telegram Ops Alert Bot',
          sessionCount: 2,
          hasPdf: true
        }
      ],
      sessions: [
        {
          sessionNumber: 'Session 01',
          title: 'n8n Architecture, Docker Cloud Hosting & Webhook Nodes',
          duration: '1h 18m',
          topics: ['Self-hosted n8n VPS setup', 'SSL security', 'HTTP trigger nodes', 'Payload inspection'],
          description: 'Deploying your private n8n automation server on cloud instances and building your first robust webhook receiver.',
          isPreviewAvailable: true,
          previewVideoUrl: '/videos/academy-hero.mp4',
          telegramMessageRef: 'Archive Post #12'
        },
        {
          sessionNumber: 'Session 02',
          title: 'Embedding OpenAI Function Calling into Business Pipelines',
          duration: '1h 24m',
          topics: ['Structured JSON outputs', 'AI Router nodes', 'Dynamic system prompts', 'Lead scoring logic'],
          description: 'Harness LLMs within automated workflows to analyze incoming emails, extract customer intent, and route tasks intelligently.',
          isPreviewAvailable: false,
          telegramMessageRef: 'Archive Post #15'
        },
        {
          sessionNumber: 'Session 03',
          title: 'Automated WhatsApp Bot & Inbound CRM Data Sync',
          duration: '1h 31m',
          topics: ['WhatsApp Cloud API', 'Airtable bi-directional sync', 'State machine memory', 'Auto-responders'],
          description: 'Live build of a 24/7 autonomous WhatsApp sales assistant that answers inquiries and saves customer records to Airtable.',
          isPreviewAvailable: false,
          telegramMessageRef: 'Archive Post #18'
        },
        {
          sessionNumber: 'Session 04',
          title: 'Enterprise Error Traps, Retry Queues & Telegram Alert Bots',
          duration: '1h 05m',
          topics: ['Catch error triggers', 'Exponential backoff', 'Telegram incident alerts', 'Client handoff documentation'],
          description: 'Architecting resilient automated systems that never fail silently and alert you instantly in Telegram if an API changes.',
          isPreviewAvailable: false,
          telegramMessageRef: 'Archive Post #21'
        }
      ],
      pdfDownloads: [
        {
          title: 'Autonomous Business Workflows & n8n Architecture Handbook',
          category: 'Master Blueprint',
          pages: '45 Pages',
          fileSize: '5.2 MB',
          description: 'Comprehensive cloud deployment guide, security checklists, and 12 ready-to-import JSON workflow files.',
          isDownloadableSample: true,
          sampleFileName: 'Vixora_Automation_Blueprint_Sample.pdf'
        },
        {
          title: 'Webhook Integration & API Authentication Cheatsheet',
          category: 'Cheatsheet',
          pages: '18 Pages',
          fileSize: '1.9 MB',
          description: 'Quick reference for OAuth2 headers, bearer tokens, HMAC signature verification, and rate-limiting patterns.',
          isDownloadableSample: true,
          sampleFileName: 'Webhook_API_Cheatsheet.pdf'
        },
        {
          title: 'Automation Agency Client Retainer Proposal & SLA Deck',
          category: 'Templates',
          pages: '14 Pages',
          fileSize: '1.6 MB',
          description: 'Standard SLA agreement, maintenance retainer scopes, and pricing calculator for selling workflow automations.',
          isDownloadableSample: false,
          sampleFileName: 'Automation_SLA_Retainer_Contract.pdf'
        }
      ],
      faqs: [
        {
          q: 'Do I need programming experience to learn AI automation?',
          a: 'No. n8n and Make use visual node-based interfaces. We teach the fundamentals of JSON, APIs, and webhook logic from scratch.'
        },
        {
          q: 'How much does it cost to run self-hosted n8n?',
          a: 'A simple cloud VPS running Docker costs around $5 to $6/month and can handle thousands of workflow executions daily.'
        },
        {
          q: 'Are the pre-built JSON workflow templates included?',
          a: 'Yes. All 12 production workflows built during Cohort 1.0 are provided as downloadable JSON files in the Telegram vault.'
        }
      ]
    },
    {
      id: 'track-web-development',
      slug: 'ai-web-development',
      title: 'AI Web Development & Modern Design',
      shortTitle: 'AI Web Dev & Design',
      badge: 'Full-Stack Vibe Coding',
      tagline: 'React 19, Tailwind CSS, high-conversion UX & AI-accelerated frontend architecture.',
      description: 'Learn modern software engineering with an AI-first development toolchain. Build responsive, production-ready web applications, SaaS dashboards, and high-conversion client websites in record time.',
      iconName: 'Code2',
      accentColor: '#10B981',
      tools: ['React 19', 'TypeScript', 'Tailwind CSS', 'Vite', 'Cursor / Claude Sonnet', 'Figma', 'Vercel'],
      courseId: 'course-fullstack-vibe-coding',
      tuition: '₦50,000',
      pdfGuideTitle: 'The Modern Vibe Coder Architecture & Clean UI Design Guide (PDF)',
      sampleVideoTitle: 'Session 01: Rapid Component Scaffolding & Responsive Layouts with Tailwind',
      sampleVideoDuration: '55 mins',
      keyTakeaways: [
        'Component-driven architecture and atomic state management in React 19',
        'Tailwind CSS spatial math, responsive breakpoints, and tactile shadows',
        'Pair-programming effectively with LLM coding engines without losing control',
        'Building dynamic forms, payment gateway integrations, and client dashboards',
        'Deploying secure production web apps with zero configuration bugs'
      ],
      curriculumWeeks: [
        {
          week: 'Week 1',
          title: 'Modern Frontend Fundamentals & Clean UI Systems',
          summary: 'Semantic HTML5, CSS layout math, Flexbox/Grid, and Tailwind design tokens.',
          handsOnDeliverable: 'High-Converting Responsive Product Landing Page',
          sessionCount: 2,
          hasPdf: true
        },
        {
          week: 'Week 2',
          title: 'React 19 State, Hooks & Dynamic Interactivity',
          summary: 'Component props, state hooks, conditional rendering, and modal dialog controllers.',
          handsOnDeliverable: 'Interactive Web Application with Client-Side Filtering & Search',
          sessionCount: 2,
          hasPdf: true
        },
        {
          week: 'Week 3',
          title: 'API Integrations, Forms & Payment Checkouts',
          summary: 'Connecting REST APIs, form validation, error handling, and Paystack checkout.',
          handsOnDeliverable: 'Functional E-Commerce or Course Registration Gateway with Webhook Feedback',
          sessionCount: 2,
          hasPdf: true
        },
        {
          week: 'Week 4',
          title: 'Deployment, Domain Mapping & Performance Optimization',
          summary: 'SEO meta tags, Core Web Vitals optimization, Lighthouse 95+ score tuning, and custom domains.',
          handsOnDeliverable: 'Production Web Application Live on Custom Subdomain',
          sessionCount: 2,
          hasPdf: true
        }
      ],
      sessions: [
        {
          sessionNumber: 'Session 01',
          title: 'Modern UI Architecture, Tailwind Spatial Math & Component Design',
          duration: '1h 15m',
          topics: ['Tailwind v4 tokens', 'Responsive container math', 'Visual hierarchy', 'Color budgets'],
          description: 'Constructing high-converting responsive frontend components with zero design debt and pristine mobile behavior.',
          isPreviewAvailable: true,
          previewVideoUrl: '/videos/academy-hero.mp4',
          telegramMessageRef: 'Archive Post #24'
        },
        {
          sessionNumber: 'Session 02',
          title: 'React 19 State, Hooks & Pair-Programming with AI Engines',
          duration: '1h 42m',
          topics: ['Cursor & Claude workflows', 'Preventing AI slop', 'Managing component states', 'Atomic props'],
          description: 'How to pair-program at 10x velocity using LLMs without generating brittle or hallucinated code.',
          isPreviewAvailable: false,
          telegramMessageRef: 'Archive Post #27'
        },
        {
          sessionNumber: 'Session 03',
          title: 'Form Validation, Error Boundaries & Paystack Checkout Gateways',
          duration: '1h 28m',
          topics: ['Form state handling', 'Input sanitization', 'Paystack popup & redirect', 'Transaction verification'],
          description: 'Live implementation of secure payment processing, webhook feedback loops, and customer confirmation modals.',
          isPreviewAvailable: false,
          telegramMessageRef: 'Archive Post #30'
        },
        {
          sessionNumber: 'Session 04',
          title: 'Production Build Optimization, SEO Meta & Domain Deployment',
          duration: '1h 10m',
          topics: ['Vite build chunking', 'Lighthouse 95+ performance', 'OpenGraph meta cards', 'Custom DNS records'],
          description: 'Packaging and shipping modern web applications with rock-solid security, instant load times, and custom domain setup.',
          isPreviewAvailable: false,
          telegramMessageRef: 'Archive Post #33'
        }
      ],
      pdfDownloads: [
        {
          title: 'The Modern Vibe Coder Architecture & Clean UI Design Guide',
          category: 'Master Blueprint',
          pages: '34 Pages',
          fileSize: '3.9 MB',
          description: 'Design constitutions, nested border radius math, mobile touch target guidelines, and production layout patterns.',
          isDownloadableSample: true,
          sampleFileName: 'Vixora_Web_Design_Architecture_Sample.pdf'
        },
        {
          title: 'React 19 & Tailwind CSS Component Cheatsheet',
          category: 'Cheatsheet',
          pages: '22 Pages',
          fileSize: '2.4 MB',
          description: 'Quick-copy code snippets for responsive headers, modals, bento-grids, and animated state toggles.',
          isDownloadableSample: true,
          sampleFileName: 'React19_Tailwind_Cheatsheet.pdf'
        },
        {
          title: 'Web Development Client Service Agreement & Warranty SOW',
          category: 'Templates',
          pages: '15 Pages',
          fileSize: '1.7 MB',
          description: 'Legal terms covering milestone payments, scope creep prevention, and bug fix warranty clauses.',
          isDownloadableSample: false,
          sampleFileName: 'Web_Dev_Service_Agreement.pdf'
        }
      ],
      faqs: [
        {
          q: 'Is this track suitable for complete beginners to programming?',
          a: 'Yes. We teach the fundamentals of modern web architecture and show you how to leverage AI coding assistants to write clean, working code from day one.'
        },
        {
          q: 'What stack will we learn to build with?',
          a: 'You will master modern React 19, TypeScript, Tailwind CSS, and Vite, which are the highest-demand skills in modern software engineering.'
        },
        {
          q: 'Do I get access to the project code repositories?',
          a: 'Yes. All starter templates, boilerplates, and finished project repos are shared directly in the Telegram student community.'
        }
      ]
    },
    {
      id: 'track-client-acquisition',
      slug: 'client-acquisition-freelancing',
      title: 'Client Acquisition & Freelancing Masterclass',
      shortTitle: 'Client Acquisition',
      badge: 'Monetization & Sales',
      tagline: 'High-ticket positioning, Upwork optimization, cold outreach & closing international retainers.',
      description: 'Technical skills are worthless if you cannot sell them. Learn our exact agency outreach systems, proposal formulas, and pricing frameworks that win $1,000+ to $5,000+ monthly retainers from US, UK, and African clients.',
      iconName: 'Briefcase',
      accentColor: '#FFC107',
      tools: ['Upwork Pro Strategies', 'Cold Email Systems', 'LinkedIn Sales Navigator', 'Notion Proposals', 'Contract Templates'],
      courseId: 'course-client-acquisition-freelancing',
      tuition: '₦25,000',
      pdfGuideTitle: 'The $5,000/mo Freelance Agency Playbook & Proposal Templates (PDF)',
      sampleVideoTitle: 'Session 04: The 4-Part High-Ticket Proposal Framework that Won $3,200',
      sampleVideoDuration: '51 mins',
      keyTakeaways: [
        'Positioning yourself as a high-value specialist rather than a commodity freelancer',
        'Crafting Upwork proposals with an 80%+ interview invitation rate',
        'Cold email scripts that book discovery calls with foreign founders',
        'Conducting high-conversion diagnostic discovery calls without sounding salesy',
        'Structuring ongoing monthly retainers with international payment collection'
      ],
      curriculumWeeks: [
        {
          week: 'Week 1',
          title: 'High-Value Offer Packaging & Market Positioning',
          summary: 'Identifying profitable niches, framing outcomes over deliverables, and value pricing.',
          handsOnDeliverable: '1-Page Irresistible Service Offer Document with Tiered Pricing',
          sessionCount: 2,
          hasPdf: true
        },
        {
          week: 'Week 2',
          title: 'Upwork Mastery & Algorithmic Profile Optimization',
          summary: 'Profile copywriting, portfolio positioning, search tags, and proposal bidding strategy.',
          handsOnDeliverable: 'Top-Rated Caliber Upwork Profile & 3 Winning Custom Proposal Templates',
          sessionCount: 2,
          hasPdf: true
        },
        {
          week: 'Week 3',
          title: 'Direct Outbound (Cold Email, LinkedIn & Twitter/X)',
          summary: 'Lead scraping, personalization at scale, 3-step follow-up sequences, and inbox deliverability.',
          handsOnDeliverable: '50-Lead Qualified Prospect List & Automated Outbound Campaign Sequence',
          sessionCount: 2,
          hasPdf: true
        },
        {
          week: 'Week 4',
          title: 'Closing Calls, Contract Security & Retainer Scaling',
          summary: 'Handling price objections, drafting MSA/SOW contracts, and onboarding clients smoothly.',
          handsOnDeliverable: 'Standard Professional Client Agreement & Retainer Onboarding Checklist',
          sessionCount: 2,
          hasPdf: true
        }
      ],
      sessions: [
        {
          sessionNumber: 'Session 01',
          title: 'High-Ticket Offer Architecture & Niche Market Positioning',
          duration: '1h 10m',
          topics: ['Offer framing', 'Value-based pricing', 'Commodity trap avoidance', 'Positioning manifesto'],
          description: 'How to transition from a generic freelancer charging low hourly rates to a strategic partner delivering measurable business outcomes.',
          isPreviewAvailable: true,
          previewVideoUrl: '/videos/academy-hero.mp4',
          telegramMessageRef: 'Archive Post #36'
        },
        {
          sessionNumber: 'Session 02',
          title: 'Upwork Algorithm Optimization & High-Conversion Bidding',
          duration: '1h 25m',
          topics: ['Top-Rated algorithm triggers', 'Proposal first 2 lines hook', 'Portfolio case studies', 'Invite conversion'],
          description: 'Step-by-step masterclass on creating an irresistible profile that appears on the first page of client searches and bidding with an 80%+ reply rate.',
          isPreviewAvailable: false,
          telegramMessageRef: 'Archive Post #39'
        },
        {
          sessionNumber: 'Session 03',
          title: 'Multi-Channel Cold Outreach Engine (Email, LinkedIn & X)',
          duration: '1h 18m',
          topics: ['Scraping verified leads', 'Personalization at scale', '3-step follow-up sequences', 'Deliverability & DNS'],
          description: 'Deploying outbound automated funnels that land directly in corporate decision-maker inboxes without landing in spam.',
          isPreviewAvailable: false,
          telegramMessageRef: 'Archive Post #42'
        },
        {
          sessionNumber: 'Session 04',
          title: 'Discovery Calls, Price Anchoring & Closing $2,500+ Retainers',
          duration: '1h 05m',
          topics: ['Diagnostic call framework', 'Handling budget objections', 'Retainer vs project billing', 'Contract signing'],
          description: 'Live roleplay and teardown of a real client discovery call, anchoring prices to return on investment and closing recurring monthly retainers.',
          isPreviewAvailable: false,
          telegramMessageRef: 'Archive Post #45'
        }
      ],
      pdfDownloads: [
        {
          title: 'The $5,000/mo Freelance Agency Playbook & High-Ticket Blueprint',
          category: 'Master Blueprint',
          pages: '36 Pages',
          fileSize: '4.2 MB',
          description: 'Complete operating system covering offer design, outbound email scripts, proposal teardowns, and retainer onboarding protocols.',
          isDownloadableSample: true,
          sampleFileName: 'Vixora_Freelance_Agency_Playbook_Sample.pdf'
        },
        {
          title: 'Winning Upwork Proposal Templates & Battle-Tested Cover Letters',
          category: 'Cheatsheet',
          pages: '14 Pages',
          fileSize: '1.8 MB',
          description: 'Word-for-word proposal frameworks for AI, automation, and web development gigs with proven 80%+ response rates.',
          isDownloadableSample: true,
          sampleFileName: 'Upwork_Proposal_Templates.pdf'
        },
        {
          title: 'Standard International Client Master Services Agreement & SOW',
          category: 'Templates',
          pages: '12 Pages',
          fileSize: '1.5 MB',
          description: 'Ironclad client contract template with milestone schedules, retainer clauses, and dispute resolution terms.',
          isDownloadableSample: false,
          sampleFileName: 'Client_MSA_Retainer_Agreement.pdf'
        }
      ],
      faqs: [
        {
          q: 'Do I need existing freelance reviews or a large portfolio to get started?',
          a: 'No. We teach you how to build a portfolio of proof-of-concept case studies that prove competency before ever landing your first client.'
        },
        {
          q: 'How does client acquisition work for international markets like the US and UK?',
          a: 'We cover compliant payment setup (Wise, Payoneer, Paystack, Stripe) and show you how foreign clients hire and contract remote talent.'
        },
        {
          q: 'Can I combine this track with technical skills from other tracks?',
          a: 'Absolutely. In fact, combining Client Acquisition with AI Automation, AI Content, or Web Development yields the fastest path to high-ticket retainers.'
        }
      ]
    }
  ],
  resources: [
    {
      id: 'res-content-01',
      title: 'AI Prompt Engineering & Diffusion Model Cheatsheet (2026 Edition)',
      type: 'pdf',
      durationOrPages: '32 Pages',
      trackId: 'track-content-creation',
      trackName: 'AI Content Creation',
      description: 'Comprehensive syntax guide with 200+ tested commercial prompts, lighting modifiers, and aspect ratio formulas.',
      isPublicPreview: true,
      previewUrl: '/docs/sample-prompt-guide.pdf',
      lockedUrl: 'https://t.me/+vixora_cohort1_private',
      telegramMessageRef: 'Pinned Message #14'
    },
    {
      id: 'res-content-02',
      title: 'Session 01 Recording: Diffusion Models & Hyper-Realistic Human Generations',
      type: 'video',
      durationOrPages: '1h 14m',
      trackId: 'track-content-creation',
      trackName: 'AI Content Creation',
      description: 'Full unedited recorded masterclass explaining negative prompt weights, seed locking, and photorealistic skin textures.',
      isPublicPreview: false,
      lockedUrl: 'https://t.me/+vixora_cohort1_private',
      telegramMessageRef: 'Session Archive #01'
    },
    {
      id: 'res-auto-01',
      title: 'n8n Production Workflow Starter Kit & Architecture Blueprint',
      type: 'pdf',
      durationOrPages: '45 Pages',
      trackId: 'track-ai-automation',
      trackName: 'AI Automation',
      description: 'Step-by-step installation guides for Docker VPS deployment, webhook security, and 8 ready-to-import JSON workflows.',
      isPublicPreview: true,
      previewUrl: '/docs/sample-automation-blueprint.pdf',
      lockedUrl: 'https://t.me/+vixora_cohort1_private',
      telegramMessageRef: 'Pinned Message #22'
    },
    {
      id: 'res-auto-02',
      title: 'Session 02 Recording: Live Build of an Autonomous CRM & WhatsApp Bot',
      type: 'video',
      durationOrPages: '1h 28m',
      trackId: 'track-ai-automation',
      trackName: 'AI Automation',
      description: 'Watch Dean Sarumi build a production lead router with error traps, retries, and automated WhatsApp alert triggers in real-time.',
      isPublicPreview: false,
      lockedUrl: 'https://t.me/+vixora_cohort1_private',
      telegramMessageRef: 'Session Archive #04'
    },
    {
      id: 'res-web-01',
      title: 'Clean Code & Tailwind Responsive UI Systems Handbook',
      type: 'pdf',
      durationOrPages: '28 Pages',
      trackId: 'track-web-development',
      trackName: 'AI Web Dev & Design',
      description: 'Layout math, nested border radius formulas, mobile responsive rules, and high-conversion landing page skeletons.',
      isPublicPreview: true,
      previewUrl: '/docs/sample-web-ui-guide.pdf',
      lockedUrl: 'https://t.me/+vixora_cohort1_private',
      telegramMessageRef: 'Pinned Message #31'
    },
    {
      id: 'res-web-02',
      title: 'Session 03 Recording: Full-Stack Vibe Coding — From Blank Canvas to Production Web App',
      type: 'video',
      durationOrPages: '1h 42m',
      trackId: 'track-web-development',
      trackName: 'AI Web Dev & Design',
      description: 'Live build walkthrough showing how to direct AI models to generate reliable TypeScript React code without regressions.',
      isPublicPreview: false,
      lockedUrl: 'https://t.me/+vixora_cohort1_private',
      telegramMessageRef: 'Session Archive #07'
    },
    {
      id: 'res-client-01',
      title: 'The High-Ticket Proposal Template & Contract Agreement Deck',
      type: 'pdf',
      durationOrPages: '24 Pages',
      trackId: 'track-client-acquisition',
      trackName: 'Client Acquisition',
      description: 'Word-for-word pitch scripts, scope of work templates, payment milestone schedules, and client objection battlecards.',
      isPublicPreview: true,
      previewUrl: '/docs/sample-proposal-template.pdf',
      lockedUrl: 'https://t.me/+vixora_cohort1_private',
      telegramMessageRef: 'Pinned Message #45'
    },
    {
      id: 'res-client-02',
      title: 'Session 04 Recording: Discovery Call Tear-Down & Negotiating $2,500 Retainers',
      type: 'video',
      durationOrPages: '1h 05m',
      trackId: 'track-client-acquisition',
      trackName: 'Client Acquisition',
      description: 'Real client negotiation case study demonstrating how to anchor price on client ROI rather than hourly freelance rates.',
      isPublicPreview: false,
      lockedUrl: 'https://t.me/+vixora_cohort1_private',
      telegramMessageRef: 'Session Archive #11'
    }
  ]
};

export function getCohortTrackBySlug(slugOrId?: string): CohortTrackItem | undefined {
  if (!slugOrId) return undefined;
  const normalized = slugOrId.toLowerCase().trim();

  return COHORT_1_BUNDLE.tracks.find(track => {
    if (track.slug === normalized || track.id === normalized || track.courseId === normalized) return true;
    
    // Check aliases
    if (track.id === 'track-content-creation') {
      return (
        normalized === 'ai-content-creation' ||
        normalized === 'ai-image-short-videos-creation' ||
        normalized === 'content-creation' ||
        normalized === 'ai-content' ||
        normalized === 'track-1' ||
        normalized === '1'
      );
    }
    if (track.id === 'track-ai-automation') {
      return (
        normalized === 'ai-automation' ||
        normalized === 'ai-automation-digital-skills' ||
        normalized === 'automation' ||
        normalized === 'track-2' ||
        normalized === '2'
      );
    }
    if (track.id === 'track-web-development') {
      return (
        normalized === 'ai-web-development' ||
        normalized === 'full-stack-vibe-coding' ||
        normalized === 'web-development' ||
        normalized === 'ai-web-dev' ||
        normalized === 'vibe-coding' ||
        normalized === 'track-3' ||
        normalized === '3'
      );
    }
    if (track.id === 'track-client-acquisition') {
      return (
        normalized === 'client-acquisition' ||
        normalized === 'client-acquisition-freelancing' ||
        normalized === 'freelancing' ||
        normalized === 'track-4' ||
        normalized === '4'
      );
    }
    return false;
  });
}

export function getAllCohortTracks(): CohortTrackItem[] {
  return COHORT_1_BUNDLE.tracks;
}
