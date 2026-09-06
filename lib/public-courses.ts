import type { Course } from '@/types';

export const COURSES_LOAD_ERROR = 'تعذر تحميل أحدث الدورات. حاول مرة أخرى.';

export function normalizeCourseIdentifier(value?: string | number): string {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/^course-/, '');
}

export function findCourseByIdentifier(catalog: Course[], identifier: string): Course | undefined {
  const target = normalizeCourseIdentifier(identifier);
  return catalog.find((course) =>
    [course.slug, course.id, course.ghlCourseId]
      .some((value) => normalizeCourseIdentifier(value) === target),
  );
}

/** Read the same published catalog used by the public courses page. */
export async function fetchPublicCourses(signal?: AbortSignal): Promise<Course[]> {
  const response = await fetch('/api/courses', { cache: 'no-store', signal });
  if (!response.ok) throw new Error(COURSES_LOAD_ERROR);

  const payload: unknown = await response.json();
  if (
    !payload || typeof payload !== 'object'
    || !('success' in payload) || payload.success !== true
    || !('courses' in payload) || !Array.isArray(payload.courses)
  ) {
    throw new Error(COURSES_LOAD_ERROR);
  }

  // An empty catalog is valid: do not resurrect deleted or unpublished seed data.
  return payload.courses as Course[];
}
