'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
  BookOpen,
  Award,
  Download,
  Lock,
  ChevronLeft,
  Library,
  Compass,
  Layers,
  Milestone,
} from 'lucide-react';

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

export default function StudentPathwaysPage() {
  const [activeSection, setActiveSection] = useState<'pathways' | 'books'>('pathways');

  const pathways = [
    {
      id: 'pw-1',
      title: 'مسار خبير السلم والتسامح المؤسسي',
      category: 'الدبلومات المهنية المعتمدة',
      level: 'متقدم',
      coursesCount: 4,
      completedCoursesCount: 2,
      durationHours: 60,
      badge: 'شهادة خبير معتمد',
      description: 'مسار متكامل يهدف لإعداد كوادر متخصصة في نشر قيم السلام والتسامح وإدارة الحوار والتنوع الإيجابي داخل المنظمات والمؤسسات.',
    },
    {
      id: 'pw-2',
      title: 'مسار المواطنة الصالحة والمسؤولية المجتمعية',
      category: 'التنمية البشرية والقيادة',
      level: 'متوسط',
      coursesCount: 3,
      completedCoursesCount: 1,
      durationHours: 45,
      badge: 'شهادة ممارس',
      description: 'ترسيخ المبادئ والأخلاقيات الوطنية والعمل التطوعي وبناء مجتمعات واعية ومتمراكسة وفق أعلى المعايير العالمية.',
    },
  ];

  const books = [
    {
      id: 'bk-1',
      title: 'موسوعة التسامح والتنوع الثقافي في الفكر المعاصر',
      author: 'أ. د. سارة العتيبي',
      fileSize: '14.2 MB',
      pagesCount: 240,
      category: 'مرجع معتمد',
      isUnlocked: true,
      coverGradient: 'from-[#173A7C] to-[#1E4D9D]',
    },
    {
      id: 'bk-2',
      title: 'دليل القيادة المستدامة والمسؤولية الأخلاقية',
      author: 'د. محمد القحطاني',
      fileSize: '8.5 MB',
      pagesCount: 180,
      category: 'كتاب تدريبي',
      isUnlocked: true,
      coverGradient: 'from-emerald-700 to-teal-900',
    },
    {
      id: 'bk-3',
      title: 'المهارات الأكاديمية والتفكير الناقد في العصر الرقمي',
      author: 'قسم التطوير الأكاديمي',
      fileSize: '6.1 MB',
      pagesCount: 95,
      category: 'دليل دراسي',
      isUnlocked: false,
      coverGradient: 'from-amber-600 to-amber-800',
    },
  ];

  return (
    <div className="space-y-6 pt-2.5 sm:pt-0 font-[family-name:var(--font-cairo)]" dir="rtl">

      {/* Header Banner Ultra Premium - Liquid Glass Theme */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative z-20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-9 space-y-4 liquid-glass-hero liquid-glass-hover overflow-hidden student-card-accent"
      >
        {/* Ambient Liquid Glowing Orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-br from-blue-600/15 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 pr-2">
            <motion.div variants={textItemVariants} className="student-tag-badge bg-blue-50 text-[#173A7C] border border-blue-200/80 shadow-xs">
              <Library className="w-3.5 h-3.5 text-[#173A7C]" />
              <span>المحتوى والمستندات الأكاديمية</span>
            </motion.div>

            <motion.h1 variants={textItemVariants} className="student-heading-h1">
              المسارات التعليمية و<span className="student-name-gradient">الكتب الرقمية</span> 📚
            </motion.h1>

            <motion.p variants={textItemVariants} className="student-text-body max-w-xl pr-0.5 pt-1.5 sm:pt-2 leading-relaxed">
              استكشف المسارات التدريبية الشاملة وقم بتحميل الكتب والحقائب التدريبية المعتمدة لتعزيز حصيلتك العلمية.
            </motion.p>
          </div>

          <motion.div variants={textItemVariants} className="flex items-center justify-around gap-1.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-2xl bg-white/90 border border-white/80 backdrop-blur-md shadow-sm shrink-0">
            <div className="text-center px-3 border-l border-slate-200">
              <span className="block text-base sm:text-lg font-black text-[#0D5C3A]">2</span>
              <span className="text-[9px] sm:text-[10px] text-slate-600 font-bold whitespace-nowrap">مسارات نشطة</span>
            </div>
            <div className="text-center px-3 border-l border-slate-200">
              <span className="block text-base sm:text-lg font-black text-amber-600">3</span>
              <span className="text-[9px] sm:text-[10px] text-slate-600 font-bold whitespace-nowrap">كتب رقمية</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-base sm:text-lg font-black text-[#173A7C]">105</span>
              <span className="text-[9px] sm:text-[10px] text-slate-600 font-bold whitespace-nowrap">ساعة تعليمية</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Section Switcher Tabs - Side-by-side on Desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-row items-center gap-2 p-1.5 rounded-2xl border border-white/80 bg-white/90 backdrop-blur-md shadow-sm w-full sm:w-auto">
          <button
            onClick={() => setActiveSection('pathways')}
            className={`px-3.5 sm:px-5 py-2.5 sm:py-2.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-none ${
              activeSection === 'pathways'
                ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                : 'text-slate-600 hover:text-[#173A7C] hover:bg-slate-100/60 bg-slate-50/60 sm:bg-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>المسارات التعليمية (2)</span>
          </button>

          <button
            onClick={() => setActiveSection('books')}
            className={`px-3.5 sm:px-5 py-2.5 sm:py-2.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-none ${
              activeSection === 'books'
                ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                : 'text-slate-600 hover:text-[#173A7C] hover:bg-slate-100/60 bg-slate-50/60 sm:bg-transparent'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>الكتب والمراجع (3)</span>
          </button>
        </div>
      </div>

      {/* PATHWAYS CONTENT */}
      {activeSection === 'pathways' && (
        <div className="space-y-5">
          {pathways.map((pw, idx) => {
            const percent = Math.round((pw.completedCoursesCount / pw.coursesCount) * 100);
            return (
              <motion.div
                key={pw.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + idx * 0.16, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-5 liquid-glass-card liquid-glass-hover student-card-accent"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
                  <div className="space-y-1.5 min-w-0">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#0D5C3A] mb-1" style={{ textShadow: '0 1px 0px rgba(255,255,255,0.6)' }}>
                      <Milestone className="w-3.5 h-3.5 text-[#0D5C3A]" />
                      <span>{pw.category} • المستوى: {pw.level}</span>
                    </span>
                    <h3 className="student-heading-h3">{pw.title}</h3>
                  </div>

                  <span className="px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-sm shrink-0 flex items-center gap-1.5 whitespace-nowrap">
                    <Award className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>{pw.badge}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-bold leading-relaxed">{pw.description}</p>

                {/* Progress stats bar */}
                <div className="space-y-2.5 p-4.5 rounded-2xl liquid-glass-inner">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-black gap-2">
                    <span className="text-slate-800 truncate">مستوى إكمال المسار ({pw.completedCoursesCount} من {pw.coursesCount} دورات)</span>
                    <span className="text-[#173A7C] font-black shrink-0">{percent}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200/90 overflow-hidden shadow-inner">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-l from-[#0D5C3A] via-emerald-500 to-teal-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] sm:text-xs text-slate-500 font-extrabold">إجمالي الساعات التدريبية: {pw.durationHours} ساعة</span>
                  <Link
                    href="/dashboard/student/courses"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-[#173A7C]/20 hover:opacity-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>متابعة المسار</span>
                    <ChevronLeft className="w-4 h-4 shrink-0" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* BOOKS CONTENT */}
      {activeSection === 'books' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {books.map((book, idx) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + idx * 0.14, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-5 liquid-glass-card liquid-glass-hover student-card-accent"
            >
              {/* Book Cover Design */}
              <div className={`w-full h-48 rounded-2xl bg-gradient-to-br ${book.coverGradient} p-5 text-white flex flex-col justify-between relative shadow-lg overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <span className="inline-block text-xs font-black bg-white/25 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white self-start shadow-xs">
                  {book.category}
                </span>

                <div className="space-y-1 relative z-10">
                  <h4 className="text-sm font-black leading-snug drop-shadow-sm">{book.title}</h4>
                  <p className="text-[10px] text-white/80 font-bold">{book.author}</p>
                </div>
              </div>

              {/* Details */}
              <div className="flex items-center justify-between text-xs text-slate-600 font-extrabold px-1">
                <span>{book.pagesCount} صفحة</span>
                <span>الحجم: {book.fileSize}</span>
              </div>

              {/* Action Button */}
              {book.isUnlocked ? (
                <button
                  onClick={() => alert(`جاري تحميل ${book.title}...`)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-[#173A7C]/15 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>تحميل PDF مجاناً</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-slate-100 text-slate-400 text-xs font-black flex items-center justify-center gap-2 border border-slate-200/60 cursor-not-allowed"
                >
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>مغلق (مخصص لمستوى متقدم)</span>
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}
