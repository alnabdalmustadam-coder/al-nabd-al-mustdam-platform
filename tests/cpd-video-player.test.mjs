import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { extractBunnyVideoId } from '../lib/learning/course-content.ts';

// Execute the real player component and its event handlers with deterministic
// player/network/clock boundaries. No browser auth or live learner writes.
function playerFixture({ resume = 0, duration = 60, playbackResponses = [], recordProgress } = {}) {
  const slots = []; const effects = []; const intervals = new Map(); const timeouts = new Map(); const requests = [];
  const documentListeners = new Map(); const players = []; let cursor = 0; let clock = 0; let handle = 0; let verified = 0;
  let savedWatch = resume; let tree; const iframe = {}; let readyHook; let playbackCalls = 0;
  const react = { useState(initial) {
    const index = cursor++; if (!(index in slots)) slots[index] = { value: typeof initial === 'function' ? initial() : initial };
    return [slots[index].value, (next) => { slots[index].value = typeof next === 'function' ? next(slots[index].value) : next; }];
  }, useRef(value) { const index = cursor++; if (!(index in slots)) slots[index] = { current: value }; return slots[index]; },
  useEffect(fn, deps) {
    const index = cursor++; const previous = slots[index];
    if (!previous || deps.some((item, i) => !Object.is(item, previous.deps[i]))) {
      effects.push(() => { previous?.cleanup?.(); slots[index] = { deps, cleanup: fn() }; });
    }
  } };
  class Player {
    events = new Map(); seeks = []; rates = []; pauses = 0; currentTime = resume;
    constructor() { players.push(this); }
    on(event, callback) { this.events.set(event, callback); }
    off(event) { this.events.delete(event); }
    pause() { this.pauses++; }
    setCurrentTime(value) { this.seeks.push(value); this.currentTime = value; }
    getCurrentTime(callback) { callback(this.currentTime); }
    setPlaybackRate(value) { this.rates.push(value); }
    supports() { return true; }
    emit(event, value) { if (event === 'timeupdate') this.currentTime = value.seconds; this.events.get(event)?.(value); }
  }
  const jsx = (type, props) => ({ type, props });
  const modules = { react: { ...react, default: react, __esModule: true },
    'react/jsx-runtime': { jsx, jsxs: jsx }, 'next/script': { __esModule: true, default: 'Script' },
    'lucide-react': new Proxy({}, { get: (_target, name) => String(name) }),
    '@/lib/learning/course-content': { extractBunnyVideoId },
  };
  const exports = {};
  const source = readFileSync(new URL('../components/student/student-video-player.tsx', import.meta.url), 'utf8');
  const document = { hidden: false, addEventListener: (event, callback) => documentListeners.set(event, callback), removeEventListener: (event) => documentListeners.delete(event) };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
    exports, require: (name) => { assert.ok(name in modules, name); return modules[name]; }, URL, AbortController,
    window: { playerjs: { Player }, location: { reload() {} } }, document, performance: { now: () => clock },
    setInterval: (fn) => { const id = ++handle; intervals.set(id, fn); return id; }, clearInterval: (id) => intervals.delete(id),
    setTimeout: (fn) => { const id = ++handle; timeouts.set(id, fn); return id; }, clearTimeout: (id) => timeouts.delete(id),
    fetch: async (url, init) => {
      const body = JSON.parse(init.body); requests.push({ url, body, signal: init.signal });
      if (url.includes('playback-token')) {
        const response = playbackResponses[playbackCalls++];
        if (response) return { ok: false, status: response.status, json: async () => response.payload };
      }
      if (url.includes('video-progress') && recordProgress) return { ok: true, json: async () => recordProgress(body, clock) };
      return { ok: true, json: async () => url.includes('playback-token')
        ? { success: true, iframeUrl: 'https://iframe.mediadelivery.net/embed/1/11111111-1111-4111-8111-111111111111', cpdSession: { id: 'server-session', duration, watchedSeconds: resume } }
        : { success: true, accepted: true, watchedSeconds: savedWatch } };
    },
  });
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (node.type === 'iframe' && node.props.ref) node.props.ref.current = iframe;
    if (node.type === 'Script') readyHook = node.props.onReady;
    visit(node.props?.children);
  }
  function render() {
    cursor = 0;
    tree = exports.StudentVideoPlayer({ courseSlug: 'course', lessonId: 'video', lessonTitle: 'Video',
      videoUrl: '11111111-1111-4111-8111-111111111111', professionalDevelopment: true,
      completionDisabled: true, onVideoVerified: () => verified++ });
    visit(tree); effects.splice(0).forEach((fn) => fn()); return tree;
  }
  async function flush() { for (let i = 0; i < 12; i++) await Promise.resolve(); render(); }
  return { render, flush, requests, players, intervals, timeouts, document, documentListeners,
    retryTimer: () => { const [id, fn] = timeouts.entries().next().value; timeouts.delete(id); fn(); },
    scriptReady: () => readyHook(), setClock: (value) => { clock = value; },
    setSavedWatch: (value) => { savedWatch = value; }, verified: () => verified,
    cleanup: () => slots.forEach((slot) => slot?.cleanup?.()),
  };
}

test('CPD player blocks forward seeking, retains backwards replay and restores saved position', async () => {
  const f = playerFixture({ resume: 12 }); f.render(); await f.flush(); f.scriptReady(); f.render();
  const player = f.players[0]; assert.ok(player);
  player.emit('ready'); assert.equal(player.seeks[0], 12);
  player.emit('timeupdate', { seconds: 45, duration: 60 }); assert.equal(player.seeks.at(-1), 12);
  player.emit('timeupdate', { seconds: 4, duration: 60 }); assert.equal(player.seeks.at(-1), 12);
  player.emit('play'); f.setClock(1000); player.emit('timeupdate', { seconds: 5, duration: 60 });
  assert.equal(player.seeks.at(-1), 12); // Allowed replay did not snap back.
  player.emit('playbackratechange', 2); assert.equal(player.rates.at(-1), 1);
  f.cleanup();
});

