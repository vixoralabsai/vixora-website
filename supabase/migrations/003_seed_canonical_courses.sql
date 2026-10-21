-- ==============================================================================
-- Vixora Academy: 003_seed_canonical_courses.sql
-- Idempotently seeds all canonical academy courses from ACADEMY_COURSES
-- ==============================================================================

INSERT INTO courses (
  id,
  title,
  slug,
  price_naira,
  price_kobo,
  duration,
  level,
  badge,
  description,
  status
) VALUES 
  (
    'ai-image-short-videos-creation',
    'AI Image & Short Videos Creation',
    'ai-image-short-videos-creation',
    10000.00,
    1000000,
    '4 Weeks',
    'Beginner',
    'Fast-Track Sprint • ₦10,000',
    'Learn how to use state-of-the-art AI tools to create photorealistic images, stylized graphics, viral short-form video scripts, synthetic voiceovers, and captivating personal or faceless videos. From Midjourney, Flux, and Ideogram to CapCut, ElevenLabs, and Runway, you''ll build an automated creative content engine from your laptop or smartphone.',
    'published'
  ),
  (
    'data-analysis-cohort',
    'Data Analysis Cohort',
    'data-analysis-cohort',
    60000.00,
    6000000,
    '16 Weeks',
    'Beginner',
    'Early Tuition: ₦60,000',
    'A 16-week, project-based program that takes you through the full analyst toolkit: Excel → SQL → Power BI → AI-Assisted Analysis. You won''t just learn what a pivot table is. You''ll clean real messy datasets, write SQL queries that answer real business questions, build interactive Power BI dashboards, and finish with a portfolio-ready capstone project.',
    'published'
  ),
  (
    'ai-automation-digital-skills',
    'AI Automation & Digital Skills',
    'ai-automation-digital-skills',
    30000.00,
    3000000,
    '12 Weeks',
    'Beginner',
    'Early Tuition: ₦30,000',
    'A 12-week, hands-on program built for complete beginners who want to go from ''I''ve heard of ChatGPT'' to ''I automate things for a living'' — without writing a single line of code. Master AI productivity tools, scroll-stopping content generation, Make/Zapier/Notion automations, document handling, and client freelancing monetization.',
    'published'
  ),
  (
    'ai-automation-digital-business-systems',
    'AI Automation & Digital Business Systems',
    'ai-automation-digital-business-systems',
    60000.00,
    6000000,
    '12 Weeks',
    'Advanced',
    'Early Tuition: ₦60,000 (Reg ₦150,000+)',
    'Vixora Academy''s advanced, implementation-focused program for people ready to go beyond tools and start building. You''ll learn to design, build, and deploy AI-powered automations and solutions — the kind organizations and clients actually pay for — with hands-on mentorship, real business projects, and direct support.',
    'published'
  ),
  (
    'full-stack-vibe-coding',
    'Full Stack Vibe Coding',
    'full-stack-vibe-coding',
    50000.00,
    5000000,
    '12 weeks',
    'Beginner to Intermediate',
    '12-Week Production Cohort',
    'Learn to turn ideas into working full-stack products using modern AI-assisted development workflows. You will learn how to plan an application, build responsive interfaces, create backend APIs, connect databases, add authentication, integrate third-party services, debug with AI, use Git and GitHub, deploy to production, and present a finished portfolio project.',
    'published'
  ),
  (
    'fullstack-ai-engineering',
    'Full-Stack & Autonomous AI Engineering Cohort',
    'fullstack-ai-engineering',
    1850000.00,
    185000000,
    '12 Weeks',
    'Advanced',
    'Flagship Engineering Cohort',
    'Go beyond toy prompts and basic API wrappers. Learn how to architect enterprise-grade AI applications with deterministic execution, self-healing agent swarms, vector retrieval, pgvector indexing, and production deployment.',
    'published'
  ),
  (
    'executive-ai-strategy',
    'AI Strategy & Autonomous Operations for Executives',
    'executive-ai-strategy',
    2400000.00,
    240000000,
    '4 Weeks',
    'Executive',
    'Executive Leadership Track',
    'Cut through the AI hype and understand the actual unit economics, enterprise security frameworks, workflow transformations, and governance models required to build an AI-native organization.',
    'published'
  ),
  (
    'enterprise-workflow-automation',
    'Enterprise Workflow Automation with n8n & Python',
    'enterprise-workflow-automation',
    950000.00,
    95000000,
    '6 Weeks',
    'Intermediate',
    'High-Demand Practical Skills',
    'Replace costly Zapier subscriptions with self-hosted, unmetered n8n workflows integrated with custom Python logic, vector search, webhooks, and enterprise databases.',
    'published'
  ),
  (
    'ai-product-design-ui-ux',
    'AI-Native Product Design, UI/UX & Design Systems',
    'ai-product-design-ui-ux',
    1100000.00,
    110000000,
    '6 Weeks',
    'Intermediate',
    'Design & UX Masterclass',
    'Traditional static UI patterns fail when designing for nondeterministic AI experiences. Learn to craft streaming text interactions, agent feedback loops, canvas workspaces, and modern dark-mode design systems.',
    'published'
  ),
  (
    'generative-media-advertising',
    'Generative Media, UGC Ad Automation & Media Buying',
    'generative-media-advertising',
    850000.00,
    85000000,
    '4 Weeks',
    'All Levels',
    'Growth & Creative Track',
    'Lower customer acquisition costs by generating hundreds of personalized UGC video ads, testing hooks algorithmically, and managing scalable campaigns across Meta, TikTok, and Google Ads.',
    'published'
  ),
  (
    'machine-learning-data-science',
    'Machine Learning & Data Science',
    'machine-learning-data-science',
    60000.00,
    6000000,
    '18 weeks',
    'Beginner to Intermediate',
    '18-Week Comprehensive Cohort',
    'Learn how to work with data, uncover meaningful insights, build predictive models, and apply machine learning to real-world problems. This practical 18-week course takes learners from data analysis fundamentals through machine learning workflows, model evaluation, and portfolio-ready projects.',
    'published'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  price_naira = EXCLUDED.price_naira,
  price_kobo = EXCLUDED.price_kobo,
  duration = EXCLUDED.duration,
  level = EXCLUDED.level,
  badge = EXCLUDED.badge,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  updated_at = NOW();
