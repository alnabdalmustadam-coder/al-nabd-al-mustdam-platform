import { NextResponse } from 'next/server';
import { getAllCoursesAsync, saveCourseAsync, deleteCourseAsync } from '@/lib/courses-store';
import { requireInstructorOrAdmin } from '@/lib/security/auth';
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

    const saved = await saveCourseAsync({ ...body, title } as Partial<Course> & { title: string }, auth.user.id);
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
      { success: false, error: safeErrorMessage(err, 'تعذر حفظ الدورة') },
      { status: err instanceof ValidationError ? 400 : 500 },
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

    const deleted = await deleteCourseAsync(slug);
    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    console.error('API /api/courses DELETE error:', err);
    return NextResponse.json({ success: false, error: 'تعذر حذف الدورة' }, { status: 500 });
  }
}
