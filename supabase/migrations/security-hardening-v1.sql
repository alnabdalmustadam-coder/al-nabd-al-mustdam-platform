-- Sustain Pulse security hardening.
-- Apply this migration before deploying the matching application release.

BEGIN;

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.webhook_events FROM anon, authenticated;
GRANT ALL ON TABLE public.webhook_events TO service_role;

-- Public signup metadata is user-controlled. Only app_metadata, which is set by
-- Supabase Admin APIs, may assign a privileged role.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trusted_role TEXT;
BEGIN
  trusted_role := UPPER(COALESCE(NEW.raw_app_meta_data ->> 'role', 'STUDENT'));
  trusted_role := CASE
    WHEN trusted_role IN ('ADMIN', 'SUPERADMIN', 'SUPER_ADMIN') THEN 'ADMIN'
    WHEN trusted_role IN ('INSTRUCTOR', 'TRAINER', 'TEACHER') THEN 'INSTRUCTOR'
    ELSE 'STUDENT'
  END;

  INSERT INTO public.profiles (id, email, full_name, role, phone, national_id)
  VALUES (
    NEW.id,
    LOWER(NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email, 'مستخدم جديد'),
    trusted_role,
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'national_id'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE
      WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' THEN EXCLUDED.full_name
      ELSE public.profiles.full_name
    END,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Do not promote accounts from profiles.role here. Older policies allowed users
-- to edit their own profile, so that column is not a safe source of authority.
-- Existing privileged accounts must be reviewed and assigned app_metadata.role
-- through the Supabase dashboard or a service-role-only administrative flow.
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) ||
  jsonb_build_object(
    'role',
    CASE
      WHEN UPPER(raw_app_meta_data ->> 'role') IN ('ADMIN', 'SUPERADMIN', 'SUPER_ADMIN') THEN 'ADMIN'
      WHEN UPPER(raw_app_meta_data ->> 'role') IN ('INSTRUCTOR', 'TRAINER', 'TEACHER') THEN 'INSTRUCTOR'
      ELSE 'STUDENT'
    END
  );

