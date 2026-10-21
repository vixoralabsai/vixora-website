/**
 * Vixora Academy: Database Migrations as Code Automated Test Suite
 * 
 * Verifies:
 * 1. Sequential discovery and sorting of SQL migration files.
 * 2. SHA-256 checksum determinism across line endings.
 * 3. Schema coverage of all 7 production tables and _migrations tracking table.
 * 4. Granular Row Level Security (RLS) declaration coverage.
 * 5. Canonical course pricing consistency between SQL seed and ACADEMY_COURSES.
 * 6. Migration runner status and dry-run execution contracts.
 */

import path from 'path';
import fs from 'fs';
import {
  discoverMigrationFiles,
  computeChecksum,
  runMigrations,
  getDatabaseConnectionString
} from '../server/migrations/runner.js';
import { ACADEMY_COURSES } from '../src/data/vixoraContent.js';
import { findCanonicalCourse } from '../server/payments/courseCatalog.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    if (details) console.error('   Details:', details);
    failed++;
  }
}

async function runAllTests() {
  console.log('🧪 Starting Vixora Database Migrations as Code Test Suite...\n');

  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');

  // Test 1: Migration discovery and ascending order
  const files = discoverMigrationFiles(migrationsDir);
  assert(files.length >= 3, `Discovered at least 3 baseline migration files (found: ${files.length})`);

  const fileNames = files.map((f) => f.name);
  const isSorted = fileNames.slice(1).every((item, i) => fileNames[i].localeCompare(item) <= 0);
  assert(isSorted, 'Migration files are sorted in strict ascending order (001 -> 002 -> 003)');
  assert(fileNames.includes('001_core_baseline_schema.sql'), 'Baseline schema file 001 exists');
  assert(fileNames.includes('002_rls_security_policies.sql'), 'RLS policies file 002 exists');
  assert(fileNames.includes('003_seed_canonical_courses.sql'), 'Canonical courses seed file 003 exists');

  // Test 2: SHA-256 checksum verification
  const file1 = files.find((f) => f.name === '001_core_baseline_schema.sql')!;
  assert(file1.checksum.length === 64, 'Computed checksum is a valid 64-character SHA-256 hex string');

  const testSqlWithLF = 'SELECT * FROM courses;\n';
  const testSqlWithCRLF = 'SELECT * FROM courses;\r\n';
  assert(
    computeChecksum(testSqlWithLF) === computeChecksum(testSqlWithCRLF),
    'Checksum computation normalizes CRLF to LF for deterministic hashes across operating systems'
  );

  // Test 3: Schema completeness in 001_core_baseline_schema.sql
  const schemaSql = file1.sql.toLowerCase();
  const requiredTables = [
    '_migrations',
    'courses',
    'students',
    'enrollments',
    'certificates',
    'certificate_competencies',
    'payments',
    'email_logs'
  ];

  for (const table of requiredTables) {
    const tableRegex = new RegExp(`create\\s+table\\s+(if\\s+not\\s+exists\\s+)?${table}\\b`, 'i');
    assert(tableRegex.test(schemaSql), `Baseline schema contains CREATE TABLE declaration for "${table}"`);
  }

  // Test 4: RLS policy completeness in 002_rls_security_policies.sql
  const rlsFile = files.find((f) => f.name === '002_rls_security_policies.sql')!;
  const rlsSql = rlsFile.sql.toLowerCase();

  const rlsProtectedTables = [
    'courses',
    'students',
    'enrollments',
    'certificates',
    'certificate_competencies',
    'payments',
    'email_logs'
  ];

  for (const table of rlsProtectedTables) {
    assert(
      rlsSql.includes(`alter table ${table} enable row level security`),
      `RLS is enabled for table "${table}"`
    );
  }

  assert(rlsSql.includes('public can view published courses'), 'Includes public read policy for courses');
  assert(rlsSql.includes('public can verify valid certificates'), 'Includes public verification policy for valid certificates');
  assert(rlsSql.includes('students can view own profile'), 'Includes authenticated student policy for profile');
  assert(rlsSql.includes('students can view own enrollments'), 'Includes authenticated student policy for enrollments');

  // Test 5: Seed consistency in 003_seed_canonical_courses.sql
  const seedFile = files.find((f) => f.name === '003_seed_canonical_courses.sql')!;
  const seedSql = seedFile.sql;

  for (const course of ACADEMY_COURSES) {
    const canonical = findCanonicalCourse(course.slug);
    assert(seedSql.includes(course.slug), `Seed SQL includes canonical slug "${course.slug}"`);
    if (canonical) {
      assert(seedSql.includes(canonical.koboAmount.toString()), `Seed SQL preserves exact price in kobo for "${course.title}" (${canonical.koboAmount})`);
    }
  }

  // Test 6: Runner Status Inspection Contract
  const statusSummary = await runMigrations({
    migrationsDir,
    statusOnly: true,
    silent: true
  });

  assert(statusSummary.totalFiles === files.length, 'Status inspection reports accurate total migration files count');
  assert(Array.isArray(statusSummary.skippedNames), 'Status inspection returns list of unapplied or applied migrations');

  // Test 7: Runner Dry-Run Contract
  const dryRunSummary = await runMigrations({
    migrationsDir,
    dryRun: true,
    silent: true
  });

  assert(dryRunSummary.totalFiles === files.length, 'Dry-run inspection processes without throwing exceptions');

  // Summary
  console.log('\n========================================');
  console.log(`📊 Migration Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('========================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('[Migrations Test Error]:', err);
  process.exit(1);
});
