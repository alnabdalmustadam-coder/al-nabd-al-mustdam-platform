"use client";

import { motion } from "framer-motion";
import { Target, Eye, Heart, Award, Users, BookOpen, Globe } from "lucide-react";

const values = [
  { icon: Award, title: "الجودة", desc: "نلتزم بأعلى معايير الجودة في المحتوى والتقديم" },
  { icon: Heart, title: "الشغف", desc: "نؤمن بأن التعليم رسالة قبل أن يكون مهنة" },
  { icon: Users, title: "التمكين", desc: "نسعى لتمكين كل متدرب من تحقيق أهدافه" },
  { icon: Globe, title: "الانفتاح", desc: "نواكب أحدث المنهجيات والتقنيات العالمية" },
];

const achievements = [
  { value: "15+", label: "سنة خبرة" },
  { value: "5000+", label: "متدرب" },
  { value: "50+", label: "دورة" },
  { value: "100+", label: "شركة شريكة" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden mb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgwLDAsMCwwLjA0KSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center py-20 pb-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[#173A7C] text-sm font-bold tracking-wide uppercase bg-[#173A7C]/5 px-4 py-1.5 rounded-full inline-block mb-4">
              من نحن
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight">
              عن <span className="gradient-text">النبض المستدام</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
              منصة تعليمية رائدة نشأت من رحم خبرة تزيد عن 15 عاماً في التدريب المهني والتقني.
              نؤمن بأن كل فرد يستحق فرصة حقيقية لتطوير مهاراته والوصول إلى التميز.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 -mt-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-[32px] p-10 sm:p-14">
            <h2 className="text-3xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-4 inline-block">قصتنا</h2>
            <div className="space-y-6 text-slate-600 leading-relaxed text-lg font-medium">
              <p>
                بدأت رحلتنا من إيمان عميق بأن التعليم هو المحرك الأساسي للتنمية المستدامة.
                أسسنا النبض المستدام ليكون جسراً يربط بين الطموح والفرصة، بين المعرفة والتطبيق.
              </p>
              <p>
                على مدار أكثر من 15 عاماً، قمنا بتدريب آلاف المتدربين في مجالات التقنية والإدارة واللغات،
                محققين نسبة رضا تتجاوز 95%. اليوم، نفخر بأننا الخيار الأول للأفراد والمؤسسات
                الباحثين عن تدريب مهني عالي الجودة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-10 hover:shadow-md transition-shadow"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#173A7C]/5 flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-[#173A7C]" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">رسالتنا</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              تقديم تجربة تعليمية متميزة تمكّن الأفراد والمؤسسات من اكتساب المهارات
              اللازمة للنجاح في سوق العمل المعاصر، مع التركيز على الجودة والابتكار.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-10 hover:shadow-md transition-shadow"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
              <Eye className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">رؤيتنا</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              أن نكون المنصة التعليمية العربية الأولى عالمياً، مُلهِمين مجتمعاً من المتعلمين
              المستدامين الذين يقودون التغيير الإيجابي في بيئاتهم المهنية والمجتمعية.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-[#173A7C] text-sm font-bold tracking-wide uppercase bg-[#173A7C]/5 px-4 py-1.5 rounded-full inline-block mb-4">
              مبادئنا
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">قيمنا<span className="text-[#173A7C]"> الأساسية</span></h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-50 border border-slate-200 shadow-sm rounded-2xl p-8 text-center hover:bg-white hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="w-14 h-14 mx-auto mb-4 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center">
                    <Icon className="w-7 h-7 text-[#173A7C]" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-3">{v.title}</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] rounded-[32px] p-12 sm:p-16 shadow-2xl shadow-[#173A7C]/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjE1KSIvPjwvc3ZnPg==')] opacity-100" />
            
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
              {achievements.map((a, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="text-4xl font-black text-white mb-2 font-sora">{a.value}</div>
                  <div className="text-sm font-semibold text-white/80">{a.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
