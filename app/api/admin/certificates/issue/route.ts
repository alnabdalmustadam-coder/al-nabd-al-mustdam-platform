import { NextResponse } from 'next/server';
import {
  issueCertificate,
  toggleCertificateStatus,
  deleteIssuedCertificate,
} from '@/lib/certificates-store';
import { requireAdmin } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const body = await req.json();
    if (!body.studentName || !body.studentName.trim()) {
      return NextResponse.json({ success: false, error: 'اسم المتدرب مطلوب' }, { status: 400 });
    }
    if (!body.courseTitle || !body.courseTitle.trim()) {
      return NextResponse.json({ success: false, error: 'مسمى الدورة مطلوب' }, { status: 400 });
    }

    const issued = issueCertificate({
      studentName: body.studentName.trim(),
      courseTitle: body.courseTitle.trim(),
      studentEmail: body.studentEmail,
      templateId: body.templateId,
      grade: body.grade || 'ممتاز مرتفع (%99)',
      hours: body.hours || '30 ساعة',
      imageUrl: body.imageUrl,
      customData: body.customData,
    });

    return NextResponse.json({ success: true, certificate: issued });
  } catch (err: any) {
    console.error('Admin issue certificate error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'معرّف الشهادة مطلوب' }, { status: 400 });
    }

    const toggled = toggleCertificateStatus(body.id);
    if (!toggled) {
      return NextResponse.json({ success: false, error: 'لم يتم العثور على الشهادة' }, { status: 404 });
    }

    return NextResponse.json({ success: true, certificate: toggled });
  } catch (err: any) {
    console.error('Admin toggle certificate status error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'معرّف الشهادة مطلوب' }, { status: 400 });
    }

    const deleted = deleteIssuedCertificate(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'لم يتم العثور على الشهادة' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin delete issued certificate error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
