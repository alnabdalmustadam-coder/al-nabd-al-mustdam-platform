import { getLearningContent, isLearningJourney } from '@/lib/learning/journey';
import 'server-only';
import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Course } from '@/types';
import { isLessonUnlocked, type LessonContent } from '@/lib/learning/course-content';
import { LearningError } from '@/lib/learning/course-access';
import { getQuizActivity } from '@/lib/quizzes/activity';

export type CpdProgress = { lesson_id: string; content_key: string; duration_seconds: number; watched_seconds: number;
  session_id: string | null; completed_at: string | null };
export function lessonContentKey(lesson: LessonContent): string {
  return createHash('sha256').update(JSON.stringify({ type: lesson.type, video: lesson.videoUrl,
    file: lesson.fileUrl, quiz: lesson.requiredQuiz, description: lesson.description, blocks: lesson.contentBlocks, diagnostic: lesson.diagnostic })).digest('hex');
}
export async function readCpdProgress(admin: SupabaseClient, course: Course, userId: string) {
  const lessons = getLearningContent(course);
  const { data, error } = await admin.from('course_lesson_progress').select('lesson_id, content_key, duration_seconds, watched_seconds, session_id, completed_at')
    .eq('course_id', course.id).eq('user_id', userId);
  if (error) throw error;
  const rows = (data || []) as CpdProgress[];
  const valid = new Map(lessons.flatMap((lesson) => {
    const row = rows.find((item) => item.lesson_id === lesson.id && item.content_key === lessonContentKey(lesson));
    return row ? [[lesson.id, row] as const] : [];
  }));
  return { lessons, rows: valid, completed: new Set([...valid].filter(([, row]) => row.completed_at).map(([id]) => id)) };
}
export async function assertCpdLessonAccess(admin: SupabaseClient, course: Course, userId: string, lessonId: string) {
  const progress = await readCpdProgress(admin, course, userId);
  if (!isLessonUnlocked(progress.lessons.map((item) => item.id), progress.completed, lessonId)) {
    throw new LearningError('أكمل الدروس السابقة بالترتيب لفتح هذا الدرس', 403);
  }
  return progress;
}
export function videoWatched(row?: CpdProgress): boolean {
  return Boolean(row && row.duration_seconds > 0 && row.watched_seconds >= row.duration_seconds - Math.min(1, row.duration_seconds * 0.01));
}
export async function assertCpdQuizAccess(admin: SupabaseClient, course: Course, userId: string, lessonId: string, key: string) {
  const progress = await assertCpdLessonAccess(admin, course, userId, lessonId);
  if (key === 'final' && !isLearningJourney(course)) {
    if (progress.completed.size !== progress.lessons.length) throw new LearningError('أكمل جميع دروس الدورة قبل الاختبار النهائي', 403);
    return;
  }
  const lesson = progress.lessons.find((item) => item.id === lessonId)!;
  if (lesson.quizKey !== key) throw new LearningError('اختبار الوحدة متاح بعد إكمال دروسها والوصول إلى آخر درس', 403);
  if (lesson.type === 'video' && !videoWatched(progress.rows.get(lessonId))) throw new LearningError('شاهد فيديو الدرس كاملاً قبل فتح الاختبار', 403);
}
export async function verifyCpdCompletion(admin: SupabaseClient, course: Course, userId: string, email: string, lessonId: string) {
  const progress = await assertCpdLessonAccess(admin, course, userId, lessonId);
  const lesson = progress.lessons.find((item) => item.id === lessonId)!;
  if (lesson.type === 'video' && !videoWatched(progress.rows.get(lessonId))) throw new LearningError('يجب مشاهدة الفيديو كاملاً قبل إكمال الدرس');
  if (lesson.type === 'quiz' && !lesson.requiredQuiz) throw new LearningError('لم تتم إضافة أسئلة لهذا الاختبار بعد');
  if (lesson.requiredQuiz && lesson.quizKey) {
    const { activityId } = getQuizActivity(course.slug, lesson.quizKey, lesson.requiredQuiz);
    let query = admin.from('xapi_statements').select('id', { head: true, count: 'exact' })
      .eq('actor_email', email).eq('object_id', activityId).eq('verb_display', 'answered').eq('result_completion', true);
    if (!lesson.diagnostic) query = query.eq('result_success', true);
    const { count, error } = await query;
    if (error) throw error;
    if (!count) throw new LearningError(lesson.diagnostic ? 'سلّم إجابات الاختبار القبلي أولاً' : 'اجتز اختبار الدرس أولاً لإكماله');
  }
  const values = { user_id: userId, course_id: course.id, lesson_id: lessonId,
    content_key: lessonContentKey(lesson), completed_at: new Date().toISOString() };
  // Update existing video telemetry without replacing its verified watch history.
  const query = progress.rows.has(lessonId)
    ? admin.from('course_lesson_progress').update({ completed_at: values.completed_at }).eq('user_id', userId).eq('course_id', course.id)
      .eq('lesson_id', lessonId).eq('content_key', values.content_key)
    : admin.from('course_lesson_progress').upsert(values, { onConflict: 'user_id,course_id,lesson_id' });
  const { error } = await query;
  if (error) throw error;
}
