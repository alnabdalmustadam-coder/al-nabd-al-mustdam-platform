"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Search, RefreshCw, Gavel, ScanEye, CheckCircle2, ShieldHalf, Asterisk } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const sections = [
  {
    id: "objective",
    icon: ShieldAlert,
    color: "from-blue-500 to-indigo-600",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    title: "الهدف والغاية من الآلية",
    content: "نسعى في (معهد النبض المستدام للتدريب) إلى ترسيخ منظومة القيم والنزاهة الأكاديمية وتوفير تكافؤ تام في الفرص بين جميع المتدربين. ويتحقق ذلك بتطبيق سياسات رقمية وإدارية صارمة وموثوقة لضمان تقييم المخرجات الحقيقية للمتدربين، ومنع أي شكل من أشكال الغش، الانتحال العلمي، أو التلاعب في المهام والاختبارات الموكلة لهم."
  },
  {
    id: "plagiarism-check",
    icon: Search,
    color: "from-emerald-400 to-teal-500",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
    title: "أدوات فحص الانتحال والتطابق",
    content: "نُخضع كافة التكاليف، المشاريع الإفرادية، والأبحاث المُسلمة عبر بوابة المتدربين للتدقيق الآلي العميق باستخدام برمجيات ذكية متخصصة بكشف نسبة الاستلال. وتتضمن التدابير المعيارية ما يلي:",
    list: [
      "مقارنة محتوى مهام المتدرب مع قواعد بيانات عالمية وشبكة الإنترنت لتحديد أي عبارات منسوخة حرفياً.",
      "ضبط نسبة السماحية للتطابق لتكون ضمن الحدود الأكاديمية المقبولة (لا تتجاوز 15% من إجمالي المحتوى).",
      "إجراء مقارنات بين تسليمات المتدربين ضمن الشعبة الواحدة لضمان عدم وجود تناقل وتطابق بين أعمالهم الداخلية.",
      "إصدار تقرير استلال (Similarity Report) مفصل ودقيق يُرفق مع تقييم العمل."
    ]
  },
  {
    id: "exam-proctoring",
    icon: ScanEye,
    color: "from-orange-400 to-rose-500",
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
    title: "المراقبة التفاعلية للاختبارات (Proctoring)",
    content: "للحفاظ على مساواة وموثوقية التقييم خلال حضور الدورات والتأهيل عن بُعد، يُفعّل المعهد آليات المراقبة الذكية المتقدمة أثناء فترات الاختبارات النهائية للبرامج الكبرى:",
    list: [
      "الاستعانة بتقنيات المتصفح الآمن (Safe Browser) الذي يُقفل شاشة المتدرب ويمنعه من متصفحات وبرامج أخرى أثناء الاختبار.",
      "تطبيق أنظمة التحقق من الهوية (Identity Verification) قبل الموافقة على فتح ورقة الاختبار للمتدرب.",
      "تعطيل خواص النسخ واللصق (Copy/Paste)، التقاط الشاشة (Screenshot)، والطباعة بشكل كامل.",
      "تسجيل أجهزة IP لمعرفة أي دخول مزدوج لنفس الحساب من مناطق مختلفة في زمن متزامن."
    ]
  },
  {
    id: "randomization",
    icon: RefreshCw,
    color: "from-purple-500 to-pink-500",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
    title: "أنظمة التقييم الديناميكية والعشوائية",
    content: "للحد الجذري من احتمالية تبادل الإجابات بين المتدربين، سواء كان الاختبار متزامناً أم غير متزامن، تم بناء محركات الاختبار بنظام عشوائي آمن:",
    list: [
      "سحب الأسئلة عشوائياً (Randomization) من بنوك أسئلة مهيكلة ضخمة، بحيث يُصمم اختبار فريد لكل متدرب.",
      "تغيير الترتيب التلقائي للخيارات (Shuffle) في أسئلة الاختيار من متعدد لتفادي حفظ تسلسل الأجوبة (أ، ب، ج).",
      "وضع ضوابط زمنية صارمة جداً (Timers) على مستوى السؤال الواحد أو الاختبار بمجمله لتقليل فرص البحث المرجعي الخارجي.",
      "الأسئلة أحادية الاتجاه (لا يمكن العودة وتعديل إجابة السؤال السابق بعد الانتقال للتالي) في بعض البرامج."
    ]
  },
  {
    id: "penalties",
    icon: Gavel,
    color: "from-red-500 to-rose-600",
    iconColor: "text-red-600",
    bgColor: "bg-red-50",
    title: "الإجراءات التأديبية حال إثبات المخالفة",
    content: "يعتبر التلاعب في أنظمة التقييم أو انتحال المعارف انتهاكاً صارخاً للائحة النزاهة الأكاديمية للمعهد. وبموجبه يواجه المخالف، بشكل وتدرج فوري، العقوبات التالية:",
    list: [
      "مرحلة الإنذار والمراجعة: إلغاء درجة العمل المعني جزئياً أو الطلب بإعادته لمرة واحدة ضمن فترة التماس تُحددها الإدارة.",
      "مرحلة التقييم المركزي: اعتبار المتدرب (راسباً) رسمياً في المنهج أو الدورة بأكملها وإلغاء اختباره بشكل نهائي.",
      "مرحلة الجزاءات التنظيمية: رفع تقرير دقيق للجهة المانحة أو الراعية للمتدرب بحالة وسبب الإلغاء.",
      "مرحلة الحظر: الإيقاف النهائي وسحب الحساب أو أي شهادات واعتمادات قُدّمت سابقاً واُكتشف فيها الانتحال بأثر رجعي."
    ]
  }
];

