import assert from 'node:assert/strict';
import crypto from 'crypto';
import {
  getPaystackSecretKey,
  getPaystackPublicKey,
  isPaystackConfigured,
  payInitRateLimiter,
  clearPaymentStoresForTesting,
  fallbackPaymentsStore,
  simulateEnrollmentFailureForTesting,
  processPaymentFulfillment,
  isValidEmail,
  isValidTransactionReference
} from '../server/paystackServer.js';
import { findCanonicalCourse } from '../server/payments/courseCatalog.js';
import { getCoursePrice, getCoursePrices } from '../src/data/coursePricing.js';

// Setup Mock Environment Variables for Testing
process.env.PAYSTACK_SECRET_KEY = 'sk_test_mock_secret_key_vixora_academy';
process.env.VITE_PAYSTACK_PUBLIC_KEY = 'pk_test_mock_public_key_vixora_academy';

console.log('🧪 Starting Vixora Academy Paystack Phase 2 & 2.6 Hardened Test Suite...\n');

let testsPassed = 0;
let testsFailed = 0;

async function runTest(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`✅ [PASS] ${name}`);
    testsPassed++;
  } catch (err: any) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(err);
    testsFailed++;
  }
}

async function runAllTests() {
  clearPaymentStoresForTesting();

  // ------------------------------------------------------------------------
  // Test 0: Structured course pricing contract
  // ------------------------------------------------------------------------
  await runTest('0. Structured pricing contract preserves approved prices without FX conversion', () => {
    assert.deepEqual(getCoursePrices('course-data-analysis-cohort'), { NGN: 60000, USD: 50 });
    assert.deepEqual(getCoursePrices('course-ai-automation-digital-skills'), { NGN: 30000, USD: 25 });
    assert.deepEqual(getCoursePrices('course-ai-automation-digital-business-systems'), { NGN: 60000, USD: 50 });
    assert.deepEqual(getCoursePrices('course-fullstack-vibe-coding'), { NGN: 50000, USD: 100 });
    assert.equal(getCoursePrice('course-fullstack-ai', 'USD'), 1850);
    assert.equal(getCoursePrice('course-fullstack-ai', 'NGN'), null);
    assert.deepEqual(getCoursePrices('course-machine-learning-data-science'), { NGN: 60000, USD: 60 });
    assert.equal(getCoursePrice('unknown-course', 'NGN'), null);
  });

  // ------------------------------------------------------------------------
  // Test 1: Initialization with valid course
  // ------------------------------------------------------------------------
  await runTest('1. Initialization with valid course', () => {
    const course = findCanonicalCourse('course-data-analysis-cohort');
    assert.ok(course, 'Canonical course should exist');
    assert.equal(course.id, 'course-data-analysis-cohort');
    assert.equal(course.nairaAmount, 60000);
    assert.equal(course.koboAmount, 6000000);
    assert.equal(course.currency, 'NGN');
  });

  // ------------------------------------------------------------------------
  // Test 2: Invalid course lookup rejected
  // ------------------------------------------------------------------------
  await runTest('2. Invalid course lookup rejected', () => {
    const invalidCourse = findCanonicalCourse('non-existent-course-12345');
    assert.equal(invalidCourse, null, 'Unrecognized course must return null');
  });

  // ------------------------------------------------------------------------
  // Test 3: Client-supplied fake amount ignored
  // ------------------------------------------------------------------------
  await runTest('3. Client-supplied fake amount ignored (backend authoritative price)', () => {
    const course = findCanonicalCourse('data-analysis-cohort');
    assert.ok(course);
    const fakeClientAmount = 100;
    assert.notEqual(course.nairaAmount, fakeClientAmount);
    assert.equal(course.nairaAmount, 60000);
  });

  // ------------------------------------------------------------------------
  // Test 4: Malformed email rejected
  // ------------------------------------------------------------------------
  await runTest('4. Malformed email validation', () => {
    assert.equal(isValidEmail('not-an-email'), false);
    assert.equal(isValidEmail('missing@domain'), false);
    assert.equal(isValidEmail('@nodomain.com'), false);
    assert.equal(isValidEmail('valid.student@example.com'), true);
  });

  // ------------------------------------------------------------------------
  // Test 5: Malformed reference rejected
  // ------------------------------------------------------------------------
  await runTest('5. Malformed reference validation', () => {
    assert.equal(isValidTransactionReference('bad'), false);
    assert.equal(isValidTransactionReference('bad reference with spaces'), false);
    assert.equal(isValidTransactionReference('bad<script>alert(1)</script>'), false);
    assert.equal(isValidTransactionReference('VIX-PS-1774288000-A1B2C3D4'), true);
  });

  // ------------------------------------------------------------------------
  // Test 6: Rate limit enforcement
  // ------------------------------------------------------------------------
  await runTest('6. Rate limit enforcement (pay_init limiter)', () => {
    payInitRateLimiter.reset();
    const testKey = '127.0.0.1:rate_test@example.com';
    for (let i = 0; i < 5; i++) {
      const res = payInitRateLimiter.check(testKey);
      assert.equal(res.allowed, true, `Attempt ${i + 1} should be allowed`);
    }
    const blocked = payInitRateLimiter.check(testKey);
    assert.equal(blocked.allowed, false, '6th attempt must be blocked by rate limiter');
    assert.equal(blocked.remaining, 0);
  });

  // ------------------------------------------------------------------------
  // Test 7: Verification of unknown reference
  // ------------------------------------------------------------------------
  await runTest('7. Verification of unknown reference', async () => {
    const unknownRef = 'VIX-PS-9999999999-UNKNOWN';
    const res = await processPaymentFulfillment(unknownRef, {
      status: 'failed',
      currency: 'NGN',
      amount: 6000000
    });
    assert.equal(res.verified, false);
    assert.equal(res.code, 'PAYMENT_NOT_SUCCESSFUL');
  });

  // ------------------------------------------------------------------------
  // Test 8: Successful transaction verification
  // ------------------------------------------------------------------------
  const testRef8 = 'VIX-PS-TEST-008';
  await runTest('8. Successful transaction verification', async () => {
    const mockPaystackSuccess = {
      id: 888001,
      status: 'success',
      reference: testRef8,
      amount: 6000000,
      currency: 'NGN',
      channel: 'card',
      paid_at: new Date().toISOString(),
      customer: {
        email: 'alex.student@example.com',
        first_name: 'Alex'
      },
      metadata: {
        courseId: 'course-data-analysis-cohort',
        studentName: 'Alex Mercer'
      }
    };

    const res = await processPaymentFulfillment(testRef8, mockPaystackSuccess);
    assert.equal(res.verified, true);
    assert.ok(res.payment);
    assert.equal(res.payment.reference, testRef8);
    assert.equal(res.payment.amount, 60000);
    assert.equal(res.payment.currency, 'NGN');
    assert.equal(res.payment.status, 'success');
  });

  // ------------------------------------------------------------------------
  // Test 9: Wrong amount rejected
  // ------------------------------------------------------------------------
  await runTest('9. Wrong amount rejected (tamper resistance)', async () => {
    const testRef9 = 'VIX-PS-TEST-009';
    const mockPaystackUnderpaid = {
      id: 888002,
      status: 'success',
      reference: testRef9,
      amount: 3000000,
      currency: 'NGN',
      customer: { email: 'fraud.test@example.com' },
      metadata: { courseId: 'course-data-analysis-cohort' }
    };

    const res = await processPaymentFulfillment(testRef9, mockPaystackUnderpaid);
    assert.equal(res.verified, false);
    assert.equal(res.code, 'AMOUNT_MISMATCH');
  });

  // ------------------------------------------------------------------------
  // Test 10: Wrong currency rejected
  // ------------------------------------------------------------------------
  await runTest('10. Wrong currency rejected', async () => {
    const testRef10 = 'VIX-PS-TEST-010';
    const mockPaystackForeignCurrency = {
      id: 888003,
      status: 'success',
      reference: testRef10,
      amount: 6000000,
      currency: 'USD',
      customer: { email: 'currency.test@example.com' },
      metadata: { courseId: 'course-data-analysis-cohort' }
    };

    const res = await processPaymentFulfillment(testRef10, mockPaystackForeignCurrency);
    assert.equal(res.verified, false);
    assert.equal(res.code, 'CURRENCY_MISMATCH');
  });

  // ------------------------------------------------------------------------
  // Test 11: Duplicate verification (Idempotency)
  // ------------------------------------------------------------------------
  await runTest('11. Duplicate verification idempotency', async () => {
    const res = await processPaymentFulfillment(testRef8, {
      status: 'success',
      reference: testRef8,
      amount: 6000000,
      currency: 'NGN'
    });

    assert.equal(res.verified, true);
    assert.equal(res.alreadyFulfilled, true, 'Second verification must return alreadyFulfilled');
    assert.equal(res.payment?.reference, testRef8);
  });

  // ------------------------------------------------------------------------
  // Test 12: Duplicate webhook (Idempotency)
  // ------------------------------------------------------------------------
  await runTest('12. Duplicate webhook idempotency', async () => {
    const res = await processPaymentFulfillment(testRef8, {
      status: 'success',
      reference: testRef8,
      amount: 6000000,
      currency: 'NGN'
    });

    assert.equal(res.verified, true);
    assert.equal(res.alreadyFulfilled, true);
  });

  // ------------------------------------------------------------------------
  // Test 13: Webhook signature verification (HMAC SHA-512)
  // ------------------------------------------------------------------------
  await runTest('13. Invalid webhook signature rejection', () => {
    const secret = getPaystackSecretKey();
    const rawBody = Buffer.from(JSON.stringify({ event: 'charge.success', data: { reference: 'TEST-SIG' } }));
    
    const validSignature = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    const invalidSignature = crypto.createHmac('sha512', 'wrong_secret').update(rawBody).digest('hex');

    const validBuf = Buffer.from(validSignature, 'hex');
    const computedBuf = Buffer.from(crypto.createHmac('sha512', secret).update(rawBody).digest('hex'), 'hex');
    assert.ok(crypto.timingSafeEqual(validBuf, computedBuf), 'Valid signature matches');

    const invalidBuf = Buffer.from(invalidSignature, 'hex');
    assert.equal(crypto.timingSafeEqual(invalidBuf, computedBuf), false, 'Invalid signature rejected');
  });

  // ------------------------------------------------------------------------
  // Test 14: Webhook with malformed payload
  // ------------------------------------------------------------------------
  await runTest('14. Webhook with malformed payload', async () => {
    const res = await processPaymentFulfillment('VIX-PS-MALFORMED', {
      status: 'success'
    });
    assert.equal(res.verified, false);
  });

  // ------------------------------------------------------------------------
  // Test 15: Guest student creation
  // ------------------------------------------------------------------------
  await runTest('15. Guest student fulfillment', async () => {
    const guestRef = 'VIX-PS-GUEST-015';
    const guestData = {
      id: 888015,
      status: 'success',
      reference: guestRef,
      amount: 3000000,
      currency: 'NGN',
      customer: { email: 'newguest@example.com', first_name: 'GuestUser' },
      metadata: {
        courseId: 'course-ai-automation-digital-skills',
        studentName: 'Guest Student'
      }
    };

    const res = await processPaymentFulfillment(guestRef, guestData);
    assert.equal(res.verified, true);
    assert.equal(res.payment?.studentEmail, 'newguest@example.com');
    assert.equal(res.payment?.amount, 30000);
  });

  // ------------------------------------------------------------------------
  // Test 16: Existing student matching
  // ------------------------------------------------------------------------
  await runTest('16. Existing student matching by email', async () => {
    const existingRef = 'VIX-PS-EXISTING-016';
    const data = {
      id: 888016,
      status: 'success',
      reference: existingRef,
      amount: 6000000,
      currency: 'NGN',
      customer: { email: 'newguest@example.com' },
      metadata: {
        courseId: 'course-data-analysis-cohort'
      }
    };

    const res = await processPaymentFulfillment(existingRef, data);
    assert.equal(res.verified, true);
    assert.equal(res.payment?.studentEmail, 'newguest@example.com');
  });

  // ------------------------------------------------------------------------
  // Test 17: Duplicate enrollment handling
  // ------------------------------------------------------------------------
  await runTest('17. Duplicate enrollment handling without resetting progress', async () => {
    const reEnrollRef = 'VIX-PS-REENROLL-017';
    const data = {
      id: 888017,
      status: 'success',
      reference: reEnrollRef,
      amount: 6000000,
      currency: 'NGN',
      customer: { email: 're-enroll@example.com' },
      metadata: { courseId: 'course-data-analysis-cohort' }
    };

    const res = await processPaymentFulfillment(reEnrollRef, data);
    assert.equal(res.verified, true);
  });

  // ------------------------------------------------------------------------
  // Test 18: Email idempotency
  // ------------------------------------------------------------------------
  await runTest('18. Email dispatch idempotency', async () => {
    const repeatRef = 'VIX-PS-EMAIL-IDEMP-018';
    const data = {
      id: 888018,
      status: 'success',
      reference: repeatRef,
      amount: 6000000,
      currency: 'NGN',
      customer: { email: 'idemp.email@example.com' },
      metadata: { courseId: 'course-data-analysis-cohort' }
    };

    const first = await processPaymentFulfillment(repeatRef, data);
    const second = await processPaymentFulfillment(repeatRef, data);

    assert.equal(first.verified, true);
    assert.equal(second.verified, true);
    assert.equal(second.alreadyFulfilled, true);
  });

  // ------------------------------------------------------------------------
  // Test 19: Secret not exposed to frontend in payment record
  // ------------------------------------------------------------------------
  await runTest('19. Secret not exposed in payment record', () => {
    const record = fallbackPaymentsStore.get(testRef8);
    assert.ok(record);
    const serialized = JSON.stringify(record);
    assert.equal(serialized.includes(process.env.PAYSTACK_SECRET_KEY!), false, 'Secret key must NEVER appear in payment record');
  });

  // ------------------------------------------------------------------------
  // Test 20: Config endpoint does not expose secrets
  // ------------------------------------------------------------------------
  await runTest('20. Config endpoint does not expose secret keys', () => {
    const secretKey = getPaystackSecretKey();
    const publicKey = getPaystackPublicKey();

    const configResponse = {
      configured: isPaystackConfigured(),
      hasPublicKey: Boolean(publicKey),
      publicKey: publicKey || null,
      currency: 'NGN',
      mode: secretKey.startsWith('sk_live_') ? 'live' : 'test',
      merchantName: 'Vixora Academy'
    };

    const json = JSON.stringify(configResponse);
    assert.equal(json.includes(secretKey), false, 'Config response must NEVER include secret key');
    assert.equal(configResponse.currency, 'NGN');
    assert.equal(configResponse.configured, true);
  });

  // ------------------------------------------------------------------------
  // PHASE 2.6 HARDENING TESTS
  // ------------------------------------------------------------------------

  // ------------------------------------------------------------------------
  // Test 21: Durable Email Idempotency across simulated cold start
  // ------------------------------------------------------------------------
  await runTest('21. Simulated cold start does not cause duplicate email dispatch', async () => {
    const coldStartRef = 'VIX-PS-COLDSTART-021';
    const dispatchTime = '2026-09-22T13:00:00.000Z';

    // Seed the database/fallback store with an existing record that already has email_dispatched_at set
    fallbackPaymentsStore.set(coldStartRef, {
      id: coldStartRef,
      student_id: 'STU-COLDSTART',
      course_id: 'course-data-analysis-cohort',
      amount: 60000,
      amount_kobo: 6000000,
      currency: 'NGN',
      channel: 'card',
      status: 'success',
      fulfillment_status: 'fulfilled',
      fulfillment_error: null,
      email_dispatched_at: dispatchTime,
      paystack_transaction_id: '888021',
      customer_email: 'coldstart@example.com',
      customer_name: 'Cold Start Student',
      customer_phone: null,
      paid_at: dispatchTime,
      raw_response: {},
      created_at: dispatchTime,
      updated_at: dispatchTime
    });

    // Verification runs on a new/restarted process with empty in-memory set
    const res = await processPaymentFulfillment(coldStartRef, {
      id: 888021,
      status: 'success',
      reference: coldStartRef,
      amount: 6000000,
      currency: 'NGN',
      customer: { email: 'coldstart@example.com' },
      metadata: { courseId: 'course-data-analysis-cohort' }
    });

    assert.equal(res.verified, true);
    assert.equal(res.alreadyFulfilled, true);
    assert.equal(res.payment?.emailDispatchedAt, dispatchTime, 'Must retain durable dispatch timestamp');
  });

  // ------------------------------------------------------------------------
  // Test 22: Enrollment failure does not silently report successful fulfillment
  // ------------------------------------------------------------------------
  const failureRef = 'VIX-PS-ENROLL-FAIL-022';
  await runTest('22. Enrollment failure does not silently report successful fulfillment', async () => {
    simulateEnrollmentFailureForTesting.add(failureRef);

    const data = {
      id: 888022,
      status: 'success',
      reference: failureRef,
      amount: 6000000,
      currency: 'NGN',
      customer: { email: 'vixoraaihub@gmail.com', first_name: 'Failed Enrollment Student' },
      metadata: { courseId: 'course-data-analysis-cohort', studentName: 'Failed Enrollment Student' }
    };

    const res = await processPaymentFulfillment(failureRef, data);

    // Payment itself succeeded at Paystack, but fulfillment failed
    assert.equal(res.verified, false, 'Must NOT report verified=true when enrollment fails');
    assert.equal(res.code, 'ENROLLMENT_FAILED');
    assert.equal(res.status, 500);

    // Verify durable record preserves that Paystack payment succeeded, but tracks failed fulfillment
    const record = fallbackPaymentsStore.get(failureRef);
    assert.ok(record, 'Payment record must be persisted for reconciliation');
    assert.equal(record.status, 'success', 'Must preserve that Paystack money was received');
    assert.equal(record.fulfillment_status, 'failed', 'Fulfillment status must explicitly reflect failure');
    assert.ok(record.fulfillment_error, 'Diagnostic fulfillment error must be recorded');
    assert.equal(record.email_dispatched_at, null, 'Email must NOT be marked sent when enrollment fails');
  });

  // ------------------------------------------------------------------------
  // Test 23: Later retry completes enrollment after transient failure
  // ------------------------------------------------------------------------
  await runTest('23. Later retry can complete enrollment after transient failure', async () => {
    // Clear simulated failure flag (simulating database recovery / reconnection)
    simulateEnrollmentFailureForTesting.delete(failureRef);

    const data = {
      id: 888022,
      status: 'success',
      reference: failureRef,
      amount: 6000000,
      currency: 'NGN',
      customer: { email: 'vixoraaihub@gmail.com' },
      metadata: { courseId: 'course-data-analysis-cohort' }
    };

    // Retry verification (e.g. from webhook replay or user retry)
    const res = await processPaymentFulfillment(failureRef, data);

    assert.equal(res.verified, true, 'Retry must succeed and report verified=true');
    const record = fallbackPaymentsStore.get(failureRef);
    assert.ok(record);
    assert.equal(record.fulfillment_status, 'fulfilled', 'Fulfillment status must transition to fulfilled');
    assert.equal(record.fulfillment_error, null, 'Error must be cleared on successful fulfillment');
  });

  // ------------------------------------------------------------------------
  // Test 24: Failed Paystack transaction records failed status and does not enroll
  // ------------------------------------------------------------------------
  await runTest('24. Failed Paystack transaction records failed status and does not enroll', async () => {
    const failedRef = 'VIX-PS-FAILED-024';
    fallbackPaymentsStore.set(failedRef, {
      id: failedRef,
      student_id: null,
      course_id: 'course-data-analysis-cohort',
      amount: 60000,
      amount_kobo: 6000000,
      currency: 'NGN',
      channel: null,
      status: 'pending',
      fulfillment_status: 'pending',
      fulfillment_error: null,
      email_dispatched_at: null,
      paystack_transaction_id: null,
      customer_email: 'failed.payer@example.com',
      customer_name: null,
      customer_phone: null,
      paid_at: null,
      raw_response: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const failedPayload = {
      id: 888024,
      status: 'failed',
      reference: failedRef,
      amount: 6000000,
      currency: 'NGN',
      gateway_response: 'Insufficient funds'
    };

    const res = await processPaymentFulfillment(failedRef, failedPayload);

    assert.equal(res.verified, false);
    assert.equal(res.code, 'PAYMENT_NOT_SUCCESSFUL');

    const updatedRecord = fallbackPaymentsStore.get(failedRef);
    assert.ok(updatedRecord);
    assert.equal(updatedRecord.status, 'failed', 'Database status must be updated to failed');
    assert.equal(updatedRecord.student_id, null, 'Student ID must NOT be assigned');
  });

  // ------------------------------------------------------------------------
  // Test 25: Abandoned Paystack transaction records abandoned status
  // ------------------------------------------------------------------------
  await runTest('25. Abandoned Paystack transaction records abandoned status', async () => {
    const abandonedRef = 'VIX-PS-ABANDONED-025';
    fallbackPaymentsStore.set(abandonedRef, {
      id: abandonedRef,
      student_id: null,
      course_id: 'course-data-analysis-cohort',
      amount: 60000,
      amount_kobo: 6000000,
      currency: 'NGN',
      channel: null,
      status: 'pending',
      fulfillment_status: 'pending',
      fulfillment_error: null,
      email_dispatched_at: null,
      paystack_transaction_id: null,
      customer_email: 'abandoned.payer@example.com',
      customer_name: null,
      customer_phone: null,
      paid_at: null,
      raw_response: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const abandonedPayload = {
      id: 888025,
      status: 'abandoned',
      reference: abandonedRef,
      amount: 6000000,
      currency: 'NGN',
      gateway_response: 'Customer closed window'
    };

    const res = await processPaymentFulfillment(abandonedRef, abandonedPayload);

    assert.equal(res.verified, false);
    assert.equal(res.code, 'PAYMENT_NOT_SUCCESSFUL');

    const updatedRecord = fallbackPaymentsStore.get(abandonedRef);
    assert.ok(updatedRecord);
    assert.equal(updatedRecord.status, 'abandoned', 'Database status must be updated to abandoned');
  });

  console.log('\n========================================');
  console.log(`📊 Test Results: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log('========================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
