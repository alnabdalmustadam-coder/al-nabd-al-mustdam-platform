export const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN'] as const;
export const INSTRUCTOR_ROLES = ['INSTRUCTOR', 'TRAINER', 'TEACHER'] as const;

export type AppRole =
  | (typeof ADMIN_ROLES)[number]
  | (typeof INSTRUCTOR_ROLES)[number]
  | 'STUDENT'
  | 'TRAINEE';

type TrustedRoleClaims = {
  app_metadata?: unknown;
} | null | undefined;

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

/**
 * Resolve authorization from server-controlled claims only.
 * Supabase user_metadata is intentionally ignored because account owners can
 * edit it themselves. Privileged roles must be assigned through Admin APIs to
 * app_metadata and then refreshed into the user's JWT.
 */
export function getTrustedRole(user: TrustedRoleClaims): AppRole {
  const metadata = user?.app_metadata;
  const role = metadata !== null && typeof metadata === 'object'
    ? (metadata as Record<string, unknown>).role
    : undefined;
  return normalizeRole(role);
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
