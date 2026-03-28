"use client";

import { motion } from "framer-motion";
import { Server, Database, Network, ShieldCheck, Users, Cpu, CheckCircle2, Cloud, Lock, Settings } from "lucide-react";
import Link from "next/link";

const specifications = [
  {
    id: "server",
    title: "إستضافة النظام",
    value: "سحابي (Cloud Infrastructure)",
    icon: Cloud,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50/80",
    iconColor: "text-blue-600",
    colSpan: "col-span-1 md:col-span-1"
  },
  {
    id: "database",
    title: "قاعدة البيانات التقنية",
    value: "MySQL",
    icon: Database,
    color: "from-emerald-400 to-teal-500",
    bgColor: "bg-emerald-50/80",
    iconColor: "text-emerald-500",
    colSpan: "col-span-1 md:col-span-1"
  },
  {
    id: "network",
    title: "شبكة الاتصال الرئيسية",
    value: "شبكة اتصال محلية آمنة",
    icon: Network,
    color: "from-amber-400 to-orange-500",
    bgColor: "bg-amber-50/80",
    iconColor: "text-amber-500",
    colSpan: "col-span-1 md:col-span-1"
  },
  {
    id: "capacity",
    title: "الطاقة الإستيعابية لعدد المستخدمين",
    value: "يصل عدد المستخدمين المدعومين في المنصة إلى (35) متدرب كحد قياسي للفصل الواحد حسب نظام التدريب الإلكتروني. كما نملك المرونة لزيادة أعداد المتعلمين بمقدار 25% على العدد المذكور في الفصل الافتراضي المتزامن. ويتم فتح فصول افتراضية إضافية تلقائياً كلما اقتضت الحاجة حفاظاً على خفة وجودة النظام.",
    icon: Users,
    color: "from-cyan-400 to-sky-500",
    bgColor: "bg-cyan-50/80",
    iconColor: "text-cyan-500",
    colSpan: "col-span-1 md:col-span-3"
  },
  {
    id: "security",
    title: "نظام الحماية والتشغيل الآمن",
    list: [
      "جدار ناري (Firewall)",
      "تشفير البيانات باستخدام شهادة أمان SSL",
      "نسخ احتياطي (Backup) دوري"
    ],
    icon: Lock,
    color: "from-rose-400 to-red-500",
    bgColor: "bg-rose-50/80",
    iconColor: "text-rose-500",
    colSpan: "col-span-1 md:col-span-2"
  },
  {
    id: "support-team",
    title: "فريق المتابعة والدعم الفني",
    list: [
      "مدير النظام",
      "مهندس الشبكات",
      "مسؤول قواعد البيانات",
      "مسؤول الدعم التقني"
    ],
    icon: Settings,
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-purple-50/80",
    iconColor: "text-purple-600",
    colSpan: "col-span-1 md:col-span-2" // This makes 4 cols total, wait. Let's make it 3 cols
  }
];

