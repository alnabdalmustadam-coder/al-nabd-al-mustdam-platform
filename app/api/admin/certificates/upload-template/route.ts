import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/security/auth';
import { IMAGE_UPLOAD_POLICY, validateUpload } from '@/lib/security/uploads';
import { optimizeToWebp } from '@/lib/media/image-processor';

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const templateId = (formData.get('templateId') || 'standard') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم اختيار ملف صورة' }, { status: 400 });
    }
    const validationError = validateUpload(file, IMAGE_UPLOAD_POLICY);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const rawBytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(rawBytes);

    // 1. Convert and compress strictly to WebP
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
      console.error('Certificate WebP conversion failed, using raw buffer:', procErr);
      optimizedWebpBuffer = rawBuffer;
    }

    const cleanId = String(templateId).replace(/[^a-z0-9_-]/gi, '_').slice(0, 40);
    const fileName = `cert_tpl_${cleanId}.webp`;
    let finalPublicUrl = '';

    // 2. Try Supabase Storage with upsert: true (replaces existing template in place)
    try {
      const { data, error } = await supabase.storage
        .from('certificate-templates')
        .upload(fileName, optimizedWebpBuffer, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('certificate-templates')
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          finalPublicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
        }
      }
    } catch (supaErr) {
      console.warn('Supabase storage upload fallback for certificates:', supaErr);
    }

    // 3. Local fallback for development
    if (!finalPublicUrl) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, optimizedWebpBuffer);
      finalPublicUrl = `/uploads/certificates/${fileName}?t=${Date.now()}`;
    }

    return NextResponse.json({
      success: true,
      imageUrl: finalPublicUrl,
      format: 'webp',
    });
  } catch (err: any) {
    console.error('Certificate template image upload error:', err);
    return NextResponse.json({ success: false, error: err.message || 'تعذر رفع القالب' }, { status: 500 });
  }
}
