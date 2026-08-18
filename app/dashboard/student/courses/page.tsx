'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  BookOpen,
  GraduationCap,
  Loader2,
  PlayCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  Library,
  BookCheck,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getCourseBySlug, courses as catalogCourses } from '@/data/courses';
import { getCompletedLessons, getCourseAllLessons } from '@/lib/actions/student-actions';

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
  completedLessons: number;
  progressPercent: number;
  thumbnailUrl: string;
}

export default function StudentCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [myCourses, setMyCourses] = useState<EnrolledCourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;

        if (user) {
          const userEmail = user.email ? user.email.toLowerCase().trim() : '';
          const { data: enrollmentsData } = await supabase
            .from('enrollments')
            .select('*')
            .eq('email', userEmail)
            .order('enrolled_at', { ascending: false });

          if (enrollmentsData && enrollmentsData.length > 0) {
            const courseMap = new Map<string, EnrolledCourseItem>();

            enrollmentsData.forEach((e: any, idx: number) => {
              const cleanSlug = (e.course_id || '').replace(/^course-/, '');
              const matchedCatalog =
                getCourseBySlug(cleanSlug) ||
                getCourseBySlug(e.course_id) ||
                catalogCourses.find((c) => c.title === e.course_title) ||
                catalogCourses[idx % catalogCourses.length];
              const canonicalSlug = matchedCatalog?.slug || cleanSlug;

              const allCourseLessons = getCourseAllLessons(matchedCatalog);
              const totalLessons = Math.max(1, allCourseLessons.length);

              const localCompleted = getCompletedLessons(canonicalSlug);
              const completedInCourse = allCourseLessons.filter((l) => localCompleted.has(l.id)).length;

              let progress = 0;
              if (completedInCourse > 0) {
                progress = Math.min(100, Math.round((completedInCourse / totalLessons) * 100));
              } else if (e.progress !== undefined && e.progress !== null) {
                progress = Math.min(100, Math.max(0, Number(e.progress)));
              }

              const completed = completedInCourse > 0 ? completedInCourse : Math.round((progress / 100) * totalLessons);

              if (courseMap.has(canonicalSlug)) {
                const existing = courseMap.get(canonicalSlug)!;
                if (progress > existing.progressPercent) {
                  existing.progressPercent = progress;
                  existing.completedLessons = completed;
                }
              } else {
                courseMap.set(canonicalSlug, {
                  id: e.id || `enr-${idx}`,
                  slug: canonicalSlug,
                  title: e.course_title || matchedCatalog?.title || 'دورة تدريبية معتمدة',
                  instructor: matchedCatalog?.instructor || 'مدرب معتمد',
                  lessonsCount: totalLessons,
                  completedLessons: completed,
                  progressPercent: progress,
                  thumbnailUrl: matchedCatalog?.image || '/logo.webp',
                });
              }
            });

            setMyCourses(Array.from(courseMap.values()));
          }
        }
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();

    const handleStorage = () => {
      loadCourses();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
      window.addEventListener('nabd_progress_updated', handleStorage);
      window.addEventListener('nabd_courses_updated', handleStorage);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener('nabd_progress_updated', handleStorage);
        window.removeEventListener('nabd_courses_updated', handleStorage);
      }
    };
  }, []);

  const completedCount = myCourses.filter((c) => c.progressPercent >= 100).length;
  const inProgressCount = myCourses.filter((c) => c.progressPercent < 100).length;

  const filteredEnrolled = myCourses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === 'in_progress') return c.progressPercent < 100;
    if (filterTab === 'completed') return c.progressPercent >= 100;
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 pt-2.5 sm:pt-0 font-[family-name:var(--font-cairo)]" dir="rtl">
      {/* Header Banner - Liquid Glass */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative z-20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-9 space-y-4 liquid-glass-hero liquid-glass-hover overflow-hidden student-card-accent"
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-br from-blue-600/15 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 pr-2">
            <motion.div
              variants={textItemVariants}
              className="student-tag-badge bg-blue-50/90 text-[#173A7C] border border-blue-200/80 shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#173A7C]" />
              <span>المساقات المسجل بها فقط</span>
            </motion.div>

            <motion.h1 variants={textItemVariants} className="student-heading-h1">
              دوراتي التدريبية <span className="student-name-gradient">المشترك بها</span> 🎓
            </motion.h1>

            <motion.p
              variants={textItemVariants}
              className="student-text-body max-w-xl pr-0.5 pt-1.5 sm:pt-2 leading-relaxed"
            >
              تابع دروسك الحالية، استكمل المشاهدة، وتتبع نسبة إنجازك في المساقات المسجل بها.
            </motion.p>
          </div>

          <motion.div
            variants={textItemVariants}
            className="flex items-center justify-around gap-2 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white/90 border border-white/80 backdrop-blur-md shadow-xs shrink-0"
          >
            <div className="text-center px-3 border-l border-slate-200">
              <span className="block text-base sm:text-lg font-black text-[#173A7C]">{myCourses.length}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-600 font-bold whitespace-nowrap">
                إجمالي دوراتي
              </span>
            </div>
            <div className="text-center px-3 border-l border-slate-200">
              <span className="block text-base sm:text-lg font-black text-amber-600">{inProgressCount}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-600 font-bold whitespace-nowrap">
                قيد التقدم
              </span>
            </div>
            <div className="text-center px-3">
              <span className="block text-base sm:text-lg font-black text-[#0D5C3A]">{completedCount}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-600 font-bold whitespace-nowrap">
                دورات مكتملة
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في دوراتك المسجل بها..."
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-white/90 border border-slate-200/80 text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#173A7C]/20 focus:border-[#173A7C] transition-all shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-white/80 border border-slate-200/80 rounded-2xl shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-[#173A7C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({myCourses.length})
          </button>
          <button
            onClick={() => setFilterTab('in_progress')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              filterTab === 'in_progress'
                ? 'bg-[#173A7C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            قيد التقدم ({inProgressCount})
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              filterTab === 'completed'
                ? 'bg-[#173A7C] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المكتملة ({completedCount})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <motion.div variants={sectionFadeVariants} initial="hidden" animate="visible" custom={1} className="space-y-6">
        {loading ? (
          <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
            <p className="text-xs font-bold text-slate-500">جاري تحميل دوراتك المشترك بها...</p>
          </div>
        ) : filteredEnrolled.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEnrolled.map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.08, duration: 0.55 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 bg-white/95"
                >
                  <div>
                    {/* Top Image Section with Clean Light Glow */}
                    <div className="relative h-44 sm:h-48 rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-6 flex items-center justify-center overflow-hidden border border-slate-100/90 group-hover:border-blue-100 transition-colors mb-4">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={course.thumbnailUrl || '/logo.webp'}
                          alt={course.title}
                          className="max-h-28 sm:max-h-32 w-auto object-contain p-2 opacity-95 group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                        />
                      </div>

                      {/* Lessons Badge on Top-Right */}
                      <div className="absolute top-3 right-3 z-20">
                        <span className="px-3 py-1 rounded-full text-[11px] font-black bg-white/90 text-[#173A7C] border border-blue-100/80 shadow-xs backdrop-blur-md">
                          {course.completedLessons} من {course.lessonsCount} درس
                        </span>
                      </div>

                      {/* Progress Badge on Top-Left */}
                      <div className="absolute top-3 left-3 z-20">
                        <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-600 text-white shadow-xs backdrop-blur-md">
                          مكتمل: %{course.progressPercent}
                        </span>
                      </div>
                    </div>

                    {/* Title & Instructor */}
                    <div className="space-y-1.5">
                      <h3 className="text-base font-black text-slate-900 group-hover:text-[#173A7C] transition-colors leading-snug line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-[#173A7C] shrink-0" />
                        <span>{course.instructor}</span>
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar & Actions */}
                  <div className="space-y-3.5 pt-4 mt-4 border-t border-slate-100">
                    <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-black">
                        <span className="text-slate-700">مستوى الإنجاز</span>
                        <span className="text-[#173A7C]">%{course.progressPercent}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#173A7C] to-[#5CB07C] rounded-full transition-all duration-500"
                          style={{ width: `${course.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/student/courses/${course.slug}/lessons/lesson-1`}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#2A65C7] text-white font-black text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-xs hover:shadow-md active:scale-98"
                    >
                      <PlayCircle className="w-4 h-4 text-emerald-300" />
                      <span>
                        {course.progressPercent >= 100
                          ? 'مراجعة الدروس (مكتمل)'
                          : course.progressPercent > 0
                          ? 'متابعة الدراسة (دخول المشغل)'
                          : 'بدء المساق الآن'}
                      </span>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          /* Clean Empty State */
          <div className="p-8 sm:p-12 rounded-3xl bg-white/90 border border-slate-200 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-[#173A7C] flex items-center justify-center border border-blue-100">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                {searchQuery ? 'لا توجد دورات تطابق بحثك' : 'لا توجد دورات في هذا القسم'}
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                {searchQuery
                  ? 'جرب البحث بكلمات أخرى أو تحقق من تهجئة اسم الدورة.'
                  : 'يمكنك استكشاف مكتبة الدورات والكتب التدريبية والانضمام لأي مساق جديد.'}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard/student/pathways"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white text-xs font-black shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <Library className="w-4 h-4" />
                <span>استعراض مكتبة الدورات والكتب 🚀</span>
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
