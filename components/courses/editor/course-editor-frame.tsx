'use client';
import { useEffect, useId, useRef, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, ClipboardCheck, FolderOpen, Layers, Loader2, Save, Settings2, X } from 'lucide-react';
import { editorButton, editorPrimary } from './editor-ui';
import styles from './course-editor.module.css';

export type CourseEditorTab = 'basic' | 'curriculum' | 'attachments' | 'exam';
const tabs = [
  { id: 'basic', title: 'بيانات الدورة', description: 'التفاصيل وإعدادات التعلم', Icon: Settings2 },
  { id: 'curriculum', title: 'المنهج والدروس', description: 'الوحدات والمحتوى والملفات', Icon: Layers },
  { id: 'attachments', title: 'مرفقات الدورة', description: 'ملفات عامة لجميع الدروس', Icon: FolderOpen },
  { id: 'exam', title: 'الاختبار النهائي', description: 'الأسئلة وإعدادات الاجتياز', Icon: ClipboardCheck },
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
  return <div className="fixed inset-0 z-[100] flex items-stretch justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-5" dir="rtl">
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} tabIndex={-1}
      className={`${styles.dialog} flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden rounded-none bg-[#f7f9fc] text-sm font-normal text-slate-700 shadow-2xl outline-none sm:h-[90dvh] sm:max-h-[94vh] sm:max-w-[1180px] sm:rounded-3xl`}>
      <header className={`${styles.header} relative flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-8 sm:py-6`}>
        <div className="relative flex min-w-0 items-center gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-700 bg-linear-to-br from-blue-700 to-blue-950 text-white shadow-[0_5px_16px_rgba(23,58,124,0.2)] sm:h-14 sm:w-14"><ActiveIcon aria-hidden="true" className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.7} /></div>
          <div className="min-w-0"><h1 id={`${id}-title`} className="text-lg font-bold leading-8 text-slate-950 sm:text-2xl">{mode === 'content' ? 'إدارة محتوى الدورة' : editing ? 'تعديل الدورة' : 'إنشاء دورة جديدة'}</h1>
            <p id={`${id}-description`} className="mt-1 max-w-[70vw] truncate text-xs leading-6 text-slate-500 sm:max-w-2xl sm:text-sm">{title.trim() || 'أضف تفاصيل الدورة، ثم جهّز محتواها وملفاتها.'}</p></div></div>
        <button type="button" aria-label="إغلاق نافذة الدورة" onClick={onClose} disabled={blocked} className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 focus-visible:ring-4 focus-visible:ring-blue-500/20 disabled:opacity-50"><X className="h-5 w-5" /></button>
      </header>
      <form onSubmit={onSubmit} onInvalidCapture={onInvalid} className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <nav aria-label="أقسام إعداد الدورة" className={`${styles.navigation} shrink-0 border-b border-slate-200 p-3 sm:px-6 lg:w-[260px] lg:border-b-0 lg:border-l lg:px-4 lg:py-6`}>
            <p className="mb-4 hidden items-center gap-2 px-3 text-[11px] font-semibold text-slate-400 lg:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />إعداد الدورة</p>
            <div className={`grid gap-2 lg:grid-cols-1 lg:gap-3 ${mode === 'content' ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>{visibleTabs.map(({ id: key, title: label, description, Icon }, number) => <button key={key} type="button" disabled={blocked} aria-current={tab === key ? 'step' : undefined} onClick={() => onTabChange(key)}
              className={`${styles.navItem} flex min-h-12 min-w-0 items-center gap-2.5 rounded-2xl border px-2.5 py-3 transition-colors ${mode === 'content' ? 'flex-col text-center sm:flex-row sm:text-right' : 'text-right'} lg:gap-3 lg:px-3 lg:py-4 ${tab === key ? 'border-blue-200 bg-blue-50 text-blue-950' : 'border-transparent text-slate-500 hover:bg-white hover:text-slate-800'}`}>
              <span className={styles.navIcon}><Icon aria-hidden="true" className="h-[19px] w-[19px] shrink-0 lg:h-[22px] lg:w-[22px]" strokeWidth={1.7} /></span>
              <span className="min-w-0"><span className="block text-xs font-semibold sm:text-sm">{label}</span><span className="mt-1 hidden text-[11px] font-normal leading-5 text-slate-500 lg:block">{description}</span></span>
              <span aria-hidden="true" className="mr-auto hidden text-[10px] tabular-nums text-slate-400 xl:block">0{number + 1}</span>
            </button>)}</div>
            <div className="mt-5 hidden items-start gap-2.5 px-2 lg:flex"><Save aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" strokeWidth={1.7} /><div><p className="text-[11px] font-semibold text-slate-600">كل تفاصيل الدورة في مكان واحد</p><p className="mt-1 text-[11px] leading-6 text-slate-400">تنقّل بين الأقسام، ثم اضغط على زر الحفظ عند الانتهاء.</p></div></div>
          </nav>
          <div ref={scroll} className={`${styles.content} min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-8 lg:p-9`}><fieldset disabled={busy} className="min-w-0">{children}</fieldset></div>
        </div>
        <footer className={`${styles.footer} grid shrink-0 grid-cols-2 items-center gap-3 border-t border-slate-200 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex sm:justify-between sm:px-8`}>
          <button type="button" disabled={blocked} onClick={onClose} className={`${editorButton} hidden sm:inline-flex`}>إلغاء</button>
          <div className="col-span-2 grid grid-cols-2 gap-3 sm:flex sm:items-center">
            <button type="button" disabled={blocked || index <= 0} onClick={() => onTabChange(visibleTabs[index - 1].id)} className={`${editorButton} disabled:opacity-30`}><ArrowRight className="h-4 w-4" />السابق</button>
            {index < visibleTabs.length - 1 ? <button type="button" disabled={blocked} onClick={() => onTabChange(visibleTabs[index + 1].id)} className={editorButton}>التالي<ArrowLeft className="h-4 w-4" /></button> : <span className="hidden sm:block" />}
            <button type="submit" disabled={blocked} className={`${editorPrimary} col-span-2 min-w-[170px] sm:mr-2`}>
              {blocked ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{busy ? 'جاري الحفظ…' : uploading ? 'جاري رفع الملفات…' : mode === 'content' ? 'حفظ المحتوى' : editing ? 'حفظ التغييرات' : 'حفظ ونشر الدورة'}
            </button>
          </div>
        </footer>
      </form>
    </div>
  </div>;
}
