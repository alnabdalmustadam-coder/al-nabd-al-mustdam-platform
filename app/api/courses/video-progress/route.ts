import { NextResponse } from 'next/server';
import { requireCourseLearner, LearningError } from '@/lib/learning/course-access';
import { assertCpdLessonAccess, lessonContentKey } from '@/lib/learning/cpd';
import { readJsonObject, ValidationError } from '@/lib/security/validation';
import { consumeRateLimit } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    const ctx = await requireCourseLearner(request, body.courseId);
    if ('rejected' in ctx) return ctx.rejected;
    if (!consumeRateLimit(`cpd-video:${ctx.auth.user.id}`, 90, 60_000).allowed) throw new LearningError('طلبات كثيرة، حاول بعد قليل', 429);
    const lessonId = typeof body.lessonId === 'string' ? body.lessonId.trim() : '';
    if (!ctx.course.professionalDevelopment || !lessonId || lessonId.length > 160
      || typeof body.seconds !== 'number' || !Number.isFinite(body.seconds) || body.seconds < 0 || body.seconds > 86400
      || !['play', 'pause', 'tick'].includes(String(body.event))
      || typeof body.sessionId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.sessionId)) throw new LearningError('بيانات المشاهدة غير صالحة', 400);
    const progress = await assertCpdLessonAccess(ctx.admin, ctx.course, ctx.auth.user.id, lessonId);
    const lesson = progress.lessons.find((item) => item.id === lessonId)!;
    if (lesson.type !== 'video') throw new LearningError('الدرس ليس فيديو', 400);
    const { data, error } = await ctx.admin.rpc('record_cpd_video_progress', {
      p_user_id: ctx.auth.user.id, p_course_id: ctx.course.id, p_lesson_id: lessonId,
      p_content_key: lessonContentKey(lesson), p_session_id: body.sessionId, p_seconds: body.seconds, p_event: body.event,
    });
    if (error) throw error;
    if (!data || data.stale) throw new LearningError('تم فتح الفيديو في جلسة أخرى أو تغير محتواه. أعد تحميل الدرس', 409);
    return reply({ success: true, ...data });
  } catch (error) {
    if (error instanceof LearningError || error instanceof ValidationError) return reply({ success: false, message: error.message }, error instanceof LearningError ? error.status : 400);
    console.error('Video progress failed:', error);
    return reply({ success: false, message: 'تعذر حفظ المشاهدة. أعد تحميل الدرس لاستكمالها' }, 503);
  }
}
