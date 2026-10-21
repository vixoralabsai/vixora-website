import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { ACADEMY_COURSES, FEATURED_SERVICES, COMPANY_CONTACT } from '../src/data/vixoraContent.js';
import { COURSE_PRICING } from '../src/data/coursePricing.js';

export const aiAdvisorRouter = Router();

// ============================================================================
// 1. Sliding Window Rate Limiter (Abuse & Quota Protection)
// ============================================================================

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class SlidingWindowRateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();
  private windowMs: number;
  private max: number;
  private prefix: string;

  constructor(options: { windowMs: number; max: number; prefix: string }) {
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.prefix = options.prefix;
  }

  check(key: string): { allowed: boolean; remaining: number; resetInSeconds: number; limit: number } {
    const now = Date.now();
    const fullKey = `${this.prefix}:${key}`;
    const record = this.store.get(fullKey);

    if (!record || now > record.resetTime) {
      this.store.set(fullKey, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return {
        allowed: true,
        remaining: this.max - 1,
        resetInSeconds: Math.ceil(this.windowMs / 1000),
        limit: this.max
      };
    }

    if (record.count >= this.max) {
      const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds,
        limit: this.max
      };
    }

    record.count += 1;
    const remaining = this.max - record.count;
    const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return {
      allowed: true,
      remaining,
      resetInSeconds,
      limit: this.max
    };
  }

  peek(key: string): { remaining: number; resetInSeconds: number; limit: number; isLimited: boolean } {
    const now = Date.now();
    const fullKey = `${this.prefix}:${key}`;
    const record = this.store.get(fullKey);

    if (!record || now > record.resetTime) {
      return {
        remaining: this.max,
        resetInSeconds: Math.ceil(this.windowMs / 1000),
        limit: this.max,
        isLimited: false
      };
    }

    const remaining = Math.max(0, this.max - record.count);
    const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return {
      remaining,
      resetInSeconds,
      limit: this.max,
      isLimited: record.count >= this.max
    };
  }
}

// 12 queries per 10 minutes per IP
const advisorRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 12,
  prefix: 'ai_advisor'
});

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown-ip';
}

function isPlainObject(val: unknown): val is Record<string, any> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

// ============================================================================
// 2. Authoritative Knowledge Base Assembly
// ============================================================================

function buildAuthoritativeKnowledgeBase(): string {
  const servicesText = FEATURED_SERVICES.map(s => {
    return `- **${s.title}** (${s.subtitle}): ${s.description} Features: ${s.features.join(', ')}`;
  }).join('\n');

  const coursesText = ACADEMY_COURSES.map(c => {
    const approvedPrice = COURSE_PRICING[c.id]?.NGN ? `₦${COURSE_PRICING[c.id]!.NGN!.toLocaleString()}` : c.tuition;
    return `- **${c.title}** (Slug: \`${c.slug}\`, ID: \`${c.id}\`)
  • Tuition: ${approvedPrice}
  • Duration: ${c.duration} (${c.format})
  • Next Cohort: ${c.nextCohortDate}
  • Level: ${c.level} | Track: ${c.track}
  • Audience: ${c.targetAudience}
  • Description: ${c.description}
  • Core Skills: ${c.curriculum.slice(0, 4).join(', ')}`;
  }).join('\n\n');

  return `
=== VIXORA DIGITAL HUB OFFICIAL KNOWLEDGE BASE ===

COMPANY OVERVIEW:
Vixora Digital Hub is an elite technology studio and executive education hub operating across two major divisions:
1. Vixora Agency & Solutions: Bespoke software engineering, autonomous AI agent swarms, workflow orchestration (n8n), brand systems, and high-converting paid media acquisition.
2. Vixora Academy: Implementation-first technical training cohorts teaching hands-on AI engineering, data analytics, automated business systems, and creative AI media.

DIRECT CONTACT CHANNELS:
- Email: ${COMPANY_CONTACT.email}
- US & Global WhatsApp Inbound: +1 (279) 257-4850
- Nigeria WhatsApp Inbound: +234 811 454 2934
- Student & Certificate Portal: /pages/student-portal

AGENCY SOLUTIONS & ENGINEERING PILLARS:
${servicesText}

ACADEMY COHORT PROGRAMS & PRICING:
${coursesText}

CRITICAL RULES:
1. Always state the exact, approved tuition for courses (e.g. AI Image & Short Videos Creation is ₦10,000, AI Automation & Digital Skills is ₦30,000, Data Analysis Cohort is ₦60,000). Never invent or guess prices.
2. If a user asks about building a custom software/AI system, diagnose their business problem, propose a concrete technology architecture, and suggest booking a project consultation.
3. If a user asks what course to study, assess their starting point, recommend the optimal Vixora Academy program, and highlight the start date and tuition.
4. Keep answers concise, highly structured, professional, and directly actionable.
`;
}

// ============================================================================
// 3. AI Client Setup
// ============================================================================

export function getGeminiApiKey(): string {
  const rawKey =
    process.env.GEMINI_API_KEY ||
    process.env.GEMINI_SECRET ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.GEMINI_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GEMINI_APIKEY ||
    process.env.GEMINI_TOKEN ||
    '';
  // Strip optional wrapping quotes or whitespace if accidentally pasted in Vercel
  return rawKey.trim().replace(/^["']|["']$/g, '');
}

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
          'User-Agent': 'aistudio-vixora-advisor'
        }
      }
    });
  }
  return aiClient;
}

// ============================================================================
// 4. API Endpoints
// ============================================================================

// Check AI Advisor readiness and user's rate limit quota
aiAdvisorRouter.get('/advisor/status', (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const status = advisorRateLimiter.peek(ip);
  const apiKey = getGeminiApiKey();
  res.json({
    ready: Boolean(apiKey),
    limit: status.limit,
    remaining: status.remaining,
    resetInSeconds: status.resetInSeconds,
    isLimited: status.isLimited
  });
});

