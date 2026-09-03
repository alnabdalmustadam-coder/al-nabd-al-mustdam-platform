'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper,
  BookOpen,
  Plus,
  Search,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Check,
  Loader2,
  FileText,
  Tag,
  Share2,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

import { blogPosts } from '@/data/blogPosts';
import { DeviceImageUploader } from '@/components/dashboard/DeviceImageUploader';
import { useMobileDialogScrollLock } from '@/components/dashboard/useMobileDialogScrollLock';

interface ArticleItem {
  id: string | number;
  title: string;
  shortTitle?: string;
  slug: string;
  category: string;
  excerpt: string;
  content?: string;
  image?: string;
  published_at: string;
  read_time: string;
  views_count: number;
  status: 'published' | 'draft';
  tags: string[];
}

export default function InstructorArticlesPage() {
  const [articles, setArticles] = useState<ArticleItem[]>(() =>
    blogPosts.map((p) => ({
      id: p.id,
      title: p.title,
      shortTitle: p.shortTitle,
      slug: p.slug,
      category: p.category,
      excerpt: p.excerpt,
      content: p.sections?.map((s) => `### ${s.title}\n${s.paragraphs.join('\n\n')}`).join('\n\n') || '',
      image: p.image || '/1.png',
      published_at: p.date || '2026-05-18',
      read_time: p.readTime || '8 دقائق',
      views_count: p.viewsCount || 1250,
      status: 'published',
      tags: p.tags || ['إدارة', 'جودة'],
    }))
  );

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Categories with dynamic adding support
  const [categoriesList, setCategoriesList] = useState<string[]>([
    'إدارة ومشاريع',
    'الجودة والحوكمة',
    'السلامة والبيئة',
    'التحول الرقمي',
    'القيادة والاستراتيجية',
  ]);
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  useMobileDialogScrollLock(isModalOpen);
  const [editingArticle, setEditingArticle] = useState<Partial<ArticleItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleAddNewCategory = () => {
    if (!newCatInput.trim()) return;
    const cat = newCatInput.trim();
    if (!categoriesList.includes(cat)) {
      setCategoriesList((prev) => [...prev, cat]);
    }
    if (editingArticle) {
      setEditingArticle({ ...editingArticle, category: cat });
    }
    setNewCatInput('');
    setIsAddingNewCat(false);
  };

  const handleOpenCreateModal = () => {
    setEditingArticle({
      title: '',
      shortTitle: '',
      slug: '',
      category: categoriesList[0] || 'إدارة ومشاريع',
      excerpt: '',
      content: '',
      image: '/1.png',
      status: 'published',
      tags: ['تطوير مهني', 'أبحاث أكاديمية'],
      read_time: '6 دقائق',
    });
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (article: ArticleItem) => {
    setEditingArticle({ ...article });
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || !editingArticle) return;
    const currentTags = editingArticle.tags || [];
    if (!currentTags.includes(tagInput.trim())) {
      setEditingArticle({
        ...editingArticle,
        tags: [...currentTags, tagInput.trim()],
      });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!editingArticle) return;
    setEditingArticle({
      ...editingArticle,
      tags: (editingArticle.tags || []).filter((t) => t !== tagToRemove),
    });
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !editingArticle.title?.trim()) {
      alert('يرجى إدخال عنوان المقال');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      if (editingArticle.id) {
        // Update existing
        setArticles((prev) =>
          prev.map((a) => (a.id === editingArticle.id ? ({ ...a, ...editingArticle } as ArticleItem) : a))
        );
      } else {
        // Create new
        const newArt: ArticleItem = {
          id: `art-${Date.now()}`,
          title: editingArticle.title || 'مقال جديد',
          shortTitle: editingArticle.shortTitle || editingArticle.title,
          slug: editingArticle.slug || `article-${Date.now()}`,
          category: editingArticle.category || 'إدارة ومشاريع',
          excerpt: editingArticle.excerpt || '',
          content: editingArticle.content || '',
          image: editingArticle.image || '/1.png',
          published_at: new Date().toISOString().split('T')[0],
          read_time: editingArticle.read_time || '6 دقائق',
          views_count: 0,
          status: editingArticle.status || 'published',
          tags: editingArticle.tags || ['تطوير مهني'],
        };
        setArticles((prev) => [newArt, ...prev]);
      }
      setIsSaving(false);
      setIsModalOpen(false);
      setEditingArticle(null);
    }, 400);
  };

  const handleDeleteArticle = (id: string | number) => {
    if (confirm('هل أنت متأكد من حذف هذا المقال الأكاديمي نهائياً؟')) {
      setArticles((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
      {/* ── 1. HERO HEADER ── */}
      <div className="relative z-20 liquid-glass-hero p-6 sm:p-8 rounded-2xl sm:rounded-3xl liquid-glass-hover overflow-hidden student-card-accent">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/50 mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#173A7C] text-xs font-black border border-blue-200/90 shadow-xs">
            <Newspaper className="w-4 h-4 text-[#173A7C]" />
            <span>المدونة المعرفية والأبحاث الأكاديمية</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-300 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{articles.length} مقال أكاديمي</span>
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#173A7C] via-[#1E4D9D] to-[#2563EB] text-white flex items-center justify-center shadow-xl shadow-[#173A7C]/25 border border-white/40 shrink-0">
                <Newspaper className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] student-heading-h1">
                  المقالات والمنشورات <span className="student-name-gradient">الأكاديمية</span>
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed pr-1 sm:pr-2">
              كتابة ونشر المقالات والأبحاث الأكاديمية ومشاركتها مع مجتمع المتدربين والزوار على مدونة المنصة.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#5CB07C] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-[#173A7C]/20 hover:opacity-95 transition-all cursor-pointer border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>كتابة مقال جديد</span>
          </button>
        </div>
      </div>

      {/* ── 2. METRICS COUNTERS (MATCHED WITH MAIN DASHBOARD STYLE) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md">
              <Newspaper className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-blue-50 text-[#173A7C] border-blue-200">
              مدونة المدرب
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">إجمالي المقالات</span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#173A7C] tracking-tight">{articles.length} مقال</h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-emerald-50 text-emerald-800 border-emerald-300">
              منشور بالموقع
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">المقالات المنشورة</span>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
              {articles.filter((a) => a.status === 'published').length} منشورة
            </h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-md">
              <Eye className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-blue-50 text-blue-800 border-blue-200">
              تفاعل القراء
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">إجمالي القراءات</span>
            <h3 className="text-2xl sm:text-3xl font-black text-blue-700 tracking-tight">
              {articles.reduce((acc, a) => acc + a.views_count, 0).toLocaleString()} قراءة
            </h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-amber-50 text-amber-900 border-amber-300">
              قيد التحرير
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">المسودات</span>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">
              {articles.filter((a) => a.status === 'draft').length} مسودة
            </h3>
          </div>
        </div>
      </div>

      {/* ── 3. SEARCH & CATEGORY FILTER BAR ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في المقالات والوسوم والمحتوى..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-slate-50/80"
          />
        </div>

        {/* Category Pills with Add Category Option */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#173A7C] text-white shadow-sm font-black'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            كافة المقالات
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#173A7C] text-white shadow-sm font-black'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. ARTICLES GRID ── */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-3">
          <Newspaper className="w-12 h-12 text-[#173A7C]/30 mx-auto" />
          <h3 className="text-base font-black text-slate-900">لا توجد مقالات مطابقة للبحث</h3>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-[#173A7C] text-white text-xs font-black"
          >
            + كتابة أول مقال
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              className="p-4 sm:p-5 rounded-3xl liquid-glass-card liquid-glass-hover flex flex-col justify-between space-y-4 student-card-accent group relative overflow-hidden"
            >
              {/* Thumbnail Image */}
              <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/60 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={art.image || '/1.png'}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/1.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

                <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-xl text-[11px] font-black bg-white/95 text-[#173A7C] shadow-md backdrop-blur-md">
                    {art.category}
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black border backdrop-blur-md shadow-md ${
                      art.status === 'published'
                        ? 'bg-emerald-500/90 text-white border-emerald-400'
                        : 'bg-amber-500/90 text-slate-950 border-amber-400'
                    }`}
                  >
                    {art.status === 'published' ? 'منشور' : 'مسودة'}
                  </span>
                </div>

                <div className="absolute bottom-2.5 right-3 left-3 flex items-center justify-between text-white text-[11px] font-black drop-shadow-md">
                  <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                    <Calendar className="w-3.5 h-3.5 text-slate-200" />
                    <span>{art.published_at}</span>
                  </span>
                  <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                    <Eye className="w-3.5 h-3.5 text-blue-300" />
                    <span>{art.views_count.toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {/* Content Info */}
              <div className="space-y-2">
                <h3 className="student-heading-h3 !text-sm sm:!text-[15px] leading-snug line-clamp-2 min-h-[42px]">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                  {art.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {art.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-3 border-t border-slate-200/80">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(art)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-[#173A7C] hover:text-white text-slate-700 text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل المقال</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteArticle(art.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-700 text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <Link
                    href={`/blog/${art.slug}`}
                    target="_blank"
                    className="text-[#173A7C] hover:underline font-black flex items-center gap-1"
                  >
                    <span>معاينة في المدونة</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <span className="text-[11px] font-black text-slate-400">
                    وقت القراءة: {art.read_time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 5. CREATE / EDIT MODAL ── */}
      <AnimatePresence>
        {isModalOpen && editingArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-stretch justify-stretch bg-slate-950/75 backdrop-blur-md sm:items-center sm:justify-center sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="flex h-[100dvh] w-full max-w-none flex-col overflow-hidden rounded-none border-0 bg-white text-right shadow-2xl sm:h-auto sm:max-h-[92vh] sm:max-w-5xl sm:rounded-3xl sm:border sm:border-slate-200/80"
            >
              <form onSubmit={handleSaveArticle} className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] px-4 py-3 text-white sm:px-6 sm:py-4">
                  <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                    <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs text-amber-300">
                      <Newspaper className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-black leading-tight sm:text-base">
                        {editingArticle.id ? 'تعديل المقال الأكاديمي' : 'كتابة مقال أكاديمي جديد'}
                      </h3>
                      <p className="mt-0.5 hidden text-[11px] text-blue-100/90 sm:block">النشر والمشاركة في المدونة الرسمية للمنصة</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingArticle(null);
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable 2-Column Grid */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* ── RIGHT COLUMN (7 COLS): Info, Excerpt & Content ── */}
                    <div className="lg:col-span-7 space-y-4 text-xs font-bold">
                      <div className="space-y-1">
                        <label className="text-slate-700 text-xs font-black block">عنوان المقال الأكاديمي *</label>
                        <input
                          type="text"
                          required
                          value={editingArticle.title || ''}
                          onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                          placeholder="مثال: أسس القيادة الأخلاقية في المنظمات الحديثة..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#173A7C] outline-none text-xs font-bold text-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-slate-700 text-xs font-black block">التصنيف الأكاديمي *</label>
                            <button
                              type="button"
                              onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                              className="text-[#173A7C] text-[10px] hover:underline font-black cursor-pointer"
                            >
                              {isAddingNewCat ? 'إلغاء' : '+ تصنيف جديد'}
                            </button>
                          </div>

                          {isAddingNewCat ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={newCatInput}
                                onChange={(e) => setNewCatInput(e.target.value)}
                                placeholder="تصنيف..."
                                className="w-full px-2.5 py-2 rounded-xl border border-blue-300 outline-none text-xs"
                              />
                              <button
                                type="button"
                                onClick={handleAddNewCategory}
                                className="px-3 py-2 rounded-xl bg-[#173A7C] text-white text-xs font-black cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <select
                              value={editingArticle.category || categoriesList[0]}
                              onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#173A7C] outline-none bg-white text-xs font-bold text-slate-800"
                            >
                              {categoriesList.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-700 text-xs font-black block">وقت القراءة المقدر</label>
                          <input
                            type="text"
                            value={editingArticle.read_time || '6 دقائق'}
                            onChange={(e) => setEditingArticle({ ...editingArticle, read_time: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#173A7C] outline-none text-xs font-bold text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-700 text-xs font-black block">المقدمة والملخص التنفيذي *</label>
                        <textarea
                          rows={2}
                          required
                          value={editingArticle.excerpt || ''}
                          onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                          placeholder="نبذة موجزة تشرح الفكرة الرئيسية للمقال وتجذب القارئ..."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#173A7C] outline-none resize-none text-xs font-medium text-slate-800 leading-relaxed"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-700 text-xs font-black block">نص المحتوى والمقال بالكامل *</label>
                        <textarea
                          rows={6}
                          required
                          value={editingArticle.content || ''}
                          onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                          placeholder="اكتب المحتوى الأكاديمي، المحاور، النتائج والتوصيات بالتفصيل..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#173A7C] outline-none text-xs font-medium leading-relaxed text-slate-800"
                        />
                      </div>

                      {/* Tags Manager */}
                      <div className="space-y-1.5">
                        <label className="text-slate-700 text-xs font-black block">الوسوم والكلمات المفتاحية</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                            placeholder="أدخل وسماً ثم اضغط إضافة..."
                            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#173A7C] outline-none text-xs"
                          />
                          <button
                            type="button"
                            onClick={handleAddTag}
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black cursor-pointer transition-colors"
                          >
                            + إضافة
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(editingArticle.tags || []).map((t, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-800"
                            >
                              <span>#{t}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(t)}
                                className="text-slate-400 hover:text-rose-600 font-black cursor-pointer mr-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ── LEFT COLUMN (5 COLS): Image, Status & Live Preview ── */}
                    <div className="lg:col-span-5 space-y-4">
                      {/* Device Image Uploader */}
                      <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
                        <DeviceImageUploader
                          value={editingArticle.image || ''}
                          onChange={(url) => setEditingArticle({ ...editingArticle, image: url })}
                          folder="articles"
                          slug={editingArticle.slug || 'article'}
                          label="صورة غلاف المقال"
                          recommendedSize="المقاس: 1200 × 630 بكسل"
                          aspectRatio="video"
                        />
                      </div>

                      {/* Status Card */}
                      <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                        <label className="text-slate-700 text-xs font-black block">حالة النشر والظهور</label>
                        <select
                          value={editingArticle.status || 'published'}
                          onChange={(e) =>
                            setEditingArticle({
                              ...editingArticle,
                              status: e.target.value as 'published' | 'draft',
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#173A7C] outline-none bg-white text-xs font-bold text-slate-800"
                        >
                          <option value="published">🟢 منشور ومتاح للجميع بالمدونة</option>
                          <option value="draft">🟡 مسودة خاصة غير منشورة</option>
                        </select>
                      </div>

                      {/* Live Store Card Preview */}
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50/50 to-slate-50 border border-blue-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-black text-[#173A7C]">
                          <span>معاينة فورية لكارت المقال:</span>
                          <span className="text-[10px] font-mono text-slate-400">Live Preview</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
                          <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 relative">
                            <img
                              src={editingArticle.image || '/1.png'}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/logo.webp'; }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black text-slate-800 truncate">
                              {editingArticle.title || 'عنوان المقال الأكاديمي'}
                            </h4>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mt-1">
                              <span>{editingArticle.category || 'عام'}</span>
                              <span className="text-[#173A7C] font-mono">{editingArticle.read_time || '6 دقائق'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer */}
                <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6 sm:py-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingArticle(null);
                    }}
                    className="flex-1 cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200/60 sm:flex-none sm:py-2"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex flex-[2] cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#173A7C] to-emerald-600 px-6 py-2.5 text-xs font-black text-white shadow-md transition-all hover:opacity-95 disabled:opacity-50 sm:flex-none"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>حفظ ونشر المقال</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
