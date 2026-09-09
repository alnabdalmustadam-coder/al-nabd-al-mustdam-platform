import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const instructorId = 'instructor-1';
const own = { id: 11, slug: 'own-course', title: 'Own Course', price: 50, status: 'draft', payload: { trainerId: instructorId, curriculum: [{ id: 'lesson-1', title: 'Original lesson' }] } };
const foreign = { id: 22, slug: 'foreign-course', title: 'Foreign Course', price: 80, status: 'published', payload: { trainerId: 'instructor-2', curriculum: [{ id: 'lesson-1', title: 'Original lesson' }] } };
const unassigned = { id: 33, slug: 'admin-course', title: 'Admin Course', price: 100, status: 'published', payload: { curriculum: [{ id: 'lesson-1', title: 'Original lesson' }] } };

// Exercise the real routes AND persistence code so a route/store identifier
// mismatch or a slug-conflict upsert cannot be hidden by a mocked save function.
function fixture({ role = 'INSTRUCTOR', authenticated = true, rows = [own, foreign, unassigned], readError = false, reassignBeforeWrite = false, collideBeforeInsert = false } = {}) {
  const records = structuredClone(rows);
  const writes = [];
  const db = { from(table) {
    assert.equal(table, 'course_catalog');
    let operation = 'read';
    let values;
    const filters = [];
    const valueAt = (row, key) => key === 'payload->>trainerId' ? row.payload?.trainerId : row[key];
    const selected = () => records.filter(row => filters.every(([key, value]) => valueAt(row, key) === value));
    function execute(single = false) {
      if (operation === 'read' && readError) return { data: null, error: { code: '08006', message: 'Database unavailable' } };
      if (operation === 'read') return { data: single ? selected()[0] || null : structuredClone(selected()), error: null };
      if (reassignBeforeWrite && ['update', 'delete'].includes(operation)) {
        records.find(row => row.id === own.id).payload.trainerId = 'instructor-2';
      }
      if (collideBeforeInsert && ['insert', 'upsert'].includes(operation)) {
        records.push({ ...structuredClone(foreign), id: 77, slug: values.slug });
      }
      let affected;
      if (operation === 'insert' || operation === 'upsert') {
        const collision = records.find(row => row.slug === values.slug);
        if (collision && operation === 'insert') return { data: null, error: { code: '23505', message: 'Duplicate slug' } };
        if (collision) Object.assign(collision, structuredClone(values));
        else records.push({ ...structuredClone(values), id: 100 + records.length });
        affected = [collision || records.at(-1)];
      } else {
        affected = selected();
        if (operation === 'update') {
          if (affected.length && records.some(row => row.slug === values.slug && !affected.includes(row))) return { data: null, error: { code: '23505' } };
          affected.forEach(row => Object.assign(row, structuredClone(values)));
        } else affected.forEach(row => records.splice(records.indexOf(row), 1));
      }
      if (affected.length) writes.push({ operation, records: structuredClone(affected) });
      return { data: single ? affected[0] || null : structuredClone(affected), error: single && !affected.length ? { code: 'PGRST116' } : null };
    }
    const query = {
      select() { return query; }, order() { return query; },
      eq(key, value) { filters.push([key, value]); return query; },
      update(input) { operation = 'update'; values = input; return query; },
      insert(input) { operation = 'insert'; values = input; return query; },
      upsert(input) { operation = 'upsert'; values = input; return query; },
      delete() { operation = 'delete'; return query; },
      async single() { return execute(true); },
      async maybeSingle() { return execute(true); },
      then(resolve, reject) { return Promise.resolve(execute()).then(resolve, reject); },
    };
    return query;
  } };
  const isAdminRole = value => ['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN'].includes(value);
  const modules = {
    'server-only': {},
    'fs': { existsSync: () => true, readFileSync: () => JSON.stringify([{ ...foreign, trainerId: instructorId }]) },
    'path': path,
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    '@/lib/supabase': { getSupabaseAdmin: () => db },
    '@/lib/observability/logger': { logger: { error() {}, warn() {} } },
    '@/lib/security/auth': {
      isAdminRole,
      requireInstructorOrAdmin: async () => !authenticated
        ? { ok: false, response: Response.json({ success: false }, { status: 401 }) }
        : !isAdminRole(role) && !['INSTRUCTOR', 'TRAINER', 'TEACHER'].includes(role)
          ? { ok: false, response: Response.json({ success: false }, { status: 403 }) }
          : { ok: true, user: { id: instructorId }, role },
    },
  };
  const loaded = new Map();
  function load(name) {
    if (Object.hasOwn(modules, name)) return modules[name];
    if (loaded.has(name)) return loaded.get(name);
    const relative = name.startsWith('@/') ? name.slice(2) : name;
    const source = readFileSync(new URL(`../${relative}.ts`, import.meta.url), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    const exports = {};
    loaded.set(name, exports);
    vm.runInNewContext(compiled, {
      exports, require: load, Request, Response, URL, crypto: globalThis.crypto,
      console: { error() {}, warn() {} }, process: { env: { NODE_ENV: 'production' }, cwd: () => '/fixture' },
    });
    return exports;
  }
  const request = (url, method = 'GET', body) => new Request(`https://audit.invalid${url}`, {
    method, ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
  });
  return {
    records, writes,
    post: body => load('app/api/courses/route').POST(request('/api/courses', 'POST', body)),
    delete: identifier => load('app/api/courses/route').DELETE(request(`/api/courses?slug=${encodeURIComponent(identifier)}`, 'DELETE')),
    list: () => load('app/api/courses/route').GET(request('/api/courses?mine=1')),
    lesson: (method, slug) => load('app/api/admin/courses/[slug]/lessons/route')[method](
      request(`/api/admin/courses/${slug}/lessons?lessonId=lesson-1`, method, method === 'POST' ? { id: 'lesson-1', title: 'Changed lesson' } : undefined),
      { params: Promise.resolve({ slug }) },
    ),
  };
}

for (const body of [
  { id: foreign.id, slug: own.slug, title: 'Changed' },
  { id: foreign.id, slug: 'brand-new-slug', title: 'Changed' },
  { title: foreign.title },
  { slug: 'FOREIGN COURSE!!', title: 'Changed' },
  { id: 999, slug: foreign.slug, title: 'Changed' },
  { id: unassigned.id, slug: unassigned.slug, title: 'Changed' },
]) {
  test(`instructor cannot overwrite another or unassigned course: ${JSON.stringify(body)}`, async () => {
    const f = fixture();
    const response = await f.post(body);
    assert.equal(response.status, 403);
    assert.equal(f.writes.length, 0);
  });
}

test('instructor cannot transfer an existing course or create one for another trainer', async () => {
  for (const body of [
    { id: own.id, slug: own.slug, title: own.title, trainerId: 'instructor-2' },
    { slug: 'new-course', title: 'New Course', trainerId: 'instructor-2' },
  ]) {
    const f = fixture();
    assert.equal((await f.post(body)).status, 403);
    assert.equal(f.writes.length, 0);
  }
});

test('instructor can create, rename, and delete their own course', async () => {
  const f = fixture();
  const created = await f.post({ slug: 'new-course', title: 'New Course' });
  assert.equal(created.status, 200);
  assert.equal((await created.json()).course.trainerId, instructorId);
  const updated = await f.post({ id: own.id, slug: 'renamed-course', title: 'Renamed course' });
  assert.equal(updated.status, 200);
  assert.equal(f.records.find(row => row.id === own.id).slug, 'renamed-course');
  assert.equal((await f.delete(String(own.id))).status, 200);
  assert.equal(f.records.some(row => row.id === own.id), false);
});

for (const row of [foreign, unassigned]) {
  test(`instructor cannot delete ${row.slug}`, async () => {
    const f = fixture();
    assert.equal((await f.delete(row.slug)).status, 403);
    assert.equal(f.writes.length, 0);
  });
  for (const method of ['GET', 'POST', 'DELETE']) {
    test(`lesson ${method} rejects another or unassigned course: ${row.slug}`, async () => {
      const f = fixture();
      assert.equal((await f.lesson(method, row.slug)).status, 403);
      assert.equal(f.writes.length, 0);
    });
  }
}

test('instructor can manage lessons in their unpublished course', async () => {
  const f = fixture();
  assert.equal((await f.lesson('GET', own.slug)).status, 200);
  assert.equal((await f.lesson('POST', own.slug)).status, 200);
  assert.equal(f.records.find(row => row.id === own.id).payload.curriculum[0].title, 'Changed lesson');
  assert.equal((await f.lesson('DELETE', own.slug)).status, 200);
  assert.equal(f.records.find(row => row.id === own.id).payload.curriculum.length, 0);
});

test('management list includes own drafts and excludes other and unassigned courses', async () => {
  const response = await fixture().list();
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).courses.map(course => course.id), [own.id]);
});

