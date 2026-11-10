import 'server-only';
import { createHash } from 'node:crypto';
import type { LessonContent } from '@/lib/learning/course-content';

export function lessonContentKey(lesson: LessonContent): string {
  return createHash('sha256').update(JSON.stringify({ type: lesson.type, video: lesson.videoUrl,
    file: lesson.fileUrl, quiz: lesson.requiredQuiz, description: lesson.description, blocks: lesson.contentBlocks, diagnostic: lesson.diagnostic })).digest('hex');
}
