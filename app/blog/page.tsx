"use client";

import { useState } from "react";
import Link from "next/link";
import { ShimmerImage } from "@/components/ui/ShimmerImage";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowLeft,
  ChevronLeft,
  Search,
  Sparkles,
  Tag,
  GraduationCap,
  Award
} from "lucide-react";
import { blogPosts } from "@/data/blogPosts";

const categories = [
  { key: "all", label: "جميع المقالات" },
  { key: "management", label: "إدارة ومشاريع" },
  { key: "governance", label: "الجودة والحوكمة" },
  { key: "safety", label: "السلامة والبيئة" },
];

export default function BlogIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "all" || post.categorySlug === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts[0];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 selection:bg-[#173A7C] selection:text-white" dir="rtl">
      {/* ═══════════════════════════════════════ HERO BANNER ═══════════════════════════════════════ */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[#173A7C]/[0.08] via-[#173A7C]/[0.02] to-transparent relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#173A7C]/[0.04] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-10 w-[400px] h-[400px] bg-[#5CB07C]/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <span className="section-badge-glass mb-6">
            <BookOpen className="w-4 h-4 text-[#5CB07C]" />
            المدونة المعرفية والأكاديمية
          </span>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4"
          >
            المعرفة والتميز في <span className="gradient-text">عالم التدريب</span>
          </motion.h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            مقالات وأبحاث رصينة، دراسات حالة، وأحدث الأفكار المرجعية في مجالات إدارة المشاريع، الحوكمة، والجودة والسلامة المهنية.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto relative mb-8">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مقال، موضوع، أو وسم..."
              className="w-full pl-5 pr-12 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#173A7C]/30 text-sm font-medium text-slate-800 placeholder:text-slate-400"
            />
            <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Categories Pill Nav */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedCategory === cat.key
                    ? "bg-[#173A7C] text-white shadow-md shadow-[#173A7C]/20"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ FEATURED HERO ARTICLE ═══════════════════════════════════════ */}
      {selectedCategory === "all" && !searchQuery && featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="p-1 rounded-[2.5rem] bg-gradient-to-r from-[#173A7C]/20 via-[#5CB07C]/20 to-[#173A7C]/20 shadow-xl">
            <div className="rounded-[2.4rem] bg-white p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Image side */}
              <div className="lg:col-span-6 relative h-[260px] sm:h-[340px] rounded-3xl overflow-hidden bg-slate-900 shadow-md">
                <ShimmerImage
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  priority
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <span className="absolute top-4 right-4 bg-[#173A7C] text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md">
                  مقال مميز
                </span>
              </div>

              {/* Text side */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="bg-emerald-50 text-[#5CB07C] font-bold px-3 py-1 rounded-full border border-[#5CB07C]/20">
                    {featuredPost.category}
                  </span>
                  <span>{featuredPost.date}</span>
                  <span>•</span>
                  <span>{featuredPost.readTime}</span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-snug">
                  {featuredPost.title}
                </h2>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                <div className="pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#173A7C] text-white flex items-center justify-center font-bold text-sm">
                      {featuredPost.author.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{featuredPost.author.name}</p>
                      <p className="text-[11px] text-slate-500">{featuredPost.author.role}</p>
                    </div>
                  </div>

                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#173A7C] hover:bg-[#122e63] text-white text-xs sm:text-sm font-bold transition-all shadow-md"
                  >
                    <span>قراءة المقال</span>
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════ ARTICLES GRID ═══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {searchQuery
              ? `نتائج البحث عن "${searchQuery}" (${filteredPosts.length})`
              : "جميع المقالات والدراسات"}
          </h2>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">لا توجد مقالات مطابقة</h3>
            <p className="text-sm text-slate-500">جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group h-full"
              >
                <Link href={`/blog/${post.slug}`} className="block h-full">
                  <div className="relative rounded-[2rem] overflow-hidden border border-slate-200/90 bg-white shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      <ShimmerImage
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                      <span className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md text-[#173A7C] text-[11px] font-bold px-3 py-1 rounded-full shadow-xs border border-white/80">
                        {post.category}
                      </span>
                      <div className="absolute bottom-2.5 right-3 left-3 flex items-center justify-between text-white text-[11px] font-medium">
                        <span className="bg-black/35 backdrop-blur-md px-2 py-0.5 rounded-md">{post.date}</span>
                        <span className="bg-black/35 backdrop-blur-md px-2 py-0.5 rounded-md">{post.readTime}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-[#173A7C] transition-colors line-clamp-1">
                        {post.shortTitle || post.title}
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed mb-4 line-clamp-2 flex-grow">
                        {post.excerpt}
                      </p>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                        <span className="text-xs font-bold text-[#5CB07C] flex items-center gap-1 group-hover:gap-1.5 transition-all">
                          اقرأ المزيد
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {post.author.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
