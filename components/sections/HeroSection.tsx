"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { 
  Building2, 
  ChevronRight, 
  ChevronLeft, 
  Compass, 
  CreditCard, 
  FileText,
  BadgeCheck,
  CheckCircle2,
  Star,
  Clock,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import { usePublicCourses } from "@/lib/hooks/use-public-courses";

const typewriterWords = ["التقني", "الإداري", "الرقمي", "اللغوي", "القيادي"];
const heroButtonIconClass = "w-4 h-4 sm:w-5 sm:h-5 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 shrink-0";

function getCategoryLabel(category?: string): string {
  switch (category) {
    case "tech": return "التقنية والبرمجة";
    case "management": return "الإدارة والقيادة";
    case "data": return "تحليل البيانات";
    case "languages": return "اللغات والتواصل";
    case "security": return "الأمن السيبراني";
    case "corporate": return "برامج المؤسسات";
    case "design": return "التصميم وتجربة المستخدم";
    default: return "مسار تدريبي معتمد";
  }
}

export default function HeroSection() {
  const { courses, loading, error, reload } = usePublicCourses();
  const heroCourses = courses.slice(0, 3);
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);

  const slideIndex = currentSlide % Math.max(heroCourses.length, 1);
  const heroCourse = heroCourses[slideIndex];

  // Optimized Typewriter effect
  useEffect(() => {
    const word = typewriterWords[wordIndex];
    const isReadyToDelete = !isDeleting && displayed.length === word.length;
    const isReadyToStartNext = isDeleting && displayed.length === 0;

    const timeout = setTimeout(
      () => {
        if (isReadyToDelete) {
          setIsDeleting(true);
        } else if (isReadyToStartNext) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % typewriterWords.length);
        } else if (isDeleting) {
          setDisplayed(word.slice(0, displayed.length - 1));
        } else {
          setDisplayed(word.slice(0, displayed.length + 1));
        }
      },
      isReadyToDelete ? 1000 : isReadyToStartNext ? 200 : isDeleting ? 40 : 80
    );
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, wordIndex]);

  useEffect(() => {
    if (!autoPlayEnabled || isPaused || heroCourses.length < 2) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(heroCourses.length, 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlayEnabled, isPaused, heroCourses.length]);

  const nextSlide = () => {
    setAutoPlayEnabled(false);
    setCurrentSlide((prev) => (prev + 1) % Math.max(heroCourses.length, 1));
  };
  const prevSlide = () => {
    setAutoPlayEnabled(false);
    setCurrentSlide((prev) => ((prev + heroCourses.length - 1) % Math.max(heroCourses.length, 1)));
  };

  return (
    <section className="relative min-h-[100svh] lg:min-h-0 lg:h-auto flex flex-col items-center justify-start lg:justify-center overflow-x-clip overflow-y-visible bg-gradient-to-b from-[#F8FAFC] via-[#EEF4F9] to-[#FFFFFF] pt-[4.5rem] sm:pt-24 pb-24 lg:pt-20 lg:pb-12 w-full max-w-full">

      {/* Ambient Diffuse Luxury Aura (Soft Deep Royal Navy & Slate — Zero Light Blue/Cyan) */}
      <div className="absolute -top-32 -right-20 w-[650px] sm:w-[850px] h-[650px] sm:h-[850px] bg-gradient-to-bl from-[#0B3766]/[0.10] via-slate-200/40 to-transparent rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-20 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-gradient-to-tr from-[#0B3766]/[0.12] via-slate-300/30 to-transparent rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[750px] h-[450px] bg-gradient-to-r from-[#0B3766]/[0.05] via-[#0B3766]/[0.08] to-slate-200/40 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-6 xl:px-12 2xl:px-16 flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-4 sm:gap-10 lg:gap-4 xl:gap-8 min-h-0 lg:min-h-[460px] xl:min-h-[560px] py-1 sm:py-8 lg:py-16 xl:py-20 pointer-events-none mt-0 lg:mt-0 xl:mt-4 translate-y-0 lg:-translate-y-[3vh]">

        {/* ═══════════════════════════════════════════════════════════════
            Side Card: Liquid Glass Course Overview & Features (Right in RTL)
           ═══════════════════════════════════════════════════════════════ */}
        <div className="w-full max-w-[500px] lg:max-w-none lg:w-[31%] xl:w-[30.5%] 2xl:w-[30%] order-3 lg:order-1 flex items-stretch justify-center pointer-events-none mb-0 lg:mb-0">
          <motion.div
            key={heroCourse?.slug || "catalog-status"}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="hero-fixed-side-card hero-course-copy-card w-full h-full text-right pointer-events-auto liquid-glass-card liquid-glass-hover p-5 sm:p-8 lg:p-5 xl:p-7 rounded-[1.75rem] sm:rounded-[2.25rem] lg:rounded-[1.5rem] xl:rounded-[2rem] border border-white/80 ring-1 ring-[#0B3766]/[0.08] flex flex-col justify-between gap-3.5 transition-all duration-500 overflow-hidden relative"
          >
            {/* Liquid Glass Curved Specular Sheen */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-t-[inherit] bg-gradient-to-b from-white/80 via-white/20 to-transparent z-0" />

            {/* Top Row: Category Badge + Rating */}
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B3766]/[0.07] border border-[#0B3766]/15 text-[#0B3766] text-xs font-bold">
                  <BadgeCheck className="w-3.5 h-3.5 text-[#19B6C7]" />
                  <span>{getCategoryLabel(heroCourse?.category)}</span>
                </span>

                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span className="pf-tabular-nums">{heroCourse?.rating || "4.9"}</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-2xl lg:text-base xl:text-xl font-bold text-[#0B3766] leading-snug tracking-tight mb-2 hover:text-[#168AD3] transition-colors">
                {heroCourse?.title || "استكشف مسارك التدريبي"}
              </h2>

              {/* Description */}
              <p className="text-xs sm:text-sm lg:text-[11.5px] xl:text-[13px] text-slate-600 font-medium leading-relaxed line-clamp-2">
                {heroCourse?.description || (loading ? "جارٍ تحميل الدورات…" : error || "تابع دليل الدورات للاطلاع على البرامج المتاحة.")}
              </p>
            </div>

            {/* Middle Section: 3 Rich Feature Highlights */}
            <div className="relative z-10 space-y-2 py-3 border-y border-[#0B3766]/10 my-auto">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm lg:text-[11px] xl:text-[12.5px] text-slate-700 font-semibold">
                <div className="w-6 h-6 rounded-lg bg-[#0B3766]/[0.08] flex items-center justify-center shrink-0 text-[#0B3766]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#19B6C7]" />
                </div>
                <span>شهادة إتمام معتمدة لتعزيز مسارك المهني</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm lg:text-[11px] xl:text-[12.5px] text-slate-700 font-semibold">
                <div className="w-6 h-6 rounded-lg bg-[#168AD3]/[0.08] flex items-center justify-center shrink-0 text-[#168AD3]">
                  <Clock className="w-3.5 h-3.5 text-[#168AD3]" />
                </div>
                <span>المدة: {heroCourse?.duration || "تعلم ذاتي وتطبيقي مرن"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm lg:text-[11px] xl:text-[12.5px] text-slate-700 font-semibold">
                <div className="w-6 h-6 rounded-lg bg-[#0B3766]/[0.08] flex items-center justify-center shrink-0 text-[#0B3766]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0B3766]" />
                </div>
                <span>تطبيقات وأمثلة موجهة لبيئات العمل الواقعية</span>
              </div>
            </div>

            {/* Bottom Actions: Trust Note & Rich Gradient Subscribe Button */}
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-[#F0F7FD] to-[#E6F4FB] border border-[#0B3766]/12 rounded-xl px-3 py-2 text-xs mb-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-[#168AD3]" />
                  <span>تقسيط ميسر متاح على 4 دفعات</span>
                </div>
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-bold text-[#0B3766] pf-tabular-nums">
                    {heroCourse?.price && heroCourse.price > 0 
                      ? `${Number(heroCourse.price).toLocaleString("en-US")} ${heroCourse.currency || "ر.س"}` 
                      : "رسوم ميسرة"}
                  </span>
                </div>
              </div>

              <Button
                href={heroCourse ? `/courses/${heroCourse.slug}` : "/courses"}
                size="sm"
                className="w-full h-12 sm:h-14 lg:h-11 xl:h-13 bg-gradient-to-r from-[#0B3766] via-[#168AD3] to-[#19B6C7] hover:from-[#168AD3] hover:to-[#0B3766] text-white font-bold text-xs sm:text-base lg:text-[11.5px] xl:text-sm rounded-xl shadow-lg shadow-[#0B3766]/25 hover:shadow-xl hover:shadow-[#168AD3]/35 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 border border-white/20"
              >
                <CreditCard className="w-4 h-4 text-cyan-100" aria-hidden="true" focusable="false" />
                <span>{heroCourse ? "اشترك الآن وادفع بالتقسيط" : "استعرض الدورات"}</span>
                <ArrowLeft className="w-4 h-4 text-white/80 transition-transform group-hover:-translate-x-0.5" />
              </Button>
            </div>

            {error && (
              <button type="button" onClick={reload} className="relative z-10 font-bold text-[#0B3766] underline text-xs text-center mt-1">
                إعادة المحاولة
              </button>
            )}
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            Center Card: Liquid Glass Hero Main Presentation
           ═══════════════════════════════════════════════════════════════ */}
        <div className="w-full max-w-[550px] lg:max-w-none lg:w-[38%] xl:w-[39%] 2xl:w-[40%] flex-1 order-1 lg:order-2 flex flex-col items-stretch justify-center gap-4 sm:gap-6 lg:gap-3 xl:gap-6 pointer-events-auto">
          {/* Main Liquid Glass Hero Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative liquid-glass-hero liquid-glass-hover border border-white/90 ring-1 ring-[#0B3766]/[0.08] rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[1.5rem] xl:rounded-[2rem] 2xl:rounded-[2.5rem] p-5 sm:p-10 lg:p-6 xl:p-9 w-full flex flex-col justify-center items-center overflow-hidden transition-all duration-700 hover:-translate-y-1 group min-h-0"
          >
            {/* Liquid Glass Curved Specular Sheen */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[inherit] bg-gradient-to-b from-white/85 via-white/25 to-transparent z-0" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#19B6C7]/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

            <div className="relative z-10 text-center w-full">
              {/* Subtitle Badge */}
              <p className="text-[#0B3766] text-xs sm:text-sm lg:text-[10px] xl:text-xs 2xl:text-sm font-bold mb-3 sm:mb-5 lg:mb-3 xl:mb-5 tracking-wide bg-gradient-to-r from-white via-cyan-50/50 to-white shadow-sm border border-[#0B3766]/15 inline-flex items-center gap-1.5 px-3.5 sm:px-5 lg:px-2.5 xl:px-4 py-1.5 sm:py-2 lg:py-1 xl:py-1.5 rounded-full backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#19B6C7]" />
                <span>مَدار للتعلّم المهني</span>
              </p>

              {/* Main Title */}
              <h1 className="hero-main-title-premium mb-3 sm:mb-5 lg:mb-3 xl:mb-5">
                ابدأ رحلتك نحو{" "}
                <br className="hidden sm:block lg:hidden xl:block" />
                <span className="gradient-text inline-block ms-1.5 sm:ms-2 sm:mt-1 lg:mt-0.5 xl:mt-1">التميز المهني</span>
              </h1>

              {/* Typewriter */}
              <div className="hero-typewriter-premium mb-5 sm:mb-8 lg:mb-4 xl:mb-7 h-9 sm:h-12 lg:h-8 xl:h-11 flex items-center justify-center gap-2">
                <span>في المجال</span>
                <span className="font-bold min-w-[72px] sm:min-w-[110px] lg:min-w-[80px] xl:min-w-[105px] inline-block text-right tracking-tight text-[#168AD3]">
                  {displayed}
                  <span className="animate-pulse font-normal opacity-40 text-[#0B3766]">|</span>
                </span>
              </div>

              {/* Action Buttons: High contrast, Gorgeous Gradient & Crisp Pearl */}
              <div className="flex flex-row items-stretch justify-center gap-2.5 sm:gap-4 lg:gap-2.5 xl:gap-4 w-full min-w-0 px-0 sm:px-1 lg:px-0">
                <Button 
                  href="/courses" 
                  size="sm" 
                  className="hero-main-cta flex-1 min-w-0 w-0 h-11 sm:h-14 lg:h-10 xl:h-12 2xl:h-14 text-[13px] sm:text-base lg:text-[11px] xl:text-sm 2xl:text-lg font-bold bg-gradient-to-r from-[#0B3766] to-[#168AD3] hover:from-[#168AD3] hover:to-[#0B3766] text-white border border-white/20 px-2 sm:px-5 lg:px-1 xl:px-4 transition-all hover:scale-[1.02] shadow-md shadow-[#0B3766]/20 whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <Compass className={heroButtonIconClass} aria-hidden="true" focusable="false" />
                  <span className="min-w-0 whitespace-nowrap">استكشف الدورات</span>
                </Button>
                
                <Button 
                  href="/corporate" 
                  variant="secondary" 
                  size="sm" 
                  className="hero-main-cta flex-1 min-w-0 w-0 h-11 sm:h-14 lg:h-10 xl:h-12 2xl:h-14 text-[13px] sm:text-base lg:text-[11px] xl:text-sm 2xl:text-lg font-bold bg-white text-[#0B3766] hover:bg-[#0B3766] hover:text-white border-2 border-[#0B3766]/30 hover:border-[#0B3766] px-2 sm:px-5 lg:px-1 xl:px-4 transition-all hover:scale-[1.02] shadow-sm whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <Building2 className={heroButtonIconClass} aria-hidden="true" focusable="false" />
                  <span className="min-w-0 whitespace-nowrap">دورات الشركات</span>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Liquid Glass Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="w-full relative liquid-glass-card liquid-glass-hover border border-white/80 ring-1 ring-[#0B3766]/[0.06] rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[1.25rem] xl:rounded-[1.5rem] p-3.5 sm:p-5 lg:p-3 xl:p-4 flex flex-row items-center justify-around gap-2 sm:gap-6 lg:gap-2 xl:gap-4 transition-all duration-700 hover:-translate-y-0.5 group shrink-0 overflow-hidden"
          >
            {/* Liquid Glass Curved Specular Sheen */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[inherit] bg-gradient-to-b from-white/80 via-white/20 to-transparent z-0" />

            {/* Stat 1 */}
            <div className="flex flex-row items-center gap-2 sm:gap-3.5 lg:gap-2 xl:gap-3 relative z-10 w-1/2 justify-center text-right">
              <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-8 lg:h-8 xl:w-11 xl:h-11 shrink-0 rounded-xl bg-gradient-to-br from-[#0B3766]/10 to-[#19B6C7]/10 flex items-center justify-center shadow-xs border border-[#0B3766]/15 group-hover:scale-105 transition-transform duration-500">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-[#0B3766]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div className="flex flex-col text-right w-auto">
                <span className="hero-stat-number mb-0.5 pf-tabular-nums text-lg sm:text-2xl text-[#0B3766]">85</span>
                <span className="text-[10px] sm:text-xs lg:text-[8px] xl:text-[11px] text-slate-600 font-bold tracking-wide">دورة وبرنامج</span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-8 sm:h-12 lg:h-6 xl:h-10 bg-slate-200 relative z-10 shadow-xs block rounded-full" />

            {/* Stat 2 */}
            <div className="flex flex-row items-center gap-2 sm:gap-3.5 lg:gap-2 xl:gap-3 relative z-10 w-1/2 justify-center text-right">
              <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-8 lg:h-8 xl:w-11 xl:h-11 shrink-0 rounded-xl bg-gradient-to-br from-[#19B6C7]/10 to-[#168AD3]/10 flex items-center justify-center shadow-xs border border-[#19B6C7]/20 group-hover:scale-105 transition-transform duration-500">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-[#168AD3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex flex-col text-right w-auto">
                <span className="hero-stat-number mb-0.5 pf-tabular-nums text-lg sm:text-2xl text-[#168AD3] font-bold">+5K</span>
                <span className="text-[10px] sm:text-xs lg:text-[8px] xl:text-[11px] text-slate-600 font-bold tracking-wide">طالب</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            Image Card: Liquid Glass Visual Showcase (Left in RTL)
           ═══════════════════════════════════════════════════════════════ */}
        <div className="w-full max-w-[500px] lg:max-w-none lg:w-[31%] xl:w-[30.5%] 2xl:w-[30%] order-2 lg:order-3 flex items-stretch justify-center pointer-events-none">
          <motion.div
            key={heroCourse?.slug || "catalog-status"}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="hero-fixed-side-card relative w-full h-full grid grid-rows-[minmax(0,1fr)_auto] pointer-events-auto liquid-glass-card liquid-glass-hover rounded-[1.75rem] sm:rounded-[2.25rem] lg:rounded-[1.5rem] xl:rounded-[2rem] border border-white/80 ring-1 ring-[#0B3766]/[0.06] transition-all duration-500 overflow-hidden"
          >
            {/* Visual Container */}
            <div className="relative isolate min-h-0 overflow-hidden rounded-t-[1.75rem] sm:rounded-t-[2.25rem] lg:rounded-t-[1.5rem] xl:rounded-t-[2rem]">
              {/* Liquid Glass Curved Specular Sheen */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[35%] rounded-t-[inherit] bg-gradient-to-b from-white/70 via-white/20 to-transparent z-10" />

              <img 
                src={(heroCourse?.slug === "madar-quality" ? "/images/blog/iso-risk-management.jpg" : heroCourse?.slug === "madar-data" ? "/services/data.jpg" : heroCourse?.slug === "madar-teams" ? "/images/blog/pmp-management.jpg" : "/images/blog/pmp-management.jpg")} 
                alt={heroCourse?.title || "مَدار للتعلّم"} 
                className="absolute inset-0 block w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
              />
              
              {/* Subtle top badge over the image */}
              <div className="absolute top-3.5 right-3.5 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/80 shadow-md flex items-center gap-1.5 text-[11px] font-bold text-[#0B3766]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>متاح للتسجيل الفوري</span>
              </div>

              {/* Bottom Vignette */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Bottom Action Area */}
            <div className="relative p-4 sm:p-6 lg:p-4 xl:p-5">
              <Button 
                href={heroCourse ? `/courses/${heroCourse.slug}` : "/courses"} 
                size="sm"
                className="w-full h-12 sm:h-14 lg:h-11 xl:h-13 bg-white hover:bg-[#0B3766] text-[#0B3766] hover:text-white border-2 border-[#0B3766]/30 hover:border-[#0B3766] text-xs sm:text-base lg:text-[11.5px] xl:text-sm font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-[#168AD3] group-hover:text-white transition-colors" aria-hidden="true" focusable="false" />
                <span>{heroCourse ? "تفاصيل ومنهج الدورة" : "استعرض الدورات"}</span>
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              </Button>
            </div>

          </motion.div>
        </div>

      </div>

      {/* Carousel Controls Container */}
      <div className="relative mt-8 mb-16 lg:mt-0 lg:mb-0 lg:absolute lg:bottom-4 xl:bottom-8 left-0 right-0 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 flex items-center justify-center gap-4 sm:gap-6 lg:gap-3 xl:gap-6 z-30 pointer-events-auto mx-auto w-fit bg-white/90 lg:bg-white/60 backdrop-blur-md px-6 sm:px-8 py-2.5 sm:py-3 lg:px-4 lg:py-1.5 xl:px-6 xl:py-2 rounded-full border border-white/80 shadow-lg">
        <button 
          aria-label="الشريحة السابقة" 
          onClick={prevSlide} 
          disabled={heroCourses.length < 2} 
          className="w-10 h-10 sm:w-12 sm:h-12 lg:w-8 lg:h-8 xl:w-10 xl:h-10 rounded-full bg-white/95 hover:bg-[#0B3766] hover:text-white backdrop-blur-xl flex items-center justify-center text-[#0B3766] transition-all shadow-md group/btn ring-2 ring-white/50 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-4 lg:h-4 xl:w-5 xl:h-5 group-hover/btn:scale-110 transition-transform" />
        </button>
        <div className="flex gap-2 sm:gap-3 lg:gap-1.5 xl:gap-2 mx-1 sm:mx-2">
          {heroCourses.map((_, idx) => (
            <button
              key={idx}
              aria-label={`انتقل إلى شريحة ${idx + 1}`}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 sm:h-3 lg:h-1.5 xl:h-2 rounded-full transition-all duration-500 shadow-inner cursor-pointer ${
                slideIndex === idx ? "bg-[#0B3766] w-8 sm:w-10 lg:w-5 xl:w-8" : "bg-slate-300/80 w-2.5 sm:w-3 lg:w-1.5 xl:w-2 hover:bg-[#0B3766]/40"
              }`}
            />
          ))}
        </div>
        <button 
          aria-label="الشريحة التالية" 
          onClick={nextSlide} 
          disabled={heroCourses.length < 2} 
          className="w-10 h-10 sm:w-12 sm:h-12 lg:w-8 lg:h-8 xl:w-10 xl:h-10 rounded-full bg-white/95 hover:bg-[#0B3766] hover:text-white backdrop-blur-xl flex items-center justify-center text-[#0B3766] transition-all shadow-md group/btn ring-2 ring-white/50 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 lg:w-4 lg:h-4 xl:w-5 xl:h-5 group-hover/btn:scale-110 transition-transform" />
        </button>
      </div>

      {/* Decorative Bottom Divider */}
      <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center justify-end h-32 lg:h-20 xl:h-24">
        <div className="absolute bottom-0 left-0 w-full h-[80px] bg-gradient-to-b from-transparent to-white/90" />
        <div className="relative w-full z-20">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#0B3766]/30 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] md:w-[80%] h-[3px] bg-gradient-to-r from-transparent via-[#0B3766]/50 to-transparent blur-[1px]"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-200/50"></div>
        </div>
      </div>

    </section>
  );
}
