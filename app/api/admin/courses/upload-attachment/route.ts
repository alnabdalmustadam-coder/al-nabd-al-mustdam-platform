import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { requireInstructorOrAdmin } from '@/lib/security/auth';
import { ATTACHMENT_UPLOAD_POLICY, getSafeExtension, validateUpload } from '@/lib/security/uploads';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const SUPABASE_BUCKET = 'platform-data';
function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function POST(req: Request) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const customTitle = formData.get('title') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم اختيار ملف' }, { status: 400 });
    }
    const validationError = validateUpload(file, ATTACHMENT_UPLOAD_POLICY);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalName = file.name || 'document.pdf';
    const ext = getSafeExtension(originalName);
    const cleanBaseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_');
    const storagePath = `attachments/${Date.now()}_${cleanBaseName}.${ext}`;
    const formattedSize = formatBytes(file.size);

    let fileType: 'pdf' | 'doc' | 'word' | 'ppt' | 'zip' | 'other' = 'other';
    if (ext === 'pdf') fileType = 'pdf';
    else if (['doc', 'docx'].includes(ext)) fileType = 'word';
    else if (['ppt', 'pptx'].includes(ext)) fileType = 'ppt';
    else if (['zip', 'rar', '7z'].includes(ext)) fileType = 'zip';

    // 1. Upload to Supabase Storage Bucket
    try {
      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(SUPABASE_BUCKET)
          .getPublicUrl(storagePath);

        if (publicUrlData?.publicUrl) {
          return NextResponse.json({
            success: true,
            fileUrl: publicUrlData.publicUrl,
            fileName: customTitle || originalName,
            fileSize: formattedSize,
            fileType,
            source: 'supabase',
          });
        }
      } else if (error) {
        console.warn('Supabase storage upload error, using local fallback:', error);
      }
    } catch (supaErr) {
      console.warn('Supabase client upload exception:', supaErr);
    }

    // 2. Local fallback is limited to development. Production must use managed storage.
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'تعذر حفظ الملف في التخزين الآمن' }, { status: 500 });
    }

    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'attachments');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const localFileName = `${Date.now()}_${cleanBaseName}.${ext}`;
      const filePath = path.join(uploadsDir, localFileName);
      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        success: true,
        fileUrl: `/uploads/attachments/${localFileName}`,
        fileName: customTitle || originalName,
        fileSize: formattedSize,
        fileType,
        source: 'local',
      });
    } catch (localErr) {
      console.error('Local fallback write failed:', localErr);
    }

    return NextResponse.json({
      success: false,
      error: 'تعذر حفظ الملف المرفق في السيرفر',
    }, { status: 500 });
  } catch (err: any) {
    console.error('Attachment upload error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
