import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import {
  COURSES_LOAD_ERROR,
  fetchPublicCourses,
  findCourseByIdentifier,
} from '../lib/public-courses.ts';

const source = await readFile(new URL('../components/sections/CoursesShowcase.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const settle = () => new Promise((resolve) => setImmediate(resolve));
const course = (image = '/uploads/new-cover.webp') => ({
  id: 8, slug: 'nebosh-course', title: 'دورة النيبوش', category: 'corporate', image,
});
const response = (courses) => Response.json({ success: true, courses });

test('new Arabic course slugs and external course IDs resolve to the live catalog record', () => {
  const liveCourse = {
    ...course('/uploads/hazmat.webp'),
    id: 91,
    slug: 'hazmat-التعامل-مع-المواد-الخطرة',
    ghlCourseId: 'course-hazmat-2026',
  };

  assert.equal(findCourseByIdentifier([liveCourse], liveCourse.slug), liveCourse);
  assert.equal(findCourseByIdentifier([liveCourse], `course-${liveCourse.slug}`), liveCourse);
  assert.equal(findCourseByIdentifier([liveCourse], '91'), liveCourse);
  assert.equal(findCourseByIdentifier([liveCourse], 'hazmat-2026'), liveCourse);
});

// Exercise the component's effects, event handlers and rendered props without
// a browser or production writes. This is a unit harness, not an E2E browser.
function mountShowcase() {
  const state = [];
  let cursor = 0;
  let previousDeps;
  let pendingEffect;
  let cleanup;
  const window = new EventTarget();
  const document = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  const jsx = (type, props, key) => ({ type, props, key });
  const modules = {
    react: {
      useState(initial) {
        const index = cursor++;
        if (!(index in state)) state[index] = initial;
        return [state[index], (value) => {
          state[index] = typeof value === 'function' ? value(state[index]) : value;
        }];
      },
      useEffect(effect, deps) {
        if (!previousDeps || deps.some((value, index) => !Object.is(value, previousDeps[index]))) {
          previousDeps = deps;
          pendingEffect = effect;
        }
      },
    },
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'Fragment' },
    'next/link': { default: 'Link' },
    'framer-motion': { motion: { div: 'motion.div' } },
    '@/components/ui/CourseCard': { default: 'CourseCard' },
    '@/components/ui/CardSkeleton': { CourseCardSkeleton: 'CourseCardSkeleton' },
    '@/data/courses': {
      courseCategories: [{ key: 'all', label: 'الكل' }, { key: 'corporate', label: 'إدارة وأعمال' }],
    },
    '@/lib/public-courses': { COURSES_LOAD_ERROR, fetchPublicCourses },
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, window, document, AbortController,
    require(name) {
      assert.ok(name in modules, `Unexpected dependency: ${name}`);
      return modules[name];
    },
  });
  const render = () => {
    cursor = 0;
    const tree = exports.default();
    if (pendingEffect) {
      cleanup?.();
      cleanup = pendingEffect();
      pendingEffect = undefined;
    }
    return tree;
  };
  const initial = render();
  return { initial, render, window, document, unmount: () => cleanup?.() };
}

function nodes(tree, predicate) {
  if (Array.isArray(tree)) return tree.flatMap((child) => nodes(child, predicate));
  if (!tree || typeof tree !== 'object') return [];
  return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
}
const cards = (tree) => nodes(tree, (node) => node.type === 'CourseCard');

test('homepage starts with skeletons and renders the current API cover, not bundled seed images', async (t) => {
  const current = course();
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/courses');
    assert.equal(options.cache, 'no-store');
    assert.ok(options.signal instanceof AbortSignal);
    return response([current]);
  });
  const ui = mountShowcase();
  t.after(ui.unmount);
  assert.equal(cards(ui.initial).length, 0);
  assert.equal(nodes(ui.initial, (node) => node.type === 'CourseCardSkeleton').length, 6);
  await settle();
  assert.deepEqual(cards(ui.render())[0].props.course, current);
  assert.doesNotMatch(source, /import\s*\{[^}]*\bcourses\b[^}]*\}\s*from\s*["']@\/data\/courses/);
});

