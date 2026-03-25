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

  // Optimized Typewriter effect for continuous motion
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
      isReadyToDelete ? 1000 : // Short pause when word is complete
      isReadyToStartNext ? 200 : // Minimal pause before starting next word
      isDeleting ? 50 : 100 // Faster typing speeds
    );
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, wordIndex]);

  // Carousel Auto-play with Hover/Manual control
  useEffect(() => {
    if (!autoPlayEnabled || isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroCourses.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlayEnabled, isPaused]);

  const nextSlide = () => {
    setAutoPlayEnabled(false); // Stop auto-play when user takes control
    setCurrentSlide((prev) => (prev + 1) % heroCourses.length);
  };
  const prevSlide = () => {
    setAutoPlayEnabled(false); // Stop auto-play when user takes control
    setCurrentSlide((prev) => (prev === 0 ? heroCourses.length - 1 : prev - 1));
  };

  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-50 pt-16">
      
      {/* Particle Grid */}
      <div className="particles-grid opacity-60" />

      {/* Ultra Premium Glow Effects */}
      <div className="absolute top-10 right-[5%] w-[600px] h-[600px] bg-[#173A7C]/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse [animation-duration:8s]" />
      <div className="absolute bottom-10 left-[5%] w-[500px] h-[500px] bg-[#5CB07C]/25 rounded-full blur-[120px] mix-blend-multiply animate-pulse [animation-duration:10s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#1E4D9D]/10 rounded-full blur-[150px]" />

      {/* Section-wide Ornament Background (bg.svg) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none overflow-hidden z-0">
        <img 
          src="/bg.svg" 
          alt="" 
          className="w-full h-full object-contain" 
        />
      </div>

      {/* Hero Content Container (Unified Grid for perfect vertical alignment) */}
      <div className="relative z-10 w-full max-w-[1700px] mx-auto px-6 lg:px-16 flex flex-col xl:flex-row items-stretch justify-between gap-12 xl:gap-0 min-h-[600px] py-12 xl:py-20 pointer-events-none">
        
        {/* Left Side (Course Text content) - Swapped to Left */}
        <div className="w-full xl:w-[450px] order-2 xl:order-1 flex items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="w-[450px] h-[500px] text-right pointer-events-auto bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/20 shadow-xl flex flex-col justify-between cursor-pointer"
            >
              <div>
                <h2 className="text-3xl lg:text-4xl font-black mb-6 leading-tight text-[#173A7C] drop-shadow-sm">
                  {heroCourses[currentSlide].title}
                </h2>
                <p className="text-slate-600 text-sm lg:text-base leading-relaxed font-medium line-clamp-6">
                  {heroCourses[currentSlide].description}
                </p>
              </div>
              <Button href={`/courses/${heroCourses[currentSlide].slug}`} variant="secondary" className="bg-white/70 backdrop-blur-md border border-slate-200 text-slate-800 hover:bg-white text-base h-14 shadow-sm w-full">
                اشترك الآن وادفع بالتقسيط
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Center Side (The Fixed 3D Glass Block) */}
        <div className="flex-1 order-1 xl:order-2 flex flex-col items-center justify-center gap-6 pointer-events-auto px-4">
          {/* Main Ultra Premium 3D Glass Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative bg-white/40 backdrop-blur-[40px] border border-white/40 shadow-[0_40px_80px_-20px_rgba(23,58,124,0.15)] rounded-[2.5rem] p-8 lg:p-12 w-full max-w-xl mx-auto overflow-hidden transition-all duration-700 hover:shadow-[0_50px_100px_-20px_rgba(23,58,124,0.2)] hover:-translate-y-1 group"
          >
            {/* Intense Top Reflection Overlay */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/60 to-transparent pointer-events-none rounded-t-[2.5rem]" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            
            <div className="relative z-10 text-center">
              {/* Subtitle */}
              <p className="text-[#5CB07C] text-sm sm:text-base font-bold mb-4 tracking-wide bg-white/60 shadow-sm border border-white/80 inline-block px-4 py-1.5 rounded-full backdrop-blur-md">
                منصة النبض المستدام للتدريب المهني
              </p>

              {/* Main Title (Smaller to fit) */}
              <h1 className="text-2xl sm:text-3xl font-black leading-tight mb-6 text-slate-900 drop-shadow-sm">
                ابدأ رحلتك نحو
                <br />
                <span className="gradient-text">التميز المهني</span>
              </h1>

              {/* Typewriter */}
              <div className="text-lg sm:text-xl text-slate-800 mb-8 h-10 flex items-center justify-center gap-2 font-semibold">
                <span className="opacity-80">في المجال</span>
                <span className="text-[#173A7C] font-black min-w-[120px] inline-block text-right tracking-tight drop-shadow-sm">
                  {displayed}
                  <span className="animate-pulse font-normal opacity-50">|</span>
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button href="/courses" size="lg" className="h-12 text-base border border-white/20 px-8">
                  استكشف الدورات
                </Button>
                <Button href="/corporate" variant="secondary" size="lg" className="h-12 text-base bg-white/70 backdrop-blur-md border-white/80 px-8">
                  دورات الشركات
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Unified 3D Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="w-full relative bg-white/40 backdrop-blur-[40px] border border-white/40 shadow-[0_20px_50px_-10px_rgba(23,58,124,0.1)] rounded-[2rem] p-6 max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-around gap-8 sm:gap-4 transition-all duration-700 hover:shadow-[0_30px_60px_-10px_rgba(23,58,124,0.15)] hover:-translate-y-0.5 group"
          >
            {/* Subtle reflection */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 to-transparent pointer-events-none rounded-t-[2rem]" />
            
            {/* Stat 1 */}
            <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto justify-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[1.25rem] bg-white/70 flex items-center justify-center shadow-sm border border-white/80 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#173A7C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none block mb-1 drop-shadow-sm">+50</span>
                <span className="text-xs text-slate-600 font-bold tracking-wide">دورة معتمدة</span>
              </div>
            </div>
            
            {/* Divider */}
            <div className="w-px h-12 bg-white/60 hidden sm:block relative z-10 shadow-sm"></div>
            <div className="h-px w-full bg-white/60 sm:hidden relative z-10 shadow-sm"></div>

            {/* Stat 2 */}
            <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto justify-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[1.25rem] bg-white/70 flex items-center justify-center shadow-sm border border-white/80 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#5CB07C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none block mb-1 drop-shadow-sm">+5000</span>
                <span className="text-xs text-slate-600 font-bold tracking-wide">متدرب ومتدربة</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side (Course Image Area) - Swapped to Right */}
        <div className="w-full xl:w-[450px] order-3 xl:order-3 flex items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="relative w-[450px] h-[500px] flex items-center justify-center pointer-events-auto bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl cursor-pointer"
            >
              {/* Inner Image Container strictly clipped */}
              <div className="w-full h-full relative overflow-hidden rounded-[2.5rem]">
                <img src={heroCourses[currentSlide].image} alt={heroCourses[currentSlide].title} className="w-full h-full object-fill transition-transform duration-700 hover:scale-105" />
              </div>
              
              {/* Floating Payment Logos Protruding OUTSIDE the card edges */}
              <div className="absolute -top-6 -right-6 px-3.5 py-1.5 bg-white/20 backdrop-blur-[30px] rounded-2xl shadow-[0_15px_40px_rgba(23,58,124,0.15)] border border-white/60 hover:-translate-y-1 hover:scale-105 transition-all duration-500 flex items-center justify-center z-30">
                <img src="/tabby.webp" alt="Tabby" className="h-8 sm:h-9 w-auto object-contain drop-shadow-md" />
              </div>
              <div className="absolute -bottom-6 -left-6 px-3.5 py-1.5 bg-white/20 backdrop-blur-[30px] rounded-2xl shadow-[0_15px_40px_rgba(23,58,124,0.15)] border border-white/60 hover:-translate-y-1 hover:scale-105 transition-all duration-500 flex items-center justify-center z-30">
                <img src="/Tamara.webp" alt="Tamara" className="h-8 sm:h-9 w-auto object-contain drop-shadow-md" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Carousel Controls */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-8 z-30 pointer-events-auto">
        <button aria-label="الشريحة السابقة" onClick={prevSlide} className="w-12 h-12 rounded-full bg-white/90 hover:bg-[#173A7C] hover:text-white backdrop-blur-xl flex items-center justify-center text-[#173A7C] transition-all shadow-lg border border-slate-200 group/btn">
          <ChevronRight className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
        </button>
        <div className="flex gap-4">
          {heroCourses.map((_, idx) => (
            <button
              key={idx}
              aria-label={`انتقل إلى شريحة ${idx + 1}`}
              onClick={() => setCurrentSlide(idx)}
              className={`h-3 rounded-full transition-all duration-300 shadow-sm ${
                currentSlide === idx ? "bg-[#173A7C] w-10" : "bg-[#173A7C]/20 w-3 hover:bg-[#173A7C]/40"
              }`}
            />
          ))}
        </div>
        <button aria-label="الشريحة التالية" onClick={nextSlide} className="w-12 h-12 rounded-full bg-white/90 hover:bg-[#173A7C] hover:text-white backdrop-blur-xl flex items-center justify-center text-[#173A7C] transition-all shadow-lg border border-slate-200 group/btn">
          <ChevronLeft className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
        </button>
      </div>

      {/* Ultra Premium Section Divider */}
      <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center justify-end h-32">
        {/* Subtle Background Glow for the mouse indicator */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-t from-white to-transparent blur-xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-[#5CB07C]/10 blur-2xl rounded-t-full z-0" />

        {/* Glowing aura at the edges */}
        <div className="absolute bottom-0 left-0 w-full h-[100px] bg-gradient-to-b from-transparent to-white/70" />

        {/* Floating animated scroll indicator at the center */}
        <div className="relative flex flex-col items-center justify-center animate-bounce z-30 mb-6">
          <div className="w-[30px] h-[45px] rounded-full border-[1.5px] border-slate-300 bg-white/90 backdrop-blur-md shadow-[0_8px_20px_rgba(23,58,124,0.12)] flex justify-center p-1">
            <div className="w-1.5 h-3 bg-gradient-to-b from-[#173A7C] to-[#5CB07C] rounded-full animate-[pulse_2s_infinite]" />
          </div>
        </div>

        {/* Minimalist Glowing Line Divider replacing the waves */}
        <div className="relative w-full z-20">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          {/* Main wide green glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/80 to-transparent shadow-[0_0_15px_rgba(92,176,124,0.8)]"></div>
          {/* Inner wider blue intense core */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 md:w-[70%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/90 to-transparent shadow-[0_0_18px_rgba(23,58,124,0.9)]"></div>
          {/* Subtle extreme width line */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#173A7C]/40 to-transparent"></div>
        </div>
        
        {/* Seamless transition base */}
        <div className="h-px w-full bg-white absolute bottom-[-1px] z-10"></div>
      </div>
      
    </section>
  );
}
