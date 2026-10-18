-- Carry at most one second of already elapsed playback time between advancing
-- reports. This prevents coarse player events/network jitter from repeatedly
-- discarding time, without crediting time that has not elapsed on the server.
alter table public.course_lesson_progress
  add column uncredited_seconds double precision not null default 0
  check (uncredited_seconds between 0 and 1);

create or replace function public.start_cpd_video_session(p_user_id uuid, p_course_id bigint, p_lesson_id text,
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
    session_id = excluded.session_id, playing = false, uncredited_seconds = 0, last_event_at = clock_timestamp()
  returning * into r;
  return jsonb_build_object('id', r.session_id, 'duration', r.duration_seconds, 'watchedSeconds', r.watched_seconds);
end;
$$;

create or replace function public.record_cpd_video_progress(p_user_id uuid, p_course_id bigint, p_lesson_id text,
  p_content_key text, p_session_id uuid, p_seconds double precision, p_event text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  r public.course_lesson_progress; event_time timestamptz; elapsed double precision;
  available double precision; carry double precision; accepted boolean; frontier double precision;
begin
  if p_event not in ('play','pause','tick') or not (p_seconds >= 0 and p_seconds <= 86400) then
    raise exception 'Invalid playback event';
  end if;
  select * into r from public.course_lesson_progress
    where user_id = p_user_id and course_id = p_course_id and lesson_id = p_lesson_id for update;
  if not found or r.session_id is distinct from p_session_id or r.content_key is distinct from p_content_key then
    return jsonb_build_object('stale', true);
  end if;
  event_time := clock_timestamp();
  elapsed := least(12, greatest(0, extract(epoch from event_time - r.last_event_at)));
  available := case when r.playing then elapsed + r.uncredited_seconds else 0 end;
  -- Preserve the existing seek bounds; carry does not widen them.
  accepted := p_seconds <= r.duration_seconds + 0.5
    and p_seconds <= r.watched_seconds + (case when r.playing then elapsed else 0 end) + 1
    and p_seconds - r.last_position <= (case when r.playing then elapsed else 0 end) + 1;
  frontier := case when accepted and r.playing
    then greatest(r.watched_seconds, least(p_seconds, r.watched_seconds + available, r.duration_seconds))
    else r.watched_seconds end;
  -- Pausing, rewinding, stalled positions and rejected seeks discard the carry.
  -- Repeated requests without elapsed time cannot manufacture watch credit.
  carry := case when accepted and r.playing and p_event in ('play','tick')
    and p_seconds > r.last_position and p_seconds > r.watched_seconds
    then least(1, greatest(0, available - (frontier - r.watched_seconds))) else 0 end;
  update public.course_lesson_progress set watched_seconds = frontier,
    last_position = case when accepted then least(p_seconds, r.duration_seconds) else frontier end,
    playing = accepted and p_event in ('play','tick'), uncredited_seconds = carry, last_event_at = event_time
    where user_id = p_user_id and course_id = p_course_id and lesson_id = p_lesson_id;
  return jsonb_build_object('stale', false, 'accepted', accepted, 'watchedSeconds', frontier,
    'seekTo', case when accepted then null else frontier end,
    'canComplete', frontier >= r.duration_seconds - least(1, r.duration_seconds * 0.01));
end;
$$;

-- CREATE OR REPLACE retains privileges; also state the intended boundary here.
revoke all on function public.start_cpd_video_session(uuid,bigint,text,text,double precision,uuid) from public, anon, authenticated;
revoke all on function public.record_cpd_video_progress(uuid,bigint,text,text,uuid,double precision,text) from public, anon, authenticated;
grant execute on function public.start_cpd_video_session(uuid,bigint,text,text,double precision,uuid) to service_role;
grant execute on function public.record_cpd_video_progress(uuid,bigint,text,text,uuid,double precision,text) to service_role;
