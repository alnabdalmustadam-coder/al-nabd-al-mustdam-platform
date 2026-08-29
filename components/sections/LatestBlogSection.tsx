"use client";

import { motion } from "framer-motion";
import { BookOpen, Calendar, ArrowLeft, Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { blogPosts } from "@/data/blogPosts";

export default function LatestBlogSection() {
  return (
    <section className="pt-24 pb-36 relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white">
      {/* Background Soft Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#173A7C]/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#5CB07C]/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="section-badge-glass mb-5">
            <BookOpen className="w-4 h-4 text-[#5CB07C]" />
            المدونة الأكاديمية
          </span>
          <h2 className="section-main-title-premium mt-2 mb-3">
            آخر <span className="gradient-text">المدونات والمقالات</span>
          </h2>
          <p className="section-desc-premium max-w-xl mx-auto text-sm sm:text-base">
            مقالات ودراسات متخصصة وأحدث الأفكار المرجعية في عالم التدريب والتطوير المهني.
          </p>
        </motion.div>

        {/* Blog Cards Grid - Clean, Modern, Elegant */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 auto-rows-fr">
          {blogPosts.map((post, i) => {
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group h-full"
              >
                <Link href={`/blog/${post.slug}`} className="block h-full">
                  <div className="relative rounded-[1.75rem] overflow-hidden border border-slate-200/70 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-12px_rgba(23,58,124,0.12)] hover:border-[#173A7C]/25 hover:-translate-y-1.5 transition-all duration-400 h-full flex flex-col">
                    
                    {/* Clear, Bright, High-Res Image Container */}
                    <div className="relative h-52 sm:h-56 overflow-hidden flex-shrink-0 bg-slate-100">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-600 ease-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />

                      {/* Very Light Bottom Vignette only for chip readability */}
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 via-black/10 to-transparent pointer-events-none" />

                      {/* Category Badge - Clean Glass Style */}
                      <div className="absolute top-3.5 right-3.5 z-10">
                        <span className="bg-white/95 backdrop-blur-md text-[#173A7C] text-[11px] font-bold px-3 py-1 rounded-full shadow-xs border border-white/80">
                          {post.category}
                        </span>
                      </div>

                      {/* Date & Read Time Pills */}
                      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between z-10">
                        <span className="flex items-center gap-1.5 bg-black/35 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg border border-white/10">
                          <Calendar className="w-3 h-3 text-[#5CB07C]" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1.5 bg-black/35 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg border border-white/10">
                          <Clock className="w-3 h-3 text-[#5CB07C]" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>

                    {/* Content Area - Spacious, Crisp, Breathable */}
                    <div className="p-5 sm:p-6 flex flex-col flex-grow bg-white">
                      {/* Short Concise Title */}
                      <h3 className="text-[16px] sm:text-[17px] font-bold text-slate-900 mb-2 leading-snug group-hover:text-[#173A7C] transition-colors line-clamp-1">
                        {post.shortTitle || post.title}
                      </h3>

                      {/* Concise 2-line Excerpt */}
                      <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed mb-5 line-clamp-2 flex-grow">
                        {post.excerpt}
                      </p>

                      {/* Clean Card Footer */}
                      <div className="mt-auto pt-3.5 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#173A7C]/10 text-[#173A7C] font-black text-[10px] flex items-center justify-center">
                            {post.author.name.charAt(post.author.name.indexOf(" ") + 1 || 0)}
                          </div>
                          <span className="text-[11.5px] font-medium text-slate-500 truncate max-w-[130px]">
                            {post.author.name}
                          </span>
                        </div>

                        <span className="text-xs font-bold text-[#5CB07C] flex items-center gap-1 group-hover:gap-1.5 transition-all">
                          اقرأ المزيد
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </span>
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
      <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none flex flex-col items-center justify-end h-28">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-gradient-to-t from-white to-transparent blur-xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-20 bg-[#5CB07C]/10 blur-2xl rounded-t-full z-0" />
        <div className="absolute bottom-0 left-0 w-full h-[80px] bg-gradient-to-b from-transparent to-white/70" />
        <div className="relative w-full z-20">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] md:w-[95%] h-[2px] bg-gradient-to-r from-transparent via-[#5CB07C]/80 to-transparent shadow-[0_0_15px_rgba(92,176,124,0.8)]"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 md:w-[70%] h-[3px] bg-gradient-to-r from-transparent via-[#173A7C]/90 to-transparent shadow-[0_0_18px_rgba(23,58,124,0.9)]"></div>
        </div>
      </div>
    </section>
  );
}
