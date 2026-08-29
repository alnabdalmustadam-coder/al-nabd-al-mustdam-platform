-- ========================================
-- xAPI Tables for NELC Accreditation
-- Run this in Supabase Dashboard → SQL Editor
-- ========================================

-- 1. جدول xAPI Statements — يخزن كل بيانات التتبع
CREATE TABLE IF NOT EXISTS xapi_statements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  statement_id TEXT NOT NULL UNIQUE,
  
  -- Actor (المتدرب)
  actor_email TEXT NOT NULL,
  actor_name TEXT,
  actor_national_id TEXT,
  
  -- Verb (الفعل)
  verb_id TEXT NOT NULL,           -- e.g., http://adlnet.gov/expapi/verbs/completed
  verb_display TEXT NOT NULL,       -- e.g., "completed"
  verb_display_ar TEXT,             -- e.g., "أكمل"
  
  -- Object (النشاط)
  object_id TEXT NOT NULL,          -- e.g., https://nabdtraining.com/courses/course-haceb
  object_name TEXT,                 -- e.g., "استخدام الحاسب الآلي"
  object_type TEXT,                 -- e.g., http://adlnet.gov/expapi/activities/course
  
  -- Result (النتيجة)
  result_score NUMERIC,             -- 0.0 to 1.0 (scaled)
  result_completion BOOLEAN,
  result_success BOOLEAN,
  result_duration TEXT,             -- ISO 8601 duration (PT1H30M)
  
  -- Context (السياق)
  context_registration UUID,        -- مُعرّف جلسة التسجيل
  context_platform TEXT,            -- النبض المستدام
  
  -- Timestamps
  timestamp TIMESTAMPTZ NOT NULL,   -- وقت حدوث الفعل
  stored TIMESTAMPTZ DEFAULT now(), -- وقت التخزين في LRS
  
  -- Raw data
  raw_statement JSONB NOT NULL,     -- الـ statement الكامل بصيغة JSON
  version TEXT DEFAULT '1.0.3'
);

-- فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_xapi_actor_email ON xapi_statements(actor_email);
CREATE INDEX IF NOT EXISTS idx_xapi_verb ON xapi_statements(verb_id);
CREATE INDEX IF NOT EXISTS idx_xapi_object ON xapi_statements(object_id);
CREATE INDEX IF NOT EXISTS idx_xapi_timestamp ON xapi_statements(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_xapi_registration ON xapi_statements(context_registration);
CREATE INDEX IF NOT EXISTS idx_xapi_actor_national_id ON xapi_statements(actor_national_id);

-- ========================================

-- 2. جدول xAPI State — حالة التعلم لكل نشاط
CREATE TABLE IF NOT EXISTS xapi_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id TEXT NOT NULL,
  agent_email TEXT NOT NULL,
  state_id TEXT NOT NULL,
  registration UUID,
  state_data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Unique constraint for upsert
  UNIQUE(activity_id, agent_email, state_id)
);

CREATE INDEX IF NOT EXISTS idx_xapi_state_agent ON xapi_state(agent_email);
CREATE INDEX IF NOT EXISTS idx_xapi_state_activity ON xapi_state(activity_id);

-- ========================================

-- 3. تمكين RLS
ALTER TABLE xapi_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE xapi_state ENABLE ROW LEVEL SECURITY;

-- service_role bypasses RLS automatically. Do not add a USING (true) policy,
-- because that would also permit anon/authenticated clients with table grants.
REVOKE ALL ON TABLE xapi_statements FROM anon, authenticated;
REVOKE ALL ON TABLE xapi_state FROM anon, authenticated;
GRANT ALL ON TABLE xapi_statements TO service_role;
GRANT ALL ON TABLE xapi_state TO service_role;
