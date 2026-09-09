import { NextResponse } from 'next/server';
import { addOrUpdateLessonAsync, deleteLessonAsync, getCourseForManagementAsync, CourseAccessError, CoursePersistenceError } from '@/lib/courses-store';
import { requireInstructorOrAdmin, isAdminRole } from '@/lib/security/auth';

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

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;
    const { slug } = await params;
    const body = await req.json();
    
    if (!body.title) {
      return NextResponse.json({ success: false, error: 'عنوان الدرس مطلوب' }, { status: 400 });
    }

    const updatedCourse = await addOrUpdateLessonAsync(slug, {
      id: body.id,
      title: body.title,
      duration: body.duration || '20 دقيقة',
      videoUrl: body.videoUrl || body.bunnyVideoId || '',
      type: body.type || 'video',
      isLocked: body.isLocked ?? false,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileSize: body.fileSize,
      quizData: body.quizData,
      items: body.items,
      subLessons: body.subLessons,
    }, auth.user.id, { instructorId: isAdminRole(auth.role) ? undefined : auth.user.id });

    if (!updatedCourse) {
      return NextResponse.json({ success: false, error: 'تعذر تحديث دروس الدورة' }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        course: updatedCourse,
        curriculum: updatedCourse.curriculum,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: unknown) {
    console.error('Error saving lesson:', err);
    return courseErrorResponse(err);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json({ success: false, error: 'معرّف الدرس مطلوب' }, { status: 400 });
    }

    const updatedCourse = await deleteLessonAsync(slug, lessonId, auth.user.id, {
      instructorId: isAdminRole(auth.role) ? undefined : auth.user.id,
    });
    if (!updatedCourse) {
      return NextResponse.json({ success: false, error: 'تعذر حذف الدرس' }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        course: updatedCourse,
        curriculum: updatedCourse.curriculum,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: unknown) {
    console.error('Error deleting lesson:', err);
    return courseErrorResponse(err);
  }
}
