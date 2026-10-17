import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as crypto from 'node:crypto';
import ts from 'typescript';
import * as model from '../lib/quizzes/model.ts';
import { resolveCourseQuiz, toPublicCourse } from '../lib/quizzes/course-quiz.ts';
import * as identifiers from '../lib/public-courses.ts';
const validation = {};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../lib/security/validation.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: validation, require: (name) => { if (name !== 'server-only') throw new Error(name); return {}; } });

const quiz = { title: 'اختبار الوحدة', passingScore: 70, questions: [
  { id: 'mc', question: 'اختر الإجابة', options: ['أ', 'ب'], correctIndex: 1 },
  { id: 'match', type: 'matching', question: 'صل الإجابات', pairs: [
    { id: 'p1', prompt: 'الماء', answer: 'سائل' }, { id: 'p2', prompt: 'الحجر', answer: 'صلب' },
  ], options: [], correctIndex: -1 },
] };

function fixture({ enrolled = true, status = 'active', authenticated = true, owner = 'student-1', failWrites = false } = {}) {
  const user = { id: 'student-1', email: 'student@example.invalid' };
  const course = { id: 91, slug: 'دورة-تجريبية', title: 'دورة', curriculum: [
    { id: 'unit', title: 'الوحدة', items: [{ id: 'lesson', title: 'الاختبار', type: 'quiz', quizData: structuredClone(quiz) }] },
  ] };
  const rows = { enrollments: enrolled ? [{ id: 'enrollment', user_id: owner, email: user.email, course_id: course.slug, status }] : [], xapi_state: [], xapi_statements: [] };
  const db = { from(table) {
    const filters = []; let operation = 'read'; let input;
    const filtered = () => rows[table].filter((row) => filters.every((filter) => filter(row)));
    const run = (single = false) => {
      if (failWrites && operation !== 'read') return { data: null, error: { message: 'write failed' } };
      let selected;
      if (operation === 'insert') {
        const duplicate = rows[table].some((row) => table === 'xapi_statements' ? row.statement_id === input.statement_id
          : table === 'xapi_state' && row.activity_id === input.activity_id && row.agent_email === input.agent_email && row.state_id === input.state_id);
        if (duplicate) return { data: null, error: { code: '23505' } };
        selected = [structuredClone(input)]; rows[table].push(...selected);
      } else if (operation === 'update') { selected = filtered(); selected.forEach((row) => Object.assign(row, structuredClone(input))); }
      else selected = filtered();
      return { data: structuredClone(single ? selected[0] || null : selected), error: null };
    };
    const query = { select() { return query; }, eq(key, value) { filters.push((row) => row[key] === value); return query; },
      in(key, values) { filters.push((row) => values.includes(row[key])); return query; },
      insert(value) { operation = 'insert'; input = value; return query; }, update(value) { operation = 'update'; input = value; return query; },
      maybeSingle: async () => run(true), then(resolve, reject) { return Promise.resolve(run()).then(resolve, reject); } };
    return query;
  } };
  const modules = {
    'node:crypto': crypto,
    'server-only': {},
    'next/server': { NextResponse: { json: (value, options = {}) => Response.json(value, options) } },
    '@/lib/security/auth': { requireUser: async () => authenticated ? { ok: true, user } : { ok: false, response: Response.json({}, { status: 401 }) } },
    '@/lib/security/rate-limit': { consumeRateLimit: () => ({ allowed: true }) },
    '@/lib/supabase': { getSupabaseAdmin: () => db },
    '@/lib/courses-store': { getCourseBySlugAsync: async (id) => [course.slug, String(course.id)].includes(id) ? course : null },
    '@/lib/public-courses': identifiers,
    '@/lib/security/student-access': { isEnrollmentActive: (value) => !['revoked', 'cancelled', 'canceled', 'inactive'].includes(value) },
    '@/lib/security/validation': validation,
    '@/lib/quizzes/course-quiz': { resolveCourseQuiz }, '@/lib/quizzes/model': model,
  };
  function load(name) {
    if (name in modules) return modules[name];
    const source = readFileSync(new URL(`../${name.slice(2)}.ts`, import.meta.url), 'utf8');
    const exports = {}; modules[name] = exports;
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
      { exports, require: load, URL, Date, console: { error() {} } });
    return exports;
  }
  const source = readFileSync(new URL('../app/api/courses/quiz-attempt/route.ts', import.meta.url), 'utf8');
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
    { exports, require: load, URL, Date, console: { error() {} } });
  const request = (method, body = {}) => new Request(`https://example.invalid/api/courses/quiz-attempt?${new URLSearchParams({ courseId: course.slug, lessonId: 'lesson', ...body })}`,
    { method, ...(method === 'GET' ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId: course.slug, lessonId: 'lesson', ...body }) }) });
  const invoke = async (method, body) => { const response = await exports[method](request(method, body)); return { status: response.status, payload: await response.json() }; };
  return { rows, course, user, invoke };
}

test('catalog strips answer keys from course, unit and legacy lesson metadata without mutating management data', () => {
  const course = { title: 'course', finalExam: structuredClone(quiz), curriculum: [{ quizData: structuredClone(quiz), items: [{ quizData: structuredClone(quiz) }], lessons: [{ quizData: structuredClone(quiz) }] }] };
  const safe = toPublicCourse(course);
  assert.equal(JSON.stringify(safe).includes('correctIndex'), false);
  assert.equal(JSON.stringify(safe).includes('"answer"'), false);
  assert.equal(course.finalExam.questions[0].correctIndex, 1);
});

