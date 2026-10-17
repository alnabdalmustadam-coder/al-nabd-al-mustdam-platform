-- Run inside BEGIN/ROLLBACK. No learner or course data is retained.
do $$
declare
  learner uuid; course bigint; session_a uuid := gen_random_uuid(); session_b uuid := gen_random_uuid();
  activity text := 'https://nabdtraining.com/learning-qa/' || gen_random_uuid(); result jsonb; summary jsonb; i integer;
begin
  select id into learner from auth.users order by created_at limit 1;
  if learner is null then raise exception 'QA requires one existing account for FK checks'; end if;
  insert into public.course_catalog(slug,title,status,price,payload)
    values ('learning-qa-' || gen_random_uuid(), 'Learning QA (rolled back)', 'draft', 0, '{}') returning id into course;

  if has_table_privilege('anon','public.course_lesson_progress','select')
    or has_table_privilege('authenticated','public.course_lesson_progress','update')
    or has_table_privilege('anon','public.content_satisfaction','select')
    or has_table_privilege('authenticated','public.content_satisfaction','insert')
    or has_function_privilege('anon','public.internal_quiz_rank(text,text)','execute')
    or has_function_privilege('authenticated','public.record_cpd_video_progress(uuid,bigint,text,text,uuid,double precision,text)','execute')
    then raise exception 'Unexpected direct client access'; end if;

  perform public.start_cpd_video_session(learner,course,'video','version-a',60,session_a);
  result := public.record_cpd_video_progress(learner,course,'video','version-a',session_a,60,'tick');
  if (result->>'accepted')::boolean or (result->>'canComplete')::boolean then raise exception 'Immediate end seek was accepted'; end if;
  perform public.record_cpd_video_progress(learner,course,'video','version-a',session_a,0,'play');
  update public.course_lesson_progress set last_event_at = clock_timestamp() - interval '5 seconds'
    where user_id=learner and course_id=course and lesson_id='video';
  result := public.record_cpd_video_progress(learner,course,'video','version-a',session_a,5,'tick');
  if not (result->>'accepted')::boolean or (result->>'watchedSeconds')::numeric < 4.9 then raise exception 'Normal playback not credited'; end if;

  update public.course_lesson_progress set last_position=0, last_event_at = clock_timestamp() - interval '5 seconds'
    where user_id=learner and course_id=course and lesson_id='video';
  result := public.record_cpd_video_progress(learner,course,'video','version-a',session_a,5,'tick');
  if (result->>'watchedSeconds')::numeric > 5.1 then raise exception 'Rewatch inflated watch progress'; end if;
  for i in 1..50 loop
    result := public.record_cpd_video_progress(learner,course,'video','version-a',session_a,5.7,'tick');
  end loop;
  if (result->>'watchedSeconds')::numeric > 5.2 then raise exception 'Request spam bypassed wall clock'; end if;
  result := public.start_cpd_video_session(learner,course,'video','version-a',60,session_b);
  if (result->>'watchedSeconds')::numeric < 4.9 then raise exception 'Resume lost watch history'; end if;
  result := public.record_cpd_video_progress(learner,course,'video','version-a',session_a,5,'tick');
  if not (result->>'stale')::boolean then raise exception 'Superseded tab retained write access'; end if;
  result := public.start_cpd_video_session(learner,course,'video','version-b',60,session_b);
  if (result->>'watchedSeconds')::numeric <> 0 then raise exception 'Changed video inherited progress'; end if;

  insert into public.xapi_statements(statement_id,actor_email,verb_id,verb_display,object_id,result_score,result_completion,timestamp,raw_statement)
  select gen_random_uuid()::text, x.email, 'http://adlnet.gov/expapi/verbs/answered', 'answered', activity, x.score, true, now(),
    '{"result":{"extensions":{"https://nabdtraining.com/extensions/internal-quiz-result":{}}}}'::jsonb
  from (values ('a@qa.invalid',0.7),('a@qa.invalid',0.9),('b@qa.invalid',0.9),('c@qa.invalid',0.5)) x(email,score);
  result := public.internal_quiz_rank(activity,'a@qa.invalid');
  if (result->>'rank')::integer <> 1 or (result->>'participants')::integer <> 3 or (result->>'bestScore')::numeric <> 90 then
    raise exception 'Best-attempt rank or unique learner denominator incorrect'; end if;
  if (public.internal_quiz_rank(activity,'b@qa.invalid')->>'rank')::integer <> 1 then raise exception 'Tie not respected'; end if;
  if (public.internal_quiz_rank(activity,'c@qa.invalid')->>'rank')::integer <> 3 then raise exception 'Competition rank incorrect'; end if;
  if public.internal_quiz_rank(activity || '/other','a@qa.invalid') is not null then raise exception 'Other quizzes mixed in rank'; end if;

  insert into public.content_satisfaction(user_id,course_id,content_kind,content_key,content_title)
    values (learner,course,'lesson','video','Video'),(learner,course,'quiz','quiz:one','Quiz');
  insert into public.content_satisfaction(user_id,course_id,content_kind,content_key,content_title)
    values (learner,course,'lesson','video','Video') on conflict do nothing;
  summary := public.course_satisfaction_summary();
  select c into result from jsonb_array_elements(summary->'courses') c where (c->>'course_id')::bigint=course;
  if (result->>'hearts')::integer <> 2 or (result->>'learners')::integer <> 1
    or (result->>'lesson_hearts')::integer <> 1 or (result->>'quiz_hearts')::integer <> 1 then raise exception 'Satisfaction counts incorrect'; end if;
  delete from public.content_satisfaction where user_id=learner and course_id=course and content_kind='lesson';
  select c into result from jsonb_array_elements(public.course_satisfaction_summary()->'courses') c where (c->>'course_id')::bigint=course;
  if (result->>'hearts')::integer <> 1 then raise exception 'Undo did not remove heart'; end if;
  delete from public.content_satisfaction where user_id=learner and course_id=course;
  if exists (select 1 from jsonb_array_elements(public.course_satisfaction_summary()->'courses') c where (c->>'course_id')::bigint=course) then
    raise exception 'Nonvoter retained in satisfaction counts'; end if;
end;
$$;
