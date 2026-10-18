import { isLearningJourney, JOURNEY_IDS } from '@/lib/learning/journey';
import type { Course, QuizData, SubLessonItem } from '@/types';

const hasQuestions = (quiz?: QuizData): quiz is QuizData => Boolean(quiz && Array.isArray(quiz.questions) && quiz.questions.length);

/** Mirrors the canonical identifiers in getCourseAllLessons, including legacy curricula. */
export function resolveCourseQuiz(course: Course, lessonId: string): { key: string; quiz: QuizData } | null {
  if (isLearningJourney(course)) {
    if (lessonId === JOURNEY_IDS.pre) return hasQuestions(course.learningJourney?.preAssessment) ? { key: 'pre', quiz: course.learningJourney!.preAssessment! } : null;
    if (lessonId === JOURNEY_IDS.final) return hasQuestions(course.finalExam) ? { key: 'final', quiz: course.finalExam } : null;
  }
  let sectionQuiz: { key: string; quiz: QuizData } | null = null;
  let lessonFound = false;
  for (const [sectionIndex, section] of (course.curriculum || []).entries()) {
    const sectionId = section.id || `sec-${sectionIndex + 1}`;
    const items: Array<string | SubLessonItem> = section.items?.length
      ? section.items : section.lessons && section.lessons.length > 1 ? section.lessons : [];
    for (const [itemIndex, item] of items.entries()) {
      const id = typeof item === 'object' && item.id ? item.id : `sub-${sectionIndex + 1}-${itemIndex + 1}`;
      if (id !== lessonId) continue;
      lessonFound = true;
      if (typeof item === 'object' && hasQuestions(item.quizData)) return { key: `lesson:${id}`, quiz: item.quizData };
      if (hasQuestions(section.quizData)) sectionQuiz = { key: `section:${sectionId}`, quiz: section.quizData };
    }
    if (!items.length && sectionId === lessonId) {
      lessonFound = true;
      if (hasQuestions(section.quizData)) sectionQuiz = { key: `section:${sectionId}`, quiz: section.quizData };
    }
  }
  if (!course.curriculum?.length && lessonId === 'lesson-1') lessonFound = true;
  if (!lessonFound) return null;
  if (sectionQuiz) return sectionQuiz;
  return !isLearningJourney(course) && hasQuestions(course.finalExam) ? { key: 'final', quiz: course.finalExam } : null;
}

function publicQuiz(quiz?: QuizData): QuizData | undefined {
  if (!quiz) return undefined;
  return { id: quiz.id, title: quiz.title, passingScore: quiz.passingScore, durationMinutes: quiz.durationMinutes,
    questions: (quiz.questions || []).map((question) => ({ id: question.id, question: question.question,
      type: question.type, options: question.options,
      ...(question.pairs ? { prompts: question.pairs.map((pair) => pair.prompt) } : {}),
    })) } as QuizData;
}

/** Catalog metadata is public; answer keys are only loaded by authenticated grading routes. */
export function toPublicCourse(course: Course): Course {
  return { ...course, learningJourney: course.learningJourney ? { ...course.learningJourney, preAssessment: publicQuiz(course.learningJourney.preAssessment) } : undefined, finalExam: publicQuiz(course.finalExam), curriculum: (course.curriculum || []).map((section) => ({
    ...section, quizData: publicQuiz(section.quizData),
    items: section.items?.map((item) => ({ ...item, quizData: publicQuiz(item.quizData) })),
    lessons: section.lessons?.map((item) => typeof item === 'string' ? item : { ...item, quizData: publicQuiz(item.quizData) }),
  })) };
}
