-- ========================================
-- Supabase Setup: Enrollments Table
-- Run this in Supabase Dashboard → SQL Editor
-- ========================================

-- جدول التسجيلات: يحفظ دورات كل طالب وحالة التقدم
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  course_id TEXT NOT NULL,
  course_title TEXT NOT NULL,
  course_url TEXT,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  ghl_offer_id TEXT,
  UNIQUE(email, course_id)
);

-- فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_enrollments_email ON enrollments(email);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- تمكين RLS (Row Level Security) - اختياري لكن مُستحسن
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- service_role bypasses RLS automatically. Never create a USING (true)
-- "service role" policy because it also opens the table to client roles.
