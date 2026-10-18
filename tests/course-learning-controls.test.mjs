import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as crypto from 'node:crypto';
import ts from 'typescript';
import { getCourseContent, isLessonUnlocked, extractBunnyVideoId } from '../lib/learning/course-content.ts';
import { documentViewerUrl, documentType } from '../lib/learning/documents.ts';

const videoId = '11111111-1111-4111-8111-111111111111';
const otherVideo = '22222222-2222-4222-8222-222222222222';
const quiz = { title: 'اختبار الوحدة', passingScore: 70, questions: [{ id: 'one', question: 'اختر الإجابة', options: ['أ', 'ب'], correctIndex: 1 }] };
function fixture({ journey = false, cpd = true, enrolled = true, authenticated = true, owner = 'student-1', status = 'active', failedTable = null } = {}) {
  const user = { id: 'student-1', email: 'student@qa.invalid' };
  const course = { id: 91, slug: 'دورة-تجريبية', title: 'دورة', professionalDevelopment: cpd, finalExam: structuredClone(quiz), curriculum: [
    { id: 'unit-a', title: 'الوحدة الأولى', items: [
      { id: 'video', title: 'الفيديو الأول', type: 'video', videoUrl: videoId },
      { id: 'quiz', title: 'الاختبار', type: 'quiz', quizData: structuredClone(quiz) },
    ] },
    { id: 'unit-b', title: 'الوحدة الثانية', items: [
      { id: 'slides', title: 'عرض الشرائح', type: 'ppt', fileUrl: 'https://files.invalid/slides.pptx' },
      { id: 'last', title: 'الفيديو الأخير', type: 'video', videoUrl: otherVideo },
    ] },
  ] };
  if (journey) { course.learningJourney = { enabled: true, introduction: 'مرحبا', summary: 'أحسنت', preAssessment: structuredClone(quiz) }; course.outcomes = ['فهم المحتوى']; }
  const rows = { enrollments: enrolled ? [{ id: 'enrollment', user_id: owner, email: user.email, course_id: course.slug, status }] : [],
    profiles: [], xapi_state: [], xapi_statements: [], course_lesson_progress: [], content_satisfaction: [] };
  const rpcCalls = [];
  let providerCalls = 0;
  const db = { from(table) {
    assert.ok(table in rows, `Unexpected table ${table}`);
    const filters = []; let operation = 'read'; let values; let head = false; let limit = Infinity;
    const selected = () => rows[table].filter((row) => filters.every((fn) => fn(row))).slice(0, limit);
    const key = (row) => table === 'content_satisfaction' ? [row.user_id,row.course_id,row.content_kind,row.content_key].join('|')
      : table === 'course_lesson_progress' ? [row.user_id,row.course_id,row.lesson_id].join('|')
      : table === 'xapi_state' ? [row.activity_id,row.agent_email,row.state_id].join('|') : row.statement_id;
    const run = (single = false) => {
      if (failedTable === table) return { data: null, error: { message: 'Storage unavailable' } };
      let data;
      if (operation === 'insert' || operation === 'upsert') {
        const existing = rows[table].find((row) => key(row) === key(values));
        if (existing && operation === 'insert') return { data: null, error: { code: '23505' } };
        if (existing) { Object.assign(existing, structuredClone(values)); data = [existing]; }
        else { const row = { id: crypto.randomUUID(), duration_seconds: 0, watched_seconds: 0, completed_at: null, ...structuredClone(values) }; rows[table].push(row); data = [row]; }
      } else if (operation === 'update') { data = selected(); data.forEach((row) => Object.assign(row, structuredClone(values))); }
      else if (operation === 'delete') { data = selected(); rows[table] = rows[table].filter((row) => !data.includes(row)); }
      else data = selected();
      return { data: head ? null : structuredClone(single ? data[0] || null : data), count: data.length, error: null };
    };
    const query = { select(_fields, options) { head = options?.head || false; return query; },
      eq(field, value) { filters.push((row) => row[field] === value); return query; },
      in(field, values) { filters.push((row) => values.includes(row[field])); return query; },
      ilike(field, value) { const prefix = value.split('%')[0]; filters.push((row) => row[field]?.startsWith(prefix)); return query; },
      limit(value) { limit = value; return query; },
      insert(input) { operation = 'insert'; values = input; return query; },
      upsert(input) { operation = 'upsert'; values = input; return query; },
      update(input) { operation = 'update'; values = input; return query; },
      delete() { operation = 'delete'; return query; },
      maybeSingle: async () => run(true), single: async () => run(true), then(resolve, reject) { return Promise.resolve(run()).then(resolve, reject); } };
    return query;
  }, async rpc(name, params) {
    rpcCalls.push({ name, params });
    if (name === 'start_cpd_video_session') return { data: { id: params.p_session_id, duration: params.p_duration, watchedSeconds: 0 }, error: null };
    if (name === 'record_cpd_video_progress') return { data: { accepted: true, stale: false, watchedSeconds: params.p_seconds }, error: null };
    return { data: null, error: null };
  } };
  const modules = { 'server-only': {}, 'node:crypto': crypto,
    'next/server': { NextResponse: { json: (data, options = {}) => Response.json(data, options) } },
    '@/lib/security/auth': { requireUser: async () => authenticated ? { ok: true, user, supabase: db, role: 'STUDENT' } : { ok: false, response: Response.json({}, { status: 401 }) }, isAdminRole: () => false, isInstructorRole: () => false },
    '@/lib/supabase': { getSupabaseAdmin: () => db },
    '@/lib/security/rate-limit': { consumeRateLimit: () => ({ allowed: true }) },
    '@/lib/courses-store': { getCourseBySlugAsync: async (id) => [course.slug, String(course.id)].includes(id) ? course : null },
    '@/lib/video/providers/bunny-provider': { BunnyStreamProvider: class {
      async generateSignedPlaybackUrl() { providerCalls++; return { iframeUrl: `https://iframe.mediadelivery.net/embed/1/${videoId}?token=server-token`, expiresAt: 1234 }; }
      async getVideoDetails() { return { durationSeconds: 120, status: 'ready' }; }
    } },
    '@/lib/xapi': { buildActor: (value) => value, buildStatement: (value) => value, stmtProgressed: () => null,
      storeStatement: async (statement) => { if (statement) rows.xapi_statements.push({ object_id: statement.object.id, verb_display: 'completed', actor_email: statement.actor.email }); } },
  };
  function load(name) {
    if (name in modules) return modules[name];
    const source = readFileSync(new URL(`../${name.startsWith('@/') ? name.slice(2) : name}.ts`, import.meta.url), 'utf8');
    const exports = {}; modules[name] = exports;
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
      { exports, require: load, URL, Date, Request, Response, console: { error() {} } });
    return exports;
  }
  async function invoke(route, method, body = {}) {
    const values = { courseId: course.slug, lessonId: 'video', ...body };
    const url = `https://qa.invalid/api/${route}?${new URLSearchParams(values)}`;
    const response = await load(`app/api/${route}/route`)[method](new Request(url,
      { method, ...(method === 'GET' ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) }) }));
    return { status: response.status, payload: await response.json() };
  }
  function seed(lessonId, { completed = false, watched = 0 } = {}) {
    const lesson = load('@/lib/learning/journey').getLearningContent(course).find((item) => item.id === lessonId);
    const key = load('@/lib/learning/cpd').lessonContentKey(lesson);
    const row = { user_id: user.id, course_id: course.id, lesson_id: lessonId, content_key: key,
      duration_seconds: lesson.type === 'video' ? 120 : 0, watched_seconds: watched, completed_at: completed ? new Date().toISOString() : null };
    rows.course_lesson_progress = rows.course_lesson_progress.filter((item) => item.lesson_id !== lessonId); rows.course_lesson_progress.push(row);
  }
  return { course, user, rows, invoke, seed, load, rpcCalls, providerCalls: () => providerCalls };
}