export default function TechnicalSpecificationsPage() {
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
            <Server className="w-4 h-4 text-[#173A7C]" />
            <span className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">البنية التحتية والبيانات</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 mb-6 leading-[1.35] tracking-tight">
            مواصفات البنية التقنية <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C] inline-block mt-3">للنظام والمنصة التدريبية</span>
          </h1>
          
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-[1.8] max-w-3xl mx-auto mb-10">
            يمتلك <span className="font-bold text-slate-700">معهد النبض المستدام للتدريب</span> البنية التقنية القوية والمتطورة اللازمة لدعم وسلاسة عملية التدريب الإلكتروني، ولديها القدرة الفائقة على تحمل مختلف أعداد المستفيدين داخل الجهة دون التأثير على جودة الاتصال أو الخدمة.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> خوادم عالية الأداء</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> استقرار المنصة 99.9%</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> أمان بيانات موثوق</span>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════ CONTENT SPECIFICATIONS GRID ═══════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          
          {/* Top 3 Small Cards */}
          {specifications.slice(0, 3).map((spec, index) => (
            <motion.div
              key={spec.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_15px_40px_-15px_rgba(23,58,124,0.08)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group ${spec.colSpan}`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${spec.color} opacity-[0.03] rounded-bl-full pointer-events-none transition-transform duration-700 group-hover:scale-150`} />
              <div className={`w-14 h-14 rounded-2xl ${spec.bgColor} flex items-center justify-center mb-6 border border-white shadow-inner`}>
                <spec.icon className={`w-6 h-6 ${spec.iconColor}`} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">{spec.title}</h3>
              <p className="text-slate-500 font-bold text-[15px]" dir="auto">{spec.value}</p>
            </motion.div>
          ))}

          {/* Full Width Capacity Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`bg-[#0A162B] rounded-[2.5rem] p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden group col-span-1 md:col-span-3`}
          >
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
              <div className={`w-20 h-20 shrink-0 rounded-[1.5rem] bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20`}>
                 <Users className="w-9 h-9 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-4">{specifications[3].title}</h3>
                <p className="text-cyan-50 font-medium text-[16px] leading-[2.2] opacity-90">
                  يصل عدد المستخدمين في المنصة إلى <strong className="text-white px-1 font-black" dir="ltr">( 35 )</strong> متدرب حسب نظام التدريب الإلكتروني، و يُسمح بزيادة عدد المتعلمين بمقدار <strong className="text-white px-1 font-black" dir="ltr">25%</strong> على العدد المذكور أعلاه في الفصل الافتراضي المتزامن. ويمكن عمل وإتاحة الفصول الافتراضية بشكل لانهائي كلما اقتضت الحاجة لذلك لضمان استقرار الخوادم.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bottom 2 Lists Cards - Wait, need to fix colSpan to make them span nicely */}
          <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
             {specifications.slice(4).map((spec, index) => (
                <motion.div
                  key={spec.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + (index * 0.1), duration: 0.5 }}
                  className={`bg-white rounded-[2rem] p-8 sm:p-10 border border-slate-100 shadow-[0_15px_40px_-15px_rgba(23,58,124,0.08)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${spec.color} opacity-[0.03] rounded-bl-full pointer-events-none transition-transform duration-700 group-hover:scale-150`} />
                  
                  <div className="flex items-center gap-5 mb-8 relative z-10">
                    <div className={`w-14 h-14 shrink-0 rounded-2xl ${spec.bgColor} flex items-center justify-center border border-white shadow-inner group-hover:-translate-y-1 transition-transform duration-300`}>
                      <spec.icon className={`w-6 h-6 ${spec.iconColor}`} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800">{spec.title}</h3>
                  </div>

                  <ul className="space-y-4 relative z-10">
                     {spec.list?.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 hover:bg-slate-50 hover:border-slate-200 transition-colors">
                           <ShieldCheck className={`w-5 h-5 shrink-0 ${spec.iconColor} opacity-80`} />
                           <span className="text-slate-600 font-bold text-[15px]">{item}</span>
                        </li>
                     ))}
                  </ul>
                </motion.div>
              ))}
          </div>

        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mt-16">
        <div className="bg-gradient-to-br from-[#173A7C] to-[#2F66D6] rounded-[2rem] p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
             <h3 className="text-xl sm:text-2xl font-black text-white mb-4 relative z-10">جاهزية تقنية للمستقبل</h3>
             <p className="text-blue-100 font-medium text-[15px] leading-relaxed max-w-2xl mx-auto mb-8 relative z-10">
               نسعى دوماً في معهد النبض المستدام لتحديث البنية التقنية وتأمين الخوادم لتواكب أحدث المعايير الرقمية لتقديم تجربة تدريب غير مسبوقة.
             </p>
             <Link 
               href="/contact"
               className="relative z-10 inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#173A7C] font-bold text-sm rounded-xl hover:bg-slate-50 hover:-translate-y-1 transition-all shadow-lg"
             >
               فريق الدعم المباشر
             </Link>
        </div>
      </section>
      
    </div>
  );
}
