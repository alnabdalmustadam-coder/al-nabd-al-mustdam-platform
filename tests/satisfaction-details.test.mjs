import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const makeCourse = (count, id = 1) => ({ id, slug: `course-${id}`, title: `دورة ${id}`, instructor: 'مدرب الدورة', image: '/logo.webp', category: 'admin', duration: '30 ساعة تدريبية معتمدة', lessonCount: count, status: 'published', professionalDevelopment: false,
  hearts: count, learners: count ? 1 : 0, lesson_hearts: Math.ceil(count / 2), quiz_hearts: Math.floor(count / 2),
  contents: Array.from({ length: count }, (_, index) => ({ content_kind: index % 2 ? 'quiz' : 'lesson', content_key: `item-${index + 1}`, title: `العنصر ${index + 1}`, hearts: 1 })),
});
const all = (tree, predicate) => { const found = []; function visit(node) { if (Array.isArray(node)) return node.forEach(visit); if (!node || typeof node !== 'object') return; if (predicate(node)) found.push(node); visit(node.props?.children); } visit(tree); return found; };
const text = node => typeof node === 'string' || typeof node === 'number' ? String(node) : Array.isArray(node) ? node.map(text).join('') : text(node?.props?.children || '');

function fixture(courses = []) {
  let component, cursor = 0, active, closes = 0, opens = 0;
  const states = new Map(), effects = [], loaded = new Map(), requests = [];
  const opener = { isConnected: true, focus() { active = opener; } }, closeButton = { focus() { active = closeButton; } };
  active = opener;
  const dialog = { open: false, showModal() { this.open = true; opens++; }, close() { this.open = false; closes++; } };
  const document = { documentElement: { style: { overflow: 'clip' } }, body: { style: { overflow: 'auto' } }, get activeElement() { return active; } };
  const react = {
    useId() { return `${component.name}-${cursor++}`; },
    useRef(initial) { const slots = states.get(component), index = cursor++; slots[index] ??= { current: initial }; return slots[index]; },
    useState(initial) { const slots = states.get(component), index = cursor++; slots[index] ??= { value: typeof initial === 'function' ? initial() : initial }; return [slots[index].value, next => { slots[index].value = typeof next === 'function' ? next(slots[index].value) : next; }]; },
    useEffect(fn, deps) { const slots = states.get(component), index = cursor++, previous = slots[index]; if (!previous || deps.some((item, i) => !Object.is(item, previous.deps[i]))) effects.push(() => { previous?.cleanup?.(); slots[index] = { deps, cleanup: fn() }; }); },
  };
  const jsx = (type, props) => { if (props?.ref) props.ref.current = type === 'dialog' ? dialog : closeButton; return { type, props }; };
  const stubs = { react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'lucide-react': new Proxy({}, { get: (_, name) => name }),
    '@/components/ui/CardImage': { CardImage: 'CardImage' }, '@/components/courses/editor/editor-select': { EditorSelect: 'EditorSelect' },
    '@/lib/learning/satisfaction-summary': { selectSatisfactionCourses: rows => rows },
  };
  function load(name, parent = '') {
    if (name in stubs) return stubs[name];
    if (name.endsWith('.css')) return { default: new Proxy({}, { get: (_, key) => key }) };
    const relative = name.startsWith('@/') ? name.slice(2) : path.posix.join(path.posix.dirname(parent), name);
    if (loaded.has(relative)) return loaded.get(relative);
    const extension = existsSync(new URL(`../${relative}.tsx`, import.meta.url)) ? 'tsx' : 'ts';
    const source = readFileSync(new URL(`../${relative}.${extension}`, import.meta.url), 'utf8');
    const exports = {}; loaded.set(relative, exports);
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    vm.runInNewContext(code, { exports, require: child => load(child, relative), document, AbortController, fetch: async url => { requests.push(url); return Response.json({ success: true, courses, learners: 1 }); } });
    return exports;
  }
  return { load, document, opener, closeButton, dialog, requests, active: () => active, opens: () => opens, closes: () => closes,
    render(Component, props) { component = Component; cursor = 0; if (!states.has(component)) states.set(component, []); const tree = Component(props); while (effects.length) effects.shift()(); return tree; },
    cleanup() { for (const slots of states.values()) for (const slot of slots) slot?.cleanup?.(); },
  };
}
const modulePath = '@/app/dashboard/admin/satisfaction/course-satisfaction';
const feedbackRows = tree => all(tree, node => node.type?.name === 'FeedbackRow');
const tick = async () => { for (let i = 0; i < 5; i++) await new Promise(resolve => setImmediate(resolve)); };

for (const count of [0, 2, 100]) test(`summary card mounts one details action and no content list with ${count} rated items`, () => {
  const f = fixture(), { CourseFeedbackCard } = f.load(modulePath); let selected;
  const course = makeCourse(count, 7), tree = f.render(CourseFeedbackCard, { course, onDetails: id => { selected = id; } });
  assert.equal(feedbackRows(tree).length, 0);
  assert.equal(all(tree, node => node.type?.name === 'SatisfactionMetrics').length, 1);
  const buttons = all(tree, node => node.type === 'button'); assert.equal(buttons.length, 1);
  assert.equal(buttons[0].props['aria-haspopup'], 'dialog'); assert.match(text(buttons[0]), /عرض التفاصيل/);
  buttons[0].props.onClick(); assert.equal(selected, 7);
});

