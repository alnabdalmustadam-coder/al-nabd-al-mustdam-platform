"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CourseCard from "@/components/ui/CourseCard";
import { CourseCardSkeleton } from "@/components/ui/CardSkeleton";
import { courses, courseCategories } from "@/data/courses";
import { Search, SlidersHorizontal, Grid3X3, List, X, Headphones, ArrowLeft } from "lucide-react";

const levels = [
  { key: "all", label: "الكل" },
  { key: "beginner", label: "مبتدئ" },
  { key: "intermediate", label: "متوسط" },
  { key: "advanced", label: "متقدم" },
];

const sortOptions = [
  { key: "newest", label: "الأحدث" },
  { key: "rating", label: "الأعلى تقييماً" },
  { key: "price-low", label: "الأرخص" },
  { key: "price-high", label: "الأغلى" },
];

export default function CoursesPage() {
  const [courseList, setCourseList] = useState(courses);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchLiveCourses = () => {
    setCoursesLoading(true);
    fetch(`/api/courses?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.courses) && data.courses.length > 0) {
          setCourseList(data.courses);
        }
      })
      .catch((err) => console.error('Error fetching live courses:', err))
      .finally(() => setCoursesLoading(false));
  };

  useEffect(() => {
    fetchLiveCourses();

    const handleUpdate = () => fetchLiveCourses();
    window.addEventListener('nabd_courses_updated', handleUpdate);
    return () => window.removeEventListener('nabd_courses_updated', handleUpdate);
  }, []);

  let filtered = courseList.filter((c) => {
    const matchSearch = !search || c.title.includes(search) || c.description.includes(search);
    const matchCat = category === "all" || c.category === category;
    const matchLevel = level === "all" || c.level === level;
    return matchSearch && matchCat && matchLevel;
  });

  filtered = [...filtered].sort((a, b) => {
    switch (sort) {
      case "rating": return b.rating - a.rating;
      case "price-low": return a.price - b.price;
      case "price-high": return b.price - a.price;
      default: return b.id - a.id;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* ═══════════════════════════════════════ HERO SECTION — ULTRA PREMIUM ═══════════════════════════════════════ */}
      <section className="relative pt-20 md:pt-[calc(10vh+5rem)] pb-12 md:pb-[10vh] overflow-hidden bg-white">
        {/* bg.webp */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none overflow-hidden z-0">
          <img src="/bg.webp" alt="" className="w-full h-full object-contain" />
        </div>
        
        {/* Particle Grid */}
        <div className="particles-grid opacity-50" />
        
        {/* Decoration */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-[#173A7C]/[0.03] rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-[#5CB07C]/[0.04] rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <span className="section-badge-glass mb-6">
              أكثر من {courseList.length} دورة تدريبية
            </span>
            
            <h1 className="section-main-title-premium mb-6">
              تصفح أحدث <span className="gradient-text">الدورات</span>
            </h1>
            
            <div className="w-24 h-[3px] mx-auto bg-gradient-to-r from-[#173A7C] to-[#5CB07C] rounded-full mb-6 opacity-80" />
            
            <p className="section-desc-premium max-w-2xl mx-auto text-lg sm:text-xl">
              اختر الدورة المناسبة لك وطوّر مهاراتك مع أفضل الخبراء في مختلف المجالات، نحن نوفر لك تجربة تدريبية متكاملة لضمان مستقبلك المشرق.
            </p>
          </motion.div>
        </div>

        {/* Bottom Divider */}
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/50 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] md:w-[80%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/60 to-transparent blur-[1px]"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-200/50"></div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ MAIN CONTENT ═══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">

        {/* Search + Controls Card */}
        <div className="mb-12">
          <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن دورتك المفضلة..."
                className="w-full pr-14 pl-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#173A7C]/30 focus:ring-4 focus:ring-[#173A7C]/5 outline-none transition-all text-[15px] font-medium"
              />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Sort */}
              <div className="relative bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-[#173A7C]/5 focus-within:border-[#173A7C]/30">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="ترتيب الدورات"
                  className="px-6 py-4 w-40 bg-transparent text-slate-700 text-sm font-semibold outline-none cursor-pointer appearance-none border-none focus:ring-0"
                >
                  {sortOptions.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
                <div className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* View Toggles */}
              <div className="flex rounded-2xl border border-slate-100 bg-slate-50 p-1">
                <button
                  onClick={() => setView("grid")}
                  aria-label="عرض شبكي"
                  className={`p-3 rounded-xl transition-all cursor-pointer ${
                    view === "grid" 
                      ? "bg-white text-[#173A7C] shadow-sm border border-slate-100" 
                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-100/50"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="عرض قائمة"
                  className={`p-3 rounded-xl transition-all cursor-pointer ${
                    view === "list" 
                      ? "bg-white text-[#173A7C] shadow-sm border border-slate-100" 
                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-100/50"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Filters Toggle */}
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                aria-label="فتح الفلاتر"
                className="lg:hidden p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 hover:bg-white hover:text-[#173A7C] hover:border-slate-200 transition-all cursor-pointer"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Sidebar Filters — Desktop */}
          <aside className="courses-filter-sidebar hidden lg:block w-80 shrink-0 sticky top-28 self-start">
            <div className="courses-filter-panel rounded-[2rem] p-5 xl:p-6 min-h-[calc(100vh-9rem)] flex flex-col justify-between">
              <div className="relative z-10 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-[#173A7C]/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#2459A7] text-white flex items-center justify-center shadow-lg shadow-[#173A7C]/20 shrink-0">
                      <SlidersHorizontal className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="card-title-royal-blue text-lg leading-tight">فلترة الدورات</h2>
                      <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{filtered.length} دورة متاحة</p>
                    </div>
                  </div>
                  {(category !== "all" || level !== "all") && (
                    <button
                      onClick={() => { setCategory("all"); setLevel("all"); }}
                      className="text-[11px] font-bold text-[#173A7C] hover:text-[#0D8A5E] transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-[#173A7C]/5"
                    >
                      إعادة الضبط
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="mb-5">
                  <h3 className="card-title-royal-blue text-sm font-bold mb-2.5 px-1 flex items-center justify-between">
                    <span>الفئة التدريبية</span>
                    <span className="text-[10px] text-slate-400 font-normal">{courseCategories.length - 1} فئات</span>
                  </h3>
                  <div className="premium-tabs space-y-2">
                    {courseCategories.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setCategory(cat.key)}
                        aria-pressed={category === cat.key}
                        className={`premium-tab course-filter-tab w-full text-right rounded-2xl transition-all duration-300 cursor-pointer flex justify-between items-center group ${
                          category === cat.key
                            ? "bg-gradient-to-l from-[#173A7C] via-[#2459A7] to-[#1E4D9D] text-white shadow-lg shadow-[#173A7C]/25 border-[#173A7C]/70"
                            : "text-slate-600 hover:text-[#173A7C]"
                        }`}
                      >
                        <span className="premium-tab-label line-clamp-1">{cat.label}</span>
                        {category === cat.key && <span className="w-2 h-2 rounded-full bg-[#5CB07C] shadow-[0_0_8px_rgba(92,176,124,0.8)] shrink-0 mr-2" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#173A7C]/15 to-transparent mb-5" />

                {/* Level */}
                <div className="mb-4">
                  <h3 className="card-title-royal-blue text-sm font-bold mb-2.5 px-1">المستوى التعليمي</h3>
                  <div className="premium-tabs space-y-2">
                    {levels.map((l) => (
                      <button
                        key={l.key}
                        onClick={() => setLevel(l.key)}
                        aria-pressed={level === l.key}
                        className={`premium-tab course-filter-tab w-full text-right rounded-2xl transition-all duration-300 cursor-pointer flex justify-between items-center group ${
                          level === l.key
                            ? "bg-gradient-to-l from-[#152C5B] to-[#1E3E73] text-white shadow-lg shadow-[#152C5B]/20 border-[#152C5B]/70"
                            : "text-slate-600 hover:text-[#173A7C]"
                        }`}
                      >
                        <span className="premium-tab-label">{l.label}</span>
                        {level === l.key && <span className="w-2 h-2 rounded-full bg-[#A8E6BE] shadow-[0_0_8px_rgba(168,230,190,0.65)] shrink-0 mr-2" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Educational Advisory Box */}
              <div className="relative z-10 pt-4 mt-4 border-t border-[#173A7C]/10">
                <div className="bg-gradient-to-br from-[#173A7C]/[0.06] via-[#5CB07C]/[0.06] to-white rounded-2xl p-4 border border-[#173A7C]/10 text-center relative overflow-hidden group hover:border-[#173A7C]/20 transition-all shadow-sm">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-[#173A7C] to-[#5CB07C] text-white flex items-center justify-center mb-2.5 shadow-md shadow-[#173A7C]/20 group-hover:scale-105 transition-transform">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-black text-[#173A7C] mb-1">محتار في اختيار الدورة؟</h4>
                  <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">تواصل مع مستشارنا التعليمي لمساعدتك في تحديد المسار الأنسب</p>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white text-xs font-bold hover:shadow-md hover:shadow-[#173A7C]/20 transition-all"
                  >
                    <span>استشارة تعليمية مجانية</span>
                    <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                  </a>
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
                  className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-200 rounded-t-[2.5rem] p-6 md:p-8 max-h-[85vh] overflow-y-auto shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pt-1 pb-3 z-10 border-b border-slate-100">
                    <h3 className="card-title-royal-blue text-xl">فلترة الدورات</h3>
                    <button onClick={() => setFiltersOpen(false)} aria-label="إغلاق الفلاتر" className="text-slate-400 hover:text-red-500 cursor-pointer p-2 bg-slate-50 hover:bg-red-50 rounded-full transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <h4 className="card-title-royal-blue text-base mb-3">الفئة التدريبية</h4>
                  <div className="premium-tabs flex flex-wrap gap-2 mb-6">
                    {courseCategories.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => { setCategory(cat.key); }}
                        className={`premium-tab px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm border ${
                          category === cat.key ? "bg-[#173A7C] text-white border-[#173A7C]" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="premium-tab-label">{cat.label}</span>
                      </button>
                    ))}
                  </div>

                  <h4 className="card-title-royal-blue text-base mb-3">المستوى التعليمي</h4>
                  <div className="premium-tabs flex flex-wrap gap-2 mb-6">
                    {levels.map((l) => (
                      <button
                        key={l.key}
                        onClick={() => { setLevel(l.key); }}
                        className={`premium-tab px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm border ${
                          level === l.key ? "bg-[#152C5B] text-white border-[#152C5B]" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="premium-tab-label">{l.label}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white font-bold text-sm shadow-lg shadow-[#173A7C]/20"
                  >
                    عرض النتائج ({filtered.length})
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Course Grid */}
          <div className="flex-1">
            {coursesLoading && courseList.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 lg:gap-8 xl:gap-10">
                {Array.from({ length: 4 }).map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <p className="section-desc-premium text-lg">لا توجد دورات مطابقة للبحث أو الفلتر المختار.</p>
                <button 
                  onClick={() => { setSearch(""); setCategory("all"); setLevel("all"); }}
                  className="mt-4 text-[#173A7C] font-bold hover:underline"
                >
                  مسح الفلاتر وإعادة البحث
                </button>
              </div>
            ) : (
              <div className={view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 lg:gap-8 xl:gap-10"
                : "flex flex-col gap-8"
              }>
                {filtered.map((c, i) => (
                  <CourseCard key={c.id} course={c} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
