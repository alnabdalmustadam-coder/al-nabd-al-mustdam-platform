'use client';
import { useState } from 'react';
import { AlertCircle, PlayCircle, RefreshCw } from 'lucide-react';
import { isDemoVideoUrl } from '@/lib/demo/media';
import { editorButton } from './editor-ui';

function PreviewPlayer({ videoUrl, title }: { videoUrl: string; title: string }) {
  if (!isDemoVideoUrl(videoUrl)) {
    return <p role="status" className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700"><AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0" />معاينة الفيديو متاحة للمقاطع المرفقة في نسخة العرض.</p>;
  }
  return <video aria-label={title || 'فيديو الدرس'} src={videoUrl} controls playsInline preload="metadata" className="aspect-video w-full rounded-xl bg-slate-950" />;
}

export function CourseVideoPreview({ videoUrl, title }: { videoUrl: string; title: string; courseSlug?: string }) {
  const [open, setOpen] = useState(false), [attempt, setAttempt] = useState(0);
  return <details className="rounded-xl border border-blue-100 bg-white p-4" onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary className="cursor-pointer text-sm font-semibold text-blue-900"><span className="inline-flex items-center gap-2"><PlayCircle aria-hidden="true" className="h-5 w-5" />معاينة فيديو الدرس</span></summary>
    {open && <div className="mt-4 space-y-3"><PreviewPlayer key={`${videoUrl}:${attempt}`} videoUrl={videoUrl} title={title} /><button type="button" className={editorButton} onClick={() => setAttempt((value) => value + 1)}><RefreshCw aria-hidden="true" className="h-4 w-4" />إعادة المعاينة</button></div>}
  </details>;
}