test('details show every item, compose search with type filters, and recover from empty results', () => {
  const f = fixture(), { SatisfactionDetails } = f.load(modulePath), props = { course: makeCourse(100), onClose() {} };
  let tree = f.render(SatisfactionDetails, props);
  assert.equal(feedbackRows(tree).length, 100); assert.equal(feedbackRows(tree).at(-1).props.item.content_key, 'item-100');
  const tabs = () => all(tree, node => node.props?.['aria-pressed'] !== undefined);
  tabs()[2].props.onClick(); tree = f.render(SatisfactionDetails, props);
  assert.equal(feedbackRows(tree).length, 50); assert.ok(feedbackRows(tree).every(node => node.props.item.content_kind === 'quiz'));
  all(tree, node => node.type === 'input')[0].props.onChange({ target: { value: '100' } }); tree = f.render(SatisfactionDetails, props);
  assert.equal(feedbackRows(tree).length, 1); assert.equal(feedbackRows(tree)[0].props.item.content_key, 'item-100');
  all(tree, node => node.type === 'input')[0].props.onChange({ target: { value: 'غير موجود' } }); tree = f.render(SatisfactionDetails, props);
  assert.equal(feedbackRows(tree).length, 0); assert.match(text(tree), /لا توجد نتائج مطابقة/);
  all(tree, node => node.type === 'button' && text(node) === 'مسح التصفية')[0].props.onClick(); tree = f.render(SatisfactionDetails, props);
  assert.equal(feedbackRows(tree).length, 100); assert.equal(all(tree, node => node.type === 'input')[0].props.value, '');
  assert.equal(f.opens(), 1); assert.equal(f.requests.length, 0); f.cleanup();
});

test('modal activation, Escape and unmount restore focus and original page scroll styles', () => {
  const f = fixture(), { SatisfactionDetails } = f.load(modulePath); let closed = 0, prevented = 0, stopped = 0;
  const tree = f.render(SatisfactionDetails, { course: makeCourse(2), onClose: () => { closed++; } });
  assert.equal(tree.type, 'dialog'); assert.equal(f.dialog.open, true); assert.equal(f.active(), f.closeButton);
  assert.equal(f.document.documentElement.style.overflow, 'hidden'); assert.equal(f.document.body.style.overflow, 'hidden');
  tree.props.onCancel({ preventDefault() { prevented++; }, stopPropagation() { stopped++; } });
  assert.equal(closed, 1); assert.equal(prevented, 1); assert.equal(stopped, 1);
  f.cleanup(); assert.equal(f.dialog.open, false); assert.equal(f.closes(), 1); assert.equal(f.active(), f.opener);
  assert.equal(f.document.documentElement.style.overflow, 'clip'); assert.equal(f.document.body.style.overflow, 'auto');
});

test('backdrop clicks close the panel while drags originating inside it do not', () => {
  const f = fixture(), { SatisfactionDetails } = f.load(modulePath); let closed = 0;
  const tree = f.render(SatisfactionDetails, { course: makeCourse(0), onClose: () => { closed++; } });
  assert.match(text(tree), /بانتظار مشاركة الطلاب/);
  tree.props.onPointerDown({ target: {}, currentTarget: f.dialog });
  tree.props.onClick({ target: f.dialog, currentTarget: f.dialog }); assert.equal(closed, 0);
  tree.props.onPointerDown({ target: f.dialog, currentTarget: f.dialog });
  tree.props.onClick({ target: f.dialog, currentTarget: f.dialog }); assert.equal(closed, 1);
  all(tree, node => node.type === 'button' && node.props['aria-label'] === 'إغلاق تفاصيل الرضا')[0].props.onClick(); assert.equal(closed, 2); f.cleanup();
});

test('page opens only the selected course, closes it, and can open a different course without another request', async () => {
  const f = fixture([makeCourse(20, 1), makeCourse(0, 2)]), { default: Page } = f.load('@/app/dashboard/admin/satisfaction/page');
  f.render(Page); await tick(); let tree = f.render(Page);
  const cards = () => all(tree, node => node.type?.name === 'CourseFeedbackCard');
  assert.equal(cards().length, 2); assert.equal(all(tree, node => node.type?.name === 'SatisfactionDetails').length, 0);
  cards()[0].props.onDetails(1); tree = f.render(Page);
  let details = all(tree, node => node.type?.name === 'SatisfactionDetails'); assert.equal(details.length, 1); assert.equal(details[0].props.course.id, 1);
  details[0].props.onClose(); tree = f.render(Page); assert.equal(all(tree, node => node.type?.name === 'SatisfactionDetails').length, 0);
  cards()[1].props.onDetails(2); tree = f.render(Page); details = all(tree, node => node.type?.name === 'SatisfactionDetails');
  assert.equal(details.length, 1); assert.equal(details[0].props.course.id, 2); assert.equal(f.requests.length, 1);
  assert.equal(cards().length, 2); f.cleanup();
});

test('card and detail panel use the same summary and render the saved counts in English', () => {
  const f = fixture(), { CourseFeedbackCard, SatisfactionDetails } = f.load(modulePath);
  const course = { ...makeCourse(2), hearts: 1234, learners: 17, lesson_hearts: 1200, quiz_hearts: 34 };
  const card = f.render(CourseFeedbackCard, { course, onDetails() {} });
  const detail = f.render(SatisfactionDetails, { course, onClose() {} });
  const cardSummary = all(card, node => node.type?.name === 'SatisfactionMetrics')[0];
  const detailSummary = all(detail, node => node.type?.name === 'SatisfactionMetrics')[0];
  assert.equal(cardSummary.type, detailSummary.type);
  const values = all(f.render(cardSummary.type, cardSummary.props), node => node.type === 'dd').map(text);
  assert.deepEqual(values, ['1,234', '17', '1,200', '34']); f.cleanup();
});
