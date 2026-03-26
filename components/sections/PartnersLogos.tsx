"use client";

import { motion } from "framer-motion";
import { Award, BadgeCheck, Verified } from "lucide-react";

const row1 = ["طيران الإمارات", "أرامكو", "STC", "البنك الأهلي", "الراجحي", "مايكروسوفت", "جوجل"];
const row2 = ["هواوي", "أمازون", "سابك", "طيران الإمارات", "الراجحي", "جوجل", "أرامكو"];
const row3 = ["STC", "البنك الأهلي", "مايكروسوفت", "سابك", "هواوي", "أمازون", "طيران الإمارات"];

const renderCard = (name: string, i: number) => (
  <div
    key={i}
    className="flex items-center gap-4 shrink-0 mx-2.5 w-[260px] px-5 py-4 rounded-2xl relative overflow-hidden cursor-default group
               bg-white border border-slate-200/60 ring-1 ring-inset ring-white
               shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]
               hover:shadow-[0_20px_50px_-12px_rgba(23,58,124,0.2),0_0_0_1px_rgba(23,58,124,0.08)]
               hover:border-[#173A7C]/20 hover:-translate-y-2
               transition-all duration-500"
  >
    {/* Shimmer sweep on hover */}
    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[#173A7C]/[0.04] to-transparent pointer-events-none" />

    {/* Premium top accent line */}
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#173A7C] via-[#5CB07C] to-[#173A7C] opacity-0 group-hover:opacity-80 transition-opacity duration-500" />

    {/* Corner decorative glow */}
    <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-[#5CB07C]/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    
    {/* Logo monogram */}
    <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#173A7C]/[0.06] via-white to-[#5CB07C]/[0.06] flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:border-[#173A7C]/20 group-hover:shadow-[0_4px_12px_rgba(23,58,124,0.1)] group-hover:scale-110 transition-all duration-500 relative">
      <span className="text-lg font-black bg-gradient-to-br from-[#173A7C] to-[#5CB07C] text-transparent bg-clip-text">
        {name.substring(0, 1)}
      </span>
      {/* Verified badge */}
      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-[#5CB07C] to-[#3d8a5a] flex items-center justify-center border-[2.5px] border-white shadow-sm">
        <BadgeCheck className="w-2.5 h-2.5 text-white" strokeWidth={3} />
      </div>
    </div>
    
    {/* Company Info */}
    <div className="flex flex-col relative z-10 min-w-0">
      <span className="text-[14px] text-slate-800 font-bold whitespace-nowrap tracking-wide group-hover:text-[#173A7C] transition-colors duration-300 truncate">
        {name}
      </span>
      <div className="flex items-center gap-1.5 mt-1">
        <Verified className="w-3.5 h-3.5 text-[#5CB07C]" strokeWidth={2.5} />
        <span className="text-[10px] text-slate-400 font-semibold tracking-wide">شريك معتمد</span>
      </div>
    </div>
  </div>
);

export default function PartnersLogos() {
  return (
    <section className="pt-28 pb-40 relative overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-white">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#173A7C]/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#5CB07C]/[0.05] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[300px] bg-[#173A7C]/[0.02] rounded-full blur-[180px] pointer-events-none" />

      {/* Section Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20 relative z-10 px-4"
      >
        {/* Badge */}
        <span className="inline-flex items-center gap-2.5 text-sm font-black tracking-wider uppercase mx-auto mb-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#173A7C]/[0.05] to-[#5CB07C]/[0.05] border border-[#173A7C]/10 text-[#173A7C] shadow-sm">
          <Award className="w-4 h-4 text-[#5CB07C]" strokeWidth={2.5} />
          شركاء النجاح
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mt-3 leading-[1.2] tracking-tight mb-5">
          ثقة{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">
            المؤسسات الرائدة
          </span>
        </h2>
        <p className="text-slate-400 text-base max-w-lg mx-auto font-medium leading-relaxed">
          نفخر بشراكتنا مع كبرى المؤسسات والشركات في المنطقة
        </p>

        {/* Decorative ornament */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-16 h-[2px] rounded-full bg-gradient-to-r from-transparent to-[#173A7C]/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#173A7C] to-[#5CB07C] shadow-sm" />
          <div className="w-16 h-[2px] rounded-full bg-gradient-to-l from-transparent to-[#5CB07C]/30" />
        </div>
      </motion.div>

      {/* Marquee Rows */}
      <div className="max-w-[1300px] mx-auto space-y-5 relative">

        {/* Row 1 */}
        <div className="relative overflow-hidden py-2">


          <div className="marquee-track">
            {[...row1, ...row1, ...row1].map((name, i) => renderCard(name, i))}
          </div>
        </div>

        {/* Row 2 */}
        <div className="relative overflow-hidden py-2">

          <div className="marquee-track-fast">
            {[...row2, ...row2, ...row2].map((name, i) => renderCard(name, i))}
          </div>
        </div>

        {/* Row 3 */}
        <div className="relative overflow-hidden py-2">

          <div className="marquee-track-slow">
            {[...row3, ...row3, ...row3].map((name, i) => renderCard(name, i))}
          </div>
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
