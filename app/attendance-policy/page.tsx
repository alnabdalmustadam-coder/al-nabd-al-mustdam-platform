"use client";

import { motion } from "framer-motion";
import { CalendarCheck, Clock, AlertTriangle, ShieldCheck, CheckCircle2, ShieldHalf, Asterisk, UserCheck, XCircle, FileWarning } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const sections = [
  {
    id: "overview",
    icon: CalendarCheck,
    color: "from-blue-500 to-indigo-600",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    title: "نظرة عامة على سياسة الحضور",
    content: "تلتزم إدارة معهد النبض المستدام للتدريب بتطبيق سياسة حضور صارمة وشفافة تهدف إلى ضمان تحقيق أعلى معايير الجودة في العملية التدريبية. تُعد سياسة الحضور جزءاً لا يتجزأ من الإطار التنظيمي المعتمد، وتسري على جميع البرامج التدريبية (الحضورية والافتراضية) المقدمة عبر المعهد.",
    list: [
      "تسري هذه السياسة على كافة المتدربين المسجلين في البرامج التدريبية المعتمدة.",
      "يتم احتساب الحضور بشكل آلي ودقيق عبر نظام المنصة الإلكتروني المتكامل.",
      "يلتزم المتدرب بالاطلاع على هذه السياسة والموافقة عليها ضمنياً عند التسجيل في أي برنامج تدريبي."
    ]
  },
  {
    id: "requirements",
    icon: UserCheck,
    color: "from-emerald-400 to-teal-500",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
    title: "متطلبات ونسب الحضور المعتمدة",
    content: "حددت إدارة المعهد نسب الحضور الإلزامية بما يتوافق مع اشتراطات المؤسسة العامة للتدريب التقني والمهني والمركز الوطني للتعليم الإلكتروني، وذلك على النحو التالي:",
    list: [
      "نسبة الحضور الإلزامية: يجب على المتدرب تحقيق نسبة حضور لا تقل عن 75% من إجمالي ساعات البرنامج التدريبي.",
      "الدورات الحضورية: يتم تسجيل الحضور عبر البصمة الإلكترونية أو التوقيع اليدوي المعتمد في بداية ونهاية كل جلسة.",
      "الدورات الافتراضية (أونلاين): يتم رصد الحضور تلقائياً عبر منصة التعليم الإلكتروني من لحظة الدخول وحتى الخروج من الجلسة.",
      "يُحتسب التأخر لأكثر من 15 دقيقة عن موعد بدء الجلسة كغياب كامل عن تلك الجلسة."
    ]
  },
  {
    id: "absence",
    icon: XCircle,
    color: "from-red-400 to-rose-500",
    iconColor: "text-red-500",
    bgColor: "bg-red-50",
    title: "أنواع الغياب والأعذار المقبولة",
    content: "يميز نظام المعهد بين نوعين أساسيين من الغياب لضمان العدالة والمرونة في التعامل مع ظروف المتدربين:",
    list: [
      "الغياب بعذر مقبول: يشمل الحالات الصحية المثبتة بتقرير طبي معتمد، والظروف الطارئة القاهرة (وفاة قريب من الدرجة الأولى، حوادث). يجب تقديم العذر خلال 3 أيام عمل من تاريخ الغياب.",
      "الغياب بدون عذر: أي غياب لا يُقدم فيه المتدرب مبرراً رسمياً مقبولاً خلال المدة المحددة. يُحتسب كاملاً ضمن نسبة الغياب المؤثرة على الاجتياز.",
      "ملاحظة: في جميع الحالات، لا يُعفى المتدرب من إكمال المتطلبات التدريبية (التكاليف والاختبارات) المرتبطة بالجلسات التي تغيب عنها."
    ]
  },
  {
    id: "consequences",
    icon: AlertTriangle,
    color: "from-orange-400 to-amber-500",
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
    title: "الإجراءات المترتبة على تجاوز الغياب",
    content: "في حال تجاوز المتدرب نسبة الغياب المسموح بها (25%)، يتم اتخاذ الإجراءات التنظيمية التالية بشكل تصاعدي:",
    list: [
      "تنبيه أولي: عند بلوغ نسبة الغياب 15%، يتم إرسال إشعار تحذيري آلي للمتدرب عبر البريد الإلكتروني ورسائل SMS.",
      "إنذار رسمي: عند بلوغ نسبة الغياب 20%، يتم إصدار إنذار رسمي مكتوب مع إبلاغ الجهة الموفدة (إن وجدت).",
      "الحرمان من الاختبار: عند تجاوز نسبة الغياب 25%، يُحرم المتدرب من دخول الاختبار النهائي ويُعتبر راسباً في البرنامج.",
      "عدم إصدار الشهادة: لا تُصدر شهادة الاجتياز أو الحضور للمتدرب الذي لم يستوفِ نسبة الحضور المطلوبة (75%)."
    ]
  },
  {
    id: "early-departure",
    icon: Clock,
    color: "from-purple-500 to-pink-500",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
    title: "سياسة الانصراف المبكر والتأخر",
    content: "يحرص المعهد على الالتزام بالمواعيد الرسمية للجلسات التدريبية لضمان تحقيق الاستفادة القصوى لجميع المتدربين:",
    list: [
      "الانصراف المبكر (قبل انتهاء الجلسة بأكثر من 15 دقيقة) يُسجّل كنصف غياب.",
      "التأخر المتكرر: في حال تكرار التأخر عن الحضور لأكثر من 3 مرات خلال البرنامج الواحد، يُنبه المتدرب رسمياً ويُحتسب التأخر الرابع كغياب كامل.",
      "يمكن للمتدرب تقديم طلب استئذان مسبق للانصراف المبكر في الحالات المبررة عبر النظام الإلكتروني قبل الجلسة بـ 24 ساعة على الأقل."
    ]
  },
  {
    id: "exceptions",
    icon: ShieldCheck,
    color: "from-teal-500 to-cyan-500",
    iconColor: "text-teal-600",
    bgColor: "bg-teal-50",
    title: "الاستثناءات والحالات الخاصة",
    content: "تراعي إدارة المعهد الحالات الإنسانية والاستثنائية مع الحفاظ على نزاهة وجودة المخرجات التدريبية:",
    list: [
      "يحق لمدير المعهد منح استثناءات في نسبة الحضور للحالات الإنسانية القاهرة بعد دراسة كل حالة بشكل مستقل.",
      "في حال الإيقاف الجماعي (كوارث، أوبئة، أعطال تقنية شاملة)، تُعاد جدولة الجلسات المتأثرة دون احتسابها ضمن نسب الغياب.",
      "يمكن للمتدرب تقديم تظلم رسمي خلال 5 أيام عمل من تاريخ الإجراء المتخذ بحقه، ويتم الرد عليه خلال 7 أيام عمل كحد أقصى."
    ]
  }
];