test('CPD canonical content follows units and legacy lesson IDs; unit quiz belongs to the last lesson', () => {
  const course = { curriculum: [{ id: 'unit', title: 'Unit', videoUrl: videoId, quizData: quiz, lessons: ['First','Second'] }] };
  const content = getCourseContent(course);
  assert.deepEqual(content.map((item) => item.id), ['sub-1-1','sub-1-2']);
  assert.equal(content[0].videoUrl, videoId); assert.equal(content[0].requiredQuiz, undefined);
  assert.equal(content[1].quizKey, 'section:unit');
  assert.equal(isLessonUnlocked(content.map((item) => item.id), new Set(), 'sub-1-2'), false);
  assert.equal(isLessonUnlocked(content.map((item) => item.id), new Set(['sub-1-1']), 'sub-1-2'), true);
});

test('CPD refuses direct lesson jumps, forged video completion and unpassed quiz completion', async () => {
  const f = fixture();
  assert.equal((await f.invoke('courses/complete-lesson','POST',{ lessonId: 'last', watchedSeconds: 120, score: 100 })).status, 403);
  assert.equal((await f.invoke('courses/complete-lesson','POST',{ watchedSeconds: 120, isCompleted: true })).status, 409);
  assert.equal((await f.invoke('courses/quiz-attempt','POST',{ lessonId: 'quiz', action: 'start' })).status, 403);
  f.seed('video', { watched: 120 });
  assert.equal((await f.invoke('courses/complete-lesson','POST')).status, 200);
  assert.equal((await f.invoke('courses/complete-lesson','POST',{ lessonId: 'quiz', score: 100 })).status, 409);
  const start = await f.invoke('courses/quiz-attempt','POST',{ lessonId: 'quiz', action: 'start' });
  assert.equal(start.status, 200);
  const submit = await f.invoke('courses/quiz-attempt','POST',{ lessonId: 'quiz', action: 'submit', attemptId: start.payload.attempt.id, answers: [{ questionId: 'one', selectedIndex: 1 }] });
  assert.equal(submit.status, 200); assert.equal(submit.payload.result.passed, true);
  assert.equal((await f.invoke('courses/complete-lesson','POST',{ lessonId: 'quiz' })).status, 200);
  assert.equal((await f.invoke('courses/complete-lesson','POST',{ lessonId: 'slides' })).status, 200);
  assert.equal((await f.invoke('courses/complete-lesson','POST',{ lessonId: 'last' })).status, 409);
  const progress = await f.invoke('courses/complete-lesson','GET');
  assert.deepEqual(progress.payload.completedLessonIds.sort(), ['quiz','slides','video']);
  assert.equal(progress.payload.progress, 75);
});

