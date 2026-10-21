import { AcademyCourse } from '../../data/vixoraContent';

export interface CourseTool {
  name: string;
  category: string;
  color: string;
  glyph: string;
}

export function getCourseTools(course: AcademyCourse): CourseTool[] {
  const slug = course.slug;

  if (slug === 'data-analysis-cohort') {
    return [
      { name: 'SQL & PostgreSQL', category: 'Database Querying', color: '#5B5FED', glyph: 'SQL' },
      { name: 'Microsoft Power BI', category: 'BI & Dashboards', color: '#FFC107', glyph: 'PBI' },
      { name: 'Advanced Excel', category: 'Financial Modeling', color: '#10B981', glyph: 'XLS' },
      { name: 'Python for Analytics', category: 'Data Wrangling', color: '#6B3FB8', glyph: 'PY' },
      { name: 'DAX & Power Query', category: 'Data Modeling', color: '#FF8A65', glyph: 'DAX' },
      { name: 'Tableau Desktop', category: 'Visual Analytics', color: '#0F1535', glyph: 'TAB' },
      { name: 'Jupyter & Pandas', category: 'Exploratory Analysis', color: '#9030F8', glyph: 'PD' },
      { name: 'Git & GitHub', category: 'Version Control', color: '#334155', glyph: 'GIT' },
    ];
  }

  if (slug === 'full-stack-vibe-coding') {
    return [
      { name: 'Cursor AI', category: 'AI Code Editor', color: '#5B5FED', glyph: 'CUR' },
      { name: 'Claude 3.7 Sonnet', category: 'Reasoning Engine', color: '#FF8A65', glyph: 'CLD' },
      { name: 'v0 by Vercel', category: 'Generative UI', color: '#0F1535', glyph: 'V0' },
      { name: 'Bolt.new', category: 'Instant Full-Stack', color: '#FFC107', glyph: 'BLT' },
      { name: 'Tailwind CSS v4', category: 'Modern Styling', color: '#06B6D4', glyph: 'CSS' },
      { name: 'React 19 & TypeScript', category: 'Frontend Architecture', color: '#6B3FB8', glyph: 'TS' },
      { name: 'Supabase & PostgreSQL', category: 'Backend & Auth', color: '#10B981', glyph: 'SUP' },
      { name: 'Vercel Deployment', category: 'Cloud Edge Hosting', color: '#000000', glyph: 'VCL' },
    ];
  }

  if (slug === 'ai-automation-digital-skills') {
    return [
      { name: 'ChatGPT Plus', category: 'Prompt Engineering', color: '#10B981', glyph: 'GPT' },
      { name: 'Claude 3.7', category: 'Long-Form Reasoning', color: '#FF8A65', glyph: 'CLD' },
      { name: 'Midjourney v6', category: 'Commercial Visuals', color: '#6B3FB8', glyph: 'MJ' },
      { name: 'Make.com', category: 'Workflow Automation', color: '#5B5FED', glyph: 'MAK' },
      { name: 'Notion AI', category: 'Knowledge Systems', color: '#0F1535', glyph: 'NTN' },
      { name: 'Perplexity Pro', category: 'Deep Web Research', color: '#0284C7', glyph: 'PRP' },
      { name: 'Canva Magic Studio', category: 'Branded Design', color: '#9030F8', glyph: 'CNV' },
      { name: 'ElevenLabs', category: 'AI Voice & Speech', color: '#FFC107', glyph: 'ELV' },
    ];
  }

  if (slug === 'ai-automation-digital-business-systems') {
    return [
      { name: 'Make.com', category: 'Multi-App Scenarios', color: '#5B5FED', glyph: 'MAK' },
      { name: 'n8n Workflow Hub', category: 'Self-Hosted Automation', color: '#EA580C', glyph: 'N8N' },
      { name: 'OpenAI API & Functions', category: 'LLM Orchestration', color: '#10B981', glyph: 'API' },
      { name: 'Airtable Databases', category: 'Relational Low-Code', color: '#E11D48', glyph: 'AIR' },
      { name: 'Zapier Central', category: 'Quick Integrations', color: '#FF8A65', glyph: 'ZAP' },
      { name: 'Supabase Backend', category: 'Auth & DB Storage', color: '#16A34A', glyph: 'SUP' },
      { name: 'Vibe Coding Tools', category: 'Custom Micro-Apps', color: '#6B3FB8', glyph: 'IDE' },
      { name: 'WhatsApp & CRM APIs', category: 'Customer Pipelines', color: '#25D366', glyph: 'CRM' },
    ];
  }

  if (slug === 'fullstack-ai-engineering') {
    return [
      { name: 'LangChain & LangGraph', category: 'Agent State Machines', color: '#6B3FB8', glyph: 'LGC' },
      { name: 'LlamaIndex', category: 'RAG & Document Indexing', color: '#5B5FED', glyph: 'LLM' },
      { name: 'Pinecone & Qdrant', category: 'Vector Databases', color: '#0F1535', glyph: 'VEC' },
      { name: 'OpenAI / Claude APIs', category: 'LLM Foundations', color: '#10B981', glyph: 'API' },
      { name: 'Python & FastAPI', category: 'High-Speed APIs', color: '#059669', glyph: 'API' },
      { name: 'Next.js & TypeScript', category: 'Streaming Client UI', color: '#000000', glyph: 'NXT' },
      { name: 'Docker & Microservices', category: 'Containerized Deployment', color: '#0284C7', glyph: 'DCK' },
      { name: 'Langfuse Observability', category: 'Evals & Tracing', color: '#FFC107', glyph: 'TRC' },
    ];
  }

  if (slug === 'executive-ai-strategy') {
    return [
      { name: 'Enterprise AI Governance', category: 'Risk & Compliance', color: '#0F1535', glyph: 'GOV' },
      { name: 'AI Capital ROI Frameworks', category: 'P&L Strategy', color: '#10B981', glyph: 'ROI' },
      { name: 'Claude Enterprise & ChatGPT', category: 'Internal Knowledge', color: '#FF8A65', glyph: 'LLM' },
      { name: 'Vendor Evaluation Scorecards', category: 'Procurement Strategy', color: '#5B5FED', glyph: 'SCR' },
      { name: 'Enterprise LLM Security', category: 'Data Protection & IP', color: '#6B3FB8', glyph: 'SEC' },
      { name: 'Autonomous Workflows', category: 'Operational Scale', color: '#FFC107', glyph: 'OPS' },
      { name: 'AI Talent Architecture', category: 'Org Design', color: '#0284C7', glyph: 'HR' },
      { name: 'Executive Decision Models', category: 'Strategic Roadmaps', color: '#334155', glyph: 'STR' },
    ];
  }

  if (slug === 'enterprise-workflow-automation') {
    return [
      { name: 'Self-Hosted n8n', category: 'Core Workflow Engine', color: '#EA580C', glyph: 'N8N' },
      { name: 'Python Automation', category: 'Custom Scripting', color: '#6B3FB8', glyph: 'PY' },
      { name: 'Webhooks & REST APIs', category: 'Real-Time Sync', color: '#5B5FED', glyph: 'API' },
      { name: 'PostgreSQL & Redis', category: 'State & Caching', color: '#0284C7', glyph: 'SQL' },
      { name: 'Docker & Compose', category: 'Self-Hosting Stack', color: '#0284C7', glyph: 'DCK' },
      { name: 'OAuth2 & Security', category: 'Enterprise Auth', color: '#10B981', glyph: 'AUTH' },
      { name: 'Error Handling Queues', category: 'Resilient Retries', color: '#E11D48', glyph: 'QUE' },
      { name: 'HubSpot & Airtable APIs', category: 'CRM Pipelines', color: '#FFC107', glyph: 'CRM' },
    ];
  }

  if (slug === 'ai-product-design-ui-ux') {
    return [
      { name: 'Figma & Config Tokens', category: 'Design Systems', color: '#F24E1E', glyph: 'FIG' },
      { name: 'AI-Native UI Patterns', category: 'Streaming & Multi-modal', color: '#5B5FED', glyph: 'UI' },
      { name: 'v0 & Claude Artifacts', category: 'Generative Prototyping', color: '#0F1535', glyph: 'V0' },
      { name: 'Framer & Webflow', category: 'Production Interactive', color: '#0055FF', glyph: 'WEB' },
      { name: 'Midjourney & Relume', category: 'Visual Direction', color: '#6B3FB8', glyph: 'MJ' },
      { name: 'Spatial & Canvas UX', category: 'Infinite Workspaces', color: '#FF8A65', glyph: 'UX' },
      { name: 'Variable Fonts & Tokens', category: 'Modern Typography', color: '#10B981', glyph: 'FNT' },
      { name: 'User Testing & Heatmaps', category: 'Product Analytics', color: '#FFC107', glyph: 'ANA' },
    ];
  }

  if (slug === 'generative-media-advertising') {
    return [
      { name: 'Midjourney v6.1', category: 'Commercial Visuals', color: '#6B3FB8', glyph: 'MJ' },
      { name: 'Runway Gen-3 Alpha', category: 'Cinematic AI Video', color: '#5B5FED', glyph: 'RUN' },
      { name: 'ElevenLabs Voice AI', category: 'Photorealistic Audio', color: '#FFC107', glyph: 'AUD' },
      { name: 'Kling & Luma AI', category: 'Motion Synthesis', color: '#FF8A65', glyph: 'LUM' },
      { name: 'Meta Ads Manager', category: 'High-ROAS Media Buying', color: '#0081FB', glyph: 'ADS' },
      { name: 'CapCut AI & Premiere', category: 'UGC Hook Assembly', color: '#0F1535', glyph: 'PRM' },
      { name: 'Topaz Video AI', category: 'Upscaling & Clarity', color: '#0284C7', glyph: 'TPZ' },
      { name: 'Creative Testing Matrix', category: 'Ad Optimization', color: '#10B981', glyph: 'MTX' },
    ];
  }

  if (slug === 'machine-learning-data-science') {
    return [
      { name: 'Python for ML', category: 'Core Programming', color: '#6B3FB8', glyph: 'PY' },
      { name: 'Pandas & NumPy', category: 'Data Vectorization', color: '#5B5FED', glyph: 'NUM' },
      { name: 'Scikit-Learn', category: 'Supervised & Unsupervised', color: '#F97316', glyph: 'SKL' },
      { name: 'XGBoost & LightGBM', category: 'Gradient Boosted Trees', color: '#10B981', glyph: 'XGB' },
      { name: 'Matplotlib & Seaborn', category: 'Statistical Viz', color: '#0284C7', glyph: 'PLT' },
      { name: 'Jupyter & Colab', category: 'Notebook Environment', color: '#EA580C', glyph: 'NB' },
      { name: 'Streamlit Deployment', category: 'Interactive Web Apps', color: '#FF4B4B', glyph: 'STR' },
      { name: 'Git & Version Control', category: 'Model Tracking', color: '#334155', glyph: 'GIT' },
    ];
  }

  return [
    { name: 'Industry Tooling', category: 'Core Stack', color: '#5B5FED', glyph: 'DEV' },
    { name: 'Production Frameworks', category: 'Applied Systems', color: '#6B3FB8', glyph: 'SYS' },
    { name: 'Real-World Datasets', category: 'Case Studies', color: '#10B981', glyph: 'DAT' },
    { name: 'Git & Version Control', category: 'Workflow', color: '#0F1535', glyph: 'GIT' },
  ];
}
