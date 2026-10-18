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
  return <div className={`${inline ? '' : 'fixed bottom-24 left-4 z-40 sm:left-6'} flex max-w-[260px] flex-col items-start gap-2`} dir="rtl">
    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-white p-3 text-xs font-bold text-rose-800 shadow-lg">{error}</p>}
    <button type="button" onClick={() => void toggle()} disabled={busy || (!state && !error)} aria-pressed={state?.liked || false}
      aria-label={`${state?.liked ? 'إلغاء الرضا عن' : 'أعجبني'} ${kind === 'quiz' ? 'الاختبار' : 'الدرس'}`}
      className={`flex min-h-12 items-center gap-2 rounded-full border px-4 py-3 text-xs font-black shadow-xl transition-colors disabled:opacity-60 ${state?.liked ? 'border-rose-300 bg-rose-600 text-white' : 'border-rose-100 bg-white text-rose-700 hover:bg-rose-50'}`}>
      {busy || (!state && !error) ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className={`h-5 w-5 ${state?.liked ? 'fill-current' : ''}`} />}
      <span>{state?.liked ? 'عبّرت عن رضاك' : kind === 'quiz' ? 'أعجبني الاختبار' : 'أعجبني الدرس'}</span>
      {state && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-800" aria-label={`${state.count} تعبير عن الرضا`}>{state.count}</span>}
    </button>
    {state?.liked && <p role="status" className="rounded-lg bg-white/95 px-3 py-1 text-[10px] text-slate-600 shadow-sm">اضغط مرة أخرى لإلغاء القلب</p>}
  </div>;
}
