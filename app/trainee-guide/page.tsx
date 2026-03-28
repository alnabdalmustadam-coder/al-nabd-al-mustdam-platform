"use client";

import { motion } from "framer-motion";
import { LogIn, BookOpen, Video, GraduationCap, Headphones, CheckCircle2, FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const sections = [
  {
    id: "login",
    icon: LogIn,
    color: "from-blue-500 to-indigo-600",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    title: "1. تسجيل الدخول والبدء",
    content: "يمكنك البدء في رحلتك التعليمية بسهولة من خلال تفعيل حسابك كمتدرب:",
    list: [
      "قم بزيارة الصفحة الرئيسية لمنصة (معهد النبض المستدام للتدريب).",
      "اضغط على زر (تسجيل الدخول الدخول) الموجود أعلى الصفحة.",
      "أدخل رقم الهوية أو البريد الإلكتروني وكلمة المرور الخاصة بك.",
      "عند الدخول لأول مرة، قد يُطلب منك تحديث كلمة المرور لضمان أمان حسابك الشخصي.",
      "في حال نسيان كلمة المرور، يمكنك استعادتها فوراً عبر رقم الجوال المسجل أو الإيميل."
    ]
  },
  {
    id: "dashboard",
    icon: BookOpen,
    color: "from-emerald-400 to-teal-500",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
    title: "2. استعراض الدورات والمقررات",
    content: "توفر لك لوحة التحكم (الرئيسية) نظرة متكاملة على برامجك التدريبية:",
    list: [
      "بعد تسجيل الدخول بنجاح، ستُنقل مباشرة لصفحة (مقرراتي).",
      "ستظهر لك جميع البرامج التدريبية أو الدبلومات المُسجل بها على شكل بطاقات واضحة تفصيلية.",
      "اضغط على الدورة المطلوبة لاستعراض (محاور الدورة، الجلسات، التكاليف، والمنتدى النقاشي).",
      "يمكنك تنزيل وتحميل الملفات المرفقة (عروض تقديمية، ملفات PDF، مقاطع صوتية) من خلال تبويب (المحتوى التعليمي)."
    ]
  },
  {
    id: "sessions",
    icon: Video,
    color: "from-orange-400 to-rose-500",
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
    title: "3. الحضور والمحاضرات الافتراضية",
    content: "لحضور المحاضرات المباشرة (التدريب المتزامن) والتفاعل مع المدربين:",
    list: [
      "من صفحة دورتك التدريبية، توجه إلى قسم (الجلسات المباشرة).",
      "سيظهر لك جدول وموعد انطلاق المحاضرة. عند حان الوقت سيُفعل زر (الانضمام للجلسة).",
      "اضغط عليه لتنتقل للقاعة الافتراضية، و تأكد من السماح للمتصفح باستخدام (الميكروفون والكاميرا) إذا طُلب ذلك.",
      "في حال التدريب غير المتزامن (الدورات المسجلة)، ستجد فيديوهات الدروس متاحة للمشاهدة في أي وقت 24/7."
    ]
  },
  {
    id: "tasks-exams",
    icon: GraduationCap,
    color: "from-purple-500 to-pink-500",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
    title: "4. أداء المهام والاختبارات",
    content: "يتم تقييمك واستخراج الدرجات عبر آليات مُبسّطة من داخل النظام:",
    list: [
      "تُرسل التكاليف المطلوبة عبر تبويب (المهام)، ويمكنك رفع إجاباتك كملف أو نص مباشر داخل المنصة.",
      "عند تحديد موعد اختبار مبدئي أو نهائي، اضغط على تبويب (الاختبارات) لبدء التقييم.",
      "التزم بالوقت المحدد الموضح في عدّاد الوقت أعلى شاشة الاختبار.",
      "بعد الإجابة على جميع الأسئلة، اضغط بالتأكيد على زر (تسليم الإجابات) لترسل نتيجتك وحفظها آلياً."
    ]
  },
  {
    id: "support",
    icon: Headphones,
    color: "from-cyan-500 to-sky-600",
    iconColor: "text-cyan-600",
    bgColor: "bg-cyan-50",
    title: "5. إصدار الشهادات والدعم الفني",
    content: "خطواتك الأخيرة لتوثيق إنجازك والتغلب على التحديات التقنية:",
    list: [
      "بمجرد الانتهاء من متطلبات الدورة (حضور، مهام، تقييم)، يتم إصدار (الشهادة الإلكترونية المعتمدة) تلقائياً.",
      "يمكنك تحميل الشهادة أو طباعتها من تبويب (شهاداتي وإنجازاتي).",
      "في حال واجهتك أي إشكالية، يتواجد فريق الدعم التقني لمساعدتك عن طريق نموذج (اتصل بنا) أو عبر أرقام التحويلات الموضحة في المنصة."
    ]
  }
];

export default function TraineeGuidePage() {
  const [activeSection, setActiveSection] = useState<string>(sections[0].id);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-[calc(10vh+5rem)] font-sans" dir="rtl">
      
      {/* ═══════════════════════════════════════ HEADER ═══════════════════════════════════════ */}
      <section className="relative px-4 sm:px-6 mb-16 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8 hover:shadow-md transition-shadow">
            <FileText className="w-4 h-4 text-[#173A7C]" />
            <span className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">رحلة تدريب سلسة ومبسطة</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 mb-6 leading-[1.35] tracking-tight">
            الدليل الإرشادي والدعم <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C] inline-block mt-3">الرقمي للمتدربين</span>
          </h1>
          
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-[1.8] max-w-3xl mx-auto mb-10">
            لضمان أفضل استفادة وأداء تدريبي متميز، قمنا بإعداد دليل مرجعي لك عزيزي المتدرب نلخص فيه أهم الخطوات الأساسية بدءاً من الدخول للمنصة وحضور المحاضرات، وحتى استصدار شهادتك بنجاح وكفاءة.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> واجهة مستخدم مبسطة</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> فصول افتراضية مدمجة</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> دعم فني ومتابعة</span>
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
                <GraduationCap className="w-5 h-5 text-[#173A7C]" />
                مراحل استخدام المنصة
              </h3>
              <div className="space-y-2">
                {sections.map((p) => (
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
                      {p.title.split('. ')[1]}
                    </span>
                    {activeSection === p.id && (
                      <motion.div layoutId="activeIndicator" className="w-1.5 h-1.5 rounded-full bg-[#173A7C]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-6 bg-gradient-to-br from-[#173A7C] to-[#2F66D6] rounded-3xl p-8 text-white text-center shadow-lg shadow-[#173A7C]/20">
              <FileText className="w-12 h-12 text-white/80 mx-auto mb-4" />
              <h4 className="font-black text-lg mb-2">حمل نسخة الـ PDF</h4>
              <p className="text-sm text-blue-100 font-medium opacity-90 leading-relaxed mb-6">
                قريباً سيُتاح الدليل الشامل مصوراً بصيغة PDF لسهولة المراجعة في أي وقت ومن أي جهاز.
              </p>
              <Link 
                href="/guidance-manuals"
                className="inline-block px-6 py-3 bg-white text-[#173A7C] font-bold text-sm rounded-xl hover:bg-slate-50 hover:-translate-y-1 transition-all shadow-sm"
              >
                صفحة الأدلة والتحميل
              </Link>
            </div>
          </motion.div>

          {/* Clauses List */}
          <div className="w-full lg:w-2/3 space-y-6 lg:space-y-8 order-1 lg:order-2">
            {sections.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  id={step.id}
                  key={step.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  onViewportEnter={() => setActiveSection(step.id)}
                  className={`relative bg-white rounded-[2.5rem] p-8 sm:p-12 border transition-all duration-500 overflow-hidden group ${
                    activeSection === step.id ? "border-[#173A7C]/20 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.12)] ring-1 ring-[#173A7C]/5" : "border-slate-100 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${step.color} opacity-[0.03] rounded-bl-full pointer-events-none transition-transform duration-700 group-hover:scale-150`} />
                  
                  <div className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
                    <div className={`w-16 h-16 shrink-0 rounded-2xl ${step.bgColor} flex items-center justify-center border border-white shadow-inner group-hover:-translate-y-1 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${step.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-4">{step.title}</h2>
                      <p className="text-slate-500 text-[15.5px] leading-[2] font-medium mb-4">
                        {step.content}
                      </p>
                      
                      {step.list && (
                        <ul className="space-y-3 mt-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100/60 counter-reset-list">
                          {step.list.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-4">
                              <span className={`flex items-center justify-center shrink-0 w-6 h-6 rounded-full text-xs font-bold bg-white border shadow-sm ${step.iconColor}`} dir="ltr">
                                {idx + 1}
                              </span>
                              <span className="text-slate-600 text-[15px] font-medium leading-[1.8] mt-0.5">{item}</span>
                            </li>
                          ))}
                        </ul>
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
