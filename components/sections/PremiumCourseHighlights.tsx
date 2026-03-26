"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ShieldAlert, 
  Search, 
  Cloud, 
  Terminal, 
  FileText, 
  Table, 
  Database, 
  Palette,
  ArrowRight,
  MonitorPlay,
  Sparkles
} from "lucide-react";

// The 8 Corporate Courses Data with accent colors for variety
const corporateCourses = [
  {
    id: 1,
    title: "التدريب على سيسكو للأمن السيبراني Cisco Certified CyberOps Associate",
    icon: ShieldAlert,
    slug: "cisco-cyberops",
    accent: "from-[#173A7C] to-[#2a5eb5]",
    iconBg: "bg-[#173A7C]/[0.08]",
    iconColor: "text-[#173A7C]"
  },
  {
    id: 2,
    title: "التدريب على مهارات مدقق نظم معلومات معتمد Certified Information Systems Auditor",
    icon: Search,
    slug: "cisa",
    accent: "from-[#5CB07C] to-[#3d8a5a]",
    iconBg: "bg-[#5CB07C]/[0.08]",
    iconColor: "text-[#5CB07C]"
  },
  {
    id: 3,
    title: "التدريب على أساسيات مايكروسوفت أزور Microsoft Azure Fundamentals",
    icon: Cloud,
    slug: "azure-fundamentals",
    accent: "from-[#0078D4] to-[#005A9E]",
    iconBg: "bg-[#0078D4]/[0.08]",
    iconColor: "text-[#0078D4]"
  },
  {
    id: 4,
    title: "التدريب على اساسيات لينكس كومبتيا",
    icon: Terminal,
    slug: "comptia-linux",
    accent: "from-[#173A7C] to-[#5CB07C]",
    iconBg: "bg-[#173A7C]/[0.08]",
    iconColor: "text-[#173A7C]"
  },
  {
    id: 5,
    title: "مايكروسوفت اكسل",
    icon: Table,
    slug: "microsoft-excel",
    accent: "from-[#217346] to-[#185C37]",
    iconBg: "bg-[#217346]/[0.08]",
    iconColor: "text-[#217346]"
  },
  {
    id: 6,
    title: "مايكروسوفت وورد",
    icon: FileText,
    slug: "microsoft-word",
    accent: "from-[#2B579A] to-[#1a3d6e]",
    iconBg: "bg-[#2B579A]/[0.08]",
    iconColor: "text-[#2B579A]"
  },
  {
    id: 7,
    title: "التدريب على برمجة فيجوال بيسك دوت نت وقواعد البيانات",
    icon: Database,
    slug: "vbnet-databases",
    accent: "from-[#173A7C] to-[#2a5eb5]",
    iconBg: "bg-[#173A7C]/[0.08]",
    iconColor: "text-[#173A7C]"
  },
  {
    id: 8,
    title: "التدريب على برنامج فوتوشوب",
    icon: Palette,
    slug: "photoshop",
    accent: "from-[#31A8FF] to-[#001E36]",
    iconBg: "bg-[#31A8FF]/[0.08]",
    iconColor: "text-[#31A8FF]"
  }
];

export default function PremiumCourseHighlights() {
  return (
    <section className="py-28 relative overflow-hidden bg-gradient-to-b from-white via-slate-50/80 to-white">
      {/* Background Decor — Premium */}
      <div className="absolute top-0 right-0 -m-32 w-[500px] h-[500px] bg-[#173A7C]/[0.05] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -m-32 w-[400px] h-[400px] bg-[#5CB07C]/[0.06] rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#173A7C]/[0.03] rounded-full blur-[160px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center justify-center gap-2.5 text-[#173A7C] text-sm font-black tracking-wider uppercase bg-gradient-to-r from-[#173A7C]/[0.06] to-[#5CB07C]/[0.06] px-6 py-2.5 rounded-full mb-6 border border-[#173A7C]/10 shadow-sm max-w-max mx-auto">
            <Sparkles className="w-4 h-4 text-[#5CB07C]" strokeWidth={2.5} />
            تدريب المؤسسات
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mt-2 mb-5 leading-tight">
            أحدث دورات <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">الشركات</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-base font-medium">
            برامج تدريبية متخصصة مصممة لتطوير كفاءات فريق عملك
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {corporateCourses.map((course, idx) => {
            const Icon = course.icon;
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative"
              >
                <Link href={`/courses/${course.slug}`} className="block h-full">
                  {/* Outer glow on hover */}
                  <div className={`absolute -inset-[1px] rounded-[2rem] bg-gradient-to-br ${course.accent} opacity-0 group-hover:opacity-[0.12] blur-sm transition-opacity duration-500 z-0`}></div>
                  
                  {/* Card */}
                  <div className="relative bg-white rounded-[1.75rem] p-7 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] group-hover:shadow-[0_20px_60px_-10px_rgba(23,58,124,0.18)] group-hover:border-slate-200 hover:-translate-y-2 transition-all duration-500 overflow-hidden z-10 h-full flex flex-col text-start">
                    
                    {/* Top accent gradient bar */}
                    <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${course.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                    {/* Decorative corner gradient */}
                    <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${course.accent} opacity-[0.03] group-hover:opacity-[0.07] rounded-full blur-2xl transition-opacity duration-700`}></div>

                    {/* Icon area */}
                    <div className="flex items-start justify-between w-full mb-6 relative z-10">
                      <div className={`w-14 h-14 rounded-2xl ${course.iconBg} ${course.iconColor} flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-500 border border-black/[0.03]`}>
                        <Icon className="w-7 h-7" strokeWidth={1.8} />
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <MonitorPlay className="w-3 h-3" strokeWidth={2.5} />
                        مؤسسات
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-[1.05rem] leading-[1.7] font-bold text-slate-800 group-hover:text-slate-900 transition-colors relative z-10 mb-auto pb-5">
                      {course.title}
                    </h3>

                    {/* Separator */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-5"></div>

                    {/* CTA Button */}
                    <div className="w-full relative z-10">
                      <div className="w-full bg-slate-50 text-slate-600 border border-slate-200 text-[13px] font-bold py-3 px-4 rounded-xl flex items-center justify-between group-hover:bg-[#173A7C] group-hover:text-white group-hover:border-[#173A7C] transition-all duration-500 shadow-sm group-hover:shadow-[0_8px_25px_rgba(23,58,124,0.25)]">
                        <span>اشترك الآن</span>
                        <div className="w-7 h-7 rounded-lg bg-white/20 group-hover:bg-white/25 flex items-center justify-center shadow-sm transition-all duration-500">
                          <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a
            href="/corporate-courses"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white border border-[#173A7C] transition-all duration-300 text-sm font-bold px-8 py-4 rounded-full shadow-[0_4px_15px_rgba(23,58,124,0.25)] hover:shadow-[0_8px_30px_rgba(23,58,124,0.35)] hover:-translate-y-0.5 group/btn"
          >
            جميع دورات الشركات
            <ArrowRight className="w-4 h-4 rtl:-scale-x-100 group-hover/btn:-translate-x-1 transition-transform" />
          </a>
        </motion.div>

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
