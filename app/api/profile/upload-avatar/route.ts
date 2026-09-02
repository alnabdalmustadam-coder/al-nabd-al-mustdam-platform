import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';
import fs from 'fs';
import path from 'path';
import { IMAGE_UPLOAD_POLICY, validateUpload } from '@/lib/security/uploads';
import { optimizeAvatarToWebp } from '@/lib/media/image-processor';

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

    const rawBytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(rawBytes);

    // 1. Enforce WebP conversion and high-efficiency compression (~25-50KB)
    let optimizedWebpBuffer: Buffer;
    try {
      optimizedWebpBuffer = await optimizeAvatarToWebp(rawBuffer);
    } catch (procErr) {
      console.error('WebP conversion failed, falling back to raw buffer:', procErr);
      optimizedWebpBuffer = rawBuffer;
    }

    // 2. Deterministic single avatar filename per user - ZERO storage accumulation
    const fileName = `avatar_${user.id}.webp`;
    let finalPublicUrl = '';

    // 3. Try Supabase Storage 'avatars' bucket with upsert: true (replaces old file in-place)
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, optimizedWebpBuffer, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          finalPublicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
        }

        // Clean up any legacy non-webp avatar files for this user in Supabase bucket
        try {
          await supabase.storage.from('avatars').remove([
            `avatar_${user.id}.jpg`,
            `avatar_${user.id}.jpeg`,
            `avatar_${user.id}.png`,
          ]);
        } catch {}
      }
    } catch (supaErr) {
      console.warn('Supabase avatars bucket upload fallback:', supaErr);
    }

    // 4. Local fallback if Supabase storage bucket is not configured (or development)
    if (!finalPublicUrl) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Clean up any legacy or duplicate files for this user
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
      fs.writeFileSync(filePath, optimizedWebpBuffer);
      finalPublicUrl = `/uploads/avatars/${fileName}?t=${Date.now()}`;
    }

    // 5. Update profiles table
    await supabaseServer
      .from('profiles')
      .update({
        avatar_url: finalPublicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // 6. Update auth user metadata
    await supabaseServer.auth.updateUser({
      data: { avatar_url: finalPublicUrl },
    });

    return NextResponse.json({
      success: true,
      avatarUrl: finalPublicUrl,
      format: 'webp',
    });
  } catch (err: any) {
    console.error('Avatar upload route error:', err);
    return NextResponse.json({ success: false, error: err.message || 'حدث خطأ أثناء حفظ الصورة' }, { status: 500 });
  }
}
