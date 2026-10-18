'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Award, BookOpen, Bookmark, Check, CheckCircle2, ChevronDown, Circle, DoorOpen, FileText, Flag, GraduationCap, HelpCircle, ListChecks, Loader2, LockKeyhole, Play, Route, Target, Video } from 'lucide-react';
import type { Course } from '@/types';
import type { LessonContent } from '@/lib/learning/course-content';
import { isLessonUnlocked } from '@/lib/learning/course-content';
import { getLearningContent } from '@/lib/learning/journey';
import { getLessonResourceGroups } from '@/lib/courses/curriculum-files';
import { StudentVideoPlayer } from './student-video-player';
import { InternalQuizPanel } from './internal-quiz-panel';
import { LessonContentBlocks } from './lesson-content-blocks';
import { CourseDocumentViewer } from './course-document-viewer';
import { CourseResourcesPanel } from './course-resources-panel';
import { SatisfactionHeart } from './satisfaction-heart';
import styles from './professional-journey.module.css';
import workspace from './course-workspace.module.css';

const REVIEW = '__journey_review__';
const stationIcon = (type: string) => type === 'video' ? Video : type === 'quiz' ? HelpCircle : type === 'welcome' ? DoorOpen : type === 'objectives' ? Target : ['pdf', 'ppt', 'doc'].includes(type) ? FileText : BookOpen;

function JourneyStation({ course, lesson, completed, busy, onContinue }: { course: Course; lesson: LessonContent; completed: boolean; busy: boolean; onContinue: () => void }) {
  const [videoReady, setVideoReady] = useState(false);
  const [blocksReady, setBlocksReady] = useState(!lesson.contentBlocks?.some((block) => ['cards', 'tabs'].includes(block.type)));
  const [quizReady, setQuizReady] = useState(false);
  const [documentRead, setDocumentRead] = useState(false);
  const document = ['pdf', 'doc', 'ppt'].includes(lesson.type);
  const ready = completed || ((lesson.type !== 'video' || videoReady) && blocksReady && (!lesson.requiredQuiz || quizReady) && (!document || documentRead));
  const resources = getLessonResourceGroups(course, lesson.id, true);
  return <>
    <div className={styles.stationBody}>
      {lesson.type === 'welcome' ? <div className={styles.welcome}>
        <span className={styles.welcomeIcon}><GraduationCap aria-hidden="true" /></span><p className={styles.eyebrow}>تعلّم بخطوات واضحة</p><h2>{course.title}</h2>
        <p className={styles.introduction}>{lesson.description || 'أهلًا بك. ابدأ رحلتك، وتقدّم خطوة بخطوة حتى إكمال جميع المحطات.'}</p>
        <div className={styles.welcomeFeatures}>{[{ Icon: Target, text: 'أهداف محددة' }, { Icon: BookOpen, text: 'تعلّم تفاعلي' }, { Icon: CheckCircle2, text: 'تقدّم محفوظ' }].map(({ Icon, text }) => <span key={text}><Icon aria-hidden="true" />{text}</span>)}</div>
        <p className={styles.helper}>ابدأ بالأهداف والتقييم القبلي، ثم أكمل الدروس بالترتيب. يمكنك العودة إلى المحتوى المكتمل في أي وقت.</p>
      </div> : <>
        {lesson.description && <p className={styles.introduction}>{lesson.description}</p>}
        {lesson.type === 'video' && <StudentVideoPlayer courseSlug={course.slug} lessonId={lesson.id} lessonTitle={lesson.title} videoUrl={lesson.videoUrl} professionalDevelopment hideToolbar isCompleted={completed} onVideoVerified={() => setVideoReady(true)} />}
        {lesson.contentBlocks?.length ? <LessonContentBlocks blocks={lesson.contentBlocks} onReady={setBlocksReady} /> : null}
        {document && <><CourseDocumentViewer fileUrl={lesson.fileUrl} title={lesson.title} type={lesson.type} /><label className={styles.readConfirmation}><input type="checkbox" checked={completed || documentRead} disabled={completed} onChange={(event) => setDocumentRead(event.target.checked)} />اطّلعت على مستند الدرس</label></>}
        {lesson.requiredQuiz && (lesson.type !== 'video' || videoReady || completed) && <section aria-label={lesson.diagnostic ? 'الاختبار القبلي' : 'اختبار المحطة'} className="space-y-5">
          {lesson.type !== 'quiz' && <h3 className="text-base font-semibold text-blue-950">اختبار هذه المحطة</h3>}
          <InternalQuizPanel courseId={course.slug} lessonId={lesson.id} diagnostic={lesson.diagnostic} sequential onResult={setQuizReady} />
          {lesson.type !== 'quiz' && <SatisfactionHeart inline courseId={course.slug} lessonId={lesson.id} kind="quiz" />}
        </section>}
        {lesson.type === 'video' && lesson.requiredQuiz && !videoReady && !completed && <p className={styles.helper}>يظهر اختبار المحطة بعد اكتمال مشاهدة الفيديو.</p>}
      </>}
      {resources.length > 0 && <details className={styles.resources}><summary>ملفات هذه المحطة ومراجع الدورة <ChevronDown aria-hidden="true" /></summary><div className="pt-5"><CourseResourcesPanel groups={resources} /></div></details>}
    </div>
    <div className={styles.continueBar}><p role="status">{completed ? 'هذه المحطة مكتملة ومحفوظة في حسابك.' : ready ? 'أكمل المحطة واحفظ تقدمك للانتقال إلى التالية.' : lesson.type === 'video' && !videoReady ? 'شاهد الفيديو كاملًا لفتح المتابعة.' : lesson.requiredQuiz && !quizReady ? lesson.diagnostic ? 'سلّم إجابات التقييم القبلي للمتابعة.' : 'اجتز اختبار المحطة للمتابعة.' : document ? 'اطّلع على المستند وأكّد القراءة للمتابعة.' : 'افتح جميع أجزاء المحتوى التفاعلي للمتابعة.'}</p><button type="button" disabled={!ready || busy} onClick={onContinue} className={styles.primary}>{busy ? <Loader2 className="animate-spin" /> : completed ? <ArrowLeft /> : <CheckCircle2 />}{completed ? 'المحطة التالية' : lesson.type === 'welcome' ? 'ابدأ الرحلة' : 'إكمال ومتابعة'}</button></div>
  </>;
}

