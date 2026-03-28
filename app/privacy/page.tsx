"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Database, Cookie, Lock, Link as LinkIcon, Info, Users, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const policies = [
  {
    id: "data-collection",
    icon: Database,
    color: "from-blue-500 to-indigo-600",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    title: "جمع المعلومات",
    content: "لا نقوم بجمع البيانات إلا إذا قدمها المستخدم بمحض إرادته، مثل التسجيل في ورش العمل، أو المشاركة في النقاشات، أو التقديم على وظائف معلن عنها. ويعتبر هذا الإجراء موافقة ضمنية للاطلاع عليها. نؤكد أن هذه البيانات تعتبر سرية ومحمية للمدة اللازمة ولن يتم مشاركتها إلا بموافقة صريحة من المستخدم. لك كامل الحق في تصفح الموقع كمجهول حيث لا يمكن التعرف على معلوماتك الشخصية مثل الاسم، رقم الهاتف، أو البريد الإلكتروني دون إدخالها بنفسك."
  },
  {
    id: "cookies",
    icon: Cookie,
    color: "from-orange-400 to-rose-500",
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
    title: "ملفات تعريف الارتباط (Cookies)",
    content: "ملفات تعريف الارتباط هي ملفات نصية تحتوي على أجزاء صغيرة من البيانات (مثل اسم المستخدم وكلمة المرور) تُستخدم لتعريف جهاز الحاسوب الخاص بك أثناء استخدامك للموقع، وذلك لأغراض فنية بحتة. تشمل هذه الأغراض التعرف عليك عند الزيارة مرة أخرى، وحفظ التغييرات التي أجريتها، وتتبع مستوى تقدمك في الدورات. لا يتم استخدام أي من البيانات المدخلة خارج هذا الإطار التقني. يمكنك دائماً رفض ملفات الارتباط، وفي هذه الحالة لن تتمكن من الاستفادة من بعض المزايا المخصصة لك."
  },
  {
    id: "data-usage",
    icon: Info,
    color: "from-emerald-400 to-teal-500",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
    title: "كيف تستخدم المعلومات",
    content: "تنحصر استخداماتنا للمعلومات التي تم جمعها في الأغراض الأكاديمية والتطويرية فقط؛ كإرسال الاستبيانات لتحسين جودة التعليم، إرسال التنبيهات الدورية، وتزويد المتدربين بآخر التحديثات والإعلانات الهامة الخاصة بالدورات والبرامج التدريبية المتاحة."
  },
  {
    id: "links",
    icon: LinkIcon,
    color: "from-purple-500 to-pink-500",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
    title: "الروابط الخارجية",
    content: "تقتصر محتويات منصة (معهد النبض المستدام للتدريب) على الروابط التابعة للمعهد فقط. لا نقوم بتوفير روابط لمواقع خارجية ليست ضمن مجال الإشراف الخاص بنا. وبالتالي، فإن سياسة الخصوصية المُتبعة لدينا لا تسري على أي المواقع الأخرى في حال وصولك إليها، ولا نتحمل أو نضمن مصداقية أو أمان أي كيانات خارجية."
  },
  {
    id: "security",
    icon: Lock,
    color: "from-slate-600 to-slate-800",
    iconColor: "text-slate-700",
    bgColor: "bg-slate-100",
    title: "الحماية والأمان المطلق",
    content: "نحن نضع مصلحة وأمان متدربينا في قمة أولوياتنا. لذلك، يتخذ المعهد إجراءات تقنية وإدارية مشددة لحماية أمن المعلومات والتصدي لأي هجمات سيبرانية، فضلاً عن منع أي محاولات للدخول غير المصرح به للموقع ولنظام إدارة التعلم الخاص بنا، مما يضمن بيئة تدريب آمنة وموثوقة لجميع مستخدمينا."
  }
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState<string>(policies[0].id);

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
            <ShieldCheck className="w-4 h-4 text-[#173A7C]" />
            <span className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">بيان سياسة الخصوصية والاستخدام</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 mb-6 leading-[1.35] tracking-tight">
            خصوصيتك وأمان بياناتك <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C] inline-block mt-3">أولويتنا القصوى</span>
          </h1>
          
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-[1.8] max-w-3xl mx-auto mb-10">
            هذا البيان يعتبر تنظيماً لسياسة الخصوصية، يوضح بوضوح وشفافية كيفية استلام وجمع البيانات من مستخدمينا، وطرق حمايتها، والأطراف التي نشاركها معها. وتنطبق أحكام هذه السياسة حصرياً على موقع منصة النبض المستدام.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> شفافية ومسؤولية</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> تشفير تام للبيانات</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> توافق تنظيمي وقانوني</span>
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

              <h3 className="font-extrabold text-lg text-slate-800 mb-6 flex items-center gap-3">
                <Users className="w-5 h-5 text-[#173A7C]" />
                محتويات الوثيقة
              </h3>
              <div className="space-y-2">
                {policies.map((p) => (
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
              <h4 className="font-black text-lg mb-2">أمان بياناتك محفوظ</h4>
              <p className="text-sm text-blue-100 font-medium opacity-90 leading-relaxed mb-6">
                نستخدم أحدث التقنيات وأفضل الممارسات الموثوقة عالمياً للحفاظ على سرية معلوماتك.
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
            {policies.map((policy, index) => {
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
                      <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-4">{policy.title}</h2>
                      <p className="text-slate-500 text-[15.5px] leading-[2] font-medium">
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
