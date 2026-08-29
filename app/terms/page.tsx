"use client";

import { motion } from "framer-motion";
import { ShieldCheck, FileText, CheckCircle, Scale, Users, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const terms = [
  {
    id: "general-terms",
    icon: FileText,
    color: "from-blue-500 to-indigo-600",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    title: "الشروط العامة",
    content: "مرحباً بك في منصة معهد النبض المستدام للتدريب. باستخدامك لهذه المنصة، فإنك توافق على الالتزام بجميع الشروط والأحكام الموضحة هنا. يُعد استخدامك المستمر للمنصة بعد إجراء أي تغييرات على الشروط موافقة ضمنية عليها. نرجو منك مراجعة هذه الشروط بانتظام للتأكد من موافقتك عليها."
  },
  {
    id: "user-obligations",
    icon: Users,
    color: "from-emerald-400 to-teal-500",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
    title: "التزامات المستخدم",
    content: "يلتزم المستخدم بتقديم معلومات شخصية وأكاديمية دقيقة عند التسجيل. يجب أن تحافظ على سرية معلومات حسابك وألا تشارك بيانات الدخول مع أي شخص آخر. يتحمل المستخدم المسؤولية الكاملة عن أي نشاط يحدث عبر حسابه. يمنع منعاً باتاً استخدام المنصة لأي أغراض تخالف القوانين أو تضر بسمعة المعهد."
  },
  {
    id: "intellectual-property",
    icon: ShieldCheck,
    color: "from-purple-500 to-pink-500",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
    title: "حقوق الملكية الفكرية",
    content: "جميع المحتويات المتوفرة على المنصة، بما في ذلك الدورات التدريبية، المقالات، الفيديوهات، التصاميم، والشعارات هي ملكية حصرية لمعهد النبض المستدام للتدريب. يُمنع تماماً نسخ، تعديل، توزيع، أو إعادة استخدام أي جزء من هذا المحتوى لأغراض تجارية أو غير تجارية دون إذن كتابي مسبق من الإدارة."
  },
  {
    id: "cancellation",
    icon: Scale,
    color: "from-orange-400 to-rose-500",
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
    title: "سياسة الإلغاء والاسترداد",
    content: "يحق للمشترك طلب استرداد رسوم الدورة خلال مدة محدودة قبل بدايتها وفقاً لسياسة المعهد المالية. لا يتم استرداد الرسوم إذا تم الوصول إلى المحتوى التدريبي أو حضور أي من المحاضرات. تقرر الإدارة الحالات الاستثنائية بشكل فردي وفقاً لما تراه مناسباً."
  },
  {
    id: "amendments",
    icon: CheckCircle,
    color: "from-slate-600 to-slate-800",
    iconColor: "text-slate-700",
    bgColor: "bg-slate-100",
    title: "التعديلات على الشروط",
    content: "يحتفظ المعهد بحق تعديل أو تحديث هذه الشروط في أي وقت ودون إشعار مسبق. تسري الشروط المعدلة فور نشرها على الموقع. نوصي جميع المتدربين والزوار بمراجعة صفحة الشروط والأحكام من حين لآخر لضمان البقاء على اطلاع."
  }
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState<string>(terms[0].id);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-20 md:pt-[calc(10vh+5rem)]">
      
      {/* ═══════════════════════════════════════ HEADER ═══════════════════════════════════════ */}
      <section className="relative px-4 sm:px-6 mb-16 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-8">
            <span className="section-badge-glass">
              <Scale className="w-4 h-4 text-[#173A7C] ml-1 inline" />
              وثيقة الشروط والأحكام
            </span>
          </div>
          
          <h1 className="section-main-title-premium text-3xl sm:text-4xl lg:text-[2.75rem] mb-6 leading-[1.35]">
            الشروط والأحكام <br />
            <span className="gradient-text inline-block mt-3">الضامن لحقوق الجميع</span>
          </h1>
          
          <p className="section-desc-premium text-base sm:text-lg max-w-3xl mx-auto mb-10">
            تهدف هذه الوثيقة إلى تنظيم العلاقة بين معهد النبض المستدام والمستخدمين، وتوضيح الحقوق والواجبات المتبادلة لضمان تقديم تجربة تعليمية متميزة تسودها الشفافية والموثوقية.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> شفافية</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> حقوق محفوظة</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> التزام متبادل</span>
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
                <img src="/logo.svg" alt="Sustain Pulse Logo" className="h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
              </div>

              <h3 className="card-title-royal-blue text-lg mb-6 flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#173A7C]" />
                محتويات الوثيقة
              </h3>
              <div className="space-y-2">
                {terms.map((p) => (
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
                      <motion.div layoutId="activeTermsInd" className="w-1.5 h-1.5 rounded-full bg-[#173A7C]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-6 bg-gradient-to-br from-[#173A7C] to-[#2F66D6] rounded-3xl p-8 text-white text-center shadow-lg shadow-[#173A7C]/20">
              <ShieldCheck className="w-12 h-12 text-white/80 mx-auto mb-4" />
              <h4 className="font-black text-lg mb-2">حقوقك محفوظة</h4>
              <p className="text-sm text-blue-100 font-medium opacity-90 leading-relaxed mb-6">
                نحن نحرص على تقديم أفضل الحلول التي تضمن سلاسة التعامل بين المعهد وكافة المتدربين بشفافية عالية.
              </p>
              <Link 
                href="/contact"
                className="inline-block px-6 py-3 bg-white text-[#173A7C] font-bold text-sm rounded-xl hover:bg-slate-50 hover:-translate-y-1 transition-all shadow-sm"
              >
                تواصل مع الدعم
              </Link>
            </div>
          </motion.div>

          {/* Clauses List */}
          <div className="w-full lg:w-2/3 space-y-6 lg:space-y-8 order-1 lg:order-2">
            {terms.map((policy, index) => {
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
                    <div>
                      <h2 className="card-title-royal-blue text-xl sm:text-2xl mb-4">{policy.title}</h2>
                      <p className="card-desc-premium text-[15.5px] leading-[2]">
                        {policy.content}
                      </p>
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
