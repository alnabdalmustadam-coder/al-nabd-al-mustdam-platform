import { NextResponse } from 'next/server';
import { getCourseBySlugAsync } from '@/lib/courses-store';
import { requireUser } from '@/lib/security/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildActor, buildStatement, stmtProgressed, storeStatement } from '@/lib/xapi';
import { getCourseAllLessons } from '@/lib/course-lessons';

type EnrollmentRow = { id: string; status: string | null };

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const courseId = new URL(request.url).searchParams.get('courseId')?.trim() || '';
    const email = auth.user.email?.trim().toLowerCase();

    if (!email || !/^[a-zA-Z0-9_-]{1,120}$/.test(courseId)) {
      return NextResponse.json({ success: false, message: 'معرف الدورة غير صالح' }, { status: 400 });
    }

    const course = await getCourseBySlugAsync(courseId.replace(/^course-/, ''));
    if (!course) {
      return NextResponse.json({ success: false, message: 'الدورة غير موجودة' }, { status: 404 });
    }

    const identifiers = [...new Set([
      courseId,
      courseId.replace(/^course-/, ''),
      course.slug,
      `course-${course.slug}`,
      course.ghlCourseId,
      course.ghlCourseId?.replace(/^course-/, ''),
      String(course.id),
    ].filter((value): value is string => Boolean(value)))];
    const admin = getSupabaseAdmin();
    const [byUser, byEmail] = await Promise.all([
      admin
        .from('enrollments')
        .select('id, status')
        .eq('user_id', auth.user.id)
        .in('course_id', identifiers),
      admin
        .from('enrollments')
        .select('id, status')
        .eq('email', email)
        .in('course_id', identifiers),
    ]);

    if (byUser.error || byEmail.error) throw byUser.error || byEmail.error;

    const hasActiveEnrollment = [...new Map(
      [...((byUser.data || []) as EnrollmentRow[]), ...((byEmail.data || []) as EnrollmentRow[])]
        .map((row) => [row.id, row]),
    ).values()].some(
      (row) => !['REVOKED', 'CANCELLED', 'CANCELED'].includes(String(row.status || '').toUpperCase()),
    );

    if (!hasActiveEnrollment) {
      return NextResponse.json({ success: false, message: 'غير مسجل في هذه الدورة' }, { status: 403 });
    }

    const lessons = getCourseAllLessons(course);
    const platformIri = 'https://nabdtraining.com';
    const lessonIriPrefix = `${platformIri}/courses/${course.slug}/lessons/`;
    const lessonIdByIri = new Map(
      lessons.map((lesson) => [`${lessonIriPrefix}${encodeURIComponent(lesson.id)}`, lesson.id]),
    );
    const { data: completions, error: completionsError } = await admin
      .from('xapi_statements')
      .select('object_id')
      .eq('actor_email', email)
      .eq('verb_display', 'completed')
      .ilike('object_id', `${lessonIriPrefix}%`);

    if (completionsError) throw completionsError;

    const completedLessonIds = [...new Set(
      (completions || [])
        .map((row) => lessonIdByIri.get(row.object_id))
        .filter((lessonId): lessonId is string => Boolean(lessonId)),
    )];
    const calculatedProgress = Math.min(
      100,
      Math.round((completedLessonIds.length / Math.max(lessons.length, 1)) * 100),
    );

    return NextResponse.json({
      success: true,
      completedLessonIds,
      completedCount: completedLessonIds.length,
      totalLessons: Math.max(lessons.length, 1),
      progress: Math.min(99, calculatedProgress),
      completionPendingAssessment: calculatedProgress >= 100,
    });
  } catch (error) {
    console.error('Get completed lessons route error:', error);
    return NextResponse.json({ success: false, message: 'تعذر تحميل تقدم الدورة' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const courseId = typeof body.courseId === 'string' ? body.courseId.trim() : '';
    const lessonId = typeof body.lessonId === 'string' ? body.lessonId.trim() : '';
    const email = auth.user.email?.trim().toLowerCase();

    if (!email || !/^[a-zA-Z0-9_-]{1,120}$/.test(courseId) || lessonId.length < 1 || lessonId.length > 160) {
      return NextResponse.json({ success: false, message: 'بيانات الدرس غير صالحة' }, { status: 400 });
    }

    const course = await getCourseBySlugAsync(courseId.replace(/^course-/, ''));
    if (!course) {
      return NextResponse.json({ success: false, message: 'الدورة غير موجودة' }, { status: 404 });
    }

    const lessons = getCourseAllLessons(course);
    const lesson = lessons.find((item) => item.id === lessonId);
    if (!lesson) {
      return NextResponse.json({ success: false, message: 'الدرس لا ينتمي إلى هذه الدورة' }, { status: 400 });
    }

    const identifiers = [...new Set([
      courseId,
      courseId.replace(/^course-/, ''),
      course.slug,
      `course-${course.slug}`,
      course.ghlCourseId,
      course.ghlCourseId?.replace(/^course-/, ''),
      String(course.id),
    ].filter((value): value is string => Boolean(value)))];
    const admin = getSupabaseAdmin();
    const [byUser, byEmail] = await Promise.all([
      admin
        .from('enrollments')
        .select('id, status')
        .eq('user_id', auth.user.id)
        .in('course_id', identifiers),
      admin
        .from('enrollments')
        .select('id, status')
        .eq('email', email)
        .in('course_id', identifiers),
    ]);

    if (byUser.error || byEmail.error) throw byUser.error || byEmail.error;

    const enrollments = [...new Map(
      [...((byUser.data || []) as EnrollmentRow[]), ...((byEmail.data || []) as EnrollmentRow[])]
        .map((row) => [row.id, row]),
    ).values()].filter(
      (row) => !['REVOKED', 'CANCELLED', 'CANCELED'].includes(String(row.status || '').toUpperCase()),
    );

    if (enrollments.length === 0) {
      return NextResponse.json({ success: false, message: 'غير مسجل في هذه الدورة' }, { status: 403 });
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('full_name, national_id')
      .eq('id', auth.user.id)
      .maybeSingle();
    const name = profile?.full_name || email.split('@')[0];
    const nationalId = profile?.national_id || '';
    const platformIri = 'https://nabdtraining.com';

    const actor = buildActor({ email, name, nationalId });
    const statement = buildStatement({
      actor,
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/completed',
        display: { 'en-US': 'completed', 'ar-SA': 'أكمل' },
      },
      object: {
        objectType: 'Activity' as const,
        id: `${platformIri}/courses/${course.slug}/lessons/${encodeURIComponent(lesson.id)}`,
        definition: {
          type: 'http://adlnet.gov/expapi/activities/lesson',
          name: { 'ar-SA': lesson.title, 'en-US': lesson.title },
        },
      },
      result: { completion: true },
    });
    await storeStatement(statement);

    const { data: completions, error: completionsError } = await admin
      .from('xapi_statements')
      .select('object_id')
      .eq('actor_email', email)
      .eq('verb_display', 'completed')
      .ilike('object_id', `%/courses/${course.slug}/lessons/%`);

    if (completionsError) throw completionsError;

    const validLessonIris = new Set(
      lessons.map((item) => `${platformIri}/courses/${course.slug}/lessons/${encodeURIComponent(item.id)}`),
    );
    const completedCount = new Set(
      (completions || [])
        .map((row) => row.object_id)
        .filter((objectId) => validLessonIris.has(objectId)),
    ).size;
    const calculatedProgress = Math.min(100, Math.round((completedCount / Math.max(lessons.length, 1)) * 100));

    // Lesson completion is self-paced telemetry. Keep academic completion and
    // certificate eligibility server/admin controlled until assessments exist.
    const safeProgress = Math.min(99, calculatedProgress);
    const { error: enrollmentError } = await admin
      .from('enrollments')
      .update({ progress: safeProgress, status: 'active', completed_at: null })
      .in('id', enrollments.map((row) => row.id));

    if (enrollmentError) throw enrollmentError;

    try {
      await storeStatement(stmtProgressed({
        email,
        name,
        nationalId,
        courseId: course.slug,
        courseName: course.title,
        courseNameAr: course.title,
        progress: safeProgress,
      }));
    } catch (xapiError) {
      console.error('Non-fatal: failed to store course progress statement:', xapiError);
    }

    return NextResponse.json({
      success: true,
      progress: safeProgress,
      completionPendingAssessment: calculatedProgress >= 100,
      completedCount,
      totalLessons: Math.max(lessons.length, 1),
    });
  } catch (error) {
    console.error('Complete lesson route error:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
