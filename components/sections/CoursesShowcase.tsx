"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import CourseCard from "@/components/ui/CourseCard";
import { courses, courseCategories } from "@/data/courses";

export default function CoursesShowcase() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? courses
      : courses.filter((c) => c.category === activeCategory);

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
          <span className="text-[#5CB07C] text-sm font-bold tracking-wide uppercase bg-[#5CB07C]/10 px-4 py-1.5 rounded-full inline-block mb-4">
            أحدث دورات المعهد
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 mb-4 leading-tight">
            اختر مسارك نحو <span className="gradient-text">التميز</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            دورات متنوعة تناسب جميع المستويات، مصممة بعناية لتأهيلك لسوق العمل وتطوير مهاراتك.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
          {courseCategories
            .filter((c) => courses.some((course) => c.key === "all" || course.category === c.key))
            .map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  activeCategory === cat.key
                    ? "bg-[#5CB07C] text-white shadow-md shadow-[#5CB07C]/20 border border-[#5CB07C]"
                    : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-sm"
                }`}
              >
                {cat.label}
              </button>
            ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>

        {/* See All */}
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <a
              href="/courses"
              className="inline-flex items-center gap-2 text-[#173A7C] hover:text-[#1E4D9D] transition-colors text-base font-bold group bg-[#173A7C]/5 hover:bg-[#173A7C]/10 px-6 py-3 rounded-full"
            >
              عرض جميع الدورات
              <svg className="w-5 h-5 rtl:rotate-180 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M13 7l5 5-5 5M6 12h12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
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
