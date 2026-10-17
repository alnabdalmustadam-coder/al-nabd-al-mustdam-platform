import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import * as crypto from 'node:crypto';
import ts from 'typescript';

const plain = value => JSON.parse(JSON.stringify(value));
const file = (id, extension = 'pdf') => ({ id, title: id, fileUrl: `https://files.invalid/${id}.${extension}`, fileType: extension === 'docx' ? 'word' : extension === 'pptx' ? 'ppt' : extension });
const quiz = { title: 'اختبار', passingScore: 70, questions: [{ id: 'q1', question: 'اختر', options: ['أ', 'ب'], correctIndex: 1 }] };
function fixture(overrides = {}) {
  const slots = []; const effects = []; let cursor = 0;
  const react = {
    useState(initial) { const index = cursor++; slots[index] ??= { value: typeof initial === 'function' ? initial() : initial }; return [slots[index].value, next => { slots[index].value = typeof next === 'function' ? next(slots[index].value) : next; }]; },
    useRef(value) { const index = cursor++; slots[index] ??= { current: value }; return slots[index]; },
    useId: () => `editor-${cursor++}`,
    useEffect(fn, deps) { const index = cursor++; const previous = slots[index]; if (!previous || deps.some((item, i) => !Object.is(item, previous.deps[i]))) effects.push(() => { previous?.cleanup?.(); slots[index] = { deps, cleanup: fn() }; }); },
  };
  const jsx = (type, props) => ({ type, props });
  const stubs = { react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'lucide-react': new Proxy({}, { get: (_, name) => name }),
    '@/components/quizzes/course-quiz-editor': { CourseQuizEditor: 'CourseQuizEditor' }, ...overrides };
  const loaded = new Map();
  function load(name, parent = '') {
    if (name in stubs) return stubs[name];
    if (name === 'node:crypto') return crypto;
    const resolved = name.startsWith('@/') ? name.slice(2) : path.posix.join(path.posix.dirname(parent), name);
    if (loaded.has(resolved)) return loaded.get(resolved);
    const filename = `${resolved}.${existsSync(new URL(`../${resolved}.ts`, import.meta.url)) ? 'ts' : 'tsx'}`;
    const source = readFileSync(new URL(`../${filename}`, import.meta.url), 'utf8');
    const exports = {}; loaded.set(resolved, exports);
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    vm.runInNewContext(compiled, { exports, require: child => load(child, resolved), crypto: globalThis.crypto, AbortController, FormData, File, ...overrides.globals });
    return exports;
  }
  return { load, render(Component, props) { cursor = 0; const tree = Component(props); while (effects.length) effects.shift()(); return tree; }, cleanup() { for (const slot of slots) slot?.cleanup?.(); } };
}
function findAll(tree, predicate) { const nodes = []; function visit(node) { if (!node || typeof node !== 'object') return; if (Array.isArray(node)) return node.forEach(visit); if (predicate(node)) nodes.push(node); visit(node.props?.children); } visit(tree); return nodes; }
const text = node => typeof node === 'string' ? node : Array.isArray(node) ? node.map(text).join('') : text(node?.props?.children || '');

for (const curriculum of [
  [{ id: 'unit', title: 'وحدة', duration: '30 دقيقة', items: [{ id: 'video', title: 'فيديو', type: 'video', videoUrl: 'video-1', attachments: [file('slides', 'pptx')] }, { id: 'quiz', title: 'اختبار', type: 'quiz', quizData: quiz }], attachments: [file('unit-reference')] }],
  [{ title: 'وحدة قديمة', duration: '30 دقيقة', videoUrl: 'video-1', quizData: quiz, fileUrl: 'https://files.invalid/legacy.pdf', fileName: 'مرجع سابق' }],
  [{ title: 'عناوين قديمة', duration: '30 دقيقة', videoUrl: 'video-1', lessons: ['درس أول', 'درس ثان'], quizData: quiz }],
  [{ id: 'legacy-objects', title: 'وحدة', duration: '', lessons: [{ title: 'مستند', type: 'doc', fileUrl: 'https://files.invalid/old.docx' }, { id: 'second', title: 'فيديو', videoUrl: 'video-2' }] }],
]) test(`opening and saving ${curriculum[0].id || curriculum[0].title} preserves canonical lesson IDs, content and quiz activity`, () => {
  const f = fixture(); const { curriculumToEditor, editorToCurriculum } = f.load('@/lib/courses/editor-model');
  const { getCourseContent } = f.load('@/lib/learning/course-content'); const { getQuizActivity } = f.load('@/lib/quizzes/activity');
  const before = getCourseContent({ curriculum }); const editor = curriculumToEditor(curriculum); const saved = editorToCurriculum(editor);
  assert.deepEqual(plain(getCourseContent({ curriculum: saved })), plain(before));
  const activities = content => content.filter(item => item.requiredQuiz).map(item => getQuizActivity('course', item.quizKey, item.requiredQuiz).activityId);
  assert.deepEqual(plain(activities(getCourseContent({ curriculum: saved }))), plain(activities(before)));
  assert.deepEqual(curriculum, plain(curriculum));
});

