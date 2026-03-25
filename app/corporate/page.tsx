"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import {
  Building2, Users, BarChart3, Award, Shield,
  ArrowLeft, MessageSquare
} from "lucide-react";

const benefits = [
  { icon: Users, title: "تدريب مخصص", desc: "برامج مصممة خصيصاً لاحتياجات فريقك ومتطلبات مؤسستك." },
  { icon: BarChart3, title: "تقارير أداء", desc: "لوحة تحكم شاملة لقياس تقدم المتدربين وتقييم ROI." },
  { icon: Award, title: "شهادات معتمدة", desc: "شهادات رسمية لكل متدرب تعزز ملفه المهني." },
  { icon: Shield, title: "دعم مستمر", desc: "مدير حساب مخصص ودعم فني على مدار الساعة." },
];

const steps = [
  { num: "01", title: "التواصل", desc: "تواصل معنا لمناقشة احتياجاتك التدريبية" },
  { num: "02", title: "التصميم", desc: "نصمم برنامجاً تدريبياً مخصصاً لمؤسستك" },
  { num: "03", title: "التنفيذ", desc: "تنفيذ البرنامج مع أفضل المدربين المعتمدين" },
  { num: "04", title: "التقييم", desc: "تقارير أداء شاملة وقياس أثر التدريب" },
];

export default function CorporatePage() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden mb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgwLDAsMCwwLjA0KSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative text-center py-20 pb-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-20 h-20 mx-auto mb-8 rounded-[24px] bg-white border border-slate-100 shadow-sm flex items-center justify-center">
              <Building2 className="w-10 h-10 text-[#173A7C]" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
              حلول تدريبية <span className="gradient-text">للشركات</span>
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto mb-10 text-lg leading-relaxed font-medium">
              نقدم برامج تدريبية مخصصة للمؤسسات والشركات لتطوير كوادرها البشرية وتحقيق أهدافها الاستراتيجية.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/contact" size="lg" className="px-8 shadow-md shadow-[#173A7C]/10">
                تواصل معنا
                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              </Button>
              <Button href="/courses" variant="secondary" size="lg" className="px-8 font-bold text-slate-700">
                تصفح الدورات
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 -mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-slate-200 shadow-lg shadow-slate-200/50 rounded-[24px] p-8 text-center hover:-translate-y-2 transition-transform duration-300"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-[20px] bg-[#173A7C]/5 flex items-center justify-center group-hover:bg-[#173A7C] transition-colors">
                    <Icon className="w-8 h-8 text-[#173A7C]" />
                  </div>
                  <h3 className="font-black text-lg text-slate-900 mb-3">{b.title}</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">{b.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-[#173A7C] text-sm font-bold tracking-wide uppercase bg-[#173A7C]/5 px-4 py-1.5 rounded-full inline-block mb-4">
              آلية العمل
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">كيف <span className="gradient-text">نعمل</span>؟</h2>
          </div>
          
          <div className="space-y-6">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 flex items-center gap-6 sm:gap-8 hover:bg-white transition-colors group"
              >
                <div className="text-4xl sm:text-5xl font-black text-slate-200 shrink-0 font-sora group-hover:text-[#173A7C]/20 transition-colors">{s.num}</div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-base font-medium text-slate-500">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-[#173A7C] rounded-[32px] p-10 sm:p-14 relative overflow-hidden shadow-2xl shadow-[#173A7C]/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA2KSIvPjwvc3ZnPg==')] opacity-100" />
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">هل أنت مستعد لتطوير فريقك؟</h2>
            <p className="text-white/80 mb-10 text-lg font-medium max-w-lg mx-auto leading-relaxed">تواصل معنا اليوم واحصل على عرض مخصص لمؤسستك يتناسب مع احتياجاتك الخاصة وميزانيتك.</p>
            <Button href="/contact" className="bg-white text-[#173A7C] hover:bg-slate-50 hover:shadow-lg shadow-white/10 px-10 border-none font-black text-lg">طلب عرض سعر</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
