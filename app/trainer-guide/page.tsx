"use client";

import { motion } from "framer-motion";
import { LogIn, BookOpenCheck, ListChecks, Users, CheckCircle2, FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const sections = [
  {
    id: "login",
    icon: LogIn,
    color: "from-blue-500 to-indigo-600",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    title: "1. تسجيل الدخول السريع",
    content: "خطوات بسيطة تضمن وصولاً آمناً ومباشراً للوحة التحكم الخاصة بالمدرب:",
    list: [
      "الدخول على الرابط الرسمي لمنصة معهد النبض المستدام للتدريب.",
      "إدخال بيانات المستخدم (User Name) وكلمة المرور (Password) الخاصة بك.",
      "النقر على زر (موافق) لتسجيل الدخول بأمان.",
      "الانتقال إلى قائمة نظام التعلم الخاصة بالمعهد لاستعراض جميع المقررات والدورات التأهيلية المسندة إليك."
    ]
  },
  {
    id: "course-management",
    icon: BookOpenCheck,
    color: "from-emerald-400 to-teal-500",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
    title: "2. إدارة محاور ومحتوى الدورة",
    content: "يمكن للمدرب بناء المادة التعليمية بشكل متكامل وإثرائها بالوسائط عبر الخطوات التالية:",
    list: [
      "الدخول على النظام وتسجيل الدخول كمدرّب.",
      "إضافة الدروس كمحاور أساسية (Modules) للدورة.",
      "إضافة وتجزئة المواضيع كـ جلسات (Sessions) داخل كل محور.",
      "إمكانية إضافة مهام (Assignments) وأسئلة تقييم بتخصيص اختبار جديد.",
      "تعيين وإضافة صورة بارزة خاصة بالبرنامج التدريبي.",
      "لرفع الملفات: التوجه إلى نظام التعلم، فتح (الملفات)، ثم اختيار الملف المراد تحريره.",
      "إضافة وسائط متنوعة للموضوع من خلال زر (أضف ملفات وسائط) مثل: مقاطع فيديو، مستندات PDF، صور، أو ملفات صوتية.",
      "الضغط على زر (تحديث) لحفظ ونشر الإضافات."
    ]
  },
  {
    id: "exams",
    icon: ListChecks,
    color: "from-orange-400 to-rose-500",
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
    title: "3. إعداد الاختبارات والتقييمات",
    content: "لإضافة اختبار معياري لقياس أداء المتدربين، تُتّبع الإجراءات التقنية الآتية:",
    list: [
      "الدخول على نظام التعلم، الانتقال إلى (الاختبارات)، ثم النقر على (إضافة جديد).",
      "من تبويب صفحة الاختبار، كِتابة (عنوان الاختبار) وإضافة (نص تعريفي) يوضح تعليماته.",
      "إمكانية اختيار (صورة بارزة) خاصة بواجهة الاختبار.",
      "الدخول لتبويب (المصمم)، ثم الضغط على علامة (+) لإضافة سؤال جديد.",
      "كتابة نص وعنوان السؤال ثم إضافته، وتحديد (الدرجة المقررة للسؤال) بالنقاط.",
      "إدخال نصوص الإجابات (الخيارات) وتحديد علامة الإجابة الصحيحة.",
      "من قسم (إعداد السؤال)، تعيين الرسائل الآلية المُراد إظهارها في حالات: الإجابة الصحيحة، الإجابة الخاطئة، أو التلميحات.",
      "الضغط على (تحديث ونشر) لاعتماد الاختبار.",
      "قبل بدء موعد الاختبار، يتم إرسال إشعار آلي للمتدربين المشتركين ليتمكنوا من الدخول جميعاً.",
      "بعد الانتهاء، يمكن استعراض التقارير الدقيقة عبر تبويب (نتائج الاختبار) ثم (التقرير)."
    ]
  },
  {
    id: "enrollees",
    icon: Users,
    color: "from-purple-500 to-pink-500",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
    title: "4. إدارة المسجلين والجلسات المباشرة",
    content: "آلية سهلة للتحكم في الحضور وبدء الفصول الافتراضية:",
    list: [
      "الانتقال إلى (جلسة جديدة) من خلال بند الجلسات في الصفحة الرئيسية.",
      "القيام بـ (جدولة الجلسة) وتحديد موعد وتوقيت انطلاقها.",
      "عند حان الموعد، الضغط على (بدء الجلسة)، ليظهر للمدرب كافة التفاصيل والأساليب الخاصة بالتحكم في إدارة الغرفة الافتراضية والمتدربين."
    ]
  }
];

export default function TrainerGuidePage() {
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
            <span className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">مرجع شامل للمدربين</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 mb-6 leading-[1.35] tracking-tight">
            الدليل الإرشادي والدعم <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C] inline-block mt-3">الرقمي للمدرب</span>
          </h1>
          
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-[1.8] max-w-3xl mx-auto mb-10">
            يوفر <span className="font-bold text-slate-700">معهد النبض المستدام للتدريب</span> دليلاً مرجعياً يدوياً ومنشوراً يتضمن شرحاً مفصلاً للمدرب عن كيفية الدخول للمنصة والتعامل الأمثل مع مكوناتها، من إضافة المواد التعليمية، مروراً لإنشاء التكاليف والاختبارات، وحتى إدارة الفصول الافتراضية.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> إضافة المواد تفاعلياً</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> إدارة آمنة للاختبارات</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> دعم فني مباشر للمدرب</span>
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
                <BookOpenCheck className="w-5 h-5 text-[#173A7C]" />
                مراحل الدليل
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
              <h4 className="font-black text-lg mb-2">الدليل الشامل PDF</h4>
              <p className="text-sm text-blue-100 font-medium opacity-90 leading-relaxed mb-6">
                قريباً سيُتاح الدليل بكامل الصور التوضيحية بصيغة کتاب إلكتروني PDF لسهولة التحميل والطباعة.
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
