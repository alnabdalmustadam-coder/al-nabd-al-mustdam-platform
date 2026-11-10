import { NextResponse } from 'next/server';
import {
CertificatePersistenceError,
getAllTemplates,
getAllIssuedCertificates
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
