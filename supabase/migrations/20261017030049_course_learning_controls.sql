-- Additive learning controls. Only authenticated application routes using the
-- service role can write verified progress or read other learners' aggregates.
create table public.course_lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id bigint not null references public.course_catalog(id) on delete cascade,
  lesson_id text not null check (length(lesson_id) between 1 and 160),
  content_key text not null,
  duration_seconds double precision not null default 0 check (duration_seconds between 0 and 86400),
  watched_seconds double precision not null default 0 check (watched_seconds >= 0 and watched_seconds <= duration_seconds),
  last_position double precision not null default 0,
  playing boolean not null default false,
  session_id uuid,
  last_event_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (user_id, course_id, lesson_id)
);
create index course_lesson_progress_course_idx on public.course_lesson_progress(course_id);
alter table public.course_lesson_progress enable row level security;
revoke all on public.course_lesson_progress from public, anon, authenticated;
grant all on public.course_lesson_progress to service_role;
create policy "Application service manages verified progress" on public.course_lesson_progress
  for all to service_role using (true) with check (true);

create table public.content_satisfaction (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id bigint not null references public.course_catalog(id) on delete cascade,
  content_kind text not null check (content_kind in ('lesson', 'quiz')),
  content_key text not null check (length(content_key) between 1 and 200),
  content_title text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id, content_kind, content_key)
);
create index content_satisfaction_course_idx on public.content_satisfaction(course_id, content_kind, content_key);
alter table public.content_satisfaction enable row level security;
revoke all on public.content_satisfaction from public, anon, authenticated;
grant all on public.content_satisfaction to service_role;
create policy "Application service manages satisfaction" on public.content_satisfaction
  for all to service_role using (true) with check (true);

create index xapi_internal_quiz_rank_idx on public.xapi_statements(object_id, actor_email, result_score desc)
  where verb_display = 'answered' and result_completion = true;

create function public.internal_quiz_rank(p_activity_id text, p_email text)
returns jsonb language sql stable security invoker set search_path = '' as $$
  with best as (
    select actor_email, max(result_score) as score
    from public.xapi_statements
    where object_id = p_activity_id and verb_display = 'answered' and result_completion = true
      and raw_statement->'result'->'extensions'->'https://nabdtraining.com/extensions/internal-quiz-result' is not null
      and actor_email is not null and result_score between 0 and 1
    group by actor_email
  ), own as (select score from best where actor_email = p_email)
  select case when exists(select 1 from own) then jsonb_build_object(
    'rank', 1 + (select count(*) from best where score > (select score from own)),
    'participants', (select count(*) from best),
    'bestScore', round(((select score from own) * 100)::numeric, 2)
  ) else null end;
$$;

create function public.start_cpd_video_session(p_user_id uuid, p_course_id bigint, p_lesson_id text,
  p_content_key text, p_duration double precision, p_session_id uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare r public.course_lesson_progress;
begin
  if not (p_duration > 0 and p_duration <= 86400) then raise exception 'Invalid video duration'; end if;
  insert into public.course_lesson_progress as current
    (user_id, course_id, lesson_id, content_key, duration_seconds, session_id)
  values (p_user_id, p_course_id, p_lesson_id, p_content_key, p_duration, p_session_id)
  on conflict (user_id, course_id, lesson_id) do update set
    content_key = excluded.content_key, duration_seconds = excluded.duration_seconds,
    watched_seconds = case when current.content_key = excluded.content_key then least(current.watched_seconds, p_duration) else 0 end,
    last_position = case when current.content_key = excluded.content_key then least(current.watched_seconds, p_duration) else 0 end,
    completed_at = case when current.content_key = excluded.content_key and current.duration_seconds = p_duration then current.completed_at else null end,
    session_id = excluded.session_id, playing = false, last_event_at = clock_timestamp()
  returning * into r;
  return jsonb_build_object('id', r.session_id, 'duration', r.duration_seconds, 'watchedSeconds', r.watched_seconds);
end;
$$;

create function public.record_cpd_video_progress(p_user_id uuid, p_course_id bigint, p_lesson_id text,
  p_content_key text, p_session_id uuid, p_seconds double precision, p_event text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare r public.course_lesson_progress; elapsed double precision; accepted boolean; frontier double precision;
begin
  if p_event not in ('play','pause','tick') or not (p_seconds >= 0 and p_seconds <= 86400) then
    raise exception 'Invalid playback event';
  end if;
  select * into r from public.course_lesson_progress
    where user_id = p_user_id and course_id = p_course_id and lesson_id = p_lesson_id for update;
  if not found or r.session_id is distinct from p_session_id or r.content_key is distinct from p_content_key then
    return jsonb_build_object('stale', true);
  end if;
  elapsed := least(12, greatest(0, extract(epoch from clock_timestamp() - r.last_event_at)));
  -- Tolerate network jitter, but never CREDIT more than server elapsed time.
  -- Rewatching an earlier segment cannot inflate the watched frontier.
  accepted := p_seconds <= r.duration_seconds + 0.5
    and p_seconds <= r.watched_seconds + (case when r.playing then elapsed else 0 end) + 1
    and p_seconds - r.last_position <= (case when r.playing then elapsed else 0 end) + 1;
  frontier := case when accepted and r.playing then greatest(r.watched_seconds, least(p_seconds, r.watched_seconds + elapsed, r.duration_seconds)) else r.watched_seconds end;
  update public.course_lesson_progress set watched_seconds = frontier,
    last_position = case when accepted then least(p_seconds, r.duration_seconds) else frontier end,
    playing = accepted and p_event in ('play','tick'), last_event_at = clock_timestamp()
    where user_id = p_user_id and course_id = p_course_id and lesson_id = p_lesson_id;
  return jsonb_build_object('stale', false, 'accepted', accepted, 'watchedSeconds', frontier,
    'seekTo', case when accepted then null else frontier end,
    'canComplete', frontier >= r.duration_seconds - least(1, r.duration_seconds * 0.01));
end;
$$;

create function public.course_satisfaction_summary()
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'courses', coalesce((select jsonb_agg(row_to_json(c)) from (
      select course_id, count(*) as hearts, count(distinct user_id) as learners,
        count(*) filter (where content_kind = 'lesson') as lesson_hearts,
        count(*) filter (where content_kind = 'quiz') as quiz_hearts
      from public.content_satisfaction group by course_id
    ) c), '[]'::jsonb),
    'contents', coalesce((select jsonb_agg(row_to_json(c)) from (
      select course_id, content_kind, content_key, max(content_title) as title, count(*) as hearts
      from public.content_satisfaction group by course_id, content_kind, content_key
    ) c), '[]'::jsonb),
    'learners', (select count(distinct user_id) from public.content_satisfaction)
  );
$$;

revoke all on function public.internal_quiz_rank(text,text) from public, anon, authenticated;
revoke all on function public.start_cpd_video_session(uuid,bigint,text,text,double precision,uuid) from public, anon, authenticated;
revoke all on function public.record_cpd_video_progress(uuid,bigint,text,text,uuid,double precision,text) from public, anon, authenticated;
revoke all on function public.course_satisfaction_summary() from public, anon, authenticated;
grant execute on function public.internal_quiz_rank(text,text) to service_role;
grant execute on function public.start_cpd_video_session(uuid,bigint,text,text,double precision,uuid) to service_role;
grant execute on function public.record_cpd_video_progress(uuid,bigint,text,text,uuid,double precision,text) to service_role;
grant execute on function public.course_satisfaction_summary() to service_role;
