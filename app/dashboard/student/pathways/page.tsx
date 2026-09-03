'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Award,
  Download,
  CheckCircle,
  Play,
  Library,
  Clock,
  Sparkles,
  Search,
  FileText,
  Eye,
  GraduationCap,
  ArrowRight
} from 'lucide-react';
import { CardImage } from '@/components/ui/CardImage';
import { courses as allCatalogCourses } from '@/data/courses';
import { Course } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { getCourseAllLessons } from '@/lib/actions/student-actions';

const sectionFadeVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.14,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
      delayChildren: custom * 0.14 + 0.06,
    },
  }),
};

const textItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// 9 Official Accredited Course Books & Reference Guides
const digitalBooks = [
  {
    id: 'bk-comp',
    courseSlug: 'computer-basics-office',
    title: 'الحقيبة التدريبية الشاملة: تطبيقات الحاسب الآلي في الأعمال المكتبية',
    courseTitle: 'دورة استخدام الحاسب الالي في الاعمال المكتبية',
    author: 'أ. د. خالد الشمري · المشرف الأكاديمي',
    category: 'أعمال مكتبية وإدارة',
    fileSize: '18.4 MB',
    pagesCount: 220,
    coverGradient: 'from-[#173A7C] to-[#1E4D9D]',
    description: 'دليل تدريبي مرجعي يغطي احتراف أنظمة التشغيل، تحرير المستندات في Word، الجداول المحاسبية في Excel، وتصميم العروض التفاعلية.',
  },
  {
    id: 'bk-data',
    courseSlug: 'data-entry-word-processing',
    title: 'دليل المهارات المتقدمة: سرعة وجودة إدخال البيانات ومعالجة النصوص',
    courseTitle: 'دورات ادخال بيانات ومعالجة نصوص',
    author: 'م. فهد السبيعي · خبير التدقيق المكتبي',
    category: 'إدخال بيانات',
    fileSize: '14.2 MB',
    pagesCount: 175,
    coverGradient: 'from-emerald-700 to-teal-900',
    description: 'تمارين تطبيقية لرفع سرعة الطباعة باللمس، إعداد الخطابات الرسمية وفق المعايير الحكومية، وضمان دقة السجلات وقواعد البيانات.',
  },
  {
    id: 'bk-eng',
    courseSlug: 'english-language-course',
    title: 'المرجع الشامل: إتقان المحادثة والقواعد والمراسلات المهنية بالإنجليزية',
    courseTitle: 'دورة اللغة الانجليزية',
    author: 'د. سارة المنصور · أخصائية اللغويات التطبيقية',
    category: 'لغات ومهارات تواصل',
    fileSize: '22.8 MB',
    pagesCount: 260,
    coverGradient: 'from-blue-700 to-indigo-900',
    description: 'منهج متكامل للمحادثات اليومية في بيئات العمل، كتابة البريد الإلكتروني الرسمي، وبناء التراكيب اللغوية بثقة وسلاسة.',
  },
  {
    id: 'bk-ai',
    courseSlug: 'ai-course',
    title: 'دليل التطبيقات العملية: الذكاء الاصطناعي التوليدي وهندسة الأوامر',
    courseTitle: 'دورة الذكاء الاصطناعي',
    author: 'م. أحمد الحربي · استشاري الذكاء الاصطناعي',
    category: 'تقنية وذكاء اصطناعي',
    fileSize: '16.5 MB',
    pagesCount: 195,
    coverGradient: 'from-purple-800 to-indigo-950',
    description: 'شرح مفصل لنماذج الذكاء الاصطناعي، توظيف أدوات Prompt Engineering لرفع الإنتاجية، وحوكمة وأخلاقيات الأمان الرقمي.',
  },
  {
    id: 'bk-cyber',
    courseSlug: 'cybersecurity-analyst',
    title: 'دليل محلل الأمن السيبراني: حماية الشبكات والاستجابة للحوادث الرقمية',
    courseTitle: 'دورة محلل الأمن السيبراني',
    author: 'د. سلطان الغامدي · خبير أمن المعلومات',
    category: 'أمن سيبراني',
    fileSize: '26.1 MB',
    pagesCount: 310,
    coverGradient: 'from-slate-800 to-blue-950',
    description: 'المرجع التأسيسي لجدران الحماية، التشفير، الكشف عن الثغرات، وإجراءات التحقيق الجنائي الرقمي واحتواء التهديدات.',
  },
  {
    id: 'bk-mobile',
    courseSlug: 'mobile-maintenance',
    title: 'الدليل الفني المعتمد: الصيانة الاحترافية للهواتف الذكية وتتبع الأعطال',
    courseTitle: 'دورة صيانة الجوالات',
    author: 'م. عمر الدوسري · كبير مدربي الصيانة',
    category: 'صيانة وتقنية',
    fileSize: '31.0 MB',
    pagesCount: 280,
    coverGradient: 'from-amber-700 to-orange-900',
    description: 'شروحات المخططات الإلكترونية، فحص الدوائر بالملتيميتر، استبدال القطع الدقيقة، وحلول أعطال السوفتوير والهاروير المتقدمة.',
  },
  {
    id: 'bk-marketing',
    courseSlug: 'digital-marketing',
    title: 'الحقيبة الاستراتيجية: التسويق الرقمي وإدارة الحملات والمتاجر الإلكترونية',
    courseTitle: 'دورة التسويق الرقمي والتجارة الإلكترونية',
    author: 'أ. ريم القحطاني · مستشارة النمو الرقمي',
    category: 'تسويق وتجارة رقمية',
    fileSize: '19.7 MB',
    pagesCount: 230,
    coverGradient: 'from-teal-800 to-emerald-950',
    description: 'خطط إطلاق الحملات الإعلانية الممولة، تحسين محركات البحث SEO، بناء قمع المبيعات، ومضاعفة عائد الاستثمار في المتاجر.',
  },
  {
    id: 'bk-finance',
    courseSlug: 'finance-accounting-non-financial',
    title: 'دليل الإدارة المالية والمحاسبية للمدراء ورواد الأعمال غير الماليين',
    courseTitle: 'دورة المحاسبة والمالية لغير الماليين',
    author: 'د. عبدالله الهاشمي · مستشار مالي معتمد',
    category: 'محاسبة ومالية',
    fileSize: '15.3 MB',
    pagesCount: 190,
    coverGradient: 'from-cyan-800 to-blue-950',
    description: 'قراءة القوائم المالية، حساب نقطة التعادل، إدارة التدفقات النقدية والميزانيات التقديرية، واتخاذ القرارات الاستثمارية السليمة.',
  },
  {
    id: 'bk-qudurat',
    courseSlug: 'qudurat-general-aptitude',
    title: 'دليل التفوق واستراتيجيات الحل السريع: اختبار القدرات العامة (الكمي واللفظي)',
    courseTitle: 'دورة تدريب وتأهيل اختبار القدرات العامة',
    author: 'نخبة من مدربي المركز الوطني للقياس',
    category: 'تأهيل واختبارات قياس',
    fileSize: '24.5 MB',
    pagesCount: 320,
    coverGradient: 'from-rose-800 to-red-950',
    description: 'قوانين واختصارات الحل الذكي للقسمين الكمي واللفظي بدون آلة حاسبة، مع نماذج تدريبية وتجميعات مكثفة مشروحة خطوة بخطوة.',
  },
];

