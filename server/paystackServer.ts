import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getSupabaseAdmin } from './supabaseAdmin.js';
import { dispatchGenericEmail } from './emailService.js';
import { BRAND_CONFIG, getWhatsAppUrl } from '../src/data/brandConfig.js';
import { findCanonicalCourse, type CanonicalCourse } from './payments/courseCatalog.js';
import { buildStudentOnboardingEmail } from './emailTemplates.js';

export const paystackRouter = Router();

// Official Paystack API Base URL
const PAYSTACK_API_BASE = 'https://api.paystack.co';

// ==============================================================================
// 1. Configuration & Key Management
// ==============================================================================

export function getPaystackSecretKey(): string {
  return (process.env.PAYSTACK_SECRET_KEY || '').trim();
}

export function getPaystackPublicKey(): string {
  return (process.env.PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY || '').trim();
}

export function isPaystackConfigured(): boolean {
  const key = getPaystackSecretKey();
  return Boolean(key && (key.startsWith('sk_test_') || key.startsWith('sk_live_')));
}

function isProductionPaymentEnvironment(): boolean {
  return process.env.NODE_ENV === 'production' ||
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
}

// ==============================================================================
// 2. Sliding Window Rate Limiter
// ==============================================================================

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class SlidingWindowRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private windowMs: number;
  private max: number;
  private prefix: string;

  constructor(options: { windowMs: number; max: number; prefix?: string }) {
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.prefix = options.prefix || 'rl';
  }

  check(key: string): { allowed: boolean; remaining: number; resetInSeconds: number; limit: number } {
    const now = Date.now();
    const fullKey = `${this.prefix}:${key}`;
    const record = this.store.get(fullKey);

    if (!record || now > record.resetTime) {
      const resetTime = now + this.windowMs;
      this.store.set(fullKey, { count: 1, resetTime });
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

  reset(key?: string) {
    if (key) {
      this.store.delete(`${this.prefix}:${key}`);
    } else {
      this.store.clear();
    }
  }
}

// Dedicated Rate Limiters as specified:
// Paystack init: 5 requests / 10 minutes per IP+email
export const payInitRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  prefix: 'pay_init'
});

// Paystack verify: 15 requests / 1 minute per IP
export const payVerifyRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1000,
  max: 15,
  prefix: 'pay_verify'
});

// ==============================================================================
// 3. Safe Client IP Extraction
// ==============================================================================

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

// ==============================================================================
// 4. Strict Input Validation Helpers
// ==============================================================================

export function isPlainObject(obj: unknown): obj is Record<string, any> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

export function hasPrototypePollutionKeys(obj: Record<string, any>): boolean {
  return Object.keys(obj).some((key) => key === '__proto__' || key === 'constructor' || key === 'prototype');
}

export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && email.trim().length <= 120;
}

export function isValidTransactionReference(ref: unknown): boolean {
  if (typeof ref !== 'string') return false;
  return /^[A-Za-z0-9_\-.:]{4,80}$/.test(ref.trim());
}

export function sanitizeText(val: unknown, maxLen = 120): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen).replace(/[<>]/g, '');
}

// ==============================================================================
// 5. In-Memory Store for Fallback / Testing
// ==============================================================================

export interface PaymentRecord {
  id: string; // transaction reference
  student_id: string | null;
  course_id: string;
  amount: number; // in Naira (e.g. 60000.00)
  amount_kobo: number; // in kobo (e.g. 6000000)
  currency: 'NGN';
  channel: string | null;
  status: 'pending' | 'success' | 'failed' | 'abandoned';
  fulfillment_status: 'pending' | 'fulfilled' | 'failed';
  fulfillment_error: string | null;
  email_dispatched_at: string | null;
  paystack_transaction_id: string | null;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  paid_at: string | null;
  raw_response: any;
  created_at: string;
  updated_at: string;
}

export const fallbackPaymentsStore = new Map<string, PaymentRecord>();
export const simulateEnrollmentFailureForTesting = new Set<string>();

export function clearPaymentStoresForTesting() {
  fallbackPaymentsStore.clear();
  simulateEnrollmentFailureForTesting.clear();
  payInitRateLimiter.reset();
  payVerifyRateLimiter.reset();
}

// ==============================================================================
// 6. Sanitization of Gateway Response (No secrets or raw credentials)
// ==============================================================================

