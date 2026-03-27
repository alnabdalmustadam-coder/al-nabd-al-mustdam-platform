"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Search, SlidersHorizontal, ArrowLeft, Building2, X, Sparkles,
  Users, BarChart3, Award, Shield, MessageSquare, GraduationCap,
  TrendingUp, ChevronDown, Zap, Globe, BookOpen, Send, MapPin,
  Star, Phone, Mail, Target, Layers, Rocket, Headphones, Clock
} from "lucide-react";
import { corporateCourses, corporateCategories } from "@/data/corporateCourses";
import CorporateCourseCard from "@/components/ui/CorporateCourseCard";
import Button from "@/components/ui/Button";

/* ─── Stats Counter ──────────────────────────────── */
function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
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

/* ─── Data ──────────────────────────────── */
const benefits = [
  { icon: Users, title: "تدريب مخصص", desc: "برامج مصممة خصيصاً لاحتياجات فريقك ومتطلبات مؤسستك بمرونة تامة.", bg: "from-blue-50 to-indigo-50" },
  { icon: BarChart3, title: "تقارير أداء تفصيلية", desc: "لوحة تحكم شاملة لقياس تقدم المتدربين وتقييم العائد على الاستثمار.", bg: "from-emerald-50 to-teal-50" },
  { icon: Award, title: "شهادات معتمدة", desc: "شهادات رسمية معتمدة لكل متدرب تعزز ملفه المهني وخبراته.", bg: "from-amber-50 to-orange-50" },
  { icon: Shield, title: "دعم فني مستمر", desc: "مدير حساب مخصص ودعم فني متواصل على مدار الساعة لضمان نجاح التدريب.", bg: "from-violet-50 to-purple-50" },
  { icon: Globe, title: "تدريب عن بعد", desc: "إمكانية التدريب حضورياً أو عن بُعد بنفس الجودة والفعالية.", bg: "from-cyan-50 to-blue-50" },
  { icon: Target, title: "أهداف قابلة للقياس", desc: "نضع أهدافاً واضحة وقابلة للقياس لكل برنامج تدريبي مع تقييم شامل.", bg: "from-rose-50 to-pink-50" },
];

const steps = [
  { num: "01", title: "التواصل والتحليل", desc: "تواصل معنا لمناقشة احتياجاتك التدريبية وتحليل متطلبات فريقك بدقة.", icon: Phone },
  { num: "02", title: "تصميم البرنامج", desc: "نصمم برنامجاً تدريبياً مخصصاً يتناسب مع أهداف ورؤية مؤسستك.", icon: Layers },
  { num: "03", title: "تنفيذ التدريب", desc: "تنفيذ البرنامج مع نخبة المدربين المعتمدين باستخدام أحدث المنهجيات.", icon: Rocket },
  { num: "04", title: "التقييم والمتابعة", desc: "تقارير أداء شاملة وقياس أثر التدريب مع متابعة مستمرة لضمان النتائج.", icon: TrendingUp },
];

const stats = [
  { value: 76, suffix: "+", label: "دورة تدريبية", icon: BookOpen },
  { value: 200, suffix: "+", label: "مؤسسة مستفيدة", icon: Building2 },
  { value: 5000, suffix: "+", label: "متدرب", icon: GraduationCap },
  { value: 98, suffix: "%", label: "نسبة الرضا", icon: Star },
];

const trustedLogos = [
  "أرامكو", "سابك", "الراجحي", "STC", "نيوم", "أكوا باور",
  "مرافق", "الأهلي", "البلاد", "الإنماء", "رؤية ٢٠٣٠", "هدف",
];

