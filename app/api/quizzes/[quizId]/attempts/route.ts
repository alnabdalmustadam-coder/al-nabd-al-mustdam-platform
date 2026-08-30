import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireUser } from '@/lib/security/auth';
import { isStudentEnrolled } from '@/lib/security/student-access';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  gradeQuizAnswers,
  parseQuizQuestions,
  sanitizeQuizAnswers,
  toStudentQuizQuestions,
  type GradedQuizQuestion,
} from '@/lib/quizzes/model';

export const dynamic = 'force-dynamic';

const SUBMISSION_GRACE_MS = 90 * 1000;

type QuizRow = {
  id: string;
  title: string;
  course_id: string;
  questions_json: unknown;
  duration_minutes: number | null;
  pass_percentage: number | null;
  max_attempts: number | null;
  is_active: boolean | null;
};

type AttemptRow = {
  id: string;
  quiz_id: string;
  user_id: string | null;
  email: string | null;
  score: number | string | null;
  total_questions: number | null;
  correct_answers: number | null;
  answers_json: unknown;
  status: string;
  started_at: string;
  completed_at: string | null;
};

function uniqueById<T extends { id: string }>(rows: T[]): T[] {
  return [...new Map(rows.map((row) => [row.id, row])).values()];
}

function durationMinutes(quiz: QuizRow): number {
  return Math.min(240, Math.max(1, Number(quiz.duration_minutes || 30)));
}

function maxAttempts(quiz: QuizRow): number {
  return Math.min(20, Math.max(1, Number(quiz.max_attempts || 3)));
}

function attemptExpiry(quiz: QuizRow, attempt: AttemptRow): number {
  return Date.parse(attempt.started_at) + durationMinutes(quiz) * 60 * 1000;
}

function attemptBelongsToUser(attempt: AttemptRow, userId: string, email: string): boolean {
  return attempt.user_id === userId
    || (!attempt.user_id && attempt.email?.trim().toLowerCase() === email);
}

async function getQuiz(admin: SupabaseClient, quizId: string): Promise<QuizRow | null> {
  const { data, error } = await admin
    .from('quizzes')
    .select('id, title, course_id, questions_json, duration_minutes, pass_percentage, max_attempts, is_active')
    .eq('id', quizId)
    .maybeSingle();

  if (error) throw error;
  return data as QuizRow | null;
}

async function getUserAttempts(
  admin: SupabaseClient,
  quizId: string,
  userId: string,
  email: string,
): Promise<AttemptRow[]> {
  const [byUser, byEmail] = await Promise.all([
    admin.from('quiz_attempts').select('*').eq('quiz_id', quizId).eq('user_id', userId),
    admin.from('quiz_attempts').select('*').eq('quiz_id', quizId).eq('email', email),
  ]);

  if (byUser.error || byEmail.error) throw byUser.error || byEmail.error;
  return uniqueById([
    ...((byUser.data || []) as AttemptRow[]),
    ...((byEmail.data || []) as AttemptRow[]),
  ]);
}

function safeStoredResults(value: unknown): GradedQuizQuestion[] {
  if (!Array.isArray(value)) return [];

  return value.slice(0, 200).flatMap((raw): GradedQuizQuestion[] => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
    const result = raw as Record<string, unknown>;
    const id = typeof result.id === 'string' ? result.id.slice(0, 120) : '';
    const text = typeof result.text === 'string' ? result.text.slice(0, 2000) : '';
    const options = Array.isArray(result.options)
      ? result.options
          .slice(0, 10)
          .filter((option): option is string => typeof option === 'string')
          .map((option) => option.slice(0, 500))
      : [];
    const selectedIndex = result.selectedIndex === null ? null : Number(result.selectedIndex);
    const correctIndex = Number(result.correctIndex);

    if (
      !id
      || !text
      || options.length < 2
      || (selectedIndex !== null && !Number.isInteger(selectedIndex))
      || !Number.isInteger(correctIndex)
    ) {
      return [];
    }

    const explanation = typeof result.explanation === 'string'
      ? result.explanation.slice(0, 3000)
      : undefined;

    return [{
      id,
      text,
      options,
      selectedIndex,
      correctIndex,
      isCorrect: selectedIndex === correctIndex,
      ...(explanation ? { explanation } : {}),
    }];
  });
}

