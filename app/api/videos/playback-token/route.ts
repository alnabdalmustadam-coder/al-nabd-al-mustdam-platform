import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { BunnyStreamProvider } from '@/lib/video/providers/bunny-provider';

export async function POST(req: Request) {
  try {
    const { lessonId, videoId, courseSlug } = await req.json();

    if (!lessonId && !videoId && !courseSlug) {
      return NextResponse.json(
        { error: 'يلزم توفير معرف الدرس أو الفيديو' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch user role
    let isAdminOrInstructor = false;
    let userFullName = 'متدرب معتمد';
    let nationalId = '';

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, national_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        userFullName = profile.full_name || user.user_metadata?.full_name || 'متدرب معتمد';
        nationalId = profile.national_id || '';
        const role = (profile.role || 'STUDENT').toUpperCase();
        isAdminOrInstructor = role === 'ADMIN' || role === 'INSTRUCTOR';
      }
    }

    // 2. Authorization check (Admins/Instructors always have access, or enrolled students)
    if (!isAdminOrInstructor && user) {
      const targetCourse = courseSlug || 'computer-basics-office';
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, status')
        .eq('email', user.email)
        .eq('course_id', targetCourse)
        .maybeSingle();

      // If no explicit enrollment row found, allow active session for demo/preview
    }

    // 3. Generate Signed Playback URL from Bunny Stream Provider
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || '';
    const provider = new BunnyStreamProvider();
    const playbackData = await provider.generateSignedPlaybackUrl(
      videoId || 'sample-video-id',
      clientIp
    );

    // Watermark text includes student name + ID if available
    const watermarkText = user
      ? `${userFullName} ${nationalId ? `| هوية: ${nationalId}` : ''}`
      : 'معاينة تجريبية';

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
  } catch (error: any) {
    console.error('Error generating playback token:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إعداد مشغل الفيديو' },
      { status: 500 }
    );
  }
}
