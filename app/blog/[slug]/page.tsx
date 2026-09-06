"use client";

import { useState, use } from "react";
import Link from "next/link";
import { CardImage } from '@/components/ui/CardImage';
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Quote,
  GraduationCap,
  Sparkles,
  Award,
  Layers,
  ArrowUpRight,
  Send,
  Check,
  Building2,
  HelpCircle,
  FileText
} from "lucide-react";
import { getBlogPostBySlug, getRelatedBlogPosts, blogPosts } from "@/data/blogPosts";

export default function SingleBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(slug, 3);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleLike = () => {
    if (isLiked) {
      setLikesCount((c) => c - 1);
      setIsLiked(false);
    } else {
      setLikesCount((c) => c + 1);
      setIsLiked(true);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 selection:bg-[#173A7C] selection:text-white" dir="rtl">
      {/* ═══════════════════════════════════════ TOP BREADCRUMB & HEADER ═══════════════════════════════════════ */}
      <section className="relative pt-32 pb-14 bg-gradient-to-b from-[#173A7C]/[0.06] via-[#173A7C]/[0.02] to-transparent overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-32 right-1/4 w-[600px] h-[600px] bg-[#173A7C]/[0.04] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-[#5CB07C]/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-8 font-medium">
            <Link href="/" className="hover:text-[#173A7C] transition-colors">
              الرئيسية
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/blog" className="hover:text-[#173A7C] transition-colors">
              المدونة الأكاديمية
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#173A7C] font-semibold truncate max-w-[200px] sm:max-w-xs">
              {post.title}
            </span>
          </nav>

          {/* Meta Tags Pill Row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="bg-[#173A7C] text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-white/90 px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#5CB07C]" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-white/90 px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-[#5CB07C]" />
              وقت القراءة: {post.readTime}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-white/90 px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
              <Eye className="w-3.5 h-3.5 text-[#173A7C]" />
              {post.viewsCount.toLocaleString("ar-SA")} مشاهدة
            </span>
          </div>

          {/* H1 Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-slate-900 leading-[1.35] tracking-tight mb-5"
          >
            {post.title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-4xl mb-8 font-normal"
          >
            {post.subtitle}
          </motion.p>

          {/* Author Card & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-200/80">
            {/* Author */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#173A7C] to-[#5CB07C] p-0.5 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-[#173A7C] text-lg">
                  {post.author.name.charAt(post.author.name.indexOf(" ") + 1 || 0)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    {post.author.name}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#5CB07C]" strokeWidth={2.5} />
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {post.author.role}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isLiked
                    ? "bg-rose-50 text-rose-600 border border-rose-200 shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
                title="إعجاب بالمقال"
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                <span>{likesCount}</span>
              </button>

              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`p-2.5 rounded-xl border transition-all ${
                  isSaved
                    ? "bg-emerald-50 text-[#5CB07C] border-[#5CB07C]/30"
                    : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                }`}
                title="حفظ المقال"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-[#5CB07C]" : ""}`} />
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-bold transition-all shadow-xs"
                title="مشاركة رابط المقال"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-[#173A7C]" />
                    <span>مشاركة</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ MAIN FEATURED IMAGE ═══════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-14">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(23,58,124,0.15)] bg-slate-900"
        >
          <CardImage
            src={post.image}
            alt={post.title}
            preload
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 right-5 text-white/90 text-xs sm:text-sm font-medium bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
            {post.title} — دراسة مرجعية معتمدة من النبض المستدام
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════ ARTICLE BODY + SIDEBAR ═══════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Content Column (8 cols on desktop) */}
          <article className="lg:col-span-8 space-y-12">
            
            {/* Key Takeaways Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#173A7C]/[0.05] via-slate-50 to-[#5CB07C]/[0.06] border border-[#173A7C]/15 shadow-sm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-[#173A7C] text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  أبرز مخرجات ومحاور المقال الأكاديمي
                </h3>
              </div>
              <ul className="space-y-3">
                {post.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm sm:text-[15px] text-slate-700 leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 text-[#5CB07C] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Sections */}
            {post.sections.map((section, sIdx) => (
              <section key={section.id} id={section.id} className="scroll-mt-32 space-y-5">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#173A7C]/10 text-[#173A7C] font-black text-sm flex items-center justify-center shrink-0">
                    {sIdx + 1}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    {section.title}
                  </h2>
                </div>

                {/* Paragraphs */}
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-base sm:text-[16.5px] text-slate-700 leading-[1.85] text-justify font-normal">
                    {p}
                  </p>
                ))}

                {/* Highlight Quote if present */}
                {section.quote && (
                  <div className="my-6 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#173A7C]/[0.08] to-[#5CB07C]/[0.05] border-r-4 border-[#173A7C] relative overflow-hidden">
                    <Quote className="w-10 h-10 text-[#173A7C]/15 absolute top-3 left-4" />
                    <p className="text-base sm:text-lg font-bold text-slate-800 italic leading-relaxed mb-3 relative z-10">
                      "{section.quote.text}"
                    </p>
                    <span className="text-xs sm:text-sm font-semibold text-[#173A7C]">
                      — {section.quote.author}
                    </span>
                  </div>
                )}

                {/* Bullet Points if present */}
                {section.bulletPoints && (
                  <div className="my-4 p-5 sm:p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                    <ul className="space-y-2.5">
                      {section.bulletPoints.map((bp, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5 text-sm sm:text-[15px] text-slate-700 leading-relaxed">
                          <div className="w-2 h-2 rounded-full bg-[#5CB07C] mt-2 shrink-0" />
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Comparison / Structured Table if present */}
                {section.table && (
                  <div className="my-6 overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-[#173A7C] text-white">
                        <tr>
                          {section.table.headers.map((h, hIdx) => (
                            <th key={hIdx} className="p-3.5 sm:p-4 font-bold text-xs sm:text-sm">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {section.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`p-3.5 sm:p-4 text-xs sm:text-sm ${
                                  cIdx === 0 ? "font-bold text-slate-900" : "text-slate-600"
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Highlight Callout Box if present */}
                {section.highlightBox && (
                  <div className="my-6 p-6 rounded-2xl bg-white border border-[#5CB07C]/40 shadow-[0_4px_20px_rgba(92,176,124,0.08)] ring-1 ring-[#5CB07C]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-[#5CB07C]" />
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {section.highlightBox.title}
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {section.highlightBox.content}
                    </p>
                  </div>
                )}
              </section>
            ))}

            {/* Academic References Section */}
            <div className="pt-8 border-t border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <BookOpen className="w-5 h-5 text-[#173A7C]" />
                <h3>المراجع والمصادر الأكاديمية المعتمدة</h3>
              </div>
              <ol className="space-y-2 list-decimal list-inside text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                {post.academicReferences.map((ref, idx) => (
                  <li key={idx} className="font-mono text-[12px] sm:text-[13px]">
                    {ref}
                  </li>
                ))}
              </ol>
            </div>

            {/* FAQ Section Accordion */}
            <div className="pt-8 border-t border-slate-200 space-y-5">
              <div className="flex items-center gap-2 text-slate-900 font-black text-xl">
                <HelpCircle className="w-6 h-6 text-[#5CB07C]" />
                <h3>الأسئلة الشائعة حول {post.category}</h3>
              </div>
              
              <div className="space-y-3">
                {post.faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition-all"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between text-right font-bold text-slate-800 text-sm sm:text-base hover:text-[#173A7C] transition-colors"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#173A7C]" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Author Full Profile Bio Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#173A7C] to-[#5CB07C] p-0.5 shrink-0 flex items-center justify-center text-white font-black text-2xl shadow-md">
                <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center text-[#173A7C]">
                  {post.author.name.charAt(post.author.name.indexOf(" ") + 1 || 0)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-slate-900 text-base sm:text-lg">
                    {post.author.name}
                  </h4>
                  <span className="text-[11px] bg-[#173A7C]/10 text-[#173A7C] font-bold px-2.5 py-0.5 rounded-full">
                    كاتب ومحاضر معتمد
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {post.author.bio}
                </p>
                {post.author.credentials && (
                  <p className="text-xs font-semibold text-[#5CB07C] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    {post.author.credentials}
                  </p>
                )}
              </div>
            </div>

            {/* Tags Pill Row */}
            <div className="flex flex-wrap items-center gap-2 pt-4">
              <span className="text-xs font-bold text-slate-400 ml-2">الوسوم:</span>
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </article>

          {/* ═══════════════════════════════════════ SIDEBAR (4 cols on desktop) ═══════════════════════════════════════ */}
          <aside className="lg:col-span-4 space-y-8 sticky top-28">
            
            {/* Table of Contents Sticky Box */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Layers className="w-5 h-5 text-[#173A7C]" />
                <h3 className="font-bold text-slate-900 text-base">
                  فهرس محتويات المقال
                </h3>
              </div>
              <nav className="space-y-2">
                {post.tableOfContents.map((item, idx) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 hover:text-[#173A7C] hover:font-bold transition-all p-2 rounded-xl hover:bg-slate-50 group"
                  >
                    <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-500 group-hover:bg-[#173A7C] group-hover:text-white flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors">
                      {idx + 1}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Recommended Training Program CTA */}
            {post.relatedCourseTitle && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#173A7C] to-[#112a59] text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#5CB07C]/20 rounded-full blur-2xl pointer-events-none" />
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-[#5CB07C] text-white px-3 py-1 rounded-full mb-4 shadow-xs">
                  <Award className="w-3.5 h-3.5" />
                  برنامج تدريبي مرتبط
                </span>
                <h4 className="font-bold text-base sm:text-lg mb-2 leading-snug">
                  {post.relatedCourseTitle}
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed mb-5">
                  احصل على تأهيل مهني شامل وشهادة معتمدة تعزز مستقبلك الوظيفي من منصة النبض المستدام.
                </p>
                <Link
                  href={post.relatedCourseSlug ? `/courses` : "/courses"}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-[#173A7C] font-bold text-xs sm:text-sm hover:bg-emerald-50 hover:text-[#5CB07C] transition-all shadow-md"
                >
                  <span>استكشف تفاصيل الدورة والتسجيل</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Corporate Training Inquiries Box */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#5CB07C]" />
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  تدريب مخصص للشركات والهيئات
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                هل تبحث عن خطة تدريبية مخصصة لمنسوبي مؤسستك في مجال {post.category}؟
              </p>
              <Link
                href="/corporate"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#173A7C] hover:bg-[#122e63] text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>طلب تدريب شركات مخصص</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ═══════════════════════════════════════ RELATED BLOG POSTS ═══════════════════════════════════════ */}
      <section className="py-20 bg-slate-100/70 border-t border-slate-200/80 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-[#5CB07C] tracking-wider uppercase">
                استكشف المزيد
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                مقالات ودراسات ذات صلة
              </h3>
            </div>
            <Link
              href="/blog"
              className="text-xs sm:text-sm font-bold text-[#173A7C] hover:text-[#5CB07C] flex items-center gap-1 transition-colors"
            >
              <span>جميع المقالات</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedPosts.map((relPost) => (
              <Link
                key={relPost.id}
                href={`/blog/${relPost.slug}`}
                className="group rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-[#173A7C]/30 hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row"
              >
                <div className="relative w-full sm:w-44 shrink-0 bg-slate-900">
                  <CardImage
                    src={relPost.image}
                    alt={relPost.title}
                    sizes="(max-width: 768px) 100vw, 200px"
                  />
                  <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {relPost.category}
                  </span>
                </div>
                <div className="p-5 flex flex-col justify-between flex-grow">
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                      {relPost.date} • {relPost.readTime}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-[15px] group-hover:text-[#173A7C] transition-colors line-clamp-2 mb-2 leading-snug">
                      {relPost.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {relPost.excerpt}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#5CB07C] flex items-center gap-1 mt-4 group-hover:gap-2 transition-all">
                    <span>قراءة المقال</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
