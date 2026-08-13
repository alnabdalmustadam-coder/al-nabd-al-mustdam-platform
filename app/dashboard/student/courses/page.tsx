'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ArrowLeft, Search, BookOpen, ShieldCheck, Filter, GraduationCap } from 'lucide-react';

const sectionFadeVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.16,
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.12,
      delayChildren: custom * 0.16 + 0.08,
    },
  }),
};

const textItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function StudentCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const myCourses = [
    {
      id: 'c-1',
      slug: 'diploma-tolerance-citizenship',
      title: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      instructor: 'د. محمد القحطاني',
      lessonsCount: 18,
      completedLessons: 8,
      progressPercent: 45,
      thumbnailUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'c-2',
      slug: 'sustainable-leadership',
      title: 'برنامج القيادة المستدامة والمسؤولية المجتمعية',
      instructor: 'أ. د. سارة العتيبي',
      lessonsCount: 12,
      completedLessons: 10,
      progressPercent: 80,
      thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'c-3',
      slug: 'institutional-excellence',
      title: 'شهادة التميز المؤسسي والجودة الحوكمية',
      instructor: 'د. خالد الدوسري',
      lessonsCount: 24,
      completedLessons: 2,
      progressPercent: 10,
      thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const filteredCourses = myCourses.filter(
    (c) => c.title.includes(searchQuery) || c.instructor.includes(searchQuery)
  );

  return (
    <div className="space-y-6 sm:space-y-7 pt-2.5 sm:pt-0 font-[family-name:var(--font-cairo)]">
      {/* Hero Banner Ultra Premium - Light Glassmorphism */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative z-20 liquid-glass-hero p-6 sm:p-8 md:p-9 space-y-4 liquid-glass-hover overflow-hidden student-card-accent rounded-2xl sm:rounded-3xl"
      >
        {/* Ambient Background Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#173A7C]/8 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 pr-2">
            <motion.div variants={textItemVariants} className="student-tag-badge bg-blue-50/90 text-[#173A7C] border border-blue-200/80 shadow-xs">
              <BookOpen className="w-3 h-3 text-[#173A7C]" />
              <span>المحتوى التعليمي المسجل</span>
            </motion.div>

            <motion.h1 variants={textItemVariants} className="student-heading-h1">
              دوراتي التدريبية المعتمدة 🎓
            </motion.h1>

            <motion.p variants={textItemVariants} className="student-text-body max-w-2xl pr-0.5 pt-1.5 sm:pt-2 leading-relaxed">
              استعرض وتابع كافة البرامج التدريبية المعتمدة في خطتك الدراسية واستكمل المحاضرات التفاعلية بسهولة.
            </motion.p>
          </div>

          <motion.div variants={textItemVariants} className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50/90 text-emerald-800 text-xs font-black border border-emerald-200/80 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{myCourses.length} دورات نشطة</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Dedicated Filter & Full-Width Search Bar */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={1}
        className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl liquid-glass-inner"
      >
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-700">
          <Filter className="w-3.5 h-3.5 text-[#173A7C]" />
          <span>تصفية المساقات المسجلة ({filteredCourses.length}):</span>
        </div>

        {/* Spacious Search Bar */}
        <div className="relative w-full sm:w-96">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث في الدورات أو اسم المحاضر..."
            className="w-full py-2 pr-9 pl-4 text-xs font-bold text-slate-700 placeholder-slate-400 bg-white/90 rounded-xl border border-slate-200 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/10 transition-all shadow-xs"
          />
        </div>
      </motion.div>

      {/* Courses Grid - Matching Dashboard Home Cards Design */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={2}
        className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
      >
        {filteredCourses.map((course, idx) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + idx * 0.14, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-2xl sm:rounded-[24px] flex flex-col justify-between group min-h-[310px] sm:min-h-[330px] shadow-xl border border-white/30 transition-all duration-300 hover:shadow-2xl"
          >
            {/* Full-Cover Background Thumbnail Image (100% height & width) */}
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />

            {/* Rich Glass Dark Gradient Overlay for Maximum Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-950/30" />

            {/* Glass Top Highlight Specular Line */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent z-10" />

            {/* Card Header Tags */}
            <div className="relative z-10 p-5 flex justify-between items-start">
              <span
                className="text-xs font-black text-white px-3.5 py-1.5 rounded-full border border-white/30 shadow-lg"
                style={{ background: 'rgba(23, 58, 124, 0.85)', backdropFilter: 'blur(12px)' }}
              >
                {course.completedLessons} من {course.lessonsCount} درس
              </span>

              {/* Contrasting Completion Pill Tag */}
              <div
                className="px-3.5 py-1.5 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/40 shadow-lg flex items-center gap-1.5"
                style={{ background: 'rgba(5, 46, 22, 0.85)', backdropFilter: 'blur(12px)' }}
              >
                <span>مكتمل:</span>
                <span className="text-emerald-400 font-black text-sm">%{course.progressPercent}</span>
              </div>
            </div>

            {/* Card Content & Footer */}
            <div className="relative z-10 p-6 space-y-4 pt-12">
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-white text-xs sm:text-base leading-snug drop-shadow-xs line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-xs text-emerald-300/90 font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>{course.instructor}</span>
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-2 rounded-full overflow-hidden p-0.5 border border-white/20 bg-slate-900/80">
                  <div
                    className="h-full bg-gradient-to-r from-[#5CB07C] via-emerald-400 to-teal-300 rounded-full transition-all duration-700 shadow-xs"
                    style={{ width: `${course.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-1">
                <Link
                  href={`/dashboard/student/courses/${course.slug}/lessons/lesson-1`}
                  className="w-full py-3 rounded-xl bg-white/95 hover:bg-[#173A7C] text-[#173A7C] hover:text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all duration-300 border border-white/60 hover:border-[#173A7C] shadow-lg cursor-pointer active:scale-98"
                >
                  <span>متابعة الدراسة</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
