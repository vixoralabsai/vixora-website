import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  Users,
  Award,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  Code2,
  Cpu,
  Layers,
  FileText,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  ExternalLink,
  CreditCard,
  Building2,
  MessageSquare,
  Globe,
  Play,
  Flame,
  Zap,
  Briefcase,
  Store,
  Compass,
  X,
  Star,
  Check,
  Smartphone,
  HelpCircle,
  TrendingUp,
  Target,
  UserCheck,
  Binary,
  Database,
  BrainCircuit,
  BarChart3,
  Lightbulb,
  Workflow
} from 'lucide-react';
import { AcademyCourse, CourseSyllabusModule, ACADEMY_COURSES } from '../data/vixoraContent';
import { BRAND_CONFIG, getWhatsAppUrl } from '../data/brandConfig';
import { WhatsAppContactButton } from '../components/WhatsAppContactButton';
import { BankPaymentDetailsCard } from '../components/BankPaymentDetailsCard';
import { CourseHeroSection } from '../components/course/CourseHeroSection';
import { CourseCurriculumSection } from '../components/course/CourseCurriculumSection';
import { CoursePricingSection } from '../components/course/CoursePricingSection';
import {
  ToolsMarqueeSection,
  CourseProblemSection,
  CourseRoadmapSection,
  CourseProjectsSection,
  CoursePedagogySection,
  CourseAudienceSection,
  CourseSpecsMatrixSection,
  CourseTestimonialsSection,
  CourseFaqSection,
  CourseFinalCtaSection,
  CourseMobileStickyBar
} from '../components/course/CourseSections';
import { getCourseTools } from '../components/course/CourseToolsData';
import { StickerLabel, TactileButton } from '../components/course/CourseVisualDecorations';

interface CourseLandingPageProps {
  course: AcademyCourse;
  onBackToAcademy: () => void;
  onEnroll: (course: AcademyCourse) => void;
  onSelectCourse?: (course: AcademyCourse) => void;
  onNavigateHome: () => void;
}

// ---------------------------------------------------------------------------
// HELPER: Dynamic Course Pricing Context
// ---------------------------------------------------------------------------
function parseCoursePricing(tuitionStr: string) {
  if (tuitionStr.includes('₦')) {
    const num = parseInt(tuitionStr.replace(/[^0-9]/g, ''), 10) || 60000;
    const standardNum = num <= 35000 ? 35000 : Math.round((num * 1.25) / 5000) * 5000;
    const savings = standardNum - num;
    return {
      early: tuitionStr,
      standard: `₦${standardNum.toLocaleString()}`,
      savings: `Save ₦${savings.toLocaleString()}`,
      currency: '₦'
    };
  } else if (tuitionStr.includes('$')) {
    const num = parseInt(tuitionStr.replace(/[^0-9]/g, ''), 10) || 1200;
    const standardNum = Math.round((num * 1.25) / 50) * 50;
    const savings = standardNum - num;
    return {
      early: tuitionStr,
      standard: `$${standardNum.toLocaleString()}`,
      savings: `Save $${savings.toLocaleString()}`,
      currency: '$'
    };
  }
  return {
    early: tuitionStr,
    standard: tuitionStr,
    savings: 'Special Early Rate',
    currency: ''
  };
}

// ---------------------------------------------------------------------------
// HELPER: Course-Specific Problem / Market Friction
// ---------------------------------------------------------------------------
interface CourseProblemData {
  tag: string;
  headline: string;
  sub: string;
  points: { title: string; desc: string; icon: string }[];
  quote: string;
}

