"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, CheckCircle2, ChevronRight, Award, Star, Users, BookOpen, Sparkles, Medal, PlayCircle, Globe2, MessageSquare, Target, HeartPulse, Building, TrendingUp, Coins, Brain } from "lucide-react";
import React, { useState } from "react";

// Real Trainer Data from Poster
const TRAINERS = [
  {
    id: 1,
    name: "المدرب عبد الرحمن المسعود",
    title: "خبير تطوير الكوادر الطبية والإدارة الإكلينيكية",
    description: "حاصل على بكالوريوس الطب والجراحة والبورد السعودي في طب الباطني. يقدم برامج تدريبية تعتمد على خبرة عملية وتطبيقات واقعية، بمحتوى علمي محدث واحترافي.",
    image: "/عبد الرحمان.webp", // User uploaded image
    cover: "https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?auto=format&fit=crop&q=80&w=800",
    courses: [
      { name: "مهارات التواصل الفعّال", icon: MessageSquare },
      { name: "مهارات اتخاذ القرار", icon: Target },
      { name: "القيادة الإكلينيكية", icon: Award },
      { name: "إدارة الضغوط النفسية", icon: HeartPulse }
    ],
    features: ["أون لاين & حضوري", "شهادات معتمدة"],
    category: "medical",
  },
  {
    id: 2,
    name: "المدرب عماد الجهني",
    title: "خبير في الإدارة الصحية وتطوير المؤسسات",
    description: "حاصل على ماجستير إدارة المستشفيات والخدمات الصحية، ودكتوراه في إدارة المستشفيات (أكاديمي). يقدم برامج تعتمد على خبرة عملية وتطبيقات واقعية بمحتوى علمي محدث واحترافي.",
    image: "/عماد الجهني.webp", // Will be uploaded in public/عماد الجهني.webp
    cover: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    courses: [
      { name: "الإدارات العليا", icon: TrendingUp },
      { name: "إدارة المستشفيات", icon: Building },
      { name: "مهارات القيادة المتقدمة", icon: Award },
      { name: "الإدارة المالية", icon: Coins }
    ],
    features: ["أون لاين & حضوري", "شهادات معتمدة"],
    category: "management",
  },
  {
    id: 3,
    name: "المدربة عهود ابو عطا الله",
    title: "خبيرة في علم الإجتماع وتطوير المهارات",
    description: "حاصلة على ماجستير علم اجتماع (علاج أسري وأسري)، خبيرة في علم الاجتماع وتطوير المهارات، وتقدم استشارات اجتماعية وأسرية متخصصة.",
    image: "/عهود.webp", // Will be uploaded in public/عهود.webp
    cover: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
    courses: [
      { name: "الذكاء العاطفي", icon: Brain },
      { name: "تعزيز الصحة في بيئة العمل", icon: HeartPulse },
      { name: "العلاج السلوكي المعرفي", icon: Brain },
      { name: "تطوير مهاراتي الاجتماعية", icon: Users }
    ],
    features: ["أون لاين & حضوري", "شهادات معتمدة"],
    category: "languages",
  }
];

