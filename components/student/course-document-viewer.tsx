'use client';
import { useState } from 'react';
import { Download, ExternalLink, Presentation } from 'lucide-react';
import { documentType, documentViewerUrl } from '@/lib/learning/documents';

export function CourseDocumentViewer({ fileUrl, title, type }: { fileUrl: string; title: string; type?: string }) {
  const url = documentViewerUrl(fileUrl, type);
  const powerpoint = documentType(fileUrl, type) === 'ppt';
  return <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-slate-50 p-3">
      <h3 className="flex items-center gap-2 text-sm font-black text-slate-800"><Presentation className="h-5 w-5 text-blue-700" />{title}</h3>
      <div className="flex flex-wrap gap-2 text-xs font-bold text-blue-900">
        {url && <a href={url} target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center gap-1 rounded-lg border bg-white px-3"><ExternalLink className="h-4 w-4" />عرض موسّع</a>}
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" download className="flex min-h-10 items-center gap-1 rounded-lg border bg-white px-3"><Download className="h-4 w-4" />تحميل الملف</a>
      </div>
    </div>
    {url && <iframe title={`${powerpoint ? 'شرائح البوربوينت' : 'عرض المستند'}: ${title}`} src={url} loading="lazy" allowFullScreen
      className="aspect-[4/3] min-h-[300px] w-full border-0 sm:aspect-video sm:min-h-[420px]" />}
    <p className="px-4 py-3 text-xs leading-6 text-slate-500">{powerpoint ? 'تنقّل بين الشرائح من أزرار العرض. ' : ''}إذا تعذّرت المعاينة، يمكنك تحميل الملف وفتحه على جهازك.</p>
  </div>;
}
export function AttachmentPreview({ fileUrl, title, type }: { fileUrl: string; title: string; type?: string }) {
  const [open, setOpen] = useState(false);
  if (!documentViewerUrl(fileUrl, type)) return null;
  return <details className="w-full basis-full border-t border-slate-200 pt-2" onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary className="cursor-pointer py-2 text-xs font-black text-blue-900">عرض {documentType(fileUrl, type) === 'ppt' ? 'شرائح البوربوينت' : 'المستند'} داخل المنصة</summary>
    {open && <CourseDocumentViewer fileUrl={fileUrl} title={title} type={type} />}
  </details>;
}