function getCourseProblemData(course: AcademyCourse): CourseProblemData {
  const slug = course.slug;

  if (slug === 'machine-learning-data-science') {
    return {
      tag: 'THE MACHINE LEARNING & PREDICTIVE DATA GAP',
      headline: 'Every Modern Business Collects Data. Almost None Can Predict What Happens Next.',
      sub: 'Organizations are sitting on vast reserves of operational and customer data. Yet they face an acute shortage of practitioners who can clean features, build predictive algorithms, and deploy reliable machine learning models to solve business problems.',
      points: [
        {
          icon: '01',
          title: 'Beyond Static Reporting',
          desc: 'Descriptive spreadsheets only tell you what already happened. Machine learning equips you to forecast customer churn, model financial risks, and predict demands.'
        },
        {
          icon: '02',
          title: 'Practical Code vs. Theoretical Math',
          desc: 'Most tutorials get lost in academic proofs without showing you how to clean messy data, engineer features, evaluate models, and deploy Scikit-Learn pipelines.'
        },
        {
          icon: '03',
          title: 'Portfolio-Ready Proof',
          desc: 'Employers and clients hire for demonstrable code. You need real projects—from exploratory data analysis to deployed prediction APIs—to stand out immediately.'
        }
      ],
      quote:
        '"The market does not need more people who simply read about machine learning. It needs practitioners who can take raw, imperfect datasets, engineer predictive features, and deploy algorithms that drive tangible business outcomes."'
    };
  }

  if (slug === 'data-analysis-cohort') {
    return {
      tag: 'THE BUSINESS DATA & ANALYTICS GAP',
      headline: 'Companies Drown in Spreadsheets. High-Earning Analysts Turn Them into Revenue.',
      sub: 'Businesses collect gigabytes of transaction records, lead forms, and operational metrics daily. They desperately need professionals who can extract actionable clarity using SQL, Power BI, and structured analysis.',
      points: [
        {
          icon: '01',
          title: 'Data Without Direction',
          desc: 'Raw spreadsheets confuse leadership. Organizations need skilled analysts who can connect data sources, identify leaks, and communicate answers visually.'
        },
        {
          icon: '02',
          title: 'High-Demand Global Skills',
          desc: 'Excel is only step one. Employers pay premium salaries for talent proficient in relational SQL queries, interactive Power BI dashboards, and business acumen.'
        },
        {
          icon: '03',
          title: 'Structured, Zero-Fluff Roadmap',
          desc: 'Random internet videos leave knowledge gaps. A structured curriculum ensures you learn the exact tools and commercial workflows hiring managers test.'
        }
      ],
      quote:
        '"The tools are not the hard part—Excel, SQL, and Power BI are completely learnable. What is missing for most aspiring analysts is a guided, project-backed path that takes them from beginner to job-ready."'
    };
  }

  if (slug === 'fullstack-ai-engineering') {
    return {
      tag: 'PRODUCTION AI ARCHITECTURE REALITY',
      headline: 'Anyone Can Call an LLM API. Engineering Production-Ready AI Systems Is Rare.',
      sub: 'Companies are rushing to integrate AI into their products, but traditional software patterns break when handling stochastic outputs, latency bottlenecks, agent loops, and vector database retrieval.',
      points: [
        {
          icon: '01',
          title: 'Beyond Fragile Prompt Wrappers',
          desc: 'Toy wrappers fail in production. Real applications demand robust eval pipelines, semantic caching, fallback loops, and token budgeting.'
        },
        {
          icon: '02',
          title: 'Vector Databases, RAG & Agents',
          desc: 'Engineering autonomous agents with tool-calling capabilities and hybrid vector retrieval commands top-tier international compensation.'
        },
        {
          icon: '03',
          title: 'High-Demand Remote Engineering',
          desc: 'Global tech startups are aggressively hunting for full-stack developers who can architect and deploy complete AI-native applications.'
        }
      ],
      quote:
        '"The gap between a prototype notebook and a high-availability AI product serving thousands of concurrent users is enormous. That gap is where the most rewarding engineering careers exist."'
    };
  }

  if (slug === 'executive-ai-strategy') {
    return {
      tag: 'THE STRATEGIC LEADERSHIP CHALLENGE',
      headline: "The Biggest Risk Isn't AI Disruption. It's Incompetent AI Capital Allocation.",
      sub: 'Corporate leaders are overwhelmed with vendor pitches, pilot experiments that stall in development, and employee prompt confusion. Sustained competitive advantage requires strategic AI governance.',
      points: [
        {
          icon: '01',
          title: 'Wasted Pilot Budgets',
          desc: 'Over 70% of enterprise AI trials fail to yield measurable ROI due to poor data readiness and misaligned commercial KPIs.'
        },
        {
          icon: '02',
          title: 'Security & Compliance Blindspots',
          desc: 'Data leaks, IP exposure, and regulatory penalties threaten companies that adopt AI tools without clear enterprise governance policies.'
        },
        {
          icon: '03',
          title: 'Disproportionate Operating Leverage',
          desc: 'Organizations that thoughtfully weave autonomous agents into core business operations achieve 3x to 5x operational leverage over peers.'
        }
      ],
      quote:
        '"AI will not replace executives, but executives who leverage AI effectively will swiftly replace those who treat it as an IT novelty."'
    };
  }

  if (slug === 'enterprise-workflow-automation') {
    return {
      tag: 'THE ENTERPRISE INTEGRATION BOTTLENECK',
      headline: 'SaaS Subscriptions Multiply. Disconnected Tools Waste Hundreds of Engineering Hours.',
      sub: 'Modern businesses juggle dozens of specialized software platforms—CRMs, ERPs, accounting systems, and support queues. Relying on costly per-task Zapier plans or manual copy-pasting leads to broken syncs and ballooning software budgets.',
      points: [
        {
          icon: '01',
          title: 'Self-Hosted n8n vs. Metered SaaS',
          desc: 'Run millions of workflow executions without per-task fees by deploying unmetered, self-hosted n8n infrastructure with Docker and SSL.'
        },
        {
          icon: '02',
          title: 'Custom Python Nodes & Complex Logic',
          desc: 'Surpass low-code limitations by integrating custom Python scripts, SQL database connectors, and resilient error recovery loops.'
        },
        {
          icon: '03',
          title: 'Enterprise Security Behind Firewalls',
          desc: 'Keep proprietary company data, webhooks, and customer records securely within your own cloud infrastructure instead of third-party clouds.'
        }
      ],
      quote:
        '"Enterprise automation is not about making simple two-step Zapier connections. It is about architecting self-hosted, unmetered pipelines that reliably sync mission-critical business data 24/7 without recurring per-task costs."'
    };
  }

  if (slug === 'ai-product-design-ui-ux') {
    return {
      tag: 'THE AI-NATIVE INTERFACE DESIGN GAP',
      headline: 'Static UI Patterns Fail for AI. Designers Must Master Nondeterministic UX.',
      sub: 'Traditional form-and-button web design cannot handle streaming text, variable model latency, confidence scores, agent feedback loops, or infinite canvas workspaces. Top tech companies pay top rates for product designers who understand AI interaction design.',
      points: [
        {
          icon: '01',
          title: 'Designing for Latency & Streaming',
          desc: 'Design token streaming feedback, loading states, and graceful error handling when models hallucinate or lag.'
        },
        {
          icon: '02',
          title: 'Scalable Obsidian Design Systems',
          desc: 'Build dark-mode design tokens, modular component libraries, and Figma variables tailored for complex AI dashboards.'
        },
        {
          icon: '03',
          title: 'Interactive Canvas & Agent Visualizers',
          desc: 'Prototype multi-turn agent conversations, tool-calling badges, and spatial canvas workflows that delight users.'
        }
      ],
      quote:
        '"Users do not abandon AI products because the underlying model is weak. They abandon them because the interface feels slow, confusing, and unresponsive. Crafting intuitive UX for nondeterministic software is the most sought-after skill in product design today."'
    };
  }

  if (slug === 'generative-media-advertising') {
    return {
      tag: 'THE PERFORMANCE CREATIVE BOTTLENECK',
      headline: 'Ad Creative Fatigue Kills Campaigns. Generative Media Scales Winning Ads in Minutes.',
      sub: 'Paid social algorithms on Meta and TikTok demand dozens of fresh creative hooks every week. Traditional video shoots take weeks and thousands of dollars, suffocating return on ad spend before scaling.',
      points: [
        {
          icon: '01',
          title: 'High-Converting UGC Video at Scale',
          desc: 'Produce realistic synthetic avatars, custom voiceovers, and dynamic video edits using Midjourney, Runway, and ElevenLabs.'
        },
        {
          icon: '02',
          title: 'Algorithmic Hook Testing',
          desc: 'Test 50+ video hooks and visual angles simultaneously to discover winning customer acquisition creatives.'
        },
        {
          icon: '03',
          title: 'Media Buying & Scaling Past $50k/mo',
          desc: 'Combine creative volume with structured campaign bidding, audience scaling, and ROAS optimization.'
        }
      ],
      quote:
        '"In modern performance marketing, creative volume is the single largest lever for reducing CPA. Media buyers who master generative video production outpace traditional production agencies by 10x."'
    };
  }

  if (slug === 'ai-automation-digital-business-systems') {
    return {
      tag: 'THE SYSTEMS & MONETIZATION GAP',
      headline: 'Knowing AI Tools Gets You Noticed. Building AI Systems Gets You Paid.',
      sub: 'There is a massive distinction between someone who plays with prompt generators and someone who builds autonomous business infrastructure that saves 15+ hours every single week.',
      points: [
        {
          icon: '01',
          title: 'Prompting Is a Low Ceiling',
          desc: 'Typing casual ChatGPT prompts is a commodity. Clients do not pay monthly retainers for simple text prompts they can generate themselves.'
        },
        {
          icon: '02',
          title: 'Systems Command Recurring Retainers',
          desc: 'Businesses happily pay ₦200,000+ to $2,500/month for automated CRM lead triage, invoice generation, customer routing, and multi-app syncs.'
        },
        {
          icon: '03',
          title: 'Invoices vs. Resumes',
          desc: 'While average job seekers wait on endless resume queues, system builders package custom automation solutions directly for eager business owners.'
        }
      ],
      quote:
        '"If you already understand basic AI tools, staying at that level is not safe—it is a ceiling. The practitioners earning substantial income right now build, implement, and monetize end-to-end systems."'
    };
  }

  // Default / ai-automation-digital-skills
  return {
    tag: 'THE DIGITAL FLUENCY GAP',
    headline: "Everyone's Talking About AI. In 12 Weeks, You'll Actually Know How to Use It.",
    sub: 'Across every sector, professionals and creators using AI tools are completing tasks in minutes that used to take entire days. Getting started does not require coding—just the right step-by-step guidance.',
    points: [
      {
        icon: '01',
        title: 'Stand Out on Every Application',
        desc: 'Adding practical AI workflows, automated research, and media production to your CV immediately differentiates you from outdated candidates.'
      },
      {
        icon: '02',
        title: 'Fast Freelance Services',
        desc: 'Simple automated lead funnels, custom chatbots, and automated summaries that take 30 minutes to set up can be offered as valuable client services.'
      },
      {
        icon: '03',
        title: 'Produce 10x Faster',
        desc: 'Master prompt engineering, generative graphics, and visual automation tools to amplify your individual output without burnout.'
      }
    ],
    quote:
      '"You are not behind because you are not capable. You are behind because nobody gave you a clear, hands-on path from absolute zero to practical execution."'
  };
}

