export interface PostItem {
  id: string;
  slug: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug: string;
  subcategoryName: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  excerpt: string;
  content: string[];
  keyTakeaways: string[];
  tags: string[];
  relatedPostSlugs?: string[];
}

export interface SubcategoryItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  postCount: number;
}

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  badge: string;
  iconName: string;
  description: string;
  subcategories: SubcategoryItem[];
  posts: PostItem[];
}

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: "cat-ai",
    slug: "ai-automation",
    name: "AI & Intelligent Automation",
    badge: "Enterprise AI",
    iconName: "Bot",
    description: "Architecting autonomous agent swarms, vector RAG retrieval pipelines, n8n automations, and LLM governance.",
    subcategories: [
      {
        id: "sub-agentic",
        slug: "agentic-workflows",
        name: "Agentic Workflows",
        description: "Autonomous multi-agent loops, reasoning chains, tool-calling APIs, and human-in-the-loop escalation.",
        postCount: 2
      },
      {
        id: "sub-integrations",
        slug: "enterprise-integrations",
        name: "Enterprise Integrations",
        description: "Connecting ERPs, CRMs, WhatsApp APIs, and legacy databases via self-hosted n8n workflows.",
        postCount: 1
      },
      {
        id: "sub-rag",
        slug: "rag-vector-db",
        name: "Vector Search & RAG",
        description: "Semantic document chunking, hybrid keyword-vector retrieval, and hallucination guardrails.",
        postCount: 1
      }
    ],
    posts: [
      {
        id: "post-ai-1",
        slug: "enterprise-ai-automation-playbook",
        title: "The Enterprise AI Automation Playbook (2025-2026)",
        categorySlug: "ai-automation",
        categoryName: "AI & Intelligent Automation",
        subcategorySlug: "agentic-workflows",
        subcategoryName: "Agentic Workflows",
        date: "September 2026",
        readTime: "7 min read",
        author: "Vixora AI Architecture Lab",
        authorRole: "Principal Systems Architects",
        excerpt: "An architectural blueprint for orchestrating resilient autonomous agent swarms, hybrid vector RAG databases, and strict token budget governance.",
        keyTakeaways: [
          "Single-prompt wrappers fail at scale; multi-agent specialized pods with distinct tool-calling boundaries reduce hallucination by 78%.",
          "Hybrid search combining BM25 keyword matching with dense vector embeddings yields 3.2x higher retrieval accuracy in internal knowledge retrieval.",
          "State persistence via Redis and Postgres WAL prevents deadlocks during asynchronous tool execution and API rate-limiting.",
          "Server-side secret sanitization and zero-trust perimeter checks prevent prompt injection across customer-facing agent endpoints."
        ],
        content: [
          "As organizations transition from experimental LLM chat interfaces to mission-critical operational systems, naive wrapper architectures inevitably crumble under real-world latency, rate limits, and nondeterministic outputs. True enterprise automation requires deterministic engineering around nondeterministic models.",
          "At Vixora Labs, our production deployments center on a four-tier architecture: Gateway Ingress with rate limiting & secret sanitization; Orchestrator Pods utilizing finite-state machines; Specialized Tool Workers executing sandboxed database/API actions; and Observability telemetry streaming token costs and latency metrics.",
          "Rather than tasking a single model with end-to-end reasoning, we deploy specialized sub-agents with narrow schemas. For example, in automated invoice processing, Agent Alpha extracts bounding boxes, Agent Beta validates tax IDs against accounting ERPs, and Agent Gamma generates the reconciliation audit log. If any sub-step fails, human-in-the-loop workflows route the transaction into a triage queue.",
          "When designing vector retrieval (RAG) for internal knowledge bases, semantic embeddings alone frequently miss exact acronyms, serial numbers, and client codes. Implementing reciprocal rank fusion (RRF) between dense vector search (like Gemini embeddings) and sparse lexical search (BM25) ensures both semantic understanding and exact keyword precision.",
          "Finally, cost governance must be hardcoded at the infrastructure level. Implement token circuit breakers, sliding window conversational compaction, and semantic response caching to maintain predictable cloud operating expenditure."
        ],
        tags: ["AI Agents", "FastAPI", "n8n", "Vector RAG", "Enterprise Architecture"],
        relatedPostSlugs: ["how-to-build-an-agentic-ai-workflow-with-python-fastapi-n8n", "zero-tech-debt-high-concurrency-saas-architecture"]
      },
      {
        id: "post-ai-2",
        slug: "how-to-build-an-agentic-ai-workflow-with-python-fastapi-n8n",
        title: "How to Build an Agentic AI Workflow with Python, FastAPI & n8n",
        categorySlug: "ai-automation",
        categoryName: "AI & Intelligent Automation",
        subcategorySlug: "agentic-workflows",
        subcategoryName: "Agentic Workflows",
        date: "August 2026",
        readTime: "6 min read",
        author: "Tariq Sterling",
        authorRole: "Lead Automation Engineer",
        excerpt: "A step-by-step engineering walkthrough to connecting LLMs to internal company databases and automating multi-step operational tasks safely.",
        keyTakeaways: [
          "Use FastAPI for high-throughput async webhook receivers and schema validation with Pydantic.",
          "Leverage n8n as the visual orchestration layer to handle external retries, auth tokens, and third-party API mutations.",
          "Always isolate database write operations behind idempotent database transactions and role-based access control.",
          "Return structured JSON schemas instead of free-form text to eliminate parsing errors in downstream webhooks."
        ],
        content: [
          "Connecting language models to production databases requires strict separation of concerns. The LLM should never have direct raw SQL write access to production clusters. Instead, define strict tool-calling functions with immutable parameters.",
          "In our reference architecture, an incoming customer trigger (e.g. WhatsApp support inquiry or portal ticket) hits a FastAPI endpoint. FastAPI validates the payload against a Pydantic schema, fetches the customer's sanitized account record, and formats an instruction block for the model.",
          "The model outputs a tool call: `query_order_status(order_id=\"ORD-9841\")`. FastAPI executes this specific read-only query and returns the structured status back to the agent.",
          "When a mutating action is required (e.g. issuing a refund or updating shipping address), the workflow branches into n8n. n8n triggers an automated approval notification to the team Slack or Telegram channel with one-click approve/reject buttons.",
          "Once confirmed by human staff, n8n executes the payment gateway refund and logs the signed transaction into the central audit ledger."
        ],
        tags: ["FastAPI", "Python", "n8n", "Webhooks", "PostgreSQL"],
        relatedPostSlugs: ["enterprise-ai-automation-playbook", "media-buying-high-conversion-ugc-ad-formulas"]
      },
      {
        id: "post-ai-3",
        slug: "autonomous-customer-support-agents-with-escalation",
        title: "Deploying Autonomous Tier-1 Support Agents with Safe Human Escalation",
        categorySlug: "ai-automation",
        categoryName: "AI & Intelligent Automation",
        subcategorySlug: "enterprise-integrations",
        subcategoryName: "Enterprise Integrations",
        date: "July 2026",
        readTime: "5 min read",
        author: "Vixora AI Architecture Lab",
        authorRole: "Technical Solutions Team",
        excerpt: "How leading brands resolve 70% of inbound customer queries instantly while maintaining 99.4% customer satisfaction ratings.",
        keyTakeaways: [
          "Sentiment anomaly detection allows the system to instantly escalate frustrated clients to human managers.",
          "Pre-computed contextual summaries save human agents 4-5 minutes per support ticket.",
          "Multi-channel synchronization keeps conversations in sync across Web Chat, WhatsApp, and Email."
        ],
        content: [
          "Customer experience degrades rapidly when users are forced to speak with rigid rule-based chatbots. By replacing decision-tree scripts with LLM agents grounded in vetted company documentation, inquiries are resolved in seconds with natural clarity.",
          "The critical success metric is not 100% automation; it is knowing when to yield to human judgment. When an agent detects high urgency, negative sentiment, or contractual edge cases, it initiates a warm handoff.",
          "The human specialist receives a 3-bullet summary of the issue, previous transaction history, and two suggested resolution paths ready for one-click approval."
        ],
        tags: ["Support Automation", "WhatsApp Bot", "Customer Success", "LLM Routing"],
        relatedPostSlugs: ["enterprise-ai-automation-playbook"]
      }
    ]
  },
  {
    id: "cat-software",
    slug: "software-engineering",
    name: "Software & Cloud Architecture",
    badge: "Cloud Scale",
    iconName: "Code2",
    description: "Building high-concurrency SaaS applications, modern frontend compilers, resilient microservices, and zero-downtime CI/CD.",
    subcategories: [
      {
        id: "sub-saas",
        slug: "saas-architecture",
        name: "SaaS Architecture",
        description: "Multi-tenant tenant isolation, subscription lifecycle, database sharding, and event-driven backends.",
        postCount: 2
      },
      {
        id: "sub-frontend",
        slug: "modern-frontend",
        name: "Modern Frontend",
        description: "React 19 compiler optimizations, Tailwind CSS architecture, and sub-100ms first-contentful-paint.",
        postCount: 1
      },
      {
        id: "sub-devops",
        slug: "cloud-devops",
        name: "Cloud & DevOps",
        description: "Docker containerization, Google Cloud Run ingress, SSL management, and automated rollbacks.",
        postCount: 1
      }
    ],
    posts: [
      {
        id: "post-soft-1",
        slug: "zero-tech-debt-high-concurrency-saas-architecture",
        title: "Zero Tech Debt: High-Concurrency SaaS Architecture",
        categorySlug: "software-engineering",
        categoryName: "Software & Cloud Architecture",
        subcategorySlug: "saas-architecture",
        subcategoryName: "SaaS Architecture",
        date: "August 2026",
        readTime: "8 min read",
        author: "Devon Chen",
        authorRole: "Principal Systems Architect",
        excerpt: "How to scale FastAPI, Next.js, and PostgreSQL to 500k+ monthly active users with zero downtime and sub-50ms latency.",
        keyTakeaways: [
          "Choose modular monoliths over premature microservices to avoid distributed transaction overhead in early-to-mid stage SaaS.",
          "Implement connection pooling with PgBouncer to prevent connection exhaustion during traffic spikes.",
          "Use read replicas for heavy analytics queries while reserving primary nodes for ACID write transactions.",
          "Cache serialized response fragments in Redis with cache-tag invalidation on write events."
        ],
        content: [
          "Premature microservice fragmentation is the leading cause of early-stage SaaS engineering gridlock. Network serialization latency, distributed tracing complexity, and cross-service transaction failures often cripple teams before product-market fit.",
          "At Vixora, our standard baseline architecture for high-concurrency applications is a clean modular monolith: a single deployable service internally organized with strict domain boundaries and private module interfaces.",
          "Database layer resilience is paramount. We pair PostgreSQL with PgBouncer running in transaction pooling mode. This allows tens of thousands of concurrent client requests to share hundreds of persistent database worker connections without memory ballooning.",
          "For read-intensive operations like dashboard reporting, queries route to read replicas, ensuring operational analytics never compete with incoming customer checkout transactions.",
          "On the frontend, pairing Next.js or Vite React with server-side caching and dynamic component streaming delivers instant initial renders and zero-cumulative-layout-shift."
        ],
        tags: ["FastAPI", "PostgreSQL", "Next.js", "Redis", "Cloud Architecture"],
        relatedPostSlugs: ["modern-web-architecture-react-19-tailwind-4", "enterprise-ai-automation-playbook"]
      },
      {
        id: "post-soft-2",
        slug: "modern-web-architecture-react-19-tailwind-4",
        title: "Modern Web Architecture in 2026: Why React 19 & Tailwind 4 Win",
        categorySlug: "software-engineering",
        categoryName: "Software & Cloud Architecture",
        subcategorySlug: "modern-frontend",
        subcategoryName: "Modern Frontend",
        date: "July 2026",
        readTime: "5 min read",
        author: "Soren Morales",
        authorRole: "Frontend Architecture Lead",
        excerpt: "Exploring the compiler-driven performance advantages, zero-runtime CSS overhead, and developer velocity improvements.",
        keyTakeaways: [
          "React 19 compiler automatically handles memoization, eliminating manual useMemo and useCallback boilerplate.",
          "Tailwind 4's Lightning CSS engine compiles stylesheets up to 10x faster with zero PostCSS configuration.",
          "Strict separation of UI components and business service layers keeps codebases maintainable across multi-engineer teams."
        ],
        content: [
          "The frontend tooling ecosystem has matured rapidly into a compiler-driven era. Gone are the days of manually tweaking dependency arrays in `useMemo` and `useCallback` to prevent cascading render cycles.",
          "The React 19 Compiler performs static analysis of component code at build time, optimizing reactive dependencies automatically. This results in smoother 60fps animations and leaner client bundle sizes.",
          "Combined with Tailwind CSS 4's native Rust-based Lightning CSS engine, styles compile in fractions of a second with zero runtime cost. Using unified CSS design tokens ensures dark and light themes transition seamlessly."
        ],
        tags: ["React 19", "Tailwind 4", "Frontend", "Performance", "Vite"],
        relatedPostSlugs: ["zero-tech-debt-high-concurrency-saas-architecture"]
      }
    ]
  },
  {
    id: "cat-growth",
    slug: "growth-marketing",
    name: "Growth Engineering & Media",
    badge: "High ROAS",
    iconName: "Megaphone",
    description: "Paid acquisition algorithms, AI-generated video ad pipelines, direct-response UGC, and full-funnel attribution.",
    subcategories: [
      {
        id: "sub-media",
        slug: "media-buying",
        name: "Media Buying Strategy",
        description: "Algorithmic ad campaign scaling across Meta, Google Ads, TikTok, and LinkedIn targeting high-LTV cohorts.",
        postCount: 2
      },
      {
        id: "sub-ugc",
        slug: "ai-ugc-creative",
        name: "AI UGC Video Production",
        description: "High-volume synthetic spokesperson video ads, viral hook iterations, and multi-format social assets.",
        postCount: 1
      },
      {
        id: "sub-cro",
        slug: "conversion-rate-optimization",
        name: "CRO & Funnel Optimization",
        description: "A/B testing landing page architectures, server-side CAPI tracking, and checkout friction elimination.",
        postCount: 1
      }
    ],
    posts: [
      {
        id: "post-grow-1",
        slug: "media-buying-high-conversion-ugc-ad-formulas",
        title: "Media Buying & High-Conversion UGC Ad Formulas",
        categorySlug: "growth-marketing",
        categoryName: "Growth Engineering & Media",
        subcategorySlug: "media-buying",
        subcategoryName: "Media Buying Strategy",
        date: "August 2026",
        readTime: "6 min read",
        author: "Nadia Thorne",
        authorRole: "Director of Paid Media",
        excerpt: "Data-driven creative production frameworks for lowering customer acquisition costs (CAC) by 40% across Meta & TikTok.",
        keyTakeaways: [
          "The first 3 seconds dictate 80% of ad ROI; test at least 5 distinct hook angles for every 1 core offer body.",
          "Synthetic and real UGC content outperforms polished commercial studio footage by 2.4x in click-through rate.",
          "Set up automated Dynamic Creative Testing (DCT) campaigns to let platform algorithms discover winning creative combinations.",
          "Implement server-side Conversions API (CAPI) to bypass browser ad-blockers and privacy drops."
        ],
        content: [
          "Paid advertising in 2026 is no longer about secret audience hacks or manual bidding tweaks. Meta and TikTok's machine learning algorithms are exceptionally good at finding buyers—if you feed them the right creative signals.",
          "The bottleneck for growth is creative velocity. Brands that test 30 to 50 ad iterations weekly consistently outperform those running 2 high-budget studio commercials.",
          "Our testing matrix breaks each ad into 3 modular building blocks: The Hook (seconds 0-3: pattern interruption, pain point, or visual contrast), The Body (seconds 4-25: proof, mechanism, and product demonstration), and The Call to Action (seconds 26-30: clear next step with urgency).",
          "By programmatically recombining 5 hooks with 3 body variations and 2 CTAs, we generate 30 distinct ad variations for rapid testing. Winners receive 80% of scaling budget while fatigued ads are rotated out automatically."
        ],
        tags: ["Meta Ads", "TikTok Ads", "UGC Video", "Media Buying", "ROAS Scaling"],
        relatedPostSlugs: ["scaling-paid-ads-with-ai-generated-ugc", "enterprise-ai-automation-playbook"]
      },
      {
        id: "post-grow-2",
        slug: "scaling-paid-ads-with-ai-generated-ugc",
        title: "Scaling Paid Ads with AI Generated UGC & High-Velocity Testing",
        categorySlug: "growth-marketing",
        categoryName: "Growth Engineering & Media",
        subcategorySlug: "ai-ugc-creative",
        subcategoryName: "AI UGC Video Production",
        date: "July 2026",
        readTime: "5 min read",
        author: "Vixora Media Collective",
        authorRole: "Creative Strategy Lab",
        excerpt: "How brands leverage generative video and voice clone pipelines to scale multilingual ad creatives without expensive video shoots.",
        keyTakeaways: [
          "AI video avatars and synthetic voiceovers allow testing 10x more hooks per week at 15% of the traditional production cost.",
          "Localizing voiceovers into multiple dialects expands ad efficiency into international markets instantly.",
          "Authenticity remains king: blend raw real-world footage with synthetic narration for maximum trust."
        ],
        content: [
          "Producing custom video for multiple international markets traditionally required booking studios, hiring voice actors, and spending weeks in post-production.",
          "With modern generative audio and lip-sync models, creative teams can test high-converting hooks across five languages within hours.",
          "The winning pattern is hybrid production: real customer screen recordings and product footage, paired with dynamic AI script-writing and rapid synthetic voiceover iterations."
        ],
        tags: ["AI Video", "Synthetic Media", "UGC Ads", "Direct Response"],
        relatedPostSlugs: ["media-buying-high-conversion-ugc-ad-formulas"]
      }
    ]
  },
  {
    id: "cat-design",
    slug: "branding-design",
    name: "Brand Systems & Product Design",
    badge: "Identity Craft",
    iconName: "Palette",
    description: "Tokenized design systems, WCAG accessibility, Figma variable architectures, and interfaces designed for AI-native UX.",
    subcategories: [
      {
        id: "sub-tokens",
        slug: "design-systems",
        name: "Design Systems & Tokens",
        description: "Semantic color tokens, mathematical typography scales, and seamless Figma-to-code synchronization.",
        postCount: 1
      },
      {
        id: "sub-genui",
        slug: "generative-ui",
        name: "Generative & AI UX",
        description: "Designing for streaming latency, nondeterministic outputs, confidence ratings, and infinite canvas workspaces.",
        postCount: 1
      },
      {
        id: "sub-identity",
        slug: "brand-identity",
        name: "Corporate Brand Identity",
        description: "Visual guidelines, typographic authority, pitch decks, and premium positioning strategies.",
        postCount: 1
      }
    ],
    posts: [
      {
        id: "post-des-1",
        slug: "designing-for-nondeterministic-ai-interfaces",
        title: "Designing for Nondeterministic AI Interfaces: Beyond Chatbots",
        categorySlug: "branding-design",
        categoryName: "Brand Systems & Product Design",
        subcategorySlug: "generative-ui",
        subcategoryName: "Generative & AI UX",
        date: "August 2026",
        readTime: "7 min read",
        author: "Soren Morales",
        authorRole: "Head of Design Systems",
        excerpt: "Traditional static UI patterns break when building AI-first products. Here is how to design for streaming states, confidence scores, and canvas workspaces.",
        keyTakeaways: [
          "Chat input bubbles are often lazy UX; modern AI interfaces should live in contextual inline drawers and infinite node canvases.",
          "Show micro-progress during streaming latency to keep perceived speed under 300 milliseconds.",
          "Always provide one-click rollback, source citations, and confidence indicators to build user trust.",
          "Mathematical 8pt spatial scales and high-contrast color pairings eliminate the feeling of generic 'AI slop'."
        ],
        content: [
          "When generative models first captured mainstream attention, every software product simply grafted a chat box onto their sidebar. But chat is a high-cognitive-friction interface: it forces users to formulate prompts from scratch.",
          "The next generation of AI-native products integrates generative intelligence directly into the user's natural workflow through canvas editors, generative smart chips, and inline suggestions.",
          "Handling latency is a primary UX challenge. When an LLM takes 2 to 4 seconds to compile a complex document, displaying a spinning circle induces anxiety. Instead, stream progressive tokens, highlight active reasoning phases, and render skeleton layouts that expand smoothly.",
          "Furthermore, trust requires verification. AI outputs must always feature accessible citation inspect-drawers, confidence tags, and one-click edit overrides so the human remains firmly in command."
        ],
        tags: ["UI/UX Design", "Figma", "Design Systems", "AI UX", "Accessibility"],
        relatedPostSlugs: ["the-vixora-obsidian-design-token-system", "enterprise-ai-automation-playbook"]
      },
      {
        id: "post-des-2",
        slug: "the-vixora-obsidian-design-token-system",
        title: "The Vixora Obsidian Design Token Architecture",
        categorySlug: "branding-design",
        categoryName: "Brand Systems & Product Design",
        subcategorySlug: "design-systems",
        subcategoryName: "Design Systems & Tokens",
        date: "July 2026",
        readTime: "5 min read",
        author: "Vixora Design Systems Team",
        authorRole: "Interface Architects",
        excerpt: "How we structured our mathematical spacing, nested corner radiuses, and high-contrast dark/light tokens in Figma and Tailwind CSS.",
        keyTakeaways: [
          "Nested corner radius math ensures cards never look visually warped: Inner Radius = Outer Radius - Padding.",
          "High-contrast light and dark themes share identical semantic variable names for effortless theme switching.",
          "Constraining body line lengths to 65-75 characters maximizes long-form reading comfort."
        ],
        content: [
          "Visual craft is not accidental—it is mathematical. When creating the Vixora Obsidian brand system, we established rigid geometric rules to eliminate visual clutter.",
          "Our nested corner radius formula (`R_inner = R_outer - Padding`) guarantees that internal cards, inputs, and buttons sit harmoniously inside parent containers without awkward gap pinch points.",
          "By implementing semantic tokens in Tailwind CSS (e.g. `--bg-canvas`, `--text-primary`, `--border-subtle`), our high-contrast light theme switch functions with zero layout shifts or legibility regressions."
        ],
        tags: ["Design Tokens", "Tailwind CSS", "Design Systems", "Typography"],
        relatedPostSlugs: ["designing-for-nondeterministic-ai-interfaces"]
      }
    ]
  }
];

