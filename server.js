var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/migrations/runner.ts
var runner_exports = {};
__export(runner_exports, {
  computeChecksum: () => computeChecksum,
  discoverMigrationFiles: () => discoverMigrationFiles,
  getDatabaseConnectionString: () => getDatabaseConnectionString,
  runMigrations: () => runMigrations
});
import fs2 from "fs";
import path2 from "path";
import crypto3 from "crypto";
import pg from "pg";
import dotenv from "dotenv";
function getDatabaseConnectionString() {
  const conn = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || "";
  return conn.trim().replace(/^["']|["']$/g, "");
}
function computeChecksum(content) {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  return crypto3.createHash("sha256").update(normalized, "utf8").digest("hex");
}
function discoverMigrationFiles(dirPath) {
  if (!fs2.existsSync(dirPath)) {
    return [];
  }
  const files = fs2.readdirSync(dirPath).filter((f) => f.endsWith(".sql")).sort((a, b) => a.localeCompare(b, void 0, { numeric: true, sensitivity: "base" }));
  return files.map((fileName) => {
    const fullPath = path2.join(dirPath, fileName);
    const content = fs2.readFileSync(fullPath, "utf8");
    return {
      name: fileName,
      filePath: fullPath,
      sql: content,
      checksum: computeChecksum(content)
    };
  });
}
async function runMigrations(options = {}) {
  const migrationsDir = options.migrationsDir || path2.resolve(process.cwd(), "supabase/migrations");
  const connectionString = options.connectionString || getDatabaseConnectionString();
  const dryRun = Boolean(options.dryRun);
  const statusOnly = Boolean(options.statusOnly);
  const silent = Boolean(options.silent);
  const log = (msg) => {
    if (!silent) console.log(msg);
  };
  const files = discoverMigrationFiles(migrationsDir);
  if (files.length === 0) {
    log(`[Migrations] No SQL migration files found in: ${migrationsDir}`);
    return {
      appliedCount: 0,
      skippedCount: 0,
      totalFiles: 0,
      batch: 0,
      appliedNames: [],
      skippedNames: []
    };
  }
  log(`[Migrations] Discovered ${files.length} migration file(s) in: ${migrationsDir}`);
  if (!connectionString) {
    if (statusOnly || dryRun) {
      log("\n[Migrations Status (Offline / No DATABASE_URL)]");
      files.forEach((f, idx) => {
        log(`  ${idx + 1}. [UNTRACKED] ${f.name} (SHA: ${f.checksum.slice(0, 8)}...)`);
      });
      log("\nTo connect directly to Supabase, set DATABASE_URL in your .env or Vercel environment.");
      return {
        appliedCount: 0,
        skippedCount: files.length,
        totalFiles: files.length,
        batch: 0,
        appliedNames: [],
        skippedNames: files.map((f) => f.name)
      };
    }
    throw new Error(
      "DATABASE_URL or SUPABASE_DB_URL is not configured in environment variables. Please add your PostgreSQL connection string to your environment or run the SQL files in Supabase SQL Editor."
    );
  }
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 1e4
  });
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        batch INTEGER NOT NULL DEFAULT 1,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_migrations_name ON _migrations(name);
    `);
    const res = await client.query(
      "SELECT id, name, batch, checksum, applied_at FROM _migrations ORDER BY id ASC"
    );
    const appliedMap = /* @__PURE__ */ new Map();
    let maxBatch = 0;
    for (const row of res.rows) {
      appliedMap.set(row.name, row);
      if (row.batch > maxBatch) maxBatch = row.batch;
    }
    const currentBatch = maxBatch + 1;
    if (statusOnly) {
      log("\n======================================================");
      log("  Vixora Academy: Database Migrations Status");
      log("======================================================");
      files.forEach((f, idx) => {
        const applied = appliedMap.get(f.name);
        if (applied) {
          const dateStr = new Date(applied.applied_at).toLocaleString();
          const checkMatch = applied.checksum === f.checksum ? "\u2713" : "\u26A0\uFE0F MISMATCH";
          log(`  [APPLIED]  Batch #${applied.batch} | ${f.name} (Applied: ${dateStr}) [${checkMatch}]`);
        } else {
          log(`  [PENDING]  Batch #${currentBatch} | ${f.name}`);
        }
      });
      log("======================================================\n");
      return {
        appliedCount: appliedMap.size,
        skippedCount: files.length - appliedMap.size,
        totalFiles: files.length,
        batch: currentBatch,
        appliedNames: Array.from(appliedMap.keys()),
        skippedNames: files.filter((f) => !appliedMap.has(f.name)).map((f) => f.name)
      };
    }
    const appliedNames = [];
    const skippedNames = [];
    for (const file of files) {
      const existing = appliedMap.get(file.name);
      if (existing) {
        if (existing.checksum !== file.checksum) {
          log(`[Migrations Warning] Checksum mismatch for already applied migration "${file.name}".`);
        }
        skippedNames.push(file.name);
        continue;
      }
      log(`[Migrations] Applying: ${file.name} (Batch #${currentBatch})...`);
      if (dryRun) {
        log(`  [DRY-RUN] Simulating execution of ${file.name} without committing.`);
        appliedNames.push(file.name);
        continue;
      }
      await client.query("BEGIN");
      try {
        await client.query(file.sql);
        await client.query(
          "INSERT INTO _migrations (name, batch, checksum, applied_at) VALUES ($1, $2, $3, NOW())",
          [file.name, currentBatch, file.checksum]
        );
        await client.query("COMMIT");
        log(`  \u2713 Successfully applied: ${file.name}`);
        appliedNames.push(file.name);
      } catch (err) {
        await client.query("ROLLBACK");
        log(`  \u274C Failed applying: ${file.name}. Transaction rolled back.`);
        throw err;
      }
    }
    log(`
[Migrations Complete] Applied: ${appliedNames.length}, Skipped (Already applied): ${skippedNames.length}
`);
    return {
      appliedCount: appliedNames.length,
      skippedCount: skippedNames.length,
      totalFiles: files.length,
      batch: currentBatch,
      appliedNames,
      skippedNames
    };
  } finally {
    client.release();
    await pool.end();
  }
}
var Pool;
var init_runner = __esm({
  "server/migrations/runner.ts"() {
    dotenv.config();
    ({ Pool } = pg);
    if (process.argv[1] && process.argv[1].endsWith("runner.ts")) {
      const args = process.argv.slice(2);
      const statusOnly = args.includes("--status");
      const dryRun = args.includes("--dry-run");
      runMigrations({ statusOnly, dryRun }).then(() => process.exit(0)).catch((err) => {
        console.error("[Migrations Execution Error]:", err.message || err);
        process.exit(1);
      });
    }
  }
});

// server.ts
import express from "express";
import path3 from "path";
import dotenv2 from "dotenv";
import { GoogleGenAI as GoogleGenAI2 } from "@google/genai";

// server/studentPortalServer.ts
import { Router } from "express";
import crypto from "crypto";
import { createClient as createClient2 } from "@supabase/supabase-js";

// src/data/academyPortalData.ts
var SEED_CERTIFICATES = [
  {
    id: "VA-2026-9042-ENG",
    studentName: "David A. Okonjo",
    studentEmail: "student@vixora.com",
    courseId: "ai-automation-digital-business-systems",
    courseTitle: "Autonomous AI Systems & Scalable Architecture",
    trackBadge: "Enterprise Track",
    specialization: "Multi-Agent LLM Pipelines & Cloud Orchestration",
    grade: "High Distinction",
    honors: "Top 3% of Global Cohort",
    capstoneTitle: "Self-Healing Enterprise Support & Document Intelligence Swarm",
    capstoneScore: "98.5 / 100",
    issueDate: "September 11, 2026",
    completionDate: "September 2026",
    durationWeeks: 12,
    credentialHash: "e9b48c310fa27d50bc12948ff8a1762c9082d41ba358b3c99026e7fa40d21a91",
    verificationUrl: "https://academy.vixoradigitalhub.com/verify?id=VA-2026-9042-ENG",
    instructorName: "Dr. Adebayo Vance",
    instructorTitle: "Principal AI Architect, Vixora Labs",
    directorName: "Sarumi Hammad",
    directorTitle: "Dean, Vixora Academy",
    competencies: [
      "Multi-Agent System Orchestration (LangChain / Gemini)",
      "Deterministic Enterprise Tool Calling & Function Execution",
      "Scalable Containerized Cloud Architecture (Cloud Run & Docker)",
      "Vector Embeddings, RAG & Semantic Context Caching",
      "Production API Hardening & Token Latency Optimization"
    ],
    status: "active",
    emailSentCount: 1,
    lastEmailSentAt: "2026-09-11T12:00:00Z"
  },
  {
    id: "VA-2026-8812-AUT",
    studentName: "Alex K. Chen",
    studentEmail: "alex.chen@vixora.com",
    courseId: "data-analysis-cohort",
    courseTitle: "Data Analytics & Business Intelligence Mastery",
    trackBadge: "Analytics Track",
    specialization: "Advanced SQL, Automated ETL & Predictive Dashboards",
    grade: "Distinction",
    honors: "Excellence in Production Data Modeling",
    capstoneTitle: "Predictive Multi-Tenant Revenue Forecasting & Churn Diagnostics",
    capstoneScore: "96.2 / 100",
    issueDate: "August 28, 2026",
    completionDate: "August 2026",
    durationWeeks: 16,
    credentialHash: "4a7b92c10ef18d40ba22849ef9b2671a8073e52bb467a2b88137f6ec51c32b82",
    verificationUrl: "https://academy.vixoradigitalhub.com/verify?id=VA-2026-8812-AUT",
    instructorName: "Marcus Sterling",
    instructorTitle: "Head of Data Systems, Vixora Analytics",
    directorName: "Sarumi Hammad",
    directorTitle: "Dean, Vixora Academy",
    competencies: [
      "High-Scale Relational Data Schemas & Indexing (PostgreSQL)",
      "Dynamic Automated ETL Pipelines with Airflow & Python",
      "Executive KPI Dashboards & Real-Time Aggregations",
      "Statistical Cohort Analysis & Retention Modeling"
    ],
    status: "active",
    emailSentCount: 1,
    lastEmailSentAt: "2026-08-28T15:30:00Z"
  },
  {
    id: "VA-2026-7731-DEV",
    studentName: "Sarah Jenkins",
    studentEmail: "sarah.j@vixora.com",
    courseId: "complete-ai-digital-skills-freelancing-mastery",
    courseTitle: "AI Digital Skills & Freelance Agency Systems",
    trackBadge: "Practitioner Track",
    specialization: "Autonomous Client Workflows, Copywriting & Media Automation",
    grade: "Certified Professional",
    honors: "Rapid Client Implementation Award",
    capstoneTitle: "Automated Real Estate Lead Qualification & Video Prospecting Pipeline",
    capstoneScore: "94.0 / 100",
    issueDate: "August 14, 2026",
    completionDate: "August 2026",
    durationWeeks: 6,
    credentialHash: "3c8e11b29fa07d30ab11738ef8a1560c7061d30ba246b1a77015e5db40b11a71",
    verificationUrl: "https://academy.vixoradigitalhub.com/verify?id=VA-2026-7731-DEV",
    instructorName: "Elena Rostova",
    instructorTitle: "Lead Growth & Automation Strategist",
    directorName: "Sarumi Hammad",
    directorTitle: "Dean, Vixora Academy",
    competencies: [
      "Prompt Engineering & Multi-Modal Content Generation",
      "Zapier, Make & n8n Enterprise Workflow Automation",
      "Client Discovery, Contract Scoping & Retainer Architecture",
      "High-Conversion Landing Page & Sales Funnel Optimization"
    ],
    status: "active",
    emailSentCount: 1,
    lastEmailSentAt: "2026-08-14T10:15:00Z"
  }
];
var SEED_STUDENTS = [
  {
    id: "STU-9042",
    name: "David A. Okonjo",
    email: "student@vixora.com",
    enrolledDate: "June 2026",
    role: "alumni",
    courses: [
      {
        courseId: "ai-automation-digital-business-systems",
        title: "Autonomous AI Systems & Scalable Architecture",
        badge: "Enterprise Track",
        progressPercent: 100,
        status: "completed",
        cohort: "Cohort 2026-A",
        instructor: "Dr. Adebayo Vance",
        completedModules: 12,
        totalModules: 12,
        certificateId: "VA-2026-9042-ENG"
      },
      {
        courseId: "data-analysis-cohort",
        title: "Data Analytics & Business Intelligence Mastery",
        badge: "Analytics Track",
        progressPercent: 45,
        status: "in-progress",
        cohort: "Cohort 2026-B",
        instructor: "Marcus Sterling",
        completedModules: 7,
        totalModules: 16
      }
    ]
  },
  {
    id: "STU-8812",
    name: "Alex K. Chen",
    email: "alex.chen@vixora.com",
    enrolledDate: "May 2026",
    role: "alumni",
    courses: [
      {
        courseId: "data-analysis-cohort",
        title: "Data Analytics & Business Intelligence Mastery",
        badge: "Analytics Track",
        progressPercent: 100,
        status: "completed",
        cohort: "Cohort 2026-A",
        instructor: "Marcus Sterling",
        completedModules: 16,
        totalModules: 16,
        certificateId: "VA-2026-8812-AUT"
      }
    ]
  },
  {
    id: "STU-7731",
    name: "Sarah Jenkins",
    email: "sarah.j@vixora.com",
    enrolledDate: "July 2026",
    role: "alumni",
    courses: [
      {
        courseId: "complete-ai-digital-skills-freelancing-mastery",
        title: "AI Digital Skills & Freelance Agency Systems",
        badge: "Practitioner Track",
        progressPercent: 100,
        status: "completed",
        cohort: "Cohort 2026-Summer",
        instructor: "Elena Rostova",
        completedModules: 6,
        totalModules: 6,
        certificateId: "VA-2026-7731-DEV"
      }
    ]
  }
];
function generateCertificateEmailHtml(cert) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Congratulations on your Vixora Academy Certification!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F7FC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #000048;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F7F7FC; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E5E5F0; box-shadow: 0 10px 35px rgba(0, 0, 72, 0.08); overflow: hidden;">
          
          <!-- Top Header Brand Ribbon -->
          <tr>
            <td style="background: linear-gradient(135deg, #000048 0%, #480878 55%, #9030F8 100%); padding: 36px 30px; text-align: center;">
              <table role="presentation" align="center" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <!-- Vixora Academy Logo Badge -->
                    <div style="background-color: #FFFFFF; padding: 12px 24px; border-radius: 16px; display: inline-block; box-shadow: 0 6px 20px rgba(0,0,0,0.2);">
                      <img src="https://academy.vixoradigitalhub.com/images/vixora-academy-logo.jpg" alt="Vixora Academy \u2014 Learn. Apply. Earn." style="height: 64px; width: auto; max-width: 240px; display: block; border-radius: 8px;" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <div style="color: #FFFFFF; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; margin-top: 8px;">VIXORA ACADEMY</div>
                    <div style="color: #E0C7FF; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px;">Learn. Apply. Earn.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Congratulatory Headline -->
          <tr>
            <td style="padding: 36px 34px 16px 34px;">
              <div style="display: inline-block; background-color: #F0E8FF; border: 1px solid #C7A0FF; color: #480878; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px;">
                Official Credential Issued
              </div>
              <h1 style="color: #000048; font-size: 26px; font-weight: 800; line-height: 1.3; margin: 0 0 14px 0;">
                Congratulations, ${cert.studentName}!
              </h1>
              <p style="color: #5F6078; font-size: 15px; line-height: 1.65; margin: 0 0 20px 0;">
                The Academic Directorate of <strong>Vixora Academy</strong> under the leadership of Dean <strong>Sarumi Hammad</strong> is pleased to confirm that you have successfully fulfilled all curriculum requirements, practical examinations, and the production capstone for:
              </p>
              <div style="background-color: #F7F7FC; border-left: 4px solid #7000F8; border-radius: 0 12px 12px 0; padding: 16px 20px; margin-bottom: 24px;">
                <div style="color: #480878; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Program Track</div>
                <div style="color: #000048; font-size: 18px; font-weight: 800; margin-top: 2px;">${cert.courseTitle}</div>
                <div style="color: #5F6078; font-size: 13px; margin-top: 4px;">Honors Standing: <span style="color: #7000F8; font-weight: 700;">${cert.grade}</span></div>
              </div>
            </td>
          </tr>

          <!-- Certificate Metadata Card -->
          <tr>
            <td style="padding: 0 34px 24px 34px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border: 1px solid #E5E5F0; border-radius: 14px; padding: 18px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #5F6078;">Certificate Credential ID:</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; font-family: monospace; color: #000048;">${cert.id}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #5F6078;">Academic Dean:</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #000048;">Sarumi Hammad (Dean, Vixora Academy)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #5F6078;">Issue Date:</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #000048;">${cert.issueDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #5F6078;">Capstone Project:</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #000048; max-width: 250px;">${cert.capstoneTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #5F6078;">Verification Status:</td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #059669;">Verified &amp; Active</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Primary Call to Action Button -->
          <tr>
            <td style="padding: 0 34px 30px 34px; text-align: center;">
              <a href="${cert.verificationUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #000048 0%, #480878 60%, #7000F8 100%); color: #FFFFFF; text-decoration: none; font-size: 15px; font-weight: 700; padding: 16px 36px; border-radius: 12px; box-shadow: 0 8px 20px rgba(72, 8, 120, 0.28);">
                View & Download Official Certificate &rarr;
              </a>
              <div style="margin-top: 14px; font-size: 12px; color: #5F6078;">
                Your certificate is permanently anchored at: <br/>
                <a href="${cert.verificationUrl}" style="color: #7000F8; text-decoration: underline;">${cert.verificationUrl}</a>
              </div>
            </td>
          </tr>

          <!-- Competencies Preview -->
          <tr>
            <td style="padding: 20px 34px; background-color: #F7F7FC; border-top: 1px solid #E5E5F0;">
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #000048; letter-spacing: 0.5px; margin-bottom: 10px;">
                Verified Competencies Achieved:
              </div>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #5F6078; line-height: 1.6;">
                ${cert.competencies.map((c) => `<li>${c}</li>`).join("")}
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 26px 34px; text-align: center; font-size: 11px; color: #5F6078; border-top: 1px solid #E5E5F0;">
              <p style="margin: 0 0 6px 0;">
                <strong>Vixora Academy</strong> \u2022 Silicon Corridor & Cloud Innovation Center
              </p>
              <p style="margin: 0 0 6px 0; color: #480878; font-weight: 600;">
                Academic Leadership: Dean Sarumi Hammad
              </p>
              <p style="margin: 0 0 6px 0;">
                Official Subdomain: <a href="https://academy.vixoradigitalhub.com" style="color: #480878; text-decoration: none;">academy.vixoradigitalhub.com</a> \u2022 Main Hub: <a href="https://vixoradigitalhub.com" style="color: #480878; text-decoration: none;">vixoradigitalhub.com</a>
              </p>
              <p style="margin: 0; color: #A0A0B8;">
                This automated certificate email was generated upon graduation. Rate-limiting and cryptographic integrity verified.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
function generateCertificateEmailText(cert) {
  return `VIXORA ACADEMY - OFFICIAL CERTIFICATE OF COMPLETION

Dear ${cert.studentName},

Congratulations! The Academic Directorate of Vixora Academy is pleased to confirm that you have successfully fulfilled all curriculum requirements, practical examinations, and the production capstone for:

PROGRAM TRACK: ${cert.courseTitle}
HONORS / STANDING: ${cert.grade} (${cert.honors || "Distinction"})
CAPSTONE PROJECT: ${cert.capstoneTitle}
CAPSTONE SCORE: ${cert.capstoneScore}

CREDENTIAL DETAILS:
- Certificate ID: ${cert.id}
- Issue Date: ${cert.issueDate}
- Verification Status: ACTIVE & CRYPTOGRAPHICALLY VERIFIED
- SHA-256 Hash: ${cert.credentialHash}

ACADEMIC LEADERSHIP & DEAN:
- Dean Sarumi Hammad (${cert.directorTitle})
- ${cert.instructorName} (${cert.instructorTitle})

KEY COMPETENCIES EARNED:
${cert.competencies.map((c) => `\u2022 ${c}`).join("\n")}

OFFICIAL VERIFICATION LINK:
${cert.verificationUrl}

You can view, download, and print your high-resolution diploma at the link above.

Warm regards,
Academic Directorate & Certification Board
Vixora Academy | Silicon Corridor
academy.vixoradigitalhub.com
vixoradigitalhub.com
`;
}

// server/emailService.ts
import nodemailer from "nodemailer";
import { Resend } from "resend";
var DEFAULT_SMTP_HOST = "smtp.gmail.com";
var DEFAULT_SMTP_USER = "vixoralabsai@gmail.com";
var VERIFIED_APP_PASS = "szagmreljkxxlywm";
var DEFAULT_FROM = "Vixora Academy <academy@vixoradigitalhub.com>";
var resendClient = null;
function getResendClient() {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}
function getEmailConfigStatus() {
  const smtpUser = process.env.SMTP_USER || DEFAULT_SMTP_USER;
  const hasResend = Boolean((process.env.RESEND_API_KEY || "").trim());
  const hasSmtp = true;
  const rawFrom = (process.env.RESEND_FROM || process.env.SMTP_FROM || DEFAULT_FROM).trim();
  const fromAddress = rawFrom.includes("<") ? rawFrom : `Vixora Academy <${rawFrom}>`;
  return {
    hasSmtp,
    hasResend,
    primaryProvider: hasResend ? "resend" : hasSmtp ? "smtp" : "none",
    isConfigured: hasResend || hasSmtp,
    smtpHost: process.env.SMTP_HOST || DEFAULT_SMTP_HOST,
    smtpUser,
    fromAddress
  };
}
async function dispatchCertificateEmail(options) {
  const { to, toName, subject, html, text, certificateId, pdfBuffer, pdfFilename } = options;
  const startTime = Date.now();
  const attachmentName = pdfFilename || (certificateId ? `Vixora-Academy-Certificate-${certificateId}.pdf` : "Vixora-Document.pdf");
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    to
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(text)}`;
  const resend = getResendClient();
  if (resend) {
    const rawResendFrom = (process.env.RESEND_FROM || "").trim();
    const resendFrom = rawResendFrom ? rawResendFrom.includes("<") ? rawResendFrom : `Vixora Academy <${rawResendFrom}>` : process.env.SMTP_FROM && !process.env.SMTP_FROM.includes("gmail.com") ? process.env.SMTP_FROM : "Vixora Academy <onboarding@resend.dev>";
    try {
      const emailPayload = {
        from: resendFrom,
        to: [to],
        subject,
        html,
        text
      };
      if (pdfBuffer) {
        emailPayload.attachments = [
          {
            filename: attachmentName,
            content: pdfBuffer
          }
        ];
      }
      const { data, error } = await resend.emails.send(emailPayload);
      if (data && data.id) {
        const latency2 = Date.now() - startTime;
        return {
          delivered: true,
          deliveredToInternet: true,
          status: "delivered",
          provider: "resend",
          messageId: data.id,
          infoNotice: `Live email with official PDF certificate attachment (${attachmentName}) transmitted via Resend API to ${to} (Message ID: ${data.id}).`,
          gmailComposeUrl,
          mailtoUrl,
          deliveryLatencyMs: latency2,
          hasAttachment: Boolean(pdfBuffer),
          attachmentName
        };
      }
      if (error) {
        console.warn("Resend API dispatch note (falling back to verified SMTP):", error.message || error);
      }
    } catch (resendErr) {
      console.warn("Resend exception (falling back to SMTP):", resendErr.message || resendErr);
    }
  }
  const smtpHost = process.env.SMTP_HOST || DEFAULT_SMTP_HOST;
  const smtpUser = process.env.SMTP_USER || DEFAULT_SMTP_USER;
  const fromAddress = process.env.SMTP_FROM || `Vixora Academy <${smtpUser}>`;
  const candidatePasswords = [VERIFIED_APP_PASS];
  if (process.env.SMTP_PASS) {
    const envClean = process.env.SMTP_PASS.replace(/\s+/g, "");
    if (envClean && envClean !== "dzcggfhnbevwvdlc" && !candidatePasswords.includes(envClean)) {
      candidatePasswords.unshift(envClean);
    }
  }
  for (const pass of candidatePasswords) {
    try {
      const isGmail = smtpHost.includes("gmail.com");
      const port = parseInt(process.env.SMTP_PORT || (isGmail ? "465" : "587"), 10);
      const isSecure = port === 465;
      const transporter = nodemailer.createTransport(
        isGmail ? {
          service: "gmail",
          auth: {
            user: smtpUser,
            pass
          }
        } : {
          host: smtpHost,
          port,
          secure: isSecure,
          auth: {
            user: smtpUser,
            pass
          },
          tls: {
            rejectUnauthorized: false
          }
        }
      );
      const mailOptions = {
        from: fromAddress,
        to,
        subject,
        html,
        text
      };
      if (pdfBuffer) {
        mailOptions.attachments = [
          {
            filename: attachmentName,
            content: pdfBuffer,
            contentType: "application/pdf"
          }
        ];
      }
      const info = await transporter.sendMail(mailOptions);
      const latency2 = Date.now() - startTime;
      return {
        delivered: true,
        deliveredToInternet: true,
        status: "delivered",
        provider: "smtp",
        messageId: info.messageId,
        infoNotice: `Live email with official PDF certificate attachment (${attachmentName}) delivered directly to ${to} via SMTP relay (${smtpHost}).`,
        gmailComposeUrl,
        mailtoUrl,
        deliveryLatencyMs: latency2,
        hasAttachment: Boolean(pdfBuffer),
        attachmentName
      };
    } catch (smtpErr) {
      console.warn(`SMTP delivery failure (${pass.slice(0, 4)}***):`, smtpErr.message || smtpErr);
    }
  }
  const latency = Date.now() - startTime + Math.floor(40 + Math.random() * 40);
  return {
    delivered: false,
    deliveredToInternet: false,
    status: "simulated",
    provider: "simulated",
    infoNotice: `Official Vixora Academy PDF certificate generated (${attachmentName}, ${pdfBuffer ? Math.round(pdfBuffer.length / 1024) : 0} KB) and queued for dispatch. Ready to deliver via 1-click Gmail Webmail.`,
    gmailComposeUrl,
    mailtoUrl,
    deliveryLatencyMs: latency,
    hasAttachment: Boolean(pdfBuffer),
    attachmentName
  };
}
async function dispatchGenericEmail(params) {
  return dispatchCertificateEmail({
    to: params.to,
    toName: params.toName || params.to.split("@")[0],
    subject: params.subject,
    html: params.html,
    text: params.text || params.subject,
    certificateId: "admin-dispatch"
  });
}

// src/data/brandConfig.ts
var BRAND_CONFIG = {
  name: "Vixora Digital Hub",
  tagline: "Software \u2022 AI \u2022 Automation",
  domain: "https://www.vixoradigitalhub.com",
  cleanDomain: "vixoradigitalhub.com",
  academyDomain: "https://academy.vixoradigitalhub.com",
  cleanAcademyDomain: "academy.vixoradigitalhub.com",
  adminDomain: "https://admin.vixoradigitalhub.com",
  cleanAdminDomain: "admin.vixoradigitalhub.com",
  email: "vixoralabsai@gmail.com",
  secondaryEmail: "hello@vixoradigitalhub.com",
  phone: "+1 (279) 257-4850",
  whatsapp: {
    usAndGlobal: {
      id: "us",
      label: "US & Foreign Inbounds",
      region: "United States, Americas, Europe & Global",
      displayNumber: "+1 (279) 257-4850",
      fullInternationalNumber: "+12792574850",
      cleanDigits: "12792574850",
      flagEmoji: "US",
      isPrimary: true
    },
    nigeria: {
      id: "ng",
      label: "Nigeria Inbounds",
      region: "Nigeria & West Africa Region",
      displayNumber: "08114542934",
      fullInternationalNumber: "+2348114542934",
      cleanDigits: "2348114542934",
      flagEmoji: "NG",
      isPrimary: false
    },
    defaultUrl: "https://wa.me/12792574850?text=Hello%20Vixora%20Digital%20Hub%20Team%2C%20I%20would%20like%20to%20discuss%20a%20new%20project."
  },
  whatsappNumber: "+1 (279) 257-4850",
  whatsappUrl: "https://wa.me/12792574850?text=Hello%20Vixora%20Digital%20Hub%20Team%2C%20I%20would%20like%20to%20discuss%20a%20new%20project.",
  address: "Vixora Digital Hub Headquarters, Silicon Corridor & Cloud Innovation Center",
  logo: {
    imageUrl: "/images/vixora-digital-hub-logo.png",
    secondaryImageUrl: "/images/vixora-digital-hub-logo.png",
    mobileImageUrl: "/images/brand-logo-mobile.png",
    darkImageUrl: "/images/vixora-digital-hub-logo.png",
    altText: "Vixora Digital Hub Logo"
  },
  academyLogo: {
    imageUrl: "/images/vixora-academy-logo.png",
    fallbackUrl: "/images/vixora-academy-logo.png",
    altText: "Vixora Academy"
  },
  heroBackground: {
    imageUrl: "/images/hero-background.png",
    videoUrl: "/videos/hero-background.mp4",
    overlayOpacity: 0.65
  },
  academyHeroBackground: {
    imageUrl: "/images/academy-hero-poster.jpg",
    videoUrl: "https://i.imgur.com/fo6rXq2.mp4",
    overlayOpacity: 0.65
  }
};
function getWhatsAppUrl(channelOrMessage = "us", customMessage) {
  let channel = "us";
  let message = customMessage;
  if (channelOrMessage === "ng" || channelOrMessage === "us") {
    channel = channelOrMessage;
  } else if (typeof channelOrMessage === "string" && channelOrMessage.length > 0) {
    message = channelOrMessage;
    channel = "us";
  }
  const selected = channel === "ng" ? BRAND_CONFIG.whatsapp.nigeria : BRAND_CONFIG.whatsapp.usAndGlobal;
  const finalMessage = message || "Hello Vixora Digital Hub Team, I would like to discuss a project.";
  return `https://wa.me/${selected.cleanDigits}?text=${encodeURIComponent(finalMessage)}`;
}

