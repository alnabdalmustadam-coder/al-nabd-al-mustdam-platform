import type { CurriculumSection, SubLessonItem } from '@/types';
import { prepareCourseQuizForEditing } from '@/lib/quizzes/course-quiz-draft';

export type EditorLesson = Omit<SubLessonItem, 'type'> & {
  duration: string; videoUrl: string; isLocked: boolean;
  type: 'video' | 'pdf' | 'doc' | 'ppt' | 'quiz' | 'article';
};
export type EditorSection = Omit<CurriculumSection, 'id' | 'items' | 'lessons'> & {
  id: string; duration: string; videoUrl: string; type: string; isLocked: boolean;
  subItems: EditorLesson[]; legacySingle?: boolean;
};

/** Preserve canonical IDs so a visual editor change cannot reset learner history. */
export function curriculumToEditor(sections: CurriculumSection[]): EditorSection[] {
  return sections.map((section, sectionIndex) => {
    const id = section.id || `sec-${sectionIndex + 1}`;
    const explicit = Boolean(section.items?.length);
    const items = section.items?.length ? section.items : section.lessons && section.lessons.length > 1 ? section.lessons : null;
    const subItems: EditorLesson[] = (items || [section]).map((value, index) => {
      const item = typeof value === 'string' ? null : value;
      return { ...(item || {}), id: items ? item?.id || `sub-${sectionIndex + 1}-${index + 1}` : id,
        title: item?.title || (typeof value === 'string' ? value : section.title),
        type: (item?.type || 'video') as EditorLesson['type'], duration: item?.duration || '',
        videoUrl: item?.videoUrl || (!explicit && index === 0 ? section.videoUrl || '' : ''),
        isLocked: item?.isLocked ?? false,
        // A legacy section quiz remains a SECTION quiz, rather than becoming a new assessment.
        quizData: items ? prepareCourseQuizForEditing(item?.quizData) : undefined,
        attachments: items ? item?.attachments || [] : [],
      };
    });
    return { ...section, id, type: section.type || 'video', duration: section.duration || '',
      videoUrl: section.videoUrl || '', isLocked: section.isLocked ?? false,
      quizData: prepareCourseQuizForEditing(section.quizData), attachments: section.attachments || [],
      subItems, legacySingle: !items || (subItems.length === 1 && subItems[0].id === id && !subItems[0].quizData) };
  });
}

export function editorToCurriculum(sections: EditorSection[]): CurriculumSection[] {
  return sections.map(({ subItems, legacySingle, ...section }, index) => {
    const items = subItems.map((item, itemIndex) => ({ ...item, id: item.id || `sub-${index + 1}-${itemIndex + 1}`,
      title: item.title.trim() || `الدرس ${itemIndex + 1}` }));
    if (legacySingle && items.length === 1 && items[0].id === section.id) {
      const lesson = items[0];
      return { ...section, title: section.title.trim() || `الوحدة ${index + 1}`, type: lesson.type, videoUrl: lesson.videoUrl,
        fileUrl: lesson.fileUrl, fileName: lesson.fileName, fileSize: lesson.fileSize,
        quizData: lesson.quizData || section.quizData,
        attachments: section.attachments || [],
        // Keep the original lesson ID and section-level quiz key while giving
        // legacy single-lesson units a distinct place for lesson documents.
        items: [{ ...lesson, quizData: undefined }],
        lessons: [lesson.title] };
    }
    return { ...section, title: section.title.trim() || `الوحدة ${index + 1}`, items, lessons: items.map((item) => item.title) };
  });
}
