import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const published = { id: 1, slug: 'دورة-السلامة', title: 'دورة السلامة', price: 100, status: 'published', payload: { category: 'tech' } };
const stale = { id: 9, slug: 'deleted-course', title: 'Deleted Course', price: 100, status: 'published', category: 'tech' };
const compile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;

// Exercise the real store, public API and server page. A populated seed file
// deliberately remains available while live rows disappear or become drafts.
function fixture({ rows = [published], failure = null } = {}) {
  const records = structuredClone(rows);
  let localReads = 0;
  const db = { from(table) {
    assert.equal(table, 'course_catalog');
    const filters = [];
    const query = {
      select() { return query; }, order() { return query; },
      eq(key, value) { filters.push([key, value]); return query; },
      then(resolve, reject) {
        if (failure === 'throw') return Promise.reject(new Error('Offline')).then(resolve, reject);
        return Promise.resolve({
          data: failure ? null : records.filter(row => filters.every(([key, value]) => row[key] === value)),
          error: failure === 'error' ? { message: 'Unavailable' } : null,
        }).then(resolve, reject);
      },
    };
    return query;
  } };
  const jsx = (type, props) => ({ type, props });
  const modules = {
    'server-only': {},
    fs: { existsSync: () => true, readFileSync() { localReads++; return JSON.stringify([stale]); } },
    path,
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    'next/navigation': { notFound() { throw Object.assign(new Error('Not found'), { status: 404 }); } },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    './CourseDetailClient': { default: 'CourseDetailClient' },
    '@/lib/supabase': { getSupabaseAdmin: () => db },
    '@/lib/observability/logger': { logger: { warn() {}, error() {} } },
    '@/lib/security/auth': { requireInstructorOrAdmin: async () => ({ ok: true, role: 'ADMIN', user: { id: 'admin' } }), isAdminRole: () => true },
    '@/data/courses': { courses: [stale], getCourseBySlug: slug => slug === stale.slug ? stale : undefined },
  };
  const loaded = new Map();
  function load(name) {
    if (Object.hasOwn(modules, name)) return modules[name];
    if (loaded.has(name)) return loaded.get(name);
    const relative = name.startsWith('@/') ? name.slice(2) : name;
    const extension = relative.endsWith('/page') ? '.tsx' : '.ts';
    const source = readFileSync(new URL(`../${relative}${extension}`, import.meta.url), 'utf8');
    const exports = {};
    loaded.set(name, exports);
    vm.runInNewContext(compile(source), {
      exports, require: load, Request, Response, URL, crypto: globalThis.crypto,
      process: { env: { NODE_ENV: 'production' }, cwd: () => '/fixture' }, console: { error() {} },
    });
    return exports;
  }
  return {
    records, localReads: () => localReads,
    list: () => load('app/api/courses/route').GET(new Request('https://audit.invalid/api/courses')),
    management: () => load('@/lib/courses-store').getAllCoursesAsync({ includeUnpublished: true }),
    course: slug => load('@/lib/courses-store').getCourseBySlugAsync(slug),
    page: slug => load('app/courses/[slug]/page').default({ params: Promise.resolve({ slug }) }),
  };
}

for (const status of ['deleted', 'draft', 'archived']) {
  test(`${status} courses stay absent even when they exist in bundled data`, async () => {
    const f = fixture({ rows: status === 'deleted' ? [] : [{ ...published, slug: stale.slug, status }] });
    const response = await f.list();
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).courses, []);
    assert.equal(await f.course(stale.slug), undefined);
    await assert.rejects(f.page(stale.slug), { status: 404 });
    assert.equal(f.localReads(), 0);
  });
}

for (const failure of ['error', 'throw', 'null-data']) {
  test(`catalog ${failure} reports unavailability instead of publishing bundled courses`, async () => {
    const f = fixture({ failure });
    const response = await f.list();
    assert.equal(response.status, 503);
    assert.equal((await response.json()).success, false);
    await assert.rejects(f.page(stale.slug), { name: 'CoursePersistenceError' });
    assert.equal(f.localReads(), 0);
  });
}

