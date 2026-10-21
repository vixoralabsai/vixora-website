-- ==============================================================================
-- Vixora Academy: 001_core_baseline_schema.sql
-- Baseline schema establishing the _migrations ledger and all 7 core tables:
-- 1. _migrations
-- 2. courses
-- 3. students
-- 4. enrollments
-- 5. certificates
-- 6. certificate_competencies
-- 7. payments
-- 8. email_logs
-- ==============================================================================

-- 1. Migration Ledger Table (Enforces exactly-once execution and checksums)
CREATE TABLE IF NOT EXISTS _migrations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  batch INTEGER NOT NULL DEFAULT 1,
  checksum TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_migrations_name ON _migrations(name);

-- Helper trigger function to maintain updated_at timestamps
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Canonical Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,                                      -- Canonical slug/ID (e.g. 'ai-image-short-videos-creation')
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price_naira NUMERIC(12, 2) NOT NULL,
  price_kobo BIGINT NOT NULL,
  duration TEXT,
  level TEXT,
  badge TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'published',                 -- 'published', 'draft', 'archived'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

DROP TRIGGER IF EXISTS trg_courses_updated_at ON courses;
CREATE TRIGGER trg_courses_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 3. Students Table (Profiles mapped to Supabase Auth & direct guest enrollments)
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,                                 -- References auth.users(id) when linked
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',                    -- 'active', 'suspended', 'inactive'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_auth_user_id ON students(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

DROP TRIGGER IF EXISTS trg_students_updated_at ON students;
CREATE TRIGGER trg_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 4. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active',                    -- 'active', 'completed', 'dropped'
  progress_percent INTEGER NOT NULL DEFAULT 0,
  payment_reference TEXT,                                   -- Matches payments.id
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_course UNIQUE(student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_payment_ref ON enrollments(payment_reference);

DROP TRIGGER IF EXISTS trg_enrollments_updated_at ON enrollments;
CREATE TRIGGER trg_enrollments_updated_at
BEFORE UPDATE ON enrollments
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 5. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,                                      -- Canonical certificate ID (e.g. 'VXR-2026-A1B2C3')
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  course_id TEXT REFERENCES courses(id) ON DELETE RESTRICT,
  student_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  grade TEXT NOT NULL DEFAULT 'Pass with Distinction',
  issue_date TEXT NOT NULL,                                 -- Formatted date string (e.g. 'October 24, 2026')
  capstone_title TEXT,
  verification_url TEXT,
  verification_hash TEXT,
  status TEXT NOT NULL DEFAULT 'valid',                     -- 'valid', 'revoked'
  pdf_url TEXT,
  directorate_dean TEXT NOT NULL DEFAULT 'Sarumi Hammad',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_hash ON certificates(verification_hash);

DROP TRIGGER IF EXISTS trg_certificates_updated_at ON certificates;
CREATE TRIGGER trg_certificates_updated_at
BEFORE UPDATE ON certificates
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 6. Certificate Competencies Table
CREATE TABLE IF NOT EXISTS certificate_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id TEXT NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'Mastery',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competencies_cert_id ON certificate_competencies(certificate_id);

-- 7. Payments Table (Paystack Transactions Audit Ledger)
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,                                      -- Unique transaction reference (e.g. VIX-PS-1774288000-A1B2C3)
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  course_id TEXT REFERENCES courses(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL,
  amount_kobo BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  channel TEXT,
  status TEXT NOT NULL DEFAULT 'pending',                   -- 'pending', 'success', 'failed', 'abandoned'
  fulfillment_status TEXT NOT NULL DEFAULT 'pending',       -- 'pending', 'fulfilled', 'failed'
  fulfillment_error TEXT,
  email_dispatched_at TIMESTAMPTZ,
  paystack_transaction_id TEXT,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  paid_at TIMESTAMPTZ,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON payments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_fulfillment_status ON payments(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_payments_customer_email ON payments(customer_email);
CREATE INDEX IF NOT EXISTS idx_payments_paystack_tx_id ON payments(paystack_transaction_id);

DROP TRIGGER IF EXISTS trg_payments_updated_at ON payments;
CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 8. Email Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_name TEXT,
  status TEXT NOT NULL DEFAULT 'sent',                      -- 'sent', 'failed'
  provider TEXT NOT NULL DEFAULT 'resend',                  -- 'resend', 'smtp', 'mock'
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
