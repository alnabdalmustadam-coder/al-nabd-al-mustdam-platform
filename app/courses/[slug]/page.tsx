"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getCourseBySlug, courses } from "@/data/courses";
import { Course } from "@/types";
import CourseCard from "@/components/ui/CourseCard";
import { CardImage } from "@/components/ui/CardImage";
import Badge from "@/components/ui/Badge";
import SmartCourseAction from "@/components/ui/SmartCourseAction";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  Clock,
  Users,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Play,
  Star,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Heart,
  Share2,
  Check,
  FileText,
  HelpCircle,
  GraduationCap,
  Briefcase,
  Layers,
  X,
  Target,
} from "lucide-react";

const CATEGORY_MAP: Record<string, string> = {
  admin: "أعمال مكتبية",
  data: "إدخال بيانات",
  languages: "لغات",
  tech: "تقنية وبرمجة",
  corporate: "إدارة وأعمال",
  security: "الأمن والسلامة",
  management: "إدارة ومشاريع",
  design: "تصميم وإعلام",
  all: "عام",
};

const tabs = [
  { key: "overview", label: "نظرة عامة على الدورة", icon: BookOpen },
  { key: "curriculum", label: "محتوى الدروس والمنهج", icon: Layers },
  { key: "certificate", label: "الشهادة والاعتماد", icon: Award },
  { key: "instructor", label: "المدرب والخبرات", icon: GraduationCap },
  { key: "faq", label: "الأسئلة الشائعة", icon: HelpCircle },
];

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const initialCourse = getCourseBySlug(slug);
  const [liveCourse, setLiveCourse] = useState<Course | null>(initialCourse || null);

  useEffect(() => {
    if (!initialCourse) {
      fetch(`/api/courses?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.courses)) {
            const target = slug.replace(/^course-/, "").toLowerCase().trim();
            const found = data.courses.find((c: any) => {
              const clean = (c.slug || "").replace(/^course-/, "").toLowerCase().trim();
              return clean === target || c.slug === slug || String(c.id) === target;
            });
            if (found) setLiveCourse(found);
          }
        })
        .catch(console.error);
    }
  }, [slug, initialCourse]);

  const course = liveCourse || initialCourse;
  if (!course) notFound();

  const [activeTab, setActiveTab] = useState("overview");
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<"guest" | "enrolled" | "not_enrolled">("guest");

  const { addToCart, isInCart, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = isInWishlist(course.id);
  const inCart = isInCart(course.id);
  const isEnrolled = enrollmentStatus === "enrolled";

  const related = courses
    .filter((c) => c.id !== course.id && (c.category === course.category || c.featured))
    .slice(0, 3);

  const categoryLabel = CATEGORY_MAP[course.category] || course.category;

  const rawPreviewUrl =
    course.curriculum?.find((l) => Boolean(l.videoUrl))?.videoUrl || "";
  const isAuthenticVideo =
    Boolean(rawPreviewUrl) &&
    !rawPreviewUrl.includes("youtube.com") &&
    !rawPreviewUrl.includes("youtu.be") &&
    !rawPreviewUrl.includes("vimeo.com");
  const previewVideoUrl = isAuthenticVideo ? rawPreviewUrl : "";

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleAddToCart = () => {
    if (isEnrolled) return;
    addToCart(course);
    openCart();
  };

  const courseFaqs = [
    {
      q: "هل الشهادة الممنوحة معتمدة رسمياً في المملكة؟",
      a: "نعم، جميع الشهادات الصادرة معتمدة وتحمل رقم تحقق وطني، ومناسبة للتقديم في القطاعين الحكومي والخاص وإضافتها إلى السيرة الذاتية وLinkedIn.",
    },
    {
      q: "كيف يمكنني متابعة الدورة بعد الاشتراك؟",
      a: "فور إتمام التسجيل، يتم تفعيل حسابك مباشرة وتتمكن من متابعة الدروس عبر مشغل الفيديو في أي وقت ومن أي جهاز دون أي قيود زمنية.",
    },
    {
      q: "هل يتوفر خيار التقسيط لرسوم الدورة؟",
      a: "التسجيل مفتوح مجاناً بصورة مؤقتة لحين اكتمال الربط مع وسائل الدفع، لذلك لا تحتاج إلى وسيلة دفع الآن.",
    },
    {
      q: "هل الدروس مسجلة أم بث مباشر؟",
      a: "الدروس مسجلة بجودة عالية ومتاحة لك للمشاهدة في أي وقت يناسبك مع صلاحية وصول دائمة ومستمرة مدى الحياة.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[family-name:var(--font-cairo)] text-slate-900 selection:bg-[#5CB07C] selection:text-white" dir="rtl">
      
      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION (LIGHT THEME WITH BG.WEBP & GLASS CARDS)        */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-center pt-20 sm:pt-28 pb-16 overflow-hidden bg-gradient-to-b from-slate-100/90 via-slate-50 to-slate-100/60 border-b border-slate-200/80">
        
        {/* Background Ornament Texture (bg.webp) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none overflow-hidden z-0">
          <img src="/bg.webp" alt="" className="w-full h-full object-cover" />
        </div>

        {/* Ambient Subtle Glows */}
        <div className="absolute top-12 right-10 w-96 h-96 bg-[#173A7C]/[0.05] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-12 left-10 w-96 h-96 bg-[#5CB07C]/[0.06] rounded-full blur-[100px] pointer-events-none" />
        <div className="particles-grid opacity-30" />

        <div className="relative max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 z-10 py-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            
            {/* Right Side: Course Info & Actions (Span 6) */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-5">
              
              {/* Top Block: Badges, Title, and Description */}
              <div className="space-y-3.5">
                {/* Badges with Unified Height & Padding */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="section-badge-glass">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 ml-1 inline" />
                    معتمد رسمياً من المركز الوطني
                  </span>
                  <span className="h-7 inline-flex items-center px-3 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs">
                    {categoryLabel}
                  </span>
                  <span className="h-7 inline-flex items-center px-3 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-xs">
                    برنامج مهني
                  </span>
                </div>

                {/* Course Title */}
                <h1 className="card-title-royal-blue text-2xl sm:text-3xl lg:text-4xl leading-snug tracking-tight">
                  {course.title}
                </h1>

                {/* Course Description */}
                <p className="card-desc-premium text-xs sm:text-sm leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Middle Block: Rich 4-Item Stats Widget */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs">
                {/* Rating */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/70 border border-amber-100">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#173A7C] block leading-tight">{course.rating}</span>
                    <span className="text-[10px] text-slate-500 font-bold block">تقييم المتدربين</span>
                  </div>
                </div>

                {/* Students */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#173A7C] block leading-tight">
                      {(course.studentsCount || course.enrollees || 0) > 0 ? `${course.studentsCount || course.enrollees}` : 'متاح للتسجيل'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold block">
                      {(course.studentsCount || course.enrollees || 0) > 0 ? 'متدرب مسجل' : 'دفعة جديدة'}
                    </span>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/70 border border-blue-100">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#173A7C] flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#173A7C] block leading-tight">{course.duration}</span>
                    <span className="text-[10px] text-slate-500 font-bold block">المدة الإجمالية</span>
                  </div>
                </div>

                {/* Lessons */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50/70 border border-purple-100">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#173A7C] block leading-tight">{course.lessonsCount} دروس</span>
                    <span className="text-[10px] text-slate-500 font-bold block">منهج تفاعلي</span>
                  </div>
                </div>
              </div>

              {/* Bottom Block: Pricing & Actions Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_25px_rgba(23,58,124,0.06)] space-y-4 shrink-0">
                
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold block mb-1">
                      {isEnrolled ? "حالة التسجيل في البرنامج:" : "حالة الإتاحة الحالية:"}
                    </span>
                    {isEnrolled ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-xs">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>أنت مشترك بالفعل في هذه الدورة</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-emerald-700">مجاناً مؤقتاً</span>
                        {Number(course.price || 0) > 0 && (
                          <span className="text-xs text-slate-400 line-through font-bold">{course.price} ر.س</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Temporary free enrollment notice */}
                  {!isEnrolled && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 font-bold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>تفعيل فوري من غير بيانات دفع</span>
                    </div>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="flex-1">
                    <SmartCourseAction
                      ghlCourseId={course.ghlCourseId}
                      ghlCheckoutUrl={course.ghlCheckoutUrl}
                      courseTitle={course.title}
                      courseSlug={course.slug}
                      onStatusChange={setEnrollmentStatus}
                    />
                  </div>

                  {!isEnrolled && (
                    <button
                      onClick={handleAddToCart}
                      className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        inCart
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{inCart ? "في السلة" : "إضافة إلى السلة"}</span>
                    </button>
                  )}

                  <button
                    onClick={() => toggleWishlist(course)}
                    className={`p-3 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      isFavorited
                        ? "bg-rose-50 border-rose-200 text-rose-600"
                        : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600"
                    }`}
                    title={isFavorited ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                    aria-label="المفضلة"
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                    title="مشاركة رابط الدورة"
                    aria-label="مشاركة"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {isCopied && (
                  <p className="text-[11px] text-emerald-700 font-bold text-center">
                    ✓ تم نسخ رابط الدورة بنجاح!
                  </p>
                )}
              </div>

            </div>

            {/* Left Side: Course Image Showcase (Span 6) */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="h-full flex flex-col justify-between rounded-3xl bg-white/95 backdrop-blur-xl p-3.5 sm:p-4 border border-slate-200/90 shadow-[0_15px_40px_rgba(23,58,124,0.08)] group overflow-hidden">
                
                <div className="relative w-full rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden">
                  <CardImage
                    src={course.image || "/logo.webp"}
                    alt={course.title}
                    preload
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />

                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors pointer-events-none" />

                  {previewVideoUrl ? (
                    <button
                      onClick={() => setIsVideoModalOpen(true)}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 cursor-pointer"
                      aria-label="معاينة فيديو الدورة"
                    >
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#5CB07C]/95 hover:bg-[#4EA06E] text-white flex items-center justify-center shadow-lg shadow-[#5CB07C]/30 group-hover:scale-110 transition-all backdrop-blur-xs">
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white translate-x-[-1px]" />
                      </div>
                      <span className="px-3.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-white text-xs font-black border border-white/20 shadow-md">
                        مشاهدة مقدمة الدورة
                      </span>
                    </button>
                  ) : (
                    <div className="absolute bottom-4 inset-x-4 flex justify-center pointer-events-none">
                      <span className="px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-md flex items-center gap-1.5">
                        <Play className="w-3 h-3 text-emerald-400" />
                        <span>منهج تدريبي معتمد ومتكامل</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-600 px-3 py-2 bg-slate-50/90 rounded-xl border border-slate-100 font-bold shrink-0">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>وصول فوري لكافة الدروس</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>شهادة إتمام معتمدة رسمياً</span>
                  </span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 2. CENTERED TABS NAVIGATION                                      */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="premium-tabs grid grid-cols-2 sm:flex sm:justify-center sm:items-center gap-2 sm:gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`premium-tab flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                    isActive
                      ? "text-white bg-[#173A7C] shadow-md shadow-[#173A7C]/20"
                      : "text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  <span className="premium-tab-label truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 3. MAIN TAB CONTENT AREA                                         */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >

              {/* ───────────────── TAB 1: OVERVIEW ───────────────── */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  
                  {/* What You'll Learn */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="card-title-royal-blue text-lg sm:text-xl">ماذا ستتعلم في هذه الدورة؟</h2>
                        <p className="card-desc-premium text-xs mt-0.5">المهارات العملية والتطبيقية المتوافقة مع متطلبات سوق العمل</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {course.outcomes && course.outcomes.length > 0 ? (
                        course.outcomes.map((outcome: string, idx: number) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-200 transition-all flex items-start gap-3"
                          >
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                            <p className="text-xs sm:text-[13px] font-bold text-slate-800 leading-relaxed">
                              {outcome}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-slate-500 text-sm py-4">
                          يتم تحديث مخرجات التعلم باستمرار.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-2xl bg-[#173A7C]/10 text-[#173A7C] flex items-center justify-center shrink-0">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="card-title-royal-blue text-lg sm:text-xl">الفئات المستهدفة من هذا البرنامج</h2>
                        <p className="card-desc-premium text-xs mt-0.5">صُممت الدورة لتلبي احتياجات فئات مهنية متعددة</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {[
                        { title: "الخريجون والباحثون عن عمل", desc: "لبناء سيرة ذاتية قوية واكتساب المهارات الأكثر طلباً في سوق العمل." },
                        { title: "الموظفون في القطاعين الحكومي والخاص", desc: "لتطوير الأداء الوظيفي والتأهل للترقيات والمهام الإدارية الأعلى." },
                        { title: "رواد الأعمال وأصحاب المشاريع", desc: "لإدارة أعمالهم ومستنداتهم بكفاءة واحترافية عالية." },
                        { title: "الراغبون في تطوير مهاراتهم الرقمية", desc: "لمواكبة التحول الرقمي وإتقان التطبيقات المكتبية الحديثة." },
                      ].map((aud, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <Briefcase className="w-5 h-5 text-[#173A7C] shrink-0 mt-0.5" />
                          <div>
                            <h4 className="card-title-royal-blue text-xs sm:text-sm mb-0.5">{aud.title}</h4>
                            <p className="card-desc-premium text-xs leading-relaxed">{aud.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-[#173A7C] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="card-title-royal-blue text-sm sm:text-base">المتطلبات المسبقة</h3>
                      <p className="card-desc-premium text-xs sm:text-sm leading-relaxed mt-1">
                        {course.requirements || "لا توجد متطلبات مسبقة معقدة. الدورة تبدأ معك من الصفر خطوة بخطوة حتى الإتقان الكامل، وتحتاج فقط إلى رغبة في التعلم وجهاز كمبيوتر أو هاتف ذكي."}
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* ───────────────── TAB 2: CURRICULUM ───────────────── */}
              {activeTab === "curriculum" && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="card-title-royal-blue text-lg sm:text-xl">منهج الدورة والدروس</h2>
                      <p className="card-desc-premium text-xs mt-0.5">
                        يتضمن البرنامج {course.curriculum?.length || 1} وحدات تدريبية بإجمالي {course.lessonsCount} دروس تفاعلية
                      </p>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                      إجمالي المدة: {course.duration}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {course.curriculum && course.curriculum.length > 0 ? (
                      course.curriculum.map((section: any, idx: number) => {
                        const isOpen = openAccordion === idx;
                        const sectionTitle =
                          section.title.length > 2
                            ? section.title
                            : `الوحدة التدريبية ${idx + 1}: المهارات والتطبيقات العملية`;
                        return (
                          <div
                            key={idx}
                            className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs"
                          >
                            <button
                              onClick={() => setOpenAccordion(isOpen ? null : idx)}
                              className="w-full flex items-center justify-between p-4 sm:p-5 text-right cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-3.5">
                                <div className="w-8 h-8 rounded-xl bg-[#173A7C]/10 text-[#173A7C] font-black text-xs flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </div>
                                <div>
                                  <h3 className="card-title-royal-blue text-sm sm:text-base">
                                    {sectionTitle}
                                  </h3>
                                  <span className="text-xs text-slate-500 font-medium">
                                    {section.lessons?.length || 1} درس • {section.duration || "20 دقيقة"}
                                  </span>
                                </div>
                              </div>
                              <div className={`p-1.5 rounded-lg ${isOpen ? "text-[#173A7C]" : "text-slate-400"}`}>
                                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </div>
                            </button>

                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="border-t border-slate-100 bg-slate-50/70 p-4 space-y-2"
                                >
                                  {section.lessons && section.lessons.length > 0 ? (
                                    section.lessons.map((lesson: string, lIdx: number) => (
                                      <div
                                        key={lIdx}
                                        className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/70 text-xs sm:text-sm font-bold text-slate-800"
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <Play className="w-4 h-4 text-emerald-600 shrink-0" />
                                          <span>{lesson.length > 2 ? lesson : `الدرس ${lIdx + 1}: التطبيق العملي والشرح`}</span>
                                        </div>
                                        <span className="text-xs text-slate-400 font-normal">
                                          {section.duration || "20 دقيقة"}
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/70 text-xs sm:text-sm font-bold text-slate-800">
                                      <div className="flex items-center gap-2.5">
                                        <Play className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>الدرس التطبيقي الشامل</span>
                                      </div>
                                      <span className="text-xs text-slate-400 font-normal">{section.duration}</span>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 text-slate-500 text-sm">
                        جاري تحديث وحدات المنهج.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ───────────────── TAB 3: CERTIFICATE ───────────────── */}
              {activeTab === "certificate" && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                  <div>
                    <h2 className="card-title-royal-blue text-lg sm:text-xl">الشهادة والاعتماد الرسمي</h2>
                    <p className="card-desc-premium text-xs mt-1">شهادة مهنية معتمدة تضاف لسيرتك الذاتية وتدعم مسارك الوظيفي</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="card-title-royal-blue text-sm sm:text-base">شهادة إتمام معتمدة برقم تحقق وطني</h3>
                        <p className="card-desc-premium text-xs mt-0.5">تصدر الشهادة فور إكمال متطلبات الدورة ومشاهدة الدروس.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-bold text-slate-700">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>إصدار رقمي فوري</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>رمز QR للتحقق السريع</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>متوافقة مع LinkedIn</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ───────────────── TAB 4: INSTRUCTOR ───────────────── */}
              {activeTab === "instructor" && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
                  <div>
                    <h2 className="card-title-royal-blue text-lg sm:text-xl">عن المدرب وهيئة التدريس</h2>
                    <p className="card-desc-premium text-xs mt-1">نخبة من الكفاءات والخبراء المعتمدين في المملكة</p>
                  </div>

                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="w-16 h-16 rounded-2xl bg-[#173A7C] text-white font-black text-xl flex items-center justify-center shrink-0">
                      {course.instructor ? course.instructor[0] : "ن"}
                    </div>
                    <div className="space-y-1">
                      <h3 className="card-title-royal-blue text-base">
                        {course.instructor || "أكاديمية النبض المستدام"}
                      </h3>
                      <span className="text-xs text-emerald-700 font-bold block">مدرب معتمد واستشاري تدريب</span>
                      <p className="card-desc-premium text-xs sm:text-sm leading-relaxed pt-1">
                        {course.instructorBio ||
                          "خبرة واسعة في تقديم البرامج التدريبية المعتمدة وتطوير مهارات الكوادر الوطنية لتلبية متطلبات سوق العمل الحديث."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ───────────────── TAB 5: FAQ ───────────────── */}
              {activeTab === "faq" && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
                  <div>
                    <h2 className="card-title-royal-blue text-lg sm:text-xl">الأسئلة الشائعة</h2>
                    <p className="card-desc-premium text-xs mt-1">إجابات مباشرة لأبرز الاستفسارات حول الدورة</p>
                  </div>

                  <div className="space-y-2.5">
                    {courseFaqs.map((faq, idx) => {
                      const isOpen = openFaq === idx;
                      return (
                        <div
                          key={idx}
                          className="rounded-2xl border border-slate-200 overflow-hidden bg-white"
                        >
                          <button
                            onClick={() => setOpenFaq(isOpen ? null : idx)}
                            className="w-full flex items-center justify-between p-4 text-right cursor-pointer hover:bg-slate-50 transition-colors"
                          >
                            <span className="card-title-royal-blue text-xs sm:text-sm">{faq.q}</span>
                            <div className={`p-1 rounded-lg ${isOpen ? "text-[#173A7C]" : "text-slate-400"}`}>
                              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t border-slate-100 bg-slate-50 p-4 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed"
                              >
                                {faq.a}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* 4. RELATED COURSES                                              */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {related.length > 0 && (
          <section className="mt-20 pt-12 border-t border-slate-200">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="section-main-title-premium text-2xl sm:text-3xl mb-2">
                دورات تدريبية <span className="gradient-text">ذات صلة</span>
              </h2>
              <p className="section-desc-premium text-xs sm:text-sm">
                برامج تدريبية مكملة لتطوير مهاراتك المهنية
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {related.map((c, i) => (
                <CourseCard key={c.id} course={c} index={i} />
              ))}
            </div>
          </section>
        )}

      </main>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 5. VIDEO PREVIEW MODAL                                          */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl z-10 border border-slate-200"
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  <h3 className="card-title-royal-blue text-xs sm:text-sm">{course.title}</h3>
                </div>

                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative aspect-video bg-black">
                <iframe
                  src={previewVideoUrl}
                  loading="lazy"
                  className="w-full h-full border-0"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                />
              </div>

              <div className="p-4 bg-slate-50 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="card-desc-premium text-xs">
                  احصل على الشهادة المعتمدة وكامل المحتوى بعد التسجيل.
                </span>
                <Link
                  href={course.slug ? `/checkout?slug=${course.slug}` : "/checkout"}
                  className="px-4 py-2 rounded-xl bg-[#5CB07C] hover:bg-[#4EA06E] text-white font-black transition-colors"
                >
                  سجّل مجاناً في الدورة
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
