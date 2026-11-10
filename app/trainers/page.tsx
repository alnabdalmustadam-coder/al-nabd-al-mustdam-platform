"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck, CheckCircle2, ChevronRight, Award, Star, Users,
  BookOpen, GraduationCap, Medal, PlayCircle, Target,
  MessageSquare, Shield, Brain
} from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";

const SEED_TRAINERS = [
  {
    id: 'demo-trainer-1',
    name: 'سارة ناصر',
    title: 'الجودة وتحسين العمليات',
    description: 'تربط أدوات القياس ومعايير الجودة بأمثلة تطبيقية من بيئة العمل المؤسسي.',
    initials: 'س',
    courses: [
      { name: 'إدارة الجودة وتحسين العمليات', icon: Target },
      { name: 'إدارة المشاريع والتنفيذ', icon: BookOpen }
    ],
    features: ['دورات مهنية معتمدة', 'تطبيقات عملية'],
    category: 'management'
  },
  {
    id: 'demo-trainer-2',
    name: 'نورة علي',
    title: 'مهارات فرق العمل والقيادة',
    description: 'تقدّم أمثلة تطبيقية للتواصل الفعّال وإدارة فرق العمل وحل النزاعات المهنية.',
    initials: 'ن',
    courses: [
      { name: 'التواصل الفعّال وإدارة فرق العمل', icon: MessageSquare },
      { name: 'كتابة التقارير والعروض المهنية', icon: BookOpen }
    ],
    features: ['تمارين تفاعلية', 'ورش عمل تطبيقية'],
    category: 'management'
  },
  {
    id: 'demo-trainer-3',
    name: 'م. فيصل الشمري',
    title: 'الأمن السيبراني والتحول الرقمي',
    description: 'خبير واستشاري في أمن المعلومات وحماية البنية الرقمية وحوكمة الأنظمة المؤسسية.',
    initials: 'ف',
    courses: [
      { name: 'أساسيات الأمن السيبراني في بيئة العمل', icon: Shield },
      { name: 'الذكاء الاصطناعي والإنتاجية المهنية', icon: Brain }
    ],
    features: ['محاكاة واختبارات حية', 'شهادات احترافية'],
    category: 'technology'
  },
];

