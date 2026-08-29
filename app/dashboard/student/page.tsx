'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { 
  Play, 
  BookOpen, 
  ArrowLeft, 
  Clock, 
  ShieldCheck, 
  Award, 
  Radio, 
  ExternalLink, 
  Video, 
  GraduationCap, 
  PlayCircle,
  Sparkles,
  Loader2,
  CheckCircle2,
  Compass
} from 'lucide-react';
import { ProgressCard } from '@/components/student/progress-card';
import { createClient } from '@/utils/supabase/client';
import { getCourseBySlug, courses as catalogCourses } from '@/data/courses';
import { getCourseAllLessons } from '@/lib/actions/student-actions';

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
    async function loadStudentData() {
      try {
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

          if (enrollError) {
            console.error('Enrollment query error:', enrollError);
          }

          if (enrollmentsData && enrollmentsData.length > 0) {
            // Deduplicate by clean slug, taking the highest progress
            const courseMap = new Map<string, EnrolledCourseItem>();

            enrollmentsData.forEach((e: any, idx: number) => {
              const cleanSlug = (e.course_id || '').replace(/^course-/, '');
              const matchedCatalog = getCourseBySlug(cleanSlug) || getCourseBySlug(e.course_id) || catalogCourses.find(c => c.title === e.course_title) || catalogCourses[idx % catalogCourses.length];
              const canonicalSlug = matchedCatalog?.slug || cleanSlug;
              
              // Calculate lessons count using the exact same logic as player
              const allCourseLessons = getCourseAllLessons(matchedCatalog);
              const totalLessons = Math.max(1, allCourseLessons.length);

              // Enrollment progress is the authoritative server value. Browser
              // storage is only a cache and must never grant completion.
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
                  title: e.course_title || matchedCatalog?.title || 'دورة تدريبية معتمدة',
                  instructor: matchedCatalog?.instructor || 'مدرب معتمد',
                  lessonsCount: totalLessons,
                  progressPercent: progress,
                  thumbnailUrl: matchedCatalog?.image || '/logo.webp',
                });
              }
            });

            setEnrolledCourses(Array.from(courseMap.values()));
          }
        }
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStudentData();

    const handleStorage = () => {
      loadStudentData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
      window.addEventListener('nabd_progress_updated', handleStorage);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener('nabd_progress_updated', handleStorage);
      }
    };
  }, []);

  const topCourse = enrolledCourses.length > 0
    ? (enrolledCourses.find(c => c.progressPercent > 0 && c.progressPercent < 100) || enrolledCourses.find(c => c.progressPercent === 0) || enrolledCourses[0])
    : {
        id: 'default',
        slug: 'diploma-tolerance-citizenship',
        title: 'دبلوم التسامح والسلام والمواطنة الصالحة',
        instructor: 'د. محمد القحطاني',
        lessonsCount: 18,
        progressPercent: 0,
        thumbnailUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
      };

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
      {enrolledCourses.length > 0 && (
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

          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover group student-card-accent">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent z-10" />
            <div className="absolute -top-20 -right-20 w-52 h-52 bg-[#173A7C]/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-[#5CB07C]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-stretch relative z-10">
              <div className="md:w-72 relative min-h-[160px] sm:min-h-[190px] overflow-hidden shrink-0 bg-gradient-to-br from-slate-50 to-blue-50/40 flex items-center justify-center p-5 border-b md:border-b-0 md:border-l border-slate-100">
                <img
                  src={topCourse.thumbnailUrl || '/logo.webp'}
                  alt={topCourse.title}
                  className="w-full h-full object-contain max-h-32 group-hover:scale-105 transition-transform duration-700 drop-shadow-sm"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-white/20 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-2.5 right-2.5 text-[10px] sm:text-[11px] font-black text-white px-3 py-1 rounded-full border border-white/30 shadow-lg"
                  style={{ background: 'rgba(23, 58, 124, 0.85)', backdropFilter: 'blur(14px)' }}
                >
                  🔒 مشغل محمي ومشفر
                </span>
              </div>

              <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between space-y-4 sm:space-y-5">
                <div className="space-y-3.5 sm:space-y-4">
                  <motion.div variants={textItemVariants}>
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#0D5C3A] mb-2.5">
                      <PlayCircle className="w-3.5 h-3.5 text-[#0D5C3A]" />
                      <span>{topCourse.progressPercent >= 100 ? '🎉 دورة مكتملة بنجاح' : 'الدرس الحالي للمتابعة'}</span>
                    </span>
                  </motion.div>

                  <motion.h3 variants={textItemVariants} className="student-heading-h3 pt-1">
                    {topCourse.title}
                  </motion.h3>

                  <motion.p variants={textItemVariants} className="student-text-body pt-1">
                    المدرب: {topCourse.instructor} · {topCourse.lessonsCount} درس تفاعلي
                  </motion.p>
                </div>

                <motion.div variants={textItemVariants} className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-black">
                    <span className="text-slate-900 flex items-center gap-1">
                      <span>إنجاز الدورة:</span>
                      <span className="text-[#173A7C] font-black">%{topCourse.progressPercent}</span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60"
                    style={{ background: 'rgba(241,245,249,0.8)' }}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#5CB07C] rounded-full transition-all duration-700 shadow-sm"
                      style={{ width: `${topCourse.progressPercent}%` }}
                    />
                  </div>
                </motion.div>

                <motion.div variants={textItemVariants} className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-[#0D5C3A] font-black">
                    <ShieldCheck className="w-4 h-4 text-[#0D5C3A]" />
                    مشغل محمي ومشفر بأحدث التقنيات
                  </div>

                  <Link
                    href={`/dashboard/student/courses/${topCourse.slug}/lessons/lesson-1`}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#173A7C]/20 hover:shadow-lg hover:shadow-[#173A7C]/30 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    <span>{topCourse.progressPercent >= 100 ? 'مراجعة الدورة والدروس' : topCourse.progressPercent > 0 ? 'متابعة الدرس الآن' : 'دخول الدرس الآن'}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {enrolledCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + idx * 0.14, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="relative overflow-hidden rounded-2xl sm:rounded-[24px] flex flex-col justify-between group min-h-[310px] sm:min-h-[330px] shadow-xl border border-white/30 transition-all duration-300 hover:shadow-2xl"
              >
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent z-10" />

                <div className="relative z-10 p-4 flex justify-between items-start">
                  <span
                    className="text-[10px] sm:text-[11px] font-black text-white px-3 py-1 rounded-full border border-white/30 shadow-lg"
                    style={{ background: 'rgba(23, 58, 124, 0.85)', backdropFilter: 'blur(12px)' }}
                  >
                    {course.lessonsCount} درس معتمد
                  </span>

                  <div
                    className="px-3 py-1 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/40 shadow-lg flex items-center gap-1"
                    style={{ background: 'rgba(5, 46, 22, 0.85)', backdropFilter: 'blur(12px)' }}
                  >
                    <span>مكتمل:</span>
                    <span className="text-emerald-400 font-black text-sm">%{course.progressPercent}</span>
                  </div>
                </div>

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

                  <div className="space-y-1.5">
                    <div className="w-full h-2 rounded-full overflow-hidden p-0.5 border border-white/20 bg-slate-900/80">
                      <div
                        className="h-full bg-gradient-to-r from-[#5CB07C] via-emerald-400 to-teal-300 rounded-full transition-all duration-700 shadow-xs"
                        style={{ width: `${course.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <Link
                      href={`/dashboard/student/courses/${course.slug}/lessons/lesson-1`}
                      className="w-full py-2.5 rounded-xl bg-white/95 hover:bg-[#173A7C] text-[#173A7C] hover:text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all duration-300 border border-white/60 hover:border-[#173A7C] shadow-lg cursor-pointer active:scale-98"
                    >
                      <span>{course.progressPercent >= 100 ? 'مراجعة الدروس (مكتمل)' : course.progressPercent > 0 ? 'متابعة الدورة' : 'ابدأ الدورة الآن'}</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
