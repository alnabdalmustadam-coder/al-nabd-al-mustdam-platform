import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';

export const metadata: Metadata = { title: 'حجز موعد' };

export default function BookingPage() {
  return (
    <section className="mx-auto min-h-[55vh] max-w-3xl px-4 pb-12 pt-28">
      <div className="rounded-3xl border border-[#D6E2D8] bg-white p-6 shadow-sm sm:p-9">
        <CalendarDays className="mb-3 text-[#168AD3]" size={32} />
        <h1 className="text-3xl font-bold text-[#0B3766]">مواعيد الاستشارات</h1>
        <p className="mt-3 text-sm leading-8 text-slate-600">موعد للمعاينة في جولة مَدار. جلسة تصميم خطة تحسين، 45 دقيقة.</p>
        <Link href="/marketplace" className="mt-4 inline-flex rounded-lg bg-[#0B3766] px-4 py-2.5 text-sm font-bold text-white">استعرض الخدمات التدريبية</Link>
      </div>
    </section>
  );
}
