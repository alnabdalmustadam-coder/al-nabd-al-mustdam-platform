"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CourseCard from "@/components/ui/CourseCard";
import { CourseCardSkeleton } from "@/components/ui/CardSkeleton";
import {
  Search, SlidersHorizontal, Grid3X3, List, BookOpen,
  LayoutGrid, BriefcaseBusiness, BarChart3, Laptop
} from "lucide-react";
import { usePublicCourses } from "@/lib/hooks/use-public-courses";

const categoryTabs = [
  { key: "all", label: "جميع التخصصات", mobileLabel: "الكل", icon: LayoutGrid },
  { key: "management", label: "الإدارة والقيادة", mobileLabel: "الإدارة", icon: BriefcaseBusiness },
  { key: "data", label: "البيانات والتحليل", mobileLabel: "البيانات", icon: BarChart3 },
  { key: "tech", label: "التقنية والتصميم", mobileLabel: "التقنية", icon: Laptop },
];

const levels = [
  { key: "all", label: "كل المستويات" },
  { key: "beginner", label: "مبتدئ" },
  { key: "intermediate", label: "متوسط" },
  { key: "advanced", label: "متقدم" },
];

const sortOptions = [
  { key: "newest", label: "الأحدث" },
  { key: "rating", label: "الأعلى تقييماً" },
  { key: "price-low", label: "الأرخص" },
  { key: "price-high", label: "الأعلى سعراً" },
];