test('CPD unlocks final assessment only after all lessons; changed lesson content invalidates prior completion', async () => {
  const f = fixture();
  assert.equal((await f.invoke('courses/quiz-attempt','GET')).status, 403);
  for (const lesson of getCourseContent(f.course)) f.seed(lesson.id, { watched: lesson.type === 'video' ? 120 : 0, completed: true });
  assert.equal((await f.invoke('courses/quiz-attempt','GET')).status, 200);
  f.course.curriculum[0].items[0].videoUrl = otherVideo;
  const progress = await f.invoke('courses/complete-lesson','GET');
  assert.equal(progress.payload.completedLessonIds.includes('video'), false);
  assert.equal((await f.invoke('courses/quiz-attempt','GET',{ lessonId: 'quiz' })).status, 403);
});

test('free-navigation courses retain manual completion and future lesson access', async () => {
  const f = fixture({ cpd: false });
  assert.equal((await f.invoke('courses/complete-lesson','POST',{ lessonId: 'last' })).status, 200);
  assert.equal((await f.invoke('courses/quiz-attempt','GET',{ lessonId: 'quiz' })).status, 200);
});

test('playback tokens bind to the actual enrolled course lesson and server video duration', async () => {
  const f = fixture();
  assert.equal((await f.invoke('videos/playback-token','POST',{ courseSlug: f.course.slug, videoId: otherVideo, lessonId: 'last' })).status, 403);
  assert.equal((await f.invoke('videos/playback-token','POST',{ courseSlug: f.course.slug, videoId: otherVideo })).status, 403);
  assert.equal(f.providerCalls(), 0);
  const token = await f.invoke('videos/playback-token','POST',{ courseSlug: f.course.slug, videoId, duration: 1 });
  assert.equal(token.status, 200); assert.equal(token.payload.cpdSession.duration, 120);
  assert.equal(f.rpcCalls[0].params.p_duration, 120);
  assert.equal(new URL(token.payload.iframeUrl).searchParams.get('showSpeed'), 'false');
  assert.equal(extractBunnyVideoId(`https://evil.invalid/${videoId}`), null);
});

