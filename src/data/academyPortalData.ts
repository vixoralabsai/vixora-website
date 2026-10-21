export interface CertificateCompetency {
  name: string;
  category: string;
}

export interface Certificate {
  id: string; // e.g. "VA-2026-9042-ENG"
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  trackBadge: string;
  specialization: string;
  grade: string;
  honors?: string;
  capstoneTitle: string;
  capstoneScore: string;
  issueDate: string; // e.g. "September 11, 2026"
  completionDate: string;
  durationWeeks: number;
  credentialHash: string; // e.g. "SHA256: 8f9b2...41a"
  verificationUrl: string;
  instructorName: string;
  instructorTitle: string;
  directorName: string;
  directorTitle: string;
  competencies: string[];
  status: 'active' | 'revoked';
  emailSentCount: number;
  lastEmailSentAt?: string;
}

export interface StudentCourse {
  courseId: string;
  title: string;
  badge: string;
  progressPercent: number;
  status: 'in-progress' | 'completed' | 'enrolled';
  cohort: string;
  instructor: string;
  completedModules: number;
  totalModules: number;
  certificateId?: string;
}

export interface StudentProfile {
  id: string; // e.g. "STU-8841"
  name: string;
  email: string;
  avatarUrl?: string;
  enrolledDate: string;
  role: 'student' | 'alumni' | 'instructor' | 'admin';
  courses: StudentCourse[];
}

export interface EmailDispatchLog {
  id: string;
  certificateId?: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  status: 'delivered' | 'queued' | 'failed' | 'simulated';
  provider?: 'smtp' | 'resend' | 'simulated';
  timestamp: string;
  deliveryLatencyMs: number;
  previewHtml: string;
  previewText?: string;
  messageId?: string;
  error?: string;
  gmailComposeUrl?: string;
  mailtoUrl?: string;
  infoNotice?: string;
  deliveredToInternet?: boolean;
  hasAttachment?: boolean;
  attachmentName?: string;
}

export interface RateLimitState {
  remaining: number;
  limit: number;
  resetInSeconds: number;
  isLimited: boolean;
}

// Supabase PostgreSQL Database Row Mapping Interfaces
export interface SupabaseStudentRow {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  enrolled_date: string;
  role: 'student' | 'alumni' | 'instructor' | 'admin';
  created_at?: string;
}

export interface SupabaseCourseRow {
  id: string;
  title: string;
  track_badge: string;
  instructor: string;
  cohort: string;
  total_modules: number;
  created_at?: string;
}

export interface SupabaseEnrollmentRow {
  id?: string | number;
  student_id: string;
  course_id: string;
  status: 'in-progress' | 'completed' | 'enrolled';
  progress_percent: number;
  completed_modules: number;
  certificate_id?: string | null;
  created_at?: string;
}

export interface SupabaseCertificateRow {
  id: string;
  student_name: string;
  student_email: string;
  course_id: string;
  course_title: string;
  track_badge?: string | null;
  specialization?: string | null;
  grade: string;
  honors?: string | null;
  capstone_title?: string | null;
  capstone_score?: string | null;
  issue_date: string;
  completion_date?: string | null;
  duration_weeks?: number | null;
  credential_hash: string;
  verification_url: string;
  instructor_name?: string | null;
  instructor_title?: string | null;
  director_name?: string | null;
  director_title?: string | null;
  status: 'active' | 'revoked';
  email_sent_count: number;
  last_email_sent_at?: string | null;
  created_at?: string;
}

export interface SupabaseCompetencyRow {
  id?: string | number;
  certificate_id: string;
  name: string;
  category?: string | null;
  created_at?: string;
}

export interface SupabaseEmailLogRow {
  id: string;
  certificate_id?: string | null;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  status: 'delivered' | 'queued' | 'failed' | 'simulated';
  provider?: 'smtp' | 'resend' | 'simulated' | null;
  timestamp: string;
  delivery_latency_ms: number;
  preview_html?: string | null;
  preview_text?: string | null;
  message_id?: string | null;
  error?: string | null;
  gmail_compose_url?: string | null;
  mailto_url?: string | null;
  info_notice?: string | null;
  delivered_to_internet?: boolean | null;
  has_attachment?: boolean | null;
  attachment_name?: string | null;
  created_at?: string;
}