// Helper Functions
export function getAllCategories(): CategoryItem[] {
  return CATEGORIES_DATA;
}

export function getCategoryBySlug(slug: string): CategoryItem | undefined {
  return CATEGORIES_DATA.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}

export function getSubcategoryBySlug(
  categorySlug: string,
  subcategorySlug: string
): SubcategoryItem | undefined {
  const cat = getCategoryBySlug(categorySlug);
  if (!cat) return undefined;
  return cat.subcategories.find(
    (s) => s.slug.toLowerCase() === subcategorySlug.toLowerCase()
  );
}

export function getAllPosts(): PostItem[] {
  const all: PostItem[] = [];
  CATEGORIES_DATA.forEach((cat) => {
    cat.posts.forEach((p) => all.push(p));
  });
  return all;
}

export function getPostBySlug(
  postSlug: string,
  categorySlug?: string
): PostItem | undefined {
  const all = getAllPosts();
  return all.find((p) => {
    const matchesSlug = p.slug.toLowerCase() === postSlug.toLowerCase();
    if (categorySlug) {
      return matchesSlug && p.categorySlug.toLowerCase() === categorySlug.toLowerCase();
    }
    return matchesSlug;
  });
}

export function getPostsByCategory(categorySlug: string): PostItem[] {
  const cat = getCategoryBySlug(categorySlug);
  return cat ? cat.posts : [];
}

export function getPostsBySubcategory(
  categorySlug: string,
  subcategorySlug: string
): PostItem[] {
  const posts = getPostsByCategory(categorySlug);
  return posts.filter(
    (p) => p.subcategorySlug.toLowerCase() === subcategorySlug.toLowerCase()
  );
}