test('unit, lesson and course file scopes survive repeated editor round trips without changing the video content', () => {
  const { curriculumToEditor, editorToCurriculum } = fixture().load('@/lib/courses/editor-model');
  const input = [{ id: 'unit', title: 'وحدة', duration: '', attachments: [file('unit', 'docx')], items: [{ id: 'video', title: 'فيديو', type: 'video', videoUrl: 'video-1', attachments: [file('lesson', 'pptx'), file('worksheet')] }] }];
  let saved = input; for (let index = 0; index < 3; index++) saved = editorToCurriculum(curriculumToEditor(saved));
  assert.deepEqual(plain(saved[0].attachments), input[0].attachments);
  assert.deepEqual(plain(saved[0].items[0].attachments), input[0].items[0].attachments);
  assert.equal(saved[0].items[0].type, 'video'); assert.equal(saved[0].items[0].videoUrl, 'video-1');
});

test('legacy single-lesson units retain separate lesson documents and the original section quiz across reopening', () => {
  const f = fixture(); const { curriculumToEditor, editorToCurriculum } = f.load('@/lib/courses/editor-model');
  const { getCourseContent } = f.load('@/lib/learning/course-content');
  const original = [{ id: 'single', title: 'وحدة قديمة', duration: '', videoUrl: 'video-1', quizData: quiz }];
  const before = getCourseContent({ curriculum: original });
  let editor = curriculumToEditor(original); editor[0].attachments = [file('unit')]; editor[0].subItems[0].attachments = [file('lesson', 'pptx')];
  let saved = editorToCurriculum(editor);
  for (let index = 0; index < 3; index++) saved = editorToCurriculum(curriculumToEditor(saved));
  assert.deepEqual(plain(saved[0].attachments.map(item => item.id)), ['unit']);
  assert.deepEqual(plain(saved[0].items[0].attachments.map(item => item.id)), ['lesson']);
  assert.deepEqual(plain(getCourseContent({ curriculum: saved })), plain(before));
  editor = curriculumToEditor(saved); assert.equal(editor[0].legacySingle, true);
  assert.equal(editor[0].subItems[0].quizData, undefined); assert.deepEqual(plain(editor[0].quizData), quiz);
});

test('student files include only the current lesson and its unit, plus course-wide downloads', () => {
  const { getLessonResourceGroups } = fixture().load('@/lib/courses/curriculum-files');
  const course = { attachments: [file('general', 'zip')], curriculum: [{ id: 'unit', title: 'الوحدة', attachments: [file('unit')], items: [
    { id: 'lesson', title: 'الدرس', attachments: [file('lesson', 'pptx'), file('lesson', 'pptx')] }, { id: 'future', title: 'لاحق', attachments: [file('future')] }],
  }, { id: 'other', title: 'وحدة أخرى', attachments: [file('other-unit')], items: [{ id: 'other-lesson', title: 'آخر' }] }] };
  const groups = getLessonResourceGroups(course, 'lesson');
  assert.deepEqual(plain(groups.map(group => [group.id, group.files.map(item => item.id)])), [['lesson', ['lesson']], ['unit', ['unit']], ['course', ['general']]]);
  assert.deepEqual(plain(getLessonResourceGroups(course, 'future', false).map(group => group.id)), ['course']);
  assert.deepEqual(plain(getLessonResourceGroups(course, 'missing').map(group => group.id)), ['course']);
});

test('development mode is an accessible on/off switch with an explicit status', () => {
  const f = fixture(); const { EditorToggle } = f.load('@/components/courses/editor/editor-ui'); let next;
  const tree = f.render(EditorToggle, { title: 'وضع التطوير المهني', enabled: true, onChange: value => { next = value; } });
  const button = findAll(tree, node => node.props?.role === 'switch')[0];
  assert.equal(button.props['aria-checked'], true); assert.match(text(tree), /مفعّل/); button.props.onClick(); assert.equal(next, false);
});

