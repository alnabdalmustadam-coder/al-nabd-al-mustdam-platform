import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getDashboardUrlForRole, getTrustedRole, isAdminRole, isInstructorRole } from '@/lib/security/auth';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/dashboard');
  }

  let effectiveRole = getTrustedRole(user);

  // Fallback: if app_metadata has no role (defaults to STUDENT),
  // check profiles table for the actual role
  if (!isAdminRole(effectiveRole) && !isInstructorRole(effectiveRole)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role) {
      const dbRole = String(profile.role).toUpperCase().trim();
      if (['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'TRAINER', 'TEACHER'].includes(dbRole)) {
        effectiveRole = dbRole as any;
      }
    }
  }

  const targetDashboard = getDashboardUrlForRole(effectiveRole);
  redirect(targetDashboard);
}
