import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { BunnyStreamProvider } from '@/lib/video/providers/bunny-provider';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const provider = new BunnyStreamProvider();

    // Check if it's a FormData file upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const title = (formData.get('title') as string) || file?.name || 'درس تدريبي جديد';

      if (!file) {
        return NextResponse.json({ error: 'لم يتم إرفاق ملف فيديو' }, { status: 400 });
      }

      const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID || '729792';
      const apiKey = process.env.BUNNY_STREAM_API_KEY || '';

      if (!apiKey || !libraryId) {
        return NextResponse.json({ error: 'إعدادات Bunny Stream غير مكتملة' }, { status: 500 });
      }

      // 1. Create Video Object in Bunny Stream
      const createRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
        method: 'POST',
        headers: {
          AccessKey: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(errData.Message || 'فشل إنشاء سجل الفيديو في Bunny Stream');
      }

      const videoData = await createRes.json();
      const videoId = videoData.guid;

      // 2. Upload file buffer to Bunny Stream
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const uploadRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          AccessKey: apiKey,
          'Content-Type': 'application/octet-stream',
        },
        body: fileBuffer,
      });

      if (!uploadRes.ok) {
        throw new Error('فشل رفع ملف الفيديو إلى خوادم Bunny Stream');
      }

      // 3. Generate initial playback token
      const playback = await provider.generateSignedPlaybackUrl(videoId);

      return NextResponse.json({
        success: true,
        videoId,
        libraryId,
        title,
        iframeUrl: playback.iframeUrl,
        embedUrl: playback.embedUrl,
        message: 'تم رفع الفيديو ومعالجته بنجاح على Bunny Stream',
      });
    }

    // Otherwise JSON request to get upload signature
    const body = await req.json();
    const { title } = body;
    if (!title) {
      return NextResponse.json({ error: 'عنوان الفيديو مطلوب' }, { status: 400 });
    }

    const signature = await provider.generateUploadSignature(title);

    return NextResponse.json({
      success: true,
      videoId: signature.videoId,
      libraryId: signature.libraryId,
      uploadUrl: signature.uploadUrl,
      authorizationHeader: signature.authorizationHeader,
    });
  } catch (err: any) {
    console.error('Error in Bunny video upload:', err);
    return NextResponse.json({ error: err.message || 'فشل رفع الفيديو' }, { status: 500 });
  }
}

