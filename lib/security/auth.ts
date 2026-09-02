import 'server-only';

import type { SupabaseClient, User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { consumeRateLimit } from '@/lib/security/rate-limit';
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
  return NextResponse.json({ success: false, message }, { status });
}

function hasAllowedOrigin(request?: Request): boolean {
  if (!request || ['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase())) {
    return true;
  }

  const origin = request.headers.get('origin');
  if (!origin) return true;

  try {
    const requestUrl = new URL(request.url);
    const originUrl = new URL(origin);
    const configuredOrigins = (process.env.ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_SITE_URL || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    return (
      originUrl.origin === requestUrl.origin ||
      configuredOrigins.some((allowed) => new URL(allowed).origin === originUrl.origin)
    );
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
  const auth = await requireRoles(request, ADMIN_ROLES);
  if (!auth.ok) return auth;

  const method = request?.method.toUpperCase() || 'GET';
  const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  const mfaConfigured = process.env.REQUIRE_ADMIN_MFA;
  const requireMfa = mfaConfigured === 'true' || (
    process.env.NODE_ENV === 'production' && mfaConfigured !== 'false'
  );

  if (isMutation && requireMfa && auth.assuranceLevel !== 'aal2') {
    return {
      ok: false,
      response: errorResponse('يلزم التحقق بخطوتين قبل تنفيذ هذا الإجراء', 403),
    };
  }

  if (isMutation) {
    const rate = consumeRateLimit(`admin:${auth.user.id}`, 120, 60_000);
    if (!rate.allowed) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, message: 'طلبات إدارية كثيرة، حاول مرة أخرى بعد قليل' },
          { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } },
        ),
      };
    }
  }

  return auth;
}

export async function requireSuperAdmin(request?: Request): Promise<AuthorizationResult> {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth;
  if (!['SUPERADMIN', 'SUPER_ADMIN'].includes(auth.role)) {
    return { ok: false, response: errorResponse('هذا الإجراء متاح للمدير الأعلى فقط', 403) };
  }
  return auth;
}

export async function requireInstructorOrAdmin(request?: Request): Promise<AuthorizationResult> {
  return requireRoles(request, [...ADMIN_ROLES, ...INSTRUCTOR_ROLES]);
}
