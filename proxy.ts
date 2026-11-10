import { type NextRequest, NextResponse } from 'next/server';
import { DEMO_COOKIE, DEMO_READ_ONLY, demoUser } from '@/lib/demo/fixtures';
import { readDemoSessionRole } from '@/lib/demo/session';
import { getDashboardUrlForRole } from '@/lib/security/roles';

const integrationRoute = /^\/api\/(?:ghl|nelc|webhooks|xapi|videos)(?:\/|$)/;
const demoAuthRoutes = new Set(['/api/auth/me', '/api/auth/get-profile', '/api/auth/logout']);
const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
const blocked = () => NextResponse.json({ success: false, error: DEMO_READ_ONLY, message: DEMO_READ_ONLY },
  { status: 403, headers: { 'Cache-Control': 'private, no-store' } });

function redirect(request: NextRequest, path: string) {
  const target = new URL(path, request.url);
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (host) target.host = host;
  if (request.headers.get('x-forwarded-proto') === 'https') target.protocol = 'https:';
  return NextResponse.redirect(target, { headers: { 'Cache-Control': 'private, no-store' } });
}

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === '/login' || path === '/auth') {
    return redirect(request, '/auth/login');
  }
  if (path.startsWith('/auth/') && path !== '/auth/login') {
    return redirect(request, '/auth/login');
  }
  if (integrationRoute.test(path) || (path.startsWith('/api/auth/') && !demoAuthRoutes.has(path))) return blocked();
  if (!safeMethods.has(request.method) && !['/api/demo/login', '/api/demo/role', '/api/auth/logout'].includes(path)) return blocked();

  if (path === '/dashboard' || path.startsWith('/dashboard/')) {
    const role = readDemoSessionRole(request.cookies.get(DEMO_COOKIE)?.value);
    const user = demoUser(role);
    if (!user) return redirect(request, '/auth/login');
    const home = getDashboardUrlForRole(user.app_metadata.role);
    if (path !== home && !path.startsWith(home + '/')) return redirect(request, home);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
