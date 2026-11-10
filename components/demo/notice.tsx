import Link from 'next/link';
import { Eye, Repeat2 } from 'lucide-react';

export function DemoNotice() {
  return (
    <aside aria-label="حالة جولة العرض" className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#D4E1D6] bg-[#F0F6EE] px-3 py-2.5 text-xs text-[#0B3766]">
      <span className="inline-flex items-center gap-2"><Eye size={16} /> جولة عرض ببيانات ثابتة للمعاينة</span>
      <Link href="/auth/login" className="inline-flex items-center gap-1.5 font-bold hover:underline"><Repeat2 size={15} /> تغيير حساب العرض</Link>
    </aside>
  );
}
