import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { videoService } from '@/lib/video/video-service';

export async function POST(req: Request) {
  try {
    const { lessonId, videoId } = await req.json();

    if (!lessonId && !videoId) {
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
            } catch {
              // Intentionally ignored in Server Components/Routes
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch lesson & course information
    let targetVideoId = videoId;
    let isFreePreview = false;
    let courseId = '';

    if (lessonId) {
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('id, course_id, is_free_preview, videos(bunny_video_id)')
        .eq('id', lessonId)
        .single();

      if (lessonData) {
        isFreePreview = lessonData.is_free_preview || false;
        courseId = lessonData.course_id;
        const videoObj = Array.isArray(lessonData.videos) ? lessonData.videos[0] : lessonData.videos;
        if (videoObj && videoObj.bunny_video_id) {
          targetVideoId = videoObj.bunny_video_id;
        }
      }
    }

    // 2. Authorization check (if not free preview, user must be logged in & enrolled)
    if (!isFreePreview) {
      if (!user) {
        return NextResponse.json(
          { error: 'غير مصرح: يلزم تسجيل الدخول لمشاهدة المحتوى' },
          { status: 401 }
        );
      }

      // Check enrollment
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('status', 'ACTIVE')
        .maybeSingle();

      if (!enrollment) {
        return NextResponse.json(
          { error: 'غير مصرح: يلزم الاشتراك في الكورس لمشاهدة هذا الدرس' },
          { status: 403 }
        );
      }
    }

    // 3. Generate Signed Playback URL from Video Provider
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || '';
    const playbackData = await videoService
      .getProvider()
      .generateSignedPlaybackUrl(targetVideoId || 'sample-video-id', clientIp);

    const watermarkText = user
      ? `${user.user_metadata?.full_name || 'الطالب'} (${user.email || ''})`
      : 'معاينة مجانية';

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