export default function CoursesPage() {
  const { courses: courseList, loading: coursesLoading, error: coursesError, reload } = usePublicCourses();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"grid" | "list">("grid");

  let filtered = courseList.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.description && c.description.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "all" || c.category === category;
    const matchLevel = level === "all" || c.level === level;
    return matchSearch && matchCat && matchLevel;
  });

  filtered = [...filtered].sort((a, b) => {
    switch (sort) {
      case "rating": return (b.rating || 0) - (a.rating || 0);
      case "price-low": return a.price - b.price;
      case "price-high": return b.price - a.price;
      default: return b.id - a.id;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-[#EEF4F9]/60 to-[#FFFFFF] pb-24 overflow-x-clip font-[family-name:var(--font-cairo)]">
      
      {/* ═══════════════════════════════════════ HERO SECTION ═══════════════════════════════════════ */}
      <section className="relative pt-24 sm:pt-32 pb-14 sm:pb-18 overflow-hidden text-center">
        {/* Background Texture */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden z-0">
          <img src="/bg.webp" alt="" className="w-full h-full object-cover" />
        </div>
        
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-20 w-[550px] h-[550px] bg-[#0B3766]/[0.08] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-[#19B6C7]/[0.07] rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-badge-glass mb-4 sm:mb-5 inline-flex items-center gap-1.5 px-4 py-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#19B6C7]" />
              {courseList.length} دورات وبرامج معتمدة
            </span>
            
            <h1 className="hero-main-title-premium mb-4 text-3xl sm:text-4xl lg:text-5xl text-[#0B3766]">
              تصفح أحدث <span className="gradient-text">الدورات والمسارات</span>
            </h1>
            
            <p className="section-desc-premium max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed">
              اختر البرنامج المناسب لطموحك وطوّر مهاراتك مع نخبة من الخبراء في مختلف المجالات، مع تجربة تدريبية متكاملة تضمن مستقبلك المهني.
            </p>
          </motion.div>
        </div>

        {/* Section Bottom Hairline */}
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center justify-end h-10">
          <div className="w-[85%] md:w-[92%] h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════ MAIN CONTENT ═══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">

        {/* Search + Controls Card */}
        <div className="mb-8">
          <div className="liquid-glass-card rounded-[1.75rem] p-3.5 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3 sm:gap-4 border border-white/90 shadow-[0_8px_30px_rgba(11,55,102,0.08)] bg-white/90">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute right-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#0B3766]/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن دورتك، تخصصك، أو الكلمات المفتاحية..."
                className="w-full pr-12 pl-4 py-3 sm:py-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#168AD3] focus:ring-2 focus:ring-[#168AD3]/20 outline-none transition-all text-xs sm:text-sm font-semibold"
              />
            </div>

            {/* Level Filter Dropdown */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="relative bg-white border border-slate-200/80 hover:border-[#0B3766]/30 transition-all rounded-xl overflow-hidden shadow-2xs">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  aria-label="تصفية حسب المستوى"
                  className="px-4 py-3 sm:py-3.5 w-32 sm:w-36 bg-transparent text-slate-700 text-xs sm:text-sm font-bold outline-none cursor-pointer appearance-none border-none"
                >
                  {levels.map((l) => (
                    <option key={l.key} value={l.key}>{l.label}</option>
                  ))}
                </select>
                <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="relative bg-white border border-slate-200/80 hover:border-[#0B3766]/30 transition-all rounded-xl overflow-hidden shadow-2xs">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="ترتيب الدورات"
                  className="px-4 py-3 sm:py-3.5 w-32 sm:w-36 bg-transparent text-slate-700 text-xs sm:text-sm font-bold outline-none cursor-pointer appearance-none border-none"
                >
                  {sortOptions.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
                <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* View Toggles */}
              <div className="flex rounded-xl border border-slate-200/80 bg-slate-100/70 p-1">
                <button
                  onClick={() => setView("grid")}
                  aria-label="عرض شبكي"
                  className={`p-2.5 rounded-lg transition-all cursor-pointer ${
                    view === "grid" 
                      ? "bg-white text-[#0B3766] shadow-xs font-bold"
                      : "text-slate-500 hover:text-[#0B3766]"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="عرض قائمة"
                  className={`p-2.5 rounded-lg transition-all cursor-pointer ${
                    view === "list" 
                      ? "bg-white text-[#0B3766] shadow-xs font-bold"
                      : "text-slate-500 hover:text-[#0B3766]"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Category Pill Tabs with Icons (Identical to Home Showcase) */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-10" role="group" aria-label="تصفية الدورات حسب التخصص">
          {categoryTabs.map((f) => {
            const Icon = f.icon;
            const active = category === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setCategory(f.key)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                  active
                    ? "border-[#0B3766] bg-[#0B3766] text-white shadow-md shadow-[#0B3766]/20 border"
                    : "border border-slate-200/80 bg-white text-[#0B3766] hover:bg-[#F5FAFE] hover:border-[#168AD3]/40 shadow-xs"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${active ? "text-[#19B6C7]" : "text-[#0B3766]"}`} strokeWidth={2} />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Course Grid: 3-column layout matching Home Showcase */}
        <div>
          {coursesLoading && courseList.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : coursesError ? (
            <div role="alert" className="rounded-3xl border border-amber-200 bg-amber-50 p-10 text-center text-slate-700 max-w-xl mx-auto">
              <p>{coursesError}</p>
              <button type="button" onClick={reload} className="mt-4 font-bold text-[#0B3766] underline">إعادة المحاولة</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto p-8">
              <div className="w-16 h-16 bg-[#0B3766]/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[#0B3766]/40" />
              </div>
              <h3 className="card-title-royal-blue text-xl mb-2 text-[#0B3766]">لا توجد دورات مطابقة</h3>
              <p className="text-sm text-slate-500 mb-6">لم نتمكن من العثور على دورات تطابق بحثك أو الفلتر المختار.</p>
              <button 
                onClick={() => { setSearch(""); setCategory("all"); setLevel("all"); }}
                className="px-6 py-2.5 bg-[#0B3766] text-white text-xs font-bold rounded-xl hover:bg-[#168AD3] transition-colors cursor-pointer"
              >
                مسح الفلاتر وإعادة البحث
              </button>
            </div>
          ) : (
            <div className={view === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-fr"
              : "flex flex-col gap-6"
            }>
              {filtered.map((c, i) => (
                <CourseCard key={c.id} course={c} index={i} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