// ---------------------------------------------------------------------------
// HELPER: Dynamic 3-Phase Transformation from Course Syllabus
// ---------------------------------------------------------------------------
function getCourseTransformationPhases(course: AcademyCourse) {
  const slug = course.slug;
  const syllabus = course.weeklySyllabus;

  if (slug === 'machine-learning-data-science') {
    return [
      {
        phase: 'Phase 1: Foundations & Exploratory Data Analysis',
        duration: 'Weeks 1 – 6',
        title: 'Data Analysis Fundamentals & Python Environment',
        description: 'Environment Setup • Python & Jupyter Notebooks • NumPy & Pandas • Data Cleaning & Feature Wrangling • Exploratory Data Analysis • Statistical Distributions'
      },
      {
        phase: 'Phase 2: Predictive Algorithms & Modeling Pipelines',
        duration: 'Weeks 7 – 12',
        title: 'Machine Learning Algorithms & Scikit-Learn Pipelines',
        description: 'Supervised Learning (Regression) • Classification Algorithms • Model Evaluation & Cross-Validation • Feature Engineering & Selection • Unsupervised Learning & Clustering • Scikit-Learn Pipelines'
      },
      {
        phase: 'Phase 3: Model Evaluation, Deployment & Portfolio',
        duration: 'Weeks 13 – 18',
        title: 'Model Evaluation, API Deployment & Capstone Defense',
        description: 'Hyperparameter Tuning & Ensembles • Model Deployment with Flask/FastAPI • Real-World ML Applications • Capstone Project Design & Mentorship • Model Evaluation & Stress Testing • Final Capstone Presentation & Graduation'
      }
    ];
  }

  if (slug === 'data-analysis-cohort') {
    return [
      {
        phase: 'Phase 1: Excel Mastery & Business Data Hygiene',
        duration: 'Weeks 1 – 4',
        title: 'Data Hygiene, Formulas & Pivot Modeling',
        description: 'Excel Fundamentals & Data Cleaning • Advanced Formulas (XLOOKUP, INDEX/MATCH) • Pivot Tables & Dynamic Modeling • Commercial Dashboard Design & KPI Visualization'
      },
      {
        phase: 'Phase 2: Relational SQL Queries & Power BI Modeling',
        duration: 'Weeks 5 – 10',
        title: 'Relational Database Queries & Power BI Dashboards',
        description: 'SQL Basics & Filtering • Aggregations & Multi-Table Joins • Subqueries & Window Functions • Power BI Data Modeling & Star Schema • DAX Formulas & Interactive Visuals'
      },
      {
        phase: 'Phase 3: AI-Assisted Analysis & Capstone Portfolio',
        duration: 'Weeks 11 – 16',
        title: 'AI-Assisted Analysis & Executive Capstone Defense',
        description: 'AI Tools for Analysts (Automating SQL & Insights) • Portfolio Capstone Development • Business Presentation Strategy • Final Capstone Defense & Career Guidance'
      }
    ];
  }

  if (slug === 'fullstack-ai-engineering') {
    return [
      {
        phase: 'Phase 1: AI Core & Vector Architecture',
        duration: 'Weeks 1 – 4',
        title: 'TypeScript/Python AI Core & Vector Retrieval',
        description: 'LLM APIs & Prompt Engineering • Embeddings & Vector Databases (pgvector) • Hybrid Search & RAG Architecture • Semantic Caching & Latency Optimization'
      },
      {
        phase: 'Phase 2: Autonomous Agents & LangGraph',
        duration: 'Weeks 5 – 8',
        title: 'Autonomous Agent Swarms & LangGraph Orchestration',
        description: 'Multi-Agent State Machines • Tool-Calling & Deterministic Routing • Self-Healing Pipelines • Evaluation Suites & Model Observability'
      },
      {
        phase: 'Phase 3: Production Microservices & Deployment',
        duration: 'Weeks 9 – 12',
        title: 'Production Microservices & Capstone Launch',
        description: 'FastAPI/Node Microservices • Streaming Protocols & WebSocket Integration • Cloud Deployment & Containerization • Capstone Defense & Portfolio Showcase'
      }
    ];
  }

  if (slug === 'executive-ai-strategy') {
    return [
      {
        phase: 'Phase 1: Strategic Opportunity & Economics',
        duration: 'Week 1',
        title: 'Executive AI Economics & Opportunity Audit',
        description: 'The Modern AI Frontier • AI Unit Economics & Vendor Evaluation • Calculating Real ROI • Identifying High-Impact Transformation Levers'
      },
      {
        phase: 'Phase 2: Governance, Security & Workforce',
        duration: 'Weeks 2 – 3',
        title: 'Enterprise Governance, Security & Risk Mitigation',
        description: 'Data Privacy & IP Protection Policies • Compliance & Regulatory Frameworks • AI Workforce Transformation • Selecting Enterprise Technology Stacks'
      },
      {
        phase: 'Phase 3: Strategic Blueprint & Board Defense',
        duration: 'Week 4',
        title: 'Enterprise Transformation Blueprint & Executive Defense',
        description: 'Finalizing 12-Month AI Roadmap • Risk Mitigation Framework • Board-Ready Strategic Presentation • Executive Peer Review & Credential Sign-Off'
      }
    ];
  }

  if (slug === 'enterprise-workflow-automation') {
    return [
      {
        phase: 'Phase 1: Self-Hosted n8n Infrastructure',
        duration: 'Weeks 1 – 2',
        title: 'Self-Hosted n8n Infrastructure & Docker Setup',
        description: 'Docker Architecture & Deployment • Reverse Proxy, SSL & Webhook Security • Core n8n Nodes & Expression Logic • Eliminating SaaS Metering Fees'
      },
      {
        phase: 'Phase 2: Integrations & Custom Python Logic',
        duration: 'Weeks 3 – 4',
        title: 'Multi-Platform Integrations & Custom Python Logic',
        description: 'CRM & Database Webhook Syncs • Custom Python Nodes for Complex Rules • OpenAI & Local LLM Integration • Structured Data Transformation & Error Handling'
      },
      {
        phase: 'Phase 3: Production Deployments & Capstone',
        duration: 'Weeks 5 – 6',
        title: 'Production Resilience & Enterprise Capstone',
        description: 'Fault-Tolerant Retries & Dead-Letter Queues • Production Health Monitoring • Enterprise Lead/Data Engine Capstone • Verification & Deployment Defense'
      }
    ];
  }

  if (slug === 'ai-product-design-ui-ux') {
    return [
      {
        phase: 'Phase 1: Streaming UI & Obsidian Design Kit',
        duration: 'Weeks 1 – 2',
        title: 'AI Interaction Design & Obsidian Design Kit',
        description: 'Designing for Latency & Nondeterminism • Token Streaming States & Loading Feedbacks • Confidence Scores & Hallucination UX • Dark-Mode Token Architectures in Figma'
      },
      {
        phase: 'Phase 2: Canvas Workspaces & Generative UI',
        duration: 'Weeks 3 – 4',
        title: 'Canvas Workspaces & Generative UI Prototyping',
        description: 'Spatial Canvas Workspaces • Agent Feedback Loops & Tool-Calling Badges • Prototyping with Figma Variables • Generative Interface Patterns'
      },
      {
        phase: 'Phase 3: Design System & Capstone Portfolio',
        duration: 'Weeks 5 – 6',
        title: 'Complete Design System & Capstone Portfolio',
        description: 'Scalable Component Token Libraries • Interactive AI Prototype Defense • Live Portfolio Critiques • Packaging Your Design Case Study'
      }
    ];
  }

  if (slug === 'generative-media-advertising') {
    return [
      {
        phase: 'Phase 1: Multimodal Prompt Architecture',
        duration: 'Week 1',
        title: 'Multimodal Prompt Architecture & Asset Generation',
        description: 'Photorealistic Imagery with Midjourney v6 • Synthetic Voice Clones with ElevenLabs • Cinematic Video Generation with Runway Gen-3 • Brand Consistency Workflows'
      },
      {
        phase: 'Phase 2: Automated Video & Creative Testing',
        duration: 'Weeks 2 – 3',
        title: 'Automated Video Editing & Hook Testing Workflows',
        description: 'High-Converting UGC Video Frameworks • Algorithmic Hook Testing (50+ Variations) • Automated Assembly Pipelines • Pacing & Dynamic Captions'
      },
      {
        phase: 'Phase 3: Performance Media Buying & Scaling',
        duration: 'Week 4',
        title: 'Performance Media Buying & Campaign Scaling',
        description: 'Meta & TikTok Ads Campaign Structures • Bidding Strategies & Budget Allocation • Creative Fatigue Monitoring • Growth Engine Capstone Launch'
      }
    ];
  }

  if (slug === 'ai-automation-digital-business-systems') {
    return [
      {
        phase: 'Phase 1: Core Automations & Webhooks',
        duration: 'Weeks 1 – 4',
        title: 'Core Automations, n8n Pipelines & Webhooks',
        description: 'Foundation Automation Workflows • Webhook Triggers & Multi-App Syncs • Autonomous Lead Enrichment • CRM & Communications Integration'
      },
      {
        phase: 'Phase 2: Client Systems & Vibe Coding',
        duration: 'Weeks 5 – 8',
        title: 'Client Systems & Vibe Coding Micro-Apps',
        description: 'Document Intelligence & Ingestion • Automated Commercial Asset Pipelines • Building Custom AI Tools via Vibe Coding • Client Workflow Portals'
      },
      {
        phase: 'Phase 3: Commercial Retainers & Capstone',
        duration: 'Weeks 9 – 12',
        title: 'Commercial Retainers, Sales Scripts & Capstone Launch',
        description: 'Packaging Automation Retainers (₦200k-$2,500/mo) • Client Discovery & Proposal Templates • Enterprise Automation Capstone • Final Defense & Graduation'
      }
    ];
  }

  // Fallback: ai-automation-digital-skills or generic
  const total = syllabus.length;
  const p1 = syllabus.slice(0, Math.ceil(total / 3));
  const p2 = syllabus.slice(Math.ceil(total / 3), Math.ceil((2 * total) / 3));
  const p3 = syllabus.slice(Math.ceil((2 * total) / 3));

  return [
    {
      phase: 'Phase 1: Core Foundations & Workflows',
      duration: `${p1[0]?.week || 'Week 1'} – ${p1[p1.length - 1]?.week || 'Week 4'}`,
      title: p1[0]?.title || 'Foundations & Tooling',
      description: p1.map(m => m.title).join(' • ')
    },
    {
      phase: 'Phase 2: Practical Application & Pipelines',
      duration: `${p2[0]?.week || 'Week 5'} – ${p2[p2.length - 1]?.week || 'Week 8'}`,
      title: p2[0]?.title || 'Applied Problem Solving',
      description: p2.map(m => m.title).join(' • ')
    },
    {
      phase: 'Phase 3: Capstone Projects & Credential Defense',
      duration: `${p3[0]?.week || 'Week 9'} – ${p3[p3.length - 1]?.week || 'Week 12'}`,
      title: p3[p3.length - 1]?.title || 'Capstone Project & Credential Defense',
      description: p3.map(m => m.title).join(' • ')
    }
  ];
}

