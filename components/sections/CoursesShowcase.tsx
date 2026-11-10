"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ArrowLeft, Clock3, Heart, ShoppingCart, Check, LayoutGrid, BriefcaseBusiness, BarChart3, Laptop } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { usePublicCourses } from "@/lib/hooks/use-public-courses";

/** Homepage presentation cards only. Enrollment and actual course data stay in the live catalog. */
const homepageCourses = [
  {
    slug: "madar-quality",
    title: "إدارة الجودة وتحسين العمليات",
    description: "تعرّف إلى أدوات قياس الأداء، وتحليل الأسباب الجذرية، وبناء خطط تحسين قابلة للتطبيق داخل المؤسسات.",
    category: "management",
    categoryLabel: "الإدارة والجودة",
    image: "/images/blog/iso-risk-management.jpg",
    focus: "تطبيقات عملية",
  },
  {
    slug: "madar-data",
    title: "تحليل البيانات لاتخاذ القرار",
    description: "اكتشف كيف تحوّل البيانات إلى مؤشرات وتقارير واضحة تساعد فريقك على اتخاذ قرارات أدق.",
    category: "data",
    categoryLabel: "البيانات والتحليل",
    image: "/services/data.jpg",
    focus: "مهارات تحليلية",
  },
  {
    slug: "madar-teams",
    title: "التواصل الفعّال وإدارة فرق العمل",
    description: "طوّر مهارات الحوار المهني، وتوزيع المهام، وإدارة الاجتماعات والتحديات اليومية في العمل.",
    category: "management",
    categoryLabel: "القيادة والفرق",
    image: "/images/blog/pmp-management.jpg",
    focus: "مهارات قيادية",
  },
  {
    slug: "preview-cyber",
    title: "أساسيات الأمن السيبراني في بيئة العمل",
    description: "فهم التهديدات الرقمية الشائعة وطرق حماية الحسابات والملفات والبيانات المؤسسية.",
    category: "tech",
    categoryLabel: "التقنية والأمن",
    image: "/images/blog/osha-safety.jpg",
    focus: "مبادئ الحماية",
  },
  {
    slug: "preview-projects",
    title: "إدارة المشاريع من التخطيط إلى التنفيذ",
    description: "تعلّم تنظيم نطاق المشروع والجدول الزمني والمخاطر، ومتابعة تقدم العمل مع الفريق.",
    category: "management",
    categoryLabel: "إدارة المشاريع",
    image: "/services/consulting.jpg",
    focus: "إدارة احترافية",
  },
  {
    slug: "preview-ai",
    title: "الذكاء الاصطناعي والإنتاجية المهنية",
    description: "تعرّف إلى طرق استخدام أدوات الذكاء الاصطناعي في التخطيط والبحث وصياغة التقارير مع مراجعة النتائج بشريًا.",
    category: "tech",
    categoryLabel: "المهارات الرقمية",
    image: "/services/development.jpg",
    focus: "أدوات الذكاء الاصطناعي",
  },
  {
    slug: "preview-digital-marketing",
    title: "التسويق الرقمي وقياس أداء الحملات",
    description: "تعلّم بناء خطة محتوى، وتحديد الجمهور المناسب، وقراءة مؤشرات الحملات لتحسين القرارات التسويقية.",
    category: "management",
    categoryLabel: "التسويق والأعمال",
    image: "/services/marketing.jpg",
    focus: "مؤشرات الأداء",
  },
  {
    slug: "preview-ux-design",
    title: "أساسيات تجربة المستخدم وتصميم الواجهات",
    description: "استكشف البحث عن احتياجات المستخدمين، وتنظيم الشاشات، واختبار سهولة الاستخدام بأسلوب عملي.",
    category: "tech",
    categoryLabel: "التصميم الرقمي",
    image: "/services/uiux.jpg",
    focus: "تجربة المستخدم",
  },
  {
    slug: "preview-business-writing",
    title: "كتابة التقارير والعروض المهنية",
    description: "طوّر مهارات صياغة التقارير المختصرة، وعرض النتائج، وبناء توصيات واضحة قابلة للتنفيذ.",
    category: "data",
    categoryLabel: "التواصل المهني",
    image: "/services/writing.jpg",
    focus: "تقارير احترافية",
  },
] as const;