test('video heartbeats bind to canonical user/course/content and ignore forged identity fields', async () => {
  const f = fixture(); const sessionId = crypto.randomUUID();
  const result = await f.invoke('courses/video-progress','POST',{ courseId: '91', sessionId, seconds: 5, event: 'tick', userId: 'other', course_id: 123 });
  assert.equal(result.status, 200);
  const call = f.rpcCalls[0]; assert.equal(call.name, 'record_cpd_video_progress');
  assert.equal(call.params.p_user_id, f.user.id); assert.equal(call.params.p_course_id, 91);
  assert.equal(call.params.p_session_id, sessionId); assert.equal(call.params.p_lesson_id, 'video');
  assert.equal(call.params.p_content_key.length, 64);
});

for (const options of [{ authenticated: false }, { enrolled: false }, { owner: 'another-user' }, { status: 'revoked' }, { status: 'expired' }]) {
  test(`lesson hearts and video telemetry require owned active enrollment: ${JSON.stringify(options)}`, async () => {
    const f = fixture(options);
    const expected = options.authenticated === false ? 401 : 403;
    assert.equal((await f.invoke('courses/satisfaction','PUT',{ kind: 'lesson', liked: true })).status, expected);
    assert.equal((await f.invoke('courses/video-progress','POST',{ seconds: 120, sessionId: crypto.randomUUID(), event: 'tick' })).status, expected);
    assert.equal(f.rows.content_satisfaction.length, 0); assert.equal(f.rpcCalls.length, 0);
  });
}

test('one heart per learner/content is idempotent, undoable, and cannot target another learner', async () => {
  const f = fixture({ cpd: false });
  const first = await f.invoke('courses/satisfaction','PUT',{ kind: 'lesson', liked: true, userId: 'forged', course_id: 123 });
  assert.deepEqual(first.payload, { success: true, liked: true, count: 1 });
  await f.invoke('courses/satisfaction','PUT',{ courseId: '91', kind: 'lesson', liked: true });
  assert.equal(f.rows.content_satisfaction.length, 1); assert.equal(f.rows.content_satisfaction[0].user_id, f.user.id);
  f.rows.content_satisfaction.push({ user_id: 'other', course_id: 91, content_kind: 'lesson', content_key: 'video', content_title: 'Other' });
  const removed = await f.invoke('courses/satisfaction','PUT',{ kind: 'lesson', liked: false, userId: 'other' });
  assert.deepEqual(removed.payload, { success: true, liked: false, count: 1 });
  assert.equal(f.rows.content_satisfaction[0].user_id, 'other');
  const quizHeart = await f.invoke('courses/satisfaction','PUT',{ lessonId: 'quiz', kind: 'quiz', liked: true });
  assert.equal(quizHeart.status, 200); assert.equal(f.rows.content_satisfaction[1].content_key, 'lesson:quiz');
});

test('future CPD hearts, invalid events, unknown content and failed writes do not record data', async () => {
  const f = fixture();
  assert.equal((await f.invoke('courses/satisfaction','PUT',{ lessonId: 'last', kind: 'lesson', liked: true })).status, 403);
  assert.equal((await f.invoke('courses/satisfaction','PUT',{ lessonId: 'foreign', kind: 'lesson', liked: true })).status, 404);
  assert.equal((await f.invoke('courses/video-progress','POST',{ sessionId: crypto.randomUUID(), event: 'tick', seconds: -1 })).status, 400);
  assert.equal(f.rows.content_satisfaction.length, 0); assert.equal(f.rpcCalls.length, 0);
  const broken = fixture({ cpd: false, failedTable: 'content_satisfaction' });
  assert.equal((await broken.invoke('courses/satisfaction','PUT',{ kind: 'lesson', liked: true })).status, 503);
});