async function respondWithReview(
  attempts: AttemptRow[],
  quiz: QuizRow,
): Promise<NextResponse> {
  const completed = attempts
    .filter((attempt) => attempt.status === 'completed')
    .sort((a, b) => Date.parse(b.completed_at || b.started_at) - Date.parse(a.completed_at || a.started_at));
  const passPercentage = Number(quiz.pass_percentage || 60);
  const latest = completed.find((attempt) => Number(attempt.score || 0) >= passPercentage)
    || completed[0];

  if (!latest) {
    return NextResponse.json(
      { success: false, message: 'لا توجد محاولة مكتملة لعرضها' },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    mode: 'review',
    result: {
      attemptId: latest.id,
      quizId: quiz.id,
      title: quiz.title,
      score: Number(latest.score || 0),
      passPercentage,
      passed: Number(latest.score || 0) >= passPercentage,
      totalQuestions: Number(latest.total_questions || 0),
      correctAnswers: Number(latest.correct_answers || 0),
      completedAt: latest.completed_at,
      results: safeStoredResults(latest.answers_json),
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> },
) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const email = auth.user.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ success: false, message: 'الحساب لا يحتوي على بريد إلكتروني' }, { status: 400 });
  }

  try {
    const { quizId: rawQuizId } = await params;
    const quizId = rawQuizId.trim();
    const admin = getSupabaseAdmin();
    const quiz = await getQuiz(admin, quizId);

    if (!quiz) {
      return NextResponse.json({ success: false, message: 'الاختبار غير موجود' }, { status: 404 });
    }
    if (!(await isStudentEnrolled(admin, auth.user.id, email, quiz.course_id))) {
      return NextResponse.json({ success: false, message: 'الاختبار لا يتبع دورة مسجلة لديك' }, { status: 403 });
    }

    const attempts = await getUserAttempts(admin, quiz.id, auth.user.id, email);
    if (new URL(request.url).searchParams.get('review') === 'latest') {
      return respondWithReview(attempts, quiz);
    }
    if (!quiz.is_active) {
      return NextResponse.json({ success: false, message: 'الاختبار غير متاح حاليًا' }, { status: 409 });
    }

    const questions = parseQuizQuestions(quiz.questions_json);
    if (questions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'لم يتم تجهيز أسئلة صالحة لهذا الاختبار بعد' },
        { status: 422 },
      );
    }

    const now = Date.now();
    const inProgress = attempts
      .filter((attempt) => attempt.status === 'in_progress')
      .sort((a, b) => Date.parse(b.started_at) - Date.parse(a.started_at))[0];

    if (inProgress && attemptExpiry(quiz, inProgress) + SUBMISSION_GRACE_MS > now) {
      const expiresAt = attemptExpiry(quiz, inProgress);
      return NextResponse.json({
        success: true,
        attempt: {
          id: inProgress.id,
          quizId: quiz.id,
          title: quiz.title,
          startedAt: inProgress.started_at,
          expiresAt: new Date(expiresAt).toISOString(),
          remainingSeconds: Math.max(0, Math.ceil((expiresAt - now) / 1000)),
          passPercentage: Number(quiz.pass_percentage || 60),
          questions: toStudentQuizQuestions(questions),
          savedAnswers: sanitizeQuizAnswers(inProgress.answers_json, toStudentQuizQuestions(questions)),
        },
      });
    }

    if (inProgress) {
      await admin
        .from('quiz_attempts')
        .update({ status: 'expired', completed_at: new Date().toISOString() })
        .eq('id', inProgress.id)
        .eq('status', 'in_progress');
    }

    const completedAttempts = attempts.filter((attempt) => attempt.status === 'completed');
    const passPercentage = Number(quiz.pass_percentage || 60);
    if (completedAttempts.some((attempt) => Number(attempt.score || 0) >= passPercentage)) {
      return NextResponse.json(
        { success: false, message: 'تم اجتياز هذا الاختبار بالفعل ويمكنك مراجعة الإجابات' },
        { status: 409 },
      );
    }
    if (completedAttempts.length >= maxAttempts(quiz)) {
      return NextResponse.json(
        { success: false, message: 'تم استنفاد عدد المحاولات المتاحة' },
        { status: 409 },
      );
    }

    const startedAt = new Date();
    const { data: createdAttempt, error: createError } = await admin
      .from('quiz_attempts')
      .insert({
        quiz_id: quiz.id,
        user_id: auth.user.id,
        email,
        score: 0,
        total_questions: questions.length,
        correct_answers: 0,
        answers_json: [],
        status: 'in_progress',
        started_at: startedAt.toISOString(),
      })
      .select('id, started_at')
      .single();

    if (createError?.code === '23505') {
      const concurrentAttempts = await getUserAttempts(admin, quiz.id, auth.user.id, email);
      const concurrentAttempt = concurrentAttempts
        .filter((attempt) => attempt.status === 'in_progress')
        .sort((a, b) => Date.parse(b.started_at) - Date.parse(a.started_at))[0];
      if (concurrentAttempt) {
        const concurrentExpiry = attemptExpiry(quiz, concurrentAttempt);
        return NextResponse.json({
          success: true,
          attempt: {
            id: concurrentAttempt.id,
            quizId: quiz.id,
            title: quiz.title,
            startedAt: concurrentAttempt.started_at,
            expiresAt: new Date(concurrentExpiry).toISOString(),
            remainingSeconds: Math.max(0, Math.ceil((concurrentExpiry - Date.now()) / 1000)),
            passPercentage,
            questions: toStudentQuizQuestions(questions),
            savedAnswers: sanitizeQuizAnswers(
              concurrentAttempt.answers_json,
              toStudentQuizQuestions(questions),
            ),
          },
        });
      }
    }
    if (createError || !createdAttempt) throw createError || new Error('Attempt was not created');
    const expiresAt = startedAt.getTime() + durationMinutes(quiz) * 60 * 1000;

    return NextResponse.json({
      success: true,
      attempt: {
        id: createdAttempt.id,
        quizId: quiz.id,
        title: quiz.title,
        startedAt: createdAttempt.started_at,
        expiresAt: new Date(expiresAt).toISOString(),
        remainingSeconds: durationMinutes(quiz) * 60,
        passPercentage,
        questions: toStudentQuizQuestions(questions),
        savedAnswers: [],
      },
    });
  } catch (error) {
    console.error('Quiz attempt start error:', error);
    return NextResponse.json(
      { success: false, message: 'تعذر بدء الاختبار حاليًا' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> },
) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const email = auth.user.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ success: false, message: 'الحساب لا يحتوي على بريد إلكتروني' }, { status: 400 });
  }

  try {
    const { quizId: rawQuizId } = await params;
    const quizId = rawQuizId.trim();
    const body = await request.json();
    const attemptId = typeof body.attemptId === 'string' ? body.attemptId.trim() : '';
    if (!attemptId || !Array.isArray(body.answers)) {
      return NextResponse.json({ success: false, message: 'بيانات المسودة غير مكتملة' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const [quiz, attemptResult] = await Promise.all([
      getQuiz(admin, quizId),
      admin.from('quiz_attempts').select('*').eq('id', attemptId).eq('quiz_id', quizId).maybeSingle(),
    ]);

    if (attemptResult.error) throw attemptResult.error;
    const attempt = attemptResult.data as AttemptRow | null;
    if (!quiz || !attempt) {
      return NextResponse.json({ success: false, message: 'المحاولة أو الاختبار غير موجود' }, { status: 404 });
    }
    if (!attemptBelongsToUser(attempt, auth.user.id, email)) {
      return NextResponse.json({ success: false, message: 'لا تملك هذه المحاولة' }, { status: 403 });
    }
    if (attempt.status !== 'in_progress') {
      return NextResponse.json({ success: false, message: 'لا يمكن تعديل محاولة منتهية' }, { status: 409 });
    }
    if (!(await isStudentEnrolled(admin, auth.user.id, email, quiz.course_id))) {
      return NextResponse.json({ success: false, message: 'لم يعد لديك اشتراك صالح لهذه الدورة' }, { status: 403 });
    }
    if (attemptExpiry(quiz, attempt) + SUBMISSION_GRACE_MS < Date.now()) {
      await admin
        .from('quiz_attempts')
        .update({ status: 'expired', completed_at: new Date().toISOString() })
        .eq('id', attempt.id)
        .eq('status', 'in_progress');
      return NextResponse.json({ success: false, message: 'انتهى الوقت المحدد لهذه المحاولة' }, { status: 409 });
    }

    const questions = parseQuizQuestions(quiz.questions_json);
    if (questions.length === 0) {
      return NextResponse.json({ success: false, message: 'أسئلة الاختبار غير صالحة' }, { status: 422 });
    }
    const safeAnswers = sanitizeQuizAnswers(body.answers, toStudentQuizQuestions(questions));
    const { data: updated, error: updateError } = await admin
      .from('quiz_attempts')
      .update({ answers_json: safeAnswers })
      .eq('id', attempt.id)
      .eq('status', 'in_progress')
      .select('id')
      .maybeSingle();

    if (updateError) throw updateError;
    if (!updated) {
      return NextResponse.json({ success: false, message: 'تم إنهاء المحاولة قبل حفظ المسودة' }, { status: 409 });
    }

    return NextResponse.json({ success: true, savedAnswers: safeAnswers.length });
  } catch (error) {
    console.error('Quiz attempt draft error:', error);
    return NextResponse.json(
      { success: false, message: 'تعذر حفظ مسودة الاختبار' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> },
) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const email = auth.user.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ success: false, message: 'الحساب لا يحتوي على بريد إلكتروني' }, { status: 400 });
  }

  try {
    const { quizId: rawQuizId } = await params;
    const quizId = rawQuizId.trim();
    const body = await request.json();
    const attemptId = typeof body.attemptId === 'string' ? body.attemptId.trim() : '';
    if (!attemptId || !Array.isArray(body.answers)) {
      return NextResponse.json({ success: false, message: 'بيانات المحاولة غير مكتملة' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const [quiz, attemptResult] = await Promise.all([
      getQuiz(admin, quizId),
      admin.from('quiz_attempts').select('*').eq('id', attemptId).eq('quiz_id', quizId).maybeSingle(),
    ]);

    if (attemptResult.error) throw attemptResult.error;
    const attempt = attemptResult.data as AttemptRow | null;
    if (!quiz || !attempt) {
      return NextResponse.json({ success: false, message: 'المحاولة أو الاختبار غير موجود' }, { status: 404 });
    }
    if (!attemptBelongsToUser(attempt, auth.user.id, email)) {
      return NextResponse.json({ success: false, message: 'لا تملك هذه المحاولة' }, { status: 403 });
    }
    if (!(await isStudentEnrolled(admin, auth.user.id, email, quiz.course_id))) {
      return NextResponse.json({ success: false, message: 'لم يعد لديك اشتراك صالح لهذه الدورة' }, { status: 403 });
    }
    if (attempt.status !== 'in_progress') {
      return NextResponse.json({ success: false, message: 'تم إنهاء هذه المحاولة من قبل' }, { status: 409 });
    }

    const now = Date.now();
    if (attemptExpiry(quiz, attempt) + SUBMISSION_GRACE_MS < now) {
      await admin
        .from('quiz_attempts')
        .update({ status: 'expired', completed_at: new Date().toISOString() })
        .eq('id', attempt.id)
        .eq('status', 'in_progress');
      return NextResponse.json({ success: false, message: 'انتهى الوقت المحدد لهذه المحاولة' }, { status: 409 });
    }

    const questions = parseQuizQuestions(quiz.questions_json);
    if (questions.length === 0) {
      return NextResponse.json({ success: false, message: 'أسئلة الاختبار غير صالحة للتصحيح' }, { status: 422 });
    }

    const graded = gradeQuizAnswers(questions, body.answers);
    const completedAt = new Date().toISOString();
    const { data: updated, error: updateError } = await admin
      .from('quiz_attempts')
      .update({
        score: graded.score,
        total_questions: graded.totalQuestions,
        correct_answers: graded.correctAnswers,
        answers_json: graded.results,
        status: 'completed',
        completed_at: completedAt,
      })
      .eq('id', attempt.id)
      .eq('status', 'in_progress')
      .select('id')
      .maybeSingle();

    if (updateError) throw updateError;
    if (!updated) {
      return NextResponse.json({ success: false, message: 'تم اعتماد المحاولة بالفعل' }, { status: 409 });
    }

    const passPercentage = Number(quiz.pass_percentage || 60);
    return NextResponse.json({
      success: true,
      result: {
        attemptId: attempt.id,
        quizId: quiz.id,
        title: quiz.title,
        score: graded.score,
        passPercentage,
        passed: graded.score >= passPercentage,
        totalQuestions: graded.totalQuestions,
        correctAnswers: graded.correctAnswers,
        completedAt,
        results: graded.results,
      },
    });
  } catch (error) {
    console.error('Quiz attempt submission error:', error);
    return NextResponse.json(
      { success: false, message: 'تعذر اعتماد إجابات الاختبار' },
      { status: 500 },
    );
  }
}
