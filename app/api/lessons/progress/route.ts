import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/security/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function safeSeconds(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(Math.floor(parsed), 24 * 60 * 60);
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const lessonId = typeof body.lessonId === 'string' ? body.lessonId.trim() : '';

    if (!UUID_PATTERN.test(lessonId)) {
      return NextResponse.json({ error: 'معرف الدرس غير صالح' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: lesson, error: lessonError } = await admin
      .from('lessons')
      .select('id, course_id, duration_minutes')
      .eq('id', lessonId)
      .maybeSingle();

    if (lessonError) throw lessonError;
    if (!lesson) {
      return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });
    }

    const email = auth.user.email?.trim().toLowerCase();
    const [byUser, byEmail] = await Promise.all([
      admin
        .from('enrollments')
        .select('id, status')
        .eq('user_id', auth.user.id)
        .eq('course_id', lesson.course_id),
      email
        ? admin
            .from('enrollments')
            .select('id, status')
            .eq('email', email)
            .eq('course_id', lesson.course_id)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (byUser.error || byEmail.error) throw byUser.error || byEmail.error;

    const enrollments = [...new Map(
      [...(byUser.data || []), ...(byEmail.data || [])].map((row) => [row.id, row]),
    ).values()];
    const activeEnrollments = enrollments.filter(
      (row) => !['REVOKED', 'CANCELLED', 'CANCELED'].includes(String(row.status || '').toUpperCase()),
    );

    if (activeEnrollments.length === 0) {
      return NextResponse.json({ error: 'غير مسجل في دورة هذا الدرس' }, { status: 403 });
    }

    const watchedSeconds = safeSeconds(body.watchedSeconds);
    const lastPositionSeconds = safeSeconds(body.lastPositionSeconds);
    const durationSeconds = Math.max(0, Number(lesson.duration_minutes || 0) * 60);
    // Completion is accepted only after at least 90% of a known duration. This
    // is progress telemetry, not a substitute for server-graded exams.
    const isCompleted = Boolean(body.isCompleted)
      && durationSeconds > 0
      && watchedSeconds >= durationSeconds * 0.9;

    const { data: progressData, error: upsertError } = await admin
      .from('lesson_progress')
      .upsert(
        {
          user_id: auth.user.id,
          lesson_id: lessonId,
          watched_seconds: watchedSeconds,
          last_position_seconds: Math.min(lastPositionSeconds, durationSeconds || lastPositionSeconds),
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' },
      )
      .select()
      .single();

    if (upsertError) throw upsertError;

    const [totalResult, completedResult] = await Promise.all([
      admin
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', lesson.course_id),
      admin
        .from('lesson_progress')
        .select('lessons!inner(course_id)', { count: 'exact', head: true })
        .eq('user_id', auth.user.id)
        .eq('is_completed', true)
        .eq('lessons.course_id', lesson.course_id),
    ]);

    if (totalResult.error || completedResult.error) {
      throw totalResult.error || completedResult.error;
    }

    const total = Math.max(totalResult.count || 0, 1);
    const completed = completedResult.count || 0;
    const percent = Math.min(100, Math.round((completed / total) * 100));
    const enrollmentIds = activeEnrollments.map((row) => row.id);
    const { error: enrollmentError } = await admin
      .from('enrollments')
      .update({ progress: percent })
      .in('id', enrollmentIds);

    if (enrollmentError) throw enrollmentError;

    return NextResponse.json({ success: true, progress: progressData, courseProgress: percent });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json({ error: 'خطأ أثناء تحديث الإنجاز' }, { status: 500 });
  }
}