test('quiz resolver respects lesson ownership and legacy identifiers instead of inventing sample quizzes', () => {
  const f = fixture();
  assert.equal(resolveCourseQuiz(f.course, 'foreign'), null);
  assert.equal(resolveCourseQuiz(f.course, 'lesson').key, 'lesson:lesson');
  const legacy = { curriculum: [{ title: 'legacy', quizData: quiz, lessons: ['a', 'b'] }] };
  assert.equal(resolveCourseQuiz(legacy, 'sub-1-2').key, 'section:sec-1');
  assert.equal(resolveCourseQuiz({ curriculum: [] }, 'lesson-1'), null);
});

for (const options of [{ authenticated: false }, { enrolled: false }, ...['revoked', 'cancelled', 'inactive', 'suspended', 'expired'].map((status) => ({ status })), { owner: 'another-user' }]) {
  test(`internal quiz rejects unauthorized access: ${JSON.stringify(options)}`, async () => {
    const f = fixture(options); const result = await f.invoke('POST', { action: 'start' });
    assert.equal(result.status, options.authenticated === false ? 401 : 403);
    assert.equal(f.rows.xapi_state.length, 0);
  });
}

test('start, draft, resume and submit use server snapshots and persist an authoritative result', async () => {
  const f = fixture();
  const meta = await f.invoke('GET'); assert.equal(meta.status, 200); assert.equal(meta.payload.attempt, null);
  const start = await f.invoke('POST', { action: 'start' }); assert.equal(start.status, 200);
  assert.equal(JSON.stringify(start.payload.attempt).includes('correctIndex'), false);
  const repeatedStart = await f.invoke('POST', { action: 'start' });
  assert.equal(start.payload.attempt.id, repeatedStart.payload.attempt.id);
  const questions = f.rows.xapi_state[0].state_data.questions;
  const answers = [{ questionId: 'mc', selectedIndex: 1 }, { questionId: 'match', selectedIndices: questions[1].correctIndices }];
  assert.equal((await f.invoke('PATCH', { attemptId: start.payload.attempt.id, answers })).status, 200);
  const resumed = await f.invoke('GET'); assert.equal(resumed.payload.attempt.savedAnswers.length, 2);
  const submitted = await f.invoke('POST', { action: 'submit', attemptId: start.payload.attempt.id, answers, score: 0, passed: false });
  assert.equal(submitted.status, 200); assert.equal(submitted.payload.result.score, 100); assert.equal(submitted.payload.result.correctAnswers, 2);
  assert.equal(f.rows.xapi_statements.length, 1); assert.equal(f.rows.xapi_statements[0].result_score, 1);
  const replay = await f.invoke('POST', { action: 'submit', attemptId: start.payload.attempt.id, answers: [] });
  assert.deepEqual(replay.payload.result, submitted.payload.result); assert.equal(f.rows.xapi_statements.length, 1);
  assert.equal((await f.invoke('GET')).payload.result.score, 100);
  const retake = await f.invoke('POST', { action: 'start' }); assert.notEqual(retake.payload.attempt.id, start.payload.attempt.id);
  assert.equal(f.rows.xapi_statements.length, 1); // Previous results are retained.
});

test('missing or forged assignments and foreign attempt identifiers cannot record a passing result', async () => {
  const f = fixture(); const start = await f.invoke('POST', { action: 'start' });
  assert.equal((await f.invoke('POST', { action: 'submit', attemptId: 'forged', answers: [], score: 100 })).status, 409);
  assert.equal((await f.invoke('POST', { action: 'submit', attemptId: start.payload.attempt.id, score: 100, answers: [{ questionId: 'mc', selectedIndex: 1 }, { questionId: 'match', selectedIndices: [0, 0] }] })).status, 400);
  assert.equal(f.rows.xapi_statements.length, 0);
});

test('changing assessment content creates a new version without mixing old answers or results', async () => {
  const f = fixture(); const start = await f.invoke('POST', { action: 'start' });
  f.course.curriculum[0].items[0].quizData.questions[0].correctIndex = 0;
  const meta = await f.invoke('GET'); assert.equal(meta.payload.attempt, null);
  assert.equal((await f.invoke('POST', { action: 'submit', attemptId: start.payload.attempt.id, answers: [] })).status, 409);
});

test('expired attempts, backend write failures and missing quizzes fail visibly', async () => {
  const f = fixture(); const start = await f.invoke('POST', { action: 'start' });
  f.rows.xapi_state[0].state_data.expiresAt = new Date(Date.now() - 120_000).toISOString();
  assert.equal((await f.invoke('POST', { action: 'submit', attemptId: start.payload.attempt.id, answers: [] })).status, 409);
  assert.equal(f.rows.xapi_statements.length, 0);
  const broken = fixture({ failWrites: true }); assert.equal((await broken.invoke('POST', { action: 'start' })).status, 503);
  f.course.curriculum[0].items[0].quizData = undefined;
  assert.equal((await f.invoke('GET')).status, 404);
});
