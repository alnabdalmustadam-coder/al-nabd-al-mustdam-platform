import { NextResponse } from 'next/server';
import {
  CoursePersistenceError,
  CourseAccessError,
  getAllCoursesAsync,
  saveCourseAsync,
  deleteCourseAsync,
} from '@/lib/courses-store';
import { requireInstructorOrAdmin, isAdminRole } from '@/lib/security/auth';
import { cleanString, readJsonObject, safeErrorMessage, ValidationError } from '@/lib/security/validation';
import type { Course } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const mine = new URL(req.url).searchParams.get('mine') === '1';
    let courses: Course[];
    if (mine) {
      const auth = await requireInstructorOrAdmin(req);
      if (!auth.ok) return auth.response;
      const catalog = await getAllCoursesAsync({ includeUnpublished: true, requireDatabase: true });
      courses = isAdminRole(auth.role) ? catalog : catalog.filter(course => course.trainerId === auth.user.id);
    } else {
      courses = await getAllCoursesAsync();
    }
    return NextResponse.json(
      { success: true, courses },
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

export async function POST(req: Request) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;
    const body = await readJsonObject(req);
    const title = cleanString(body.title, 'عنوان الدورة', { max: 200 })!;

    const coursePayload = {
      ...body,
      title,
    };

    const saved = await saveCourseAsync(coursePayload as Partial<Course> & { title: string }, auth.user.id, {
      instructorId: isAdminRole(auth.role) ? undefined : auth.user.id,
    });
    return NextResponse.json(
      { success: true, course: saved },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: unknown) {
    console.error('API /api/courses POST error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof CoursePersistenceError || err instanceof CourseAccessError
          ? err.message
          : safeErrorMessage(err, 'تعذر حفظ الدورة'),
      },
      { status: err instanceof CourseAccessError ? err.status : err instanceof ValidationError ? 400 : err instanceof CoursePersistenceError ? 503 : 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || searchParams.get('id');
    
    if (!slug) {
      return NextResponse.json({ success: false, error: 'معرّف الدورة مطلوب' }, { status: 400 });
    }

    const deleted = await deleteCourseAsync(slug, {
      instructorId: isAdminRole(auth.role) ? undefined : auth.user.id,
    });
    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    console.error('API /api/courses DELETE error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof CourseAccessError || err instanceof CoursePersistenceError ? err.message : 'تعذر حذف الدورة' },
      { status: err instanceof CourseAccessError ? err.status : err instanceof CoursePersistenceError ? 503 : 500 },
    );
  }
}