// Process AI consultation query
aiAdvisorRouter.post('/advisor', async (req: Request, res: Response) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: 'Request body must be a valid JSON object.', code: 'INVALID_BODY' });
  }

  const { message, conversationHistory = [], track = 'all' } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Field "message" is required.', code: 'MISSING_MESSAGE' });
  }

  if (message.length > 2500) {
    return res.status(400).json({ error: 'Message cannot exceed 2500 characters.', code: 'MESSAGE_TOO_LONG' });
  }

  const ip = getClientIp(req);
  const rlCheck = advisorRateLimiter.check(ip);

  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Too many advisor queries. Please wait ${rlCheck.resetInSeconds} seconds before asking again.`,
      code: 'RATE_LIMIT_EXCEEDED',
      remaining: 0,
      resetInSeconds: rlCheck.resetInSeconds
    });
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured in environment variables. Please add GEMINI_API_KEY to your Vercel Project Settings and redeploy.',
      code: 'GEMINI_UNCONFIGURED'
    });
  }

  try {
    const ai = getGemini();
    const knowledgeBase = buildAuthoritativeKnowledgeBase();

    // Build chat turns if provided
    const contents: any[] = [];

    if (Array.isArray(conversationHistory)) {
      for (const turn of conversationHistory.slice(-6)) {
        if (turn && typeof turn.text === 'string' && (turn.role === 'user' || turn.role === 'model')) {
          contents.push({
            role: turn.role,
            parts: [{ text: turn.text }]
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [
        {
          text: `User Question: "${message.trim()}"\n\nContext Filter: User is inquiring about "${track}" track.\n\nPlease answer authoritatively, concisely, and provide clear recommended next steps.`
        }
      ]
    });

    const systemInstruction = `You are the Vixora AI Business & Academy Advisor for Vixora Digital Hub.
You are direct, articulate, deeply knowledgeable in modern AI engineering and software architecture, and laser-focused on practical outcomes.

${knowledgeBase}

OUTPUT SPECIFICATION:
Respond with a JSON object strictly matching this schema:
{
  "reply": "Your markdown-formatted, clear response (use bolding, bullet points, concise paragraphs).",
  "category": "academy" | "business" | "general",
  "recommendedCourseSlug": "optional-course-slug-if-relevant",
  "recommendedCourseTitle": "optional-course-title-if-relevant",
  "suggestedActions": [
    {
      "label": "Button text (e.g. 'Explore Data Analysis Cohort' or 'Start Project Blueprint')",
      "actionType": "navigate_course" | "enroll_course" | "start_project" | "whatsapp_consultation",
      "target": "slug or phone or page"
    }
  ]
}

DO NOT wrap the JSON in extra text outside the JSON structure. Return ONLY valid JSON.`;

    let response: any = null;
    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash'
    ];
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });
        if (response?.text) break;
      } catch (mErr: any) {
        lastError = mErr;
        // Fail over silently to next candidate without polluting server error logs
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('All model candidates failed to respond.');
    }

    const rawText = response.text || '';
    let parsedData: any = null;

    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // Fallback: clean markdown backticks if any
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      try {
        parsedData = JSON.parse(cleaned);
      } catch {
        parsedData = {
          reply: rawText,
          category: 'general',
          suggestedActions: [
            { label: 'Book Project Consultation', actionType: 'start_project', target: 'consultation' }
          ]
        };
      }
    }

    return res.json({
      success: true,
      data: parsedData,
      quota: {
        remaining: rlCheck.remaining,
        resetInSeconds: rlCheck.resetInSeconds,
        limit: rlCheck.limit
      }
    });
  } catch (err: any) {
    console.error('[AI Advisor Error]:', err?.message || err);
    
    // Graceful fallback with authoritative course recommendation if upstream API is unavailable or rate-limited
    const isVideoQuery = message.toLowerCase().includes('video') || message.toLowerCase().includes('short') || message.toLowerCase().includes('tiktok');
    const fallbackReply = isVideoQuery
      ? `For learning AI-driven video creation and short-form content, the **AI Image & Short Videos Creation** cohort is our dedicated program.\n\n* **Tuition:** ₦10,000\n* **Duration:** 4 Weeks\n* **Tools Covered:** Midjourney, Flux, ElevenLabs, CapCut, and Runway.\n\nYou will master prompt engineering, voice cloning, and synthetic video production.`
      : `Vixora Digital Hub offers industry-leading cohorts in Autonomous AI Engineering, Enterprise Workflow Automation, and AI-Powered Software. Our advisors are available to guide your roadmap.`;

    return res.json({
      success: true,
      data: {
        reply: fallbackReply,
        category: track === 'academy' ? 'academy' : 'business',
        recommendedCourseSlug: isVideoQuery ? 'ai-image-short-videos-creation' : undefined,
        recommendedCourseTitle: isVideoQuery ? 'AI Image & Short Videos Creation' : undefined,
        suggestedActions: [
          {
            label: isVideoQuery ? 'Explore AI Image & Short Videos Creation' : 'Explore Academy Courses',
            actionType: 'navigate_course',
            target: isVideoQuery ? 'ai-image-short-videos-creation' : 'all'
          },
          {
            label: 'Contact Vixora on WhatsApp',
            actionType: 'whatsapp_consultation',
            target: COMPANY_CONTACT.phone || '+1 (279) 257-4850'
          }
        ]
      },
      quota: {
        remaining: rlCheck.remaining,
        resetInSeconds: rlCheck.resetInSeconds,
        limit: rlCheck.limit
      }
    });
  }
});
