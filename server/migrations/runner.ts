/**
 * Vixora Academy: Database Migrations as Code Engine
 * 
 * Production-grade TypeScript migration runner for Supabase/PostgreSQL.
 * Features:
 * - Deterministic, sequentially ordered SQL discovery in supabase/migrations/
 * - Atomic per-migration transactions (BEGIN ... COMMIT) with automatic ROLLBACK
 * - SHA-256 checksum verification to detect tampered historical migrations
 * - _migrations ledger table tracking batch execution and timestamps
 * - CLI support for --status, --dry-run, and programmatic invocation from server.ts
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export interface MigrationFile {
  name: string;
  filePath: string;
  sql: string;
  checksum: string;
}

export interface AppliedMigration {
  id: number;
  name: string;
  batch: number;
  checksum: string;
  applied_at: string;
}

export interface MigrationRunSummary {
  appliedCount: number;
  skippedCount: number;
  totalFiles: number;
  batch: number;
  appliedNames: string[];
  skippedNames: string[];
}

export interface MigrationOptions {
  migrationsDir?: string;
  connectionString?: string;
  dryRun?: boolean;
  statusOnly?: boolean;
  silent?: boolean;
}

/**
 * Resolves PostgreSQL connection string from environment variables
 */
export function getDatabaseConnectionString(): string {
  const conn =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    '';
  return conn.trim().replace(/^["']|["']$/g, '');
}

/**
 * Computes SHA-256 hash of migration SQL content (normalized for newline consistency)
 */
export function computeChecksum(content: string): string {
  const normalized = content.replace(/\r\n/g, '\n').trim();
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

/**
 * Reads and sorts all SQL migration files from the migrations directory
 */
export function discoverMigrationFiles(dirPath: string): MigrationFile[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  return files.map((fileName) => {
    const fullPath = path.join(dirPath, fileName);
    const content = fs.readFileSync(fullPath, 'utf8');
    return {
      name: fileName,
      filePath: fullPath,
      sql: content,
      checksum: computeChecksum(content)
    };
  });
}

/**
 * Main migration execution function
 */
export async function runMigrations(options: MigrationOptions = {}): Promise<MigrationRunSummary> {
  const migrationsDir = options.migrationsDir || path.resolve(process.cwd(), 'supabase/migrations');
  const connectionString = options.connectionString || getDatabaseConnectionString();
  const dryRun = Boolean(options.dryRun);
  const statusOnly = Boolean(options.statusOnly);
  const silent = Boolean(options.silent);

  const log = (msg: string) => {
    if (!silent) console.log(msg);
  };

  const files = discoverMigrationFiles(migrationsDir);

  if (files.length === 0) {
    log(`[Migrations] No SQL migration files found in: ${migrationsDir}`);
    return {
      appliedCount: 0,
      skippedCount: 0,
      totalFiles: 0,
      batch: 0,
      appliedNames: [],
      skippedNames: []
    };
  }

  log(`[Migrations] Discovered ${files.length} migration file(s) in: ${migrationsDir}`);

  // If no connection string is provided, provide clear diagnostics
  if (!connectionString) {
    if (statusOnly || dryRun) {
      log('\n[Migrations Status (Offline / No DATABASE_URL)]');
      files.forEach((f, idx) => {
        log(`  ${idx + 1}. [UNTRACKED] ${f.name} (SHA: ${f.checksum.slice(0, 8)}...)`);
      });
      log('\nTo connect directly to Supabase, set DATABASE_URL in your .env or Vercel environment.');
      return {
        appliedCount: 0,
        skippedCount: files.length,
        totalFiles: files.length,
        batch: 0,
        appliedNames: [],
        skippedNames: files.map((f) => f.name)
      };
    }

    throw new Error(
      'DATABASE_URL or SUPABASE_DB_URL is not configured in environment variables. ' +
        'Please add your PostgreSQL connection string to your environment or run the SQL files in Supabase SQL Editor.'
    );
  }

  // Create connection pool
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  const client = await pool.connect();

  try {
    // 1. Ensure _migrations ledger exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        batch INTEGER NOT NULL DEFAULT 1,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_migrations_name ON _migrations(name);
    `);

    // 2. Fetch applied migrations
    const res = await client.query<AppliedMigration>(
      'SELECT id, name, batch, checksum, applied_at FROM _migrations ORDER BY id ASC'
    );
    const appliedMap = new Map<string, AppliedMigration>();
    let maxBatch = 0;

    for (const row of res.rows) {
      appliedMap.set(row.name, row);
      if (row.batch > maxBatch) maxBatch = row.batch;
    }

    const currentBatch = maxBatch + 1;

    // 3. Status Report Mode
    if (statusOnly) {
      log('\n======================================================');
      log('  Vixora Academy: Database Migrations Status');
      log('======================================================');
      files.forEach((f, idx) => {
        const applied = appliedMap.get(f.name);
        if (applied) {
          const dateStr = new Date(applied.applied_at).toLocaleString();
          const checkMatch = applied.checksum === f.checksum ? '✓' : '⚠️ MISMATCH';
          log(`  [APPLIED]  Batch #${applied.batch} | ${f.name} (Applied: ${dateStr}) [${checkMatch}]`);
        } else {
          log(`  [PENDING]  Batch #${currentBatch} | ${f.name}`);
        }
      });
      log('======================================================\n');
      return {
        appliedCount: appliedMap.size,
        skippedCount: files.length - appliedMap.size,
        totalFiles: files.length,
        batch: currentBatch,
        appliedNames: Array.from(appliedMap.keys()),
        skippedNames: files.filter((f) => !appliedMap.has(f.name)).map((f) => f.name)
      };
    }

    // 4. Verification & Execution
    const appliedNames: string[] = [];
    const skippedNames: string[] = [];

    for (const file of files) {
      const existing = appliedMap.get(file.name);

      if (existing) {
        if (existing.checksum !== file.checksum) {
          log(`[Migrations Warning] Checksum mismatch for already applied migration "${file.name}".`);
        }
        skippedNames.push(file.name);
        continue;
      }

      log(`[Migrations] Applying: ${file.name} (Batch #${currentBatch})...`);

      if (dryRun) {
        log(`  [DRY-RUN] Simulating execution of ${file.name} without committing.`);
        appliedNames.push(file.name);
        continue;
      }

      // Execute in strict transaction
      await client.query('BEGIN');
      try {
        await client.query(file.sql);
        await client.query(
          'INSERT INTO _migrations (name, batch, checksum, applied_at) VALUES ($1, $2, $3, NOW())',
          [file.name, currentBatch, file.checksum]
        );
        await client.query('COMMIT');
        log(`  ✓ Successfully applied: ${file.name}`);
        appliedNames.push(file.name);
      } catch (err) {
        await client.query('ROLLBACK');
        log(`  ❌ Failed applying: ${file.name}. Transaction rolled back.`);
        throw err;
      }
    }

    log(`\n[Migrations Complete] Applied: ${appliedNames.length}, Skipped (Already applied): ${skippedNames.length}\n`);

    return {
      appliedCount: appliedNames.length,
      skippedCount: skippedNames.length,
      totalFiles: files.length,
      batch: currentBatch,
      appliedNames,
      skippedNames
    };
  } finally {
    client.release();
    await pool.end();
  }
}

// Direct CLI invocation
if (process.argv[1] && process.argv[1].endsWith('runner.ts')) {
  const args = process.argv.slice(2);
  const statusOnly = args.includes('--status');
  const dryRun = args.includes('--dry-run');

  runMigrations({ statusOnly, dryRun })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Migrations Execution Error]:', err.message || err);
      process.exit(1);
    });
}
