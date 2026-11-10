import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen, GraduationCap, LockKeyhole, ShieldCheck, Users } from 'lucide-react';
import { DemoLoginForm } from '@/components/demo/login-form';

export const metadata: Metadata = { title: 'تسجيل الدخول | المدار ليرنينج' };

const experiences = [
  { title: 'الطالب', description: 'تابع الدورات والمحاضرات والواجبات والاختبارات والشهادات.', icon: GraduationCap },
  { title: 'المعلّم', description: 'راجع الدورات المسندة والطلاب والاختبارات والأنشطة.', icon: BookOpen },
  { title: 'الأدمن', description: 'استكشف إدارة المستخدمين والدورات والمحتوى والتقارير.', icon: Users },
];

export default function DemoLoginPage() {
  return (
    <main dir="rtl" className="relative min-h-[90vh] overflow-hidden bg-gradient-to-b from-[#F2F8FE] via-white to-[#EAF7FD] px-4 pb-16 pt-24 sm:px-6 sm:pt-32">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-[#168AD3]/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-[#19B6C7]/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-16">
        <div className="order-2 lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0B3766]/10 bg-white/85 px-4 py-2 text-xs font-bold text-[#0B3766] shadow-sm">
            <ShieldCheck className="h-4 w-4 text-[#168AD3]" /> تجربة تعليمية آمنة ببيانات تجريبية
          </span>
          <h1 className="mt-6 max-w-2xl text-[1.9rem] font-bold leading-[1.6] text-[#0B3766] sm:text-4xl lg:text-[2.6rem]">
            جرّب منصة المدار <span className="bg-gradient-to-l from-[#0B3766] to-[#168AD3] bg-clip-text text-transparent">بالدور المناسب لك</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm font-medium leading-[2] text-slate-600 sm:text-base">
            ادخل بالإيميل وكلمة المرور المخصصة لحسابك، واستكشف واجهة الطالب أو المعلّم أو الأدمن. كل البيانات ثابتة للمعاينة، ولا تتم أي عمليات شراء أو تعديلات فعلية.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {experiences.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-2xl border border-[#0B3766]/10 bg-white/85 p-4 shadow-[0_10px_35px_-24px_rgba(11,55,102,0.12)]">
                <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#EAF7FD] text-[#0B3766]"><Icon className="h-5 w-5" /></span>
                <h2 className="text-sm font-bold text-[#0B3766]">{title}</h2>
                <p className="mt-1.5 text-xs font-medium leading-[1.9] text-slate-500">{description}</p>
              </div>
            ))}
          </div>
          <Link href="/courses" className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-[#0B3766] hover:text-[#168AD3]">
            استعرض الدورات أولًا <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#0B3766]/10 bg-white p-5 shadow-[0_24px_90px_-33px_rgba(11,55,102,0.12)] sm:p-8">
            <div className="absolute inset-x-10 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#168AD3] to-transparent" />
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#0B3766] to-[#147CA9] text-white shadow-md"><LockKeyhole className="h-6 w-6" /></span>
              <div>
                <h2 className="text-xl font-bold text-[#0B3766]">تسجيل الدخول</h2>
                <p className="mt-1 text-xs font-medium text-slate-500">استخدم بيانات حساب الديمو المرسلة إليك</p>
              </div>
            </div>
            <DemoLoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
