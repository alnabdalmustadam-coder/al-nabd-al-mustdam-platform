"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { ArrowLeft, Rocket, GraduationCap, Users, Award, MessageCircle } from "lucide-react";

const stats = [
  { icon: GraduationCap, value: "85", label: "برنامجًا معروضًا" },
  { icon: Users, value: "5,000+", label: "طالب (توضيحي)" },
  { icon: Award, value: "76", label: "دورة للشركات" },
];

export default function CtaSection() {
  return (
    <section className="py-28 relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-[#0B3766]/5">
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
          <span className="section-badge-glass mb-8">
            <Rocket className="w-4 h-4 text-[#19B6C7]" />
            ابدأ رحلتك الآن
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="section-main-title-premium mb-6"
        >
          جاهز لتطوير{" "}
          <span className="gradient-text">
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
          className="section-desc-premium max-w-2xl mx-auto mb-12"
        >
          استكشف الدورات وبرامج الشركات، وتعرّف على فرص تطوير مهاراتك المهنية.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mb-12 flex w-full max-w-[560px] flex-row items-stretch justify-center gap-2.5 sm:mb-16 sm:gap-4"
        >
          <Button
            href="/courses"
            size="sm"
            className="!flex h-12 min-w-0 w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full !px-2 !py-2 !text-[12px] font-bold leading-none shadow-lg shadow-[#0B3766]/15 transition-transform hover:scale-[1.02] sm:h-14 sm:!px-6 sm:!text-base"
          >
            تصفح الدورات
            <ArrowLeft className="h-3.5 w-3.5 shrink-0 sm:h-5 sm:w-5" />
          </Button>
          <a
            href="/contact"
            className="inline-flex h-12 min-w-0 w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-2 py-2 text-[12px] font-bold leading-none text-[#0B3766] shadow-sm transition-all hover:scale-[1.02] hover:border-[#0B3766]/30 hover:bg-[#0B3766]/5 sm:h-14 sm:px-6 sm:text-base"
          >
            تواصل معنا
            <MessageCircle className="h-3.5 w-3.5 shrink-0 sm:h-5 sm:w-5" />
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
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#0B3766] via-[#1a4490] to-[#1e5a6e] flex items-center justify-center shadow-lg shadow-[#0B3766]/10">
                  <StatIcon className="w-5 h-5 sm:w-7 sm:h-7 text-white" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="hero-stat-number mb-1 sm:mb-2 pf-tabular-nums">{stat.value}</div>
                  <div className="text-slate-500 text-[10px] sm:text-sm font-bold tracking-tight">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </motion.div>
        <p className="mt-5 text-center text-[11px] font-medium leading-6 text-slate-500">
          أرقام البرامج وفق محتوى الديمو، وعدد الطلاب مثال توضيحي غير مستمد من تسجيلات فعلية.
        </p>
      </div>

      {/* Ultra Premium Section Divider */}
      <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center justify-end h-32">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-t from-white to-transparent blur-xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-[#19B6C7]/10 blur-2xl rounded-t-full z-0" />
        <div className="absolute bottom-0 left-0 w-full h-[100px] bg-gradient-to-b from-transparent to-white/70" />
        <div className="relative w-full z-20">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#19B6C7]/80 to-transparent shadow-[0_0_15px_rgba(25,182,199,0.8)]"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 md:w-[70%] h-[3px] bg-gradient-to-r from-transparent via-[#0B3766]/90 to-transparent shadow-[0_0_18px_rgba(11,55,102,0.08)]"></div>
        </div>
      </div>
    </section>
  );
}
