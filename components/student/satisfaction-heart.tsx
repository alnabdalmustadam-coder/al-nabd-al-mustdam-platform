'use client';

import { useEffect, useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';

type Satisfaction = { liked: boolean; count: number };
export function SatisfactionHeart({ courseId, lessonId, kind }: { courseId: string; lessonId: string; kind: 'lesson' | 'quiz' }) {
  const [state, setState] = useState<Satisfaction | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/courses/satisfaction?${new URLSearchParams({ courseId, lessonId, kind })}`, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (controller.signal.aborted) return;
        if ([403, 404].includes(response.status)) { setHidden(true); return; }
        if (!response.ok || !payload.success) throw new Error(payload.message || 'تعذر تحميل الرضا');
        setState({ liked: payload.liked, count: payload.count }); setError('');
      }).catch((failure) => { if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'تعذر تحميل الرضا'); });
    return () => controller.abort();
  }, [courseId, lessonId, kind, reload]);
  const toggle = async () => {
    if (!state) { setReload((value) => value + 1); return; }
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/courses/satisfaction', { method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonId, kind, liked: !state.liked }) });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || 'تعذر حفظ الرضا');
      setState({ liked: payload.liked, count: payload.count });
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'تعذر حفظ الرضا'); }
    finally { setBusy(false); }
  };
  if (hidden || (!state && !error)) return null;
  return <div className="w-full min-w-0 border-t border-slate-200/70 pt-3" dir="rtl">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs font-medium leading-6 text-slate-500">{kind === 'quiz' ? 'ما رأيك في هذا الاختبار؟' : 'هل أعجبك هذا الدرس؟'}</p>
      <button type="button" onClick={() => void toggle()} disabled={busy} aria-pressed={state ? state.liked : undefined}
        aria-label={!state ? 'إعادة تحميل التقييم' : `${state.liked ? 'إلغاء الرضا عن' : 'أعجبني'} ${kind === 'quiz' ? 'الاختبار' : 'الدرس'}`}
        title={state?.liked ? 'تقييمك محفوظ؛ اضغط لإلغائه' : 'عبّر عن رضاك'}
        className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${state?.liked ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700'}`}>
        {busy ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Heart aria-hidden="true" className={`h-4 w-4 ${state?.liked ? 'fill-current' : ''}`} />}
        <span>{state ? 'أعجبني' : 'إعادة المحاولة'}</span>
        {state && <span className="min-w-5 rounded-full bg-rose-100 px-1.5 text-center text-[10px] leading-5 text-rose-800" aria-label={`${state.count} تعبير عن الرضا`}>{state.count}</span>}
      </button>
    </div>
    {error && <p role="alert" className="mt-2 text-xs leading-6 text-rose-800">{error}</p>}
    {state?.liked && <p role="status" className="sr-only">تم حفظ تقييمك. اضغط مرة أخرى لإلغائه.</p>}
  </div>;
}
