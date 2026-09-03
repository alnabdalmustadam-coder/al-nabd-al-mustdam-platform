import { NextResponse } from 'next/server';
import {
  CertificatePersistenceError,
  getAllTemplates,
  getAllIssuedCertificates,
  saveTemplate,
  deleteTemplate,
} from '@/lib/certificates-store';
import { requireAdmin } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';

function certificateErrorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  return NextResponse.json(
    { success: false, error: message },
    { status: error instanceof CertificatePersistenceError ? 503 : 500 },
  );
}

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const [templates, issued] = await Promise.all([
      getAllTemplates(),
      getAllIssuedCertificates(),
    ]);

    return NextResponse.json({
      success: true,
      templates,
      issued,
    });
  } catch (err: unknown) {
    console.error('Admin GET certificates error:', err);
    return certificateErrorResponse(err, 'تعذر تحميل بيانات الشهادات');
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: 'اسم قالب الشهادة مطلوب' }, { status: 400 });
    }

    const saved = await saveTemplate(body, auth.user.id);
    return NextResponse.json({ success: true, template: saved });
  } catch (err: unknown) {
    console.error('Admin POST certificate template error:', err);
    return certificateErrorResponse(err, 'تعذر حفظ قالب الشهادة');
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'معرّف القالب مطلوب' }, { status: 400 });
    }

    const deleted = await deleteTemplate(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'لم يتم العثور على القالب' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Admin DELETE certificate template error:', err);
    return certificateErrorResponse(err, 'تعذر حذف قالب الشهادة');
  }
}
