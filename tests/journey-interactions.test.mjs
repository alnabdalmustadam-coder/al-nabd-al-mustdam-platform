import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const nodes = (tree, predicate) => { const found = []; function visit(node) { if (Array.isArray(node)) return node.forEach(visit); if (!node || typeof node !== 'object') return; if (predicate(node)) found.push(node); visit(node.props?.children); } visit(tree); return found; };
const text = node => typeof node === 'string' || typeof node === 'number' ? String(node) : Array.isArray(node) ? node.map(text).join('') : text(node?.props?.children || '');
const tick = async () => { for (let i = 0; i < 5; i++) await new Promise(resolve => setImmediate(resolve)); };
function fixture(fetcher) {
  const states = new Map(), effects = [], loaded = new Map(), requests = [];
  let scope, cursor;
  const react = {
    useState(initial) { const slots = states.get(scope), i = cursor++; slots[i] ??= { value: typeof initial === 'function' ? initial() : initial }; return [slots[i].value, update => { slots[i].value = typeof update === 'function' ? update(slots[i].value) : update; }]; },
    useRef(initial) { const slots = states.get(scope), i = cursor++; slots[i] ??= { current: initial }; return slots[i]; },
    useEffect(fn, deps) { const slots = states.get(scope), i = cursor++, prev = slots[i]; if (!prev || deps.some((value, index) => !Object.is(value, prev.deps[index]))) effects.push(() => { prev?.cleanup?.(); slots[i] = { deps, cleanup: fn() }; }); },
    useMemo(fn, deps) { const slots = states.get(scope), i = cursor++; if (!slots[i] || deps.some((value, index) => !Object.is(value, slots[i].deps[index]))) slots[i] = { deps, value: fn() }; return slots[i].value; },
    useCallback(fn, deps) { return react.useMemo(() => fn, deps); },
  };
  const jsx = (type, props) => ({ type, props });
  const stubs = { react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'lucide-react': new Proxy({}, { get: (_, key) => key }), 'next/image': { default: 'Image' }, 'next/link': { default: 'Link' },
    '@/components/quizzes/quiz-question': { QuizQuestionInput: 'QuizQuestionInput', QuizQuestionReview: 'QuizQuestionReview' },
    './student-video-player': { StudentVideoPlayer: 'StudentVideoPlayer' }, './course-document-viewer': { CourseDocumentViewer: 'CourseDocumentViewer' },
    './course-resources-panel': { CourseResourcesPanel: 'CourseResourcesPanel' }, './satisfaction-heart': { SatisfactionHeart: 'SatisfactionHeart' },
  };
  function load(name, parent = '') {
    if (name in stubs) return stubs[name];
    if (name.endsWith('.css')) return { default: new Proxy({}, { get: (_, key) => key }) };
    const relative = name.startsWith('@/') ? name.slice(2) : path.posix.join(path.posix.dirname(parent), name);
    if (loaded.has(relative)) return loaded.get(relative);
    const ext = existsSync(new URL(`../${relative}.tsx`, import.meta.url)) ? 'tsx' : 'ts';
    const exports = {}; loaded.set(relative, exports);
    const code = ts.transpileModule(readFileSync(new URL(`../${relative}.${ext}`, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    vm.runInNewContext(code, { exports, require: child => load(child, relative), AbortController, URL, URLSearchParams, Date,
      setTimeout, clearTimeout, requestAnimationFrame: cb => cb(), window: { matchMedia: () => ({ matches: true }) }, localStorage: { getItem: () => null, setItem() {} },
      fetch: async (url, options) => { requests.push({ url, options }); return fetcher?.(url, options) || Response.json({ success: true }); },
    });
    return exports;
  }
  return { load, requests, render(Component, props, key = Component) { scope = key; cursor = 0; if (!states.has(scope)) states.set(scope, []); const tree = Component(props); while (effects.length) effects.shift()(); return tree; }, cleanup() { for (const slots of states.values()) for (const slot of slots) slot?.cleanup?.(); } };
}

test('sequential diagnostic quiz shows one question, preserves answers when going back, and accepts a low score', async () => {
  const questions = [1,2].map(i => ({ id: `q${i}`, type: 'multiple_choice', text: `سؤال ${i}`, options: ['أ', 'ب'] }));
  let submitted;
  const f = fixture((_url, options) => {
    if (options?.method === 'POST') { submitted = JSON.parse(options.body); return Response.json({ success: true, result: { attemptId: 'attempt', title: 'قبلي', score: 0, passed: false, passPercentage: 70, correctAnswers: 0, totalQuestions: 2, results: [] } }); }
    return Response.json({ success: true, attempt: { id: 'attempt', title: 'قبلي', passPercentage: 70, questions, savedAnswers: [] } });
  });
  const { InternalQuizPanel } = f.load('@/components/student/internal-quiz-panel'); let ready = false;
  const props = { courseId: 'course', lessonId: '__journey_pre__', sequential: true, diagnostic: true, onResult: value => { ready = value; } };
  f.render(InternalQuizPanel, props); await tick(); let tree = f.render(InternalQuizPanel, props);
  const buttons = () => nodes(tree, node => node.type === 'button');
  assert.equal(nodes(tree, node => node.type === 'QuizQuestionInput').length, 1);
  assert.equal(buttons().find(node => text(node) === 'السؤال التالي').props.disabled, true);
  nodes(tree, node => node.type === 'QuizQuestionInput')[0].props.onChange({ questionId: 'q1', selectedIndex: 0 });
  tree = f.render(InternalQuizPanel, props); buttons().find(node => text(node) === 'السؤال التالي').props.onClick(); tree = f.render(InternalQuizPanel, props);
  assert.equal(nodes(tree, node => node.type === 'QuizQuestionInput')[0].props.question.id, 'q2');
  nodes(tree, node => node.type === 'QuizQuestionInput')[0].props.onChange({ questionId: 'q2', selectedIndex: 1 });
  tree = f.render(InternalQuizPanel, props); buttons().find(node => text(node) === 'السؤال السابق').props.onClick(); tree = f.render(InternalQuizPanel, props);
  assert.equal(nodes(tree, node => node.type === 'QuizQuestionInput')[0].props.answer.selectedIndex, 0);
  buttons().find(node => text(node) === 'السؤال التالي').props.onClick(); tree = f.render(InternalQuizPanel, props);
  buttons().find(node => text(node) === 'اعتماد الإجابات وحفظ النتيجة').props.onClick(); await tick(); tree = f.render(InternalQuizPanel, props);
  assert.equal(submitted.answers.length, 2); assert.equal(ready, true); assert.match(text(tree), /تم تسجيل التقييم القبلي/); assert.doesNotMatch(text(tree), /لم تتحقق نسبة الاجتياز/); f.cleanup();
});

test('interactive cards and tabs require every part to be opened before continuing', () => {
  const f = fixture(); const { LessonContentBlocks } = f.load('@/components/student/lesson-content-blocks'); let ready;
  const blocks = [{ id: 'cards', type: 'cards', items: [{ id: 'one', title: 'بطاقة', text: 'شرح' }] }, { id: 'tabs', type: 'tabs', items: [{ id: 'a', title: 'أول', text: 'أ' }, { id: 'b', title: 'ثان', text: 'ب' }] }];
  const props = { blocks, onReady: value => { ready = value; } };
  let tree = f.render(LessonContentBlocks, props); assert.equal(ready, false);
  let child = nodes(tree, node => node.type?.name === 'ContentBlock')[0];
  let rendered = f.render(child.type, child.props, 'card'); nodes(rendered, node => node.type === 'button')[0].props.onClick();
  tree = f.render(LessonContentBlocks, props); assert.equal(ready, false);
  child = nodes(tree, node => node.type?.name === 'ContentBlock')[1]; rendered = f.render(child.type, child.props, 'tabs');
  nodes(rendered, node => node.type === 'button')[1].props.onClick(); tree = f.render(LessonContentBlocks, props); assert.equal(ready, true); assert.match(text(tree), /جميع الأجزاء/); f.cleanup();
});

const course = { id: 91, slug: 'journey', title: 'دورة مهنية', professionalDevelopment: true, outcomes: ['هدف'], learningJourney: { enabled: true, introduction: 'مرحبًا', summary: 'الختام', preAssessment: { questions: [{ id: 'p' }] } }, finalExam: { questions: [{ id: 'f' }] }, curriculum: [{ id: 'article', title: 'شرح', type: 'article', contentBlocks: [{ id: 'text', type: 'text', text: 'محتوى' }] }] };
test('journey never unlocks the next station after a rejected completion request', async () => {
  const f = fixture((_url, options) => options?.method === 'POST' ? Response.json({ success: false, message: 'لم يُحفظ التقدم' }, { status: 503 }) : Response.json({ success: true, completedLessonIds: [], progress: 0 }));
  const { ProfessionalCourseJourney } = f.load('@/components/student/professional-course-journey');
  const props = { course, initialLessonId: 'article' };
  f.render(ProfessionalCourseJourney, props); await tick(); let tree = f.render(ProfessionalCourseJourney, props);
  let station = nodes(tree, node => node.type?.name === 'JourneyStation')[0]; assert.equal(station.props.lesson.type, 'welcome');
  station.props.onContinue(); await tick(); tree = f.render(ProfessionalCourseJourney, props);
  assert.match(text(tree), /لم يُحفظ التقدم/); station = nodes(tree, node => node.type?.name === 'JourneyStation')[0]; assert.equal(station.props.lesson.type, 'welcome');
  const finalButton = nodes(tree, node => node.type === 'button' && text(node).includes('الاختبار البعدي'))[0]; assert.equal(finalButton.props.disabled, true); f.cleanup();
});

test('all-complete journey requires explicit server confirmation before showing certificate access', async () => {
  let confirmed = false;
  const f = fixture((_url, options) => options?.method === 'POST' ? (confirmed = true, Response.json({ success: true, progress: 100 })) : Response.json({ success: true, completedLessonIds: ['__journey_welcome__', '__journey_objectives__', '__journey_pre__', 'article', '__journey_final__'], progress: 99 }));
  const { ProfessionalCourseJourney } = f.load('@/components/student/professional-course-journey'); const props = { course, initialLessonId: 'lesson-1' };
  f.render(ProfessionalCourseJourney, props); await tick(); let tree = f.render(ProfessionalCourseJourney, props);
  assert.equal(nodes(tree, node => node.props?.href === '/dashboard/student/certificates').length, 0);
  nodes(tree, node => node.type === 'button' && text(node).includes('اعتماد إكمال الدورة'))[0].props.onClick(); await tick(); tree = f.render(ProfessionalCourseJourney, props);
  assert.equal(confirmed, true); assert.equal(nodes(tree, node => node.props?.href === '/dashboard/student/certificates').length, 1); assert.match(text(tree), /100%/); f.cleanup();
});
