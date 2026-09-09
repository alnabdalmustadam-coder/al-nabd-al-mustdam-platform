-- Apply in the production Supabase SQL editor after deploying the matching API.
-- Instructors manage courses through the server routes, which verify live
-- ownership and keep trainer assignment under administrative control.
BEGIN;

ALTER TABLE public.course_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS course_catalog_public_read ON public.course_catalog;
CREATE POLICY course_catalog_public_read ON public.course_catalog
  FOR SELECT TO anon, authenticated
  USING (
    status = 'published'
    OR public.is_admin()
    OR (public.is_instructor() AND payload ->> 'trainerId' = auth.uid()::text)
  );

DROP POLICY IF EXISTS course_catalog_read_visibility ON public.course_catalog;
CREATE POLICY course_catalog_read_visibility ON public.course_catalog
  AS RESTRICTIVE FOR SELECT TO anon, authenticated
  USING (
    status = 'published'
    OR public.is_admin()
    OR (public.is_instructor() AND payload ->> 'trainerId' = auth.uid()::text)
  );

DROP POLICY IF EXISTS course_catalog_staff_manage ON public.course_catalog;
CREATE POLICY course_catalog_staff_manage ON public.course_catalog
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Restrictive policies also close writes allowed by any older permissive
-- policy. The service role used by authenticated server routes bypasses RLS.
DROP POLICY IF EXISTS course_catalog_insert_admin_only ON public.course_catalog;
CREATE POLICY course_catalog_insert_admin_only ON public.course_catalog
  AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS course_catalog_update_admin_only ON public.course_catalog;
CREATE POLICY course_catalog_update_admin_only ON public.course_catalog
  AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS course_catalog_delete_admin_only ON public.course_catalog;
CREATE POLICY course_catalog_delete_admin_only ON public.course_catalog
  AS RESTRICTIVE FOR DELETE TO authenticated
  USING (public.is_admin());

COMMIT;
