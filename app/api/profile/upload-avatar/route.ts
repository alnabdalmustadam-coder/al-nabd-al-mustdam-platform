import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';
import fs from 'fs';
import path from 'path';
import { IMAGE_UPLOAD_POLICY, validateUpload } from '@/lib/security/uploads';

export async function POST(req: Request) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'غير مصرح بالوصول' }, { status: 401 });
    }

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
    
    // Determine the real extension from the uploaded file's MIME type
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const actualType = file.type || 'image/jpeg';
    const ext = mimeToExt[actualType] || 'jpg';

    // Deterministic unique avatar key per user to prevent accumulation
    const fileName = `avatar_${user.id}.${ext}`;

    let finalPublicUrl = '';

    // 1. Try Supabase Storage 'avatars' bucket with upsert: true (replaces old file in-place)
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, buffer, {
          contentType: actualType,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          finalPublicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
        }
      }
    } catch (supaErr) {
      console.warn('Supabase avatars bucket upload fallback:', supaErr);
    }

    // 2. Local fallback if Supabase storage is not configured (or development)
    if (!finalPublicUrl) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Clean up any old files starting with avatar_${user.id}
      try {
        const existingFiles = fs.readdirSync(uploadsDir);
        for (const existing of existingFiles) {
          if (existing.startsWith(`avatar_${user.id}`)) {
            try {
              fs.unlinkSync(path.join(uploadsDir, existing));
            } catch {}
          }
        }
      } catch (cleanErr) {
        console.warn('Old avatar cleanup notice:', cleanErr);
      }

      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, buffer);
      finalPublicUrl = `/uploads/avatars/${fileName}?t=${Date.now()}`;
    }

    // 3. Update profiles table
    await supabaseServer
      .from('profiles')
      .update({
        avatar_url: finalPublicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // 4. Update auth user metadata
    await supabaseServer.auth.updateUser({
      data: { avatar_url: finalPublicUrl },
    });

    return NextResponse.json({
      success: true,
      avatarUrl: finalPublicUrl,
    });
  } catch (err: any) {
    console.error('Avatar upload route error:', err);
    return NextResponse.json({ success: false, error: err.message || 'حدث خطأ أثناء حفظ الصورة' }, { status: 500 });
  }
}
