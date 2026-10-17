import 'server-only';
import { requireUser } from '@/lib/security/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCourseBySlugAsync } from '@/lib/courses-store';
import { getCourseEnrollmentIdentifiers, parseCourseIdentifier } from '@/lib/public-courses';
import { isEnrollmentActive } from '@/lib/security/student-access';

export class LearningError extends Error {
  constructor(message: string, public status = 409) { super(message); }
}

export async function requireCourseLearner(request: Request, value: unknown) {
  const auth = await requireUser(request);
  if (!auth.ok) return { rejected: auth.response };
  const id = parseCourseIdentifier(value);
  const email = auth.user.email?.trim().toLowerCase();
  if (!id || !email) throw new LearningError('معرف الدورة غير صالح', 400);
  const course = await getCourseBySlugAsync(id);
  if (!course) throw new LearningError('الدورة غير موجودة', 404);
  const admin = getSupabaseAdmin();
  const identifiers = getCourseEnrollmentIdentifiers(course, id);
  const [byUser, byEmail] = await Promise.all([
    admin.from('enrollments').select('id, user_id, email, status').eq('user_id', auth.user.id).in('course_id', identifiers),
    admin.from('enrollments').select('id, user_id, email, status').eq('email', email).in('course_id', identifiers),
  ]);
  if (byUser.error || byEmail.error) throw byUser.error || byEmail.error;
  const enrollments = [...new Map([...(byUser.data || []), ...(byEmail.data || [])].map((row) => [row.id, row])).values()]
    .filter((row) => (row.user_id === auth.user.id || (!row.user_id && row.email === email))
      && isEnrollmentActive(row.status) && !['suspended', 'expired'].includes(String(row.status).toLowerCase()));
  if (!enrollments.length) throw new LearningError('غير مسجل في هذه الدورة', 403);
  return { auth, admin, course, email, enrollments };
}
