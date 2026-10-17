import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const plain = value => JSON.parse(JSON.stringify(value));
const courses = [
  { id: 1, slug: 'law', title: 'نظام العمل السعودي', instructor: 'أحمد', image: '/law.webp', category: 'management', duration: '12 ساعة', status: 'published', professionalDevelopment: true,
    curriculum: [{ id: 'unit', title: 'وحدة', items: [{ id: 'video', title: 'فيديو' }, { id: 'doc', title: 'مستند', type: 'doc' }] }], finalExam: { questions: [{ correctIndex: 3 }] }, trainerId: 'private-trainer-id' },
  { id: 2, slug: 'data', title: 'إدخال البيانات', instructor: 'سمير', curriculum: [], image: '/data.webp', category: 'data', status: 'draft' },
  { id: 3, slug: 'office', title: 'أعمال مكتبية', instructor: 'AHMED', curriculum: [{ id: 'old', title: 'درس قديم' }], category: 'admin' },
];
const snapshot = {
  learners: 2, // The same learners can appear in more than one course.
  courses: [{ course_id: 1, hearts: 9, learners: 2, lesson_hearts: 6, quiz_hearts: 3, user_id: 'do-not-expose' }, { course_id: 3, hearts: 4, learners: 2, lesson_hearts: 4, quiz_hearts: 0 }],
  contents: [
    { course_id: 1, content_kind: 'quiz', content_key: 'section:unit', title: 'اختبار', hearts: 3, user_id: 'do-not-expose' },
    { course_id: 1, content_kind: 'lesson', content_key: 'video', title: 'درس', hearts: 6 },
    { course_id: 3, content_kind: 'lesson', content_key: 'old', title: 'درس قديم', hearts: 4 },
    { course_id: 999, content_kind: 'lesson', content_key: 'deleted', title: 'دورة محذوفة', hearts: 90 },
  ],
};

function fixture({ authenticated = true, admin = true, error = false, missing = false } = {}) {
  const calls = [], loaded = new Map();
  const stubs = {
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    '@/lib/security/auth': { requireAdmin: async () => !authenticated || !admin ? { ok: false, response: Response.json({ success: false }, { status: authenticated ? 403 : 401 }) } : { ok: true } },
    '@/lib/courses-store': { getAllCoursesAsync: async options => { calls.push(['courses', options]); return structuredClone(courses); } },
    '@/lib/supabase': { getSupabaseAdmin: () => ({ rpc: async name => { calls.push(['rpc', name]); return { data: missing ? null : structuredClone(snapshot), error: error ? { message: 'unavailable' } : null }; } }) },
  };
  function load(name) {
    if (name in stubs) return stubs[name];
    if (loaded.has(name)) return loaded.get(name);
    const source = readFileSync(new URL(`../${name.replace(/^@\//, '')}.ts`, import.meta.url), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const exports = {}; loaded.set(name, exports);
    vm.runInNewContext(compiled, { exports, require: load, console: { error() {} } });
    return exports;
  }
  return { load, calls, get: () => load('app/api/admin/satisfaction/route').GET(new Request('https://test.invalid/api/admin/satisfaction')) };
}

test('satisfaction API returns course artwork and aggregate feedback without answers or learner identities', async () => {
  const f = fixture(), response = await f.get(), payload = await response.json();
  assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(payload.learners, 2); assert.equal(payload.courses.reduce((sum, item) => sum + item.learners, 0), 4);
  assert.equal(payload.courses.length, 3);
  assert.deepEqual(payload.courses.map(item => item.lessonCount), [2, 0, 1]);
  assert.equal(payload.courses[0].image, '/law.webp'); assert.equal(payload.courses[0].professionalDevelopment, true);
  assert.deepEqual(payload.courses[0].contents.map(item => [item.content_kind, item.content_key, item.hearts]), [['lesson', 'video', 6], ['quiz', 'section:unit', 3]]);
  assert.equal(payload.courses[1].hearts, 0); assert.equal(payload.courses[1].status, 'draft'); assert.deepEqual(payload.courses[1].contents, []);
  assert.doesNotMatch(JSON.stringify(payload), /do-not-expose|private-trainer|correctIndex|دورة محذوفة|user_id|finalExam/);
  assert.deepEqual(plain(f.calls), [['rpc', 'course_satisfaction_summary'], ['courses', { includeUnpublished: true }]]);
});

for (const options of [{ authenticated: false }, { admin: false }]) test(`satisfaction aggregates require admin access: ${JSON.stringify(options)}`, async () => {
  const f = fixture(options), response = await f.get();
  assert.equal(response.status, options.authenticated === false ? 401 : 403); assert.equal(f.calls.length, 0);
});

for (const options of [{ error: true }, { missing: true }]) test(`satisfaction failure does not masquerade as zero feedback: ${JSON.stringify(options)}`, async () => {
  const response = await fixture(options).get(), payload = await response.json();
  assert.equal(response.status, 503); assert.equal(payload.success, false); assert.equal(payload.courses, undefined);
});

test('search, feedback-state filters and sorting compose without mutating course or content order', () => {
  const { buildSatisfactionSummary, selectSatisfactionCourses } = fixture().load('@/lib/learning/satisfaction-summary');
  const data = buildSatisfactionSummary(courses, snapshot), before = JSON.stringify(data);
  const ids = (query, filter, sort) => plain(selectSatisfactionCourses(data.courses, query, filter, sort).map(item => item.id));
  assert.deepEqual(ids('', 'all', 'hearts'), [1, 3, 2]);
  assert.deepEqual(ids('  أحمد ', 'rated', 'hearts'), [1]);
  assert.deepEqual(ids('ahmed', 'rated', 'learners'), [3]);
  assert.deepEqual(ids('البيانات', 'waiting', 'title'), [2]);
  assert.deepEqual(ids('السعودي', 'waiting', 'hearts'), []);
  assert.deepEqual(ids('', 'rated', 'learners'), [3, 1]);
  assert.equal(JSON.stringify(data), before);
});
