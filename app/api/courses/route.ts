import { NextResponse } from 'next/server';
import { getAllCourses, saveCourse, deleteCourse } from '@/lib/courses-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const courses = getAllCourses();
    return NextResponse.json({ success: true, courses });
  } catch (err: any) {
    console.error('API /api/courses error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ success: false, error: 'عنوان الدورة مطلوب' }, { status: 400 });
    }

    const saved = saveCourse(body);
    return NextResponse.json({ success: true, course: saved });
  } catch (err: any) {
    console.error('API /api/courses POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || searchParams.get('id');
    
    if (!slug) {
      return NextResponse.json({ success: false, error: 'معرّف الدورة مطلوب' }, { status: 400 });
    }

    const deleted = deleteCourse(slug);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    console.error('API /api/courses DELETE error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
