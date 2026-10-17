'use client';
import { Download, FileText, Paperclip } from 'lucide-react';
import type { CourseResourceGroup } from '@/lib/courses/curriculum-files';
import { AttachmentPreview } from './course-document-viewer';

export function CourseResourcesPanel({ groups }: { groups: CourseResourceGroup[] }) {
  return <div className="space-y-7" dir="rtl">
    <h4 className="flex items-center gap-2 text-base font-semibold text-slate-900"><Paperclip className="h-5 w-5 text-blue-800" />الملفات والمراجع</h4>
    {!groups.length && <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><FileText className="mx-auto h-8 w-8 text-slate-300" /><p className="text-sm text-slate-500">لا توجد ملفات مرفقة لهذا الدرس حاليًا.</p></div>}
    {groups.map((group) => <section key={group.id} aria-label={group.title} className="space-y-4"><h5 className="text-sm font-semibold leading-7 text-slate-700">{group.title}</h5>
      <div className="grid gap-4 sm:grid-cols-2">{group.files.map((file) => <article key={file.id || file.fileUrl} className="min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800"><FileText className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1"><h6 className="break-words text-sm font-semibold leading-7 text-slate-900">{file.title}</h6><p className="text-xs text-slate-500">{file.fileType?.toUpperCase() || 'FILE'}{file.fileSize ? ` · ${file.fileSize}` : ''}</p></div>
          <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" download aria-label={`تحميل ${file.title}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white hover:bg-blue-800 focus-visible:ring-4 focus-visible:ring-blue-200"><Download className="h-4 w-4" /></a>
        </div><AttachmentPreview fileUrl={file.fileUrl} title={file.title} type={file.fileType} />
      </article>)}</div>
    </section>)}
  </div>;
}
