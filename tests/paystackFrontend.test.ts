import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { isValidClientReference, cleanErrorMessage } from '../src/lib/paystack.js';

console.log('🧪 Starting Vixora Academy Paystack Phase 3 Frontend Integration Test Suite...\n');

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
  const modalContent = fs.readFileSync(
    path.join(process.cwd(), 'src/components/CourseEnrollmentModal.tsx'),
    'utf-8'
  );

  const paystackLibContent = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/paystack.ts'),
    'utf-8'
  );

  const callbackContent = fs.readFileSync(
    path.join(process.cwd(), 'src/pages/PaymentCallbackPage.tsx'),
    'utf-8'
  );

  const appContent = fs.readFileSync(
    path.join(process.cwd(), 'src/App.tsx'),
    'utf-8'
  );

  // ------------------------------------------------------------------------
  // Test 1: Enrollment submission calls initialize with courseId/email/name/phone
  // ------------------------------------------------------------------------
  await runTest('1. Enrollment submission calls initialize with courseId/email/name/phone', () => {
    assert.ok(
      modalContent.includes('initializePaystackPayment({'),
      'CourseEnrollmentModal must call initializePaystackPayment'
    );
    assert.ok(
      modalContent.includes('courseId: course.id'),
      'initializePaystackPayment must include courseId'
    );
    assert.ok(
      modalContent.includes('email: email.trim()'),
      'initializePaystackPayment must include student email'
    );
    assert.ok(
      modalContent.includes('studentName: fullName.trim()'),
      'initializePaystackPayment must include student full name'
    );
    assert.ok(
      modalContent.includes('phone: phone.trim()'),
      'initializePaystackPayment must include optional phone number'
    );
  });

  // ------------------------------------------------------------------------
  // Test 2: Client does not send authoritative amount
  // ------------------------------------------------------------------------
  await runTest('2. Client does not send authoritative amount', () => {
    const initCallMatch = modalContent.match(/initializePaystackPayment\(\{([\s\S]*?)\}\)/);
    assert.ok(initCallMatch, 'initializePaystackPayment call must exist');
    const initCallBody = initCallMatch[1];
    assert.ok(!initCallBody.includes('amount:'), 'initialize call must not send client amount');
    assert.ok(!initCallBody.includes('price:'), 'initialize call must not send client price');
    assert.ok(!initCallBody.includes('tuition:'), 'initialize call must not send client tuition');
    assert.ok(!initCallBody.includes('currency:'), 'initialize call must not send client currency');

    // Also verify TypeScript interface enforces absence of client amount
    const interfaceMatch = paystackLibContent.match(/export interface InitializePaymentParams\s*\{([^}]+)\}/);
    assert.ok(interfaceMatch, 'InitializePaymentParams interface must exist in src/lib/paystack.ts');
    const interfaceBody = interfaceMatch[1];
    assert.ok(!interfaceBody.includes('amount:'), 'InitializePaymentParams must not contain amount:');
    assert.ok(!interfaceBody.includes('price:'), 'InitializePaymentParams must not contain price:');
    assert.ok(!interfaceBody.includes('tuition:'), 'InitializePaymentParams must not contain tuition:');
  });

  // ------------------------------------------------------------------------
  // Test 3: Initialization failure is displayed safely
  // ------------------------------------------------------------------------
  await runTest('3. Initialization failure is displayed safely without exposing secrets', () => {
    assert.ok(
      modalContent.includes('setErrorMessage(initRes.error'),
      'CourseEnrollmentModal must display safe user-friendly initialization error'
    );
    assert.ok(
      modalContent.includes('PAYSTACK_NOT_CONFIGURED'),
      'CourseEnrollmentModal must handle unconfigured gateway status safely'
    );
    assert.ok(
      modalContent.includes('setIsSubmitting(false)'),
      'CourseEnrollmentModal must re-enable form submission on error'
    );
  });

  // ------------------------------------------------------------------------
  // Test 4: Successful initialization launches/redirects to Paystack
  // ------------------------------------------------------------------------
  await runTest('4. Successful initialization launches/redirects to Paystack', () => {
    assert.ok(
      modalContent.includes('launchPaystackCheckout({'),
      'CourseEnrollmentModal must call launchPaystackCheckout on success'
    );
    assert.ok(
      modalContent.includes('reference: initRes.reference'),
      'launchPaystackCheckout must receive initialized reference'
    );
    assert.ok(
      modalContent.includes('authorizationUrl: initRes.authorizationUrl'),
      'launchPaystackCheckout must receive authorizationUrl'
    );
    assert.ok(
      paystackLibContent.includes('window.location.assign') ||
      paystackLibContent.includes('window.location.href'),
      'launchPaystackCheckout must support authorizationUrl redirect fallback'
    );
  });

  // ------------------------------------------------------------------------
  // Test 5: Callback extracts reference correctly
  // ------------------------------------------------------------------------
  await runTest('5. Callback extracts reference correctly and validates format', () => {
    assert.ok(
      callbackContent.includes("params.get('reference') || params.get('trxref')"),
      'Callback must extract reference or trxref query parameters'
    );
    // Reference format validation tests
    assert.equal(isValidClientReference('VIX-PS-1740000000-ABCD1234'), true);
    assert.equal(isValidClientReference('ref_123456789'), true);
    assert.equal(isValidClientReference('T1234567890'), true);
    assert.equal(isValidClientReference(''), false);
    assert.equal(isValidClientReference('   '), false);
    assert.equal(isValidClientReference('abc'), false);
    assert.equal(isValidClientReference('ref<script>alert(1)</script>'), false);
    assert.equal(isValidClientReference('a'.repeat(81)), false);
  });

  // ------------------------------------------------------------------------
  // Test 6: Callback verifies through backend
  // ------------------------------------------------------------------------
  await runTest('6. Callback verifies through backend POST /api/payments/paystack/verify', () => {
    assert.ok(
      callbackContent.includes('verifyPaystackPayment(ref)'),
      'PaymentCallbackPage must invoke verifyPaystackPayment'
    );
    assert.ok(
      paystackLibContent.includes('/api/payments/paystack/verify'),
      'verifyPaystackPayment must call backend verification endpoint'
    );
    assert.ok(
      paystackLibContent.includes("method: 'POST'"),
      'verifyPaystackPayment must issue a POST request'
    );
  });

  // ------------------------------------------------------------------------
  // Test 7: Backend verification success produces success UI
  // ------------------------------------------------------------------------
  await runTest('7. Backend verification success produces success UI', () => {
    assert.ok(
      callbackContent.includes("pageState === 'success'"),
      'PaymentCallbackPage must implement success state'
    );
    assert.ok(
      callbackContent.includes('Payment Confirmed!'),
      'Success state must display clear confirmed status'
    );
    assert.ok(
      callbackContent.includes('Print Receipt'),
      'Success state must provide receipt printing'
    );
    assert.ok(
      callbackContent.includes('Student Portal'),
      'Success state must offer direct portal access link'
    );
  });

  // ------------------------------------------------------------------------
  // Test 8: Backend verification failure produces failure UI
  // ------------------------------------------------------------------------
  await runTest('8. Backend verification failure produces failure UI and cancellation UI', () => {
    assert.ok(
      callbackContent.includes("pageState === 'failed'"),
      'PaymentCallbackPage must implement failed state'
    );
    assert.ok(
      callbackContent.includes('Payment could not be completed.'),
      'Failed state must display informative failure notice'
    );
    assert.ok(
      callbackContent.includes("pageState === 'cancelled'"),
      'PaymentCallbackPage must implement cancelled state'
    );
    assert.ok(
      callbackContent.includes('Payment was cancelled.'),
      'Cancelled state must display friendly cancellation text'
    );
    assert.ok(
      callbackContent.includes('Try Again'),
      'Failed and cancelled states must allow retry'
    );
  });

  // ------------------------------------------------------------------------
  // Test 9: Unknown reference is handled safely
  // ------------------------------------------------------------------------
  await runTest('9. Unknown reference is handled safely without leaking database details', () => {
    assert.ok(
      callbackContent.includes("pageState === 'error'"),
      'PaymentCallbackPage must implement error state'
    );
    assert.ok(
      callbackContent.includes('Payment Verification Status'),
      'Error state must provide clean heading'
    );
    assert.ok(
      callbackContent.includes('handleRetryVerification'),
      'Error state must provide verification retry functionality'
    );
  });

  // ------------------------------------------------------------------------
  // Test 10: User cannot repeatedly submit while initialization is loading
  // ------------------------------------------------------------------------
  await runTest('10. User cannot repeatedly submit while initialization is loading', () => {
    assert.ok(
      modalContent.includes('if (isSubmitting) return;'),
      'handleFormSubmit must early-return if submission is already active'
    );
    assert.ok(
      modalContent.includes('disabled={isSubmitting}'),
      'Submit button must be disabled when isSubmitting is true'
    );
    assert.ok(
      modalContent.includes('Connecting to Paystack...'),
      'Submit button must render loading text during network request'
    );
  });

  // ------------------------------------------------------------------------
  // Test 11: Existing Academy enrollment behavior remains intact
  // ------------------------------------------------------------------------
  await runTest('11. Existing Academy enrollment behavior remains intact', () => {
    // Bank transfer and corporate sponsorship paths are preserved
    assert.ok(
      modalContent.includes('fundingType'),
      'Modal must support funding types (self, employer, installments)'
    );
    assert.ok(
      modalContent.includes('BankPaymentDetailsCard'),
      'Modal must preserve bank transfer options'
    );
    assert.ok(
      appContent.includes("route.page === 'payment-callback'"),
      'App.tsx must include canonical payment-callback route'
    );
  });

  // ------------------------------------------------------------------------
  // Test 12: Security Check - PAYSTACK_SECRET_KEY is absent from src/
  // ------------------------------------------------------------------------
  await runTest('12. Security Check: PAYSTACK_SECRET_KEY is absent from all frontend code', () => {
    function scanDirectory(dir: string): string[] {
      const files: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...scanDirectory(fullPath));
        } else if (/\.(ts|tsx|js|jsx|json|html|css)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const srcFiles = scanDirectory(path.join(process.cwd(), 'src'));
    const violations: { file: string; line: number; text: string }[] = [];

    for (const file of srcFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('PAYSTACK_SECRET_KEY')) {
          violations.push({
            file: path.relative(process.cwd(), file),
            line: index + 1,
            text: line.trim()
          });
        }
      });
    }

    assert.equal(
      violations.length,
      0,
      `PAYSTACK_SECRET_KEY found in frontend src/ files: ${JSON.stringify(violations, null, 2)}`
    );
  });

  // ------------------------------------------------------------------------
  // Test 13: Error Sanitization - DOMException / pattern mismatch errors sanitized
  // ------------------------------------------------------------------------
  await runTest('13. Error Sanitization: WebKit "expected pattern" & DOMExceptions are safely sanitized', () => {
    // Exact user-reported error message
    const userReportedError = 'The string did not match the expected pattern.';
    const sanitized = cleanErrorMessage(userReportedError);
    assert.ok(
      !sanitized.includes('expected pattern'),
      'Sanitized error must not contain raw pattern exception'
    );
    assert.ok(
      sanitized.includes('Unable to reach the payment service'),
      'Sanitized error must provide user-friendly message'
    );

    // Also test other WebKit/DOM error variants
    assert.ok(cleanErrorMessage('SyntaxError: Unexpected token < in JSON at position 0').includes('Unable to reach the payment service'));
    assert.ok(cleanErrorMessage('Failed to fetch').includes('Unable to reach the payment service'));
    assert.ok(cleanErrorMessage('TypeError: Load failed').includes('Unable to reach the payment service'));

    // Normal business errors should be preserved
    assert.equal(cleanErrorMessage('Payment was cancelled.'), 'Payment was cancelled.');
    assert.equal(cleanErrorMessage('Invalid course selected.'), 'Invalid course selected.');
  });

  // ------------------------------------------------------------------------
  // Test 14: Simplified Enrollment Modal Fields Verification
  // ------------------------------------------------------------------------
  await runTest('14. Simplified Enrollment Modal: title, experience, and goals fields removed', () => {
    assert.ok(
      !modalContent.includes('Current Title & Company') && !modalContent.includes('Current Title &amp; Company'),
      'CourseEnrollmentModal must not contain "Current Title & Company"'
    );
    assert.ok(
      !modalContent.includes('Current Experience Level'),
      'CourseEnrollmentModal must not contain "Current Experience Level"'
    );
    assert.ok(
      !modalContent.includes('What is your primary goal for this cohort?'),
      'CourseEnrollmentModal must not contain "What is your primary goal for this cohort?"'
    );
    assert.ok(
      modalContent.includes('Full Name') && modalContent.includes('Email Address'),
      'CourseEnrollmentModal must retain Full Name and Email Address'
    );
  });

  console.log(`\n========================================`);
  console.log(`Phase 3 Frontend Tests: ${testsPassed} Passed | ${testsFailed} Failed`);
  console.log(`========================================\n`);

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