// Initial Mock Registry of Certified Graduates
export const SEED_CERTIFICATES: Certificate[] = [
  {
    id: 'VA-2026-9042-ENG',
    studentName: 'David A. Okonjo',
    studentEmail: 'student@vixora.com',
    courseId: 'ai-automation-digital-business-systems',
    courseTitle: 'Autonomous AI Systems & Scalable Architecture',
    trackBadge: 'Enterprise Track',
    specialization: 'Multi-Agent LLM Pipelines & Cloud Orchestration',
    grade: 'High Distinction',
    honors: 'Top 3% of Global Cohort',
    capstoneTitle: 'Self-Healing Enterprise Support & Document Intelligence Swarm',
    capstoneScore: '98.5 / 100',
    issueDate: 'September 11, 2026',
    completionDate: 'September 2026',
    durationWeeks: 12,
    credentialHash: 'e9b48c310fa27d50bc12948ff8a1762c9082d41ba358b3c99026e7fa40d21a91',
    verificationUrl: 'https://academy.vixoradigitalhub.com/verify?id=VA-2026-9042-ENG',
    instructorName: 'Dr. Adebayo Vance',
    instructorTitle: 'Principal AI Architect, Vixora Labs',
    directorName: 'Sarumi Hammad',
    directorTitle: 'Dean, Vixora Academy',
    competencies: [
      'Multi-Agent System Orchestration (LangChain / Gemini)',
      'Deterministic Enterprise Tool Calling & Function Execution',
      'Scalable Containerized Cloud Architecture (Cloud Run & Docker)',
      'Vector Embeddings, RAG & Semantic Context Caching',
      'Production API Hardening & Token Latency Optimization'
    ],
    status: 'active',
    emailSentCount: 1,
    lastEmailSentAt: '2026-09-11T12:00:00Z'
  },
  {
    id: 'VA-2026-8812-AUT',
    studentName: 'Alex K. Chen',
    studentEmail: 'alex.chen@vixora.com',
    courseId: 'data-analysis-cohort',
    courseTitle: 'Data Analytics & Business Intelligence Mastery',
    trackBadge: 'Analytics Track',
    specialization: 'Advanced SQL, Automated ETL & Predictive Dashboards',
    grade: 'Distinction',
    honors: 'Excellence in Production Data Modeling',
    capstoneTitle: 'Predictive Multi-Tenant Revenue Forecasting & Churn Diagnostics',
    capstoneScore: '96.2 / 100',
    issueDate: 'August 28, 2026',
    completionDate: 'August 2026',
    durationWeeks: 16,
    credentialHash: '4a7b92c10ef18d40ba22849ef9b2671a8073e52bb467a2b88137f6ec51c32b82',
    verificationUrl: 'https://academy.vixoradigitalhub.com/verify?id=VA-2026-8812-AUT',
    instructorName: 'Marcus Sterling',
    instructorTitle: 'Head of Data Systems, Vixora Analytics',
    directorName: 'Sarumi Hammad',
    directorTitle: 'Dean, Vixora Academy',
    competencies: [
      'High-Scale Relational Data Schemas & Indexing (PostgreSQL)',
      'Dynamic Automated ETL Pipelines with Airflow & Python',
      'Executive KPI Dashboards & Real-Time Aggregations',
      'Statistical Cohort Analysis & Retention Modeling'
    ],
    status: 'active',
    emailSentCount: 1,
    lastEmailSentAt: '2026-08-28T15:30:00Z'
  },
  {
    id: 'VA-2026-7731-DEV',
    studentName: 'Sarah Jenkins',
    studentEmail: 'sarah.j@vixora.com',
    courseId: 'complete-ai-digital-skills-freelancing-mastery',
    courseTitle: 'AI Digital Skills & Freelance Agency Systems',
    trackBadge: 'Practitioner Track',
    specialization: 'Autonomous Client Workflows, Copywriting & Media Automation',
    grade: 'Certified Professional',
    honors: 'Rapid Client Implementation Award',
    capstoneTitle: 'Automated Real Estate Lead Qualification & Video Prospecting Pipeline',
    capstoneScore: '94.0 / 100',
    issueDate: 'August 14, 2026',
    completionDate: 'August 2026',
    durationWeeks: 6,
    credentialHash: '3c8e11b29fa07d30ab11738ef8a1560c7061d30ba246b1a77015e5db40b11a71',
    verificationUrl: 'https://academy.vixoradigitalhub.com/verify?id=VA-2026-7731-DEV',
    instructorName: 'Elena Rostova',
    instructorTitle: 'Lead Growth & Automation Strategist',
    directorName: 'Sarumi Hammad',
    directorTitle: 'Dean, Vixora Academy',
    competencies: [
      'Prompt Engineering & Multi-Modal Content Generation',
      'Zapier, Make & n8n Enterprise Workflow Automation',
      'Client Discovery, Contract Scoping & Retainer Architecture',
      'High-Conversion Landing Page & Sales Funnel Optimization'
    ],
    status: 'active',
    emailSentCount: 1,
    lastEmailSentAt: '2026-08-14T10:15:00Z'
  }
];

