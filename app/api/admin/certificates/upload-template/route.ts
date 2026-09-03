import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/security/auth';
import { IMAGE_UPLOAD_POLICY, validateUpload } from '@/lib/security/uploads';
import { optimizeToWebp } from '@/lib/media/image-processor';
import { removeReplacedPublicImage, uploadPublicWebp } from '@/lib/media/public-image-storage';

export const runtime = 'nodejs';

const CERTIFICATE_TEMPLATES_BUCKET = 'certificate-templates';

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const templateId = (formData.get('templateId') || 'standard') as string;
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

    // Convert and compress strictly to WebP.
    let optimizedWebpBuffer: Buffer;
    try {
      const opt = await optimizeToWebp(rawBuffer, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 85,
        fit: 'inside',
      });
      optimizedWebpBuffer = opt.buffer;
    } catch (procErr) {
      console.error('Certificate WebP conversion failed:', procErr);
      return NextResponse.json(
        { success: false, error: 'تعذر معالجة صورة الشهادة وتحويلها إلى WebP' },
        { status: 422 },
      );
    }

    const cleanId = String(templateId).replace(/[^a-z0-9_-]/gi, '_').slice(0, 40);
    const fileName = cleanId && cleanId !== 'standard'
      ? `cert_tpl_${cleanId}.webp`
      : `cert_tpl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.webp`;
    const uploaded = await uploadPublicWebp({
      bucketName: CERTIFICATE_TEMPLATES_BUCKET,
      objectPath: `templates/${fileName}`,
      buffer: optimizedWebpBuffer,
    });

    await removeReplacedPublicImage(
      CERTIFICATE_TEMPLATES_BUCKET,
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
    console.error('Certificate template image upload error:', err);
    const message = err instanceof Error ? err.message : 'تعذر رفع القالب';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
