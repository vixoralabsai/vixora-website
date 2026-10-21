-- ==============================================================================
-- Vixora Academy: 002_rls_security_policies.sql
-- Enables Row Level Security (RLS) and attaches granular access policies
-- ==============================================================================

-- 1. Enable Row Level Security across all core tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- 2. Courses Policies
DROP POLICY IF EXISTS "Public can view published courses" ON courses;
CREATE POLICY "Public can view published courses"
ON courses FOR SELECT
USING (status = 'published');

-- 3. Students Policies
DROP POLICY IF EXISTS "Students can view own profile" ON students;
CREATE POLICY "Students can view own profile"
ON students FOR SELECT
USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Students can update own profile" ON students;
CREATE POLICY "Students can update own profile"
ON students FOR UPDATE
USING (auth.uid() = auth_user_id);

-- 4. Enrollments Policies
DROP POLICY IF EXISTS "Students can view own enrollments" ON enrollments;
CREATE POLICY "Students can view own enrollments"
ON enrollments FOR SELECT
USING (
  student_id IN (
    SELECT id FROM students WHERE auth_user_id = auth.uid()
  )
);

-- 5. Certificates Policies (Public Credential Verification)
DROP POLICY IF EXISTS "Public can verify valid certificates" ON certificates;
CREATE POLICY "Public can verify valid certificates"
ON certificates FOR SELECT
USING (status = 'valid');

-- 6. Certificate Competencies Policies
DROP POLICY IF EXISTS "Public can view competencies of valid certificates" ON certificate_competencies;
CREATE POLICY "Public can view competencies of valid certificates"
ON certificate_competencies FOR SELECT
USING (
  certificate_id IN (
    SELECT id FROM certificates WHERE status = 'valid'
  )
);

-- 7. Payments Policies
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments"
ON payments FOR SELECT
USING (
  student_id IN (
    SELECT id FROM students WHERE auth_user_id = auth.uid()
  )
  OR customer_email = auth.jwt() ->> 'email'
);

-- 8. Email Logs Policies (Admin & Service Role Only)
DROP POLICY IF EXISTS "Service role manages email logs" ON email_logs;
CREATE POLICY "Service role manages email logs"
ON email_logs FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');
