"use client";

import { motion } from "framer-motion";
import { Target, Eye, Heart, Award, Users, BookOpen, Globe, PhoneCall, ShieldCheck, FileCheck, QrCode, BadgePercent, Building } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const values = [
  { icon: Award, title: "الجودة", desc: "نلتزم بأعلى معايير الجودة في المحتوى والتقديم وفقاً للمعايير العالمية" },
  { icon: Heart, title: "الشغف", desc: "نؤمن بأن التعليم رسالة قبل أن يكون مهنة فهدفنا إيصال المعرفة بشغف" },
  { icon: Users, title: "التمكين", desc: "نسعى لتمكين كل متدرب من تحقيق أهدافه المهنية والذاتية" },
  { icon: Globe, title: "الانفتاح", desc: "نواكب أحدث المنهجيات والتقنيات لتوفير تجربة تعليمية معاصرة" },
];

const achievements = [
  { value: "15+", label: "سنوات خبرة" },
  { value: "5000+", label: "متدرب فخور" },
  { value: "50+", label: "دورة احترافية" },
  { value: "100+", label: "شريك نجاح" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      
      {/* ═══════════════════════════════════════ HERO SECTION ═══════════════════════════════════════ */}
      <section className="relative pt-[calc(10vh+5rem)] pb-32 overflow-hidden bg-white">
        {/* Background Image & Texture */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden z-0">
          <img src="/bg.webp" alt="Background Texture" className="w-full h-full object-contain" />
        </div>
        
        {/* Particle Grid */}
        <div className="particles-grid opacity-50 absolute inset-0 z-0 pointer-events-none" />
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-[#173A7C]/[0.05] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#5CB07C]/[0.06] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-100 shadow-[0_4px_20px_rgba(23,58,124,0.05)] mb-8">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#173A7C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#173A7C]"></span>
              </span>
              <span className="text-sm font-bold text-slate-700 tracking-wide uppercase">من نحن</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-black text-slate-900 mb-6 leading-[1.2] tracking-tight">
              تعرّف على <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] via-[#2F66D6] to-[#5CB07C]">النبض المستدام</span>
            </h1>
            
            <div className="w-24 h-[3px] mx-auto bg-gradient-to-r from-[#173A7C] to-[#5CB07C] rounded-full mb-8 opacity-80" />
            
            <p className="text-slate-500 max-w-3xl mx-auto text-lg sm:text-2xl font-medium leading-relaxed">
              منصة تعليمية رائدة نشأت من رحم خبرة تزيد عن 15 عاماً في التدريب المهني والتقني. 
              نؤمن بأن كل فرد يستحق فرصة حقيقية لتطوير مهاراته والوصول إلى التميز في مسيرته.
            </p>
          </motion.div>
        </div>

        {/* Bottom Divider */}
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/50 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] md:w-[80%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/60 to-transparent blur-[1px]"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-200/50"></div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ OUR STORY (Floating Card) ═══════════════════════════════════════ */}
      <section className="relative z-30 -mt-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-2xl border border-white ring-1 ring-inset ring-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.15)] rounded-[2.5rem] p-10 sm:p-14 lg:p-16 relative overflow-hidden"
        >
          {/* Subtle decoration inside card */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#5CB07C]/5 rounded-full blur-[50px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-12 items-start">
            <div className="md:w-1/3 shrink-0">
              <h2 className="text-3xl lg:text-4xl font-black text-[#173A7C] mb-4">قصتنا</h2>
              <p className="text-slate-400 font-semibold text-sm">كيف بدأت رحلة الإلهام والتدريب</p>
            </div>
            
            <div className="md:w-2/3 space-y-6 text-slate-600 leading-relaxed text-lg sm:text-[19px] font-medium border-r-2 border-[#173A7C]/10 pr-6 sm:pr-10">
              <p>
                بدأت رحلتنا من إيمان عميق بأن التعليم هو المحرك الأساسي للتنمية المستدامة.
                أسسنا <span className="font-bold text-[#173A7C]">النبض المستدام</span> ليكون جسراً يربط بين الطموح والفرصة، بين المعرفة والتطبيق الفعلي في سوق العمل.
              </p>
              <p>
                على مدار السنين، قمنا بتدريب آلاف المتدربين في مختلف القطاعات من خلال أحدث المنهجيات التعليمية، محققين نسب رضا استثنائية. 
                واليوم، نفخر بأننا الخيار المفضل للمؤسسات والأفراد الباحثين عن التفوق.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════ MISSION & VISION ═══════════════════════════════════════ */}
      <section className="py-24 max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative bg-white border border-slate-100 shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(23,58,124,0.1)] rounded-[2.5rem] p-10 sm:p-12 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#173A7C]/5 rounded-bl-[100px] -z-0 transition-transform duration-500 group-hover:scale-110" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#173A7C] to-[#2F66D6] flex items-center justify-center mb-8 shadow-lg shadow-[#173A7C]/20 text-white transform group-hover:rotate-12 transition-transform duration-500">
                <Target className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-6 group-hover:text-[#173A7C] transition-colors">رسالتنا</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-lg">
                تقديم تجربة تعليمية متميزة تمكّن الأفراد والمؤسسات من اكتساب المهارات
                اللازمة للنجاح في سوق العمل المعاصر، استناداً إلى الجودة والابتكار 
                والتدريب الممنهج الفعّال.
              </p>
            </div>
          </motion.div>

          {/* Vision Card (MANDATORY TEXT) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative bg-white border border-slate-100 shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(92,176,124,0.15)] rounded-[2.5rem] p-10 sm:p-12 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#5CB07C]/5 rounded-br-[100px] -z-0 transition-transform duration-500 group-hover:scale-110" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#5CB07C] to-[#4EA06E] flex items-center justify-center mb-8 shadow-lg shadow-[#5CB07C]/20 text-white transform group-hover:-rotate-12 transition-transform duration-500">
                <Eye className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-6 group-hover:text-[#5CB07C] transition-colors">رؤيتنا</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-lg">
                أن نصبح احد افضل شركات التدريب بالمملكة بجودة ومصداقية حتى نصل إلى أعلى مستويات التدريب وفقاً لرؤية ٢٠٣٠ .
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ═══════════════════════════════════════ COMMERCIAL REGISTRATION ═══════════════════════════════════════ */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5CB07C]/10 to-[#173A7C]/10 text-[#5CB07C] mb-6 shadow-inner">
            <ShieldCheck className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">الاعتماد <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">والموثوقية</span></h2>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            نعمل وفق الإجراءات والتنظيمات الرسمية في المملكة العربية السعودية، وحاصلين على الرخص المعتمدة من الجهات المعنية لنقدم لكم خدمات تدريبية موثوقة وآمنة تتوافق مع أعلى المعايير.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          
          {/* Commercial Registration */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-white rounded-[2.5rem] p-8 sm:p-10 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.08)] hover:shadow-[0_30px_80px_-20px_rgba(23,58,124,0.15)] overflow-hidden transition-all duration-500 hover:-translate-y-1"
          >
            <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-[#173A7C]/[0.05] to-transparent rounded-br-full pointer-events-none transition-transform duration-500 group-hover:scale-110" />
            
            <div className="flex items-center gap-6 mb-8 relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#173A7C] to-[#2F66D6] text-white flex items-center justify-center shadow-lg shadow-[#173A7C]/20 shrink-0 transform group-hover:rotate-6 transition-transform duration-500">
                <FileCheck className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-[#173A7C] transition-colors mb-2">السجل التجاري</h3>
                <p className="text-slate-500 font-semibold text-sm sm:text-base">وزارة التجارة</p>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-[1.5rem] p-6 sm:p-8 border border-white shadow-inner space-y-5 relative z-10">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-5">
                <span className="text-sm font-bold text-slate-400">اسم الكيان</span>
                <span className="text-base sm:text-lg font-black text-slate-900 text-left">معهد النبض المستدام للتدريب</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/60 pb-5 gap-2 sm:gap-0">
                <span className="text-sm font-bold text-slate-400">الرقم الوطني الموحد</span>
                <span className="text-lg sm:text-xl font-black text-[#173A7C] tracking-widest">7051493539</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">حالة السجل</span>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5CB07C]/10 text-[#5CB07C] border border-[#5CB07C]/20">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5CB07C] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#5CB07C]"></span>
                  </span>
                  <span className="text-sm font-black">نشط</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Value Added Tax (VAT) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative bg-white rounded-[2.5rem] p-8 sm:p-10 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.08)] hover:shadow-[0_30px_80px_-20px_rgba(23,58,124,0.15)] overflow-hidden transition-all duration-500 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#0C8983]/[0.04] to-transparent rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110" />
            
            <div className="flex items-center gap-6 mb-8 relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0C8983] to-[#12A8A0] text-white flex items-center justify-center shadow-lg shadow-[#0C8983]/20 shrink-0 transform group-hover:-rotate-6 transition-transform duration-500">
                <BadgePercent className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-[#0C8983] transition-colors mb-2">القيمة المضافة</h3>
                <p className="text-slate-500 font-semibold text-sm sm:text-base">هيئة الزكاة والضريبة والجمارك</p>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-[1.5rem] p-6 sm:p-8 border border-white shadow-inner space-y-5 relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/60 pb-5 gap-2 sm:gap-0">
                <span className="text-sm font-bold text-slate-400">رقم التسجيل الضريبي</span>
                <span className="text-lg sm:text-xl font-black text-[#0C8983] tracking-widest">314195012200003</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-5">
                <span className="text-sm font-bold text-slate-400">تاريخ النفاذ</span>
                <span className="text-base sm:text-lg font-black text-slate-900">2026/03/01</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <span className="text-sm font-bold text-slate-400">الرقم الموحد المميز</span>
                <span className="text-base sm:text-lg font-black text-slate-600 tracking-wider">7051493539</span>
              </div>
            </div>
          </motion.div>

          {/* Balady License */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative bg-white rounded-[2.5rem] p-8 sm:p-10 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.08)] hover:shadow-[0_30px_80px_-20px_rgba(23,58,124,0.15)] overflow-hidden transition-all duration-500 hover:-translate-y-1"
          >
            <div className="absolute top-0 rtl:left-0 ltr:right-0 w-48 h-48 bg-gradient-to-br from-[#76B82A]/[0.05] to-transparent rtl:rounded-br-full ltr:rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110" />
            
            <div className="flex items-center gap-6 mb-8 relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#76B82A] to-[#88D331] text-white flex items-center justify-center shadow-lg shadow-[#76B82A]/20 shrink-0 transform group-hover:rotate-6 transition-transform duration-500">
                <Building className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-[#76B82A] transition-colors mb-2">رخصة بلدي</h3>
                <p className="text-slate-500 font-semibold text-sm sm:text-base">وزارة الشؤون البلدية والقروية</p>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-[1.5rem] p-6 sm:p-8 border border-white shadow-inner space-y-5 relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/60 pb-5 gap-2 sm:gap-0">
                <span className="text-sm font-bold text-slate-400">رقم الرخصة الموحد</span>
                <span className="text-lg sm:text-xl font-black text-[#76B82A] tracking-widest">470822783752</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-5">
                <span className="text-sm font-bold text-slate-400">النشاط التفصيلي</span>
                <span className="text-base sm:text-lg font-black text-slate-900">معهد التدريب</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">تاريخ الإنتهاء</span>
                <span className="text-base sm:text-lg font-black text-slate-600">1451/09/23 هـ</span>
              </div>
            </div>
          </motion.div>

          {/* Civil Defense License */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="group relative bg-white rounded-[2.5rem] p-8 sm:p-10 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.08)] hover:shadow-[0_30px_80px_-20px_rgba(23,58,124,0.15)] overflow-hidden transition-all duration-500 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#E3A832]/[0.05] to-transparent rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110" />
            
            <div className="flex items-center gap-6 mb-8 relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#E3A832] to-[#F5B83B] text-white flex items-center justify-center shadow-lg shadow-[#E3A832]/20 shrink-0 transform group-hover:-rotate-6 transition-transform duration-500">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-[#E3A832] transition-colors mb-2">ترخيص سلامة</h3>
                <p className="text-slate-500 font-semibold text-sm sm:text-base">المديرية العامة للدفاع المدني</p>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-[1.5rem] p-6 sm:p-8 border border-white shadow-inner space-y-5 relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/60 pb-5 gap-2 sm:gap-0">
                <span className="text-sm font-bold text-slate-400">رقم الترخيص</span>
                <span className="text-lg sm:text-xl font-black text-[#E3A832] tracking-widest">47-06312100-1</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-5">
                <span className="text-sm font-bold text-slate-400">تاريخ الإصدار</span>
                <span className="text-base sm:text-lg font-black text-slate-900">1447/09/23 هـ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">تاريخ الإنتهاء</span>
                <span className="text-base sm:text-lg font-black text-slate-600">1451/09/23 هـ</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ═══════════════════════════════════════ CORE VALUES ═══════════════════════════════════════ */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">مبادئنا <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">الأساسية</span></h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
              الأسس والقيم التي نبني عليها كل برامجنا وتوجهاتنا، لضمان أعلى درجات الثقة والمصداقية لعملائنا.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group relative bg-[#f8fafc] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-[2rem] p-8 sm:p-10 text-center hover:bg-white hover:shadow-[0_30px_60px_-15px_rgba(23,58,124,0.12)] hover:-translate-y-3 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-[#173A7C]/0 via-transparent to-[#173A7C]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-6 bg-white shadow-md shadow-slate-200/50 border border-slate-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Icon className="w-9 h-9 text-[#173A7C] group-hover:text-[#5CB07C] transition-colors duration-500" />
                    </div>
                    <h3 className="font-black text-xl text-slate-900 mb-4 group-hover:text-[#173A7C] transition-colors">{v.title}</h3>
                    <p className="text-sm font-semibold text-slate-500 leading-relaxed">{v.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ CALL TO ACTION ═══════════════════════════════════════ */}
      <section className="pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6">هل أنت مستعد لتطوير قدراتك؟</h2>
            <p className="text-slate-500 text-lg sm:text-xl font-medium mb-12 max-w-2xl mx-auto">
              انضم إلينا اليوم واكتشف باقة متميزة من البرامج التدريبية التي صُممت لمواكبة تطلعاتك.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/courses" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#173A7C] to-[#2F66D6] text-white text-[15px] font-black hover:opacity-90 shadow-lg shadow-[#173A7C]/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                تصفح دوراتنا
                <BookOpen className="w-5 h-5 rtl:mr-2" />
              </Link>
              
              <Link 
                href="/contact" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white border-2 border-slate-200 text-slate-700 text-[15px] font-black hover:border-[#173A7C] hover:text-[#173A7C] hover:bg-slate-50 hover:-translate-y-1 transition-all duration-300"
              >
                تواصل معنا
                <PhoneCall className="w-5 h-5 rtl:mr-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ ACHIEVEMENTS BANNER ═══════════════════════════════════════ */}
      <section className="py-8 pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white border border-slate-100 rounded-[3rem] p-12 sm:p-20 shadow-[0_30px_60px_-15px_rgba(23,58,124,0.06)] relative overflow-hidden"
          >
            {/* Elegant Background pattern */}
            <div className="absolute inset-0 bg-[url('/bg.webp')] opacity-[0.02] object-cover mix-blend-multiply" />
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#173A7C]/[0.04] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#5CB07C]/[0.06] rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center">
              {achievements.map((a, i) => (
                <div key={i} className="bg-[#f8fafc]/80 backdrop-blur-md rounded-[2rem] p-8 border border-slate-100/60 shadow-sm hover:shadow-md hover:bg-white hover:-translate-y-2 transition-all duration-500">
                  <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#2F66D6] mb-3 tracking-tight">{a.value}</div>
                  <div className="text-sm sm:text-base font-bold text-slate-500">{a.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
