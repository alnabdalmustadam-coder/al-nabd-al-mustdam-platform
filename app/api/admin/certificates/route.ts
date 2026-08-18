import { NextResponse } from 'next/server';
import {
  getAllTemplates,
  getAllIssuedCertificates,
  saveTemplate,
  deleteTemplate,
} from '@/lib/certificates-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const templates = getAllTemplates();
    const issued = getAllIssuedCertificates();

    return NextResponse.json({
      success: true,
      templates,
      issued,
    });
  } catch (err: any) {
    console.error('Admin GET certificates error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: 'اسم قالب الشهادة مطلوب' }, { status: 400 });
    }

    const saved = saveTemplate(body);
    return NextResponse.json({ success: true, template: saved });
  } catch (err: any) {
    console.error('Admin POST certificate template error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'معرّف القالب مطلوب' }, { status: 400 });
    }

    const deleted = deleteTemplate(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'لم يتم العثور على القالب' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin DELETE certificate template error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