const filters = [
  {key:"all", label:"جميع التخصصات", mobileLabel:"الكل", icon:LayoutGrid},
  {key:"management", label:"الإدارة والقيادة", mobileLabel:"الإدارة", icon:BriefcaseBusiness},
  {key:"data", label:"البيانات والتحليل", mobileLabel:"البيانات", icon:BarChart3},
  {key:"tech", label:"التقنية والتصميم", mobileLabel:"التقنية", icon:Laptop},
] as const;

export default function CoursesShowcase() {
  const [filter, setFilter] = useState<string>("all");
  const { courses: publishedCourses } = usePublicCourses();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const publishedBySlug = new Map(publishedCourses.map(course => [course.slug, course]));
  const visible = homepageCourses.filter(course => filter === "all" || course.category === filter);
  return (
    <section className="relative border-b border-slate-100 bg-white py-16 sm:py-24" aria-labelledby="home-courses-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
          <span className="mb-4 inline-flex rounded-full border border-[#0B3766]/15 bg-[#0B3766]/5 px-5 py-2 text-xs font-semibold text-[#0B3766]">أحدث دورات المدار</span>
          <h2 id="home-courses-heading" className="section-main-title-premium mb-4">
            استثمر في مهاراتك، وابدأ <span className="gradient-text">الخطوة القادمة</span>
          </h2>
          <p className="section-desc-premium mx-auto max-w-2xl">
            برامج في الإدارة والتقنية وتحليل البيانات، مع أمثلة تطبيقية مرتبطة باحتياجات سوق العمل.
          </p>
          <p className="mt-2 text-xs text-slate-500">9 مسارات للتعرّف على تخصصات المدار؛ التسجيل متاح للدورات المنشورة فقط.</p>
        </div>
        <div className="mb-9 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-2.5" role="group" aria-label="تصفية الدورات حسب التخصص">
          {filters.map(f => {
            const Icon = f.icon;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={active}
                className={`inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-[11px] font-bold transition-all sm:min-h-0 sm:rounded-full sm:px-4 sm:text-sm ${f.key === "all" ? "col-span-3 sm:col-auto" : ""} ${active ? "border-[#0B3766] bg-[#0B3766] text-white shadow-md shadow-[#0B3766]/15" : "border-[#0B3766]/10 bg-[#F5FAFE] text-[#0B3766] hover:border-[#168AD3]/50 hover:bg-[#E8F5FC]"}`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={1.85} aria-hidden="true" />
                <span className="sm:hidden">{f.mobileLabel}</span>
                <span className="hidden sm:inline">{f.label}</span>
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((course,i)=>{
            const catalogCourse = publishedBySlug.get(course.slug);
            const published = Boolean(catalogCourse);
            const isFavorited = catalogCourse ? isInWishlist(catalogCourse.id) : false;
            const inCart = catalogCourse ? isInCart(catalogCourse.id) : false;
            const href=published?`/courses/${course.slug}`:"/courses";
            return (
              <motion.article key={course.slug} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.42,delay:Math.min(i,3)*0.05}}
                className="group flex h-full flex-col pf-card-equal overflow-hidden rounded-[1.6rem] border border-[#0B3766]/15 bg-white shadow-[0_14px_38px_-16px_rgba(11,55,102,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-[#19B6C7]/45 hover:shadow-[0_22px_48px_-17px_rgba(11,55,102,0.18)]">
                <div className="relative">
                  <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-slate-100" aria-label={`استكشف: ${course.title}`}>
                  <img src={course.image} alt={`صورة توضيحية لدورة ${course.title}`} loading="lazy" decoding="async" className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"/>
                  <span className="absolute right-4 top-4 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#0B3766] backdrop-blur-lg">{course.categoryLabel}</span>
                  </Link>
                  <button
                    type="button"
                    disabled={!published}
                    onClick={() => { if (catalogCourse) toggleWishlist(catalogCourse); }}
                    title={!published ? "المفضلة غير متاحة لدورات المعاينة" : isFavorited ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                    aria-label={!published ? "المفضلة غير متاحة لدورات المعاينة" : isFavorited ? "إزالة الدورة من المفضلة" : "إضافة الدورة إلى المفضلة"}
                    aria-pressed={published ? isFavorited : undefined}
                    className={isFavorited
                      ? "absolute left-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-rose-500 text-white shadow-lg transition-transform active:scale-95"
                      : "absolute left-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/80 bg-white/95 text-[#0B3766] shadow-lg backdrop-blur-md transition-colors hover:bg-[#EAF7FD] hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-60"}
                  >
                    <Heart className="h-[18px] w-[18px]" fill={isFavorited ? "currentColor" : "none"} aria-hidden="true" />
                  </button>
                </div>
                <div className="flex flex-1 flex-col px-5 pb-5 pt-5 sm:px-6">
                  <div className="mb-3 flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-[#19B6C7]"/>{course.focus}</span>
                    <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-[#19B6C7]"/>تعلم مرن</span>
                  </div>
                  <h3 className="mb-3 line-clamp-2 text-[1rem] font-bold leading-[1.7] text-[#0B3766] transition-colors group-hover:text-[#168AD3] sm:text-[1.1rem] sm:leading-[1.55]">
                    <Link href={href}>{course.title}</Link>
                  </h3>
                  <p className="mb-5 line-clamp-3 flex-1 text-[0.875rem] font-medium leading-[1.95] text-slate-600 sm:text-[0.91rem] sm:leading-[1.85]">{course.description}</p>
                  <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-[#0B3766]/10 bg-[#F3F9FE] px-4 py-2.5">
                    <span className="text-xs font-medium text-slate-500">{published ? "رسوم الدورة" : "حالة الدورة"}</span>
                    <span className="text-sm font-bold text-[#0B3766] pf-tabular-nums">
                      {!catalogCourse ? "للمعاينة فقط" : catalogCourse.price > 0 ? (
                        <>{Number(catalogCourse.price).toLocaleString("en-US")} {catalogCourse.currency || "ر.س"}</>
                      ) : "مجانية"}
                    </span>
                  </div>
                  <div className="flex items-stretch gap-2 pf-card-equal__cta">
                    <Link href={href} className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#0B3766]/15 bg-[#0B3766]/[0.055] px-2.5 py-3 text-center text-[12px] font-bold text-[#0B3766] transition-colors hover:bg-[#0B3766] hover:text-white sm:px-4 sm:text-sm">
                      {published ? "التفاصيل" : "استعرض الدورات"}
                      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </Link>
                    {catalogCourse && (
                      <Link href={"/checkout?slug=" + encodeURIComponent(catalogCourse.slug)} className="inline-flex min-w-0 flex-1 items-center justify-center rounded-xl bg-gradient-to-l from-[#0B3766] to-[#0B6589] px-2.5 py-3 text-center text-[12px] font-bold text-white shadow-sm transition-all hover:brightness-110 sm:px-4 sm:text-sm">
                        {catalogCourse.price > 0 ? "اشترك الآن" : "سجّل مجاناً"}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => { if (catalogCourse) addToCart(catalogCourse); }}
                      disabled={!published}
                      title={!published ? "السلة غير متاحة لدورات المعاينة" : inCart ? "عرض السلة" : "إضافة إلى السلة"}
                      aria-label={!published ? "السلة غير متاحة لدورات المعاينة" : inCart ? "عرض الدورة في السلة" : "إضافة الدورة إلى السلة"}
                      className={inCart
                        ? "grid h-[45px] w-[45px] shrink-0 place-items-center rounded-xl border border-[#0B3766] bg-[#0B3766] text-white transition-colors"
                        : "grid h-[45px] w-[45px] shrink-0 place-items-center rounded-xl border border-[#0B3766]/20 bg-white text-[#0B3766] transition-colors hover:border-[#168AD3] hover:bg-[#EAF7FD] disabled:cursor-not-allowed disabled:opacity-45"}
                    >
                      {inCart ? <Check className="h-[18px] w-[18px]" aria-hidden="true" /> : <ShoppingCart className="h-[18px] w-[18px]" aria-hidden="true" />}
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
        <div className="mt-11 text-center">
          <Link href="/courses" className="inline-flex items-center gap-2 rounded-full bg-[#0B3766] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#168AD3]">
            عرض جميع الدورات المنشورة <ArrowLeft className="h-4 w-4"/>
          </Link>
        </div>
      </div>
    </section>
  );
}
