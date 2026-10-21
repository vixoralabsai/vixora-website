import { DriveFile } from '../types';

export const SAMPLE_VIXORA_DOCS: DriveFile[] = [
  {
    id: 'sample-vixora-prd',
    name: 'Vixora Platform - Web Development PRD (v2.4).gdoc',
    mimeType: 'application/vnd.google-apps.document',
    sourceType: 'google_doc',
    modifiedTime: new Date().toISOString(),
    size: '14.2 KB',
    snippet: 'Product Requirements Document for the Vixora Web Application, featuring AI workflow automation, customer portal, and analytics dashboard.',
    isSelected: true,
    extractedContent: `# Vixora Web Platform - Comprehensive Product Requirements Document (PRD)

## 1. Project Overview & Vision
Vixora is an enterprise-grade web platform and intelligent automation hub designed to streamline client onboarding, real-time workflow analytics, and collaborative project workspaces. The web application serves as the primary gateway for both enterprise clients and internal project managers.

## 2. Core Objectives
- **Sub-second Navigation:** Deliver a snappy, responsive Single Page Application (SPA) with optimistic UI updates.
- **Client Workspace:** Enable clients to upload documents, review project progress, approve deliverables, and communicate in real-time.
- **AI-Powered Insights Engine:** Integrate Gemini-powered automated project milestone summaries, task categorization, and smart document parsing.
- **Security & RBAC:** Enforce strict multi-tenant access control (Admin, Manager, Client Viewer) with OAuth2 and SSO integration.

## 3. Technical Architecture & Tech Stack Specifications
- **Frontend:** React 19, TypeScript 5.8+, Tailwind CSS 4.0, Lucide Icons, Motion for micro-interactions.
- **Backend Services:** Node.js Express full-stack API with server-side proxying for all LLM and third-party keys.
- **Database & Storage:** Cloud Firestore / PostgreSQL relational schemas for high-concurrency audit logs and structured metadata.
- **Authentication:** Google OAuth2 (Firebase Auth) with least-privilege scope delegation.
- **Hosting & Infrastructure:** Cloud Run containerized deployment behind managed reverse proxies with strict SSL/TLS.

## 4. Key Functional Modules
### 4.1 Onboarding & Authentication Flow
- Google Workspace Single Sign-On (SSO) with auto-organization discovery.
- Role-based dashboard redirection upon login.

### 4.2 Project & Task Management Hub
- Kanban board with drag-and-drop state transitions (Backlog, In Progress, Review, Completed).
- Automated SLA deadline reminders and milestone progress percentage calculations.

### 4.3 Document Repository & Workspace Integration
- Google Drive file attachment integration with direct document preview.
- Version tracking and audit logs for client deliverables.

### 4.4 Analytics & Reporting Suite
- Interactive charts showing delivery velocity, budget burn-down, and milestone completion.
- One-click PDF & CSV requirement export.

## 5. Non-Functional & Performance Criteria
- **Lighthouse Score:** Minimum 95+ across Performance, Accessibility, and Best Practices.
- **Security:** Strict Content Security Policy (CSP), automated XSS/CSRF mitigations, zero client-side API key exposure.
- **WCAG Compliance:** WCAG 2.1 AA compliant color contrast and full keyboard navigation support.
`
  },
  {
    id: 'sample-vixora-tech-spec',
    name: 'Vixora Architecture & API Spec.md',
    mimeType: 'text/markdown',
    sourceType: 'markdown',
    modifiedTime: new Date(Date.now() - 86400000 * 2).toISOString(),
    size: '8.7 KB',
    snippet: 'Technical architectural specifications, REST API contracts, and database schema mappings for Vixora web developers.',
    isSelected: true,
    extractedContent: `# Vixora Web Development - Technical Architecture & API Specifications

## 1. System Topology
\`\`\`
[ Client Browser (React + Tailwind) ]
         │ (OAuth 2.0 Bearer Token)
         ▼
[ Express API Gateway (Port 3000 / Cloud Run) ]
    ├── /api/auth (User validation & Token verification)
    ├── /api/projects (CRUD operations, RBAC checks)
    ├── /api/analytics (Data aggregation & metrics)
    └── /api/ai (Gemini 3.7 Flash Integration)
\`\`\`

## 2. API Contract Endpoints
- \`GET /api/projects/:id\` - Fetch project metadata, milestones, and deliverable status.
- \`POST /api/projects/:id/milestones\` - Create or update milestone deliverables.
- \`POST /api/ai/summarize\` - Generate requirement summaries and risk assessments using Gemini.

## 3. Design System Specs
- **Color Palette:** Warm dark obsidian background (\`#0a0a0a\`), high-contrast pure typography, cobalt blue (\`#2563eb\`) accent, emerald (\`#10b981\`) for completed milestones.
- **Typography Scale:** Major Second ratio (1.125), body font 16px minimum with 1.6 line height.
`
  },
  {
    id: 'sample-vixora-roadmap',
    name: 'Vixora Web Development Milestones & Sprint Plan.csv',
    mimeType: 'text/csv',
    sourceType: 'google_sheet',
    modifiedTime: new Date(Date.now() - 86400000 * 5).toISOString(),
    size: '4.1 KB',
    snippet: 'Sprint planning and milestone roadmap for Vixora MVP and Phase 2 releases.',
    isSelected: true,
    extractedContent: `Phase,Milestone Title,Target Timeline,Key Deliverables,Priority
Sprint 1,Core Architecture & Auth,Week 1-2,"Setup React + Express boilerplate, Google OAuth, Firebase Auth integration",Critical
Sprint 2,Google Drive & Workspace Integration,Week 3,"Drive search API, document exporter, file preview cards",High
Sprint 3,AI Requirements Engine,Week 4,"Gemini 3.7 Flash server-side integration, PRD generation, requirement checklist",High
Sprint 4,UI/UX Polish & Accessibility,Week 5,"WCAG AA color audit, responsive bento layouts, export to Markdown/PDF",Medium
Sprint 5,QA & Cloud Run Production Release,Week 6,"Load testing, CSP security headers, custom domain deployment",High`
  }
];

