-- ==============================================================================
-- SUSTAINSULSE PLATFORM - V5 MISSING TABLES MIGRATION
-- Adds: quizzes, assignments, live_sessions, projects, surveys, notifications, settings
-- ==============================================================================

-- ==============================================================================
-- 1. QUIZZES & QUIZ ATTEMPTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_minutes INTEGER DEFAULT 30,
  pass_percentage INTEGER DEFAULT 60,
  max_attempts INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID,
  email TEXT,
  score NUMERIC(5, 2) DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  answers_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ==============================================================================
-- 2. ASSIGNMENTS & SUBMISSIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  due_date TIMESTAMPTZ,
  max_grade NUMERIC(5, 2) DEFAULT 100,
  allow_late_submission BOOLEAN DEFAULT false,
  attachment_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id UUID,
  email TEXT,
  file_url TEXT,
  notes TEXT,
  grade NUMERIC(5, 2),
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  graded_at TIMESTAMPTZ,
  graded_by UUID
);

-- ==============================================================================
-- 3. LIVE SESSIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.live_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID,
  course_id TEXT,
  meeting_url TEXT,
  platform TEXT DEFAULT 'zoom',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled',
  recording_url TEXT,
  max_attendees INTEGER DEFAULT 100,
  attendees_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. PROJECTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id TEXT NOT NULL,
  user_id UUID,
  email TEXT,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  repository_url TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  grade NUMERIC(5, 2),
  feedback TEXT,
  graded_by UUID,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  graded_at TIMESTAMPTZ
);

-- ==============================================================================
-- 5. SURVEYS & RESPONSES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  questions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_course_id TEXT,
  is_active BOOLEAN DEFAULT true,
  responses_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  user_id UUID,
  email TEXT,
  answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 6. NOTIFICATIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 7. PLATFORM SETTINGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

-- ==============================================================================
-- 8. INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_quizzes_course ON public.quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_email ON public.quiz_attempts(email);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON public.assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.assignment_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_instructor ON public.live_sessions(instructor_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_course ON public.live_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_scheduled ON public.live_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_projects_course ON public.projects(course_id);
CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_surveys_course ON public.surveys(target_course_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON public.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_email ON public.notifications(email);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);

-- ==============================================================================
-- 9. ROW LEVEL SECURITY
-- ==============================================================================

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Authorization is based only on server-controlled JWT app_metadata.
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

CREATE OR REPLACE FUNCTION public.protect_academic_result_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF public.is_admin() OR public.is_instructor() OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.grade IS NOT NULL OR NEW.feedback IS NOT NULL OR NEW.graded_by IS NOT NULL
       OR NEW.graded_at IS NOT NULL OR NEW.status <> 'submitted' THEN
      RAISE EXCEPTION 'Academic result fields are server managed' USING ERRCODE = '42501';
    END IF;
  ELSIF NEW.grade IS DISTINCT FROM OLD.grade
     OR NEW.feedback IS DISTINCT FROM OLD.feedback
     OR NEW.graded_by IS DISTINCT FROM OLD.graded_by
     OR NEW.graded_at IS DISTINCT FROM OLD.graded_at
     OR NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Academic result fields are server managed' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_assignment_result_fields ON public.assignment_submissions;
CREATE TRIGGER protect_assignment_result_fields
  BEFORE INSERT OR UPDATE ON public.assignment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.protect_academic_result_fields();

DROP TRIGGER IF EXISTS protect_project_result_fields ON public.projects;
CREATE TRIGGER protect_project_result_fields
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.protect_academic_result_fields();

CREATE OR REPLACE FUNCTION public.protect_notification_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF public.is_admin() OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.title IS DISTINCT FROM OLD.title
     OR NEW.message IS DISTINCT FROM OLD.message
     OR NEW.type IS DISTINCT FROM OLD.type
     OR NEW.link IS DISTINCT FROM OLD.link
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Only notification read state may be changed' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_notification_content_trigger ON public.notifications;
CREATE TRIGGER protect_notification_content_trigger
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.protect_notification_content();

-- Quiz question records may contain answer keys. Students receive only a safe
-- catalog through the authenticated server API; direct table access is staff-only.
DROP POLICY IF EXISTS "View active quizzes" ON public.quizzes;
CREATE POLICY "View active quizzes" ON public.quizzes FOR SELECT USING (
  public.is_admin() OR public.is_instructor()
);
DROP POLICY IF EXISTS "Manage quizzes" ON public.quizzes;
CREATE POLICY "Manage quizzes" ON public.quizzes FOR ALL USING (
  public.is_admin() OR public.is_instructor()
) WITH CHECK (
  public.is_admin() OR public.is_instructor()
);

-- Attempt results are server-graded. Students may read only their own results.
DROP POLICY IF EXISTS "Quiz attempts access" ON public.quiz_attempts;
CREATE POLICY "Quiz attempts access" ON public.quiz_attempts FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
  OR public.is_instructor()
);

