"use client";

import { motion } from "framer-motion";
import { 
  Award, 
  BadgeCheck, 
  CheckCircle2, 
  BarChart3, 
  Briefcase, 
  ShieldCheck, 
  Cpu, 
  Users, 
  Building2, 
  Boxes, 
  Layers, 
  Target, 
  LineChart, 
  FileCheck2,
  FileText
} from "lucide-react";

interface TrackItem {
  id: number;
  name: string;
  category: string;
  icon: typeof Award;
  color: string;
  iconBg: string;
}

// Row 1: Core Professional Training Tracks (8 comprehensive tracks)
const row1: TrackItem[] = [
  { 
    id: 1, 
    name: "إدارة الجودة وتحسين العمليات", 
    category: "معايير الآيزو والكفاءة", 
    icon: Award,
    color: "text-[#0B3766]",
    iconBg: "bg-[#0B3766]/[0.08]"
  },
  { 
    id: 2, 
    name: "تحليل البيانات وذكاء الأعمال", 
    category: "لوحات التحكم ومؤشرات الأداء", 
    icon: BarChart3,
    color: "text-[#168AD3]",
    iconBg: "bg-[#168AD3]/[0.08]"
  },
  { 
    id: 3, 
    name: "إدارة المشاريع الاحترافية", 
    category: "منهجيات PMP والرشاقة Agile", 
    icon: Briefcase,
    color: "text-[#0B3766]",
    iconBg: "bg-[#0B3766]/[0.08]"
  },
  { 
    id: 4, 
    name: "الأمن السيبراني وحماية البيانات", 
    category: "أمن الشبكات والأنظمة المؤسسية", 
    icon: ShieldCheck,
    color: "text-[#19B6C7]",
    iconBg: "bg-[#19B6C7]/[0.08]"
  },
  { 
    id: 5, 
    name: "الذكاء الاصطناعي والإنتاجية", 
    category: "أتمتة الأعمال وسير العمل الذكي", 
    icon: Cpu,
    color: "text-[#0B3766]",
    iconBg: "bg-[#0B3766]/[0.08]"
  },
  { 
    id: 6, 
    name: "القيادة وإدارة فرق العمل", 
    category: "تطوير القيادات التنفيذية", 
    icon: Users,
    color: "text-[#168AD3]",
    iconBg: "bg-[#168AD3]/[0.08]"
  },
  { 
    id: 7, 
    name: "سلاسل الإمداد والخدمات اللوجستية", 
    category: "التخطيط وإدارة المخزون", 
    icon: Boxes,
    color: "text-[#0B3766]",
    iconBg: "bg-[#0B3766]/[0.08]"
  },
  { 
    id: 8, 
    name: "حوكمة تقنية المعلومات", 
    category: "معايير الامتثال المؤسسي", 
    icon: Layers,
    color: "text-[#19B6C7]",
    iconBg: "bg-[#19B6C7]/[0.08]"
  },
];

// Row 2: Institutional Capabilities & Corporate Services (8 comprehensive solutions)
const row2: TrackItem[] = [
  { 
    id: 9, 
    name: "برامج تدريب مخصصة للشركات", 
    category: "تصميم حقائب تدريبية موجهة", 
    icon: Building2,
    color: "text-[#0B3766]",
    iconBg: "bg-[#0B3766]/[0.08]"
  },
  { 
    id: 10, 
    name: "تقارير أداء ومتابعة تفاعلية", 
    category: "لوحات قياس تقدم وإنجاز الموظفين", 
    icon: LineChart,
    color: "text-[#168AD3]",
    iconBg: "bg-[#168AD3]/[0.08]"
  },
  { 
    id: 11, 
    name: "شهادات مهنية دولية معتمدة", 
    category: "اعتمادات مهنية معترف بها", 
    icon: FileCheck2,
    color: "text-[#0B3766]",
    iconBg: "bg-[#0B3766]/[0.08]"
  },
  { 
    id: 12, 
    name: "ورش عمل حضورية وتفاعلية", 
    category: "جلسات تدريب واقعية وتطبيقية", 
    icon: Users,
    color: "text-[#19B6C7]",
    iconBg: "bg-[#19B6C7]/[0.08]"
  },
  { 
    id: 13, 
    name: "استشارات قياس العائد التدريبي", 
    category: "قياس الأثر ROI بعد البرنامج", 
    icon: Target,
    color: "text-[#0B3766]",
    iconBg: "bg-[#0B3766]/[0.08]"
  },
  { 
    id: 14, 
    name: "بنك مشاريع واختبارات عملية", 
    category: "تطبيقات تحاكي بيئة العمل", 
    icon: FileText,
    color: "text-[#168AD3]",
    iconBg: "bg-[#168AD3]/[0.08]"
  },
  { 
    id: 15, 
    name: "تقييم الكفاءات وتحديد الفجوات", 
    category: "تحليل الاحتياج التدريبي الدقيق", 
    icon: BarChart3,
    color: "text-[#0B3766]",
    iconBg: "bg-[#0B3766]/[0.08]"
  },
  { 
    id: 16, 
    name: "دعم وتوجيه مهني مستمر", 
    category: "مرافقة الموظف بعد التخرج", 
    icon: Award,
    color: "text-[#19B6C7]",
    iconBg: "bg-[#19B6C7]/[0.08]"
  },
];

