import 'server-only';

import type { SupabaseClient, User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  ADMIN_ROLES,
  INSTRUCTOR_ROLES,
  getTrustedRole,
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

    return {
      ok: true,
      user,
      role: getTrustedRole(user),
      supabase,
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