-- Assignments: authenticated users view active, staff manage.
DROP POLICY IF EXISTS "View active assignments" ON public.assignments;
CREATE POLICY "View active assignments" ON public.assignments FOR SELECT USING (
  (auth.uid() IS NOT NULL AND is_active = true)
  OR public.is_admin()
  OR public.is_instructor()
);
DROP POLICY IF EXISTS "Manage assignments" ON public.assignments;
CREATE POLICY "Manage assignments" ON public.assignments FOR ALL USING (
  public.is_admin() OR public.is_instructor()
) WITH CHECK (
  public.is_admin() OR public.is_instructor()
);

-- Assignment submissions: students can submit/read their own work but cannot
-- set grades, feedback or grading status. Staff can review and grade.
DROP POLICY IF EXISTS "Submissions access" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Students submit assignments" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Staff grade submissions" ON public.assignment_submissions;
CREATE POLICY "Submissions access" ON public.assignment_submissions FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
  OR public.is_instructor()
);
CREATE POLICY "Students submit assignments" ON public.assignment_submissions FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND LOWER(email) = LOWER(auth.jwt() ->> 'email')
  AND grade IS NULL
  AND feedback IS NULL
  AND graded_by IS NULL
  AND graded_at IS NULL
  AND status = 'submitted'
);
CREATE POLICY "Staff grade submissions" ON public.assignment_submissions FOR UPDATE USING (
  public.is_admin() OR public.is_instructor()
) WITH CHECK (
  public.is_admin() OR public.is_instructor()
);

-- Live Sessions: meeting links are visible only to signed-in users.
DROP POLICY IF EXISTS "View live sessions" ON public.live_sessions;
CREATE POLICY "View live sessions" ON public.live_sessions FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Manage live sessions" ON public.live_sessions;
CREATE POLICY "Manage live sessions" ON public.live_sessions FOR ALL USING (
  instructor_id = auth.uid() OR public.is_admin()
) WITH CHECK (
  instructor_id = auth.uid() OR public.is_admin()
);

-- Projects: students submit/read their own work; result fields are staff-only.
DROP POLICY IF EXISTS "Projects access" ON public.projects;
DROP POLICY IF EXISTS "Students submit projects" ON public.projects;
DROP POLICY IF EXISTS "Staff grade projects" ON public.projects;
CREATE POLICY "Projects access" ON public.projects FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
  OR public.is_instructor()
);
CREATE POLICY "Students submit projects" ON public.projects FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND LOWER(email) = LOWER(auth.jwt() ->> 'email')
  AND grade IS NULL
  AND feedback IS NULL
  AND graded_by IS NULL
  AND graded_at IS NULL
  AND status = 'submitted'
);
CREATE POLICY "Staff grade projects" ON public.projects FOR UPDATE USING (
  public.is_admin() OR public.is_instructor()
) WITH CHECK (
  public.is_admin() OR public.is_instructor()
);

-- Surveys: only authenticated users may view/answer active surveys.
DROP POLICY IF EXISTS "View active surveys" ON public.surveys;
CREATE POLICY "View active surveys" ON public.surveys FOR SELECT USING (
  (auth.uid() IS NOT NULL AND is_active = true) OR public.is_admin()
);
DROP POLICY IF EXISTS "Manage surveys" ON public.surveys;
CREATE POLICY "Manage surveys" ON public.surveys FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Survey responses cannot be forged for another account or edited afterward.
DROP POLICY IF EXISTS "Survey responses access" ON public.survey_responses;
DROP POLICY IF EXISTS "Students answer surveys" ON public.survey_responses;
CREATE POLICY "Survey responses access" ON public.survey_responses FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
);
CREATE POLICY "Students answer surveys" ON public.survey_responses FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND LOWER(email) = LOWER(auth.jwt() ->> 'email')
);

-- Notifications: users can read and mark their own notifications as read only.
DROP POLICY IF EXISTS "Notifications access" ON public.notifications;
DROP POLICY IF EXISTS "Users update notification read state" ON public.notifications;
DROP POLICY IF EXISTS "Admins manage notifications" ON public.notifications;
CREATE POLICY "Notifications access" ON public.notifications FOR SELECT USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  OR public.is_admin()
);
CREATE POLICY "Users update notification read state" ON public.notifications FOR UPDATE USING (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
) WITH CHECK (
  user_id = auth.uid()
  OR (user_id IS NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email'))
);
CREATE POLICY "Admins manage notifications" ON public.notifications FOR ALL USING (
  public.is_admin()
) WITH CHECK (
  public.is_admin()
);

-- Platform settings may contain integration configuration and are admin-only.
DROP POLICY IF EXISTS "View settings" ON public.platform_settings;
CREATE POLICY "View settings" ON public.platform_settings FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Manage settings" ON public.platform_settings;
CREATE POLICY "Manage settings" ON public.platform_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
