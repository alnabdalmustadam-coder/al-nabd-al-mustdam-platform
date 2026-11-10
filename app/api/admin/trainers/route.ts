import { NextRequest,NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/security/auth';
import { getAllCoursesAsync } from '@/lib/courses-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Fetch instructor profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('role', ['INSTRUCTOR', 'TRAINER', 'TEACHER'])
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching trainer profiles:', profilesError);
      return NextResponse.json({ success: false, message: profilesError.message }, { status: 500 });
    }

    // 2. Fetch all courses to calculate dynamic stats & assignments
    const allCourses = await getAllCoursesAsync({ includeUnpublished: true });

    // 3. Map trainers with real dynamic stats
    const trainers = (profiles || []).map((p) => {
      const name = p.full_name?.trim() || 'مدرب معتمد';
      const cleanEmail = (p.email || '').toLowerCase().trim();

      // Find courses assigned to this trainer (by trainerId or instructor name)
      const assignedCourses = allCourses.filter(
        (c) =>
          (c.trainerId && String(c.trainerId) === String(p.id)) ||
          (c.instructor && c.instructor.trim() === name)
      );

      const coursesCount = assignedCourses.length;
      const studentsCount = assignedCourses.reduce((sum, c) => sum + (c.studentsCount || c.enrollees || 0), 0);
      
      const ratings = assignedCourses.map((c) => c.rating).filter((r): r is number => typeof r === 'number' && r > 0);
      const avgRating = ratings.length > 0
        ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
        : 5.0;

      const initials = name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n: string) => n[0])
        .join(' ') || 'م د';

      return {
        id: p.id,
        name,
        specialty: p.bio || p.specialty || 'مدرب ومحاضر معتمد',
        email: cleanEmail,
        phone: p.phone || 'غير مسجل',
        avatarUrl: p.avatar_url || null,
        coursesCount,
        studentsCount,
        rating: avgRating,
        status: (p.status === 'on_leave' ? 'on_leave' : 'active') as 'active' | 'on_leave',
        avatarInitials: initials,
        assignedCourseSlugs: assignedCourses.map((c) => c.slug),
        assignedCourseTitles: assignedCourses.map((c) => c.title),
        createdAt: p.created_at,
      };
    });

    return NextResponse.json({ success: true, trainers });
  } catch (err: any) {
    console.error('Admin trainers GET error:', err);
    return NextResponse.json({ success: false, message: err.message || 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
