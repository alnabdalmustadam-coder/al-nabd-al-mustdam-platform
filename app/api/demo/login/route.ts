import { type NextRequest, NextResponse } from 'next/server';
import { authenticateDemoAccount } from '@/lib/demo/credentials';
import { issueDemoSession } from '@/lib/demo/session';
import { DEMO_COOKIE, demoUser } from '@/lib/demo/fixtures';
import { getDashboardUrlForRole } from '@/lib/security/roles';

export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'private, no-store' };

function validOrigin(request: NextRequest): boolean {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  const origin = request.headers.get('origin');
  if (!origin || origin === 'null') return false;
  try {
    return new URL(origin).origin === request.nextUrl.origin ||
      new URL(origin).host === request.headers.get('x-forwarded-host');
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!validOrigin(request)) {
    return NextResponse.json({ success: false, message: 'طلب غير مسموح به.' }, { status: 403, headers });
  }

  const payload = await request.json().catch(() => null);
  const email = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const password = typeof payload?.password === 'string' ? payload.password : '';
  if (!email || !password || email.length > 254 || password.length > 128) {
    return NextResponse.json({ success: false, message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' }, { status: 400, headers });
  }

  const role = authenticateDemoAccount(email, password);
  if (!role) {
    return NextResponse.json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' }, { status: 401, headers });
  }

  const user = demoUser(role);
  const dashboard = getDashboardUrlForRole(user?.app_metadata.role);
  const response = NextResponse.json({ success: true, dashboard, role }, { headers });
  response.cookies.set(DEMO_COOKIE, issueDemoSession(role), {
    httpOnly: true, secure: request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https',
    sameSite: 'lax', path: '/', maxAge: 8 * 60 * 60,
  });
  return response;
}