// ---------------------------------------------------------------------------
// HELPER: Course Audience Personas
// ---------------------------------------------------------------------------
interface AudiencePersona {
  role: string;
  desc: string;
}

function getCourseAudiencePersonas(course: AcademyCourse): AudiencePersona[] {
  const slug = course.slug;

  if (slug === 'machine-learning-data-science') {
    return [
      {
        role: 'Aspiring Data Scientists & ML Engineers',
        desc: 'Individuals ready to move beyond basic reporting into predictive modeling, feature engineering, and statistical learning algorithms.'
      },
      {
        role: 'Data & Business Analysts Upgrading Skills',
        desc: 'Analysts who already know Excel or SQL and want to upgrade their compensation by mastering Python, Scikit-Learn, and automated predictive pipelines.'
      },
      {
        role: 'Software Developers & Technical Builders',
        desc: 'Engineers seeking to embed predictive machine learning models, regression forecasts, and classification capabilities into real software.'
      },
      {
        role: 'STEM Graduates & Quantitative Professionals',
        desc: 'Graduates in economics, mathematics, engineering, or sciences looking for a fast, project-backed path into commercial data science.'
      }
    ];
  }

  if (slug === 'data-analysis-cohort') {
    return [
      {
        role: 'Career Changers & New Professionals',
        desc: 'Individuals looking to enter the high-demand tech and data field without needing a 4-year computer science degree or complex coding background.'
      },
      {
        role: 'Business, Finance & Operations Professionals',
        desc: 'Accountants, marketers, and operations managers who want to automate manual spreadsheet tasks and build interactive Power BI dashboards.'
      },
      {
        role: 'Recent University Graduates',
        desc: 'Graduates who need verified portfolio proof—demonstrating real SQL queries and BI dashboards—to stand out immediately to hiring managers.'
      },
      {
        role: 'Team Leads & Growing Entrepreneurs',
        desc: 'Founders and managers who need to extract real-time sales, inventory, and customer intelligence from raw spreadsheets to guide revenue decisions.'
      }
    ];
  }

  if (slug === 'fullstack-ai-engineering') {
    return [
      {
        role: 'Full-Stack & Frontend Developers',
        desc: 'Coders who want to build end-to-end AI applications, master vector databases, and implement autonomous agent patterns with LangGraph.'
      },
      {
        role: 'Backend & Systems Engineers',
        desc: 'Engineers who want to architect resilient LLM orchestration layers, semantic caching, and enterprise retrieval systems with pgvector.'
      },
      {
        role: 'Technical Founders & Builders',
        desc: 'Founders building AI-native SaaS products who require deterministic execution, low-latency APIs, and production-grade reliability.'
      },
      {
        role: 'Computer Science Graduates',
        desc: 'CS and engineering graduates who want to bypass junior generic developer roles and enter the high-compensation AI engineering space.'
      }
    ];
  }

  if (slug === 'executive-ai-strategy') {
    return [
      {
        role: 'C-Suite Executives (CEO, COO, CTO)',
        desc: 'Senior leaders responsible for capital allocation, risk management, and determining where AI delivers real enterprise leverage.'
      },
      {
        role: 'Business Unit Directors & VPs',
        desc: 'Department heads tasked with improving margin efficiency and scaling departmental output through strategic AI adoption.'
      },
      {
        role: 'Management Consultants & Advisors',
        desc: 'Advisors who need rigorous, board-level frameworks to assess enterprise AI readiness, calculate ROI, and guide client transformation.'
      },
      {
        role: 'Enterprise Innovation Leads',
        desc: 'Leaders charged with driving modernization across legacy business units without getting trapped in vendor hype or compliance risks.'
      }
    ];
  }

  if (slug === 'enterprise-workflow-automation') {
    return [
      {
        role: 'Systems & DevOps Administrators',
        desc: 'IT and infrastructure professionals wanting to self-host n8n with Docker, manage SSL, and eliminate recurring Zapier bills.'
      },
      {
        role: 'Operations & Business Process Engineers',
        desc: 'Professionals managing cross-department data flows between CRMs, ERPs, SQL databases, and team communication channels.'
      },
      {
        role: 'Backend Developers & Integrators',
        desc: 'Coders writing custom Python nodes, webhook handlers, and database triggers to automate business events.'
      },
      {
        role: 'Freelance Technical Automators',
        desc: 'Consultants who want to architect and maintain self-hosted enterprise automation infrastructure for high-paying corporate clients.'
      }
    ];
  }

  if (slug === 'ai-product-design-ui-ux') {
    return [
      {
        role: 'UI/UX & Digital Product Designers',
        desc: 'Designers wanting to lead the next generation of AI-native streaming apps, latency feedback loops, and infinite canvas tools.'
      },
      {
        role: 'Design Systems Leads & Specialists',
        desc: 'Practitioners building dark-mode token architectures, scalable component libraries, and Figma variables for complex web apps.'
      },
      {
        role: 'Frontend Engineers Transitioning to Product',
        desc: 'Developers wanting to master visual hierarchy, user psychology, streaming UX patterns, and modern Figma prototyping.'
      },
      {
        role: 'Design Agency Founders & Freelancers',
        desc: 'Agencies upgrading their service menu to charge premium rates for AI product prototyping, UX audits, and design systems.'
      }
    ];
  }

  if (slug === 'generative-media-advertising') {
    return [
      {
        role: 'Performance Marketers & Media Buyers',
        desc: 'Growth marketers running paid social on Meta and TikTok needing massive ad creative volume to scale past $50k/mo.'
      },
      {
        role: 'Creative Directors & Video Editors',
        desc: 'Creators wanting to master Midjourney, Runway Gen-3, and ElevenLabs to slash video production timelines and costs.'
      },
      {
        role: 'E-Commerce Brands & D2C Founders',
        desc: 'Store owners wanting to produce high-converting UGC video ads and synthetic product scenes without expensive studio shoots.'
      },
      {
        role: 'Digital Marketing Agencies',
        desc: 'Agencies looking to expand client retainers with automated creative testing pipelines and algorithmic hook generation.'
      }
    ];
  }

  if (slug === 'ai-automation-digital-business-systems') {
    return [
      {
        role: 'Freelancers & Solopreneurs',
        desc: 'People who want to package high-demand automation systems and close ₦200,000+ to $2,500/month recurring client retainers.'
      },
      {
        role: 'Agency Owners & Digital Marketers',
        desc: 'Agencies looking to add high-margin CRM automations, lead triage bots, and Vibe Coding tools to their client menu.'
      },
      {
        role: 'Operations & IT Managers',
        desc: 'Professionals looking to modernize internal company infrastructure, connect fragmented tools, and eliminate manual busywork.'
      },
      {
        role: 'Ambitious Knowledge Workers',
        desc: 'Workers aiming to establish themselves as the indispensable systems and automation architect in their company.'
      }
    ];
  }

  // Default / ai-automation-digital-skills
  return [
    {
      role: 'Complete Beginners to AI',
      desc: 'Anyone feeling overwhelmed by AI who wants a structured, step-by-step path to master core prompt and productivity tools from zero.'
    },
    {
      role: 'Office Workers & Administrators',
      desc: 'Professionals looking to complete weekly reports, research, data summarization, and email drafts in minutes instead of hours.'
    },
    {
      role: 'Content Creators & Marketers',
      desc: 'Writers, designers, and marketers who want to 10x their creative output using generative copy, imagery, and audio tools.'
    },
    {
      role: 'Small Business Owners',
      desc: 'Entrepreneurs who want to leverage free and low-cost AI tools to handle customer service, marketing, and admin without hiring a team.'
    }
  ];
}

