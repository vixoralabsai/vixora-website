/**
 * Vixora Academy & Digital Hub — Unified Email Component UI Engine
 *
 * Built with production-grade HTML email standards:
 * - Bulletproof responsive table architecture (compatible with Gmail, Apple Mail, Outlook, Yahoo)
 * - Branded dark-mode aesthetic with neon accents (Vixora Purple, Cyan, Emerald)
 * - Retina-ready high-resolution logo header with styled typography fallback
 * - Hidden inbox preheader text to ensure clean preview snippets
 * - Reusable components for Onboarding, Password Resets, Certificates, and Alerts
 */

import { BRAND_CONFIG } from '../src/data/brandConfig.js';

// Canonical URLs
const LOGO_URL = 'https://academy.vixoradigitalhub.com/images/vixora-academy-logo.png';
const ACADEMY_URL = 'https://academy.vixoradigitalhub.com';
const PORTAL_URL = 'https://academy.vixoradigitalhub.com/pages/student-portal';

export interface BaseEmailProps {
  previewText?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'info' | 'warning' | 'purple';
  title: string;
  subtitle?: string;
  bodyContentHtml: string;
  primaryCta?: {
    label: string;
    url: string;
  };
  secondaryCta?: {
    label: string;
    url: string;
  };
  footerNote?: string;
}

/**
 * Generates hidden preview text (preheader) with zero-width whitespace padding
 * to prevent email clients from pulling random HTML markup into the inbox preview.
 */
function renderPreheader(text: string): string {
  if (!text) return '';
  return `
    <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
      ${text}
      &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>
  `;
}

/**
 * Master Responsive Email Container Component
 */
export function renderEmailLayout(props: BaseEmailProps): string {
  const {
    previewText = '',
    badgeText,
    badgeVariant = 'success',
    title,
    subtitle,
    bodyContentHtml,
    primaryCta,
    secondaryCta,
    footerNote
  } = props;

  // Badge styling variants
  const badgeStyles = {
    success: 'background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399;',
    info: 'background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8;',
    warning: 'background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24;',
    purple: 'background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4); color: #c084fc;'
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
              ` : ''}

              <!-- Title & Subtitle -->
              <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1.35; letter-spacing: -0.3px;">
                ${title}
              </h1>

              ${subtitle ? `
                <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                  ${subtitle}
                </p>
              ` : ''}

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
              ` : ''}

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
              ` : ''}

            </td>
          </tr>

          <!-- Help & Support Strip -->
          <tr>
            <td class="mobile-padding" style="padding: 16px 30px; background-color: #0e0725; border-top: 1px solid #200f42; border-bottom: 1px solid #200f42;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                    💡 Need assistance? Contact our Admissions Desk directly at
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
              ` : ''}

              <p style="margin: 14px 0 0 0; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} Vixora Digital Hub. All rights reserved.
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

/**
 * 1. STUDENT ONBOARDING & TUITION PAYMENT CONFIRMATION EMAIL
 * Designed for immediate student activation, credential delivery, and cohort orientation.
 */
