import type { Course, LessonBlock } from '@/types';
import { getCourseContent, type LessonContent } from '@/lib/learning/course-content';

export const JOURNEY_IDS = { welcome: '__journey_welcome__', objectives: '__journey_objectives__', pre: '__journey_pre__', final: '__journey_final__' } as const;
export const isLearningJourney = (course: Pick<Course, 'professionalDevelopment' | 'learningJourney'>) =>
  course.professionalDevelopment === true && course.learningJourney?.enabled === true;

/** Extra stations are opt-in and never change identifiers of existing lessons. */
export function getLearningContent(course: Course): LessonContent[] {
  const lessons = getCourseContent(course);
  if (!isLearningJourney(course)) return lessons;
  const station = (id: string, title: string, type: string, extra: Partial<LessonContent> = {}): LessonContent =>
    ({ id, title, type, videoUrl: '', fileUrl: '', sectionId: '__journey__', lastInSection: true, ...extra });
  return [
    station(JOURNEY_IDS.welcome, 'مرحبًا بك في رحلتك التعليمية', 'welcome', { description: course.learningJourney?.introduction || course.description }),
    station(JOURNEY_IDS.objectives, 'أهداف التعلّم', 'objectives', { contentBlocks: [{ id: 'objectives', type: 'steps', items: (course.outcomes || []).map((title, index) => ({ id: String(index), title, text: '' })) }] }),
    ...(course.learningJourney?.preAssessment?.questions?.length ? [station(JOURNEY_IDS.pre, 'اختبر معرفتك السابقة', 'quiz', { requiredQuiz: course.learningJourney.preAssessment, quizKey: 'pre', diagnostic: true })] : []),
    ...lessons,
    ...(course.finalExam?.questions?.length ? [station(JOURNEY_IDS.final, 'الاختبار البعدي', 'quiz', { requiredQuiz: course.finalExam, quizKey: 'final' })] : []),
  ];
}

export function isSafeContentImage(value: string): boolean {
  if (typeof value !== 'string' || value.length > 4096) return false;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

export function validLessonBlocks(value: unknown): value is LessonBlock[] {
  if (!Array.isArray(value) || !value.length || value.length > 50) return false;
  const ids = new Set<string>();
  return value.every((block) => {
    if (!block || typeof block.id !== 'string' || !block.id || ids.has(block.id)) return false;
    ids.add(block.id);
    if (block.title !== undefined && (typeof block.title !== 'string' || block.title.length > 300)) return false;
    if (block.type === 'text') return typeof block.text === 'string' && Boolean(block.text.trim()) && block.text.length <= 20000;
    if (block.type === 'image') return typeof block.imageUrl === 'string' && isSafeContentImage(block.imageUrl) && Boolean(block.title?.trim());
    if (!['steps', 'cards', 'tabs'].includes(block.type) || !Array.isArray(block.items) || !block.items.length || block.items.length > 30) return false;
    const itemIds = new Set<string>();
    return block.items.every((item: { id?: string; title?: string; text?: string; imageUrl?: string }) => {
      if (!item || typeof item.id !== 'string' || !item.id || itemIds.has(item.id)) return false;
      itemIds.add(item.id);
      return typeof item.title === 'string' && Boolean(item.title.trim()) && item.title.length <= 500
        && typeof item.text === 'string' && item.text.length <= 10000 && (block.type === 'steps' || Boolean(item.text.trim()))
        && (!item.imageUrl || isSafeContentImage(item.imageUrl));
    });
  });
}