export default function CorporatePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  let filtered = corporateCourses.filter((c) => {
    const matchSearch = !search || c.title.includes(search);
    const matchCat = category === "all" || c.category === category;
    return matchSearch && matchCat;
  });

  const displayedCourses = showAll ? filtered : filtered.slice(0, 12);
  const hasMore = filtered.length > 12;

  return (
    <div className="min-h-screen bg-white">

      {/* ═══════════════════════════════════════ HERO — LIGHT THEME ═══════════════════════════════════════ */}
      <section className="relative h-screen max-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-50 pt-24 pb-0">

        {/* Particle Grid */}
        <div className="particles-grid opacity-60" />

        {/* bg.webp background ornament */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none overflow-hidden z-0">
          <img src="/bg.webp" alt="" className="w-full h-full object-cover" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center py-4 lg:py-6">
          
          {/* Main Glassmorphic Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative w-full bg-white/50 backdrop-blur-[50px] border border-white/50 shadow-[0_40px_100px_-20px_rgba(23,58,124,0.18)] rounded-[2rem] sm:rounded-[2.5rem] p-7 sm:p-10 lg:p-12 overflow-hidden transition-all duration-700 hover:shadow-[0_50px_120px_-20px_rgba(23,58,124,0.22)] group"
          >
            {/* Top accent gradient bar */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#5CB07C] to-transparent opacity-60" />
            
            {/* Glass top highlight */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/70 to-transparent pointer-events-none rounded-t-[2rem] sm:rounded-t-[2.5rem]" />
            
            {/* Corner decorative accents */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#5CB07C]/[0.06] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#173A7C]/[0.06] rounded-full blur-3xl pointer-events-none" />
            
            {/* Subtle shimmer on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

            <div className="relative z-10 text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-6"
              >
                <span className="inline-flex items-center gap-2.5 text-[#5CB07C] text-xs sm:text-sm font-bold tracking-wide bg-white/80 shadow-[0_4px_15px_-3px_rgba(92,176,124,0.15)] border border-[#5CB07C]/10 px-5 py-2 rounded-full backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5CB07C] shadow-[0_0_8px_rgba(92,176,124,0.6)] animate-pulse" />
                  حلول الشركات والمؤسسات
                </span>
              </motion.div>

              {/* Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="mb-5"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#173A7C]/[0.06] to-[#5CB07C]/[0.06] border border-[#173A7C]/[0.08] flex items-center justify-center shadow-sm">
                  <Building2 className="w-8 h-8 text-[#173A7C]" strokeWidth={1.5} />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-black text-slate-900 mb-5 leading-[1.2] drop-shadow-sm tracking-tight"
              >
                طوّر <span className="gradient-text">فريقك</span> مع أحدث
                <br className="hidden sm:block" />
                دورات <span className="gradient-text">المؤسسات</span>
              </motion.h1>

              {/* Decorative line under title */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="w-20 h-[2px] mx-auto bg-gradient-to-r from-[#173A7C] to-[#5CB07C] rounded-full mb-5"
              />

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-slate-600 max-w-xl mx-auto mb-8 text-sm sm:text-base lg:text-lg leading-[1.8] font-medium"
              >
                نقدم أكثر من <span className="text-[#173A7C] font-bold">70</span> برنامج تدريبي متخصص يهدف إلى رفع كفاءة فريق العمل في مختلف المجالات الإدارية، التقنية، وتطوير الذات.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
              >
                <Button href="/contact" size="md" className="px-8 py-3.5 font-bold border border-white/20 transition-transform hover:scale-[1.02] whitespace-nowrap text-base shadow-lg shadow-[#5CB07C]/20">
                  تواصل لبدء التدريب
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button href="#courses-section" variant="secondary" size="md" className="px-8 py-3.5 font-bold bg-white/80 backdrop-blur-md border border-slate-200/60 transition-transform hover:scale-[1.02] whitespace-nowrap text-base">
                  استعرض الدورات
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Card — Glassmorphic */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="w-full max-w-3xl mt-5 relative bg-white/50 backdrop-blur-[50px] border border-white/50 shadow-[0_20px_60px_-10px_rgba(23,58,124,0.12)] rounded-[1.25rem] sm:rounded-[1.5rem] p-4 sm:p-5 transition-all duration-700 hover:shadow-[0_30px_70px_-10px_rgba(23,58,124,0.2)] hover:-translate-y-0.5 group overflow-hidden"
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#173A7C]/20 to-transparent" />
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/60 to-transparent pointer-events-none rounded-t-[1.25rem] sm:rounded-t-[1.5rem]" />

            <div className="relative z-10 grid grid-cols-4 gap-0">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className={`flex flex-col items-center gap-1.5 text-center px-2 py-1.5 ${
                    i < stats.length - 1 ? "border-l border-black/[0.06]" : ""
                  }`}>
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-white/80 flex items-center justify-center shadow-sm border border-white/90 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                      <Icon className="w-5 h-5 text-[#173A7C]" strokeWidth={1.8} />
                    </div>
                    <span className="text-lg sm:text-2xl font-black text-slate-900 leading-tight drop-shadow-sm tabular-nums">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </span>
                    <span className="text-[9px] sm:text-[11px] text-slate-500 font-bold tracking-wide">{stat.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Decorative Bottom Divider — same as home */}
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center justify-end h-32 lg:h-20 xl:h-24">
          <div className="absolute bottom-0 left-0 w-full h-[80px] bg-gradient-to-b from-transparent to-white/90" />
          <div className="relative w-full z-20">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/60 to-transparent"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] md:w-[80%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/80 to-transparent blur-[1px]"></div>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-200/50"></div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ COURSES SECTION ═══════════════════════════════════════ */}
      <section id="courses-section" className="bg-slate-50/50 pt-16 pb-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 text-[#173A7C] text-sm font-bold tracking-wider uppercase bg-[#173A7C]/[0.06] px-5 py-2 rounded-full mb-4">
              <BookOpen className="w-4 h-4 text-[#5CB07C]" />
              كتالوج الدورات
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              اكتشف <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">دوراتنا</span> التدريبية
            </h2>
          </motion.div>

          {/* Search + Controls Card */}
          <div className="mb-10">
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-[0_15px_40px_-15px_rgba(23,58,124,0.1)] rounded-[1.75rem] p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#173A7C]/50" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن دورة لفريقك..."
                  className="w-full pr-14 pl-5 py-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-slate-900 placeholder:text-slate-400 focus:border-[#5CB07C] focus:ring-2 focus:ring-[#5CB07C]/20 outline-none transition-all text-base font-medium"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white px-6 py-3.5 rounded-2xl font-black flex items-center justify-center min-w-[120px] shadow-lg shadow-[#173A7C]/20 text-sm">
                  {filtered.length} دورة
                </div>

                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  aria-label="فتح الفلاتر"
                  className="lg:hidden p-3.5 rounded-2xl bg-[#173A7C]/[0.06] border border-[#173A7C]/10 text-[#173A7C] hover:bg-[#173A7C]/10 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Sidebar Filters — Desktop */}
            <aside className="hidden lg:block w-72 shrink-0 sticky top-28 self-start">
              <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7">
                <h3 className="text-lg font-black text-[#173A7C] mb-6 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#173A7C]/[0.06] flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4 text-[#173A7C]" />
                  </div>
                  تصنيفات الدورات
                </h3>
                <div className="space-y-2">
                  {corporateCategories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setCategory(cat.key)}
                      className={`w-full text-right px-5 py-3.5 rounded-2xl text-[14px] font-bold transition-all duration-300 cursor-pointer flex justify-between items-center group ${
                        category === cat.key
                          ? "bg-gradient-to-l from-[#173A7C] to-[#1E4D9D] text-white shadow-lg shadow-[#173A7C]/20 scale-[1.02]"
                          : "text-slate-600 hover:text-[#173A7C] hover:bg-[#173A7C]/[0.04]"
                      }`}
                    >
                      <span>{cat.label}</span>
                      {category === cat.key && <span className="w-2 h-2 rounded-full bg-[#5CB07C] shadow-[0_0_8px_rgba(92,176,124,0.8)]" />}
                    </button>
                  ))}
                </div>

                {/* Quick Stats in Sidebar */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="bg-gradient-to-br from-[#173A7C]/[0.04] to-[#5CB07C]/[0.04] rounded-2xl p-5 text-center">
                    <div className="text-3xl font-black text-[#173A7C] mb-1">76+</div>
                    <div className="text-xs font-bold text-slate-500">دورة تدريبية متاحة</div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile Filters Bottom Sheet */}
            <AnimatePresence>
              {filtersOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] lg:hidden"
                >
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
                  <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-200 rounded-t-[2.5rem] p-7 md:p-10 max-h-[85vh] overflow-y-auto shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-8 sticky top-0 bg-white pt-2 pb-4 z-10">
                      <h3 className="text-2xl font-black text-[#173A7C]">تصفية الدورات</h3>
                      <button onClick={() => setFiltersOpen(false)} aria-label="إغلاق الفلاتر" className="text-slate-400 hover:text-red-500 cursor-pointer p-3 bg-slate-50 hover:bg-red-50 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 mb-5">التصنيفات</h4>
                    <div className="flex flex-col gap-3 pb-8">
                      {corporateCategories.map((cat) => (
                        <button
                          key={cat.key}
                          onClick={() => { setCategory(cat.key); setFiltersOpen(false); }}
                          className={`px-6 py-4 rounded-2xl text-base font-bold transition-all cursor-pointer text-right flex justify-between items-center ${
                            category === cat.key ? "bg-gradient-to-l from-[#173A7C] to-[#1E4D9D] text-white shadow-lg shadow-[#173A7C]/20" : "bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100"
                          }`}
                        >
                           {cat.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Course Grid */}
            <div className="flex-1 w-full relative">
              {filtered.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-28 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center p-8"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-[#173A7C]/5 to-[#5CB07C]/5 rounded-full flex items-center justify-center mb-6">
                    <Search className="w-12 h-12 text-[#173A7C]/30" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3">لا توجد دورات مطابقة</h3>
                  <p className="text-slate-500 text-lg font-medium max-w-md">لم نتمكن من العثور على دورات تطابق بحثك الحالي، يرجى المحاولة بكلمات أخرى.</p>
                  <button 
                    onClick={() => { setSearch(""); setCategory("all"); }}
                    className="mt-8 px-8 py-3 bg-slate-100 text-[#173A7C] font-bold rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    مسح الفلاتر وإعادة البحث
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                    <AnimatePresence mode="popLayout">
                      {displayedCourses.map((c, i) => (
                        <motion.div
                          key={c.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
                          className="h-full"
                        >
                          <CorporateCourseCard course={c} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Show More / Less Button */}
                  {hasMore && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-10 text-center"
                    >
                      <button
                        onClick={() => setShowAll(!showAll)}
                        className="group inline-flex items-center gap-3 px-10 py-4 bg-white border-2 border-[#173A7C]/10 text-[#173A7C] font-black text-base rounded-2xl hover:border-[#173A7C]/30 hover:shadow-lg hover:shadow-[#173A7C]/5 transition-all duration-300 cursor-pointer"
                      >
                        {showAll ? "عرض أقل" : `عرض جميع الدورات (${filtered.length})`}
                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showAll ? "rotate-180" : ""}`} />
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Divider — same as home */}
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/60 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] md:w-[80%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/80 to-transparent blur-[1px]"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-200/50"></div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ BENEFITS ═══════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden" id="benefits">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 text-[#173A7C] text-sm font-bold tracking-wider uppercase bg-[#173A7C]/[0.06] px-5 py-2 rounded-full mb-4">
              <Zap className="w-4 h-4 text-[#5CB07C]" />
              مزايا الشراكة
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mt-3">
              لماذا تختار{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">تدريبنا</span>؟
            </h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto text-lg font-medium leading-relaxed">
              نوفر لك تجربة تدريبية متكاملة مصممة لتحقيق أقصى عائد على استثمارك في تطوير الكوادر.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="group relative"
                >
                  <div className="relative bg-white border border-slate-100 rounded-[1.75rem] p-8 sm:p-9 shadow-[0_4px_20px_-5px_rgba(23,58,124,0.04)] hover:shadow-[0_25px_60px_-15px_rgba(23,58,124,0.12)] hover:border-slate-200 transition-all duration-500 h-full group-hover:-translate-y-2">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${b.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className="w-8 h-8 text-[#173A7C] group-hover:text-[#5CB07C] transition-colors duration-500" strokeWidth={1.8} />
                    </div>

                    <h3 className="font-black text-xl text-slate-900 mb-3">{b.title}</h3>
                    <p className="text-[15px] font-medium text-slate-500 leading-[1.8]">{b.desc}</p>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-1/2 h-[3px] bg-gradient-to-r from-[#173A7C] to-[#5CB07C] rounded-t-full transition-all duration-500" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Divider */}
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/60 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] md:w-[80%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/80 to-transparent blur-[1px]"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-200/50"></div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ PROCESS STEPS — ULTRA PREMIUM ═══════════════════════════════════════ */}
      <section className="py-24 bg-slate-50 relative overflow-hidden" id="process">
        {/* bg.webp */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none overflow-hidden z-0">
          <img src="/bg.webp" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="particles-grid opacity-30" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 text-[#173A7C] text-sm font-bold tracking-wider uppercase bg-[#173A7C]/[0.06] px-5 py-2 rounded-full mb-4">
              <Rocket className="w-4 h-4 text-[#5CB07C]" />
              آلية العمل
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mt-3">
              كيف{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">نعمل</span>؟
            </h2>
            <p className="text-slate-500 mt-4 max-w-lg mx-auto text-lg font-medium">
              أربع خطوات بسيطة لتحويل أداء فريقك
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="group relative"
                >
                  <div className="relative bg-white/60 backdrop-blur-[30px] border border-white/60 rounded-[1.75rem] p-8 shadow-[0_8px_30px_-5px_rgba(23,58,124,0.08)] hover:shadow-[0_25px_60px_-15px_rgba(23,58,124,0.15)] transition-all duration-500 h-full group-hover:-translate-y-2 overflow-hidden text-center">
                    {/* Top accent */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C] to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                    <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/50 to-transparent pointer-events-none rounded-t-[1.75rem]" />

                    {/* Step number */}
                    <div className="relative z-10 w-10 h-10 mx-auto mb-5 rounded-full bg-gradient-to-br from-[#173A7C]/[0.08] to-[#5CB07C]/[0.08] border border-[#173A7C]/[0.08] flex items-center justify-center">
                      <span className="text-[#173A7C] font-black text-sm">{s.num}</span>
                    </div>

                    {/* Icon */}
                    <div className="relative z-10 w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] flex items-center justify-center shadow-lg shadow-[#173A7C]/15 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-[#173A7C]/20 transition-all duration-500">
                      <Icon className="w-8 h-8 text-white" strokeWidth={1.8} />
                    </div>

                    {/* Content */}
                    <h3 className="relative z-10 text-lg font-black text-slate-900 mb-3">{s.title}</h3>
                    <p className="relative z-10 text-sm font-medium text-slate-500 leading-[1.8]">{s.desc}</p>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-1/2 h-[3px] bg-gradient-to-r from-[#173A7C] to-[#5CB07C] rounded-t-full transition-all duration-500" />
                  </div>

                  {/* Connector arrow between cards (hidden on last and mobile) */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 z-30">
                      <div className="w-6 h-6 rounded-full bg-white border-2 border-[#5CB07C]/30 flex items-center justify-center shadow-md">
                        <ArrowLeft className="w-3 h-3 text-[#5CB07C]" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Divider */}
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/60 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] md:w-[80%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/80 to-transparent blur-[1px]"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-200/50"></div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ TRUSTED BY ═══════════════════════════════════════ */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-slate-400 text-sm font-bold tracking-wider uppercase">يثقون بنا</span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">شركاء <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">النجاح</span></h3>
          </motion.div>

          {/* Marquee */}
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            
            <div className="marquee-track">
              {[...trustedLogos, ...trustedLogos, ...trustedLogos].map((name, i) => (
                <div key={i} className="flex-shrink-0 mx-6 sm:mx-8">
                  <div className="w-36 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-white hover:shadow-md hover:border-slate-200 transition-all duration-300 group">
                    <span className="text-base font-black text-slate-300 group-hover:text-[#173A7C] transition-colors duration-300">{name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Divider */}
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/60 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] md:w-[80%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/80 to-transparent blur-[1px]"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-200/50"></div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ CONTACT FORM ═══════════════════════════════════════ */}
      <section className="py-24 bg-slate-50 relative overflow-hidden" id="contact-form">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 text-[#173A7C] text-sm font-bold tracking-wider uppercase bg-[#173A7C]/[0.06] px-5 py-2 rounded-full mb-4">
              <Send className="w-4 h-4 text-[#5CB07C]" />
              تواصل معنا
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3">
              تواصل معنا للشكاوى والاقتراحات
            </h2>
            <p className="text-slate-500 mt-3 text-base font-medium">(سيتم الرد عليكم في خلال 24 ساعة)</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <form className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <input type="text" placeholder="اكتب اسمك هنا" className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#5CB07C] focus:ring-2 focus:ring-[#5CB07C]/20 outline-none transition-all text-sm font-medium shadow-sm" />
                  <input type="tel" placeholder="اكتب رقم جوالك للتواصل" dir="rtl" className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#5CB07C] focus:ring-2 focus:ring-[#5CB07C]/20 outline-none transition-all text-sm font-medium shadow-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <input type="email" placeholder="اكتب بريدك الإلكتروني" className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#5CB07C] focus:ring-2 focus:ring-[#5CB07C]/20 outline-none transition-all text-sm font-medium shadow-sm" />
                  <input type="text" placeholder="اكتب عنوان الرسالة" className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#5CB07C] focus:ring-2 focus:ring-[#5CB07C]/20 outline-none transition-all text-sm font-medium shadow-sm" />
                </div>
                <textarea placeholder="اكتب محتوى الرسالة أو الاستفسار" rows={5} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#5CB07C] focus:ring-2 focus:ring-[#5CB07C]/20 outline-none transition-all text-sm font-medium shadow-sm resize-none" />
                <button type="submit" className="w-full py-4 bg-gradient-to-r from-[#5CB07C] to-[#4EA06E] text-white font-black text-lg rounded-2xl hover:from-[#4EA06E] hover:to-[#5CB07C] shadow-lg shadow-[#5CB07C]/25 transition-all hover:shadow-xl hover:shadow-[#5CB07C]/30 hover:-translate-y-0.5 cursor-pointer">
                  إرسال
                </button>
              </form>
            </motion.div>

            {/* Contact Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] rounded-[2rem] p-8 h-full flex flex-col justify-between text-white shadow-xl shadow-[#173A7C]/20 relative overflow-hidden">
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-3">تواصل معنا</h3>
                  <p className="text-white/60 text-sm font-medium mb-8 leading-relaxed">نسعد بتواصلكم ونحرص على الرد في أسرع وقت ممكن</p>

                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-[#5CB07C]" />
                      </div>
                      <span className="text-sm font-bold font-sans" dir="ltr">0549105986</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-[#5CB07C]" />
                      </div>
                      <span className="text-sm font-bold font-sans" dir="ltr">alnabdalmustadam@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-[#5CB07C]" />
                      </div>
                      <span className="text-sm font-medium text-white/80">جدة - حي الرحاب</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-[#5CB07C]" />
                      </div>
                      <span className="text-sm font-medium text-white/80">السبت - الخميس: 5ص - 8م</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
                  <p className="text-white/50 text-sm font-bold mb-4">تابعنا على ..</p>
                  <div className="flex items-center gap-3">
                    {["instagram", "youtube", "whatsapp", "twitter", "facebook"].map((platform) => (
                      <a key={platform} href="#" aria-label={platform} className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:bg-[#5CB07C] hover:text-white hover:border-[#5CB07C] hover:-translate-y-1 transition-all duration-300">
                        {platform === "instagram" && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>}
                        {platform === "youtube" && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" /></svg>}
                        {platform === "whatsapp" && <MessageSquare className="w-4 h-4" />}
                        {platform === "twitter" && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>}
                        {platform === "facebook" && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Divider */}
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/60 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] md:w-[80%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/80 to-transparent blur-[1px]"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-200/50"></div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ CTA — LIGHT PREMIUM ═══════════════════════════════════════ */}
      <section className="py-28 bg-white relative overflow-hidden" id="cta">
        {/* Particle Grid */}
        <div className="particles-grid opacity-40" />

        {/* bg.webp background ornament */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none overflow-hidden z-0">
          <img src="/bg.webp" alt="" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative bg-white/50 backdrop-blur-[50px] border border-white/50 shadow-[0_40px_100px_-20px_rgba(23,58,124,0.15)] rounded-[2.5rem] p-10 sm:p-14 lg:p-20 overflow-hidden text-center group"
          >
            {/* Top accent gradient bar */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#5CB07C] to-transparent opacity-60" />
            
            {/* Glass top highlight */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/70 to-transparent pointer-events-none rounded-t-[2.5rem]" />
            
            {/* Corner accents */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#5CB07C]/[0.06] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#173A7C]/[0.06] rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-8 rounded-[1.25rem] bg-gradient-to-br from-[#173A7C]/[0.06] to-[#5CB07C]/[0.06] border border-[#173A7C]/[0.08] flex items-center justify-center shadow-sm">
                <Headphones className="w-10 h-10 text-[#173A7C]" strokeWidth={1.5} />
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-black text-slate-900 mb-6 leading-[1.15] tracking-tight">
                هل أنت مستعد لتطوير
                <br className="hidden sm:block" />
                <span className="gradient-text">فريقك</span>؟
              </h2>

              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="w-20 h-[2px] mx-auto bg-gradient-to-r from-[#173A7C] to-[#5CB07C] rounded-full mb-6"
              />

              <p className="text-slate-500 mb-12 text-lg lg:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                تواصل معنا اليوم واحصل على عرض مخصص لمؤسستك يتناسب مع احتياجاتك الخاصة وميزانيتك.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button href="/contact" className="bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white hover:from-[#1E4D9D] hover:to-[#173A7C] shadow-[0_20px_50px_-10px_rgba(23,58,124,0.35)] px-10 py-5 border-none font-black text-lg transition-all rounded-2xl">
                    طلب عرض سعر
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </motion.div>
                <a href="tel:0549105986" className="inline-flex items-center gap-3 text-slate-500 hover:text-[#173A7C] font-bold text-lg transition-all px-6 py-5 group">
                  <div className="w-12 h-12 rounded-full bg-[#173A7C]/[0.06] border border-[#173A7C]/[0.08] flex items-center justify-center group-hover:bg-[#5CB07C]/10 group-hover:border-[#5CB07C]/20 transition-all">
                    <Phone className="w-5 h-5 text-[#173A7C] group-hover:text-[#5CB07C] transition-colors" />
                  </div>
                  اتصل بنا مباشرة
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Divider */}
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/60 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] md:w-[80%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/80 to-transparent blur-[1px]"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-200/50"></div>
        </div>
      </section>

    </div>
  );
}