const CATEGORIES = [
  { id: "all", label: "الكل" },
  { id: "medical", label: "القطاع الصحي والطبي" },
  { id: "management", label: "الإدارة والأعمال" },
  { id: "technology", label: "تقنية وتكنولوجيا" },
  { id: "languages", label: "اللغات والتطوير" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export default function TrainersPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTrainers = activeCategory === "all"
    ? TRAINERS
    : TRAINERS.filter(trainer => trainer.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F6FA] to-white pb-24 font-sans selection:bg-[#173A7C] selection:text-white" dir="rtl">

      {/* ═══════════════════════════════════════ HERO SECTION ═══════════════════════════════════════ */}
      <section className="relative w-full min-h-[100vh] flex flex-col items-center justify-center text-center overflow-hidden pt-32 pb-16">
        {/* Background Image & High-End Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="/bg.webp" alt="Training Background" className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-[#F8FAFC]/85 backdrop-blur-[12px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC]/40 via-transparent to-[#F8FAFC]"></div>
          {/* Subtle colored glow blobs */}
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#173A7C]/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#5CB07C]/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply animate-pulse" style={{ animationDuration: '10s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full flex flex-col items-center justify-center h-full px-4 sm:px-8"
        >
          {/* Glowing Badge */}
          <div className="relative group mb-8 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-r from-[#173A7C] to-[#5CB07C] rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/95 backdrop-blur-xl border border-white shadow-lg transition-transform hover:scale-105 duration-300">
              <Sparkles className="w-4 h-4 text-[#5CB07C]" strokeWidth={2.5} />
              <span className="text-sm font-black text-[#173A7C] tracking-wide uppercase">نخبة الكفاءات التدريبية</span>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[5rem] font-black text-slate-900 mb-8 leading-[1.2] tracking-tight">
            خبراء التدريب <br className="hidden sm:block" />
            <span className="relative inline-block mt-3">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] via-[#2A5298] to-[#5CB07C]">وصنّاع التميز المهني</span>
            </span>
          </h1>

          <p className="text-slate-600 text-lg sm:text-xl font-medium leading-[1.8] max-w-3xl mx-auto mb-16 drop-shadow-sm">
            نفتخر في منصة النبض المستدام بانتقاء أفضل الخبرات التدريبية والعملية على المستويين المحلي والدولي. صُممت برامجنا لتقدم على أيدي كوادر تعيش وتتنفس التميز والإبداع.
          </p>

          {/* Ultra Premium Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8 text-sm font-bold w-full max-w-5xl mx-auto">
            {[
              { label: "خبير ومدرب", value: "50+", icon: Users, color: "text-[#173A7C]", gradient: "from-[#173A7C]/20 via-[#173A7C]/5 to-transparent" },
              { label: "شهادات معتمدة", value: "100%", icon: Medal, color: "text-[#173A7C]", gradient: "from-[#173A7C]/20 via-[#173A7C]/5 to-transparent" },
              { label: "سنوات خبرة", value: "10+", icon: Star, color: "text-[#173A7C]", gradient: "from-[#173A7C]/20 via-[#173A7C]/5 to-transparent" },
              { label: "برنامج تدريبي", value: "120+", icon: PlayCircle, color: "text-[#173A7C]", gradient: "from-[#173A7C]/20 via-[#173A7C]/5 to-transparent" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1), duration: 0.7, ease: "easeOut" }}
                className="relative flex flex-col items-center justify-center p-8 bg-white/40 backdrop-blur-[40px] rounded-[2.5rem] border border-white/60 shadow-[0_20px_50px_-10px_rgba(23,58,124,0.08)] hover:shadow-[0_30px_60px_-15px_rgba(23,58,124,0.15)] hover:-translate-y-2 transition-all duration-500 group isolate overflow-hidden ring-1 ring-white/80"
              >
                {/* Flowing background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10`} />

                {/* Floating Glass Icon Box */}
                <div className="relative mb-6">
                  {/* Glowing orb behind icon */}
                  <div className={`absolute inset-0 bg-gradient-to-tr ${stat.gradient} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150`} />

                  <div className="relative w-16 h-16 bg-white/70 backdrop-blur-xl border border-white/90 rounded-[1.25rem] shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                    {/* Glossy top reflection */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/90 to-transparent opacity-80 pointer-events-none"></div>
                    <stat.icon className={`relative z-10 w-8 h-8 ${stat.color} drop-shadow-sm`} />
                  </div>
                </div>

                <span className={`text-4xl lg:text-5xl font-black mb-1 ${stat.color} drop-shadow-sm tracking-tight group-hover:scale-105 transition-transform duration-500`}>{stat.value}</span>
                <span className="text-slate-600 text-sm font-extrabold tracking-wide uppercase mt-1 opacity-90">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Ultra Premium Section Divider */}
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center justify-end h-32">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-t from-[#F8FAFC] to-transparent blur-xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-[#5CB07C]/10 blur-2xl rounded-t-full z-0" />
          <div className="absolute bottom-0 left-0 w-full h-[100px] bg-gradient-to-b from-transparent to-[#F8FAFC]/90" />

          <div className="relative w-full z-20">
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/80 to-transparent shadow-[0_0_15px_rgba(92,176,124,0.8)]"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 md:w-[70%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/90 to-transparent shadow-[0_0_18px_rgba(23,58,124,0.9)]"></div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ FILTER TABS ═══════════════════════════════════════ */}
      <section className="px-4 mb-20 pt-[10vh] relative z-20">
        <div className="max-w-fit mx-auto relative p-2 md:p-2.5 bg-white/40 backdrop-blur-[40px] rounded-[2rem] lg:rounded-full border border-white/60 shadow-[0_20px_50px_-10px_rgba(23,58,124,0.1)] ring-1 ring-white/80 flex flex-wrap items-center justify-center gap-2 md:gap-1.5">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`relative px-4 py-2.5 sm:px-7 sm:py-3.5 rounded-full text-sm sm:text-[15px] font-bold transition-all duration-300 whitespace-nowrap shrink-0 z-10 group overflow-hidden ${activeCategory === category.id
                ? "text-white"
                : "text-slate-600 hover:text-[#173A7C] hover:bg-white/50 hover:shadow-sm"
                }`}
            >
              {activeCategory === category.id && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-gradient-to-r from-[#173A7C] via-[#2A5298] to-[#173A7C] rounded-full shadow-[0_10px_25px_-5px_rgba(23,58,124,0.4)] border border-white/10 -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                >
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay"></div>
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-full pointer-events-none"></div>
                </motion.div>
              )}
              <span className="relative z-10">{category.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════ TRAINERS GRID ═══════════════════════════════════════ */}

      {/* Decorative Grid Background Elements */}
      <div className="absolute top-[85vh] left-0 w-full h-[150vh] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] -left-64 w-[500px] h-[500px] bg-[#5CB07C]/5 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-64 w-[600px] h-[600px] bg-[#173A7C]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
        <style>{`
          @keyframes borderMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10"
        >
          <AnimatePresence mode="popLayout">
            {filteredTrainers.map((trainer) => (
              <motion.div
                layout
                variants={itemVariants as any}
                initial="hidden"
                animate="visible"
                exit="exit"
                key={trainer.id}
                className="group relative rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(23,58,124,0.15)] hover:shadow-[0_40px_80px_-20px_rgba(23,58,124,0.25)] hover:-translate-y-2 transition-all duration-500 flex flex-col isolate min-h-[750px] w-full mt-3"
              >
                {/* Animated Border Gradient using Site Colors */}
                <div className="absolute -inset-[6px] rounded-[2.55rem] -z-30 opacity-70 group-hover:opacity-100 transition-opacity duration-500" style={{
                  background: 'linear-gradient(90deg, #173d82ff, #5CB07C, #2A5494, #6ED494, #173A7C, #ffffffff)',
                  backgroundSize: '200% 200%',
                  animation: 'borderMove 6s linear infinite'
                }}></div>

                {/* Trainer Background Image */}
                <div className="absolute inset-0 -z-20 bg-slate-100 rounded-[2.5rem] overflow-hidden">
                  <img src={trainer.image} alt={trainer.name} className="w-full h-full object-fill transform group-hover:scale-105 transition-transform duration-700" />
                  {/* Dark gradient from bottom - faded earlier to keep top light */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A162B] from-0% via-[#0A162B]/80 via-40% to-transparent to-70%"></div>
                </div>

                {/* Hanging Shield Logo Banner - small, curves over card edge */}
                <div className="absolute -top-3 left-15 z-20 w-[72px] h-[88px]" style={{ filter: 'drop-shadow(0 6px 14px rgba(23,58,124,0.18))' }}>
                  {/* SVG Shield: curved top folding over edge, pointed bottom */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 72 88" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 8C0 3.6 3.6 0 8 0H64C68.4 0 72 3.6 72 8V60C72 64 70 67.5 67 70L39 86.5C37.5 87.5 34.5 87.5 33 86.5L5 70C2 67.5 0 64 0 60V8Z" fill="white" stroke="#cbd5e1" strokeWidth="1" />
                  </svg>
                  {/* Logo centered inside */}
                  <img src="/logo.webp" alt="النبض المستدام" className="absolute top-3 left-1/2 -translate-x-1/2 w-11 h-11 object-contain z-10" />
                </div>

                <div className="absolute top-6 right-6 z-10 bg-[#173A7C]/80 backdrop-blur-md border border-white/20 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
                  {CATEGORIES.find(c => c.id === trainer.category)?.label}
                </div>

                {/* Premium Courses Tags (Right side, below category badge) */}
                <div className="absolute top-20 right-6 z-10 flex flex-col gap-2.5">
                  {trainer.courses?.map((course, idx) => {
                    const Icon = course.icon;
                    return (
                      <div key={idx} className="w-44 bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1.5 rounded-full border border-white/20 shadow-[0_8px_16px_rgba(0,0,0,0.1)] flex items-center gap-2 hover:bg-white/20 hover:scale-105 hover:pr-3.5 transition-all duration-300 cursor-default group/tag">
                        <div className="w-6 h-6 rounded-full bg-white/30 shadow-inner flex items-center justify-center shrink-0 group-hover/tag:bg-[#5CB07C]/30 transition-colors">
                          <Icon className="w-3.5 h-3.5 text-[#5CB07C] drop-shadow-sm" strokeWidth={2.5} />
                        </div>
                        <span className="truncate flex-1 text-right drop-shadow-md">{course.name}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Content Body (At the bottom, full width right aligned) */}
                <div className="relative z-10 pt-[40%] pb-8 px-8 sm:px-10 text-right flex flex-col mt-auto w-full">

                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 drop-shadow-md">{trainer.name}</h3>
                  <p className="text-[#5CB07C] font-extrabold text-sm mb-4 drop-shadow-md">{trainer.title}</p>

                  <p className="text-slate-300 text-sm font-medium leading-[1.8] mb-5 border-t border-b border-white/10 py-4">
                    {trainer.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-4 w-full mb-6">
                    {trainer.features?.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-white drop-shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-[#5CB07C]" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Actions */}
                  <div className="w-full flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <a href="#" aria-label="LinkedIn Profile" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-[#0077B5] hover:border-[#0077B5] transition-all duration-300 hover:scale-110">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                      </a>
                    </div>

                    <button className="flex items-center justify-center h-10 px-5 bg-[#5CB07C] text-white font-bold text-sm rounded-full group/btn hover:bg-emerald-600 transition-colors duration-300 shadow-lg">
                      <span>عرض الملف</span>
                      <ChevronRight className="w-4 h-4 mr-1 transition-transform group-hover/btn:-translate-x-1" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredTrainers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-32 text-center bg-white/50 backdrop-blur-md rounded-[3rem] border border-white mt-8"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <UserCheck className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">لا يوجد مدربين حالياً</h3>
            <p className="text-slate-500 font-medium">جاري تحديث قائمة الكفاءات في هذا التخصص. يرجى العودة لاحقاً.</p>
          </motion.div>
        )}
      </section>

      {/* ═══════════════════════════════════════ PHILOSOPHY CTA SECTION ═══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-32 relative z-10">
        <div className="relative rounded-[3rem] overflow-hidden shadow-[0_30px_80px_-20px_rgba(10,22,43,0.5)] border border-white/10 group bg-[#0A162B] isolate">

          {/* Ultra Premium Solid Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A162B] via-[#0E2242] to-[#173A7C] -z-20" />

          {/* The Slanted / Diagonal Shape */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#5CB07C]/10 via-transparent to-transparent opacity-60" />
          <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0,100 L100,0 L100,100 Z" fill="rgba(255,255,255,0.03)" />
            <path d="M0,100 L100,20 L100,100 Z" fill="rgba(92,176,124,0.05)" />
            {/* Glowing angled line */}
            <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="0.2" />
          </svg>

          {/* Ambient Glows */}
          <div className="absolute top-10 left-[20%] w-[400px] h-[400px] bg-[#173A7C]/50 rounded-full blur-[120px] -z-10 mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[10%] w-[350px] h-[350px] bg-[#5CB07C]/30 rounded-full blur-[120px] -z-10 mix-blend-screen" />

          {/* Content */}
          <div className="relative px-6 py-20 sm:p-24 flex flex-col items-center justify-center text-center">
            {/* Icon Glass Container */}
            <div className="w-20 h-20 mb-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(92,176,124,0.2)] flex items-center justify-center relative group-hover:-translate-y-2 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#5CB07C]/20 to-transparent rounded-2xl"></div>
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-2xl pointer-events-none"></div>
              <Award className="w-10 h-10 text-[#5CB07C] relative z-10" strokeWidth={1.5} />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-[1.3] tracking-tight">
              لا نُقدم التدريب فقط، <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-[#5CB07C] to-emerald-400 drop-shadow-sm mt-3 inline-block">بل نصنع قادة الغد</span>
            </h2>

            <p className="text-blue-100/80 text-lg sm:text-xl font-medium max-w-2xl leading-[1.8] mb-12">
              جميع خبرائنا يخضعون لمعايير تقييم صارمة تشمل الخبرة العملية، جودة التقديم، ومواكبة أحدث الممارسات العالمية لضمان تجربة تعليمية استثنائية وبناءة.
            </p>

            {/* Premium Button */}
            <button className="relative px-8 py-4 sm:px-10 sm:py-5 bg-white text-[#0A162B] font-black rounded-full hover:scale-105 transition-all duration-300 shadow-[0_15px_30px_rgba(0,0,0,0.2)] flex items-center gap-3 overflow-hidden group/btn hover:shadow-[0_20px_40px_rgba(92,176,124,0.3)] ring-1 ring-white/50">
              <div className="absolute inset-0 bg-gradient-to-r from-white via-slate-100 to-white group-hover/btn:opacity-0 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#5CB07C] to-[#173A7C] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>

              <span className="relative z-10 group-hover/btn:text-white transition-colors duration-300 text-base sm:text-lg">انضم لفريق الخبراء</span>
              <ChevronRight className="w-5 h-5 -scale-x-100 relative z-10 group-hover/btn:-translate-x-1 group-hover/btn:text-white transition-all duration-300" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
