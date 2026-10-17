'use client';

import { useEffect, useState } from 'react';
import { Heart, Users, BookOpen, RefreshCw } from 'lucide-react';

type Content = { content_kind: 'lesson' | 'quiz'; content_key: string; title: string; hearts: number };
type CourseSummary = { id: number; title: string; hearts?: number; learners?: number; lesson_hearts?: number; quiz_hearts?: number; contents: Content[] };
export default function SatisfactionPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [learners, setLearners] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/satisfaction', { cache: 'no-store', signal: controller.signal }).then(async (response) => {
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || 'تعذر تحميل الرضا');
      if (!controller.signal.aborted) { setCourses(payload.courses); setLearners(payload.learners); setError(''); }
    }).catch((failure) => { if (!controller.signal.aborted) setError(failure.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);
  const hearts = courses.reduce((sum, course) => sum + Number(course.hearts || 0), 0);
  return <div className="space-y-6 p-4 sm:p-6" dir="rtl">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="flex items-center gap-2 text-xl font-black text-slate-900"><Heart className="h-6 w-6 text-rose-600" />رضا الطلاب</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">قلوب رضا الطلاب عن الدروس والاختبارات. عدم التقييم أو إلغاء القلب لا يُحسب عدم رضا، وهذه الأرقام لا تدخل في درجات الاختبارات.</p></div>
      <button type="button" disabled={loading} onClick={() => { setLoading(true); setReload((value) => value + 1); }} className="flex min-h-11 items-center gap-2 rounded-xl border bg-white px-4 py-2 text-xs font-bold text-blue-900"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />تحديث</button>
    </div>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
    <div className="grid gap-3 sm:grid-cols-3">
      {[{ label: 'قلوب الرضا', value: hearts, Icon: Heart }, { label: 'طلاب عبّروا عن رضاهم', value: learners, Icon: Users },
        { label: 'دورات لديها تقييم رضا', value: courses.filter((course) => Number(course.hearts) > 0).length, Icon: BookOpen }].map(({ label, value, Icon }) =>
        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><Icon className="mb-3 h-5 w-5 text-rose-600" /><p className="text-2xl font-black text-blue-900">{loading ? '…' : value}</p><p className="mt-1 text-xs font-bold text-slate-600">{label}</p></div>)}
    </div>
    {!loading && !error && <div className="space-y-4">{courses.map((course) => <section key={course.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 p-4"><h2 className="font-black text-slate-900">{course.title}</h2>
        <p className="text-xs font-bold text-slate-600">{course.hearts || 0} قلب · {course.learners || 0} طالب · الدروس {course.lesson_hearts || 0} · الاختبارات {course.quiz_hearts || 0}</p></div>
      {course.contents.length ? <div className="overflow-x-auto"><table className="w-full text-right text-sm"><thead className="text-xs text-slate-500"><tr><th className="p-4">المحتوى</th><th className="p-4">النوع</th><th className="p-4">قلوب الرضا</th></tr></thead>
        <tbody>{[...course.contents].sort((a, b) => Number(b.hearts) - Number(a.hearts)).map((content) => <tr key={`${content.content_kind}:${content.content_key}`} className="border-t border-slate-100"><td className="p-4 font-bold text-slate-800">{content.title}</td><td className="p-4 text-slate-600">{content.content_kind === 'quiz' ? 'اختبار' : 'درس'}</td><td className="p-4 font-black text-rose-600">{content.hearts}</td></tr>)}</tbody></table></div>
        : <p className="p-5 text-sm text-slate-500">لم يعبّر أي طالب عن رضاه بعد.</p>}
    </section>)}</div>}
  </div>;
}
