"use client";

import { motion } from "framer-motion";
import { BellRing, BellDot, Settings2, Share2, Smartphone, Mail, AlertCircle, CheckCircle2, ShieldHalf, Asterisk } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const sections = [
  {
    id: "objective",
    icon: BellDot,
    color: "from-blue-500 to-indigo-600",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    title: "الهدف من نظام التنبيهات الذكي",
    content: "يُعد (نظام التنبيهات المركزية) في معهد النبض المستدام أداة إدارية وتنظيمية بالغة الأهمية. يهدف النظام إلى إبقاء المستفيد (المتدرب والمدرب) على اطلاع دائم ومباشر بمساره التدريبي، وتذكيره بالمواعيد النهائية لضمان عدم تفويت أي جلسة افتراضية أو تكليف، مما ينعكس بشكل حاسم وإيجابي على تقدمه العلمي واجتيازه الناجح للدورات والبرامج التأهيلية."
  },
  {
    id: "types",
    icon: Share2,
    color: "from-emerald-400 to-teal-500",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
    title: "بنية وتصنيفات التنبيهات والإشعارات",
    content: "صُممت إشعاراتنا لتكون موجّهة وموزعة بشكل هادف ومنظم بعيداً عن العشوائية، وتشمل الفئات التالية:",
    list: [
      "إشعارات الجدولة والأنشطة: إرسال تذكير آلي قبل انطلاق المحاضرات والجلسات الافتراضية المباشرة بـ 60 و 15 دقيقة لضمان تجمع المتدربين.",
      "تنبيهات المتابعة والأداء: رسائل تذكيرية متتالية بمواعيد تسليم التكاليف، الواجبات، والاختبارات قبل إغلاق النظام بـ 24 و 12 ساعة.",
      "إعلانات إدارية وتنظيمية: تشمل أي طارئ أو تغييرات مجدولة في المواعيد، إضافة مواد وكتب جديدة، الإعلان عن النتائج وإصدار الشهادات."
    ]
  },
  {
    id: "channels",
    icon: Smartphone,
    color: "from-orange-400 to-rose-500",
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
    title: "قنوات التنبيه المباشرة لضمان الوصول",
    content: "للتأكد بشكل قاطع من وصول الرسالة التحذيرية أو التذكيرية للمستفيد في الوقت المناسب وفي أي ظرف، يتم إرسال الإشعارات عبر 3 قنوات أساسية ومتقاطعة:",
    list: [
      "تنبيهات المنصة (Push Notifications): تظهر أعلى واجهة لوحة التحكم وجرس الإشعارات فور دخول المتدرب لنظامه الداخلي.",
      "الرسائل النصية القصيرة (SMS Text): تُرسل الآليات المؤقتة المهمة كالاختبارات والتأجيلات مباشرة كرسالة لجوال المستفيد المسجل في حسابه الشخصي.",
      "البريد الإلكتروني المعتمد (Email Alert): يُستخدم لإرسال الإعلانات المطولة، التقارير الشهرية للتقدم، ومستندات ووثائق الدورات كرسائل رسمية وموثقة."
    ]
  },
  {
    id: "settings",
    icon: Settings2,
    color: "from-purple-500 to-pink-500",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
    title: "تخصيص الخصوصية وإعدادات النظام",
    content: "نحن في المعهد نحترم تماماً وقت وأولويات مستفيدينا، لذلك يوفر لك النظام مرونة تامة للتحكم بكيفية ووقت استلامك لهذه الرسائل بطريقة تحقق لك أفضل استفادة دون أي إزعاج:",
    list: [
      "يمكن للمستفيد إيقاف استقبال أو تفعيل (الرسائل التسويقية والدعائية) بشكل كامل وفصلها عن رسائل التدريب والمقررات الأساسية الإجبارية.",
      "إمكانية تحديث البريد الإلكتروني أو رقم الجوال بشكل دوري لضمان استمرار تلقي تنبيهات الاختبارات في حال تغيير معلومات التواصل المؤكدة."
    ]
  }
];

export default function NotificationsSystemPage() {
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
            <BellRing className="w-4 h-4 text-[#173A7C]" />
            <span className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">ابقَ على اطلاع دائماً</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 mb-6 leading-[1.35] tracking-tight">
            سياسة وآليات <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C] inline-block mt-3">نظام التنبيهات والإشعارات</span>
          </h1>
          
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-[1.8] max-w-3xl mx-auto mb-10">
            صممنا آلية تنبيهات مركزية وذكية لضمان متابعتك المستمرة لمواعيد وتطورات رحلتك التدريبية في المعهد دون عناء. نحن نحرص على تذكيرك بكل ما هو مهم في الوقت الأنسب وعبر أكثر القنوات فاعلية.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> تذكير آلي بالجلسات</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> رسائل SMS وإيميل</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> تخصيص الخصوصية</span>
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
                أقسام التنظيمات
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
            
            {/* Call to action decorative widget */}
            <div className="mt-6 bg-gradient-to-br from-[#173A7C] to-[#2F66D6] rounded-3xl p-8 text-white text-center shadow-lg shadow-[#173A7C]/20">
              <Mail className="w-12 h-12 text-white/80 mx-auto mb-4" />
              <h4 className="font-black text-lg mb-2">تأكد من بياناتك</h4>
              <p className="text-sm text-blue-100 font-medium opacity-90 leading-relaxed mb-6">
                احرص دائماً على تحديث رقم الجوال المربوط بالمنصة والبريد الإلكتروني كي لا يفوتك أي اختبار أو إعلان مركزي يخص مسارك التدريبي.
              </p>
              <Link 
                href="/about"
                className="inline-block px-6 py-3 bg-white text-[#173A7C] font-bold text-sm rounded-xl hover:bg-slate-50 hover:-translate-y-1 transition-all shadow-sm"
              >
                تحديث معلوماتك
              </Link>
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
                        <ul className="space-y-3 mt-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100/60 counter-reset-list">
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
