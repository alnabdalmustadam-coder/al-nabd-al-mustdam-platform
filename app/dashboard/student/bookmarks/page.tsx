'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Bookmark, ArrowLeft, BookmarkCheck, BookOpen } from 'lucide-react';
import { getAllSavedNotes } from '@/lib/actions/student-actions';

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

export default function StudentBookmarksPage() {
  const [bookmarks, setBookmarks] = useState<{
    id: string;
    lessonTitle: string;
    courseTitle: string;
    text: string;
    date: string;
    courseSlug: string;
    lessonId: string;
  }[]>([]);

  useEffect(() => {
    const notes = getAllSavedNotes();
    setBookmarks(notes);
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
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
              <Bookmark className="w-3.5 h-3.5 text-[#173A7C]" />
              <span>الأرشيف الشخصي والمراجعات</span>
            </motion.div>

            <motion.h1 variants={textItemVariants} className="student-heading-h1">
              الملاحظات و<span className="student-name-gradient">المحفوظات</span> 📌
            </motion.h1>

            <motion.p variants={textItemVariants} className="student-text-body max-w-xl pr-0.5 pt-1.5 sm:pt-2 leading-relaxed">
              جميع الملاحظات والنقاط الإضافية التي قمت بتدوينها أثناء مشاهدة وتصفح المحاضرات.
            </motion.p>
          </div>

          <motion.div variants={textItemVariants} className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 text-[#173A7C] text-xs font-black border border-white/80 shadow-xs backdrop-blur-md">
              <BookmarkCheck className="w-4 h-4 text-[#173A7C]" />
              <span>{bookmarks.length} ملاحظات محفوظة</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bookmarks List - Unified Liquid Glass Cards */}
      <div className="space-y-4">
        {bookmarks.map((bm, idx) => (
          <motion.div
            key={bm.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + idx * 0.14, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl sm:rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 liquid-glass-card liquid-glass-hover student-card-accent"
          >
            <div className="space-y-3 flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#0D5C3A] mb-1" style={{ textShadow: '0 1px 0px rgba(255,255,255,0.6)' }}>
                <BookOpen className="w-3.5 h-3.5 text-[#0D5C3A]" />
                <span>{bm.courseTitle}</span>
              </span>
              <h3 className="student-heading-h3">{bm.lessonTitle}</h3>
              <div className="p-4 sm:p-5 rounded-2xl liquid-glass-inner">
                <p className="text-xs sm:text-sm text-slate-800 font-bold leading-relaxed">"{bm.text || (bm as any).noteText}"</p>
              </div>
              <span className="text-xs text-[#0D5C3A] font-black block pt-0.5">{bm.date}</span>
            </div>

            <div className="shrink-0 w-full md:w-auto pt-2 md:pt-0">
              <Link
                href={`/dashboard/student/courses/${bm.courseSlug}/lessons/${bm.lessonId}`}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-[#173A7C]/20 cursor-pointer whitespace-nowrap"
              >
                <span>الانتقال للدرس</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
