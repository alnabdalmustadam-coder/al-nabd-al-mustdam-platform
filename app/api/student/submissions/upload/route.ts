import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/security/auth';
import { ATTACHMENT_UPLOAD_POLICY, getSafeExtension, validateUpload } from '@/lib/security/uploads';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  isStudentEnrolled,
  STUDENT_SUBMISSIONS_BUCKET,
} from '@/lib/security/student-access';

export const dynamic = 'force-dynamic';

function safeSegment(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120);
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const email = auth.user.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ success: false, message: 'الحساب لا يحتوي على بريد إلكتروني' }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const kind = formData.get('kind');
    const resourceId = safeSegment(String(formData.get('resourceId') || 'draft'));
    const courseId = String(formData.get('courseId') || '').trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: 'يرجى اختيار ملف صالح' }, { status: 400 });
    }
    if (kind !== 'assignment' && kind !== 'project') {
      return NextResponse.json({ success: false, message: 'نوع التسليم غير صالح' }, { status: 400 });
    }

    const validationError = validateUpload(file, ATTACHMENT_UPLOAD_POLICY);
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (kind === 'assignment') {
      const { data: assignment, error } = await admin
        .from('assignments')
        .select('id, course_id, is_active')
        .eq('id', resourceId)
        .maybeSingle();

      if (error) throw error;
      if (!assignment?.is_active) {
        return NextResponse.json({ success: false, message: 'الواجب غير متاح للتسليم' }, { status: 404 });
      }
      if (!(await isStudentEnrolled(admin, auth.user.id, email, assignment.course_id))) {
        return NextResponse.json({ success: false, message: 'هذا الواجب لا يتبع دورة مسجلة لديك' }, { status: 403 });
      }
    } else if (!(await isStudentEnrolled(admin, auth.user.id, email, courseId))) {
      return NextResponse.json({ success: false, message: 'المشروع يجب أن يرتبط بدورة مسجلة لديك' }, { status: 403 });
    }

    const extension = getSafeExtension(file.name);
    const storagePath = `${auth.user.id}/${kind}/${resourceId}/${crypto.randomUUID()}.${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(STUDENT_SUBMISSIONS_BUCKET)
      .upload(storagePath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Student submission upload error:', uploadError);
      return NextResponse.json(
        { success: false, message: 'تعذر حفظ الملف في التخزين الآمن. تأكد من إنشاء حاوية student-submissions الخاصة.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      fileRef: `storage://${STUDENT_SUBMISSIONS_BUCKET}/${storagePath}`,
      fileName: file.name,
    });
  } catch (error) {
    console.error('Student upload route error:', error);
    return NextResponse.json({ success: false, message: 'تعذر رفع الملف حالياً' }, { status: 500 });
  }
}