export function sanitizePaystackResponse(data: any): any {
  if (!data || typeof data !== 'object') return null;
  const sanitized = { ...data };

  // Retain non-sensitive authorization metadata, remove secrets
  if (sanitized.authorization && typeof sanitized.authorization === 'object') {
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

// ==============================================================================
// 7. Optional Authenticated User Extraction
// ==============================================================================

export async function extractOptionalAuthUser(req: Request): Promise<{ id: string; email: string } | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
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

// ==============================================================================
// 8. Durable & Idempotent Fulfillment Engine
// ==============================================================================

export interface FulfillmentResult {
  verified: boolean;
  alreadyFulfilled?: boolean;
  payment?: {
    reference: string;
    status: string;
    amount: number;
    currency: string;
    channel: string | null;
    paidAt: string | null;
    studentName: string | null;
    studentEmail: string;
    courseId: string;
    courseTitle: string;
    emailDispatchedAt?: string | null;
  };
  error?: string;
  code?: string;
  status?: number;
}

/**
 * Self-healing helper: Ensures the canonical course exists in the Supabase 'courses' table
 * before creating payments or enrollments. This guarantees foreign key
 * constraints (e.g. "enrollments_course_id_fkey" and "payments_course_id_fkey") are never violated.
 */
export async function ensureCourseRecordInDatabase(
  canonicalCourse: CanonicalCourse,
  supabase: any
): Promise<string> {
  if (!supabase) return canonicalCourse.id;

  try {
    const { data: matchedCourse, error: lookupError } = await supabase
      .from('courses')
      .select('id')
      .or(`id.eq.${canonicalCourse.id},slug.eq.${canonicalCourse.slug}`)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (matchedCourse?.id) {
      return matchedCourse.id;
    }

    // Auto-provision course record in Supabase
    const coursePayload = {
      id: canonicalCourse.id,
      slug: canonicalCourse.slug,
      title: canonicalCourse.title,
      badge: canonicalCourse.tuitionDisplay || `₦${canonicalCourse.nairaAmount.toLocaleString()}`,
      total_modules: canonicalCourse.totalModules || 4,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('courses')
      .upsert(coursePayload, { onConflict: 'id' })
      .select('id')
      .maybeSingle();

    if (insertErr) throw insertErr;
    if (inserted?.id) {
      return inserted.id;
    }
    throw new Error(`Course record could not be resolved for "${canonicalCourse.id}".`);
  } catch (err) {
    console.error('[Course record resolution failed]:', err);
    throw new Error('Course record could not be confirmed in the database.');
  }
}

export async function processPaymentFulfillment(
  reference: string,
  verifiedPaystackData?: any
): Promise<FulfillmentResult> {
  if (!isValidTransactionReference(reference)) {
    return {
      verified: false,
      error: 'Invalid transaction reference format.',
      code: 'INVALID_REFERENCE',
      status: 400
    };
  }

  const supabase = getSupabaseAdmin();

  // Production fulfillment must never use an ephemeral in-memory payment as its source of truth.
  if (!supabase && isProductionPaymentEnvironment()) {
    return {
      verified: false,
      error: 'Payment database is not configured. The transaction cannot be fulfilled safely yet.',
      code: 'DATABASE_UNCONFIGURED',
      status: 503
    };
  }

  // 1. Check existing payment record in database or fallback store
  let existingPayment: PaymentRecord | null = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', reference)
        .maybeSingle();
      if (error) {
        console.error('[Supabase payments query failed]:', error);
        return {
          verified: false,
          error: 'Payment record could not be read from the database. Please retry verification.',
          code: 'PAYMENT_RECORD_READ_FAILED',
          status: 503
        };
      }
      if (data) {
        existingPayment = data;
        fallbackPaymentsStore.set(reference, data);
      }
    } catch (dbErr) {
      console.error('[Supabase payments query exception]:', dbErr);
      return {
        verified: false,
        error: 'Payment database is unavailable. Please retry verification.',
        code: 'DATABASE_UNAVAILABLE',
        status: 503
      };
    }
  }

  if (!existingPayment && !supabase) {
    existingPayment = fallbackPaymentsStore.get(reference) || null;
  }

  // Idempotency: Only short-circuit if payment is already 'success' AND course enrollment succeeded
  if (
    existingPayment &&
    existingPayment.status === 'success' &&
    existingPayment.fulfillment_status === 'fulfilled' &&
    !simulateEnrollmentFailureForTesting.has(reference)
  ) {
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
        courseTitle: canonical?.title || 'Vixora Academy Cohort',
        emailDispatchedAt: existingPayment.email_dispatched_at
      }
    };
  }

  // 2. Fetch authoritative transaction status from Paystack API if not provided
  let paystackData = verifiedPaystackData;

  if (!paystackData) {
    const secretKey = getPaystackSecretKey();
    if (!secretKey) {
      return {
        verified: false,
        error: 'Paystack Secret Key is not configured on the server.',
        code: 'PAYSTACK_NOT_CONFIGURED',
        status: 503
      };
    }

    try {
      const response = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        }
      });

      const json: any = await response.json();

      if (!response.ok || !json.status || !json.data) {
        return {
          verified: false,
          error: json.message || 'Transaction could not be verified on Paystack.',
          code: 'PAYSTACK_VERIFY_FAILED',
          status: 404
        };
      }

      paystackData = json.data;
    } catch (netErr: any) {
      return {
        verified: false,
        error: 'Network error connecting to Paystack API.',
        code: 'PAYSTACK_NETWORK_ERROR',
        status: 502
      };
    }
  }

  // 3. Strict verification of transaction state & parameters
  // FIX 3: Record failed/abandoned transactions in the database rather than leaving as pending
  if (paystackData.status !== 'success') {
    let mappedStatus: 'failed' | 'abandoned' | 'pending' = 'pending';
    if (paystackData.status === 'failed' || paystackData.status === 'abandoned') {
      mappedStatus = paystackData.status;
    }

    const failedUpdate = {
      status: mappedStatus,
      raw_response: sanitizePaystackResponse(paystackData),
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('payments').update(failedUpdate).eq('id', reference);
      } catch (dbErr) {
        console.warn('[Supabase failed status update]:', dbErr);
      }
    }

    if (fallbackPaymentsStore.has(reference)) {
      const rec = fallbackPaymentsStore.get(reference)!;
      rec.status = mappedStatus;
      rec.raw_response = sanitizePaystackResponse(paystackData);
      rec.updated_at = new Date().toISOString();
    }

    return {
      verified: false,
      error: `Payment is not successful (status: ${paystackData.status}).`,
      code: 'PAYMENT_NOT_SUCCESSFUL',
      status: 400
    };
  }

  // Verify Currency strictly matches NGN
  if (paystackData.currency !== 'NGN') {
    return {
      verified: false,
      error: `Currency mismatch: Expected NGN, received ${paystackData.currency}.`,
      code: 'CURRENCY_MISMATCH',
      status: 400
    };
  }

  // Find canonical course from stored payment record or transaction metadata
  const courseId =
    existingPayment?.course_id ||
    paystackData.metadata?.courseId ||
    paystackData.metadata?.course_id;

  const canonicalCourse = findCanonicalCourse(courseId);
  if (!canonicalCourse) {
    return {
      verified: false,
      error: 'Cannot fulfill payment: Unrecognized or invalid course ID.',
      code: 'INVALID_COURSE',
      status: 400
    };
  }

  // Verify Amount matches canonical course price exactly in kobo
  const expectedKobo = canonicalCourse.koboAmount;
  const actualKobo = Math.round(Number(paystackData.amount));

  if (actualKobo !== expectedKobo) {
    return {
      verified: false,
      error: `Amount mismatch: Expected ${expectedKobo} kobo (₦${canonicalCourse.nairaAmount}), received ${actualKobo} kobo.`,
      code: 'AMOUNT_MISMATCH',
      status: 400
    };
  }

  // Customer identity
  const customerEmail = (
    paystackData.customer?.email ||
    paystackData.metadata?.studentEmail ||
    existingPayment?.customer_email ||
    ''
  ).toLowerCase().trim();

  if (!isValidEmail(customerEmail)) {
    return {
      verified: false,
      error: 'Invalid customer email associated with transaction.',
      code: 'INVALID_CUSTOMER_EMAIL',
      status: 400
    };
  }

  const customerName =
    paystackData.metadata?.studentName ||
    existingPayment?.customer_name ||
    paystackData.customer?.first_name ||
    customerEmail.split('@')[0];

  const customerPhone =
    paystackData.metadata?.phone ||
    existingPayment?.customer_phone ||
    paystackData.customer?.phone ||
    null;

  const paidAt = paystackData.paid_at || new Date().toISOString();
  const channel = paystackData.channel || 'card';
  const paystackTxId = String(paystackData.id || '');
  let authUserId = paystackData.metadata?.authUserId || null;

  // 4. Student Creation / Matching & Enrollment
  // FIX 2: Enrollment failure must not be silent. Do not report fulfillment success if student/enrollment fails.
  let studentId: string | null = existingPayment?.student_id || null;
  let studentCode: string | null = null;
  let generatedTempPassword: string | null = null;
  let directPasswordSetupLink: string | null = null;
  let fulfillmentError: string | null = null;
  let isFulfilled = false;
  let dbCourseId = canonicalCourse.id;

  if (supabase) {
    try {
      // Self-healing: Resolve & auto-provision course in database to satisfy foreign keys
      dbCourseId = await ensureCourseRecordInDatabase(canonicalCourse, supabase);

      if (simulateEnrollmentFailureForTesting.has(reference)) {
        throw new Error('Simulated database failure during enrollment.');
      }

      // Step A: Find existing student by email (or auth_user_id)
      const studentQuery = supabase
        .from('students')
        .select('id, email, auth_user_id, student_code')
        .eq('email', customerEmail);

      const { data: matchedStudent, error: findStudentErr } = await studentQuery.maybeSingle();
      if (findStudentErr) throw findStudentErr;

      let studentCode = matchedStudent?.student_code;

      if (matchedStudent) {
        studentId = matchedStudent.id;
        if (matchedStudent.auth_user_id) {
          authUserId = matchedStudent.auth_user_id;
        }
      } else {
        // Step B: Create student if not found
        const newStudentId = crypto.randomUUID();
        studentCode = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
        const { data: createdStudent, error: createStudentErr } = await supabase
          .from('students')
          .insert({
            id: newStudentId,
            name: customerName,
            email: customerEmail,
            auth_user_id: authUserId,
            student_code: studentCode,
            enrolled_at: new Date().toISOString(),
            role: 'student'
          })
          .select('id, student_code')
          .maybeSingle();

        if (createStudentErr) throw createStudentErr;
        if (createdStudent) {
          studentId = createdStudent.id;
          studentCode = createdStudent.student_code;
        } else {
          throw new Error('Student record could not be created in database.');
        }
      }

      // Step B.2: Automatically Provision Supabase Auth User & 1-Click Password Setup Link
      if (supabase.auth?.admin) {
        try {
          const portalBaseUrl = 'https://academy.vixoradigitalhub.com/pages/student-portal';

          let authUserExists = false;
          try {
            const { data: linkData, error: probeErr } = await supabase.auth.admin.generateLink({
              type: 'recovery',
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
            generatedTempPassword = `Vixora@${crypto.randomBytes(3).toString('hex').toUpperCase()}!`;
            const { data: newAuth } = await supabase.auth.admin.createUser({
              email: customerEmail,
              password: generatedTempPassword,
              email_confirm: true,
              user_metadata: {
                name: customerName,
                role: 'student'
              }
            });

            if (newAuth?.user) {
              authUserId = newAuth.user.id;
              const { data: linkData } = await supabase.auth.admin.generateLink({
                type: 'recovery',
                email: customerEmail,
                options: { redirectTo: portalBaseUrl }
              });
              directPasswordSetupLink = linkData?.properties?.action_link || null;
            }
          }

          if (authUserId && studentId) {
            await supabase.from('students').update({ auth_user_id: authUserId }).eq('id', studentId);
          }
        } catch (authProvisionErr) {
          console.warn('[Student Auth Provisioning Warning]:', authProvisionErr);
        }
      }

      // Step C: Idempotent Enrollment Fulfillment
      // Preserve existing cohort, progress, modules, and certificate_id
      if (!studentId) {
        throw new Error('Valid student identifier unavailable for enrollment.');
      }

      const { data: existingEnrollment, error: findEnrollmentErr } = await supabase
        .from('enrollments')
        .select('student_id, course_id, status, progress_percent')
        .eq('student_id', studentId)
        .eq('course_id', dbCourseId)
        .maybeSingle();

      if (findEnrollmentErr) throw findEnrollmentErr;

      if (!existingEnrollment) {
        const { error: insertEnrollmentErr } = await supabase.from('enrollments').insert({
          id: crypto.randomUUID(),
          student_id: studentId,
          course_id: dbCourseId,
          status: 'enrolled',
          cohort: `Cohort ${canonicalCourse.nextCohortDate}`,
          progress_percent: 0,
          completed_modules: 0,
          total_modules: canonicalCourse.totalModules,
          enrolled_at: new Date().toISOString()
        });
        if (insertEnrollmentErr) throw insertEnrollmentErr;
      } else {
        // If enrollment already exists, ensure status is 'enrolled' without resetting progress
        const { error: updateEnrollmentErr } = await supabase
          .from('enrollments')
          .update({ status: 'enrolled', updated_at: new Date().toISOString() })
          .eq('student_id', studentId)
          .eq('course_id', dbCourseId);
        if (updateEnrollmentErr) throw updateEnrollmentErr;
      }

      isFulfilled = true;
    } catch (enrollErr: any) {
      console.error('[Supabase Enrollment Fulfillment Failure]:', enrollErr);
      fulfillmentError = enrollErr?.message || String(enrollErr);
      isFulfilled = false;
    }
  } else {
    // When Supabase is not configured (or testing)
    if (simulateEnrollmentFailureForTesting.has(reference)) {
      isFulfilled = false;
      fulfillmentError = 'Simulated database failure during enrollment.';
    } else {
      isFulfilled = true;
      studentId = existingPayment?.student_id || `STU-${Date.now().toString(36).toUpperCase()}`;
    }
  }

  // 5. Durable Payment Record Creation / Update
  // Preserves that the Paystack payment was genuinely successful, but explicitly tracks fulfillment_status
  const updatedPaymentRecord: PaymentRecord = {
    id: reference,
    student_id: studentId,
    course_id: dbCourseId,
    amount: canonicalCourse.nairaAmount,
    amount_kobo: canonicalCourse.koboAmount,
    currency: 'NGN',
    channel,
    status: 'success', // Genuinely successful at Paystack
    fulfillment_status: isFulfilled ? 'fulfilled' : 'failed',
    fulfillment_error: fulfillmentError,
    paystack_transaction_id: paystackTxId,
    customer_email: customerEmail,
    customer_name: customerName,
    customer_phone: customerPhone,
    paid_at: paidAt,
    email_dispatched_at: isFulfilled ? (existingPayment?.email_dispatched_at || null) : null,
    raw_response: sanitizePaystackResponse(paystackData),
    created_at: existingPayment?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { error: paymentUpsertError } = await supabase
        .from('payments')
        .upsert(updatedPaymentRecord, { onConflict: 'id' });

      if (paymentUpsertError) {
        console.error('[Supabase payments upsert failed]:', paymentUpsertError);
        return {
          verified: false,
          error: 'Paystack confirmed this payment, but the payment record could not be saved. Please retry verification or contact support with your reference.',
          code: 'PAYMENT_RECORD_PERSISTENCE_FAILED',
          status: 503,
          payment: {
            reference,
            status: 'success',
            amount: canonicalCourse.nairaAmount,
            currency: 'NGN',
            channel,
            paidAt,
            studentName: customerName,
            studentEmail: customerEmail,
            courseId: canonicalCourse.id,
            courseTitle: canonicalCourse.title
          }
        };
      }
    } catch (paymentDbErr) {
      console.error('[Supabase payments upsert exception]:', paymentDbErr);
      return {
        verified: false,
        error: 'Paystack confirmed this payment, but the payment record could not be saved. Please retry verification or contact support with your reference.',
        code: 'PAYMENT_RECORD_PERSISTENCE_FAILED',
        status: 503
      };
    }
  } else if (isProductionPaymentEnvironment()) {
    return {
      verified: false,
      error: 'Payment database is not configured. The transaction requires manual reconciliation.',
      code: 'DATABASE_UNCONFIGURED',
      status: 503
    };
  }

  // In-memory payment records are only authoritative in local development/tests.
  if (!isProductionPaymentEnvironment()) {
    fallbackPaymentsStore.set(reference, updatedPaymentRecord);
  }

  // If enrollment failed, abort here: do NOT report success and do NOT send email yet
  if (!isFulfilled) {
    return {
      verified: false,
      error: `Tuition payment of ₦${canonicalCourse.nairaAmount.toLocaleString()} was confirmed, but automated course enrollment encountered a database error: ${fulfillmentError}. Your transaction record has been saved for reconciliation.`,
      code: 'ENROLLMENT_FAILED',
      status: 500,
      payment: {
        reference,
        status: 'success',
        amount: canonicalCourse.nairaAmount,
        currency: 'NGN',
        channel,
        paidAt,
        studentName: customerName,
        studentEmail: customerEmail,
        courseId: canonicalCourse.id,
        courseTitle: canonicalCourse.title
      }
    };
  }

  // 6. FIX 1: Durable Email Idempotency (Supabase/DB state is the source of truth)
  // Check if email has already been dispatched in the database record
  let alreadyEmailed = Boolean(existingPayment?.email_dispatched_at);

  if (!alreadyEmailed && supabase) {
    try {
      const { data: latestPayment } = await supabase
        .from('payments')
        .select('email_dispatched_at')
        .eq('id', reference)
        .maybeSingle();
      if (latestPayment?.email_dispatched_at) {
        alreadyEmailed = true;
      }
    } catch (dbErr) {
      console.warn('[Supabase email check]:', dbErr);
    }
  }

  let finalEmailDispatchedAt = existingPayment?.email_dispatched_at || null;

  if (!alreadyEmailed) {
    try {
      const whatsappUrl = getWhatsAppUrl(
        'ng',
        `Hello Admissions! I just completed my tuition payment of ₦${canonicalCourse.nairaAmount.toLocaleString()} for ${canonicalCourse.title} via Paystack. Reference: ${reference}. My email is ${customerEmail}.`
      );

      const emailPayload = buildStudentOnboardingEmail({
        customerName,
        customerEmail,
        courseTitle: canonicalCourse.title,
        tuitionNaira: canonicalCourse.nairaAmount,
        reference,
        nextCohortDate: canonicalCourse.nextCohortDate,
        channel,
        studentCode: studentCode || 'STU-ACTIVE',
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

      // Requirement 5: Do NOT mark email as sent BEFORE email provider successfully accepts it
      if (emailResult && (emailResult.delivered || emailResult.status === 'delivered')) {
        finalEmailDispatchedAt = new Date().toISOString();
        if (supabase) {
          try {
            await supabase
              .from('payments')
              .update({ email_dispatched_at: finalEmailDispatchedAt })
              .eq('id', reference);
          } catch (dbErr) {
            console.warn('[Supabase email_dispatched_at update]:', dbErr);
          }
        }
        if (fallbackPaymentsStore.has(reference)) {
          fallbackPaymentsStore.get(reference)!.email_dispatched_at = finalEmailDispatchedAt;
        }
      }
    } catch (mailErr) {
      console.warn('[Paystack Email Dispatch Warning]:', mailErr);
    }
  }

  return {
    verified: true,
    payment: {
      reference,
      status: 'success',
      amount: canonicalCourse.nairaAmount,
      currency: 'NGN',
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

// ==============================================================================
// 9. Public Config Endpoint (Safe, no secrets)
// GET /config
// ==============================================================================
paystackRouter.get('/config', (_req: Request, res: Response) => {
  const configured = isPaystackConfigured();
  const publicKey = getPaystackPublicKey();

  return res.json({
    configured,
    hasPublicKey: Boolean(publicKey),
    publicKey: publicKey || null,
    currency: 'NGN',
    mode: getPaystackSecretKey().startsWith('sk_live_') ? 'live' : 'test',
    merchantName: 'Vixora Academy'
  });
});

// ==============================================================================
// 10. Paystack Initialization Endpoint
// POST /initialize
// ==============================================================================
paystackRouter.post('/initialize', async (req: Request, res: Response) => {
  try {
    // 1. Safe Client IP
    const clientIp = getClientIp(req);

    // 2. Strict Input Validation
    if (!isPlainObject(req.body)) {
      return res.status(400).json({
        error: 'Request body must be a valid JSON object.',
        code: 'INVALID_BODY'
      });
    }

    if (hasPrototypePollutionKeys(req.body)) {
      return res.status(400).json({
        error: 'Invalid request: Prototype pollution keys detected.',
        code: 'PROTOTYPE_POLLUTION'
      });
    }

    const { courseId, email, studentName, phone, callbackUrl } = req.body;

    if (!courseId || typeof courseId !== 'string') {
      return res.status(400).json({
        error: 'Parameter "courseId" is required and must be a string.',
        code: 'COURSE_ID_REQUIRED'
      });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        error: 'A valid student email address is required.',
        code: 'INVALID_EMAIL'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanStudentName = sanitizeText(studentName || cleanEmail.split('@')[0]);
    const cleanPhone = sanitizeText(phone, 30);

    // 3. Rate Limit (5 requests / 10 minutes per IP+email)
    const rateLimitKey = `${clientIp}:${cleanEmail}`;
    const rlStatus = payInitRateLimiter.check(rateLimitKey);
    if (!rlStatus.allowed) {
      return res.status(429).json({
        error: `Too many payment initialization requests. Please wait ${rlStatus.resetInSeconds} seconds before trying again.`,
        code: 'RATE_LIMIT_EXCEEDED',
        resetInSeconds: rlStatus.resetInSeconds
      });
    }

    // 4. Canonical Course & Price Source of Truth (Client cannot supply amount)
    const canonicalCourse = findCanonicalCourse(courseId);
    if (!canonicalCourse) {
      return res.status(400).json({
        error: `Invalid courseId "${courseId}". Course is not available in the Vixora Academy catalog.`,
        code: 'INVALID_COURSE_ID'
      });
    }

    // 5. Check Server Paystack Configuration
    const secretKey = getPaystackSecretKey();

    console.log('[Server Paystack Init Diagnostic: Request]', {
      courseId,
      hasEmail: Boolean(email),
      hasPhone: Boolean(phone),
      hasSecretKey: Boolean(secretKey),
      keyPrefix: secretKey ? (secretKey.startsWith('sk_live_') ? 'sk_live_...' : secretKey.startsWith('sk_test_') ? 'sk_test_...' : 'unknown...') : 'none'
    });

    if (!secretKey) {
      console.warn('[Server Paystack Init Diagnostic: Rejected]', {
        reason: 'PAYSTACK_SECRET_KEY is empty in process.env',
        status: 503
      });
      return res.status(503).json({
        error: 'Paystack Secret Key is not configured on the server. Please add PAYSTACK_SECRET_KEY in Settings -> Secrets.',
        code: 'PAYSTACK_NOT_CONFIGURED',
        help: 'Obtain your Secret Key from Paystack Dashboard -> Settings -> API Keys & Webhooks.'
      });
    }

    // 6. Optional Authenticated User
    const authUser = await extractOptionalAuthUser(req);

    // 7. Generate Secure Unique Transaction Reference
    const reference = `VIX-PS-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Determine secure callback URL
    const reqOrigin = req.headers.origin || (req.headers.host ? `${req.protocol}://${req.headers.host}` : '');
    const finalCallbackUrl =
      typeof callbackUrl === 'string' && callbackUrl.startsWith('http')
        ? callbackUrl
        : `${reqOrigin}/payment/callback?reference=${reference}&courseId=${encodeURIComponent(canonicalCourse.id)}`;

    const supabase = getSupabaseAdmin();
    if (!supabase && isProductionPaymentEnvironment()) {
      return res.status(503).json({
        error: 'Payment database is not configured. Checkout cannot be started safely.',
        code: 'DATABASE_UNCONFIGURED'
      });
    }

    let resolvedCourseId = canonicalCourse.id;
    if (supabase) {
      try {
        resolvedCourseId = await ensureCourseRecordInDatabase(canonicalCourse, supabase);
      } catch (courseDbErr) {
        console.error('[Paystack Init Course Record Failure]:', courseDbErr);
        return res.status(503).json({
          error: 'The selected course is not available in the payment database yet. Please try again later.',
          code: 'COURSE_DATABASE_UNAVAILABLE'
        });
      }
    }

    // 8. Pre-create durable pending payment record in database
    const initialPaymentRecord: PaymentRecord = {
      id: reference,
      student_id: null,
      course_id: resolvedCourseId,
      amount: canonicalCourse.nairaAmount,
      amount_kobo: canonicalCourse.koboAmount,
      currency: 'NGN',
      channel: null,
      status: 'pending',
      fulfillment_status: 'pending',
      fulfillment_error: null,
      email_dispatched_at: null,
      paystack_transaction_id: null,
      customer_email: cleanEmail,
      customer_name: cleanStudentName,
      customer_phone: cleanPhone || null,
      paid_at: null,
      raw_response: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { error: insertErr } = await supabase.from('payments').insert(initialPaymentRecord);
        if (insertErr) {
          console.error('[Supabase initial payment record insert failed]:', insertErr);
          return res.status(503).json({
            error: 'We could not securely save your payment session. No checkout was started. Please try again.',
            code: 'PAYMENT_RECORD_CREATE_FAILED'
          });
        }
      } catch (insertErr) {
        console.error('[Supabase initial payment record insert exception]:', insertErr);
        return res.status(503).json({
          error: 'The payment database is temporarily unavailable. No checkout was started. Please try again.',
          code: 'DATABASE_UNAVAILABLE'
        });
      }
    }

    // Keep an in-memory copy for local development/tests only; production always requires Supabase.
    if (!isProductionPaymentEnvironment()) {
      fallbackPaymentsStore.set(reference, initialPaymentRecord);
    }

    // 9. Initialize External Paystack Transaction
    const paystackPayload = {
      email: cleanEmail,
      amount: canonicalCourse.koboAmount,
      currency: 'NGN',
      reference,
      callback_url: finalCallbackUrl,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
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

    console.log('[Server Paystack Init Diagnostic: Calling Paystack API]', {
      reference,
      amountKobo: canonicalCourse.koboAmount,
      currency: 'NGN',
      callbackHost: new URL(finalCallbackUrl).hostname
    });

    const response = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paystackPayload)
    });

    const data: any = await response.json();

    console.log('[Server Paystack Init Diagnostic: Paystack Response]', {
      status: response.status,
      ok: response.ok,
      paystackStatus: data.status,
      hasAuthUrl: Boolean(data.data?.authorization_url),
      hasAccessCode: Boolean(data.data?.access_code),
      reference
    });

    if (!response.ok || !data.status || !data.data) {
      return res.status(response.status >= 400 && response.status < 500 ? 400 : 502).json({
        error: data.message || 'Failed to initialize Paystack transaction.',
        code: 'PAYSTACK_INIT_FAILED',
        reference
      });
    }

    // Return only public data required by frontend
    return res.json({
      success: true,
      reference,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      amountNaira: canonicalCourse.nairaAmount,
      amountKobo: canonicalCourse.koboAmount,
      currency: 'NGN',
      courseId: canonicalCourse.id,
      courseTitle: canonicalCourse.title
    });
  } catch (err: any) {
    console.error('[Paystack Initialize Exception]:', err);
    return res.status(500).json({
      error: 'An internal error occurred while initializing payment.',
      code: 'SERVER_ERROR'
    });
  }
});

// ==============================================================================
// 11. Paystack Verification Endpoint
// POST /verify  (and GET /verify/:reference for backward compatibility)
// ==============================================================================

async function handleVerificationRequest(req: Request, res: Response) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting: 15 requests / 1 minute per IP
    const rlStatus = payVerifyRateLimiter.check(clientIp);
    if (!rlStatus.allowed) {
      return res.status(429).json({
        verified: false,
        error: `Too many verification requests. Please wait ${rlStatus.resetInSeconds} seconds before retrying.`,
        code: 'RATE_LIMIT_EXCEEDED',
        resetInSeconds: rlStatus.resetInSeconds
      });
    }

    // Extract reference from body or params
    const rawRef = req.body?.reference || req.params?.reference || req.query?.reference;
    if (!isValidTransactionReference(rawRef)) {
      return res.status(400).json({
        verified: false,
        error: 'A valid transaction reference string is required.',
        code: 'INVALID_REFERENCE'
      });
    }

    const reference = String(rawRef).trim();

    // Process idempotent fulfillment
    const result = await processPaymentFulfillment(reference);

    if (!result.verified) {
      return res.status(result.status || 400).json(result);
    }

    return res.json(result);
  } catch (err: any) {
    console.error('[Paystack Verify Exception]:', err);
    return res.status(500).json({
      verified: false,
      error: 'An internal server error occurred while verifying payment.',
      code: 'SERVER_ERROR'
    });
  }
}

paystackRouter.post('/verify', handleVerificationRequest);
paystackRouter.get('/verify', handleVerificationRequest);
paystackRouter.get('/verify/:reference', handleVerificationRequest);
paystackRouter.post('/verify/:reference', handleVerificationRequest);

// ==============================================================================
// 12. Paystack Webhook Endpoint
// POST /webhook (and GET /webhook for status health check)
// ==============================================================================
paystackRouter.get('/webhook', (_req: Request, res: Response) => {
  return res.json({
    status: 'active',
    endpoint: 'Paystack Webhook Listener',
    service: 'Vixora Academy Payment Gateway',
    expectedMethod: 'POST',
    configured: isPaystackConfigured(),
    message: 'This endpoint is active and listening for automated webhook POST events from Paystack.'
  });
});

paystackRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const secretKey = getPaystackSecretKey();
    if (!secretKey) {
      return res.status(503).json({ error: 'Paystack Secret Key is not configured on server.' });
    }

    // Paystack signature header
    const signature = req.headers['x-paystack-signature'];
    if (!signature || typeof signature !== 'string') {
      return res.status(401).json({ error: 'Missing x-paystack-signature header.' });
    }

    // Retrieve original raw request body buffer
    const rawBody: Buffer | undefined =
      (req as any).rawBody ||
      (Buffer.isBuffer(req.body)
        ? req.body
        : typeof req.body === 'string'
        ? Buffer.from(req.body)
        : undefined);

    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      return res.status(400).json({
        error: 'Raw request body buffer unavailable for signature verification.'
      });
    }

    // Compute HMAC SHA-512 signature using official PAYSTACK_SECRET_KEY
    const computedHash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');

    const expectedBuffer = Buffer.from(computedHash, 'hex');
    const providedBuffer = Buffer.from(signature, 'hex');

    // Cryptographically safe comparison
    if (
      expectedBuffer.length !== providedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      return res.status(401).json({ error: 'Invalid webhook signature.' });
    }

    const event = req.body;
    if (!event || typeof event !== 'object') {
      return res.status(400).json({ error: 'Invalid webhook event payload structure.' });
    }

    // Handle charge.success event
    if (event.event === 'charge.success' && event.data?.reference) {
      const ref = String(event.data.reference).trim();
      // Execute idempotent fulfillment using the webhook event payload
      await processPaymentFulfillment(ref, event.data);
    }

    // Acknowledge receipt immediately with 200 OK
    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('[Paystack Webhook Exception]:', err);
    return res.status(500).json({ error: 'Webhook processing error.' });
  }
});
