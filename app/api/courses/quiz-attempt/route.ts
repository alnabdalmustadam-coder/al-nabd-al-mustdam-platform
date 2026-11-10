import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/security/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCourseBySlugAsync } from '@/lib/courses-store';
import { getCourseEnrollmentIdentifiers,parseCourseIdentifier } from '@/lib/public-courses';
import { isEnrollmentActive } from '@/lib/security/student-access';
import { ValidationError } from '@/lib/security/validation';
import { resolveCourseQuiz } from '@/lib/quizzes/course-quiz';
import { getQuizActivity } from '@/lib/quizzes/activity';
import { assertCpdQuizAccess } from '@/lib/learning/cpd';
import { LearningError } from '@/lib/learning/course-access';
import {
gradeQuizAnswers,sanitizeQuizAnswers,toStudentQuizQuestions,
type QuizQuestionDefinition,type StudentQuizAnswer
} from '@/lib/quizzes/model';

export const dynamic = 'force-dynamic';
const STATE_ID = 'internal-quiz-attempt-v1';
const RESULT_KEY = 'https://learning.madar.example/extensions/internal-quiz-result';
const HEADERS = { 'Cache-Control': 'private, no-store' };
type Result = ReturnType<typeof gradeQuizAnswers> & { attemptId: string; title: string; passPercentage: number; passed: boolean; completedAt: string };
type Attempt = { id: string; userId: string; title: string; passPercentage: number; startedAt: string; expiresAt: string | null;
  questions: QuizQuestionDefinition[]; answers: StudentQuizAnswer[] };
class QuizError extends Error { constructor(message: string, public status: number) { super(message); } }
const response = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: HEADERS });

async function context(request: Request, courseValue: unknown, lessonValue: unknown) {
  const auth = await requireUser(request);
  if (!auth.ok) return { rejected: auth.response };
  const courseId = parseCourseIdentifier(courseValue);
  const lessonId = typeof lessonValue === 'string' ? lessonValue.trim() : '';
  const email = auth.user.email?.trim().toLowerCase();
  if (!courseId || !email || !lessonId || lessonId.length > 160) throw new QuizError('بيانات الاختبار غير صالحة', 400);
  const course = await getCourseBySlugAsync(courseId);
  if (!course) throw new QuizError('الدورة غير موجودة', 404);
  const admin = getSupabaseAdmin();
  const identifiers = getCourseEnrollmentIdentifiers(course, courseId);
  const [byUser, byEmail] = await Promise.all([
    admin.from('enrollments').select('id, user_id, email, status').eq('user_id', auth.user.id).in('course_id', identifiers),
    admin.from('enrollments').select('id, user_id, email, status').eq('email', email).in('course_id', identifiers),
  ]);
  if (byUser.error || byEmail.error) throw byUser.error || byEmail.error;
  const rows = [...(byUser.data || []), ...(byEmail.data || [])];
  if (!rows.some((row) => (row.user_id === auth.user.id || (!row.user_id && row.email === email))
    && isEnrollmentActive(row.status) && !['suspended', 'expired'].includes(String(row.status).toLowerCase()))) {
    throw new QuizError('غير مسجل في هذه الدورة', 403);
  }
  const resolved = resolveCourseQuiz(course, lessonId);
  if (!resolved) throw new QuizError('لم تتم إضافة اختبار لهذا الدرس بعد', 404);
  if (course.professionalDevelopment) await assertCpdQuizAccess(admin, course, auth.user.id, lessonId, resolved.key);
  const { questions, passPercentage, duration, activityId } = getQuizActivity(course.slug, resolved.key, resolved.quiz);
  if (!questions.length || questions.length !== resolved.quiz.questions.length) throw new QuizError('أسئلة الاختبار غير مكتملة. يرجى التواصل مع الإدارة', 409);
  if (!Number.isFinite(passPercentage) || !Number.isFinite(duration)) throw new QuizError('إعدادات الاختبار غير صالحة', 409);
  return { auth, admin, email, activityId, questions, passPercentage, duration, title: resolved.quiz.title || 'اختبار الدرس' };
}

type Context = Exclude<Awaited<ReturnType<typeof context>>, { rejected: NextResponse }>;
async function readAttempt(ctx: Context): Promise<Attempt | null> {
  const { data, error } = await ctx.admin.from('xapi_state').select('state_data')
    .eq('activity_id', ctx.activityId).eq('agent_email', ctx.email).eq('state_id', STATE_ID).maybeSingle();
  if (error) throw error;
  const attempt = data?.state_data as Attempt | undefined;
  return attempt?.userId === ctx.auth.user.id ? attempt : null;
}
async function readResult(ctx: Context, id: string): Promise<Result | null> {
  const { data, error } = await ctx.admin.from('xapi_statements').select('raw_statement')
    .eq('statement_id', id).eq('actor_email', ctx.email).eq('object_id', ctx.activityId).maybeSingle();
  if (error) throw error;
  return data?.raw_statement?.result?.extensions?.[RESULT_KEY] as Result || null;
}
async function rankedResult(ctx: Context, result: Result | null) {
  if (!result) return null;
  // Ranking is recomputed after each saved attempt, without exposing anyone's identity.
  try {
    const { data, error } = await ctx.admin.rpc('internal_quiz_rank', { p_activity_id: ctx.activityId, p_email: ctx.email });
    if (error) throw error;
    return { ...result, ranking: data };
  } catch (error) {
    console.error('Quiz rank unavailable:', error);
    return { ...result, ranking: null };
  }
}
function session(attempt: Attempt) {
  return { id: attempt.id, title: attempt.title, passPercentage: attempt.passPercentage, startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt, questions: toStudentQuizQuestions(attempt.questions),
    savedAnswers: sanitizeQuizAnswers(attempt.answers, toStudentQuizQuestions(attempt.questions)) };
}
function expired(attempt: Attempt) { return attempt.expiresAt !== null && Date.parse(attempt.expiresAt) + 90_000 < Date.now(); }
function failure(error: unknown) {
  if (error instanceof ValidationError) return response({ success: false, message: error.message }, 400);
  if (error instanceof QuizError) return response({ success: false, message: error.message }, error.status);
  if (error instanceof LearningError) return response({ success: false, message: error.message }, error.status);
  console.error('Internal quiz operation failed:', error);
  return response({ success: false, message: 'تعذر حفظ أو تحميل الاختبار. حاول مرة أخرى' }, 503);
}

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const ctx = await context(request, params.get('courseId'), params.get('lessonId'));
    if ('rejected' in ctx) return ctx.rejected;
    const attempt = await readAttempt(ctx);
    const result = attempt ? await readResult(ctx, attempt.id) : null;
    return response({ success: true, quiz: { title: ctx.title, passPercentage: ctx.passPercentage,
      questionCount: ctx.questions.length, durationMinutes: ctx.duration }, previewQuestions: toStudentQuizQuestions(ctx.questions), result: await rankedResult(ctx, result),
      attempt: attempt && !result && !expired(attempt) ? session(attempt) : null });
  } catch (error) { return failure(error); }
}
