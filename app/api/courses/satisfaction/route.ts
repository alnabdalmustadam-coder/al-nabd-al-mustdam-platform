import { NextResponse } from 'next/server';
import { requireCourseLearner,LearningError } from '@/lib/learning/course-access';
import { getLearningContent } from '@/lib/learning/journey';
import { assertCpdLessonAccess,assertCpdQuizAccess } from '@/lib/learning/cpd';
import { resolveCourseQuiz } from '@/lib/quizzes/course-quiz';
import { ValidationError } from '@/lib/security/validation';

export const dynamic = 'force-dynamic';
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
async function context(request: Request, values: Record<string, unknown>) {
  const ctx = await requireCourseLearner(request, values.courseId);
  if ('rejected' in ctx) return { rejected: ctx.rejected! };
  const lessonId = typeof values.lessonId === 'string' ? values.lessonId : '';
  const kind = values.kind;
  const lesson = getLearningContent(ctx.course).find((item) => item.id === lessonId);
  if (!['lesson', 'quiz'].includes(String(kind))) throw new LearningError('المحتوى غير موجود', 404);
  const quiz = kind === 'quiz' ? resolveCourseQuiz(ctx.course, lessonId) : null;
  if (!lesson && !quiz) throw new LearningError('المحتوى غير موجود', 404);
  if (kind === 'quiz' && !quiz) throw new LearningError('لا يوجد اختبار لهذا الدرس', 404);
  if (ctx.course.professionalDevelopment) {
    if (quiz) await assertCpdQuizAccess(ctx.admin, ctx.course, ctx.auth.user.id, lessonId, quiz.key);
    else await assertCpdLessonAccess(ctx.admin, ctx.course, ctx.auth.user.id, lessonId);
  }
  return { ...ctx, kind: kind as 'lesson' | 'quiz', key: quiz ? quiz.key : lessonId, title: quiz ? quiz.quiz.title || 'اختبار الدرس' : lesson!.title };
}
type Context = Exclude<Awaited<ReturnType<typeof context>>, { rejected: NextResponse }>;
async function read(ctx: Context) {
  const query = () => ctx.admin.from('content_satisfaction').select('user_id', { count: 'exact' })
    .eq('course_id', ctx.course.id).eq('content_kind', ctx.kind).eq('content_key', ctx.key);
  const [own, total] = await Promise.all([
    query().eq('user_id', ctx.auth.user.id).maybeSingle(),
    ctx.admin.from('content_satisfaction').select('user_id', { head: true, count: 'exact' })
      .eq('course_id', ctx.course.id).eq('content_kind', ctx.kind).eq('content_key', ctx.key),
  ]);
  if (own.error || total.error) throw own.error || total.error;
  return { success: true, liked: Boolean(own.data), count: total.count || 0 };
}
function failure(error: unknown) {
  if (error instanceof LearningError || error instanceof ValidationError) return reply({ success: false, message: error.message }, error instanceof LearningError ? error.status : 400);
  console.error('Satisfaction operation failed:', error);
  return reply({ success: false, message: 'تعذر حفظ أو تحميل الرضا. حاول مرة أخرى' }, 503);
}
export async function GET(request: Request) {
  try {
    const ctx = await context(request, Object.fromEntries(new URL(request.url).searchParams));
    if ('rejected' in ctx) return ctx.rejected;
    return reply(await read(ctx));
  } catch (error) { return failure(error); }
}
