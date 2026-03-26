"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { ArrowLeft, Rocket, GraduationCap, Users, Award, MessageCircle } from "lucide-react";

const stats = [
  { icon: GraduationCap, value: "+50", label: "دورة تدريبية" },
  { icon: Users, value: "+5000", label: "متدرب" },
  { icon: Award, value: "+30", label: "شهادة معتمدة" },
];

export default function CtaSection() {
  return (
    <section className="py-28 relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-[#173A7C]/5">
      {/* Section-wide Ornament Background (bg.webp) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none overflow-hidden z-0">
        <img 
          src="/bg.webp" 
          alt="" 
          className="w-full h-full object-cover sm:object-cover" 
        />
      </div>

      {/* Noise */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 text-[#173A7C] text-sm font-black tracking-widest uppercase bg-white px-5 py-2.5 rounded-full mb-8 border border-slate-200 shadow-sm">
            <Rocket className="w-4 h-4 text-[#5CB07C]" />
            ابدأ رحلتك الآن
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#173A7C] leading-[1.2] tracking-tight mb-6"
        >
          جاهز لتطوير{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">
            مسيرتك المهنية
          </span>
          ؟
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed mb-12"
        >
          انضم إلى آلاف المتدربين الذين غيّروا مسارهم المهني مع النبض المستدام. سجّل الآن واحصل على شهادات معتمدة.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button
            href="/courses"
            size="lg"
            className="whitespace-nowrap min-w-[220px] justify-center px-10 py-5 text-lg rounded-full shadow-xl shadow-[#173A7C]/15 hover:shadow-2xl hover:shadow-[#173A7C]/25 transition-all duration-300 hover:scale-105"
          >
            تصفح الدورات
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-2 min-w-[220px] px-10 py-5 text-lg font-bold text-[#173A7C] bg-white border border-slate-200 rounded-full hover:border-[#173A7C]/30 hover:bg-[#173A7C]/5 transition-all duration-300 hover:scale-105 shadow-sm"
          >
            تواصل معنا
            <MessageCircle className="w-5 h-5" />
          </a>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 items-start justify-center gap-2 sm:gap-8 lg:gap-16 w-full max-w-3xl mx-auto"
        >
          {stats.map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <div key={i} className="flex flex-col items-center justify-center gap-2 sm:gap-4 text-center">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#173A7C] via-[#1a4490] to-[#1e5a6e] flex items-center justify-center shadow-lg shadow-[#173A7C]/10">
                  <StatIcon className="w-5 h-5 sm:w-7 sm:h-7 text-white" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="text-lg sm:text-3xl font-black text-[#173A7C] leading-none mb-1 sm:mb-2">{stat.value}</div>
                  <div className="text-slate-400 text-[10px] sm:text-sm font-bold tracking-tight">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </motion.div>
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