// Seed Student Profiles
export const SEED_STUDENTS: StudentProfile[] = [
  {
    id: 'STU-9042',
    name: 'David A. Okonjo',
    email: 'student@vixora.com',
    enrolledDate: 'June 2026',
    role: 'alumni',
    courses: [
      {
        courseId: 'ai-automation-digital-business-systems',
        title: 'Autonomous AI Systems & Scalable Architecture',
        badge: 'Enterprise Track',
        progressPercent: 100,
        status: 'completed',
        cohort: 'Cohort 2026-A',
        instructor: 'Dr. Adebayo Vance',
        completedModules: 12,
        totalModules: 12,
        certificateId: 'VA-2026-9042-ENG'
      },
      {
        courseId: 'data-analysis-cohort',
        title: 'Data Analytics & Business Intelligence Mastery',
        badge: 'Analytics Track',
        progressPercent: 45,
        status: 'in-progress',
        cohort: 'Cohort 2026-B',
        instructor: 'Marcus Sterling',
        completedModules: 7,
        totalModules: 16
      }
    ]
  },
  {
    id: 'STU-8812',
    name: 'Alex K. Chen',
    email: 'alex.chen@vixora.com',
    enrolledDate: 'May 2026',
    role: 'alumni',
    courses: [
      {
        courseId: 'data-analysis-cohort',
        title: 'Data Analytics & Business Intelligence Mastery',
        badge: 'Analytics Track',
        progressPercent: 100,
        status: 'completed',
        cohort: 'Cohort 2026-A',
        instructor: 'Marcus Sterling',
        completedModules: 16,
        totalModules: 16,
        certificateId: 'VA-2026-8812-AUT'
      }
    ]
  },
  {
    id: 'STU-7731',
    name: 'Sarah Jenkins',
    email: 'sarah.j@vixora.com',
    enrolledDate: 'July 2026',
    role: 'alumni',
    courses: [
      {
        courseId: 'complete-ai-digital-skills-freelancing-mastery',
        title: 'AI Digital Skills & Freelance Agency Systems',
        badge: 'Practitioner Track',
        progressPercent: 100,
        status: 'completed',
        cohort: 'Cohort 2026-Summer',
        instructor: 'Elena Rostova',
        completedModules: 6,
        totalModules: 6,
        certificateId: 'VA-2026-7731-DEV'
      }
    ]
  }
];