const processing = { status: 409, payload: { success: false, code: 'VIDEO_PROCESSING', error: 'قيد التجهيز' } };

test('CPD player waits for encoding before creating the tracked player and cancels pending work on exit', async () => {
  const f = playerFixture({ playbackResponses: [processing] }); f.render(); await f.flush();
  assert.equal(f.requests.length, 1); assert.equal(f.players.length, 0); assert.equal(f.timeouts.size, 1);
  f.retryTimer(); await f.flush(); assert.equal(f.timeouts.size, 0);
  f.scriptReady(); f.render();
  assert.equal(f.requests.length, 2); assert.equal(f.players.length, 1); f.cleanup();
  const waiting = playerFixture({ playbackResponses: [processing] }); waiting.render(); await waiting.flush();
  const signal = waiting.requests[0].signal;
  waiting.cleanup(); assert.equal(waiting.timeouts.size, 0); assert.equal(signal.aborted, true);
});

function findRetry(node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) return node.map(findRetry).find(Boolean);
  if (node.type === 'button' && node.props.children === 'إعادة المحاولة') return node;
  return findRetry(node.props?.children);
}

test('CPD encoding polling is bounded and manual retry starts a fresh request without reloading the page', async () => {
  const f = playerFixture({ playbackResponses: Array(7).fill(processing) }); f.render(); await f.flush();
  for (let attempt = 0; attempt < 6; attempt++) { f.retryTimer(); await f.flush(); }
  assert.equal(f.requests.length, 7); assert.equal(f.timeouts.size, 0);
  const button = findRetry(f.render()); assert.ok(button); button.props.onClick(); f.render(); await f.flush();
  assert.equal(f.requests.length, 8); assert.equal(findRetry(f.render()), undefined);
  f.scriptReady(); f.render(); assert.equal(f.players.length, 1); f.cleanup();
});

test('CPD player does not automatically retry metadata outages or failed uploads', async () => {
  for (const response of [
    { status: 503, payload: { success: false, code: 'VIDEO_METADATA_UNAVAILABLE', error: 'تعذر التحقق من البيانات' } },
    { status: 422, payload: { success: false, error: 'تعذر تجهيز الفيديو' } },
  ]) {
    const f = playerFixture({ playbackResponses: [response] }); f.render(); await f.flush();
    assert.equal(f.timeouts.size, 0); assert.equal(f.players.length, 0); assert.ok(findRetry(f.render())); f.cleanup();
  }
});

test('CPD completion comes from saved server watch history; hiding the page pauses and cleans listeners', async () => {
  const f = playerFixture(); f.render(); await f.flush(); f.scriptReady(); f.render();
  const player = f.players[0]; player.emit('ready'); player.emit('play');
  for (let seconds = 1; seconds <= 5; seconds++) { f.setClock(seconds * 1000); player.emit('timeupdate', { seconds, duration: 60 }); }
  for (const fn of f.intervals.values()) fn(); await f.flush();
  assert.equal(f.verified(), 0);
  const event = f.requests.find((request) => request.url.includes('video-progress'));
  assert.equal(event.body.sessionId, 'server-session'); assert.equal(event.body.courseId, 'course');
  assert.equal(f.requests.find((request) => request.body.event === 'tick').body.seconds, 5);
  f.setSavedWatch(60); player.emit('ended'); await f.flush(); assert.ok(f.verified() > 0);
  const pauses = player.pauses; f.document.hidden = true; f.documentListeners.get('visibilitychange')();
  assert.ok(player.pauses > pauses);
  f.cleanup(); assert.equal(f.intervals.size, 0); assert.equal(f.documentListeners.size, 0); assert.equal(player.events.size, 0);
});

test('CPD ending reads the real final frame after a stale timeupdate and unlocks only after the server saves it', async () => {
  const f = playerFixture({ resume: 27.25, duration: 30 }); f.render(); await f.flush(); f.scriptReady(); f.render();
  const player = f.players[0]; player.emit('ready'); player.emit('play'); await f.flush();
  // The player has ended at 29.96, but its last timeupdate was still 27.25.
  player.currentTime = 29.96; f.setClock(3000); player.emit('pause'); player.emit('ended'); await f.flush();
  const tail = f.requests.filter((request) => request.url.includes('video-progress') && request.body.event === 'pause');
  assert.equal(tail.length, 2); assert.ok(tail.every((request) => request.body.seconds === 29.96));
  assert.equal(f.verified(), 0); // The ended event itself never grants completion.
  f.setSavedWatch(29.96); player.emit('ended'); await f.flush();
  assert.equal(f.verified(), 1);
  player.emit('ended'); await f.flush(); assert.equal(f.verified(), 1); f.cleanup();
});

test('CPD periodic saves read the current player position rather than the last timeupdate', async () => {
  const f = playerFixture(); f.render(); await f.flush(); f.scriptReady(); f.render();
  const player = f.players[0]; player.emit('ready'); player.emit('play'); await f.flush();
  player.currentTime = 5; f.setClock(5000);
  for (const fn of f.intervals.values()) fn(); await f.flush();
  assert.equal(f.requests.find((request) => request.body.event === 'tick').body.seconds, 5);
  f.cleanup();
});
