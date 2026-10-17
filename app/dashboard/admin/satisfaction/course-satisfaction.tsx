'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { BookOpen, Check, ChevronLeft, ClipboardCheck, Clock3, GraduationCap, Heart, HeartHandshake, Layers3, Search, Users, X } from 'lucide-react';
import { CardImage } from '@/components/ui/CardImage';
import type { CourseSatisfaction, SatisfactionContent } from '@/lib/learning/satisfaction-summary';
import styles from './satisfaction.module.css';

const number = (value: number) => value.toLocaleString('en-US');
const categories: Record<string, string> = { tech: 'تقنية وحاسب', languages: 'لغات', security: 'أمن وسلامة', corporate: 'إدارة وأعمال', management: 'إدارة وأعمال', design: 'تصميم', admin: 'أعمال مكتبية', data: 'إدخال بيانات' };

function SatisfactionMetrics({ course }: { course: CourseSatisfaction }) {
  const metrics = [
    { label: 'كل القلوب', description: 'إجمالي قلوب الرضا', value: course.hearts, Icon: Heart, color: 'text-rose-300' },
    { label: 'الطلاب', description: 'عدد الطلاب الذين عبّروا عن رضاهم', value: course.learners, Icon: Users, color: 'text-emerald-200' },
    { label: 'رضا الدروس', description: 'قلوب الرضا عن الدروس', value: course.lesson_hearts, Icon: BookOpen, color: 'text-blue-200' },
    { label: 'رضا الاختبار', description: 'قلوب الرضا عن الاختبارات', value: course.quiz_hearts, Icon: ClipboardCheck, color: 'text-amber-200' },
  ];
  return <dl aria-label={`ملخص رضا الطلاب عن ${course.title}`} className={styles.metrics}>
    {metrics.map(({ label, description, value, Icon, color }) => <div key={label} className={styles.metric} title={description}>
      <dt aria-label={description}>{label}</dt><dd><Icon aria-hidden="true" className={`h-3.5 w-3.5 shrink-0 ${color}`} /><bdi>{number(value)}</bdi></dd>
    </div>)}
  </dl>;
}

function FeedbackRow({ item }: { item: SatisfactionContent }) {
  const quiz = item.content_kind === 'quiz';
  const Icon = quiz ? ClipboardCheck : BookOpen;
  const title = item.title || (quiz ? 'اختبار الدورة' : 'درس الدورة');
  return <li className={styles.row}>
    <span className={`flex h-7 w-7 items-center justify-center rounded-lg border border-white/80 ${quiz ? 'bg-amber-50/90 text-amber-700' : 'bg-blue-50/90 text-[#173A7C]'}`}><Icon aria-hidden="true" className="h-3.5 w-3.5" /><span className="sr-only">{quiz ? 'اختبار' : 'درس'}</span></span>
    <p title={title} className={styles.rowTitle}>{title}</p>
    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-100/70 bg-rose-50/90 px-2 py-1 text-[11px] font-semibold tabular-nums text-rose-700" aria-label={`${number(item.hearts)} قلب رضا`}><Heart aria-hidden="true" className="h-3 w-3" /><bdi>{number(item.hearts)}</bdi></span>
  </li>;
}

