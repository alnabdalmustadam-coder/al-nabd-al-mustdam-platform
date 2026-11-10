import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CheckCircle2, BookOpen, ClipboardList } from "lucide-react";
import { corporateCourses, corporateCategories, findCorporateCourse } from "@/data/corporateCourses";

type Params = { params: Promise<{ slug: string }> };

const categoryDetails: Record<string, { summary: string; audience: string; outcomes: string[]; sections: string[] }> = {
  tech: {
    summary: "مقدمة تطبيقية لتطوير المهارات التقنية والانتقال من المفاهيم إلى أمثلة بيئة العمل.",
    audience: "الموظفون التقنيون وفرق تقنية المعلومات والمهتمون بالتخصص.",
    outcomes: ["فهم المبادئ والأدوات المرتبطة بالبرنامج", "تطبيق مهارات أساسية في سيناريوهات عملية", "مراجعة أبرز التحديات والأخطاء الشائعة"],
    sections: ["المفاهيم والمصطلحات الأساسية", "الأدوات والتطبيقات", "تدريبات عملية", "المراجعة والتطوير"],
  },
  admin: {
    summary: "تدريب مهني يركز على تطوير الإجراءات المكتبية وتنظيم المهام وتحسين جودة العمل.",
    audience: "موظفو الأعمال الإدارية والمكتبية.",
    outcomes: ["تنظيم المهام والمعلومات", "تحسين دقة المخرجات", "تطبيق أدوات وأساليب مناسبة"],
    sections: ["أساسيات التنظيم", "المهارات الرئيسية", "أمثلة من بيئة العمل", "قياس جودة المخرجات"],
  },
  management: {
    summary: "برنامج يربط مفاهيم الإدارة والتخطيط بمهارات التنفيذ والتواصل واتخاذ القرار.",
    audience: "المديرون والمشرفون وقادة الفرق.",
    outcomes: ["تحديد الأهداف والمسؤوليات", "تحسين أساليب التواصل واتخاذ القرار", "مراجعة الأداء وصياغة خطوات تطوير"],
    sections: ["تحديد الاحتياجات", "الأدوات والإجراءات", "حالات عملية", "المتابعة والتحسين"],
  },
  marketing: {
    summary: "برنامج لتطوير التفكير التسويقي والتواصل مع العملاء وتحليل مؤشرات النتائج.",
    audience: "فرق التسويق والمبيعات وخدمة العملاء.",
    outcomes: ["تحليل احتياجات الجمهور", "تحسين رسائل التسويق والتواصل", "اقتراح مقاييس لمتابعة الأداء"],
    sections: ["دراسة الجمهور", "التخطيط والرسائل", "التطبيقات العملية", "المتابعة والتحسين"],
  },
  "soft-skills": {
    summary: "برنامج تفاعلي لتنمية التواصل والتعاون والتعامل مع مواقف العمل اليومية.",
    audience: "الموظفون وقادة الفرق بمختلف تخصصاتهم.",
    outcomes: ["فهم مواقف العمل", "تطوير الحوار والعمل الجماعي", "بناء خطة تحسين شخصية"],
    sections: ["المهارات الأساسية", "التواصل الفعال", "محاكاة المواقف", "التقييم والتطوير"],
  },
  general: {
    summary: "محتوى معرفي مقترح يساعد على فهم موضوع البرنامج والتعرف إلى تطبيقاته الأساسية.",
    audience: "المتعلمون والمهنيون الراغبون في تطوير معارفهم.",
    outcomes: ["فهم المفاهيم الأساسية", "التعرف إلى التطبيقات الممكنة", "تقييم مستوى التقدم"],
    sections: ["مقدمة البرنامج", "المفاهيم والمهارات", "تمارين وأنشطة", "المراجعة والخطوات التالية"],
  },
};

