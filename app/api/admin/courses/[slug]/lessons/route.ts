import { NextResponse } from 'next/server';
import { addOrUpdateLessonAsync, deleteLessonAsync, getCourseBySlugAsync } from '@/lib/courses-store';
import { requireInstructorOrAdmin } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;
    const { slug } = await params;
    const course = await getCourseBySlugAsync(slug);
    if (!course) {
      return NextResponse.json({ success: false, error: 'الدورة غير موجودة' }, { status: 404 });
    }

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
  } catch (err: any) {
    console.error('Error fetching lessons:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
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
    });

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
  } catch (err: any) {
    console.error('Error saving lesson:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
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

    const updatedCourse = await deleteLessonAsync(slug, lessonId);
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
  } catch (err: any) {
    console.error('Error deleting lesson:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
