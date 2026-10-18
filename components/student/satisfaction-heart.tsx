'use client';

import { useEffect, useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';

type Satisfaction = { liked: boolean; count: number };
export function SatisfactionHeart({ courseId, lessonId, kind, inline = false }: { courseId: string; lessonId: string; kind: 'lesson' | 'quiz'; inline?: boolean }) {
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
  if (hidden) return null;
  return <div className={`${inline ? 'relative inline-flex' : 'fixed right-2 top-1/2 z-30 -translate-y-1/2 lg:right-[calc(var(--student-sidebar-width,18rem)+0.75rem)]'} flex flex-col items-center gap-2`} dir="rtl">
    {error && <p role="alert" className={`${inline ? '' : 'absolute right-full top-0 mr-2 w-52'} rounded-xl border border-rose-200 bg-white p-3 text-xs font-bold text-rose-800 shadow-lg`}>{error}</p>}
    <button type="button" onClick={() => void toggle()} disabled={busy || (!state && !error)} aria-pressed={state?.liked || false}
      aria-label={`${state?.liked ? 'إلغاء الرضا عن' : 'أعجبني'} ${kind === 'quiz' ? 'الاختبار' : 'الدرس'}`}
      title={state?.liked ? 'تقييمك محفوظ؛ اضغط لإلغائه' : 'عبّر عن رضاك'}
      className={`flex items-center justify-center border font-bold shadow-lg transition-colors disabled:opacity-60 ${inline ? 'min-h-11 gap-2 rounded-full px-3 py-2 text-xs' : 'w-11 flex-col gap-1 rounded-2xl px-1 py-2 text-[9px] leading-4'} ${state?.liked ? 'border-rose-300 bg-rose-600 text-white' : 'border-rose-100 bg-white text-rose-700 hover:bg-rose-50'}`}>
      {busy || (!state && !error) ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className={`h-5 w-5 ${state?.liked ? 'fill-current' : ''}`} />}
      <span>{inline ? state?.liked ? 'أعجبني' : 'تقييم الاختبار' : 'رضاك'}</span>
      {state && <span className="min-w-5 rounded-full bg-rose-100 px-1.5 text-center text-[10px] leading-5 text-rose-800" aria-label={`${state.count} تعبير عن الرضا`}>{state.count}</span>}
    </button>
    {state?.liked && <p role="status" className="sr-only">تم حفظ تقييمك. اضغط مرة أخرى لإلغائه.</p>}
  </div>;
}
