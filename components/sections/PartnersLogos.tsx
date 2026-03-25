"use client";

import { motion } from "framer-motion";
import { Handshake } from "lucide-react";

const partners = [
  "طيران الإمارات",
  "أرامكو",
  "STC",
  "البنك الأهلي",
  "الراجحي",
  "مايكروسوفت",
  "جوجل",
  "هواوي",
  "أمازون",
  "سابك",
];

const row1 = ["طيران الإمارات", "أرامكو", "STC", "البنك الأهلي", "الراجحي", "مايكروسوفت", "جوجل"];
const row2 = ["هواوي", "أمازون", "سابك", "طيران الإمارات", "الراجحي", "جوجل", "أرامكو"];
const row3 = ["STC", "البنك الأهلي", "مايكروسوفت", "سابك", "هواوي", "أمازون", "طيران الإمارات"];

const cardClass = "flex items-center gap-4 shrink-0 mx-3 w-[220px] p-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 ring-1 ring-inset ring-slate-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_-10px_rgba(23,58,124,0.12)] hover:-translate-y-1 hover:border-[#5CB07C]/30 transition-all duration-500 group cursor-default";

const renderCard = (name: string, i: number) => (
  <div key={i} className={cardClass}>
    {/* Premium Generated Logo Icon */}
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#173A7C]/5 to-[#5CB07C]/5 flex items-center justify-center shrink-0 border border-[#173A7C]/10 group-hover:border-[#5CB07C]/30 transition-colors duration-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#173A7C] to-[#5CB07C] opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
      <span className="text-xl font-black text-[#173A7C] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-br group-hover:from-[#173A7C] group-hover:to-[#5CB07C] transition-all duration-300">
        {name.substring(0, 1)}
      </span>
    </div>
    
    {/* Company Name */}
    <span className="text-[15px] text-slate-700 font-bold whitespace-nowrap tracking-wide group-hover:text-[#173A7C] transition-colors duration-300">
      {name}
    </span>
  </div>
);

export default function PartnersLogos() {
  return (
    <section className="pt-28 pb-40 relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-[#173A7C]/5">
      {/* Background Soft Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#173A7C]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#5CB07C]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay pointer-events-none" />

      {/* Section Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16 relative z-10 px-4"
      >
        <span className="inline-flex items-center gap-2 text-[#173A7C] text-sm font-black tracking-widest uppercase bg-white px-5 py-2 rounded-full mb-6 border border-slate-200 shadow-sm mx-auto">
          <Handshake className="w-4 h-4 text-[#5CB07C]" />
          شركاء النجاح
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#173A7C] mt-2 leading-[1.2] tracking-tight">
          ثقة <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">المؤسسات الرائدة</span>
        </h2>
        <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto font-medium leading-relaxed">
          نفخر بشراكتنا مع كبرى المؤسسات والشركات في المنطقة.
        </p>
      </motion.div>

      {/* Marquee Rows Container - max 1200px */}
      <div className="max-w-[1200px] mx-auto space-y-4">

        {/* Row 1 - RTL */}
        <div className="relative overflow-hidden py-1">
          <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="marquee-track">
            {[...row1, ...row1, ...row1].map((name, i) => renderCard(name, i))}
          </div>
        </div>

        {/* Row 2 - LTR (Reverse) */}
        <div className="relative overflow-hidden py-1">
          <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="marquee-track-fast">
            {[...row2, ...row2, ...row2].map((name, i) => renderCard(name, i))}
          </div>
        </div>

        {/* Row 3 - RTL (Slower) */}
        <div className="relative overflow-hidden py-1">
          <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
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
