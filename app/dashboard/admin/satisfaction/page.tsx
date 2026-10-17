'use client';

import { useEffect, useId, useState } from 'react';
import { BookOpen, Check, ChevronDown, ClipboardCheck, Clock3, GraduationCap, Heart, HeartHandshake, Layers3, RefreshCw, Search, SlidersHorizontal, Sparkles, Users, X } from 'lucide-react';
import { CardImage } from '@/components/ui/CardImage';
import { EditorSelect } from '@/components/courses/editor/editor-select';
import { selectSatisfactionCourses, type CourseSatisfaction, type SatisfactionContent, type SatisfactionFilter, type SatisfactionResponse, type SatisfactionSort } from '@/lib/learning/satisfaction-summary';

const number = (value: number) => value.toLocaleString('ar-SA');
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
  return <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.content_kind === 'quiz' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-[#173A7C]'}`}><Icon aria-hidden="true" className="h-4 w-4" /></span>
    <div className="min-w-0 flex-1"><p className="break-words text-sm font-medium leading-6 text-slate-800">{item.title || (item.content_kind === 'quiz' ? 'اختبار الدورة' : 'درس الدورة')}</p><p className="mt-0.5 text-[11px] text-slate-500">{item.content_kind === 'quiz' ? 'اختبار' : 'درس'}</p></div>
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-sm font-bold tabular-nums text-rose-700" aria-label={`${number(item.hearts)} قلب رضا`}><Heart aria-hidden="true" className="h-3.5 w-3.5" />{number(item.hearts)}</span>
  </li>;
}

