-- Run in BEGIN/ROLLBACK. Simulate changing request arrival times without
-- sleeping or changing a real learner's video record.
do $$
declare
  learner uuid; course bigint; item text := '__qa_jitter_' || gen_random_uuid();
  sid uuid := gen_random_uuid(); result jsonb; credit double precision;
begin
  select id into learner from auth.users order by created_at limit 1;
  select id into course from public.course_catalog order by id limit 1;
  perform public.start_cpd_video_session(learner,course,item,'jitter-v1',30,sid);
  -- A forged ending without elapsed playback remains blocked.
  result := public.record_cpd_video_progress(learner,course,item,'jitter-v1',sid,30,'pause');
  if (result->>'accepted')::boolean or (result->>'canComplete')::boolean then raise exception 'Immediate ending accepted'; end if;
  perform public.record_cpd_video_progress(learner,course,item,'jitter-v1',sid,0,'play');
  -- First sample was delayed in transit; next sample arrives quickly. All
  -- credited seconds are backed by the total time already elapsed on server.
  update public.course_lesson_progress set last_event_at=clock_timestamp()-interval '4 seconds'
    where user_id=learner and course_id=course and lesson_id=item;
  result := public.record_cpd_video_progress(learner,course,item,'jitter-v1',sid,1,'tick');
  if not (result->>'accepted')::boolean then raise exception 'First delayed sample rejected'; end if;
  update public.course_lesson_progress set last_event_at=clock_timestamp()-interval '0.2 seconds'
    where user_id=learner and course_id=course and lesson_id=item;
  result := public.record_cpd_video_progress(learner,course,item,'jitter-v1',sid,4,'tick');
  if not (result->>'accepted')::boolean or (result->>'watchedSeconds')::numeric < 3.99
    or (result->>'watchedSeconds')::numeric > 4.21 then raise exception 'Jitter stopped continuous playback: %',result; end if;
  update public.course_lesson_progress set last_event_at=clock_timestamp()-interval '11 seconds'
    where user_id=learner and course_id=course and lesson_id=item;
  result := public.record_cpd_video_progress(learner,course,item,'jitter-v1',sid,15,'tick');
  if not (result->>'accepted')::boolean then raise exception 'Normal 1x playback rejected'; end if;
  update public.course_lesson_progress set last_event_at=clock_timestamp()-interval '10 seconds'
    where user_id=learner and course_id=course and lesson_id=item;
  result := public.record_cpd_video_progress(learner,course,item,'jitter-v1',sid,25,'tick');
  if not (result->>'accepted')::boolean then raise exception 'Normal 1x playback rejected'; end if;
  update public.course_lesson_progress set last_event_at=clock_timestamp()-interval '4.96 seconds'
    where user_id=learner and course_id=course and lesson_id=item;
  result := public.record_cpd_video_progress(learner,course,item,'jitter-v1',sid,29.96,'pause');
  if not (result->>'canComplete')::boolean then raise exception 'First normal viewing did not finish: %',result; end if;

  perform public.start_cpd_video_session(learner,course,item,'jitter-v2',30,sid);
  perform public.record_cpd_video_progress(learner,course,item,'jitter-v2',sid,0,'play');
  -- Carry cannot grow without limit, survive a pause, or fund a large seek.
  update public.course_lesson_progress set last_event_at=clock_timestamp()-interval '12 seconds'
    where user_id=learner and course_id=course and lesson_id=item;
  perform public.record_cpd_video_progress(learner,course,item,'jitter-v2',sid,1,'tick');
  select uncredited_seconds into credit from public.course_lesson_progress where user_id=learner and course_id=course and lesson_id=item;
  if credit > 5 then raise exception 'Unbounded unused time'; end if;
  result := public.record_cpd_video_progress(learner,course,item,'jitter-v2',sid,25,'tick');
  if (result->>'accepted')::boolean or (result->>'watchedSeconds')::numeric > 1.1 then raise exception 'Large forward seek accepted'; end if;
  perform public.record_cpd_video_progress(learner,course,item,'jitter-v2',sid,1,'play');
  perform public.record_cpd_video_progress(learner,course,item,'jitter-v2',sid,1,'pause');
  update public.course_lesson_progress set last_event_at=clock_timestamp()-interval '12 seconds'
    where user_id=learner and course_id=course and lesson_id=item;
  result := public.record_cpd_video_progress(learner,course,item,'jitter-v2',sid,29.96,'pause');
  if (result->>'canComplete')::boolean or (result->>'watchedSeconds')::numeric > 1.1 then raise exception 'Paused time earned completion'; end if;
end;
$$;