test('deleting the last published course is reflected on the next request without a deployment', async () => {
  const f = fixture();
  assert.equal((await (await f.list()).json()).courses.length, 1);
  f.records.splice(0);
  assert.deepEqual((await (await f.list()).json()).courses, []);
  await assert.rejects(f.page(published.slug), { status: 404 });
});

test('details and recommendations use only published live rows', async () => {
  const second = { ...published, id: 2, slug: 'second-course' };
  const f = fixture({ rows: [published, second, { ...published, id: 3, slug: 'draft-course', status: 'draft' }] });
  const page = await f.page(encodeURIComponent(published.slug));
  assert.equal(page.props.course.id, published.id);
  assert.deepEqual(Array.from(page.props.relatedCourses, c => c.id), [2]);
  await assert.rejects(f.page(stale.slug), { status: 404 });
  assert.equal((await f.management()).length, 3);
});

const liveCourse = { ...stale, slug: 'دورة-حية', title: 'الدورة الحالية', description: 'وصف الدورة الحالية', image: '/uploads/live.webp', duration: '20 ساعة', curriculum: [{ id: 'lesson-1', title: 'درس حالي', videoUrl: 'https://example.invalid/video.mp4' }] };
const settle = () => new Promise(resolve => setImmediate(resolve));

// Execute real component effects and the shared catalog hook. Only rendering
// primitives, transport and the authenticated student's persistence are stubbed.
function mountPage(filename, initialCourses = []) {
  let catalog = initialCourses;
  let failure = false;
  let holdNext = false;
  const held = [];
  let cursor = 0;
  const slots = [];
  const pending = [];
  const window = new EventTarget();
  const document = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  const jsx = (type, props) => ({ type, props });
  const enrollment = { id: 'enr-1', course_id: liveCourse.slug, course_title: liveCourse.title, progress: 65 };
  const db = { auth: { getUser: async () => ({ data: { user: { id: 'student', email: 'student@example.invalid' } } }) }, from(table) {
    const query = {
      select() { return query; }, eq() { return query; }, order() { return query; },
      maybeSingle: async () => ({ data: { full_name: 'Student' } }),
      then(resolve, reject) { return Promise.resolve({ data: table === 'enrollments' ? [enrollment] : [] }).then(resolve, reject); },
    };
    return query;
  } };
  const react = {
    Suspense: 'Suspense',
    useState(initial) {
      const index = cursor++;
      slots[index] ??= { value: typeof initial === 'function' ? initial() : initial };
      return [slots[index].value, value => { slots[index].value = typeof value === 'function' ? value(slots[index].value) : value; }];
    },
    useEffect(effect, deps) {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
        slots[index] = { deps, cleanup: previous?.cleanup };
        pending.push(() => { slots[index].cleanup?.(); slots[index].cleanup = effect(); });
      }
    },
    useMemo(factory, deps) {
      const index = cursor++;
      if (!slots[index] || deps.some((value, i) => !Object.is(value, slots[index].deps[i]))) slots[index] = { deps, value: factory() };
      return slots[index].value;
    },
    useCallback(fn, deps) { return react.useMemo(() => fn, deps); },
  };
  const modules = {
    react,
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'Fragment' },
    'framer-motion': { motion: new Proxy({}, { get: (_target, name) => `motion.${String(name)}` }), AnimatePresence: 'AnimatePresence' },
    'lucide-react': new Proxy({}, { get: (_target, name) => String(name) }),
    'next/link': { __esModule: true, default: 'Link' },
    'next/navigation': { useParams: () => ({ courseSlug: liveCourse.slug, lessonId: 'lesson-1' }), useSearchParams: () => new URLSearchParams({ slug: liveCourse.slug }), useRouter: () => ({ push() {} }) },
    '@/data/courses': { courses: [stale], courseCategories: [{ key: 'all', label: 'الكل' }], getCourseBySlug: () => stale },
    '@/data/corporateCourses': { corporateCourses: [] },
    '@/components/ui/Button': { __esModule: true, default: 'Button' },
    '@/components/ui/CourseCard': { __esModule: true, default: 'CourseCard' },
    '@/components/ui/CardSkeleton': { CourseCardSkeleton: 'CourseCardSkeleton' },
    '@/components/ui/CardImage': { CardImage: 'CardImage' },
    '@/components/student/student-video-player': { StudentVideoPlayer: 'StudentVideoPlayer' },
    '@/components/student/progress-card': { ProgressCard: 'ProgressCard' },
    '@/utils/supabase/client': { createClient: () => db },
    '@/context/CartContext': { useCart: () => ({ cart: [], clearCart() {} }) },
    '@/lib/actions/student-actions': { getLessonNotes: () => [], saveCompletedLessons() {}, saveLessonNote() {}, saveQuizAttempt() {}, getCourseAllLessons: course => course.curriculum },
    '@/lib/ghl': { submitToGHL() {} },
  };
  const loaded = new Map();
  function load(name) {
    if (Object.hasOwn(modules, name)) return modules[name];
    if (loaded.has(name)) return loaded.get(name);
    const relative = name.startsWith('@/') ? `${name.slice(2)}.ts` : name;
    const exports = {};
    loaded.set(name, exports);
    vm.runInNewContext(compile(readFileSync(new URL(`../${relative}`, import.meta.url), 'utf8')), {
      exports, require: load, window, document, AbortController, URLSearchParams,
      setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
      console: { error() {} },
      fetch: async (url, options) => {
        if (url === '/api/courses') {
          assert.equal(options.cache, 'no-store');
          const response = failure ? new Response('', { status: 503 }) : Response.json({ success: true, courses: catalog });
          if (holdNext) {
            holdNext = false;
            return new Promise(resolve => held.push(() => resolve(response)));
          }
          return response;
        }
        if (url === '/api/auth/me') return Response.json({ user: { id: 'student', email: 'student@example.invalid' } });
        if (url.startsWith('/api/courses/complete-lesson?')) return Response.json({ success: true, completedLessonIds: [], progress: 65 });
        throw new Error(`Unexpected request ${url}`);
      },
    });
    return exports;
  }
  function expand(node) {
    if (Array.isArray(node)) return node.map(expand);
    if (!node || typeof node !== 'object') return node;
    if (typeof node.type === 'function') return expand(node.type(node.props));
    return { ...node, props: { ...node.props, children: expand(node.props?.children) } };
  }
  const Component = load(filename).default;
  const render = () => {
    cursor = 0;
    const tree = expand(Component());
    pending.splice(0).forEach(effect => effect());
    return tree;
  };
  return {
    initial: render(), render, enrollment,
    update(courses) { catalog = courses; window.dispatchEvent(new Event('nabd_courses_updated')); },
    fail() { failure = true; window.dispatchEvent(new Event('focus')); },
    recover(courses) { failure = false; catalog = courses; },
    holdRefresh() { holdNext = true; window.dispatchEvent(new Event('focus')); },
    release() { held.splice(0).forEach(resolve => resolve()); },
    unmount() { slots.forEach(slot => slot?.cleanup?.()); },
  };
}

