import { NextResponse } from 'next/server';
import { requireInstructorOrAdmin } from '@/lib/security/auth';
import { IMAGE_UPLOAD_POLICY, validateUpload } from '@/lib/security/uploads';
import { optimizeToWebp } from '@/lib/media/image-processor';
import { removeReplacedPublicImage, uploadPublicWebp } from '@/lib/media/public-image-storage';

export const runtime = 'nodejs';

const COURSE_IMAGES_BUCKET = 'course-thumbnails';

export async function POST(req: Request) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const courseSlug = (formData.get('courseSlug') || formData.get('slug') || '') as string;
    const existingImageUrl = (formData.get('existingImageUrl') || formData.get('existingUrl') || '') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم اختيار ملف صورة' }, { status: 400 });
    }
    const validationError = validateUpload(file, IMAGE_UPLOAD_POLICY);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const rawBytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(rawBytes);

    // 1. Convert and compress strictly to WebP (~50-120KB for high-res banners)
    let optimizedWebpBuffer: Buffer;
    try {
      const opt = await optimizeToWebp(rawBuffer, {
        maxWidth: 1280,
        maxHeight: 720,
        quality: 82,
        fit: 'inside',
      });
      optimizedWebpBuffer = opt.buffer;
    } catch (procErr) {
      console.error('Course image WebP conversion failed:', procErr);
      return NextResponse.json(
        { success: false, error: 'تعذر معالجة الصورة وتحويلها إلى WebP' },
        { status: 422 },
      );
    }

    // 2. Deterministic naming based on course slug if available to prevent storage accumulation
    const cleanSlug = courseSlug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06ff_-]/gu, '_')
      .slice(0, 60);

    const fileName = cleanSlug
      ? `course_${cleanSlug}.webp`
      : `course_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.webp`;

    // 3. Persist directly in Supabase. Vercel's deployment filesystem is not writable storage.
    const uploaded = await uploadPublicWebp({
      bucketName: COURSE_IMAGES_BUCKET,
      objectPath: `courses/${fileName}`,
      buffer: optimizedWebpBuffer,
    });

    await removeReplacedPublicImage(
      COURSE_IMAGES_BUCKET,
      existingImageUrl,
      uploaded.objectPath,
    );

    const finalPublicUrl = `${uploaded.publicUrl}?t=${Date.now()}`;

    return NextResponse.json({
      success: true,
      imageUrl: finalPublicUrl,
      format: 'webp',
    });
  } catch (err: unknown) {
    console.error('Course image upload error:', err);
    const message = err instanceof Error ? err.message : 'تعذر رفع الصورة';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
