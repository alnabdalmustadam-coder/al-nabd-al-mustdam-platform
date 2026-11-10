"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import StarRating from "@/components/ui/StarRating";
import { testimonials } from "@/data/testimonials";
import { ChevronLeft, ChevronRight, Quote, MessageSquareQuote } from "lucide-react";

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoplay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 4500);
  };

  useEffect(() => {
    if (!isPaused) {
      startAutoplay();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, testimonials.length]);

  const go = (dir: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrent((prev) => (prev + dir + testimonials.length) % testimonials.length);
    if (!isPaused) startAutoplay();
  };

  const getOffset = (index: number) => {
    const total = testimonials.length;
    let diff = index - current;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  return (
    <section className="relative w-full min-h-[720px] sm:min-h-[760px] lg:min-h-[800px] py-16 sm:py-24 lg:py-28 flex flex-col justify-center overflow-hidden bg-gradient-to-b from-[#F8FAFC] via-[#EEF4F9]/50 to-[#FFFFFF]">
      {/* Background Ornament (bg.webp) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden z-0">
        <img src="/bg.webp" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 z-10">

        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 xs:mb-12 sm:mb-16 lg:mb-20 pt-2 sm:pt-0"
        >
          <span className="section-badge-glass mb-3 sm:mb-5">
            <MessageSquareQuote className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#19B6C7]" />
            آراء المتدربين
          </span>
          <h2 className="section-main-title-premium mt-1.5 sm:mt-2 whitespace-nowrap">
            ماذا يقول <span className="gradient-text">متدربونا</span>؟
          </h2>
          <p className="section-desc-premium mt-2 sm:mt-4 max-w-xl mx-auto px-2">
            قصص نجاح حقيقية من متدربين انطلقوا في مسيراتهم المهنية وصنعوا فارقاً ملموساً.
          </p>
        </motion.div>

        {/* 3D Circular Carousel Stage (Contained with Generous Side Breathing Room — Zero White Aura) */}
        <div 
          className="relative h-[440px] xs:h-[460px] sm:h-[480px] lg:h-[500px] w-full max-w-5xl mx-auto flex items-center justify-center [perspective:2000px] overflow-visible"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {testimonials.map((t, index) => {
            const offset = getOffset(index);
            const isActive = offset === 0;
            // Show active card and immediate neighbors (3 cards visible at a time)
            const isVisible = Math.abs(offset) <= 1;

            if (!isVisible) return null;

            return (
              <motion.div
                key={t.id}
                animate={{
                  x: `${offset * (typeof window !== 'undefined' ? (window.innerWidth < 640 ? 250 : window.innerWidth < 1024 ? 305 : 345) : 345)}px`,
                  scale: isActive ? 1.03 : 0.88,
                  zIndex: isActive ? 30 : 20 - Math.abs(offset),
                  opacity: isActive ? 1 : 0.82,
                  rotateY: offset * -12,
                }}
                transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1.15] }}
                className="absolute w-[270px] xs:w-[295px] sm:w-[330px] lg:w-[355px] cursor-pointer overflow-visible select-none py-8"
                onClick={() => {
                  if (offset !== 0) {
                    go(offset > 0 ? 1 : -1);
                  }
                }}
              >
                {/* Outer Wrapper with overflow-visible to guarantee NO CLIPPING of Avatar or Stars */}
                <div className="relative overflow-visible">

                  {/* 1. Floating Avatar at top center (Overlapping top edge, fully visible) */}
                  <div className={`absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 z-30 transition-all duration-700 ${isActive ? 'scale-100' : 'scale-90 opacity-95'}`}>
                    <div className="relative group">
                      <div className={`absolute inset-0 bg-gradient-to-b from-[#0B3766]/30 to-[#19B6C7]/40 rounded-full blur-md transition-all duration-700 ${isActive ? 'opacity-100 scale-125' : 'opacity-40 scale-100'}`} />
                      
                      <div className={`relative w-15 h-15 sm:w-18 sm:h-18 rounded-full bg-white p-1 transition-all duration-700 ${isActive ? 'shadow-[0_10px_20px_-5px_rgba(11,55,102,0.12)] ring-2 ring-[#0B3766]/20' : 'shadow-md border border-slate-200'}`}>
                        <div className="w-full h-full rounded-full overflow-hidden border border-slate-100 flex items-center justify-center">
                          {t.avatar ? (
                            <img src={t.avatar} alt={t.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center font-bold text-lg sm:text-xl text-white ${
                              t.gender === 'female' 
                                ? 'bg-gradient-to-br from-[#19B6C7] to-[#0B3766]' 
                                : 'bg-gradient-to-br from-[#0B3766] to-[#168AD3]'
                            }`}>
                              {t.name[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Liquid Glass Card Body */}
                  <div className={`relative rounded-[2.25rem] transition-all duration-700 liquid-glass-card overflow-hidden pt-12 sm:pt-14 pb-10 sm:pb-11 px-6 sm:px-8 text-center min-h-[340px] sm:min-h-[360px] flex flex-col justify-between ${isActive
                      ? "border-2 border-white ring-1 ring-[#0B3766]/15 shadow-[0_26px_65px_-15px_rgba(11,55,102,0.08),0_12px_32px_-10px_rgba(11,55,102,0.08)]"
                      : "border border-white/80 ring-1 ring-[#0B3766]/[0.06] shadow-lg"
                    }`}>

                    {/* Curved Liquid Glass Specular Gloss Sheen */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[inherit] bg-gradient-to-b from-white/85 via-white/20 to-transparent z-0" />

                    {/* Top Accent Strip */}
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-[3px] bg-gradient-to-r from-transparent via-[#19B6C7] to-transparent transition-all duration-700 ${isActive ? 'w-1/2 opacity-100' : 'w-1/3 opacity-40'}`} />

                    {/* Card Content */}
                    <div className="relative z-10">
                      {/* Name + Role */}
                      <div className="mb-3 sm:mb-4">
                        <h4 className="card-title-royal-blue text-base sm:text-lg lg:text-xl font-bold mb-1.5 text-[#0B3766]">
                          {t.name}
                        </h4>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/80 shadow-2xs">
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#19B6C7] shadow-[0_0_8px_rgba(25,182,199,0.8)] animate-pulse' : 'bg-slate-400'}`} />
                          <p className="text-[10px] sm:text-[11px] font-bold text-slate-600">{t.role}</p>
                        </div>
                      </div>

                      {/* Quote Text */}
                      <div className="relative my-3 sm:my-4 max-w-[96%] mx-auto">
                        <Quote strokeWidth={1} className="absolute -top-3 -right-2 w-10 h-10 -scale-x-100 z-0 text-slate-100/90 rotate-12" />
                        <p className="relative z-10 text-[13px] xs:text-[13.5px] sm:text-[14.5px] leading-[1.85] font-medium text-slate-700">
                          &quot;{t.content}&quot;
                        </p>
                      </div>
                    </div>

                    {/* Footer: Course Detail */}
                    <div className="relative z-10 pt-3 border-t border-dashed border-slate-200/80 flex flex-col items-center gap-1">
                      <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        المتدرب في دورة
                      </span>
                      <span className="text-[#0B3766] text-[11px] sm:text-[12px] font-bold bg-[#0B3766]/[0.06] px-3.5 py-1 rounded-full border border-[#0B3766]/12">
                        {t.courseTitle}
                      </span>
                    </div>

                  </div>

                  {/* 3. Floating Rating Pill at bottom center (Overlapping bottom edge, fully visible) */}
                  <div className={`absolute -bottom-4 sm:-bottom-5 left-1/2 -translate-x-1/2 z-30 transition-all duration-700 ${isActive ? 'scale-100 opacity-100' : 'scale-90 opacity-90'}`}>
                    <div className="bg-white/95 border border-slate-200/90 shadow-[0_8px_18px_-4px_rgba(11,55,102,0.12)] ring-1 ring-slate-200/60 rounded-full px-4 sm:px-5 py-1.5 sm:py-2 flex items-center justify-center min-w-[125px] sm:min-w-[145px] backdrop-blur-md">
                      <StarRating rating={t.rating} size="sm" className="gap-1 brightness-110" />
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Carousel Navigation & Controls */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-8 sm:mt-12 relative z-30">
          <button
            onClick={() => go(-1)}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#0B3766] hover:bg-[#0B3766] hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-md"
            aria-label="السابق"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
          </button>

          {/* Indicators for all 6 cards */}
          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrent(i);
                  if (!isPaused) startAutoplay();
                }}
                className={`rounded-full transition-all duration-500 cursor-pointer ${
                  i === current
                    ? "bg-gradient-to-r from-[#0B3766] to-[#19B6C7] w-7 sm:w-9 h-2.5 sm:h-3 shadow-xs shadow-[#0B3766]/30"
                    : "bg-slate-300 w-2.5 sm:w-3 h-2.5 sm:h-3 hover:bg-slate-400"
                }`}
                aria-label={`شهادة ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => go(1)}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#0B3766] hover:bg-[#0B3766] hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-md"
            aria-label="التالي"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Section Bottom Divider */}
      <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center justify-end h-16">
        <div className="relative w-full z-20">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#19B6C7]/60 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 md:w-[70%] h-[3px] bg-gradient-to-r from-transparent via-[#0B3766]/70 to-transparent"></div>
        </div>
      </div>
    </section>
  );
}
