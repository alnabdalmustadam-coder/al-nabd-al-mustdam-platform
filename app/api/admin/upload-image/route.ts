import { NextResponse } from 'next/server';
import { requireInstructorOrAdmin } from '@/lib/security/auth';
import { IMAGE_UPLOAD_POLICY, validateUpload } from '@/lib/security/uploads';
import { optimizeToWebp } from '@/lib/media/image-processor';
import { removeReplacedPublicImage, uploadPublicWebp } from '@/lib/media/public-image-storage';

export const runtime = 'nodejs';

/**
 * Universal WebP Image Upload Route for Admin & Instructors
 * Enforces WebP conversion, sharp compression, deterministic naming, and zero accumulation.
 */
export async function POST(req: Request) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';
    const slug = (formData.get('slug') || formData.get('entityId') || '') as string;
    const existingImageUrl = (formData.get('existingImageUrl') || '') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم اختيار ملف صورة' }, { status: 400 });
    }

    const validationError = validateUpload(file, IMAGE_UPLOAD_POLICY);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const rawBytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(rawBytes);

    // 1. Compress & Convert to WebP via Sharp
    let optimizedWebpBuffer: Buffer;
    try {
      const opt = await optimizeToWebp(rawBuffer, {
        maxWidth: 1400,
        maxHeight: 1000,
        quality: 82,
        fit: 'inside',
      });
      optimizedWebpBuffer = opt.buffer;
    } catch (procErr) {
      console.error('WebP conversion failed in upload-image:', procErr);
      return NextResponse.json(
        { success: false, error: 'تعذر معالجة الصورة وتحويلها إلى WebP' },
        { status: 422 },
      );
    }

    // 2. Deterministic naming to guarantee in-place updates and prevent storage accumulation
    const cleanFolder = folder.replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 'general';
    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06ff_-]/gu, '_')
      .slice(0, 50);

    const fileName = cleanSlug
      ? `${cleanFolder}_${cleanSlug}.webp`
      : `${cleanFolder}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.webp`;

    const bucketName = 'course-thumbnails'; // Reusable public bucket

    // 3. Persist directly in Supabase. Runtime writes under public/ do not survive on Vercel.
    const uploaded = await uploadPublicWebp({
      bucketName,
      objectPath: `${cleanFolder}/${fileName}`,
      buffer: optimizedWebpBuffer,
    });

    await removeReplacedPublicImage(bucketName, existingImageUrl, uploaded.objectPath);

    const finalPublicUrl = `${uploaded.publicUrl}?t=${Date.now()}`;

    return NextResponse.json({
      success: true,
      imageUrl: finalPublicUrl,
      format: 'webp',
    });
  } catch (err: unknown) {
    console.error('Universal upload-image error:', err);
    const message = err instanceof Error ? err.message : 'تعذر رفع الصورة';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
