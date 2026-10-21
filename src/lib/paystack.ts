/**
 * Paystack Client Integration Helper for Vixora Academy
 * Provides secure client-side communication with the backend Paystack endpoints.
 *
 * Rules:
 * - Browser is NEVER authoritative for amount, currency, tuition, or reference.
 * - Secret keys are NEVER imported or referenced here in client-side code.
 * - Supabase JWT Bearer token is automatically attached when user is logged in.
 */

import { supabase } from './supabaseClient';

export interface PaystackConfig {
  configured: boolean;
  hasPublicKey: boolean;
  publicKey: string | null;
  currency: string;
  mode: 'test' | 'live';
  merchantName: string;
}

export interface InitializePaymentParams {
  courseId: string;
  studentName?: string;
  email: string;
  phone?: string;
  callbackUrl?: string;
}

export interface InitializePaymentResponse {
  success: boolean;
  authorizationUrl?: string;
  accessCode?: string;
  reference: string;
  amountNaira?: number;
  amountKobo?: number;
  currency?: string;
  courseId?: string;
  courseTitle?: string;
  publicKey?: string | null;
  error?: string;
  code?: string;
  help?: string;
}

export interface VerifiedPaymentData {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  channel: string | null;
  paidAt: string | null;
  studentName: string | null;
  studentEmail: string;
  courseTitle: string;
  courseId: string;
  emailDispatchedAt?: string | null;
  gatewayResponse?: string;
  last4?: string | null;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  alreadyFulfilled?: boolean;
  payment?: VerifiedPaymentData;
  error?: string;
  code?: string;
  status?: number;
  reference?: string;
}

export interface LaunchCheckoutOptions {
  authorizationUrl?: string;
  accessCode?: string;
  reference: string;
  email: string;
  studentName?: string;
  phone?: string;
  publicKey?: string | null;
  onSuccess?: (reference: string) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key?: string;
        email: string;
        amount?: number;
        currency?: string;
        ref?: string;
        access_code?: string;
        channels?: string[];
        metadata?: Record<string, any>;
        callback?: (response: { reference: string; trxref?: string; status?: string; message?: string }) => void;
        onClose?: () => void;
        onSuccess?: (response: { reference: string; trxref?: string; status?: string; message?: string }) => void;
        onCancel?: () => void;
      }) => {
        openIframe?: () => void;
      };
      newTransaction?: (options: any) => void;
    };
  }
}

/**
 * Validates transaction reference format client-side before sending to backend
 */
export function isValidClientReference(ref: unknown): boolean {
  if (typeof ref !== 'string') return false;
  const trimmed = ref.trim();
  return /^[A-Za-z0-9_\-.:]{4,80}$/.test(trimmed);
}

/**
 * Sanitizes technical, browser-specific DOMException or SyntaxError messages
 * (e.g. WebKit's generic "The string did not match the expected pattern.")
 * into clean, user-friendly error messages.
 */
export function cleanErrorMessage(msg?: unknown): string {
  if (!msg || typeof msg !== 'string') return '';
  const trimmed = msg.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower.includes('expected pattern') ||
    lower.includes('syntaxerror') ||
    lower.includes('unexpected token') ||
    lower.includes('failed to fetch') ||
    lower.includes('load failed') ||
    lower.includes('network request failed') ||
    lower.includes('type error')
  ) {
    return 'Unable to reach the payment service. Please verify your connection or try again shortly.';
  }

  if (lower.includes('405') || lower.includes('method not allowed')) {
    return 'Payment gateway service is currently updating. Please try again in a few moments.';
  }

  return trimmed;
}

/**
 * Defensively parses response text to avoid Safari/WebKit DOMException 12:
 * "The string did not match the expected pattern."
 * when an endpoint returns HTML (404/500/502/proxy error) instead of valid JSON.
 */
