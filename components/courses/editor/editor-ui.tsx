'use client';
import { useId, type ReactNode } from 'react';
import { Check } from 'lucide-react';

export const editorInput = 'w-full min-w-0 min-h-12 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-normal leading-6 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-500 sm:text-sm';
export const editorButton = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50';
export const editorPrimary = `${editorButton} !border-blue-900 !bg-blue-900 !text-white hover:!bg-blue-800`;
export function EditorSectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-wrap items-start justify-between gap-5">
    <div className="max-w-2xl">{eyebrow && <p className="mb-2 text-xs font-semibold tracking-wide text-emerald-700">{eyebrow}</p>}
      <h2 className="text-xl font-bold leading-8 tracking-tight text-slate-950 sm:text-2xl">{title}</h2>
      <p className="mt-2 text-sm font-normal leading-7 text-slate-500">{description}</p>
    </div>{action}
  </div>;
}
export function EditorField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="block min-w-0"><span className="mb-2.5 block text-sm font-semibold text-slate-700">{label}</span>
    {children}{hint && <span className="mt-2 block text-xs font-normal leading-6 text-slate-500">{hint}</span>}</label>;
}
export function EditorToggle({ enabled, onChange, title, description, disabled = false }: {
  enabled: boolean; onChange: (value: boolean) => void; title: string; description?: string; disabled?: boolean;
}) {
  const id = useId();
  return <div className={`flex items-start justify-between gap-5 rounded-2xl border p-5 sm:p-6 ${enabled ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'}`}>
    <div className="min-w-0"><p id={id} className="text-base font-semibold leading-7 text-slate-900">{title}</p>
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
