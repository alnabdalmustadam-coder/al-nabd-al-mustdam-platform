import type { Course } from '@/types';

export const COURSES_LOAD_ERROR = 'تعذر تحميل أحدث الدورات. حاول مرة أخرى.';

function decodeCourseIdentifier(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeCourseIdentifier(value?: string | number): string {
  return decodeCourseIdentifier(String(value ?? ''))
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/^course-/, '');
}

/** Validate one decoded URL segment, including Arabic slugs and legacy IDs. */
export function parseCourseIdentifier(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2400) return null;
  try {
    const identifier = decodeURIComponent(value).normalize('NFKC').trim();
    if (
      identifier.length < 1 || identifier.length > 200
      || !/^[\p{L}\p{N}\p{M}_-]+$/u.test(identifier)
      || !normalizeCourseIdentifier(identifier)
    ) return null;
    return identifier;
  } catch {
    return null;
  }
}

/** Match historical enrollment keys while storing new records by catalog slug. */
export function getCourseEnrollmentIdentifiers(
  course: Pick<Course, 'id' | 'slug' | 'ghlCourseId'>,
  requestedIdentifier?: string,
): string[] {
  const identifiers = [requestedIdentifier, course.slug, String(course.id), course.ghlCourseId]
    .filter((value): value is string => Boolean(value));
  return [...new Set(identifiers.flatMap((identifier) => {
    const normalized = normalizeCourseIdentifier(identifier);
    return normalized ? [identifier, normalized, `course-${normalized}`] : [];
  }))];
}

export function findCourseByIdentifier(catalog: Course[], identifier: string): Course | undefined {
  const target = normalizeCourseIdentifier(identifier);
  if (!target) return undefined;
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
