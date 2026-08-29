'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  ClipboardList,
  Radio,
  TrendingUp,
  Star,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  Plus,
  Edit3,
  ExternalLink,
  Layers,
  Send,
  FileCheck,
  X,
  Check,
  Loader2,
  Sparkles,
  PlayCircle,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Course } from '@/types';

const sectionFadeVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.08,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

interface SubmissionItem {
  id: string;
  studentName: string;
  email: string;
  courseTitle: string;
  assignmentTitle: string;
  notes?: string;
  file_url?: string;
  grade?: number;
  feedback?: string;
  status: string;
  submitted_at: string;
}

export default function InstructorDashboardPage() {
  const [instructorName, setInstructorName] = useState('المدرب المعتمد');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Submissions State
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([
    {
      id: 'sub-1',
      studentName: 'عبدالله بن محمد الشمري',
      email: 'a.shammari@example.com',
      courseTitle: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      assignmentTitle: 'إعداد دراسة حالة: تطبيق قيم الحوار والتعايش المجتمعي',
      notes: 'مرفق لكم ملف التقرير الميداني والتوصيات العملية.',
      file_url: 'مبادرة_السلام_المجتمعي.pdf',
      status: 'submitted',
      submitted_at: 'منذ ساعتين',
    },
    {
      id: 'sub-2',
      studentName: 'سارة بنت خالد العتيبي',
      email: 's.otaibi@example.com',
      courseTitle: 'المهارات الأكاديمية والتفكير الناقد',
      assignmentTitle: 'واجب الوحدة الثانية: تحليل المغالطات المنطقية',
      notes: 'تم استيفاء كافة المعايير المنهجية المطلوبة في التكليف.',
      file_url: 'تحليل_المغالطات_المنطقية.docx',
      status: 'submitted',
      submitted_at: 'اليوم 11:30 ص',
    },
    {
      id: 'sub-3',
      studentName: 'م. خالد بن فهد الدوسري',
      email: 'k.dosari@example.com',
      courseTitle: 'دورة استخدام الحاسب الالي في الاعمال المكتبية',
      assignmentTitle: 'المشروع التطبيقي: إعداد تقرير مالي متقدم بالإكسيل',
      notes: 'تم إعداد الجداول المحورية والدوال المالية المطلوبة.',
      file_url: 'مشروع_الاكسيل_المتقدم.xlsx',
      status: 'submitted',
      submitted_at: 'أمس 04:15 م',
    },
  ]);

  // Quick Grading Modal State
  const [selectedSubForGrading, setSelectedSubForGrading] = useState<SubmissionItem | null>(null);
  const [gradeInput, setGradeInput] = useState('95');
  const [feedbackInput, setFeedbackInput] = useState('عمل ممتاز ومتقن، أحسنت!');
  const [isGrading, setIsGrading] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    coursesCount: 3,
    studentsCount: 245,
    pendingSubmissions: 3,
    upcomingLiveCount: 1,
    averageRating: 4.95,
    totalHours: 120,
  });

  // Load instructor data & courses
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .maybeSingle();

          if (profile?.full_name) {
            setInstructorName(profile.full_name);
          }
        }

        // Fetch courses
        const res = await fetch('/api/courses');
        const data = await res.json();
        if (data.success && Array.isArray(data.courses)) {
          setCourses(data.courses);
          setStats((prev) => ({
            ...prev,
            coursesCount: data.courses.length,
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCourses(false);
      }
    }

    loadData();
  }, []);

  // Handle Quick Grade Submission
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubForGrading) return;

    setIsGrading(true);
    try {
      // Update local state
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === selectedSubForGrading.id
            ? { ...s, grade: Number(gradeInput), feedback: feedbackInput, status: 'graded' }
            : s
        )
      );
      setStats((prev) => ({
        ...prev,
        pendingSubmissions: Math.max(0, prev.pendingSubmissions - 1),
      }));
      setSelectedSubForGrading(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  const kpis = [
    {
      title: 'البرامج والدورات التدريبية',
      value: `${courses.length || stats.coursesCount} برامج`,
      icon: BookOpen,
      color: 'from-[#173A7C] to-[#1E4D9D]',
      bgBadge: 'bg-blue-50 text-[#173A7C] border-blue-200',
      change: 'محدثة ونشطة',
    },
    {
      title: 'إجمالي المتدربين النشطين',
      value: `${stats.studentsCount} متدرب`,
      icon: Users,
      color: 'from-emerald-600 to-teal-600',
      bgBadge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      change: '+18 هذا الأسبوع',
    },
    {
      title: 'واجبات بانتظار التقييم والتصحيح',
      value: `${submissions.filter((s) => s.status === 'submitted').length} مهام`,
      icon: ClipboardList,
      color: 'from-amber-500 to-orange-600',
      bgBadge: 'bg-amber-50 text-amber-800 border-amber-300',
      change: 'تتطلب تقييمك ✍️',
    },
    {
      title: 'تقييم المتدربين العام',
      value: `${stats.averageRating} / 5.0`,
      icon: Star,
      color: 'from-indigo-600 to-purple-600',
      bgBadge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      change: 'تقييم ممتاز ⭐',
    },
  ];

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
      {/* ── 1. EXPANDED INTERACTIVE HERO WELCOME BANNER ── */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative z-20 liquid-glass-hero p-6 sm:p-8 rounded-2xl sm:rounded-3xl liquid-glass-hover overflow-hidden student-card-accent"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#173A7C] text-xs font-black border border-blue-200">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>لوحة التحكم الأكاديمية للمدرب والمحاضر المعتمد</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black student-heading-h1 leading-tight">
              مرحباً بك، <span className="student-name-gradient">{instructorName}</span> 👨‍🏫
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed">
              إدارة مقرراتك التدريبية، إضافة وتعديل الدروس، تصحيح واجبات الطلاب فورياً، وجدولة وإطلاق ورش البث المباشر.
            </p>
          </div>

          {/* Quick Action Buttons Hub */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <Link
              href="/dashboard/instructor/courses"
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-[#173A7C] hover:bg-[#1E4D9D] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#173A7C]/20 transition-all cursor-pointer border border-white/20"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة دورة جديدة</span>
            </Link>

            <Link
              href="/dashboard/instructor/live"
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all cursor-pointer border border-white/20"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>بدء جلسة مباشرة</span>
            </Link>

            <Link
              href="/dashboard/instructor/assignments"
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-white hover:bg-slate-100 text-[#173A7C] font-black text-xs flex items-center justify-center gap-2 border border-slate-200/90 shadow-xs transition-all cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>تصحيح المهام</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── 2. METRICS & KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              variants={sectionFadeVariants}
              initial="hidden"
              animate="visible"
              custom={idx + 1}
              className="p-5 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3 relative overflow-hidden student-card-accent"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.color} text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${kpi.bgBadge}`}>
                  {kpi.change}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-bold block">{kpi.title}</span>
                <h3 className="text-xl sm:text-2xl font-black text-[#173A7C] font-mono pt-0.5">{kpi.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── 3. MAIN WORKSPACE GRID: COURSES & PENDING SUBMISSIONS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): My Courses Management Hub */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl liquid-glass-card space-y-4 student-card-accent">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3.5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#173A7C]" />
                <h3 className="student-heading-h3 !text-base">مقرراتي وبرامجي التدريبية</h3>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/instructor/courses"
                  className="text-xs font-black text-[#173A7C] hover:underline flex items-center gap-1"
                >
                  <span>إدارة كافة المقررات ({courses.length})</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {loadingCourses ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#173A7C]" />
                <p className="text-xs font-bold">جاري تحميل المقررات...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-3 bg-white/60 rounded-2xl border border-dashed border-slate-300">
                <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold">لا توجد مقررات تدريبية مضافة بعد</p>
                <Link
                  href="/dashboard/instructor/courses"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#173A7C] text-white text-xs font-black"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إنشاء أول دورة الآن</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.slice(0, 3).map((c) => (
                  <div
                    key={c.id || c.slug}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-[#173A7C]/40 transition-all space-y-3 shadow-xs group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-[#173A7C] border border-blue-200">
                            {c.category === 'tech'
                              ? 'تقنية وبرمجة'
                              : c.category === 'management'
                              ? 'تطوير إداري'
                              : 'دبلوم مهني'}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                            {c.studentsCount || c.enrollees || 85} متدرب
                          </span>
                        </div>
                        <h4 className="font-black text-sm text-slate-900 truncate">{c.title}</h4>
                      </div>

                      <span className="font-mono font-black text-xs text-[#173A7C] bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
                        {c.price ? `${c.price} ر.س` : 'مجاني'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-3 text-slate-500 font-bold text-[11px]">
                        <span>{c.lessonsCount || 8} دروس</span>
                        <span>•</span>
                        <span>{c.duration || '20 ساعة'}</span>
                        <span>•</span>
                        <span className="text-emerald-700">نسبة الإنجاز 89%</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href="/dashboard/instructor/courses"
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#173A7C] hover:text-white text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>تعديل ومحتوى</span>
                        </Link>

                        <Link
                          href={`/courses/${c.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#173A7C] hover:bg-slate-100 transition-colors"
                          title="معاينة الدورة"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right (5 cols): Pending Student Submissions & Next Live Workshop */}
        <div className="lg:col-span-5 space-y-6">
          {/* Next Live Session */}
          <div className="p-6 rounded-3xl liquid-glass-card space-y-3.5 student-card-accent">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
              <h3 className="student-heading-h3 !text-sm flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                <span>الورشة التدريبية الحية القادمة</span>
              </h3>
              <Link
                href="/dashboard/instructor/live"
                className="text-xs font-black text-[#173A7C] hover:underline"
              >
                جدولة ورشة
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 via-rose-500/5 to-transparent border border-red-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                  بث مباشر تفاعلي
                </span>
                <span className="text-[11px] font-bold text-red-700 font-mono">اليوم 8:00 مساءً</span>
              </div>

              <h4 className="font-black text-xs sm:text-sm text-slate-900">
                تطبيقات الحوار والتعايش الإيجابي في المنشآت
              </h4>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[11px] text-slate-500 font-bold">عبر منصة Zoom / الغرفة التفاعلية</span>
                <Link
                  href="/dashboard/instructor/live"
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1 shadow-md shadow-red-600/20"
                >
                  <Radio className="w-3 h-3" />
                  <span>دخول القاعة</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Pending Submissions Queue with Instant Grading Trigger */}
          <div className="p-6 rounded-3xl liquid-glass-card space-y-3.5 student-card-accent">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
              <h3 className="student-heading-h3 !text-sm flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-amber-600" />
                <span>واجبات بانتظار التصحيح والتقييم</span>
              </h3>
              <Link
                href="/dashboard/instructor/assignments"
                className="text-xs font-black text-[#173A7C] hover:underline"
              >
                عرض الكل
              </Link>
            </div>

            <div className="space-y-2.5">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                    sub.status === 'graded'
                      ? 'bg-emerald-50/60 border-emerald-200 opacity-80'
                      : 'bg-white border-slate-200/90 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-black text-xs text-slate-900">{sub.studentName}</h5>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{sub.assignmentTitle}</p>
                    </div>

                    {sub.status === 'graded' ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
                        تم التقييم ({sub.grade}/100)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedSubForGrading(sub)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] shadow-xs cursor-pointer transition-colors"
                      >
                        تقييم الآن ✍️
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold pt-1 border-t border-slate-100">
                    <span>{sub.courseTitle.substring(0, 24)}...</span>
                    <span>{sub.submitted_at}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. RECENT ENROLLED STUDENTS ROSTER ── */}
      <div className="p-6 rounded-3xl liquid-glass-card space-y-4 student-card-accent">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <h3 className="student-heading-h3 !text-base">المتدربون الأحدث تسجيلاً في مقرراتك</h3>
          </div>
          <Link
            href="/dashboard/instructor/students"
            className="text-xs font-black text-[#173A7C] hover:underline flex items-center gap-1"
          >
            <span>عرض قائمة المتدربين بالكامل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: 'عبدالله بن محمد الشمري',
              course: 'دبلوم التسامح والسلام والمواطنة الصالحة',
              progress: 95,
              date: '15 مايو 2026',
              status: 'مستمر',
            },
            {
              name: 'سارة بنت خالد العتيبي',
              course: 'المهارات الأكاديمية والتفكير الناقد',
              progress: 100,
              date: '12 مايو 2026',
              status: 'مكتمل',
            },
            {
              name: 'م. خالد بن فهد الدوسري',
              course: 'دورة استخدام الحاسب الالي في الاعمال المكتبية',
              progress: 60,
              date: '10 مايو 2026',
              status: 'مستمر',
            },
          ].map((st, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-slate-900">{st.name}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    st.status === 'مكتمل'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-50 text-[#173A7C]'
                  }`}
                >
                  {st.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">{st.course}</p>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span>نسبة الإنجاز</span>
                  <span className="font-mono">{st.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#173A7C] to-emerald-500 rounded-full"
                    style={{ width: `${st.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. QUICK GRADING MODAL ── */}
      <AnimatePresence>
        {selectedSubForGrading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-white/80 overflow-hidden my-auto"
            >
              <form onSubmit={handleSaveGrade} className="space-y-4">
                {/* Header */}
                <div className="p-5 bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-amber-300" />
                    <div>
                      <h3 className="font-black text-sm sm:text-base">تقييم وتصحيح التكليف الدراسي</h3>
                      <p className="text-xs text-blue-100 font-bold">{selectedSubForGrading.studentName}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSubForGrading(null)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-5 space-y-4 text-xs font-bold">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] text-slate-400 block">عنوان الواجب / التكليف:</span>
                    <h4 className="font-black text-slate-900 text-xs">{selectedSubForGrading.assignmentTitle}</h4>
                    {selectedSubForGrading.notes && (
                      <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 font-medium">
                        ملاحظات الطالب: "{selectedSubForGrading.notes}"
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">الدرجة الممنوحة (من 100) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={gradeInput}
                      onChange={(e) => setGradeInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none font-mono text-sm font-black text-[#173A7C]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">الملاحظات والتغذية الراجعة للطالب</label>
                    <textarea
                      rows={3}
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none resize-none font-medium text-xs"
                      placeholder="اكتب توجيهاتك أو ملاحظاتك التشجيعية للطالب..."
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedSubForGrading(null)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={isGrading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#173A7C] text-white font-black text-xs shadow-md hover:opacity-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isGrading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>اعتماد الدرجة وإرسال التقييم</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