export function generateStaticParams() {
  return corporateCourses.map(course => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const course = findCorporateCourse(slug);
  return { title: course ? course.title + " | دورات الشركات - المدار" : "برنامج غير موجود" };
}

export default async function CorporateCourseDetails({ params }: Params) {
  const { slug } = await params;
  const course = findCorporateCourse(slug);
  if (!course) notFound();

  const details = categoryDetails[course.category] || categoryDetails.general;
  const category = corporateCategories.find(c => c.key === course.category)?.label || "تدريب الشركات";
  const related = corporateCourses.filter(c => c.category === course.category && c.slug !== course.slug).slice(0, 3);

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-[#F3F9FE] via-white to-[#F8FBFF] text-[#0B3766]">
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-28 sm:px-6 sm:pb-20 sm:pt-36">
        <nav aria-label="مسار التصفح" className="mb-7 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-[#168AD3]">الرئيسية</Link>
          <span>/</span>
          <Link href="/corporate" className="hover:text-[#168AD3]">دورات الشركات</Link>
          <span>/</span>
          <span className="max-w-[180px] truncate text-[#0B3766] sm:max-w-sm">{course.title}</span>
        </nav>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
          <article className="rounded-[2rem] border border-white bg-white/90 p-6 shadow-[0_18px_55px_-30px_rgba(11,55,102,0.12)] sm:p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF7FD] px-4 py-2 text-xs font-bold text-[#0B3766]">
              <Building2 className="h-4 w-4 text-[#168AD3]" /> {category}
            </span>
            <h1 className="mt-5 text-[1.55rem] font-bold leading-[1.6] sm:text-4xl sm:leading-[1.4]">{course.title}</h1>
            <p className="mt-5 text-sm font-medium leading-[2] text-slate-600 sm:text-base">{details.summary}</p>
            <p className="mt-4 text-xs font-semibold leading-[1.9] text-slate-500">عرض توضيحي ثابت، وليس إعلانًا عن دورة مفتوحة للتسجيل.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-l from-[#0B3766] to-[#147AA8] px-6 text-sm font-bold text-white hover:brightness-110">
                استفسر عن البرنامج <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href="/corporate#courses-section" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#0B3766]/15 bg-white px-6 text-sm font-bold text-[#0B3766] hover:bg-[#F3F9FE]">
                جميع البرامج
              </Link>
            </div>
          </article>
          <aside className="rounded-[2rem] border border-[#0B3766]/10 bg-white p-6 shadow-sm sm:p-8">
            <ClipboardList className="mb-4 h-10 w-10 rounded-xl bg-[#EAF7FD] p-2 text-[#0B3766]" />
            <h2 className="text-xl font-bold">الفئة المستهدفة</h2>
            <p className="mt-4 text-sm font-medium leading-[1.95] text-slate-600">{details.audience}</p>
            <p className="mt-5 border-t border-slate-100 pt-5 text-xs leading-[1.9] text-slate-500">
              المدة والتكلفة والمواعيد والشهادات تتحدد عند اعتماد البرنامج فعليًا.
            </p>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-[#0B3766]/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold"><CheckCircle2 className="h-6 w-6 text-[#168AD3]" /> مخرجات التعلّم المقترحة</h2>
          <ul className="space-y-4">
            {details.outcomes.map(outcome => (
              <li key={outcome} className="flex items-start gap-2 text-sm font-medium leading-[1.95] text-slate-600">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#168AD3]" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-[2rem] border border-[#0B3766]/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold"><BookOpen className="h-6 w-6 text-[#168AD3]" /> المحاور المقترحة</h2>
          <ol className="space-y-3">
            {details.sections.map((section, index) => (
              <li key={section} className="flex items-center gap-3 rounded-2xl bg-[#F4FAFE] p-4 text-sm font-semibold">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-[#0B3766]">{String(index + 1).padStart(2, "0")}</span>
                {section}
              </li>
            ))}
          </ol>
        </article>
      </section>

      {related.length > 0 && (
        <section className="border-t border-[#0B3766]/10 bg-white px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-xl font-bold sm:text-2xl">برامج مرتبطة</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map(item => (
                <Link key={item.slug} href={"/corporate/" + item.slug} className="rounded-2xl border border-slate-200 bg-[#F8FBFF] p-5 hover:border-[#168AD3]/40">
                  <h3 className="min-h-14 text-sm font-bold leading-[1.8]">{item.title}</h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#0D8495]">
                    التفاصيل <ArrowLeft className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
