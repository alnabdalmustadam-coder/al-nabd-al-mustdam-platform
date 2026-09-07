-- =============================================================================
-- SUSTAINSULSE - MASTER DATABASE SYNCHRONIZATION MIGRATION (2026-09-08)
-- 
-- الغرض: مزامنة كافة الجداول والأعمدة الحديثة في Supabase لضمان عمل كافة الميزات
-- (المدربين، الشهادات، المقالات، الخدمات، تصحيح أسماء الطلاب، الأفاتار)
-- بدون أي بيانات وهمية أو أخطاء schema cache.
-- 
-- هذه الميجريشن آمنة وقابلة للتكرار بالكامل (100% Idempotent):
-- يمكنك تشغيلها مباشرة في Supabase Dashboard -> SQL Editor
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. دوال الصلاحيات المعتمدة (App Metadata Role Helpers)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT UPPER(COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'STUDENT'));
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT public.current_app_role() IN ('ADMIN', 'SUPERADMIN', 'SUPER_ADMIN');
$$;

CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT public.current_app_role() IN ('INSTRUCTOR', 'TRAINER', 'TEACHER');
$$;

-- -----------------------------------------------------------------------------
-- 2. ترقية جدول الملفات الشخصية (profiles) لدعم المدربين والطلاب بالكامل
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'STUDENT';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS national_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nelc_eligible BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_status_idx ON public.profiles(status);

-- -----------------------------------------------------------------------------
-- 3. جدول قوالب الشهادات (certificate_templates)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  course_title text NOT NULL DEFAULT 'كافة الدورات التدريبية',
  image_url text,
  auto_issue boolean NOT NULL DEFAULT false,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.certificate_templates
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS course_title text NOT NULL DEFAULT 'كافة الدورات التدريبية',
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS auto_issue boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS certificate_templates_updated_at_idx ON public.certificate_templates(updated_at DESC);
CREATE INDEX IF NOT EXISTS certificate_templates_payload_idx ON public.certificate_templates USING gin(payload);

-- -----------------------------------------------------------------------------
-- 4. جدول الشهادات المصدرة (certificates) وترقية أعمدته
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_code text UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  course_id text,
  template_id uuid REFERENCES public.certificate_templates(id) ON DELETE SET NULL,
  pdf_url text,
  status text NOT NULL DEFAULT 'active',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  issued_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS certificate_code text,
  ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES public.certificate_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pdf_url text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS issued_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS certificates_certificate_code_unique_idx
  ON public.certificates(certificate_code)
  WHERE certificate_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS certificates_issued_at_idx ON public.certificates(issued_at DESC);
CREATE INDEX IF NOT EXISTS certificates_payload_idx ON public.certificates USING gin(payload);
CREATE INDEX IF NOT EXISTS certificates_student_email_idx ON public.certificates(LOWER(payload ->> 'studentEmail'));

-- -----------------------------------------------------------------------------
-- 5. جدول المقالات والمحتوى التحريري (admin_content_items)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('article', 'service', 'page')),
  slug text NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'active', 'inactive', 'archived')),
  is_featured boolean NOT NULL DEFAULT false,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(kind, slug)
);

CREATE INDEX IF NOT EXISTS admin_content_kind_status_idx ON public.admin_content_items(kind, status);
CREATE INDEX IF NOT EXISTS admin_content_slug_idx ON public.admin_content_items(slug);

-- -----------------------------------------------------------------------------
-- 6. سجل التدقيق والإشعارات الإدارية (Audit Log & Notifications)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  request_id uuid NOT NULL DEFAULT gen_random_uuid(),
  ip_hash text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_created_idx ON public.admin_audit_log(created_at DESC);

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  href text,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'success', 'warning', 'error')),
  audience_role text NOT NULL DEFAULT 'ADMIN',
  read_by uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.course_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  course_id text NOT NULL,
  source text NOT NULL CHECK (source IN ('ghl_webhook', 'order', 'admin_grant')),
  source_reference text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS course_entitlements_active_unique
  ON public.course_entitlements(LOWER(email), course_id)
  WHERE status = 'active';

-- -----------------------------------------------------------------------------
-- 7. تفعيل وتأمين سياسات الأمان على مستوى السجل (RLS Policies)
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_entitlements ENABLE ROW LEVEL SECURITY;

-- Profiles: المستخدم يرى ملفه فقط، والآدمن يرى الجميع
DROP POLICY IF EXISTS profiles_select_own_or_admin ON public.profiles;
CREATE POLICY profiles_select_own_or_admin
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS profiles_update_own_or_admin ON public.profiles;
CREATE POLICY profiles_update_own_or_admin
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- Certificate Templates: قراءة للمصادق عليهم، وتعديل للآدمن فقط
DROP POLICY IF EXISTS certificate_templates_authenticated_read_v2 ON public.certificate_templates;
CREATE POLICY certificate_templates_authenticated_read_v2
  ON public.certificate_templates FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS certificate_templates_admin_manage_v2 ON public.certificate_templates;
CREATE POLICY certificate_templates_admin_manage_v2
  ON public.certificate_templates FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Certificates: الطالب يرى شهاداته فقط عبر الإيميل، والآدمن يدير كل شيء
DROP POLICY IF EXISTS certificates_owner_or_admin_read_v2 ON public.certificates;
CREATE POLICY certificates_owner_or_admin_read_v2
  ON public.certificates FOR SELECT TO authenticated
  USING (
    LOWER(COALESCE(payload ->> 'studentEmail', '')) = LOWER(COALESCE(auth.jwt() ->> 'email', ''))
    OR public.is_admin()
  );

DROP POLICY IF EXISTS certificates_admin_manage_v2 ON public.certificates;
CREATE POLICY certificates_admin_manage_v2
  ON public.certificates FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin Content (المقالات والمدونة): قراءة عامة للمنشور، وإدارة للآدمن وهيئة التدريس
DROP POLICY IF EXISTS admin_content_public_read ON public.admin_content_items;
CREATE POLICY admin_content_public_read ON public.admin_content_items FOR SELECT
  USING (
    (kind = 'article' AND status = 'published')
    OR (kind = 'service' AND status = 'active')
    OR public.is_admin()
    OR public.is_instructor()
  );

DROP POLICY IF EXISTS admin_content_staff_manage ON public.admin_content_items;
CREATE POLICY admin_content_staff_manage ON public.admin_content_items FOR ALL TO authenticated
  USING (public.is_admin() OR public.is_instructor())
  WITH CHECK (public.is_admin() OR public.is_instructor());

COMMIT;
