import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isAdminRole, isInstructorRole, normalizeRole, getDashboardUrlForRole } from '@/lib/security/auth';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const requestedNext = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      let roleSource: unknown = data.user.app_metadata?.role;
      if (!roleSource || normalizeRole(roleSource) === 'STUDENT') {
        if (data.user.user_metadata?.role && normalizeRole(data.user.user_metadata.role) !== 'STUDENT') {
          roleSource = data.user.user_metadata.role;
        } else {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();
          if (profile?.role) {
            roleSource = profile.role;
          }
        }
      }

      const userRole = normalizeRole(roleSource);
      const defaultRoleDashboard = getDashboardUrlForRole(userRole);

      let targetDestination = defaultRoleDashboard;

      if (requestedNext && requestedNext.startsWith('/') && !requestedNext.startsWith('//')) {
        const isAuthorizedForRequested =
          (isAdminRole(userRole) && requestedNext.startsWith('/dashboard/admin')) ||
          (isInstructorRole(userRole) && requestedNext.startsWith('/dashboard/instructor')) ||
          (!isAdminRole(userRole) && !isInstructorRole(userRole) && requestedNext.startsWith('/dashboard/student')) ||
          (!requestedNext.startsWith('/dashboard'));

        if (isAuthorizedForRequested) {
          targetDestination = requestedNext;
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${targetDestination}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${targetDestination}`);
      } else {
        return NextResponse.redirect(`${origin}${targetDestination}`);
      }
    }
  }

  // Return the user to login with an error message
  return NextResponse.redirect(`${origin}/auth/login?error=الرمز غير صالح أو انتهت صلاحيته`);
}
