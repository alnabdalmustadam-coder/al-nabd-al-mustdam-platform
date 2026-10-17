import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { BunnyStreamProvider } from '@/lib/video/providers/bunny-provider';
import { requireUser, isAdminRole, isInstructorRole } from '@/lib/security/auth';
import { requireCourseLearner, LearningError } from '@/lib/learning/course-access';
import { getCourseBySlugAsync } from '@/lib/courses-store';
import { getCourseContent, extractBunnyVideoId } from '@/lib/learning/course-content';
import { assertCpdLessonAccess, lessonContentKey } from '@/lib/learning/cpd';
import { readJsonObject, ValidationError } from '@/lib/security/validation';

export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;
    const body = await readJsonObject(req);
    const videoId = typeof body.videoId === 'string' ? body.videoId.toLowerCase() : '';
    const courseSlug = typeof body.courseSlug === 'string' ? body.courseSlug : '';
    const lessonId = typeof body.lessonId === 'string' ? body.lessonId : '';
    if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(videoId)) throw new LearningError('معرف الفيديو غير صالح', 400);
    const manager = isAdminRole(auth.role) || isInstructorRole(auth.role);
    const ctx = manager ? null : await requireCourseLearner(req, courseSlug);
    if (ctx && 'rejected' in ctx) return ctx.rejected;
    const course = ctx?.course || (courseSlug ? await getCourseBySlugAsync(courseSlug, { includeUnpublished: manager }) : null);
    const lesson = course ? getCourseContent(course).find((item) => item.id === lessonId) : null;
    if (!manager && (!lesson || extractBunnyVideoId(lesson.videoUrl) !== videoId)) throw new LearningError('الفيديو لا ينتمي إلى هذا الدرس', 403);
    if (ctx && course?.professionalDevelopment) await assertCpdLessonAccess(ctx.admin, course, auth.user.id, lessonId);
    const provider = new BunnyStreamProvider();
    const playbackData = await provider.generateSignedPlaybackUrl(videoId);
    let cpdSession = null;
    if (ctx && course?.professionalDevelopment && lesson) {
      const details = await provider.getVideoDetails(videoId);
      if (!(details.durationSeconds > 0) || details.status !== 'ready') throw new LearningError('مدة الفيديو غير متاحة حالياً. انتظر اكتمال تجهيز الفيديو ثم أعد المحاولة');
      const { data, error } = await ctx.admin.rpc('start_cpd_video_session', {
        p_user_id: auth.user.id, p_course_id: course.id, p_lesson_id: lesson.id,
        p_content_key: lessonContentKey(lesson), p_duration: details.durationSeconds, p_session_id: randomUUID(),
      });
      if (error) throw error;
      cpdSession = data;
      const url = new URL(playbackData.iframeUrl);
      url.searchParams.set('autoplay', 'false');
      url.searchParams.set('rememberPosition', 'false');
      url.searchParams.set('rememberSettings', 'false');
      url.searchParams.set('showSpeed', 'false');
      url.searchParams.set('disableAirPlay', 'true');
      url.searchParams.set('chromecast', 'false');
      playbackData.iframeUrl = url.toString();
    }
    const { data: profile } = await auth.supabase.from('profiles').select('full_name, national_id').eq('id', auth.user.id).maybeSingle();
    const name = profile?.full_name || auth.user.user_metadata?.full_name || 'متدرب معتمد';
    const userWatermark = `${name} ${profile?.national_id ? `| هوية: ${profile.national_id}` : ''}`;
    return NextResponse.json({ success: true, iframeUrl: playbackData.iframeUrl, expiresAt: playbackData.expiresAt, cpdSession, userWatermark },
      { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof LearningError || error instanceof ValidationError) return NextResponse.json({ success: false, error: error.message },
      { status: error instanceof LearningError ? error.status : 400 });
    console.error('Error generating playback token:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء إعداد مشغل الفيديو' }, { status: 503 });
  }
}
