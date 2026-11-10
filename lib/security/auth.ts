import 'server-only';

import type { SupabaseClient, User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  ADMIN_ROLES,
  INSTRUCTOR_ROLES,
  getTrustedRole,
  isAdminRole,
  isInstructorRole,
  type AppRole,
} from '@/lib/security/roles';

export {
  ADMIN_ROLES,
  INSTRUCTOR_ROLES,
  getDashboardUrlForRole,
  getRoleDisplayName,
  getTrustedRole,
  isAdminRole,
  isInstructorRole,
  normalizeRole,
  type AppRole,
} from '@/lib/security/roles';

type AuthenticatedRequest = {
  ok: true;
  user: User;
  role: AppRole;
  supabase: SupabaseClient;
  assuranceLevel: 'aal1' | 'aal2' | null;
};

type RejectedRequest = {
  ok: false;
  response: NextResponse;
};

export type AuthorizationResult = AuthenticatedRequest | RejectedRequest;

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message, message }, { status });
}

function hasAllowedOrigin(request?: Request): boolean {
  if (!request || ['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase())) {
    return true;
  }

  const origin = request.headers.get('origin');
  if (!origin) return true;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function requireUser(request?: Request): Promise<AuthorizationResult> {
  if (!hasAllowedOrigin(request)) {
    return { ok: false, response: errorResponse('مصدر الطلب غير مسموح', 403) };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { ok: false, response: errorResponse('يرجى تسجيل الدخول أولاً', 401) };
    }

    let assuranceLevel: 'aal1' | 'aal2' | null = null;
    try {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      assuranceLevel = aal?.currentLevel === 'aal2' ? 'aal2' : aal?.currentLevel === 'aal1' ? 'aal1' : null;
    } catch {
      // AAL remains unknown. Sensitive admin mutations fail closed below when
      // MFA enforcement is enabled.
    }

    let userRole = getTrustedRole(user);
    if (!isAdminRole(userRole) && !isInstructorRole(userRole)) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      if (profile?.role) {
        const dbRole = String(profile.role).toUpperCase().trim();
        if (['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'TRAINER', 'TEACHER'].includes(dbRole)) {
          userRole = dbRole as any;
        }
      }
    }

    return {
      ok: true,
      user,
      role: userRole,
      supabase,
      assuranceLevel,
    };
  } catch (error) {
    console.error('Authentication service error:', error);
    return { ok: false, response: errorResponse('خدمة تسجيل الدخول غير متاحة مؤقتاً', 503) };
  }
}

export async function requireRoles(
  request: Request | undefined,
  allowedRoles: readonly AppRole[],
): Promise<AuthorizationResult> {
  const auth = await requireUser(request);
  if (!auth.ok) return auth;

  if (!allowedRoles.includes(auth.role)) {
    return { ok: false, response: errorResponse('ليس لديك صلاحية لتنفيذ هذا الإجراء', 403) };
  }

  return auth;
}

export async function requireAdmin(request?: Request): Promise<AuthorizationResult> {
  return requireRoles(request, ADMIN_ROLES);
}

export async function requireInstructorOrAdmin(request?: Request): Promise<AuthorizationResult> {
  return requireRoles(request, [...ADMIN_ROLES, ...INSTRUCTOR_ROLES]);
}
