import test from 'node:test';
import assert from 'node:assert/strict';

import {
  gradeQuizAnswers,
  parseQuizQuestions,
  sanitizeQuizAnswers,
  toStudentQuizQuestions,
  isQuizAnswerComplete,
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

const matching = { id: 'match-1', type: 'matching', question: 'صل كل عنصر بإجابته', pairs: [
  { id: 'a', prompt: 'الماء', answer: 'سائل' }, { id: 'b', prompt: 'الحجر', answer: 'صلب' },
] };

test('matching questions hide private mappings and grade complete pairs on the server', () => {
  const parsed = parseQuizQuestions([matching]);
  const safe = toStudentQuizQuestions(parsed)[0];
  assert.equal(safe.type, 'matching');
  assert.deepEqual(safe.prompts, ['الماء', 'الحجر']);
  assert.equal(JSON.stringify(safe).includes('correct'), false);
  assert.equal(JSON.stringify(safe).includes('pairs'), false);
  const answer = { questionId: safe.id, selectedIndex: -1, selectedIndices: parsed[0].correctIndices };
  assert.equal(isQuizAnswerComplete(safe, answer), true);
  assert.equal(gradeQuizAnswers(parsed, [answer]).score, 100);
  assert.equal(gradeQuizAnswers(parsed, [{ ...answer, selectedIndices: [...answer.selectedIndices].reverse() }]).score, 0);
});

test('partial, repeated, foreign and out-of-range matching assignments do not pass', () => {
  const parsed = parseQuizQuestions([matching]);
  const safe = toStudentQuizQuestions(parsed)[0];
  for (const selectedIndices of [[0], [0, 0], [0, 99], [null, 1], ['0', 1]]) {
    const answers = sanitizeQuizAnswers([{ questionId: safe.id, selectedIndices }], [safe]);
    assert.equal(isQuizAnswerComplete(safe, answers[0]), false);
    assert.equal(gradeQuizAnswers(parsed, answers).score, 0);
  }
  assert.equal(gradeQuizAnswers(parsed, [{ questionId: 'foreign', selectedIndices: [0, 1] }]).score, 0);
});

test('malformed matching questions and ambiguous duplicate answers are rejected', () => {
  assert.deepEqual(parseQuizQuestions([{ ...matching, pairs: [matching.pairs[0]] }]), []);
  assert.deepEqual(parseQuizQuestions([{ ...matching, pairs: [matching.pairs[0], matching.pairs[0]] }]), []);
  assert.deepEqual(parseQuizQuestions([{ ...matching, pairs: [{ prompt: '', answer: 'سائل' }, matching.pairs[1]] }]), []);
  assert.deepEqual(parseQuizQuestions([{ ...matching, type: 'unsupported' }]), []);
});

test('null answer indices do not become a correct first option', () => {
  const parsed = parseQuizQuestions(rawQuestions);
  assert.deepEqual(sanitizeQuizAnswers([{ questionId: 'q-1', selectedIndex: null }], parsed), []);
  assert.deepEqual(parseQuizQuestions([{ text: 'invalid', options: ['a', 'b'], correctIndex: null }]), []);
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