test('admins retain cross-course editing, assignment, and lesson management', async () => {
  const f = fixture({ role: 'ADMIN' });
  assert.equal((await f.post({ id: foreign.id, slug: foreign.slug, title: 'Admin edit', trainerId: instructorId })).status, 200);
  assert.equal((await f.lesson('POST', unassigned.slug)).status, 200);
  assert.equal((await f.delete(unassigned.slug)).status, 200);
});

test('clearing an assignment removes the previous instructor ownership', async () => {
  const admin = fixture({ role: 'ADMIN' });
  assert.equal((await admin.post({ id: own.id, slug: own.slug, title: own.title, trainerId: '' })).status, 200);
  const instructor = fixture({ rows: admin.records });
  assert.equal((await instructor.post({ id: own.id, slug: own.slug, title: 'Changed' })).status, 403);
  assert.equal((await instructor.delete(own.slug)).status, 403);
  assert.equal(instructor.writes.length, 0);
});

test('database read failure cannot authorize using stale local course ownership', async () => {
  const f = fixture({ readError: true });
  assert.equal((await f.post({ id: foreign.id, title: foreign.title, slug: foreign.slug })).status, 503);
  assert.equal((await f.delete(foreign.slug)).status, 503);
  assert.equal((await f.lesson('POST', foreign.slug)).status, 503);
  assert.equal((await f.list()).status, 503);
  assert.equal(f.writes.length, 0);
});