export async function searchDriveFiles(
  accessToken: string,
  searchQuery: string = 'vixora'
): Promise<DriveFile[]> {
  try {
    // Build a flexible query to find files containing vixora or web development terms, or not trashed
    const safeQuery = searchQuery.trim().replace(/'/g, "\\'");
    let q = `trashed = false`;
    
    if (safeQuery.length > 0) {
      q += ` and (name contains '${safeQuery}' or fullText contains '${safeQuery}' or name contains 'requirements' or name contains 'web' or name contains 'spec' or name contains 'prd')`;
    }

    const fields = 'files(id, name, mimeType, webViewLink, iconLink, modifiedTime, size, description)';
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&pageSize=30&orderBy=modifiedTime desc`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication expired. Please sign in with Google again.');
      }
      const errText = await response.text();
      console.warn('Drive search with specific query returned error, falling back to broader query:', errText);
      
      // Fallback query to list recent active files
      const fallbackUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent('trashed = false')}&fields=${encodeURIComponent(fields)}&pageSize=25&orderBy=modifiedTime desc`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!fallbackRes.ok) {
        throw new Error(`Google Drive API error: ${fallbackRes.statusText}`);
      }
      const data = await fallbackRes.json();
      return formatDriveFiles(data.files || []);
    }

    const data = await response.json();
    let files: DriveFile[] = formatDriveFiles(data.files || []);

    // If query was very specific and returned 0 files, fetch broader files so user can still see and select files from drive
    if (files.length === 0) {
      const broadUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent('trashed = false')}&fields=${encodeURIComponent(fields)}&pageSize=20&orderBy=modifiedTime desc`;
      const broadRes = await fetch(broadUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (broadRes.ok) {
        const broadData = await broadRes.json();
        files = formatDriveFiles(broadData.files || []);
      }
    }

    return files;
  } catch (error: any) {
    console.error('Failed to search Google Drive:', error);
    throw error;
  }
}

function formatDriveFiles(rawFiles: any[]): DriveFile[] {
  return rawFiles.map((file) => {
    let sourceType: DriveFile['sourceType'] = 'other';
    if (file.mimeType.includes('google-apps.document')) sourceType = 'google_doc';
    else if (file.mimeType.includes('google-apps.spreadsheet')) sourceType = 'google_sheet';
    else if (file.mimeType.includes('text/plain') || file.mimeType.includes('text/markdown')) sourceType = 'text';
    else if (file.mimeType.includes('pdf')) sourceType = 'pdf';

    const isVixoraRelated = (file.name || '').toLowerCase().includes('vixora') ||
      (file.name || '').toLowerCase().includes('requirement') ||
      (file.name || '').toLowerCase().includes('spec') ||
      (file.name || '').toLowerCase().includes('web');

    return {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      webViewLink: file.webViewLink,
      iconLink: file.iconLink,
      modifiedTime: file.modifiedTime,
      size: file.size ? `${(parseInt(file.size, 10) / 1024).toFixed(1)} KB` : undefined,
      snippet: file.description || `Google Drive file: ${file.name}`,
      isSelected: isVixoraRelated,
      sourceType,
    };
  });
}

export async function fetchFileContent(
  accessToken: string,
  file: DriveFile
): Promise<string> {
  // If it's a sample mock file, return its extractedContent
  if (file.id.startsWith('sample-') && file.extractedContent) {
    return file.extractedContent;
  }

  try {
    let url = '';
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };

    if (file.mimeType === 'application/vnd.google-apps.document') {
      // Export Google Doc as plain text
      url = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`;
    } else if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
      // Export Google Sheet as CSV text
      url = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/csv`;
    } else if (file.mimeType.startsWith('text/') || file.mimeType === 'application/json') {
      // Direct text fetch
      url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
    } else {
      // For PDFs or other binary files, return metadata + preview information
      return `[File Name: ${file.name} | Type: ${file.mimeType} | Modified: ${file.modifiedTime || 'N/A'}] (Binary file metadata fetched from Google Drive)`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.warn(`Could not export file ${file.name} (${file.id}):`, response.statusText);
      return `[File: ${file.name}] Could not extract full text directly. Status: ${response.statusText}`;
    }

    const text = await response.text();
    return text.slice(0, 50000); // Guard token length limit
  } catch (error: any) {
    console.error(`Error fetching content for ${file.name}:`, error);
    return `[File: ${file.name}] Content extraction error: ${error.message}`;
  }
}
