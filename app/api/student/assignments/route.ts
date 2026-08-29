import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/security/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isStudentEnrolled, parseStudentFileReference } from '@/lib/security/student-access';

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const email = auth.user.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ success: false, message: 'الحساب لا يحتوي على بريد إلكتروني' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const assignmentId = typeof body.assignmentId === 'string' ? body.assignmentId.trim() : '';
    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 4000) : '';
    const fileRef = typeof body.fileRef === 'string' ? body.fileRef.trim() : '';
    const parsedFile = fileRef ? parseStudentFileReference(fileRef) : null;

    if (!assignmentId || (!notes && !parsedFile)) {
      return NextResponse.json({ success: false, message: 'الواجب أو محتوى التسليم غير مكتمل' }, { status: 400 });
    }
    if (parsedFile && !parsedFile.path.startsWith(`${auth.user.id}/assignment/${assignmentId}/`)) {
      return NextResponse.json({ success: false, message: 'مرجع الملف غير صالح لهذا الواجب' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: assignment, error: assignmentError } = await admin
      .from('assignments')
      .select('id, course_id, due_date, allow_late_submission, is_active')
      .eq('id', assignmentId)
      .maybeSingle();

    if (assignmentError) throw assignmentError;
    if (!assignment?.is_active) {
      return NextResponse.json({ success: false, message: 'الواجب غير متاح للتسليم' }, { status: 404 });
    }
    if (!(await isStudentEnrolled(admin, auth.user.id, email, assignment.course_id))) {
      return NextResponse.json({ success: false, message: 'هذا الواجب لا يتبع دورة مسجلة لديك' }, { status: 403 });
    }
    if (assignment.due_date && !assignment.allow_late_submission && Date.parse(assignment.due_date) < Date.now()) {
      return NextResponse.json({ success: false, message: 'انتهى موعد التسليم لهذا الواجب' }, { status: 409 });
    }

    const [byUser, byEmail] = await Promise.all([
      admin.from('assignment_submissions').select('id, grade').eq('assignment_id', assignmentId).eq('user_id', auth.user.id).limit(1).maybeSingle(),
      admin.from('assignment_submissions').select('id, grade').eq('assignment_id', assignmentId).eq('email', email).limit(1).maybeSingle(),
    ]);
    if (byUser.error || byEmail.error) throw byUser.error || byEmail.error;
    const existing = byUser.data || byEmail.data;

    if (existing?.grade !== null && existing?.grade !== undefined) {
      return NextResponse.json({ success: false, message: 'لا يمكن تعديل واجب تم تقييمه' }, { status: 409 });
    }

    const values = {
      user_id: auth.user.id,
      email,
      file_url: parsedFile ? fileRef : null,
      notes: notes || null,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    };
    const result = existing
      ? await admin.from('assignment_submissions').update(values).eq('id', existing.id)
      : await admin.from('assignment_submissions').insert({ assignment_id: assignmentId, ...values });

    if (result.error) throw result.error;
    return NextResponse.json({ success: true, message: 'تم تسليم الواجب بنجاح' });
  } catch (error) {
    console.error('Secure assignment submission error:', error);
    return NextResponse.json({ success: false, message: 'تعذر حفظ تسليم الواجب' }, { status: 500 });
  }
}
