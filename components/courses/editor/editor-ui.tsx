'use client';
import { useId, type ReactNode } from 'react';
import { BookOpen, Check, ClipboardCheck, FolderOpen, Layers, Settings2, type LucideIcon } from 'lucide-react';
import { EditorIllustration, type EditorIllustrationKind } from './editor-illustration';

export const editorInput = 'w-full min-w-0 min-h-12 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-normal leading-6 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.025)] outline-none transition-colors placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-500 sm:text-sm';
export const editorButton = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_2px_3px_rgba(15,23,42,0.025)] transition-colors hover:border-blue-200 hover:bg-blue-50/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50';
export const editorPrimary = `${editorButton} !border-blue-800 !bg-blue-900 bg-linear-to-br from-blue-700 to-blue-950 !text-white !shadow-[0_5px_14px_rgba(23,58,124,0.18)] hover:!bg-blue-800`;
const sectionIcons = { course: BookOpen, curriculum: Layers, files: FolderOpen, exam: ClipboardCheck };
export function EditorSectionHeading({ eyebrow, title, description, action, kind = 'course' }: { eyebrow?: string; title: string; description: string; action?: ReactNode; kind?: EditorIllustrationKind }) {
  const Icon = sectionIcons[kind];
  return <div className="relative isolate overflow-hidden rounded-2xl border border-blue-100/90 bg-linear-to-bl from-white via-[#f3f7ff] to-[#edf8f5] p-5 shadow-[0_5px_20px_-12px_rgba(23,58,124,0.18)] sm:p-6">
    <div aria-hidden="true" className="pointer-events-none absolute -left-10 -top-20 h-56 w-56 rounded-full border border-blue-200/35" />
    <div className="relative flex items-center justify-between gap-4 sm:gap-7">
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex items-center gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white bg-white/90 text-blue-800 shadow-sm"><Icon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.8} /></span>{eyebrow && <p className="text-xs font-semibold text-blue-800">{eyebrow}</p>}</div>
        <h2 className="text-xl font-bold leading-8 text-slate-950 sm:text-2xl">{title}</h2>
        <p className="mt-2 max-w-xl text-sm font-normal leading-7 text-slate-500">{description}</p>
        {action && <div className="mt-5 flex flex-wrap gap-3">{action}</div>}
      </div>
      <EditorIllustration kind={kind} className="hidden h-[120px] w-[166px] shrink-0 sm:block" />
    </div>
  </div>;
}
export function EditorField({ label, hint, children, icon: Icon }: { label: string; hint?: string; children: ReactNode; icon?: LucideIcon }) {
  return <label className="block min-w-0"><span className="mb-2.5 flex min-h-7 items-center gap-2 text-sm font-semibold text-slate-700">{Icon && <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} /></span>}{label}</span>
    {children}{hint && <span className="mt-2 block text-xs font-normal leading-6 text-slate-500">{hint}</span>}</label>;
}
export function EditorCardHeading({ title, description, icon: Icon, meta }: { title: string; description?: string; icon: LucideIcon; meta?: string }) {
  return <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3">
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-linear-to-br from-blue-50 to-white text-blue-800 shadow-[0_2px_5px_rgba(23,58,124,0.04)]"><Icon aria-hidden="true" className="h-[22px] w-[22px]" strokeWidth={1.7} /></span>
    <div className="min-w-0"><h3 className="text-base font-semibold text-slate-900">{title}</h3>{description && <p className="mt-1 text-xs text-slate-500">{description}</p>}</div>
  </div>{meta && <span className="rounded-lg border border-blue-100 bg-blue-50/60 px-2.5 py-1.5 text-[11px] font-medium text-blue-800">{meta}</span>}</div>;
}
export function EditorEmptyState({ kind, title, description }: { kind: EditorIllustrationKind; title: string; description: string }) {
  return <div data-editor-panel className="flex flex-col items-center gap-3 rounded-2xl border border-blue-100 bg-linear-to-b from-white to-blue-50/40 px-6 py-7 text-center">
    <EditorIllustration kind={kind} className="h-[112px] w-[156px]" /><h3 className="text-base font-semibold text-slate-800">{title}</h3><p className="max-w-md text-sm text-slate-500">{description}</p>
  </div>;
}
export function EditorToggle({ enabled, onChange, title, description, disabled = false, icon: Icon = Settings2 }: {
  enabled: boolean; onChange: (value: boolean) => void; title: string; description?: string; disabled?: boolean;
  icon?: LucideIcon;
}) {
  const id = useId();
  return <div data-editor-panel className={`flex items-start justify-between gap-4 rounded-2xl border p-5 sm:gap-5 sm:p-6 ${enabled ? 'border-emerald-200 bg-linear-to-bl from-white to-emerald-50/70' : 'border-slate-200 bg-white'}`}>
    <div className="min-w-0"><div className="flex items-center gap-3"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${enabled ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-blue-100 bg-blue-50 text-blue-800'}`}><Icon aria-hidden="true" className="h-[22px] w-[22px]" strokeWidth={1.7} /></span><p id={id} className="text-base font-semibold leading-7 text-slate-900">{title}</p></div>
      {description && <p id={`${id}-hint`} className="mt-2 max-w-xl text-sm font-normal leading-7 text-slate-500">{description}</p>}
      <p aria-live="polite" className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${enabled ? 'text-emerald-700' : 'text-slate-500'}`}>
        {enabled && <Check className="h-3.5 w-3.5" />}{enabled ? 'مفعّل' : 'غير مفعّل'}
      </p>
    </div>
    <button type="button" role="switch" aria-checked={enabled} aria-labelledby={id} aria-describedby={description ? `${id}-hint` : undefined} disabled={disabled}
      onClick={() => onChange(!enabled)} className="flex min-h-11 min-w-14 shrink-0 items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:opacity-50">
      <span dir="ltr" className={`relative block h-7 w-12 rounded-full transition-colors ${enabled ? 'bg-emerald-600' : 'bg-slate-300'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-[left] motion-reduce:transition-none ${enabled ? 'left-6' : 'left-1'}`} /></span>
    </button>
  </div>;
}
