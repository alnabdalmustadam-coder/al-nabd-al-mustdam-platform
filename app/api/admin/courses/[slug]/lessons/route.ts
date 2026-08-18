import { NextResponse } from 'next/server';
import { addOrUpdateLesson, deleteLesson, getCourseBySlug } from '@/lib/courses-store';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const course = getCourseBySlug(slug);
    if (!course) {
      return NextResponse.json({ success: false, error: 'الدورة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      curriculum: course.curriculum || [],
      lessonsCount: course.curriculum ? course.curriculum.length : 0,
    });
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
    const { slug } = await params;
    const body = await req.json();
    
    if (!body.title) {
      return NextResponse.json({ success: false, error: 'عنوان الدرس مطلوب' }, { status: 400 });
    }

    const updatedCourse = addOrUpdateLesson(slug, {
      id: body.id,
      title: body.title,
      duration: body.duration || '20 دقيقة',
      videoUrl: body.videoUrl || body.bunnyVideoId || 'MmHWTPJMzbQ',
      type: body.type || 'video',
      isLocked: body.isLocked ?? false,
      subLessons: body.subLessons,
    });

    if (!updatedCourse) {
      return NextResponse.json({ success: false, error: 'تعذر تحديث دروس الدورة' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      course: updatedCourse,
      curriculum: updatedCourse.curriculum,
    });
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
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json({ success: false, error: 'معرّف الدرس مطلوب' }, { status: 400 });
    }

    const updatedCourse = deleteLesson(slug, lessonId);
    if (!updatedCourse) {
      return NextResponse.json({ success: false, error: 'تعذر حذف الدرس' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      course: updatedCourse,
      curriculum: updatedCourse.curriculum,
    });
  } catch (err: any) {
    console.error('Error deleting lesson:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