test('concurrent updates to different file scopes append to fresh state and preserve video type', () => {
  const f = fixture(); const { CourseCurriculumEditor } = f.load('@/components/courses/editor/course-curriculum-editor');
  const { curriculumToEditor } = f.load('@/lib/courses/editor-model'); let value = curriculumToEditor([{ id: 'unit', title: 'وحدة', items: [{ id: 'video', title: 'فيديو', type: 'video', videoUrl: 'video-1' }] }]);
  const tree = f.render(CourseCurriculumEditor, { value, onChange: update => { value = update(value); }, onFileBusyChange() {}, videoUpload: null });
  const scopes = findAll(tree, node => node.type?.name === 'CourseFilesEditor'); assert.equal(scopes.length, 2);
  scopes[0].props.onChange(current => [...current, file('unit')]); scopes[1].props.onChange(current => [...current, file('lesson', 'docx')]); scopes[0].props.onChange(current => [...current, file('unit-2')]);
  assert.deepEqual(plain(value[0].attachments.map(item => item.id)), ['unit', 'unit-2']);
  assert.equal(value[0].subItems[0].attachments[0].id, 'lesson'); assert.equal(value[0].subItems[0].type, 'video');
});

test('multiple document uploads keep successes, report failures and release the busy state', async () => {
  const calls = []; const busy = []; let files = [file('existing')];
  const f = fixture({ globals: { fetch: async (_url, options) => { const name = options.body.get('file').name; calls.push(name); return name === 'bad.docx' ? Response.json({ error: 'فشل تجريبي' }, { status: 500 }) : Response.json({ success: true, fileUrl: `https://files.invalid/${name}`, fileName: name, fileType: 'ppt' }); } } });
  const { CourseFilesEditor } = f.load('@/components/courses/editor/course-files-editor');
  const props = { title: 'الملفات', description: '', files, onChange: update => { files = update(files); }, onBusyChange: value => busy.push(value) };
  const tree = f.render(CourseFilesEditor, props); const input = findAll(tree, node => node.type === 'input' && node.props.type === 'file')[0];
  input.props.onChange({ target: { files: ['one.pptx', 'bad.docx', 'two.pdf'].map(name => new File(['test'], name)), value: 'selected' } });
  for (let count = 0; count < 10 && busy.at(-1) !== false; count++) await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(calls, ['one.pptx', 'bad.docx', 'two.pdf']); assert.deepEqual(plain(files.map(item => item.title)), ['existing', 'one.pptx', 'two.pdf']); assert.deepEqual(busy, [true, false]);
  const rendered = f.render(CourseFilesEditor, { ...props, files }); assert.match(text(findAll(rendered, node => node.props?.role === 'alert')[0]), /bad.docx/);
});

test('removing a legacy file without an ID targets its URL and preserves other files', () => {
  const f = fixture(); const { CourseFilesEditor } = f.load('@/components/courses/editor/course-files-editor'); let files = [file('one'), file('two')].map(({ id: _id, ...item }) => item);
  const tree = f.render(CourseFilesEditor, { title: 'ملفات', description: '', files, onChange: update => { files = update(files); }, onBusyChange() {} });
  findAll(tree, node => node.type === 'button' && node.props['aria-label']?.startsWith('إزالة'))[0].props.onClick();
  assert.equal(files.length, 1); assert.equal(files[0].title, 'two');
});

test('an unmounted uploader aborts without attaching a late response to a different lesson', async () => {
  let release; let updates = 0; const busy = [];
  const f = fixture({ globals: { fetch: () => new Promise(resolve => { release = resolve; }) } });
  const { CourseFilesEditor } = f.load('@/components/courses/editor/course-files-editor');
  const tree = f.render(CourseFilesEditor, { title: 'ملفات', description: '', files: [], onChange: () => { updates++; }, onBusyChange: value => busy.push(value) });
  findAll(tree, node => node.type === 'input')[0].props.onChange({ target: { files: [new File(['test'], 'ref.pdf')], value: '' } });
  f.cleanup(); release(Response.json({ success: true, fileUrl: 'https://files.invalid/ref.pdf' })); await new Promise(resolve => setImmediate(resolve));
  assert.equal(updates, 0); assert.deepEqual(busy, [true, false]);
});
