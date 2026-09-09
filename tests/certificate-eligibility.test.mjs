import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const student = { id: 'student-1', email: 'student@example.invalid', user_metadata: {} };
const course = { id: 101, slug: 'safety-course', title: 'Safety Course', duration: '36 ساعة' };
const enrolled = (overrides = {}) => ({
  id: 'enrollment-1', user_id: student.id, email: student.email,
  course_id: course.slug, course_title: course.title, progress: 0, status: 'active',
  ...overrides,
});

// Run the real route code. Only auth, persistence and NextResponse are replaced;
// the entitlement decision itself is never mocked.
function fixture({ enrollment = enrolled(), databaseError = null, certificates = [], authenticated = true } = {}) {
  const issued = [...certificates];
  const writes = [];
  const templates = [{ id: 'template-1', courseTitle: course.title, autoIssue: true }];
  const db = { from(table) {
    const filters = [];
    let mutation;
    const selected = () => {
      const rows = table === 'enrollments'
        ? (enrollment ? [enrollment] : [])
        : table === 'profiles' ? [{ id: student.id, full_name: 'Trusted Student Name' }] : [];
      return rows.filter(row => filters.every(([key, values]) => values.includes(row[key])));
    };
    const query = {
      select() { return query; },
      eq(key, value) { filters.push([key, [value]]); return query; },
      in(key, values) { filters.push([key, values]); return query; },
      update(value) { mutation = value; return query; },
      async maybeSingle() { return { data: databaseError ? null : selected()[0] || null, error: databaseError }; },
      then(resolve, reject) {
        if (mutation) writes.push({ table, values: mutation });
        return Promise.resolve({ data: databaseError ? null : selected(), error: databaseError }).then(resolve, reject);
      },
    };
    return query;
  } };
  const modules = {
    'server-only': {},
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    '@/lib/security/auth': { requireUser: async () => authenticated
      ? { ok: true, user: student, role: 'STUDENT' }
      : { ok: false, response: Response.json({ success: false }, { status: 401 }) } },
    '@/lib/supabase': { supabase: db, getSupabaseAdmin: () => db },
    '@/lib/courses-store': { getAllCoursesAsync: async () => [course] },
    '@/data/courses': { getCourseBySlug: () => undefined },
    '@/lib/certificates-store': {
      CertificatePersistenceError: class CertificatePersistenceError extends Error {},
      getAllIssuedCertificates: async () => [...issued],
      getAllTemplates: async () => templates,
      formatCertificateGrade: (score, grade) => grade || (score == null ? 'SERVER_DEFAULT_GRADE' : `SCORE:${score}`),
      formatCertificateHours: (duration, hours) => hours || duration || 'SERVER_DEFAULT_HOURS',
      issueCertificate: async data => {
        const certificate = { id: `issued-${issued.length}`, status: 'active', ...data };
        writes.push({ table: 'certificates', values: data });
        issued.push(certificate);
        return certificate;
      },
    },
  };
  const loaded = new Map();
  function load(name) {
    if (Object.hasOwn(modules, name)) return modules[name];
    if (loaded.has(name)) return loaded.get(name);
    const relative = name.startsWith('@/') ? name.slice(2) : name;
    const source = readFileSync(new URL(`../${relative}.ts`, import.meta.url), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const exports = {};
    loaded.set(name, exports);
    vm.runInNewContext(compiled, {
      exports, require: load, Request, Response, URL, console: { error() {}, warn() {} },
    });
    return exports;
  }
  return {
    writes, issued,
    post: body => load('app/api/student/certificates/auto-issue/route').POST(new Request('https://audit.invalid/api/student/certificates/auto-issue', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })),
    get: () => load('app/api/student/certificates/route').GET(new Request('https://audit.invalid/api/student/certificates')),
  };
}

test('a client-claimed final exam and score cannot complete a course or issue a certificate', async () => {
  const f = fixture();
  const response = await f.post({ courseSlug: course.slug, isFinalExam: true, score: 100, grade: 'Forged distinction', hours: '9999 hours' });
  assert.equal(response.status, 403);
  assert.equal(f.writes.length, 0);
});

test('99 percent progress remains ineligible even with a client-claimed passing score', async () => {
  const f = fixture({ enrollment: enrolled({ progress: 99 }) });
  assert.equal((await f.post({ courseSlug: course.slug, isFinalExam: true, score: 100 })).status, 403);
  assert.equal(f.writes.length, 0);
});

