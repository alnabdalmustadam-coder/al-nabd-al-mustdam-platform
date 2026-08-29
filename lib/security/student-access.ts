import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

type EnrollmentRow = {
  id: string;
  course_id: string;
  status: string | null;
};

export function normalizeCourseId(value: unknown): string {
  return typeof value === 'string'
    ? value.trim().toLowerCase().replace(/^course-/, '')
    : '';
}

export async function getStudentEnrollments(
  admin: SupabaseClient,
  userId: string,
  email: string,
): Promise<EnrollmentRow[]> {
  const [byUser, byEmail] = await Promise.all([
    admin.from('enrollments').select('id, course_id, status').eq('user_id', userId),
    admin.from('enrollments').select('id, course_id, status').eq('email', email),
  ]);

  if (byUser.error || byEmail.error) throw byUser.error || byEmail.error;

  return [...new Map(
    [...(byUser.data || []), ...(byEmail.data || [])]
      .map((row) => [row.id, row as EnrollmentRow]),
  ).values()];
}

export async function isStudentEnrolled(
  admin: SupabaseClient,
  userId: string,
  email: string,
  courseId: string,
): Promise<boolean> {
  const target = normalizeCourseId(courseId);
  if (!target) return false;

  const rows = await getStudentEnrollments(admin, userId, email);
  return rows.some((row) => {
    const status = (row.status || 'active').toLowerCase();
    return status !== 'revoked' && normalizeCourseId(row.course_id) === target;
  });
}

export const STUDENT_SUBMISSIONS_BUCKET = 'student-submissions';

export function parseStudentFileReference(value: unknown): { bucket: string; path: string } | null {
  if (typeof value !== 'string') return null;
  const prefix = `storage://${STUDENT_SUBMISSIONS_BUCKET}/`;
  if (!value.startsWith(prefix)) return null;

  const path = value.slice(prefix.length);
  if (!path || path.includes('..') || path.startsWith('/') || path.includes('\\')) return null;
  return { bucket: STUDENT_SUBMISSIONS_BUCKET, path };
}
