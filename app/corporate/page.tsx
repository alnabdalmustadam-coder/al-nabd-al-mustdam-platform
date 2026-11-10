"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Search, ArrowLeft, Building2, ChevronDown,
  Users, BarChart3, Award, Shield, Globe, Target,
  Phone, Layers, Rocket, TrendingUp, BookOpen, Headphones,
  LayoutGrid, Laptop, FileText, BriefcaseBusiness, GraduationCap
} from "lucide-react";
import { corporateCourses, corporateCategories } from "@/data/corporateCourses";
import CorporateCourseCard from "@/components/ui/CorporateCourseCard";
import Button from "@/components/ui/Button";

/* ─── Stats Counter ──────────────────────────────── */
function AnimatedCounter({ end, suffix = "", duration = 1800 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Original Benefits (Clean Home Palette) ───────────────────────── */
const benefits = [
  { icon: Users, title: "تدريب مخصص", desc: "برامج مصممة خصيصاً لاحتياجات فريقك ومتطلبات مؤسستك بمرونة تامة." },
  { icon: BarChart3, title: "تقارير أداء تفصيلية", desc: "لوحة تحكم شاملة لقياس تقدم المتدربين وتقييم العائد على الاستثمار." },
  { icon: Award, title: "شهادات إتمام", desc: "شهادات رسمية معتمدة لكل متدرب تعزز ملفه المهني وخبراته." },
  { icon: Shield, title: "دعم فني مستمر", desc: "مدير حساب مخصص ودعم فني متواصل على مدار الساعة لضمان نجاح التدريب." },
  { icon: Globe, title: "تدريب عن بعد", desc: "إمكانية التدريب حضورياً أو عن بُعد بنفس الجودة والفعالية." },
  { icon: Target, title: "أهداف قابلة للقياس", desc: "نضع أهدافاً واضحة وقابلة للقياس لكل برنامج تدريبي مع تقييم شامل." },
];

/* ─── Original Process Steps ───────────────────────── */
const steps = [
  { num: "01", title: "التواصل والتحليل", desc: "تواصل معنا لمناقشة احتياجاتك التدريبية وتحليل متطلبات فريقك بدقة.", icon: Phone },
  { num: "02", title: "تصميم البرنامج", desc: "نصمم برنامجاً تدريبياً مخصصاً يتناسب مع أهداف ورؤية مؤسستك.", icon: Layers },
  { num: "03", title: "تنفيذ التدريب", desc: "تنفيذ البرنامج مع نخبة المدربين المعتمدين باستخدام أحدث المنهجيات.", icon: Rocket },
  { num: "04", title: "التقييم والمتابعة", desc: "تقارير أداء شاملة وقياس أثر التدريب مع متابعة مستمرة لضمان النتائج.", icon: TrendingUp },
];

/* ─── Original Stats ───────────────────────── */
const stats = [
  { value: 76, suffix: "", label: "برنامجًا للعرض", icon: BookOpen },
  { value: 6, suffix: "", label: "تخصصات تدريبية", icon: Layers },
  { value: 4, suffix: "", label: "مراحل للتدريب", icon: TrendingUp },
];

const categoryTabIcons: Record<string, any> = {
  all: LayoutGrid,
  tech: Laptop,
  admin: FileText,
  management: BriefcaseBusiness,
  marketing: BarChart3,
  "soft-skills": Users,
  general: GraduationCap,
};

export default function CorporatePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const filtered = corporateCourses.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || c.category === category;
    return matchSearch && matchCat;
  });

  const displayedCourses = showAll ? filtered : filtered.slice(0, 12);
  const hasMore = filtered.length > 12;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-[#EEF4F9]/50 to-[#FFFFFF] pb-24 overflow-x-clip font-[family-name:var(--font-cairo)]">

      {/* ═══════════════════════════════════════ HERO SECTION ═══════════════════════════════════════ */}
      <section className="relative pt-24 sm:pt-30 pb-14 sm:pb-18 overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden z-0">
          <img src="/bg.webp" alt="" className="w-full h-full object-cover" />
        </div>

        {/* Ambient Brand Glows */}
        <div className="absolute -top-24 -right-20 w-[500px] h-[500px] bg-[#0B3766]/[0.07] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-[450px] h-[450px] bg-[#19B6C7]/[0.06] rounded-full blur-[140px] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
          
          {/* Main Glassmorphic Card — Clean & Light */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-full bg-white/75 backdrop-blur-[35px] border border-white/90 shadow-[0_20px_60px_-15px_rgba(11,55,102,0.1)] rounded-[2rem] sm:rounded-[2.5rem] p-7 sm:p-10 lg:p-12 overflow-hidden"
          >
            {/* Top accent hairline */}
            <div className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-transparent via-[#168AD3] to-transparent opacity-70" />

            <div className="relative z-10 text-center">
              {/* Badge */}
              <div className="mb-4">
                <span className="section-badge-glass inline-flex items-center gap-1.5 px-4 py-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#19B6C7]" />
                  حلول الشركات والمؤسسات
                </span>
              </div>

              {/* Title — Balanced, not oversized */}
              <h1 className="section-main-title-premium text-2xl sm:text-3xl lg:text-4xl mb-3.5 text-[#0B3766] leading-[1.35]">
                طوّر <span className="gradient-text">فريقك</span> مع أحدث دورات <span className="gradient-text">المؤسسات</span>
              </h1>

              {/* Hairline underline */}
              <div className="w-16 h-[2px] mx-auto bg-gradient-to-r from-[#0B3766] to-[#168AD3] rounded-full mb-4" />

              {/* Refined Description */}
              <p className="section-desc-premium max-w-xl mx-auto mb-7 text-sm sm:text-base lg:text-[17px] text-slate-600 leading-relaxed">
                اكتشف <span className="text-[#0B3766] font-bold">76</span> عنواناً تدريبياً للعرض في مجالات التقنية والإدارة والمهارات المهنية، مصممة لتأهيل الكوادر وتطوير الأداء المؤسسي.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Button href="/contact" size="md" className="px-7 py-3 font-bold border border-white/20 transition-transform hover:scale-[1.02] whitespace-nowrap text-sm sm:text-base shadow-md shadow-[#168AD3]/20">
                  تواصل لبدء التدريب
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                </Button>
                <Button href="#courses-section" variant="secondary" size="md" className="px-7 py-3 font-bold bg-white/90 backdrop-blur-md border border-slate-200/80 transition-transform hover:scale-[1.02] whitespace-nowrap text-sm sm:text-base text-[#0B3766]">
                  استعرض الدورات
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Card — Light & Proportional */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="w-full max-w-3xl mt-5 relative bg-white/70 backdrop-blur-[25px] border border-white/90 shadow-[0_12px_35px_-10px_rgba(11,55,102,0.08)] rounded-[1.25rem] sm:rounded-[1.5rem] p-3.5 sm:p-4 transition-all duration-400 overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-0">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className={`flex flex-col items-center gap-1 text-center px-2 py-1 ${
                    i < stats.length - 1 ? "border-l border-slate-200/70" : ""
                  }`}>
                    <div className="w-8 h-8 shrink-0 rounded-xl bg-white/90 flex items-center justify-center shadow-2xs border border-white/90">
                      <Icon className="w-4 h-4 text-[#0B3766]" strokeWidth={1.8} />
                    </div>
                    <span className="hero-stat-number text-base sm:text-xl text-[#0B3766] font-bold leading-tight tabular-nums">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-500 font-bold">{stat.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Section Bottom Hairline */}
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center justify-end h-10">
          <div className="w-[85%] md:w-[92%] h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════ COURSES SECTION ═══════════════════════════════════════ */}
      <section id="courses-section" className="pt-8 sm:pt-12 pb-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="text-center mb-8">
            <span className="section-badge-glass mb-2.5 inline-flex items-center gap-1.5 px-4 py-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#19B6C7]" />
              كتالوج الدورات
            </span>
            <h2 className="section-main-title-premium text-2xl sm:text-3xl lg:text-4xl text-[#0B3766]">
              اكتشف <span className="gradient-text">دوراتنا</span> التدريبية
            </h2>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="liquid-glass-card rounded-[1.5rem] p-2.5 sm:p-3 flex items-center gap-3 border border-white/90 shadow-[0_8px_30px_rgba(11,55,102,0.06)] bg-white/90">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#0B3766]/50" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن دورة لفريقك..."
                  className="w-full pr-11 pl-4 py-2.5 rounded-xl bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none text-xs sm:text-sm font-semibold"
                />
              </div>
              <div className="shrink-0 bg-[#0B3766]/[0.07] text-[#0B3766] px-4 py-2 rounded-xl text-xs font-bold">
                {filtered.length} دورة
              </div>
            </div>
          </div>

          {/* Horizontal Category Pill Tabs with Icons (Light & Elegant like Home) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-10" role="group" aria-label="تصنيفات الدورات">
            {corporateCategories.map((cat) => {
              const Icon = categoryTabIcons[cat.key] || BriefcaseBusiness;
              const active = category === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-[13px] font-bold transition-all duration-300 cursor-pointer ${
                    active
                      ? "bg-[#0B3766] text-white shadow-sm border border-[#0B3766]"
                      : "bg-white text-slate-600 hover:text-[#0B3766] hover:bg-[#F3F9FE] border border-slate-200/80 shadow-2xs"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-[#19B6C7]" : "text-[#0B3766]"}`} strokeWidth={2} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Course Grid: 3-column layout matching Home */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto p-8">
              <div className="w-16 h-16 bg-[#0B3766]/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[#0B3766]/40" />
              </div>
              <h3 className="card-title-royal-blue text-xl mb-2 text-[#0B3766]">لا توجد دورات مطابقة</h3>
              <p className="text-sm text-slate-500 mb-6">لم نتمكن من العثور على دورات تطابق بحثك الحالي، يرجى المحاولة بكلمات أخرى.</p>
              <button 
                onClick={() => { setSearch(""); setCategory("all"); }}
                className="px-6 py-2.5 bg-[#0B3766] text-white text-xs font-bold rounded-xl hover:bg-[#168AD3] transition-colors cursor-pointer"
              >
                مسح الفلاتر وإعادة البحث
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {displayedCourses.map((c) => (
                  <CorporateCourseCard key={c.id} course={c} />
                ))}
              </div>

              {/* Show More / Show Less */}
              {hasMore && (
                <div className="mt-10 text-center">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="inline-flex items-center gap-2.5 px-8 py-3 bg-white border border-[#0B3766]/20 text-[#0B3766] font-bold text-sm rounded-full hover:bg-[#0B3766] hover:text-white hover:border-[#0B3766] shadow-2xs hover:shadow-sm transition-all duration-300 cursor-pointer"
                  >
                    <span>{showAll ? "عرض أقل" : `عرض جميع الدورات (${filtered.length})`}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAll ? "rotate-180" : ""}`} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════ BENEFITS SECTION ═══════════════════════════════════════ */}
      <section className="py-20 bg-white border-y border-slate-100 relative overflow-hidden" id="benefits">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <span className="section-badge-glass mb-2.5 inline-flex items-center gap-1.5 px-4 py-1.5">
              <Award className="w-3.5 h-3.5 text-[#19B6C7]" />
              مزايا الشراكة
            </span>
            <h2 className="section-main-title-premium text-2xl sm:text-3xl lg:text-4xl text-[#0B3766]">
              لماذا تختار <span className="gradient-text">تدريبنا</span>؟
            </h2>
            <p className="section-desc-premium mt-2 max-w-xl mx-auto text-sm sm:text-base text-slate-600">
              نوفر لك تجربة تدريبية متكاملة مصممة لتحقيق أقصى عائد على استثمارك في تطوير الكوادر.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className="group relative bg-[#F8FAFC] border border-slate-200/80 rounded-[1.75rem] p-7 shadow-2xs hover:shadow-sm hover:border-[#168AD3]/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#0B3766]/10 flex items-center justify-center mb-5 group-hover:scale-105 transition-all shadow-2xs">
                    <Icon className="w-6 h-6 text-[#0B3766] group-hover:text-[#168AD3] transition-colors" strokeWidth={1.8} />
                  </div>
                  <h3 className="card-title-royal-blue text-lg font-bold mb-2 text-[#0B3766]">{b.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ PROCESS STEPS ═══════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden" id="process">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <span className="section-badge-glass mb-2.5 inline-flex items-center gap-1.5 px-4 py-1.5">
              <Rocket className="w-3.5 h-3.5 text-[#19B6C7]" />
              آلية العمل
            </span>
            <h2 className="section-main-title-premium text-2xl sm:text-3xl lg:text-4xl text-[#0B3766]">
              كيف <span className="gradient-text">نعمل</span>؟
            </h2>
            <p className="section-desc-premium mt-2 max-w-md mx-auto text-sm sm:text-base text-slate-600">
              أربع خطوات بسيطة لتحويل أداء فريقك
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="group relative bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-[1.75rem] p-6 shadow-2xs hover:shadow-sm transition-all duration-300 hover:-translate-y-1 text-center"
                >
                  <div className="w-8 h-8 mx-auto mb-4 rounded-full bg-[#0B3766]/[0.08] flex items-center justify-center text-xs font-bold text-[#0B3766]">
                    {s.num}
                  </div>
                  <div className="w-13 h-13 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0B3766] to-[#168AD3] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" strokeWidth={1.8} />
                  </div>
                  <h3 className="card-title-royal-blue text-base font-bold mb-2 text-[#0B3766]">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ CTA SECTION ═══════════════════════════════════════ */}
      <section className="py-16 relative overflow-hidden" id="cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="relative bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_20px_50px_-15px_rgba(11,55,102,0.1)] rounded-[2.5rem] p-8 sm:p-12 text-center overflow-hidden">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#0B3766]/[0.07] border border-[#0B3766]/10 flex items-center justify-center">
              <Headphones className="w-8 h-8 text-[#0B3766]" strokeWidth={1.5} />
            </div>

            <h2 className="section-main-title-premium text-2xl sm:text-3xl lg:text-4xl mb-3 text-[#0B3766]">
              هل أنت مستعد لتطوير <span className="gradient-text">فريقك</span>؟
            </h2>

            <p className="section-desc-premium mb-8 text-sm sm:text-base max-w-xl mx-auto text-slate-600">
              تواصل معنا اليوم واحصل على عرض مخصص لمؤسستك يتناسب مع احتياجاتك الخاصة وميزانيتك.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/contact" className="bg-gradient-to-r from-[#0B3766] to-[#168AD3] text-white hover:brightness-105 shadow-sm px-8 py-3.5 font-bold text-sm sm:text-base rounded-xl">
                طلب عرض سعر
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              </Button>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 text-slate-700 hover:text-[#0B3766] font-bold text-sm px-5 py-3 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors"
              >
                <span>استفسر عن برنامج</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
