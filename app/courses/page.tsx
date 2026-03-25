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
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
            جميع <span className="gradient-text">الدورات</span>
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto text-base">
            تصفح دوراتنا المتنوعة واختر ما يناسب مسارك المهني
          </p>
        </motion.div>

        {/* Search + Controls */}
        <div className="flex flex-col md:flex-row items-stretch gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن دورة..."
              className="w-full pr-12 pl-4 py-3.5 rounded-[16px] bg-white border border-slate-200 shadow-sm text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] outline-none transition-all text-base"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative bg-white border border-slate-200 shadow-sm rounded-[16px] overflow-hidden">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="ترتيب الدورات"
                className="px-5 py-3.5 w-full bg-transparent text-slate-700 text-sm font-semibold outline-none focus:ring-0 cursor-pointer appearance-none pl-10"
              >
                {sortOptions.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex rounded-[16px] border border-slate-200 bg-white shadow-sm overflow-hidden p-1">
              <button
                onClick={() => setView("grid")}
                aria-label="عرض شبكي"
                className={`p-2.5 rounded-lg transition-all cursor-pointer ${view === "grid" ? "bg-[#173A7C]/10 text-[#173A7C]" : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView("list")}
                aria-label="عرض قائمة"
                className={`p-2.5 rounded-lg transition-all cursor-pointer ${view === "list" ? "bg-[#173A7C]/10 text-[#173A7C]" : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Filters */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-label="فتح الفلاتر"
              className="lg:hidden p-3 rounded-[16px] bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-[#173A7C] transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 align-start">
          {/* Sidebar Filters — Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-6 sticky top-28">
              <h3 className="text-base font-bold text-slate-900 mb-5">الفئة</h3>
              <div className="space-y-2 mb-8 border-b border-slate-100 pb-8">
                {courseCategories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setCategory(cat.key)}
                    className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      category === cat.key ? "bg-[#173A7C]/10 text-[#173A7C]" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-5">المستوى</h3>
              <div className="space-y-2">
                {levels.map((l) => (
                  <button
                    key={l.key}
                    onClick={() => setLevel(l.key)}
                    className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      level === l.key ? "bg-slate-100 text-[#173A7C]" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
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
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                : "flex flex-col gap-6" // List view would require a CourseListCard, but we reuse CourseCard with flex-col 
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