export function ProfessionalCourseJourney({ course, initialLessonId }: { course: Course; initialLessonId: string }) {
  const lessons = useMemo(() => getLearningContent(course), [course]);
  const ids = useMemo(() => lessons.map((lesson) => lesson.id), [lessons]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState('');
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reload, setReload] = useState(0);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const courseId = course.slug;
  const bookmarkKey = `nabd-journey-bookmarks:${courseId}`;
  useEffect(() => {
    try { const saved: unknown = JSON.parse(localStorage.getItem(bookmarkKey) || '[]'); if (Array.isArray(saved)) setBookmarks(saved.filter((value): value is string => typeof value === 'string')); } catch { /* Bookmarks are optional on this device. */ }
  }, [bookmarkKey]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/courses/complete-lesson?${new URLSearchParams({ courseId })}`, { cache: 'no-store', signal: controller.signal }).then(async (response) => {
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok || !data.success || !Array.isArray(data.completedLessonIds)) throw new Error(data.message || 'تعذر تحميل تقدم الرحلة');
      const saved = new Set<string>(data.completedLessonIds.filter((id: string) => ids.includes(id)));
      setCompleted(saved); setProgress(Number(data.progress) || 0); setFinished(data.journeyComplete === true); setError('');
      setSelected(ids.includes(initialLessonId) && isLessonUnlocked(ids, saved, initialLessonId) ? initialLessonId : ids.find((id) => !saved.has(id)) || REVIEW);
    }).catch((failure: unknown) => { if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'تعذر تحميل الرحلة'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [courseId, initialLessonId, ids, reload]);
  const index = ids.indexOf(selected);
  const lesson = lessons[index];
  const allDone = ids.every((id) => completed.has(id));
  const navigate = (id: string) => { setSelected(id); setMenuOpen(false); setError(''); requestAnimationFrame(() => { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }); };
  const next = async () => {
    if (!lesson || busy) return;
    if (completed.has(lesson.id)) { navigate(ids[index + 1] || REVIEW); return; }
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/courses/complete-lesson', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId, lessonId: lesson.id }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'تعذر حفظ تقدمك');
      setCompleted((current) => new Set([...current, lesson.id])); setProgress(Number(data.progress) || 0); navigate(ids[index + 1] || REVIEW);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'تعذر حفظ تقدمك'); }
    finally { setBusy(false); }
  };
  const finish = async () => {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/courses/journey/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'تعذر اعتماد إكمال الرحلة');
      setFinished(true); setProgress(100);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'تعذر اعتماد الإكمال'); }
    finally { setBusy(false); }
  };
  const toggleBookmark = () => { const next = bookmarks.includes(selected) ? bookmarks.filter((id) => id !== selected) : [...bookmarks, selected]; setBookmarks(next); try { localStorage.setItem(bookmarkKey, JSON.stringify(next)); } catch { /* Keep this session's bookmark. */ } };
  if (loading || !selected) return <div className={styles.loading} dir="rtl">{loading ? <><Loader2 className="animate-spin" /><p>نجهّز رحلتك وتقدمك المحفوظ…</p></> : <><LockKeyhole /><p role="alert">{error || 'تعذر تحميل رحلة التعلّم'}</p><button type="button" className={styles.primary} onClick={() => setReload((value) => value + 1)}>إعادة المحاولة</button><Link href="/dashboard/student/courses">العودة إلى دوراتي</Link></>}</div>;
  const ActiveIcon = lesson ? stationIcon(lesson.type) : Award;
  return <div className={styles.journey} dir="rtl">
    <header className={styles.topbar}><Link href="/dashboard/student/courses" className={styles.backLink}><ArrowRight />دوراتي</Link><span className={styles.courseTitle}>{course.title}</span><span className={styles.mode}><Route aria-hidden="true" />تطوير مهني</span></header>
    <div className={workspace.shell}>
    <div className={workspace.grid}>
      <aside className={styles.sidebar} aria-label="خريطة رحلة التعلّم">
        <div className={styles.progressHeader}><span className={styles.brandIcon}><ListChecks /></span><div><h2>رحلتك التعليمية</h2><p>{completed.size} من {lessons.length} محطات مكتملة</p></div><strong>{progress}%</strong></div>
        <div role="progressbar" aria-label="تقدم الدورة" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className={styles.progressTrack}><span style={{ width: `${progress}%` }} /></div>
        <button type="button" aria-expanded={menuOpen} aria-controls="journey-itinerary" className={styles.mobileMenu} onClick={() => setMenuOpen((value) => !value)}>عرض محطات الرحلة <ChevronDown className={menuOpen ? 'rotate-180' : ''} /></button>
        <nav id="journey-itinerary" className={`${styles.itinerary} ${menuOpen ? styles.itineraryOpen : ''}`}>
          {lessons.map((step, stepIndex) => { const allowed = isLessonUnlocked(ids, completed, step.id); const done = completed.has(step.id); const Icon = stationIcon(step.type); const group = step.sectionId === '__journey__' ? step.diagnostic ? 'قبل التعلّم' : step.quizKey === 'final' ? 'بعد التعلّم' : 'بداية الرحلة' : course.curriculum?.find((unit, unitIndex) => (unit.id || `sec-${unitIndex + 1}`) === step.sectionId)?.title || 'محتوى الدورة';
            return <button type="button" key={step.id} aria-current={selected === step.id ? 'step' : undefined} disabled={!allowed || busy} className={`${styles.step} ${selected === step.id ? styles.activeStep : ''} ${done ? styles.doneStep : ''}`} onClick={() => navigate(step.id)}><span className={styles.stepIcon}>{done ? <Check /> : allowed ? <Icon /> : <LockKeyhole />}</span><span className={styles.stepText}><small>{group}</small><span>{step.title}</span></span>{bookmarks.includes(step.id) ? <Bookmark className={styles.savedMark} fill="currentColor" /> : <span className={styles.stepNumber}>{String(stepIndex + 1).padStart(2, '0')}</span>}</button>;
          })}
          <button type="button" disabled={!allDone || busy} aria-current={selected === REVIEW ? 'step' : undefined} className={`${styles.step} ${selected === REVIEW ? styles.activeStep : ''}`} onClick={() => navigate(REVIEW)}><span className={styles.stepIcon}>{finished ? <CheckCircle2 /> : <Flag />}</span><span className={styles.stepText}><small>خطوتك الأخيرة</small><span>مراجعة وإكمال الرحلة</span></span></button>
        </nav>
      </aside>
      <main className={styles.main}>
        <article className={styles.station}>
          <header className={styles.stationHeader}><span className={styles.stationIcon}><ActiveIcon /></span><div><p>{lesson ? `المحطة ${index + 1} من ${lessons.length}` : 'ختام الرحلة'}</p><h1 ref={heading} tabIndex={-1}>{lesson?.title || (finished ? 'أتممت رحلتك التعليمية' : 'راجع تقدمك وأكمل الرحلة')}</h1></div>{lesson && <button type="button" aria-pressed={bookmarks.includes(selected)} aria-label={bookmarks.includes(selected) ? 'إزالة العلامة المرجعية' : 'حفظ علامة مرجعية على هذا الجهاز'} title="علامة مرجعية على هذا الجهاز" className={styles.bookmark} onClick={toggleBookmark}><Bookmark fill={bookmarks.includes(selected) ? 'currentColor' : 'none'} /></button>}</header>
          {error && <div role="alert" className={styles.error}>{error}<button type="button" onClick={() => setReload((value) => value + 1)}>تحديث التقدم</button></div>}
          {lesson ? <JourneyStation key={lesson.id} course={course} lesson={lesson} completed={completed.has(lesson.id)} busy={busy} onContinue={() => void next()} /> : <div className={styles.stationBody}>
            <div className={styles.finishHero}><span><Award /></span><h2>{finished ? 'إنجاز يستحق أن تفخر به' : 'خطوة أخيرة لتسجيل إنجازك'}</h2><p>{course.learningJourney?.summary || 'راجع المحطات المكتملة أدناه، ثم اعتمد إكمال رحلتك التعليمية.'}</p></div>
            <ul className={styles.checklist}>{lessons.map((step) => <li key={step.id}>{completed.has(step.id) ? <CheckCircle2 /> : <Circle />}<span>{step.title}</span></li>)}</ul>
            {finished ? <div className={styles.finishActions}><p role="status">تم تسجيل إكمال الدورة بنسبة 100% وحفظ نتيجة الاختبار البعدي.</p><Link href="/dashboard/student/certificates" className={styles.primary}><Award />شهاداتي</Link><button type="button" className={styles.secondary} onClick={() => navigate(ids[0])}><Play />مراجعة الرحلة</button></div> : <div className={styles.finishActions}><p>نتحقق من إكمال المحطات واجتياز الاختبار البعدي قبل اعتماد الدورة.</p><button type="button" disabled={!allDone || busy} className={styles.primary} onClick={() => void finish()}>{busy ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}اعتماد إكمال الدورة</button></div>}
          </div>}
        </article>
        <footer className={styles.navigation}><button type="button" disabled={busy || index === 0} onClick={() => navigate(ids[selected === REVIEW ? ids.length - 1 : index - 1])}><ArrowRight />المحطة السابقة</button><span><CheckCircle2 />تقدمك محفوظ في حسابك</span></footer>
      </main>
    </div>
    </div>
    {lesson && <SatisfactionHeart key={lesson.id} courseId={course.slug} lessonId={lesson.id} kind={lesson.type === 'quiz' ? 'quiz' : 'lesson'} />}
  </div>;
}