test('PowerPoint previews encode the complete public URL and preserve safe download fallback', () => {
  const url = 'https://files.invalid/عرض.pptx?token=a&expires=123';
  const viewer = new URL(documentViewerUrl(url));
  assert.equal(viewer.hostname, 'view.officeapps.live.com');
  assert.equal(viewer.searchParams.get('src'), new URL(url).toString());
  assert.equal(documentType(url, 'pdf'), 'ppt');
  assert.equal(documentViewerUrl('javascript:alert(1)', 'ppt'), null);
  assert.equal(documentViewerUrl('https://files.invalid/manual.pdf'), 'https://files.invalid/manual.pdf');
});

async function answerJourneyQuiz(f, lessonId, selectedIndex = 1) {
  const start = await f.invoke('courses/quiz-attempt', 'POST', { lessonId, action: 'start' });
  assert.equal(start.status, 200, JSON.stringify(start.payload));
  const result = await f.invoke('courses/quiz-attempt', 'POST', { lessonId, action: 'submit', attemptId: start.payload.attempt.id, answers: [{ questionId: 'one', selectedIndex }] });
  assert.equal(result.status, 200, JSON.stringify(result.payload));
  return result.payload.result;
}

test('opt-in journey preserves lesson IDs and gives pre/post assessments their own stations and safe public metadata', () => {
  const f = fixture({ journey: true });
  const { getLearningContent, JOURNEY_IDS } = f.load('@/lib/learning/journey');
  const { resolveCourseQuiz, toPublicCourse } = f.load('@/lib/quizzes/course-quiz');
  const steps = getLearningContent(f.course);
  assert.deepEqual(Array.from(steps, step => step.id), [JOURNEY_IDS.welcome, JOURNEY_IDS.objectives, JOURNEY_IDS.pre, 'video', 'quiz', 'slides', 'last', JOURNEY_IDS.final]);
  assert.equal(steps[2].diagnostic, true);
  assert.equal(resolveCourseQuiz(f.course, JOURNEY_IDS.pre).key, 'pre');
  assert.equal(resolveCourseQuiz(f.course, JOURNEY_IDS.final).key, 'final');
  assert.equal(resolveCourseQuiz(f.course, 'video'), null);
  assert.equal(resolveCourseQuiz(f.course, 'quiz').key, 'lesson:quiz');
  const safe = toPublicCourse(f.course);
  assert.equal(safe.learningJourney.preAssessment.questions[0].correctIndex, undefined);
  assert.equal(f.course.learningJourney.preAssessment.questions[0].correctIndex, 1);
  f.course.professionalDevelopment = false;
  assert.deepEqual(Array.from(getLearningContent(f.course), step => step.id), ['video', 'quiz', 'slides', 'last']);
});

