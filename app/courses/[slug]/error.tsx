'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { COURSES_LOAD_ERROR } from '@/lib/public-courses';

export default function CourseError({ unstable_retry }: { unstable_retry: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <div role="alert" dir="rtl" className="min-h-[60vh] flex flex-col items-center justify-center gap-5 p-6 text-center">
      <p className="font-bold text-slate-700">{COURSES_LOAD_ERROR}</p>
      <button type="button" disabled={pending} onClick={() => startTransition(() => unstable_retry())} className="rounded-xl bg-[#173A7C] px-6 py-3 font-bold text-white disabled:opacity-50">
        {pending ? 'جارٍ التحميل…' : 'إعادة المحاولة'}
      </button>
      <Link href="/courses" className="text-[#173A7C] underline">العودة إلى الدورات</Link>
    </div>
  );
}