function nodes(tree, predicate) {
  if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, predicate));
  if (!tree || typeof tree !== 'object') return [];
  return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
}
const renderedText = tree => JSON.stringify(tree);
const clientPages = [
  'app/courses/page.tsx', 'app/checkout/page.tsx', 'components/sections/HeroSection.tsx',
  'app/dashboard/student/courses/[courseSlug]/lessons/[lessonId]/page.tsx',
  'app/dashboard/student/pathways/page.tsx', 'app/dashboard/student/page.tsx',
  'app/dashboard/student/courses/page.tsx', 'app/trainees/skills-applications/page.tsx',
  'app/trainees/career-consulting/page.tsx',
];

for (const filename of clientPages) {
  test(`empty catalog never renders bundled courses in ${filename}`, async t => {
    const ui = mountPage(filename);
    t.after(ui.unmount);
    assert.ok(!renderedText(ui.initial).includes(stale.title));
    await settle();
    const tree = ui.render();
    assert.ok(!renderedText(tree).includes(stale.title));
    assert.equal(nodes(tree, node => node.props?.href?.includes('/courses/') || node.type === 'CourseCard' || node.type === 'StudentVideoPlayer').length, 0);
  });
}

test('catalog view clears deleted rows, reports failures and recovers through retry', async t => {
  const ui = mountPage('app/courses/page.tsx', [liveCourse]);
  t.after(ui.unmount);
  await settle();
  assert.equal(nodes(ui.render(), node => node.type === 'CourseCard').length, 1);
  ui.update([]);
  await settle();
  assert.equal(nodes(ui.render(), node => node.type === 'CourseCard').length, 0);
  ui.fail();
  await settle();
  let tree = ui.render();
  assert.equal(nodes(tree, node => node.props?.role === 'alert').length, 1);
  ui.recover([liveCourse]);
  nodes(tree, node => node.type === 'button' && node.props.children === 'إعادة المحاولة')[0].props.onClick();
  ui.render();
  await settle();
  tree = ui.render();
  assert.equal(nodes(tree, node => node.type === 'CourseCard').length, 1);
});

