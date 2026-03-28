"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Network, Users, UserCog, MonitorPlay, Cpu, Headset, Phone, Briefcase, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const introduction = {
  title: "الأدوار والمسؤوليات",
  description: "يعتمد التعليم الإلكتروني أساساً على الحاسوب والشبكات في نقل المعارف والمهارات، وتضم تطبيقاته التعلم عبر صفحات الويب، غرف التدريب الافتراضية، والتعاون الرقمي. ولضمان سير هذه المنظومة بكفاءة احترافية، نوضح أدناه الهيكلة التنظيمية والأدوار والمسؤوليات للفنيين، الإداريين، والتقنيين في المعهد مع أرقام التواصل لكل قسم."
};

const staffList = [
  {
    id: "khaled",
    icon: UserCog,
    color: "from-blue-500 to-indigo-600",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    name: "أ. خالد مسعد الجدعاني",
    role: "مدير المعهد",
    description: "الإشراف العام ومسؤول عن سير العملية التدريبية لضمان تحقيق الأهداف الأكاديمية الاستراتيجية.",
    phones: "0126811012 - 0126875085",
    ext: "104",
    linkTitle: "الإدارة العليا"
  },
  {
    id: "walid",
    icon: MonitorPlay,
    color: "from-emerald-400 to-teal-500",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
    name: "أ. وليد محمود موسى",
    role: "فني التصميم والتطوير",
    description: "مسؤول عن التدريب الإلكتروني، تصميم وتحويل وتطوير المقررات العلمية إلى حقائب رقمية تفاعلية.",
    phones: "0126811012 - 0126875085",
    ext: "101",
    linkTitle: "التطوير الفني"
  },
  {
    id: "salman",
    icon: Cpu,
    color: "from-orange-400 to-rose-500",
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
    name: "أ. سلمان الغامدي",
    role: "تقني ومدير البرامج التدريبية",
    description: "الإدارة التقنية للبرامج والمناهج التدريبية، والتأكد من مطابقتها لأعلى المعايير التكنولوجية.",
    phones: "0126811012 - 0126875085",
    ext: "103",
    linkTitle: "البرامج التقنية"
  },
  {
    id: "abdulrahman",
    icon: Headset,
    color: "from-purple-500 to-pink-500",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50",
    name: "أ. عبدالرحمن السلمي",
    role: "إداري الدعم والمتابعة",
    description: "تقديم الدعم الفني للمتدربين، متابعة سير العملية التدريبية على المنصة، وتقييم أداء المستفيدين.",
    phones: "0126811012 - 0126875085",
    ext: "101",
    linkTitle: "الدعم الإداري"
  }
];

export default function OrganizationalStructurePage() {
  const [activeSection, setActiveSection] = useState<string>(staffList[0].id);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-[calc(10vh+5rem)] font-sans" dir="rtl">
      
      {/* ═══════════════════════════════════════ HEADER ═══════════════════════════════════════ */}
      <section className="relative px-4 sm:px-6 mb-16 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
            <Network className="w-4 h-4 text-[#173A7C]" />
            <span className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">هيكلة واضحة واحترافية</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 mb-6 leading-[1.35] tracking-tight">
            الهيكلة التنظيمية <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C] inline-block mt-3">والأدوار والمسؤوليات</span>
          </h1>
          
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-[1.8] max-w-3xl mx-auto mb-10">
            {introduction.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> قيادة تربوية</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> دعم فني مستمر</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> تطوير رقمي</span>
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
                أقسام الفريق
              </h3>
              <div className="space-y-2">
                {staffList.map((p) => (
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
                      {p.linkTitle}
                    </span>
                    {activeSection === p.id && (
                      <motion.div layoutId="activeIndicator" className="w-1.5 h-1.5 rounded-full bg-[#173A7C]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-6 bg-gradient-to-br from-[#173A7C] to-[#2F66D6] rounded-3xl p-8 text-white text-center shadow-lg shadow-[#173A7C]/20">
              <Phone className="w-12 h-12 text-white/80 mx-auto mb-4" />
              <h4 className="font-black text-lg mb-2">الدعم الفني المباشر</h4>
              <p className="text-sm text-blue-100 font-medium opacity-90 leading-relaxed mb-6">
                فريقنا متواجد دائماً للرد على استفساراتكم وحل المشكلات التقنية عبر التحويلات المذكورة.
              </p>
              <Link 
                href="/contact"
                className="inline-block px-6 py-3 bg-white text-[#173A7C] font-bold text-sm rounded-xl hover:bg-slate-50 hover:-translate-y-1 transition-all shadow-sm"
              >
                صفحة اتصل بنا
              </Link>
            </div>
          </motion.div>

          {/* Staff List Cards */}
          <div className="w-full lg:w-2/3 space-y-6 lg:space-y-8 order-1 lg:order-2">
            {staffList.map((member, index) => {
              const Icon = member.icon;
              return (
                <motion.div
                  id={member.id}
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  onViewportEnter={() => setActiveSection(member.id)}
                  className={`relative bg-white rounded-[2.5rem] p-8 sm:p-12 border transition-all duration-500 overflow-hidden group ${
                    activeSection === member.id ? "border-[#173A7C]/20 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.12)] ring-1 ring-[#173A7C]/5" : "border-slate-100 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${member.color} opacity-[0.03] rounded-bl-full pointer-events-none transition-transform duration-700 group-hover:scale-150`} />
                  
                  <div className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
                    <div className={`w-16 h-16 shrink-0 rounded-2xl ${member.bgColor} flex items-center justify-center border border-white shadow-inner group-hover:-translate-y-1 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${member.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-800">{member.name}</h2>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-white border shadow-sm ${member.iconColor} border-slate-100`}>
                          <Briefcase className="w-4 h-4" />
                          {member.role}
                        </span>
                      </div>
                      
                      <p className="text-slate-500 text-[15.5px] leading-[2] font-medium mb-8 bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                        {member.description}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-center pt-2 border-t border-slate-100 border-dashed">
                        <div className="flex items-center gap-2.5 text-slate-600">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm font-bold tracking-wider" dir="ltr">{member.phones}</span>
                        </div>
                        <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <div className="flex items-center gap-2.5 text-[#173A7C]">
                          <span className="text-sm font-black bg-[#173A7C]/5 px-3 py-1 rounded-md border border-[#173A7C]/10">
                            تحويلة: <span className="font-bold tracking-wider" dir="ltr">{member.ext}</span>
                          </span>
                        </div>
                      </div>
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
