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
  MonitorPlay
} from "lucide-react";

// The 8 Corporate Courses Data
const corporateCourses = [
  {
    id: 1,
    title: "التدريب على سيسكو للأمن السيبراني Cisco Certified CyberOps Associate",
    icon: ShieldAlert,
    slug: "cisco-cyberops"
  },
  {
    id: 2,
    title: "التدريب على مهارات مدقق نظم معلومات معتمد Certified Information Systems Auditor",
    icon: Search,
    slug: "cisa"
  },
  {
    id: 3,
    title: "التدريب على أساسيات مايكروسوفت أزور Microsoft Azure Fundamentals",
    icon: Cloud,
    slug: "azure-fundamentals"
  },
  {
    id: 4,
    title: "التدريب على اساسيات لينكس كومبتيا",
    icon: Terminal,
    slug: "comptia-linux"
  },
  {
    id: 5,
    title: "مايكروسوفت اكسل",
    icon: Table,
    slug: "microsoft-excel"
  },
  {
    id: 6,
    title: "مايكروسوفت وورد",
    icon: FileText,
    slug: "microsoft-word"
  },
  {
    id: 7,
    title: "التدريب على برمجة فيجوال بيسك دوت نت وقواعد البيانات",
    icon: Database,
    slug: "vbnet-databases"
  },
  {
    id: 8,
    title: "التدريب على برنامج فوتوشوب",
    icon: Palette,
    slug: "photoshop"
  }
];

export default function PremiumCourseHighlights() {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-br from-slate-50 to-white">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-[#173A7C]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 bg-[#5CB07C]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center justify-center gap-3 text-[#173A7C] text-base font-black tracking-wide bg-[#173A7C]/5 px-6 py-2.5 rounded-full mb-6 border border-[#173A7C]/15 shadow-sm max-w-max mx-auto">
            <MonitorPlay className="w-5 h-5" strokeWidth={2.5} />
            تدريب المؤسسات
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#173A7C] mt-2 mb-4 leading-tight">
            أحدث دورات <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">الشركات</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {corporateCourses.map((course, idx) => {
            const Icon = course.icon;
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative"
              >
                <Link href={`/courses/${course.slug}`} className="block h-full">
                  <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/60 ring-1 ring-inset ring-slate-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_40px_80px_-15px_rgba(23,58,124,0.15)] hover:-translate-y-2 transition-all duration-500 overflow-hidden relative z-10 h-full flex flex-col text-start">
                    
                    {/* Hover Subtle Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#173A7C]/0 to-[#5CB07C]/0 group-hover:from-[#173A7C]/[0.02] group-hover:to-[#5CB07C]/[0.02] transition-colors duration-500 z-0"></div>

                    {/* Header: Icon & Top Tag */}
                    <div className="flex items-start justify-between w-full mb-8 relative z-10">
                      {/* Glossy Icon Container */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-50 to-[#173A7C]/5 ring-1 ring-inset ring-[#173A7C]/10 flex items-center justify-center text-[#173A7C] group-hover:scale-110 group-hover:bg-white group-hover:shadow-[0_8px_25px_rgba(23,58,124,0.15)] group-hover:text-[#5CB07C] transition-all duration-500 shadow-sm border border-white">
                        <Icon className="w-8 h-8" strokeWidth={1.5} />
                      </div>
                      <span className="text-[11px] font-black tracking-widest text-[#173A7C]/50 uppercase bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        مؤسسات
                      </span>
                    </div>

                    <h3 className="text-[1.15rem] leading-[1.6] font-black text-slate-900 group-hover:text-[#173A7C] transition-colors relative z-10 pb-6 border-b border-slate-100/80 mb-6">
                      {course.title}
                    </h3>

                    {/* Button Container */}
                    <div className="mt-auto w-full relative z-10">
                      <div className="w-full bg-slate-50 text-slate-700 border border-slate-200 text-[13px] font-black py-3 px-4 rounded-full flex items-center justify-between group-hover:bg-[#173A7C] group-hover:text-white group-hover:border-[#173A7C] transition-all duration-500 shadow-sm group-hover:shadow-[0_8px_25px_rgba(23,58,124,0.3)]">
                        <span>اشترك الأن بالدورة</span>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#173A7C] shadow-sm transform group-hover:bg-[#5CB07C] group-hover:text-white transition-colors duration-500">
                          <ArrowRight className="w-4 h-4 rtl:-scale-x-100 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
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
            className="inline-flex items-center gap-2 bg-slate-50 text-[#173A7C] border border-[#173A7C]/20 hover:border-[#173A7C]/50 hover:bg-white transition-all duration-300 text-base font-black px-8 py-4 rounded-full shadow-sm hover:shadow-md"
          >
            جميع دورات الشركات
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
