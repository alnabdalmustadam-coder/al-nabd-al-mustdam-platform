import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getDashboardUrlForRole, normalizeRole } from '@/lib/security/auth';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/dashboard');
  }

  let roleSource: unknown = user.app_metadata?.role;
  if (!roleSource || normalizeRole(roleSource) === 'STUDENT') {
    if (user.user_metadata?.role && normalizeRole(user.user_metadata.role) !== 'STUDENT') {
      roleSource = user.user_metadata.role;
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      if (profile?.role) {
        roleSource = profile.role;
      }
    }
  }

  const effectiveRole = normalizeRole(roleSource);
  const targetDashboard = getDashboardUrlForRole(effectiveRole);

  redirect(targetDashboard);
}