test('trusted completion still issues with server-owned identity, title, grade and hours', async () => {
  const f = fixture({ enrollment: enrolled({ status: 'completed', progress: 100, grade: 'Stored grade', hours: 'Stored hours' }) });
  const response = await f.post({
    courseSlug: course.slug, courseTitle: 'Forged course', studentName: 'Forged name',
    studentEmail: 'other@example.invalid', score: 100, grade: 'Forged grade', hours: '9999 hours',
  });
  assert.equal(response.status, 200);
  const certificate = (await response.json()).certificate;
  assert.equal(certificate.studentName, 'Trusted Student Name');
  assert.equal(certificate.studentEmail, student.email);
  assert.equal(certificate.courseTitle, course.title);
  assert.equal(certificate.grade, 'Stored grade');
  assert.equal(certificate.hours, 'Stored hours');
  assert.equal(f.writes.filter(write => write.table === 'enrollments').length, 0);
});

test('trusted completion without optional grade or hours ignores forged client values', async () => {
  const f = fixture({ enrollment: enrolled({ status: 'completed', progress: 100 }) });
  const response = await f.post({ courseSlug: course.slug, score: 100, grade: 'Forged grade', hours: '9999 hours' });
  assert.equal(response.status, 200);
  const certificate = (await response.json()).certificate;
  assert.equal(certificate.grade, 'SERVER_DEFAULT_GRADE');
  assert.equal(certificate.hours, course.duration);
});

for (const status of ['revoked', 'cancelled', 'canceled', 'inactive', 'suspended', 'expired']) {
  test(`a ${status} enrollment cannot issue a certificate via POST or GET even at 100 percent`, async () => {
    const f = fixture({ enrollment: enrolled({ progress: 100, status }) });
    assert.equal((await f.post({ courseSlug: course.slug, score: 100, isFinalExam: true })).status, 403);
    assert.equal((await f.get()).status, 200);
    assert.equal(f.writes.length, 0);
  });
}

test('an enrollment belonging to another user ID cannot authorize issuance through a matching email', async () => {
  const f = fixture({ enrollment: enrolled({ user_id: 'another-user', progress: 100, status: 'completed' }) });
  assert.equal((await f.post({ courseSlug: course.slug })).status, 403);
  await f.get();
  assert.equal(f.writes.length, 0);
});

test('legacy email-linked completions remain eligible when no user ID was assigned', async () => {
  const f = fixture({ enrollment: enrolled({ user_id: null, progress: 100, status: 'completed' }) });
  assert.equal((await f.post({ courseSlug: course.slug })).status, 200);
  assert.equal(f.issued.length, 1);
});

test('certificate listing issues only for a trusted completion and preserves exact-course deduplication', async () => {
  const f = fixture({ enrollment: enrolled({ progress: 100, status: 'completed', grade: 'Stored grade' }) });
  assert.equal((await f.get()).status, 200);
  assert.equal(f.issued.length, 1);
  const response = await f.post({ courseSlug: course.slug });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).alreadyIssued, true);
  assert.equal(f.issued.length, 1);
});

test('a certificate for a similarly named course is not returned as this course certificate', async () => {
  const f = fixture({
    enrollment: enrolled({ progress: 100, status: 'completed' }),
    certificates: [{ id: 'other-cert', studentEmail: student.email, courseTitle: 'Advanced Safety Course', status: 'active' }],
  });
  const response = await f.post({ courseSlug: course.slug });
  assert.equal(response.status, 200);
  assert.notEqual((await response.json()).certificate.id, 'other-cert');
});

test('database verification failure cannot authorize issuance or look like a successful empty list', async () => {
  const f = fixture({ databaseError: { message: 'Simulated database outage' } });
  assert.equal((await f.post({ courseSlug: course.slug, score: 100, isFinalExam: true })).status, 503);
  assert.equal((await f.get()).status, 503);
  assert.equal(f.writes.length, 0);
});

test('unauthenticated requests cannot read or issue certificates', async () => {
  const f = fixture({ authenticated: false });
  assert.equal((await f.post({ courseSlug: course.slug })).status, 401);
  assert.equal((await f.get()).status, 401);
  assert.equal(f.writes.length, 0);
});
