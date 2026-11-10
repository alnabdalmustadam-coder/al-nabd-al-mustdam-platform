"use client";

import { motion } from "framer-motion";
import { Target, Eye, Heart, Award, Users, BookOpen, Globe, PhoneCall } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Award, title: "الجودة", desc: "نلتزم بأعلى معايير الجودة في المحتوى والتقديم وفقاً للمعايير والاعتمادات العالمية." },
  { icon: Heart, title: "الشغف", desc: "نؤمن بأن التعليم رسالة سامية وهدفنا إيصال المعرفة بتفانٍ وشغف معرفي حقيقي." },
  { icon: Users, title: "التمكين", desc: "نسعى لتمكين كل متدرب وكادر مؤسسي من تحقيق أهدافه المهنية والارتقاء بأدائه." },
  { icon: Globe, title: "الابتكار", desc: "نواكب أحدث المنهجيات الرقمية لتوفير تجربة تعليمية معاصرة ومواكبة للمستقبل." },
];

const achievements = [
  { value: "+15", label: "سنوات خبرة مؤسسية" },
  { value: "+5K", label: "متدرب وكادر مؤهل" },
  { value: "+85", label: "دورة وبرنامج معتمد" },
  { value: "+120", label: "شريك نجاح ومؤسسة" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-[#EEF4F9]/60 to-[#FFFFFF] pb-24 overflow-x-clip">
      
      {/* ═══════════════════════════════════════ HERO SECTION ═══════════════════════════════════════ */}
      <section className="relative pt-24 sm:pt-32 pb-20 sm:pb-28 overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden z-0">
          <img src="/bg.webp" alt="" className="w-full h-full object-cover" />
        </div>
        
        {/* Ambient Luxury Glows (Home Identity) */}
        <div className="absolute -top-24 -right-20 w-[550px] h-[550px] bg-[#0B3766]/[0.08] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-[#19B6C7]/[0.07] rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="section-badge-glass mb-4 sm:mb-6">
              من نحن
            </span>
            
            <h1 className="hero-main-title-premium mb-4 sm:mb-6">
              تعرّف على <span className="gradient-text">مَدار للتعلّم</span>
            </h1>
            
            <p className="section-desc-premium max-w-3xl mx-auto text-base sm:text-lg lg:text-xl leading-relaxed">
              منصة تعليمية رائدة نشأت من رحم خبرة تزيد عن 15 عاماً في التدريب والتطوير المهني. 
              نؤمن بأن كل متدرب يستحق تجربة تعليمية رائدة تمكّنه من صنع فارق ملموس في مسيرته وسوق العمل.
            </p>
          </motion.div>
        </div>

        {/* Section Bottom Hairline */}
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center justify-end h-12">
          <div className="w-[85%] md:w-[92%] h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════ OUR STORY (Liquid Glass Card) ═══════════════════════════════════════ */}
      <section className="relative z-30 -mt-10 sm:-mt-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="liquid-glass-card rounded-[2rem] sm:rounded-[2.5rem] p-7 sm:p-12 lg:p-14 relative overflow-hidden border border-white/90 shadow-[0_20px_50px_-15px_rgba(11,55,102,0.12)]"
        >
          {/* Curved Specular Sheen */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[inherit] bg-gradient-to-b from-white/80 via-white/20 to-transparent z-0" />
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#0B3766] via-[#168AD3] to-[#19B6C7] opacity-80" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
            <div className="md:w-1/3 shrink-0 text-right">
              <h2 className="card-title-royal-blue text-2xl sm:text-3xl lg:text-4xl mb-2 text-[#0B3766]">
                قصتنا
              </h2>
              <p className="card-desc-premium text-xs sm:text-sm text-slate-500 font-bold">
                رحلة انطلقت من شغف التطوير والتمكين
              </p>
            </div>
            
            <div className="md:w-2/3 space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base font-medium border-r-2 border-[#0B3766]/15 pr-5 sm:pr-8 text-right">
              <p>
                بدأت رحلتنا من إيمان عميق بأن التعلّم المستمر هو الركيزة الأساسية للنمو الوظيفي والريادة المؤسسية.
                أسسنا <span className="font-bold text-[#0B3766]">مَدار للتعلّم</span> ليكون المحرك الموثوق الذي يربط بين شغف المتدرب واحتياجات سوق العمل الحقيقية.
              </p>
              <p>
                على مدار السنين، دربنا آلاف الكوادر والمهنيين في مختلف القطاعات الحيوية، معتمدين على برامج تفاعلية ومناهج واقعية تحاكي متطلبات العمل الفعلية.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════ MISSION & VISION ═══════════════════════════════════════ */}
      <section className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative liquid-glass-card rounded-[2rem] p-7 sm:p-10 border border-white/80 shadow-[0_12px_36px_-10px_rgba(11,55,102,0.12)] hover:shadow-[0_24px_50px_-12px_rgba(11,55,102,0.18)] transition-all duration-400 hover:-translate-y-1.5 overflow-hidden text-right flex flex-col justify-between"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[inherit] bg-gradient-to-b from-white/70 via-white/10 to-transparent z-0" />
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#0B3766]/[0.05] rounded-bl-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#0B3766] to-[#168AD3] flex items-center justify-center mb-6 shadow-md shadow-[#0B3766]/20 text-white group-hover:scale-105 transition-transform duration-400">
                <Target className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />
              </div>
              <h3 className="card-title-royal-blue text-xl sm:text-2xl font-bold mb-3 text-[#0B3766]">
                رسالتنا
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-medium">
                تقديم تجربة تعليمية متميزة تمكّن الأفراد والمنظمات من اكتساب مهارات عملية معتمدة تصنع فارقاً تشغيلياً حقيقياً، استناداً إلى معايير الجودة والابتكار المستمر.
              </p>
            </div>
          </motion.div>

          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative liquid-glass-card rounded-[2rem] p-7 sm:p-10 border border-white/80 shadow-[0_12px_36px_-10px_rgba(11,55,102,0.12)] hover:shadow-[0_24px_50px_-12px_rgba(11,55,102,0.18)] transition-all duration-400 hover:-translate-y-1.5 overflow-hidden text-right flex flex-col justify-between"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[inherit] bg-gradient-to-b from-white/70 via-white/10 to-transparent z-0" />
            <div className="absolute top-0 left-0 w-28 h-28 bg-[#19B6C7]/[0.05] rounded-br-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#168AD3] to-[#19B6C7] flex items-center justify-center mb-6 shadow-md shadow-[#19B6C7]/20 text-white group-hover:scale-105 transition-transform duration-400">
                <Eye className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />
              </div>
              <h3 className="card-title-royal-blue text-xl sm:text-2xl font-bold mb-3 text-[#0B3766]">
                رؤيتنا
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-medium">
                أن نصبح الشريك الرائد في التدريب المهني بالمملكة بجودة ومصداقية ومخرجات تنافسية تسهم في بناء الكوادر الوطنية وفق مستهدفات رؤية المملكة 2030.
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ═══════════════════════════════════════ CORE VALUES ═══════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-white/70 border-y border-slate-200/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-18">
            <h2 className="section-main-title-premium mb-3 sm:mb-4">
              مبادئنا <span className="gradient-text">الأساسية</span>
            </h2>
            <p className="section-desc-premium max-w-2xl mx-auto text-sm sm:text-base">
              الأسس والقيم التي نبني عليها كل برامجنا وتوجهاتنا، لضمان أعلى درجات الثقة والمصداقية لعملائنا.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="group relative liquid-glass-card rounded-[1.75rem] p-6 sm:p-8 text-center border border-white/85 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between pf-card-equal"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[inherit] bg-gradient-to-b from-white/75 via-white/10 to-transparent z-0" />
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-14 h-14 mb-5 rounded-2xl bg-gradient-to-br from-[#0B3766]/[0.08] to-[#19B6C7]/[0.10] border border-[#0B3766]/12 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-xs">
                      <Icon className="w-6 h-6 text-[#0B3766] group-hover:text-[#168AD3] transition-colors" strokeWidth={2} />
                    </div>
                    <h3 className="card-title-royal-blue text-lg sm:text-xl font-bold mb-2 text-[#0B3766]">
                      {v.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                      {v.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ ACHIEVEMENTS BANNER ═══════════════════════════════════════ */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="liquid-glass-card rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 lg:p-14 border border-white/90 shadow-[0_20px_50px_-15px_rgba(11,55,102,0.12)] relative overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[inherit] bg-gradient-to-b from-white/80 via-white/15 to-transparent z-0" />
          
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
            {achievements.map((a, i) => (
              <div key={i} className="bg-white/85 rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-xs hover:shadow-md transition-all">
                <div className="hero-stat-number mb-1 text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B3766] pf-tabular-nums">
                  {a.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-600">
                  {a.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════ CALL TO ACTION ═══════════════════════════════════════ */}
      <section className="pb-16 pt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-main-title-premium mb-4">
              هل أنت مستعد <span className="gradient-text">لتطوير قدراتك</span>؟
            </h2>
            <p className="section-desc-premium max-w-2xl mx-auto mb-8 text-sm sm:text-base">
              انضم إلينا اليوم واكتشف باقة متميزة من البرامج التدريبية المعتمدة المصممة لتلبي تطلعاتك وتطلعات مؤسستك.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
              <Link 
                href="/courses" 
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#0B3766] via-[#168AD3] to-[#19B6C7] hover:from-[#168AD3] hover:to-[#0B3766] text-white text-sm font-bold shadow-md shadow-[#0B3766]/20 hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <BookOpen className="w-4 h-4" />
                <span>تصفح الدورات</span>
              </Link>
              
              <Link 
                href="/contact" 
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white border-2 border-[#0B3766]/30 text-[#0B3766] hover:bg-[#0B3766] hover:text-white text-sm font-bold shadow-xs hover:shadow-sm transition-all hover:scale-[1.02]"
              >
                <PhoneCall className="w-4 h-4" />
                <span>تواصل معنا</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
