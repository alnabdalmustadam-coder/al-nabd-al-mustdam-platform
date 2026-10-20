import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const options = [{ id: 'all', label: 'جميع المستويات' }, { id: 'beginner', label: 'مبتدئ' }, { id: 'advanced', label: 'متقدم' }];
const all = (tree, predicate) => { const found = []; function visit(node) { if (Array.isArray(node)) return node.forEach(visit); if (!node || typeof node !== 'object') return; if (predicate(node)) found.push(node); visit(node.props?.children); } visit(tree); return found; };

// Exercise the actual select handlers with deterministic DOM, viewport and focus
// boundaries. The portal belongs to the dialog, not a separate focus scope.
function mount(patch = {}) {
  const slots = [], pending = [], changes = [], portalHosts = [];
  let cursor = 0, tree, focus, prevented = 0, stopped = 0, documentState;
  const rect = { top: 200, bottom: 248, left: 320, right: 560, width: 240 };
  const viewport = { offsetTop: 0, offsetLeft: 0, width: 900, height: 800 };
  class Node {
    getClientRects() { return [rect]; }
    focus(options) {
      focus = this.name; documentState.activeElement = this;
      // Model the browser scrolling the dialog to reveal a portalled input.
      if (patch.scrollOnFocus && !options?.preventScroll) Object.assign(rect, { top: -100, bottom: -52 });
    }
    contains(value) { return value === this; }
  }
  const before = Object.assign(new Node(), { name: 'before' }), after = Object.assign(new Node(), { name: 'after' });
  const search = Object.assign(new Node(), { name: 'search', insidePopup: true });
  const trigger = Object.assign(new Node(), { name: 'trigger', getBoundingClientRect: () => rect, matches: () => Boolean(patch.disabled), closest: () => dialog });
  const popup = Object.assign(new Node(), { contains: value => value === popup || Boolean(value?.insidePopup) });
  const list = Object.assign(new Node(), { scrollTop: 0, clientHeight: 144, querySelector: selector => { const index = Number(selector.match(/"(\d+)"/)?.[1] || 0); return { offsetTop: index * 48, offsetHeight: 48 }; } });
  const dialog = { querySelectorAll: () => [before, trigger, after, search] };
  const listeners = new Map();
  const surface = prefix => ({ addEventListener(name, callback) { const key = `${prefix}:${name}`; if (!listeners.has(key)) listeners.set(key, new Set()); listeners.get(key).add(callback); }, removeEventListener(name, callback) { listeners.get(`${prefix}:${name}`)?.delete(callback); } });
  documentState = { body: dialog, activeElement: trigger, ...surface('document') };
  const visualViewport = { ...viewport, ...surface('viewport') };
  const react = {
    useId() { cursor++; return 'select-fixture'; },
    useRef(initial) { const i = cursor++; slots[i] ??= { current: initial }; return slots[i]; },
    useState(initial) { const i = cursor++; slots[i] ??= { value: typeof initial === 'function' ? initial() : initial }; return [slots[i].value, next => { slots[i].value = typeof next === 'function' ? next(slots[i].value) : next; }]; },
    useEffect(fn, deps) { const i = cursor++, previous = slots[i]; if (!previous || deps.some((item, index) => !Object.is(item, previous.deps[index]))) pending.push(() => { previous?.cleanup?.(); slots[i] = { deps, cleanup: fn() }; }); },
  };
  const jsx = (type, props) => {
    if (props?.ref) props.ref.current = type === 'button' ? trigger : type === 'input' ? search : props.role === 'listbox' ? list : popup;
    return { type, props };
  };
  const modules = { react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-dom': { createPortal(node, host) { portalHosts.push(host); return node; } }, 'lucide-react': new Proxy({}, { get: (_, key) => key }) };
  const exports = {};
  const source = readFileSync(new URL('../components/courses/editor/editor-select.tsx', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { exports, require: name => { assert.ok(name in modules, name); return modules[name]; }, Node,
    document: documentState, window: { innerWidth: 900, innerHeight: 800, visualViewport, ...surface('window') },
    requestAnimationFrame: callback => { callback(); return 1; }, cancelAnimationFrame() {},
  });
  let props = { label: 'المستوى', value: 'all', options, onChange: value => { changes.push(value); props = { ...props, value }; }, ...patch };
  const render = () => { cursor = 0; tree = exports.EditorSelect(props); while (pending.length) pending.shift()(); return tree; };
  const sendKey = (key, { shiftKey = false, target = trigger } = {}) => { const event = { key, target, shiftKey, preventDefault() { prevented++; }, stopPropagation() { stopped++; } }; tree.props.onKeyDown(event); render(); };
  const clickTrigger = () => { all(tree, node => node.type === 'button')[0].props.onClick(); render(); };
  const emit = (name, event) => { for (const fn of listeners.get(name) || []) fn(event); render(); };
  render();
  return { render, clickTrigger, sendKey, emit, rect, visualViewport, list, changes, portalHosts, dialog, search, trigger, before, after,
    tree: () => tree, focus: () => focus, prevented: () => prevented, stopped: () => stopped,
    popup: () => all(tree, node => node.props?.['data-editor-select-popup'] !== undefined)[0],
    options: () => all(tree, node => node.props?.role === 'option'),
    searchInput: () => all(tree, node => node.type === 'input')[0],
    listenerCount: () => [...listeners.values()].reduce((count, set) => count + set.size, 0),
    cleanup: () => slots.forEach(slot => slot?.cleanup?.()),
  };
}

test('custom options commit the real value and stay inside the dialog portal', () => {
  const f = mount(); f.clickTrigger();
  assert.equal(f.options().length, 3); assert.equal(f.portalHosts[0], f.dialog);
  assert.equal(f.options()[0].props['aria-selected'], true);
  f.options()[2].props.onClick(); f.render();
  assert.deepEqual(f.changes, ['advanced']); assert.equal(f.popup(), undefined); assert.equal(f.focus(), 'trigger');
  assert.equal(all(f.tree(), node => node.type === 'select').length, 0);
});

test('keyboard navigation and Enter choose without submitting the course form', () => {
  const f = mount(); f.sendKey('ArrowDown'); f.sendKey('ArrowDown'); f.sendKey('Enter');
  assert.deepEqual(f.changes, ['beginner']); assert.equal(f.prevented(), 3); assert.equal(f.popup(), undefined);
  f.sendKey('End'); f.sendKey('Enter'); assert.deepEqual(f.changes, ['beginner', 'advanced']);
});

test('Escape closes only the select, restores focus and leaves the selected value intact', () => {
  const f = mount({ searchable: true }); f.clickTrigger(); assert.equal(f.focus(), 'search');
  f.sendKey('ArrowDown', { target: f.search }); f.sendKey('Escape', { target: f.search });
  assert.equal(f.stopped(), 1); assert.equal(f.focus(), 'trigger'); assert.equal(f.popup(), undefined); assert.deepEqual(f.changes, []);
});

test('Arabic search filters trainer names, handles no matches, and does not alter values while typing', () => {
  const f = mount({ searchable: true, label: 'المدرّب', value: 'one', options: [{ id: 'one', label: 'أحمد محمد' }, { id: 'two', label: 'سارة العتيبي' }] });
  f.clickTrigger(); f.searchInput().props.onChange({ target: { value: 'العتيبي' } }); f.render();
  assert.equal(f.options().length, 1); assert.deepEqual(f.changes, []);
  f.sendKey('Enter', { target: f.search }); assert.deepEqual(f.changes, ['two']);
  f.clickTrigger(); f.searchInput().props.onChange({ target: { value: 'لا يوجد اسم' } }); f.render();
  assert.equal(f.options().length, 0); f.sendKey('Enter', { target: f.search }); assert.deepEqual(f.changes, ['two']);
});

test('Tab and Shift+Tab from search continue from the original form field', () => {
  const f = mount({ searchable: true }); f.clickTrigger(); f.sendKey('Tab', { target: f.search });
  assert.equal(f.focus(), 'after'); assert.equal(f.popup(), undefined);
  f.clickTrigger(); f.sendKey('Tab', { target: f.search, shiftKey: true }); assert.equal(f.focus(), 'before');
});

test('clicking outside dismisses without applying the highlighted option and removes listeners', () => {
  const f = mount(); assert.equal(f.listenerCount(), 0); f.clickTrigger(); assert.ok(f.listenerCount() > 0);
  f.sendKey('ArrowDown'); f.emit('document:pointerdown', { target: f.after });
  assert.equal(f.popup(), undefined); assert.deepEqual(f.changes, []); assert.equal(f.listenerCount(), 0);
});

test('the popup flips above a lower field, follows scrolling, and closes when its field leaves the viewport', () => {
  const f = mount(); Object.assign(f.rect, { top: 700, bottom: 748, left: 800, right: 1040 }); f.clickTrigger();
  let style = f.popup().props.style; assert.equal(style.transform, 'translateY(-100%)'); assert.ok(style.left + style.width <= 888);
  f.rect.top = 500; f.rect.bottom = 548; f.emit('document:scroll', { target: f.before });
  assert.notEqual(f.popup().props.style.top, style.top);
  f.rect.top = -100; f.rect.bottom = -52; f.emit('document:scroll', { target: f.before }); assert.equal(f.popup(), undefined);
});

test('opening and choosing a trainer near the bottom preserves the dialog scroll position', () => {
  const f = mount({ searchable: true, scrollOnFocus: true });
  Object.assign(f.rect, { top: 700, bottom: 748 });
  f.clickTrigger(); f.emit('document:scroll', { type: 'scroll', target: f.dialog });
  assert.ok(f.popup(), 'focusing search must not scroll its trigger out of view and dismiss the menu');
  assert.equal(f.rect.top, 700); assert.equal(f.focus(), 'search');
  f.options()[1].props.onClick(); f.render();
  assert.deepEqual(f.changes, ['beginner']); assert.equal(f.focus(), 'trigger');
  assert.equal(f.rect.top, 700); assert.equal(f.popup(), undefined);
});

test('the mobile keyboard keeps trainer search open and the menu above the visible viewport edge', () => {
  const f = mount({ searchable: true });
  f.visualViewport.width = 390;
  Object.assign(f.rect, { top: 700, bottom: 748, left: 16, right: 374, width: 358 }); f.clickTrigger();
  f.visualViewport.height = 420;
  f.emit('viewport:resize', { type: 'resize', target: f.visualViewport });
  assert.ok(f.popup(), 'opening the keyboard must not dismiss the focused trainer search');
  let style = f.popup().props.style;
  assert.equal(style.transform, 'translateY(-100%)'); assert.ok(style.top <= 408);
  assert.ok(style.left >= 12); assert.ok(style.left + style.width <= 378);
  assert.ok(style.top - style.maxHeight >= 12);
  f.visualViewport.offsetTop = 100; f.visualViewport.height = 320;
  f.emit('viewport:scroll', { type: 'scroll', target: f.visualViewport });
  style = f.popup().props.style;
  assert.ok(style.top <= 408); assert.ok(style.top - style.maxHeight >= 112);
  f.searchInput().props.onChange({ target: { value: 'متقدم' } }); f.render();
  f.sendKey('Enter', { target: f.search });
  assert.deepEqual(f.changes, ['advanced']); assert.equal(f.popup(), undefined);
});

test('scrolling a trainer field off screen still dismisses its focused search menu', () => {
  const f = mount({ searchable: true }); f.clickTrigger();
  Object.assign(f.rect, { top: -100, bottom: -52 });
  f.emit('document:scroll', { type: 'scroll', target: f.dialog });
  assert.equal(f.popup(), undefined); assert.deepEqual(f.changes, []);
});

test('existing custom values remain selectable and disabled selects cannot open', () => {
  const custom = mount({ value: 'custom-existing-level' }); custom.clickTrigger();
  assert.equal(custom.options()[0].props['aria-selected'], true); custom.sendKey('Enter'); assert.deepEqual(custom.changes, ['custom-existing-level']);
  const disabled = mount({ disabled: true }); disabled.clickTrigger(); disabled.sendKey('ArrowDown'); assert.equal(disabled.popup(), undefined);
});

test('typeahead highlights a matching option and active keyboard options scroll into view', () => {
  const f = mount({ options: Array.from({ length: 12 }, (_, index) => ({ id: String(index), label: `خيار ${index}` })), value: '0' });
  f.sendKey('خ'); f.sendKey('End'); assert.ok(f.list.scrollTop > 0); f.sendKey('Enter'); assert.deepEqual(f.changes, ['11']);
});
