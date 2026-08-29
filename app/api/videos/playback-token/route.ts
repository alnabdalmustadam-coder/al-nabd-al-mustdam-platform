import { NextResponse } from 'next/server';
import { BunnyStreamProvider } from '@/lib/video/providers/bunny-provider';
import { requireUser, isAdminRole, isInstructorRole } from '@/lib/security/auth';

export async function POST(req: Request) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;

    const { videoId, courseSlug } = await req.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'يلزم توفير معرف الفيديو' },
        { status: 400 }
      );
    }

    const { user, supabase } = auth;

    // 1. Fetch user role
    let isAdminOrInstructor = false;
    let userFullName = 'متدرب معتمد';
    let nationalId = '';

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, national_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      userFullName = profile.full_name || user.user_metadata?.full_name || 'متدرب معتمد';
      nationalId = profile.national_id || '';
    }
    isAdminOrInstructor = isAdminRole(auth.role) || isInstructorRole(auth.role);

    // 2. Authorization check (Admins/Instructors always have access, or enrolled students)
    if (!isAdminOrInstructor) {
      if (!courseSlug) {
        return NextResponse.json({ error: 'معرف الدورة مطلوب' }, { status: 400 });
      }
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, status')
        .eq('email', user.email)
        .in('course_id', [courseSlug, `course-${courseSlug.replace(/^course-/, '')}`, courseSlug.replace(/^course-/, '')])
        .maybeSingle();

      if (!enrollment || !['active', 'ACTIVE', 'completed', 'COMPLETED'].includes(enrollment.status)) {
        return NextResponse.json({ error: 'لا يوجد تسجيل فعال في هذه الدورة' }, { status: 403 });
      }
    }

    // 3. Generate Signed Playback URL from Bunny Stream Provider
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || '';
    const provider = new BunnyStreamProvider();
    const playbackData = await provider.generateSignedPlaybackUrl(
      videoId,
      clientIp
    );

    // Watermark text includes student name + ID if available
    const watermarkText = `${userFullName} ${nationalId ? `| هوية: ${nationalId}` : ''}`;

    return NextResponse.json(
      {
        success: true,
        iframeUrl: playbackData.iframeUrl,
        expiresAt: playbackData.expiresAt,
        userWatermark: watermarkText,
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  } catch (error: unknown) {
    console.error('Error generating playback token:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إعداد مشغل الفيديو' },
      { status: 500 }
    );
  }
}