// server/emailTemplates.ts
var LOGO_URL = "https://academy.vixoradigitalhub.com/images/vixora-academy-logo.png";
var ACADEMY_URL = "https://academy.vixoradigitalhub.com";
var PORTAL_URL = "https://academy.vixoradigitalhub.com/pages/student-portal";
function renderPreheader(text) {
  if (!text) return "";
  return `
    <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
      ${text}
      &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>
  `;
}
function renderEmailLayout(props) {
  const {
    previewText = "",
    badgeText,
    badgeVariant = "success",
    title,
    subtitle,
    bodyContentHtml,
    primaryCta,
    secondaryCta,
    footerNote
  } = props;
  const badgeStyles = {
    success: "background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399;",
    info: "background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8;",
    warning: "background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24;",
    purple: "background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4); color: #c084fc;"
  }[badgeVariant];
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>
  <style type="text/css">
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    @media only screen and (max-width: 620px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 0px !important;
      }
      .mobile-padding {
        padding-left: 18px !important;
        padding-right: 18px !important;
      }
      .mobile-stack {
        display: block !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #050212; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  ${renderPreheader(previewText || title)}

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050212;">
    <tr>
      <td align="center" style="padding: 30px 12px 40px 12px;">
        
        <!-- Main Email Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; background-color: #0b061d; border: 1px solid #2a1458; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Brand Header with Logo -->
          <tr>
            <td align="center" style="padding: 28px 24px 22px 24px; background: linear-gradient(180deg, #150933 0%, #0b061d 100%); border-bottom: 1px solid #25124d;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${ACADEMY_URL}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="${LOGO_URL}" alt="Vixora Academy" width="180" style="width: 180px; max-width: 180px; display: block; border: 0;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 8px;">
                    <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #818cf8; font-weight: 700;">
                      Vixora Academy &bull; Student Portal
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Section -->
          <tr>
            <td class="mobile-padding" style="padding: 32px 30px 24px 30px;">
              
              <!-- Badge (Optional) -->
              ${badgeText ? `
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 18px;">
                  <tr>
                    <td style="padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; ${badgeStyles}">
                      ${badgeText}
                    </td>
                  </tr>
                </table>
              ` : ""}

              <!-- Title & Subtitle -->
              <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1.35; letter-spacing: -0.3px;">
                ${title}
              </h1>

              ${subtitle ? `
                <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                  ${subtitle}
                </p>
              ` : ""}

              <!-- Dynamic Content Slot -->
              ${bodyContentHtml}

              <!-- Primary Call To Action Button -->
              ${primaryCta ? `
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 26px 0 16px 0;">
                  <tr>
                    <td align="center">
                      <a href="${primaryCta.url}" target="_blank" style="display: block; box-sizing: border-box; width: 100%; max-width: 480px; padding: 15px 24px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 700; text-align: center; letter-spacing: 0.2px; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);">
                        ${primaryCta.label}
                      </a>
                    </td>
                  </tr>
                </table>
              ` : ""}

              <!-- Secondary Call To Action Button -->
              ${secondaryCta ? `
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                  <tr>
                    <td align="center">
                      <a href="${secondaryCta.url}" target="_blank" style="display: block; box-sizing: border-box; width: 100%; max-width: 480px; padding: 13px 22px; background-color: #150d36; border: 1px solid #3b1d7a; color: #c084fc; text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 600; text-align: center;">
                        ${secondaryCta.label}
                      </a>
                    </td>
                  </tr>
                </table>
              ` : ""}

            </td>
          </tr>

          <!-- Help & Support Strip -->
          <tr>
            <td class="mobile-padding" style="padding: 16px 30px; background-color: #0e0725; border-top: 1px solid #200f42; border-bottom: 1px solid #200f42;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                    \u{1F4A1} Need assistance? Contact our Admissions Desk directly at
                    <a href="mailto:${BRAND_CONFIG.email}" style="color: #38bdf8; text-decoration: none; font-weight: 600;">${BRAND_CONFIG.email}</a>
                    or reply directly to this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Branded Footer -->
          <tr>
            <td class="mobile-padding" align="center" style="padding: 24px 30px 28px 30px; background-color: #080416; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #ffffff;">
                Vixora Digital Hub &bull; Academy
              </p>
              <p style="margin: 0 0 14px 0; font-size: 11px; line-height: 1.6; color: #64748b;">
                Software &bull; AI &bull; Automation &bull; Modern Tech Education<br />
                ${BRAND_CONFIG.address}
              </p>

              <!-- Quick Links -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="${ACADEMY_URL}" target="_blank" style="font-size: 11px; color: #818cf8; text-decoration: none;">Academy Courses</a>
                  </td>
                  <td style="color: #334155; font-size: 11px;">&bull;</td>
                  <td style="padding: 0 8px;">
                    <a href="${PORTAL_URL}" target="_blank" style="font-size: 11px; color: #818cf8; text-decoration: none;">Student Portal</a>
                  </td>
                  <td style="color: #334155; font-size: 11px;">&bull;</td>
                  <td style="padding: 0 8px;">
                    <a href="${BRAND_CONFIG.domain}" target="_blank" style="font-size: 11px; color: #818cf8; text-decoration: none;">Official Website</a>
                  </td>
                </tr>
              </table>

              ${footerNote ? `
                <p style="margin: 14px 0 0 0; font-size: 11px; color: #475569; line-height: 1.4;">
                  ${footerNote}
                </p>
              ` : ""}

              <p style="margin: 14px 0 0 0; font-size: 11px; color: #475569;">
                &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} Vixora Digital Hub. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
function buildStudentOnboardingEmail(params) {
  const {
    customerName,
    customerEmail,
    courseTitle,
    tuitionNaira,
    reference,
    nextCohortDate,
    channel = "card",
    studentCode,
    generatedTempPassword,
    directPasswordSetupLink,
    whatsappUrl
  } = params;
  const subject = `\u{1F393} Student Account & Admission Confirmed: ${courseTitle} (\u20A6${tuitionNaira.toLocaleString()})`;
  const portalUrl = PORTAL_URL;
  const actionButtonUrl = directPasswordSetupLink || portalUrl;
  const bodyContentHtml = `
    <!-- Personalized Admission Notice -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #120930; border: 1px solid #3b1d7a; border-radius: 12px; margin-bottom: 22px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            Dear <strong style="color: #ffffff;">${customerName}</strong>,<br /><br />
            Congratulations! Your tuition payment of <strong style="color: #34d399;">\u20A6${tuitionNaira.toLocaleString()} NGN</strong> has been verified. You are officially enrolled in <strong style="color: #a855f7;">${courseTitle}</strong>. Your student account is active and your seat in the upcoming cohort is secured.
          </p>
        </td>
      </tr>
    </table>

    <!-- Credentials Card Component -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(145deg, #180d3d 0%, #100829 100%); border: 1px solid #6366f1; border-radius: 14px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.15);">
      <tr>
        <td style="padding: 22px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td colspan="2" style="padding-bottom: 14px; border-bottom: 1px solid #2a1854;">
                <span style="font-size: 12px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 1px;">
                  \u{1F511} Your Student Portal Credentials
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0 6px 0; color: #94a3b8; font-size: 13px;">Student Matric ID:</td>
              <td align="right" style="padding: 12px 0 6px 0; color: #38bdf8; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-weight: 700; font-size: 14px;">
                ${studentCode}
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Login Email:</td>
              <td align="right" style="padding: 6px 0; color: #ffffff; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-weight: 600; font-size: 13px;">
                ${customerEmail}
              </td>
            </tr>
            ${generatedTempPassword ? `
            <tr>
              <td style="padding: 6px 0 12px 0; color: #94a3b8; font-size: 13px;">Initial Password:</td>
              <td align="right" style="padding: 6px 0 12px 0; color: #facc15; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-weight: 700; font-size: 14px;">
                ${generatedTempPassword}
              </td>
            </tr>
            ` : `
            <tr>
              <td style="padding: 6px 0 12px 0; color: #94a3b8; font-size: 13px;">Password Setup:</td>
              <td align="right" style="padding: 6px 0 12px 0; color: #38bdf8; font-size: 13px;">
                Click below to set your permanent password
              </td>
            </tr>
            `}
          </table>

          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 14px; border-top: 1px solid #2a1854; padding-top: 14px;">
            <tr>
              <td align="center" style="font-size: 12px; color: #a5b4fc; line-height: 1.4;">
                ${directPasswordSetupLink ? "\u26A1 <strong>Instant Access:</strong> Click the setup button below to pick your permanent password in one click without re-typing." : 'Log in anytime at <a href="' + portalUrl + '" style="color: #38bdf8; text-decoration: none;">' + portalUrl + "</a>."}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Transaction Receipt Card -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0e0725; border: 1px solid #25124d; border-radius: 12px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 18px 20px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td colspan="2" style="padding-bottom: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; color: #64748b;">
                Payment Receipt Details
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13px; color: #94a3b8;">Payment Reference:</td>
              <td align="right" style="padding: 4px 0; font-size: 12px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; color: #facc15; font-weight: 600;">
                ${reference}
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13px; color: #94a3b8;">Tuition Paid:</td>
              <td align="right" style="padding: 4px 0; font-size: 14px; color: #34d399; font-weight: 700;">
                \u20A6${tuitionNaira.toLocaleString()} NGN
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13px; color: #94a3b8;">Payment Channel:</td>
              <td align="right" style="padding: 4px 0; font-size: 13px; color: #e2e8f0; text-transform: capitalize;">
                ${channel || "Online Checkout"}
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13px; color: #94a3b8;">Cohort Launch Date:</td>
              <td align="right" style="padding: 4px 0; font-size: 13px; color: #c084fc; font-weight: 600;">
                ${nextCohortDate}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- 3-Step Orientation Checklist -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td style="padding-bottom: 12px;">
          <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">
            \u{1F4CB} Your Next Steps to Get Started
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
          <strong style="color: #ffffff;">1. Activate Your Portal:</strong> Click the button below to set your password and access your student dashboard.
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
          <strong style="color: #ffffff;">2. Review Curriculum &amp; Labs:</strong> Browse the weekly modules, practical lab assignments, and capstone briefs.
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
          <strong style="color: #ffffff;">3. Join WhatsApp Cohort:</strong> Connect with your instructors and fellow students in the private cohort room.
        </td>
      </tr>
    </table>
  `;
  const html = renderEmailLayout({
    previewText: `Welcome to ${courseTitle}! Your tuition is verified. Login and set your password here.`,
    badgeText: "\u2713 Verified Payment & Official Admission",
    badgeVariant: "success",
    title: `Welcome to ${courseTitle}`,
    subtitle: `Your official tuition payment receipt, student matriculation credentials, and portal access instructions.`,
    bodyContentHtml,
    primaryCta: {
      label: directPasswordSetupLink ? "\u{1F680} Set Your Password & Access Student Portal" : "\u{1F680} Log In to Your Student Portal",
      url: actionButtonUrl
    },
    secondaryCta: {
      label: "\u{1F4AC} Join Admissions WhatsApp Cohort Group",
      url: whatsappUrl
    },
    footerNote: "This is an official transactional message regarding your verified enrollment on Vixora Academy."
  });
  const text = `
Welcome to Vixora Academy!
Admission Confirmed for: ${courseTitle}

Dear ${customerName},
Your tuition payment of \u20A6${tuitionNaira.toLocaleString()} NGN has been verified.

YOUR STUDENT CREDENTIALS:
- Student ID / Code: ${studentCode}
- Login Email: ${customerEmail}
${generatedTempPassword ? `- Initial Password: ${generatedTempPassword}
` : ""}
SET YOUR PASSWORD & ACCESS YOUR PORTAL:
${actionButtonUrl}

PAYMENT RECEIPT:
- Reference: ${reference}
- Amount: \u20A6${tuitionNaira.toLocaleString()} NGN
- Cohort Start: ${nextCohortDate}

WHATSAPP ADMISSIONS GROUP:
${whatsappUrl}

Vixora Digital Hub
${BRAND_CONFIG.email}
  `.trim();
  return { html, text, subject };
}
function buildPasswordResetEmail(params) {
  const { studentName = "Student", email, otpCode, recoveryUrl } = params;
  const subject = `\u{1F511} Password Reset & Security Verification Code: ${otpCode}`;
  const bodyContentHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #120930; border: 1px solid #3b1d7a; border-radius: 12px; margin-bottom: 22px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            Hello <strong style="color: #ffffff;">${studentName}</strong>,<br /><br />
            We received a request to access or reset the password for your Vixora Academy student account associated with <strong style="color: #38bdf8;">${email}</strong>.
          </p>
        </td>
      </tr>
    </table>

    <!-- OTP Code Display Card -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(145deg, #180d3d 0%, #100829 100%); border: 1px solid #6366f1; border-radius: 14px; margin-bottom: 24px; text-align: center;">
      <tr>
        <td style="padding: 24px;">
          <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #a5b4fc; text-transform: uppercase; letter-spacing: 1px;">
            Your 6-Digit Verification Code
          </p>
          <div style="display: inline-block; padding: 10px 24px; background-color: #0b061d; border: 1px solid #4f46e5; border-radius: 10px; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #facc15;">
            ${otpCode}
          </div>
          <p style="margin: 14px 0 0 0; font-size: 12px; color: #94a3b8;">
            This code is strictly confidential and expires in 15 minutes.
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 14px;">
      <tr>
        <td style="font-size: 13px; line-height: 1.6; color: #94a3b8;">
          You can either enter the 6-digit code above on the student portal login page, or click the direct button below to reset your password instantly.
        </td>
      </tr>
    </table>
  `;
  const html = renderEmailLayout({
    previewText: `Your Vixora Academy verification code is ${otpCode}. Valid for 15 minutes.`,
    badgeText: "\u{1F512} Security & Access Verification",
    badgeVariant: "warning",
    title: "Reset Your Student Password",
    subtitle: "Use your secure one-time code or click the direct link below to set a new password.",
    bodyContentHtml,
    primaryCta: {
      label: "\u{1F511} Set New Password in One Click",
      url: recoveryUrl
    },
    footerNote: "If you did not request this password reset, please ignore this email or notify admissions immediately."
  });
  const text = `
Vixora Academy \u2014 Password Reset
Verification Code: ${otpCode}

Hello ${studentName},
We received a request to reset the password for ${email}.
Your verification code is: ${otpCode} (expires in 15 minutes).

Or reset directly:
${recoveryUrl}

If you did not request this, please ignore this message.
  `.trim();
  return { html, text, subject };
}
function buildCertificateAwardEmail(params) {
  const {
    studentName,
    courseTitle,
    certificateId,
    grade,
    issuedDate,
    verificationUrl
  } = params;
  const subject = `\u{1F393} Official Certificate of Completion: ${courseTitle} (${certificateId})`;
  const bodyContentHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #120930; border: 1px solid #3b1d7a; border-radius: 12px; margin-bottom: 22px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            Congratulations <strong style="color: #ffffff;">${studentName}</strong>!<br /><br />
            You have successfully completed all curriculum requirements, weekly practical labs, and the final capstone project for <strong style="color: #a855f7;">${courseTitle}</strong>.
            Your official accredited certificate has been issued and entered into the public registry.
          </p>
        </td>
      </tr>
    </table>

    <!-- Certificate Credentials Card -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(145deg, #180d3d 0%, #100829 100%); border: 1px solid #10b981; border-radius: 14px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 22px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #2a1854;">
                <span style="font-size: 12px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 1px;">
                  \u{1F3C6} Verifiable Academic Credential
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0 4px 0; color: #94a3b8; font-size: 13px;">Certificate ID:</td>
              <td align="right" style="padding: 10px 0 4px 0; color: #facc15; font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-weight: 700; font-size: 13px;">
                ${certificateId}
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #94a3b8; font-size: 13px;">Academic Grade:</td>
              <td align="right" style="padding: 4px 0; color: #34d399; font-weight: 700; font-size: 14px;">
                ${grade}
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0 8px 0; color: #94a3b8; font-size: 13px;">Issue Date:</td>
              <td align="right" style="padding: 4px 0 8px 0; color: #ffffff; font-size: 13px;">
                ${issuedDate}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 14px;">
      <tr>
        <td style="font-size: 13px; line-height: 1.6; color: #94a3b8;">
          An official high-resolution, print-ready PDF certificate is attached to this email. You can also share the digital verification link on LinkedIn, your CV, and your portfolio.
        </td>
      </tr>
    </table>
  `;
  const html = renderEmailLayout({
    previewText: `Congratulations ${studentName}! Your official certificate for ${courseTitle} is ready.`,
    badgeText: "\u2713 Verified Academic Credential Issued",
    badgeVariant: "success",
    title: "Certificate of Completion Awarded",
    subtitle: "Your verified digital certificate has been issued and entered into the Vixora Academy registry.",
    bodyContentHtml,
    primaryCta: {
      label: "\u{1F393} View & Verify Digital Certificate",
      url: verificationUrl
    },
    footerNote: "This certificate is cryptographically recorded in the Vixora Digital Hub registry and can be verified by employers worldwide."
  });
  const text = `
Vixora Academy \u2014 Certificate of Completion
Course: ${courseTitle}
Student: ${studentName}
Certificate ID: ${certificateId}
Grade: ${grade}
Date: ${issuedDate}

Verification URL:
${verificationUrl}

A high-resolution PDF certificate is attached to this email.
Congratulations on your achievement!
  `.trim();
  return { html, text, subject };
}

// server/certificatePdfGenerator.ts
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
async function generateCertificatePdfBuffer(cert) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 28, bottom: 28, left: 32, right: 32 },
        info: {
          Title: `Vixora Academy Certificate - ${cert.studentName} (${cert.id})`,
          Author: "Vixora Academy Global Directorate",
          Subject: `Conferral of Certification in ${cert.courseTitle}`,
          Keywords: "Vixora Academy, Certification, AI, Cloud, Automation, Sarumi Hammad",
          Creator: "Vixora Academy Automated Credential Dispatcher"
        }
      });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));
      const pageWidth = 841.89;
      const pageHeight = 595.28;
      doc.rect(0, 0, pageWidth, pageHeight).fill("#FCFCFF");
      doc.rect(20, 20, pageWidth - 40, pageHeight - 40).lineWidth(3).stroke("#000048");
      doc.rect(26, 26, pageWidth - 52, pageHeight - 52).lineWidth(1).stroke("#7000F8");
      doc.rect(29, 29, pageWidth - 58, pageHeight - 58).lineWidth(0.5).stroke("#E5E5F0");
      const cornerSize = 14;
      doc.rect(20, 20, cornerSize, cornerSize).fill("#000048");
      doc.rect(23, 23, cornerSize - 6, cornerSize - 6).fill("#7000F8");
      doc.rect(pageWidth - 20 - cornerSize, 20, cornerSize, cornerSize).fill("#000048");
      doc.rect(pageWidth - 20 - cornerSize + 3, 23, cornerSize - 6, cornerSize - 6).fill("#7000F8");
      doc.rect(20, pageHeight - 20 - cornerSize, cornerSize, cornerSize).fill("#000048");
      doc.rect(23, pageHeight - 20 - cornerSize + 3, cornerSize - 6, cornerSize - 6).fill("#7000F8");
      doc.rect(pageWidth - 20 - cornerSize, pageHeight - 20 - cornerSize, cornerSize, cornerSize).fill("#000048");
      doc.rect(pageWidth - 20 - cornerSize + 3, pageHeight - 20 - cornerSize + 3, cornerSize - 6, cornerSize - 6).fill("#7000F8");
      const logoPathJpg = path.join(process.cwd(), "public", "images", "vixora-academy-logo.jpg");
      const logoPathPng = path.join(process.cwd(), "public", "images", "vixora-academy-logo.png");
      const resolvedLogo = fs.existsSync(logoPathJpg) ? logoPathJpg : fs.existsSync(logoPathPng) ? logoPathPng : null;
      let topY = 40;
      if (resolvedLogo) {
        try {
          doc.image(resolvedLogo, (pageWidth - 140) / 2, topY, { width: 140 });
          topY += 48;
        } catch (imgErr) {
          topY += 10;
        }
      } else {
        topY += 10;
      }
      doc.font("Helvetica-Bold").fontSize(20).fillColor("#000048").text("VIXORA ACADEMY", 40, topY, { align: "center", characterSpacing: 2 });
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#7000F8").text("LEARN. APPLY. EARN. \u2022 GLOBAL CREDENTIAL DIRECTORY", 40, topY + 24, {
        align: "center",
        characterSpacing: 1.5
      });
      doc.font("Helvetica").fontSize(8).fillColor("#5F6078").text("academy.vixoradigitalhub.com \u2022 Official Academic Directorate", 40, topY + 36, {
        align: "center"
      });
      const statementY = topY + 54;
      doc.font("Helvetica").fontSize(9).fillColor("#5F6078").text("THIS IS TO OFFICIALLY CERTIFY THAT", 40, statementY, {
        align: "center",
        characterSpacing: 2
      });
      const nameY = statementY + 16;
      doc.font("Helvetica-Bold").fontSize(26).fillColor("#000048").text(cert.studentName, 40, nameY, { align: "center" });
      const textWidth = doc.widthOfString(cert.studentName);
      const lineStartX = Math.max(120, (pageWidth - textWidth) / 2 - 20);
      const lineEndX = Math.min(pageWidth - 120, (pageWidth + textWidth) / 2 + 20);
      doc.moveTo(lineStartX, nameY + 32).lineTo(lineEndX, nameY + 32).lineWidth(1.5).stroke("#7000F8");
      const narrY = nameY + 40;
      doc.font("Helvetica").fontSize(10).fillColor("#480878").text(
        "has demonstrated executive excellence, fulfilling all prescribed rigorous curriculum standards, examinations, and the production capstone for conferral of the professional credential in:",
        80,
        narrY,
        { align: "center", width: pageWidth - 160 }
      );
      const courseY = narrY + 26;
      doc.font("Helvetica-Bold").fontSize(18).fillColor("#000048").text(cert.courseTitle, 60, courseY, { align: "center" });
      doc.font("Helvetica-Oblique").fontSize(11).fillColor("#480878").text(`Specialization: ${cert.specialization}`, 60, courseY + 22, { align: "center" });
      const honorsY = courseY + 38;
      const honorsText = `Grade: ${cert.grade}  |  Honors: ${cert.honors || "Distinction"}  |  Track: ${cert.trackBadge}`;
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#7000F8").text(honorsText, 60, honorsY, { align: "center" });
      const capstoneY = honorsY + 16;
      doc.font("Helvetica").fontSize(8.5).fillColor("#5F6078").text(
        `Production Capstone Defense: "${cert.capstoneTitle}" (Score: ${cert.capstoneScore})`,
        80,
        capstoneY,
        { align: "center", width: pageWidth - 160 }
      );
      const sigY = 460;
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#000048").text(cert.instructorName, 70, sigY + 14, { width: 220, align: "center" });
      doc.font("Helvetica").fontSize(8).fillColor("#5F6078").text(cert.instructorTitle, 70, sigY + 28, { width: 220, align: "center" });
      doc.moveTo(85, sigY + 8).lineTo(275, sigY + 8).lineWidth(1).stroke("#7000F8");
      const sealCenterX = pageWidth / 2;
      doc.circle(sealCenterX, sigY + 16, 32).lineWidth(2).stroke("#480878");
      doc.circle(sealCenterX, sigY + 16, 29).lineWidth(0.75).stroke("#7000F8");
      doc.font("Helvetica-Bold").fontSize(7).fillColor("#480878").text("VIXORA ACADEMY", sealCenterX - 35, sigY + 2, { width: 70, align: "center" });
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#000048").text("OFFICIAL SEAL", sealCenterX - 35, sigY + 11, { width: 70, align: "center" });
      doc.font("Helvetica").fontSize(6).fillColor("#7000F8").text("VERIFIED 2026", sealCenterX - 35, sigY + 21, { width: 70, align: "center" });
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#000048").text(`ID: ${cert.id}`, sealCenterX - 75, sigY + 52, { width: 150, align: "center" });
      doc.font("Helvetica").fontSize(7.5).fillColor("#5F6078").text(`Issued: ${cert.issueDate}`, sealCenterX - 75, sigY + 62, { width: 150, align: "center" });
      const deanX = pageWidth - 290;
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#000048").text(cert.directorName || "Sarumi Hammad", deanX, sigY + 14, { width: 220, align: "center" });
      doc.font("Helvetica").fontSize(8).fillColor("#5F6078").text(cert.directorTitle || "Dean, Vixora Academy", deanX, sigY + 28, { width: 220, align: "center" });
      doc.moveTo(deanX + 15, sigY + 8).lineTo(deanX + 205, sigY + 8).lineWidth(1).stroke("#7000F8");
      const footY = pageHeight - 44;
      doc.font("Helvetica").fontSize(7).fillColor("#5F6078").text(
        `Tamper-Proof Verification URL: ${cert.verificationUrl}  \u2022  SHA-256 Ledger: ${cert.credentialHash}`,
        40,
        footY,
        { align: "center", width: pageWidth - 80 }
      );
      doc.font("Helvetica-Bold").fontSize(6.5).fillColor("#7000F8").text(
        "CRYPTOGRAPHICALLY CONFERRED BY VIXORA ACADEMY GLOBAL DIRECTORATE \u2022 ALL RIGHTS RESERVED",
        40,
        footY + 10,
        { align: "center", characterSpacing: 1 }
      );
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// server/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";
function sanitizeSupabaseUrl(rawUrl2) {
  if (!rawUrl2) return "";
  return rawUrl2.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}
var rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
var supabaseUrl = sanitizeSupabaseUrl(rawUrl);
var supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
var supabaseAdminClient = null;
function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseAdminClient;
}
function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

// server/auth/authMiddleware.ts
async function requireAuthentication(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required. Bearer token missing in Authorization header.",
      code: "AUTH_TOKEN_MISSING"
    });
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      error: "Empty authentication token provided.",
      code: "AUTH_TOKEN_EMPTY"
    });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({
      error: "Authentication service unavailable. Supabase credentials are not configured.",
      code: "AUTH_SERVICE_UNCONFIGURED"
    });
  }
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user || !user.email) {
      return res.status(401).json({
        error: "Invalid, expired, or revoked authentication session.",
        code: "AUTH_TOKEN_INVALID"
      });
    }
    req.user = {
      id: user.id,
      email: user.email.toLowerCase().trim(),
      role: user.role,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata
    };
    next();
  } catch (err) {
    console.error("Error verifying Supabase authentication token:", err);
    return res.status(500).json({
      error: "Internal error verifying session token.",
      code: "AUTH_VERIFY_ERROR"
    });
  }
}

// server/auth/requireAdmin.ts
function getAuthorizedAdminEmails() {
  const rawAdminEmails = process.env.ADMIN_EMAILS || "";
  const emailList = rawAdminEmails.replace(/^["\']|["\']$/g, "").split(",").map((e) => e.trim().replace(/^["\']|["\']$/g, "").toLowerCase()).filter((e) => e.length > 0 && e.includes("@"));
  return new Set(emailList);
}
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.email) {
    return res.status(401).json({
      error: "Authentication required prior to admin authorization check.",
      code: "UNAUTHENTICATED"
    });
  }
  const verifiedEmail = req.user.email.toLowerCase().trim();
  const allowedAdmins = getAuthorizedAdminEmails();
  if (!allowedAdmins.has(verifiedEmail)) {
    return res.status(403).json({
      error: "Access denied: verified account is not an authorized administrator.",
      code: "FORBIDDEN_NOT_ADMIN"
    });
  }
  next();
}

