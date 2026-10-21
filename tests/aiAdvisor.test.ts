import assert from 'node:assert/strict';
import 'dotenv/config';

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

async function runAllAdvisorTests() {
  console.log('🧪 Starting Vixora AI Advisor Server Test Suite...\n');

  const baseUrl = 'http://localhost:3000';

  // 1. Status endpoint check
  await runTest('1. Advisor status endpoint responds with readiness and quota metadata', async () => {
    const res = await fetch(`${baseUrl}/api/ai/advisor/status`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(typeof data.ready === 'boolean');
    assert.ok(typeof data.limit === 'number');
    assert.ok(typeof data.remaining === 'number');
  });

  // 2. Missing message rejection
  await runTest('2. Advisor rejects empty or missing message with HTTP 400', async () => {
    const res = await fetch(`${baseUrl}/api/ai/advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.code, 'MISSING_MESSAGE');
  });

  // 3. Message too long rejection
  await runTest('3. Advisor rejects message exceeding character limit', async () => {
    const longMsg = 'a'.repeat(3000);
    const res = await fetch(`${baseUrl}/api/ai/advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: longMsg })
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.code, 'MESSAGE_TOO_LONG');
  });

  // 4. Live Advisory Generation (if GEMINI_API_KEY is present)
  await runTest('4. Advisor responds with structured recommendation when key is available', async () => {
    if (!process.env.GEMINI_API_KEY) {
      console.log('   (Skipping live generation: GEMINI_API_KEY not set in test environment)');
      return;
    }

    const res = await fetch(`${baseUrl}/api/ai/advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I want to learn how to create viral AI short videos on TikTok and Instagram. Which course is best and how much does it cost?',
        track: 'academy'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data?.reply, 'Reply must be populated');
    assert.ok(body.data?.reply.includes('10,000') || body.data?.reply.toLowerCase().includes('video'), 'Should mention the video course or ₦10,000 tuition');
    assert.ok(Array.isArray(body.data?.suggestedActions), 'Suggested actions should be an array');
  });

  console.log('\n========================================');
  console.log('📊 AI Advisor Test Suite: Completed!');
  console.log('========================================\n');
}

runAllAdvisorTests();
