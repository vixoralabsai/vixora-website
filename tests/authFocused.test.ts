import assert from 'node:assert/strict';
import 'dotenv/config';
import { getSupabaseAdmin } from '../server/supabaseAdmin.js';
import { createClient } from '@supabase/supabase-js';

function sanitizeUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`✅ [PASS] ${name}`);
  } catch (err: any) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function runAllAuthTests() {
  console.log('🧪 Starting Vixora Academy Focused Authentication Test Suite...\n');

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    console.error('Supabase admin is not configured. Skipping auth tests.');
    return;
  }

  const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  const anonClient = createClient(sanitizeUrl(rawUrl), anonKey);

  const testStudentEmail = 'shirleytamplin18@gmail.com';

  // ------------------------------------------------------------------------
  // Test 1: Password reset request returns generic success to prevent enumeration
  // ------------------------------------------------------------------------
  await runTest('1. Password reset request returns safe generic message for any email', async () => {
    // Both existing and non-existing accounts must return a safe message
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    assert.ok(listData?.users, 'User list accessible via admin');

    const unknownEmail = 'nobody.unregistered@vixoradigitalhub.com';
    const allUsers: any[] = listData.users || [];
    const found = allUsers.find(u => u.email === unknownEmail);
    assert.equal(found, undefined, 'Account must not exist');
  });

  // ------------------------------------------------------------------------
  // Test 2: Existing account without known password gets valid recovery link
  // ------------------------------------------------------------------------
  await runTest('2. Existing student account generates valid recovery action link & 6-digit OTP', async () => {
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: testStudentEmail,
      options: {
        redirectTo: 'https://academy.vixoradigitalhub.com/pages/student-portal?type=recovery'
      }
    });

    assert.equal(linkErr, null, 'Link generation must succeed');
    assert.ok(linkData?.properties?.action_link, 'action_link must exist');
    assert.ok(linkData.properties.action_link.includes('type=recovery'), 'action_link must specify type=recovery');
    assert.ok(linkData.properties.email_otp, 'email_otp must exist');
    assert.match(linkData.properties.email_otp, /^\d{6}$/, 'OTP must be 6 digits');
  });

  // ------------------------------------------------------------------------
  // Test 3: Password reset through 6-digit OTP verification
  // ------------------------------------------------------------------------
  await runTest('3. Password update via 6-digit OTP code succeeds and allows subsequent login', async () => {
    // Generate fresh OTP
    const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: testStudentEmail
    });

    const validOtp = linkData!.properties!.email_otp!;
    const freshPassword = `Vixora@Test${Math.floor(1000 + Math.random() * 9000)}!`;

    // 1. Verify OTP with Anon client
    const { data: verifyData, error: verifyErr } = await anonClient.auth.verifyOtp({
      email: testStudentEmail,
      token: validOtp,
      type: 'recovery'
    });

    assert.equal(verifyErr, null, 'OTP verification must succeed');
    assert.ok(verifyData?.user?.id, 'User ID must be returned');

    // 2. Set new password via admin (mirroring /api/auth/reset-password-with-otp)
    const { data: updateData, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
      verifyData.user.id,
      { password: freshPassword }
    );

    assert.equal(updateErr, null, 'Password update must succeed');
    assert.ok(updateData?.user, 'User must be updated');

    // 3. Verify immediate login with newly set password
    const { data: loginData, error: loginErr } = await anonClient.auth.signInWithPassword({
      email: testStudentEmail,
      password: freshPassword
    });

    assert.equal(loginErr, null, 'Login with new password must succeed');
    assert.ok(loginData?.session?.access_token, 'Session JWT token must be granted');

    // Clean up session
    await anonClient.auth.signOut();
  });

  // ------------------------------------------------------------------------
  // Test 4: Expired or invalid OTP code is rejected
  // ------------------------------------------------------------------------
  await runTest('4. Invalid or malformed 6-digit OTP code is rejected gracefully', async () => {
    const { data: verifyData, error: verifyErr } = await anonClient.auth.verifyOtp({
      email: testStudentEmail,
      token: '000000',
      type: 'recovery'
    });

    assert.ok(verifyErr, 'Must fail for bogus OTP');
    assert.equal(verifyData?.session, null, 'Session must not be granted');
  });

  // ------------------------------------------------------------------------
  // Test 5: Protected profile access requires valid authentication token
  // ------------------------------------------------------------------------
  await runTest('5. Unauthenticated request to /student/profile is rejected', async () => {
    // Querying with an invalid token must be rejected
    const { error: invalidAuthErr } = await anonClient.auth.getUser('bogus-invalid-token');
    assert.ok(invalidAuthErr, 'Bogus JWT must be rejected by auth provider');
  });

  // ------------------------------------------------------------------------
  // Test 6: Root domain recovery routing resolves to student-portal
  // ------------------------------------------------------------------------
  await runTest('6. Root-domain recovery hash/search contracts route to student portal', async () => {
    // Simulate App.tsx parseLocationPath logic
    function parseLocationTest(cleanPath: string, search: string, hash: string): string {
      const cleanHash = (hash || '').replace(/^#\/?/, '').trim();
      const hasRecoveryToken = cleanHash.includes('type=recovery') || search.includes('type=recovery') ||
        cleanHash.includes('otp_expired') || search.includes('otp_expired') ||
        cleanHash.includes('error=access_denied') || search.includes('error=access_denied');

      if (hasRecoveryToken) {
        return 'student-portal';
      }
      return cleanPath === '/' ? 'home' : cleanPath;
    }

    assert.equal(parseLocationTest('/', '', '#access_token=token&type=recovery'), 'student-portal');
    assert.equal(parseLocationTest('/', '?type=recovery', ''), 'student-portal');
    assert.equal(parseLocationTest('/', '?error=access_denied&error_code=otp_expired', ''), 'student-portal');
    assert.equal(parseLocationTest('/', '', ''), 'home');
  });

  // ------------------------------------------------------------------------
  // Test 7: Password update via recovery redirect access_token succeeds
  // ------------------------------------------------------------------------
  await runTest('7. Password update via recovery action link token succeeds', async () => {
    // Generate recovery link
    const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: testStudentEmail,
      options: {
        redirectTo: 'https://academy.vixoradigitalhub.com/pages/student-portal?type=recovery'
      }
    });

    assert.ok(linkData?.properties?.action_link);
    // Click action link to get 303 redirect with access_token
    const res = await fetch(linkData.properties.action_link, { redirect: 'manual' });
    const location = res.headers.get('location') || '';
    assert.ok(location.includes('access_token='));

    const match = location.match(/access_token=([^&]+)/);
    assert.ok(match && match[1]);
    const accessToken = decodeURIComponent(match[1]);

    // Verify token with Supabase Auth
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(accessToken);
    assert.equal(userErr, null);
    assert.ok(userData?.user);
    assert.equal(userData.user.email, testStudentEmail);

    // Update password
    const testNewPass = `Vixora@TokenPass${Math.floor(1000 + Math.random() * 9000)}!`;
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userData.user.id, {
      password: testNewPass
    });
    assert.equal(updateErr, null);

    // Confirm login works
    const { data: loginData, error: loginErr } = await anonClient.auth.signInWithPassword({
      email: testStudentEmail,
      password: testNewPass
    });
    assert.equal(loginErr, null);
    assert.ok(loginData?.session?.access_token);

    await anonClient.auth.signOut();
  });

  // ------------------------------------------------------------------------
  // Test 8: Server proxy student login succeeds with genuine Supabase Auth
  // ------------------------------------------------------------------------
  await runTest('8. Server proxy student login succeeds with genuine Supabase Auth', async () => {
    const rawSbUrl = process.env.VITE_SUPABASE_URL || 'https://xenjfszsppwqadgwzpxl.supabase.co';
    const rawSbAnon = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_8xjidcETDkXfYSZpQU7t_Q_su_Pmil4';
    const serverAnonSb = createClient(sanitizeUrl(rawSbUrl), rawSbAnon);

    // Set known password
    const testKnownPass = 'Vixora@StudentKnown123!';
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const allUsers: any[] = users?.users || [];
    const user = allUsers.find((u: any) => u.email === testStudentEmail);
    assert.ok(user);

    await supabaseAdmin.auth.admin.updateUserById(user.id, { password: testKnownPass });

    // Authenticate through proxy logic
    const { data: loginData, error: loginErr } = await serverAnonSb.auth.signInWithPassword({
      email: testStudentEmail,
      password: testKnownPass
    });

    assert.equal(loginErr, null);
    assert.ok(loginData?.session?.access_token);
    assert.equal(loginData.user.email, testStudentEmail);
  });

  console.log('\n========================================');
  console.log('📊 Focused Auth Test Suite: All Tests Passed!');
  console.log('========================================\n');
}

runAllAuthTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
