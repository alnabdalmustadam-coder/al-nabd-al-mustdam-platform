import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/security/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAllCoursesAsync } from '@/lib/courses-store';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const [summary, courses] = await Promise.all([
      getSupabaseAdmin().rpc('course_satisfaction_summary'), getAllCoursesAsync({ includeUnpublished: true }),
    ]);
    if (summary.error || !summary.data) throw summary.error || new Error('Missing satisfaction summary');
    const byId = new Map(courses.map((course) => [String(course.id), course]));
    const contents = (summary.data.contents || []).filter((item: { course_id: number }) => byId.has(String(item.course_id)));
    return NextResponse.json({ success: true, learners: summary.data.learners || 0,
      courses: courses.map((course) => ({ id: course.id, title: course.title, slug: course.slug,
        ...(summary.data.courses || []).find((item: { course_id: number }) => String(item.course_id) === String(course.id)),
        contents: contents.filter((item: { course_id: number }) => String(item.course_id) === String(course.id)),
      })),
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Admin satisfaction summary failed:', error);
    return NextResponse.json({ success: false, message: 'تعذر تحميل رضا الطلاب' }, { status: 503 });
  }
}
