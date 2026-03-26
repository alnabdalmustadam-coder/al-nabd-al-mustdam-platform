"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import { courses } from "@/data/courses";

const typewriterWords = ["التقني", "الإداري", "الرقمي", "اللغوي", "القيادي"];
const heroCourses = courses.slice(0, 3).map((c, i) => ({ ...c, image: `/${i + 1}.webp` }));

export default function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);

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
    if (!autoPlayEnabled || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroCourses.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlayEnabled, isPaused]);

  const nextSlide = () => {
    setAutoPlayEnabled(false);
    setCurrentSlide((prev) => (prev + 1) % heroCourses.length);
  };
  const prevSlide = () => {
    setAutoPlayEnabled(false);
    setCurrentSlide((prev) => (prev === 0 ? heroCourses.length - 1 : prev - 1));
  };

  return (
    <section className="relative min-h-screen 2xl:h-[100vh] flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto bg-slate-50 pt-28 pb-16 lg:pt-20 lg:pb-0">

      {/* Particle Grid */}
      <div className="particles-grid opacity-60" />

      {/* Ultra Premium Glow Effects */}
      <div className="absolute top-10 right-[5%] w-[400px] h-[400px] bg-[#173A7C]/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse [animation-duration:8s]" />
      <div className="absolute bottom-10 left-[5%] w-[300px] h-[300px] bg-[#5CB07C]/25 rounded-full blur-[100px] mix-blend-multiply animate-pulse [animation-duration:10s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#1E4D9D]/10 rounded-full blur-[120px]" />

      {/* Section-wide Ornament Background (bg.webp) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none overflow-hidden z-0">
        <img src="/bg.webp" alt="" className="w-full h-full object-cover" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-6 xl:px-12 2xl:px-16 flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-6 sm:gap-10 lg:gap-4 xl:gap-8 min-h-[500px] lg:min-h-[450px] xl:min-h-[550px] py-8 lg:py-16 xl:py-20 pointer-events-none mt-4 lg:mt-0 xl:mt-4 -translate-y-[9vh] lg:-translate-y-[3vh]">

        {/* Left Side (Text content) */}
        <div className="w-full max-w-[500px] lg:max-w-none lg:w-[32%] xl:w-[30%] order-3 lg:order-1 flex items-stretch justify-center pointer-events-none mb-16 lg:mb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="w-full h-full min-h-[300px] lg:min-h-0 text-right pointer-events-auto bg-white/10 backdrop-blur-md p-6 sm:p-10 lg:p-5 xl:p-8 2xl:p-12 rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[1.5rem] xl:rounded-[2rem] border border-white/20 shadow-xl flex flex-col justify-between cursor-pointer"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-lg xl:text-3xl 2xl:text-4xl font-black mb-4 sm:mb-6 lg:mb-3 xl:mb-6 leading-tight text-[#173A7C] drop-shadow-sm line-clamp-2">
                  {heroCourses[currentSlide].title}
                </h2>
                <p className="text-slate-600 text-sm sm:text-base lg:text-xs xl:text-sm 2xl:text-base leading-relaxed font-medium line-clamp-3 sm:line-clamp-4 lg:line-clamp-3 xl:line-clamp-4 2xl:line-clamp-5">
                  {heroCourses[currentSlide].description}
                </p>
              </div>
              <Button href={`/courses/${heroCourses[currentSlide].slug}`} variant="secondary" className="bg-white/80 backdrop-blur-md border border-slate-200 text-[#173A7C] hover:bg-white text-sm sm:text-lg lg:text-[11px] xl:text-sm 2xl:text-lg font-bold h-12 sm:h-14 lg:h-10 xl:h-14 2xl:h-16 shadow-md w-full mt-6 lg:mt-4 xl:mt-6 transition-transform hover:scale-[1.02] whitespace-nowrap flex items-center justify-center">
                اشترك الآن وادفع بالتقسيط
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Center Side (Glass Block + Stats) */}
        <div className="w-full max-w-[550px] lg:max-w-none lg:w-[36%] xl:w-[40%] flex-1 order-1 lg:order-2 flex flex-col items-stretch justify-center gap-4 sm:gap-6 lg:gap-3 xl:gap-8 pointer-events-auto">
          {/* Main Glass Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative bg-white/40 backdrop-blur-[40px] border border-white/40 shadow-[0_40px_80px_-20px_rgba(23,58,124,0.15)] rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[1.5rem] xl:rounded-[2rem] 2xl:rounded-[3rem] p-6 sm:p-10 lg:p-6 xl:p-10 w-full flex flex-col justify-center items-center overflow-hidden transition-all duration-700 hover:shadow-[0_50px_100px_-20px_rgba(23,58,124,0.2)] hover:-translate-y-1 group min-h-[250px] lg:min-h-0"
          >
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/60 to-transparent pointer-events-none rounded-t-[2.5rem] lg:rounded-t-[1.5rem] xl:rounded-t-[2rem] 2xl:rounded-t-[3rem]" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

            <div className="relative z-10 text-center w-full">
              {/* Subtitle */}
              <p className="text-[#5CB07C] text-xs sm:text-sm lg:text-[10px] xl:text-xs 2xl:text-sm font-bold mb-4 sm:mb-6 lg:mb-3 xl:mb-5 tracking-wide bg-white/70 shadow-sm border border-white/90 inline-block px-3 sm:px-5 lg:px-2 xl:px-4 py-1.5 sm:py-2 lg:py-1 xl:py-1.5 rounded-full backdrop-blur-md">
                منصة النبض المستدام للتدريب المهني
              </p>

              {/* Main Title */}
              <h1 className="text-2xl sm:text-4xl lg:text-xl xl:text-3xl 2xl:text-5xl font-black leading-tight mb-4 sm:mb-6 lg:mb-3 xl:mb-6 text-slate-900 drop-shadow-sm">
                ابدأ رحلتك نحو
                <br className="hidden sm:block lg:hidden xl:block" />
                <span className="gradient-text sm:mt-2 lg:mt-1 xl:mt-2 inline-block">التميز المهني</span>
              </h1>

              {/* Typewriter */}
              <div className="text-base sm:text-2xl lg:text-sm xl:text-xl 2xl:text-2xl text-slate-800 mb-6 sm:mb-8 lg:mb-4 xl:mb-8 h-8 sm:h-12 lg:h-6 xl:h-10 flex items-center justify-center gap-2 font-bold">
                <span className="opacity-80">في المجال</span>
                <span className="text-[#173A7C] font-black min-w-[70px] sm:min-w-[100px] lg:min-w-[60px] xl:min-w-[90px] inline-block text-right tracking-tight drop-shadow-sm">
                  {displayed}
                  <span className="animate-pulse font-normal opacity-40">|</span>
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 sm:gap-4 lg:gap-2 xl:gap-4 w-full px-2 lg:px-0">
                <Button href="/courses" size="lg" className="flex-1 w-full h-12 sm:h-14 lg:h-10 xl:h-12 2xl:h-14 text-sm sm:text-lg lg:text-[11px] xl:text-sm 2xl:text-lg font-bold border border-white/20 px-2 sm:px-8 lg:px-1 xl:px-4 transition-transform hover:scale-[1.02] whitespace-nowrap flex items-center justify-center">
                  استكشف الدورات
                </Button>
                <Button href="/corporate" variant="secondary" size="lg" className="flex-1 w-full h-12 sm:h-14 lg:h-10 xl:h-12 2xl:h-14 text-sm sm:text-lg lg:text-[11px] xl:text-sm 2xl:text-lg font-bold bg-white/70 backdrop-blur-md border border-white/80 px-2 sm:px-8 lg:px-1 xl:px-4 transition-transform hover:scale-[1.02] whitespace-nowrap flex items-center justify-center">
                  دورات الشركات
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="w-full relative bg-white/40 backdrop-blur-[40px] border border-white/40 shadow-[0_20px_50px_-10px_rgba(23,58,124,0.1)] rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[1.25rem] xl:rounded-[1.5rem] p-4 sm:p-6 lg:p-3 xl:p-5 flex flex-row items-center justify-around gap-2 sm:gap-6 lg:gap-2 xl:gap-4 transition-all duration-700 hover:shadow-[0_30px_60px_-10px_rgba(23,58,124,0.18)] hover:-translate-y-0.5 group shrink-0"
          >
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 to-transparent pointer-events-none rounded-t-[1.5rem] lg:rounded-t-[1.25rem] xl:rounded-t-[1.5rem]" />

            {/* Stat 1 */}
            <div className="flex flex-row items-center gap-2 sm:gap-4 lg:gap-2 xl:gap-3 relative z-10 w-1/2 justify-center text-right">
              <div className="w-10 h-10 sm:w-16 sm:h-16 lg:w-8 lg:h-8 xl:w-12 xl:h-12 shrink-0 rounded-[1rem] sm:rounded-[1.25rem] lg:rounded-[0.5rem] xl:rounded-[1rem] bg-white/80 flex items-center justify-center shadow-sm border border-white/90 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                <svg className="w-5 h-5 sm:w-8 sm:h-8 lg:w-4 lg:h-4 xl:w-6 xl:h-6 text-[#173A7C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div className="flex flex-col text-right w-auto">
                <span className="text-2xl sm:text-4xl lg:text-lg xl:text-3xl 2xl:text-4xl font-black text-slate-900 leading-tight mb-0.5 drop-shadow-sm">+50</span>
                <span className="text-[10px] sm:text-sm lg:text-[8px] xl:text-[11px] 2xl:text-sm text-slate-600 font-bold tracking-wide">دورة معتمدة</span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-10 sm:h-16 lg:h-8 xl:h-12 bg-black/10 relative z-10 shadow-sm block rounded-full"></div>

            {/* Stat 2 */}
            <div className="flex flex-row items-center gap-2 sm:gap-4 lg:gap-2 xl:gap-3 relative z-10 w-1/2 justify-center text-right">
              <div className="w-10 h-10 sm:w-16 sm:h-16 lg:w-8 lg:h-8 xl:w-12 xl:h-12 shrink-0 rounded-[1rem] sm:rounded-[1.25rem] lg:rounded-[0.5rem] xl:rounded-[1rem] bg-white/80 flex items-center justify-center shadow-sm border border-white/90 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                <svg className="w-5 h-5 sm:w-8 sm:h-8 lg:w-4 lg:h-4 xl:w-6 xl:h-6 text-[#5CB07C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex flex-col text-right w-auto">
                <span className="text-2xl sm:text-4xl lg:text-lg xl:text-3xl 2xl:text-4xl font-black text-slate-900 leading-tight mb-0.5 drop-shadow-sm">+5000</span>
                <span className="text-[10px] sm:text-sm lg:text-[8px] xl:text-[11px] 2xl:text-sm text-slate-600 font-bold tracking-wide">متدرب ومتدربة</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side (Image Area) */}
        <div className="w-full max-w-[500px] lg:max-w-none lg:w-[32%] xl:w-[30%] order-2 lg:order-3 flex items-stretch justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="relative w-full h-full aspect-[4/3] sm:aspect-square lg:aspect-auto min-h-[300px] lg:min-h-[250px] flex items-center justify-center pointer-events-auto bg-white/10 backdrop-blur-md rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[1.5rem] xl:rounded-[2rem] border border-white/20 shadow-xl cursor-pointer"
            >
              <div className="w-full h-full relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[1.5rem] xl:rounded-[2rem]">
                <img src={heroCourses[currentSlide].image} alt={heroCourses[currentSlide].title} className="w-full h-full object-cover sm:object-cover transition-transform duration-[1.5s] ease-out hover:scale-[1.08]" />
              </div>

              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 lg:-top-3 lg:-right-3 xl:-top-5 xl:-right-5 px-3 sm:px-5 lg:px-2 xl:px-4 py-1.5 sm:py-2 lg:py-1 xl:py-1.5 bg-white/80 backdrop-blur-[30px] rounded-xl sm:rounded-2xl lg:rounded-lg xl:rounded-xl shadow-[0_15px_40px_rgba(23,58,124,0.15)] border border-white hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center justify-center z-30">
                <img src="/tabby.webp" alt="Tabby" className="h-6 sm:h-8 lg:h-4 xl:h-6 2xl:h-8 w-auto object-contain drop-shadow-sm" />
              </div>
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 lg:-bottom-3 lg:-left-3 xl:-bottom-5 xl:-left-5 px-3 sm:px-5 lg:px-2 xl:px-4 py-1.5 sm:py-2 lg:py-1 xl:py-1.5 bg-white/80 backdrop-blur-[30px] rounded-xl sm:rounded-2xl lg:rounded-lg xl:rounded-xl shadow-[0_15px_40px_rgba(23,58,124,0.15)] border border-white hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center justify-center z-30">
                <img src="/Tamara.webp" alt="Tamara" className="h-6 sm:h-8 lg:h-4 xl:h-6 2xl:h-8 w-auto object-contain drop-shadow-sm" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Carousel Controls Container */}
      <div className="absolute bottom-24 lg:bottom-4 xl:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 sm:gap-6 lg:gap-3 xl:gap-6 z-30 pointer-events-auto bg-white/40 sm:bg-white/20 backdrop-blur-md px-6 sm:px-8 py-2.5 sm:py-3 lg:px-4 lg:py-1.5 xl:px-6 xl:py-2 rounded-full border border-white/50 shadow-lg">
        <button aria-label="الشريحة السابقة" onClick={prevSlide} className="w-10 h-10 sm:w-12 sm:h-12 lg:w-8 lg:h-8 xl:w-10 xl:h-10 rounded-full bg-white/95 hover:bg-[#173A7C] hover:text-white backdrop-blur-xl flex items-center justify-center text-[#173A7C] transition-all shadow-md group/btn ring-2 ring-white/50">
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-4 lg:h-4 xl:w-5 xl:h-5 group-hover/btn:scale-110 transition-transform" />
        </button>
        <div className="flex gap-2 sm:gap-3 lg:gap-1.5 xl:gap-2 mx-1 sm:mx-2">
          {heroCourses.map((_, idx) => (
            <button
              key={idx}
              aria-label={`انتقل إلى شريحة ${idx + 1}`}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 sm:h-3 lg:h-1.5 xl:h-2 rounded-full transition-all duration-500 shadow-inner ${currentSlide === idx ? "bg-[#173A7C] w-8 sm:w-10 lg:w-5 xl:w-8" : "bg-slate-300/80 w-2.5 sm:w-3 lg:w-1.5 xl:w-2 hover:bg-[#173A7C]/40"
                }`}
            />
          ))}
        </div>
        <button aria-label="الشريحة التالية" onClick={nextSlide} className="w-10 h-10 sm:w-12 sm:h-12 lg:w-8 lg:h-8 xl:w-10 xl:h-10 rounded-full bg-white/95 hover:bg-[#173A7C] hover:text-white backdrop-blur-xl flex items-center justify-center text-[#173A7C] transition-all shadow-md group/btn ring-2 ring-white/50">
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 lg:w-4 lg:h-4 xl:w-5 xl:h-5 group-hover/btn:scale-110 transition-transform" />
        </button>
      </div>

      {/* Decorative Bottom Divider */}
      <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center justify-end h-32 lg:h-20 xl:h-24">
        <div className="absolute bottom-0 left-0 w-full h-[80px] bg-gradient-to-b from-transparent to-white/90" />
        <div className="relative w-full z-20">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/60 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] md:w-[80%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/80 to-transparent blur-[1px]"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-200/50"></div>
        </div>
      </div>

    </section>
  );
}
