import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { portalRouter, isPlainObject } from './server/studentPortalServer.js';
import { paystackRouter } from './server/paystackServer.js';
import { aiAdvisorRouter, getGeminiApiKey } from './server/aiAdvisorServer.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(
  express.json({
    limit: '15mb',
    verify: (req: any, _res, buf) => {
      // Retain the unparsed raw buffer for cryptographic signature validation (e.g. Paystack webhook)
      req.rawBody = buf;
    }
  })
);

// Cross-Origin Resource Sharing (CORS) & Preflight Handler
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Mount Student & Certificate Portal APIs with Rate Limiting
app.use('/api', portalRouter);

// Mount Vixora AI Advisor API (supports both /api/ai, /api, and stripped serverless routes)
app.use('/api/ai', aiAdvisorRouter);
app.use('/api', aiAdvisorRouter);
app.use('/ai', aiAdvisorRouter);
app.use('/advisor', aiAdvisorRouter);

// Mount Paystack Payment Gateway API (supported on both /api/payments/paystack, /api/paystack, and stripped serverless paths)
app.use('/api/payments/paystack', paystackRouter);
app.use('/api/paystack', paystackRouter);
app.use('/payments/paystack', paystackRouter);
app.use('/paystack', paystackRouter);

// Lazy initialization of Gemini client
let cachedApiKey = '';
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  const currentKey = getGeminiApiKey();
  if (!aiClient || cachedApiKey !== currentKey) {
    cachedApiKey = currentKey;
    aiClient = new GoogleGenAI({
      apiKey: currentKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.get('/api/health', (req, res) => {
  const apiKey = getGeminiApiKey();
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString()
  });
});

// Geolocation endpoint for location-based currency (USD outside Nigeria, NGN in Nigeria)
app.get('/api/geo', async (req, res) => {
  try {
    // 1. Check CDN and edge cloud proxy headers
    const rawCountry = (
      req.headers['cf-ipcountry'] ||
      req.headers['x-vercel-ip-country'] ||
      req.headers['x-country-code'] ||
      req.headers['x-country'] ||
      req.headers['x-appengine-country'] ||
      ''
    ).toString().toUpperCase().trim();

    if (rawCountry && rawCountry.length === 2) {
      const isNigeria = rawCountry === 'NG';
      return res.json({
        country: rawCountry,
        isNigeria,
        currency: isNigeria ? 'NGN' : 'USD',
        source: 'header'
      });
    }

    // 2. Fallback to client IP lookup if proxied
    const clientIp = (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      ''
    );

    // If private or localhost IP, return default
    if (!clientIp || clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.')) {
      return res.json({
        country: 'UNKNOWN',
        isNigeria: false,
        currency: 'USD',
        source: 'local-default'
      });
    }

    // Attempt fast geo IP check
    const geoRes = await fetch(`https://api.country.is/${encodeURIComponent(clientIp)}`, {
      signal: AbortSignal.timeout(1500)
    });
    if (geoRes.ok) {
      const geoData: any = await geoRes.json();
      const detected = (geoData?.country || '').toUpperCase().trim();
      if (detected && detected.length === 2) {
        const isNigeria = detected === 'NG';
        return res.json({
          country: detected,
          isNigeria,
          currency: isNigeria ? 'NGN' : 'USD',
          source: 'ip'
        });
      }
    }
  } catch (err) {
    // Non-blocking fallback
  }

  // Safe international default: outside Nigeria defaults to USD
  return res.json({
    country: 'GLOBAL',
    isNigeria: false,
    currency: 'USD',
    source: 'fallback'
  });
});

app.post('/api/analyze-requirements', async (req, res) => {
  try {
    if (!isPlainObject(req.body)) {
      return res.status(400).json({ error: 'Request body must be a valid JSON object.' });
    }

    const { files, customInstructions } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files provided for analysis.' });
    }

    if (files.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 files allowed per analysis request.' });
    }

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!isPlainObject(f)) {
        return res.status(400).json({ error: `File at index ${i} must be a valid object.` });
      }
      if (typeof f.name !== 'string' || f.name.length > 255) {
        return res.status(400).json({ error: `File name at index ${i} must be a string up to 255 characters.` });
      }
      if (f.extractedContent !== undefined && f.extractedContent !== null && typeof f.extractedContent !== 'string') {
        return res.status(400).json({ error: `extractedContent at index ${i} must be a string.` });
      }
    }

    if (customInstructions !== undefined && customInstructions !== null) {
      if (typeof customInstructions !== 'string' || customInstructions.length > 5000) {
        return res.status(400).json({ error: 'customInstructions must be a string up to 5000 characters.' });
      }
    }

    const ai = getGemini();

    // Prepare context from Drive documents
    const documentsContext = files
      .map((f: any, idx: number) => {
        return `=== DOCUMENT ${idx + 1}: ${f.name} (Type: ${f.mimeType || 'unknown'}) ===\n${f.extractedContent || f.snippet || 'No text extracted.'}\n`;
      })
      .join('\n\n');

    const prompt = `You are an expert Principal Software Architect and Technical Product Manager.
Analyze the following Google Drive files gathered for "Vixora Web Development" and compile an exhaustive, professional, and structured Project Requirements Document (PRD).

SOURCE DOCUMENTS CONTEXT:
${documentsContext}

${customInstructions ? `USER INSTRUCTIONS / FOCUS:\n${customInstructions}\n` : ''}

CRITICAL TASK:
Synthesize all the details from the documents into a structured JSON object with the following schema:
{
  "projectName": "Vixora Web Platform",
  "summary": "Executive summary of the Vixora web development project",
  "primaryObjective": "Core business and technical objective",
  "targetAudience": ["List of target user groups/personas"],
  "keyFeatures": ["List of primary features"],
  "functionalRequirements": [
    {
      "id": "REQ-1",
      "title": "Feature / Module Title",
      "description": "Detailed functional behavior description",
      "priority": "Critical" | "High" | "Medium" | "Low",
      "module": "Authentication" | "Workspace" | "Analytics" | "API" | "UI/UX" | "Integrations" | "Database",
      "acceptanceCriteria": ["Given X when Y then Z", "Requirement detail 2"]
    }
  ],
  "techStack": [
    {
      "category": "Frontend" | "Backend" | "Database" | "Authentication" | "DevOps & Hosting" | "AI & Integrations",
      "technology": "React 19 / Express / PostgreSQL etc.",
      "versionOrDetail": "Version or library details",
      "rationale": "Why this technology is chosen for Vixora"
    }
  ],
  "designAndUXGuidelines": [
    "Design principles, responsiveness, theme, accessibility standards"
  ],
  "milestones": [
    {
      "phase": "Sprint 1 / Phase 1",
      "title": "Milestone Title",
      "targetTimeline": "Week 1-2",
      "keyDeliverables": ["Deliverable item 1", "Deliverable item 2"]
    }
  ],
  "securityAndNonFunctional": [
    "Performance latency SLA, encryption, RBAC rules, WCAG AA compliance"
  ],
  "openQuestionsAndRisks": [
    "Identified dependencies, ambiguities, or technical risks"
  ],
  "rawMarkdownReport": "# Full Markdown version of the PRD with tables and rich formatting",
  "sourceFilesSummary": [
    {
      "name": "Filename",
      "relevance": "How this file contributed to the requirements"
    }
  ]
}

Return ONLY valid JSON matching this exact structure. Ensure the rawMarkdownReport is well-formatted and includes complete headers, bullet points, and code/architecture blocks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini response as JSON:', responseText);
      // Fallback extraction if enclosed in code block
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      parsedData = JSON.parse(cleanJson);
    }

    parsedData.analyzedAt = new Date().toISOString();
    parsedData.sourceFilesCount = files.length;

    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error analyzing requirements with Gemini:', error);
    res.status(500).json({
      error: error.message || 'Failed to synthesize project requirements.',
    });
  }
});

app.post('/api/ask-requirements', async (req, res) => {
  try {
    if (!isPlainObject(req.body)) {
      return res.status(400).json({ error: 'Request body must be a valid JSON object.' });
    }

    const { question, prdContext } = req.body;
    if (!question || typeof question !== 'string' || question.trim().length === 0 || question.length > 2000) {
      return res.status(400).json({ error: 'Question is required and must be a string up to 2000 characters.' });
    }

    if (prdContext !== undefined && prdContext !== null) {
      if (typeof prdContext !== 'object' && typeof prdContext !== 'string') {
        return res.status(400).json({ error: 'prdContext must be a valid object or string.' });
      }
    }

    const ai = getGemini();
    const prompt = `You are the lead AI Technical Architect for the Vixora Web Development project.
Answer the following developer/stakeholder question accurately based on the compiled Vixora Project Requirements:

PROJECT REQUIREMENTS CONTEXT:
${JSON.stringify(prdContext, null, 2)}

QUESTION:
${question}

Provide a direct, helpful, and concise answer with actionable technical clarity. Use bullet points or code snippets where helpful.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    res.json({ success: true, answer: response.text });
  } catch (error: any) {
    console.error('Error in ask-requirements:', error);
    res.status(500).json({ error: error.message || 'Failed to answer query.' });
  }
});

