'use client';

import { useEffect, useId, useState } from 'react';
import { BookOpen, Check, ChevronDown, ClipboardCheck, Clock3, GraduationCap, Heart, HeartHandshake, Layers3, RefreshCw, Search, SlidersHorizontal, Sparkles, Users, X } from 'lucide-react';
import { CardImage } from '@/components/ui/CardImage';
import { EditorSelect } from '@/components/courses/editor/editor-select';
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
  const Icon = item.content_kind === 'quiz' ? ClipboardCheck : BookOpen;
  return <li className="flex items-center gap-2.5 py-3 first:pt-0 last:pb-0 sm:gap-3">
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 sm:rounded-xl ${item.content_kind === 'quiz' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-[#173A7C]'}`}><Icon aria-hidden="true" className="h-4 w-4" /></span>
    <div className="min-w-0 flex-1"><p className="break-words text-xs font-medium leading-6 text-slate-800 sm:text-sm">{item.title || (item.content_kind === 'quiz' ? 'اختبار الدورة' : 'درس الدورة')}</p><p className="mt-0.5 text-[11px] text-slate-500">{item.content_kind === 'quiz' ? 'اختبار' : 'درس'}</p></div>
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-rose-50 px-2 py-1.5 text-xs font-bold tabular-nums text-rose-700 sm:px-2.5 sm:text-sm" aria-label={`${number(item.hearts)} قلب رضا`}><Heart aria-hidden="true" className="h-3.5 w-3.5" />{number(item.hearts)}</span>
  </li>;
}

function CourseFeedbackCard({ course }: { course: CourseSatisfaction }) {
  const id = useId();
  const [kind, setKind] = useState<'all' | 'lesson' | 'quiz'>('all');
  const contents = course.contents.filter((item) => kind === 'all' || item.content_kind === kind);
  const metrics = [
    { label: 'إجمالي القلوب', value: course.hearts, Icon: Heart, color: 'text-rose-600' },
    { label: 'الطلاب', value: course.learners, Icon: Users, color: 'text-emerald-700' },
    { label: 'قلوب الدروس', value: course.lesson_hearts, Icon: BookOpen, color: 'text-blue-800' },
    { label: 'قلوب الاختبار', value: course.quiz_hearts, Icon: ClipboardCheck, color: 'text-amber-700' },
  ];
  return <article aria-labelledby={id} className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_3px_18px_rgba(23,58,124,0.04)] sm:rounded-3xl">
    <div className="grid min-w-0 grid-cols-[104px_minmax(0,1fr)] gap-x-3 gap-y-3 p-3 min-[390px]:grid-cols-[112px_minmax(0,1fr)] sm:grid-cols-[144px_minmax(0,1fr)] sm:gap-5 sm:p-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-0 lg:p-0 xl:grid-cols-[310px_minmax(0,1fr)]">
      <div className="min-w-0 lg:row-span-3 lg:border-l lg:border-slate-100 lg:bg-slate-50/70 lg:p-6">
        <CardImage src={course.image} alt={course.title} sizes="(min-width: 1280px) 262px, (min-width: 1024px) 232px, (min-width: 640px) 144px, (min-width: 390px) 112px, 104px" className="rounded-xl sm:rounded-2xl" />
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-medium leading-5 sm:mt-3 sm:text-[11px]">
          <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 ${course.status === 'published' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${course.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'}`} />{course.status === 'published' ? 'منشورة' : course.status === 'archived' ? 'مؤرشفة' : 'مسودة'}</span>
        </div>
        {course.professionalDevelopment && <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium leading-5 text-emerald-800 sm:text-xs"><Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0" /><span>تطوير مهني<span className="hidden lg:inline"> مستمر</span></span></p>}
      </div>
      <div className="min-w-0 lg:p-6 lg:pb-0">
        <h2 id={id} className="break-words text-sm font-bold leading-6 text-slate-900 sm:text-lg sm:leading-8 lg:text-xl">{course.title}</h2>
        {course.instructor && <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-5 text-slate-500 sm:mt-2 sm:text-xs"><GraduationCap aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#173A7C]" />{course.instructor}</p>}
        <p className="mt-2 text-[10px] font-medium leading-5 text-[#173A7C] sm:text-xs">{categories[course.category] || course.category || 'دورة تدريبية'}</p>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] leading-5 text-slate-500 sm:mt-3 sm:text-xs sm:leading-6">
          {course.duration && <span className="inline-flex items-start gap-1"><Clock3 aria-hidden="true" className="mt-1 h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />{course.duration}</span>}
          <span className="inline-flex items-center gap-1"><Layers3 aria-hidden="true" className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" /><bdi>{number(course.lessonCount)}</bdi> محتوى تعليمي</span>
        </div>
      </div>
      <dl aria-label={`ملخص رضا الطلاب عن ${course.title}`} className="col-span-2 grid min-w-0 grid-cols-4 divide-x divide-x-reverse divide-slate-200/80 rounded-xl border border-slate-100 bg-slate-50/80 py-2.5 lg:col-span-1 lg:mx-6 lg:mt-5">
        {metrics.map(({ label, value, Icon, color }) => <div key={label} className="flex min-w-0 flex-col items-center gap-1 px-1 text-center sm:px-2">
          <dt className="order-2 text-[10px] leading-5 text-slate-500 sm:text-[11px]">{label}</dt>
          <dd className="order-1 flex items-center gap-1.5 text-lg font-bold leading-6 tabular-nums text-slate-900"><Icon aria-hidden="true" className={`h-3.5 w-3.5 shrink-0 ${color}`} /><bdi>{number(value)}</bdi></dd>
        </div>)}
      </dl>
      <div className="col-span-2 min-w-0 border-t border-slate-100 pt-3 sm:pt-4 lg:col-span-1 lg:mx-6 lg:mt-5 lg:mb-6">
        {course.contents.length ? <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h3 className="sr-only text-xs font-semibold text-slate-500 sm:not-sr-only">تفاصيل الرضا عن المحتوى</h3>
            <div role="group" aria-label={`تصفية تقييمات ${course.title}`} className="flex w-full gap-1 rounded-xl bg-slate-100/80 p-1 sm:w-auto">{([{ id: 'all', label: 'الكل' }, { id: 'lesson', label: 'الدروس' }, { id: 'quiz', label: 'الاختبارات' }] as const).map((tab) => <button key={tab.id} type="button" aria-pressed={kind === tab.id} onClick={() => setKind(tab.id)} className={`min-h-10 flex-1 rounded-lg px-3 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-9 sm:flex-none ${kind === tab.id ? 'bg-white text-[#173A7C] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{tab.label}</button>)}</div>
          </div>
          {contents.length ? <><ul className="divide-y divide-slate-100">{contents.slice(0, 3).map((item) => <FeedbackRow key={`${item.content_kind}:${item.content_key}`} item={item} />)}</ul>
            {contents.length > 3 && <details key={kind} className="group mt-3 border-t border-slate-100 pt-2"><summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 text-xs font-semibold text-[#173A7C] [&::-webkit-details-marker]:hidden">عرض باقي المحتوى ({number(contents.length - 3)})<ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180" /></summary><ul className="mt-3 divide-y divide-slate-100">{contents.slice(3).map((item) => <FeedbackRow key={`${item.content_kind}:${item.content_key}`} item={item} />)}</ul></details>}
          </> : <p role="status" className="py-2 text-xs leading-6 text-slate-500 sm:text-sm">لم تُسجّل قلوب رضا على {kind === 'quiz' ? 'الاختبارات' : 'الدروس'} بعد.</p>}
        </> : <div className="flex items-start gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 sm:h-10 sm:w-10 sm:rounded-xl"><HeartHandshake aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" /></span><div><p className="text-xs font-semibold leading-6 text-slate-700 sm:text-sm">في انتظار مشاركة الطلاب</p><p className="mt-0.5 text-[11px] leading-5 text-slate-500 sm:text-xs sm:leading-6">ستظهر قلوب الرضا عند تقييم الدروس أو الاختبارات.</p></div></div>}
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
  return <div className="mx-auto min-w-0 max-w-[1440px] space-y-4 px-0 py-1 sm:space-y-6 sm:px-2 sm:py-3 lg:p-5" dir="rtl">
    <header className="overflow-hidden rounded-2xl border border-blue-100/80 bg-linear-to-l from-[#edf3fc] via-[#f5f8fc] to-emerald-50/60 sm:rounded-3xl">
      <div className="p-4 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#173A7C] text-emerald-200 shadow-[0_5px_16px_rgba(23,58,124,0.16)] sm:h-14 sm:w-14 sm:rounded-2xl"><HeartHandshake aria-hidden="true" className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.6} /></span>
            <div><p className="mb-1 hidden text-xs font-semibold text-emerald-800 sm:block">تجربة التعلّم</p><h1 className="text-xl font-bold leading-8 text-[#173A7C] sm:text-3xl sm:leading-9">رضا الطلاب</h1></div>
          </div>
          <div className="flex shrink-0 items-center gap-3"><span className="hidden xl:block"><SatisfactionArtwork /></span><button type="button" disabled={loading} onClick={refresh} aria-label={loading ? 'جاري تحديث بيانات الرضا' : 'تحديث بيانات الرضا'} className={`${action} w-11 px-0! sm:w-auto sm:px-4!`}><RefreshCw aria-hidden="true" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">{loading ? 'جاري التحديث' : 'تحديث البيانات'}</span></button></div>
        </div>
        <p className="mt-3 max-w-xl text-xs leading-6 text-slate-600 sm:mt-4 sm:text-sm sm:leading-7">تابع رضا الطلاب عن دروس الدورات واختباراتها.</p>
      </div>
      <dl aria-label="إحصاءات رضا الطلاب" className="grid grid-cols-3 border-t border-blue-100/80 bg-white/75 px-2 py-3 sm:px-7 sm:py-5">
        {[{ label: 'قلوب الرضا', value: courses.reduce((sum, course) => sum + course.hearts, 0), hint: 'عن الدروس والاختبارات', Icon: Heart, color: 'bg-rose-50 text-rose-600' },
          { label: 'طلاب شاركوا', value: data?.learners || 0, hint: 'كل طالب يُحسب مرة واحدة', Icon: Users, color: 'bg-blue-50 text-[#173A7C]' },
          { label: 'دورات مقيّمة', value: rated, hint: data ? `من أصل ${number(courses.length)} دورة` : 'عبر جميع الدورات', Icon: BookOpen, color: 'bg-emerald-50 text-emerald-700' }].map(({ label, value, hint, Icon, color }, index) => <div key={label} className={`relative flex min-w-0 flex-col px-1 text-center sm:px-3 sm:pr-16 sm:text-right ${index ? 'border-r border-slate-200 sm:pr-20' : ''}`}>
            <dt className="order-2 mt-1 text-[11px] font-semibold leading-5 text-slate-600 sm:text-xs">{label}</dt>
            <dd className="order-1 flex items-center justify-center gap-1.5 text-xl font-bold leading-7 tabular-nums text-slate-900 sm:justify-start sm:text-2xl"><span aria-hidden="true" className={`absolute top-1 right-3 hidden h-11 w-11 items-center justify-center rounded-2xl sm:flex ${index ? 'sm:right-5' : ''} ${color}`}><Icon className="h-5 w-5" strokeWidth={1.7} /></span><Icon aria-hidden="true" className={`h-3.5 w-3.5 shrink-0 sm:hidden ${color.split(' ').at(-1)}`} /><bdi>{data ? number(value) : '—'}</bdi></dd>
            <dd className="order-3 mt-0.5 hidden text-[11px] leading-5 text-slate-400 sm:block">{hint}</dd>
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
    {loading && !data ? <div role="status" aria-label="جاري تحميل رضا الطلاب" className="space-y-3 sm:space-y-5">{[0, 1].map((item) => <div key={item} className="grid animate-pulse grid-cols-[104px_minmax(0,1fr)] gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-[144px_minmax(0,1fr)] sm:gap-5 sm:rounded-3xl sm:p-5 lg:grid-cols-[260px_minmax(0,1fr)]"><div className="aspect-video rounded-xl bg-slate-100" /><div className="min-w-0 space-y-3"><div className="h-6 w-3/4 rounded-lg bg-slate-100" /><div className="h-4 w-1/3 rounded-lg bg-slate-100" /><div className="h-20 rounded-xl bg-slate-50" /></div></div>)}</div>
      : data && <div aria-busy={loading} className="space-y-3 sm:space-y-5">{visible.map((course) => <CourseFeedbackCard key={course.id} course={course} />)}
        {!visible.length && <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center"><span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#173A7C]"><Search aria-hidden="true" className="h-6 w-6" /></span><h2 className="text-lg font-bold text-slate-800">{courses.length ? 'لا توجد دورات تطابق البحث' : 'لا توجد دورات لعرضها حاليًا'}</h2><p className="mt-2 text-sm leading-7 text-slate-500">{courses.length ? 'جرّب اسمًا آخر أو اعرض كل الدورات.' : 'ستظهر الدورات ونتائج رضا الطلاب هنا بعد إضافتها.'}</p>{courses.length > 0 && <button type="button" className={`${action} mt-5`} onClick={() => { setQuery(''); setFilter('all'); }}><X aria-hidden="true" className="h-4 w-4" />مسح التصفية</button>}</div>}
      </div>}
  </div>;
}
