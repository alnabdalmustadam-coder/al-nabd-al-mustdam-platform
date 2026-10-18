import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Course } from '@/types';
import { readCpdProgress } from '@/lib/learning/cpd';
import { isLearningJourney } from '@/lib/learning/journey';
import { getQuizActivity } from '@/lib/quizzes/activity';

/** A completed current-version journey and its server-graded post-assessment. */
export async function readCompletedJourneyScore(admin: SupabaseClient, course: Course, userId: string, email: string): Promise<number | null> {
  if (!isLearningJourney(course) || !course.learningJourney?.preAssessment?.questions?.length || !course.finalExam?.questions?.length) return null;
  const progress = await readCpdProgress(admin, course, userId);
  if (!progress.lessons.length || progress.completed.size !== progress.lessons.length) return null;
  const { activityId } = getQuizActivity(course.slug, 'final', course.finalExam);
  const { data, error } = await admin.from('xapi_statements').select('result_score')
    .eq('actor_email', email).eq('object_id', activityId).eq('verb_display', 'answered').eq('result_completion', true).eq('result_success', true);
  if (error) throw error;
  const scores = (data || []).map((row) => row.result_score).filter((score): score is number => typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 1);
  return scores.length ? Math.round(Math.max(...scores) * 100) : null;
}
