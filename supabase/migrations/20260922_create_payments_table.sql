-- ==============================================================================
-- Vixora Academy: Dedicated Payments Table Migration
-- Creates the durable, tamper-evident payments table for Paystack transactions.
-- Designed for idempotent fulfillment, auditability, and strict security.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,                                      -- Unique transaction reference (e.g. VIX-PS-1774288000-A1B2C3)
  student_id UUID REFERENCES students(id) ON DELETE SET NULL, -- FK to students table (nullable until student matched/created)
  course_id TEXT REFERENCES courses(id) ON DELETE RESTRICT,  -- FK to courses table (canonical course ID)
  amount NUMERIC(12, 2) NOT NULL,                            -- Authoritative payment amount in Naira (e.g. 60000.00)
  amount_kobo BIGINT NOT NULL,                              -- Subunit amount charged in kobo (e.g. 6000000)
  currency TEXT NOT NULL DEFAULT 'NGN',                     -- 3-letter ISO currency (strictly 'NGN')
  channel TEXT,                                             -- Payment channel ('card', 'bank_transfer', 'ussd', 'qr', 'mobile_money')
  status TEXT NOT NULL DEFAULT 'pending',                   -- State: 'pending', 'success', 'failed', 'abandoned'
  fulfillment_status TEXT NOT NULL DEFAULT 'pending',       -- State: 'pending', 'fulfilled', 'failed'
  fulfillment_error TEXT,                                   -- Detailed enrollment error message if failed
  email_dispatched_at TIMESTAMPTZ,                          -- Timestamp when confirmation email was dispatched
  paystack_transaction_id TEXT,                             -- Transaction ID returned by Paystack API
  customer_email TEXT NOT NULL,                             -- Normalized payer email
  customer_name TEXT,                                       -- Payer full name
  customer_phone TEXT,                                      -- Payer contact phone
  paid_at TIMESTAMPTZ,                                      -- Timestamp when payment was settled on Paystack
  raw_response JSONB,                                       -- Sanitized Paystack gateway response (NO CVV, PIN, or auth secrets)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- Performance & Idempotency Indexes
-- ==============================================================================

-- Enforce global uniqueness on transaction reference (serves as primary key & lookup)
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_reference ON payments(id);

-- Fast lookup by student profile
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);

-- Fast lookup by canonical course
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON payments(course_id);

-- Fast lookup and filtering by transaction settlement status
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Fast lookup by enrollment fulfillment status
CREATE INDEX IF NOT EXISTS idx_payments_fulfillment_status ON payments(fulfillment_status);

-- Audit index for dispatched confirmation emails
CREATE INDEX IF NOT EXISTS idx_payments_email_dispatched_at ON payments(email_dispatched_at) WHERE email_dispatched_at IS NOT NULL;

-- Fast lookup by customer email address
CREATE INDEX IF NOT EXISTS idx_payments_customer_email ON payments(customer_email);

-- Fast lookup by external Paystack transaction identifier
CREATE INDEX IF NOT EXISTS idx_payments_paystack_tx_id ON payments(paystack_transaction_id) WHERE paystack_transaction_id IS NOT NULL;

-- ==============================================================================
-- Automatic updated_at Timestamp Trigger
-- ==============================================================================

CREATE OR REPLACE FUNCTION update_payments_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS trigger_payments_updated_at ON payments;
CREATE TRIGGER trigger_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_payments_updated_at_column();

-- ==============================================================================
-- Row Level Security (RLS)
-- Enables strict access control: public browser anon keys cannot tamper with
-- payment records. Backend server uses the SUPABASE_SERVICE_ROLE_KEY to bypass RLS.
-- ==============================================================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated students to read their own payment records in the student portal
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Students can view own payment records'
  ) THEN
    CREATE POLICY "Students can view own payment records"
      ON payments
      FOR SELECT
      TO authenticated
      USING (
        student_id IN (
          SELECT id FROM students WHERE auth_user_id = auth.uid()
        )
      );
  END IF;
END $$;

