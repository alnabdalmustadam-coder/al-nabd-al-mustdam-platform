"use client";

import { motion } from "framer-motion";
import { Award, Users, Clock, HeadphonesIcon, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: Award,
    title: "مدربون معتمدون",
    description: "نخبة من المدربين المعتمدين دولياً بخبرات تزيد عن 15 عاماً في مجالاتهم لضمان أعلى جودة تعليمية.",
    color: "emerald",
  },
  {
    icon: Users,
    title: "شهادات معتمدة",
    description: "شهادات معترف بها دولياً وإقليمياً تعزز سيرتك الذاتية وتفتح لك آفاقاً مهنية جديدة وواسعة.",
    color: "blue",
  },
  {
    icon: Clock,
    title: "تعلم مرن",
    description: "دورات وباقات مصممة خصيصاً لتتناسب مع جدولك. تعلم في أي وقت وبالسرعة التي تتوافق معك.",
    color: "emerald",
  },
  {
    icon: HeadphonesIcon,
    title: "دعم مستمر",
    description: "فريق دعم متاح لمساعدتك في رحلتك التعليمية من البداية وحتى بعد التخرج والانضمام للعمل.",
    color: "blue",
  },
];

const colorMap: Record<string, { bg: string; text: string; glow: string; border: string }> = {
  emerald: { 
    bg: "bg-gradient-to-br from-white to-[#5CB07C]/10 group-hover:bg-white", 
    text: "text-[#5CB07C]", 
    glow: "shadow-sm group-hover:shadow-[0_8px_25px_rgba(92,176,124,0.25)]",
    border: "border-slate-100 ring-[#5CB07C]/10 group-hover:border-[#5CB07C]/30"
  },
  blue: { 
    bg: "bg-gradient-to-br from-white to-[#173A7C]/10 group-hover:bg-white", 
    text: "text-[#173A7C]", 
    glow: "shadow-sm group-hover:shadow-[0_8px_25px_rgba(23,58,124,0.25)]",
    border: "border-slate-100 ring-[#173A7C]/10 group-hover:border-[#173A7C]/30"
  },
};

export default function WhyUsSection() {
  return (
    <section className="pt-32 pb-44 relative bg-gradient-to-br from-white via-slate-50 to-[#173A7C]/5 overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-0 right-0 -m-32 w-[600px] h-[600px] bg-[#173A7C]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -m-32 w-[600px] h-[600px] bg-[#5CB07C]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Editorial Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 relative"
        >
          <span className="inline-flex items-center justify-center gap-2 text-[#173A7C] text-sm font-black tracking-widest uppercase bg-white px-5 py-2 rounded-full mb-6 border border-slate-200 shadow-sm max-w-max mx-auto">
            <CheckCircle2 className="w-4 h-4 text-[#5CB07C]" />
            لماذا النبض المستدام؟
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#173A7C] mt-2 leading-[1.2] tracking-tight">
            تميّز يصنع <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">الفرق</span>
          </h2>
          <p className="mt-6 text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            نحن لا نقدم مجرد دورات، بل نصنع تجربة تعليمية متكاملة تضعك على طريق النجاح المهني بأحدث الأساليب والمعايير العالمية.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            const colors = colorMap[feat.color];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative group h-full"
              >
                {/* Navy Gradient Card */}
                <div className="h-full bg-gradient-to-br from-[#173A7C] via-[#1a4490] to-[#1e5a6e] rounded-[2rem] p-8 text-start border border-white/15 ring-1 ring-inset ring-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_40px_80px_-15px_rgba(23,58,124,0.35)] hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col relative">
                  
                  {/* Top Accent Stripe */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#5CB07C] to-transparent opacity-60" />

                  {/* Corner Glow */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#5CB07C]/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Icon Container */}
                  <div className="w-16 h-16 mb-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-white/20 group-hover:shadow-[0_8px_25px_rgba(92,176,124,0.2)] relative z-10">
                    <Icon className="w-8 h-8 text-white transition-all duration-500" strokeWidth={1.5} />
                  </div>
                  
                  {/* Header */}
                  <h3 className="text-xl font-black text-white relative z-10 mb-5 pb-5 border-b border-white/10">
                    {feat.title}
                  </h3>
                  
                  {/* Body Text */}
                  <p className="text-[14.5px] text-white/70 leading-[1.8] relative z-10 flex-grow font-medium">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Ultra Premium Section Divider */}
      <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center justify-end h-32">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-t from-white to-transparent blur-xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-[#5CB07C]/10 blur-2xl rounded-t-full z-0" />
        <div className="absolute bottom-0 left-0 w-full h-[100px] bg-gradient-to-b from-transparent to-white/70" />

        <div className="relative w-full z-20">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/80 to-transparent shadow-[0_0_15px_rgba(92,176,124,0.8)]"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 md:w-[70%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/90 to-transparent shadow-[0_0_18px_rgba(23,58,124,0.9)]"></div>
        </div>
      </div>
    </section>
  );
}
