'use client';

import React from 'react';
import { Award, BookOpen, Clock, TrendingUp, CheckCircle2, Download } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

interface ProgressCardProps {
  enrolledCoursesCount: number;
  completedCoursesCount: number;
  overallProgressPercent: number;
  certificatesCount: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.06,
    },
  },
};

const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const ProgressCard: React.FC<ProgressCardProps> = ({
  enrolledCoursesCount = 0,
  completedCoursesCount = 0,
  overallProgressPercent = 0,
  certificatesCount = 0,
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 font-[family-name:var(--font-cairo)]"
    >
      {/* 1. Overall Progress */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3.5 sm:p-6 min-h-[76px] sm:min-h-[120px] liquid-glass-card liquid-glass-hover flex items-center gap-3 sm:gap-4 group cursor-default"
      >
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#5CB07C] to-emerald-400" />
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-[#5CB07C] to-emerald-600 text-white shadow-md shadow-emerald-500/20 border border-white/30">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        <div className="space-y-0.5 sm:space-y-1 relative z-10 min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-[#173A7C] tracking-tight leading-none [text-shadow:_0_1px_0_rgba(255,255,255,0.35)]">
              %{overallProgressPercent}
            </span>
            <span className="text-xs sm:text-sm font-black text-[#173A7C] truncate [text-shadow:_0_1px_0_rgba(255,255,255,0.35)]">
              تقدم التعلم العام
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span className="truncate">أداء ممتاز ومستمر</span>
          </div>
        </div>
      </motion.div>

      {/* 2. Enrolled Courses */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3.5 sm:p-6 min-h-[76px] sm:min-h-[120px] liquid-glass-card liquid-glass-hover flex items-center gap-3 sm:gap-4 group cursor-default"
      >
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#173A7C] to-[#1E4D9D]" />
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20 border border-white/30">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        <div className="space-y-0.5 sm:space-y-1 relative z-10 min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-[#173A7C] tracking-tight leading-none [text-shadow:_0_1px_0_rgba(255,255,255,0.35)]">
              {enrolledCoursesCount}
            </span>
            <span className="text-xs sm:text-sm font-black text-[#173A7C] truncate [text-shadow:_0_1px_0_rgba(255,255,255,0.35)]">
              دورات مسجلة
            </span>
          </div>
          <p className="text-[10.5px] sm:text-[11px] text-[#173A7C] font-bold truncate">
            في خطتك الأكاديمية
          </p>
        </div>
      </motion.div>

      {/* 3. Completed Courses */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3.5 sm:p-6 min-h-[76px] sm:min-h-[120px] liquid-glass-card liquid-glass-hover flex items-center gap-3 sm:gap-4 group cursor-default"
      >
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 border border-white/30">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        <div className="space-y-0.5 sm:space-y-1 relative z-10 min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-[#173A7C] tracking-tight leading-none [text-shadow:_0_1px_0_rgba(255,255,255,0.35)]">
              {completedCoursesCount}
            </span>
            <span className="text-xs sm:text-sm font-black text-[#173A7C] truncate [text-shadow:_0_1px_0_rgba(255,255,255,0.35)]">
              دورات مكتملة
            </span>
          </div>
          <p className="text-[10.5px] sm:text-[11px] text-indigo-800 font-bold truncate">
            أنجزت متطلباتها
          </p>
        </div>
      </motion.div>

      {/* 4. Certificates Earned */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3.5 sm:p-6 min-h-[76px] sm:min-h-[120px] liquid-glass-card liquid-glass-hover flex items-center gap-3 sm:gap-4 group cursor-default"
      >
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-400 to-yellow-500" />
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-md shadow-amber-500/20 border border-white/30">
          <Award className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        <div className="space-y-0.5 sm:space-y-1 relative z-10 min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-black text-[#173A7C] tracking-tight leading-none [text-shadow:_0_1px_0_rgba(255,255,255,0.35)]">
              {certificatesCount}
            </span>
            <span className="text-xs sm:text-sm font-black text-[#173A7C] truncate [text-shadow:_0_1px_0_rgba(255,255,255,0.35)]">
              شهادات مكتسبة
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-amber-800">
            <Download className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span className="truncate">جاهزة للتحميل المباشر</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
