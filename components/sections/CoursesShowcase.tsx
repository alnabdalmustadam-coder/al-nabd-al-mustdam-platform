"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import CourseCard from "@/components/ui/CourseCard";
import { CourseCardSkeleton } from "@/components/ui/CardSkeleton";
import { courseCategories } from "@/data/courses";
import { COURSES_LOAD_ERROR, fetchPublicCourses } from "@/lib/public-courses";
import type { Course } from "@/types";

export default function CoursesShowcase() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    let controller: AbortController | undefined;

    const loadCourses = async () => {
      controller?.abort();
      const request = new AbortController();
      controller = request;

      try {
        const latest = await fetchPublicCourses(request.signal);
        if (!active || request.signal.aborted) return;
        setCourseList(latest);
        setError(null);
      } catch {
        if (active && !request.signal.aborted) setError(COURSES_LOAD_ERROR);
      } finally {
        if (active && !request.signal.aborted) setLoading(false);
      }
    };

    const refresh = () => { void loadCourses(); };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };

    refresh();
    window.addEventListener("nabd_courses_updated", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      active = false;
      controller?.abort();
      window.removeEventListener("nabd_courses_updated", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
      window.removeEventListener("pageshow", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [retryKey]);

  const selectedCategory = activeCategory === "all"
    || courseList.some((course) => course.category === activeCategory)
    ? activeCategory
    : "all";

  const filtered =
    selectedCategory === "all"
      ? courseList
      : courseList.filter((c) => c.category === selectedCategory);

  return (
    <section className="pt-24 pb-40 relative bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-[#5CB07C] text-xs sm:text-sm font-bold mb-4 tracking-wide bg-white/90 shadow-sm border border-slate-200/80 inline-block px-5 py-2 rounded-full backdrop-blur-md">
            أحدث دورات المعهد
          </span>
          <h2 className="section-main-title-premium mt-2 mb-5">
            اختر مسارك نحو <span className="gradient-text">التميز</span>
          </h2>
          <p className="section-desc-premium max-w-2xl mx-auto">
            دورات متنوعة تناسب جميع المستويات، مصممة بعناية لتأهيلك لسوق العمل وتطوير مهاراتك.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="premium-tabs flex items-center justify-center gap-3 mb-12 flex-wrap">
          {courseCategories
            .filter((c) => courseList.some((course) => c.key === "all" || course.category === c.key))
            .map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`premium-tab px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  selectedCategory === cat.key
                    ? "bg-[#5CB07C] text-white shadow-md shadow-[#5CB07C]/20 border border-[#5CB07C]"
                    : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-sm"
                }`}
              >
                <span className="premium-tab-label">{cat.label}</span>
              </button>
            ))}
        </div>

        {error && (
          <div role="alert" className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center text-sm text-slate-700">
            <p>{error}</p>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setLoading(true);
                setRetryKey((key) => key + 1);
              }}
              className="mt-3 rounded-full bg-[#173A7C] px-5 py-2 font-bold text-white disabled:opacity-50"
            >
              {loading ? "جارٍ التحميل…" : "إعادة المحاولة"}
            </button>
          </div>
        )}

        {/* Grid */}
        <div aria-busy={loading} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && courseList.length === 0 ? (
            <>
              <span role="status" className="sr-only">جارٍ تحميل الدورات</span>
              {Array.from({ length: 6 }, (_, i) => <CourseCardSkeleton key={i} />)}
            </>
          ) : (
            filtered.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))
          )}
        </div>

        {!loading && !error && filtered.length === 0 && (
          <p role="status" className="py-12 text-center text-slate-500">لا توجد دورات متاحة حاليًا.</p>
        )}

        {/* See All */}
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-[#173A7C] hover:text-[#1E4D9D] transition-colors text-base font-bold group bg-[#173A7C]/5 hover:bg-[#173A7C]/10 px-6 py-3 rounded-full"
            >
              عرض جميع الدورات
              <svg className="w-5 h-5 rtl:rotate-180 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M13 7l5 5-5 5M6 12h12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Ultra Premium Section Divider */}
      <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center justify-end h-32">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-t from-white to-transparent blur-xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-[#5CB07C]/10 blur-2xl rounded-t-full z-0" />
        <div className="absolute bottom-0 left-0 w-full h-[100px] bg-gradient-to-b from-transparent to-white/70" />

        <div className="relative w-full z-20">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/80 to-transparent shadow-[0_0_15px_rgba(92,176,124,0.8)]"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 md:w-[70%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/90 to-transparent shadow-[0_0_18px_rgba(23,58,124,0.9)]"></div>
        </div>
      </div>
    </section>
  );
}