test('journey enforces ordered stations, accepts a failed diagnostic, and reaches 100 only after server-graded post-assessment', async () => {
  const f = fixture({ journey: true });
  const { JOURNEY_IDS: ids } = f.load('@/lib/learning/journey');
  assert.equal((await f.invoke('courses/journey/complete', 'POST', { score: 100, completed: true })).status, 409);
  assert.equal((await f.invoke('courses/quiz-attempt', 'GET', { lessonId: ids.final })).status, 403);
  assert.equal((await f.invoke('courses/complete-lesson', 'POST', { lessonId: ids.objectives })).status, 403);
  for (const lessonId of [ids.welcome, ids.objectives]) assert.equal((await f.invoke('courses/complete-lesson', 'POST', { lessonId })).status, 200);
  assert.equal((await f.invoke('courses/complete-lesson', 'POST', { lessonId: ids.pre, passed: true })).status, 409);
  assert.equal((await answerJourneyQuiz(f, ids.pre, 0)).passed, false);
  assert.equal((await f.invoke('courses/complete-lesson', 'POST', { lessonId: ids.pre })).status, 200);
  f.seed('video', { watched: 120 });
  assert.equal((await f.invoke('courses/complete-lesson', 'POST', { lessonId: 'video' })).status, 200);
  await answerJourneyQuiz(f, 'quiz');
  for (const lessonId of ['quiz', 'slides']) assert.equal((await f.invoke('courses/complete-lesson', 'POST', { lessonId })).status, 200);
  assert.equal((await f.invoke('courses/quiz-attempt', 'GET', { lessonId: ids.final })).status, 403);
  f.seed('last', { watched: 120 });
  assert.equal((await f.invoke('courses/complete-lesson', 'POST', { lessonId: 'last' })).status, 200);
  assert.equal((await answerJourneyQuiz(f, ids.final, 0)).passed, false);
  assert.equal((await f.invoke('courses/complete-lesson', 'POST', { lessonId: ids.final, score: 100 })).status, 409);
  assert.equal((await f.invoke('courses/journey/complete', 'POST', { score: 100 })).status, 409);
  assert.equal((await answerJourneyQuiz(f, ids.final)).passed, true);
  const last = await f.invoke('courses/complete-lesson', 'POST', { lessonId: ids.final });
  assert.equal(last.status, 200); assert.equal(last.payload.progress, 99);
  assert.equal(f.rows.enrollments[0].status, 'active');
  const finish = await f.invoke('courses/journey/complete', 'POST', { score: 0 });
  assert.equal(finish.status, 200, JSON.stringify(finish.payload)); assert.equal(finish.payload.progress, 100);
  assert.equal(f.rows.enrollments[0].status, 'completed'); assert.equal(finish.payload.score, 100); assert.equal(f.rows.enrollments[0].grade, undefined);
  assert.equal((await f.invoke('courses/complete-lesson', 'GET')).payload.journeyComplete, true);
  const revisit = await f.invoke('courses/complete-lesson', 'POST', { lessonId: ids.welcome });
  assert.equal(revisit.payload.progress, 100); assert.equal(revisit.payload.completionPendingAssessment, false);
  f.course.outcomes.push('هدف جديد');
  assert.equal((await f.invoke('courses/complete-lesson', 'GET')).payload.journeyComplete, false);
  assert.equal((await f.invoke('courses/journey/complete', 'POST')).status, 409);
});

test('interactive content completion is versioned and future lesson and quiz hearts remain locked', async () => {
  const f = fixture({ journey: true });
  f.course.curriculum = [{ id: 'article', title: 'محتوى', type: 'article', contentBlocks: [{ id: 'text', type: 'text', text: 'شرح أول' }] }];
  const { getLearningContent, JOURNEY_IDS: ids } = f.load('@/lib/learning/journey');
  assert.equal((await f.invoke('courses/satisfaction', 'PUT', { lessonId: ids.final, kind: 'quiz', liked: true })).status, 403);
  for (const step of getLearningContent(f.course)) f.seed(step.id, { completed: true });
  assert.equal((await f.invoke('courses/satisfaction', 'PUT', { lessonId: ids.pre, kind: 'quiz', liked: true })).status, 200);
  assert.equal(f.rows.content_satisfaction[0].content_key, 'pre');
  f.course.curriculum[0].contentBlocks[0].text = 'شرح جديد';
  assert.equal((await f.invoke('courses/complete-lesson', 'GET')).payload.completedLessonIds.includes('article'), false);
  assert.equal((await f.invoke('courses/quiz-attempt', 'GET', { lessonId: ids.final })).status, 403);
});

for (const options of [{ enrolled: false }, { authenticated: false }, { owner: 'another-user' }, { status: 'revoked' }]) test(`journey completion rejects unauthorized user ${JSON.stringify(options)}`, async () => {
  const f = fixture({ journey: true, ...options });
  assert.equal((await f.invoke('courses/journey/complete', 'POST')).status, options.authenticated === false ? 401 : 403);
  assert.equal(f.rows.enrollments[0]?.completed_at, undefined);
});

test('legacy client progress cannot overwrite a verified journey completion', async () => {
  const f = fixture({ journey: true, status: 'completed' }); f.rows.enrollments[0].progress = 100;
  assert.equal((await f.invoke('courses/update-progress', 'POST', { courseSlug: f.course.slug, progress: 1 })).status, 409);
  assert.equal(f.rows.enrollments[0].status, 'completed'); assert.equal(f.rows.enrollments[0].progress, 100);
});
