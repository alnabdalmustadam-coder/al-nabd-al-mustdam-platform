import test from 'node:test';
import assert from 'node:assert/strict';
import { connectMatchingEndpoints, disconnectMatchingEndpoint } from '../lib/quizzes/matching.ts';
import { gradeQuizAnswers, isQuizAnswerComplete, parseQuizQuestions, toStudentQuizQuestions } from '../lib/quizzes/model.ts';

const prompt = index => ({ side: 'prompt', index });
const option = index => ({ side: 'option', index });

test('matching connects in either direction without changing the saved draft in place', () => {
  const draft = [-1, -1, -1];
  const first = connectMatchingEndpoints(draft, 3, prompt(0), option(2));
  assert.deepEqual(first, [2, -1, -1]);
  assert.deepEqual(connectMatchingEndpoints(first, 3, option(0), prompt(1)), [2, 0, -1]);
  assert.deepEqual(draft, [-1, -1, -1]);
});

test('moving an occupied answer releases its former question and the new question previous answer', () => {
  const draft = [2, 0, 1];
  assert.deepEqual(connectMatchingEndpoints(draft, 3, option(0), prompt(0)), [0, -1, 1]);
  assert.deepEqual(connectMatchingEndpoints(draft, 3, prompt(1), option(1)), [2, 1, -1]);
  assert.deepEqual(draft, [2, 0, 1]);
});

test('dropping onto the existing partner is idempotent', () => {
  assert.deepEqual(connectMatchingEndpoints([1, 0], 2, prompt(0), option(1)), [1, 0]);
});

test('same-column and invalid drops cannot create an assignment', () => {
  for (const [source, target] of [
    [prompt(0), prompt(1)], [option(0), option(1)], [prompt(-1), option(0)],
    [prompt(2), option(0)], [option(2), prompt(0)], [prompt(0.5), option(1)], [option(NaN), prompt(0)],
  ]) assert.equal(connectMatchingEndpoints([-1, -1], 2, source, target), null);
});

test('a connection can be removed from either end without changing other connections', () => {
  assert.deepEqual(disconnectMatchingEndpoint([2, 0, 1], prompt(1)), [2, -1, 1]);
  assert.deepEqual(disconnectMatchingEndpoint([2, 0, 1], option(2)), [-1, 0, 1]);
});

test('restored and newly connected pairs use the existing completion and server grading contract', () => {
  const definitions = parseQuizQuestions([{ id: 'matching', type: 'matching', question: 'صل الدول بعواصمها', pairs: [
    { prompt: 'مصر', answer: 'القاهرة' }, { prompt: 'السعودية', answer: 'الرياض' }, { prompt: 'الأردن', answer: 'عمّان' },
  ] }]);
  const question = toStudentQuizQuestions(definitions)[0];
  let selections = [-1, -1, -1];
  const answer = () => ({ questionId: question.id, selectedIndex: -1, selectedIndices: selections });
  for (let index = 0; index < 3; index++) {
    assert.equal(isQuizAnswerComplete(question, answer()), false);
    selections = connectMatchingEndpoints(selections, 3, option(definitions[0].correctIndices[index]), prompt(index));
  }
  assert.equal(isQuizAnswerComplete(question, answer()), true);
  assert.equal(gradeQuizAnswers(definitions, [answer()]).score, 100);
  selections = disconnectMatchingEndpoint(selections, option(selections[1]));
  assert.equal(isQuizAnswerComplete(question, answer()), false);
});
