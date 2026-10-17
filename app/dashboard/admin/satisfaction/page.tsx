'use client';

import { useEffect, useId, useState } from 'react';
import { BookOpen, Check, ChevronDown, ClipboardCheck, Clock3, GraduationCap, Heart, HeartHandshake, Layers3, RefreshCw, Search, SlidersHorizontal, Sparkles, Users, X } from 'lucide-react';
import { CardImage } from '@/components/ui/CardImage';
import { EditorSelect } from '@/components/courses/editor/editor-select';
import styles from './satisfaction.module.css';
import { selectSatisfactionCourses, type CourseSatisfaction, type SatisfactionContent, type SatisfactionFilter, type SatisfactionResponse, type SatisfactionSort } from '@/lib/learning/satisfaction-summary';

const number = (value: number) => value.toLocaleString('en-US');
const categories: Record<string, string> = { tech: 'تقنية وحاسب', languages: 'لغات', security: 'أمن وسلامة', corporate: 'إدارة وأعمال', management: 'إدارة وأعمال', design: 'تصميم', admin: 'أعمال مكتبية', data: 'إدخال بيانات' };
const action = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#173A7C] transition-colors hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 disabled:opacity-50';

function SatisfactionArtwork() {
  return <svg aria-hidden="true" viewBox="0 0 180 112" fill="none" className="h-24 w-40 shrink-0 opacity-90">
    <circle cx="90" cy="56" r="47" fill="#E9F5F1" /><circle cx="90" cy="56" r="36" stroke="#BBDDD0" strokeDasharray="3 6" />
    <rect x="28" y="42" width="46" height="54" rx="10" fill="white" stroke="#D4E2ED" /><path d="M38 57h24M38 65h17M38 73h21" stroke="#A9BCD1" strokeWidth="3" strokeLinecap="round" />
    <rect x="108" y="18" width="45" height="52" rx="10" fill="white" stroke="#D4E2ED" /><path d="m121 36 6 6 13-13" stroke="#16835B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><path d="M120 52h21" stroke="#CBD7E5" strokeWidth="3" strokeLinecap="round" />
    <path d="M90 83 63 59c-17-18 7-39 27-18 20-21 44 0 27 18L90 83Z" fill="#173A7C" /><path d="M71 59h10l5-12 9 23 5-11h10" stroke="#6EE7B7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="47" cy="25" r="5" fill="#8CCDB3" /><path d="M141 87h10m-5-5v10M21 32h8m-4-4v8" stroke="#94ADC8" strokeWidth="2" strokeLinecap="round" />
  </svg>;
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

function CourseFeedbackCard({ course }: { course: CourseSatisfaction }) {
  const id = useId();
  const [kind, setKind] = useState<'all' | 'lesson' | 'quiz'>('all');
  const contents = course.contents.filter((item) => kind === 'all' || item.content_kind === kind);
  const duration = course.duration.replace(/\s*تدريبية\s*معتمدة/g, '').trim();
  const metrics = [
    { label: 'كل القلوب', description: 'إجمالي قلوب الرضا', value: course.hearts, Icon: Heart, color: 'text-rose-300' },
    { label: 'الطلاب', description: 'عدد الطلاب الذين عبّروا عن رضاهم', value: course.learners, Icon: Users, color: 'text-emerald-200' },
    { label: 'رضا الدروس', description: 'قلوب الرضا عن الدروس', value: course.lesson_hearts, Icon: BookOpen, color: 'text-blue-200' },
    { label: 'رضا الاختبار', description: 'قلوب الرضا عن الاختبارات', value: course.quiz_hearts, Icon: ClipboardCheck, color: 'text-amber-200' },
  ];
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
      <dl aria-label={`ملخص رضا الطلاب عن ${course.title}`} className={styles.metrics}>
        {metrics.map(({ label, description, value, Icon, color }) => <div key={label} className={styles.metric} title={description}>
          <dt aria-label={description}>{label}</dt>
          <dd><Icon aria-hidden="true" className={`h-3.5 w-3.5 shrink-0 ${color}`} /><bdi>{number(value)}</bdi></dd>
        </div>)}
      </dl>
      <div className={styles.feedback}>
        {course.contents.length ? <>
          <h3 className="sr-only">تفاصيل الرضا عن المحتوى</h3>
          <div role="group" aria-label={`تصفية تقييمات ${course.title}`} className={styles.tabs}>{([{ id: 'all', label: 'الكل' }, { id: 'lesson', label: 'الدروس' }, { id: 'quiz', label: 'الاختبارات' }] as const).map((tab) => <button key={tab.id} type="button" aria-pressed={kind === tab.id} onClick={() => setKind(tab.id)} className={styles.tab}>{tab.label}</button>)}</div>
          {contents.length ? <><ul>{contents.slice(0, 3).map((item) => <FeedbackRow key={`${item.content_kind}:${item.content_key}`} item={item} />)}</ul>
            {contents.length > 3 && <details key={kind} className="group mt-1 border-t border-blue-100/15 pt-1"><summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 text-[11px] font-semibold text-emerald-200 [&::-webkit-details-marker]:hidden">المزيد من التقييمات ({number(contents.length - 3)})<ChevronDown aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-open:rotate-180" /></summary><ul>{contents.slice(3).map((item) => <FeedbackRow key={`${item.content_kind}:${item.content_key}`} item={item} />)}</ul></details>}
          </> : <p role="status" className="truncate py-3 text-[11px] text-blue-100/80">لا توجد قلوب رضا على {kind === 'quiz' ? 'الاختبارات' : 'الدروس'} بعد.</p>}
        </> : <p className="flex items-center gap-2 text-[11px] leading-7 text-blue-100/80"><HeartHandshake aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-200" /><span className="truncate">بانتظار تقييم الطلاب للدروس والاختبارات</span></p>}
      </div>
    </div>
  </article>;
}

export default function SatisfactionPage() {
  const [data, setData] = useState<SatisfactionResponse | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [reload, setReload] = useState(0);
  const [query, setQuery] = useState(''), [filter, setFilter] = useState<SatisfactionFilter>('all'), [sort, setSort] = useState<SatisfactionSort>('hearts');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/satisfaction', { cache: 'no-store', signal: controller.signal }).then(async (response) => {
      const payload = await response.json();
      if (!response.ok || !payload.success || !Array.isArray(payload.courses)) throw new Error(payload.message || 'تعذر تحميل رضا الطلاب');
      if (!controller.signal.aborted) { setData({ courses: payload.courses, learners: payload.learners }); setError(''); }
    }).catch((failure) => { if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'تعذر تحميل رضا الطلاب'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);
  const courses = data?.courses || [], rated = courses.filter((course) => course.hearts > 0).length;
  const visible = selectSatisfactionCourses(courses, query, filter, sort);
  const refresh = () => { setLoading(true); setReload((value) => value + 1); };
  return <div className={`${styles.page} mx-auto min-w-0 max-w-[1440px] space-y-4 px-0 py-1 sm:space-y-6 sm:px-2 sm:py-3 lg:p-5`} dir="rtl">
    <header className={`${styles.hero} rounded-2xl sm:rounded-3xl`}>
      <div className="p-4 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-emerald-200 sm:h-14 sm:w-14 sm:rounded-2xl"><HeartHandshake aria-hidden="true" className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.6} /></span>
            <div><p className="mb-1 hidden text-xs font-semibold text-emerald-200 sm:block">تجربة التعلّم</p><h1 className="text-xl font-bold leading-8 text-white sm:text-3xl sm:leading-9">رضا الطلاب</h1></div>
          </div>
          <div className="flex shrink-0 items-center gap-3"><span className="hidden xl:block"><SatisfactionArtwork /></span><button type="button" disabled={loading} onClick={refresh} aria-label={loading ? 'جاري تحديث بيانات الرضا' : 'تحديث بيانات الرضا'} className={`${action} ${styles.heroRefresh} w-11 px-0! sm:w-auto sm:px-4!`}><RefreshCw aria-hidden="true" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">{loading ? 'جاري التحديث' : 'تحديث البيانات'}</span></button></div>
        </div>
        <p className="mt-3 max-w-xl text-xs leading-6 text-blue-100 sm:mt-4 sm:text-sm sm:leading-7">تابع رضا الطلاب عن دروس الدورات واختباراتها.</p>
      </div>
      <dl aria-label="إحصاءات رضا الطلاب" className="grid grid-cols-3 border-t border-white/10 bg-slate-950/10 px-2 py-3 sm:px-7 sm:py-5">
        {[{ label: 'قلوب الرضا', value: courses.reduce((sum, course) => sum + course.hearts, 0), hint: 'عن الدروس والاختبارات', Icon: Heart, color: 'bg-white/10 text-rose-200' },
          { label: 'طلاب شاركوا', value: data?.learners || 0, hint: 'كل طالب يُحسب مرة واحدة', Icon: Users, color: 'bg-white/10 text-blue-200' },
          { label: 'دورات مقيّمة', value: rated, hint: data ? `من أصل ${number(courses.length)} دورة` : 'عبر جميع الدورات', Icon: BookOpen, color: 'bg-white/10 text-emerald-200' }].map(({ label, value, hint, Icon, color }, index) => <div key={label} className={`relative flex min-w-0 flex-col px-1 text-center sm:px-3 sm:pr-16 sm:text-right ${index ? 'border-r border-white/15 sm:pr-20' : ''}`}>
            <dt className="order-2 mt-1 truncate text-[10px] font-medium leading-5 text-blue-100 sm:text-xs">{label}</dt>
            <dd className="order-1 flex items-center justify-center gap-1.5 text-xl font-bold leading-7 tabular-nums text-white sm:justify-start sm:text-2xl"><span aria-hidden="true" className={`absolute top-1 right-3 hidden h-11 w-11 items-center justify-center rounded-2xl sm:flex ${index ? 'sm:right-5' : ''} ${color}`}><Icon className="h-5 w-5" strokeWidth={1.7} /></span><Icon aria-hidden="true" className={`h-3.5 w-3.5 shrink-0 sm:hidden ${color.split(' ').at(-1)}`} /><bdi>{data ? number(value) : '—'}</bdi></dd>
            <dd className="order-3 mt-0.5 hidden text-[11px] leading-5 text-blue-200/70 sm:block">{hint}</dd>
          </div>)}
      </dl>
    </header>
    <details className="group px-1 text-[11px] leading-6 text-slate-500 sm:text-xs"><summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden"><Sparkles aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-emerald-700" />كيف تُحسب أرقام الرضا؟<ChevronDown aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-open:rotate-180" /></summary><p className="mt-1 max-w-2xl pb-1">كل قلب يعكس رضا طالب عن محتوى محدد. عدم التقييم لا يُحسب عدم رضا، وهذه التقييمات مستقلة عن درجات الاختبارات. يُحسب كل طالب مرة واحدة في إجمالي المشاركين.</p></details>
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm leading-7 text-rose-800"><p>{error}{data ? ' · المعروض آخر بيانات تم تحميلها.' : ''}</p><button type="button" disabled={loading} onClick={refresh} className={action}>إعادة المحاولة</button></div>}
    {data && <section aria-label="البحث وتصفية الدورات" className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_160px] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_225px] sm:gap-3"><div className="relative min-w-0"><Search aria-hidden="true" className="pointer-events-none absolute right-3 top-4 h-4 w-4 text-slate-400" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="البحث باسم الدورة أو المحاضر" placeholder="بحث…" className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white pr-9 pl-2 text-base text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 sm:rounded-2xl sm:pl-4 sm:text-sm" /></div>
        <div className="flex min-w-0 items-center gap-2"><SlidersHorizontal aria-hidden="true" className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" /><div className="min-w-0 flex-1"><EditorSelect label="ترتيب الدورات" value={sort} options={[{ id: 'hearts', label: 'الأكثر قلوبًا' }, { id: 'learners', label: 'الأكثر مشاركة' }, { id: 'title', label: 'اسم الدورة' }]} onChange={(value) => setSort(value as SatisfactionSort)} /></div></div>
      </div>
      <div className="space-y-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:space-y-0"><div role="group" aria-label="حالة تقييم الدورات" className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">{([{ id: 'all', label: 'كل الدورات', mobile: 'الكل', count: courses.length }, { id: 'rated', label: 'لديها تقييمات', mobile: 'مقيّمة', count: rated }, { id: 'waiting', label: 'في انتظار التقييم', mobile: 'بدون تقييم', count: courses.length - rated }] as const).map((tab) => <button key={tab.id} type="button" aria-pressed={filter === tab.id} onClick={() => setFilter(tab.id)} className={`inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 py-1 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 sm:min-h-10 sm:gap-2 sm:px-3.5 sm:text-xs ${filter === tab.id ? 'border-[#173A7C] bg-[#173A7C] text-white shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-[#173A7C]'}`}><span className="sm:hidden">{tab.mobile}</span><span className="hidden sm:inline">{tab.label}</span><bdi className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] tabular-nums ${filter === tab.id ? 'bg-white/15 text-blue-100' : 'bg-slate-100 text-slate-500'}`}>{number(tab.count)}</bdi></button>)}</div><p role="status" className="text-left text-[11px] text-slate-500 sm:text-xs">عرض {number(visible.length)} من {number(courses.length)} دورة</p></div>
    </section>}
    {loading && !data ? <div role="status" aria-label="جاري تحميل رضا الطلاب" className={styles.cards}>{[0, 1].map((item) => <div key={item} className={`${styles.card} animate-pulse`}><div className="aspect-video bg-blue-200/50" /><div className="space-y-3 p-4"><div className="h-4 w-3/4 rounded-lg bg-blue-100" /><div className="h-14 rounded-xl bg-blue-100/60" /></div></div>)}</div>
      : data && <div aria-busy={loading} className={styles.cards}>{visible.map((course) => <CourseFeedbackCard key={course.id} course={course} />)}
        {!visible.length && <div className="col-span-full flex flex-col items-center rounded-3xl border border-dashed border-blue-200 bg-blue-50/70 px-6 py-12 text-center"><span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#173A7C]"><Search aria-hidden="true" className="h-6 w-6" /></span><h2 className="text-lg font-bold text-slate-800">{courses.length ? 'لا توجد دورات تطابق البحث' : 'لا توجد دورات لعرضها حاليًا'}</h2><p className="mt-2 text-sm leading-7 text-slate-500">{courses.length ? 'جرّب اسمًا آخر أو اعرض كل الدورات.' : 'ستظهر الدورات ونتائج رضا الطلاب هنا بعد إضافتها.'}</p>{courses.length > 0 && <button type="button" className={`${action} mt-5`} onClick={() => { setQuery(''); setFilter('all'); }}><X aria-hidden="true" className="h-4 w-4" />مسح التصفية</button>}</div>}
      </div>}
  </div>;
}
