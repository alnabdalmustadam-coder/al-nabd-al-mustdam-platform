import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/security/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAllCoursesAsync } from '@/lib/courses-store';
import { buildSatisfactionSummary } from '@/lib/learning/satisfaction-summary';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const [summary, courses] = await Promise.all([
      getSupabaseAdmin().rpc('course_satisfaction_summary'), getAllCoursesAsync({ includeUnpublished: true }),
    ]);
    if (summary.error || !summary.data) throw summary.error || new Error('Missing satisfaction summary');
    return NextResponse.json({ success: true, ...buildSatisfactionSummary(courses, summary.data) },
      { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Admin satisfaction summary failed:', error);
    return NextResponse.json({ success: false, message: 'تعذر تحميل رضا الطلاب' }, { status: 503 });
  }
}
