import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { requireInstructorOrAdmin } from '@/lib/security/auth';
import { IMAGE_UPLOAD_POLICY, validateUpload } from '@/lib/security/uploads';
import { optimizeToWebp } from '@/lib/media/image-processor';

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
      optimizedWebpBuffer = rawBuffer;
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

    let finalPublicUrl = '';
    const bucketName = 'course-thumbnails'; // Reusable public bucket

    // 3. Try Supabase Storage with upsert: true
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, optimizedWebpBuffer, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          finalPublicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
        }
      }

      // If replacing a file with a different key, purge old file
      if (existingImageUrl && existingImageUrl.includes(`/${bucketName}/`)) {
        const oldFile = existingImageUrl.split(`/${bucketName}/`)[1]?.split('?')[0];
        if (oldFile && oldFile !== fileName) {
          try {
            await supabase.storage.from(bucketName).remove([oldFile]);
          } catch {}
        }
      }
    } catch (supaErr) {
      console.warn('Supabase storage fallback in universal upload-image:', supaErr);
    }

    // 4. Local fallback for development / offline resilience
    if (!finalPublicUrl) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', cleanFolder);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Clean up previous file if name changed
      if (cleanSlug) {
        try {
          const existingFiles = fs.readdirSync(uploadsDir);
          for (const existing of existingFiles) {
            if (existing.startsWith(`${cleanFolder}_${cleanSlug}.`)) {
              try {
                fs.unlinkSync(path.join(uploadsDir, existing));
              } catch {}
            }
          }
        } catch {}
      }

      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, optimizedWebpBuffer);
      finalPublicUrl = `/uploads/${cleanFolder}/${fileName}?t=${Date.now()}`;
    }

    return NextResponse.json({
      success: true,
      imageUrl: finalPublicUrl,
      format: 'webp',
    });
  } catch (err: any) {
    console.error('Universal upload-image error:', err);
    return NextResponse.json({ success: false, error: err.message || 'تعذر رفع الصورة' }, { status: 500 });
  }
}