export function buildStudentOnboardingEmail(params: {
  customerName: string;
  customerEmail: string;
  courseTitle: string;
  tuitionNaira: number;
  reference: string;
  nextCohortDate: string;
  channel?: string | null;
  studentCode: string;
  generatedTempPassword?: string | null;
  directPasswordSetupLink?: string | null;
  whatsappUrl: string;
}): { html: string; text: string; subject: string } {
  const {
    customerName,
    customerEmail,
    courseTitle,
    tuitionNaira,
    reference,
    nextCohortDate,
    channel = 'card',
    studentCode,
    generatedTempPassword,
    directPasswordSetupLink,
    whatsappUrl
  } = params;

  const subject = `🎓 Student Account & Admission Confirmed: ${courseTitle} (₦${tuitionNaira.toLocaleString()})`;
  const portalUrl = PORTAL_URL;
  const actionButtonUrl = directPasswordSetupLink || portalUrl;

  const bodyContentHtml = `
    <!-- Personalized Admission Notice -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #120930; border: 1px solid #3b1d7a; border-radius: 12px; margin-bottom: 22px;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
            Dear <strong style="color: #ffffff;">${customerName}</strong>,<br /><br />
            Congratulations! Your tuition payment of <strong style="color: #34d399;">₦${tuitionNaira.toLocaleString()} NGN</strong> has been verified. You are officially enrolled in <strong style="color: #a855f7;">${courseTitle}</strong>. Your student account is active and your seat in the upcoming cohort is secured.
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
                  🔑 Your Student Portal Credentials
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
                ${directPasswordSetupLink 
                  ? '⚡ <strong>Instant Access:</strong> Click the setup button below to pick your permanent password in one click without re-typing.' 
                  : 'Log in anytime at <a href="' + portalUrl + '" style="color: #38bdf8; text-decoration: none;">' + portalUrl + '</a>.'}
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
                ₦${tuitionNaira.toLocaleString()} NGN
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13px; color: #94a3b8;">Payment Channel:</td>
              <td align="right" style="padding: 4px 0; font-size: 13px; color: #e2e8f0; text-transform: capitalize;">
                ${channel || 'Online Checkout'}
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
            📋 Your Next Steps to Get Started
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
    badgeText: '✓ Verified Payment & Official Admission',
    badgeVariant: 'success',
    title: `Welcome to ${courseTitle}`,
    subtitle: `Your official tuition payment receipt, student matriculation credentials, and portal access instructions.`,
    bodyContentHtml,
    primaryCta: {
      label: directPasswordSetupLink ? '🚀 Set Your Password & Access Student Portal' : '🚀 Log In to Your Student Portal',
      url: actionButtonUrl
    },
    secondaryCta: {
      label: '💬 Join Admissions WhatsApp Cohort Group',
      url: whatsappUrl
    },
    footerNote: 'This is an official transactional message regarding your verified enrollment on Vixora Academy.'
  });

  const text = `
Welcome to Vixora Academy!
Admission Confirmed for: ${courseTitle}

Dear ${customerName},
Your tuition payment of ₦${tuitionNaira.toLocaleString()} NGN has been verified.

YOUR STUDENT CREDENTIALS:
- Student ID / Code: ${studentCode}
- Login Email: ${customerEmail}
${generatedTempPassword ? `- Initial Password: ${generatedTempPassword}\n` : ''}
SET YOUR PASSWORD & ACCESS YOUR PORTAL:
${actionButtonUrl}

PAYMENT RECEIPT:
- Reference: ${reference}
- Amount: ₦${tuitionNaira.toLocaleString()} NGN
- Cohort Start: ${nextCohortDate}

WHATSAPP ADMISSIONS GROUP:
${whatsappUrl}

Vixora Digital Hub
${BRAND_CONFIG.email}
  `.trim();

  return { html, text, subject };
}

/**
 * 2. STUDENT PASSWORD RESET & SECURITY VERIFICATION EMAIL
 */
export function buildPasswordResetEmail(params: {
  studentName?: string;
  email: string;
  otpCode: string;
  recoveryUrl: string;
}): { html: string; text: string; subject: string } {
  const { studentName = 'Student', email, otpCode, recoveryUrl } = params;
  const subject = `🔑 Password Reset & Security Verification Code: ${otpCode}`;

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
    badgeText: '🔒 Security & Access Verification',
    badgeVariant: 'warning',
    title: 'Reset Your Student Password',
    subtitle: 'Use your secure one-time code or click the direct link below to set a new password.',
    bodyContentHtml,
    primaryCta: {
      label: '🔑 Set New Password in One Click',
      url: recoveryUrl
    },
    footerNote: 'If you did not request this password reset, please ignore this email or notify admissions immediately.'
  });

  const text = `
Vixora Academy — Password Reset
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

/**
 * 3. DIGITAL CERTIFICATE AWARD & VERIFICATION EMAIL
 */
export function buildCertificateAwardEmail(params: {
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  certificateId: string;
  grade: string;
  issuedDate: string;
  verificationUrl: string;
}): { html: string; text: string; subject: string } {
  const {
    studentName,
    courseTitle,
    certificateId,
    grade,
    issuedDate,
    verificationUrl
  } = params;

  const subject = `🎓 Official Certificate of Completion: ${courseTitle} (${certificateId})`;

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
                  🏆 Verifiable Academic Credential
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
    badgeText: '✓ Verified Academic Credential Issued',
    badgeVariant: 'success',
    title: 'Certificate of Completion Awarded',
    subtitle: 'Your verified digital certificate has been issued and entered into the Vixora Academy registry.',
    bodyContentHtml,
    primaryCta: {
      label: '🎓 View & Verify Digital Certificate',
      url: verificationUrl
    },
    footerNote: 'This certificate is cryptographically recorded in the Vixora Digital Hub registry and can be verified by employers worldwide.'
  });

  const text = `
Vixora Academy — Certificate of Completion
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
