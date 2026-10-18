import { NextResponse } from 'next/server';
import { requireCourseLearner, LearningError } from '@/lib/learning/course-access';
import { readOrdinaryCourseProgress, saveOrdinaryCourseProgress } from '@/lib/learning/ordinary-progress';
import { readJsonObject, ValidationError } from '@/lib/security/validation';
import { consumeRateLimit } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';
const reply = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } });

/** Reconcile earlier 99% enrollments without fabricating lesson or exam results. */
export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    const ctx = await requireCourseLearner(request, body.courseId);
    if ('rejected' in ctx) return ctx.rejected;
    if (ctx.course.professionalDevelopment) throw new LearningError('أكمل متطلبات مسار التطوير المهني من داخل الرحلة', 409);
    if (!consumeRateLimit(`ordinary-complete:${ctx.auth.user.id}`, 10, 60_000).allowed) throw new LearningError('طلبات كثيرة، حاول بعد قليل', 429);
    const progress = await readOrdinaryCourseProgress(ctx.admin, ctx.course, ctx.email);
    if (!progress.courseComplete) throw new LearningError(progress.completionPendingAssessment
      ? 'اجتز الاختبار النهائي لإكمال الدورة' : 'أكمل جميع دروس الدورة أولاً', 409);
    await saveOrdinaryCourseProgress(ctx.admin, progress, ctx.enrollments.map((row) => row.id));
    return reply({ success: true, ...progress });
  } catch (error) {
    if (error instanceof LearningError || error instanceof ValidationError) return reply({ success: false, message: error.message }, error instanceof LearningError ? error.status : 400);
    console.error('Ordinary course completion failed:', error);
    return reply({ success: false, message: 'تعذر حفظ إكمال الدورة. حاول مرة أخرى.' }, 503);
  }
}
