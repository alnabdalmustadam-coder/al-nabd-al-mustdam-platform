'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { isAdminRole, isInstructorRole, normalizeRole } from '@/lib/security/auth';
import { consumeRateLimit } from '@/lib/security/rate-limit';

function isStrongPassword(password: string): boolean {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    password.length <= 128 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password))
  );
}

export async function login(formData: FormData) {
  const requestHeaders = await headers();
  const clientIp = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limit = consumeRateLimit(`auth-action-login:${clientIp}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return { error: `محاولات كثيرة، حاول بعد ${limit.retryAfter} ثانية` };
  }

  const supabase = await createClient();

  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const password = formData.get('password') as string;
  const requestedRedirect = formData.get('redirect') as string;
  if (!/^\S+@\S+\.\S+$/.test(email || '') || typeof password !== 'string') {
    return { error: 'بيانات تسجيل الدخول غير صالحة' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  let roleSource: unknown = data.user?.app_metadata?.role;
  if (!roleSource || normalizeRole(roleSource) === 'STUDENT') {
    if (data.user?.user_metadata?.role && normalizeRole(data.user.user_metadata.role) !== 'STUDENT') {
      roleSource = data.user.user_metadata.role;
    } else if (data.user?.id) {
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
  const roleHome = isAdminRole(userRole)
    ? '/dashboard/admin'
    : isInstructorRole(userRole)
      ? '/dashboard/instructor'
      : '/dashboard/student';

  const safeRequestedRedirect =
    requestedRedirect?.startsWith('/') && !requestedRedirect.startsWith('//')
      ? requestedRedirect
      : '';
  const canUseRequestedRedirect =
    (isAdminRole(userRole) && safeRequestedRedirect.startsWith('/dashboard/admin')) ||
    (isInstructorRole(userRole) && safeRequestedRedirect.startsWith('/dashboard/instructor')) ||
    (!isAdminRole(userRole) && !isInstructorRole(userRole) && safeRequestedRedirect.startsWith('/dashboard/student'));

  const finalDestination = canUseRequestedRedirect ? safeRequestedRedirect : roleHome;

  return { success: true, redirectUrl: finalDestination };
}

export async function signup(formData: FormData) {
  const requestHeaders = await headers();
  const clientIp = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limit = consumeRateLimit(`auth-action-signup:${clientIp}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return { error: `محاولات كثيرة، حاول بعد ${limit.retryAfter} ثانية` };
  }

  const supabase = await createClient();

  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const nationalId = formData.get('nationalId') as string;
  const phone = formData.get('phone') as string;
  if (
    !/^\S+@\S+\.\S+$/.test(email || '') ||
    !isStrongPassword(password) ||
    !fullName?.trim() ||
    (nationalId && !/^[124]\d{9}$/.test(nationalId.trim()))
  ) {
    return { error: 'بيانات التسجيل أو قوة كلمة المرور غير صالحة' };
  }
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        national_id: nationalId,
        phone: phone,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true, email };
}

export async function resetPasswordRequest(email: string) {
  const requestHeaders = await headers();
  const clientIp = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limit = consumeRateLimit(`auth-action-reset:${clientIp}`, 5, 60 * 60 * 1000);
  if (!limit.allowed || !/^\S+@\S+\.\S+$/.test(email || '')) {
    return { error: 'تعذر إرسال طلب إعادة التعيين الآن' };
  }

  const supabase = await createClient();
  const cleanEmail = email.toLowerCase().trim();

  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updatePasswordAction(password: string) {
  if (!isStrongPassword(password)) {
    return { error: 'كلمة المرور لا تطابق متطلبات الأمان' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
