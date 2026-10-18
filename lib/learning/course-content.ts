import type { Course, QuizData, SubLessonItem, LessonBlock } from '@/types';

export type LessonContent = {
  id: string; title: string; type: string; videoUrl: string; fileUrl: string;
  sectionId: string; lastInSection: boolean; requiredQuiz?: QuizData; quizKey?: string;
  description?: string; contentBlocks?: LessonBlock[]; diagnostic?: boolean;
};

/** Same identifiers and order as getCourseAllLessons, including legacy courses. */
export function getCourseContent(course: Pick<Course, 'curriculum'>): LessonContent[] {
  if (!course.curriculum?.length) return [{ id: 'lesson-1', title: 'المفاهيم الأساسية والأهداف التدريبية',
    type: 'video', videoUrl: '', fileUrl: '', sectionId: 'lesson-1', lastInSection: true }];
  return course.curriculum.flatMap((section, sectionIndex) => {
    const sectionId = section.id || `sec-${sectionIndex + 1}`;
    const explicitItems = Boolean(section.items?.length);
    const items = section.items?.length ? section.items : section.lessons && section.lessons.length > 1 ? section.lessons : [];
    const content = items.length ? items : [section as SubLessonItem];
    return content.map((value, index) => {
      const item = typeof value === 'string' ? null : value;
      const id = items.length ? item?.id || `sub-${sectionIndex + 1}-${index + 1}` : sectionId;
      const lastInSection = index === content.length - 1;
      const ownQuiz = items.length && item?.quizData?.questions?.length ? item.quizData : undefined;
      const requiredQuiz = ownQuiz || (lastInSection && section.quizData?.questions?.length ? section.quizData : undefined);
      return { id, title: item?.title || (typeof value === 'string' ? value : `الوحدة ${sectionIndex + 1}`), type: item?.type || 'video',
        videoUrl: item?.videoUrl || (!explicitItems && index === 0 ? section.videoUrl || '' : ''), fileUrl: item?.fileUrl || '',
        sectionId, lastInSection, requiredQuiz, description: item?.description, contentBlocks: item?.contentBlocks,
        quizKey: ownQuiz ? `lesson:${id}` : requiredQuiz ? `section:${sectionId}` : undefined };
    });
  });
}

export function isLessonUnlocked(ids: string[], completed: Set<string>, lessonId: string): boolean {
  const index = ids.indexOf(lessonId);
  return index >= 0 && ids.slice(0, index).every((id) => completed.has(id));
}

export function extractBunnyVideoId(value: string): string | null {
  const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
  if (new RegExp(`^${uuid}$`, 'i').test(value.trim())) return value.trim().toLowerCase();
  try {
    const url = new URL(value);
    if (!['iframe.mediadelivery.net', 'player.mediadelivery.net'].includes(url.hostname) || url.protocol !== 'https:') return null;
    return url.pathname.match(new RegExp(`/(?:embed|play)/\\d+/(${uuid})(?:/|$)`, 'i'))?.[1].toLowerCase() || null;
  } catch { return null; }
}
