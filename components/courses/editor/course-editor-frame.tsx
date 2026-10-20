'use client';
import { useEffect, useId, useRef, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, ClipboardCheck, FolderOpen, Layers, Loader2, Save, Settings2, X } from 'lucide-react';
import { editorButton, editorPrimary } from './editor-ui';
import styles from './course-editor.module.css';

export type CourseEditorTab = 'basic' | 'curriculum' | 'attachments' | 'exam';
const tabs = [
  { id: 'basic', shortTitle: 'البيانات', title: 'بيانات الدورة', description: 'التفاصيل وإعدادات التعلم', Icon: Settings2 },
  { id: 'curriculum', shortTitle: 'المنهج', title: 'المنهج والدروس', description: 'الوحدات والمحتوى والملفات', Icon: Layers },
  { id: 'attachments', shortTitle: 'المرفقات', title: 'مرفقات الدورة', description: 'ملفات عامة لجميع الدروس', Icon: FolderOpen },
  { id: 'exam', shortTitle: 'الاختبارات', title: 'الاختبارات', description: 'الأسئلة وإعدادات الاجتياز', Icon: ClipboardCheck },
] as const;

export function CourseEditorFrame({ title, editing, tab, onTabChange, onClose, onSubmit, onInvalid, busy, uploading = false, mode = 'course', children }: {
  title: string; editing: boolean; tab: CourseEditorTab; onTabChange: (tab: CourseEditorTab) => void;
  onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onInvalid: () => void; busy: boolean; uploading?: boolean; children: ReactNode;
  mode?: 'course' | 'content';
}) {
  const id = useId(); const dialog = useRef<HTMLDivElement>(null); const scroll = useRef<HTMLDivElement>(null);
  const blocked = busy || uploading;
  const close = useRef(onClose); const isBusy = useRef(blocked);
  useEffect(() => { close.current = onClose; isBusy.current = blocked; }, [onClose, blocked]);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden'; dialog.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); if (!isBusy.current) close.current(); }
      if (event.key !== 'Tab') return;
      const controls = [...(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled):not([type="hidden"]),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]') || [])].filter((item) => item.getClientRects().length > 0);
      const first = controls[0], last = controls.at(-1);
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); document.documentElement.style.overflow = overflow; if (previous?.isConnected) previous.focus(); };
  }, []);
  useEffect(() => { scroll.current?.scrollTo({ top: 0 }); }, [tab]);
  const visibleTabs = mode === 'content' ? tabs.filter((item) => item.id !== 'basic') : tabs;
  const index = visibleTabs.findIndex((item) => item.id === tab);
  const ActiveIcon = visibleTabs[index]?.Icon || BookOpen;
  const submitLabel = busy ? 'جاري الحفظ…' : uploading ? 'جاري رفع الملفات…' : mode === 'content' ? 'حفظ المحتوى' : editing ? 'حفظ التغييرات' : 'حفظ ونشر الدورة';
  const compactSubmitLabel = busy ? 'جاري الحفظ' : uploading ? 'جاري الرفع' : mode === 'content' ? 'حفظ المحتوى' : editing ? 'حفظ' : 'حفظ ونشر';
  return <div className="fixed inset-0 z-[100] flex items-stretch justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-5" dir="rtl">
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} tabIndex={-1}
      className={`${styles.dialog} flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden rounded-none bg-[#f7f9fc] text-sm font-normal text-slate-700 shadow-2xl outline-none sm:h-[90dvh] sm:max-h-[94vh] sm:max-w-[1180px] sm:rounded-3xl`}>
      <header className={`${styles.header} relative flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:gap-4 sm:px-8 sm:py-6`}>
        <div className="relative flex min-w-0 items-center gap-3 sm:gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-blue-700 bg-linear-to-br from-blue-700 to-blue-950 text-white shadow-[0_5px_16px_rgba(23,58,124,0.2)] sm:h-14 sm:w-14"><ActiveIcon aria-hidden="true" className="h-5 w-5 sm:h-7 sm:w-7" strokeWidth={1.7} /></div>
          <div className="min-w-0"><h1 id={`${id}-title`} className="text-base font-bold leading-6 text-slate-950 sm:text-2xl sm:leading-8">{mode === 'content' ? 'إدارة محتوى الدورة' : editing ? 'تعديل الدورة' : 'إنشاء دورة جديدة'}</h1>
            <p id={`${id}-description`} className="mt-0.5 max-w-[70vw] truncate text-[11px] leading-5 text-slate-500 sm:mt-1 sm:max-w-2xl sm:text-sm sm:leading-6">{title.trim() || 'أضف تفاصيل الدورة، ثم جهّز محتواها وملفاتها.'}</p></div></div>
        <button type="button" aria-label="إغلاق نافذة الدورة" onClick={onClose} disabled={blocked} className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 focus-visible:ring-4 focus-visible:ring-blue-500/20 disabled:opacity-50"><X className="h-5 w-5" /></button>
      </header>
      <form onSubmit={onSubmit} onInvalidCapture={onInvalid} className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <nav aria-label="أقسام إعداد الدورة" className={`${styles.navigation} shrink-0 border-b border-slate-200 p-3 sm:px-6 lg:w-[260px] lg:border-b-0 lg:border-l lg:px-4 lg:py-6`}>
            <p className="mb-4 hidden items-center gap-2 px-3 text-[11px] font-semibold text-slate-400 lg:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />إعداد الدورة</p>
            <div className={`grid gap-2 lg:grid-cols-1 lg:gap-3 ${mode === 'content' ? 'grid-cols-3' : 'grid-cols-4'}`}>{visibleTabs.map(({ id: key, title: label, shortTitle, description, Icon }, number) => <button key={key} type="button" disabled={blocked} aria-label={label} title={label} aria-current={tab === key ? 'step' : undefined} onClick={() => onTabChange(key)}
              className={`${styles.navItem} flex min-h-12 min-w-0 items-center gap-2.5 rounded-2xl border px-2.5 py-3 transition-colors ${mode === 'content' ? 'flex-col text-center sm:flex-row sm:text-right' : 'text-right'} lg:gap-3 lg:px-3 lg:py-4 ${tab === key ? 'border-blue-200 bg-blue-50 text-blue-950' : 'border-transparent text-slate-500 hover:bg-white hover:text-slate-800'}`}>
              <span className={styles.navIcon}><Icon aria-hidden="true" className="h-[19px] w-[19px] shrink-0 lg:h-[22px] lg:w-[22px]" strokeWidth={1.7} /></span>
              <span className="min-w-0"><span className={`${styles.navLabel} block text-xs font-semibold sm:text-sm`}><span className={styles.compactLabel}>{shortTitle}</span><span className={styles.fullLabel}>{label}</span></span><span className="mt-1 hidden text-[11px] font-normal leading-5 text-slate-500 lg:block">{description}</span></span>
              <span aria-hidden="true" className="mr-auto hidden text-[10px] tabular-nums text-slate-400 xl:block">0{number + 1}</span>
            </button>)}</div>
            <div className="mt-5 hidden items-start gap-2.5 px-2 lg:flex"><Save aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" strokeWidth={1.7} /><div><p className="text-[11px] font-semibold text-slate-600">كل تفاصيل الدورة في مكان واحد</p><p className="mt-1 text-[11px] leading-6 text-slate-400">تنقّل بين الأقسام، ثم اضغط على زر الحفظ عند الانتهاء.</p></div></div>
          </nav>
          <div ref={scroll} className={`${styles.content} min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-8 lg:p-9`}><fieldset disabled={busy} className="min-w-0">{children}</fieldset></div>
        </div>
        <footer className={`${styles.footer} shrink-0 border-t border-slate-200 bg-white`}>
          <div className={styles.footerActions}>
            <button type="button" disabled={blocked || index <= 0} onClick={() => onTabChange(visibleTabs[index - 1].id)} className={`${editorButton} disabled:opacity-30`}><ArrowRight aria-hidden="true" className="h-4 w-4" />السابق</button>
            {index < visibleTabs.length - 1 ? <button type="button" disabled={blocked} onClick={() => onTabChange(visibleTabs[index + 1].id)} className={editorButton}>التالي<ArrowLeft aria-hidden="true" className="h-4 w-4" /></button> : <span aria-hidden="true" />}
            <button type="submit" disabled={blocked} aria-label={submitLabel} title={submitLabel} className={editorPrimary}>
              {blocked ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Check aria-hidden="true" className="h-4 w-4" />}<span className={styles.compactLabel}>{compactSubmitLabel}</span><span className={styles.fullLabel}>{submitLabel}</span>
            </button>
          </div>
        </footer>
      </form>
    </div>
  </div>;
}