export default function AttendancePolicyPage() {
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
            <CalendarCheck className="w-4 h-4 text-[#173A7C]" />
            <span className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">الانضباط أساس النجاح</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 mb-6 leading-[1.35] tracking-tight">
            سياسة <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C] inline-block mt-3">الحضور والغياب والانصراف</span>
          </h1>
          
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-[1.8] max-w-3xl mx-auto mb-10">
            نؤمن في معهد النبض المستدام بأن الالتزام والانضباط ركيزتان أساسيتان لاكتساب المعرفة وتحقيق الأهداف التدريبية. لذا وضعنا هذه السياسة الشاملة لتنظيم حضور المتدربين وضمان بيئة تعليمية فعالة ومثمرة للجميع.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> حد أدنى 75% حضور</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> رصد آلي ودقيق</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> إجراءات شفافة</span>
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
                <ShieldHalf className="w-5 h-5 text-[#173A7C]" />
                أقسام سياسة الحضور
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
                      {p.title.split(' ').slice(0, 3).join(' ') + (p.title.split(' ').length > 3 ? "..." : "")}
                    </span>
                    {activeSection === p.id && (
                      <motion.div layoutId="activeIndicator" className="w-1.5 h-1.5 rounded-full bg-[#173A7C]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Summary Widget */}
            <div className="mt-6 bg-gradient-to-br from-[#173A7C] to-[#2F66D6] rounded-3xl p-8 text-white text-center shadow-lg shadow-[#173A7C]/20">
              <FileWarning className="w-12 h-12 text-white/80 mx-auto mb-4" />
              <h4 className="font-black text-lg mb-2">ملخص نسب الحضور</h4>
              <div className="space-y-3 mt-6 text-right">
                <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                  <span className="text-sm font-bold text-blue-100">الحد الأدنى المطلوب</span>
                  <span className="text-lg font-black text-white" dir="ltr">75%</span>
                </div>
                <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                  <span className="text-sm font-bold text-blue-100">تنبيه أولي عند</span>
                  <span className="text-lg font-black text-amber-300" dir="ltr">15%</span>
                </div>
                <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                  <span className="text-sm font-bold text-blue-100">إنذار رسمي عند</span>
                  <span className="text-lg font-black text-orange-300" dir="ltr">20%</span>
                </div>
                <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                  <span className="text-sm font-bold text-blue-100">حرمان نهائي عند</span>
                  <span className="text-lg font-black text-red-300" dir="ltr">25%+</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Chapters List */}
          <div className="w-full lg:w-2/3 space-y-6 lg:space-y-8 order-1 lg:order-2">
            {sections.map((sec, index) => {
              const Icon = sec.icon;
              return (
                <motion.div
                  id={sec.id}
                  key={sec.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  onViewportEnter={() => setActiveSection(sec.id)}
                  className={`relative bg-white rounded-[2.5rem] p-8 sm:p-12 border transition-all duration-500 overflow-hidden group ${
                    activeSection === sec.id ? "border-[#173A7C]/20 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.12)] ring-1 ring-[#173A7C]/5" : "border-slate-100 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${sec.color} opacity-[0.03] rounded-bl-full pointer-events-none transition-transform duration-700 group-hover:scale-150`} />
                  
                  <div className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
                    <div className={`w-16 h-16 shrink-0 rounded-2xl ${sec.bgColor} flex items-center justify-center border border-white shadow-inner group-hover:-translate-y-1 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${sec.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-4">{sec.title}</h2>
                      <p className="text-slate-500 text-[15.5px] leading-[2] font-medium mb-4">
                        {sec.content}
                      </p>
                      
                      {sec.list && (
                        <ul className="space-y-3 mt-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100/60">
                          {sec.list.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-4">
                              <Asterisk className={`w-4 h-4 mt-1.5 shrink-0 ${sec.iconColor} opacity-70`} />
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
