'use client';
import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, PlayCircle, RefreshCw } from 'lucide-react';
import { extractBunnyVideoId } from '@/lib/learning/course-content';
import { editorButton } from './editor-ui';

function PreviewPlayer({ videoUrl, title, courseSlug }: { videoUrl: string; title: string; courseSlug?: string }) {
  const videoId = extractBunnyVideoId(videoUrl);
  let direct = '';
  try { const url = new URL(videoUrl); if (['http:', 'https:'].includes(url.protocol)) direct = url.toString(); } catch { /* Raw provider IDs are resolved by the authenticated endpoint. */ }
  const [url, setUrl] = useState(videoId ? '' : direct);
  const [error, setError] = useState(!videoId && !direct ? 'أضف رابط فيديو صالحًا للمعاينة.' : '');
  const [loading, setLoading] = useState(Boolean(videoId));
  useEffect(() => {
    if (!videoId) return;
    const controller = new AbortController();
    fetch('/api/videos/playback-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId, courseSlug }), signal: controller.signal })
      .then(async (response) => { const payload = await response.json(); if (!response.ok || !payload.success || !payload.iframeUrl) throw new Error(payload.error || 'تعذر تجهيز معاينة الفيديو'); return payload.iframeUrl as string; })
      .then((value) => { if (!controller.signal.aborted) setUrl(value); })
      .catch((failure) => { if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'تعذر تجهيز معاينة الفيديو'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [videoId, courseSlug]);
  if (loading) return <div role="status" className="flex aspect-video items-center justify-center gap-3 rounded-xl bg-slate-950 text-sm text-white"><Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />جاري تجهيز المعاينة…</div>;
  if (error) return <p role="alert" className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm leading-7 text-rose-800"><AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0" />{error}</p>;
  return <iframe title={`معاينة: ${title || 'فيديو الدرس'}`} src={url} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="aspect-video w-full rounded-xl border-0 bg-slate-950" />;
}

export function CourseVideoPreview({ videoUrl, title, courseSlug }: { videoUrl: string; title: string; courseSlug?: string }) {
  const [open, setOpen] = useState(false), [attempt, setAttempt] = useState(0);
  return <details className="rounded-xl border border-blue-100 bg-white p-4" onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary className="cursor-pointer text-sm font-semibold text-blue-900"><span className="inline-flex items-center gap-2"><PlayCircle aria-hidden="true" className="h-5 w-5" />معاينة فيديو الدرس</span></summary>
    {open && <div className="mt-4 space-y-3"><PreviewPlayer key={`${videoUrl}:${attempt}`} videoUrl={videoUrl} title={title} courseSlug={courseSlug} /><button type="button" className={editorButton} onClick={() => setAttempt((value) => value + 1)}><RefreshCw aria-hidden="true" className="h-4 w-4" />إعادة المعاينة</button></div>}
  </details>;
}
