'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { BookOpen, ArrowLeft, Clock, Loader2, Compass } from 'lucide-react';
import { ProgressCard } from '@/components/student/progress-card';
import { createClient } from '@/utils/supabase/client';
import { findCourseByIdentifier, fetchPublicCourses } from "@/lib/public-courses";
import { getCourseAllLessons } from '@/lib/actions/student-actions';
import { StudentCourseCard } from '@/components/student/student-course-card';

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

interface EnrolledCourseItem {
  id: string;
  slug: string;
  title: string;
  instructor: string;
  lessonsCount: number;
  progressPercent: number;
  thumbnailUrl: string;
}

export default function StudentDashboardPage() {
  const [studentName, setStudentName] = useState('المتدرب المتميز');
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let requestVersion = 0;
    async function loadStudentData() {
      const version = ++requestVersion;
      try {
        const liveCatalog = await fetchPublicCourses();
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;

        if (user) {
          // Fetch profile name
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.full_name) {
            setStudentName(profile.full_name);
          } else if (user.user_metadata?.full_name) {
            setStudentName(user.user_metadata.full_name);
          }

          // Fetch enrolled courses from Supabase
          const userEmail = user.email ? user.email.toLowerCase().trim() : '';
          const { data: enrollmentsData, error: enrollError } = await supabase
            .from('enrollments')
            .select('*')
            .eq('email', userEmail)
            .order('enrolled_at', { ascending: false });
          if (!active || version !== requestVersion) return;

          if (enrollError) {
            console.error('Enrollment query error:', enrollError);
          }

          if (enrollmentsData && enrollmentsData.length > 0) {
            // Deduplicate by clean slug, taking the highest progress
            const courseMap = new Map<string, EnrolledCourseItem>();

            enrollmentsData.forEach((e, idx: number) => {
              const cleanSlug = (e.course_id || '').replace(/^course-/, '');
              const matchedCatalog = findCourseByIdentifier(liveCatalog, cleanSlug) ||
                liveCatalog.find((c) => c.title === e.course_title) ||
                null;
              // Keep enrollment records in storage; only offer currently published courses.
              if (!matchedCatalog) return;
              const canonicalSlug = matchedCatalog.slug;
              
              // Calculate lessons count using the exact same logic as player
              const allCourseLessons = matchedCatalog ? getCourseAllLessons(matchedCatalog) : [];
              const totalLessons = Math.max(1, allCourseLessons.length);

              // Enrollment progress is the authoritative server value.
              const progress = e.progress !== undefined && e.progress !== null
                ? Math.min(100, Math.max(0, Number(e.progress)))
                : 0;

              if (courseMap.has(canonicalSlug)) {
                const existing = courseMap.get(canonicalSlug)!;
                if (progress > existing.progressPercent) {
                  existing.progressPercent = progress;
                }
              } else {
                courseMap.set(canonicalSlug, {
                  id: e.id || `enr-${idx}`,
                  slug: canonicalSlug,
                  title: matchedCatalog?.title || e.course_title || 'دورة تدريبية معتمدة',
                  instructor: matchedCatalog?.instructor || 'مدرب معتمد',
                  lessonsCount: totalLessons,
                  progressPercent: progress,
                  thumbnailUrl: matchedCatalog?.image || '/logo.webp',
                });
              }
            });

            setEnrolledCourses(Array.from(courseMap.values()));
          } else {
            setEnrolledCourses([]);
          }
        }
      } catch (err) {
        if (!active || version !== requestVersion) return;
        setEnrolledCourses([]);
        console.error('Error fetching student dashboard data:', err);
      } finally {
        if (active && version === requestVersion) setLoading(false);
      }
    }

    loadStudentData();

    const handleStorage = () => {
      loadStudentData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
      window.addEventListener('nabd_progress_updated', handleStorage);
      window.addEventListener('nabd_courses_updated', handleStorage);
      window.addEventListener('focus', handleStorage);
    }

    return () => {
      active = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener('nabd_progress_updated', handleStorage);
        window.removeEventListener('nabd_courses_updated', handleStorage);
        window.removeEventListener('focus', handleStorage);
      }
    };
  }, []);

  const topCourse = enrolledCourses.find(c => c.progressPercent > 0 && c.progressPercent < 100)
    || enrolledCourses.find(c => c.progressPercent === 0) || enrolledCourses[0];

  const completedCoursesCount = enrolledCourses.filter(c => c.progressPercent >= 100).length;
  const overallProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((sum, c) => sum + c.progressPercent, 0) / enrolledCourses.length)
    : 0;

  return (
    <div className="space-y-4 sm:space-y-10 pt-2.5 sm:pt-0 font-[family-name:var(--font-cairo)]" dir="rtl">
      {/* Hero Banner Ultra Premium - Liquid Glass Theme */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative z-20 liquid-glass-hero p-6 sm:p-8 md:p-9 space-y-4 sm:space-y-6 liquid-glass-hover overflow-hidden student-card-accent rounded-2xl sm:rounded-3xl"
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-br from-blue-600/15 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-4 pr-1 sm:pr-2">
            <motion.div variants={textItemVariants} className="flex items-center gap-2 pr-0.5 sm:pr-1">
              <h1 className="student-heading-h1">
                مرحباً بك، <span className="text-base">👋</span> <span className="student-name-gradient">{studentName}</span>
              </h1>
            </motion.div>

            <motion.p variants={textItemVariants} className="student-text-body max-w-xl">
              لوحة التحكم الذكية لمتابعة تقدمك في الدورات المعتمدة، استعراض المناهج التفاعلية، والحصول على شهاداتك الوطنية.
            </motion.p>
          </div>

          <motion.div variants={textItemVariants} className="flex items-center gap-3">
            <Link
              href="/dashboard/student/courses"
              className="px-5 py-3 rounded-2xl bg-white/90 hover:bg-white text-[#173A7C] font-extrabold text-xs flex items-center gap-2 transition-all shadow-md hover:shadow-lg border border-slate-200/80 active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-[#173A7C]" />
              <span>جميع دوراتي</span>
            </Link>

            <Link
              href="/courses"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-md shadow-[#173A7C]/20 hover:shadow-lg hover:shadow-[#173A7C]/30 active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>استكشف الدورات</span>
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
          enrolledCoursesCount={enrolledCourses.length}
          completedCoursesCount={completedCoursesCount}
          overallProgressPercent={overallProgress}
          certificatesCount={completedCoursesCount}
        />
      </motion.div>

      {/* Continue Learning Highlighted Card */}
      {topCourse && (
        <motion.section
          variants={sectionFadeVariants}
          initial="hidden"
          animate="visible"
          custom={2}
          className="space-y-5 sm:space-y-6"
        >
          <div className="flex items-center justify-between pb-1">
            <motion.h2 variants={textItemVariants} className="student-heading-h2 flex items-center gap-2.5 pr-2.5 border-r-4 border-[#5CB07C]">
              <div className="p-2 rounded-xl text-[#0D5C3A] bg-emerald-100/90 border border-emerald-300/80 shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
              <span>{topCourse.progressPercent >= 100 ? 'الدورة التدريبية المكتملة' : 'واصل التعلم من حيث توقفت'}</span>
            </motion.h2>
          </div>

          <StudentCourseCard course={topCourse} featured />
        </motion.section>
      )}

      {/* Enrolled Courses Grid */}
      <motion.section
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={4}
        className="space-y-5 sm:space-y-6"
      >
        <div className="flex items-center justify-between pb-1">
          <motion.h2 variants={textItemVariants} className="student-heading-h2 flex items-center gap-2.5 pr-2.5 border-r-4 border-[#5CB07C]">
            <div className="p-2 rounded-xl text-[#0D5C3A] bg-emerald-100/90 border border-emerald-300/80 shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <span>دوراتي التدريبية المعتمدة ({enrolledCourses.length})</span>
          </motion.h2>
          {enrolledCourses.length > 0 && (
            <motion.div variants={textItemVariants}>
              <Link href="/dashboard/student/courses" className="text-xs text-[#173A7C] hover:text-[#1E4D9D] font-black flex items-center gap-1 transition-colors">
                <span>عرض جميع الدورات</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          )}
        </div>

        {loading ? (
          <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
            <p className="text-xs font-bold text-slate-500">جاري مزامنة دوراتك من قاعدة البيانات...</p>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="p-10 sm:p-14 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#173A7C]/10 text-[#173A7C] flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">لم تقم بالتسجيل في أي دورة بعد</h3>
              <p className="text-xs font-bold text-slate-500 max-w-md mx-auto">
                استكشف مكتبة البرامج التدريبية المعتمدة واشترك لتبدأ مسيرتك المهنية فوراً.
              </p>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white font-black text-xs shadow-md hover:shadow-lg transition-all"
            >
              <span>استكشاف الدورات المتاحة</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {enrolledCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + idx * 0.14, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="h-full min-w-0"
              >
                <StudentCourseCard course={course} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