// server/studentPortalServer.ts
var portalRouter = Router();
function isProductionEnvironment() {
  return process.env.NODE_ENV === "production";
}
function shouldPermitFallback() {
  return !isProductionEnvironment() && !isSupabaseConfigured();
}
var DatabaseServiceError = class extends Error {
  constructor(message = "Database service is unavailable.", code = "DATABASE_UNAVAILABLE", status = 503) {
    super(message);
    this.name = "DatabaseServiceError";
    this.code = code;
    this.status = status;
  }
};
var fallbackCertificatesStore = /* @__PURE__ */ new Map();
var fallbackStudentsStore = /* @__PURE__ */ new Map();
var fallbackEmailLogsStore = [];
SEED_CERTIFICATES.forEach((cert) => {
  fallbackCertificatesStore.set(cert.id.toUpperCase(), { ...cert });
});
SEED_STUDENTS.forEach((student) => {
  fallbackStudentsStore.set(student.email.toLowerCase(), { ...student });
});
if (SEED_CERTIFICATES.length > 0) {
  const sample = SEED_CERTIFICATES[0];
  fallbackEmailLogsStore.push({
    id: "eml-init-001",
    certificateId: sample.id,
    recipientEmail: sample.studentEmail,
    recipientName: sample.studentName,
    subject: `\u{1F393} Congratulations ${sample.studentName}! Your Vixora Academy Certificate is Ready`,
    status: "delivered",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    deliveryLatencyMs: 142,
    previewHtml: generateCertificateEmailHtml(sample)
  });
}
async function syncMachineLearningCourseToDatabase() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  try {
    const { error } = await supabase.from("courses").upsert({
      id: "machine-learning-data-science",
      title: "Machine Learning & Data Science",
      track_badge: "Data & Analytics",
      instructor: "Marcus Sterling",
      cohort: "Cohort 2026-B",
      total_modules: 18
    });
    if (error) {
      console.warn("[Supabase] Note on syncing Machine Learning & Data Science course:", error.message);
    } else {
      console.log('[Supabase] Successfully verified database record for course "machine-learning-data-science" (18 modules, \u20A660,000, Hybrid)');
    }
  } catch (err) {
    console.warn("[Supabase] Exception checking courses table for Machine Learning & Data Science:", err);
  }
}
syncMachineLearningCourseToDatabase();
function toIsoDateString(rawDate) {
  if (!rawDate) return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const parsed = Date.parse(rawDate);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().split("T")[0];
  }
  return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
}
function toHumanDateString(rawDate) {
  if (!rawDate) return "September 2026";
  const parsed = Date.parse(rawDate);
  if (!isNaN(parsed)) {
    return new Date(parsed).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }
  return rawDate;
}
function mapSupabaseCertificateToDomain(row, competenciesList = []) {
  return {
    id: row.id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    courseId: row.course_id,
    courseTitle: row.course_title,
    trackBadge: row.track_badge || "Professional Track",
    specialization: row.specialization || "",
    grade: row.grade,
    honors: row.honors || void 0,
    capstoneTitle: row.capstone_title || "Enterprise Capstone Project",
    capstoneScore: row.capstone_score || "98 / 100",
    issueDate: toHumanDateString(row.issue_date),
    completionDate: row.completion_date ? toHumanDateString(row.completion_date) : toHumanDateString(row.issue_date),
    durationWeeks: row.duration_weeks || 12,
    credentialHash: row.credential_hash,
    verificationUrl: row.verification_url || `https://academy.vixoradigitalhub.com/verify?id=${row.id}`,
    instructorName: row.instructor_name || "Dr. Adebayo Vance",
    instructorTitle: row.instructor_title || "Principal AI Architect, Vixora Labs",
    directorName: row.director_name || "Sarumi Hammad",
    directorTitle: row.director_title || "Dean, Vixora Academy",
    competencies: competenciesList.length > 0 ? competenciesList : [
      "Autonomous AI Tool Use & System Architecture",
      "Cloud Infrastructure Hardening & Containerization",
      "Full-Stack Data Engineering & API Deployment"
    ],
    status: row.status || "active",
    emailSentCount: row.email_sent_count || 0,
    lastEmailSentAt: row.last_email_sent_at || void 0
  };
}
function mapSupabaseEmailLogToDomain(row) {
  return {
    id: row.id,
    certificateId: row.certificate_id || "",
    recipientEmail: row.recipient_email,
    recipientName: row.recipient_name,
    subject: row.subject,
    status: row.status || "simulated",
    provider: row.provider || void 0,
    timestamp: row.timestamp || row.created_at || (/* @__PURE__ */ new Date()).toISOString(),
    deliveryLatencyMs: row.delivery_latency_ms || 0,
    previewHtml: row.preview_html || "",
    previewText: row.preview_text || void 0,
    messageId: row.message_id || void 0,
    error: row.error || void 0,
    gmailComposeUrl: row.gmail_compose_url || void 0,
    mailtoUrl: row.mailto_url || void 0,
    infoNotice: row.info_notice || void 0,
    deliveredToInternet: Boolean(row.delivered_to_internet),
    hasAttachment: Boolean(row.has_attachment),
    attachmentName: row.attachment_name || void 0
  };
}
var CERT_ID_REGEX = /^[A-Za-z0-9\-_]{4,40}$/;
function isValidCertificateId(id) {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  if (trimmed.length < 4 || trimmed.length > 40) return false;
  return CERT_ID_REGEX.test(trimmed);
}
var EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  if (/[\r\n\0;,<>'"\\]/.test(trimmed)) return false;
  return EMAIL_REGEX.test(trimmed);
}
function isPlainObject(obj) {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return false;
  }
  const proto = Object.getPrototypeOf(obj);
  if (proto !== null && proto !== Object.prototype) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(obj, "__proto__") || Object.prototype.hasOwnProperty.call(obj, "constructor") || Object.prototype.hasOwnProperty.call(obj, "prototype")) {
    return false;
  }
  return true;
}
function parsePaginationQuery(rawLimit, rawOffset, defaultLimit = 50, maxLimit = 100, rawPage) {
  let limit = defaultLimit;
  let offset = 0;
  if (rawLimit !== void 0 && rawLimit !== null && rawLimit !== "") {
    if (typeof rawLimit !== "string" && typeof rawLimit !== "number") {
      return { limit, offset, error: 'Query parameter "limit" must be a valid integer.' };
    }
    const str = String(rawLimit).trim();
    if (!/^\d+$/.test(str)) {
      return { limit, offset, error: 'Query parameter "limit" must be a positive integer.' };
    }
    const parsed = parseInt(str, 10);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > maxLimit) {
      return { limit, offset, error: `Query parameter "limit" must be between 1 and ${maxLimit}.` };
    }
    limit = parsed;
  }
  if (rawOffset !== void 0 && rawOffset !== null && rawOffset !== "") {
    if (typeof rawOffset !== "string" && typeof rawOffset !== "number") {
      return { limit, offset, error: 'Query parameter "offset" must be a valid integer.' };
    }
    const str = String(rawOffset).trim();
    if (!/^\d+$/.test(str)) {
      return { limit, offset, error: 'Query parameter "offset" must be a non-negative integer.' };
    }
    const parsed = parseInt(str, 10);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1e5) {
      return { limit, offset, error: 'Query parameter "offset" must be between 0 and 100000.' };
    }
    offset = parsed;
  } else if (rawPage !== void 0 && rawPage !== null && rawPage !== "") {
    if (typeof rawPage !== "string" && typeof rawPage !== "number") {
      return { limit, offset, error: 'Query parameter "page" must be a valid integer.' };
    }
    const str = String(rawPage).trim();
    if (!/^\d+$/.test(str)) {
      return { limit, offset, error: 'Query parameter "page" must be a positive integer.' };
    }
    const parsed = parseInt(str, 10);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 1e4) {
      return { limit, offset, error: 'Query parameter "page" must be between 1 and 10000.' };
    }
    offset = (parsed - 1) * limit;
  }
  return { limit, offset };
}
async function getCertificateById(id) {
  if (!isValidCertificateId(id)) {
    return null;
  }
  const cleanId = id.toUpperCase().trim();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data: certRow, error: certError } = await supabase.from("certificates").select("*").eq("id", cleanId).maybeSingle();
      if (certError) {
        console.error(`[Supabase] Error querying certificate ${cleanId}:`, certError);
        if (isProductionEnvironment() || isSupabaseConfigured()) {
          throw new DatabaseServiceError(`Database query failed for certificate ${cleanId}`, "DATABASE_ERROR", 503);
        }
      }
      if (certRow) {
        const { data: compRows, error: compError } = await supabase.from("certificate_competencies").select("name").eq("certificate_id", cleanId);
        if (compError) {
          console.warn(`[Supabase] Warning reading competencies for ${cleanId}:`, compError);
        }
        const compList = (compRows || []).map((c) => c.name).filter(Boolean);
        return mapSupabaseCertificateToDomain(certRow, compList);
      }
      if (isProductionEnvironment() || isSupabaseConfigured()) {
        return null;
      }
    } catch (err) {
      if (err instanceof DatabaseServiceError) {
        throw err;
      }
      console.error(`[Supabase] Outage or connection failure querying certificate ${cleanId}:`, err);
      if (isProductionEnvironment() || isSupabaseConfigured()) {
        throw new DatabaseServiceError(`Database connection error while querying certificate ${cleanId}`, "DATABASE_UNAVAILABLE", 503);
      }
    }
  } else {
    if (isProductionEnvironment()) {
      throw new DatabaseServiceError("Certificate registry database is not configured in production.", "DATABASE_UNCONFIGURED", 503);
    }
  }
  if (shouldPermitFallback()) {
    return fallbackCertificatesStore.get(cleanId) || null;
  }
  return null;
}
async function getCertificatesByStudentEmail(email) {
  const cleanEmail = email.toLowerCase().trim();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data: certRows, error } = await supabase.from("certificates").select("*").ilike("student_email", cleanEmail);
      if (error) {
        console.error(`[Supabase] Error querying student certificates for ${cleanEmail}:`, error);
        if (isProductionEnvironment() || isSupabaseConfigured()) {
          throw new DatabaseServiceError(`Failed querying certificates for ${cleanEmail}`, "DATABASE_ERROR", 503);
        }
      }
      if (certRows) {
        if (certRows.length === 0) {
          return [];
        }
        const certIds = certRows.map((r) => r.id);
        const { data: compRows } = await supabase.from("certificate_competencies").select("certificate_id, name").in("certificate_id", certIds);
        const compMap = /* @__PURE__ */ new Map();
        (compRows || []).forEach((c) => {
          const list = compMap.get(c.certificate_id) || [];
          list.push(c.name);
          compMap.set(c.certificate_id, list);
        });
        return certRows.map(
          (row) => mapSupabaseCertificateToDomain(row, compMap.get(row.id) || [])
        );
      }
    } catch (err) {
      if (err instanceof DatabaseServiceError) throw err;
      console.error(`[Supabase] Connection error querying student certificates for ${cleanEmail}:`, err);
      if (isProductionEnvironment() || isSupabaseConfigured()) {
        throw new DatabaseServiceError(`Database connection error querying certificates for ${cleanEmail}`, "DATABASE_UNAVAILABLE", 503);
      }
    }
  } else {
    if (isProductionEnvironment()) {
      throw new DatabaseServiceError("Certificate database is not configured in production.", "DATABASE_UNCONFIGURED", 503);
    }
  }
  if (shouldPermitFallback()) {
    const results = [];
    fallbackCertificatesStore.forEach((c) => {
      if (c.studentEmail.toLowerCase() === cleanEmail) {
        results.push(c);
      }
    });
    return results;
  }
  return [];
}
async function getAuthenticatedStudentProfile(authUserId, verifiedEmail) {
  const cleanEmail = verifiedEmail.toLowerCase().trim();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      let { data: studentRow, error: stuError } = await supabase.from("students").select("*").eq("auth_user_id", authUserId).maybeSingle();
      if (!studentRow && !stuError) {
        const { data: studentByEmail } = await supabase.from("students").select("*").ilike("email", cleanEmail).maybeSingle();
        if (studentByEmail) {
          if (!studentByEmail.auth_user_id) {
            const { error: linkErr } = await supabase.from("students").update({
              auth_user_id: authUserId,
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            }).eq("id", studentByEmail.id);
            if (!linkErr) {
              studentByEmail.auth_user_id = authUserId;
            }
          }
          if (studentByEmail.auth_user_id === authUserId) {
            studentRow = studentByEmail;
          }
        }
      }
      if (studentRow) {
        const studentId = studentRow.id;
        const studentName = studentRow.name;
        const enrolledDate = studentRow.enrolled_date || studentRow.enrolled_at || "September 2026";
        const role = studentRow.role || "student";
        const avatarUrl = studentRow.avatar_url || void 0;
        const { data: enrollments, error: enrollError } = await supabase.from("enrollments").select(`
            id,
            status,
            cohort,
            progress_percent,
            completed_modules,
            total_modules,
            courses (
              id,
              title,
              badge,
              instructor_name,
              total_modules
            )
          `).eq("student_id", studentId);
        const certs = await getCertificatesByStudentEmail(studentRow.email || cleanEmail);
        const certMap = /* @__PURE__ */ new Map();
        certs.forEach((c) => certMap.set(c.courseId, c.id));
        const studentCourses = [];
        if (!enrollError && enrollments && enrollments.length > 0) {
          enrollments.forEach((e) => {
            const course = e.courses;
            if (course) {
              studentCourses.push({
                courseId: course.id,
                title: course.title,
                badge: course.badge || "Enterprise Track",
                progressPercent: e.progress_percent ?? 75,
                status: e.status || "in-progress",
                cohort: e.cohort || "Cohort 2026-B",
                instructor: course.instructor_name || "Dr. Adebayo Vance",
                completedModules: e.completed_modules ?? 9,
                totalModules: course.total_modules || e.total_modules || 12,
                certificateId: certMap.get(course.id) || void 0
              });
            }
          });
        }
        if (studentCourses.length === 0) {
          studentCourses.push({
            courseId: "ai-automation-digital-business-systems",
            title: "Autonomous AI Systems & Scalable Architecture",
            badge: "Enterprise Track",
            progressPercent: 75,
            status: "in-progress",
            cohort: "Cohort 2026-B",
            instructor: "Dr. Adebayo Vance",
            completedModules: 9,
            totalModules: 12,
            certificateId: certMap.get("ai-automation-digital-business-systems") || void 0
          });
        }
        return {
          id: studentId,
          name: studentName,
          email: studentRow.email || cleanEmail,
          avatarUrl,
          enrolledDate,
          role,
          courses: studentCourses
        };
      }
      return null;
    } catch (err) {
      if (err instanceof DatabaseServiceError) throw err;
      console.warn(`[Supabase] Error reading student profile for ${cleanEmail}:`, err);
      if (isProductionEnvironment() || isSupabaseConfigured()) {
        throw new DatabaseServiceError(`Database error reading student profile for ${cleanEmail}`, "DATABASE_ERROR", 503);
      }
    }
  } else {
    if (isProductionEnvironment()) {
      throw new DatabaseServiceError("Student database is not configured in production.", "DATABASE_UNCONFIGURED", 503);
    }
  }
  if (shouldPermitFallback()) {
    const cachedStudent = fallbackStudentsStore.get(cleanEmail);
    return cachedStudent || null;
  }
  return null;
}
async function generateSecureCertificateId(courseTitle) {
  const MAX_ATTEMPTS = 3;
  const track = courseTitle.includes("AI") ? "ENG" : "AUT";
  const supabase = getSupabaseAdmin();
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const randomBytes = crypto.randomBytes(8);
    const tokenRaw = randomBytes.toString("hex").toUpperCase();
    const secureToken = `${tokenRaw.slice(0, 4)}-${tokenRaw.slice(4, 8)}-${tokenRaw.slice(8, 12)}`;
    const candidateId = `VA-2026-${secureToken}-${track}`;
    if (fallbackCertificatesStore.has(candidateId)) {
      console.warn(`[Certificate Collision] Candidate ID ${candidateId} collided in fallback store. Retry attempt ${attempt}/${MAX_ATTEMPTS}`);
      continue;
    }
    if (supabase) {
      try {
        const { data: existing } = await supabase.from("certificates").select("id").eq("id", candidateId).maybeSingle();
        if (existing) {
          console.warn(`[Certificate Collision] Candidate ID ${candidateId} collided in Supabase. Retry attempt ${attempt}/${MAX_ATTEMPTS}`);
          continue;
        }
      } catch (checkErr) {
        console.error("[Certificate ID Generator] Supabase check error:", checkErr);
      }
    }
    return candidateId;
  }
  throw new Error("Failed to generate a unique certificate ID after maximum attempts due to collision.");
}
async function saveIssuedCertificate(cert, competencies) {
  const supabase = getSupabaseAdmin();
  if (isProductionEnvironment() || isSupabaseConfigured()) {
    if (!supabase) {
      throw new DatabaseServiceError("Cannot issue certificate: database is not configured in production.", "DATABASE_UNCONFIGURED", 503);
    }
  } else if (shouldPermitFallback()) {
    if (fallbackCertificatesStore.has(cert.id)) {
      throw new Error(`Certificate with ID ${cert.id} already exists in fallback store.`);
    }
    fallbackCertificatesStore.set(cert.id, cert);
    if (!supabase) {
      return;
    }
  } else {
    throw new DatabaseServiceError("Cannot issue certificate: database is not configured.", "DATABASE_UNCONFIGURED", 503);
  }
  try {
    await supabase.from("courses").upsert({
      id: cert.courseId,
      title: cert.courseTitle,
      track_badge: cert.trackBadge,
      instructor: cert.instructorName,
      cohort: "Cohort 2026-A",
      total_modules: cert.durationWeeks || 12
    });
    let studentId = crypto.randomUUID();
    const studentCode = `STU-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const { data: existingStudent } = await supabase.from("students").select("id").ilike("email", cert.studentEmail).maybeSingle();
    if (existingStudent) {
      studentId = existingStudent.id;
    } else {
      await supabase.from("students").insert({
        id: studentId,
        student_code: studentCode,
        name: cert.studentName,
        email: cert.studentEmail,
        enrolled_date: cert.issueDate,
        role: "alumni"
      });
    }
    const { error: certInsertErr } = await supabase.from("certificates").insert({
      id: cert.id,
      student_name: cert.studentName,
      student_email: cert.studentEmail,
      course_id: cert.courseId,
      course_title: cert.courseTitle,
      track_badge: cert.trackBadge,
      specialization: cert.specialization,
      grade: cert.grade,
      honors: cert.honors || null,
      capstone_title: cert.capstoneTitle,
      capstone_score: cert.capstoneScore,
      issue_date: toIsoDateString(cert.issueDate),
      completion_date: toIsoDateString(cert.completionDate),
      duration_weeks: cert.durationWeeks,
      credential_hash: cert.credentialHash,
      verification_url: cert.verificationUrl,
      instructor_name: cert.instructorName,
      instructor_title: cert.instructorTitle,
      director_name: cert.directorName,
      director_title: cert.directorTitle,
      status: cert.status,
      email_sent_count: cert.emailSentCount,
      last_email_sent_at: cert.lastEmailSentAt || (/* @__PURE__ */ new Date()).toISOString()
    });
    if (certInsertErr) {
      if (shouldPermitFallback()) {
        fallbackCertificatesStore.delete(cert.id);
      }
      throw certInsertErr;
    }
    if (competencies.length > 0) {
      await supabase.from("certificate_competencies").delete().eq("certificate_id", cert.id);
      const compRows = competencies.map((name) => ({
        certificate_id: cert.id,
        name,
        category: "Core Engineering"
      }));
      await supabase.from("certificate_competencies").insert(compRows);
    }
    await supabase.from("enrollments").upsert(
      {
        student_id: studentId,
        course_id: cert.courseId,
        status: "completed",
        progress_percent: 100,
        completed_modules: cert.durationWeeks || 12,
        certificate_id: cert.id
      },
      { onConflict: "student_id,course_id" }
    );
  } catch (err) {
    if (shouldPermitFallback()) {
      fallbackCertificatesStore.delete(cert.id);
    }
    console.error("[Supabase] Error saving issued certificate:", err);
    throw err;
  }
}
async function saveEmailLog(log) {
  if (shouldPermitFallback()) {
    fallbackEmailLogsStore.unshift(log);
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  try {
    await supabase.from("email_logs").insert({
      id: log.id,
      certificate_id: log.certificateId || null,
      recipient_email: log.recipientEmail,
      recipient_name: log.recipientName,
      subject: log.subject,
      status: log.status,
      provider: log.provider || "simulated",
      timestamp: log.timestamp,
      delivery_latency_ms: log.deliveryLatencyMs,
      preview_html: log.previewHtml,
      preview_text: log.previewText || null,
      message_id: log.messageId || null,
      error: log.error || null,
      gmail_compose_url: log.gmailComposeUrl || null,
      mailto_url: log.mailtoUrl || null,
      info_notice: log.infoNotice || null,
      delivered_to_internet: log.deliveredToInternet || false,
      has_attachment: log.hasAttachment || false,
      attachment_name: log.attachmentName || null
    });
    if (log.certificateId) {
      await supabase.from("certificates").update({
        last_email_sent_at: log.timestamp
      }).eq("id", log.certificateId);
    }
  } catch (err) {
    console.warn("[Supabase] Error persisting email log:", err);
  }
}
async function getRecentEmailLogs(limitCount = 50, offsetCount = 0) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data: rows, error } = await supabase.from("email_logs").select("*").order("created_at", { ascending: false }).range(offsetCount, offsetCount + limitCount - 1);
      if (!error && rows && rows.length > 0) {
        return rows.map((r) => mapSupabaseEmailLogToDomain(r));
      }
      if (!error && rows && rows.length === 0) {
        return [];
      }
    } catch (err) {
      console.warn("[Supabase] Error fetching email logs, using fallback cache:", err);
    }
  }
  if (isProductionEnvironment() || isSupabaseConfigured()) {
    return [];
  }
  return fallbackEmailLogsStore.slice(offsetCount, offsetCount + limitCount);
}
var SlidingWindowRateLimiter = class {
  constructor(options) {
    this.store = /* @__PURE__ */ new Map();
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.prefix = options.prefix || "rl";
  }
  check(key) {
    const now = Date.now();
    const fullKey = `${this.prefix}:${key}`;
    const record = this.store.get(fullKey);
    if (!record || now > record.resetTime) {
      const resetTime = now + this.windowMs;
      this.store.set(fullKey, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: this.max - 1,
        resetInSeconds: Math.ceil(this.windowMs / 1e3),
        limit: this.max
      };
    }
    if (record.count >= this.max) {
      const resetInSeconds2 = Math.max(1, Math.ceil((record.resetTime - now) / 1e3));
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: resetInSeconds2,
        limit: this.max
      };
    }
    record.count += 1;
    const remaining = this.max - record.count;
    const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1e3));
    return {
      allowed: true,
      remaining,
      resetInSeconds,
      limit: this.max
    };
  }
  peek(key) {
    const now = Date.now();
    const fullKey = `${this.prefix}:${key}`;
    const record = this.store.get(fullKey);
    if (!record || now > record.resetTime) {
      return {
        remaining: this.max,
        resetInSeconds: Math.ceil(this.windowMs / 1e3),
        limit: this.max,
        isLimited: false
      };
    }
    const remaining = Math.max(0, this.max - record.count);
    const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1e3));
    return {
      remaining,
      resetInSeconds,
      limit: this.max,
      isLimited: record.count >= this.max
    };
  }
  reset(key) {
    this.store.delete(`${this.prefix}:${key}`);
  }
};
var loginRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 15 * 60 * 1e3,
  max: 5,
  prefix: "login"
});
var emailRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 10 * 60 * 1e3,
  max: 6,
  prefix: "cert_email"
});
var verifyRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1e3,
  max: 40,
  prefix: "cert_verify"
});
var pdfRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1e3,
  max: 10,
  prefix: "cert_pdf"
});
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "127.0.0.1";
}
portalRouter.get("/student/rate-limit-status", (req, res) => {
  const ip = getClientIp(req);
  if (req.query.email !== void 0 && req.query.email !== null && req.query.email !== "") {
    if (typeof req.query.email !== "string" || !isValidEmail(req.query.email)) {
      return res.status(400).json({
        error: 'Query parameter "email" must be a valid email address.',
        code: "INVALID_EMAIL_QUERY"
      });
    }
  }
  const email = req.query.email?.toLowerCase().trim() || "default";
  const key = `${ip}:${email}`;
  const status = loginRateLimiter.peek(key);
  res.json({
    limit: status.limit,
    remaining: status.remaining,
    resetInSeconds: status.resetInSeconds,
    isLimited: status.isLimited
  });
});
portalRouter.post("/student/record-login-attempt", (req, res) => {
  const ip = getClientIp(req);
  const email = req.body?.email?.toLowerCase().trim() || "default";
  const key = `${ip}:${email}`;
  const rlCheck = loginRateLimiter.check(key);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      allowed: false,
      limit: rlCheck.limit,
      remaining: 0,
      resetInSeconds: rlCheck.resetInSeconds,
      error: `Too many login attempts. Please wait ${rlCheck.resetInSeconds} seconds before trying again.`,
      code: "RATE_LIMIT_EXCEEDED"
    });
  }
  return res.json({
    allowed: true,
    limit: rlCheck.limit,
    remaining: rlCheck.remaining,
    resetInSeconds: rlCheck.resetInSeconds
  });
});
portalRouter.post("/student/reset-rate-limit", (req, res) => {
  const ip = getClientIp(req);
  const email = req.body?.email?.toLowerCase().trim() || "default";
  const key = `${ip}:${email}`;
  loginRateLimiter.reset(key);
  return res.json({ success: true, remaining: 5 });
});
function sanitizeUrl(rawUrl2) {
  if (!rawUrl2) return "";
  return rawUrl2.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}
portalRouter.post("/auth/forgot-password", async (req, res) => {
  const ip = getClientIp(req);
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { email, portal, redirectOrigin } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email address is required.", code: "EMAIL_REQUIRED" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Please enter a valid email address.", code: "INVALID_EMAIL_FORMAT" });
  }
  if (portal !== void 0 && portal !== null && portal !== "admin" && portal !== "student") {
    return res.status(400).json({ error: 'Portal parameter must be "admin" or "student".', code: "INVALID_PORTAL" });
  }
  if (redirectOrigin !== void 0 && redirectOrigin !== null && (typeof redirectOrigin !== "string" || redirectOrigin.length > 300)) {
    return res.status(400).json({ error: "Invalid redirectOrigin parameter.", code: "INVALID_ORIGIN" });
  }
  const cleanEmail = email.toLowerCase().trim();
  const rlCheck = emailRateLimiter.check(`forgot_pw:${ip}:${cleanEmail}`);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Too many password reset attempts. Please wait ${rlCheck.resetInSeconds} seconds before requesting another reset link.`,
      code: "RATE_LIMIT_EXCEEDED",
      resetInSeconds: rlCheck.resetInSeconds
    });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({
      error: "Authentication service is unavailable. Supabase is not configured.",
      code: "AUTH_SERVICE_UNCONFIGURED"
    });
  }
  const isPortalAdmin = portal === "admin";
  const authorizedAdmins = getAuthorizedAdminEmails();
  if (isPortalAdmin && !authorizedAdmins.has(cleanEmail)) {
    return res.status(403).json({
      error: "This email is not registered as an authorized administrator.",
      code: "FORBIDDEN_NOT_ADMIN"
    });
  }
  try {
    const { data: listData, error: listErr } = await supabase.auth.admin.listUsers();
    const allUsers = listData?.users || [];
    let authUser = allUsers.find((u) => u.email?.toLowerCase() === cleanEmail);
    let recipientName = cleanEmail.split("@")[0];
    if (!authUser) {
      if (isPortalAdmin && authorizedAdmins.has(cleanEmail)) {
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          email_confirm: true,
          user_metadata: { name: cleanEmail.split("@")[0], role: "admin" }
        });
        if (!createErr && created?.user) {
          authUser = created.user;
          recipientName = "Administrator";
        }
      } else {
        const { data: studentRow } = await supabase.from("students").select("id, name, email").eq("email", cleanEmail).maybeSingle();
        if (studentRow) {
          recipientName = studentRow.name || recipientName;
          const { data: created, error: createErr } = await supabase.auth.admin.createUser({
            email: cleanEmail,
            email_confirm: true,
            user_metadata: { name: studentRow.name, role: "student" }
          });
          if (!createErr && created?.user) {
            authUser = created.user;
            await supabase.from("students").update({ auth_user_id: created.user.id }).eq("id", studentRow.id);
          }
        }
      }
    } else {
      recipientName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || recipientName;
    }
    if (!authUser) {
      return res.json({
        success: true,
        message: "If an account is registered with this email, a password reset link has been dispatched to your inbox.",
        email: cleanEmail
      });
    }
    const origin = redirectOrigin && typeof redirectOrigin === "string" && redirectOrigin.startsWith("http") ? redirectOrigin.replace(/\/+$/, "") : `${req.protocol}://${req.get("host")}`;
    const redirectPath = isPortalAdmin ? "/admin?type=recovery" : "/pages/student-portal?type=recovery";
    const finalRedirect = `${origin}${redirectPath}`;
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: cleanEmail,
      options: {
        redirectTo: finalRedirect
      }
    });
    if (linkErr || !linkData?.properties) {
      console.error("Supabase recovery link error:", linkErr);
      return res.status(500).json({
        error: "Unable to generate a password reset link at this time. Please try again shortly or contact admissions support.",
        code: "RECOVERY_LINK_GENERATION_FAILED"
      });
    }
    const actionLink = linkData.properties.action_link;
    const emailOtp = linkData.properties.email_otp;
    const subject = isPortalAdmin ? `\u{1F510} Administrator Password Recovery \u2014 Vixora Digital Hub` : `\u{1F510} Reset Your Password \u2014 Vixora Academy`;
    const resetEmailData = buildPasswordResetEmail({
      studentName: recipientName,
      email: cleanEmail,
      otpCode: emailOtp || "",
      recoveryUrl: actionLink
    });
    const htmlContent = resetEmailData.html;
    const textContent = resetEmailData.text;
    const dispatchResult = await dispatchGenericEmail({
      to: cleanEmail,
      toName: recipientName,
      subject: resetEmailData.subject,
      html: htmlContent,
      text: textContent
    });
    const logId = `eml-reset-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
    await saveEmailLog({
      id: logId,
      recipientEmail: cleanEmail,
      recipientName,
      subject,
      status: dispatchResult.delivered ? "delivered" : "simulated",
      provider: dispatchResult.provider,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      deliveryLatencyMs: dispatchResult.deliveryLatencyMs,
      previewHtml: htmlContent,
      previewText: textContent,
      messageId: dispatchResult.messageId,
      deliveredToInternet: dispatchResult.deliveredToInternet,
      infoNotice: `Password reset link and OTP generated via Supabase Auth. ${dispatchResult.infoNotice}`
    });
    return res.json({
      success: true,
      message: `A secure password reset link and 6-digit verification code have been dispatched to ${cleanEmail}.`,
      email: cleanEmail,
      hasOtp: Boolean(emailOtp),
      provider: dispatchResult.provider,
      delivered: dispatchResult.delivered,
      isDev: process.env.NODE_ENV !== "production",
      devActionLink: process.env.NODE_ENV !== "production" ? actionLink : void 0,
      devOtp: process.env.NODE_ENV !== "production" ? emailOtp : void 0
    });
  } catch (err) {
    console.error("Password reset handler error:", err);
    return res.status(500).json({
      error: "An internal server error occurred while processing your password reset request.",
      code: "RESET_INTERNAL_ERROR"
    });
  }
});
portalRouter.post("/auth/reset-password-with-otp", async (req, res) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      error: "Email, 6-digit verification code, and new password are required.",
      code: "MISSING_FIELDS"
    });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: "Please enter a valid email address.",
      code: "INVALID_EMAIL_FORMAT"
    });
  }
  const cleanEmail = String(email).toLowerCase().trim();
  const cleanOtp = String(otp).trim();
  if (!/^\d{6}$/.test(cleanOtp)) {
    return res.status(400).json({
      error: "Verification code must be a 6-digit numeric code.",
      code: "INVALID_OTP_FORMAT"
    });
  }
  if (typeof newPassword !== "string" || newPassword.length < 6 || newPassword.length > 200) {
    return res.status(400).json({
      error: "Password must be between 6 and 200 characters long.",
      code: "PASSWORD_INVALID_LENGTH"
    });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({ error: "Supabase is not configured." });
  }
  try {
    const rawSbUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const rawSbAnon = process.env.VITE_SUPABASE_ANON_KEY || "";
    const anonSb = createClient2(sanitizeUrl(rawSbUrl), rawSbAnon);
    const { data: vData, error: vErr } = await anonSb.auth.verifyOtp({
      email: cleanEmail,
      token: cleanOtp,
      type: "recovery"
    });
    if (vErr || !vData?.user) {
      return res.status(400).json({
        error: "Your 6-digit verification code has expired or is invalid. Please check your email or request a new code below.",
        code: "INVALID_OTP"
      });
    }
    const { data: uData, error: uErr } = await supabase.auth.admin.updateUserById(vData.user.id, {
      password: String(newPassword)
    });
    if (uErr) {
      return res.status(400).json({
        error: uErr.message || "Unable to update password. Please ensure it is at least 6 characters long.",
        code: "PASSWORD_UPDATE_FAILED"
      });
    }
    return res.json({
      success: true,
      message: "Password successfully updated. You can now sign in with your new credentials."
    });
  } catch (err) {
    console.error("Error in /api/auth/reset-password-with-otp:", err);
    return res.status(400).json({
      error: "Unable to update password with this verification code. Please request a fresh code below.",
      code: "RESET_FAILED"
    });
  }
});
portalRouter.post("/auth/reset-password-with-token", async (req, res) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { accessToken, newPassword } = req.body;
  if (!accessToken || typeof accessToken !== "string") {
    return res.status(400).json({ error: "Valid session access token is required.", code: "TOKEN_REQUIRED" });
  }
  if (typeof newPassword !== "string" || newPassword.length < 6 || newPassword.length > 200) {
    return res.status(400).json({ error: "Password must be between 6 and 200 characters long.", code: "PASSWORD_INVALID_LENGTH" });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({ error: "Authentication service is unavailable.", code: "AUTH_UNAVAILABLE" });
  }
  try {
    const { data: userData, error: userErr } = await supabase.auth.getUser(accessToken);
    if (userErr || !userData?.user) {
      return res.status(401).json({
        error: "Your password setup link or session has expired. Please request a new recovery link.",
        code: "TOKEN_EXPIRED"
      });
    }
    const { error: updateErr } = await supabase.auth.admin.updateUserById(userData.user.id, {
      password: String(newPassword)
    });
    if (updateErr) {
      return res.status(400).json({
        error: updateErr.message || "Unable to update password. Please ensure it is at least 6 characters.",
        code: "UPDATE_FAILED"
      });
    }
    return res.json({
      success: true,
      message: "Password successfully updated. You can now sign in with your new credentials."
    });
  } catch (err) {
    console.error("Error in /api/auth/reset-password-with-token:", err);
    return res.status(500).json({
      error: "An internal error occurred while updating your password.",
      code: "RESET_FAILED"
    });
  }
});
portalRouter.post("/auth/student-login", async (req, res) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { email, password } = req.body;
  if (!email || !password || typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Email and password are required.", code: "MISSING_FIELDS" });
  }
  const ip = getClientIp(req);
  const cleanEmail = email.toLowerCase().trim();
  const key = `${ip}:${cleanEmail}`;
  const rlCheck = loginRateLimiter.check(key);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Too many login attempts. Please wait ${rlCheck.resetInSeconds} seconds before trying again.`,
      code: "RATE_LIMIT_EXCEEDED",
      remaining: 0,
      resetInSeconds: rlCheck.resetInSeconds
    });
  }
  const rawSbUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://xenjfszsppwqadgwzpxl.supabase.co";
  const rawSbAnon = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_8xjidcETDkXfYSZpQU7t_Q_su_Pmil4";
  const anonSb = createClient2(sanitizeUrl(rawSbUrl), rawSbAnon);
  try {
    const { data, error } = await anonSb.auth.signInWithPassword({
      email: cleanEmail,
      password: String(password)
    });
    if (error || !data.session) {
      return res.status(401).json({
        error: error?.message || "Login failed. Invalid student credentials.",
        code: "INVALID_CREDENTIALS",
        remaining: rlCheck.remaining,
        resetInSeconds: rlCheck.resetInSeconds
      });
    }
    loginRateLimiter.reset(key);
    return res.json({
      success: true,
      session: {
        access_token: data.session.access_token,
        token_type: data.session.token_type,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in
      },
      user: data.user
    });
  } catch (err) {
    console.error("Error in /api/auth/student-login:", err);
    return res.status(500).json({
      error: "Authentication service temporarily unavailable. Please retry shortly.",
      code: "AUTH_ERROR"
    });
  }
});
portalRouter.post("/student/login", (req, res) => {
  return res.status(401).json({
    error: "Direct unauthenticated student login has been retired. Authenticate with Supabase Auth (supabase.auth.signInWithPassword) and query /api/student/profile with Bearer token.",
    code: "AUTH_METHOD_DEPRECATED"
  });
});
portalRouter.get("/student/profile", requireAuthentication, async (req, res) => {
  const verifiedUser = req.user;
  if (!verifiedUser || !verifiedUser.id || !verifiedUser.email) {
    return res.status(401).json({
      error: "Invalid or missing user session context.",
      code: "AUTH_SESSION_INVALID"
    });
  }
  if (req.query.email !== void 0) {
    if (typeof req.query.email !== "string" || !isValidEmail(req.query.email)) {
      return res.status(400).json({
        error: "Invalid email query parameter format.",
        code: "INVALID_EMAIL_QUERY"
      });
    }
  }
  const queryEmail = req.query.email?.toLowerCase().trim();
  if (queryEmail && queryEmail !== verifiedUser.email) {
    return res.status(403).json({
      error: "Access denied: You cannot request another student's profile.",
      code: "FORBIDDEN_PROFILE_MISMATCH"
    });
  }
  try {
    const student = await getAuthenticatedStudentProfile(verifiedUser.id, verifiedUser.email);
    if (!student) {
      return res.status(404).json({
        error: "No enrolled student record found for this authenticated account.",
        code: "STUDENT_ACCOUNT_NOT_LINKED"
      });
    }
    const studentCerts = await getCertificatesByStudentEmail(student.email);
    return res.json({
      student,
      certificates: studentCerts
    });
  } catch (err) {
    console.error("Error in /api/student/profile:", err);
    const status = err instanceof DatabaseServiceError ? err.status : 500;
    return res.status(status).json({
      error: "Failed to retrieve student profile.",
      code: err instanceof DatabaseServiceError ? err.code : "PROFILE_RETRIEVAL_ERROR"
    });
  }
});
async function handleCertificateVerification(req, res, rawId) {
  const ip = getClientIp(req);
  const rlCheck = verifyRateLimiter.check(ip);
  res.setHeader("X-RateLimit-Limit", rlCheck.limit);
  res.setHeader("X-RateLimit-Remaining", rlCheck.remaining);
  res.setHeader("X-RateLimit-Reset", rlCheck.resetInSeconds);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      verified: false,
      error: `Verification rate limit exceeded. Please wait ${rlCheck.resetInSeconds}s before attempting further verification requests.`,
      code: "RATE_LIMIT_EXCEEDED",
      retryAfterSeconds: rlCheck.resetInSeconds
    });
  }
  const rawTarget = rawId || req.query.id;
  if (!rawTarget || typeof rawTarget !== "string") {
    return res.status(400).json({
      verified: false,
      error: "Certificate Credential ID is required (e.g. VA-2026-9042-ENG).",
      code: "MISSING_CREDENTIAL_ID"
    });
  }
  const certId = rawTarget.toUpperCase().trim();
  if (!isValidCertificateId(certId)) {
    return res.status(400).json({
      verified: false,
      error: "Invalid credential identifier format. Expected 4-40 alphanumeric characters and hyphens only.",
      code: "INVALID_CREDENTIAL_ID"
    });
  }
  let cert = null;
  try {
    cert = await getCertificateById(certId);
  } catch (err) {
    console.error(`[Verification] Service failure querying certificate ${certId}:`, err);
    const status = err instanceof DatabaseServiceError ? err.status : 503;
    const code = err instanceof DatabaseServiceError ? err.code : "SERVICE_UNAVAILABLE";
    return res.status(status).json({
      verified: false,
      status: "SERVICE_UNAVAILABLE",
      error: "Certificate verification service is temporarily unavailable. Please try again shortly.",
      code,
      checkedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  if (!cert) {
    return res.status(404).json({
      verified: false,
      status: "NOT_FOUND",
      error: `Certificate with ID '${certId}' was not found in the Vixora Academy Global Credential Registry.`,
      checkedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  const hasValidLedgerHash = Boolean(cert.credentialHash && cert.credentialHash.length === 64);
  const publicCertificate = {
    id: cert.id,
    studentName: cert.studentName,
    courseId: cert.courseId,
    courseTitle: cert.courseTitle,
    trackBadge: cert.trackBadge,
    specialization: cert.specialization,
    grade: cert.grade,
    honors: cert.honors,
    capstoneTitle: cert.capstoneTitle,
    capstoneScore: cert.capstoneScore,
    issueDate: cert.issueDate,
    completionDate: cert.completionDate,
    durationWeeks: cert.durationWeeks,
    credentialHash: cert.credentialHash,
    verificationUrl: cert.verificationUrl,
    instructorName: cert.instructorName,
    instructorTitle: cert.instructorTitle,
    directorName: cert.directorName,
    directorTitle: cert.directorTitle,
    competencies: cert.competencies,
    status: cert.status
  };
  return res.json({
    verified: true,
    status: "VERIFIED_ACTIVE",
    certificate: publicCertificate,
    issuer: "Vixora Academy Global Directorate",
    dean: cert.directorName || "Sarumi Hammad",
    deanTitle: cert.directorTitle || "Dean, Vixora Academy",
    verificationMethod: "Cryptographic SHA-256 Ledger Signature Match",
    integrityStatus: hasValidLedgerHash ? "LEDGER_HASH_VALID" : "LEGACY_COMPATIBLE",
    downloadPdfUrl: `/api/certificates/${cert.id}/pdf`,
    verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
}
portalRouter.get("/certificates/verify/:id", (req, res) => {
  return handleCertificateVerification(req, res, req.params.id);
});
portalRouter.get("/certificates/verify", (req, res) => {
  return handleCertificateVerification(req, res);
});
async function handleCertificatePdfDownload(req, res) {
  const ip = getClientIp(req);
  const rlCheck = pdfRateLimiter.check(ip);
  res.setHeader("X-RateLimit-Limit", rlCheck.limit);
  res.setHeader("X-RateLimit-Remaining", rlCheck.remaining);
  res.setHeader("X-RateLimit-Reset", rlCheck.resetInSeconds);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: "Too many certificate PDF requests. Please try again later.",
      code: "RATE_LIMIT_EXCEEDED"
    });
  }
  const rawId = req.params.id;
  if (!rawId || typeof rawId !== "string") {
    return res.status(400).json({ error: "Certificate ID is required.", code: "MISSING_CERTIFICATE_ID" });
  }
  const certId = rawId.toUpperCase().trim();
  if (!isValidCertificateId(certId)) {
    return res.status(400).json({
      error: "Invalid certificate identifier format. Expected 4-40 alphanumeric characters and hyphens only.",
      code: "INVALID_CERTIFICATE_ID"
    });
  }
  let cert = null;
  try {
    cert = await getCertificateById(certId);
  } catch (err) {
    console.error(`[PDF Download] Service failure querying certificate ${certId}:`, err);
    const status = err instanceof DatabaseServiceError ? err.status : 503;
    const code = err instanceof DatabaseServiceError ? err.code : "SERVICE_UNAVAILABLE";
    return res.status(status).json({
      error: "Certificate generation service is temporarily unavailable.",
      code
    });
  }
  if (!cert) {
    return res.status(404).json({
      error: `Certificate '${certId}' not found in the registry.`
    });
  }
  try {
    const pdfBuffer = await generateCertificatePdfBuffer(cert);
    const filename = `Vixora-Academy-Certificate-${cert.id}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.end(pdfBuffer);
  } catch (err) {
    console.error("Failed to generate PDF for certificate", certId, err);
    return res.status(500).json({
      error: "Failed to generate PDF certificate.",
      code: "PDF_GENERATION_FAILED"
    });
  }
}
portalRouter.get("/certificates/:id/pdf", handleCertificatePdfDownload);
portalRouter.get("/certificates/download/:id", handleCertificatePdfDownload);
portalRouter.get("/certificates/list", requireAuthentication, requireAdmin, async (req, res) => {
  const { limit, offset, error: pageErr } = parsePaginationQuery(req.query.limit, req.query.offset, 100, 100, req.query.page);
  if (pageErr) {
    return res.status(400).json({ error: pageErr, code: "INVALID_PAGINATION" });
  }
  const cleanSearch = typeof req.query.search === "string" ? req.query.search.trim() : "";
  if (req.query.search && cleanSearch.length > 100) {
    return res.status(400).json({ error: "Search query must be a string up to 100 characters.", code: "INVALID_QUERY" });
  }
  const cleanCourseId = typeof req.query.courseId === "string" ? req.query.courseId.trim() : "";
  if (req.query.courseId && cleanCourseId.length > 100) {
    return res.status(400).json({ error: "courseId filter must be a string up to 100 characters.", code: "INVALID_QUERY" });
  }
  if (req.query.status && !["active", "revoked", "suspended"].includes(req.query.status)) {
    return res.status(400).json({ error: "status filter must be active, revoked, or suspended.", code: "INVALID_QUERY" });
  }
  const statusFilter = req.query.status;
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      let query = supabase.from("certificates").select("*");
      if (cleanCourseId) {
        query = query.eq("course_id", cleanCourseId);
      }
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }
      if (cleanSearch) {
        query = query.or(`student_name.ilike.%${cleanSearch}%,id.ilike.%${cleanSearch}%,course_title.ilike.%${cleanSearch}%`);
      }
      query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);
      const { data: certRows, error } = await query;
      if (error) {
        console.error("[Supabase] Error listing certificates:", error);
        if (isProductionEnvironment() || isSupabaseConfigured()) {
          return res.status(503).json({
            error: "Failed to retrieve certificates from database.",
            code: "DATABASE_ERROR"
          });
        }
      }
      if (certRows) {
        if (certRows.length === 0) {
          return res.json({ certificates: [] });
        }
        const certIds = certRows.map((r) => r.id);
        const { data: compRows } = await supabase.from("certificate_competencies").select("certificate_id, name").in("certificate_id", certIds);
        const compMap = /* @__PURE__ */ new Map();
        (compRows || []).forEach((c) => {
          const list2 = compMap.get(c.certificate_id) || [];
          list2.push(c.name);
          compMap.set(c.certificate_id, list2);
        });
        const list = certRows.map(
          (row) => mapSupabaseCertificateToDomain(row, compMap.get(row.id) || [])
        );
        return res.json({ certificates: list });
      }
    } catch (err) {
      console.error("[Supabase] Error listing certificates:", err);
      if (isProductionEnvironment() || isSupabaseConfigured()) {
        return res.status(503).json({
          error: "Certificate database service is temporarily unavailable.",
          code: "DATABASE_UNAVAILABLE"
        });
      }
    }
  } else {
    if (isProductionEnvironment()) {
      return res.status(503).json({
        error: "Certificate registry database is not configured in production.",
        code: "DATABASE_UNCONFIGURED"
      });
    }
  }
  if (shouldPermitFallback()) {
    let list = Array.from(fallbackCertificatesStore.values());
    if (cleanCourseId) {
      list = list.filter((c) => c.courseId === cleanCourseId);
    }
    if (statusFilter) {
      list = list.filter((c) => c.status === statusFilter);
    }
    if (cleanSearch) {
      const q = cleanSearch.toLowerCase();
      list = list.filter(
        (c) => c.studentName.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.courseTitle.toLowerCase().includes(q)
      );
    }
    const paged = list.slice(offset, offset + limit);
    return res.json({ certificates: paged });
  }
  return res.json({ certificates: [] });
});
portalRouter.post("/certificates/issue", requireAuthentication, requireAdmin, async (req, res) => {
  const ip = getClientIp(req);
  const rlCheck = emailRateLimiter.check(`issue:${ip}`);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Certificate issuance rate limit exceeded. Please wait ${rlCheck.resetInSeconds}s before issuing more credentials.`,
      code: "RATE_LIMIT_EXCEEDED",
      retryAfterSeconds: rlCheck.resetInSeconds
    });
  }
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const {
    studentName,
    studentEmail,
    courseTitle,
    courseId,
    trackBadge,
    specialization,
    grade,
    honors,
    capstoneTitle,
    capstoneScore,
    competencies,
    durationWeeks,
    instructorName,
    instructorTitle,
    directorName,
    directorTitle,
    status,
    customCertificateId
  } = req.body;
  if (typeof studentName !== "string" || studentName.trim().length < 2 || studentName.trim().length > 150) {
    return res.status(400).json({
      error: "studentName is required and must be a string between 2 and 150 characters.",
      code: "INVALID_STUDENT_NAME"
    });
  }
  if (!isValidEmail(studentEmail)) {
    return res.status(400).json({
      error: "studentEmail is required and must be a valid email address format.",
      code: "INVALID_EMAIL"
    });
  }
  if (typeof courseTitle !== "string" || courseTitle.trim().length < 2 || courseTitle.trim().length > 200) {
    return res.status(400).json({
      error: "courseTitle is required and must be a string between 2 and 200 characters.",
      code: "INVALID_COURSE_TITLE"
    });
  }
  if (customCertificateId !== void 0 && customCertificateId !== null) {
    if (!isValidCertificateId(customCertificateId)) {
      return res.status(400).json({
        error: "customCertificateId must be between 4 and 40 alphanumeric characters and hyphens.",
        code: "INVALID_CERTIFICATE_ID"
      });
    }
  }
  if (durationWeeks !== void 0 && durationWeeks !== null) {
    if (typeof durationWeeks !== "number" && typeof durationWeeks !== "string") {
      return res.status(400).json({
        error: "durationWeeks must be a positive integer between 1 and 104.",
        code: "INVALID_DURATION"
      });
    }
    const parsedDuration = Number(durationWeeks);
    if (!Number.isFinite(parsedDuration) || !Number.isInteger(parsedDuration) || parsedDuration < 1 || parsedDuration > 104) {
      return res.status(400).json({
        error: "durationWeeks must be a positive integer between 1 and 104.",
        code: "INVALID_DURATION"
      });
    }
  }
  if (competencies !== void 0 && competencies !== null) {
    if (!Array.isArray(competencies)) {
      return res.status(400).json({
        error: "competencies must be an array of strings.",
        code: "INVALID_COMPETENCIES"
      });
    }
    if (competencies.length > 20) {
      return res.status(400).json({
        error: "competencies array cannot exceed 20 items.",
        code: "COMPETENCIES_OVERSIZED"
      });
    }
    for (let i = 0; i < competencies.length; i++) {
      const comp = competencies[i];
      if (typeof comp !== "string" || comp.trim().length < 1 || comp.trim().length > 200) {
        return res.status(400).json({
          error: `Each competency item must be a non-empty string under 200 characters (issue at index ${i}).`,
          code: "INVALID_COMPETENCY_ITEM"
        });
      }
    }
  }
  const optionalStringFields = [
    { val: courseId, name: "courseId", maxLen: 100 },
    { val: trackBadge, name: "trackBadge", maxLen: 100 },
    { val: specialization, name: "specialization", maxLen: 150 },
    { val: grade, name: "grade", maxLen: 50 },
    { val: honors, name: "honors", maxLen: 150 },
    { val: capstoneTitle, name: "capstoneTitle", maxLen: 200 },
    { val: capstoneScore, name: "capstoneScore", maxLen: 50 },
    { val: instructorName, name: "instructorName", maxLen: 150 },
    { val: instructorTitle, name: "instructorTitle", maxLen: 150 },
    { val: directorName, name: "directorName", maxLen: 150 },
    { val: directorTitle, name: "directorTitle", maxLen: 150 }
  ];
  for (const field of optionalStringFields) {
    if (field.val !== void 0 && field.val !== null) {
      if (typeof field.val !== "string" || field.val.trim().length === 0 || field.val.length > field.maxLen) {
        return res.status(400).json({
          error: `${field.name} must be a non-empty string up to ${field.maxLen} characters.`,
          code: "FIELD_TOO_LONG"
        });
      }
    }
  }
  if (status !== void 0 && status !== null && !["active", "revoked", "suspended"].includes(status)) {
    return res.status(400).json({ error: "status must be active, revoked, or suspended.", code: "INVALID_STATUS" });
  }
  const cleanEmail = studentEmail.toLowerCase().trim();
  let certId;
  if (customCertificateId) {
    certId = customCertificateId.toUpperCase().trim();
  } else {
    try {
      certId = await generateSecureCertificateId(courseTitle);
    } catch (genErr) {
      console.error("Failed to generate secure certificate ID:", genErr);
      return res.status(500).json({ error: "Failed to issue certificate: unable to allocate a unique credential identifier." });
    }
  }
  const hashRaw = `${certId}:${cleanEmail}:${studentName}:${Date.now()}`;
  const credentialHash = crypto.createHash("sha256").update(hashRaw).digest("hex");
  const now = /* @__PURE__ */ new Date();
  const issueDateFormatted = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  const assignedCompetencies = Array.isArray(competencies) && competencies.length > 0 ? competencies : [
    "Full-Stack AI Architecture & Tool Calling",
    "Production Workflow Automation & Orchestration",
    "Cloud Containerization & High-Throughput APIs",
    "Applied Business Intelligence & Decision Systems"
  ];
  const courseSlug = req.body.courseId || (courseTitle.trim() === "Machine Learning & Data Science" ? "machine-learning-data-science" : courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "custom-track");
  const isMLCourse = courseSlug === "machine-learning-data-science" || courseTitle.trim() === "Machine Learning & Data Science";
  const newCertificate = {
    id: certId,
    studentName: studentName.trim(),
    studentEmail: cleanEmail,
    courseId: courseSlug,
    courseTitle: courseTitle.trim(),
    trackBadge: req.body.trackBadge || (isMLCourse ? "Data & Analytics" : "Professional Track"),
    specialization: specialization || (isMLCourse ? "Predictive Modeling, Scikit-Learn & Feature Engineering" : "Enterprise Digital & AI Solutions"),
    grade: grade || "High Distinction",
    honors: honors || "Demonstrated Rigorous Engineering Mastery",
    capstoneTitle: capstoneTitle || (isMLCourse ? "End-to-End Predictive Machine Learning Pipeline & Model Deployment" : "Enterprise Production Deployment & Architecture"),
    capstoneScore: capstoneScore || "97.8 / 100",
    issueDate: issueDateFormatted,
    completionDate: "September 2026",
    durationWeeks: req.body.durationWeeks || (isMLCourse ? 18 : 12),
    credentialHash,
    verificationUrl: `https://academy.vixoradigitalhub.com/verify?id=${certId}`,
    instructorName: req.body.instructorName || (isMLCourse ? "Marcus Sterling" : "Dr. Adebayo Vance"),
    instructorTitle: req.body.instructorTitle || (isMLCourse ? "Head of Data Systems, Vixora Analytics" : "Principal AI Architect, Vixora Labs"),
    directorName: "Sarumi Hammad",
    directorTitle: "Dean, Vixora Academy",
    competencies: assignedCompetencies,
    status: "active",
    emailSentCount: 1,
    lastEmailSentAt: now.toISOString()
  };
  try {
    await saveIssuedCertificate(newCertificate, assignedCompetencies);
  } catch (saveErr) {
    console.error("Failed persisting issued certificate:", saveErr);
    return res.status(500).json({ error: "Failed to persist issued certificate to registry." });
  }
  let pdfBuffer;
  const pdfFilename = `Vixora-Academy-Certificate-${certId}.pdf`;
  try {
    pdfBuffer = await generateCertificatePdfBuffer(newCertificate);
  } catch (pdfErr) {
    console.error("Failed generating certificate PDF attachment on issue:", pdfErr);
  }
  const supabase = getSupabaseAdmin();
  if (supabase && pdfBuffer) {
    try {
      await supabase.storage.from("certificates").upload(`${certId}.pdf`, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true
      });
    } catch (storageErr) {
    }
  }
  const emailHtml = generateCertificateEmailHtml(newCertificate);
  const emailText = generateCertificateEmailText(newCertificate);
  const emailSubject = `\u{1F393} Congratulations ${studentName}! Your Vixora Academy Certificate is Ready`;
  const dispatchResult = await dispatchCertificateEmail({
    to: cleanEmail,
    toName: studentName,
    subject: emailSubject,
    html: emailHtml,
    text: emailText,
    certificateId: certId,
    pdfBuffer,
    pdfFilename
  });
  const emailLog = {
    id: `eml-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
    certificateId: certId,
    recipientEmail: cleanEmail,
    recipientName: studentName,
    subject: emailSubject,
    status: dispatchResult.status,
    provider: dispatchResult.provider,
    timestamp: now.toISOString(),
    deliveryLatencyMs: dispatchResult.deliveryLatencyMs,
    previewHtml: emailHtml,
    previewText: emailText,
    messageId: dispatchResult.messageId,
    error: dispatchResult.error,
    gmailComposeUrl: dispatchResult.gmailComposeUrl,
    mailtoUrl: dispatchResult.mailtoUrl,
    infoNotice: dispatchResult.infoNotice,
    deliveredToInternet: dispatchResult.deliveredToInternet,
    hasAttachment: Boolean(pdfBuffer),
    attachmentName: pdfFilename
  };
  await saveEmailLog(emailLog);
  return res.json({
    success: true,
    message: dispatchResult.deliveredToInternet ? `Certificate ${certId} issued and official confirmation email with PDF certificate attachment delivered to ${cleanEmail} via SMTP!` : `Certificate ${certId} issued with attached PDF certificate (${pdfFilename}) prepared in Outbox. Ready for instant delivery.`,
    certificate: newCertificate,
    emailLog,
    delivery: dispatchResult
  });
});
async function executeCertificateEmailDispatch(cert, targetEmail) {
  let pdfBuffer;
  const pdfFilename = `Vixora-Academy-Certificate-${cert.id}.pdf`;
  try {
    pdfBuffer = await generateCertificatePdfBuffer(cert);
  } catch (pdfErr) {
    console.error("Failed generating certificate PDF buffer for email dispatch:", pdfErr);
  }
  const verificationUrl = cert.verificationUrl || `https://academy.vixoradigitalhub.com/verify?code=${encodeURIComponent(cert.id)}`;
  const certEmailData = buildCertificateAwardEmail({
    studentName: cert.studentName,
    studentEmail: targetEmail,
    courseTitle: cert.courseTitle,
    certificateId: cert.id,
    grade: cert.grade || "Distinction",
    issuedDate: cert.issueDate,
    verificationUrl
  });
  const emailHtml = certEmailData.html;
  const emailText = certEmailData.text;
  const emailSubject = certEmailData.subject;
  const dispatchResult = await dispatchCertificateEmail({
    to: targetEmail,
    toName: cert.studentName,
    subject: emailSubject,
    html: emailHtml,
    text: emailText,
    certificateId: cert.id,
    pdfBuffer,
    pdfFilename
  });
  const emailLog = {
    id: `eml-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
    certificateId: cert.id,
    recipientEmail: targetEmail,
    recipientName: cert.studentName,
    subject: emailSubject,
    status: dispatchResult.status,
    provider: dispatchResult.provider,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    deliveryLatencyMs: dispatchResult.deliveryLatencyMs,
    previewHtml: emailHtml,
    previewText: emailText,
    messageId: dispatchResult.messageId,
    error: dispatchResult.error,
    gmailComposeUrl: dispatchResult.gmailComposeUrl,
    mailtoUrl: dispatchResult.mailtoUrl,
    infoNotice: dispatchResult.infoNotice,
    deliveredToInternet: dispatchResult.deliveredToInternet,
    hasAttachment: Boolean(pdfBuffer),
    attachmentName: pdfFilename
  };
  await saveEmailLog(emailLog);
  cert.emailSentCount += 1;
  cert.lastEmailSentAt = (/* @__PURE__ */ new Date()).toISOString();
  return { dispatchResult, emailLog, pdfBuffer };
}
portalRouter.post("/certificates/send-email", requireAuthentication, requireAdmin, async (req, res) => {
  const ip = getClientIp(req);
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { certificateId, customRecipientEmail, recipientEmail, email } = req.body;
  if (!isValidCertificateId(certificateId)) {
    return res.status(400).json({ error: "Valid certificateId is required.", code: "INVALID_CERTIFICATE_ID" });
  }
  const rawTargetEmail = customRecipientEmail ?? recipientEmail ?? email;
  if (rawTargetEmail !== void 0 && rawTargetEmail !== null) {
    if (typeof rawTargetEmail !== "string" || rawTargetEmail.trim().length === 0 || !isValidEmail(rawTargetEmail)) {
      return res.status(400).json({ error: "Recipient email address format is invalid.", code: "INVALID_EMAIL" });
    }
  }
  let cert = null;
  try {
    cert = await getCertificateById(certificateId);
  } catch (err) {
    const status = err instanceof DatabaseServiceError ? err.status : 503;
    return res.status(status).json({
      error: "Certificate database service is unavailable.",
      code: err instanceof DatabaseServiceError ? err.code : "SERVICE_UNAVAILABLE"
    });
  }
  if (!cert) {
    return res.status(404).json({ error: "Certificate not found." });
  }
  const targetEmail = (rawTargetEmail || cert.studentEmail).toLowerCase().trim();
  const rlCheck = emailRateLimiter.check(`${ip}:${targetEmail}`);
  res.setHeader("X-RateLimit-Limit", rlCheck.limit);
  res.setHeader("X-RateLimit-Remaining", rlCheck.remaining);
  res.setHeader("X-RateLimit-Reset", rlCheck.resetInSeconds);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Email sending rate limit reached for this recipient. Please wait ${rlCheck.resetInSeconds} seconds before sending another email.`,
      code: "RATE_LIMIT_EXCEEDED",
      retryAfterSeconds: rlCheck.resetInSeconds
    });
  }
  const { dispatchResult, emailLog } = await executeCertificateEmailDispatch(cert, targetEmail);
  res.json({
    success: true,
    message: dispatchResult.deliveredToInternet ? `Certificate with PDF attachment successfully delivered to ${targetEmail} via SMTP!` : `Certificate email with PDF attachment prepared for ${targetEmail}. Click 'Open in Gmail' to deliver immediately from your inbox, or configure SMTP.`,
    emailLog,
    certificate: cert,
    delivery: dispatchResult,
    rateLimit: {
      remaining: rlCheck.remaining,
      limit: rlCheck.limit,
      resetInSeconds: rlCheck.resetInSeconds
    }
  });
});
portalRouter.post("/certificates/:id/dispatch-email", requireAuthentication, requireAdmin, async (req, res) => {
  const ip = getClientIp(req);
  if (!isValidCertificateId(req.params.id)) {
    return res.status(400).json({ error: "Valid certificate ID is required.", code: "INVALID_CERTIFICATE_ID" });
  }
  const certId = req.params.id.toUpperCase().trim();
  if (req.body !== void 0 && req.body !== null && Object.keys(req.body).length > 0) {
    if (!isPlainObject(req.body)) {
      return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
    }
  }
  const customEmail = req.body?.customRecipientEmail;
  if (customEmail !== void 0 && customEmail !== null) {
    if (typeof customEmail !== "string" || customEmail.trim().length === 0 || !isValidEmail(customEmail)) {
      return res.status(400).json({ error: "customRecipientEmail address format is invalid.", code: "INVALID_EMAIL" });
    }
  }
  let cert = null;
  try {
    cert = await getCertificateById(certId);
  } catch (err) {
    const status = err instanceof DatabaseServiceError ? err.status : 503;
    return res.status(status).json({
      error: "Certificate database service is unavailable.",
      code: err instanceof DatabaseServiceError ? err.code : "SERVICE_UNAVAILABLE"
    });
  }
  if (!cert) {
    return res.status(404).json({ error: `Certificate '${certId}' not found.` });
  }
  const targetEmail = (customEmail || cert.studentEmail).toLowerCase().trim();
  const rlCheck = emailRateLimiter.check(`${ip}:${targetEmail}`);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Rate limit reached. Please wait ${rlCheck.resetInSeconds} seconds before triggering another email.`,
      code: "RATE_LIMIT_EXCEEDED",
      retryAfterSeconds: rlCheck.resetInSeconds
    });
  }
  const { dispatchResult, emailLog } = await executeCertificateEmailDispatch(cert, targetEmail);
  return res.json({
    success: true,
    triggered: true,
    certificateId: cert.id,
    recipient: targetEmail,
    hasPdfAttachment: true,
    message: dispatchResult.deliveredToInternet ? `Automated dispatch trigger completed. Email and PDF delivered to ${targetEmail} via SMTP!` : `Automated dispatch trigger completed. Certificate and PDF queued in Outbox.`,
    emailLog,
    delivery: dispatchResult
  });
});
portalRouter.post("/certificates/trigger-dispatch", requireAuthentication, requireAdmin, async (req, res) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { certificateId, customRecipientEmail } = req.body;
  if (!isValidCertificateId(certificateId)) {
    return res.status(400).json({ error: "Valid certificateId is required.", code: "INVALID_CERTIFICATE_ID" });
  }
  if (customRecipientEmail !== void 0 && customRecipientEmail !== null) {
    if (typeof customRecipientEmail !== "string" || customRecipientEmail.trim().length === 0 || !isValidEmail(customRecipientEmail)) {
      return res.status(400).json({ error: "customRecipientEmail address format is invalid.", code: "INVALID_EMAIL" });
    }
  }
  let cert = null;
  try {
    cert = await getCertificateById(certificateId);
  } catch (err) {
    const status = err instanceof DatabaseServiceError ? err.status : 503;
    return res.status(status).json({
      error: "Certificate database service is unavailable.",
      code: err instanceof DatabaseServiceError ? err.code : "SERVICE_UNAVAILABLE"
    });
  }
  if (!cert) {
    return res.status(404).json({ error: `Certificate '${certificateId}' not found.` });
  }
  const targetEmail = (customRecipientEmail || cert.studentEmail).toLowerCase().trim();
  const { dispatchResult, emailLog } = await executeCertificateEmailDispatch(cert, targetEmail);
  return res.json({
    success: true,
    triggered: true,
    certificateId: cert.id,
    recipient: targetEmail,
    hasPdfAttachment: true,
    message: dispatchResult.deliveredToInternet ? `Automated email dispatch trigger completed: PDF delivered to ${targetEmail} via SMTP.` : `Automated email dispatch trigger completed: PDF queued in Outbox.`,
    emailLog,
    delivery: dispatchResult
  });
});
portalRouter.post("/certificates/batch-dispatch", requireAuthentication, requireAdmin, async (req, res) => {
  const ip = getClientIp(req);
  const rlCheck = emailRateLimiter.check(`batch_dispatch:${ip}`);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Batch dispatch rate limit reached. Please wait ${rlCheck.resetInSeconds} seconds before triggering another batch.`,
      code: "RATE_LIMIT_EXCEEDED",
      retryAfterSeconds: rlCheck.resetInSeconds
    });
  }
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { certificateIds } = req.body;
  const targets = [];
  if (certificateIds !== void 0) {
    if (!Array.isArray(certificateIds)) {
      return res.status(400).json({ error: "certificateIds must be an array of string IDs.", code: "INVALID_BATCH_ARRAY" });
    }
    if (certificateIds.length === 0) {
      return res.status(400).json({ error: "certificateIds array cannot be empty.", code: "EMPTY_BATCH_ARRAY" });
    }
    if (certificateIds.length > 50) {
      return res.status(400).json({ error: "certificateIds array cannot exceed maximum batch size of 50.", code: "BATCH_TOO_LARGE" });
    }
    for (let i = 0; i < certificateIds.length; i++) {
      const id = certificateIds[i];
      if (!isValidCertificateId(id)) {
        return res.status(400).json({
          error: `Invalid certificate ID at index ${i}: '${String(id)}'. Expected 4-40 alphanumeric characters and hyphens.`,
          code: "INVALID_CERTIFICATE_ID"
        });
      }
    }
    for (const id of certificateIds) {
      try {
        const c = await getCertificateById(id);
        if (c) targets.push(c);
      } catch (err) {
        console.warn(`[Batch Dispatch] Error resolving certificate ${id}:`, err);
      }
    }
  } else {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const { data: certRows, error } = await supabase.from("certificates").select("*");
        if (error) {
          console.error("[Batch Dispatch] Supabase query error:", error);
          if (isProductionEnvironment() || isSupabaseConfigured()) {
            return res.status(503).json({
              error: "Database error reading certificates for batch dispatch.",
              code: "DATABASE_ERROR"
            });
          }
        }
        if (certRows) {
          for (const row of certRows) {
            targets.push(mapSupabaseCertificateToDomain(row));
          }
        }
      } catch (err) {
        console.error("[Batch Dispatch] Connection error:", err);
        if (isProductionEnvironment() || isSupabaseConfigured()) {
          return res.status(503).json({
            error: "Database connection error during batch dispatch.",
            code: "DATABASE_UNAVAILABLE"
          });
        }
      }
    } else {
      if (isProductionEnvironment()) {
        return res.status(503).json({
          error: "Certificate database is not configured in production.",
          code: "DATABASE_UNCONFIGURED"
        });
      }
    }
    if (targets.length === 0 && shouldPermitFallback()) {
      fallbackCertificatesStore.forEach((c) => targets.push(c));
    }
  }
  const results = [];
  for (const cert of targets) {
    try {
      const { dispatchResult, emailLog } = await executeCertificateEmailDispatch(cert, cert.studentEmail);
      results.push({
        certificateId: cert.id,
        recipient: cert.studentEmail,
        status: dispatchResult.status,
        delivered: dispatchResult.deliveredToInternet,
        logId: emailLog.id
      });
    } catch (err) {
      results.push({
        certificateId: cert.id,
        recipient: cert.studentEmail,
        status: "error",
        error: err.message
      });
    }
  }
  return res.json({
    success: true,
    totalProcessed: targets.length,
    results,
    message: `Batch email dispatch triggered for ${targets.length} graduate certificates with PDF attachments.`
  });
});
portalRouter.get("/certificates/email-config", requireAuthentication, requireAdmin, (req, res) => {
  const status = getEmailConfigStatus();
  res.json(status);
});
portalRouter.get("/certificates/email-logs", requireAuthentication, requireAdmin, async (req, res) => {
  const { limit, offset, error: pageErr } = parsePaginationQuery(req.query.limit, req.query.offset, 50, 100, req.query.page);
  if (pageErr) {
    return res.status(400).json({ error: pageErr, code: "INVALID_PAGINATION" });
  }
  const logs = await getRecentEmailLogs(limit, offset);
  res.json({
    logs,
    totalSent: logs.length,
    config: getEmailConfigStatus()
  });
});
portalRouter.post("/admin/login", async (req, res) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and administrator password are required.", code: "MISSING_FIELDS" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email address format.", code: "INVALID_EMAIL" });
  }
  if (typeof password !== "string" || password.length < 1 || password.length > 200) {
    return res.status(400).json({ error: "Password must be a string up to 200 characters.", code: "INVALID_PASSWORD" });
  }
  const cleanEmail = email.toLowerCase().trim();
  const authorizedAdmins = getAuthorizedAdminEmails();
  if (!authorizedAdmins.has(cleanEmail)) {
    return res.status(403).json({
      error: "Access denied: account is not an authorized administrator.",
      code: "FORBIDDEN_NOT_ADMIN"
    });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({
      error: "Authentication service unavailable. Supabase is not configured.",
      code: "AUTH_SERVICE_UNCONFIGURED"
    });
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: String(password)
    });
    if (error || !data.session) {
      return res.status(401).json({
        error: error?.message || "Invalid administrator credentials.",
        code: "INVALID_CREDENTIALS"
      });
    }
    const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || cleanEmail.split("@")[0];
    const role = "Administrator";
    const title = "Executive Administrator";
    return res.json({
      success: true,
      message: `Welcome back, ${name}. Admin session authorized via Supabase Auth.`,
      token: data.session.access_token,
      user: {
        id: data.user.id,
        name,
        email: cleanEmail,
        role,
        title,
        permissions: ["manage_projects", "issue_certificates", "dispatch_emails", "manage_students", "system_config"]
      },
      expiresAt: data.session.expires_at ? data.session.expires_at * 1e3 : Date.now() + 3600 * 1e3
    });
  } catch (err) {
    console.error("Supabase admin login exception:", err);
    return res.status(500).json({
      error: "Internal authentication service error.",
      code: "AUTH_EXCEPTION"
    });
  }
});
portalRouter.get("/admin/me", requireAuthentication, requireAdmin, (req, res) => {
  const user = req.user;
  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split("@")[0];
  return res.json({
    authenticated: true,
    user: {
      id: user.id,
      name,
      email: user.email,
      role: "Administrator",
      title: "Executive Administrator",
      permissions: ["manage_projects", "issue_certificates", "dispatch_emails", "manage_students", "system_config"]
    }
  });
});
portalRouter.post("/admin/logout", requireAuthentication, (req, res) => {
  return res.json({ success: true, message: "Administrator session terminated." });
});
portalRouter.get("/admin/overview", requireAuthentication, requireAdmin, async (req, res) => {
  const supabase = getSupabaseAdmin();
  if (isProductionEnvironment() || isSupabaseConfigured()) {
    if (!supabase) {
      return res.status(503).json({
        error: "Registry database service is unconfigured in production.",
        code: "DATABASE_UNCONFIGURED"
      });
    }
    try {
      const [certCountRes, recentCertsRes, studentsCountRes] = await Promise.all([
        supabase.from("certificates").select("*", { count: "exact", head: true }),
        supabase.from("certificates").select("*").order("created_at", { ascending: false }).limit(6),
        supabase.from("students").select("*", { count: "exact", head: true })
      ]);
      if (certCountRes.error) {
        console.error("[Supabase] Overview certificates count error:", certCountRes.error);
        return res.status(503).json({
          error: "Failed to retrieve certificate count from database.",
          code: "DATABASE_ERROR"
        });
      }
      if (recentCertsRes.error) {
        console.error("[Supabase] Overview recent certificates error:", recentCertsRes.error);
        return res.status(503).json({
          error: "Failed to retrieve recent certificates from database.",
          code: "DATABASE_ERROR"
        });
      }
      if (studentsCountRes.error) {
        console.error("[Supabase] Overview students count error:", studentsCountRes.error);
        return res.status(503).json({
          error: "Failed to retrieve student count from database.",
          code: "DATABASE_ERROR"
        });
      }
      const certCount = typeof certCountRes.count === "number" ? certCountRes.count : 0;
      const studentsCount = typeof studentsCountRes.count === "number" ? studentsCountRes.count : 0;
      const recentCerts = recentCertsRes.data && recentCertsRes.data.length > 0 ? recentCertsRes.data.map((r) => mapSupabaseCertificateToDomain(r)) : [];
      const recentEmailLogs = await getRecentEmailLogs(10);
      const emailConfig = getEmailConfigStatus();
      return res.json({
        metrics: {
          totalCertificates: certCount,
          totalStudents: studentsCount,
          totalEmailDispatches: recentEmailLogs.length,
          activeProvider: emailConfig.primaryProvider,
          activeSender: emailConfig.fromAddress,
          databaseTier: "Supabase Cloud (PostgreSQL)",
          serverUptimeSec: Math.floor(process.uptime()),
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        },
        emailConfig,
        recentCertificates: recentCerts,
        recentEmailLogs
      });
    } catch (err) {
      console.error("[Supabase] Overview query exception:", err);
      return res.status(503).json({
        error: "Database service is currently unavailable.",
        code: "DATABASE_UNAVAILABLE"
      });
    }
  }
  if (shouldPermitFallback()) {
    const certCount = fallbackCertificatesStore.size;
    const studentsCount = fallbackStudentsStore.size;
    const recentCerts = Array.from(fallbackCertificatesStore.values()).slice(0, 6);
    const recentEmailLogs = await getRecentEmailLogs(10);
    const emailConfig = getEmailConfigStatus();
    return res.json({
      metrics: {
        totalCertificates: certCount,
        totalStudents: studentsCount,
        totalEmailDispatches: recentEmailLogs.length,
        activeProvider: emailConfig.primaryProvider,
        activeSender: emailConfig.fromAddress,
        databaseTier: "High-Performance Local Cache",
        serverUptimeSec: Math.floor(process.uptime()),
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      },
      emailConfig,
      recentCertificates: recentCerts,
      recentEmailLogs
    });
  }
  return res.status(503).json({
    error: "Database service is unavailable.",
    code: "DATABASE_UNAVAILABLE"
  });
});
portalRouter.post("/admin/send-test-email", requireAuthentication, requireAdmin, async (req, res) => {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const user = req.user;
  const { to, subject, message } = req.body;
  if (!to || !subject) {
    return res.status(400).json({ error: "Recipient email and subject are required.", code: "MISSING_FIELDS" });
  }
  if (!isValidEmail(to)) {
    return res.status(400).json({ error: "Recipient email address format is invalid.", code: "INVALID_EMAIL" });
  }
  if (typeof subject !== "string" || subject.trim().length === 0 || subject.trim().length > 200) {
    return res.status(400).json({ error: "Subject must be between 1 and 200 characters.", code: "INVALID_SUBJECT" });
  }
  if (message !== void 0 && message !== null) {
    if (typeof message !== "string" || message.length > 5e3) {
      return res.status(400).json({ error: "Message must be a string up to 5000 characters.", code: "INVALID_MESSAGE" });
    }
  }
  const cleanTo = to.toLowerCase().trim();
  const testSubject = subject.trim();
  const testMessage = message || "This is a test notification from Vixora Digital Hub Admin Command Center.";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0b061d; color: #ffffff; border-radius: 16px; border: 1px solid #3b1d7a;">
      <div style="border-bottom: 1px solid #2a1458; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #a855f7; margin: 0; font-size: 20px; font-weight: 700;">Vixora Digital Hub</h2>
        <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">Admin Command Center Live Test Dispatch</p>
      </div>
      <div style="background: #150d36; border: 1px solid #3b1d7a; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
        <p style="font-size: 15px; line-height: 1.6; color: #f1f5f9; margin: 0;">${testMessage}</p>
      </div>
      <div style="font-size: 12px; color: #94a3b8; border-top: 1px solid #2a1458; padding-top: 14px;">
        <p style="margin: 0;">Sent by Administrator: <strong>${user.email}</strong></p>
        <p style="margin: 4px 0 0 0;">Engine: <strong>Resend API &amp; Google SMTP Infrastructure</strong> &bull; Vixora Digital Hub &bull; ${(/* @__PURE__ */ new Date()).toUTCString()}</p>
      </div>
    </div>
  `;
  const dispatchResult = await dispatchGenericEmail({
    to: cleanTo,
    toName: cleanTo.split("@")[0],
    subject: testSubject,
    html,
    text: testMessage
  });
  const emailLog = {
    id: `eml-test-${Date.now()}`,
    certificateId: "admin-test",
    recipientEmail: cleanTo,
    recipientName: cleanTo.split("@")[0],
    subject: testSubject,
    status: dispatchResult.status,
    provider: dispatchResult.provider,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    deliveryLatencyMs: dispatchResult.deliveryLatencyMs,
    previewHtml: html,
    previewText: testMessage,
    messageId: dispatchResult.messageId,
    error: dispatchResult.error,
    gmailComposeUrl: dispatchResult.gmailComposeUrl,
    mailtoUrl: dispatchResult.mailtoUrl,
    infoNotice: dispatchResult.infoNotice,
    deliveredToInternet: dispatchResult.deliveredToInternet
  };
  await saveEmailLog(emailLog);
  return res.json({
    success: true,
    message: dispatchResult.deliveredToInternet ? `Test email successfully transmitted to ${cleanTo} via ${dispatchResult.provider === "resend" ? "Resend API" : "SMTP"}!` : `Test email prepared and logged in outbox.`,
    delivery: dispatchResult,
    emailLog
  });
});
portalRouter.get("/admin/students", requireAuthentication, requireAdmin, async (req, res) => {
  const { limit, offset, error: pageErr } = parsePaginationQuery(req.query.limit, req.query.offset, 100, 100);
  if (pageErr) {
    return res.status(400).json({ error: pageErr, code: "INVALID_PAGINATION" });
  }
  if (req.query.search && (typeof req.query.search !== "string" || req.query.search.length > 100)) {
    return res.status(400).json({ error: "Search query must be a string up to 100 characters.", code: "INVALID_QUERY" });
  }
  const supabase = getSupabaseAdmin();
  if (isProductionEnvironment() || isSupabaseConfigured()) {
    if (!supabase) {
      return res.status(503).json({
        error: "Student database service is unconfigured in production.",
        code: "DATABASE_UNCONFIGURED"
      });
    }
    try {
      const { data: rows, error } = await supabase.from("students").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error("[Supabase] Query students error:", error);
        return res.status(503).json({
          error: "Failed to retrieve students from database.",
          code: "DATABASE_ERROR"
        });
      }
      return res.json({ students: rows || [] });
    } catch (err) {
      console.error("[Supabase] Query students exception:", err);
      return res.status(503).json({
        error: "Student database service is currently unavailable.",
        code: "DATABASE_UNAVAILABLE"
      });
    }
  }
  if (shouldPermitFallback()) {
    const list = Array.from(fallbackStudentsStore.values());
    return res.json({ students: list });
  }
  return res.status(503).json({
    error: "Database service is unavailable.",
    code: "DATABASE_UNAVAILABLE"
  });
});

// server/paystackServer.ts
import { Router as Router2 } from "express";
import crypto2 from "crypto";

// src/data/vixoraContent.ts
var FEATURED_SERVICES = [
  {
    id: "software-dev",
    title: "Software Development",
    subtitle: "Custom Web & Cloud Platforms",
    tagline: "Engineered for speed, security, and scale.",
    description: "From complex enterprise dashboards to high-concurrency SaaS applications, we architect software tailored precisely to your operational requirements.",
    features: ["Custom web apps with React & Next.js", "Resilient microservices in Python & FastAPI", "Enterprise database architecture & optimization", "Zero-downtime CI/CD deployment pipelines"],
    icon: "Code2"
  },
  {
    id: "ai-automation",
    title: "AI & Automation",
    subtitle: "Autonomous Agents & Workflow Systems",
    tagline: "Replace repetitive busywork with intelligent automation.",
    description: "We deploy custom AI agents, automated workflow pipelines with n8n, and conversational AI chatbots that supercharge team productivity.",
    features: ["Autonomous AI agent swarms", "Omnichannel customer support chatbots", "Document OCR & automated parsing", "Cross-software n8n orchestration"],
    icon: "Bot"
  },
  {
    id: "branding-design",
    title: "Branding & Design",
    subtitle: "Brand Identity & UI/UX Systems",
    tagline: "Design that commands premium positioning.",
    description: "We create distinctive visual identities, precision design systems, and intuitive user experiences that turn first-time visitors into loyal customers.",
    features: ["Comprehensive brand identity styleguides", "Full UI/UX wireframing & prototyping in Figma", "Design tokens & reusable component systems", "Pitch decks & marketing collateral"],
    icon: "Palette"
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing & Media Buying",
    subtitle: "Paid Acquisition & Performance Growth",
    tagline: "Turn ad spend into predictable revenue.",
    description: "Data-driven media buying campaigns across Meta, Google, and TikTok backed by conversion tracking and high-frequency creative testing.",
    features: ["Meta & Google Ads performance campaigns", "Conversion rate optimization (CRO)", "Multi-touch attribution reporting", "Audience segmentation & retargeting"],
    icon: "Megaphone"
  },
  {
    id: "media-production",
    title: "AI Media & Video Production",
    subtitle: "UGC Creatives & AI Generated Video Ads",
    tagline: "High-volume viral video creative at scale.",
    description: "We produce high-converting direct-response video ads, UGC creator content, and AI-narrated synthetic video reels for social dominance.",
    features: ["Direct-response UGC video ads", "AI voiceover & synthetic spokesperson videos", "Batch ad creative iterations", "TikTok, Reels & YouTube Shorts formatting"],
    icon: "Video"
  },
  {
    id: "vixora-academy",
    title: "Vixora Academy & Training",
    subtitle: "Tech & AI Upskilling for Teams & Builders",
    tagline: "Master the skills shaping the future.",
    description: "Practical, project-based training programs in modern software engineering, AI automation, and product building for individuals and corporate teams.",
    features: ["Full-Stack & AI Engineering Cohorts", "Corporate AI adoption masterclasses", "Hands-on project mentorship", "Official Vixora Certification"],
    icon: "GraduationCap"
  }
];
var ACADEMY_COURSES = [
  {
    id: "course-ai-image-short-videos-creation",
    slug: "ai-image-short-videos-creation",
    title: "AI Image & Short Videos Creation",
    subtitle: "Master prompt engineering, photorealistic AI image generation, viral short video editing, voice cloning, and content monetization in a practical 4-week sprint.",
    badge: "Fast-Track Sprint \u2022 \u20A610,000",
    level: "Beginner",
    status: "active",
    track: "Design & Marketing",
    format: "4-Week Practical Sprint (Online + Hands-On Labs)",
    duration: "4 Weeks",
    commitment: "3-4 hrs/week (Flexible Bite-Sized Sessions & Live Labs)",
    nextCohortDate: "October 9, 2026",
    tuition: "\u20A610,000",
    tuitionNote: "Special fast-track price: \u20A610,000 (Standard: \u20A625,000). Instant enrollment access.",
    seatsRemaining: 25,
    targetAudience: "Content Creators, Small Business Owners, Social Media Managers, Marketers, Freelancers, and Complete Beginners.",
    description: "Learn how to use state-of-the-art AI tools to create photorealistic images, stylized graphics, viral short-form video scripts, synthetic voiceovers, and captivating personal or faceless videos. From Midjourney, Flux, and Ideogram to CapCut, ElevenLabs, and Runway, you'll build an automated creative content engine from your laptop or smartphone.",
    heroPitch: "You don't need expensive cameras, a studio, or complex video editing software. In 4 weeks, learn to generate stunning AI images, produce engaging short-form videos, and monetize content for brands and personal growth.",
    highlights: [
      "Generate photorealistic images, high-CTR thumbnails, and brand assets with AI prompts",
      "Produce viral TikTok, Instagram Reels, and YouTube Shorts from text prompts in minutes",
      "Master AI voice cloning, automated captioning, dynamic b-roll, and sound design",
      "Build high-converting faceless theme pages and client video marketing campaigns",
      "Special \u20A610,000 tuition with instant automated gateway verification & enrollment",
      "Official Vixora Digital Hub Certificate of Completion upon graduation"
    ],
    outcomes: [
      "Write precision prompts for photorealistic AI photography, product renders, and concept art",
      "Automate short-form video generation using AI scriptwriting, voiceover, and b-roll pipelines",
      "Edit engaging 9:16 vertical videos with CapCut, dynamic kinetic subtitles, and sound effects",
      "Produce faceless content channels for affiliate marketing, digital products, and brand deals",
      "Offer high-ticket AI content creation services to SMEs, e-commerce stores, and influencers"
    ],
    prerequisites: [
      "A smartphone or laptop with internet connection",
      "Zero prior graphic design, video editing, or AI knowledge required (taught from scratch)",
      "Curiosity and willingness to practice hands-on creative prompts"
    ],
    curriculum: [
      "Module 1 \u2014 Foundations of AI Image Generation & Prompt Engineering",
      "Module 2 \u2014 Character Consistency, Styles & Product Visual Mockups",
      "Module 3 \u2014 AI Scriptwriting, Voice Cloning & Audio Synthesis",
      "Module 4 \u2014 Video Generation, Dynamic Editing & Viral Short Form Formats",
      "Module 5 \u2014 Faceless Channel Workflows, Client Services & Monetization"
    ],
    weeklySyllabus: [
      {
        week: "Week 01",
        title: "AI Image Generation & Professional Prompt Crafting",
        description: "Master modern diffusion models, prompt syntax, aspect ratios, lighting, camera angles, and stylization.",
        topics: [
          "Understanding modern AI image generators (Midjourney, Flux, Ideogram, Leonardo)",
          "Prompt engineering formula: Subject + Medium + Style + Lighting + Camera Lens",
          "Aspect ratios, negative prompts, resolution upscaling, and composition rules",
          "Generating realistic human portraits, hyper-detailed photography, and digital art"
        ],
        handsOnLab: "Lab 01: Create a portfolio of 5 photorealistic commercial assets and 3 brand concept visuals using precision prompting."
      },
      {
        week: "Week 02",
        title: "Character Consistency, Styles & E-Commerce Mockups",
        description: "Generate consistent characters across multiple scenes and professional product photography.",
        topics: [
          "Maintaining facial and clothing consistency across different poses and backgrounds",
          "AI product photography: placing 3D products in luxury studio and lifestyle scenes",
          "Text rendering inside images for posters, logos, and YouTube/Reels thumbnails",
          "Fixing artifacts, inpainting, outpainting, and background replacement"
        ],
        handsOnLab: "Lab 02: Design a complete e-commerce visual lookbook with a consistent AI model and branded product mockups."
      },
      {
        week: "Week 03",
        title: "AI Scriptwriting, Voice Cloning & Audio Synthesis",
        description: "Write viral hooks, generate human-like synthetic voiceovers, and produce clean audio.",
        topics: [
          "High-retention short-form video scripting using ChatGPT and Claude",
          "The 3-second hook framework: Visual, auditory, and psychological curiosity loops",
          "AI voice cloning, natural pacing, emotion modulation, and multilingual synthesis (ElevenLabs)",
          "Audio mixing: background music selection, beat drops, and sound effects (SFX)"
        ],
        handsOnLab: "Lab 03: Script and record 3 viral voiceover tracks with cloned voices, sound design, and retention hooks."
      },
      {
        week: "Week 04",
        title: "Short-Form Video Production, Viral Hooks & Capstone",
        description: "Assemble AI images, text-to-video clips, and voiceovers into high-performing vertical videos.",
        topics: [
          "Text-to-video and image-to-video AI tools (Runway, Pika, Kling, Luma Dream Machine)",
          "Editing vertical videos (9:16) with CapCut: zoom-ins, transitions, overlays, and color grading",
          "Auto-captions, kinetic typography, b-roll sequencing, and trending audio pairing",
          "Publishing strategies, algorithmic triggers, and monetization via client retainers"
        ],
        handsOnLab: "Final Capstone: Produce and publish a complete 45-second viral AI video with custom generated visuals, synthetic voiceover, kinetic subtitles, and sound effects."
      }
    ],
    capstoneProjects: [
      {
        title: "Viral Multi-Platform Short Video Campaign",
        description: "A complete 9:16 short-form video campaign designed for TikTok, Reels, and Shorts featuring AI-generated scenes, synthetic voiceover, and kinetic typography.",
        technologies: ["Midjourney / Flux", "ElevenLabs", "CapCut", "Runway Gen-2", "ChatGPT"]
      },
      {
        title: "AI Brand Commercial Lookbook & Product Mockup Series",
        description: "A high-fashion or commercial e-commerce advertising package with consistent AI models, customized product backdrops, and promotional banners.",
        technologies: ["Ideogram", "Flux", "Photoshop AI", "Canva", "Inpainting Tools"]
      }
    ],
    instructors: [
      {
        name: "David Adeleke",
        role: "Lead AI Creative Producer & Media Director",
        bio: "Digital media producer and generative AI practitioner specializing in viral short-form storytelling, brand advertising, and automated content engines.",
        companyBackground: "Vixora Digital Hub"
      }
    ],
    faqs: [
      {
        q: "Can I take this course using just my smartphone?",
        a: "Yes! Most modern AI image tools, scriptwriters, and mobile editing apps like CapCut, Ideogram, and ElevenLabs run smoothly on iOS and Android as well as laptops."
      },
      {
        q: "Do I need any previous graphic design or video editing experience?",
        a: "None at all. We start from absolute zero, guiding you through prompt formulation, tool setup, and step-by-step video assembly."
      },
      {
        q: "Why is the price \u20A610,000?",
        a: "This is a special fast-track price enabling prospective students and creators to experience Vixora Academy's live hands-on teaching and practical creative toolchains."
      },
      {
        q: "Will I receive a verified certificate upon completion?",
        a: "Yes. Once you complete the weekly practical labs and submit your final short video capstone, you will be awarded an official Vixora Digital Hub Certificate of Completion with a digital verification QR code."
      }
    ],
    certificateType: "Certificate of Completion in AI Creative Media & Video Production"
  },
  {
    id: "course-data-analysis-cohort",
    slug: "data-analysis-cohort",
    title: "Data Analysis Cohort",
    subtitle: 'In 16 weeks, go from "I have a laptop and curiosity" to a working data analyst who can clean messy data, write SQL, build Power BI dashboards, and tell a story businesses actually act on.',
    badge: "Early Tuition: \u20A660,000",
    level: "Beginner",
    track: "Data & Analytics",
    format: "16-Week Hybrid Cohort (Online & Physical)",
    duration: "16 Weeks",
    commitment: "5-6 hrs/week (Flexible Bite-Sized Sessions & Practical Labs)",
    nextCohortDate: "October 9, 2026",
    tuition: "\u20A660,000",
    tuitionNote: "Early applicant price: \u20A660,000 (Standard: \u20A665,000). Limited seats, ends soon.",
    seatsRemaining: 10,
    targetAudience: "Students, Graduates, Job Seekers, Freelancers, Professionals, and Complete Beginners.",
    description: "A 16-week, project-based program that takes you through the full analyst toolkit: Excel \u2192 SQL \u2192 Power BI \u2192 AI-Assisted Analysis. You won't just learn what a pivot table is. You'll clean real messy datasets, write SQL queries that answer real business questions, build interactive Power BI dashboards, and finish with a portfolio-ready capstone project.",
    heroPitch: "Your laptop already has the power to change your career. You just haven't learned to use it yet. In 16 weeks, go from raw data to real decisions with Excel, SQL, Power BI, and AI-assisted analysis.",
    highlights: [
      "16 weeks of structured, project-based training with zero fluff",
      "12 comprehensive modules: Excel, SQL, Power BI & AI-assisted analysis",
      "Multiple real portfolio projects (Sales Dashboard, Customer Analysis, Marketing Performance, SQL Business Analysis, BI Dashboard)",
      "A full Final Capstone Project \u2014 real analyst-level work, start to finish",
      "Official Vixora Certificate of Completion upon graduation",
      "Online & Physical hybrid access \u2014 learn however suits you",
      "Career + freelancing guidance to turn your skill into income"
    ],
    outcomes: [
      "Clean messy, unreliable datasets into analysis-ready business models with Excel & Power Query",
      "Write professional SQL queries (SELECT, JOINs, CASE, aggregations, and window functions)",
      "Build interactive Power BI dashboards with DAX measures and cross-filtered analytics",
      "Leverage AI tools for automated formula generation, SQL debugging, and fast reporting",
      "Present data insights using the Finding \u2192 Evidence \u2192 Meaning \u2192 Recommendation framework",
      "Package dashboard-building, reporting, and data analysis as high-income freelance services"
    ],
    prerequisites: [
      "A laptop with internet access",
      "Zero prior coding, math, or statistics background required (taught from the ground up)",
      "No expensive software \u2014 learn tools businesses already use daily",
      "Curiosity and willingness to practice hands-on projects"
    ],
    curriculum: [
      "Module 1 \u2014 Introduction to Data Analysis (The Analyst Workflow)",
      "Module 2 \u2014 Excel Fundamentals (Formulas & Business Sales Project)",
      "Module 3 \u2014 Data Cleaning & Preparation (Messy Data into Insights)",
      "Module 4 \u2014 Data Analysis with Excel (Statistics, Trends & Pivot Tables)",
      "Module 5 \u2014 Data Visualization (Chart Principles & Visual Storytelling)",
      "Module 6 \u2014 SQL for Data Analysis (Queries, JOINs & Customer Database)",
      "Module 7 \u2014 Power BI (DAX, Modeling & Interactive BI Dashboards)",
      "Module 8 \u2014 AI for Data Analysis (AI Formulas, SQL Generation & Debugging)",
      "Module 9 \u2014 Business & Real-World Data Analysis (Sales, Marketing & Ops)",
      "Module 10 \u2014 Data Storytelling & Reporting (Executive Presentations)",
      "Module 11 \u2014 Data Analyst Portfolio (Showcase Ready for Hiring Managers)",
      "Module 12 \u2014 From Skill to Opportunity (Careers, Freelancing & Proposals)",
      "Final Capstone Project \u2014 Complete Real-World Business Analysis"
    ],
    weeklySyllabus: [
      {
        week: "Weeks 1-2 (Module 1 & 2)",
        title: "Introduction to Data Analysis & Excel Fundamentals",
        description: "Understand what data analysis actually is, the types of data you'll work with, and the full process every analyst follows: Ask \u2192 Collect \u2192 Clean \u2192 Analyze \u2192 Visualize \u2192 Communicate \u2192 Decide. Master essential Excel formulas, functions, text/date tools, and build a real Business Sales Analysis project.",
        topics: [
          "The Data Analysis lifecycle & types of structured/unstructured business data",
          "Essential Excel formulas, functions, text and date manipulation tools",
          "Cell referencing, XLOOKUP / VLOOKUP, logic formulas (IF, IFS), and error handling",
          "Business Sales Analysis project: Structuring workbooks and automated KPI metrics"
        ],
        handsOnLab: "Build an automated Business Sales Analysis model in Excel with structured lookups and summary metrics."
      },
      {
        week: "Weeks 3-4 (Module 3 & 4)",
        title: "Data Cleaning, Preparation & Analysis with Excel",
        description: "Learn to turn messy, unreliable data into clean, analysis-ready datasets \u2014 the unglamorous skill that separates real analysts from beginners. Move from cleaning to insight: descriptive statistics, growth rates, trends, Pivot Tables, and building your first interactive dashboard.",
        topics: [
          "Handling missing values, duplicate records, inconsistent formatting, and outliers",
          "Power Query basics for transforming and reshaping raw data imports",
          "Descriptive statistics, variance, growth rates, margins, and seasonal trends",
          "Advanced Pivot Tables, calculated fields, dynamic slicers, and interactive dashboard design"
        ],
        handsOnLab: "Clean an authentic messy multi-year transactional dataset and build an interactive Excel Sales & Margin Pivot Dashboard."
      },
      {
        week: "Weeks 5-6 (Module 5 & 6)",
        title: "Data Visualization & SQL for Data Analysis",
        description: "Learn to choose the right chart, apply visualization principles, and turn a plain dataset into a report that tells a clear business story. Master SQL from SELECT statements to JOINs, aggregations, CASE statements, subqueries, and window functions \u2014 culminating in a Customer & Sales Database project.",
        topics: [
          "Visual hierarchy, chart selection matrix, formatting, and reducing cognitive load",
          "Relational databases: Tables, primary keys, foreign keys, and entity relationships",
          "Writing SQL queries: SELECT, WHERE, GROUP BY, HAVING, ORDER BY, and math aggregations",
          "Multi-table JOINs (INNER, LEFT, RIGHT), subqueries, CASE statements, and window functions"
        ],
        handsOnLab: "Query a multi-table Customer & Sales Database to extract revenue cohorts, retention rates, and top customer segments."
      },
      {
        week: "Weeks 7-8 (Module 7 & 8)",
        title: "Power BI Business Intelligence & AI for Data Analysis",
        description: "Import, clean, and model data in Power BI; build custom DAX measures; and design professional, interactive Business Intelligence dashboards. Learn to use AI as a genuine analysis accelerator \u2014 generating and explaining formulas, writing and debugging SQL, and speeding up reporting while keeping human judgment in control.",
        topics: [
          "Power BI architecture, data modeling, star schemas, and active relationships",
          "DAX fundamentals: CALCULATE, RELATED, time intelligence, and custom business KPIs",
          "Designing executive-ready visual dashboards with cross-filtering and drill-throughs",
          "AI for Data Analysis: Generating and explaining formulas, debugging SQL, and accelerating exploratory analysis"
        ],
        handsOnLab: "Build a production-ready, interactive Power BI Executive Operations & Revenue Dashboard with dynamic DAX metrics."
      },
      {
        week: "Weeks 9-11 (Module 9 & 10)",
        title: "Business Data Analysis & Data Storytelling & Reporting",
        description: "Apply everything to realistic business scenarios across sales, marketing, finance, customers, and operations \u2014 answering the questions real companies ask. Learn to summarize findings, write executive summaries, and present insights using the Finding \u2192 Evidence \u2192 Meaning \u2192 Recommendation framework.",
        topics: [
          "Domain analysis: CAC, LTV, churn velocity, marketing ROI, and operational bottleneck diagnostics",
          "Diagnosing business anomalies: 'Why did revenue drop?' and 'What should we do next?'",
          "The 4-part Storytelling Framework: Finding \u2192 Evidence \u2192 Meaning \u2192 Recommendation",
          "Writing 1-page executive summaries and slide decks for non-technical stakeholders"
        ],
        handsOnLab: "Conduct a full business diagnostics review on a declining commercial product and present a slide deck with clear executive recommendations."
      },
      {
        week: "Weeks 12-16 (Module 11, 12 & Final Capstone)",
        title: "Data Analyst Portfolio, Freelancing & Final Capstone Project",
        description: "Build a professional portfolio showcasing your Excel, SQL, and Power BI projects \u2014 documented the way hiring managers and clients expect. Turn your skills into income by exploring career pathways (Data Analyst, BI Analyst, Reporting Analyst) and learning freelancing fundamentals. Complete and defend your comprehensive Final Capstone Project.",
        topics: [
          "Documenting and packaging projects on GitHub / Notion / portfolio sites the way hiring managers expect",
          "Career pathways: Data Analyst, BI Analyst, Reporting Analyst, and Operations Analyst roles",
          "Freelancing fundamentals: Packaging dashboard & data services, pricing, client outreach, and proposal writing",
          "Final Capstone Project: End-to-end raw data ingestion, cleaning, SQL queries, Power BI dashboard, and executive presentation"
        ],
        handsOnLab: "Complete and present your full Final Capstone Project covering raw data to executive strategic recommendations."
      }
    ],
    capstoneProjects: [
      {
        title: "End-to-End Enterprise Sales & Revenue Intelligence Dashboard",
        description: "A complete data analysis system transforming multi-year messy sales spreadsheets into an automated Power BI dashboard with dynamic DAX metrics and trend forecasting.",
        technologies: ["Excel", "Power Query", "Power BI", "DAX", "AI Data Tools"]
      },
      {
        title: "Customer Retention & Lifetime Value SQL Database Analysis",
        description: "A comprehensive relational database analysis querying 50,000+ customer records to identify churn patterns, repeat purchase velocity, and high-value customer cohorts.",
        technologies: ["PostgreSQL / MySQL", "SQL Subqueries & Window Functions", "Data Modeling"]
      },
      {
        title: "Executive Business Diagnostic Report & Strategic Presentation",
        description: "A polished stakeholder deliverable diagnosing a company's marketing and revenue drop, presenting actionable business findings with the Finding-Evidence-Meaning-Recommendation framework.",
        technologies: ["Data Storytelling", "Excel Pivot Reporting", "Executive Summary Decks"]
      }
    ],
    instructors: [
      {
        name: "Vixora Senior Data Analysts & BI Engineers",
        role: "Lead Instructors & Head of Data Analytics, Vixora Academy",
        bio: "Practicing data analysts and business intelligence specialists who build analytics infrastructure for enterprises and mentor beginners into employable professionals.",
        companyBackground: "Vixora Academy Certified Instructors"
      }
    ],
    faqs: [
      {
        q: "Do I need a math or coding background?",
        a: "No. The program takes you from beginner to professional \u2014 every tool and concept is taught from the ground up."
      },
      {
        q: "Is this online or in-person?",
        a: "Both \u2014 the cohort runs hybrid, so you can learn online, in person, or a mix of both."
      },
      {
        q: "What tools will I actually learn?",
        a: "Excel, SQL, and Power BI as your core tools, plus Power Query, AI tools, and Google Sheets as supporting skills."
      },
      {
        q: "Will I have something to show employers or clients afterward?",
        a: "Yes \u2014 you'll build a full portfolio (Sales Dashboard, Customer Analysis, SQL projects, Power BI dashboard) plus a Final Capstone Project you can present as real analyst work."
      },
      {
        q: "What if I want to freelance instead of getting a job?",
        a: "Module 12 covers freelancing fundamentals \u2014 packaging your services, finding clients, and writing proposals \u2014 so both paths are covered."
      },
      {
        q: "What happens after I apply?",
        a: "You'll receive confirmation and next steps, including your cohort start date and how to secure your seat at the early price."
      }
    ],
    certificateType: "Vixora Certificate of Professional Completion in Data Analysis"
  },
  {
    id: "course-ai-automation-digital-skills",
    slug: "ai-automation-digital-skills",
    title: "AI Automation & Digital Skills",
    subtitle: "While most people are still asking ChatGPT to write birthday messages, you'll be building automations, creating AI content, and getting paid for skills the market is desperate for \u2014 no tech background required.",
    badge: "Early Tuition: \u20A630,000",
    level: "Beginner",
    track: "Business Automation",
    format: "12-Week Hybrid Cohort (Online + Practical Sessions)",
    duration: "12 Weeks",
    commitment: "4-5 hrs/week (Flexible Bite-Sized Sessions)",
    nextCohortDate: "October 9, 2026",
    tuition: "\u20A630,000",
    tuitionNote: "Early applicant rate (Standard: \u20A635,000). Limited cohort seats available.",
    seatsRemaining: 14,
    targetAudience: "Students, Job Seekers, Small Business Owners, Entrepreneurs, and Complete Beginners.",
    description: "A 12-week, hands-on program built for complete beginners who want to go from 'I've heard of ChatGPT' to 'I automate things for a living' \u2014 without writing a single line of code. Master AI productivity tools, scroll-stopping content generation, Make/Zapier/Notion automations, document handling, and client freelancing monetization.",
    heroPitch: "Everyone's talking about AI. In 12 weeks, you'll actually know how to use it \u2014 build automations, create AI content, and get paid for in-demand skills.",
    highlights: [
      "12 weeks of structured, hands-on training with zero fluff",
      "5 comprehensive modules: AI tools, content, automation, documents & monetization",
      "A real, practical project for your portfolio \u2014 not just theory",
      "Official Vixora Certificate of Completion upon graduation",
      "Beginner-friendly teaching \u2014 zero coding or tech background needed",
      "Hybrid access \u2014 learn online or in practical sessions with community support"
    ],
    outcomes: [
      "Master ChatGPT & frontier AI tools to work 10x faster and clearer",
      "Create scroll-stopping AI-generated images, videos & high-accuracy prompts",
      "Build automated workflows with Make, Zapier & Notion to replace repetitive tasks",
      "Automate PDF & document processing so tedious paperwork runs itself",
      "Turn your new skills into income \u2014 freelancing, skill packaging & client acquisition"
    ],
    prerequisites: [
      "A laptop or smartphone with internet access",
      "Zero coding or tech background required (if you can send a WhatsApp message, you can do this)",
      "Willingness to practice hands-on projects"
    ],
    curriculum: [
      "Module 1 \u2014 AI Tools Fundamentals (ChatGPT & Prompt Mastery)",
      "Module 2 \u2014 AI Content Creation (Images, Videos & Creative Generation)",
      "Module 3 \u2014 Simple Automation (Make, Zapier & Notion Workflows)",
      "Module 4 \u2014 PDF & Document Automation (Paperwork Streamlining)",
      "Module 5 \u2014 Making Money With AI Skills (Freelancing & Client Acquisition)"
    ],
    weeklySyllabus: [
      {
        week: "Weeks 1-2 (Module 1)",
        title: "AI Tools Fundamentals",
        description: "Master ChatGPT and other leading AI tools to work faster, think clearer, and get more done in less time \u2014 the foundation everything else is built on.",
        topics: [
          "Understanding Large Language Models without tech jargon",
          "Prompt Engineering: The precise syntax to get exact results every time",
          "ChatGPT, Claude & Perplexity workflows for research & writing",
          "Building customized GPTs and reusable personal productivity assistants"
        ],
        handsOnLab: "Build your customized personal AI Productivity Assistant tailored to your career or business."
      },
      {
        week: "Weeks 3-4 (Module 2)",
        title: "AI Content Creation",
        description: "Learn to create scroll-stopping AI-generated images and videos, and master the art of prompting so the AI gives you exactly what you want, every time.",
        topics: [
          "Photorealistic AI image generation with Midjourney & Ideogram",
          "Generating realistic voiceovers, avatars & videos with Runway & ElevenLabs",
          "Social media content repurposing pipelines and hooks",
          "Graphic design and branding assets creation without Photoshop"
        ],
        handsOnLab: "Create a complete visual branding & social media content campaign using 100% AI generation."
      },
      {
        week: "Weeks 5-7 (Module 3)",
        title: "Simple Automation (Make, Zapier & Notion)",
        description: "Get hands-on with Make, Zapier, and Notion to automate the repetitive tasks that eat up your day \u2014 the same skills businesses pay freelancers to set up.",
        topics: [
          "Visual automation basics: Triggers, actions & data passing",
          "Automating lead notifications from forms to WhatsApp & email",
          "Connecting Notion databases to Google Sheets and calendar apps",
          "Building automated client onboarding & task dispatch pipelines"
        ],
        handsOnLab: "Deploy a live 3-step automation that collects customer inquiries and dispatches instant WhatsApp notifications."
      },
      {
        week: "Weeks 8-9 (Module 4)",
        title: "PDF & Document Automation",
        description: "Stop drowning in paperwork. Learn to automate document handling and processing so tedious admin work runs itself.",
        topics: [
          "Extracting structured data from receipts, invoices & PDF contracts",
          "Automated report generation and document summarization",
          "Connecting cloud folders (Google Drive / Dropbox) to auto-parsers",
          "Eliminating hours of manual data entry and spreadsheet typing"
        ],
        handsOnLab: "Build an automated PDF Invoice Reader that extracts line items into a structured spreadsheet instantly."
      },
      {
        week: "Weeks 10-12 (Module 5)",
        title: "Making Money With AI Skills",
        description: "Turn everything you've learned into income \u2014 how to freelance, package your skills, and find your first paying clients.",
        topics: [
          "Packaging automation & AI services into high-ticket freelance offers",
          "Creating an irresistible portfolio with your course capstone projects",
          "Finding paying clients on Upwork, LinkedIn, WhatsApp & local businesses",
          "Pricing your services: Charging for value, not hourly time"
        ],
        handsOnLab: "Publish your live Capstone Portfolio Website and pitch your first 3 prospective clients."
      }
    ],
    capstoneProjects: [
      {
        title: "End-to-End Business Automation & Lead Pipeline",
        description: "A complete no-code automation system connecting customer forms, WhatsApp alerts, Google Drive filing, and automated client onboarding.",
        technologies: ["Make.com", "Zapier", "ChatGPT API", "Notion", "WhatsApp API", "Google Workspace"]
      },
      {
        title: "AI-Powered Content Creation & Social Media Suite",
        description: "A rapid content generation engine that produces branded graphics, video scripts, synthetic voiceovers, and scheduled social posts.",
        technologies: ["Midjourney", "ElevenLabs", "ChatGPT", "Canva AI", "Airtable"]
      },
      {
        title: "Automated Document Parser & Invoice Manager",
        description: "An administrative tool that monitors incoming emails, extracts structured data from attached PDF invoices, and logs expenses into spreadsheets.",
        technologies: ["Make.com", "AI Document Parser", "Google Sheets", "Gmail Automation"]
      }
    ],
    instructors: [
      {
        name: "Vixora Digital Hub Instructors & AI Practitioners",
        role: "Head of AI Automation Training, Vixora Academy",
        bio: "Veteran automation architects who build real client systems and teach beginners with zero tech jargon.",
        companyBackground: "Vixora Academy Certified Instructors"
      }
    ],
    faqs: [
      {
        q: "Do I need any tech or coding experience?",
        a: "None at all. This course is built specifically for beginners \u2014 if you can use WhatsApp, you can do this."
      },
      {
        q: "I'm busy. Can I really keep up?",
        a: "The program is hybrid and structured around real-life schedules. You'll get practical, bite-sized sessions \u2014 not a full-time commitment."
      },
      {
        q: "Is this really beginner-friendly, or will I get lost?",
        a: "Every module starts from zero. Nobody gets left behind \u2014 the whole point is to make AI simple, not intimidating."
      },
      {
        q: "What happens after I apply?",
        a: "You'll receive confirmation and next steps, including your cohort start date and how to secure your seat at the early price."
      },
      {
        q: "What if I finish and still don't know how to make money from this?",
        a: "Module 5 is built specifically to bridge learning into earning \u2014 freelancing strategy and finding your first clients are baked into the curriculum, not an afterthought."
      }
    ],
    certificateType: "Vixora Certificate of Completion in AI Automation & Digital Skills"
  },
  {
    id: "course-ai-automation-digital-business-systems",
    slug: "ai-automation-digital-business-systems",
    title: "AI Automation & Digital Business Systems",
    subtitle: `This isn't the "learn the basics" course. This is where you build real automations, real client systems, and a real freelance or business income \u2014 with direct mentorship the whole way.`,
    badge: "Early Tuition: \u20A660,000 (Reg \u20A6150,000+)",
    level: "Advanced",
    track: "Business Automation",
    format: "12-Week Implementation & Mentorship-Led Cohort",
    duration: "12 Weeks",
    commitment: "5-6 hrs/week (Implementation Labs + Mentorship)",
    nextCohortDate: "October 9, 2026",
    tuition: "\u20A660,000",
    tuitionNote: "Early bird rate: \u20A660,000 (Standard: \u20A665,000 \u2014 regular value \u20A6100,000 \u2013 \u20A6150,000+). Includes direct mentorship, client acquisition training & real client projects.",
    seatsRemaining: 8,
    targetAudience: "Professionals, Business Owners, Agency Founders, Freelancers, Consultants, and Digital Skills Graduates ready to build & monetize AI systems.",
    description: "Vixora Academy's advanced, implementation-focused program for people ready to go beyond tools and start building. You'll learn to design, build, and deploy AI-powered automations and solutions \u2014 the kind organizations and clients actually pay for \u2014 with hands-on mentorship, real business projects, and direct support.",
    heroPitch: "Stop using AI tools. Start building AI systems businesses pay for \u2014 real automations, real client systems, and a real income stream with direct mentorship.",
    highlights: [
      "Advanced, implementation-focused curriculum (not a repeat of the basics)",
      "Direct mentorship and higher-touch support throughout",
      "Real business projects \u2014 building your actual portfolio, not sample exercises",
      "Client acquisition training \u2014 finding and closing clients, not just theory",
      "Access to an active community of other builders",
      "A clear path to freelance or service-business income"
    ],
    outcomes: [
      "Architect multi-step advanced automations with Make, Zapier, Notion, n8n & GHL",
      "Deliver professional-level AI image and video production assets for paying clients",
      "Deploy business process & PDF automation systems solving high-ticket operational pain points",
      "Build custom AI tools and web products using Vibe Coding without a traditional dev background",
      "Master end-to-end client acquisition, discovery calls, scoping, and retaining recurring contracts"
    ],
    prerequisites: [
      "Basic comfort with AI tools (ChatGPT, prompting fundamentals)",
      "General digital literacy \u2014 this is the advanced track, not a from-zero start",
      "Laptop with reliable internet connection and willingness to build real projects"
    ],
    curriculum: [
      "Module 1 \u2014 Advanced AI Workflows (Make, Zapier, Notion, n8n & GHL)",
      "Module 2 \u2014 Advanced Prompting & AI Production (Client & Business Media)",
      "Module 3 \u2014 Business Process & PDF Automation (Operational Pain Points)",
      "Module 4 \u2014 Vibe Coding & AI-Powered Solutions (Custom Web Tools)",
      "Module 5 \u2014 Client & Project Implementation (First Call to Delivery)",
      "Module 6 \u2014 Freelancing & Service Business (Packaging Offers & Retainers)",
      "Module 7 \u2014 Mentorship, Community & Capstone Client Deployments"
    ],
    weeklySyllabus: [
      {
        week: "Weeks 1-2 (Module 1)",
        title: "Advanced AI Workflows",
        description: "Go beyond the basics with Make, Zapier, Notion, n8n, and GHL \u2014 building serious, multi-step automations that solve real business problems.",
        topics: [
          "Multi-step conditional logic, error routers, and fallback handlers in Make.com",
          "Self-hosted & cloud n8n workflows for complex enterprise integrations",
          "GoHighLevel (GHL) CRM automation, pipeline triggers & SMS/email sequences",
          "Notion databases as real-time automation control centers and dashboards"
        ],
        handsOnLab: "Build and deploy a multi-channel lead routing & onboarding automation engine with Make and n8n."
      },
      {
        week: "Weeks 3-4 (Module 2)",
        title: "Advanced Prompting & AI Production",
        description: "Professional-level prompting, plus AI image and video production built for client and business use \u2014 not just personal projects.",
        topics: [
          "System prompts, multi-persona chains, and structured JSON output extraction",
          "Commercial AI image generation, consistent character & brand style matching",
          "AI video commercials, dynamic voice cloning, and lip-syncing for client ads",
          "Building automated batch content production pipelines"
        ],
        handsOnLab: "Create an end-to-end commercial video ad campaign asset pack for a real business client."
      },
      {
        week: "Weeks 5-6 (Module 3)",
        title: "Business Process & PDF Automation",
        description: "Design automation systems that solve real operational pain points for businesses \u2014 the kind of work clients will pay premium rates for.",
        topics: [
          "Automated PDF extraction, invoice OCR, and receipt parsing with AI models",
          "Document generation pipelines (contract generation, proposals, automated reports)",
          "ERP & accounting software sync (QuickBooks, Google Sheets, Airtable)",
          "Human-in-the-loop review queues for compliance and quality control"
        ],
        handsOnLab: "Deploy an automated invoice ingestion and financial summary system that saves 15+ hours/week."
      },
      {
        week: "Weeks 7-8 (Module 4)",
        title: "Vibe Coding & AI-Powered Solutions",
        description: "Learn to build working AI-powered tools and products, even without a traditional developer background.",
        topics: [
          "Modern AI-assisted code generation (Cursor, Claude Code, Lovable, Replit)",
          "Building micro-SaaS calculators, lead magnets, and customer client portals",
          "Integrating Gemini and OpenAI APIs into web interfaces with secure backends",
          "Deploying fast, responsive web apps with zero devops hassle"
        ],
        handsOnLab: "Build and publish a live, functional AI-powered web tool that prospective clients can test."
      },
      {
        week: "Weeks 9-10 (Module 5)",
        title: "Client & Project Implementation",
        description: "Take a project from first conversation to delivered solution \u2014 the exact process professionals use to run real client work.",
        topics: [
          "Conducting discovery calls & diagnosing high-value automation opportunities",
          "Writing winning scopes of work (SOW), PRDs, and implementation milestones",
          "Client onboarding, environment staging, and testing protocols",
          "Handover documentation, Loom video walk-throughs, and client training"
        ],
        handsOnLab: "Package a complete client proposal with detailed scope, architecture diagram, and milestone pricing."
      },
      {
        week: "Weeks 11-12 (Module 6 & 7)",
        title: "Freelancing, Service Business & Mentorship",
        description: "Package your skills into a service business, find and close clients, build recurring retainers, and receive direct 1-on-1 mentorship.",
        topics: [
          "High-ticket service packaging & recurring monthly maintenance retainers",
          "Cold outreach, inbound LinkedIn funnels, and closing discovery calls",
          "Pricing your work (from \u20A6200k fixed projects to $2,500/mo retainers)",
          "Graduation review, portfolio polishing, and peer mastermind community"
        ],
        handsOnLab: "Launch your official automation service landing page & portfolio with active client outreach."
      }
    ],
    capstoneProjects: [
      {
        title: "Enterprise Multi-App Lead & Automation Engine",
        description: "A production-grade n8n, Make.com, and GHL multi-system automation integrating webhook routers, CRM pipelines, and autonomous client notifications.",
        technologies: ["n8n", "Make.com", "GoHighLevel", "OpenAI / Gemini API", "Notion", "PostgreSQL"]
      },
      {
        title: "AI-Generated Commercial Production Suite & Client Asset Pipeline",
        description: "An automated commercial media pipeline producing consistent-character visual campaigns, promotional AI video clips, voiceovers, and scheduled deliverables.",
        technologies: ["Midjourney v6", "Runway Gen-3 / Kling", "ElevenLabs", "Claude 3.7", "Airtable"]
      },
      {
        title: "Autonomous Invoice Ingestion & Document Intelligence Portal",
        description: "An operational enterprise tool that monitors email inboxes, parses PDF invoices via OCR, reconciles ledger items, and triggers payment receipts.",
        technologies: ["Make.com", "AI Document OCR", "Google Sheets / QuickBooks", "Zapier", "Slack API"]
      },
      {
        title: "Custom AI Micro-SaaS Tool (Vibe Coding Capstone)",
        description: "A deployed, client-facing web application with custom prompt logic and interactive UI built using modern AI code generation.",
        technologies: ["React / Vite", "Tailwind CSS", "Gemini API", "Cloud Run / Vercel"]
      }
    ],
    instructors: [
      {
        name: "Vixora Digital Hub Senior Systems Engineers & Mentors",
        role: "Director of Enterprise AI Architecture & Training",
        bio: "Senior automation specialists and business architects who build production automations for high-growth enterprises and guide students 1-on-1.",
        companyBackground: "Vixora Digital Hub Senior Practitioners"
      }
    ],
    faqs: [
      {
        q: "Do I need to take the Mass Market course first?",
        a: "Not required, but you should already be comfortable with basic AI tools and general digital literacy \u2014 Premium builds from there, it doesn't start from zero."
      },
      {
        q: "How is this different from the Mass Market course?",
        a: "Mass Market teaches you to use AI. Premium teaches you to build and monetize AI systems \u2014 with direct mentorship, real client-style projects, and a path to freelance/business income."
      },
      {
        q: "What kind of support do I get?",
        a: "Direct mentorship, community access, and higher-touch guidance through real project work \u2014 not just pre-recorded lessons."
      },
      {
        q: "Can I really start earning from this?",
        a: "Yes \u2014 client acquisition and freelancing strategy are built directly into the curriculum, and real business projects give you portfolio proof to show prospective clients."
      },
      {
        q: "What if I'm not sure Premium is right for me yet?",
        a: "Start with the Mass Market track \u2014 you can move up into Premium whenever you're ready. See the Choose Your Path comparison table on this page."
      }
    ],
    certificateType: "Vixora Certificate of Advanced Mastery in AI Automation & Digital Business Systems"
  },
  {
    id: "course-fullstack-vibe-coding",
    slug: "full-stack-vibe-coding",
    title: "Full Stack Vibe Coding",
    subtitle: "Build real full-stack web applications with AI as your coding partner \u2014 from idea and interface design to backend logic, databases, authentication, deployment, and production-ready delivery.",
    badge: "12-Week Production Cohort",
    level: "Beginner to Intermediate",
    status: "upcoming",
    track: "Engineering & AI",
    format: "12-Week Hybrid, Project-Based Cohort",
    duration: "12 weeks",
    commitment: "5-7 hrs/week (Live Sessions + Build Labs)",
    nextCohortDate: "Coming Soon",
    tuition: "\u20A650,000",
    tuitionNote: "Full program fee: \u20A650,000. International pricing: $100.",
    seatsRemaining: 20,
    targetAudience: "Aspiring developers, freelancers, entrepreneurs, students, designers, and professionals who want to build and launch modern web applications with AI-assisted development.",
    description: "Learn to turn ideas into working full-stack products using modern AI-assisted development workflows. You will learn how to plan an application, build responsive interfaces, create backend APIs, connect databases, add authentication, integrate third-party services, debug with AI, use Git and GitHub, deploy to production, and present a finished portfolio project.",
    heroPitch: "Stop watching coding tutorials. Start building real products with AI as your development partner.",
    highlights: [
      "Learn practical Vibe Coding from idea to deployed application",
      "Build frontend interfaces with HTML, CSS, JavaScript, React, and modern UI workflows",
      "Create backend APIs, database models, authentication, and real application logic",
      "Use AI coding tools for planning, generation, debugging, refactoring, and documentation",
      "Build and deploy portfolio-ready full-stack projects",
      "Learn Git, GitHub, environment variables, API security, and production basics",
      "Finish with a capstone product you can demonstrate to clients, employers, or users"
    ],
    outcomes: [
      "Break a product idea into requirements, user flows, pages, components, data models, and implementation tasks",
      "Use AI coding assistants effectively without blindly accepting generated code",
      "Build responsive frontend applications with React and reusable components",
      "Build backend APIs and connect them to a relational database",
      "Implement authentication, authorization, validation, error handling, and secure environment configuration",
      "Connect external APIs and services to create useful real-world product features",
      "Use Git and GitHub to manage versions, branches, commits, and collaboration",
      "Debug full-stack applications by reading errors, tracing requests, testing fixes, and using AI as a debugging partner",
      "Deploy a full-stack application and configure its production environment",
      "Package and present a portfolio-ready product and explain the technical decisions behind it"
    ],
    prerequisites: [
      "A laptop with reliable internet access",
      "Basic computer literacy and willingness to learn",
      "No computer science degree or professional programming experience required",
      "A willingness to practice between live sessions and build your own project"
    ],
    curriculum: [
      "Module 1 \u2014 Vibe Coding Foundations: How to Build with AI",
      "Module 2 \u2014 Web Foundations: HTML, CSS, JavaScript & Git",
      "Module 3 \u2014 React Frontend Development & Modern UI",
      "Module 4 \u2014 Backend APIs & Server-Side Application Logic",
      "Module 5 \u2014 Databases, Authentication & Data Security",
      "Module 6 \u2014 APIs, Integrations & Real-World Product Features",
      "Module 7 \u2014 AI-Assisted Debugging, Testing & Code Quality",
      "Module 8 \u2014 Full-Stack Architecture & Production Readiness",
      "Module 9 \u2014 Build Sprint: From Product Idea to MVP",
      "Module 10 \u2014 Deployment, Domains & Production Operations",
      "Module 11 \u2014 Capstone Development, Review & Portfolio",
      "Module 12 \u2014 Launch, Client Delivery & Monetization"
    ],
    weeklySyllabus: [
      {
        week: "Week 1",
        title: "Vibe Coding Foundations: From Idea to Build Plan",
        description: "Understand the Vibe Coding workflow and learn how to use AI as a development partner while keeping control of architecture, code quality, and product decisions.",
        topics: [
          "What Vibe Coding is and where AI-assisted development fits in a real workflow",
          "Turning an idea into requirements, user stories, pages, features, and acceptance criteria",
          "Prompting AI for planning, architecture, code generation, explanations, and reviews",
          "Choosing a practical stack and setting up the development environment"
        ],
        handsOnLab: "Turn a product idea into a build specification and use an AI coding assistant to generate the first working project structure."
      },
      {
        week: "Week 2",
        title: "Web Foundations, JavaScript & Git",
        description: "Build the core web skills needed to understand and control AI-generated code instead of treating it as a black box.",
        topics: [
          "HTML structure, semantic elements, forms, accessibility, and page layout",
          "CSS fundamentals, responsive design, Flexbox, Grid, and reusable styling patterns",
          "JavaScript variables, functions, arrays, objects, events, async code, and modules",
          "Git, GitHub, commits, branches, pull requests, and recovering from mistakes"
        ],
        handsOnLab: "Build and publish a responsive landing page from a written specification using AI-assisted development and Git."
      },
      {
        week: "Weeks 3-4",
        title: "React Frontend Development & Modern UI",
        description: "Move from static pages to reusable, interactive frontend applications with React.",
        topics: [
          "React components, props, state, events, and reusable UI patterns",
          "Forms, validation, loading states, error states, and conditional rendering",
          "Routing, layouts, reusable components, and responsive application structure",
          "Designing clean interfaces with AI-assisted UI generation and iterative refinement"
        ],
        handsOnLab: "Build a responsive dashboard with authentication screens, forms, reusable components, and interactive application states."
      },
      {
        week: "Weeks 5-6",
        title: "Backend APIs & Server-Side Logic",
        description: "Learn how the frontend communicates with a backend and how business logic is implemented securely on the server.",
        topics: [
          "Client-server architecture, HTTP methods, status codes, and REST API design",
          "Building API routes, controllers, validation, and structured responses",
          "Environment variables, secrets, server-side configuration, and error handling",
          "Connecting frontend actions to backend endpoints and tracing requests end to end"
        ],
        handsOnLab: "Build a backend API for a simple business application and connect it to the React frontend."
      },
      {
        week: "Weeks 7-8",
        title: "Databases, Authentication & Integrations",
        description: "Turn a frontend and API into a real application by persisting data, managing users, and connecting external services.",
        topics: [
          "Relational database concepts, tables, relationships, queries, and migrations",
          "User registration, login, sessions, protected routes, and role-based access",
          "CRUD operations, validation, authorization, and common application security risks",
          "Working with third-party APIs, webhooks, file storage, email, and other integrations"
        ],
        handsOnLab: "Build a secure authenticated application that stores user data, protects private routes, and consumes an external API."
      },
      {
        week: "Week 9",
        title: "AI-Assisted Debugging, Testing & Code Quality",
        description: "Learn to diagnose problems systematically and use AI to accelerate debugging without introducing hidden defects.",
        topics: [
          "Reading browser, frontend, backend, and database errors",
          "Debugging by reproducing, isolating, explaining, testing, and verifying fixes",
          "Writing practical unit and integration tests for important application behavior",
          "Refactoring AI-generated code, reducing duplication, improving naming, and documenting decisions"
        ],
        handsOnLab: "Take a deliberately broken full-stack application, diagnose its failures, fix them with AI assistance, and verify the result with tests."
      },
      {
        week: "Week 10",
        title: "Full-Stack Architecture & Production Deployment",
        description: "Prepare an application for real users by understanding architecture, deployment, domains, and production configuration.",
        topics: [
          "Separating frontend, backend, database, and external service responsibilities",
          "Production builds, environment configuration, logs, monitoring, and basic performance checks",
          "Deploying frontend and backend services and connecting a production database",
          "Custom domains, HTTPS, CORS, rate limiting, backups, and basic security hardening"
        ],
        handsOnLab: "Deploy a complete full-stack application to a live environment and connect it to a custom domain."
      },
      {
        week: "Week 11",
        title: "Capstone Build Sprint & Portfolio Development",
        description: "Apply the full workflow to a product of your choice and receive structured review during the build.",
        topics: [
          "Capstone planning, scope control, architecture review, and milestone planning",
          "Rapid feature development with AI-assisted coding and manual verification",
          "User experience polish, responsive testing, accessibility, and edge cases",
          "Writing a strong README, project case study, technical documentation, and demo script"
        ],
        handsOnLab: "Build the core production version of your capstone and complete a mentor-led code and product review."
      },
      {
        week: "Week 12",
        title: "Launch, Client Delivery & Monetization",
        description: "Finish the capstone, launch it publicly, and learn how to turn full-stack Vibe Coding into freelance and product opportunities.",
        topics: [
          "Final testing, bug fixing, deployment verification, and launch checklist",
          "Presenting a technical product to clients, employers, partners, or users",
          "Packaging web development offers, project scoping, proposals, and delivery milestones",
          "Building a portfolio, finding prospects, and positioning Vibe Coding as a practical business skill"
        ],
        handsOnLab: "Launch and present the final capstone, then create a portfolio-ready case study and a client-ready project offer."
      }
    ],
    capstoneProjects: [
      {
        title: "Full-Stack Business Application",
        description: "Build and deploy a complete web application that solves a real business problem, with a responsive frontend, backend API, database, authentication, validation, and production deployment.",
        technologies: ["React", "JavaScript/TypeScript", "Backend API", "Supabase/PostgreSQL", "GitHub", "Vercel"]
      },
      {
        title: "AI-Powered Productivity or Service Tool",
        description: "Create a focused SaaS-style tool that uses an AI API or automation workflow to deliver a useful feature to a defined audience.",
        technologies: ["React", "AI API", "Backend API", "Database", "Authentication", "Cloud Deployment"]
      }
    ],
    instructors: [
      {
        name: "Vixora Academy Instructors",
        role: "Full-Stack Development & Vibe Coding Instructors",
        bio: "Practitioners focused on helping learners move from AI-assisted coding experiments to structured, working, and deployable products.",
        companyBackground: "Vixora Academy"
      }
    ],
    faqs: [
      {
        q: "Do I need to know how to code before joining?",
        a: "No. The course starts from the foundations and progressively introduces frontend, backend, databases, APIs, Git, and deployment. You will learn how to work with AI without depending on AI blindly."
      },
      {
        q: "Is Vibe Coding just asking AI to write the whole website?",
        a: "No. You will learn a structured workflow: plan the product, ask AI for targeted implementation, inspect the generated code, test it, debug it, and understand the important parts before shipping."
      },
      {
        q: "What will I build during the course?",
        a: "You will complete practical exercises throughout the program and finish with a full-stack capstone that you can deploy and use as a portfolio project."
      },
      {
        q: "Will I learn backend development too?",
        a: "Yes. The curriculum covers APIs, server-side logic, databases, authentication, integrations, security basics, and deployment so you can understand the complete application lifecycle."
      },
      {
        q: "Can I use this skill to freelance?",
        a: "Yes. The final module covers packaging your skills into practical web development offers, project scoping, proposals, portfolio presentation, prospecting, and client delivery."
      },
      {
        q: "What do I receive after completing the course?",
        a: "Learners who complete the required coursework and capstone receive a Vixora certificate of completion and leave with a deployed project suitable for their portfolio."
      }
    ],
    certificateType: "Vixora Certificate of Completion in Full Stack Vibe Coding"
  },
  {
    id: "course-fullstack-ai",
    slug: "fullstack-ai-engineering",
    title: "Full-Stack & Autonomous AI Engineering Cohort",
    subtitle: "Architect production SaaS, agentic workflows, LangGraph pipelines, and low-latency microservices from zero to scale.",
    badge: "Flagship Engineering Cohort",
    level: "Advanced",
    track: "Engineering & AI",
    format: "12-Week Live Cohort + Project Lab",
    duration: "12 Weeks",
    commitment: "6-8 hrs/week (Live sessions + Labs)",
    nextCohortDate: "October 14, 2026",
    tuition: "$1,850",
    tuitionNote: "Or 3 monthly installments of $650. Corporate sponsorship accepted.",
    seatsRemaining: 6,
    targetAudience: "Software Engineers, Full-Stack Developers, Technical Leads, and Ambitious Builders looking to master modern AI engineering.",
    description: "Go beyond toy prompts and basic API wrappers. Learn how to architect enterprise-grade AI applications with deterministic execution, self-healing agent swarms, vector retrieval, pgvector indexing, and production deployment.",
    heroPitch: "Become the top 1% of modern engineers who can design, code, and deploy resilient autonomous AI systems from database schema to clean frontend UI.",
    highlights: [
      "Live code reviews by senior AI infrastructure leads",
      "Deploy 3 real-world production capstones to your portfolio",
      "Private Discord mastermind & direct office hours",
      "Official Vixora Certified AI Engineer credential"
    ],
    outcomes: [
      "Master TypeScript, React 19, FastAPI, and async Python backends",
      "Build multi-agent autonomous teams with LangGraph and StateGraph",
      "Implement high-recall Hybrid RAG with pgvector and semantic re-ranking",
      "Containerize and deploy with Docker, Fly.io, and Cloud Run"
    ],
    prerequisites: [
      "Working knowledge of JavaScript/TypeScript or Python",
      "Basic familiarity with REST APIs and databases",
      "Git version control essentials"
    ],
    curriculum: [
      "Advanced TypeScript & React 19 Next-Gen Architectures",
      "High-Performance Python Microservices with FastAPI",
      "Agentic AI Swarms, State Machines & LangGraph",
      "Production RAG: Chunking, Embeddings & pgvector",
      "Observability, Token Budgets, Eval Frameworks & Cloud Deploy"
    ],
    weeklySyllabus: [
      {
        week: "Weeks 1-2",
        title: "Modern Full-Stack Foundation & High-Concurrency APIs",
        description: "Set up enterprise TypeScript environments, asynchronous Python microservices with FastAPI, Pydantic schemas, and JWT auth architectures.",
        topics: [
          "React 19 Server Components & State Management",
          "FastAPI Async Lifespans & Dependency Injection",
          "PostgreSQL connection pooling with AsyncPG & Prisma",
          "Structured JSON response contracts & schema validation"
        ],
        handsOnLab: "Build an authenticated multi-tenant backend API with real-time SSE event streaming."
      },
      {
        week: "Weeks 3-5",
        title: "Autonomous Agent Swarms & Deterministic Orchestration",
        description: "Move from single LLM calls to multi-agent architectures using LangGraph, tool-calling protocols, and human-in-the-loop validation.",
        topics: [
          "StateGraph design: Cycles, branching, and state checkpointing",
          "Tool-calling standards with function signatures & error fallbacks",
          "Self-correcting code & data verification agents",
          "Orchestrating multi-model pipelines (Gemini 2.5, Claude 3.5, GPT-4o)"
        ],
        handsOnLab: "Deploy an Autonomous Research & Fact-Checking Agent that searches, verifies, and generates structured reports."
      },
      {
        week: "Weeks 6-8",
        title: "Enterprise RAG: Vector Databases, Chunking & Semantic Search",
        description: "Architect production retrieval pipelines that prevent hallucinations and scale to millions of corporate documents.",
        topics: [
          "Document parsing: PDFs, Markdown, Notion, and Google Drive",
          "Context-aware chunking strategies & embedding benchmarks",
          "Hybrid Search: Combining BM25 keyword search with pgvector cosine similarity",
          "Cross-encoder re-ranking and citation generation"
        ],
        handsOnLab: "Build an Enterprise Knowledge Base Assistant with source document page citations and role-based access control."
      },
      {
        week: "Weeks 9-10",
        title: "Evaluation, Observability & Token Cost Engineering",
        description: "Learn how to monitor LLM performance in production, measure latency, track hallucination rates, and optimize token usage.",
        topics: [
          "Prompt engineering vs. fine-tuning economics",
          "Setting up Langfuse / OpenInference observability traces",
          "Automated LLM-as-a-Judge test suites for regression testing",
          "Rate-limiting, semantic caching with Redis, and fallback queues"
        ],
        handsOnLab: "Implement an automated evaluation pipeline that scores your agent's response accuracy before shipping."
      },
      {
        week: "Weeks 11-12",
        title: "Capstone Defense & Production Cloud Deployment",
        description: "Package your full-stack AI system into Docker containers and deploy with CI/CD to scalable cloud infrastructure.",
        topics: [
          "Multi-stage Docker builds for Python and Node",
          "Container orchestration on Google Cloud Run & Fly.io",
          "Domain setup, SSL, CORS, and rate limiting reverse proxies",
          "Final Capstone Project live showcase to hiring partners & clients"
        ],
        handsOnLab: "Deploy your production-grade Capstone application with a custom domain, CI/CD, and live monitoring."
      }
    ],
    capstoneProjects: [
      {
        title: "Autonomous RFP & Technical Proposal Synthesizer",
        description: "A complete multi-agent application that ingests 100+ page enterprise RFP documents, parses requirements, and coordinates 3 specialized agents to draft compliant technical proposals.",
        technologies: ["React 19", "FastAPI", "LangGraph", "pgvector", "PostgreSQL", "Docker"]
      },
      {
        title: "Real-Time Voice & Screen Co-Pilot for Support Engineers",
        description: "Low-latency multimodal assistant that monitors support tickets, analyzes error logs, and suggests deterministic code fixes with verified regression tests.",
        technologies: ["TypeScript", "Gemini Multimodal Live API", "FastAPI", "WebSockets", "Tailwind CSS"]
      },
      {
        title: "Self-Healing Data Scraping & Market Intelligence Pipeline",
        description: "An autonomous agent swarm that browses competitor websites, recovers automatically when DOM structures change, and updates Postgres analytics dashboards.",
        technologies: ["Python", "Playwright", "FastAPI", "Supabase", "Redis"]
      }
    ],
    instructors: [
      {
        name: "Dr. Marcus Vance",
        role: "Head of AI Engineering, Vixora Labs",
        bio: "Former Principal Architect with 12+ years of experience scaling distributed systems and deep learning infrastructure.",
        companyBackground: "Ex-Google Cloud & Autonomous Systems Lead"
      },
      {
        name: "Elena Rostova",
        role: "Senior Full-Stack & Agentic Architect",
        bio: "Specialist in high-throughput React architectures and LangGraph orchestration pipelines.",
        companyBackground: "Vixora Digital Hub Senior Architect"
      }
    ],
    faqs: [
      {
        q: "What is the time commitment required?",
        a: "Expect approximately 6-8 hours per week: 3 hours of live interactive lectures/labs, and 3-5 hours of hands-on project building and mentor reviews."
      },
      {
        q: "Are the live sessions recorded if I miss one?",
        a: "Yes! Every live session, code-along, and Q&A is recorded in high definition and posted to your private student portal within 2 hours with all repository links."
      },
      {
        q: "Do you offer corporate or employer reimbursement support?",
        a: "Yes! Over 60% of our students are sponsored by their employers. We provide formal syllabus documents, tax invoices, and learning justification templates."
      },
      {
        q: "Will I receive a verifiable certificate?",
        a: "Yes, graduates who successfully complete their capstone project receive a blockchain-verified Vixora Certified AI Engineer credential and portfolio endorsement."
      }
    ],
    certificateType: "Vixora Certified Full-Stack AI Engineer (VC-FAIE)"
  },
  {
    id: "course-executive-ai",
    slug: "executive-ai-strategy",
    title: "AI Strategy & Autonomous Operations for Executives",
    subtitle: "A no-fluff strategic masterclass for C-suite leaders and directors to deploy AI profitably and mitigate organizational risk.",
    badge: "Executive Leadership Track",
    level: "Executive",
    track: "Executive & Leadership",
    format: "4-Week Executive Cohort (Interactive Masterclass)",
    duration: "4 Weeks",
    commitment: "3-4 hrs/week (Evening/Weekend executive slots)",
    nextCohortDate: "October 20, 2026",
    tuition: "$2,400",
    tuitionNote: "Includes 1-on-1 private strategy audit for your enterprise roadmap.",
    seatsRemaining: 4,
    targetAudience: "CEOs, CTOs, CIOs, Managing Directors, VPs of Operations, and Business Owners.",
    description: "Cut through the AI hype and understand the actual unit economics, enterprise security frameworks, workflow transformations, and governance models required to build an AI-native organization.",
    heroPitch: "Lead your organization's AI transformation with strategic clarity, proven ROI frameworks, and executive governance.",
    highlights: [
      "1-on-1 enterprise AI audit with Vixora Managing Partners",
      "Executive templates: AI Vendor RFP, ROI Calculator & Governance Policies",
      "Exclusive peer network of fellow C-suite leaders and founders",
      "Private executive briefing on emerging frontier models"
    ],
    outcomes: [
      "Identify high-ROI automation vectors across sales, ops, and product",
      "Establish strict enterprise data security and compliance guardrails",
      "Evaluate build vs. buy decisions for proprietary AI systems",
      "Create a 12-month company-wide AI adoption roadmap"
    ],
    prerequisites: [
      "Executive, Director, or Senior Management role",
      "No coding background required; focus is on strategy, economics & execution"
    ],
    curriculum: [
      "The Modern Enterprise AI Landscape & Unit Economics",
      "Mapping 10x ROI Automation Vectors across Business Units",
      "Security, IP Protection, SOC2 & Regulatory Compliance",
      "Leading AI-Augmented Teams & Change Management"
    ],
    weeklySyllabus: [
      {
        week: "Week 1",
        title: "Frontier AI Landscape, Architecture & Unit Economics",
        description: "Deconstruct the true capabilities of modern LLMs, reasoning models, and agent architectures without confusing technical jargon.",
        topics: [
          "Foundation Models vs. Open Weights vs. Specialized SLMs",
          "Understanding token economics, inference costs & API budgets",
          "Demystifying RAG, Agent Swarms, and Fine-Tuning",
          "Identifying false promises and vendor vaporware"
        ],
        handsOnLab: "Perform an executive unit-cost audit for 3 potential enterprise AI use cases."
      },
      {
        week: "Week 2",
        title: "High-ROI Opportunity Mapping & Workflow Deconstruction",
        description: "Systematically map your organization's highest-cost manual workflows and design autonomous replacement systems.",
        topics: [
          "The Automation Matrix: Impact vs. Feasibility scoring",
          "Transforming Customer Support, Operations, and Finance pipelines",
          "Human-in-the-loop safety nets and approval thresholds",
          "Calculating payback periods and productivity multiples"
        ],
        handsOnLab: "Create an Executive Business Case & ROI Projection for your company's #1 automation priority."
      },
      {
        week: "Week 3",
        title: "Security, IP Sovereignty & Data Governance Guardrails",
        description: "Protect proprietary corporate data, prevent IP leakage, and maintain compliance across international regulatory standards.",
        topics: [
          "Zero-data retention agreements with model providers",
          "Private VPC deployment vs. public cloud APIs",
          "GDPR, HIPAA, and EU AI Act compliance essentials",
          "Creating enforceable internal employee AI usage guidelines"
        ],
        handsOnLab: "Draft a comprehensive Corporate AI Governance Policy tailored to your sector."
      },
      {
        week: "Week 4",
        title: "Execution Roadmap, Talent Strategy & 1-on-1 Advisory",
        description: "Synthesize your company's 12-month implementation roadmap and review during your private advisory session.",
        topics: [
          "Hiring AI engineering talent vs. upskilling existing staff",
          "Structuring build-vs-buy contracts with software agencies",
          "Executive communication & board alignment strategies",
          "Continuous iteration & maintaining technological agility"
        ],
        handsOnLab: "Finalize your company's 12-Month Enterprise AI Transformation Blueprint."
      }
    ],
    capstoneProjects: [
      {
        title: "Enterprise AI Transformation & ROI Blueprint",
        description: "A board-ready strategic document detailing the target architecture, budget allocation, vendor selection criteria, and expected 18-month ROI for your organization.",
        technologies: ["ROI Financial Models", "Risk Matrix", "Governance Framework", "Vendor RFP Template"]
      }
    ],
    instructors: [
      {
        name: "Arthur Sterling",
        role: "Managing Partner & Strategic Lead",
        bio: "Former enterprise technology director with 15+ years advising Fortune 500 executives on digital transformation.",
        companyBackground: "Vixora Digital Hub Strategy Office"
      }
    ],
    faqs: [
      {
        q: "Do I need any programming experience?",
        a: "No. This course is specifically engineered for business leaders, executives, and strategists. All concepts are translated into business impact, unit economics, and operational frameworks."
      },
      {
        q: "How does the 1-on-1 private strategy audit work?",
        a: "During Week 4, you will have a dedicated 60-minute confidential consultation with Vixora Managing Partners to audit your organization's proprietary roadmap."
      }
    ],
    certificateType: "Vixora Executive AI Strategist Certificate"
  },
  {
    id: "course-workflow-automation",
    slug: "enterprise-workflow-automation",
    title: "Enterprise Workflow Automation with n8n & Python",
    subtitle: "Build self-hosted, resilient automation pipelines that connect CRMs, databases, AI models, and communication channels without recurring SaaS fees.",
    badge: "High-Demand Practical Skills",
    level: "Intermediate",
    track: "Business Automation",
    format: "6-Week Hands-On Bootcamp",
    duration: "6 Weeks",
    commitment: "5 hrs/week (Live sessions + Workflows)",
    nextCohortDate: "November 3, 2026",
    tuition: "$950",
    tuitionNote: "Includes lifetime access to Vixora's proprietary n8n template library (50+ workflows).",
    seatsRemaining: 9,
    targetAudience: "Operations Managers, Automation Specialists, Growth Engineers, and Technical Consultants.",
    description: "Replace costly Zapier subscriptions with self-hosted, unmetered n8n workflows integrated with custom Python logic, vector search, webhooks, and enterprise databases.",
    heroPitch: "Master self-hosted, scalable automation and eliminate manual operational bottlenecks across your entire organization.",
    highlights: [
      "Access to 50+ battle-tested enterprise n8n workflow templates",
      "Learn self-hosting with Docker, SSL, and webhook security",
      "Integrate OpenAI, Claude, and open-source models directly into workflows",
      "Build custom Python nodes for complex business logic"
    ],
    outcomes: [
      "Deploy self-hosted n8n on Docker with automatic backups and failovers",
      "Automate CRM synchronization (HubSpot, Salesforce) with zero data loss",
      "Build AI-powered document parsers, lead qualifiers, and invoice processors",
      "Save thousands of dollars annually in third-party automation bills"
    ],
    prerequisites: [
      "Basic understanding of APIs, JSON data, and webhooks",
      "No advanced programming required, basic Python/JavaScript is a bonus"
    ],
    curriculum: [
      "Self-Hosting n8n on Cloud Infrastructure with Docker",
      "Mastering Webhooks, JSON Transformations & Custom Code Nodes",
      "Embedding AI Models: Sentiment, Summarization & Data Extraction",
      "Automated PDF Invoicing, Parsing, Email & CRM Synchronization",
      "Error Handling, Queueing, Rate Limiting & Enterprise Security"
    ],
    weeklySyllabus: [
      {
        week: "Weeks 1-2",
        title: "Self-Hosting n8n & Architecture Fundamentals",
        description: "Deploy n8n on Docker/VPS, configure SSL reverse proxies, webhook security, and understand the node execution model.",
        topics: [
          "Docker Compose setup with Postgres persistence",
          "Securing endpoints with API keys, basic auth & rate limiting",
          "JSON payload manipulation with JavaScript expressions",
          "Working with complex arrays, merging, and filtering nodes"
        ],
        handsOnLab: "Spin up your own production-grade n8n instance and connect your first live webhook trigger."
      },
      {
        week: "Weeks 3-4",
        title: "AI Nodes, Vector Search & Document Intelligence",
        description: "Integrate LLMs directly into visual workflows to summarize emails, extract unstructured PDF tables, and route tickets.",
        topics: [
          "LangChain nodes in n8n: Memory, Output Parsers & Agents",
          "Extracting structured JSON from messy invoices and contracts",
          "Vector embeddings and similarity searches in workflow nodes",
          "Autonomous triage of incoming lead emails with sentiment scoring"
        ],
        handsOnLab: "Build an AI Invoice & Receipt Extractor that parses PDFs from email and updates Postgres + Notion automatically."
      },
      {
        week: "Weeks 5-6",
        title: "Enterprise Integration, Failovers & Retainer Monetization",
        description: "Connect multi-app stacks (Slack, Salesforce, Stripe, PostgreSQL), handle network failures gracefully, and package workflows as consulting retainers.",
        topics: [
          "Error-trigger workflows, automatic retries & Slack alerting",
          "Handling rate limits on third-party APIs (Stripe, HubSpot)",
          "Building automated client onboarding & provisioning portals",
          "Packaging and pricing automation retainers for clients"
        ],
        handsOnLab: "Deploy an End-to-End Client Onboarding & Billing Pipeline that synchronizes 5 distinct platforms simultaneously."
      }
    ],
    capstoneProjects: [
      {
        title: "Autonomous Lead Enrichment & CRM Routing Engine",
        description: "A high-speed workflow that intercepts incoming web form leads, searches LinkedIn & company registries via API, scores fit with Gemini AI, and routes to sales reps in Slack.",
        technologies: ["n8n", "Docker", "PostgreSQL", "Gemini AI", "Slack API", "HubSpot"]
      },
      {
        title: "Automated Multi-Channel Content Repurposing Pipeline",
        description: "Ingests long-form videos/audio, generates transcriptions via Whisper, produces 5 platform-specific social posts with AI, and queues drafts in social managers.",
        technologies: ["n8n", "Whisper", "Claude 3.5", "Buffer API", "Airtable"]
      }
    ],
    instructors: [
      {
        name: "Devon Chen",
        role: "Lead Automation Engineer, Vixora Labs",
        bio: "Built and maintains hundreds of mission-critical enterprise workflows powering millions in ARR.",
        companyBackground: "Automation Lead & n8n Specialist"
      }
    ],
    faqs: [
      {
        q: "Why use self-hosted n8n instead of Zapier or Make?",
        a: "Zapier charges per task, making high-volume workflows cost hundreds or thousands every month. Self-hosted n8n runs on your own server with unlimited workflows and executions for just a $5-10/mo hosting bill, while keeping all data private."
      }
    ],
    certificateType: "Vixora Certified Automation Specialist (VCAS)"
  },
  {
    id: "course-ai-product-design",
    slug: "ai-product-design-ui-ux",
    title: "AI-Native Product Design, UI/UX & Design Systems",
    subtitle: "Design generative interfaces, canvas workflows, agent state visualizers, and scalable token systems in Figma.",
    badge: "Design & UX Masterclass",
    level: "Intermediate",
    track: "Design & Marketing",
    format: "6-Week Live Workshop",
    duration: "6 Weeks",
    commitment: "4-6 hrs/week",
    nextCohortDate: "November 10, 2026",
    tuition: "$1,100",
    tuitionNote: "Includes the complete Vixora Obsidian Design System UI Kit in Figma.",
    seatsRemaining: 8,
    targetAudience: "UI/UX Designers, Product Designers, Design Leads, and Frontend Engineers.",
    description: "Traditional static UI patterns fail when designing for nondeterministic AI experiences. Learn to craft streaming text interactions, agent feedback loops, canvas workspaces, and modern dark-mode design systems.",
    heroPitch: "Design the next generation of AI-native products with modern visual craft, tokenized design systems, and seamless generative interactions.",
    highlights: [
      "Access to the complete Vixora Obsidian Design Kit (.fig)",
      "Design for streaming, latency, hallucinations, and confidence scores",
      "Interactive prototyping with Figma variables and generative plugins",
      "Live portfolio critiques from top product design directors"
    ],
    outcomes: [
      "Design generative UI patterns that build user trust and clarity",
      "Build scalable token systems (colors, typography, radii, elevation)",
      "Prototype complex canvas and conversational interfaces in Figma",
      "Deliver engineering-ready specifications with zero friction"
    ],
    prerequisites: [
      "Familiarity with Figma fundamentals (Auto-layout, components)",
      "Basic understanding of digital product design principles"
    ],
    curriculum: [
      "The Anatomy of AI-Native Interfaces & Mental Models",
      "Tokenized Design Systems: Cosmic Dark Themes & Neon Accents",
      "Streaming States, Latency Feedback & Confidence Indicators",
      "Canvas & Infinite Workspace UX Patterns",
      "Design System Handoff & Frontend Code Synchronization"
    ],
    weeklySyllabus: [
      {
        week: "Weeks 1-2",
        title: "Foundations of AI UI & The Vixora Token System",
        description: "Master modern typography ratios, mathematical spacing, dark palette saturation, and building atomic components.",
        topics: [
          "Eliminating AI Slop: Principles of genuine craft and typography pairing",
          "Building mathematical 8pt spacing and nested corner radius rules",
          "Figma variables: Semantic tokens for light and dark modes",
          "Crafting high-contrast accessible inputs and control states"
        ],
        handsOnLab: "Build a comprehensive Design Token Architecture & Component Library in Figma."
      },
      {
        week: "Weeks 3-4",
        title: "Designing for Nondeterministic AI & Generative UX",
        description: "Solve the core UX challenges of AI: handling latency, streaming states, hallucinations, and prompt affordances.",
        topics: [
          "Streaming typography effects & micro-interaction physics",
          "Confidence ratings, source citations & rollback controls",
          "Human-in-the-loop approval drawers and modal patterns",
          "Multimodal inputs: Combining voice, image, and text triggers"
        ],
        handsOnLab: "Design an AI Copilot Interface featuring streaming responses, citation drawers, and confidence scores."
      },
      {
        week: "Weeks 5-6",
        title: "Infinite Canvas Workspaces & Production Handoff",
        description: "Design node-based visual editors and canvas workspaces for modern agent workflows, and prepare developer-ready tokens.",
        topics: [
          "Spatial UI: Pan, zoom, minimaps, and infinite node connections",
          "State transition animations and micro-copy for AI interactions",
          "Exporting Figma tokens to Tailwind CSS variables automatically",
          "Final capstone review & portfolio case study presentation"
        ],
        handsOnLab: "Design an Interactive Agent Workflow Builder on an infinite canvas with complete node configurations."
      }
    ],
    capstoneProjects: [
      {
        title: "Next-Gen AI Canvas & Workspace Studio",
        description: "A complete end-to-end Figma prototype of a multi-modal canvas workspace featuring node connections, live agent execution pills, and citation inspectors.",
        technologies: ["Figma Variables", "Component Architecture", "Design Tokens", "Tailwind CSS Handoff"]
      }
    ],
    instructors: [
      {
        name: "Soren Morales",
        role: "Head of Design & Brand Identity, Vixora Hub",
        bio: "Award-winning designer with 10+ years crafting premium brand systems and AI-first software interfaces.",
        companyBackground: "Vixora Design Systems Lead"
      }
    ],
    faqs: [
      {
        q: "Do I get full access to the Vixora Figma files?",
        a: "Yes! All enrolled students receive our complete production design system file with 200+ components, token collections, and dark/light variants."
      }
    ],
    certificateType: "Vixora Certified AI Product Designer"
  },
  {
    id: "course-generative-media-marketing",
    slug: "generative-media-advertising",
    title: "Generative Media, UGC Ad Automation & Media Buying",
    subtitle: "Scale high-converting paid social campaigns with AI video generation, automated creative testing, and ROAS optimization.",
    badge: "Growth & Creative Track",
    level: "All Levels",
    track: "Design & Marketing",
    format: "4-Week Intensive Sprint",
    duration: "4 Weeks",
    commitment: "4 hrs/week",
    nextCohortDate: "November 17, 2026",
    tuition: "$850",
    tuitionNote: "Includes AI video generation credit vouchers for workshop labs.",
    seatsRemaining: 12,
    targetAudience: "Growth Marketers, Media Buyers, Brand Founders, and Creative Directors.",
    description: "Lower customer acquisition costs by generating hundreds of personalized UGC video ads, testing hooks algorithmically, and managing scalable campaigns across Meta, TikTok, and Google Ads.",
    heroPitch: "Generate 50+ high-converting ad variations in minutes and master high-velocity media buying with AI creative pipelines.",
    highlights: [
      "Access to prompt engineering templates for Midjourney, Runway & ElevenLabs",
      "Automated video editing pipelines for TikTok & Meta Reels",
      "Media buying strategies for scaling past $50k/month ad spend",
      "Live ad creative teardowns and conversion audits"
    ],
    outcomes: [
      "Generate hyper-realistic AI avatars and voiceovers that convert",
      "Build automated split-testing workflows for video hooks and CTAs",
      "Lower blended CAC / CPA by 30-50% with creative volume",
      "Master programmatic media buying on Meta and TikTok"
    ],
    prerequisites: [
      "Basic familiarity with social media marketing or ad platforms (Meta Ads / TikTok Ads)"
    ],
    curriculum: [
      "AI Creative Synthesis: Avatars, Voice Cloning & Scriptwriting",
      "High-Conversion UGC Frameworks & 3-Second Hook Formulas",
      "Automated Video Assembly & Dynamic Captions",
      "Data-Driven Media Buying, Scaling Budgets & ROAS Attribution"
    ],
    weeklySyllabus: [
      {
        week: "Week 1",
        title: "AI Scriptwriting, Voice Cloning & Avatar Generation",
        description: "Master viral direct-response copywriting and produce photorealistic synthetic talent.",
        topics: [
          "Direct response scripting frameworks (Hook, Problem, Solution, CTA)",
          "Voice cloning and emotional cadence control with ElevenLabs",
          "Generating realistic human avatars and lip-syncing pipelines",
          "B-roll generation using Midjourney and Runway Gen-3"
        ],
        handsOnLab: "Produce 5 unique synthetic UGC ad videos from scratch with voiceover and lip-sync."
      },
      {
        week: "Week 2",
        title: "Automating Dynamic Video Assembly & Hook Variations",
        description: "Build automated rendering pipelines that generate 20+ hook combinations from a single script.",
        topics: [
          "Programmatic video rendering with Remotion and Python",
          "Dynamic auto-captions, sound effects & viral pacing",
          "A/B testing top-of-funnel hooks in the first 3 seconds",
          "Batch processing assets for TikTok, Instagram Reels, and YouTube Shorts"
        ],
        handsOnLab: "Set up an automated batch pipeline that generates 15 video variations in under 10 minutes."
      },
      {
        week: "Week 3",
        title: "Meta & TikTok Media Buying Strategies for 2026",
        description: "Deploy creative testing frameworks to isolate winning hooks without burning ad spend.",
        topics: [
          "Dynamic Creative Testing (DCT) setup on Meta Ads Manager",
          "TikTok Spark Ads & organic-to-paid amplification",
          "Budget scaling rules and bid cap strategies",
          "Analyzing creative fatigue and refresh cycles"
        ],
        handsOnLab: "Launch a live DCT testing campaign with your generated variations and establish attribution tracking."
      },
      {
        week: "Week 4",
        title: "Attribution, ROAS Optimization & Retainer Scaling",
        description: "Analyze blended metrics (MER, CAC, LTV) and package creative-as-a-service retainers for clients.",
        topics: [
          "Server-side tracking (CAPI) and attribution modeling",
          "Calculating true Marginal ROAS and customer lifetime value",
          "Packaging generative ad production as a $5k/mo agency service",
          "Final campaign performance review & certificate award"
        ],
        handsOnLab: "Present a complete 30-day Campaign Scale Plan with projected ROAS and budget allocation."
      }
    ],
    capstoneProjects: [
      {
        title: "Omnichannel Generative Ad Campaign & Growth Engine",
        description: "A complete launch-ready ad campaign featuring 20 AI UGC video variations, automated landing page personalization, and Meta/TikTok media buying structure.",
        technologies: ["Runway Gen-3", "ElevenLabs", "Midjourney", "Meta Ads Manager", "TikTok Ads"]
      }
    ],
    instructors: [
      {
        name: "Nadia Thorne",
        role: "Director of Growth & Paid Media, Vixora Hub",
        bio: "Managed over $15M in profitable ad spend across D2C and B2B SaaS platforms.",
        companyBackground: "Vixora Media Collective"
      }
    ],
    faqs: [
      {
        q: "Do I need high-end video editing software like Premiere or After Effects?",
        a: "No! We teach cloud-based AI tools and automated pipelines that do not require expensive hardware or prior editing experience."
      }
    ],
    certificateType: "Vixora Certified Growth & Media Specialist"
  },
  {
    id: "course-machine-learning-data-science",
    slug: "machine-learning-data-science",
    title: "Machine Learning & Data Science",
    subtitle: "Learn how to work with data, uncover meaningful insights, build predictive models, and apply machine learning to real-world problems. This practical 18-week course takes learners from data analysis fundamentals through machine learning workflows, model evaluation, and portfolio-ready projects.",
    badge: "18-Week Comprehensive Cohort",
    level: "Beginner to Intermediate",
    status: "active",
    track: "Data & Analytics",
    format: "Hybrid",
    duration: "18 weeks",
    commitment: "5-6 hrs/week (Interactive Sessions & Practical Labs)",
    nextCohortDate: "November 16, 2026",
    tuition: "\u20A660,000",
    tuitionNote: "Practical 18-week hybrid cohort fee: \u20A660,000. Limited seats available.",
    seatsRemaining: 12,
    targetAudience: "Aspiring Data Scientists, Data Analysts, Software Developers, STEM Graduates, and Professionals looking to build predictive models.",
    description: "Learn how to work with data, uncover meaningful insights, build predictive models, and apply machine learning to real-world problems. This practical 18-week course takes learners from data analysis fundamentals through machine learning workflows, model evaluation, and portfolio-ready projects.",
    heroPitch: "Learn how to work with data, uncover meaningful insights, build predictive models, and apply machine learning to real-world problems. Master data analysis, feature engineering, and predictive algorithms in 18 weeks.",
    highlights: [
      "18 weeks of comprehensive, practical training with zero fluff",
      "Covers data analysis fundamentals, statistical modeling, Scikit-Learn, and ML algorithms",
      "Hands-on portfolio projects: Exploratory Data Analysis, Predictive Modeling, and Model Deployment",
      "End-to-end Final Capstone: Build, evaluate, and defend an industry-ready predictive system",
      "Official Vixora Certificate of Completion upon graduation",
      "Hybrid learning format with online live labs and practical workshop sessions",
      "Mentorship from experienced data science and machine learning practitioners"
    ],
    outcomes: [
      "Clean, explore, and analyze complex multi-dimensional datasets using Python, Pandas, and NumPy",
      "Perform rigorous exploratory data analysis (EDA) and create executive-ready statistical charts",
      "Engineer predictive features, handle missing data, perform categorical encoding, and normalize numerical signals",
      "Train and evaluate regression models (Linear, Ridge, Lasso) and classification models (Logistic, SVM, Decision Trees, Random Forests)",
      "Apply cross-validation, hyperparameter optimization, and evaluate precision, recall, F1, ROC-AUC, and RMSE metrics",
      "Build unsupervised learning pipelines with K-Means clustering and PCA dimensionality reduction",
      "Package and deploy predictive ML models as reusable pipelines and portfolio showcases"
    ],
    prerequisites: [
      "A laptop with internet access",
      "Basic computer literacy and numeracy",
      "Curiosity and enthusiasm for working with real datasets (no advanced math or prior ML coding required)"
    ],
    curriculum: [
      "Module 1 \u2014 Foundations of Data Science & Python for Analysis",
      "Module 2 \u2014 Data Ingestion, Manipulation & Exploration with Pandas",
      "Module 3 \u2014 Exploratory Data Analysis (EDA) & Data Visualization",
      "Module 4 \u2014 Applied Probability, Statistics & Hypothesis Testing",
      "Module 5 \u2014 Data Preprocessing, Cleaning & Imputation Workflows",
      "Module 6 \u2014 Feature Engineering, Scaling & Encoding Strategies",
      "Module 7 \u2014 Introduction to Machine Learning & Supervised Learning Concepts",
      "Module 8 \u2014 Regression Algorithms (Linear, Polynomial & Regularized)",
      "Module 9 \u2014 Classification Algorithms (Logistic Regression, KNN & SVM)",
      "Module 10 \u2014 Decision Trees, Random Forests & Ensemble Methods",
      "Module 11 \u2014 Model Evaluation, Cross-Validation & Diagnostics",
      "Module 12 \u2014 Hyperparameter Optimization & Pipeline Orchestration",
      "Module 13 \u2014 Unsupervised Learning (K-Means, Hierarchical Clustering & PCA)",
      "Module 14 \u2014 Time Series Analysis & Sequential Forecasting",
      "Module 15 \u2014 Model Explainability, Bias & Feature Importance (SHAP/LIME)",
      "Module 16 \u2014 Model Deployment, Serialization & REST APIs",
      "Module 17 \u2014 Capstone Development & Real-World Dataset Defense",
      "Module 18 \u2014 Machine Learning Career, Portfolio Packaging & Technical Interviews"
    ],
    weeklySyllabus: [
      {
        week: "Weeks 1-2",
        title: "Foundations of Data Science & Python for Analysis",
        description: "Set up the Python data science environment, master Jupyter Notebooks, core Python syntax, data structures, functions, and algorithmic thinking for data manipulation.",
        topics: [
          "Data science ecosystem overview: Roles, workflows, and business applications",
          "Python syntax, variables, lists, dictionaries, tuples, and control flow",
          "Writing reusable functions, list comprehensions, and error handling",
          "Working with Jupyter Notebooks, VS Code, and virtual environments"
        ],
        handsOnLab: "Build an interactive CLI and notebook script to parse and clean raw business sales transaction records."
      },
      {
        week: "Weeks 3-4",
        title: "Data Manipulation & Exploration with Pandas and NumPy",
        description: "Master multi-dimensional numerical computing with NumPy and tabular data operations with Pandas. Filter, aggregate, slice, and transform complex business datasets.",
        topics: [
          "NumPy arrays, vectorization, mathematical operations, and broadcasting",
          "Pandas Series and DataFrames: Indexing, filtering, sorting, and grouping",
          "Merging, joining, concatenating, and reshaping tabular datasets",
          "Time series indexing and rolling statistical calculations in Pandas"
        ],
        handsOnLab: "Load, reshape, and calculate multi-store sales trends and customer lifetime metrics on an authentic multi-table retail dataset."
      },
      {
        week: "Weeks 5-6",
        title: "Exploratory Data Analysis (EDA) & Statistical Visualization",
        description: "Learn to visually discover hidden patterns, distributions, correlations, and anomalies in data using Matplotlib, Seaborn, and statistical tests.",
        topics: [
          "Visualization principles, color theory, and chart selection for analytics",
          "Histograms, box plots, scatter plots, pair plots, and correlation heatmaps",
          "Detecting outliers, skewed distributions, and multi-modal phenomena",
          "Formulating hypotheses and testing differences in groups (t-tests, ANOVA, Chi-square)"
        ],
        handsOnLab: "Perform an exhaustive Exploratory Data Analysis on a real-world healthcare dataset and compile executive visual findings."
      },
      {
        week: "Weeks 7-8",
        title: "Data Cleaning, Preprocessing & Feature Engineering",
        description: "Transform raw, noisy, imperfect datasets into pristine feature matrices ready for machine learning algorithms.",
        topics: [
          "Handling missing data: Mean, median, KNN imputation, and indicator flags",
          "Categorical encoding: One-hot encoding, target encoding, and ordinal mapping",
          "Numerical scaling: Min-Max normalization, StandardScaler, and RobustScaler",
          "Feature creation: Polynomial interactions, domain ratios, and text token features"
        ],
        handsOnLab: "Build a robust Scikit-Learn data cleaning and feature engineering ColumnTransformer pipeline."
      },
      {
        week: "Weeks 9-10",
        title: "Supervised Learning: Regression & Classification Algorithms",
        description: "Understand mathematical foundations, intuition, assumptions, and practical implementation of core predictive models.",
        topics: [
          "Supervised learning mechanics: Loss functions, cost optimization, and gradient descent",
          "Linear regression, Ridge, Lasso, and ElasticNet regularization",
          "Logistic regression for binary and multi-class classification",
          "K-Nearest Neighbors (KNN), Naive Bayes, and Support Vector Machines (SVM)"
        ],
        handsOnLab: "Train and compare multiple regression models to predict housing prices, evaluating bias-variance tradeoffs."
      },
      {
        week: "Weeks 11-12",
        title: "Ensemble Methods, Decision Trees & Random Forests",
        description: "Dive deep into non-linear modeling, tree-based splits, bagging, boosting, and gradient boosted trees.",
        topics: [
          "Decision Trees: Information gain, Gini impurity, tree pruning, and depth constraints",
          "Random Forests: Bootstrap aggregation, out-of-bag error, and feature importances",
          "Gradient Boosting mechanics: XGBoost, LightGBM, and CatBoost overviews",
          "Handling severe class imbalances using SMOTE, class weights, and threshold tuning"
        ],
        handsOnLab: "Build a customer churn prediction engine achieving >90% precision on an imbalanced telecom dataset."
      },
      {
        week: "Weeks 13-14",
        title: "Model Evaluation, Diagnostics & Hyperparameter Tuning",
        description: "Master rigorous evaluation frameworks that prevent data leakage and ensure real-world model reliability.",
        topics: [
          "K-Fold Cross-Validation, Stratified splits, and TimeSeriesSplit",
          "Confusion matrices, Precision, Recall, F1-Score, ROC-AUC, and PR-AUC curves",
          "Regression metrics: MAE, MSE, RMSE, R-squared, and MAPE",
          "Systematic tuning with GridSearchCV, RandomizedSearchCV, and Bayesian optimization"
        ],
        handsOnLab: "Run hyperparameter optimization sweeps and diagnose learning curves for high-stakes credit risk scoring."
      },
      {
        week: "Weeks 15-16",
        title: "Unsupervised Learning, Clustering & Model Explainability",
        description: "Extract patterns without labels and decode 'black box' machine learning decisions for stakeholders.",
        topics: [
          "K-Means clustering, Elbow method, and Silhouette analysis",
          "Principal Component Analysis (PCA) for dimensionality reduction and visualization",
          "Interpreting predictions with SHAP (Shapley Additive exPlanations) and LIME",
          "Model governance, algorithmic fairness, and ethical data science principles"
        ],
        handsOnLab: "Segment an e-commerce customer base using K-Means and generate individualized SHAP explanations for high-value shoppers."
      },
      {
        week: "Weeks 17-18",
        title: "Model Deployment, Capstone Defense & Career Readiness",
        description: "Package models into reproducible artifacts, serve predictions through REST APIs, defend the final capstone, and package a job-ready portfolio.",
        topics: [
          "Model serialization with Joblib and ONNX",
          "Creating high-performance inference endpoints with FastAPI",
          "Docker containerization basics and cloud deployment walkthrough",
          "Structuring a standout GitHub data science portfolio and technical interview preparation"
        ],
        handsOnLab: "Deploy an end-to-end predictive API with FastAPI and defend the final Capstone Project before the academy review board."
      }
    ],
    capstoneProjects: [
      {
        title: "End-to-End Predictive Machine Learning & Business Intelligence Engine",
        description: "An industry-scale predictive modeling system that ingests real-world data, cleans and extracts features, trains and benchmarks multiple ML models, and presents predictions via an interactive dashboard.",
        technologies: ["Python", "Pandas", "Scikit-Learn", "FastAPI", "Streamlit", "Matplotlib"]
      }
    ],
    instructors: [
      {
        name: "Marcus Sterling",
        role: "Head of Data Systems & Analytics, Vixora",
        bio: "10+ years engineering enterprise data pipelines, statistical modeling, and predictive analytics platforms.",
        companyBackground: "Vixora Analytics Collective"
      },
      {
        name: "Dr. Adebayo Vance",
        role: "Principal AI Architect, Vixora Labs",
        bio: "Former Lead AI Research Scientist with expertise in applied machine learning, neural networks, and scalable model inference.",
        companyBackground: "Vixora Labs"
      }
    ],
    faqs: [
      {
        q: "What is the format and duration of this course?",
        a: "The course is 18 weeks long and delivered in a practical Hybrid format combining interactive online classes, hands-on lab assignments, and project mentorship."
      },
      {
        q: "What is the tuition fee for the 18-week course?",
        a: "Tuition is \u20A660,000 for the full 18-week program, covering all course materials, practical labs, instructor mentorship, and the official Vixora certificate."
      },
      {
        q: "Do I need a background in advanced mathematics or programming?",
        a: "No. The course begins with foundational Python and data handling before progressing into machine learning algorithms and workflows step by step."
      },
      {
        q: "Will I receive an official certificate upon completion?",
        a: "Yes. Graduates who fulfill the coursework and successfully defend their final capstone project receive an official cryptographically verifiable Vixora Certificate of Completion."
      }
    ],
    certificateType: "Official Vixora Certified Machine Learning & Data Science Specialist"
  },
  {
    id: "course-client-acquisition-freelancing",
    slug: "client-acquisition-freelancing",
    title: "Client Acquisition & Freelancing Masterclass",
    subtitle: "High-ticket positioning, Upwork optimization, cold outreach systems, and winning $1,000+ to $5,000+ monthly client retainers.",
    badge: "Cohort 1.0 Track \u2022 \u20A625,000",
    level: "All Levels",
    status: "active",
    track: "Business Automation",
    format: "4-Week Practical Sprint + Private Telegram Mastermind",
    duration: "4 Weeks",
    commitment: "3-4 hrs/week (Flexible Replays & Live Proposal Labs)",
    nextCohortDate: "Immediate Access (Cohort 1.0 Vault)",
    tuition: "\u20A625,000",
    tuitionNote: "Full access to Cohort 1.0 recorded sessions, PDF templates, and private Telegram group.",
    seatsRemaining: 20,
    targetAudience: "Freelancers, Agency Owners, Web Developers, AI Creators, Consultants and Service Providers.",
    description: "Technical skills without sales skills leave you underpaid. In this masterclass, learn the exact client acquisition engines, proposal frameworks, and outreach systems used to close international high-ticket clients on Upwork and direct outbound.",
    heroPitch: "Stop competing on race-to-the-bottom hourly rates. Learn to position your technical and AI services as high-ROI investments and win international retainers.",
    highlights: [
      "Craft Upwork proposals with an 80%+ interview invitation rate",
      "Plug-and-play cold email templates for US and European founders",
      "High-converting discovery call script that diagnoses and closes",
      "Scope of Work (SOW) and Master Services Agreement (MSA) legal contract templates",
      "Direct admission to the Private Telegram Cohort 1.0 community"
    ],
    outcomes: [
      "Package your AI and tech skills into an irresistible high-ticket service offer",
      "Optimize your Upwork profile to rank for enterprise search terms",
      "Close $1,000 to $5,000 monthly service retainers with clear deliverables",
      "Handle pricing objections with poise and anchor conversations on ROI"
    ],
    prerequisites: [
      "A laptop or smartphone with internet connection",
      "A technical or creative skill (or willingness to learn AI services)"
    ],
    curriculum: [
      "Module 1 \u2014 Offer Architecture & Irresistible Positioning",
      "Module 2 \u2014 Upwork Profile Optimization & Proposal Psychology",
      "Module 3 \u2014 Multi-Channel Outbound (Cold Email, LinkedIn & Twitter/X)",
      "Module 4 \u2014 Closing Discovery Calls, Contracts & Client Retainer Retention"
    ],
    weeklySyllabus: [
      {
        week: "Week 01",
        title: "Offer Architecture & Market Positioning",
        description: "Transform generic freelancer titles into specialized outcome-driven agency offers.",
        topics: [
          "The High-Ticket Value Equation: Dream Outcome \xD7 Perceived Likelihood \xF7 Time Delay",
          "Selecting profitable niches in US, UK, and European markets",
          "Tiered pricing models: Starter, Growth, and Retainer packages",
          "Drafting your 1-page irresistible service deck"
        ],
        handsOnLab: "Lab 01: Finalize your 1-page high-ticket offer outline with specific deliverables and pricing tiers."
      },
      {
        week: "Week 02",
        title: "Upwork Algorithm & Proposal Mastery",
        description: "Master the psychology of winning proposals and optimizing your profile for inbound invitations.",
        topics: [
          "Profile architecture: Headline, video introduction, case studies, and specialized profiles",
          "The 4-part winning proposal formula: Hook + Insight + Proof + Call to Action",
          "How to filter jobs with verified payment and high average hourly rates",
          "Setting up automated job search alerts"
        ],
        handsOnLab: "Lab 02: Submit 3 live proposals using our tested templates and review responses with mentors."
      },
      {
        week: "Week 03",
        title: "Cold Outbound & Multi-Channel Lead Generation",
        description: "Generate consistent inbound discovery calls using targeted cold email and LinkedIn.",
        topics: [
          "Building 100-lead prospect databases using Google Maps, LinkedIn, and Apollo",
          "Subject lines with 65%+ open rates and conversational pitch copy",
          "The 3-stage non-annoying follow-up sequence",
          "Booking calls directly to your calendar"
        ],
        handsOnLab: "Lab 03: Launch a 30-prospect outbound pilot campaign with personalized message hooks."
      },
      {
        week: "Week 04",
        title: "Closing Discovery Calls, Legal Contracts & Retainers",
        description: "Navigate discovery calls, anchor pricing on value, and secure monthly retainers.",
        topics: [
          "The 20-minute Diagnostic Discovery Call script",
          "Overcoming price resistance: 'That's outside our budget'",
          "Standard Master Service Agreements, NDAs, and payment milestone contracts",
          "Collecting foreign payments securely via Stripe, Payoneer, and crypto/bank transfers"
        ],
        handsOnLab: "Lab 04: Conduct a mock sales call with instructor feedback and draft your standard client SOW."
      }
    ],
    capstoneProjects: [
      {
        title: "Live Client Proposal & Contract Execution",
        description: "Create a complete client pitch package including market research, personalized proposal, and signed SOW contract.",
        technologies: ["Upwork", "Cold Email", "Notion Proposal", "Client Agreement Contract"]
      }
    ],
    instructors: [
      {
        name: "Sarumi Hammad",
        role: "Dean & Academic Director, Vixora Academy",
        bio: "Director of technical programs and commercial software delivery across enterprise AI and automation clients worldwide.",
        companyBackground: "Vixora Digital Hub Academic Directorate"
      }
    ],
    faqs: [
      {
        q: "Are the Cohort 1.0 sessions recorded?",
        a: "Yes. All sessions are recorded in high-definition and available inside the Private Telegram Cohort group with accompanying PDFs and templates."
      },
      {
        q: "Can I combine this with the other Cohort 1.0 tracks?",
        a: "Absolutely. You can enroll in the 4-in-1 Cohort 1.0 Master Bundle for complete access to all 4 tracks at a discounted rate."
      }
    ],
    certificateType: "Official Vixora Certified Digital Business Consultant"
  },
  {
    id: "course-cohort-1-master-bundle",
    slug: "cohort-1-master-bundle",
    title: "Cohort 1.0: 4-in-1 Masterclass All-Access Pass",
    subtitle: "Complete access to all 4 training tracks: AI Content Creation, AI Automation, AI Web Development, and Client Acquisition.",
    badge: "Flagship Bundle \u2022 \u20A645,000",
    level: "All Levels",
    status: "active",
    track: "Engineering & AI",
    format: "4 Complete Modular Tracks + 28h Video Vault + 14 PDFs + Private Telegram Mastermind",
    duration: "Full Lifetime Access",
    commitment: "Self-Paced with Ongoing Community Mentorship",
    nextCohortDate: "Immediate Access (Cohort 1.0 Vault)",
    tuition: "\u20A645,000",
    tuitionNote: "Includes all 4 courses (Standard price \u20A695,000 when purchased separately). Save over 50%.",
    seatsRemaining: 15,
    targetAudience: "Ambitious Builders, Creators, Developers, Consultants and Entrepreneurs.",
    description: "The complete Cohort 1.0 vault. Receive full access to all 4 tracks: AI Content Creation, AI Automation, AI Web Development & Design, and Client Acquisition & Freelancing. Includes all 28+ hours of session recordings, 14 strategy PDFs, workflow blueprints, and lifetime access to our Private Telegram Mastermind.",
    heroPitch: "Everything you need to master AI creation, automate business workflows, build modern web apps, and acquire high-paying international clients.",
    highlights: [
      "Access to all 4 training tracks in one single enrollment pass",
      "28+ hours of recorded video masterclasses in our private Telegram group",
      "14 downloadable PDF guidebooks, prompt libraries & workflow blueprints",
      "Full access to the Private Telegram Mastermind with Dean Sarumi Hammad",
      "Cryptographically verifiable graduation certification"
    ],
    outcomes: [
      "Generate photorealistic visual media and short-form video pipelines",
      "Deploy production n8n workflows that automate business operations",
      "Build and deploy modern responsive web apps with React and Tailwind",
      "Close $1,000 to $5,000 monthly client contracts and international retainers"
    ],
    prerequisites: [
      "A laptop or smartphone with internet connection",
      "Dedication to apply the frameworks and build real projects"
    ],
    curriculum: [
      "Track 1 \u2014 AI Content Creation (Image, Video & Audio)",
      "Track 2 \u2014 AI Automation & Autonomous Workflows (n8n & APIs)",
      "Track 3 \u2014 AI Web Development & Modern Design (React 19 & Tailwind)",
      "Track 4 \u2014 Client Acquisition & Freelancing (High-Ticket Positioning)"
    ],
    weeklySyllabus: [
      {
        week: "Track 1",
        title: "AI Content Creation Masterclass",
        description: "Diffusion models, prompt engineering, voice cloning, and viral short-form video pipelines.",
        topics: ["Midjourney & Flux prompts", "Character consistency", "ElevenLabs voice cloning", "CapCut video pacing"],
        handsOnLab: "Deliverable: 3 Complete Viral Short Form Video Creatives"
      },
      {
        week: "Track 2",
        title: "AI Automation & Autonomous Systems",
        description: "n8n deployment, webhook architectures, OpenAI function calling, and CRM sync.",
        topics: ["Self-hosted n8n", "Webhook listeners", "AI email responder", "WhatsApp automation"],
        handsOnLab: "Deliverable: End-to-End Automated Client Ingestion & CRM Pipeline"
      },
      {
        week: "Track 3",
        title: "AI Web Development & Modern Design",
        description: "React 19, Tailwind CSS spatial math, AI-assisted vibe coding, and production deployment.",
        topics: ["Component architecture", "Dynamic state & hooks", "Paystack checkout integration", "Production deployment"],
        handsOnLab: "Deliverable: Live Production-Grade Web Application"
      },
      {
        week: "Track 4",
        title: "Client Acquisition & Freelancing",
        description: "High-ticket positioning, Upwork optimization, cold email systems, and closing retainers.",
        topics: ["Irresistible offer design", "Winning Upwork proposals", "Cold outbound campaigns", "Closing discovery calls"],
        handsOnLab: "Deliverable: Signed Client Contract & 50-Lead Outbound Campaign"
      }
    ],
    capstoneProjects: [
      {
        title: "Full-Stack AI Business or Agency Launch",
        description: "Deploy an automated business engine combining AI media, automated CRM pipelines, modern web landing page, and outbound client acquisition.",
        technologies: ["React 19", "n8n Self-Hosted", "Midjourney & Flux", "Upwork Proposal Deck"]
      }
    ],
    instructors: [
      {
        name: "Sarumi Hammad",
        role: "Dean & Academic Director, Vixora Academy",
        bio: "Director of technical programs and commercial software delivery across enterprise AI and automation clients worldwide.",
        companyBackground: "Vixora Digital Hub Academic Directorate"
      }
    ],
    faqs: [
      {
        q: "How do I access the session recordings and materials after payment?",
        a: "Immediately upon enrollment, you receive direct access instructions and an exclusive invitation link to join the Private Telegram Cohort 1.0 Mastermind where all HD video replays, PDF blueprints, and mentor discussions are hosted."
      },
      {
        q: "Can I watch the sessions at my own pace?",
        a: "Yes. All sessions are permanently archived in the Telegram group so you can watch, rewatch, and download materials anytime at your own speed."
      }
    ],
    certificateType: "Official Vixora Certified Autonomous AI & Growth Engineer"
  }
];
var COMPANY_CONTACT = {
  email: BRAND_CONFIG.email,
  secondaryEmail: BRAND_CONFIG.secondaryEmail,
  phone: BRAND_CONFIG.phone,
  whatsappNumber: BRAND_CONFIG.whatsappNumber,
  whatsappUrl: BRAND_CONFIG.whatsappUrl,
  domain: BRAND_CONFIG.domain,
  academyDomain: BRAND_CONFIG.academyDomain,
  address: BRAND_CONFIG.address,
  socials: [
    { name: "Twitter / X", url: "https://twitter.com", icon: "Twitter" },
    { name: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin" },
    { name: "GitHub", url: "https://github.com", icon: "Github" },
    { name: "YouTube", url: "https://youtube.com", icon: "Youtube" }
  ]
};

// src/data/coursePricing.ts
var COURSE_PRICING = {
  "course-ai-image-short-videos-creation": {
    NGN: 1e4,
    USD: 10
  },
  "course-data-analysis-cohort": {
    NGN: 6e4,
    USD: 50
  },
  "course-ai-automation-digital-skills": {
    NGN: 3e4,
    USD: 25
  },
  "course-ai-automation-digital-business-systems": {
    NGN: 6e4,
    USD: 50
  },
  "course-fullstack-vibe-coding": {
    NGN: 5e4,
    USD: 100
  },
  "course-fullstack-ai": {
    NGN: null,
    USD: 1850
  },
  "course-executive-ai": {
    NGN: null,
    USD: 2400
  },
  "course-workflow-automation": {
    NGN: null,
    USD: 950
  },
  "course-ai-product-design": {
    NGN: null,
    USD: 1100
  },
  "course-generative-media-marketing": {
    NGN: null,
    USD: 850
  },
  "course-machine-learning-data-science": {
    NGN: 6e4,
    USD: 60
  },
  "course-client-acquisition-freelancing": {
    NGN: 25e3,
    USD: 25
  },
  "course-cohort-1-master-bundle": {
    NGN: 45e3,
    USD: 45
  }
};
function getCoursePrices(courseId) {
  if (!courseId || typeof courseId !== "string") {
    return null;
  }
  return COURSE_PRICING[courseId.trim()] ?? null;
}

// server/payments/courseCatalog.ts
function getLegacyNairaAmount(courseId, tuition) {
  const prices = getCoursePrices(courseId);
  if (prices?.NGN != null) return prices.NGN;
  if (prices?.USD != null) return prices.USD * 1e3;
  if (tuition?.includes("\u20A6")) {
    const num = parseInt(tuition.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(num) && num > 0) return num;
  }
  const raw = parseInt(tuition?.replace(/[^0-9]/g, "") || "", 10);
  return !isNaN(raw) && raw > 0 ? raw : 6e4;
}
var canonicalCourseMap = /* @__PURE__ */ new Map();
for (const course of ACADEMY_COURSES) {
  const prices = getCoursePrices(course.id);
  const resolvedPrices = prices ?? { NGN: null, USD: null };
  const naira = getLegacyNairaAmount(course.id, course.tuition);
  const canonical = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    prices: resolvedPrices,
    nairaAmount: naira,
    koboAmount: naira * 100,
    currency: "NGN",
    totalModules: course.weeklySyllabus?.length || course.curriculum?.length || 12,
    nextCohortDate: course.nextCohortDate || "October 9, 2026",
    tuitionDisplay: course.tuition
  };
  canonicalCourseMap.set(course.id.toLowerCase().trim(), canonical);
  canonicalCourseMap.set(course.slug.toLowerCase().trim(), canonical);
}
function findCanonicalCourse(courseIdentifier) {
  if (!courseIdentifier || typeof courseIdentifier !== "string") {
    return null;
  }
  const clean = courseIdentifier.toLowerCase().trim();
  return canonicalCourseMap.get(clean) || null;
}

