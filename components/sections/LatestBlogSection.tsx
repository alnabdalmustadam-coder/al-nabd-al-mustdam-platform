"use client";

import { motion } from "framer-motion";
import { BookOpen, Calendar, ArrowLeft, Clock, BarChart3, ShieldCheck, Settings2 } from "lucide-react";
import Link from "next/link";

const blogPosts = [
  {
    id: 1,
    title: "إدارة المشاريع الاحترافية PMP",
    excerpt: "تعرّف على أفضل الممارسات في إدارة المشاريع الاحترافية وكيف يمكنك تطبيق منهجيات PMP لتحقيق نجاح مشاريعك.",
    icon: BarChart3,
    gradient: "from-[#173A7C] via-[#1a4490] to-[#1e5a6e]",
    date: "29 مارس 2023",
    readTime: "5 دقائق",
    category: "التكوين",
  },
  {
    id: 2,
    title: "المعيار الدولي لإدارة المخاطر آيزو",
    excerpt: "اكتشف كيف يساعدك معيار ISO 31000 في تحديد وتحليل وإدارة المخاطر المؤسسية بشكل فعال ومنهجي.",
    icon: ShieldCheck,
    gradient: "from-[#1e5a6e] via-[#1a4490] to-[#173A7C]",
    date: "10 مايو 2023",
    readTime: "4 دقائق",
    category: "التكوين",
  },
  {
    id: 3,
    title: "إدارة السلامة والصحة المهنية OSHA",
    excerpt: "دليلك الشامل لفهم معايير السلامة والصحة المهنية OSHA وأهميتها في بيئة العمل الحديثة.",
    icon: Settings2,
    gradient: "from-[#173A7C] to-[#5CB07C]",
    date: "10 مايو 2023",
    readTime: "6 دقائق",
    category: "التكوين",
  },
];

export default function LatestBlogSection() {
  return (
    <section className="pt-28 pb-40 relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-[#173A7C]/5">
      {/* Background Soft Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#173A7C]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#5CB07C]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[#173A7C] text-sm font-black tracking-widest uppercase bg-white px-5 py-2 rounded-full mb-6 border border-slate-200 shadow-sm mx-auto">
            <BookOpen className="w-4 h-4 text-[#5CB07C]" />
            المدونة
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#173A7C] mt-2 leading-[1.2] tracking-tight">
            آخر <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">المدونات</span>
          </h2>
          <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto font-medium leading-relaxed">
            مقالات متخصصة وأحدث الأفكار في عالم التدريب والتطوير المهني.
          </p>
        </motion.div>

        {/* Blog Cards Grid - Equal Height */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
          {blogPosts.map((post, i) => {
            const PostIcon = post.icon;
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="group h-full"
              >
                <Link href="#" className="block h-full">
                  <div className="relative rounded-[2rem] overflow-hidden border border-white/60 ring-1 ring-inset ring-slate-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_40px_80px_-15px_rgba(23,58,124,0.15)] hover:-translate-y-3 transition-all duration-500 h-full flex flex-col">

                    {/* Gradient Header */}
                    <div className={`relative h-56 bg-gradient-to-br ${post.gradient} overflow-hidden flex-shrink-0`}>
                      {/* Decorative elements */}
                      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.06] mix-blend-overlay pointer-events-none" />
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                      <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#5CB07C]/15 rounded-full blur-3xl" />

                      {/* Removed Geometric decorations as per user request */}

                      {/* Center Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl scale-150" />
                          <div className="relative w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]">
                            <PostIcon className="w-12 h-12 text-white" strokeWidth={1.5} />
                          </div>
                        </div>
                      </div>

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                      {/* Category Badge */}
                      <div className="absolute top-5 right-5">
                        <span className="bg-white/20 backdrop-blur-xl text-white text-[11px] font-bold px-4 py-2 rounded-full border border-white/25 shadow-lg">
                          {post.category}
                        </span>
                      </div>

                      {/* Date + Time at bottom */}
                      <div className="absolute bottom-5 right-5 flex items-center gap-3">
                        <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>

                    {/* Content Area - White Glassmorphic */}
                    <div className="bg-white/80 backdrop-blur-2xl p-7 flex flex-col flex-grow">
                      {/* Top accent line */}
                      <div className="w-12 h-1 bg-gradient-to-r from-[#5CB07C] to-[#173A7C] rounded-full mb-5" />

                      <h3 className="text-lg font-black text-[#173A7C] leading-[1.6] mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#173A7C] group-hover:to-[#5CB07C] transition-all duration-300 h-[3.2em] line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 text-[14px] leading-[1.8] font-medium flex-grow h-[3.6em] line-clamp-2">
                        {post.excerpt}
                      </p>

                      {/* Read More */}
                      <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[#5CB07C] text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                          اقرأ المزيد
                          <ArrowLeft className="w-4 h-4" />
                        </span>
                        <div className="w-8 h-8 rounded-full bg-[#5CB07C]/10 flex items-center justify-center group-hover:bg-[#5CB07C] group-hover:text-white transition-all duration-300">
                          <ArrowLeft className="w-3.5 h-3.5 text-[#5CB07C] group-hover:text-white transition-colors duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
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
