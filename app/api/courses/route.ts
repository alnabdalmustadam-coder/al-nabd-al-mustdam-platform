import { NextResponse } from 'next/server';
import {
CoursePersistenceError,getAllCoursesAsync
} from '@/lib/courses-store';
import { requireInstructorOrAdmin,isAdminRole } from '@/lib/security/auth';
import type { Course } from '@/types';
import { toPublicCourse } from '@/lib/quizzes/course-quiz';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const mine = new URL(req.url).searchParams.get('mine') === '1';
    let courses: Course[];
    if (mine) {
      const auth = await requireInstructorOrAdmin(req);
      if (!auth.ok) return auth.response;
      const catalog = await getAllCoursesAsync({ includeUnpublished: true });
      courses = isAdminRole(auth.role) ? catalog : catalog.filter(course => course.trainerId === auth.user.id);
    } else {
      courses = await getAllCoursesAsync();
    }
    return NextResponse.json(
      { success: true, courses: mine ? courses : courses.map(toPublicCourse) },
      {
        headers: {
          'Cache-Control': 'private, no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: unknown) {
    console.error('API /api/courses error:', err);
    return NextResponse.json({ success: false, error: 'تعذر تحميل الدورات' }, { status: err instanceof CoursePersistenceError ? 503 : 500 });
  }
}
