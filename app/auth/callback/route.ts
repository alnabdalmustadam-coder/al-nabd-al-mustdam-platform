import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isAdminRole, isInstructorRole, getDashboardUrlForRole, getTrustedRole } from '@/lib/security/auth';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const requestedNext = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // Sync Google avatar & name to public.profiles table if missing
      try {
        const metaAvatar = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture;
        const metaName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
        if (metaAvatar || metaName) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url, full_name')
            .eq('id', data.user.id)
            .maybeSingle();

          const updates: Record<string, any> = {};
          if (!profile?.avatar_url && metaAvatar) updates.avatar_url = metaAvatar;
          if (!profile?.full_name && metaName) updates.full_name = metaName;

          if (Object.keys(updates).length > 0) {
            await supabase
              .from('profiles')
              .update({ ...updates, updated_at: new Date().toISOString() })
              .eq('id', data.user.id);
          }
        }
      } catch (syncErr) {
        console.warn('OAuth profile sync notice:', syncErr);
      }

      const userRole = getTrustedRole(data.user);
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

      // Check if student profile is missing phone or national_id for mandatory onboarding
      if (!isAdminRole(userRole) && !isInstructorRole(userRole)) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('phone, national_id')
            .eq('id', data.user.id)
            .maybeSingle();

          const hasValidPhone = Boolean(profile?.phone && profile.phone.trim() && profile.phone !== '+966 50 000 0000');
          const hasValidNationalId = Boolean(profile?.national_id && profile.national_id.trim() && profile.national_id !== '10XXXXXXXX');

          if (!hasValidPhone || !hasValidNationalId) {
            targetDestination = '/dashboard/student/profile?onboarding=required';
          }
        } catch (checkErr) {
          console.warn('Profile onboarding check notice:', checkErr);
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
