import { NextResponse } from 'next/server';
import {
  CoursePersistenceError,
  getAllCoursesAsync,
  getCourseBySlugAsync,
  saveCourseAsync,
  deleteCourseAsync,
} from '@/lib/courses-store';
import { requireInstructorOrAdmin, isAdminRole } from '@/lib/security/auth';
import { cleanString, readJsonObject, safeErrorMessage, ValidationError } from '@/lib/security/validation';
import type { Course } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const courses = await getAllCoursesAsync();
    return NextResponse.json(
      { success: true, courses },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: unknown) {
    console.error('API /api/courses error:', err);
    return NextResponse.json({ success: false, error: 'تعذر تحميل الدورات' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;
    const body = await readJsonObject(req);
    const title = cleanString(body.title, 'عنوان الدورة', { max: 200 })!;

    // Enforce ownership: instructors cannot edit other instructors' or admin courses
    if (!isAdminRole(auth.role)) {
      const courseIdOrSlug = body.slug || body.id;
      if (courseIdOrSlug) {
        const existing = await getCourseBySlugAsync(String(courseIdOrSlug), { includeUnpublished: true });
        if (existing && existing.trainerId && existing.trainerId !== auth.user.id) {
          return NextResponse.json(
            { success: false, error: 'غير مصرح لك بتعديل دورة خاصة بمدرب آخر' },
            { status: 403 }
          );
        }
      }
    }

    const coursePayload = {
      ...body,
      title,
      ...(!isAdminRole(auth.role) && !body.trainerId ? { trainerId: auth.user.id } : {}),
    };

    const saved = await saveCourseAsync(coursePayload as Partial<Course> & { title: string }, auth.user.id);
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
        error: err instanceof CoursePersistenceError
          ? err.message
          : safeErrorMessage(err, 'تعذر حفظ الدورة'),
      },
      { status: err instanceof ValidationError ? 400 : err instanceof CoursePersistenceError ? 503 : 500 },
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

    // Enforce ownership: instructors cannot delete other instructors' courses
    if (!isAdminRole(auth.role)) {
      const existing = await getCourseBySlugAsync(slug, { includeUnpublished: true });
      if (existing && existing.trainerId && existing.trainerId !== auth.user.id) {
        return NextResponse.json(
          { success: false, error: 'غير مصرح لك بحذف دورة خاصة بمدرب آخر' },
          { status: 403 }
        );
      }
    }

    const deleted = await deleteCourseAsync(slug);
    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    console.error('API /api/courses DELETE error:', err);
    return NextResponse.json({ success: false, error: 'تعذر حذف الدورة' }, { status: 500 });
  }
}
