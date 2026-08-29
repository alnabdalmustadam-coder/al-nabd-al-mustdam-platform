import type { Course, SubLessonItem } from '@/types';

export interface CourseLessonSummary {
  id: string;
  title: string;
}

function isSubLessonItem(value: string | SubLessonItem): value is SubLessonItem {
  return typeof value !== 'string';
}

/**
 * Returns the canonical lesson identifiers used by the student player and the
 * server-side completion APIs. Keep this as the single source of truth for
 * progress totals and lesson ownership checks.
 */
export function getCourseAllLessons(
  course: Pick<Course, 'curriculum'> | null | undefined,
): CourseLessonSummary[] {
  const curriculum = course?.curriculum;

  if (!Array.isArray(curriculum) || curriculum.length === 0) {
    return [{ id: 'lesson-1', title: 'المفاهيم الأساسية والأهداف التدريبية' }];
  }

  return curriculum.flatMap((section, sectionIndex) => {
    if (Array.isArray(section.items) && section.items.length > 0) {
      return section.items.map((item, itemIndex) => ({
        id: item.id || `sub-${sectionIndex + 1}-${itemIndex + 1}`,
        title: item.title || `المقطع ${itemIndex + 1}`,
      }));
    }

    if (Array.isArray(section.lessons) && section.lessons.length > 1) {
      return section.lessons.map((lesson, lessonIndex) => ({
        id: isSubLessonItem(lesson) && lesson.id
          ? lesson.id
          : `sub-${sectionIndex + 1}-${lessonIndex + 1}`,
        title: isSubLessonItem(lesson)
          ? lesson.title || `المقطع ${lessonIndex + 1}`
          : lesson,
      }));
    }

    return [{
      id: section.id || `sec-${sectionIndex + 1}`,
      title: section.title || `الوحدة ${sectionIndex + 1}`,
    }];
  });
}
