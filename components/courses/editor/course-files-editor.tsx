'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpFromLine, ExternalLink, FileText, Loader2, Presentation, Trash2 } from 'lucide-react';
import type { CourseAttachment } from '@/types';

export type FilesUpdate = (current: CourseAttachment[]) => CourseAttachment[];
type Props = {
  title: string; description: string; files: CourseAttachment[]; onChange: (update: FilesUpdate) => void;
  onBusyChange: (busy: boolean) => void; documentsOnly?: boolean; single?: boolean;
};
export function CourseFilesEditor({ title, description, files, onChange, onBusyChange, documentsOnly = true, single = false }: Props) {
  const input = useRef<HTMLInputElement>(null); const request = useRef<AbortController | null>(null);
  const callbacks = useRef({ onChange, onBusyChange }); const id = useId();
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState(''); const [dragging, setDragging] = useState(false);
  useEffect(() => { callbacks.current = { onChange, onBusyChange }; }, [onChange, onBusyChange]);
  useEffect(() => () => request.current?.abort(), []);
  const upload = async (selection: File[]) => {
    if (request.current || !selection.length) return;
    const chosen = single ? selection.slice(0, 1) : selection;
    const controller = new AbortController(); request.current = controller; setError(''); callbacks.current.onBusyChange(true);
    const failures: string[] = [];
    try {
      for (const [index, file] of chosen.entries()) {
        if (controller.signal.aborted) break;
        setProgress({ current: index + 1, total: chosen.length });
        try {
          if (documentsOnly && !/\.(pdf|pptx?|docx?)$/i.test(file.name)) throw new Error('اختر ملف PDF أو Word أو PowerPoint');
          const body = new FormData(); body.append('file', file); body.append('title', file.name);
          const response = await fetch('/api/admin/courses/upload-attachment', { method: 'POST', body, signal: controller.signal });
          const payload = await response.json().catch(() => null);
          if (!response.ok || !payload?.success || !payload.fileUrl) throw new Error(payload?.error || 'تعذر رفع الملف. حاول مرة أخرى');
          if (controller.signal.aborted) break;
          const item: CourseAttachment = { id: crypto.randomUUID(), title: payload.fileName || file.name,
            fileUrl: payload.fileUrl, fileType: payload.fileType || 'other', fileSize: payload.fileSize };
          callbacks.current.onChange((current) => single ? [item] : [...current, item]);
        } catch (failure) {
          if (controller.signal.aborted) break;
          failures.push(`${file.name}: ${failure instanceof Error ? failure.message : 'تعذر رفع الملف'}`);
        }
      }
      if (!controller.signal.aborted) setError(failures.join(' · '));
    } finally {
      request.current = null; callbacks.current.onBusyChange(false);
      if (!controller.signal.aborted) setProgress(null);
    }
  };
  return <section aria-labelledby={`${id}-title`} className="min-w-0 space-y-4">
    <div><h3 id={`${id}-title`} className="text-sm font-semibold leading-7 text-slate-800">{title}</h3><p className="mt-1 text-xs font-normal leading-6 text-slate-500">{description}</p></div>
    {files.length > 0 && <div className="space-y-3">{files.map((file, index) => <div key={file.id || file.fileUrl} className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${file.fileType === 'ppt' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-700'}`}>
        {file.fileType === 'ppt' ? <Presentation className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1"><label className="block"><span className="sr-only">اسم الملف {index + 1} في {title}</span>
        <input value={file.title} aria-label={`اسم الملف ${index + 1} في ${title}`} onChange={(event) => {
          const value = event.target.value;
          callbacks.current.onChange((current) => current.map((item) => (item.id || item.fileUrl) === (file.id || file.fileUrl) ? { ...item, title: value } : item));
        }} className="min-h-10 w-full min-w-0 rounded-lg border border-transparent bg-transparent px-2 py-1 text-base font-medium text-slate-800 outline-none hover:border-slate-200 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:text-sm" />
      </label><p className="mt-1 px-2 text-[11px] text-slate-400">{file.fileType?.toUpperCase() || 'FILE'}{file.fileSize ? ` · ${file.fileSize}` : ''}</p></div>
      <div className="flex shrink-0 items-center gap-1"><a href={file.fileUrl} target="_blank" rel="noopener noreferrer" aria-label={`فتح ${file.title}`} className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:ring-4 focus-visible:ring-blue-100"><ExternalLink className="h-4 w-4" /></a>
        <button type="button" disabled={Boolean(progress)} aria-label={`إزالة ${file.title} من ${title}`} onClick={() => callbacks.current.onChange((current) => current.filter((item) => (item.id || item.fileUrl) !== (file.id || file.fileUrl)))}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-4 focus-visible:ring-rose-100 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button></div>
    </div>)}</div>}
    <input ref={input} type="file" className="hidden" multiple={!single} accept={documentsOnly ? '.pdf,.doc,.docx,.ppt,.pptx' : '.pdf,.doc,.docx,.ppt,.pptx,.zip,.7z'}
      onChange={(event) => { const selected = Array.from(event.target.files || []); event.target.value = ''; void upload(selected); }} />
    <button type="button" disabled={Boolean(progress)} onClick={() => input.current?.click()}
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); void upload(Array.from(event.dataTransfer.files)); }}
      className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-5 py-5 text-center transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-wait ${dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white/70 hover:border-blue-400 hover:bg-blue-50/40'}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-800">{progress ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUpFromLine className="h-5 w-5" />}</span>
      <span role="status" className="text-sm font-semibold text-slate-700">{progress ? `جاري رفع الملف ${progress.current} من ${progress.total}…` : single && files.length ? 'استبدال الملف' : single ? 'اختر ملف المستند' : 'اضغط لإضافة ملفات أو اسحبها هنا'}</span>
      <span className="text-xs font-normal leading-6 text-slate-400">PDF، Word، PowerPoint{!documentsOnly && '، ZIP، 7Z'}</span>
    </button>
    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-6 text-rose-800">{error}</p>}
  </section>;
}

export function primaryDocumentFiles(lesson: { id: string; fileUrl?: string; fileName?: string; fileSize?: string; type?: string }): CourseAttachment[] {
  return lesson.fileUrl ? [{ id: `primary:${lesson.id}`, title: lesson.fileName || 'مستند الدرس', fileUrl: lesson.fileUrl,
    fileType: lesson.type === 'ppt' ? 'ppt' : lesson.type === 'doc' ? 'word' : 'pdf', fileSize: lesson.fileSize }] : [];
}