// ---------------------------------------------------------------------------
// HELPER: Course Prerequisites "What You Do NOT Need"
// ---------------------------------------------------------------------------
function getCoursePrerequisitesNotNeeded(course: AcademyCourse): string[] {
  const slug = course.slug;

  if (slug === 'machine-learning-data-science') {
    return [
      'Advanced mathematics degree or theoretical PhD',
      'Prior machine learning or deep coding background (we teach Python from data basics)',
      'Expensive local GPU hardware (cloud computing environments are provided)'
    ];
  }

  if (slug === 'data-analysis-cohort') {
    return [
      'Prior computer science, coding, or statistics degree',
      'Prior programming experience in Python or C++',
      'Expensive enterprise software licenses (we use tools businesses already run on)'
    ];
  }

  if (slug === 'fullstack-ai-engineering') {
    return [
      'PhD in machine learning or theoretical AI research',
      'Prior experience with vector databases or LangGraph (we teach these from scratch)',
      'Costly server infrastructure or local GPU rigs'
    ];
  }

  if (slug === 'executive-ai-strategy') {
    return [
      'Programming, coding, or mathematical background',
      'Technical engineering certifications or IT administration experience',
      'Direct pipeline coding (focus is strategy, ROI, economics & governance)'
    ];
  }

  if (slug === 'enterprise-workflow-automation') {
    return [
      'Advanced computer science degree or full-stack software background',
      'Expensive recurring Zapier subscriptions (we focus on self-hosted n8n)',
      'Physical on-premise server infrastructure'
    ];
  }

  if (slug === 'ai-product-design-ui-ux') {
    return [
      'Coding or frontend software engineering background',
      '3D rendering or motion design expertise',
      'Paid enterprise design plugins or server setups'
    ];
  }

  if (slug === 'generative-media-advertising') {
    return [
      'Film school degree or professional camera studio',
      'Prior technical video editing expertise',
      'Large advertising budget to practice'
    ];
  }

  if (slug === 'ai-automation-digital-business-systems') {
    return [
      'Prior computer science degree or professional software background',
      'Months of complex coding experience',
      'Expensive proprietary software suites'
    ];
  }

  // Default / digital skills
  return [
    'Prior tech or coding experience of any kind',
    'Advanced mathematical or computer science knowledge',
    'Expensive computer hardware'
  ];
}

// ---------------------------------------------------------------------------
// HELPER: Dynamic Course Value Stack (Everything Included)
// ---------------------------------------------------------------------------
interface ValueStackItem {
  title: string;
  desc: string;
}

function getCourseValueStack(course: AcademyCourse): ValueStackItem[] {
  const capstoneName = course.capstoneProjects[0]?.title || 'Practical Capstone Deliverable';
  const highlights = course.highlights || [];

  return [
    {
      title: `${course.duration} Structured Curriculum`,
      desc: `Step-by-step masterclasses spanning ${course.weeklySyllabus.length} modules, specifically designed for ${course.title} with zero fluff and maximum real-world execution.`
    },
    {
      title: `Industry Capstone: ${capstoneName}`,
      desc: course.capstoneProjects.length > 1
        ? `Build and defend verifiable deliverables including "${capstoneName}" and "${course.capstoneProjects[1]?.title}" to anchor your professional portfolio.`
        : `Build and defend "${capstoneName}" with direct mentor feedback to prove commercial competence.`
    },
    {
      title: `Official ${course.certificateType}`,
      desc: `Verifiable ${course.certificateType} credential signed by Dean Sarumi Hammad upon graduation to showcase on your LinkedIn profile and CV.`
    },
    {
      title: `Direct Mentor Office Hours & Review`,
      desc: `Interactive feedback, practical lab troubleshooting, and dedicated Q&A sessions throughout the cohort so you never get stuck.`
    },
    {
      title: `${highlights[1] || 'Hands-On Domain Mastery'}`,
      desc: highlights[2] || `Direct hands-on training with industry-standard tooling, real datasets, and production frameworks.`
    },
    {
      title: `${course.format} Access & Network`,
      desc: `Live interactive sessions, recorded replays in your student portal, complete project resources, and our active builder network.`
    }
  ];
}

// ---------------------------------------------------------------------------
// HELPER: Course Value Framing Quote
// ---------------------------------------------------------------------------
function getCourseValueQuote(course: AcademyCourse): string {
  const slug = course.slug;

  if (slug === 'data-analysis-cohort') {
    return `The analytical capabilities gained in ${course.title} will pay for themselves the moment you deliver your first interactive Power BI dashboard, uncover a critical revenue leak, or secure your target data analyst role.`;
  }
  if (slug === 'machine-learning-data-science') {
    return `The predictive modeling capabilities gained in ${course.title} will pay for themselves the moment you deploy your first machine learning algorithm, complete your capstone defense, or step into a high-paying data science role.`;
  }
  if (slug === 'fullstack-ai-engineering') {
    return `The production engineering capabilities gained in ${course.title} will pay for themselves the moment you ship your first AI-native application, architect an autonomous agent swarm, or land a global engineering contract.`;
  }
  if (slug === 'executive-ai-strategy') {
    return `The strategic governance frameworks gained in ${course.title} will pay for themselves the moment you prevent your first misallocated enterprise AI investment, establish sound data governance, or deploy high-ROI operational leverage.`;
  }
  if (slug === 'enterprise-workflow-automation') {
    return `The enterprise systems capabilities gained in ${course.title} will pay for themselves the moment you replace your first recurring SaaS subscription with self-hosted n8n infrastructure or deploy a resilient cross-platform workflow.`;
  }
  if (slug === 'ai-product-design-ui-ux') {
    return `The design systems and streaming UX capabilities gained in ${course.title} will pay for themselves the moment you ship your first AI-native prototype, deliver a client design system, or secure a senior product design role.`;
  }
  if (slug === 'generative-media-advertising') {
    return `The programmatic creative capabilities gained in ${course.title} will pay for themselves the moment you scale your first winning ad campaign, cut video production costs by 80%, or onboard high-ticket performance marketing clients.`;
  }
  if (slug === 'ai-automation-digital-business-systems') {
    return `The systems building and client acquisition skills gained in ${course.title} will pay for themselves the moment you close your first monthly retainer or deliver your first automated client infrastructure.`;
  }
  return `The practical digital fluency gained in ${course.title} will pay for itself the moment you automate hours of tedious weekly work, amplify your creative output, or stand out in your job applications.`;
}

// ---------------------------------------------------------------------------
// HELPER: Course Testimonials
// ---------------------------------------------------------------------------
interface CourseTestimonial {
  quote: string;
  author: string;
  role: string;
  initials: string;
  gradient: string;
}

