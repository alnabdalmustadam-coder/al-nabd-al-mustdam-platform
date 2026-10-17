'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpFromLine, ExternalLink, FileArchive, FileText, FolderOpen, Loader2, Presentation, Trash2 } from 'lucide-react';
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
    <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-800 shadow-sm"><FolderOpen aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 id={`${id}-title`} className="text-sm font-semibold leading-7 text-slate-800">{title}</h3>{files.length > 0 && <span className="rounded-md bg-blue-100/70 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-blue-800">{files.length}</span>}</div><p className="mt-1 text-xs font-normal leading-6 text-slate-500">{description}</p></div></div>
    {files.length > 0 && <div className="space-y-3">{files.map((file, index) => <div key={file.id || file.fileUrl} className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border ${file.fileType === 'ppt' ? 'border-orange-100 bg-orange-50 text-orange-700' : file.fileType === 'zip' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-blue-100 bg-blue-50 text-blue-700'}`}>
        {file.fileType === 'ppt' ? <Presentation aria-hidden="true" className="h-5 w-5" /> : file.fileType === 'zip' ? <FileArchive aria-hidden="true" className="h-5 w-5" /> : <FileText aria-hidden="true" className="h-5 w-5" />}<span aria-hidden="true" className="text-[8px] font-bold leading-none">{file.fileType?.toUpperCase() || 'FILE'}</span>
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
      className={`group flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-5 py-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-wait ${dragging ? 'border-blue-500 bg-blue-50' : 'border-blue-200 bg-linear-to-b from-white to-blue-50/50 hover:border-blue-400 hover:to-blue-50'}`}>
      <span aria-hidden="true" className="relative isolate mb-1 flex h-14 w-14 items-center justify-center rounded-2xl border border-white bg-linear-to-br from-blue-600 to-blue-900 text-white shadow-[0_5px_14px_rgba(23,58,124,0.18)] before:absolute before:-z-10 before:h-14 before:w-14 before:rotate-[-14deg] before:rounded-2xl before:border before:border-blue-200 before:bg-blue-100/60">{progress ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowUpFromLine className="h-6 w-6" strokeWidth={1.7} />}</span>
      <span role="status" className="text-sm font-semibold text-slate-700">{progress ? `جاري رفع الملف ${progress.current} من ${progress.total}…` : single && files.length ? 'استبدال الملف' : single ? 'اختر ملف المستند' : 'اضغط لإضافة ملفات أو اسحبها هنا'}</span>
      <span className="flex flex-wrap justify-center gap-1.5" dir="ltr">{(documentsOnly ? ['PDF', 'Word', 'PowerPoint'] : ['PDF', 'Word', 'PowerPoint', 'ZIP', '7Z']).map((type) => <span key={type} className="rounded-md border border-slate-200/80 bg-white px-2 py-1 text-[10px] font-medium text-slate-500">{type}</span>)}</span>
    </button>
    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-6 text-rose-800">{error}</p>}
  </section>;
}

export function primaryDocumentFiles(lesson: { id: string; fileUrl?: string; fileName?: string; fileSize?: string; type?: string }): CourseAttachment[] {
  return lesson.fileUrl ? [{ id: `primary:${lesson.id}`, title: lesson.fileName || 'مستند الدرس', fileUrl: lesson.fileUrl,
    fileType: lesson.type === 'ppt' ? 'ppt' : lesson.type === 'doc' ? 'word' : 'pdf', fileSize: lesson.fileSize }] : [];
}