export default function AntiPlagiarismPage() {
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
            <ShieldAlert className="w-4 h-4 text-[#173A7C]" />
            <span className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">نزاهة وشفافية التقييم</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 mb-6 leading-[1.35] tracking-tight">
            آلية فحص أعمال المتدربين <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C] inline-block mt-3">ومنع الغش الإلكتروني</span>
          </h1>
          
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-[1.8] max-w-3xl mx-auto mb-10">
            لضمان مصداقية شهاداتنا وقوة مخرجاتنا التعليمية، نطبق المعيار الأقوى من الآليات والسياسات التقنية المتطورة للتأكد من المجهود العلمي الحقيقي لكل متدرب، والحفاظ على موثوقية عالية لمنظومة التعليم عن بُعد.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> فحص آلي دقيق</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> مراقبة آمنة ومستمرة</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> تكافؤ الفرص للمتدربين</span>
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
                مراحل الحماية
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
            
            <div className="mt-6 bg-gradient-to-br from-[#173A7C] to-[#2F66D6] rounded-3xl p-8 text-white text-center shadow-lg shadow-[#173A7C]/20">
              <ScanEye className="w-12 h-12 text-white/80 mx-auto mb-4" />
              <h4 className="font-black text-lg mb-2">رقابة صارمة 24/7</h4>
              <p className="text-sm text-blue-100 font-medium opacity-90 leading-relaxed mb-6">
                الأنظمة وتكنولوجيا الفحص لدينا تعمل على مدار الساعة لكشف الانتحال بشكل تلقائي وسريع.
              </p>
              <Link 
                href="/academic-integrity"
                className="inline-block px-6 py-3 bg-white text-[#173A7C] font-bold text-sm rounded-xl hover:bg-slate-50 hover:-translate-y-1 transition-all shadow-sm"
              >
                سياسة النزاهة الأكاديمية
              </Link>
            </div>
          </motion.div>

          {/* Clauses List */}
          <div className="w-full lg:w-2/3 space-y-6 lg:space-y-8 order-1 lg:order-2">
            {sections.map((policy, index) => {
              const Icon = policy.icon;
              return (
                <motion.div
                  id={policy.id}
                  key={policy.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  onViewportEnter={() => setActiveSection(policy.id)}
                  className={`relative bg-white rounded-[2.5rem] p-8 sm:p-12 border transition-all duration-500 overflow-hidden group ${
                    activeSection === policy.id ? "border-[#173A7C]/20 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.12)] ring-1 ring-[#173A7C]/5" : "border-slate-100 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${policy.color} opacity-[0.03] rounded-bl-full pointer-events-none transition-transform duration-700 group-hover:scale-150`} />
                  
                  <div className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
                    <div className={`w-16 h-16 shrink-0 rounded-2xl ${policy.bgColor} flex items-center justify-center border border-white shadow-inner group-hover:-translate-y-1 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${policy.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-4">{policy.title}</h2>
                      <p className="text-slate-500 text-[15.5px] leading-[2] font-medium mb-4">
                        {policy.content}
                      </p>
                      
                      {policy.list && (
                        <ul className="space-y-3 mt-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100/60">
                          {policy.list.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <Asterisk className={`w-4 h-4 mt-1.5 shrink-0 ${policy.iconColor} opacity-70`} />
                              <span className="text-slate-600 text-[15px] font-medium leading-[1.8]">{item}</span>
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
