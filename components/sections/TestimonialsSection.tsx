"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import StarRating from "@/components/ui/StarRating";
import { testimonials } from "@/data/testimonials";
import { ChevronLeft, ChevronRight, Quote, MessageSquareQuote } from "lucide-react";

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoplay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
  };

  useEffect(() => {
    startAutoplay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (dir: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrent((prev) => (prev + dir + testimonials.length) % testimonials.length);
    startAutoplay();
  };

  const getOffset = (index: number) => {
    let diff = index - current;
    if (diff > testimonials.length / 2) diff -= testimonials.length;
    if (diff < -testimonials.length / 2) diff += testimonials.length;
    return diff;
  };

  return (
    <section className="relative w-full min-h-[680px] sm:min-h-[750px] lg:h-[100vh] lg:min-h-[750px] py-14 sm:py-20 lg:py-0 flex flex-col justify-center overflow-hidden bg-gradient-to-br from-white via-slate-50 to-[#173A7C]/5">
      {/* Background Ornament (bg.webp) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none overflow-hidden z-0">
        <img src="/bg.webp" alt="" className="w-full h-full object-cover" />
      </div>

      {/* Background Soft Glows */}
      <div className="absolute top-0 right-0 -m-32 w-[600px] h-[600px] bg-[#173A7C]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -m-32 w-[600px] h-[600px] bg-[#5CB07C]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 xs:mb-10 sm:mb-16 lg:mb-20 pt-2 sm:pt-0"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 text-[#173A7C] text-xs sm:text-sm font-black tracking-wider uppercase bg-white px-4 py-1.5 sm:px-5 sm:py-2 rounded-full mb-3 sm:mb-5 border border-slate-200 shadow-xs mx-auto">
            <MessageSquareQuote className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5CB07C]" />
            آراء المتدربين
          </span>
          <h2 className="text-[20px] xs:text-[24px] sm:text-3xl lg:text-4xl font-black text-[#173A7C] mt-1.5 sm:mt-2 leading-tight tracking-tight whitespace-nowrap">
            ماذا يقول <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">متدربونا</span>؟
          </h2>
          <p className="mt-2 sm:mt-4 text-slate-500 text-xs sm:text-base max-w-xl mx-auto font-medium leading-relaxed px-2">
            قصص نجاح حقيقية من متدربين انطلقوا في مسيراتهم المهنية.
          </p>
        </motion.div>

        {/* 3D Carousel */}
        <div className="relative h-[360px] xs:h-[380px] sm:h-[390px] w-full flex items-center justify-center [perspective:2000px] overflow-visible">
          {testimonials.map((t, index) => {
            const offset = getOffset(index);
            const isActive = offset === 0;
            // Only show 3 cards on larger screens (offset -1, 0, 1)
            const isVisible = Math.abs(offset) <= 1;

            if (!isVisible) return null;

            return (
              <motion.div
                key={t.id}
                animate={{
                  x: `${offset * (typeof window !== 'undefined' && window.innerWidth < 640 ? 260 : 380)}px`,
                  scale: isActive ? 1 : 0.85,
                  zIndex: isActive ? 30 : 20,
                  opacity: isActive ? 1 : 0.45,
                  rotateY: offset * -15,
                }}
                transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1.2] }}
                className="absolute w-[260px] xs:w-[285px] sm:w-[380px] cursor-pointer"
                onClick={() => {
                  if (offset !== 0) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setCurrent(index);
                    startAutoplay();
                  }
                }}
              >
                {/* Ultra Professional Light Card (Compact & High Contrast) */}
                <div className={`relative rounded-[2rem] transition-all duration-700 ${isActive
                    ? "bg-white backdrop-blur-xl border border-white shadow-[0_20px_60px_-15px_rgba(23,58,124,0.15),0_10px_30px_-10px_rgba(92,176,124,0.08),inset_0_0_0_1px_rgba(255,255,255,1)]"
                    : "bg-slate-50/90 border border-slate-200/50 shadow-xl backdrop-blur-md grayscale-[10%]"
                  }`}>

                  {/* Elegant Gradient Accent */}
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-[3px] bg-gradient-to-r from-transparent via-[#5CB07C] to-transparent transition-all duration-700 ${isActive ? 'w-1/2 opacity-100' : 'w-0 opacity-0'}`} />

                  {/* Avatar - Floating Aura */}
                  <div className={`absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 z-20 transition-all duration-700 ${isActive ? 'scale-100 translate-y-0' : 'scale-90 translate-y-3 opacity-90'}`}>
                    <div className="relative group">
                      {/* Magnetic Inner Glow */}
                      <div className={`absolute inset-0 bg-gradient-to-b from-[#173A7C]/30 to-[#5CB07C]/40 rounded-full blur-lg transition-all duration-700 ${isActive ? 'opacity-100 scale-125' : 'opacity-0 scale-100'}`} />
                      
                      <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-1 transition-all duration-700 ${isActive ? 'shadow-[0_10px_20px_-5px_rgba(23,58,124,0.3)]' : 'shadow-md inline-block border border-slate-200'}`}>
                        <div className="w-full h-full rounded-full overflow-hidden border border-slate-100">
                          {t.avatar ? (
                            <img src={t.avatar} alt={t.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br transition-colors duration-700 ${
                              t.gender === 'female' 
                                ? 'from-rose-50 to-rose-100 text-rose-400' 
                                : 'from-slate-50 to-slate-100 text-[#173A7C]'
                            }`}>
                              {t.gender === 'female' ? (
                                <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" opacity=".3"/><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                              ) : (
                                <div className="text-xl sm:text-2xl font-black">{t.name[0]}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`relative z-10 p-5 xs:p-6 sm:p-8 pt-11 xs:pt-12 sm:pt-14 pb-8 xs:pb-9 sm:pb-12 text-center transition-all duration-700 ${isActive ? 'scale-100' : 'scale-95'}`}>
                    
                    {/* Header: Name + Role */}
                    <div className="mb-3 sm:mb-5">
                      <h4 className={`font-black text-base sm:text-lg lg:text-xl tracking-tight mb-1.5 transition-all duration-700 ${isActive ? 'text-[#173A7C]' : 'text-slate-500'}`}>
                        {t.name}
                      </h4>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors duration-700 ${isActive ? 'bg-slate-100/70 border border-slate-200/80 shadow-2xs' : 'bg-transparent'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-700 ${isActive ? 'bg-[#5CB07C] shadow-[0_0_8px_rgba(92,176,124,0.8)] animate-pulse' : 'bg-slate-300'}`} />
                        <p className={`text-[9px] sm:text-[9.5px] font-bold uppercase tracking-wider transition-colors duration-700 ${isActive ? 'text-slate-600' : 'text-slate-400'}`}>{t.role}</p>
                      </div>
                    </div>

                    {/* Content with Watermark Quote */}
                    <div className="relative mb-4 sm:mb-6 max-w-[95%] mx-auto">
                      <Quote strokeWidth={1} className={`absolute -top-3 -right-1 w-10 h-10 sm:w-14 sm:h-14 -scale-x-100 z-0 transition-all duration-700 ${isActive ? 'text-slate-100/90 rotate-12' : 'text-slate-200/50 rotate-0'}`} />
                      <p className={`relative z-10 text-xs xs:text-[13px] sm:text-[14px] leading-[1.7] sm:leading-[1.8] font-bold tracking-tight transition-colors duration-700 ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                        &quot;{t.content}&quot;
                      </p>
                    </div>

                    {/* Footer: Course Pill Details */}
                    <div className={`pt-3 sm:pt-4 border-t border-dashed transition-all duration-700 flex flex-col items-center gap-1.5 ${isActive ? 'border-slate-300/80' : 'border-slate-200/50'}`}>
                      <span className={`text-[9px] sm:text-[9.5px] font-black uppercase tracking-wider block transition-colors duration-700 ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>
                        المتدرب في دورة
                      </span>
                      <span className={`text-[#173A7C] text-[11px] sm:text-[12px] font-extrabold bg-[#173A7C]/[0.05] px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-[#173A7C]/10 transition-all duration-700 ${isActive ? 'opacity-100 scale-100' : 'opacity-70 scale-95 grayscale'}`}>
                        {t.courseTitle}
                      </span>
                    </div>
                  </div>

                  {/* Rating Pill - Award Token Style */}
                  <div className={`absolute -bottom-4 sm:-bottom-5 left-1/2 -translate-x-1/2 z-20 transition-all duration-700 ${isActive ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 -translate-y-4 opacity-0 pointer-events-none'}`}>
                    <div className="bg-white border border-slate-200 shadow-[0_8px_16px_-4px_rgba(23,58,124,0.2)] ring-1 ring-slate-200/60 rounded-full px-4 sm:px-5 py-1.5 sm:py-2 flex items-center justify-center min-w-[120px] sm:min-w-[140px] backdrop-blur-md">
                      <StarRating rating={t.rating} size="sm" className="gap-1 brightness-110" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-8 xs:mt-10 sm:mt-16 lg:mt-20 relative z-30">
          <button
            onClick={() => go(-1)}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#173A7C] hover:border-[#173A7C]/30 hover:bg-[#173A7C]/5 transition-all cursor-pointer shadow-xs hover:shadow-md"
            aria-label="السابق"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (intervalRef.current) clearInterval(intervalRef.current);
                  setCurrent(i);
                  startAutoplay();
                }}
                className={`rounded-full transition-all duration-500 cursor-pointer ${i === current
                    ? "bg-gradient-to-r from-[#173A7C] to-[#5CB07C] w-6 sm:w-8 h-2.5 sm:h-3 shadow-xs shadow-[#173A7C]/30"
                    : "bg-slate-200 w-2.5 sm:w-3 h-2.5 sm:h-3 hover:bg-slate-300"
                  }`}
                aria-label={`شهادة ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => go(1)}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#173A7C] hover:border-[#173A7C]/30 hover:bg-[#173A7C]/5 transition-all cursor-pointer shadow-xs hover:shadow-md"
            aria-label="التالي"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Ultra Premium Section Divider */}
      <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center justify-end h-32">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-t from-white to-transparent blur-xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-[#5CB07C]/10 blur-2xl rounded-t-full z-0" />
        <div className="absolute bottom-0 left-0 w-full h-[100px] bg-gradient-to-b from-transparent to-white/70" />
        <div className="relative w-full z-20">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/80 to-transparent shadow-[0_0_15px_rgba(92,176,124,0.8)]"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 md:w-[70%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/90 to-transparent shadow-[0_0_18px_rgba(23,58,124,0.9)]"></div>
        </div>
      </div>
    </section>
  );
}
