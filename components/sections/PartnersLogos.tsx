"use client";

import { motion } from "framer-motion";
import { Award, BadgeCheck, Building2, CheckCircle2 } from "lucide-react";

interface Partner {
  name: string;
  category: string;
  letter: string;
  color?: string;
}

const row1: Partner[] = [
  { name: "أرامكو السعودية", category: "شريك استراتيجي", letter: "أ" },
  { name: "مايكروسوفت", category: "شريك تقني معتمد", letter: "M" },
  { name: "طيران الإمارات", category: "قطاع الطيران والنقل", letter: "ط" },
  { name: "الاتصالات السعودية STC", category: "شريك الاتصالات والتحول", letter: "S" },
  { name: "البنك الأهلي السعودي", category: "القطاع المصرفي والمالي", letter: "ب" },
  { name: "نيوم NEOM", category: "مشاريع المستقبل والابتكار", letter: "ن" },
  { name: "سابك SABIC", category: "قطاع الصناعات المتقدمة", letter: "س" },
];

const row2: Partner[] = [
  { name: "جوجل كلاود Google", category: "الحلول السحابية والذكاء", letter: "G" },
  { name: "هواوي للاتصالات", category: "البنية التحتية والشبكات", letter: "هـ" },
  { name: "أمازون ويب سيرفيسز", category: "تقنية المعلومات والبيانات", letter: "A" },
  { name: "مصرف الراجحي", category: "الخدمات المالية والمصرفية", letter: "ر" },
  { name: "شركة معادن", category: "التعدين والصناعات الأساسية", letter: "م" },
  { name: "البحر الأحمر الدولية", category: "التطوير السياحي والمستدام", letter: "ب" },
  { name: "هيئة السوق المالية", category: "القطاع الحكومي والتنظيمي", letter: "هـ" },
];

const renderCard = (partner: Partner, key: string) => (
  <div
    key={key}
    dir="rtl"
    className="flex items-center gap-3.5 shrink-0 w-[235px] sm:w-[260px] md:w-[280px] px-4 sm:px-5 py-3.5 rounded-2xl relative overflow-hidden cursor-pointer group
               bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)]
               hover:shadow-[0_16px_32px_-8px_rgba(23,58,124,0.18),0_0_0_1px_rgba(23,58,124,0.12)]
               hover:border-[#173A7C]/30 hover:-translate-y-1.5
               transition-all duration-300 select-none"
  >
    {/* Shimmer sweep on hover */}
    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[#173A7C]/[0.05] to-transparent pointer-events-none" />

    {/* Top accent line */}
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#173A7C] via-[#5CB07C] to-[#173A7C] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

    {/* Logo Monogram */}
    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] bg-gradient-to-br from-[#173A7C]/[0.08] via-slate-50 to-[#5CB07C]/[0.08] flex items-center justify-center shrink-0 border border-slate-200/90 group-hover:border-[#173A7C]/30 group-hover:shadow-[0_4px_12px_rgba(23,58,124,0.12)] group-hover:scale-105 transition-all duration-300 relative">
      <span className="text-base sm:text-lg font-black bg-gradient-to-br from-[#173A7C] to-[#5CB07C] text-transparent bg-clip-text">
        {partner.letter}
      </span>
      <div className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-gradient-to-br from-[#5CB07C] to-[#3d8a5a] flex items-center justify-center border-2 border-white shadow-xs">
        <BadgeCheck className="w-2.5 h-2.5 text-white" strokeWidth={3} />
      </div>
    </div>

    {/* Partner Info */}
    <div className="flex flex-col relative z-10 min-w-0 flex-1 text-right">
      <span className="text-[13px] sm:text-[14px] font-bold text-slate-800 tracking-tight group-hover:text-[#173A7C] transition-colors duration-300 truncate">
        {partner.name}
      </span>
      <div className="flex items-center gap-1.5 mt-1">
        <CheckCircle2 className="w-3 h-3 text-[#5CB07C] shrink-0" strokeWidth={2.5} />
        <span className="text-[10.5px] text-slate-500 font-medium tracking-wide truncate">
          {partner.category}
        </span>
      </div>
    </div>
  </div>
);

export default function PartnersLogos() {
  return (
    <section className="pt-20 sm:pt-24 pb-28 sm:pb-32 relative overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-white">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#173A7C]/[0.03] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#5CB07C]/[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* Section Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 sm:mb-16 relative z-10 px-4"
      >
        {/* Badge */}
        <span className="section-badge-glass mb-6">
          <Award className="w-4 h-4 text-[#5CB07C]" strokeWidth={2.5} />
          شركاء النجاح
        </span>

        <h2 className="section-main-title-premium mt-3 mb-5">
          ثقة{" "}
          <span className="gradient-text">
            المؤسسات الرائدة
          </span>
        </h2>
        <p className="section-desc-premium max-w-lg mx-auto">
          نفخر بشراكتنا مع كبرى المؤسسات والشركات في المملكة والمنطقة لتمكين وتطوير الكوادر
        </p>

        {/* Decorative ornament */}
        <div className="mt-7 flex items-center justify-center gap-2">
          <div className="w-16 h-[2px] rounded-full bg-gradient-to-r from-transparent to-[#173A7C]/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#173A7C] to-[#5CB07C] shadow-sm" />
          <div className="w-16 h-[2px] rounded-full bg-gradient-to-l from-transparent to-[#5CB07C]/30" />
        </div>
      </motion.div>

      {/* Two Horizontal Marquee Rows Moving in Opposite Directions */}
      <div className="max-w-[1400px] mx-auto w-full relative overflow-hidden py-2 space-y-4 sm:space-y-5">
        {/* Row 1 — Moving Horizontally (Forward) */}
        <div className="partners-marquee-window" dir="ltr">
          <div className="partners-marquee-track partners-marquee-forward gap-3.5 sm:gap-5 py-1 px-2">
            {[...row1, ...row1].map((partner, index) =>
              renderCard(partner, `row1-${index}`)
            )}
          </div>
        </div>

        {/* Row 2 — Moving Horizontally in Opposite Direction (Reverse) */}
        <div className="partners-marquee-window" dir="ltr">
          <div className="partners-marquee-track partners-marquee-reverse gap-3.5 sm:gap-5 py-1 px-2">
            {[...row2, ...row2].map((partner, index) =>
              renderCard(partner, `row2-${index}`)
            )}
          </div>
        </div>
      </div>

      {/* Ultra Premium Section Divider */}
      <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center justify-end h-28">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-gradient-to-t from-white to-transparent blur-xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-20 bg-[#5CB07C]/10 blur-2xl rounded-t-full z-0" />
        <div className="absolute bottom-0 left-0 w-full h-[80px] bg-gradient-to-b from-transparent to-white/70" />
        <div className="relative w-full z-20">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/80 to-transparent shadow-[0_0_15px_rgba(92,176,124,0.8)]"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 md:w-[70%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/90 to-transparent shadow-[0_0_18px_rgba(23,58,124,0.9)]"></div>
        </div>
      </div>
    </section>
  );
}
