import type { Course, CourseAttachment, CurriculumSection, SubLessonItem } from '@/types';

export type CourseResourceGroup = { id: string; title: string; files: CourseAttachment[] };
const uniqueFiles = (files: CourseAttachment[]) => files.filter((file, index) => file.fileUrl && files.findIndex((item) => item.fileUrl === file.fileUrl) === index);
function primaryFile(item: CurriculumSection | SubLessonItem, id: string): CourseAttachment[] {
  return item.fileUrl ? [{ id: `primary:${id}`, title: item.fileName || item.title, fileUrl: item.fileUrl,
    fileSize: item.fileSize, fileType: item.type === 'ppt' ? 'ppt' : item.type === 'doc' ? 'word' : 'pdf' }] : [];
}

/** Only the current lesson/unit is included; general downloads remain course-wide. */
export function getLessonResourceGroups(course: Pick<Course, 'curriculum' | 'attachments'>, lessonId: string, allowed = true): CourseResourceGroup[] {
  const groups: CourseResourceGroup[] = [];
  if (allowed) course.curriculum?.some((section, index) => {
    const sectionId = section.id || `sec-${index + 1}`;
    const items = section.items?.length ? section.items : section.lessons && section.lessons.length > 1 ? section.lessons : null;
    const lesson = items?.find((item, subIndex) => (typeof item === 'string' ? `sub-${index + 1}-${subIndex + 1}` : item.id || `sub-${index + 1}-${subIndex + 1}`) === lessonId);
    if (items ? !lesson : sectionId !== lessonId) return false;
    if (lesson && typeof lesson !== 'string') groups.push({ id: 'lesson', title: 'ملفات هذا الدرس', files: uniqueFiles([...primaryFile(lesson, lessonId), ...(lesson.attachments || [])]) });
    groups.push({ id: 'unit', title: `ملفات الوحدة: ${section.title}`, files: uniqueFiles([...primaryFile(section, sectionId), ...(section.attachments || [])]) });
    return true;
  });
  groups.push({ id: 'course', title: 'مرفقات الدورة العامة', files: uniqueFiles(course.attachments || []) });
  return groups.filter((group) => group.files.length);
}
