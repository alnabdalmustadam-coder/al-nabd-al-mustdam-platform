import { getLearningContent,isLearningJourney } from '@/lib/learning/journey';
import { NextResponse } from 'next/server';
import { getCourseBySlugAsync } from '@/lib/courses-store';
import { requireUser } from '@/lib/security/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCourseAllLessons } from '@/lib/course-lessons';
import { getCourseEnrollmentIdentifiers,parseCourseIdentifier } from '@/lib/public-courses';
import { readCpdProgress } from '@/lib/learning/cpd';
import { isEnrollmentActive } from '@/lib/security/student-access';
import { readOrdinaryCourseProgress } from '@/lib/learning/ordinary-progress';

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
