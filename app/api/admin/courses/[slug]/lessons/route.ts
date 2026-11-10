import { NextResponse } from 'next/server';
import { getCourseForManagementAsync,CourseAccessError,CoursePersistenceError } from '@/lib/courses-store';
import { requireInstructorOrAdmin,isAdminRole } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function courseErrorResponse(error: unknown) {
  return NextResponse.json(
    { success: false, error: error instanceof CourseAccessError || error instanceof CoursePersistenceError ? error.message : 'تعذر إدارة دروس الدورة' },
    { status: error instanceof CourseAccessError ? error.status : error instanceof CoursePersistenceError ? 503 : 500 },
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;
    const { slug } = await params;
    const course = await getCourseForManagementAsync(slug, isAdminRole(auth.role) ? undefined : auth.user.id);

    return NextResponse.json(
      {
        success: true,
        curriculum: course.curriculum || [],
        lessonsCount: course.curriculum ? course.curriculum.length : 0,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: unknown) {
    console.error('Error fetching lessons:', err);
    return courseErrorResponse(err);
  }
}
