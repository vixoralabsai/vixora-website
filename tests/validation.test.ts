import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidCertificateId,
  isValidEmail,
  isPlainObject,
  parsePaginationQuery
} from '../server/studentPortalServer.js';

test('isValidCertificateId validation suite', async (t) => {
  await t.test('accepts valid certificate IDs', () => {
    assert.strictEqual(isValidCertificateId('VA-2026-9042-ENG'), true);
    assert.strictEqual(isValidCertificateId('VA-2026-9042-MLDS'), true);
    assert.strictEqual(isValidCertificateId('VA-1234'), true);
    assert.strictEqual(isValidCertificateId('abc_123-XYZ'), true);
  });

  await t.test('rejects invalid or unsafe certificate IDs', () => {
    assert.strictEqual(isValidCertificateId(''), false);
    assert.strictEqual(isValidCertificateId('abc'), false); // under 4 chars
    assert.strictEqual(isValidCertificateId('A'.repeat(41)), false); // over 40 chars
    assert.strictEqual(isValidCertificateId('../../../etc/passwd'), false); // path traversal
    assert.strictEqual(isValidCertificateId('VA-2026<script>'), false); // XSS
    assert.strictEqual(isValidCertificateId('VA-2026;DROP TABLE'), false); // SQLi
    assert.strictEqual(isValidCertificateId('VA 2026 9042'), false); // whitespace
    assert.strictEqual(isValidCertificateId(null as any), false);
    assert.strictEqual(isValidCertificateId(undefined as any), false);
    assert.strictEqual(isValidCertificateId(12345 as any), false);
    assert.strictEqual(isValidCertificateId({} as any), false);
  });
});

test('isValidEmail validation suite', async (t) => {
  await t.test('accepts valid email addresses', () => {
    assert.strictEqual(isValidEmail('student@vixora.com'), true);
    assert.strictEqual(isValidEmail('alex.chen.ai@gmail.com'), true);
    assert.strictEqual(isValidEmail('user+tag@domain.co.uk'), true);
  });

  await t.test('rejects invalid email formats and injection attempts', () => {
    assert.strictEqual(isValidEmail(''), false);
    assert.strictEqual(isValidEmail('plainaddress'), false);
    assert.strictEqual(isValidEmail('@missingusername.com'), false);
    assert.strictEqual(isValidEmail('missingdomain@'), false);
    assert.strictEqual(isValidEmail('spaces in@email.com'), false);
    assert.strictEqual(isValidEmail('student@vixora.com\r\nBcc: evil@hacker.com'), false); // CRLF injection
    assert.strictEqual(isValidEmail('student@vixora.com\nSubject: Injected'), false); // newline injection
    assert.strictEqual(isValidEmail('a@b'), false); // too short
    assert.strictEqual(isValidEmail('a'.repeat(250) + '@example.com'), false); // over 254 chars
    assert.strictEqual(isValidEmail(null as any), false);
    assert.strictEqual(isValidEmail(undefined as any), false);
    assert.strictEqual(isValidEmail(12345 as any), false);
    assert.strictEqual(isValidEmail({} as any), false);
  });
});

test('isPlainObject validation suite', async (t) => {
  await t.test('accepts plain JSON objects', () => {
    assert.strictEqual(isPlainObject({}), true);
    assert.strictEqual(isPlainObject({ key: 'value' }), true);
    assert.strictEqual(isPlainObject(Object.create(null)), true);
  });

  await t.test('rejects primitives, arrays, null, and non-plain objects', () => {
    assert.strictEqual(isPlainObject(null), false);
    assert.strictEqual(isPlainObject(undefined), false);
    assert.strictEqual(isPlainObject('string'), false);
    assert.strictEqual(isPlainObject(123), false);
    assert.strictEqual(isPlainObject(true), false);
    assert.strictEqual(isPlainObject([]), false);
    assert.strictEqual(isPlainObject([1, 2, 3]), false);
    assert.strictEqual(isPlainObject(new Date()), false);
    assert.strictEqual(isPlainObject(new Map()), false);
    assert.strictEqual(isPlainObject(new Set()), false);
  });
});

test('parsePaginationQuery validation suite', async (t) => {
  await t.test('applies sensible defaults when unsupplied', () => {
    const result = parsePaginationQuery(undefined, undefined, 50, 100);
    assert.strictEqual(result.limit, 50);
    assert.strictEqual(result.offset, 0);
    assert.strictEqual(result.error, undefined);
  });

  await t.test('accepts valid limit and offset', () => {
    const result = parsePaginationQuery('25', '50', 50, 100);
    assert.strictEqual(result.limit, 25);
    assert.strictEqual(result.offset, 50);
    assert.strictEqual(result.error, undefined);
  });

  await t.test('supports page parameter for page-based pagination', () => {
    const result = parsePaginationQuery('20', undefined, 20, 100, '3');
    assert.strictEqual(result.limit, 20);
    assert.strictEqual(result.offset, 40); // (3 - 1) * 20
    assert.strictEqual(result.error, undefined);
  });

  await t.test('rejects invalid limit values', () => {
    assert.ok(parsePaginationQuery('-5', '0').error);
    assert.ok(parsePaginationQuery('0', '0').error);
    assert.ok(parsePaginationQuery('9999', '0', 50, 100).error);
    assert.ok(parsePaginationQuery('abc', '0').error);
    assert.ok(parsePaginationQuery('12.5', '0').error);
  });

  await t.test('rejects invalid offset values', () => {
    assert.ok(parsePaginationQuery('10', '-1').error);
    assert.ok(parsePaginationQuery('10', 'abc').error);
    assert.ok(parsePaginationQuery('10', '1000000').error); // > 100,000
    assert.ok(parsePaginationQuery('10', '1.5').error);
  });

  await t.test('rejects invalid page values', () => {
    assert.ok(parsePaginationQuery('10', undefined, 10, 100, '-1').error);
    assert.ok(parsePaginationQuery('10', undefined, 10, 100, '0').error);
    assert.ok(parsePaginationQuery('10', undefined, 10, 100, 'abc').error);
    assert.ok(parsePaginationQuery('10', undefined, 10, 100, '999999').error);
  });
});

test('Prototype pollution protection suite', async (t) => {
  await t.test('rejects objects with __proto__ property', () => {
    const malicious = JSON.parse('{"__proto__": {"admin": true}}');
    assert.strictEqual(isPlainObject(malicious), false);
  });

  await t.test('rejects objects with constructor property', () => {
    const malicious = JSON.parse('{"constructor": {"prototype": {"admin": true}}}');
    assert.strictEqual(isPlainObject(malicious), false);
  });

  await t.test('rejects objects with prototype property', () => {
    const malicious = JSON.parse('{"prototype": {"admin": true}}');
    assert.strictEqual(isPlainObject(malicious), false);
  });
});