export default function StudentPathwaysPage() {
  const [activeSection, setActiveSection] = useState<'courses' | 'books'>('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [userEnrollments, setUserEnrollments] = useState<Map<string, number>>(new Map());
  const [selectedBookPreview, setSelectedBookPreview] = useState<typeof digitalBooks[0] | null>(null);

  const [accreditedCourses, setAccreditedCourses] = useState<Course[]>(
    allCatalogCourses.filter(c => c.slug !== 'free-trial-course')
  );

  // Function to load live courses from API and update enrollments
  const loadPlatformCourses = async () => {
    try {
      const res = await fetch(`/api/courses?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.courses) && data.courses.length > 0) {
        const liveFiltered = data.courses.filter((c: any) => c.slug !== 'free-trial-course');
        setAccreditedCourses(liveFiltered);
        return liveFiltered;
      }
    } catch (err) {
      console.error('Error fetching live courses in pathways:', err);
    }
    return accreditedCourses;
  };

  // Load student enrollments to reflect real progress
  useEffect(() => {
    async function loadData() {
      const currentCourses = await loadPlatformCourses();

      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;

        if (user) {
          const userEmail = user.email ? user.email.toLowerCase().trim() : '';
          const { data: enrollmentsData } = await supabase
            .from('enrollments')
            .select('*')
            .eq('email', userEmail);

          const progressMap = new Map<string, number>();

          if (enrollmentsData && enrollmentsData.length > 0) {
            enrollmentsData.forEach((e: any) => {
              const cleanSlug = (e.course_id || '').replace(/^course-/, '').toLowerCase().trim();
              const matchedCatalog = (currentCourses || accreditedCourses).find((c: Course) =>
                (c.slug || '').toLowerCase().trim() === cleanSlug ||
                String(c.id) === cleanSlug ||
                (c.ghlCourseId || '').replace(/^course-/, '').toLowerCase().trim() === cleanSlug ||
                c.title === e.course_title
              );

              const canonicalSlug = matchedCatalog?.slug || cleanSlug;
              const progress = e.progress !== undefined && e.progress !== null
                ? Math.min(100, Math.max(0, Number(e.progress)))
                : 0;

              if (progressMap.has(canonicalSlug)) {
                if (progress > progressMap.get(canonicalSlug)!) {
                  progressMap.set(canonicalSlug, progress);
                }
              } else {
                progressMap.set(canonicalSlug, progress);
              }
            });
          }

          setUserEnrollments(progressMap);
        }
      } catch (err) {
        console.error('Error loading enrollments for courses & books page:', err);
      }
    }

    loadData();

    const handleStorage = () => {
      loadData();
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

  const filteredCourses = accreditedCourses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBooks = digitalBooks.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const enrolledCount = userEnrollments.size;

  return (
    <div className="space-y-6 sm:space-y-8 pt-2.5 sm:pt-0 font-[family-name:var(--font-cairo)]" dir="rtl">

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

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 pr-1">
            <motion.div variants={textItemVariants} className="student-tag-badge bg-blue-50 text-[#173A7C] border border-blue-200/80 shadow-xs">
              <Library className="w-3.5 h-3.5 text-[#173A7C]" />
              <span>المحتوى والمناهج الأكاديمية</span>
            </motion.div>

            <motion.h1 variants={textItemVariants} className="student-heading-h1">
              الدورات التدريبية و<span className="student-name-gradient">الكتب الرقمية</span> 📚
            </motion.h1>

            <motion.p variants={textItemVariants} className="student-text-body max-w-xl pr-0.5 pt-1 leading-relaxed">
              استكشف كافة الدورات المعتمدة وتصفح وحمّل الحقائب التدريبية والكتب الرقمية المخصصة لكل دورة لتعزيز حصيلتك العلمية.
            </motion.p>
          </div>

          <motion.div variants={textItemVariants} className="flex items-center justify-around gap-1.5 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-white/90 border border-white/80 backdrop-blur-md shadow-sm shrink-0">
            <div className="text-center px-3 border-l border-slate-200">
              <span className="block text-base sm:text-lg font-black text-[#173A7C]">9</span>
              <span className="text-[9px] sm:text-[10px] text-slate-600 font-bold whitespace-nowrap">دورات معتمدة</span>
            </div>
            <div className="text-center px-3 border-l border-slate-200">
              <span className="block text-base sm:text-lg font-black text-[#0D5C3A]">{enrolledCount}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-600 font-bold whitespace-nowrap">دورات مشتركة</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-base sm:text-lg font-black text-amber-600">9</span>
              <span className="text-[9px] sm:text-[10px] text-slate-600 font-bold whitespace-nowrap">كتب وحقائب</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Control Bar: Search & Section Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Section Switcher Tabs */}
        <div className="premium-tabs flex items-center gap-2 p-1.5 rounded-2xl border border-white/80 bg-white/90 backdrop-blur-md shadow-sm">
          <button
            onClick={() => setActiveSection('courses')}
            className={`premium-tab px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-none ${
              activeSection === 'courses'
                ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                : 'text-slate-600 hover:text-[#173A7C] hover:bg-slate-100/60'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span className="premium-tab-label">الدورات المعتمدة ({accreditedCourses.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('books')}
            className={`premium-tab px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-none ${
              activeSection === 'books'
                ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                : 'text-slate-600 hover:text-[#173A7C] hover:bg-slate-100/60'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="premium-tab-label">الكتب والمراجع ({digitalBooks.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeSection === 'courses' ? 'ابحث عن دورة تدريبية...' : 'ابحث في الكتب والمراجع...'}
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-white/90 border border-slate-200/80 text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#173A7C]/20 focus:border-[#173A7C] transition-all shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ── SECTION 1: COURSES CONTENT ── */}
      {activeSection === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, idx) => {
            const isEnrolled = userEnrollments.has(course.slug);
            const progress = userEnrollments.get(course.slug) || 0;
            const allLessons = getCourseAllLessons(course);
            const totalLessons = allLessons.length;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08, duration: 0.55 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl p-5 liquid-glass-card liquid-glass-hover student-card-accent transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/95"
              >
                <div>
                  {/* Top Image Section with Glow & Badges */}
                  <div className="relative mb-4 overflow-hidden rounded-2xl border border-slate-100/90 bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 transition-colors group-hover:border-blue-100">
                    <div className="relative z-0 w-full">
                      <CardImage
                        src={course.image || '/logo.webp'}
                        alt={course.title}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>

                    {/* Category Badge on Top-Right */}
                    <div className="absolute top-3 right-3 z-20">
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-white/90 text-[#173A7C] border border-blue-100/80 shadow-xs backdrop-blur-md">
                        {course.category === 'admin' ? 'أعمال مكتبية' : course.category === 'data' ? 'إدخال بيانات' : course.category === 'languages' ? 'لغات' : course.category === 'corporate' ? 'إدارة وأعمال' : 'تقنية وحاسب'}
                      </span>
                    </div>

                    {/* Enrollment Status Badge on Top-Left */}
                    <div className="absolute top-3 left-3 z-20">
                      {isEnrolled ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-600/90 text-white shadow-xs backdrop-blur-md">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-200" />
                          <span>مشترك</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[11px] font-black bg-slate-900/75 text-white shadow-xs backdrop-blur-md">
                          معتمدة
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title and description */}
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-[#173A7C] transition-colors leading-snug line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                </div>

                {/* Course Metadata Details */}
                <div className="space-y-3.5 pt-4 mt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#173A7C]" />
                      <span>{course.duration}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#0D5C3A]" />
                      <span>{totalLessons} درس تفاعلي</span>
                    </span>
                  </div>

                  {/* If enrolled: Real Progress Bar */}
                  {isEnrolled && (
                    <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-black">
                        <span className="text-slate-700">مستوى الإنجاز</span>
                        <span className="text-[#173A7C]">%{progress}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#173A7C] to-[#5CB07C] rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions Button */}
                  <div>
                    {isEnrolled ? (
                      <Link
                        href={`/dashboard/student/courses/${course.slug}/lessons/lesson-1`}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md shadow-[#173A7C]/20 hover:shadow-lg active:scale-95 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>متابعة التعلم (دخول المشغل)</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/checkout?slug=${course.slug}`}
                        className="w-full py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-[#173A7C]/30 text-[#173A7C] text-xs font-black flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
                      >
                        <span>استعراض والاشتراك في الدورة</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── SECTION 2: BOOKS & REFERENCES CONTENT ── */}
      {activeSection === 'books' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book, idx) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.08, duration: 0.55 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl p-6 liquid-glass-card liquid-glass-hover student-card-accent transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/90"
            >
              <div className="space-y-4">
                {/* Book Mini Cover Visual */}
                <div className={`h-36 rounded-2xl bg-gradient-to-br ${book.coverGradient} p-5 flex flex-col justify-between text-white relative overflow-hidden shadow-md group-hover:scale-[1.02] transition-transform duration-300`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                      {book.category}
                    </span>
                    <BookOpen className="w-5 h-5 text-white/80" />
                  </div>
                  <div className="relative z-10">
                    <span className="text-[10px] text-white/70 font-bold block">{book.courseTitle}</span>
                    <h4 className="text-sm font-black text-white line-clamp-2 leading-snug">{book.title}</h4>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#0D5C3A] block">المؤلف: {book.author}</span>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
                    {book.description}
                  </p>
                </div>
              </div>

              {/* Book Metadata & Download Actions */}
              <div className="space-y-4 pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#173A7C]" />
                    <span>{book.pagesCount} صفحة</span>
                  </span>
                  <span className="text-slate-400">{book.fileSize} · PDF</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedBookPreview(book)}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>معاينة الفهرس</span>
                  </button>

                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`جاري تجهيز تحميل حقيبة: ${book.title}`);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-[#173A7C]/20 active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل PDF</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Book Preview Modal */}
      <AnimatePresence>
        {selectedBookPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-black text-[#0D5C3A] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-2">
                    {selectedBookPreview.category}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">
                    {selectedBookPreview.title}
                  </h3>
                  <span className="text-xs font-bold text-slate-500 mt-1 block">
                    {selectedBookPreview.author} · {selectedBookPreview.pagesCount} صفحة ({selectedBookPreview.fileSize})
                  </span>
                </div>
                <button
                  onClick={() => setSelectedBookPreview(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 font-medium leading-relaxed">
                <h4 className="font-black text-slate-800 text-sm">مقدمة ومحتويات الحقيبة الأكاديمية:</h4>
                <p>{selectedBookPreview.description}</p>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">تتضمن الحقيبة:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                    <li>شرح نظري وتطبيقي شامل لكافة وحدات الدورة.</li>
                    <li>تمارين وأسئلة مراجعة وتطبيقات عملية لكل درس.</li>
                    <li>نماذج استرشادية معتمدة قابلة للطباعة والاستخدام المهني.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedBookPreview(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => {
                    alert(`جاري بدء تحميل الحقيبة التدريبية: ${selectedBookPreview.title}`);
                    setSelectedBookPreview(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-[#173A7C]/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل النسخة الكاملة PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
