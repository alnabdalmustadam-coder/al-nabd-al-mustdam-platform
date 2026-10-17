import { createHash } from 'node:crypto';
import type { QuizData } from '@/types';
import { parseQuizQuestions } from '@/lib/quizzes/model';

export function getQuizActivity(slug: string, key: string, quiz: QuizData) {
  const questions = parseQuizQuestions(quiz.questions);
  const passPercentage = Math.min(100, Math.max(0, Number(quiz.passingScore ?? 70)));
  const duration = Math.min(240, Math.max(0, Number(quiz.durationMinutes || 0)));
  const version = createHash('sha256').update(JSON.stringify({ questions, passPercentage, duration })).digest('hex').slice(0, 20);
  return { questions, passPercentage, duration,
    activityId: `https://nabdtraining.com/courses/${encodeURIComponent(slug)}/quizzes/${encodeURIComponent(key)}/${version}` };
}