function getCourseTestimonials(course: AcademyCourse): CourseTestimonial[] {
  const slug = course.slug;

  if (slug === 'machine-learning-data-science') {
    return [
      {
        quote:
          'Before this 18-week course, machine learning felt like an intimidating wall of pure theory and academic calculus. The curriculum broke down regression, feature engineering, and Scikit-Learn pipelines into practical steps. Defending my end-to-end predictive capstone helped me land my first role as an Associate ML Analyst.',
        author: 'Tunde Adeyemi',
        role: 'Associate Machine Learning Analyst',
        initials: 'TA',
        gradient: 'from-blue-500 to-indigo-500'
      },
      {
        quote:
          'I spent months hopping between random online tutorials without building anything substantial. Here, building real predictive models, tuning hyperparameters, and deploying an inference API gave me a solid, tangible GitHub portfolio that hiring managers actually respected.',
        author: 'Chiamaka Eze',
        role: 'Junior Data Scientist',
        initials: 'CE',
        gradient: 'from-purple-500 to-pink-500'
      },
      {
        quote:
          'The hybrid format with live online labs and practical feedback was game-changing. The mentors walked us through real messy datasets, taught us proper cross-validation, and helped us avoid common data leakage pitfalls. Worth every naira of the ₦60,000 tuition.',
        author: 'Ibrahim Bello',
        role: 'Data Science Practitioner',
        initials: 'IB',
        gradient: 'from-emerald-500 to-teal-500'
      }
    ];
  }

  if (slug === 'data-analysis-cohort') {
    return [
      {
        quote:
          'I had zero coding background when I started. In 16 weeks, I went from struggling with basic Excel to writing multi-table SQL queries and building executive Power BI dashboards. I landed a full-time Business Operations Analyst role within 2 months of graduation.',
        author: 'Blessing Okonkwo',
        role: 'Business Operations Analyst',
        initials: 'BO',
        gradient: 'from-amber-500 to-yellow-500'
      },
      {
        quote:
          'The focus on solving real business problems instead of just clicking buttons is what makes Vixora different. The capstone project was identical to the technical assessment I was given during my interviews.',
        author: 'Emmanuel Oladipo',
        role: 'Data & BI Analyst',
        initials: 'EO',
        gradient: 'from-blue-500 to-cyan-500'
      },
      {
        quote:
          'Mentors reviewed our SQL queries, challenged our dashboard layouts, and showed us how to present insights to leadership. That executive presentation training was what set me apart from other candidates.',
        author: 'Zainab Mohammed',
        role: 'Financial Data Analyst',
        initials: 'ZM',
        gradient: 'from-purple-500 to-indigo-500'
      }
    ];
  }

  if (slug === 'fullstack-ai-engineering') {
    return [
      {
        quote:
          'The LangGraph orchestration and pgvector search modules alone made this cohort worth 10x the price. I went from wrapping OpenAI endpoints to architecting an autonomous multi-agent research swarm that runs reliably in production.',
        author: 'Alexandre Meyer',
        role: 'AI Software Engineer',
        initials: 'AM',
        gradient: 'from-indigo-500 to-cyan-500'
      },
      {
        quote:
          'Code reviews by senior infrastructure leads were brutal and deeply educational. Learning how to handle token latency, streaming WebSockets, and self-healing evaluation loops transformed how I write software.',
        author: 'Kavita Raman',
        role: 'Senior Backend Engineer',
        initials: 'KR',
        gradient: 'from-emerald-500 to-teal-500'
      },
      {
        quote:
          'This is not a prompt engineering bootcamp. You write real TypeScript and Python microservices, deploy real vector indexes, and defend your architecture in front of seasoned engineers.',
        author: 'David Van Der Berg',
        role: 'Full-Stack AI Builder',
        initials: 'DB',
        gradient: 'from-purple-500 to-violet-500'
      }
    ];
  }

  if (slug === 'executive-ai-strategy') {
    return [
      {
        quote:
          'The executive AI audit and governance framework completely changed how our board evaluates vendor proposals. We avoided a costly 6-figure enterprise software mistake in month one.',
        author: 'Dr. Olumide Adeleke',
        role: 'Chief Technology Officer',
        initials: 'OA',
        gradient: 'from-amber-500 to-yellow-500'
      },
      {
        quote:
          'The ROI modeling template alone justified the tuition. We moved our operations unit from scattered employee experiments to a governed, measurable AI deployment with clear KPI tracking.',
        author: 'Sarah Jenkins',
        role: 'VP of Operations',
        initials: 'SJ',
        gradient: 'from-purple-500 to-indigo-500'
      },
      {
        quote:
          'The private executive briefings cut straight through the marketing noise. Essential strategic clarity for any leader stewarding enterprise capital and planning multi-year technological modernization.',
        author: 'Marcus Thorne',
        role: 'Managing Director',
        initials: 'MT',
        gradient: 'from-emerald-500 to-teal-500'
      }
    ];
  }

  if (slug === 'enterprise-workflow-automation') {
    return [
      {
        quote:
          'We migrated over 120 client workflows from Zapier to self-hosted n8n on our private cloud, saving more than $2,400 per month while unlocking custom Python logic and vector search.',
        author: 'David Balogun',
        role: 'Senior Systems Architect',
        initials: 'DB',
        gradient: 'from-blue-500 to-cyan-500'
      },
      {
        quote:
          'Learning Docker deployment, webhook security, and database triggers gave me the confidence to architect mission-critical data pipelines connecting our PostgreSQL database to HubSpot.',
        author: 'Zainab Kabir',
        role: 'Enterprise Integration Lead',
        initials: 'ZK',
        gradient: 'from-purple-500 to-indigo-500'
      },
      {
        quote:
          'The 50+ pre-built n8n enterprise workflow templates paid for the program on day one. I packaged self-hosted automation infrastructure as a new service for our enterprise clients.',
        author: 'Roland Mensah',
        role: 'Technical Operations Consultant',
        initials: 'RM',
        gradient: 'from-emerald-500 to-teal-500'
      }
    ];
  }

  if (slug === 'ai-product-design-ui-ux') {
    return [
      {
        quote:
          'Designing for AI is completely different from designing standard SaaS. Learning how to handle token streaming, latency states, and canvas workspaces in Figma helped me land a Senior Product Designer role at an AI startup.',
        author: 'Jessica Taylor',
        role: 'Lead Product Designer',
        initials: 'JT',
        gradient: 'from-pink-500 to-rose-500'
      },
      {
        quote:
          'The Vixora Obsidian Design Kit and token architecture are exceptional. I went from struggling with static layouts to building responsive, variable-driven AI component libraries.',
        author: 'Ahmed Radwan',
        role: 'Design Systems Engineer',
        initials: 'AR',
        gradient: 'from-purple-500 to-violet-500'
      },
      {
        quote:
          'Client expectations for AI interfaces are evolving rapidly. This course gave me the exact portfolio proof—an interactive AI canvas and design system—that won my biggest client project to date.',
        author: 'Folake Davies',
        role: 'Freelance UX Consultant',
        initials: 'FD',
        gradient: 'from-blue-500 to-indigo-500'
      }
    ];
  }

  if (slug === 'generative-media-advertising') {
    return [
      {
        quote:
          'We scaled our Meta ad spend from $15k to over $60k per month by testing 40+ generative video variations weekly. Our customer acquisition cost dropped by 34%.',
        author: 'Daniel Evans',
        role: 'Performance Marketing Lead',
        initials: 'DE',
        gradient: 'from-amber-500 to-orange-500'
      },
      {
        quote:
          'Creating photorealistic product scenes and synthetic UGC video in Runway and Midjourney cut our client video production timeline from three weeks to 48 hours.',
        author: 'Chioma Valentine',
        role: 'E-commerce Agency Founder',
        initials: 'CV',
        gradient: 'from-emerald-500 to-teal-500'
      },
      {
        quote:
          'The programmatic creative testing framework is gold. Instead of guessing which creative hook converts, we test systematic visual angles that reliably find winning ads.',
        author: 'Liam O’Connor',
        role: 'Paid Social Media Buyer',
        initials: 'LO',
        gradient: 'from-purple-500 to-indigo-500'
      }
    ];
  }

  if (slug === 'ai-automation-digital-business-systems') {
    return [
      {
        quote:
          'I closed my first ₦350,000 monthly automation retainer in week 8 of this program using the exact client acquisition scripts Dean Hammad shared. The n8n lead routing pipeline we built paid for my entire setup.',
        author: 'Kelechi Nwosu',
        role: 'Freelance Automation Specialist',
        initials: 'KN',
        gradient: 'from-purple-500 to-indigo-500'
      },
      {
        quote:
          'The jump from simple prompt tools to building real business infrastructure changed everything for my agency. Clients do not care about ChatGPT tricks; they care about systems that save them 20 hours a week.',
        author: 'Fatima Sanusi',
        role: 'Agency Founder',
        initials: 'FS',
        gradient: 'from-emerald-500 to-teal-500'
      },
      {
        quote:
          'The Vibe Coding module alone gave me the ability to build custom micro-tools for my clients without waiting on developers. Hands down the highest ROI educational investment I have made.',
        author: 'Damilola Adeleke',
        role: 'Systems Consultant',
        initials: 'DA',
        gradient: 'from-amber-500 to-yellow-500'
      }
    ];
  }

  // Default / ai-automation-digital-skills
  return [
    {
      quote:
        'I was completely overwhelmed by AI tools before this cohort. In 12 weeks, I learned how to automate my daily emails, write research briefs, and produce branded marketing materials in minutes. It completely changed how I work.',
      author: 'Grace Okafor',
      role: 'Operations Coordinator',
      initials: 'GO',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      quote:
        'As a small business owner, I could not afford an expensive marketing agency. Learning generative image workflows and AI customer reply systems saved me over ₦150,000 every single month in freelance fees.',
      author: 'Oluwaseun Bakare',
      role: 'Small Business Owner',
      initials: 'OB',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      quote:
        'The step-by-step guidance from scratch was exactly what I needed. No confusing technical jargon—just clear, practical tools that I started using on my job from week two.',
      author: 'Amina Yusuf',
      role: 'Digital Content Creator',
      initials: 'AY',
      gradient: 'from-purple-500 to-indigo-500'
    }
  ];
}

