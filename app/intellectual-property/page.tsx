"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Copyright, BookLock, FileWarning, Gavel, CheckCircle2, Users, Asterisk } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const sections = [
  {
    id: "concept",
    icon: Copyright,
    color: "from-blue-500 to-indigo-600",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    title: "مفهوم الملكية الفكرية وحقوق النشر",
    content: "يُعنى مبدأ الملكية الفكرية بحماية الإبداعات البشرية والابتكارات التي لطالما شكّلت قيمة مضافة، والتي تشمل: العلامات التجارية، الاختراعات، حق المؤلف، حقوق النشر، النماذج، المفاهيم، قواعد البيانات، التصاميم، والرسومات وغيرها. وتُعرف حقوق الملكية الفكرية بأنها مجموعة من الحقوق القانونية التي تحمي أعمال المؤلفين والمبدعين من أي إعادة إنتاج أو استغلال من قِبل أطراف أخرى دون الحصول على موافقة خطية منهم."
  },
  {
    id: "ip-principles",
    icon: BookLock,
    color: "from-emerald-400 to-teal-500",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
    title: "مبادئ حقوق الملكية الفكرية في المعهد",
    content: "نلتزم في معهد النبض المستدام بتطبيق مفاهيم وقوانين الملكية الفكرية بصرامة لدعم وحماية المحتوى، وذلك عبر الالتزام بالمبادئ التالية:",
    list: [
      "تمتلك الجهة (معهد النبض المستدام) جميع حقوق استخدام ونشر وإدارة المحتوى الإلكتروني المدرج في المنصة.",
      "يجب على المعهد الالتزام التام بحقوق الملكية الفكرية في كل ما يتم نشره وتداوله في بيئة التدريب الإلكتروني.",
      "يتحمل المدرب بمفرده المسؤولية كاملة في حال استخدامه لمحتوى لا تعود ملكيته الفكرية للمركز أو لم يحصل على تصريح رسمي باستخدامه.",
      "في حالة استخدام أي محتوى مفتوح المصدر (Open Source) ضمن العملية التدريبية، يُلزم المدرب بذكر المصدر بشكل صريح وواضح.",
      "يلتزم المركز بفحص المحتوى التدريبي دورياً والتأكد من خلوه من أي انتهاكات تمس حقوق الملكية الفكرية."
    ]
  },
  {
    id: "copyright-principles",
    icon: FileWarning,
    color: "from-orange-400 to-rose-500",
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
    title: "مبادئ حقوق النشر والمحظورات",
    content: "حرصاً منا على توفير بيئة تعليمية آمنة وموثوقة وتحترم كافة المعايير الأخلاقية والمجتمعية، يُحظر بشكل قاطع نشر أي من التالي في منصتنا:",
    list: [
      "يُمنع نشر أي محتوى يتعرض لأشخاص، مؤسسات، أو كيانات أو يظهرهم بطريقة سيئة، غير لائقة، أو مسيئة.",
      "يُمنع التعدي بنشر أو اقتباس محتوى ذو حقوق فكرية لطرف ثالث بدون الحصول على تصريح أو موافقة مسبقة.",
      "يُمنع منعاً باتاً وتُتخذ أقصى الإجراءات ضد نشر أي محتوى يخالف التعاليم الدينية أو القيم والأخلاف العامة.",
      "يُمنع نشر أي محتوى يُؤثر سلباً على الوحدة الوطنية أو يثير أي نعرات عنصرية، طائفية، أو قبلية بأي شكل كان.",
      "يُمنع نشر أو الترويج لأي محتوى أو منتج ذو أهداف تجارية أو تسويقية داخل النظام التعليمي والتدريبي."
    ]
  },
  {
    id: "violations",
    icon: Gavel,
    color: "from-red-500 to-rose-600",
    iconColor: "text-red-600",
    bgColor: "bg-red-50",
    title: "الإجراءات المتخذة في حال الانتهاك",
    content: "في حال حدوث، أو الاشتباه في حدوث أي انتهاك لحقوق الملكية الفكرية، يتبع المعهد فوراً الإجراءات المنهجية الصارمة التالية:",
    list: [
      "التحقق والتقييم: يجب على الجهة التحقق الفوري من صحة الادعاء بانتهاك الملكية، وقد يشمل ذلك إجراء تحقيق داخلي مكثف لفحص الحقائق وجمع الأدلة الثبوتية.",
      "الإبلاغ إلى الهيئة السعودية للملكية الفكرية: الإبلاغ الرسمي عن أي حالة انتهاك مؤكدة، وقد تتطلب هذه الخطوة تقديم تقرير فني وقانوني مفصل مدعوماً بجميع الأدلة المتاحة.",
      "التعويض والتسوية: قد تسعى الجهة إلى التوصل إلى تسوية أو اتفاق مرضٍ مع الطرف المتضرر من الانتهاك، والذي يمكن أن يشمل دفع تعويض مالي لمعالجة الضرر الواقع.",
      "التعاون مع السلطات القانونية: في حالة تعذر التوصل لتسوية، يمكن للجهة إحالة الأمر والتعاون التام مع السلطات القانونية المختصة لمقاضاة المتسببين في هذا الانتهاك.",
      "تعزيز التوعية: العمل بشكل استباقي على تعزيز التوعية بحقوق الملكية الفكرية بين منسوبيها والمتدربين للحد من حدوث أي انتهاكات مستقبلية."
    ]
  },
  {
    id: "compliance",
    icon: ShieldCheck,
    color: "from-purple-500 to-pink-500",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
    title: "نطاق التطبيق والالتزام",
    content: "تسري هذه المبادئ التنظيمية على جميع المستفيدين من خدمات (معهد النبض المستدام)، ونلتزم المؤسسياً بضمان تطبيقها بفعالية. كذلك يلتزم بها جميع العاملين في الجهة بمختلف أدوارهم. نُنوه بشدة إلى أن أي انتهاك لهذه المبادئ يُعرض صاحب المخالفة لإجراءات تأديبية وحازمة تُتخذ حسب السياسات الداخلية المتبعة في المعهد، وبما يتوافق تماماً مع أنظمة وإجراءات الهيئة السعودية للملكية الفكرية."
  }
];