async function parseSafeResponseJson<T = any>(
  res: Response,
  defaultErrorMsg = 'Payment service error.'
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const status = res.status;
  try {
    const text = await res.text();
    if (!text || !text.trim()) {
      return {
        ok: res.ok,
        status,
        data: null,
        error: res.ok ? undefined : `${defaultErrorMsg} (HTTP ${status})`
      };
    }

    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return {
          ok: res.ok,
          status,
          data: parsed,
          error: parsed?.error ? cleanErrorMessage(parsed.error) : undefined
        };
      } catch {
        // Fall through to non-JSON handler
      }
    }

    // Response was non-JSON (e.g. HTML from proxy or error page)
    if (status === 405) {
      return {
        ok: false,
        status,
        data: null,
        error: 'Payment service connection is currently synchronizing. Please try again in a moment.'
      };
    }

    return {
      ok: false,
      status,
      data: null,
      error: status >= 500
        ? 'Payment gateway service is temporarily unavailable. Please retry shortly.'
        : `${defaultErrorMsg} (HTTP ${status})`
    };
  } catch (err: any) {
    return {
      ok: false,
      status,
      data: null,
      error: cleanErrorMessage(err?.message) || defaultErrorMsg
    };
  }
}

/**
 * Loads Paystack inline.js script dynamically
 */
export function loadPaystackInlineScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.PaystackPop) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existingScript = document.getElementById('paystack-inline-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'paystack-inline-js';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('[Paystack] Inline SDK failed to load. Will fallback to hosted redirect.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Fetch public Paystack config from backend
 */
export async function getPaystackConfig(): Promise<PaystackConfig> {
  const fallbackConfig: PaystackConfig = {
    configured: false,
    hasPublicKey: false,
    publicKey: null,
    currency: 'NGN',
    mode: 'test',
    merchantName: 'Vixora Academy'
  };

  try {
    const res = await fetch('/api/payments/paystack/config');
    const parsed = await parseSafeResponseJson<PaystackConfig>(res);
    if (parsed.ok && parsed.data && typeof parsed.data.configured === 'boolean') {
      return parsed.data;
    }

    // Fallback to legacy route
    const legacyRes = await fetch('/api/paystack/config');
    const legacyParsed = await parseSafeResponseJson<PaystackConfig>(legacyRes);
    if (legacyParsed.ok && legacyParsed.data && typeof legacyParsed.data.configured === 'boolean') {
      return legacyParsed.data;
    }
  } catch (err) {
    console.warn('[Paystack Config] Unable to load config:', err);
  }

  return fallbackConfig;
}

/**
 * Initialize payment on backend.
 * Only courseId and customer identity are sent.
 * Browser NEVER supplies amount or reference.
 */
export async function initializePaystackPayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResponse> {
  try {
    // Attach Supabase Auth Bearer token if user is signed in
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      } catch {
        // Guest mode, proceed without token
      }
    }

    // Only forward safe, non-financial fields
    const payload = {
      courseId: params.courseId,
      studentName: params.studentName,
      email: params.email,
      phone: params.phone,
      callbackUrl: params.callbackUrl
    };

    console.log('[Paystack Diagnostic: Request]', {
      courseId: params.courseId,
      email: params.email,
      hasPhone: Boolean(params.phone),
      requestUrl: '/api/payments/paystack/initialize',
      method: 'POST'
    });

    let res = await fetch('/api/payments/paystack/initialize', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    let parsed = await parseSafeResponseJson<any>(res, 'Failed to initialize payment.');

    console.log('[Paystack Diagnostic: Response]', {
      status: res.status,
      contentType: res.headers.get('content-type'),
      ok: res.ok,
      code: parsed.data?.code,
      hasAuthUrl: Boolean(parsed.data?.authorizationUrl),
      hasAccessCode: Boolean(parsed.data?.accessCode),
      hasPublicKey: Boolean(parsed.data?.publicKey),
      reference: parsed.data?.reference,
      errorName: parsed.data?.error || parsed.error
    });

    // If endpoint is not found or method is rejected (e.g. proxy/hosting divergence), fallback to canonical legacy path
    if ((res.status === 404 || res.status === 405 || !parsed.ok) && (!parsed.data || !parsed.data.success)) {
      try {
        const fallbackRes = await fetch('/api/paystack/initialize', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        const fallbackParsed = await parseSafeResponseJson<any>(fallbackRes, 'Failed to initialize payment.');
        if (fallbackParsed.ok && fallbackParsed.data?.success) {
          res = fallbackRes;
          parsed = fallbackParsed;
        }
      } catch {
        // Retain original response
      }
    }

    const data = parsed.data || {};

    if (!parsed.ok || !data.success) {
      const rawError = data.error || parsed.error || 'Failed to initialize payment.';
      return {
        success: false,
        reference: data.reference || '',
        error: cleanErrorMessage(rawError),
        code: data.code || (parsed.status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'INIT_FAILED'),
        help: data.help
      };
    }

    return {
      success: true,
      reference: data.reference,
      authorizationUrl: data.authorizationUrl,
      accessCode: data.accessCode,
      amountNaira: data.amountNaira,
      amountKobo: data.amountKobo,
      currency: data.currency || 'NGN',
      courseId: data.courseId,
      courseTitle: data.courseTitle
    };
  } catch (err: any) {
    return {
      success: false,
      reference: '',
      error: cleanErrorMessage(err?.message) || 'Network error connecting to payment gateway.',
      code: 'NETWORK_ERROR'
    };
  }
}

/**
 * Verifies transaction reference strictly through backend.
 * Validates reference client-side before calling server.
 */
export async function verifyPaystackPayment(reference: string): Promise<VerifyPaymentResponse> {
  const cleanRef = (reference || '').trim();

  if (!isValidClientReference(cleanRef)) {
    return {
      verified: false,
      error: 'Invalid payment reference format.',
      code: 'INVALID_REFERENCE',
      reference: cleanRef
    };
  }

  try {
    let res = await fetch('/api/payments/paystack/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reference: cleanRef })
    });

    let parsed = await parseSafeResponseJson<VerifyPaymentResponse>(res, 'Verification error.');

    // If 404 or 405, fallback to canonical legacy path
    if ((res.status === 404 || res.status === 405 || !parsed.ok) && (!parsed.data || !parsed.data.verified)) {
      try {
        const fallbackRes = await fetch('/api/paystack/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reference: cleanRef })
        });
        const fallbackParsed = await parseSafeResponseJson<VerifyPaymentResponse>(fallbackRes, 'Verification error.');
        if (fallbackParsed.ok && fallbackParsed.data) {
          res = fallbackRes;
          parsed = fallbackParsed;
        }
      } catch {
        // Retain original response
      }
    }

    if (!parsed.ok || !parsed.data) {
      return {
        verified: false,
        error: cleanErrorMessage(parsed.error || parsed.data?.error) || "We're confirming your payment. Please wait or click retry.",
        code: parsed.data?.code || 'VERIFICATION_UNAVAILABLE',
        status: parsed.status,
        reference: cleanRef
      };
    }

    return parsed.data;
  } catch (err: any) {
    return {
      verified: false,
      error: cleanErrorMessage(err?.message) || 'Network error verifying payment.',
      code: 'NETWORK_ERROR',
      reference: cleanRef
    };
  }
}

