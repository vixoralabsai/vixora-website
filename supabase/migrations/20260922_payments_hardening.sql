-- ==============================================================================
-- Vixora Academy: Payments Hardening Migration (Phase 2.6)
-- Adds durable email idempotency and explicit fulfillment tracking columns.
-- Preserves all existing table data without dropping or recreating tables.
-- ==============================================================================

-- 1. Durable Email Dispatch Timestamp
-- Replaces ephemeral in-memory set with persistent, serverless-safe audit timestamp
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS email_dispatched_at TIMESTAMPTZ;

-- 2. Explicit Fulfillment Status & Diagnostic Error Tracking
-- Tracks whether student account matching and course enrollment succeeded
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS fulfillment_status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS fulfillment_error TEXT;

-- 3. Dedicated Index for Fast Re-conciliation and Audits
CREATE INDEX IF NOT EXISTS idx_payments_email_dispatched_at
ON payments(email_dispatched_at)
WHERE email_dispatched_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_fulfillment_status
ON payments(fulfillment_status);
