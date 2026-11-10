import 'server-only';
import { createFixtureClient } from './client';
import { demoTables, demoUsers, type DemoRow } from './fixtures';
import { demoCourses } from '@/data/courses';
import { getLearningContent } from '@/lib/learning/journey';
import { lessonContentKey } from '@/lib/learning/lesson-content-key';

function readRows(table: string): readonly DemoRow[] {
  if (table !== 'course_lesson_progress') return demoTables[table] ?? [];
  const course = demoCourses[0];
  return getLearningContent(course).filter(lesson => lesson.quizKey !== 'final').map(lesson => ({
    course_id: course.id, user_id: demoUsers.student.id, lesson_id: lesson.id, content_key: lessonContentKey(lesson),
    duration_seconds: lesson.type === 'video' ? 16 : 0, watched_seconds: lesson.type === 'video' ? 16 : 0,
    session_id: null, completed_at: '2026-10-26T10:00:00.000Z',
  }));
}

export const demoServerClient = (options: Omit<NonNullable<Parameters<typeof createFixtureClient>[0]>, 'readRows'> = {}) =>
  createFixtureClient({ ...options, readRows });