const renderCard = (track: TrackItem, key: string) => {
  const Icon = track.icon;
  return (
    <div
      key={key}
      dir="rtl"
      className="flex items-center gap-3.5 shrink-0 w-[245px] sm:w-[275px] md:w-[295px] px-4 sm:px-4.5 py-3.5 rounded-2xl relative overflow-hidden cursor-pointer group
                 liquid-glass-card border border-white/90 shadow-[0_4px_16px_rgba(11,55,102,0.1)]
                 hover:shadow-[0_16px_36px_-8px_rgba(11,55,102,0.18)]
                 hover:border-[#0B3766]/30 hover:-translate-y-1.5
                 transition-all duration-300 select-none"
    >
      {/* Specular gloss top sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[inherit] bg-gradient-to-b from-white/70 via-white/10 to-transparent z-0" />

      {/* Shimmer sweep on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-0" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-[#0B3766] via-[#19B6C7] to-[#0B3766] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Track Icon Container with verified badge */}
      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-[13px] ${track.iconBg} flex items-center justify-center shrink-0 border border-slate-200/80 group-hover:border-[#0B3766]/30 group-hover:scale-105 transition-all duration-300 relative z-10 shadow-xs`}>
        <Icon className={`w-5 h-5 ${track.color}`} strokeWidth={2} />
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#19B6C7] to-[#11A0B3] flex items-center justify-center border border-white shadow-xs">
          <BadgeCheck className="w-2 h-2 text-white" strokeWidth={3} />
        </div>
      </div>

      {/* Track Info */}
      <div className="flex flex-col relative z-10 min-w-0 flex-1 text-right">
        <span className="text-[12.5px] sm:text-[13.5px] font-bold text-slate-800 tracking-tight group-hover:text-[#0B3766] transition-colors duration-300 truncate">
          {track.name}
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <CheckCircle2 className="w-3 h-3 text-[#19B6C7] shrink-0" strokeWidth={2.5} />
          <span className="text-[10.5px] text-slate-500 font-medium tracking-wide truncate">
            {track.category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function PartnersLogos() {
  return (
    <section className="pt-20 sm:pt-24 pb-28 sm:pb-32 relative overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-white">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#0B3766]/[0.03] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#19B6C7]/[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* Section Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 sm:mb-16 relative z-10 px-4"
      >
        {/* Badge */}
        <span className="section-badge-glass mb-6">
          <Award className="w-4 h-4 text-[#19B6C7]" strokeWidth={2.5} />
          مسارات وتخصصات معتمدة
        </span>

        <h2 className="section-main-title-premium mt-3 mb-5">
          ثقة{" "}
          <span className="gradient-text">
            المؤسسات والكوادر المهنية
          </span>
        </h2>
        <p className="section-desc-premium max-w-xl mx-auto">
          برامج تدريبية متقدمة وحلول مؤسسية معتمدة لتمكين فرق العمل ورفع الكفاءة التشغيلية
        </p>

        {/* Decorative ornament */}
        <div className="mt-7 flex items-center justify-center gap-2">
          <div className="w-16 h-[2px] rounded-full bg-gradient-to-r from-transparent to-[#0B3766]/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#0B3766] to-[#19B6C7] shadow-sm" />
          <div className="w-16 h-[2px] rounded-full bg-gradient-to-l from-transparent to-[#19B6C7]/30" />
        </div>
      </motion.div>

      {/* Contained Marquee with Side Margins — Pure & Clean, Zero White Aura, Zero Frame/Border */}
      <div className="max-w-5xl lg:max-w-6xl mx-auto w-full px-4 sm:px-8 lg:px-12 relative z-10 overflow-hidden">
        <div className="space-y-4 sm:space-y-5 py-2">
          {/* Row 1 — Moving Horizontally (Forward) */}
          <div className="partners-marquee-window py-1.5" dir="ltr">
            <div className="partners-marquee-track partners-marquee-forward gap-3.5 sm:gap-5 py-2 px-1">
              {[...row1, ...row1].map((track, index) =>
                renderCard(track, `row1-${index}`)
              )}
            </div>
          </div>

          {/* Row 2 — Moving Horizontally in Opposite Direction (Reverse) */}
          <div className="partners-marquee-window py-1.5" dir="ltr">
            <div className="partners-marquee-track partners-marquee-reverse gap-3.5 sm:gap-5 py-2 px-1">
              {[...row2, ...row2].map((track, index) =>
                renderCard(track, `row2-${index}`)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center justify-end h-16">
        <div className="relative w-full z-20">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#19B6C7]/60 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 md:w-[70%] h-[3px] bg-gradient-to-r from-transparent via-[#0B3766]/70 to-transparent"></div>
        </div>
      </div>
    </section>
  );
}
