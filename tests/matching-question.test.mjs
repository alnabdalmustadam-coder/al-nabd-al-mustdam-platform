import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as matching from '../lib/quizzes/matching.ts';

const question = { id: 'matching-ui', text: 'صل الدول بعواصمها', type: 'matching',
  prompts: ['السعودية', 'مصر', 'الأردن'], options: ['القاهرة', 'عمّان', 'الرياض'] };

function mount(initialAnswer) {
  let answer = initialAnswer;
  let tree;
  let cursor = 0;
  let dropTarget = null;
  let emissions = 0;
  const slots = [];
  const effects = [];
  const domNodes = new Map();
  const memo = (factory, deps) => {
    const index = cursor++;
    if (!slots[index] || deps.some((value, i) => !Object.is(value, slots[index].deps[i]))) {
      slots[index] = { deps, value: factory() };
    }
    return slots[index].value;
  };
  const react = {
    useId: () => `matching-${cursor++}`,
    useRef(initial) { const index = cursor++; slots[index] ??= { current: initial }; return slots[index]; },
    useState(initial) {
      const index = cursor++;
      slots[index] ??= { value: typeof initial === 'function' ? initial() : initial };
      return [slots[index].value, next => { slots[index].value = typeof next === 'function' ? next(slots[index].value) : next; }];
    },
    useCallback: (callback, deps) => memo(() => callback, deps),
    useLayoutEffect(callback, deps) { memo(() => { effects.push(callback); return null; }, deps); },
  };
  const jsx = (type, props) => ({ type, props });
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../components/quizzes/matching-question.tsx', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports,
    require(name) {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (name === '@/lib/quizzes/matching') return matching;
      throw new Error(`Unexpected import: ${name}`);
    },
    document: { elementFromPoint: () => dropTarget },
    ResizeObserver: class { observe() {} disconnect() {} },
  });
  const nodes = node => Array.isArray(node) ? node.flatMap(nodes)
    : node && typeof node === 'object' ? [node, ...nodes(node.props?.children)] : [];
  const board = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 350 }), contains: node => [...domNodes.values()].includes(node) };
  function render() {
    cursor = 0;
    tree = exports.MatchingQuestion({ question, answer, onChange: next => { answer = JSON.parse(JSON.stringify(next)); emissions++; } });
    for (const node of nodes(tree)) {
      const ref = node.props?.ref;
      if (!ref) continue;
      if (typeof ref === 'object') { ref.current = board; continue; }
      const side = node.props['data-matching-side'];
      const index = node.props['data-matching-index'];
      const key = `${side}-${index}`;
      if (!domNodes.has(key)) {
        const captures = new Set();
        const left = side === 'prompt' ? 190 : 0;
        const dom = { dataset: { matchingSide: side, matchingIndex: String(index) },
          getBoundingClientRect: () => ({ left, right: left + 130, top: 40 + index * 90, height: 76 }),
          setPointerCapture: id => captures.add(id), hasPointerCapture: id => captures.has(id), releasePointerCapture: id => captures.delete(id),
        };
        dom.closest = () => dom;
        domNodes.set(key, dom);
      }
      ref(domNodes.get(key));
    }
    if (effects.length) { effects.splice(0).forEach(effect => effect()); return render(); }
    return tree;
  }
  const button = (side, index) => nodes(tree).find(node => node.props?.['data-matching-side'] === side && node.props?.['data-matching-index'] === index);
  render();
  return {
    answer: () => answer, emissions: () => emissions,
    tap(side, index) { button(side, index).props.onClick({ detail: 0 }); render(); },
    key(side, index, key) { button(side, index).props.onKeyDown({ key, preventDefault() {} }); render(); },
    paths: () => nodes(tree).filter(node => node.props?.['data-matching-connection'] !== undefined).length,
    reset() { nodes(tree).find(node => node.type === 'button' && node.props.children === 'مسح التوصيلات').props.onClick(); render(); },
    drag(sourceSide, sourceIndex, targetSide, targetIndex, cancel = false, foreign = false) {
      const event = { pointerId: 42, pointerType: 'touch', isPrimary: true, button: 0, clientX: 20, clientY: 20, currentTarget: domNodes.get(`${sourceSide}-${sourceIndex}`) };
      button(sourceSide, sourceIndex).props.onPointerDown(event);
      dropTarget = foreign ? { dataset: { matchingSide: targetSide, matchingIndex: String(targetIndex) }, closest() { return this; } }
        : domNodes.get(`${targetSide}-${targetIndex}`);
      const move = { ...event, clientX: 220, clientY: 200 };
      button(sourceSide, sourceIndex).props.onPointerMove(move); render();
      button(sourceSide, sourceIndex).props[cancel ? 'onPointerCancel' : 'onPointerUp'](move); render();
      if (!cancel) { button(sourceSide, sourceIndex).props.onClick({ detail: 1 }); render(); }
    },
  };
}

test('matching UI supports keyboard selection in either order and toggles an existing pair off', () => {
  const ui = mount();
  ui.tap('prompt', 0); ui.tap('option', 2);
  ui.tap('option', 0); ui.tap('prompt', 1);
  assert.deepEqual(ui.answer().selectedIndices, [2, 0, -1]);
  assert.equal(ui.paths(), 2);
  ui.tap('option', 2); ui.tap('prompt', 0);
  assert.deepEqual(ui.answer().selectedIndices, [-1, 0, -1]);
  ui.key('option', 0, 'Delete');
  assert.deepEqual(ui.answer().selectedIndices, [-1, -1, -1]);
});

test('pointer dragging in either direction commits once and releases occupied endpoints', () => {
  const ui = mount();
  ui.drag('prompt', 0, 'option', 2);
  assert.equal(ui.emissions(), 1);
  ui.drag('option', 0, 'prompt', 1);
  assert.deepEqual(ui.answer().selectedIndices, [2, 0, -1]);
  ui.drag('option', 2, 'prompt', 2);
  assert.deepEqual(ui.answer().selectedIndices, [-1, 0, 2]);
  assert.equal(ui.paths(), 2);
});

test('cancelled, foreign-question and same-column drops preserve restored answers', () => {
  const saved = { questionId: question.id, selectedIndex: -1, selectedIndices: [2, 0, 1] };
  const ui = mount(saved);
  assert.equal(ui.paths(), 3);
  ui.drag('prompt', 0, 'option', 1, true);
  ui.drag('prompt', 0, 'option', 1, false, true);
  ui.drag('prompt', 0, 'prompt', 1);
  assert.deepEqual(ui.answer(), saved);
  assert.equal(ui.emissions(), 0);
  ui.reset();
  assert.deepEqual(ui.answer().selectedIndices, [-1, -1, -1]);
  assert.equal(ui.paths(), 0);
});
