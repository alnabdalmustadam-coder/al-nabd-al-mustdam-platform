"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, CheckCircle2, ChevronRight, Award, Star, Users, BookOpen, Sparkles, Medal, PlayCircle, Globe2 } from "lucide-react";
import React, { useState } from "react";

// Placeholder Data for Trainers
const TRAINERS = [
  {
    id: 1,
    name: "د. أحمد العبدالله",
    title: "خبير أمن سيبراني ومعماري تقنية",
    description: "بخبرة تتجاوز 15 عاماً في قيادة المشاريع التقنية الكبرى وتقديم الاستشارات الأمنية، يركز د.أحمد على تأهيل جيل جديد من خبراء الأمن السيبراني.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["أمن سيبراني", "بنية تحتية", "إدارة تقنية"],
    category: "technology",
    stats: { rating: 4.9, students: "2.4K", courses: 12 }
  },
  {
    id: 2,
    name: "م. سارة الخالد",
    title: "مدرب معتمد لإدارة المشاريع PMP",
    description: "من أبرز رواد التدريب في مجال الإدارة المتقدمة، ساعدت مئات المتدربين على اجتياز الاختبارات الاحترافية بنجاح وقيادة مشاريعهم بكفاءة.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    cover: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["إدارة مشاريع", "PMP", "قيادة"],
    category: "management",
    stats: { rating: 5.0, students: "5.1K", courses: 8 }
  },
  {
    id: 3,
    name: "د. محمد حسن",
    title: "مستشار تطوير الأعمال والإدارة",
    description: "متخصص في تأسيس وتطوير الشركات الناشئة ووضع استراتيجيات النمو. ينقل د.محمد خبراته العميقة إلى غرف التدريب بأسلوب تفاعلي وتطبيقي.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    cover: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["إدارة أعمال", "تخطيط استراتيجي", "MBA"],
    category: "management",
    stats: { rating: 4.8, students: "3.2K", courses: 15 }
  },
  {
    id: 4,
    name: "أ. ريم السعود",
    title: "خبيرة اللغة الإنجليزية والآيلتس",
    description: "خبرة تدريبية دولية في تطوير مهارات اللغة الإنجليزية وتقنيات اجتياز اختبار IELTS بتفوق، باستخدام أحدث أساليب التدريس التفاعلية.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    cover: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["IELTS", "محادثة", "تطوير الذات"],
    category: "languages",
    stats: { rating: 4.9, students: "8.5K", courses: 20 }
  },
  {
    id: 5,
    name: "م. يوسف العتيبي",
    title: "خبير التسويق الرقمي واستراتيجيات النمو",
    description: "صانع حملات إعلانية ناجحة ومدير لعدة مشاريع تسويقية كبرى. يقدم خلاصة تجاربه في التسويق المبني على البيانات وأساليب النمو المتسارع.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    cover: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["تسويق رقمي", "SEO", "تحليل بيانات"],
    category: "technology",
    stats: { rating: 4.7, students: "4.8K", courses: 10 }
  },
  {
    id: 6,
    name: "أ. نورة الجاسر",
    title: "محللة بيانات وخبيرة ذكاء اصطناعي",
    description: "شغوفة بعلوم البيانات والذكاء الاصطناعي، وتعمل على تبسيط المفاهيم المعقدة وجعلها قابلة للتطبيق بأسلوب مليء بالابتكار والإلهام.",
    image: "https://images.unsplash.com/photo-1598550874175-4d0ef43ce418?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["الذكاء الاصطناعي", "Pyhton", "علم البيانات"],
    category: "technology",
    stats: { rating: 5.0, students: "1.9K", courses: 6 }
  }
];

const CATEGORIES = [
  { id: "all", label: "الكل" },
  { id: "technology", label: "تقنية وتكنولوجيا" },
  { id: "management", label: "الإدارة والأعمال" },
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
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
                className="group relative bg-white/40 backdrop-blur-[40px] rounded-[2.5rem] border border-white/60 shadow-[0_20px_50px_-10px_rgba(23,58,124,0.08)] hover:shadow-[0_40px_80px_-20px_rgba(23,58,124,0.15)] hover:-translate-y-2 transition-all duration-500 flex flex-col overflow-hidden ring-1 ring-white/80 isolate"
              >
                {/* 1. Cover Image */}
                <div className="relative h-44 w-full p-2">
                  <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-inner">
                    <img src={trainer.cover} alt="Cover" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#173A7C]/90 via-[#173A7C]/20 to-transparent mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-6 right-6 z-10 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
                    {CATEGORIES.find(c => c.id === trainer.category)?.label}
                  </div>
                </div>

                {/* 2. Avatar Overlapping */}
                <div className="relative flex justify-center -mt-16 z-20">
                  <div className="relative w-32 h-32 rounded-full border-[5px] border-white shadow-2xl overflow-hidden bg-slate-100 group-hover:border-[#F8FAFC] transition-colors duration-300">
                    <img 
                      src={trainer.image} 
                      alt={trainer.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-full"></div>
                  </div>
                  {/* Verified Badge */}
                  <div className="absolute bottom-1 right-8 bg-white rounded-full p-1 shadow-xl border border-slate-50 z-30 transform group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-5 h-5 text-[#5CB07C] drop-shadow-sm" fill="#fff" />
                  </div>
                </div>

                {/* 3. Content Body */}
                <div className="pt-5 pb-8 px-8 text-center flex-1 flex flex-col items-center">
                  <h3 className="text-2xl font-black text-slate-900 mb-1.5 group-hover:text-[#173A7C] transition-colors">{trainer.name}</h3>
                  <p className="text-[#5CB07C] font-bold text-sm mb-5 bg-[#5CB07C]/10 px-4 py-1.5 rounded-full">{trainer.title}</p>

                  {/* Key Stats Grid */}
                  <div className="flex items-center justify-center gap-6 w-full mb-6 pb-6 border-b border-slate-100/80">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1 text-slate-800 font-extrabold text-lg">
                        <span>{trainer.stats.rating}</span>
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium uppercase">التقييم</span>
                    </div>
                    <div className="w-[1px] h-8 bg-slate-100/80"></div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5 text-slate-800 font-extrabold text-lg">
                        <span>{trainer.stats.students}</span>
                        <Users className="w-4 h-4 text-[#173A7C]" />
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium uppercase">متدرب</span>
                    </div>
                    <div className="w-[1px] h-8 bg-slate-100/80"></div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5 text-slate-800 font-extrabold text-lg">
                        <span>{trainer.stats.courses}</span>
                        <BookOpen className="w-4 h-4 text-[#5CB07C]" />
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium uppercase">برنامج</span>
                    </div>
                  </div>

                  <p className="text-slate-500 text-[14.5px] font-medium leading-[1.8] mb-8 flex-1">
                    {trainer.description}
                  </p>

                  {/* 4. Footer Actions */}
                  <div className="w-full flex items-center justify-between mt-auto">
                    {/* Socials */}
                    <div className="flex items-center gap-2">
                      <a href="#" aria-label="LinkedIn Profile" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#0077B5] hover:text-white hover:border-[#0077B5] transition-all duration-300 hover:scale-110">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                      </a>
                      <a href="#" aria-label="Personal Website" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all duration-300 hover:scale-110">
                        <Globe2 className="w-4 h-4" />
                      </a>
                    </div>

                    {/* View Profile CTA */}
                    <button className="flex items-center justify-center h-10 px-5 bg-slate-50 text-[#173A7C] font-bold text-sm rounded-full group/btn hover:bg-[#173A7C] hover:text-white transition-colors duration-300">
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
