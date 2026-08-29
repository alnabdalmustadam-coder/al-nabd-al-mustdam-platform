import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/security/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

type EnrollmentRow = {
  id: string;
  course_id: string;
};

type AttemptRow = {
  id: string;
  quiz_id: string;
  score: number | string | null;
  status: string;
  completed_at: string | null;
};

function uniqueById<T extends { id: string }>(rows: T[]): T[] {
  return [...new Map(rows.map((row) => [row.id, row])).values()];
}

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const email = auth.user.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ success: false, message: 'الحساب لا يحتوي على بريد إلكتروني' }, { status: 400 });
  }

  try {
    const admin = getSupabaseAdmin();
    const [byUser, byEmail] = await Promise.all([
      admin.from('enrollments').select('id, course_id').eq('user_id', auth.user.id),
      admin.from('enrollments').select('id, course_id').eq('email', email),
    ]);

    if (byUser.error || byEmail.error) {
      throw byUser.error || byEmail.error;
    }

    const enrollments = uniqueById([
      ...((byUser.data || []) as EnrollmentRow[]),
      ...((byEmail.data || []) as EnrollmentRow[]),
    ]);
    const courseIds = [...new Set(enrollments.map((row) => row.course_id).filter(Boolean))];

    if (courseIds.length === 0) {
      return NextResponse.json({ success: true, quizzes: [] });
    }

    const { data: quizzes, error: quizzesError } = await admin
      .from('quizzes')
      .select('id, title, course_id, questions_json, duration_minutes, pass_percentage, max_attempts, created_at')
      .eq('is_active', true)
      .in('course_id', courseIds)
      .order('created_at', { ascending: false });

    if (quizzesError) throw quizzesError;

    const quizIds = (quizzes || []).map((quiz) => quiz.id);
    let attempts: AttemptRow[] = [];

    if (quizIds.length > 0) {
      const [attemptsByUser, attemptsByEmail] = await Promise.all([
        admin
          .from('quiz_attempts')
          .select('id, quiz_id, score, status, completed_at')
          .eq('user_id', auth.user.id)
          .in('quiz_id', quizIds),
        admin
          .from('quiz_attempts')
          .select('id, quiz_id, score, status, completed_at')
          .eq('email', email)
          .in('quiz_id', quizIds),
      ]);

      if (attemptsByUser.error || attemptsByEmail.error) {
        throw attemptsByUser.error || attemptsByEmail.error;
      }

      attempts = uniqueById([
        ...((attemptsByUser.data || []) as AttemptRow[]),
        ...((attemptsByEmail.data || []) as AttemptRow[]),
      ]).sort((a, b) => {
        const aTime = a.completed_at ? Date.parse(a.completed_at) : 0;
        const bTime = b.completed_at ? Date.parse(b.completed_at) : 0;
        return bTime - aTime;
      });
    }

    const safeQuizzes = (quizzes || []).map((quiz) => {
      const quizAttempts = attempts.filter((attempt) => attempt.quiz_id === quiz.id);
      const passPercentage = Number(quiz.pass_percentage || 60);
      const completedAttempts = quizAttempts.filter((attempt) => attempt.status === 'completed');
      const passedAttempt = completedAttempts.find((attempt) => Number(attempt.score || 0) >= passPercentage);
      const latestAttempt = completedAttempts[0];
      const status = passedAttempt ? 'passed' : latestAttempt ? 'failed' : 'pending';

      return {
        id: quiz.id,
        title: quiz.title,
        course_id: quiz.course_id,
        courseTitle: quiz.course_id,
        // Only the count leaves the server. questions_json may contain answer keys.
        questionsCount: Array.isArray(quiz.questions_json) ? quiz.questions_json.length : 0,
        durationMinutes: Number(quiz.duration_minutes || 30),
        passPercentage,
        status,
        score: passedAttempt
          ? Number(passedAttempt.score || 0)
          : latestAttempt
            ? Number(latestAttempt.score || 0)
            : undefined,
        attemptsUsed: completedAttempts.length,
        maxAttempts: Number(quiz.max_attempts || 3),
      };
    });

    return NextResponse.json({ success: true, quizzes: safeQuizzes });
  } catch (error) {
    console.error('Secure quiz catalog error:', error);
    return NextResponse.json(
      { success: false, message: 'تعذر تحميل الاختبارات حالياً' },
      { status: 500 },
    );
  }
}
