import { getLearningContent, isLearningJourney } from '@/lib/learning/journey';
import { NextResponse } from 'next/server';
import { getCourseBySlugAsync } from '@/lib/courses-store';
import { requireUser } from '@/lib/security/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildActor, buildStatement, stmtProgressed, storeStatement } from '@/lib/xapi';
import { getCourseAllLessons } from '@/lib/course-lessons';
import { getCourseEnrollmentIdentifiers, parseCourseIdentifier } from '@/lib/public-courses';
import { readCpdProgress, verifyCpdCompletion } from '@/lib/learning/cpd';
import { LearningError } from '@/lib/learning/course-access';
import { isEnrollmentActive } from '@/lib/security/student-access';
import { readOrdinaryCourseProgress, saveOrdinaryCourseProgress } from '@/lib/learning/ordinary-progress';

export const dynamic = 'force-dynamic';
type EnrollmentRow = { id: string; status: string | null; user_id?: string | null; email?: string; progress?: number };
const active = (row: EnrollmentRow, userId: string, email: string) =>
  (row.user_id === userId || (!row.user_id && row.email === email)) && isEnrollmentActive(row.status)
  && !['suspended', 'expired'].includes(String(row.status).toLowerCase());

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  try {
    const courseId = parseCourseIdentifier(new URL(request.url).searchParams.get('courseId'));
    const email = auth.user.email?.trim().toLowerCase();

    if (!email || !courseId) {
      return NextResponse.json({ success: false, message: 'معرف الدورة غير صالح' }, { status: 400 });
    }

    const course = await getCourseBySlugAsync(courseId);
    if (!course) {
      return NextResponse.json({ success: false, message: 'الدورة غير موجودة' }, { status: 404 });
    }

    const identifiers = getCourseEnrollmentIdentifiers(course, courseId);
    const admin = getSupabaseAdmin();
    const [byUser, byEmail] = await Promise.all([
      admin
        .from('enrollments')
        .select('id, user_id, email, status, progress')
        .eq('user_id', auth.user.id)
        .in('course_id', identifiers),
      admin
        .from('enrollments')
        .select('id, user_id, email, status, progress')
        .eq('email', email)
        .in('course_id', identifiers),
    ]);

    if (byUser.error || byEmail.error) throw byUser.error || byEmail.error;

    const hasActiveEnrollment = [...new Map(
      [...((byUser.data || []) as EnrollmentRow[]), ...((byEmail.data || []) as EnrollmentRow[])]
        .map((row) => [row.id, row]),
    ).values()].some(
      (row) => active(row, auth.user.id, email),
    );

    if (!hasActiveEnrollment) {
      return NextResponse.json({ success: false, message: 'غير مسجل في هذه الدورة' }, { status: 403 });
    }

    const lessons = isLearningJourney(course) ? getLearningContent(course) : getCourseAllLessons(course);
    if (course.professionalDevelopment) {
      const progress = await readCpdProgress(admin, course, auth.user.id);
      const calculated = Math.round(progress.completed.size / Math.max(lessons.length, 1) * 100);
      const journeyComplete = isLearningJourney(course) && calculated === 100
        && [...(byUser.data || []), ...(byEmail.data || [])].some((row) => active(row, auth.user.id, email) && String(row.status).toLowerCase() === 'completed');
      return NextResponse.json({ success: true, professionalDevelopment: true, journeyComplete,
        completedLessonIds: [...progress.completed], completedCount: progress.completed.size,
        totalLessons: lessons.length, progress: journeyComplete ? 100 : Math.min(99, calculated), completionPendingAssessment: calculated >= 100 && !journeyComplete,
      }, { headers: { 'Cache-Control': 'private, no-store' } });
    }
    const progress = await readOrdinaryCourseProgress(admin, course, email);
    const owned = [...(byUser.data || []), ...(byEmail.data || [])]
      .filter((row) => active(row, auth.user.id, email));
    return NextResponse.json({ success: true, ...progress,
      completionNeedsSync: progress.courseComplete && owned.some((row) => Number(row.progress) !== 100 || String(row.status).toLowerCase() !== 'completed'),
    }, { headers: { 'Cache-Control': 'private, no-store' } });
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
    const courseId = parseCourseIdentifier(body?.courseId);
    const lessonId = typeof body?.lessonId === 'string' ? body.lessonId.trim() : '';
    const email = auth.user.email?.trim().toLowerCase();

    if (!email || !courseId || lessonId.length < 1 || lessonId.length > 160) {
      return NextResponse.json({ success: false, message: 'بيانات الدرس غير صالحة' }, { status: 400 });
    }

    const course = await getCourseBySlugAsync(courseId);
    if (!course) {
      return NextResponse.json({ success: false, message: 'الدورة غير موجودة' }, { status: 404 });
    }

    const lessons = isLearningJourney(course) ? getLearningContent(course) : getCourseAllLessons(course);
    const lesson = lessons.find((item) => item.id === lessonId);
    if (!lesson) {
      return NextResponse.json({ success: false, message: 'الدرس لا ينتمي إلى هذه الدورة' }, { status: 400 });
    }

    const identifiers = getCourseEnrollmentIdentifiers(course, courseId);
    const admin = getSupabaseAdmin();
    const [byUser, byEmail] = await Promise.all([
      admin
        .from('enrollments')
        .select('id, user_id, email, status')
        .eq('user_id', auth.user.id)
        .in('course_id', identifiers),
      admin
        .from('enrollments')
        .select('id, user_id, email, status')
        .eq('email', email)
        .in('course_id', identifiers),
    ]);

    if (byUser.error || byEmail.error) throw byUser.error || byEmail.error;

    const enrollments = [...new Map(
      [...((byUser.data || []) as EnrollmentRow[]), ...((byEmail.data || []) as EnrollmentRow[])]
        .map((row) => [row.id, row]),
    ).values()].filter(
      (row) => active(row, auth.user.id, email),
    );

    if (enrollments.length === 0) {
      return NextResponse.json({ success: false, message: 'غير مسجل في هذه الدورة' }, { status: 403 });
    }

    if (course.professionalDevelopment) await verifyCpdCompletion(admin, course, auth.user.id, email, lessonId);

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

    if (!course.professionalDevelopment) {
      const progress = await readOrdinaryCourseProgress(admin, course, email);
      await saveOrdinaryCourseProgress(admin, progress, enrollments.map((row) => row.id));
      try {
        await storeStatement(stmtProgressed({ email, name, nationalId, courseId: course.slug,
          courseName: course.title, courseNameAr: course.title, progress: progress.progress }));
      } catch (xapiError) { console.error('Non-fatal: failed to store course progress statement:', xapiError); }
      return NextResponse.json({ success: true, ...progress });
    }

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
    const completedCount = course.professionalDevelopment
      ? (await readCpdProgress(admin, course, auth.user.id)).completed.size
      : new Set(
      (completions || [])
        .map((row) => row.object_id)
        .filter((objectId) => validLessonIris.has(objectId)),
    ).size;
    const calculatedProgress = Math.min(100, Math.round((completedCount / Math.max(lessons.length, 1)) * 100));

    // The dedicated journey completion route verifies the final assessment.
    // Preserve that result when a completed station is revisited.
    const alreadyComplete = isLearningJourney(course) && calculatedProgress === 100 && enrollments.some((row) => String(row.status).toLowerCase() === 'completed');
    const safeProgress = alreadyComplete ? 100 : Math.min(99, calculatedProgress);
    const { error: enrollmentError } = await admin
      .from('enrollments')
      .update(alreadyComplete ? { progress: 100 } : { progress: safeProgress, status: 'active', completed_at: null })
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
      completionPendingAssessment: calculatedProgress >= 100 && !alreadyComplete,
      completedCount,
      totalLessons: Math.max(lessons.length, 1),
    });
  } catch (error) {
    if (error instanceof LearningError) return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    console.error('Complete lesson route error:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
