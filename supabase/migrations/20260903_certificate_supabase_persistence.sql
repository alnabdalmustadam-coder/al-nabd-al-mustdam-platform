-- Persist certificate templates and issued certificates in Supabase.
-- The application imports the bundled legacy JSON records once using
-- deterministic UUIDs, then uses these tables as the only source of truth.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT UPPER(COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', 'STUDENT'))
    IN ('ADMIN', 'SUPERADMIN', 'SUPER_ADMIN');
$$;

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
  ADD COLUMN IF NOT EXISTS course_title text NOT NULL DEFAULT 'كافة الدورات التدريبية',
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS auto_issue boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Keep compatibility with the historical student schema while adding the
-- fields used by the certificate designer and issuance APIs.
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_code text UNIQUE NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  pdf_url text,
  template_id uuid REFERENCES public.certificate_templates(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS certificate_code text,
  ADD COLUMN IF NOT EXISTS issued_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS pdf_url text,
  ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES public.certificate_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS certificates_certificate_code_unique_idx
  ON public.certificates(certificate_code)
  WHERE certificate_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS certificate_templates_updated_at_idx
  ON public.certificate_templates(updated_at DESC);
CREATE INDEX IF NOT EXISTS certificate_templates_payload_idx
  ON public.certificate_templates USING gin(payload);
CREATE INDEX IF NOT EXISTS certificates_issued_at_idx
  ON public.certificates(issued_at DESC);
CREATE INDEX IF NOT EXISTS certificates_payload_idx
  ON public.certificates USING gin(payload);
CREATE INDEX IF NOT EXISTS certificates_student_email_idx
  ON public.certificates(LOWER(payload ->> 'studentEmail'));

ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS certificate_templates_authenticated_read_v2 ON public.certificate_templates;
CREATE POLICY certificate_templates_authenticated_read_v2
  ON public.certificate_templates FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS certificate_templates_admin_manage_v2 ON public.certificate_templates;
CREATE POLICY certificate_templates_admin_manage_v2
  ON public.certificate_templates FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

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

REVOKE ALL ON public.certificate_templates, public.certificates FROM anon;
GRANT SELECT ON public.certificate_templates, public.certificates TO authenticated;
GRANT ALL ON public.certificate_templates, public.certificates TO service_role;

COMMIT;