const CATEGORIES = [
  { id: "all", label: "جميع التخصصات" },
  { id: "management", label: "الإدارة والأعمال" },
  { id: "technology", label: "التقنية والأمن السيبراني" },
  { id: "languages", label: "المهارات والتطوير" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
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
  const [trainersList, setTrainersList] = useState<any[]>(SEED_TRAINERS);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await fetch('/api/trainers');
        const data = await res.json();
        if (data.success && Array.isArray(data.trainers) && data.trainers.length > 0) {
          const fallbackIcons = [Target, MessageSquare, Shield, Brain, BookOpen];

          const mapped = data.trainers.map((t: any, idx: number) => {
            const mappedCourses = (t.courses || []).map((c: any, cIdx: number) => ({
              name: c.name,
              icon: fallbackIcons[cIdx % fallbackIcons.length],
            }));

            const initial = t.name ? t.name.replace(/^(د\.|م\.|أ\.)\s*/, '').charAt(0) : 'م';

            return {
              id: t.id,
              name: t.name,
              title: t.title || 'تطوير مهني واستشارات',
              description: t.description || 'تدريب تطبيقي يربط المفاهيم النظرية بالتطبيق الميداني في بيئة العمل.',
              initials: initial,
              courses: mappedCourses.length > 0 ? mappedCourses : (
                idx === 2 ? [
                  { name: 'أساسيات الأمن السيبراني في بيئة العمل', icon: Shield },
                  { name: 'الذكاء الاصطناعي والإنتاجية المهنية', icon: Brain }
                ] : [
                  { name: "برامج تدريبية معتمدة", icon: Award },
                  { name: "تطوير مهني احترافي", icon: Target }
                ]
              ),
              features: t.features || ["دورات مهنية معتمدة", "تطبيقات عملية"],
              category: t.name.includes('فيصل') ? 'technology' : (t.category || "management"),
            };
          });

          setTrainersList(mapped);
        }
      } catch (err) {
        console.error('Failed to load public trainers from API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  const filteredTrainers = activeCategory === "all"
    ? trainersList
    : trainersList.filter(trainer => trainer.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-[#EEF4F9]/50 to-[#FFFFFF] pb-24 font-[family-name:var(--font-cairo)] overflow-x-clip" dir="rtl">

      {/* ═══════════════════════════════════════ HERO SECTION ═══════════════════════════════════════ */}
      <section className="relative w-full pt-24 sm:pt-32 pb-16 text-center overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden z-0">
          <img src="/bg.webp" alt="" className="w-full h-full object-cover" />
        </div>

        {/* Ambient Brand Glows */}
        <div className="absolute -top-24 -right-20 w-[550px] h-[550px] bg-[#0B3766]/[0.08] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-[#19B6C7]/[0.07] rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-badge-glass mb-4 sm:mb-5 inline-flex items-center gap-1.5 px-4 py-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#19B6C7]" />
              نخبة الكفاءات والخبراء التدريبيين
            </span>

            <h1 className="hero-main-title-premium text-3xl sm:text-4xl lg:text-5xl mb-4 text-[#0B3766]">
              خبراء التدريب <span className="gradient-text">وصنّاع التميز المهني</span>
            </h1>

            <p className="section-desc-premium max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed mb-10">
              نفتخر في منصة مَدار بانتقاء أفضل الخبرات التدريبية المعتمدة لتقديم برامج نوعية تلبي متطلبات سوق العمل وترفع كفاءة الكوادر المؤسسية.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {[
              { label: "خبير ومدرب", value: "50+", icon: Users },
              { label: "شهادات إتمام", value: "100%", icon: Medal },
              { label: "سنوات خبرة", value: "10+", icon: Star },
              { label: "برنامج تدريبي", value: "76+", icon: PlayCircle }
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all"
              >
                <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-[#0B3766]/[0.06] text-[#0B3766] flex items-center justify-center">
                  <stat.icon className="w-4.5 h-4.5" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[#0B3766] leading-tight tabular-nums">{stat.value}</div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-bold mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Bottom Hairline */}
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center justify-end h-10">
          <div className="w-[85%] md:w-[92%] h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════ FILTER TABS ═══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5" role="group" aria-label="تصنيفات المدربين">
          {CATEGORIES.map((category) => {
            const active = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                  active
                    ? "bg-[#0B3766] text-white shadow-md shadow-[#0B3766]/20 border border-[#0B3766]"
                    : "bg-white text-slate-600 hover:text-[#0B3766] hover:bg-[#F3F9FE] border border-slate-200/80 shadow-xs"
                }`}
              >
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════ TRAINERS GRID (Light & Platform Theme) ═══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-fr"
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
                className="group relative bg-white rounded-[2rem] border border-[#0B3766]/12 shadow-[0_12px_36px_-15px_rgba(11,55,102,0.1)] hover:shadow-[0_24px_55px_-15px_rgba(11,55,102,0.18)] hover:-translate-y-1.5 transition-all duration-400 overflow-hidden flex flex-col justify-between p-6 sm:p-7"
              >
                {/* Top accent hairline */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#0B3766] via-[#168AD3] to-[#19B6C7] opacity-80 group-hover:opacity-100 transition-opacity" />

                {/* Top Header: Brand Logo + Category Tag */}
                <div className="flex items-center justify-between w-full mb-4">
                  <div className="flex items-center gap-1.5">
                    <img
                      src="/madar-learning-logo-compact.svg"
                      alt="المدار ليرنينج"
                      className="h-7 w-auto object-contain"
                    />
                  </div>

                  <span className="text-[11px] font-bold text-[#0B3766] bg-[#0B3766]/[0.06] border border-[#0B3766]/12 px-3 py-1 rounded-full">
                    {CATEGORIES.find(c => c.id === trainer.category)?.label || "مدرب معتمد"}
                  </span>
                </div>

                {/* Trainer Avatar & Identity */}
                <div className="text-center my-3">
                  <div className="w-22 h-22 mx-auto mb-3.5 rounded-2xl bg-gradient-to-br from-[#0B3766] via-[#168AD3] to-[#0B6589] text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-[#0B3766]/20 ring-4 ring-[#168AD3]/15 group-hover:scale-105 transition-transform duration-400">
                    <span>{trainer.initials || trainer.name.charAt(0)}</span>
                  </div>

                  <h3 className="text-xl sm:text-[22px] font-bold text-[#0B3766] mb-1">
                    {trainer.name}
                  </h3>

                  <p className="text-xs sm:text-[13px] font-bold text-[#168AD3] mb-3">
                    {trainer.title}
                  </p>

                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-sm mx-auto line-clamp-2 mb-4">
                    {trainer.description}
                  </p>
                </div>

                {/* Assigned Courses Section */}
                <div className="space-y-2 mb-4 flex-1">
                  <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#19B6C7]" />
                    <span>المسارات والبرامج التدريبية:</span>
                  </div>

                  {trainer.courses?.slice(0, 2).map((course: any, idx: number) => {
                    const Icon = course.icon || BookOpen;
                    return (
                      <div
                        key={idx}
                        className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-[#0B3766] flex items-center gap-2 group-hover:border-[#168AD3]/30 transition-colors"
                      >
                        <div className="w-5 h-5 rounded-lg bg-[#0B3766]/10 text-[#0B3766] flex items-center justify-center shrink-0">
                          <Icon className="w-3 h-3 text-[#19B6C7]" />
                        </div>
                        <span className="truncate flex-1">{course.name}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Features Badges */}
                <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-100 mb-4 text-[11px] font-bold text-slate-500">
                  {trainer.features?.map((feature: any, idx: number) => (
                    <span key={idx} className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#19B6C7]" />
                      <span>{feature}</span>
                    </span>
                  ))}
                </div>

                {/* Footer Action Button */}
                <Link
                  href="/courses"
                  className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-[#0B3766] to-[#168AD3] hover:from-[#168AD3] hover:to-[#0B3766] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md"
                >
                  <span>استعراض دورات المدرب</span>
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════ PHILOSOPHY CTA SECTION ═══════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-20 relative z-10">
        <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(11,55,102,0.15)] border border-[#0B3766]/15 bg-gradient-to-br from-[#0B3766] via-[#104882] to-[#168AD3] text-white text-center p-8 sm:p-14">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Award className="w-7 h-7 text-[#19B6C7]" />
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            لا نُقدم التدريب فقط، <span className="text-[#19B6C7]">بل نصنع قادة الغد</span>
          </h2>

          <p className="text-slate-200 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-8">
            جميع خبرائنا يخضعون لمعايير تقييم صارمة تشمل الخبرة العملية، جودة التقديم، ومواكبة أحدث الممارسات العالمية لضمان تجربة تعليمية استثنائية وبناءة.
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#0B3766] font-bold text-sm rounded-full shadow-md hover:bg-slate-50 hover:scale-[1.02] transition-all"
          >
            <span>انضم لفريق الخبراء</span>
            <ChevronRight className="w-4 h-4 rtl:rotate-180 text-[#168AD3]" />
          </Link>
        </div>
      </section>

    </div>
  );
}
