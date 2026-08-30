import 'server-only';

import type { SupabaseClient, User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN'] as const;
export const INSTRUCTOR_ROLES = ['INSTRUCTOR', 'TRAINER', 'TEACHER'] as const;

export type AppRole =
  | (typeof ADMIN_ROLES)[number]
  | (typeof INSTRUCTOR_ROLES)[number]
  | 'STUDENT'
  | 'TRAINEE';

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

const KNOWN_ROLES = new Set<AppRole>([
  ...ADMIN_ROLES,
  ...INSTRUCTOR_ROLES,
  'STUDENT',
  'TRAINEE',
]);

export function normalizeRole(value: unknown): AppRole {
  const role = typeof value === 'string' ? value.trim().toUpperCase() : '';
  return KNOWN_ROLES.has(role as AppRole) ? (role as AppRole) : 'STUDENT';
}

export function isAdminRole(role: AppRole): boolean {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

export function isInstructorRole(role: AppRole): boolean {
  return (INSTRUCTOR_ROLES as readonly string[]).includes(role);
}

export function getDashboardUrlForRole(roleInput: unknown): string {
  const role = normalizeRole(roleInput);
  if (isAdminRole(role)) return '/dashboard/admin';
  if (isInstructorRole(role)) return '/dashboard/instructor';
  return '/dashboard/student';
}

export function getRoleDisplayName(roleInput: unknown): string {
  const role = normalizeRole(roleInput);
  if (isAdminRole(role)) return 'لوحة الإدارة';
  if (isInstructorRole(role)) return 'لوحة المدرب';
  return 'لوحة المتدرب';
}

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

    return {
      ok: true,
      user,
      role: normalizeRole(roleSource),
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