test('ownership reassigned after lookup is checked again by the database mutation', async () => {
  for (const action of ['post', 'delete']) {
    const f = fixture({ reassignBeforeWrite: true });
    const response = action === 'post'
      ? await f.post({ id: own.id, title: own.title, slug: own.slug })
      : await f.delete(own.slug);
    assert.equal(response.status, 403);
    assert.equal(f.writes.length, 0);
  }
});

test('a concurrent slug collision cannot turn creation into an unauthorized upsert', async () => {
  const f = fixture({ collideBeforeInsert: true });
  assert.equal((await f.post({ slug: 'new-course', title: 'New course' })).status, 409);
  assert.equal(f.writes.length, 0);
  assert.equal(f.records.find(row => row.id === 77).payload.trainerId, 'instructor-2');
});

test('students and unauthenticated visitors cannot manage courses or lessons', async () => {
  for (const options of [{ role: 'STUDENT' }, { authenticated: false }]) {
    const f = fixture(options);
    const expected = options.authenticated === false ? 401 : 403;
    assert.equal((await f.post({ title: 'New course' })).status, expected);
    assert.equal((await f.delete(own.slug)).status, expected);
    assert.equal((await f.lesson('POST', own.slug)).status, expected);
    assert.equal((await f.list()).status, expected);
    assert.equal(f.writes.length, 0);
  }
});
