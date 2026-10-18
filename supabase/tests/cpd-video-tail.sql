-- Run inside BEGIN/ROLLBACK after cpd_video_tail_accounting. Every QA row is
-- temporary; do not reset or complete an existing learner's lesson.
do $$
declare
  learner uuid; course bigint; item text := '__qa_tail_' || gen_random_uuid();
  sid uuid := gen_random_uuid(); result jsonb; i integer; credit double precision;
begin
  select id into learner from auth.users order by created_at limit 1;
  select id into course from public.course_catalog order by id limit 1;
  if learner is null or course is null then raise exception 'QA needs one account/course for foreign keys'; end if;

  perform public.start_cpd_video_session(learner,course,item,'tail-v1',30,sid);
  result := public.record_cpd_video_progress(learner,course,item,'tail-v1',sid,29.96,'pause');
  if (result->>'canComplete')::boolean or (result->>'accepted')::boolean then raise exception 'Immediate ending bypassed watch time'; end if;
  perform public.record_cpd_video_progress(learner,course,item,'tail-v1',sid,0,'play');
  -- A coarse timeupdate trails actual playback by one second at every tick.
  for i in 1..5 loop
    update public.course_lesson_progress set last_event_at=clock_timestamp()-interval '5 seconds'
      where user_id=learner and course_id=course and lesson_id=item;
    result := public.record_cpd_video_progress(learner,course,item,'tail-v1',sid,i*5-1,'tick');
    if not (result->>'accepted')::boolean then raise exception 'Valid delayed playback rejected'; end if;
  end loop;
  update public.course_lesson_progress set last_event_at=clock_timestamp()-interval '4.96 seconds'
    where user_id=learner and course_id=course and lesson_id=item;
  result := public.record_cpd_video_progress(learner,course,item,'tail-v1',sid,29.96,'pause');
  if not (result->>'canComplete')::boolean or (result->>'watchedSeconds')::numeric < 29.95 then
    raise exception 'Final frame still lost after normal playback: %', result;
  end if;
  result := public.record_cpd_video_progress(learner,course,item,'tail-v1',sid,29.96,'pause');
  if not (result->>'canComplete')::boolean then raise exception 'Duplicate pause/ended lost completion'; end if;

  -- Resume the observed 27.25/30 state, then watch the remaining real seconds.
  perform public.start_cpd_video_session(learner,course,item,'tail-resume',30,sid);
  update public.course_lesson_progress set watched_seconds=27.254122, last_position=27.254122
    where user_id=learner and course_id=course and lesson_id=item;
  perform public.record_cpd_video_progress(learner,course,item,'tail-resume',sid,27.254122,'play');
  update public.course_lesson_progress set last_event_at=clock_timestamp()-interval '2.706 seconds'
    where user_id=learner and course_id=course and lesson_id=item;
  result := public.record_cpd_video_progress(learner,course,item,'tail-resume',sid,29.96,'pause');
  if not (result->>'canComplete')::boolean then raise exception 'Saved learner could not finish the remaining tail'; end if;

  perform public.start_cpd_video_session(learner,course,item,'tail-v2',30,sid);
  perform public.record_cpd_video_progress(learner,course,item,'tail-v2',sid,0,'play');
  update public.course_lesson_progress set last_event_at=clock_timestamp()-interval '5 seconds'
    where user_id=learner and course_id=course and lesson_id=item;
  perform public.record_cpd_video_progress(learner,course,item,'tail-v2',sid,4,'tick');
  select uncredited_seconds into credit from public.course_lesson_progress where user_id=learner and course_id=course and lesson_id=item;
  if credit < 0.99 or credit > 1 then raise exception 'Missing or unbounded carry'; end if;
  -- Rewinding must discard carry; waiting/replaying cannot bank future seconds.
  perform public.record_cpd_video_progress(learner,course,item,'tail-v2',sid,0,'tick');
  select uncredited_seconds into credit from public.course_lesson_progress where user_id=learner and course_id=course and lesson_id=item;
  if credit <> 0 then raise exception 'Rewind retained carry'; end if;
  update public.course_lesson_progress set last_position=4, last_event_at=clock_timestamp()-interval '5 seconds'
    where user_id=learner and course_id=course and lesson_id=item;
  perform public.record_cpd_video_progress(learner,course,item,'tail-v2',sid,4,'tick');
  for i in 1..50 loop
    result := public.record_cpd_video_progress(learner,course,item,'tail-v2',sid,4.7,'tick');
  end loop;
  if (result->>'watchedSeconds')::numeric > 4.2 then raise exception 'Request spam manufactured credit'; end if;
  perform public.start_cpd_video_session(learner,course,item,'tail-v2',30,gen_random_uuid());
  result := public.record_cpd_video_progress(learner,course,item,'tail-v2',sid,30,'pause');
  if not (result->>'stale')::boolean then raise exception 'Old session retained access'; end if;
end;
$$;
