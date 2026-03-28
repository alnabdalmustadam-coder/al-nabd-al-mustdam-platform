"use client";

import { motion } from "framer-motion";
import { ShieldCheck, BookOpen, Download, FileText, UserCheck, GraduationCap, CheckCircle2, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const manuals = [
  {
    id: "trainer-manual",
    icon: UserCheck,
    color: "from-blue-500 to-indigo-600",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    title: "الدليل الإرشادي والدعم للمدرب",
    subtitle: "(طريقة دخول المدرب وإدارة المحاضرات)",
    description: "دليل موجه لأعضاء هيئة التدريب، يشرح بالتفصيل الممل كيفية الوصول للمنصة بكفاءة، آليات تقديم المحتوى التفاعلي، وإدارة غرف التدريب الافتراضية سواءً كانت متزامنة أو غير متزامنة.",
    downloadText: "تحميل الدليل الإرشادي للمدرب",
    fileSize: "PDF • 2.4 MB",
    disabled: false, // For now it's just a placeholder link
    link: "#" 
  },
  {
    id: "trainee-manual",
    icon: GraduationCap,
    color: "from-emerald-400 to-teal-500",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
    title: "الأدلة الإلكترونية للمتدرب",
    subtitle: "(طريقة الاستفادة وحضور الدورات)",
    description: "مرجع إلكتروني متكامل يوضح للمتدرب بخطوات منهجية مبسطة كيفية التسجيل، الاستفادة القصوى من المحتوى العلمي، وطرق اجتياز الدورات بكل كفاءة وسهولة.",
    downloadText: "تحميل الدليل الإرشادي للمتدرب",
    fileSize: "PDF • 1.8 MB",
    disabled: false,
    link: "#"
  }
];

export default function GuidanceManualsPage() {
  const [activeSection, setActiveSection] = useState<string>(manuals[0].id);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-[calc(10vh+5rem)] font-sans" dir="rtl">
      
      {/* ═══════════════════════════════════════ HEADER ═══════════════════════════════════════ */}
      <section className="relative px-4 sm:px-6 mb-16 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
            <BookOpen className="w-4 h-4 text-[#173A7C]" />
            <span className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">مرجعك التدريبي الموثوق</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 mb-6 leading-[1.35] tracking-tight">
            الأدلة الإرشادية والدعم <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C] inline-block mt-3">لتدريب إلكتروني متكامل</span>
          </h1>
          
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-[1.8] max-w-3xl mx-auto mb-10">
            يقدم <span className="font-bold text-slate-700">معهد النبض المستدام للتدريب</span> دليلاً رقمياً شاملاً لتحقيق أفضل استفادة وتجربة تعليمية معنا، يغطي الدعم والتدريب لكلا النمطين التزامني وغير التزامني لضمان مسيرة مهنية خالية من العوائق.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> ملفات PDF</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> خطوات مدعومة بالصور</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> دعم لجميع المتدربين والمدربين</span>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════ CONTENT ═══════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative">
          
          {/* Index Sidebar (Sticky) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-full lg:w-1/3 lg:sticky lg:top-32 order-2 lg:order-1"
          >
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-[0_15px_40px_-15px_rgba(23,58,124,0.08)]">
              {/* Logo Area */}
              <div className="flex justify-center mb-8 pb-6 border-b border-slate-100/80">
                <img src="/logo.svg" alt="Sustain Pulse Logo" className="h-[4.5rem] w-auto object-contain hover:scale-105 transition-transform duration-300" />
              </div>

              <h3 className="font-extrabold text-lg text-slate-800 mb-6 flex items-center gap-3">
                <LayoutTemplate className="w-5 h-5 text-[#173A7C]" />
                محتويات الدليل
              </h3>
              <div className="space-y-2">
                {manuals.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveSection(p.id);
                      document.getElementById(p.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`w-full text-right px-4 lg:px-5 py-3.5 lg:py-4 rounded-2xl transition-all duration-300 font-bold text-sm flex items-center justify-between group ${
                      activeSection === p.id 
                        ? "bg-slate-50 text-[#173A7C] border border-slate-200 shadow-sm" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <p.icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${activeSection === p.id ? "text-[#173A7C]" : "text-slate-400 group-hover:text-slate-600"}`} />
                      {p.title.replace('الدليل الإرشادي و', '').replace('الإلكترونية', '')}
                    </span>
                    {activeSection === p.id && (
                      <motion.div layoutId="activeIndicator" className="w-1.5 h-1.5 rounded-full bg-[#173A7C]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-6 bg-gradient-to-br from-[#173A7C] to-[#2F66D6] rounded-3xl p-8 text-white text-center shadow-lg shadow-[#173A7C]/20">
              <ShieldCheck className="w-12 h-12 text-white/80 mx-auto mb-4" />
              <h4 className="font-black text-lg mb-2">الدعم والمساندة</h4>
              <p className="text-sm text-blue-100 font-medium opacity-90 leading-relaxed mb-6">
                إذا واجهتك أي صعوبة في قراءة الأدلة أو تطبيقها، لا تتردد بالتواصل مع فريق الدعم الفني والإداري.
              </p>
              <Link 
                href="/contact"
                className="inline-block px-6 py-3 bg-white text-[#173A7C] font-bold text-sm rounded-xl hover:bg-slate-50 hover:-translate-y-1 transition-all shadow-sm"
              >
                تواصل مع الدعم الفني
              </Link>
            </div>
          </motion.div>

          {/* Cards Area */}
          <div className="w-full lg:w-2/3 space-y-6 lg:space-y-8 order-1 lg:order-2">
            {manuals.map((manual, index) => {
              const Icon = manual.icon;
              return (
                <motion.div
                  id={manual.id}
                  key={manual.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  onViewportEnter={() => setActiveSection(manual.id)}
                  className={`relative bg-white rounded-[2.5rem] p-8 sm:p-12 border transition-all duration-500 overflow-hidden group ${
                    activeSection === manual.id ? "border-[#173A7C]/20 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.12)] ring-1 ring-[#173A7C]/5" : "border-slate-100 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${manual.color} opacity-[0.03] rounded-bl-full pointer-events-none transition-transform duration-700 group-hover:scale-150`} />
                  
                  <div className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
                    <div className={`w-16 h-16 shrink-0 rounded-2xl ${manual.bgColor} flex items-center justify-center border border-white shadow-inner group-hover:-translate-y-1 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${manual.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-1">{manual.title}</h2>
                      <h3 className="text-sm font-bold text-[#173A7C] mb-4">{manual.subtitle}</h3>
                      <p className="text-slate-500 text-[15.5px] leading-[2] font-medium mb-8">
                        {manual.description}
                      </p>
                      
                      <a 
                        href={manual.link}
                        onClick={(e) => {
                          if (manual.link === "#") e.preventDefault();
                        }}
                        className={`inline-flex items-center gap-3 px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                          manual.link === "#" 
                            ? "bg-[#173A7C] text-white hover:bg-[#122b5e] shadow-md shadow-[#173A7C]/20 hover:-translate-y-0.5"
                            : "bg-[#173A7C] text-white hover:bg-[#122b5e] shadow-md shadow-[#173A7C]/20 hover:-translate-y-0.5"
                        }`}
                      >
                        <Download className="w-5 h-5" />
                        {manual.downloadText}
                        <span className="hidden sm:inline-block border-r border-white/20 h-4 mx-2"></span>
                        <span className="hidden sm:inline-block text-xs font-medium opacity-80" dir="ltr">{manual.fileSize}</span>
                      </a>
                      
                      {manual.link === "#" && (
                         <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 inline-flex">
                           <FileText className="w-3.5 h-3.5" />
                           سيتم إرفاق الملف بصيغة PDF قريباً
                         </div>
                      )}

                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>
      
    </div>
  );
}
