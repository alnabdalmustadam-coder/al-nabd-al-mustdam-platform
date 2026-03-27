"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import CourseCard from "@/components/ui/CourseCard";
import { courses, courseCategories } from "@/data/courses";
import { Search, SlidersHorizontal, Grid3X3, List, X } from "lucide-react";

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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  let filtered = courses.filter((c) => {
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
      <section className="relative pt-[calc(10vh+5rem)] pb-[10vh] overflow-hidden bg-white">
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
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-100 shadow-[0_4px_20px_rgba(23,58,124,0.05)] mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5CB07C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#5CB07C]"></span>
              </span>
              <span className="text-sm font-bold text-slate-700 tracking-wide">أكثر من {courses.length} دورة تدريبية</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-black text-slate-900 mb-6 leading-[1.15] tracking-tight">
              تصفح أحدث <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] via-[#2F66D6] to-[#5CB07C]">الدورات</span>
            </h1>
            
            <div className="w-24 h-[3px] mx-auto bg-gradient-to-r from-[#173A7C] to-[#5CB07C] rounded-full mb-6 opacity-80" />
            
            <p className="text-slate-500 max-w-2xl mx-auto text-lg sm:text-xl font-medium leading-relaxed">
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

        <div className="flex flex-col lg:flex-row gap-8 align-start">
          {/* Sidebar Filters — Desktop */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-28 self-start">
            <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7">
              <div className="mb-8">
                <h3 className="text-lg font-black text-[#173A7C] mb-5">الفئة</h3>
                <div className="space-y-2">
                  {courseCategories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setCategory(cat.key)}
                      className={`w-full text-right px-5 py-3.5 rounded-2xl text-[14px] font-bold transition-all duration-300 cursor-pointer flex justify-between items-center group ${
                        category === cat.key
                          ? "bg-gradient-to-l from-[#173A7C] to-[#1E4D9D] text-white shadow-lg shadow-[#173A7C]/20 scale-[1.02]"
                          : "text-slate-600 hover:text-[#173A7C] hover:bg-[#173A7C]/[0.04]"
                      }`}
                    >
                      <span className="line-clamp-1">{cat.label}</span>
                      {category === cat.key && <span className="w-2 h-2 rounded-full bg-[#5CB07C] shadow-[0_0_8px_rgba(92,176,124,0.8)] shrink-0 mr-2" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-slate-100 mb-8" />

              <div>
                <h3 className="text-lg font-black text-[#173A7C] mb-5">المستوى</h3>
                <div className="space-y-2">
                  {levels.map((l) => (
                    <button
                      key={l.key}
                      onClick={() => setLevel(l.key)}
                      className={`w-full text-right px-5 py-3.5 rounded-2xl text-[14px] font-bold transition-all duration-300 cursor-pointer flex justify-between items-center group ${
                        level === l.key
                          ? "bg-slate-800 text-white shadow-lg scale-[1.02]"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                      }`}
                    >
                      <span>{l.label}</span>
                      {level === l.key && <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0 mr-2" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filters Bottom Sheet */}
          {filtersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
              <div className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-200 rounded-t-3xl p-6 md:p-8 max-h-[80vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-900">الفلاتر</h3>
                  <button onClick={() => setFiltersOpen(false)} aria-label="إغلاق الفلاتر" className="text-slate-400 hover:text-slate-600 cursor-pointer p-2 bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                <h4 className="text-base font-bold text-slate-900 mb-4">الفئة</h4>
                <div className="flex flex-wrap gap-2 mb-8">
                  {courseCategories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setCategory(cat.key)}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer shadow-sm border ${
                        category === cat.key ? "bg-[#173A7C] text-white border-[#173A7C]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <h4 className="text-base font-bold text-slate-900 mb-4">المستوى</h4>
                <div className="flex flex-wrap gap-2">
                  {levels.map((l) => (
                    <button
                      key={l.key}
                      onClick={() => setLevel(l.key)}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer shadow-sm border ${
                        level === l.key ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Course Grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-lg font-medium">لا توجد دورات مطابقة للبحث أو الفلتر المختار.</p>
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
                : "flex flex-col gap-8" // List view would require a CourseListCard, but we reuse CourseCard with flex-col 
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
