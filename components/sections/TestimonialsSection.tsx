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
    <section className="pt-32 pb-44 relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-[#173A7C]/5">
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
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 text-[#173A7C] text-sm font-black tracking-widest uppercase bg-white px-5 py-2 rounded-full mb-6 border border-slate-200 shadow-sm mx-auto">
            <MessageSquareQuote className="w-4 h-4 text-[#5CB07C]" />
            آراء المتدربين
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#173A7C] mt-2 leading-[1.2] tracking-tight">
            ماذا يقول <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">متدربونا</span>؟
          </h2>
          <p className="mt-6 text-slate-500 text-lg max-w-xl mx-auto font-medium leading-relaxed">
            قصص نجاح حقيقية من متدربين انطلقوا في مسيراتهم المهنية.
          </p>
        </motion.div>

        {/* 3D Carousel */}
        <div className="relative h-[400px] sm:h-[340px] w-full flex items-center justify-center [perspective:1200px] overflow-visible">
          {testimonials.map((t, index) => {
            const offset = getOffset(index);
            const isActive = offset === 0;
            const isVisible = Math.abs(offset) <= 2;

            if (!isVisible) return null;

            return (
              <motion.div
                key={t.id}
                animate={{
                  x: `${offset * 320}px`,
                  scale: isActive ? 1 : 0.88,
                  zIndex: isActive ? 30 : 20 - Math.abs(offset),
                  opacity: isActive ? 1 : Math.abs(offset) === 1 ? 0.5 : 0.15,
                  rotateY: offset * -6,
                }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className="absolute w-[280px] sm:w-[360px] cursor-pointer"
                onClick={() => {
                  if (offset !== 0) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setCurrent(index);
                    startAutoplay();
                  }
                }}
              >
                {/* Ultra Premium Dark Card */}
                <div className={`relative rounded-[2rem] overflow-hidden transition-all duration-500 ${isActive
                    ? "bg-gradient-to-br from-[#173A7C] via-[#1a4490] to-[#1e5a6e] border border-white/15 shadow-[0_30px_70px_-20px_rgba(23,58,124,0.5),0_0_60px_-10px_rgba(92,176,124,0.1)] ring-1 ring-inset ring-white/10"
                    : "bg-gradient-to-br from-[#173A7C]/90 to-[#1a4490]/80 border border-white/10 shadow-lg"
                  }`}>

                  {/* Top Accent Gradient Stripe */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#5CB07C] to-transparent opacity-60" />

                  {/* Corner Decorative Glow */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#5CB07C]/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#173A7C]/15 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 p-7 sm:p-8">

                    {/* Header: Avatar + Name + Quote */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        {/* Glowing Avatar */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#5CB07C] to-[#173A7C] rounded-full blur-md opacity-40 scale-110" />
                          <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#5CB07C] to-[#173A7C] p-[2px] shadow-lg">
                            <div className="w-full h-full rounded-full bg-[#173A7C] flex items-center justify-center text-lg font-black text-white">
                              {t.name[0]}
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-white font-bold text-[15px] truncate">{t.name}</h4>
                          <p className="text-slate-400 text-xs truncate mt-0.5">{t.role}</p>
                        </div>
                      </div>
                      <Quote className="w-9 h-9 text-[#5CB07C]/15 rotate-180 flex-shrink-0 mt-1" />
                    </div>

                    {/* Stars */}
                    <div className="mb-4">
                      <StarRating rating={t.rating} size="sm" className="justify-start" />
                    </div>

                    {/* Content */}
                    <p className="text-slate-300/90 text-[13.5px] leading-[2] mb-6 line-clamp-3 font-medium tracking-wide">
                      &quot;{t.content}&quot;
                    </p>

                    {/* Footer: Course Badge */}
                    <div className="pt-5 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 bg-[#5CB07C]/[0.08] text-[#5CB07C] border border-[#5CB07C]/15 px-3.5 py-1.5 rounded-full text-[11px] font-bold truncate max-w-[85%]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5CB07C] flex-shrink-0 shadow-[0_0_6px_rgba(92,176,124,0.6)]" />
                        {t.courseTitle}
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(3)].map((_, k) => (
                          <div key={k} className="w-1 h-1 rounded-full bg-white/20" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-6 mt-14 relative z-30">
          <button
            onClick={() => go(-1)}
            className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#173A7C] hover:border-[#173A7C]/30 hover:bg-[#173A7C]/5 transition-all cursor-pointer shadow-sm hover:shadow-lg"
            aria-label="السابق"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-2.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (intervalRef.current) clearInterval(intervalRef.current);
                  setCurrent(i);
                  startAutoplay();
                }}
                className={`rounded-full transition-all duration-500 cursor-pointer ${i === current
                    ? "bg-gradient-to-r from-[#173A7C] to-[#5CB07C] w-8 h-3 shadow-sm shadow-[#173A7C]/30"
                    : "bg-slate-200 w-3 h-3 hover:bg-slate-300"
                  }`}
                aria-label={`شهادة ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => go(1)}
            className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#173A7C] hover:border-[#173A7C]/30 hover:bg-[#173A7C]/5 transition-all cursor-pointer shadow-sm hover:shadow-lg"
            aria-label="التالي"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
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
