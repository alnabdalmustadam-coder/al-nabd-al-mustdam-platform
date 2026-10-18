import { consumeRateLimit } from '@/lib/security/rate-limit';
import { NextResponse } from 'next/server';
import { requireCourseLearner, LearningError } from '@/lib/learning/course-access';
import { readCompletedJourneyScore } from '@/lib/learning/journey-completion';
import { readJsonObject, ValidationError } from '@/lib/security/validation';

export const dynamic = 'force-dynamic';
const reply = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { 'Cache-Control': 'private, no-store' } });
export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    const ctx = await requireCourseLearner(request, body.courseId);
    if ('rejected' in ctx) return ctx.rejected;
    if (!consumeRateLimit(`journey-complete:${ctx.auth.user.id}`, 10, 60_000).allowed) throw new LearningError('طلبات كثيرة؛ حاول بعد قليل', 429);
    const score = await readCompletedJourneyScore(ctx.admin, ctx.course, ctx.auth.user.id, ctx.email);
    if (score === null) throw new LearningError('أكمل جميع المحطات واجتز الاختبار البعدي قبل اعتماد الدورة', 409);
    const { error } = await ctx.admin.from('enrollments').update({ progress: 100, status: 'completed',
      completed_at: new Date().toISOString() }).in('id', ctx.enrollments.map((row) => row.id));
    if (error) throw error;
    return reply({ success: true, progress: 100, journeyComplete: true, score });
  } catch (error) {
    if (error instanceof LearningError || error instanceof ValidationError) return reply({ success: false, message: error.message }, error instanceof LearningError ? error.status : 400);
    console.error('Journey completion failed:', error);
    return reply({ success: false, message: 'تعذر اعتماد إكمال الدورة. حاول مرة أخرى.' }, 503);
  }
}