// ---------------------------------------------------------------------------
// HELPER: Curated Related & Upsell Tracks Mapping
// ---------------------------------------------------------------------------
interface RelatedCourseMapping {
  course: AcademyCourse;
  relationType: 'Prerequisite Foundation' | 'Natural Next Progression' | 'Advanced Upsell' | 'Companion Specialization';
  pitch: string;
}

function getRelatedCourses(current: AcademyCourse): RelatedCourseMapping[] {
  const all = ACADEMY_COURSES;
  const slug = current.slug;

  if (slug === 'machine-learning-data-science') {
    return [
      {
        course: all.find(c => c.slug === 'data-analysis-cohort') || all[0],
        relationType: 'Prerequisite Foundation',
        pitch: 'Master data extraction, SQL relational queries, and Power BI dashboards before diving into advanced predictive algorithms.'
      },
      {
        course: all.find(c => c.slug === 'fullstack-ai-engineering') || all[3],
        relationType: 'Natural Next Progression',
        pitch: 'Scale your predictive models into full-stack autonomous AI applications with production LLM pipelines, vector databases, and cloud deployment.'
      },
      {
        course: all.find(c => c.slug === 'enterprise-workflow-automation') || all[5],
        relationType: 'Companion Specialization',
        pitch: 'Deploy self-hosted n8n pipelines to automate data extraction, trigger your predictive ML models, and sync scored predictions back to production databases.'
      }
    ];
  }

  if (slug === 'data-analysis-cohort') {
    return [
      {
        course: all.find(c => c.slug === 'machine-learning-data-science') || all[8],
        relationType: 'Natural Next Progression',
        pitch: 'The natural step after descriptive analytics: move from reporting past numbers into training predictive machine learning models.'
      },
      {
        course: all.find(c => c.slug === 'enterprise-workflow-automation') || all[5],
        relationType: 'Advanced Upsell',
        pitch: 'Build automated data pipelines that extract, transform, and sync database records across enterprise tools using self-hosted n8n.'
      },
      {
        course: all.find(c => c.slug === 'fullstack-ai-engineering') || all[3],
        relationType: 'Companion Specialization',
        pitch: 'Learn how to build custom interactive data apps, vector search engines, and analytics dashboards with modern full-stack web frameworks.'
      }
    ];
  }

  if (slug === 'fullstack-ai-engineering') {
    return [
      {
        course: all.find(c => c.slug === 'machine-learning-data-science') || all[8],
        relationType: 'Companion Specialization',
        pitch: 'Deepen your foundational statistical understanding, feature engineering, and model training capabilities behind AI systems.'
      },
      {
        course: all.find(c => c.slug === 'ai-product-design-ui-ux') || all[6],
        relationType: 'Companion Specialization',
        pitch: 'Master the streaming UI patterns, canvas workspaces, and Figma design systems needed to build world-class user interfaces for your AI agents.'
      },
      {
        course: all.find(c => c.slug === 'executive-ai-strategy') || all[4],
        relationType: 'Advanced Upsell',
        pitch: 'Learn how to pitch, budget, and align complex AI engineering initiatives with corporate C-suite executives and board members.'
      }
    ];
  }

  if (slug === 'executive-ai-strategy') {
    return [
      {
        course: all.find(c => c.slug === 'enterprise-workflow-automation') || all[5],
        relationType: 'Companion Specialization',
        pitch: 'Discover how self-hosted n8n and unmetered integration pipelines eliminate recurring SaaS fees and protect sensitive corporate data.'
      },
      {
        course: all.find(c => c.slug === 'fullstack-ai-engineering') || all[3],
        relationType: 'Advanced Upsell',
        pitch: 'Upskill your senior technical staff to architect resilient, scalable AI engineering infrastructure and autonomous agents.'
      },
      {
        course: all.find(c => c.slug === 'data-analysis-cohort') || all[0],
        relationType: 'Companion Specialization',
        pitch: 'Ensure operational teams have strong data literacy in SQL and Power BI to support enterprise AI readiness and KPI reporting.'
      }
    ];
  }

  if (slug === 'enterprise-workflow-automation') {
    return [
      {
        course: all.find(c => c.slug === 'data-analysis-cohort') || all[0],
        relationType: 'Companion Specialization',
        pitch: 'Combine automated n8n data flows with SQL data warehouses and executive Power BI dashboards for full-cycle business intelligence.'
      },
      {
        course: all.find(c => c.slug === 'machine-learning-data-science') || all[8],
        relationType: 'Advanced Upsell',
        pitch: 'Trigger machine learning models and predictive scoring endpoints directly from your self-hosted enterprise pipelines.'
      },
      {
        course: all.find(c => c.slug === 'fullstack-ai-engineering') || all[3],
        relationType: 'Advanced Upsell',
        pitch: 'Graduate from workflow orchestration to engineering custom full-stack autonomous AI systems with Python and TypeScript.'
      }
    ];
  }

  if (slug === 'ai-product-design-ui-ux') {
    return [
      {
        course: all.find(c => c.slug === 'fullstack-ai-engineering') || all[3],
        relationType: 'Natural Next Progression',
        pitch: 'Bridge Figma prototypes into functioning full-stack AI applications with React, TypeScript, and API integrations.'
      },
      {
        course: all.find(c => c.slug === 'generative-media-advertising') || all[7],
        relationType: 'Companion Specialization',
        pitch: 'Generate high-fidelity marketing assets, synthetic UGC videos, and campaign visuals for the digital products you design.'
      },
      {
        course: all.find(c => c.slug === 'ai-automation-digital-skills') || all[1],
        relationType: 'Prerequisite Foundation',
        pitch: 'Build solid foundational fluency in core prompting, visual AI, and productivity automation tools.'
      }
    ];
  }

  if (slug === 'generative-media-advertising') {
    return [
      {
        course: all.find(c => c.slug === 'ai-product-design-ui-ux') || all[6],
        relationType: 'Companion Specialization',
        pitch: 'Design high-converting landing pages, interactive product prototypes, and coherent visual design systems for your ad campaigns.'
      },
      {
        course: all.find(c => c.slug === 'ai-automation-digital-business-systems') || all[2],
        relationType: 'Advanced Upsell',
        pitch: 'Automate customer lead capture, CRM onboarding, and invoice distribution from your high-converting advertising funnels.'
      },
      {
        course: all.find(c => c.slug === 'ai-automation-digital-skills') || all[1],
        relationType: 'Prerequisite Foundation',
        pitch: 'Gain versatile general AI productivity and visual workflow skills at an accessible rate.'
      }
    ];
  }

  if (slug === 'ai-automation-digital-skills') {
    return [
      {
        course: all.find(c => c.slug === 'ai-automation-digital-business-systems') || all[2],
        relationType: 'Natural Next Progression',
        pitch: 'The high-touch implementation tier: master n8n, Vibe Coding, client acquisition scripts, and closing ₦200,000+ monthly retainers.'
      },
      {
        course: all.find(c => c.slug === 'data-analysis-cohort') || all[0],
        relationType: 'Companion Specialization',
        pitch: 'Add rigorous Excel, SQL, and business intelligence capabilities to your digital resume for corporate roles.'
      },
      {
        course: all.find(c => c.slug === 'generative-media-advertising') || all[7],
        relationType: 'Companion Specialization',
        pitch: 'Scale your creative output with generative AI video, UGC ad creation, and digital media buying.'
      }
    ];
  }

  if (slug === 'ai-automation-digital-business-systems') {
    return [
      {
        course: all.find(c => c.slug === 'ai-automation-digital-skills') || all[1],
        relationType: 'Prerequisite Foundation',
        pitch: 'Recommended starting point if you need to build foundational confidence with core AI tools before client delivery.'
      },
      {
        course: all.find(c => c.slug === 'enterprise-workflow-automation') || all[5],
        relationType: 'Advanced Upsell',
        pitch: 'Scale from freelance client tools into self-hosted, unmetered enterprise n8n infrastructure with custom Python logic.'
      },
      {
        course: all.find(c => c.slug === 'fullstack-ai-engineering') || all[3],
        relationType: 'Advanced Upsell',
        pitch: 'Graduate from low-code platforms to building custom full-stack autonomous AI systems with Python and TypeScript.'
      }
    ];
  }

  // Fallback: 3 other courses from catalog
  return all
    .filter(c => c.slug !== current.slug)
    .slice(0, 3)
    .map((c, i) => ({
      course: c,
      relationType: i === 0 ? 'Natural Next Progression' : i === 1 ? 'Companion Specialization' : 'Advanced Upsell',
      pitch: c.subtitle
    }));
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT: CourseLandingPage
// ---------------------------------------------------------------------------
export function CourseLandingPage({
  course,
  onBackToAcademy,
  onEnroll,
  onSelectCourse,
  onNavigateHome
}: CourseLandingPageProps) {
  // Live ticking countdown timer for cohort urgency
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 20, seconds: 43 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 4, minutes: 20, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSwitchToCourse = (targetCourse: AcademyCourse) => {
    if (onSelectCourse) {
      onSelectCourse(targetCourse);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Derived contextual data for the selected course
  const pricing = parseCoursePricing(course.tuition);
  const problem = getCourseProblemData(course);
  const transformationPhases = getCourseTransformationPhases(course);
  const audiencePersonas = getCourseAudiencePersonas(course);
  const prerequisitesNotNeeded = getCoursePrerequisitesNotNeeded(course);
  const testimonials = getCourseTestimonials(course);
  const relatedCourses = getRelatedCourses(course);
  const tools = getCourseTools(course);

  return (
    <div id="course-landing-page" className="min-h-screen bg-[#FFFDF9] text-[#1A1D4F] font-sans selection:bg-[#5B5FED] selection:text-white pb-20 sm:pb-12 text-left">
      
      {/* 1. TOP STICKY NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b-2 border-[#1A1D4F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm overflow-hidden font-bold">
            <button
              onClick={onBackToAcademy}
              className="inline-flex items-center gap-1.5 text-[#1A1D4F] hover:text-[#5B5FED] transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-[#5B5FED]" />
              <span>Academy Catalog</span>
            </button>
            <span className="text-[#1A1D4F]/30">/</span>
            <span className="text-[#1A1D4F]/60 hidden md:inline truncate">{course.track}</span>
            <span className="text-[#1A1D4F]/30 hidden md:inline">/</span>
            <span className="text-[#5B5FED] font-black truncate">{course.title}</span>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            <a
              href={getWhatsAppUrl(`Hello Vixora Admissions, I am inquiring about ${course.title} (${course.tuition}).`)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-[#1A1D4F] bg-white text-xs font-bold text-[#1A1D4F] shadow-retro-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Admissions</span>
            </a>

            <TactileButton
              variant="primary"
              size="sm"
              onClick={() => onEnroll(course)}
            >
              <span>Enroll ({course.tuition})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </TactileButton>
          </div>
        </div>

        {/* Quick Section Anchor Ribbon */}
        <div className="border-t border-[#1A1D4F]/15 bg-[#FFF6EC]/70 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-4 sm:gap-6 text-xs font-bold text-[#1A1D4F]/70 whitespace-nowrap">
            <button onClick={() => scrollToSection("problem")} className="hover:text-[#5B5FED] transition-colors cursor-pointer">
              01. Reality
            </button>
            <button onClick={() => scrollToSection("transformation")} className="hover:text-[#5B5FED] transition-colors cursor-pointer">
              02. Roadmap
            </button>
            <button onClick={() => scrollToSection("curriculum")} className="hover:text-[#5B5FED] transition-colors cursor-pointer">
              03. Syllabus
            </button>
            <button onClick={() => scrollToSection("projects")} className="hover:text-[#5B5FED] transition-colors cursor-pointer">
              04. Capstones
            </button>
            <button onClick={() => scrollToSection("audience")} className="hover:text-[#5B5FED] transition-colors cursor-pointer">
              05. Who It\s For
            </button>
            <button onClick={() => scrollToSection("pricing")} className="hover:text-[#5B5FED] font-black text-[#5B5FED] transition-colors cursor-pointer">
              06. Tuition
            </button>
            <button onClick={() => scrollToSection("reviews")} className="hover:text-[#5B5FED] transition-colors cursor-pointer">
              07. Reviews
            </button>
            <button onClick={() => scrollToSection("faq")} className="hover:text-[#5B5FED] transition-colors cursor-pointer">
              08. FAQ
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <CourseHeroSection
        course={course}
        onEnroll={() => onEnroll(course)}
        onScrollToCurriculum={() => scrollToSection("curriculum")}
        timeLeft={timeLeft}
      />

      {/* 3. TOOLS & STACK MARQUEE */}
      <ToolsMarqueeSection tools={tools} />

      {/* 4. THE REALITY & MARKET GAP (PROBLEM vs SOLUTION) */}
      <CourseProblemSection problem={problem} course={course} />

      {/* 5. THE 4-STAGE TRANSFORMATION ROADMAP */}
      <CourseRoadmapSection phases={transformationPhases} />

      {/* 6. INTERACTIVE CURRICULUM & SYLLABUS BREAKDOWN */}
      <CourseCurriculumSection course={course} />

      {/* 7. PRACTICAL CAPSTONE PROJECTS */}
      <CourseProjectsSection capstones={course.capstoneProjects} courseTitle={course.title} />

      {/* 8. THE VIXORA LEARNING EXPERIENCE (PEDAGOGY) */}
      <CoursePedagogySection />

      {/* 9. WHO THIS COURSE IS FOR & WHAT YOU DO NOT NEED */}
      <CourseAudienceSection personas={audiencePersonas} notNeeded={prerequisitesNotNeeded} />

      {/* 10. FAST FACTS COURSE SPECIFICATIONS MATRIX */}
      <CourseSpecsMatrixSection course={course} />

      {/* 11. VERIFIED STUDENT TESTIMONIALS */}
      <CourseTestimonialsSection testimonials={testimonials} />

      {/* 12. TRANSPARENT PRICING & COHORT TUITION CARD */}
      <CoursePricingSection
        course={course}
        onEnroll={() => onEnroll(course)}
        pricing={pricing}
      />

      {/* 13. FREQUENTLY ASKED QUESTIONS */}
      <CourseFaqSection faqs={course.faqs} />

      {/* 14. RELATED TRACKS & SPECIALIZATION PATHWAYS */}
      {relatedCourses.length > 0 && (
        <section className="bg-[#FFFDF9] border-b-2 border-[#1A1D4F] py-20 text-left">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
              <StickerLabel color="bg-[#5B5FED]" textColor="text-white" rotate={0}>
                Learning Pathways
              </StickerLabel>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1A1D4F]">
                Complementary & Advanced Tracks
              </h2>
              <p className="text-xs sm:text-sm text-[#1A1D4F]/75">
                Build a competitive multi-disciplinary stack across software, data, and autonomous systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedCourses.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border-2 border-[#1A1D4F] shadow-retro rounded-2xl p-6 space-y-4 flex flex-col justify-between hover:-translate-y-1 transition-transform"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#FFF6EC] border border-[#1A1D4F] rounded text-[#FF8A65]">
                      {item.relationType}
                    </span>
                    <h3 className="text-lg font-black text-[#1A1D4F] leading-snug">
                      {item.course.title}
                    </h3>
                    <p className="text-xs text-[#1A1D4F]/75 leading-relaxed line-clamp-3">
                      {item.pitch}
                    </p>
                  </div>

                  <div className="pt-3 border-t-2 border-[#1A1D4F]/10 flex items-center justify-between">
                    <div className="text-xs font-black text-[#1A1D4F]">
                      {item.course.tuition}
                    </div>
                    <button
                      onClick={() => handleSwitchToCourse(item.course)}
                      className="inline-flex items-center gap-1 text-xs font-black text-[#5B5FED] hover:underline cursor-pointer"
                    >
                      <span>Explore Track</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 15. FINAL HIGH-CONVERSION ENROLLMENT BANNER */}
      <CourseFinalCtaSection
        course={course}
        onEnroll={() => onEnroll(course)}
      />

      {/* 16. MOBILE STICKY ENROLLMENT BAR */}
      <CourseMobileStickyBar
        course={course}
        onEnroll={() => onEnroll(course)}
      />

    </div>
  );
}