export function CourseFeedbackCard({ course, onDetails }: { course: CourseSatisfaction; onDetails: (id: number) => void }) {
  const id = useId();
  const duration = course.duration.replace(/\s*تدريبية\s*معتمدة/g, '').trim();
  return <article aria-labelledby={id} className={styles.card}>
    <div className={styles.cover}>
      <CardImage src={course.image} alt={course.title} sizes="(min-width: 1536px) 440px, (min-width: 1024px) 45vw, (min-width: 768px) 48vw, 95vw" />
      <div className={styles.coverBadges}>
        <span className={`${styles.badge} shrink-0`}><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${course.status === 'published' ? 'bg-emerald-300' : 'bg-slate-300'}`} />{course.status === 'published' ? 'منشورة' : course.status === 'archived' ? 'مؤرشفة' : 'مسودة'}</span>
        <span className={styles.badge} title={categories[course.category] || course.category}><span className="truncate">{categories[course.category] || course.category || 'دورة تدريبية'}</span></span>
      </div>
      <div className={styles.coverText}>
        <h2 id={id} title={course.title} className={styles.courseTitle}>{course.title}</h2>
        {course.instructor && <p className={styles.trainer} title={course.instructor}><GraduationCap aria-hidden="true" className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{course.instructor}</span></p>}
      </div>
    </div>
    <div className={styles.body}>
      <div className={styles.meta}>
        {duration && <span title={course.duration} className="flex min-w-0 items-center gap-1"><Clock3 aria-hidden="true" className="h-3 w-3 shrink-0" /><span className="truncate">{duration}</span></span>}
        <span className="inline-flex shrink-0 items-center gap-1" title="عدد عناصر المحتوى التعليمي"><Layers3 aria-hidden="true" className="h-3 w-3" />المحتوى <bdi>{number(course.lessonCount)}</bdi></span>
        {course.professionalDevelopment && <span className="mr-auto inline-flex shrink-0 items-center gap-1 text-emerald-200"><Check aria-hidden="true" className="h-3 w-3" />تطوير مهني</span>}
      </div>
      <SatisfactionMetrics course={course} />
      <div className={styles.cardFooter}>
        <button type="button" aria-haspopup="dialog" aria-label={`عرض تفاصيل رضا الطلاب عن ${course.title}`} onClick={() => onDetails(course.id)} className={styles.detailsButton}>
          <span>عرض التفاصيل</span><span title="عدد عناصر المحتوى التي وصلت لها تقييمات" className={styles.detailsCount}><bdi>{number(course.contents.length)}</bdi> عناصر مقيّمة</span><ChevronLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
        </button>
      </div>
    </div>
  </article>;
}

export function SatisfactionDetails({ course, onClose }: { course: CourseSatisfaction; onClose: () => void }) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null), closeButton = useRef<HTMLButtonElement>(null);
  const outside = useRef(false);
  const [kind, setKind] = useState<'all' | 'lesson' | 'quiz'>('all'), [query, setQuery] = useState('');
  const search = query.trim().toLocaleLowerCase('ar');
  const contents = course.contents.filter((item) => (kind === 'all' || item.content_kind === kind) && (!search || (item.title || '').toLocaleLowerCase('ar').includes(search)));
  const filters = [
    { id: 'all', label: 'الكل', count: course.contents.length },
    { id: 'lesson', label: 'الدروس', count: course.contents.filter((item) => item.content_kind === 'lesson').length },
    { id: 'quiz', label: 'الاختبارات', count: course.contents.filter((item) => item.content_kind === 'quiz').length },
  ] as const;

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previous = document.activeElement as HTMLElement | null;
    const htmlOverflow = document.documentElement.style.overflow, bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden'; document.body.style.overflow = 'hidden';
    // The top layer keeps the background inert and keyboard focus inside the panel.
    if (!element.open) element.showModal();
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      if (element.open) element.close();
      document.documentElement.style.overflow = htmlOverflow; document.body.style.overflow = bodyOverflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);

  return <dialog ref={dialog} aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-hint`} dir="rtl" className={styles.detailsDialog}
    onCancel={(event) => { event.preventDefault(); event.stopPropagation(); onClose(); }}
    onPointerDown={(event) => { outside.current = event.target === event.currentTarget; }}
    onClick={(event) => { if (outside.current && event.target === event.currentTarget) onClose(); outside.current = false; }}>
    <section className={styles.detailsPanel}>
      <header className={styles.detailsHeader}>
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-emerald-200"><HeartHandshake className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1"><p className="mb-1 text-[10px] text-emerald-200">تفاصيل رضا الطلاب</p><h2 id={`${id}-title`} title={course.title} className={styles.detailTitle}>{course.title}</h2></div>
        <button ref={closeButton} type="button" onClick={onClose} aria-label="إغلاق تفاصيل الرضا" className={styles.closeDetails}><X aria-hidden="true" className="h-5 w-5" /></button>
      </header>
      <div className={styles.detailsScroll}>
        <p id={`${id}-hint`} className="mb-4 text-xs leading-6 text-blue-100/80">قلوب رضا الطلاب عن كل درس واختبار في الدورة.</p>
        <SatisfactionMetrics course={course} />
        <div className={styles.detailsToolbar}>
          <div role="group" aria-label="تصفية تفاصيل الرضا" className={`${styles.tabs} ${styles.detailTabs}`}>{filters.map((tab) => <button key={tab.id} type="button" aria-pressed={kind === tab.id} onClick={() => setKind(tab.id)} className={styles.tab}>{tab.label}<bdi className={styles.tabCount}>{number(tab.count)}</bdi></button>)}</div>
          <div className="relative"><Search aria-hidden="true" className="pointer-events-none absolute top-3.5 right-3 h-4 w-4 text-blue-200/70" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="البحث في تقييمات محتوى الدورة" placeholder="ابحث باسم درس أو اختبار…" className={styles.detailSearch} /></div>
          <p role="status" className="text-[11px] text-blue-100/70">عرض {number(contents.length)} من {number(course.contents.length)} عنصر مقيّم</p>
        </div>
        {contents.length ? <ul aria-label="تقييمات محتوى الدورة">{contents.map((item) => <FeedbackRow key={`${item.content_kind}:${item.content_key}`} item={item} />)}</ul>
          : <div className={styles.detailsEmpty}><HeartHandshake aria-hidden="true" className="h-8 w-8 text-emerald-200" /><h3 className="text-sm font-semibold text-white">{course.contents.length ? 'لا توجد نتائج مطابقة' : 'بانتظار مشاركة الطلاب'}</h3><p className="text-xs leading-6 text-blue-100/75">{course.contents.length ? 'جرّب اسمًا آخر أو اعرض كل أنواع المحتوى.' : 'ستظهر تقييمات الدروس والاختبارات هنا عند وصولها.'}</p>{course.contents.length > 0 && <button type="button" onClick={() => { setKind('all'); setQuery(''); }} className={styles.clearDetails}>مسح التصفية</button>}</div>}
      </div>
    </section>
  </dialog>;
}
