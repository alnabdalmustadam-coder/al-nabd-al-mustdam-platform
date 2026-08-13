-- ==========================================
-- Sustainsulse Platform V3 Database Schema
-- Focus: Student Path, Bunny Stream Integration & RLS
-- ==========================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  national_id TEXT UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN', 'TRAINEE', 'TRAINER')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger to sync auth.users with public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'طالب جديد'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 2. Courses, Chapters & Lessons
-- ==========================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  thumbnail_url TEXT,
  price NUMERIC(10, 2) DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 3. Videos Table (Bunny Stream Storage)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID UNIQUE REFERENCES public.lessons(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'bunny',
  bunny_video_id TEXT NOT NULL,
  library_id TEXT,
  duration_seconds INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'ready' CHECK (status IN ('processing', 'ready', 'failed')),
  encoding_progress INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 4. Enrollments & Detailed Lesson Progress
-- ==========================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  progress_percent NUMERIC(5, 2) DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'REVOKED')),
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  last_accessed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  watched_seconds INTEGER DEFAULT 0,
  last_position_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- ==========================================
-- 5. Quizzes & Attempts
-- ==========================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_ar TEXT NOT NULL,
  options_json JSONB NOT NULL,
  correct_option_index INTEGER NOT NULL,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN DEFAULT false,
  answers_json JSONB,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 6. Attachments, Notes & Certificates
-- ==========================================
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title_ar TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size TEXT,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lesson_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  timestamp_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_code TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now(),
  pdf_url TEXT,
  UNIQUE(user_id, course_id)
);

-- ==========================================
-- 7. Row Level Security (RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Courses: Anyone logged in can view published courses
CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT USING (is_published = true);

-- Chapters & Lessons: Anyone can view lessons of published courses
CREATE POLICY "Anyone can view chapters of published courses" ON public.chapters FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = chapters.course_id AND is_published = true)
);
CREATE POLICY "Anyone can view lessons of published courses" ON public.lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE courses.id = lessons.course_id AND is_published = true)
);

-- Videos: Students can only access video metadata if enrolled OR if lesson is free preview
CREATE POLICY "Enrolled students or free preview can view video metadata" ON public.videos FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lessons
    LEFT JOIN public.enrollments ON enrollments.course_id = lessons.course_id AND enrollments.user_id = auth.uid()
    WHERE lessons.id = videos.lesson_id
    AND (lessons.is_free_preview = true OR enrollments.status = 'ACTIVE')
  )
);

-- Enrollments: User can see own enrollments
CREATE POLICY "User can view own enrollments" ON public.enrollments FOR SELECT USING (user_id = auth.uid());

-- Lesson Progress: User can manage own lesson progress
CREATE POLICY "User can view own lesson progress" ON public.lesson_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User can insert own lesson progress" ON public.lesson_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User can update own lesson progress" ON public.lesson_progress FOR UPDATE USING (user_id = auth.uid());

-- Lesson Notes: User manages own notes
CREATE POLICY "User can manage own notes" ON public.lesson_notes FOR ALL USING (user_id = auth.uid());

-- Attachments: Enrolled students or free preview
CREATE POLICY "Enrolled students can view attachments" ON public.attachments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lessons
    LEFT JOIN public.enrollments ON enrollments.course_id = lessons.course_id AND enrollments.user_id = auth.uid()
    WHERE lessons.id = attachments.lesson_id
    AND (lessons.is_free_preview = true OR enrollments.status = 'ACTIVE')
  )
);

-- Quizzes & Questions & Attempts
CREATE POLICY "Enrolled students can view quizzes" ON public.quizzes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments WHERE enrollments.course_id = quizzes.course_id AND enrollments.user_id = auth.uid()
  )
);
CREATE POLICY "Enrolled students can view quiz questions" ON public.quiz_questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.quizzes
    JOIN public.enrollments ON enrollments.course_id = quizzes.course_id AND enrollments.user_id = auth.uid()
    WHERE quizzes.id = quiz_questions.quiz_id
  )
);
CREATE POLICY "User can manage own quiz attempts" ON public.quiz_attempts FOR ALL USING (user_id = auth.uid());

-- Certificates: User can view own certificates
CREATE POLICY "User can view own certificates" ON public.certificates FOR SELECT USING (user_id = auth.uid());
