"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Scale, FileSignature, CheckCircle2, Users, BookOpenCheck, Asterisk } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const sections = [
  {
    id: "introduction",
    icon: ShieldCheck,
    color: "from-blue-500 to-indigo-600",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    title: "مقدمة والتزام",
    content: "تلتزم منصة معهد النبض المستدام للتدريب بحقوق الملكية الفكرية التزاماً تاماً عند تصميم ورفع وتداول جميع الحقائب التعليمية الرقمية المختلفة، وذلك لضمان أصالة المحتوى، احترام جهود الآخرين، وتقديم جودة أكاديمية تليق بمتدربينا."
  },
  {
    id: "academic-integrity",
    icon: Scale,
    color: "from-emerald-400 to-teal-500",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
    title: "مفهوم النزاهة الأكاديمية",
    content: "تُعد النزاهة الأكاديمية مطلباً أساسياً جوهرياً في جميع التعاملات داخل المعهد، حيث نُشدد على أهمية الصدق والأمانة المطلقة من قِبل كل فرد في البيئة الأكاديمية (طلاب، متدربين، إداريين، وأعضاء هيئة التدريب). نرفض رفضاً قاطعاً أي شكل من أشكال الانتهاكات، ومن صورها: الغش، الانتحال، تزوير المعلومات، والتلاعب في التقارير والمستحقات."
  },
  {
    id: "principles",
    icon: BookOpenCheck,
    color: "from-orange-400 to-rose-500",
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
    title: "مبادئ النزاهة للمتدربين",
    content: "لتحقيق بيئة تعليمية احترافية، يقوم المعهد بإرساء مبادئ النزاهة الأكاديمية عبر الخطوات والإجراءات التالية:",
    list: [
      "توفير أدلة وتعليمات مفصلة للمتدربين تضمن فهمهم الواضح والشامل لمبدأ النزاهة في بيئة التعلم الرقمي.",
      "تهيئة بيئة تدريبية تتوافر بها مستويات رفيعة من النزاهة الأكاديمية، باعتبارها جزءاً أساسياً ومحورياً من النمو الشخصي والمهني والفكري للمتدرب.",
      "تعزيز مناخ صحي تسوده روح الثقة المتبادلة، الأمانة، والمعايير الأخلاقية الرفيعة سعياً نحو تحقيق التميز الأكاديمي الحقيقي.",
      "الالتزام الصارم بالأمانة والنزاهة بين جميع أفراد مجتمع المعهد، والتطبيق الحازم لأحكام سياسة النزاهة الأكاديمية بلا استثناءات.",
      "توفير جميع الأدوات والتقارير الفنية التي تُمكّن الإدارة من رصد والتعامل الحازم مع أي تجاوزات للمبادئ المعتمدة.",
      "تقديم إرشادات ميدانية ودعم فني متواصل لضمان استيعاب المتدربين لكافة متطلبات وتحديثات الحفاظ على النزاهة الأكاديمية."
    ]
  },
  {
    id: "charter",
    icon: FileSignature,
    color: "from-purple-500 to-pink-500",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
    title: "ميثاق النزاهة والتعهد",
    content: "دخولك أو استخدامك لمنصة معهد النبض المستدام للتدريب يُعد بمثابة إقرار إلكتروني ملزم. أتعهد كمستخدم لمنصة المعهد بالالتزام التام بميثاق النزاهة الأكاديمية وفقاً للبنود التالية المُلزمة قطعيًا:",
    list: [
      "تجنب أي سرقة أكاديمية أو فكرية، والالتزام بحقوق الاستشهاد والمراجع في كافة الأبحاث والمشاريع الموكلة.",
      "الامتناع بشكل قاطع عن جميع أشكال الغش، سواء في التقييمات القصيرة أو النهائية.",
      "عدم انتحال شخصية الغير نهائياً لتأدية المهام، سواءً داخل فصول الصف الافتراضي، أو في أي اختبار ومحاكاة، أو تقديم المخرجات والواجبات التدريبية.",
      "الابتعاد تماماً عن أي ممارسات تتعلق بالتلفيق أو التزوير في المستندات، النتائج، أو الإجابات المرفوعة عبر المنصة."
    ]
  }
];

export default function AcademicIntegrityPage() {
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
            <Scale className="w-4 h-4 text-[#173A7C]" />
            <span className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">سياسات وقوانين التعليم</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 mb-6 leading-[1.35] tracking-tight">
            سياسات وقوانين <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C] inline-block mt-3">النزاهة الأكاديمية</span>
          </h1>
          
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-[1.8] max-w-3xl mx-auto mb-10">
            تُعد النزاهة الأكاديمية حجر الزاوية في بناء مجتمع تعليمي موثوق وعالي الكفاءة. نحن في المعهد نضع معايير صارمة وواضحة لضمان تكافؤ الفرص، وحفظ حقوق الملكية، وتقييم المتدربين بأعلى درجات المصداقية والشفافية.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> مصداقية وثقة</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> تكافؤ الفرص</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> حفظ الحقوق الفكرية</span>
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
              <h4 className="font-black text-lg mb-2">رقابة إلكترونية صارمة</h4>
              <p className="text-sm text-blue-100 font-medium opacity-90 leading-relaxed mb-6">
                نطبّق أحدث خوارزميات كشف التطابق ومراقبة الهوية لضمان حصولك على شهادة مستحقة وموثوقة محلياً وعالمياً.
              </p>
              <Link 
                href="/contact"
                className="inline-block px-6 py-3 bg-white text-[#173A7C] font-bold text-sm rounded-xl hover:bg-slate-50 hover:-translate-y-1 transition-all shadow-sm"
              >
                تواصل مع اللجان المعنية
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
