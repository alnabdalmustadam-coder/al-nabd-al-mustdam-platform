'use client';

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Play, BookOpen, ArrowLeft, Clock, ShieldCheck, Award, Radio, ExternalLink, Video, GraduationCap, PlayCircle } from 'lucide-react';
import { StudentSidebar } from '@/components/student/student-sidebar';
import { ProgressCard } from '@/components/student/progress-card';

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

export default function StudentDashboardPage() {
  const studentName = 'عبدالله الشمري';
  const continueCourse = {
    title: 'دبلوم التسامح والسلام والمواطنة الصالحة',
    currentLessonTitle: 'الدرس الثالث: قيم التعايش والتسامح في الفكر الإسلامي',
    lessonId: 'lesson-1',
    courseSlug: 'diploma-tolerance-citizenship',
    progressPercent: 45,
    thumbnailUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    durationLeft: '15 دقيقة متبقية',
  };

  const myCourses = [
    {
      id: 'c-1',
      slug: 'diploma-tolerance-citizenship',
      title: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      instructor: 'د. محمد القحطاني',
      lessonsCount: 18,
      progressPercent: 45,
      thumbnailUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'c-2',
      slug: 'sustainable-leadership',
      title: 'برنامج القيادة المستدامة والمسؤولية المجتمعية',
      instructor: 'أ. د. سارة العتيبي',
      lessonsCount: 12,
      progressPercent: 80,
      thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'c-3',
      slug: 'institutional-excellence',
      title: 'شهادة التميز المؤسسي والجودة الحوكمية',
      instructor: 'د. خالد الدوسري',
      lessonsCount: 24,
      progressPercent: 10,
      thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-10 pt-2.5 sm:pt-0 font-[family-name:var(--font-cairo)]">
      {/* Hero Banner Ultra Premium - Liquid Glass Theme (Spacious & Elegant) */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative z-20 liquid-glass-hero p-6 sm:p-8 md:p-9 space-y-4 sm:space-y-6 liquid-glass-hover overflow-hidden student-card-accent rounded-2xl sm:rounded-3xl"
      >
        {/* Ambient Liquid Glowing Orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-br from-blue-600/15 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-4 pr-1 sm:pr-2">
            <motion.div variants={textItemVariants} className="flex items-center gap-2 pr-0.5 sm:pr-1">
              <h1 className="student-heading-h1">
                مرحباً بك، <span className="text-base">👋</span> <span className="student-name-gradient">{studentName}</span>
              </h1>
            </motion.div>

            <motion.p variants={textItemVariants} className="student-text-body max-w-xl pr-0.5 pt-1.5 sm:pt-2.5 leading-relaxed">
              جاهز لاستكمال مسيرتك التعليمية اليوم؟ تصفح دروسك المشفرة، تابع تقدمك التفاعلي وحصّل شهاداتك الموثقة رسمياً.
            </motion.p>
          </div>

          <motion.div variants={textItemVariants} className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto shrink-0 pt-1 md:pt-0">
            <Link
              href={`/dashboard/student/courses/${continueCourse.courseSlug}/lessons/${continueCourse.lessonId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-[#173A7C]/25 transition-all duration-300 transform hover:-translate-y-0.5 group border border-white/30 truncate cursor-pointer active:scale-95"
            >
              <div className="w-4 h-4 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                <Play className="w-2.5 h-2.5 fill-current text-white" />
              </div>
              <span className="truncate">متابعة الدرس الحالي</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Student Progress Stats Cards */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <ProgressCard
          enrolledCoursesCount={myCourses.length}
          completedCoursesCount={1}
          overallProgressPercent={45}
          certificatesCount={1}
        />
      </motion.div>

      {/* Continue Learning Highlighted Card */}
      <motion.section
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={2}
        className="space-y-5 sm:space-y-6"
      >
        <div className="flex items-center justify-between pb-1">
          <motion.h2 variants={textItemVariants} className="student-heading-h2 flex items-center gap-2.5 pr-2.5 border-r-4 border-emerald-400">
            <div className="p-2 rounded-xl text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
            <span>واصل التعلم من حيث توقفت</span>
          </motion.h2>
        </div>

        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover group student-card-accent">
          {/* Glass top highlight specular line */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent z-10" />
          {/* Soft colored fluid orb */}
          <div className="absolute -top-20 -right-20 w-52 h-52 bg-[#173A7C]/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-[#5CB07C]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-stretch relative z-10">
            <div className="md:w-72 relative min-h-[160px] sm:min-h-[190px] overflow-hidden shrink-0">
              <img
                src={continueCourse.thumbnailUrl}
                alt={continueCourse.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent" />
              <span className="absolute top-2.5 right-2.5 text-[10px] sm:text-[11px] font-bold text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/30 shadow-lg"
                style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(14px)' }}
              >
                🔒 مشغل محمي ومشفر
              </span>
            </div>

            <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between space-y-4 sm:space-y-5">
              <div className="space-y-3.5 sm:space-y-4">
                <motion.div variants={textItemVariants}>
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#0D5C3A] mb-2.5" style={{ textShadow: '0 1px 0px rgba(255,255,255,0.6)' }}>
                    <PlayCircle className="w-3.5 h-3.5 text-[#0D5C3A]" />
                    <span>الدرس الحالي للمتابعة</span>
                  </span>
                </motion.div>

                <motion.h3 variants={textItemVariants} className="student-heading-h3 pt-1">
                  {continueCourse.currentLessonTitle}
                </motion.h3>

                <motion.p variants={textItemVariants} className="student-text-body pt-1">{continueCourse.title}</motion.p>
              </div>

              <motion.div variants={textItemVariants} className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs sm:text-sm font-black">
                  <span className="text-slate-900 flex items-center gap-1">
                    <span>إنجاز الدرس:</span>
                    <span className="text-[#173A7C] font-black">{continueCourse.progressPercent}%</span>
                  </span>
                  <span className="text-slate-800 font-extrabold flex items-center gap-1.5 bg-slate-100/90 px-3.5 py-1.5 rounded-xl border border-slate-200/80 text-xs shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-[#173A7C]" />
                    <span>{continueCourse.durationLeft}</span>
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60"
                  style={{ background: 'rgba(241,245,249,0.8)' }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#5CB07C] rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${continueCourse.progressPercent}%` }}
                  />
                </div>
              </motion.div>

              <motion.div variants={textItemVariants} className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
                <div className="flex items-center gap-1.5 text-xs text-[#0D5C3A] font-black" style={{ textShadow: '0 1px 0px rgba(255,255,255,0.6)' }}>
                  <ShieldCheck className="w-4 h-4 text-[#0D5C3A]" />
                  مشغل محمي ومشفر بأحدث التقنيات
                </div>

                <Link
                  href={`/dashboard/student/courses/${continueCourse.courseSlug}/lessons/${continueCourse.lessonId}`}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#173A7C]/20 hover:shadow-lg hover:shadow-[#173A7C]/30 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                >
                  <span>دخول الدرس الآن</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Live Session Alert Banner Widget */}
      <motion.section
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={3}
        className="relative rounded-3xl p-6 sm:p-7 liquid-glass-hero space-y-5 sm:space-y-6 overflow-hidden liquid-glass-hover student-card-accent"
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
          <div className="space-y-3 sm:space-y-3.5 pr-2">
            <motion.div variants={textItemVariants} className="flex items-center gap-2 pr-1">
              <div className="p-1 rounded-lg bg-red-500 text-white shadow-sm shrink-0 animate-pulse">
                <Radio className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-red-600 bg-red-50/90 px-3.5 py-1 rounded-full border border-red-200 shadow-xs">
                  بث مباشر قادم 🔴
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium">الأربعاء 29 يوليو • 08:00 مساءً بتوقيت مكة</span>
              </div>
            </motion.div>

            <motion.h3 variants={textItemVariants} className="student-heading-h3 pr-0.5 pt-1">
              ورشة عمل تفاعلية: تطبيقات الحوار الإيجابي وتجنب النزاعات المؤسسية
            </motion.h3>

            <motion.p variants={textItemVariants} className="student-text-body max-w-2xl pr-0.5 pt-1">
              يقدمها د. عبدالله الشمري — يحصل جميع الحاضرين على 3 ساعات معتمدة وتوثيق تلقائي في سجل الساعات التفاعلية.
            </motion.p>
          </div>

          <motion.div variants={textItemVariants} className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
            <Link
              href="/dashboard/student/live"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#173A7C] hover:from-[#173A7C] hover:to-slate-900 text-white font-bold text-xs shadow-md transition-all duration-300 transform hover:-translate-y-0.5 group border border-white/20 active:scale-95 cursor-pointer"
            >
              <span>الانضمام للقاعة المباشرة</span>
              <ArrowLeft className="w-3.5 h-3.5 text-[#5CB07C] group-hover:-translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Enrolled Courses Grid */}
      <motion.section
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={4}
        className="space-y-5 sm:space-y-6"
      >
        <div className="flex items-center justify-between pb-1">
          <motion.h2 variants={textItemVariants} className="student-heading-h2 flex items-center gap-2.5 pr-2.5 border-r-4 border-emerald-400">
            <div className="p-2 rounded-xl text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <span>دوراتي التدريبية المعتمدة</span>
          </motion.h2>
          <motion.div variants={textItemVariants}>
            <Link href="/dashboard/student/courses" className="text-xs text-sky-300 hover:text-white font-bold flex items-center gap-1 transition-colors">
              <span>عرض جميع الدورات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {myCourses.map((course, idx) => (
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
              <div className="relative z-10 p-4 flex justify-between items-start">
                <span
                  className="text-[10px] sm:text-[11px] font-black text-white px-3 py-1 rounded-full border border-white/30 shadow-lg"
                  style={{ background: 'rgba(23, 58, 124, 0.85)', backdropFilter: 'blur(12px)' }}
                >
                  {course.lessonsCount} درس معتمد
                </span>

                {/* Contrasting Completion Pill Tag */}
                <div
                  className="px-3 py-1 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/40 shadow-lg flex items-center gap-1"
                  style={{ background: 'rgba(5, 46, 22, 0.85)', backdropFilter: 'blur(12px)' }}
                >
                  <span>مكتمل:</span>
                  <span className="text-emerald-400 font-black text-sm">%{course.progressPercent}</span>
                </div>
              </div>

              {/* Card Content & Footer */}
              <div className="relative z-10 p-5 space-y-3.5 pt-12">
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
                    className="w-full py-2.5 rounded-xl bg-white/95 hover:bg-[#173A7C] text-[#173A7C] hover:text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all duration-300 border border-white/60 hover:border-[#173A7C] shadow-lg cursor-pointer active:scale-98"
                  >
                    <span>استعراض المحاضرات</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
