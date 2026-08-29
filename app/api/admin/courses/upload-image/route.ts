import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { requireInstructorOrAdmin } from '@/lib/security/auth';
import { IMAGE_UPLOAD_POLICY, getSafeExtension, validateUpload } from '@/lib/security/uploads';

export async function POST(req: Request) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم اختيار ملف صورة' }, { status: 400 });
    }
    const validationError = validateUpload(file, IMAGE_UPLOAD_POLICY);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = getSafeExtension(file.name);
    const fileName = `course_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // 1. Try Supabase Storage first
    try {
      const { data, error } = await supabase.storage
        .from('course-thumbnails')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('course-thumbnails')
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          return NextResponse.json({
            success: true,
            imageUrl: publicUrlData.publicUrl,
            source: 'supabase',
          });
        }
      }
    } catch (supaErr) {
      console.warn('Supabase storage upload fallback:', supaErr);
    }

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'تعذر حفظ الصورة في التخزين الآمن' }, { status: 500 });
    }

    // Local fallback for development only.
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'courses');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/courses/${fileName}`;
    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      source: 'local',
    });
  } catch (err: any) {
    console.error('Image upload error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