-- Authorization helpers use only server-controlled JWT app_metadata.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT UPPER(COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', ''))
    IN ('ADMIN', 'SUPERADMIN', 'SUPER_ADMIN');
$$;

CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT UPPER(COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', ''))
    IN ('INSTRUCTOR', 'TRAINER', 'TEACHER');
$$;

CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_is_admin BOOLEAN := FALSE;
BEGIN
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  caller_is_admin := public.is_admin();

  IF NOT caller_is_admin THEN
    RAISE EXCEPTION 'Only administrators may change profile roles'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_role_trigger ON public.profiles;
CREATE TRIGGER protect_profile_role_trigger
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();

CREATE OR REPLACE FUNCTION public.sync_profile_role_to_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object(
      'role',
      CASE
        WHEN UPPER(NEW.role) = 'ADMIN' THEN 'ADMIN'
        WHEN UPPER(NEW.role) = 'INSTRUCTOR' THEN 'INSTRUCTOR'
        ELSE 'STUDENT'
      END
    )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_role_to_auth_trigger ON public.profiles;
CREATE TRIGGER sync_profile_role_to_auth_trigger
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW
  WHEN (NEW.role IS DISTINCT FROM OLD.role)
  EXECUTE FUNCTION public.sync_profile_role_to_auth();

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- Financial, enrollment and support records are not user-editable. Legacy
-- FOR ALL policies allowed users to change totals, payment state, grades and
-- ticket administration fields on rows they owned.
DROP POLICY IF EXISTS "User creates enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "User views enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins manage enrollments" ON public.enrollments;
CREATE POLICY "User views enrollments" ON public.enrollments FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
);
CREATE POLICY "Admins manage enrollments" ON public.enrollments FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Wishlist access" ON public.wishlists;
DROP POLICY IF EXISTS "Cart access" ON public.cart_items;
CREATE POLICY "Wishlist access" ON public.wishlists FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
);
CREATE POLICY "Cart access" ON public.cart_items FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Public certificate verification" ON public.certificates;
DROP POLICY IF EXISTS "Admins manage certificates" ON public.certificates;
CREATE POLICY "Public certificate verification" ON public.certificates FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
);
CREATE POLICY "Admins manage certificates" ON public.certificates FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "View coupons" ON public.coupons;
DROP POLICY IF EXISTS "Manage coupons" ON public.coupons;
CREATE POLICY "View coupons" ON public.coupons FOR SELECT USING (public.is_admin());
CREATE POLICY "Manage coupons" ON public.coupons FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Orders access" ON public.orders;
DROP POLICY IF EXISTS "Invoices access" ON public.invoices;
CREATE POLICY "Orders access" ON public.orders FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
);
CREATE POLICY "Invoices access" ON public.invoices FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Tickets access" ON public.support_tickets;
DROP POLICY IF EXISTS "Replies access" ON public.ticket_replies;
DROP POLICY IF EXISTS "Users create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins manage tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users create replies" ON public.ticket_replies;
DROP POLICY IF EXISTS "Admins manage replies" ON public.ticket_replies;
CREATE POLICY "Tickets access" ON public.support_tickets FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
);
CREATE POLICY "Users create tickets" ON public.support_tickets FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND LOWER(email) = LOWER(auth.jwt() ->> 'email')
  AND status = 'OPEN'
  AND priority = 'NORMAL'
);
CREATE POLICY "Admins manage tickets" ON public.support_tickets FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Replies access" ON public.ticket_replies FOR SELECT USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.support_tickets AS ticket
    WHERE ticket.id = ticket_replies.ticket_id
      AND (
        ticket.user_id = auth.uid()
        OR (ticket.user_id IS NULL AND LOWER(ticket.email) = LOWER(auth.jwt() ->> 'email'))
      )
  )
);
CREATE POLICY "Users create replies" ON public.ticket_replies FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND is_admin_reply = false
  AND EXISTS (
    SELECT 1 FROM public.support_tickets AS ticket
    WHERE ticket.id = ticket_replies.ticket_id
      AND (
        ticket.user_id = auth.uid()
        OR (ticket.user_id IS NULL AND LOWER(ticket.email) = LOWER(auth.jwt() ->> 'email'))
      )
  )
);
CREATE POLICY "Admins manage replies" ON public.ticket_replies FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Remove permissive policies left by the older V2/V3 schemas. RLS policies are
-- ORed together, so one forgotten legacy policy can bypass the hardened rules.
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "User can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

DO $$
BEGIN
  IF to_regclass('public.courses') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Trainers can manage own courses" ON public.courses';
  END IF;
  IF to_regclass('public.lessons') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view lessons" ON public.lessons';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view lessons of published courses" ON public.lessons';
    EXECUTE 'DROP POLICY IF EXISTS "Trainers can manage own course lessons" ON public.lessons';
  END IF;
  IF to_regclass('public.services') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage services" ON public.services';
  END IF;
  IF to_regclass('public.lesson_progress') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "User can insert own lesson progress" ON public.lesson_progress';
    EXECUTE 'DROP POLICY IF EXISTS "User can update own lesson progress" ON public.lesson_progress';
  END IF;
  IF to_regclass('public.quiz_questions') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Enrolled students can view quiz questions" ON public.quiz_questions';
  END IF;
  IF to_regclass('public.quiz_attempts') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "User can manage own quiz attempts" ON public.quiz_attempts';
  END IF;
END;
$$;

-- The previous "service role" policies used USING (true), which also allowed
-- anon/authenticated clients when table grants were present. Service role
-- bypasses RLS, so these tables need no permissive client policy.
DROP POLICY IF EXISTS "Service role full access on xapi_statements" ON public.xapi_statements;
DROP POLICY IF EXISTS "Service role full access on xapi_state" ON public.xapi_state;
DROP POLICY IF EXISTS "Service role full access" ON public.enrollments;
REVOKE ALL ON TABLE public.xapi_statements FROM anon, authenticated;
REVOKE ALL ON TABLE public.xapi_state FROM anon, authenticated;
GRANT ALL ON TABLE public.xapi_statements TO service_role;
GRANT ALL ON TABLE public.xapi_state TO service_role;

COMMIT;