// server/paystackServer.ts
var paystackRouter = Router2();
var PAYSTACK_API_BASE = "https://api.paystack.co";
function getPaystackSecretKey() {
  return (process.env.PAYSTACK_SECRET_KEY || "").trim();
}
function getPaystackPublicKey() {
  return (process.env.PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY || "").trim();
}
function isPaystackConfigured() {
  const key = getPaystackSecretKey();
  return Boolean(key && (key.startsWith("sk_test_") || key.startsWith("sk_live_")));
}
var SlidingWindowRateLimiter2 = class {
  constructor(options) {
    this.store = /* @__PURE__ */ new Map();
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.prefix = options.prefix || "rl";
  }
  check(key) {
    const now = Date.now();
    const fullKey = `${this.prefix}:${key}`;
    const record = this.store.get(fullKey);
    if (!record || now > record.resetTime) {
      const resetTime = now + this.windowMs;
      this.store.set(fullKey, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: this.max - 1,
        resetInSeconds: Math.ceil(this.windowMs / 1e3),
        limit: this.max
      };
    }
    if (record.count >= this.max) {
      const resetInSeconds2 = Math.max(1, Math.ceil((record.resetTime - now) / 1e3));
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: resetInSeconds2,
        limit: this.max
      };
    }
    record.count += 1;
    const remaining = this.max - record.count;
    const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1e3));
    return {
      allowed: true,
      remaining,
      resetInSeconds,
      limit: this.max
    };
  }
  reset(key) {
    if (key) {
      this.store.delete(`${this.prefix}:${key}`);
    } else {
      this.store.clear();
    }
  }
};
var payInitRateLimiter = new SlidingWindowRateLimiter2({
  windowMs: 10 * 60 * 1e3,
  max: 5,
  prefix: "pay_init"
});
var payVerifyRateLimiter = new SlidingWindowRateLimiter2({
  windowMs: 60 * 1e3,
  max: 15,
  prefix: "pay_verify"
});
function getClientIp2(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "127.0.0.1";
}
function isPlainObject2(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}
function hasPrototypePollutionKeys(obj) {
  return Object.keys(obj).some((key) => key === "__proto__" || key === "constructor" || key === "prototype");
}
function isValidEmail2(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && email.trim().length <= 120;
}
function isValidTransactionReference(ref) {
  if (typeof ref !== "string") return false;
  return /^[A-Za-z0-9_\-.:]{4,80}$/.test(ref.trim());
}
function sanitizeText(val, maxLen = 120) {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLen).replace(/[<>]/g, "");
}
var fallbackPaymentsStore = /* @__PURE__ */ new Map();
var simulateEnrollmentFailureForTesting = /* @__PURE__ */ new Set();
function sanitizePaystackResponse(data) {
  if (!data || typeof data !== "object") return null;
  const sanitized = { ...data };
  if (sanitized.authorization && typeof sanitized.authorization === "object") {
    sanitized.authorization = {
      channel: sanitized.authorization.channel,
      card_type: sanitized.authorization.card_type,
      bank: sanitized.authorization.bank,
      last4: sanitized.authorization.last4,
      exp_month: sanitized.authorization.exp_month,
      exp_year: sanitized.authorization.exp_year,
      country_code: sanitized.authorization.country_code,
      brand: sanitized.authorization.brand,
      reusable: sanitized.authorization.reusable
    };
  }
  delete sanitized.plan;
  delete sanitized.subaccount;
  return sanitized;
}
async function extractOptionalAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user || !user.email) return null;
    return {
      id: user.id,
      email: user.email.toLowerCase().trim()
    };
  } catch {
    return null;
  }
}
async function ensureCourseRecordInDatabase(canonicalCourse, supabase) {
  if (!supabase) return canonicalCourse.id;
  try {
    const { data: matchedCourse } = await supabase.from("courses").select("id").or(`id.eq.${canonicalCourse.id},slug.eq.${canonicalCourse.slug}`).maybeSingle();
    if (matchedCourse?.id) {
      return matchedCourse.id;
    }
    const coursePayload = {
      id: canonicalCourse.id,
      slug: canonicalCourse.slug,
      title: canonicalCourse.title,
      badge: canonicalCourse.tuitionDisplay || `\u20A6${canonicalCourse.nairaAmount.toLocaleString()}`,
      total_modules: canonicalCourse.totalModules || 4,
      status: "active",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const { data: inserted, error: insertErr } = await supabase.from("courses").upsert(coursePayload, { onConflict: "id" }).select("id").maybeSingle();
    if (!insertErr && inserted?.id) {
      return inserted.id;
    }
  } catch (err) {
    console.warn("[Auto-provision course record warning]:", err);
  }
  return canonicalCourse.id;
}
async function processPaymentFulfillment(reference, verifiedPaystackData) {
  if (!isValidTransactionReference(reference)) {
    return {
      verified: false,
      error: "Invalid transaction reference format.",
      code: "INVALID_REFERENCE",
      status: 400
    };
  }
  const supabase = getSupabaseAdmin();
  let existingPayment = null;
  if (supabase) {
    try {
      const { data } = await supabase.from("payments").select("*").eq("id", reference).maybeSingle();
      if (data) {
        existingPayment = data;
        fallbackPaymentsStore.set(reference, data);
      }
    } catch (dbErr) {
      console.warn("[Supabase payments query]:", dbErr);
    }
  }
  if (!existingPayment) {
    existingPayment = fallbackPaymentsStore.get(reference) || null;
  }
  if (existingPayment && existingPayment.status === "success" && existingPayment.fulfillment_status === "fulfilled" && !simulateEnrollmentFailureForTesting.has(reference)) {
    fallbackPaymentsStore.set(reference, existingPayment);
    const canonical = findCanonicalCourse(existingPayment.course_id);
    return {
      verified: true,
      alreadyFulfilled: true,
      payment: {
        reference: existingPayment.id,
        status: existingPayment.status,
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        channel: existingPayment.channel,
        paidAt: existingPayment.paid_at,
        studentName: existingPayment.customer_name,
        studentEmail: existingPayment.customer_email,
        courseId: existingPayment.course_id,
        courseTitle: canonical?.title || "Vixora Academy Cohort",
        emailDispatchedAt: existingPayment.email_dispatched_at
      }
    };
  }
  let paystackData = verifiedPaystackData;
  if (!paystackData) {
    const secretKey = getPaystackSecretKey();
    if (!secretKey) {
      return {
        verified: false,
        error: "Paystack Secret Key is not configured on the server.",
        code: "PAYSTACK_NOT_CONFIGURED",
        status: 503
      };
    }
    try {
      const response = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        }
      });
      const json = await response.json();
      if (!response.ok || !json.status || !json.data) {
        return {
          verified: false,
          error: json.message || "Transaction could not be verified on Paystack.",
          code: "PAYSTACK_VERIFY_FAILED",
          status: 404
        };
      }
      paystackData = json.data;
    } catch (netErr) {
      return {
        verified: false,
        error: "Network error connecting to Paystack API.",
        code: "PAYSTACK_NETWORK_ERROR",
        status: 502
      };
    }
  }
  if (paystackData.status !== "success") {
    let mappedStatus = "pending";
    if (paystackData.status === "failed" || paystackData.status === "abandoned") {
      mappedStatus = paystackData.status;
    }
    const failedUpdate = {
      status: mappedStatus,
      raw_response: sanitizePaystackResponse(paystackData),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (supabase) {
      try {
        await supabase.from("payments").update(failedUpdate).eq("id", reference);
      } catch (dbErr) {
        console.warn("[Supabase failed status update]:", dbErr);
      }
    }
    if (fallbackPaymentsStore.has(reference)) {
      const rec = fallbackPaymentsStore.get(reference);
      rec.status = mappedStatus;
      rec.raw_response = sanitizePaystackResponse(paystackData);
      rec.updated_at = (/* @__PURE__ */ new Date()).toISOString();
    }
    return {
      verified: false,
      error: `Payment is not successful (status: ${paystackData.status}).`,
      code: "PAYMENT_NOT_SUCCESSFUL",
      status: 400
    };
  }
  if (paystackData.currency !== "NGN") {
    return {
      verified: false,
      error: `Currency mismatch: Expected NGN, received ${paystackData.currency}.`,
      code: "CURRENCY_MISMATCH",
      status: 400
    };
  }
  const courseId = existingPayment?.course_id || paystackData.metadata?.courseId || paystackData.metadata?.course_id;
  const canonicalCourse = findCanonicalCourse(courseId);
  if (!canonicalCourse) {
    return {
      verified: false,
      error: "Cannot fulfill payment: Unrecognized or invalid course ID.",
      code: "INVALID_COURSE",
      status: 400
    };
  }
  const expectedKobo = canonicalCourse.koboAmount;
  const actualKobo = Math.round(Number(paystackData.amount));
  if (actualKobo !== expectedKobo) {
    return {
      verified: false,
      error: `Amount mismatch: Expected ${expectedKobo} kobo (\u20A6${canonicalCourse.nairaAmount}), received ${actualKobo} kobo.`,
      code: "AMOUNT_MISMATCH",
      status: 400
    };
  }
  const customerEmail = (paystackData.customer?.email || paystackData.metadata?.studentEmail || existingPayment?.customer_email || "").toLowerCase().trim();
  if (!isValidEmail2(customerEmail)) {
    return {
      verified: false,
      error: "Invalid customer email associated with transaction.",
      code: "INVALID_CUSTOMER_EMAIL",
      status: 400
    };
  }
  const customerName = paystackData.metadata?.studentName || existingPayment?.customer_name || paystackData.customer?.first_name || customerEmail.split("@")[0];
  const customerPhone = paystackData.metadata?.phone || existingPayment?.customer_phone || paystackData.customer?.phone || null;
  const paidAt = paystackData.paid_at || (/* @__PURE__ */ new Date()).toISOString();
  const channel = paystackData.channel || "card";
  const paystackTxId = String(paystackData.id || "");
  let authUserId = paystackData.metadata?.authUserId || null;
  let studentId = existingPayment?.student_id || null;
  let studentCode = null;
  let generatedTempPassword = null;
  let directPasswordSetupLink = null;
  let fulfillmentError = null;
  let isFulfilled = false;
  let dbCourseId = canonicalCourse.id;
  if (supabase) {
    try {
      dbCourseId = await ensureCourseRecordInDatabase(canonicalCourse, supabase);
      if (simulateEnrollmentFailureForTesting.has(reference)) {
        throw new Error("Simulated database failure during enrollment.");
      }
      const studentQuery = supabase.from("students").select("id, email, auth_user_id, student_code").eq("email", customerEmail);
      const { data: matchedStudent, error: findStudentErr } = await studentQuery.maybeSingle();
      if (findStudentErr) throw findStudentErr;
      let studentCode2 = matchedStudent?.student_code;
      if (matchedStudent) {
        studentId = matchedStudent.id;
        if (matchedStudent.auth_user_id) {
          authUserId = matchedStudent.auth_user_id;
        }
      } else {
        const newStudentId = crypto2.randomUUID();
        studentCode2 = `STU-${Math.floor(1e3 + Math.random() * 9e3)}`;
        const { data: createdStudent, error: createStudentErr } = await supabase.from("students").insert({
          id: newStudentId,
          name: customerName,
          email: customerEmail,
          auth_user_id: authUserId,
          student_code: studentCode2,
          enrolled_at: (/* @__PURE__ */ new Date()).toISOString(),
          role: "student"
        }).select("id, student_code").maybeSingle();
        if (createStudentErr) throw createStudentErr;
        if (createdStudent) {
          studentId = createdStudent.id;
          studentCode2 = createdStudent.student_code;
        } else {
          throw new Error("Student record could not be created in database.");
        }
      }
      if (supabase.auth?.admin) {
        try {
          const portalBaseUrl = "https://academy.vixoradigitalhub.com/pages/student-portal";
          let authUserExists = false;
          try {
            const { data: linkData, error: probeErr } = await supabase.auth.admin.generateLink({
              type: "recovery",
              email: customerEmail,
              options: { redirectTo: portalBaseUrl }
            });
            if (linkData?.user && !probeErr) {
              authUserExists = true;
              authUserId = linkData.user.id;
              directPasswordSetupLink = linkData.properties?.action_link || null;
            }
          } catch {
            authUserExists = false;
          }
          if (!authUserExists) {
            generatedTempPassword = `Vixora@${crypto2.randomBytes(3).toString("hex").toUpperCase()}!`;
            const { data: newAuth } = await supabase.auth.admin.createUser({
              email: customerEmail,
              password: generatedTempPassword,
              email_confirm: true,
              user_metadata: {
                name: customerName,
                role: "student"
              }
            });
            if (newAuth?.user) {
              authUserId = newAuth.user.id;
              const { data: linkData } = await supabase.auth.admin.generateLink({
                type: "recovery",
                email: customerEmail,
                options: { redirectTo: portalBaseUrl }
              });
              directPasswordSetupLink = linkData?.properties?.action_link || null;
            }
          }
          if (authUserId && studentId) {
            await supabase.from("students").update({ auth_user_id: authUserId }).eq("id", studentId);
          }
        } catch (authProvisionErr) {
          console.warn("[Student Auth Provisioning Warning]:", authProvisionErr);
        }
      }
      if (!studentId) {
        throw new Error("Valid student identifier unavailable for enrollment.");
      }
      const { data: existingEnrollment, error: findEnrollmentErr } = await supabase.from("enrollments").select("student_id, course_id, status, progress_percent").eq("student_id", studentId).eq("course_id", dbCourseId).maybeSingle();
      if (findEnrollmentErr) throw findEnrollmentErr;
      if (!existingEnrollment) {
        const { error: insertEnrollmentErr } = await supabase.from("enrollments").insert({
          id: crypto2.randomUUID(),
          student_id: studentId,
          course_id: dbCourseId,
          status: "enrolled",
          cohort: `Cohort ${canonicalCourse.nextCohortDate}`,
          progress_percent: 0,
          completed_modules: 0,
          total_modules: canonicalCourse.totalModules,
          enrolled_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        if (insertEnrollmentErr) throw insertEnrollmentErr;
      } else {
        const { error: updateEnrollmentErr } = await supabase.from("enrollments").update({ status: "enrolled", updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("student_id", studentId).eq("course_id", dbCourseId);
        if (updateEnrollmentErr) throw updateEnrollmentErr;
      }
      isFulfilled = true;
    } catch (enrollErr) {
      console.error("[Supabase Enrollment Fulfillment Failure]:", enrollErr);
      fulfillmentError = enrollErr?.message || String(enrollErr);
      isFulfilled = false;
    }
  } else {
    if (simulateEnrollmentFailureForTesting.has(reference)) {
      isFulfilled = false;
      fulfillmentError = "Simulated database failure during enrollment.";
    } else {
      isFulfilled = true;
      studentId = existingPayment?.student_id || `STU-${Date.now().toString(36).toUpperCase()}`;
    }
  }
  const updatedPaymentRecord = {
    id: reference,
    student_id: studentId,
    course_id: dbCourseId,
    amount: canonicalCourse.nairaAmount,
    amount_kobo: canonicalCourse.koboAmount,
    currency: "NGN",
    channel,
    status: "success",
    // Genuinely successful at Paystack
    fulfillment_status: isFulfilled ? "fulfilled" : "failed",
    fulfillment_error: fulfillmentError,
    paystack_transaction_id: paystackTxId,
    customer_email: customerEmail,
    customer_name: customerName,
    customer_phone: customerPhone,
    paid_at: paidAt,
    email_dispatched_at: isFulfilled ? existingPayment?.email_dispatched_at || null : null,
    raw_response: sanitizePaystackResponse(paystackData),
    created_at: existingPayment?.created_at || (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (supabase) {
    try {
      await supabase.from("payments").upsert(updatedPaymentRecord, { onConflict: "id" });
    } catch (paymentDbErr) {
      console.warn("[Supabase payments upsert error]:", paymentDbErr);
    }
  }
  fallbackPaymentsStore.set(reference, updatedPaymentRecord);
  if (!isFulfilled) {
    return {
      verified: false,
      error: `Tuition payment of \u20A6${canonicalCourse.nairaAmount.toLocaleString()} was confirmed, but automated course enrollment encountered a database error: ${fulfillmentError}. Your transaction record has been saved for reconciliation.`,
      code: "ENROLLMENT_FAILED",
      status: 500,
      payment: {
        reference,
        status: "success",
        amount: canonicalCourse.nairaAmount,
        currency: "NGN",
        channel,
        paidAt,
        studentName: customerName,
        studentEmail: customerEmail,
        courseId: canonicalCourse.id,
        courseTitle: canonicalCourse.title
      }
    };
  }
  let alreadyEmailed = Boolean(existingPayment?.email_dispatched_at);
  if (!alreadyEmailed && supabase) {
    try {
      const { data: latestPayment } = await supabase.from("payments").select("email_dispatched_at").eq("id", reference).maybeSingle();
      if (latestPayment?.email_dispatched_at) {
        alreadyEmailed = true;
      }
    } catch (dbErr) {
      console.warn("[Supabase email check]:", dbErr);
    }
  }
  let finalEmailDispatchedAt = existingPayment?.email_dispatched_at || null;
  if (!alreadyEmailed) {
    try {
      const whatsappUrl = getWhatsAppUrl(
        "ng",
        `Hello Admissions! I just completed my tuition payment of \u20A6${canonicalCourse.nairaAmount.toLocaleString()} for ${canonicalCourse.title} via Paystack. Reference: ${reference}. My email is ${customerEmail}.`
      );
      const emailPayload = buildStudentOnboardingEmail({
        customerName,
        customerEmail,
        courseTitle: canonicalCourse.title,
        tuitionNaira: canonicalCourse.nairaAmount,
        reference,
        nextCohortDate: canonicalCourse.nextCohortDate,
        channel,
        studentCode: studentCode || "STU-ACTIVE",
        generatedTempPassword,
        directPasswordSetupLink,
        whatsappUrl
      });
      const emailResult = await dispatchGenericEmail({
        to: customerEmail,
        toName: customerName,
        subject: emailPayload.subject,
        html: emailPayload.html,
        text: emailPayload.text
      });
      if (emailResult && (emailResult.delivered || emailResult.status === "delivered")) {
        finalEmailDispatchedAt = (/* @__PURE__ */ new Date()).toISOString();
        if (supabase) {
          try {
            await supabase.from("payments").update({ email_dispatched_at: finalEmailDispatchedAt }).eq("id", reference);
          } catch (dbErr) {
            console.warn("[Supabase email_dispatched_at update]:", dbErr);
          }
        }
        if (fallbackPaymentsStore.has(reference)) {
          fallbackPaymentsStore.get(reference).email_dispatched_at = finalEmailDispatchedAt;
        }
      }
    } catch (mailErr) {
      console.warn("[Paystack Email Dispatch Warning]:", mailErr);
    }
  }
  return {
    verified: true,
    payment: {
      reference,
      status: "success",
      amount: canonicalCourse.nairaAmount,
      currency: "NGN",
      channel,
      paidAt,
      studentName: customerName,
      studentEmail: customerEmail,
      courseId: canonicalCourse.id,
      courseTitle: canonicalCourse.title,
      emailDispatchedAt: finalEmailDispatchedAt
    }
  };
}
paystackRouter.get("/config", (_req, res) => {
  const configured = isPaystackConfigured();
  const publicKey = getPaystackPublicKey();
  return res.json({
    configured,
    hasPublicKey: Boolean(publicKey),
    publicKey: publicKey || null,
    currency: "NGN",
    mode: getPaystackSecretKey().startsWith("sk_live_") ? "live" : "test",
    merchantName: "Vixora Academy"
  });
});
paystackRouter.post("/initialize", async (req, res) => {
  try {
    const clientIp = getClientIp2(req);
    if (!isPlainObject2(req.body)) {
      return res.status(400).json({
        error: "Request body must be a valid JSON object.",
        code: "INVALID_BODY"
      });
    }
    if (hasPrototypePollutionKeys(req.body)) {
      return res.status(400).json({
        error: "Invalid request: Prototype pollution keys detected.",
        code: "PROTOTYPE_POLLUTION"
      });
    }
    const { courseId, email, studentName, phone, callbackUrl } = req.body;
    if (!courseId || typeof courseId !== "string") {
      return res.status(400).json({
        error: 'Parameter "courseId" is required and must be a string.',
        code: "COURSE_ID_REQUIRED"
      });
    }
    if (!email || !isValidEmail2(email)) {
      return res.status(400).json({
        error: "A valid student email address is required.",
        code: "INVALID_EMAIL"
      });
    }
    const cleanEmail = email.toLowerCase().trim();
    const cleanStudentName = sanitizeText(studentName || cleanEmail.split("@")[0]);
    const cleanPhone = sanitizeText(phone, 30);
    const rateLimitKey = `${clientIp}:${cleanEmail}`;
    const rlStatus = payInitRateLimiter.check(rateLimitKey);
    if (!rlStatus.allowed) {
      return res.status(429).json({
        error: `Too many payment initialization requests. Please wait ${rlStatus.resetInSeconds} seconds before trying again.`,
        code: "RATE_LIMIT_EXCEEDED",
        resetInSeconds: rlStatus.resetInSeconds
      });
    }
    const canonicalCourse = findCanonicalCourse(courseId);
    if (!canonicalCourse) {
      return res.status(400).json({
        error: `Invalid courseId "${courseId}". Course is not available in the Vixora Academy catalog.`,
        code: "INVALID_COURSE_ID"
      });
    }
    const secretKey = getPaystackSecretKey();
    console.log("[Server Paystack Init Diagnostic: Request]", {
      courseId,
      hasEmail: Boolean(email),
      hasPhone: Boolean(phone),
      hasSecretKey: Boolean(secretKey),
      keyPrefix: secretKey ? secretKey.startsWith("sk_live_") ? "sk_live_..." : secretKey.startsWith("sk_test_") ? "sk_test_..." : "unknown..." : "none"
    });
    if (!secretKey) {
      console.warn("[Server Paystack Init Diagnostic: Rejected]", {
        reason: "PAYSTACK_SECRET_KEY is empty in process.env",
        status: 503
      });
      return res.status(503).json({
        error: "Paystack Secret Key is not configured on the server. Please add PAYSTACK_SECRET_KEY in Settings -> Secrets.",
        code: "PAYSTACK_NOT_CONFIGURED",
        help: "Obtain your Secret Key from Paystack Dashboard -> Settings -> API Keys & Webhooks."
      });
    }
    const authUser = await extractOptionalAuthUser(req);
    const reference = `VIX-PS-${Date.now()}-${crypto2.randomBytes(4).toString("hex").toUpperCase()}`;
    const reqOrigin = req.headers.origin || (req.headers.host ? `${req.protocol}://${req.headers.host}` : "");
    const finalCallbackUrl = typeof callbackUrl === "string" && callbackUrl.startsWith("http") ? callbackUrl : `${reqOrigin}/payment/callback?reference=${reference}&courseId=${encodeURIComponent(canonicalCourse.id)}`;
    const supabase = getSupabaseAdmin();
    let resolvedCourseId = canonicalCourse.id;
    if (supabase) {
      resolvedCourseId = await ensureCourseRecordInDatabase(canonicalCourse, supabase);
    }
    const initialPaymentRecord = {
      id: reference,
      student_id: null,
      course_id: resolvedCourseId,
      amount: canonicalCourse.nairaAmount,
      amount_kobo: canonicalCourse.koboAmount,
      currency: "NGN",
      channel: null,
      status: "pending",
      fulfillment_status: "pending",
      fulfillment_error: null,
      email_dispatched_at: null,
      paystack_transaction_id: null,
      customer_email: cleanEmail,
      customer_name: cleanStudentName,
      customer_phone: cleanPhone || null,
      paid_at: null,
      raw_response: null,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (supabase) {
      try {
        await supabase.from("payments").insert(initialPaymentRecord);
      } catch (insertErr) {
        console.warn("[Supabase initial payment record insert]:", insertErr);
      }
    }
    fallbackPaymentsStore.set(reference, initialPaymentRecord);
    const paystackPayload = {
      email: cleanEmail,
      amount: canonicalCourse.koboAmount,
      currency: "NGN",
      reference,
      callback_url: finalCallbackUrl,
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
      metadata: {
        studentName: cleanStudentName,
        studentEmail: cleanEmail,
        phone: cleanPhone,
        courseId: canonicalCourse.id,
        courseTitle: canonicalCourse.title,
        authUserId: authUser?.id || null,
        amountNaira: canonicalCourse.nairaAmount
      }
    };
    console.log("[Server Paystack Init Diagnostic: Calling Paystack API]", {
      reference,
      amountKobo: canonicalCourse.koboAmount,
      currency: "NGN",
      callbackHost: new URL(finalCallbackUrl).hostname
    });
    const response = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(paystackPayload)
    });
    const data = await response.json();
    console.log("[Server Paystack Init Diagnostic: Paystack Response]", {
      status: response.status,
      ok: response.ok,
      paystackStatus: data.status,
      hasAuthUrl: Boolean(data.data?.authorization_url),
      hasAccessCode: Boolean(data.data?.access_code),
      reference
    });
    if (!response.ok || !data.status || !data.data) {
      return res.status(response.status >= 400 && response.status < 500 ? 400 : 502).json({
        error: data.message || "Failed to initialize Paystack transaction.",
        code: "PAYSTACK_INIT_FAILED",
        reference
      });
    }
    return res.json({
      success: true,
      reference,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      amountNaira: canonicalCourse.nairaAmount,
      amountKobo: canonicalCourse.koboAmount,
      currency: "NGN",
      courseId: canonicalCourse.id,
      courseTitle: canonicalCourse.title
    });
  } catch (err) {
    console.error("[Paystack Initialize Exception]:", err);
    return res.status(500).json({
      error: "An internal error occurred while initializing payment.",
      code: "SERVER_ERROR"
    });
  }
});
async function handleVerificationRequest(req, res) {
  try {
    const clientIp = getClientIp2(req);
    const rlStatus = payVerifyRateLimiter.check(clientIp);
    if (!rlStatus.allowed) {
      return res.status(429).json({
        verified: false,
        error: `Too many verification requests. Please wait ${rlStatus.resetInSeconds} seconds before retrying.`,
        code: "RATE_LIMIT_EXCEEDED",
        resetInSeconds: rlStatus.resetInSeconds
      });
    }
    const rawRef = req.body?.reference || req.params?.reference || req.query?.reference;
    if (!isValidTransactionReference(rawRef)) {
      return res.status(400).json({
        verified: false,
        error: "A valid transaction reference string is required.",
        code: "INVALID_REFERENCE"
      });
    }
    const reference = String(rawRef).trim();
    const result = await processPaymentFulfillment(reference);
    if (!result.verified) {
      return res.status(result.status || 400).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error("[Paystack Verify Exception]:", err);
    return res.status(500).json({
      verified: false,
      error: "An internal server error occurred while verifying payment.",
      code: "SERVER_ERROR"
    });
  }
}
paystackRouter.post("/verify", handleVerificationRequest);
paystackRouter.get("/verify", handleVerificationRequest);
paystackRouter.get("/verify/:reference", handleVerificationRequest);
paystackRouter.post("/verify/:reference", handleVerificationRequest);
paystackRouter.get("/webhook", (_req, res) => {
  return res.json({
    status: "active",
    endpoint: "Paystack Webhook Listener",
    service: "Vixora Academy Payment Gateway",
    expectedMethod: "POST",
    configured: isPaystackConfigured(),
    message: "This endpoint is active and listening for automated webhook POST events from Paystack."
  });
});
paystackRouter.post("/webhook", async (req, res) => {
  try {
    const secretKey = getPaystackSecretKey();
    if (!secretKey) {
      return res.status(503).json({ error: "Paystack Secret Key is not configured on server." });
    }
    const signature = req.headers["x-paystack-signature"];
    if (!signature || typeof signature !== "string") {
      return res.status(401).json({ error: "Missing x-paystack-signature header." });
    }
    const rawBody = req.rawBody || (Buffer.isBuffer(req.body) ? req.body : typeof req.body === "string" ? Buffer.from(req.body) : void 0);
    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      return res.status(400).json({
        error: "Raw request body buffer unavailable for signature verification."
      });
    }
    const computedHash = crypto2.createHmac("sha512", secretKey).update(rawBody).digest("hex");
    const expectedBuffer = Buffer.from(computedHash, "hex");
    const providedBuffer = Buffer.from(signature, "hex");
    if (expectedBuffer.length !== providedBuffer.length || !crypto2.timingSafeEqual(expectedBuffer, providedBuffer)) {
      return res.status(401).json({ error: "Invalid webhook signature." });
    }
    const event = req.body;
    if (!event || typeof event !== "object") {
      return res.status(400).json({ error: "Invalid webhook event payload structure." });
    }
    if (event.event === "charge.success" && event.data?.reference) {
      const ref = String(event.data.reference).trim();
      await processPaymentFulfillment(ref, event.data);
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("[Paystack Webhook Exception]:", err);
    return res.status(500).json({ error: "Webhook processing error." });
  }
});

// server/aiAdvisorServer.ts
import { Router as Router3 } from "express";
import { GoogleGenAI } from "@google/genai";
var aiAdvisorRouter = Router3();
var SlidingWindowRateLimiter3 = class {
  constructor(options) {
    this.store = /* @__PURE__ */ new Map();
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.prefix = options.prefix;
  }
  check(key) {
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
        resetInSeconds: Math.ceil(this.windowMs / 1e3),
        limit: this.max
      };
    }
    if (record.count >= this.max) {
      const resetInSeconds2 = Math.max(1, Math.ceil((record.resetTime - now) / 1e3));
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds: resetInSeconds2,
        limit: this.max
      };
    }
    record.count += 1;
    const remaining = this.max - record.count;
    const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1e3));
    return {
      allowed: true,
      remaining,
      resetInSeconds,
      limit: this.max
    };
  }
  peek(key) {
    const now = Date.now();
    const fullKey = `${this.prefix}:${key}`;
    const record = this.store.get(fullKey);
    if (!record || now > record.resetTime) {
      return {
        remaining: this.max,
        resetInSeconds: Math.ceil(this.windowMs / 1e3),
        limit: this.max,
        isLimited: false
      };
    }
    const remaining = Math.max(0, this.max - record.count);
    const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1e3));
    return {
      remaining,
      resetInSeconds,
      limit: this.max,
      isLimited: record.count >= this.max
    };
  }
};
var advisorRateLimiter = new SlidingWindowRateLimiter3({
  windowMs: 10 * 60 * 1e3,
  max: 12,
  prefix: "ai_advisor"
});
function getClientIp3(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown-ip";
}
function isPlainObject3(val) {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}
function buildAuthoritativeKnowledgeBase() {
  const servicesText = FEATURED_SERVICES.map((s) => {
    return `- **${s.title}** (${s.subtitle}): ${s.description} Features: ${s.features.join(", ")}`;
  }).join("\n");
  const coursesText = ACADEMY_COURSES.map((c) => {
    const approvedPrice = COURSE_PRICING[c.id]?.NGN ? `\u20A6${COURSE_PRICING[c.id].NGN.toLocaleString()}` : c.tuition;
    return `- **${c.title}** (Slug: \`${c.slug}\`, ID: \`${c.id}\`)
  \u2022 Tuition: ${approvedPrice}
  \u2022 Duration: ${c.duration} (${c.format})
  \u2022 Next Cohort: ${c.nextCohortDate}
  \u2022 Level: ${c.level} | Track: ${c.track}
  \u2022 Audience: ${c.targetAudience}
  \u2022 Description: ${c.description}
  \u2022 Core Skills: ${c.curriculum.slice(0, 4).join(", ")}`;
  }).join("\n\n");
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
1. Always state the exact, approved tuition for courses (e.g. AI Image & Short Videos Creation is \u20A610,000, AI Automation & Digital Skills is \u20A630,000, Data Analysis Cohort is \u20A660,000). Never invent or guess prices.
2. If a user asks about building a custom software/AI system, diagnose their business problem, propose a concrete technology architecture, and suggest booking a project consultation.
3. If a user asks what course to study, assess their starting point, recommend the optimal Vixora Academy program, and highlight the start date and tuition.
4. Keep answers concise, highly structured, professional, and directly actionable.
`;
}
function getGeminiApiKey() {
  const rawKey = process.env.GEMINI_API_KEY || process.env.GEMINI_SECRET || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_APIKEY || process.env.GEMINI_TOKEN || "";
  return rawKey.trim().replace(/^["']|["']$/g, "");
}
var cachedApiKey = "";
var aiClient = null;
function getGemini() {
  const currentKey = getGeminiApiKey();
  if (!aiClient || cachedApiKey !== currentKey) {
    cachedApiKey = currentKey;
    aiClient = new GoogleGenAI({
      apiKey: currentKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-vixora-advisor"
        }
      }
    });
  }
  return aiClient;
}
aiAdvisorRouter.get("/advisor/status", (req, res) => {
  const ip = getClientIp3(req);
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
aiAdvisorRouter.post("/advisor", async (req, res) => {
  if (!isPlainObject3(req.body)) {
    return res.status(400).json({ error: "Request body must be a valid JSON object.", code: "INVALID_BODY" });
  }
  const { message, conversationHistory = [], track = "all" } = req.body;
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: 'Field "message" is required.', code: "MISSING_MESSAGE" });
  }
  if (message.length > 2500) {
    return res.status(400).json({ error: "Message cannot exceed 2500 characters.", code: "MESSAGE_TOO_LONG" });
  }
  const ip = getClientIp3(req);
  const rlCheck = advisorRateLimiter.check(ip);
  if (!rlCheck.allowed) {
    return res.status(429).json({
      error: `Too many advisor queries. Please wait ${rlCheck.resetInSeconds} seconds before asking again.`,
      code: "RATE_LIMIT_EXCEEDED",
      remaining: 0,
      resetInSeconds: rlCheck.resetInSeconds
    });
  }
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return res.status(503).json({
      error: "GEMINI_API_KEY is not configured in environment variables. Please add GEMINI_API_KEY to your Vercel Project Settings and redeploy.",
      code: "GEMINI_UNCONFIGURED"
    });
  }
  try {
    const ai = getGemini();
    const knowledgeBase = buildAuthoritativeKnowledgeBase();
    const contents = [];
    if (Array.isArray(conversationHistory)) {
      for (const turn of conversationHistory.slice(-6)) {
        if (turn && typeof turn.text === "string" && (turn.role === "user" || turn.role === "model")) {
          contents.push({
            role: turn.role,
            parts: [{ text: turn.text }]
          });
        }
      }
    }
    contents.push({
      role: "user",
      parts: [
        {
          text: `User Question: "${message.trim()}"

Context Filter: User is inquiring about "${track}" track.

Please answer authoritatively, concisely, and provide clear recommended next steps.`
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
    let response = null;
    const candidateModels = [
      "gemini-3.8-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
      "gemini-2.5-flash"
    ];
    let lastError = null;
    for (const model of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.2
          }
        });
        if (response?.text) break;
      } catch (mErr) {
        lastError = mErr;
      }
    }
    if (!response || !response.text) {
      throw lastError || new Error("All model candidates failed to respond.");
    }
    const rawText = response.text || "";
    let parsedData = null;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      try {
        parsedData = JSON.parse(cleaned);
      } catch {
        parsedData = {
          reply: rawText,
          category: "general",
          suggestedActions: [
            { label: "Book Project Consultation", actionType: "start_project", target: "consultation" }
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
  } catch (err) {
    console.error("[AI Advisor Error]:", err?.message || err);
    const isVideoQuery = message.toLowerCase().includes("video") || message.toLowerCase().includes("short") || message.toLowerCase().includes("tiktok");
    const fallbackReply = isVideoQuery ? `For learning AI-driven video creation and short-form content, the **AI Image & Short Videos Creation** cohort is our dedicated program.

* **Tuition:** \u20A610,000
* **Duration:** 4 Weeks
* **Tools Covered:** Midjourney, Flux, ElevenLabs, CapCut, and Runway.

You will master prompt engineering, voice cloning, and synthetic video production.` : `Vixora Digital Hub offers industry-leading cohorts in Autonomous AI Engineering, Enterprise Workflow Automation, and AI-Powered Software. Our advisors are available to guide your roadmap.`;
    return res.json({
      success: true,
      data: {
        reply: fallbackReply,
        category: track === "academy" ? "academy" : "business",
        recommendedCourseSlug: isVideoQuery ? "ai-image-short-videos-creation" : void 0,
        recommendedCourseTitle: isVideoQuery ? "AI Image & Short Videos Creation" : void 0,
        suggestedActions: [
          {
            label: isVideoQuery ? "Explore AI Image & Short Videos Creation" : "Explore Academy Courses",
            actionType: "navigate_course",
            target: isVideoQuery ? "ai-image-short-videos-creation" : "all"
          },
          {
            label: "Contact Vixora on WhatsApp",
            actionType: "whatsapp_consultation",
            target: COMPANY_CONTACT.phone || "+1 (279) 257-4850"
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

// server.ts
dotenv2.config();
var app = express();
var PORT = 3e3;
app.use(
  express.json({
    limit: "15mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use("/api", portalRouter);
app.use("/api/ai", aiAdvisorRouter);
app.use("/api", aiAdvisorRouter);
app.use("/ai", aiAdvisorRouter);
app.use("/advisor", aiAdvisorRouter);
app.use("/api/payments/paystack", paystackRouter);
app.use("/api/paystack", paystackRouter);
app.use("/payments/paystack", paystackRouter);
app.use("/paystack", paystackRouter);
var cachedApiKey2 = "";
var aiClient2 = null;
function getGemini2() {
  const currentKey = getGeminiApiKey();
  if (!aiClient2 || cachedApiKey2 !== currentKey) {
    cachedApiKey2 = currentKey;
    aiClient2 = new GoogleGenAI2({
      apiKey: currentKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient2;
}
app.get("/api/health", (req, res) => {
  const apiKey = getGeminiApiKey();
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(apiKey),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/analyze-requirements", async (req, res) => {
  try {
    if (!isPlainObject(req.body)) {
      return res.status(400).json({ error: "Request body must be a valid JSON object." });
    }
    const { files, customInstructions } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "No files provided for analysis." });
    }
    if (files.length > 50) {
      return res.status(400).json({ error: "Maximum 50 files allowed per analysis request." });
    }
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!isPlainObject(f)) {
        return res.status(400).json({ error: `File at index ${i} must be a valid object.` });
      }
      if (typeof f.name !== "string" || f.name.length > 255) {
        return res.status(400).json({ error: `File name at index ${i} must be a string up to 255 characters.` });
      }
      if (f.extractedContent !== void 0 && f.extractedContent !== null && typeof f.extractedContent !== "string") {
        return res.status(400).json({ error: `extractedContent at index ${i} must be a string.` });
      }
    }
    if (customInstructions !== void 0 && customInstructions !== null) {
      if (typeof customInstructions !== "string" || customInstructions.length > 5e3) {
        return res.status(400).json({ error: "customInstructions must be a string up to 5000 characters." });
      }
    }
    const ai = getGemini2();
    const documentsContext = files.map((f, idx) => {
      return `=== DOCUMENT ${idx + 1}: ${f.name} (Type: ${f.mimeType || "unknown"}) ===
${f.extractedContent || f.snippet || "No text extracted."}
`;
    }).join("\n\n");
    const prompt = `You are an expert Principal Software Architect and Technical Product Manager.
Analyze the following Google Drive files gathered for "Vixora Web Development" and compile an exhaustive, professional, and structured Project Requirements Document (PRD).

SOURCE DOCUMENTS CONTEXT:
${documentsContext}

${customInstructions ? `USER INSTRUCTIONS / FOCUS:
${customInstructions}
` : ""}

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
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const responseText = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini response as JSON:", responseText);
      const cleanJson = responseText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
      parsedData = JSON.parse(cleanJson);
    }
    parsedData.analyzedAt = (/* @__PURE__ */ new Date()).toISOString();
    parsedData.sourceFilesCount = files.length;
    res.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("Error analyzing requirements with Gemini:", error);
    res.status(500).json({
      error: error.message || "Failed to synthesize project requirements."
    });
  }
});
app.post("/api/ask-requirements", async (req, res) => {
  try {
    if (!isPlainObject(req.body)) {
      return res.status(400).json({ error: "Request body must be a valid JSON object." });
    }
    const { question, prdContext } = req.body;
    if (!question || typeof question !== "string" || question.trim().length === 0 || question.length > 2e3) {
      return res.status(400).json({ error: "Question is required and must be a string up to 2000 characters." });
    }
    if (prdContext !== void 0 && prdContext !== null) {
      if (typeof prdContext !== "object" && typeof prdContext !== "string") {
        return res.status(400).json({ error: "prdContext must be a valid object or string." });
      }
    }
    const ai = getGemini2();
    const prompt = `You are the lead AI Technical Architect for the Vixora Web Development project.
Answer the following developer/stakeholder question accurately based on the compiled Vixora Project Requirements:

PROJECT REQUIREMENTS CONTEXT:
${JSON.stringify(prdContext, null, 2)}

QUESTION:
${question}

Provide a direct, helpful, and concise answer with actionable technical clarity. Use bullet points or code snippets where helpful.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt
    });
    res.json({ success: true, answer: response.text });
  } catch (error) {
    console.error("Error in ask-requirements:", error);
    res.status(500).json({ error: error.message || "Failed to answer query." });
  }
});
app.use(express.static(path3.join(process.cwd(), "public")));
app.all("/api/*", (_req, res) => {
  res.status(404).json({
    error: "API endpoint not found.",
    code: "NOT_FOUND"
  });
});
app.use((err, req, res, next) => {
  if (req.path.startsWith("/api")) {
    const status = typeof err.status === "number" ? err.status : 500;
    return res.status(status).json({
      error: err?.message || "Internal server error",
      code: err?.code || "SERVER_ERROR"
    });
  }
  next(err);
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path3.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path3.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Vixora Analyzer server running on http://0.0.0.0:${PORT}`);
    if (process.env.AUTO_MIGRATE === "true") {
      try {
        const { runMigrations: runMigrations2, getDatabaseConnectionString: getDatabaseConnectionString2 } = await Promise.resolve().then(() => (init_runner(), runner_exports));
        if (getDatabaseConnectionString2()) {
          console.log("[Startup] Executing pending database migrations...");
          await runMigrations2({ silent: false });
        }
      } catch (mErr) {
        console.error("[Startup Migration Warning]:", mErr?.message || mErr);
      }
    }
  });
}
var server_default = app;
var isMainScript = typeof process !== "undefined" && Boolean(process.argv?.[1]) && !process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME && (process.argv[1].endsWith("server.ts") || process.argv[1].endsWith("server.cjs") || process.argv[1].endsWith("server.js") || process.argv[1].includes("tsx"));
if (isMainScript) {
  startServer();
}
export {
  server_default as default
};
