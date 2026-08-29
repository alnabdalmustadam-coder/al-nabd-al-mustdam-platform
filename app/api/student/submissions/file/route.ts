import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/security/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { parseStudentFileReference } from '@/lib/security/student-access';

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const email = auth.user.email?.trim().toLowerCase();
  const fileRef = new URL(request.url).searchParams.get('ref') || '';
  const parsed = parseStudentFileReference(fileRef);
  if (!email || !parsed || !parsed.path.startsWith(`${auth.user.id}/`)) {
    return NextResponse.json({ success: false, message: 'مرجع الملف غير صالح' }, { status: 400 });
  }

  try {
    const admin = getSupabaseAdmin();
    const checks = await Promise.all([
      admin.from('assignment_submissions').select('id').eq('file_url', fileRef).eq('user_id', auth.user.id).limit(1).maybeSingle(),
      admin.from('assignment_submissions').select('id').eq('file_url', fileRef).eq('email', email).limit(1).maybeSingle(),
      admin.from('projects').select('id').eq('file_url', fileRef).eq('user_id', auth.user.id).limit(1).maybeSingle(),
      admin.from('projects').select('id').eq('file_url', fileRef).eq('email', email).limit(1).maybeSingle(),
    ]);

    if (checks.some((check) => check.error)) {
      throw checks.find((check) => check.error)?.error;
    }
    if (!checks.some((check) => check.data)) {
      return NextResponse.json({ success: false, message: 'ليس لديك صلاحية الوصول إلى هذا الملف' }, { status: 403 });
    }

    const { data, error } = await admin.storage
      .from(parsed.bucket)
      .createSignedUrl(parsed.path, 60, { download: true });
    if (error || !data?.signedUrl) throw error || new Error('Signed URL was not generated');

    return NextResponse.redirect(data.signedUrl, { status: 307 });
  } catch (error) {
    console.error('Secure student file download error:', error);
    return NextResponse.json({ success: false, message: 'تعذر تنزيل الملف' }, { status: 500 });
  }
}
