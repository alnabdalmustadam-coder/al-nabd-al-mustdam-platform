import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Course } from '@/types';
import { getCourseAllLessons } from '@/lib/course-lessons';
import { getQuizActivity } from '@/lib/quizzes/activity';

/** Ordinary courses allow manual lesson acknowledgement. Completion still
 * comes from saved, current-course lessons and a configured final's real grade. */
export async function readOrdinaryCourseProgress(admin: SupabaseClient, course: Course, email: string) {
  const lessons = getCourseAllLessons(course);
  const prefix = `https://nabdtraining.com/courses/${course.slug}/lessons/`;
  const idsByIri = new Map(lessons.map((lesson) => [`${prefix}${encodeURIComponent(lesson.id)}`, lesson.id]));
  const { data, error } = await admin.from('xapi_statements').select('object_id')
    .eq('actor_email', email).eq('verb_display', 'completed').ilike('object_id', `${prefix}%`);
  if (error) throw error;
  const completedLessonIds = [...new Set((data || []).map((row) => idsByIri.get(row.object_id))
    .filter((id): id is string => Boolean(id)))];
  const allLessonsComplete = lessons.length > 0 && completedLessonIds.length === lessons.length;
  const finalAssessmentAvailable = Boolean(course.finalExam?.questions?.length);
  let finalPassed = !finalAssessmentAvailable;
  if (allLessonsComplete && course.finalExam?.questions?.length) {
    const { activityId, questions, passPercentage } = getQuizActivity(course.slug, 'final', course.finalExam);
    if (questions.length === course.finalExam.questions.length && Number.isFinite(passPercentage)) {
      const results = await admin.from('xapi_statements').select('result_score')
        .eq('actor_email', email).eq('object_id', activityId).eq('verb_display', 'answered')
        .eq('result_completion', true).eq('result_success', true);
      if (results.error) throw results.error;
      finalPassed = (results.data || []).some((row) => typeof row.result_score === 'number'
        && Number.isFinite(row.result_score) && row.result_score >= 0 && row.result_score <= 1
        && row.result_score * 100 >= passPercentage);
    }
  }
  const courseComplete = allLessonsComplete && finalPassed;
  const calculated = Math.round(completedLessonIds.length / Math.max(lessons.length, 1) * 100);
  return { completedLessonIds, completedCount: completedLessonIds.length, totalLessons: lessons.length,
    progress: courseComplete ? 100 : Math.min(99, calculated), courseComplete, finalAssessmentAvailable,
    completionPendingAssessment: allLessonsComplete && !finalPassed };
}

export async function saveOrdinaryCourseProgress(admin: SupabaseClient,
  progress: Awaited<ReturnType<typeof readOrdinaryCourseProgress>>, enrollmentIds: string[]) {
  const values = progress.courseComplete
    ? { progress: 100, status: 'completed', completed_at: new Date().toISOString() }
    : { progress: progress.progress, status: 'active', completed_at: null };
  const { error } = await admin.from('enrollments').update(values).in('id', enrollmentIds);
  if (error) throw error;
}
