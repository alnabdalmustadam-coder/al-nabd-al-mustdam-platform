"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { Building2, ArrowLeft, SlidersHorizontal, ShieldCheck, BarChart3 } from "lucide-react";

export default function CorporateStrip() {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-[#0B3766]/5">
      {/* Background Soft Glows */}
      <div className="absolute top-0 right-0 -m-32 w-[500px] h-[500px] bg-[#0B3766]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -m-32 w-[400px] h-[400px] bg-[#19B6C7]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Main Card - Glassmorphic Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-white/70 backdrop-blur-2xl rounded-[1.75rem] sm:rounded-[2.5rem] border border-white/60 ring-1 ring-inset ring-slate-100/50 shadow-[0_25px_60px_-15px_rgba(11,55,102,0.12)] overflow-hidden p-6 sm:p-12 lg:p-16"
        >
          {/* Top Accent Stripe */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#19B6C7] to-transparent opacity-60" />

          {/* Corner Decorative Glows */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#19B6C7]/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[#0B3766]/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10">
            
            {/* Left: Icon + Content */}
            <div className="flex-1 text-center lg:text-right">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-5 sm:gap-6">
                
                {/* Icon */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0B3766] to-[#19B6C7] rounded-2xl blur-xl opacity-20 scale-110" />
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-[72px] lg:h-[72px] rounded-2xl bg-gradient-to-br from-[#0B3766] via-[#1a4490] to-[#1e5a6e] flex items-center justify-center shadow-lg">
                    <Building2 className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-white" strokeWidth={1.5} />
                  </div>
                </div>

                <div>
                  <h2 className="section-main-title-premium leading-[1.3] mb-3">
                    هل تبحث عن تدريب <span className="gradient-text">لفريقك</span>؟
                  </h2>
                  <p className="section-desc-premium max-w-2xl">
                    برامج تدريبية مخصصة للمؤسسات والشركات مع تقارير أداء شاملة وشهادات إتمام تسهم في رفع إنتاجية فريق عملك.
                  </p>

                  {/* Feature Pills */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-6">
                    {[
                      { icon: ShieldCheck, label: "شهادات إتمام" },
                      { icon: BarChart3, label: "تقارير أداء شاملة" },
                      { icon: SlidersHorizontal, label: "برامج مخصصة" },
                    ].map((item, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                        className="inline-flex items-center gap-2 bg-[#0B3766]/5 border border-[#0B3766]/10 text-[#0B3766] text-xs font-bold px-4 py-2 rounded-full"
                      >
                        <item.icon className="w-3.5 h-3.5 text-[#19B6C7]" />
                        {item.label}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: CTA Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex-shrink-0"
            >
              <Button
                href="/corporate"
                size="lg"
                className="whitespace-nowrap px-10 py-5 text-lg shadow-xl shadow-[#0B3766]/15 hover:shadow-2xl hover:shadow-[#0B3766]/25 rounded-full transition-all duration-300 hover:scale-105"
              >
                اكتشف خطط الشركات
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
