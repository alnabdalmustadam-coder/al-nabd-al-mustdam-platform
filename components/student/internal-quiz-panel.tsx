'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { QuizQuestionInput, QuizQuestionReview } from '@/components/quizzes/quiz-question';
import { SatisfactionHeart } from './satisfaction-heart';
import { isQuizAnswerComplete, type GradedQuizQuestion, type StudentQuizAnswer, type StudentQuizQuestion } from '@/lib/quizzes/model';

type Session = { id: string; title: string; passPercentage: number; startedAt: string; expiresAt: string | null;
  questions: StudentQuizQuestion[]; savedAnswers: StudentQuizAnswer[] };
type Quiz = { title: string; passPercentage: number; questionCount: number; durationMinutes: number };
type Result = { attemptId: string; title: string; score: number; passPercentage: number; passed: boolean;
  completedAt: string; totalQuestions: number; correctAnswers: number; results: GradedQuizQuestion[];
  ranking?: { rank: number; participants: number; bestScore: number } | null };
type Payload = { success: boolean; message?: string; quiz?: Quiz; attempt?: Session | null; result?: Result | null };

export function InternalQuizPanel({ courseId, lessonId, onPassed, onResult, sequential = false, diagnostic = false }: { courseId: string; lessonId: string; onPassed?: () => void; onResult?: (ready: boolean) => void; sequential?: boolean; diagnostic?: boolean }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [answers, setAnswers] = useState<Record<string, StudentQuizAnswer>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState(false);
  const [draftError, setDraftError] = useState(false);
  const [canRestart, setCanRestart] = useState(false);
  const [reload, setReload] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  useEffect(() => { onResult?.(Boolean(result && (diagnostic || result.passed))); }, [result, diagnostic, onResult]);
  const touched = useRef(false);
  const accept = useCallback((payload: Payload) => {
    if (payload.quiz) setQuiz(payload.quiz);
    setResult(payload.result || null);
    setSession(payload.attempt || null);
    touched.current = false;
    const saved = Object.fromEntries((payload.attempt?.savedAnswers || []).map((answer) => [answer.questionId, answer]));
    setQuestionIndex(Math.max(0, payload.attempt?.questions.findIndex((question) => !isQuizAnswerComplete(question, saved[question.id])) ?? 0));
    setAnswers(Object.fromEntries((payload.attempt?.savedAnswers || []).map((answer) => [answer.questionId, answer])));
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/courses/quiz-attempt?${new URLSearchParams({ courseId, lessonId })}`, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as Payload;
        if (controller.signal.aborted) return;
        if (response.status === 404) { setEmpty(true); return; }
        if (!response.ok || !payload.success) throw new Error(payload.message || 'تعذر تحميل الاختبار');
        setEmpty(false); setError(null); accept(payload);
      }).catch((failure: unknown) => { if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'تعذر تحميل الاختبار'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [courseId, lessonId, reload, accept]);

  useEffect(() => {
    if (!session || result || !touched.current) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch('/api/courses/quiz-attempt', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ courseId, lessonId, attemptId: session.id, answers: Object.values(answers) }) })
        .then((response) => { if (!controller.signal.aborted) setDraftError(!response.ok); })
        .catch(() => { if (!controller.signal.aborted) setDraftError(true); });
    }, 800);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [answers, courseId, lessonId, session, result]);

  const perform = async (action: 'start' | 'submit') => {
    setBusy(true); setError(null);
    let staleAttempt = false;
    try {
      const response = await fetch('/api/courses/quiz-attempt', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, courseId, lessonId, attemptId: session?.id, answers: Object.values(answers) }) });
      const payload = await response.json() as Payload;
      if (!response.ok || !payload.success) {
        staleAttempt = response.status === 409;
        throw new Error(payload.message || 'تعذر حفظ المحاولة');
      }
      accept(payload); setDraftError(false); setCanRestart(false);
      if (payload.result?.passed) onPassed?.();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'تعذر حفظ المحاولة');
      setCanRestart(staleAttempt || Boolean(session?.expiresAt && Date.parse(session.expiresAt) < Date.now()));
    }
    finally { setBusy(false); }
  };
  if (loading) return <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-600"><Loader2 className="h-5 w-5 animate-spin" />جاري تحميل الاختبار...</div>;
  if (empty) return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm font-bold text-slate-600"><BookOpen className="mx-auto mb-3 h-7 w-7" />لم تتم إضافة اختبار لهذا الدرس بعد.</div>;
  const complete = Boolean(session?.questions.every((question) => isQuizAnswerComplete(question, answers[question.id])));
  return <div className="space-y-5" dir="rtl">
    {error && <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">{error}
      {!session && !result && <button type="button" onClick={() => { setLoading(true); setReload((value) => value + 1); }} className="underline">إعادة المحاولة</button>}
      {canRestart && <button type="button" disabled={busy} onClick={() => void perform('start')} className="underline">بدء محاولة جديدة</button>}
    </div>}
    {result ? <>
      <div className={`space-y-2 rounded-2xl border p-5 text-center ${diagnostic || result.passed ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
        <h3 className="text-base font-black text-slate-900">{result.title}</h3>
        <p className="text-4xl font-black text-blue-900">{result.score}%</p>
        <p className="text-sm font-bold text-slate-700">{result.correctAnswers} صحيحة · {result.totalQuestions - result.correctAnswers} خاطئة · {result.totalQuestions} سؤال</p>
        <p className="text-sm font-black text-slate-800">{diagnostic ? 'تم تسجيل التقييم القبلي؛ يمكنك الآن بدء التعلّم.' : `${result.passed ? 'تم اجتياز الاختبار' : 'لم تتحقق نسبة الاجتياز'} · المطلوب ${result.passPercentage}%`}</p>
        <p className="flex items-center justify-center gap-1 text-xs text-slate-600"><CheckCircle2 className="h-4 w-4" />تم حفظ النتيجة في حسابك</p>
        {result.ranking ? <div className="mt-4 rounded-xl border border-blue-200 bg-white/80 p-4">
          <p className="text-sm font-black text-blue-900">ترتيبك {result.ranking.rank} من {result.ranking.participants} طالب</p>
          <p className="mt-1 text-xs leading-6 text-slate-600">بأفضل نتيجة لك ({result.ranking.bestScore}%) بين من سلّموا نفس الاختبار في هذه الدورة. الدرجات المتساوية لها نفس المركز.</p>
        </div> : <p className="text-xs text-slate-500">الترتيب غير متاح مؤقتاً. أعد تحميل الاختبار لتحديثه.</p>}
        <SatisfactionHeart courseId={courseId} lessonId={lessonId} kind="quiz" />
      </div>
      {sequential ? <details className="rounded-2xl border border-slate-200 p-4"><summary className="cursor-pointer text-sm font-semibold text-blue-900">مراجعة الإجابات والشرح</summary><div className="mt-4 space-y-4">{result.results.map((question) => <QuizQuestionReview key={question.id} question={question} />)}</div></details> : result.results.map((question) => <QuizQuestionReview key={question.id} question={question} />)}
      <button type="button" disabled={busy} onClick={() => void perform('start')} className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-xs font-black text-blue-900 disabled:opacity-50"><RefreshCw className="h-4 w-4" />محاولة جديدة</button>
    </> : session ? <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <h3 className="text-sm font-black text-slate-900">{session.title}</h3><span className="text-xs font-bold text-slate-600">{diagnostic ? 'تقييم قبلي · لا يشترط الاجتياز' : `نسبة الاجتياز ${session.passPercentage}%`}</span>
        {session.expiresAt && <span className="text-xs font-bold text-slate-600">تنتهي المحاولة: {new Date(session.expiresAt).toLocaleTimeString('ar-EG')}</span>}
      </div>
      {sequential && <div className="space-y-2"><p role="status" className="text-xs text-slate-500">السؤال {questionIndex + 1} من {session.questions.length}</p><div className="h-1.5 overflow-hidden rounded-full bg-blue-50"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${((questionIndex + 1) / session.questions.length) * 100}%` }} /></div></div>}
      {session.questions.map((question, index) => (!sequential || index === questionIndex) && <section key={question.id} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <h4 className="text-sm font-black leading-7 text-slate-900">{index + 1}. {question.text}</h4>
        <QuizQuestionInput question={question} answer={answers[question.id]} onChange={(answer) => { touched.current = true; setAnswers((current) => ({ ...current, [question.id]: answer })); }} />
      </section>)}
      {draftError && <p role="status" className="text-xs text-amber-800">تعذر حفظ مسودة الإجابات. يمكنك إعادة المحاولة أو تسليم الإجابات الحالية.</p>}
      {sequential && <div className="flex items-center justify-between gap-3"><button type="button" disabled={questionIndex === 0 || busy} onClick={() => setQuestionIndex((index) => index - 1)} className="min-h-11 rounded-xl border border-slate-200 px-5 text-xs font-semibold text-slate-600 disabled:opacity-40">السؤال السابق</button>{questionIndex < session.questions.length - 1 && <button type="button" disabled={busy || !isQuizAnswerComplete(session.questions[questionIndex], answers[session.questions[questionIndex].id])} onClick={() => setQuestionIndex((index) => index + 1)} className="min-h-11 rounded-xl bg-blue-900 px-5 text-xs font-semibold text-white disabled:opacity-40">السؤال التالي</button>}</div>}
      {(!sequential || questionIndex === session.questions.length - 1) && <button type="button" disabled={!complete || busy} onClick={() => void perform('submit')} className="flex min-h-11 items-center gap-2 rounded-xl bg-blue-900 px-5 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50">{busy && <Loader2 className="h-4 w-4 animate-spin" />}اعتماد الإجابات وحفظ النتيجة</button>}
    </> : quiz ? <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <h3 className="text-base font-black text-slate-900">{quiz.title}</h3>
      <p className="text-sm text-slate-600">{quiz.questionCount} سؤال · {diagnostic ? 'تقييم المعرفة السابقة دون شرط نجاح' : `نسبة الاجتياز ${quiz.passPercentage}%`}{quiz.durationMinutes ? ` · المدة ${quiz.durationMinutes} دقيقة` : ''}</p>
      <button type="button" disabled={busy} onClick={() => void perform('start')} className="flex min-h-11 items-center gap-2 rounded-xl bg-blue-900 px-5 py-3 text-xs font-black text-white disabled:opacity-50">{busy && <Loader2 className="h-4 w-4 animate-spin" />}ابدأ الاختبار</button>
    </div> : null}
  </div>;
}