function CourseFeedbackCard({ course }: { course: CourseSatisfaction }) {
  const id = useId();
  const [kind, setKind] = useState<'all' | 'lesson' | 'quiz'>('all');
  const contents = course.contents.filter((item) => kind === 'all' || item.content_kind === kind);
  return <article aria-labelledby={id} className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_3px_18px_rgba(23,58,124,0.04)]">
    <div className="grid min-w-0 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)]">
      <div className="min-w-0 border-b border-slate-100 bg-slate-50/70 p-5 sm:p-6 lg:border-b-0 lg:border-l">
        <CardImage src={course.image} alt={course.title} sizes="(min-width: 1280px) 262px, (min-width: 1024px) 232px, (min-width: 640px) 70vw, 90vw" className="rounded-2xl" />
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold leading-5">
          <span className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-[#173A7C]">{categories[course.category] || course.category || 'دورة تدريبية'}</span>
          <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 ${course.status === 'published' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-200/70 text-slate-600'}`}><span className={`h-1.5 w-1.5 rounded-full ${course.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'}`} />{course.status === 'published' ? 'منشورة' : course.status === 'archived' ? 'مؤرشفة' : 'مسودة'}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs leading-6 text-slate-500">
          {course.duration && <span className="inline-flex items-center gap-1.5"><Clock3 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />{course.duration}</span>}
          <span className="inline-flex items-center gap-1.5"><Layers3 aria-hidden="true" className="h-3.5 w-3.5" />{number(course.lessonCount)} محتوى تعليمي</span>
        </div>
        {course.professionalDevelopment && <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800"><Check aria-hidden="true" className="h-4 w-4" />تطوير مهني مستمر</p>}
      </div>
      <div className="min-w-0 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1"><h2 id={id} className="text-lg font-bold leading-8 text-slate-900 sm:text-xl">{course.title}</h2>
            {course.instructor && <p className="mt-2 flex items-center gap-2 text-xs leading-6 text-slate-500"><GraduationCap aria-hidden="true" className="h-4 w-4 shrink-0 text-[#173A7C]" />{course.instructor}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2.5 rounded-2xl border border-rose-100 bg-rose-50/70 px-3.5 py-2.5"><Heart aria-hidden="true" className="h-5 w-5 fill-rose-500 text-rose-500" /><div><p className="text-xl font-bold leading-6 tabular-nums text-rose-700">{number(course.hearts)}</p><p className="mt-1 text-[10px] font-medium text-rose-700/80">قلب رضا</p></div></div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-100 pb-5 text-xs leading-6 text-slate-500">
          <span className="inline-flex items-center gap-1.5"><Users aria-hidden="true" className="h-4 w-4 text-emerald-700" /><strong className="font-semibold tabular-nums text-slate-800">{number(course.learners)}</strong> طالب عبّر عن رضاه</span>
          <span>الدروس <strong className="mr-1 font-semibold tabular-nums text-slate-800">{number(course.lesson_hearts)}</strong></span>
          <span>الاختبارات <strong className="mr-1 font-semibold tabular-nums text-slate-800">{number(course.quiz_hearts)}</strong></span>
        </div>
        {course.contents.length ? <div className="pt-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="text-xs font-semibold text-slate-500">تفاصيل الرضا عن المحتوى</h3>
            <div role="group" aria-label={`تصفية تقييمات ${course.title}`} className="inline-flex gap-1 rounded-xl bg-slate-100/80 p-1">{([{ id: 'all', label: 'الكل' }, { id: 'lesson', label: 'الدروس' }, { id: 'quiz', label: 'الاختبارات' }] as const).map((tab) => <button key={tab.id} type="button" aria-pressed={kind === tab.id} onClick={() => setKind(tab.id)} className={`min-h-9 rounded-lg px-3 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${kind === tab.id ? 'bg-white text-[#173A7C] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{tab.label}</button>)}</div>
          </div>
          {contents.length ? <><ul className="divide-y divide-slate-100">{contents.slice(0, 3).map((item) => <FeedbackRow key={`${item.content_kind}:${item.content_key}`} item={item} />)}</ul>
            {contents.length > 3 && <details key={kind} className="group mt-4 border-t border-slate-100 pt-3"><summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 text-xs font-semibold text-[#173A7C] [&::-webkit-details-marker]:hidden">عرض باقي المحتوى ({number(contents.length - 3)})<ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180" /></summary><ul className="mt-3 divide-y divide-slate-100">{contents.slice(3).map((item) => <FeedbackRow key={`${item.content_kind}:${item.content_key}`} item={item} />)}</ul></details>}
          </> : <p role="status" className="py-3 text-sm leading-7 text-slate-500">لم تُسجّل قلوب رضا على {kind === 'quiz' ? 'الاختبارات' : 'الدروس'} بعد.</p>}
        </div> : <div className="flex items-start gap-3 pt-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><HeartHandshake aria-hidden="true" className="h-5 w-5" /></span><div><p className="text-sm font-semibold text-slate-700">في انتظار مشاركة الطلاب</p><p className="mt-1 text-xs leading-6 text-slate-500">ستظهر هنا قلوب الرضا عند تقييم الدروس أو الاختبارات.</p></div></div>}
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
  return <div className="mx-auto max-w-[1440px] space-y-6 p-4 sm:p-6 lg:p-8" dir="rtl">
    <header className="overflow-hidden rounded-3xl border border-blue-100/80 bg-linear-to-l from-[#edf3fc] via-[#f5f8fc] to-emerald-50/60">
      <div className="flex flex-wrap items-center justify-between gap-5 p-5 sm:p-7">
        <div className="flex min-w-0 items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#173A7C] text-emerald-200 shadow-[0_5px_16px_rgba(23,58,124,0.16)] sm:h-14 sm:w-14"><HeartHandshake aria-hidden="true" className="h-7 w-7" strokeWidth={1.6} /></span>
          <div><p className="mb-1 text-[10px] font-semibold tracking-wide text-emerald-800 sm:text-xs">تجربة التعلّم</p><h1 className="text-2xl font-bold leading-9 text-[#173A7C] sm:text-3xl">رضا الطلاب</h1><p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">تعرّف على المحتوى الذي نال رضا الطلاب، وتابع تفاعلهم مع دروس كل دورة واختباراتها.</p></div>
        </div>
        <div className="flex items-center gap-3"><span className="hidden xl:block"><SatisfactionArtwork /></span><button type="button" disabled={loading} onClick={refresh} className={action}><RefreshCw aria-hidden="true" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />{loading ? 'جاري التحديث' : 'تحديث البيانات'}</button></div>
      </div>
      <div className="grid gap-5 border-t border-blue-100/80 bg-white/75 px-5 py-5 sm:grid-cols-3 sm:gap-0 sm:px-7">
        {[{ label: 'قلوب الرضا', value: courses.reduce((sum, course) => sum + course.hearts, 0), hint: 'عن الدروس والاختبارات', Icon: Heart, color: 'bg-rose-50 text-rose-600' },
          { label: 'طلاب شاركوا برضاهم', value: data?.learners || 0, hint: 'كل طالب يُحسب مرة واحدة', Icon: Users, color: 'bg-blue-50 text-[#173A7C]' },
          { label: 'دورات وصلت لها تقييمات', value: rated, hint: data ? `من أصل ${number(courses.length)} دورة` : 'عبر جميع الدورات', Icon: BookOpen, color: 'bg-emerald-50 text-emerald-700' }].map(({ label, value, hint, Icon, color }, index) => <div key={label} className={`flex items-center gap-3.5 ${index ? 'sm:border-r sm:border-slate-200 sm:pr-6' : ''}`}>
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color}`}><Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} /></span><div><div className="flex flex-wrap items-baseline gap-x-2"><p className="text-2xl font-bold tabular-nums text-slate-900">{data ? number(value) : '—'}</p><p className="text-xs font-semibold leading-6 text-slate-600">{label}</p></div><p className="mt-0.5 text-[11px] leading-5 text-slate-400">{hint}</p></div>
          </div>)}
      </div>
    </header>
    <p className="flex items-start gap-2 px-1 text-xs leading-6 text-slate-500"><Sparkles aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />كل قلب يعكس رضا طالب عن محتوى محدد. عدم التقييم لا يُحسب عدم رضا، وهذه التقييمات مستقلة عن درجات الاختبارات.</p>
    {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm leading-7 text-rose-800"><p>{error}{data ? ' · المعروض آخر بيانات تم تحميلها.' : ''}</p><button type="button" disabled={loading} onClick={refresh} className={action}>إعادة المحاولة</button></div>}
    {data && <section aria-label="البحث وتصفية الدورات" className="space-y-4">
      <div className="flex flex-wrap items-center gap-3"><div className="relative min-w-0 flex-1 basis-64"><Search aria-hidden="true" className="pointer-events-none absolute right-4 top-3.5 h-5 w-5 text-slate-400" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="البحث باسم الدورة أو المحاضر" placeholder="ابحث باسم الدورة أو المحاضر…" className="h-12 w-full rounded-2xl border border-slate-200 bg-white pr-12 pl-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10" /></div>
        <div className="flex w-full items-center gap-2 sm:w-[225px]"><SlidersHorizontal aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" /><div className="min-w-0 flex-1"><EditorSelect label="ترتيب الدورات" value={sort} options={[{ id: 'hearts', label: 'الأكثر قلوب رضا' }, { id: 'learners', label: 'الأكثر مشاركة طلاب' }, { id: 'title', label: 'اسم الدورة' }]} onChange={(value) => setSort(value as SatisfactionSort)} /></div></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3"><div role="group" aria-label="حالة تقييم الدورات" className="flex flex-wrap gap-2">{([{ id: 'all', label: 'كل الدورات', count: courses.length }, { id: 'rated', label: 'لديها تقييمات', count: rated }, { id: 'waiting', label: 'في انتظار التقييم', count: courses.length - rated }] as const).map((tab) => <button key={tab.id} type="button" aria-pressed={filter === tab.id} onClick={() => setFilter(tab.id)} className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 ${filter === tab.id ? 'border-[#173A7C] bg-[#173A7C] text-white shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-[#173A7C]'}`}>{tab.label}<span className={`rounded-md px-1.5 py-0.5 text-[10px] tabular-nums ${filter === tab.id ? 'bg-white/15 text-blue-100' : 'bg-slate-100 text-slate-500'}`}>{number(tab.count)}</span></button>)}</div><p role="status" className="text-xs text-slate-500">عرض {number(visible.length)} من {number(courses.length)} دورة</p></div>
    </section>}
    {loading && !data ? <div role="status" aria-label="جاري تحميل رضا الطلاب" className="space-y-5">{[0, 1].map((item) => <div key={item} className="grid animate-pulse gap-6 rounded-3xl border border-slate-200 bg-white p-6 lg:grid-cols-[260px_1fr]"><div className="aspect-video rounded-2xl bg-slate-100" /><div className="space-y-4"><div className="h-6 w-3/4 rounded-lg bg-slate-100" /><div className="h-4 w-1/3 rounded-lg bg-slate-100" /><div className="h-20 rounded-xl bg-slate-50" /></div></div>)}</div>
      : data && <div aria-busy={loading} className="space-y-5">{visible.map((course) => <CourseFeedbackCard key={course.id} course={course} />)}
        {!visible.length && <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center"><span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#173A7C]"><Search aria-hidden="true" className="h-6 w-6" /></span><h2 className="text-lg font-bold text-slate-800">{courses.length ? 'لا توجد دورات تطابق البحث' : 'لا توجد دورات لعرضها حاليًا'}</h2><p className="mt-2 text-sm leading-7 text-slate-500">{courses.length ? 'جرّب اسمًا آخر أو اعرض كل الدورات.' : 'ستظهر الدورات ونتائج رضا الطلاب هنا بعد إضافتها.'}</p>{courses.length > 0 && <button type="button" className={`${action} mt-5`} onClick={() => { setQuery(''); setFilter('all'); }}><X aria-hidden="true" className="h-4 w-4" />مسح التصفية</button>}</div>}
      </div>}
  </div>;
}
