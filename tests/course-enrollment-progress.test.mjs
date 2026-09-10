import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const arabicSlug = 'hazmat-التعامل-مع-المواد-الخطرة';
const student = { id: 'student-1', email: 'student@example.invalid' };
const videoLessonId = '11111111-1111-4111-8111-111111111111';

// Execute the actual enrollment/progress routes and identifier/lesson helpers.
// Only authentication, catalog I/O, database I/O and xAPI transport are replaced.
function fixture({ slug = arabicSlug, enrolled = true, storedId, status = 'active', authenticated = true, readError = false, paidEnrollmentDisabled = false } = {}) {
  const course = { id: 91, slug, ghlCourseId: 'course-hazmat-2026', title: 'دورة المواد الخطرة', price: 500, status: 'published', curriculum: [
    { id: 'section-1', title: 'السلامة', items: [{ id: 'درس-١', title: 'المقدمة' }, { id: 'درس-٢', title: 'المخاطر' }] },
  ] };
  const rows = {
    enrollments: enrolled ? [{ id: 'enrollment-1', user_id: student.id, email: student.email, course_id: storedId || slug, progress: 0, status }] : [],
    profiles: [{ id: student.id, email: student.email, full_name: 'Test Student', national_id: '' }],
    xapi_statements: [],
    lessons: [{ id: videoLessonId, course_id: slug, duration_minutes: 1 }],
    lesson_progress: [],
  };
  const writes = [];
  const statements = [];
  const catalogLookups = [];
  const db = { from(table) {
    assert.ok(table in rows, `Unexpected table ${table}`);
    const filters = [];
    let limit = Infinity;
    let operation = 'read';
    let values;
    let head = false;
    const filtered = () => rows[table].filter(row => filters.every(filter => filter(row))).slice(0, limit);
    const result = single => {
      if (readError && operation === 'read' && table === 'enrollments') return { data: null, error: { message: 'Database unavailable' } };
      let selected;
      if (operation === 'insert') {
        selected = [{ id: `created-${rows[table].length}`, ...values }];
        rows[table].push(...selected);
      } else if (operation === 'update') {
        selected = filtered();
        selected.forEach(row => Object.assign(row, values));
      } else if (operation === 'upsert') {
        let existing = rows[table].find(row => row.user_id === values.user_id && row.lesson_id === values.lesson_id);
        if (existing) Object.assign(existing, values);
        else { existing = { id: 'lesson-progress-1', ...values, 'lessons.course_id': slug }; rows[table].push(existing); }
        selected = [existing];
      } else selected = filtered();
      if (operation !== 'read') writes.push({ table, operation, values: structuredClone(values) });
      return { data: head ? null : single ? structuredClone(selected[0] || null) : structuredClone(selected), count: selected.length, error: null };
    };
    const query = {
      select(_columns, options = {}) { head = options.head === true; return query; },
      eq(key, value) { filters.push(row => row[key] === value); return query; },
      in(key, values) { filters.push(row => values.includes(row[key])); return query; },
      limit(value) { limit = value; return query; },
      ilike(key, pattern) {
        const regex = new RegExp(`^${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.')}$`, 'iu');
        filters.push(row => regex.test(row[key])); return query;
      },
      insert(input) { operation = 'insert'; values = input; return query; },
      update(input) { operation = 'update'; values = input; return query; },
      upsert(input) { operation = 'upsert'; values = input; return query; },
      async maybeSingle() { return result(true); },
      async single() { return result(true); },
      then(resolve, reject) { return Promise.resolve(result(false)).then(resolve, reject); },
    };
    return query;
  } };
  const activity = (params, verb) => ({ actor: { email: params.email }, verb: { display: { 'en-US': verb } }, object: { id: `https://nabdtraining.com/courses/${params.courseId}` } });
  const modules = {
    'server-only': {},
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    '@/lib/supabase': { supabase: db, getSupabaseAdmin: () => db },
    '@/lib/security/auth': { requireUser: async () => authenticated ? { ok: true, user: student, role: 'STUDENT' } : { ok: false, response: Response.json({ success: false }, { status: 401 }) } },
    '@/lib/courses-store': {
      getCourseBySlugAsync: async identifier => { catalogLookups.push(identifier); return load('@/lib/public-courses').findCourseByIdentifier([course], identifier); },
    },
    '@/lib/xapi': {
      buildActor: params => params,
      buildStatement: params => params,
      stmtRegistered: params => activity(params, 'registered'),
      stmtProgressed: params => activity(params, 'progressed'),
      storeStatement: async statement => {
        statements.push(statement);
        rows.xapi_statements.push({ actor_email: statement.actor.email, object_id: statement.object.id, verb_display: statement.verb.display['en-US'] });
      },
    },
  };
  const loaded = new Map();
  function load(name) {
    if (Object.hasOwn(modules, name)) return modules[name];
    if (loaded.has(name)) return loaded.get(name);
    const source = readFileSync(new URL(`../${name.startsWith('@/') ? name.slice(2) : name}.ts`, import.meta.url), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const exports = {};
    loaded.set(name, exports);
    vm.runInNewContext(compiled, {
      exports, require: load, Request, Response, URL, crypto: globalThis.crypto, console: { error() {}, warn() {} },
      process: { env: { TEMPORARY_FREE_ENROLLMENT: paidEnrollmentDisabled ? 'false' : 'true' } },
    });
    return exports;
  }
  const post = (route, body) => load(`app/api/${route}/route`).POST(new Request(`https://audit.invalid/api/${route}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }));
  return {
    rows, writes, statements, course, catalogLookups,
    enroll: courseId => post('courses/enroll', { courseId }),
    complete: (courseId, lessonId = 'درس-١') => post('courses/complete-lesson', { courseId, lessonId }),
    progress: (courseSlug, progress = 100) => post('courses/update-progress', { courseSlug, progress }),
    get: courseId => load('app/api/courses/complete-lesson/route').GET(new Request(`https://audit.invalid/api/courses/complete-lesson?courseId=${encodeURIComponent(courseId)}`)),
    video: () => post('lessons/progress', { lessonId: videoLessonId, watchedSeconds: 60, lastPositionSeconds: 60, isCompleted: true }),
  };
}

for (const identifier of [arabicSlug, encodeURIComponent(arabicSlug), `course-${arabicSlug}`, '91', 'course-hazmat-2026']) {
  test(`enrollment and lesson progress round-trip for ${identifier}`, async () => {
    const f = fixture({ enrolled: false });
    assert.equal((await f.enroll(identifier)).status, 200);
    assert.equal(f.rows.enrollments[0].course_id, arabicSlug);
    assert.equal(f.rows.enrollments[0].course_title, f.course.title);
    assert.equal(f.statements[0].object.id, `https://nabdtraining.com/courses/${arabicSlug}`);
    assert.equal((await f.complete(identifier)).status, 200);
    const first = await f.get(identifier);
    assert.equal(first.status, 200);
    assert.deepEqual((await first.json()).completedLessonIds, ['درس-١']);
    assert.equal((await f.complete(identifier, 'درس-٢')).status, 200);
    assert.equal((await f.complete(identifier, 'درس-٢')).status, 200);
    const final = await (await f.get(identifier)).json();
    assert.equal(final.completedCount, 2);
    assert.equal(final.progress, 99);
    assert.equal(final.completionPendingAssessment, true);
    assert.equal((await f.progress(identifier)).status, 200);
    assert.equal(f.rows.enrollments[0].progress, 99);
    assert.equal(f.rows.enrollments[0].status, 'active');
    assert.equal((await f.enroll(encodeURIComponent(arabicSlug))).status, 200);
    assert.equal(f.rows.enrollments.length, 1);
    assert.equal(f.rows.enrollments[0].progress, 99);
  });
}

test('English and underscore identifiers keep working', async () => {
  const f = fixture({ slug: 'english_course-2026', enrolled: false });
  assert.equal((await f.enroll(f.course.slug)).status, 200);
  assert.equal((await f.complete(f.course.slug)).status, 200);
  assert.equal((await f.get(f.course.slug)).status, 200);
  assert.equal((await f.progress(f.course.slug, 40)).status, 200);
  assert.equal(f.rows.enrollments[0].progress, 40);
});

test('a long Arabic slug generated from an allowed course title is accepted', async () => {
  const f = fixture({ slug: `دورة-${'السلامة-'.repeat(20)}المهنية`, enrolled: false });
  assert.equal((await f.enroll(encodeURIComponent(f.course.slug))).status, 200);
  assert.equal((await f.complete(f.course.slug)).status, 200);
});

for (const storedId of ['91', 'course-91', 'hazmat-2026', 'course-hazmat-2026', `course-${arabicSlug}`]) {
  test(`legacy enrollment ${storedId} is reused for an Arabic request`, async () => {
    const f = fixture({ storedId });
    assert.equal((await f.enroll(arabicSlug)).status, 200);
    assert.equal(f.rows.enrollments.length, 1);
    assert.equal((await f.complete(arabicSlug)).status, 200);
    assert.equal((await f.progress(arabicSlug, 70)).status, 200);
    assert.equal(f.rows.enrollments[0].progress, 70);
  });
}

for (const identifier of ['', 'course-', '../admin', 'bad/slug', 'bad%2Fslug', '%D8%A', '%25D8%25A7', 'x?role=admin', 'x#fragment', 'x'.repeat(201)]) {
  test(`invalid identifier is rejected before catalog lookup: ${identifier.slice(0, 40)}`, async () => {
    const f = fixture();
    assert.equal((await f.enroll(identifier)).status, 400);
    assert.equal((await f.complete(identifier)).status, 400);
    assert.equal((await f.progress(identifier)).status, 400);
    assert.equal((await f.get(identifier)).status, 400);
    assert.equal(f.catalogLookups.length, 0);
    assert.equal(f.writes.length, 0);
  });
}

test('unknown courses, foreign lessons, missing or revoked enrollments cannot save progress', async () => {
  const f = fixture();
  assert.equal((await f.enroll('دورة-غير-موجودة')).status, 404);
  assert.equal((await f.complete(arabicSlug, 'foreign-lesson')).status, 400);
  for (const options of [{ enrolled: false }, { status: 'revoked' }]) {
    const blocked = fixture(options);
    assert.equal((await blocked.get(arabicSlug)).status, 403);
    assert.equal((await blocked.complete(arabicSlug)).status, 403);
    assert.equal((await blocked.progress(arabicSlug)).status, 403);
    assert.equal(blocked.writes.length, 0);
  }
});

test('authentication and the existing optional payment gate still apply', async () => {
  const f = fixture({ authenticated: false });
  assert.equal((await f.enroll(arabicSlug)).status, 401);
  assert.equal((await f.get(arabicSlug)).status, 401);
  assert.equal((await f.complete(arabicSlug)).status, 401);
  assert.equal((await f.progress(arabicSlug)).status, 401);
  const paid = fixture({ paidEnrollmentDisabled: true, enrolled: false });
  assert.equal((await paid.enroll(arabicSlug)).status, 403);
  assert.equal(paid.writes.length, 0);
});

test('an enrollment lookup failure does not create a duplicate registration', async () => {
  const f = fixture({ readError: true });
  assert.equal((await f.enroll(arabicSlug)).status, 500);
  assert.equal(f.rows.enrollments.length, 1);
  assert.equal(f.writes.length, 0);
});

test('the legacy video telemetry endpoint cannot grant 100 percent academic completion', async () => {
  const f = fixture();
  const response = await f.video();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).courseProgress, 99);
  assert.equal(f.rows.enrollments[0].progress, 99);
  assert.equal(f.rows.enrollments[0].status, 'active');
});
