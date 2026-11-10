import Link from 'next/link';
import { ArrowLeft, BookOpen, GraduationCap, Settings2 } from 'lucide-react';

const roles = [
  { title: 'الطالب', detail: 'دوراتي وتقدم التعلم والواجبات والشهادات.', icon: GraduationCap },
  { title: 'المعلم', detail: 'الدورات والطلاب والاختبارات والتكليفات.', icon: BookOpen },
  { title: 'الأدمن', detail: 'إدارة الدورات والمستخدمين والمحتوى والتقارير.', icon: Settings2 },
];

export function DemoRolePicker() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {roles.map(({ title, detail, icon: Icon }) => (
        <div key={title} className="rounded-2xl border border-[#0B3766]/10 bg-white p-5 text-[#0B3766]">
          <Icon className="mb-3 h-6 w-6 text-[#168AD3]" />
          <strong className="block text-lg">حساب {title}</strong>
          <p className="mt-2 text-xs leading-6 text-slate-500">{detail}</p>
          <Link href="/auth/login" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#0D8495]">
            تسجيل الدخول <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      ))}
    </div>
  );
}
