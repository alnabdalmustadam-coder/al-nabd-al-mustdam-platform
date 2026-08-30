import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getDashboardUrlForRole, getTrustedRole } from '@/lib/security/auth';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/dashboard');
  }

  const effectiveRole = getTrustedRole(user);
  const targetDashboard = getDashboardUrlForRole(effectiveRole);

  redirect(targetDashboard);
}
