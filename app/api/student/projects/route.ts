import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/security/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isStudentEnrolled, parseStudentFileReference } from '@/lib/security/student-access';

function safeUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const email = auth.user.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ success: false, message: 'الحساب لا يحتوي على بريد إلكتروني' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const courseId = typeof body.courseId === 'string' ? body.courseId.trim() : '';
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 180) : '';
    const description = typeof body.description === 'string' ? body.description.trim().slice(0, 8000) : '';
    const fileRef = typeof body.fileRef === 'string' ? body.fileRef.trim() : '';
    const parsedFile = fileRef ? parseStudentFileReference(fileRef) : null;
    const repositoryUrl = safeUrl(body.repositoryUrl);

    if (!courseId || !title || !description || (!parsedFile && !repositoryUrl)) {
      return NextResponse.json({ success: false, message: 'بيانات المشروع أو المرفق غير مكتملة' }, { status: 400 });
    }
    if (parsedFile && !parsedFile.path.startsWith(`${auth.user.id}/project/`)) {
      return NextResponse.json({ success: false, message: 'مرجع ملف المشروع غير صالح' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (!(await isStudentEnrolled(admin, auth.user.id, email, courseId))) {
      return NextResponse.json({ success: false, message: 'المشروع يجب أن يرتبط بدورة مسجلة لديك' }, { status: 403 });
    }

    const { error } = await admin.from('projects').insert({
      user_id: auth.user.id,
      email,
      course_id: courseId,
      title,
      description,
      file_url: parsedFile ? fileRef : null,
      repository_url: repositoryUrl,
      status: 'submitted',
    });
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'تم تسليم المشروع بنجاح' });
  } catch (error) {
    console.error('Secure project submission error:', error);
    return NextResponse.json({ success: false, message: 'تعذر حفظ المشروع' }, { status: 500 });
  }
}
