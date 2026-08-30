-- Private student submissions and enrollment-scoped learning resources.
-- Apply after schema-v3-student.sql, supabase-production-v4.sql,
-- supabase-v5-missing-tables.sql, and security-hardening-v1.sql.

DO $$
BEGIN
  IF to_regclass('public.enrollments') IS NULL THEN
    RAISE EXCEPTION 'Missing prerequisite table public.enrollments';
  END IF;
  IF to_regclass('public.assignments') IS NULL THEN
    RAISE EXCEPTION 'Missing prerequisite table public.assignments';
  END IF;
  IF to_regclass('public.live_sessions') IS NULL THEN
    RAISE EXCEPTION 'Missing prerequisite table public.live_sessions';
  END IF;
  IF to_regclass('storage.buckets') IS NULL OR to_regclass('storage.objects') IS NULL THEN
    RAISE EXCEPTION 'Supabase Storage schema is not available';
  END IF;
END $$;

-- Uploads are written by server-only service-role routes and downloaded through
-- short-lived signed URLs. The bucket itself must never be public.
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'student-submissions',
  'student-submissions',
  false,
  26214400,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-7z-compressed'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- This helper runs with the function owner's privileges so an enrollment check
-- remains deterministic even while the enrollments table has its own RLS. It
-- never accepts a user id or email from the caller; both come from auth claims.
CREATE OR REPLACE FUNCTION public.current_user_is_enrolled(target_course_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND NULLIF(BTRIM(target_course_id), '') IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.enrollments AS enrollment
      WHERE (
        enrollment.user_id = auth.uid()
        OR (
          NULLIF(LOWER(auth.jwt() ->> 'email'), '') IS NOT NULL
          AND LOWER(BTRIM(enrollment.email)) = LOWER(BTRIM(auth.jwt() ->> 'email'))
        )
      )
      AND COALESCE(LOWER(enrollment.status), 'active') NOT IN (
        'revoked',
        'cancelled',
        'canceled',
        'inactive'
      )
      AND LOWER(REGEXP_REPLACE(BTRIM(enrollment.course_id::TEXT), '^course-', '')) =
          LOWER(REGEXP_REPLACE(BTRIM(target_course_id), '^course-', ''))
    );
$$;

REVOKE ALL ON FUNCTION public.current_user_is_enrolled(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_is_enrolled(TEXT) TO authenticated, service_role;

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Prevent two concurrent requests from opening multiple active attempts for the
-- same authenticated learner and quiz.
WITH ranked_in_progress AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY quiz_id, user_id
      ORDER BY started_at DESC, id DESC
    ) AS row_number
  FROM public.quiz_attempts
  WHERE status = 'in_progress' AND user_id IS NOT NULL
)
UPDATE public.quiz_attempts AS attempt
SET status = 'expired', completed_at = COALESCE(attempt.completed_at, now())
FROM ranked_in_progress AS ranked
WHERE attempt.id = ranked.id AND ranked.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_attempts_one_in_progress
ON public.quiz_attempts (quiz_id, user_id)
WHERE status = 'in_progress' AND user_id IS NOT NULL;

-- Students see only active assignments for courses they are enrolled in.
DROP POLICY IF EXISTS "View active assignments" ON public.assignments;
DROP POLICY IF EXISTS "Students view enrolled assignments" ON public.assignments;
CREATE POLICY "Students view enrolled assignments"
ON public.assignments
FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR public.is_instructor()
  OR (
    is_active = true
    AND public.current_user_is_enrolled(course_id::TEXT)
  )
);

-- General platform sessions remain available to every signed-in learner.
-- Course-specific meeting and recording links require an active enrollment.
DROP POLICY IF EXISTS "View live sessions" ON public.live_sessions;
DROP POLICY IF EXISTS "Students view enrolled live sessions" ON public.live_sessions;
CREATE POLICY "Students view enrolled live sessions"
ON public.live_sessions
FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR public.is_instructor()
  OR (
    auth.uid() IS NOT NULL
    AND (
      course_id IS NULL
      OR NULLIF(BTRIM(course_id::TEXT), '') IS NULL
      OR public.current_user_is_enrolled(course_id::TEXT)
    )
  )
);

-- Direct browser access to student-submissions is intentionally not granted.
-- The service role bypasses Storage RLS; application APIs enforce ownership,
-- enrollment, due dates, and signed-download expiry before accessing objects.