// Generates an automated email HTML document with the Vixora Academy logo
export function generateCertificateEmailHtml(cert: Certificate): string {
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
                      <img src="https://academy.vixoradigitalhub.com/images/vixora-academy-logo.jpg" alt="Vixora Academy — Learn. Apply. Earn." style="height: 64px; width: auto; max-width: 240px; display: block; border-radius: 8px;" />
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
                ${cert.competencies.map(c => `<li>${c}</li>`).join('')}
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 26px 34px; text-align: center; font-size: 11px; color: #5F6078; border-top: 1px solid #E5E5F0;">
              <p style="margin: 0 0 6px 0;">
                <strong>Vixora Academy</strong> • Silicon Corridor & Cloud Innovation Center
              </p>
              <p style="margin: 0 0 6px 0; color: #480878; font-weight: 600;">
                Academic Leadership: Dean Sarumi Hammad
              </p>
              <p style="margin: 0 0 6px 0;">
                Official Subdomain: <a href="https://academy.vixoradigitalhub.com" style="color: #480878; text-decoration: none;">academy.vixoradigitalhub.com</a> • Main Hub: <a href="https://vixoradigitalhub.com" style="color: #480878; text-decoration: none;">vixoradigitalhub.com</a>
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

// Generates a clean plain-text email message for mailto and Gmail compose
export function generateCertificateEmailText(cert: Certificate): string {
  return `VIXORA ACADEMY - OFFICIAL CERTIFICATE OF COMPLETION

Dear ${cert.studentName},

Congratulations! The Academic Directorate of Vixora Academy is pleased to confirm that you have successfully fulfilled all curriculum requirements, practical examinations, and the production capstone for:

PROGRAM TRACK: ${cert.courseTitle}
HONORS / STANDING: ${cert.grade} (${cert.honors || 'Distinction'})
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
${cert.competencies.map(c => `• ${c}`).join('\n')}

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

// Generates an automated password recovery email HTML document with the Vixora logo
export function generatePasswordResetEmailHtml(params: {
  email: string;
  recipientName: string;
  actionLink: string;
  otpCode?: string;
  portal: 'student' | 'admin';
}): string {
  const isStudent = params.portal === 'student';
  const roleTitle = isStudent ? 'Academy Student Account' : 'Enterprise Administrator Account';
  const accentGradient = isStudent
    ? 'linear-gradient(135deg, #000048 0%, #480878 55%, #7000F8 100%)'
    : 'linear-gradient(135deg, #0e0724 0%, #3b0764 55%, #6b21a8 100%)';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Recovery — Vixora Digital Hub</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F7FC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #000048;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F7F7FC; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E5E5F0; box-shadow: 0 10px 35px rgba(0, 0, 72, 0.08); overflow: hidden;">
          
          <!-- Top Header Brand Ribbon -->
          <tr>
            <td style="background: ${accentGradient}; padding: 32px 30px; text-align: center;">
              <table role="presentation" align="center" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 10px;">
                    <div style="background-color: #FFFFFF; padding: 10px 20px; border-radius: 14px; display: inline-block; box-shadow: 0 6px 20px rgba(0,0,0,0.2);">
                      <img src="https://academy.vixoradigitalhub.com/images/vixora-academy-logo.jpg" alt="Vixora Digital Hub" style="height: 52px; width: auto; max-width: 220px; display: block; border-radius: 6px;" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <div style="color: #FFFFFF; font-size: 18px; font-weight: 800; letter-spacing: 0.5px; margin-top: 6px;">VIXORA DIGITAL HUB</div>
                    <div style="color: #E0C7FF; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px;">
                      Supabase Cryptographic Auth Service
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Area -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #000048; text-align: center;">
                Password Recovery Request
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #4B5563;">
                Hello <strong>${params.recipientName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #4B5563;">
                We received a verified request to reset the password for your <strong>${roleTitle}</strong> registered with <strong>${params.email}</strong>.
              </p>

              <!-- Reset Button -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${params.actionLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #7000F8 0%, #480878 100%); color: #FFFFFF; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 36px; border-radius: 12px; box-shadow: 0 6px 20px rgba(112, 0, 248, 0.35); letter-spacing: 0.3px;">
                  Set New Password &rarr;
                </a>
              </div>

              ${params.otpCode ? `
              <!-- 6-Digit OTP Code -->
              <div style="margin: 24px 0; padding: 18px; background-color: #F8F5FF; border: 1px dashed #B87CF8; border-radius: 14px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #7000F8; text-transform: uppercase; letter-spacing: 1px;">
                  Or Enter This 6-Digit Verification Code in Your Browser:
                </p>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; color: #000048; letter-spacing: 6px;">
                  ${params.otpCode}
                </div>
                <p style="margin: 8px 0 0 0; font-size: 11px; color: #6B7280;">
                  Enter this code on the portal recovery screen to update your password immediately.
                </p>
              </div>
              ` : ''}

              <!-- Security Notice -->
              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #E5E5F0;">
                <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.5; color: #6B7280;">
                  <strong>Security Note:</strong> This reset link and verification code expire in <strong>60 minutes</strong>. If you did not request this password reset, no action is required and your existing password remains safe.
                </p>
                <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #9CA3AF; word-break: break-all;">
                  Direct link: <a href="${params.actionLink}" style="color: #7000F8; text-decoration: underline;">${params.actionLink}</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F7F7FC; padding: 20px 32px; text-align: center; border-top: 1px solid #E5E5F0;">
              <p style="margin: 0; font-size: 12px; color: #6B7280;">
                &copy; ${new Date().getFullYear()} Vixora Digital Hub. Learn. Apply. Earn. All rights reserved.
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

export function generatePasswordResetEmailText(params: {
  email: string;
  recipientName: string;
  actionLink: string;
  otpCode?: string;
  portal: 'student' | 'admin';
}): string {
  return `VIXORA DIGITAL HUB — PASSWORD RESET

Hello ${params.recipientName},

We received a request to reset the password for your ${params.portal === 'admin' ? 'Administrator' : 'Student'} account (${params.email}).

Click this secure link to set your new password:
${params.actionLink}

${params.otpCode ? `Or use this 6-digit verification code: ${params.otpCode}\n` : ''}
This link and code expire in 60 minutes. If you did not make this request, please disregard this email.

— Vixora Security Directorate
vixoradigitalhub.com
`;
}


