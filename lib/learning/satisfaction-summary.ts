import type { Course } from '@/types';
import { getCourseContent } from '@/lib/learning/course-content';

export type SatisfactionContent = { content_kind: 'lesson' | 'quiz'; content_key: string; title: string; hearts: number };
export type CourseSatisfaction = {
  id: number; slug: string; title: string; image: string; instructor: string; category: string;
  duration: string; lessonCount: number; status: string; professionalDevelopment: boolean;
  hearts: number; learners: number; lesson_hearts: number; quiz_hearts: number; contents: SatisfactionContent[];
};
type SummaryRow = { course_id: number; hearts?: number; learners?: number; lesson_hearts?: number; quiz_hearts?: number };
export type SatisfactionSnapshot = { learners?: number; courses?: SummaryRow[]; contents?: (SatisfactionContent & { course_id: number })[] };
export type SatisfactionResponse = { learners: number; courses: CourseSatisfaction[] };
export type SatisfactionFilter = 'all' | 'rated' | 'waiting';
export type SatisfactionSort = 'hearts' | 'learners' | 'title';

const count = (value: unknown) => Math.max(0, Math.trunc(Number(value) || 0));

/** Expose display metadata and aggregate votes only, never course answers or learner identities. */
export function buildSatisfactionSummary(courses: Course[], snapshot: SatisfactionSnapshot): SatisfactionResponse {
  const summaries = new Map((snapshot.courses || []).map((row) => [String(row.course_id), row]));
  const contents = new Map<string, SatisfactionContent[]>();
  for (const row of snapshot.contents || []) {
    if (row.content_kind !== 'lesson' && row.content_kind !== 'quiz') continue;
    const key = String(row.course_id), items = contents.get(key) || [];
    items.push({ content_kind: row.content_kind, content_key: row.content_key, title: row.title, hearts: count(row.hearts) });
    contents.set(key, items);
  }
  return {
    // A learner may vote in several courses. Preserve the database's distinct total.
    learners: count(snapshot.learners),
    courses: courses.map((course) => {
      const row = summaries.get(String(course.id));
      return {
        id: course.id, slug: course.slug, title: course.title, image: course.image || '',
        instructor: course.instructor || '', category: course.category, duration: course.duration || '',
        lessonCount: course.curriculum?.length ? getCourseContent(course).length : 0,
        status: course.status || 'published', professionalDevelopment: course.professionalDevelopment === true,
        hearts: count(row?.hearts), learners: count(row?.learners), lesson_hearts: count(row?.lesson_hearts), quiz_hearts: count(row?.quiz_hearts),
        contents: (contents.get(String(course.id)) || []).sort((a, b) => b.hearts - a.hearts || a.title.localeCompare(b.title, 'ar')),
      };
    }),
  };
}

export function selectSatisfactionCourses(courses: CourseSatisfaction[], query: string, filter: SatisfactionFilter, sort: SatisfactionSort) {
  const search = query.trim().toLocaleLowerCase('ar');
  return courses.filter((course) => (!search || `${course.title} ${course.instructor}`.toLocaleLowerCase('ar').includes(search)) &&
    (filter === 'all' || (filter === 'rated' ? course.hearts > 0 : course.hearts === 0)))
    .sort((a, b) => (sort === 'title' ? 0 : sort === 'learners' ? b.learners - a.learners : b.hearts - a.hearts) || a.title.localeCompare(b.title, 'ar'));
}
