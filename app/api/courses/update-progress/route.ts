import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/security/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCourseBySlugAsync } from '@/lib/courses-store';

type EnrollmentRow = {
  id: string;
  course_id: string;
  status: string | null;
};

function uniqueById<T extends { id: string }>(rows: T[]): T[] {
  return [...new Map(rows.map((row) => [row.id, row])).values()];
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const courseSlug = typeof body.courseSlug === 'string'
      ? body.courseSlug.replace(/^course-/, '').trim()
      : '';

    if (!/^[a-zA-Z0-9_-]{1,120}$/.test(courseSlug)) {
      return NextResponse.json({ success: false, error: 'معرف الدورة غير صالح' }, { status: 400 });
    }

    const course = await getCourseBySlugAsync(courseSlug);
    if (!course) {
      return NextResponse.json({ success: false, error: 'الدورة غير موجودة' }, { status: 404 });
    }

    const progressValue = Number(body.progress);
    if (!Number.isFinite(progressValue) || progressValue < 0 || progressValue > 100) {
      return NextResponse.json({ success: false, error: 'قيمة التقدم غير صالحة' }, { status: 400 });
    }

    const email = auth.user.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ success: false, error: 'الحساب لا يحتوي على بريد إلكتروني' }, { status: 400 });
    }

    const identifiers = [...new Set([
      courseSlug,
      course.slug,
      `course-${courseSlug}`,
      `course-${course.slug}`,
      course.ghlCourseId,
      course.ghlCourseId?.replace(/^course-/, ''),
      String(course.id),
    ].filter((value): value is string => Boolean(value)))];

    const admin = getSupabaseAdmin();
    const [byUser, byEmail] = await Promise.all([
      admin
        .from('enrollments')
        .select('id, course_id, status')
        .eq('user_id', auth.user.id)
        .in('course_id', identifiers),
      admin
        .from('enrollments')
        .select('id, course_id, status')
        .eq('email', email)
        .in('course_id', identifiers),
    ]);

    if (byUser.error || byEmail.error) throw byUser.error || byEmail.error;

    const enrollments = uniqueById([
      ...((byUser.data || []) as EnrollmentRow[]),
      ...((byEmail.data || []) as EnrollmentRow[]),
    ]).filter(
      (row) => !['REVOKED', 'CANCELLED', 'CANCELED'].includes(String(row.status || '').toUpperCase()),
    );

    if (enrollments.length === 0) {
      return NextResponse.json({ success: false, error: 'غير مسجل في هذه الدورة' }, { status: 403 });
    }

    // The current UI progress is client telemetry. Keep it below the completion
    // threshold so it can never issue a certificate or grant an academic result.
    // Final completion will be enabled with the future server-graded assessment.
    const safeProgress = Math.min(99, Math.round(progressValue));
    const { data, error } = await admin
      .from('enrollments')
      .update({ progress: safeProgress, status: 'active', completed_at: null })
      .in('id', enrollments.map((row) => row.id))
      .select('id, course_id, progress, status');

    if (error) throw error;

    return NextResponse.json({
      success: true,
      updatedCount: data?.length || 0,
      progress: safeProgress,
      completionPendingAssessment: progressValue >= 100,
    });
  } catch (error) {
    console.error('Secure progress update error:', error);
    return NextResponse.json({ success: false, error: 'تعذر تحديث التقدم' }, { status: 500 });
  }
}
