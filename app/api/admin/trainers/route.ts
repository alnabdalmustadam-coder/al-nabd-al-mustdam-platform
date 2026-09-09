import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/security/auth';
import { getAllCoursesAsync, saveCourseAsync } from '@/lib/courses-store';

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

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const supabaseAdmin = getSupabaseAdmin();

    const body = await req.json();
    const {
      id,
      name,
      fullName,
      specialty,
      bio,
      email,
      phone,
      password,
      avatarUrl,
      status,
      assignedCourseSlugs,
    } = body;

    const trainerId = id;
    if (!trainerId) {
      return NextResponse.json({ success: false, message: 'معرف المدرب مطلوب' }, { status: 400 });
    }

    const updatedName = (fullName || name || '').trim();
    const updatedBio = (specialty !== undefined ? specialty : bio !== undefined ? bio : undefined)?.trim();
    const cleanEmail = email ? email.toLowerCase().trim() : undefined;

    // 1. Update Supabase Auth if email or password changed
    if (cleanEmail || password) {
      const authUpdatePayload: { email?: string; password?: string; user_metadata?: Record<string, any> } = {};
      if (cleanEmail) authUpdatePayload.email = cleanEmail;
      if (password && password.trim()) authUpdatePayload.password = password.trim();
      if (updatedName) {
        authUpdatePayload.user_metadata = { full_name: updatedName };
      }

      try {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(trainerId, authUpdatePayload);
        if (authError) {
          console.warn('Auth admin update notice:', authError);
        }
      } catch (authErr: any) {
        console.warn('Auth admin update warning:', authErr);
      }
    }

    // 2. Update profiles record
    const profileUpdate: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updatedName) profileUpdate.full_name = updatedName;
    if (cleanEmail) profileUpdate.email = cleanEmail;
    if (phone !== undefined) profileUpdate.phone = phone ? phone.trim() : null;
    if (updatedBio !== undefined) {
      profileUpdate.bio = updatedBio;
      profileUpdate.specialty = updatedBio;
    }
    if (status !== undefined && ['active', 'on_leave'].includes(status)) {
      profileUpdate.status = status;
    }
    if (avatarUrl !== undefined) {
      profileUpdate.avatar_url = avatarUrl || null;
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdate)
      .eq('id', trainerId);

    if (updateError) {
      console.error('Error updating trainer profile:', updateError);
      return NextResponse.json({ success: false, message: updateError.message }, { status: 500 });
    }

    // 3. Update Course Assignments if assignedCourseSlugs provided
    if (Array.isArray(assignedCourseSlugs)) {
      const allCourses = await getAllCoursesAsync({ includeUnpublished: true });
      const targetSlugs = new Set(assignedCourseSlugs.map((s: string) => String(s).toLowerCase().trim()));

      for (const course of allCourses) {
        const isSelected = targetSlugs.has(course.slug.toLowerCase());
        const isCurrentlyAssigned = String(course.trainerId) === String(trainerId);

        if (isSelected && !isCurrentlyAssigned) {
          // Assign course to this trainer
          await saveCourseAsync(
            {
              ...course,
              instructor: updatedName || course.instructor,
              trainerId,
            },
            trainerId
          );
        } else if (!isSelected && isCurrentlyAssigned) {
          // Unassign course from this trainer
          await saveCourseAsync(
            {
              ...course,
              trainerId: '',
            },
            trainerId
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات المدرب بنجاح',
    });
  } catch (err: any) {
    console.error('Admin trainers PATCH error:', err);
    return NextResponse.json({ success: false, message: err.message || 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
