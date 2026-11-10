import { type NextRequest, NextResponse } from 'next/server';
import { DEMO_COOKIE, demoUser } from '@/lib/demo/fixtures';
import { readDemoSessionRole } from '@/lib/demo/session';

const noStore = { 'Cache-Control': 'private, no-store' };

export function GET(request: NextRequest) {
  const role = readDemoSessionRole(request.cookies.get(DEMO_COOKIE)?.value);
  return NextResponse.json({ user: demoUser(role) }, { headers: noStore });
}

/** Legacy one-click role switching is disabled: use credentials instead. */
export function POST() {
  return NextResponse.json(
    { success: false, message: 'سجّل الدخول بالبريد الإلكتروني وكلمة المرور.' },
    { status: 403, headers: noStore },
  );
}

export function DELETE(request: NextRequest) {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite === 'cross-site') {
    return NextResponse.json({ success: false }, { status: 403, headers: noStore });
  }
  const origin = request.headers.get('origin');
  if (origin && origin !== 'null' && new URL(origin).host !== request.headers.get('host')) {
    return NextResponse.json({ success: false }, { status: 403, headers: noStore });
  }
  const response = NextResponse.json({ success: true }, { headers: noStore });
  response.cookies.delete(DEMO_COOKIE);
  return response;
}
