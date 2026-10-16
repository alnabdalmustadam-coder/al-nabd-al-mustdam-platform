import type { QuizData } from '@/types';

export function createCourseQuizDraft(): QuizData {
  return {
    title: '',
    passingScore: 70,
    questions: [{
      id: `q-${crypto.randomUUID()}`,
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
    }],
  };
}

const legacyOptions = ['الخيار الأول (الصحيح)', 'الخيار الثاني', 'الخيار الثالث', 'الخيار الرابع'];

export function prepareCourseQuizForEditing(quiz: QuizData | undefined): QuizData | undefined {
  if (!quiz) return undefined;
  return {
    ...quiz,
    questions: quiz.questions.map((question) => {
      // Only clear the complete, untouched instructional template. Authored
      // questions and partially edited content must retain their saved values.
      const isTemplate = question.type !== 'matching'
        && question.question === 'اكتب السؤال التقييمي هنا...'
        && question.options.length === legacyOptions.length
        && question.options.every((option, index) => option === legacyOptions[index])
        && question.correctIndex === 0
        && question.explanation === 'شرح وتوضيح الإجابة النموذجية.';
      return isTemplate
        ? { ...question, question: '', options: ['', '', '', ''], explanation: '' }
        : question;
    }),
  };
}
