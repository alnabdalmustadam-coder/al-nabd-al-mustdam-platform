import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم اختيار ملف صورة' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'png';
    const fileName = `cert_tpl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // 1. Try Supabase Storage first
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { data, error } = await supabase.storage
          .from('certificate-templates')
          .upload(fileName, buffer, {
            contentType: file.type || 'image/png',
            upsert: true,
          });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from('certificate-templates')
            .getPublicUrl(fileName);

          if (publicUrlData?.publicUrl) {
            return NextResponse.json({
              success: true,
              imageUrl: publicUrlData.publicUrl,
              source: 'supabase',
            });
          }
        }
      }
    } catch (supaErr) {
      console.warn('Supabase storage upload fallback for certificates:', supaErr);
    }

    // 2. Local public/uploads fallback
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/certificates/${fileName}`;
    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      source: 'local',
    });
  } catch (err: any) {
    console.error('Certificate template image upload error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