// Serve public directory for static assets (images, logos)
app.use(express.static(path.join(process.cwd(), 'public')));

// Ensure all unmatched /api routes return JSON 404, never falling through to SPA HTML
app.all('/api/*', (_req, res) => {
  res.status(404).json({
    error: 'API endpoint not found.',
    code: 'NOT_FOUND'
  });
});

// Global Express error handler returning JSON for all /api requests
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.path.startsWith('/api')) {
    const status = typeof err.status === 'number' ? err.status : 500;
    return res.status(status).json({
      error: err?.message || 'Internal server error',
      code: err?.code || 'SERVER_ERROR'
    });
  }
  next(err);
});

// Vite Middleware for Development & Static fallback for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Vixora Analyzer server running on http://0.0.0.0:${PORT}`);
    
    // Optional automated schema migrations on startup
    if (process.env.AUTO_MIGRATE === 'true') {
      try {
        const { runMigrations, getDatabaseConnectionString } = await import('./server/migrations/runner.js');
        if (getDatabaseConnectionString()) {
          console.log('[Startup] Executing pending database migrations...');
          await runMigrations({ silent: false });
        }
      } catch (mErr: any) {
        console.error('[Startup Migration Warning]:', mErr?.message || mErr);
      }
    }
  });
}

// Vercel loads this Express app through api/[...path].ts.
// Keep the standalone server behavior for local/Node hosting, but do not
// start a second listener when the module is loaded as a Vercel function.
export default app;

const isMainScript =
  typeof process !== 'undefined' &&
  Boolean(process.argv?.[1]) &&
  !process.env.VERCEL &&
  !process.env.AWS_LAMBDA_FUNCTION_NAME &&
  (process.argv[1].endsWith('server.ts') ||
    process.argv[1].endsWith('server.cjs') ||
    process.argv[1].endsWith('server.js') ||
    process.argv[1].includes('tsx'));

if (isMainScript) {
  startServer();
}