/**
 * Launches Paystack checkout via inline popup or authorizationUrl redirect.
 */
export async function launchPaystackCheckout(options: LaunchCheckoutOptions): Promise<void> {
  if (typeof window === 'undefined') return;

  /*
   * Use Paystack's server-initialized hosted checkout as the primary path.
   * The backend has already created the transaction and returned an
   * authorization_url. Redirecting to that URL avoids relying on a browser
   * SDK version/shape and keeps amount/currency/reference server-authoritative.
   *
   * Paystack documents this redirect flow as:
   * backend initialization -> authorization_url -> checkout -> callback.
   */
  if (options.authorizationUrl) {
    try {
      const checkoutUrl = new URL(options.authorizationUrl);

      // Validate that it is an official Paystack secure HTTPS domain
      const isPaystackHost =
        checkoutUrl.protocol === 'https:' &&
        (checkoutUrl.hostname === 'checkout.paystack.com' ||
          checkoutUrl.hostname === 'standard.paystack.co' ||
          checkoutUrl.hostname.endsWith('.paystack.com') ||
          checkoutUrl.hostname.endsWith('.paystack.co'));

      if (!isPaystackHost) {
        throw new Error('Paystack returned an invalid checkout link.');
      }

      // Universal cross-browser redirect
      try {
        window.location.assign(checkoutUrl.href);
      } catch {
        window.location.href = checkoutUrl.href;
      }
      return;
    } catch (err: any) {
      console.error('[Paystack Checkout] Invalid authorization URL:', err);
      if (options.onError) {
        options.onError(cleanErrorMessage(err?.message) || 'Paystack returned an invalid checkout link. Please try again or contact admissions.');
      }
      return;
    }
  }

  /*
   * No hosted checkout URL means initialization did not produce a usable
   * transaction. Do not attempt to construct a client-side transaction or
   * supply an amount here.
   */
  if (options.onError) {
    options.onError('Payment authorization URL could not be generated. Please try again or contact admissions.');
  }
}
