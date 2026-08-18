'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { supabase as supabaseAdmin } from '@/lib/supabase';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const password = formData.get('password') as string;
  const requestedRedirect = formData.get('redirect') as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  let finalDestination = requestedRedirect;

  if (!finalDestination || finalDestination === '/dashboard/student' || finalDestination === '/dashboard/admin') {
    let userRole = (data.user?.user_metadata?.role || 'STUDENT').toUpperCase();

    // Check profiles table for role update by admin
    if (data.user?.id) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        if (profile?.role) {
          userRole = profile.role.toUpperCase();
        }
      } catch (err) {
        // Fallback to metadata
      }
    }

    if (userRole === 'ADMIN' || userRole === 'INSTRUCTOR' || userRole === 'TRAINER' || userRole === 'TEACHER') {
      finalDestination = '/dashboard/admin';
    } else {
      finalDestination = '/dashboard/student/courses';
    }
  }

  return { success: true, redirectUrl: finalDestination };
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const nationalId = formData.get('nationalId') as string;
  const phone = formData.get('phone') as string;
  const requestedRole = (formData.get('role') as string)?.toUpperCase() === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'STUDENT';

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        national_id: nationalId,
        phone: phone,
        role: requestedRole,
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