test('hero keeps a valid slide when the active last course disappears', async t => {
  const ui = mountPage('components/sections/HeroSection.tsx', [liveCourse, { ...liveCourse, id: 2, slug: 'second' }, { ...liveCourse, id: 3, slug: 'third' }]);
  t.after(ui.unmount);
  await settle();
  const third = nodes(ui.render(), node => node.props?.['aria-label'] === 'انتقل إلى شريحة 3')[0];
  third.props.onClick();
  ui.render();
  ui.update([liveCourse]);
  await settle();
  const tree = ui.render();
  assert.equal(nodes(tree, node => node.props?.href === `/courses/${liveCourse.slug}`).length, 1);
  assert.equal(nodes(tree, node => node.type === 'img' && node.props.src === liveCourse.image).length, 1);
  ui.update([]);
  await settle();
  assert.equal(nodes(ui.render(), node => node.props?.href?.startsWith('/courses/')).length, 0);
});

for (const filename of ['app/checkout/page.tsx', 'app/dashboard/student/courses/[courseSlug]/lessons/[lessonId]/page.tsx']) {
  test(`an open course becomes unavailable after unpublishing in ${filename}`, async t => {
    const ui = mountPage(filename, [liveCourse]);
    t.after(ui.unmount);
    await settle();
    assert.ok(renderedText(ui.render()).includes(liveCourse.title));
    ui.update([]);
    await settle();
    assert.ok(!renderedText(ui.render()).includes(liveCourse.title));
    ui.fail();
    await settle();
    assert.ok(renderedText(ui.render()).includes('تعذر تحميل الدورة'));
  });
}

for (const filename of ['app/dashboard/student/page.tsx', 'app/dashboard/student/courses/page.tsx']) {
  test(`student view hides unavailable courses while preserving enrollment progress in ${filename}`, async t => {
    const ui = mountPage(filename, [liveCourse]);
    t.after(ui.unmount);
    await settle();
    assert.ok(renderedText(ui.render()).includes(liveCourse.title));
    ui.update([]);
    await settle();
    assert.ok(!renderedText(ui.render()).includes(liveCourse.title));
    assert.equal(ui.enrollment.progress, 65);
    ui.update([liveCourse]);
    await settle();
    assert.ok(renderedText(ui.render()).includes(liveCourse.title));
  });
}

for (const filename of ['app/courses/page.tsx', 'app/dashboard/student/page.tsx', 'app/dashboard/student/courses/page.tsx']) {
  test(`a late response cannot restore a course removed by a newer response in ${filename}`, async t => {
    const ui = mountPage(filename, [liveCourse]);
    t.after(ui.unmount);
    await settle();
    ui.render();
    ui.holdRefresh();
    ui.update([]);
    await settle();
    assert.ok(!renderedText(ui.render()).includes(liveCourse.title));
    ui.release();
    await settle();
    assert.ok(!renderedText(ui.render()).includes(liveCourse.title));
  });
}