export default function IntellectualPropertyPage() {
  const [activeSection, setActiveSection] = useState<string>(sections[0].id);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-[calc(10vh+5rem)]">
      
      {/* ═══════════════════════════════════════ HEADER ═══════════════════════════════════════ */}
      <section className="relative px-4 sm:px-6 mb-16 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
            <Copyright className="w-4 h-4 text-[#173A7C]" />
            <span className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">حماية الإبداع والابتكار</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 mb-6 leading-[1.35] tracking-tight">
            مبادئ حقوق الملكية الفكرية <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C] inline-block mt-3">وحقوق النشر</span>
          </h1>
          
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-[1.8] max-w-3xl mx-auto mb-10">
            احترام إبداعات الآخرين وحفظ حقوقهم الفكرية هو التزام منهجي وأخلاقي لا نتخلى عنه. حرصنا على توثيق هذه المبادئ والسياسات لحماية كافة منتجات شركائنا المعرفية وضمان بيئة تدريبية تتسم بالرقي والموثوقية.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> التزام قانوني</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> بيئة آمنة للمدربين</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> حوكمة المحتوى</span>
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
                <Users className="w-5 h-5 text-[#173A7C]" />
                محتويات الوثيقة
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
                      {p.title}
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
              <h4 className="font-black text-lg mb-2">حفظ آمن وموثوق</h4>
              <p className="text-sm text-blue-100 font-medium opacity-90 leading-relaxed mb-6">
                جميع حقوق المدربين والمبدعين محفوظة بنظام رقمي آمن ومسجل لتفادي أي استخدام غير مصرح به.
              </p>
              <Link 
                href="/contact"
                className="inline-block px-6 py-3 bg-white text-[#173A7C] font-bold text-sm rounded-xl hover:bg-slate-50 hover:-translate-y-1 transition-all shadow-sm"
              >
                تواصل مع الإدارة
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
