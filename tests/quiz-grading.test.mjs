import test from 'node:test';
import assert from 'node:assert/strict';

import {
  gradeQuizAnswers,
  parseQuizQuestions,
  sanitizeQuizAnswers,
  toStudentQuizQuestions,
} from '../lib/quizzes/model.ts';

const rawQuestions = [
  {
    id: 'q-1',
    text: 'السؤال الأول',
    options: ['أ', 'ب', 'ج'],
    correctIndex: 1,
    explanation: 'الإجابة ب',
  },
  {
    id: 'q-2',
    question: 'السؤال الثاني',
    options: ['صحيح', 'خطأ'],
    correctAnswer: 'صحيح',
  },
];

test('student question payload never contains answer keys', () => {
  const parsed = parseQuizQuestions(rawQuestions);
  const safeQuestions = toStudentQuizQuestions(parsed);

  assert.equal(parsed.length, 2);
  assert.deepEqual(Object.keys(safeQuestions[0]).sort(), ['id', 'options', 'text']);
  assert.equal(JSON.stringify(safeQuestions).includes('correctIndex'), false);
});

test('server grading ignores unknown questions and calculates exact score', () => {
  const parsed = parseQuizQuestions(rawQuestions);
  const result = gradeQuizAnswers(parsed, [
    { questionId: 'q-1', selectedIndex: 1 },
    { questionId: 'q-2', selectedIndex: 1 },
    { questionId: 'unknown', selectedIndex: 0 },
  ]);

  assert.equal(result.totalQuestions, 2);
  assert.equal(result.correctAnswers, 1);
  assert.equal(result.score, 50);
  assert.equal(result.results[0].isCorrect, true);
  assert.equal(result.results[1].isCorrect, false);
});

test('invalid placeholder questions are not published to students', () => {
  assert.deepEqual(parseQuizQuestions([{}, { text: 'بدون خيارات' }]), []);
});

test('draft answers retain only valid quiz selections', () => {
  const questions = toStudentQuizQuestions(parseQuizQuestions(rawQuestions));
  assert.deepEqual(
    sanitizeQuizAnswers([
      { questionId: 'q-1', selectedIndex: 2 },
      { questionId: 'q-2', selectedIndex: 99 },
      { questionId: 'other', selectedIndex: 0 },
    ], questions),
    [{ questionId: 'q-1', selectedIndex: 2 }],
  );
});
