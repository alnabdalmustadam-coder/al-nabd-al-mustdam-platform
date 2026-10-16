'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  HelpCircle,
  Loader2,
  Send,
  X,
} from 'lucide-react';
import { QuizQuestionInput, QuizQuestionReview } from '@/components/quizzes/quiz-question';
import { isQuizAnswerComplete } from '@/lib/quizzes/model';
import type {
  GradedQuizQuestion,
  StudentQuizAnswer,
  StudentQuizQuestion,
} from '@/lib/quizzes/model';

export type QuizAttemptSession = {
  id: string;
  quizId: string;
  title: string;
  startedAt: string;
  expiresAt: string;
  remainingSeconds: number;
  passPercentage: number;
  questions: StudentQuizQuestion[];
  savedAnswers: StudentQuizAnswer[];
};

export type QuizAttemptResult = {
  attemptId: string;
  quizId: string;
  title: string;
  score: number;
  passPercentage: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string | null;
  results: GradedQuizQuestion[];
};

type Props = {
  session: QuizAttemptSession | null;
  initialResult: QuizAttemptResult | null;
  onClose: () => void;
  onCompleted: (result: QuizAttemptResult) => void;
};

function formatRemaining(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function QuizAttemptModal({ session, initialResult, onClose, onCompleted }: Props) {
  const [answers, setAnswers] = useState<Record<string, StudentQuizAnswer>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(initialResult);
  const [remainingSeconds, setRemainingSeconds] = useState(session?.remainingSeconds || 0);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSubmitted = useRef(false);
  const draftTouched = useRef(false);

  useEffect(() => {
    setAnswers(Object.fromEntries(
      (session?.savedAnswers || []).map((answer) => [answer.questionId, answer]),
    ));
    setResult(initialResult);
    setRemainingSeconds(session?.remainingSeconds || 0);
    setError(null);
    setSubmitting(false);
    setSavingDraft(false);
    autoSubmitted.current = false;
    draftTouched.current = false;
  }, [initialResult, session]);

  useEffect(() => {
    if (!session || result) return;

    const updateRemaining = () => {
      const next = Math.max(0, Math.ceil((Date.parse(session.expiresAt) - Date.now()) / 1000));
      setRemainingSeconds(next);
    };

    updateRemaining();
    const interval = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(interval);
  }, [result, session]);

  const answeredCount = useMemo(() => session?.questions.filter((question) => isQuizAnswerComplete(question, answers[question.id])).length || 0, [answers, session]);

  const saveDraft = useCallback(async (silent = false) => {
    if (!session || result || submitting || !draftTouched.current) return;

    setSavingDraft(true);
    if (!silent) setError(null);
    try {
      const response = await fetch(`/api/quizzes/${encodeURIComponent(session.quizId)}/attempts`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          attemptId: session.id,
          answers: session.questions.map((question) => answers[question.id] || { questionId: question.id, selectedIndex: -1 }),
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'تعذر حفظ مسودة الاختبار');
      }
      draftTouched.current = false;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'تعذر حفظ مسودة الاختبار');
      if (silent) throw saveError;
    } finally {
      setSavingDraft(false);
    }
  }, [answers, result, session, submitting]);

  useEffect(() => {
    if (!session || result || !draftTouched.current) return;
    const timer = window.setTimeout(() => {
      void saveDraft();
    }, 800);
    return () => window.clearTimeout(timer);
  }, [answers, result, saveDraft, session]);

  const closeWithDraft = async () => {
    if (result || !session) {
      onClose();
      return;
    }
    try {
      await saveDraft(true);
      onClose();
    } catch {
      // Keep the modal open so the learner can retry saving the draft.
    }
  };

  const submitAttempt = useCallback(async (automatic = false) => {
    if (!session || submitting || result) return;
    if (!automatic && answeredCount < session.questions.length) {
      setError(`أجب عن جميع الأسئلة أولاً. المتبقي ${session.questions.length - answeredCount} سؤال.`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/quizzes/${encodeURIComponent(session.quizId)}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          attemptId: session.id,
          answers: session.questions.map((question) => answers[question.id] || { questionId: question.id, selectedIndex: -1 }),
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'تعذر اعتماد الإجابات');
      }

      const completedResult = payload.result as QuizAttemptResult;
      setResult(completedResult);
      onCompleted(completedResult);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'تعذر اعتماد الإجابات');
    } finally {
      setSubmitting(false);
    }
  }, [answeredCount, answers, onCompleted, result, session, submitting]);

  useEffect(() => {
    if (
      session
      && !result
      && remainingSeconds === 0
      && !submitting
      && !autoSubmitted.current
    ) {
      autoSubmitted.current = true;
      void submitAttempt(true);
    }
  }, [remainingSeconds, result, session, submitAttempt, submitting]);

  if (!session && !result) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md" dir="rtl">
      <div className="w-full max-w-4xl max-h-[94vh] overflow-hidden rounded-3xl bg-white border border-white/70 shadow-2xl flex flex-col">
        <header className="shrink-0 px-5 sm:px-7 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-gradient-to-l from-blue-50 via-white to-emerald-50">
          <div className="min-w-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#173A7C] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#173A7C]/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-slate-900 text-sm sm:text-lg truncate">
                {result?.title || session?.title}
              </h2>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500">
                {result ? 'نتيجة المحاولة المعتمدة' : `أجبت عن ${answeredCount} من ${session?.questions.length || 0}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!result && session && (
              <div className={`px-3 py-2 rounded-xl flex items-center gap-2 font-black tabular-nums text-xs sm:text-sm border ${
                remainingSeconds <= 60
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-white text-[#173A7C] border-blue-200'
              }`}>
                <Clock3 className="w-4 h-4" />
                {formatRemaining(remainingSeconds)}
              </div>
            )}
            <button
              type="button"
              onClick={() => void closeWithDraft()}
              disabled={submitting || savingDraft}
              className="w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center cursor-pointer disabled:opacity-50"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 sm:py-6 bg-slate-50/70">
          {result ? (
            <div className="space-y-5">
              <div className={`rounded-3xl p-6 text-center border ${
                result.passed
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                {result.passed ? (
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                ) : (
                  <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                )}
                <p className="text-xs font-black text-slate-600 mb-1">
                  {result.passed ? 'تم اجتياز الاختبار بنجاح' : 'لم تتحقق نسبة الاجتياز بعد'}
                </p>
                <p className="text-4xl font-black text-[#173A7C]">{result.score}%</p>
                <p className="text-xs font-bold text-slate-500 mt-2">
                  {result.correctAnswers} إجابة صحيحة من {result.totalQuestions} — المطلوب {result.passPercentage}%
                </p>
              </div>

              {result.results.length > 0 ? result.results.map((question) => (<QuizQuestionReview key={question.id} question={question} />)) : (
                <p className="text-center text-xs font-bold text-slate-500 py-5">
                  تفاصيل الأسئلة غير متاحة للمحاولات القديمة، والنتيجة المعتمدة محفوظة.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {session?.questions.map((question, index) => (<section key={question.id} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><h3 className="text-sm font-black leading-7 text-slate-900">{index + 1}. {question.text}</h3><QuizQuestionInput question={question} answer={answers[question.id]} onChange={(answer) => { draftTouched.current = true; setAnswers((current) => ({ ...current, [question.id]: answer })); setError(null); }} /></section>))}
            </div>
          )}
        </main>

        <footer className="shrink-0 px-5 sm:px-7 py-4 border-t border-slate-200 bg-white">
          {error && (
            <div className="mb-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => void closeWithDraft()}
              disabled={submitting || savingDraft}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-black hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              {result ? 'إغلاق' : savingDraft ? 'جاري حفظ المسودة...' : 'حفظ والخروج'}
            </button>
            {!result && (
              <button
                type="button"
                onClick={() => void submitAttempt(false)}
                disabled={submitting || remainingSeconds === 0}
                className="px-5 sm:px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-[#173A7C]/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{submitting ? 'جاري التصحيح...' : 'اعتماد الإجابات'}</span>
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