test('returning to the home tab or receiving an admin update refreshes images and titles', async (t) => {
  let current = course('/uploads/first.webp');
  t.mock.method(globalThis, 'fetch', async () => response([current]));
  const ui = mountShowcase();
  t.after(ui.unmount);
  await settle();
  for (const event of ['focus', 'nabd_courses_updated', 'pageshow', 'online']) {
    current = { ...current, image: `/uploads/${event}.webp`, title: `updated-${event}` };
    ui.window.dispatchEvent(new Event(event));
    await settle();
    assert.deepEqual(cards(ui.render())[0].props.course, current);
  }
  current = course('/uploads/visible-again.webp');
  ui.document.dispatchEvent(new Event('visibilitychange'));
  await settle();
  assert.equal(cards(ui.render())[0].props.course.image, current.image);
});

test('an empty live catalog removes old cards instead of restoring the nine seed courses', async (t) => {
  let current = [course()];
  t.mock.method(globalThis, 'fetch', async () => response(current));
  const ui = mountShowcase();
  t.after(ui.unmount);
  await settle();
  assert.equal(cards(ui.render()).length, 1);
  current = [];
  ui.window.dispatchEvent(new Event('nabd_courses_updated'));
  await settle();
  const tree = ui.render();
  assert.equal(cards(tree).length, 0);
  assert.equal(nodes(tree, (node) => node.props?.role === 'status')[0].props.children, 'لا توجد دورات متاحة حاليًا.');
});

test('failed initial requests show a retry action and recover without displaying seed images', async (t) => {
  let failing = true;
  t.mock.method(globalThis, 'fetch', async () => failing
    ? new Response('unavailable', { status: 503 }) : response([course()]));
  const ui = mountShowcase();
  t.after(ui.unmount);
  await settle();
  let tree = ui.render();
  assert.equal(cards(tree).length, 0);
  assert.equal(nodes(tree, (node) => node.props?.role === 'alert').length, 1);
  const retry = nodes(tree, (node) => node.type === 'button' && node.props.children === 'إعادة المحاولة')[0];
  failing = false;
  retry.props.onClick();
  ui.render();
  await settle();
  tree = ui.render();
  assert.equal(nodes(tree, (node) => node.props?.role === 'alert').length, 0);
  assert.equal(cards(tree)[0].props.course.image, course().image);
});

test('a slower obsolete response cannot overwrite a newly uploaded course cover', async (t) => {
  const pending = [];
  t.mock.method(globalThis, 'fetch', (_url, options) => new Promise((resolve) => {
    pending.push({ resolve, signal: options.signal });
  }));
  const ui = mountShowcase();
  t.after(ui.unmount);
  ui.window.dispatchEvent(new Event('focus'));
  assert.equal(pending[0].signal.aborted, true);
  pending[1].resolve(response([course('/uploads/newest.webp')]));
  await settle();
  pending[0].resolve(response([course('/logo.webp')]));
  await settle();
  assert.equal(cards(ui.render())[0].props.course.image, '/uploads/newest.webp');
});

test('unmounting cancels requests and removes every refresh listener', async (t) => {
  let signal;
  const fetchMock = t.mock.method(globalThis, 'fetch', (_url, options) => {
    signal = options.signal;
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason)));
  });
  const ui = mountShowcase();
  ui.unmount();
  assert.equal(signal.aborted, true);
  for (const event of ['focus', 'nabd_courses_updated', 'pageshow', 'online']) {
    ui.window.dispatchEvent(new Event(event));
  }
  ui.document.dispatchEvent(new Event('visibilitychange'));
  await settle();
  assert.equal(fetchMock.mock.callCount(), 1);
});

for (const payload of [{ success: false, courses: [] }, { success: true }, { success: true, courses: {} }, null]) {
  test(`invalid public catalog response is rejected: ${JSON.stringify(payload)}`, async (t) => {
    t.mock.method(globalThis, 'fetch', async () => Response.json(payload));
    await assert.rejects(fetchPublicCourses(), { message: COURSES_LOAD_ERROR });
  });
}
