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
  X,
  Check,
  Loader2,
  FileText,
  Tag,
  Share2,
  ShieldCheck,
  UserCheck,
  Star,
  Filter,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { blogPosts } from '@/data/blogPosts';

interface AdminArticleItem {
  id: string | number;
  title: string;
  shortTitle?: string;
  slug: string;
  category: string;
  authorName: string;
  excerpt: string;
  content?: string;
  image?: string;
  published_at: string;
  read_time: string;
  views_count: number;
  status: 'published' | 'draft';
  isFeatured?: boolean;
  tags: string[];
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<AdminArticleItem[]>(() =>
    blogPosts.map((p, idx) => ({
      id: p.id,
      title: p.title,
      shortTitle: p.shortTitle,
      slug: p.slug,
      category: p.category,
      authorName: typeof p.author === 'object' && p.author ? p.author.name : (typeof (p as any).author === 'string' ? (p as any).author : 'فريق التحرير الأكاديمي'),
      excerpt: p.excerpt,
      content: p.sections?.map((s) => `### ${s.title}\n${s.paragraphs.join('\n\n')}`).join('\n\n') || '',
      image: p.image || '/1.png',
      published_at: p.date || '2026-05-18',
      read_time: p.readTime || '8 دقائق',
      views_count: p.viewsCount || 1250,
      status: 'published',
      isFeatured: idx < 2,
      tags: p.tags || ['إدارة', 'جودة', 'حوكمة'],
    }))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all');

  // Categories list
  const [categoriesList, setCategoriesList] = useState<string[]>([
    'إدارة ومشاريع',
    'الجودة والحوكمة',
    'السلامة والبيئة',
    'التحول الرقمي',
    'القيادة والاستراتيجية',
    'التطوير المؤسسي',
  ]);
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<AdminArticleItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Delete Confirmation Modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | number | null>(null);

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
    const nextId = Date.now();
    setEditingArticle({
      id: nextId,
      title: '',
      shortTitle: '',
      slug: `article-${nextId}`,
      category: categoriesList[0] || 'إدارة ومشاريع',
      authorName: 'هيئة التحرير الأكاديمية',
      excerpt: '',
      content: '',
      image: '/1.png',
      published_at: new Date().toISOString().split('T')[0],
      read_time: '5 دقائق',
      views_count: 0,
      status: 'published',
      isFeatured: false,
      tags: ['تطوير', 'تعليم'],
    });
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (art: AdminArticleItem) => {
    setEditingArticle({ ...art });
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
    if (!editingArticle || !editingArticle.tags) return;
    setEditingArticle({
      ...editingArticle,
      tags: editingArticle.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleToggleStatus = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    setArticles((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === 'published' ? 'draft' : 'published' }
          : a
      )
    );
  };

  const handleToggleFeatured = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isFeatured: !a.isFeatured } : a))
    );
  };

  const handleDeleteArticle = (id: string | number) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setDeleteConfirmId(null);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !editingArticle.title) return;

    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 400)); // simulated instant feedback

      const cleanSlug =
        editingArticle.slug ||
        editingArticle.title
          .toLowerCase()
          .replace(/[^\u0621-\u064A\w\s-]/g, '')
          .replace(/\s+/g, '-');

      const resolvedArticle: AdminArticleItem = {
        ...(editingArticle as AdminArticleItem),
        slug: cleanSlug,
        shortTitle: editingArticle.shortTitle || editingArticle.title?.slice(0, 30),
      };

      const exists = articles.some((a) => a.id === resolvedArticle.id);
      if (exists) {
        setArticles((prev) =>
          prev.map((a) => (a.id === resolvedArticle.id ? resolvedArticle : a))
        );
      } else {
        setArticles((prev) => [resolvedArticle, ...prev]);
      }

      setIsModalOpen(false);
      setEditingArticle(null);
    } catch (err) {
      console.error('Error saving article:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Articles
  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && a.status === 'published') ||
      (statusFilter === 'draft' && a.status === 'draft') ||
      (statusFilter === 'featured' && a.isFeatured);

    return matchesSearch && matchesCat && matchesStatus;
  });

  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const totalViews = articles.reduce((acc, a) => acc + a.views_count, 0);
  const draftCount = articles.filter((a) => a.status === 'draft').length;

  return (
    <div className="space-y-6 sm:space-y-8 font-[family-name:var(--font-cairo)] text-slate-800 pb-16" dir="rtl">
      {/* ── 1. HERO BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 liquid-glass-hero border border-white/80 student-card-accent"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="admin-hero-tag bg-blue-50 text-[#173A7C] border border-blue-200">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>لوحة الإدارة العليا • المدونة والنشر الأكاديمي</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span>إدارة المقالات والمنشورات الأكاديمية</span>
              <Newspaper className="w-7 h-7 text-[#173A7C] shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-2xl leading-relaxed">
              تحرير، مراجعة، ونشر المقالات والدراسات العلمية، تصنيف المحتوى وإدارته بالكامل، وربطه مع المدونة العامة للمنصة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/blog"
              target="_blank"
              className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-[#173A7C] font-black text-xs flex items-center gap-2 border border-slate-200 shadow-sm transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>معاينة المدونة العامة</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#132F64] hover:to-[#173A7C] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-[#173A7C]/25 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>كتابة مقال جديد</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── 2. METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
              <Newspaper className="w-5 h-5" />
            </div>
            <span className="px-3 py-1 rounded-xl text-xs font-black border bg-blue-50 text-blue-800 border-blue-200">
              إجمالي المحتوى
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">إجمالي المقالات</span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#173A7C] tracking-tight">{articles.length} مقال</h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="px-3 py-1 rounded-xl text-xs font-black border bg-emerald-50 text-emerald-800 border-emerald-200">
              منشور بالمدونة
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">المقالات المنشورة</span>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">{publishedCount} مقال</h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <Eye className="w-5 h-5" />
            </div>
            <span className="px-3 py-1 rounded-xl text-xs font-black border bg-amber-50 text-amber-900 border-amber-300">
              التفاعل والمشاهدات
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">إجمالي القراءات</span>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">
              {totalViews.toLocaleString()} <span className="text-xs font-bold">قراءة</span>
            </h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-md">
              <Clock className="w-5 h-5" />
            </div>
            <span className="px-3 py-1 rounded-xl text-xs font-black border bg-purple-50 text-purple-800 border-purple-200">
              مسودات قيد المراجعة
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">المسودات</span>
            <h3 className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight">{draftCount} مسودة</h3>
          </div>
        </div>
      </div>

      {/* ── 3. FILTER & SEARCH CONTROLS ── */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card space-y-4 student-card-accent">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث في المقالات، الكاتب، الوسوم، أو الكلمات المفتاحية..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/80"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-[#173A7C] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({articles.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                statusFilter === 'published'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              المنشورة ({publishedCount})
            </button>
            <button
              onClick={() => setStatusFilter('featured')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                statusFilter === 'featured'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              المميزة ({articles.filter((a) => a.isFeatured).length})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                statusFilter === 'draft'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              المسودات ({draftCount})
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
          <span className="text-[11px] font-black text-slate-500 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#173A7C]" />
            <span>المجال:</span>
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#173A7C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            جميع المجالات
          </button>
          {categoriesList.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#173A7C] text-white shadow-xs'
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
        <div className="p-12 text-center rounded-3xl liquid-glass-card border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#173A7C] flex items-center justify-center mx-auto border border-blue-100">
            <Newspaper className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">لا توجد مقالات مطابقة لبحثك</h3>
            <p className="text-xs text-slate-500 font-bold">
              جرّب تغيير كلمات البحث أو تصفية الحالة، أو أضف مقالاً ودراسة جديدة.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-[#173A7C] text-white text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-xs hover:bg-[#1E4D9D]"
          >
            <Plus className="w-4 h-4" />
            <span>كتابة مقال جديد الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <motion.div
              key={art.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl liquid-glass-card student-card-accent overflow-hidden border border-slate-200/90 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group"
            >
              <div>
                {/* Image Header with Badges */}
                <div className="relative h-48 w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={art.image || '/1.png'}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl text-[11px] font-black backdrop-blur-md bg-white/90 text-[#173A7C] border border-white shadow-xs">
                      {art.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {art.isFeatured && (
                        <span className="p-1.5 rounded-xl bg-amber-500 text-white shadow-md flex items-center gap-1 text-[10px] font-black">
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>مميز</span>
                        </span>
                      )}
                      <button
                        onClick={(e) => handleToggleStatus(art.id, e)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black border flex items-center gap-1 backdrop-blur-md cursor-pointer transition-all ${
                          art.status === 'published'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-purple-600 text-white border-purple-500'
                        }`}
                        title="انقر لتبديل حالة النشر"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{art.status === 'published' ? 'منشور' : 'مسودة'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Meta on Image */}
                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-xs font-black">
                    <div className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-xl">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="truncate max-w-[150px]">{art.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-xl">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>{art.views_count.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 space-y-3.5">
                  <h3 className="font-black text-sm sm:text-base text-slate-900 leading-snug line-clamp-2">
                    {art.title}
                  </h3>

                  <p className="text-xs font-bold text-slate-500 line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>

                  {/* Tags */}
                  {art.tags && art.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {art.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-extrabold border border-slate-200/80"
                        >
                          <Tag className="w-2.5 h-2.5 text-slate-400" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Date & Read Time */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{art.published_at}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{art.read_time}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(art)}
                    className="p-2 rounded-xl text-[#173A7C] hover:bg-blue-50 border border-slate-200 bg-white shadow-2xs transition-colors cursor-pointer"
                    title="تعديل المقال"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleToggleFeatured(art.id, e)}
                    className={`p-2 rounded-xl border shadow-2xs transition-colors cursor-pointer ${
                      art.isFeatured
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-white text-slate-400 hover:text-amber-600 border-slate-200'
                    }`}
                    title={art.isFeatured ? 'إلغاء التمييز' : 'تمييز في المدونة'}
                  >
                    <Star className={`w-4 h-4 ${art.isFeatured ? 'fill-amber-500' : ''}`} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(art.id)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-slate-200 bg-white shadow-2xs transition-colors cursor-pointer"
                    title="حذف المقال"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href={`/blog/${art.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-[#173A7C] text-[11px] font-black border border-slate-200 flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <span>قراءة</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── 5. CREATE / EDIT MODAL ── */}
      <AnimatePresence>
        {isModalOpen && editingArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md">
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {editingArticle.id && typeof editingArticle.id === 'string' && editingArticle.id.startsWith('art-')
                        ? 'تعديل بيانات المقال'
                        : 'كتابة مقال ودراسة جديدة'}
                    </h3>
                    <p className="text-xs font-bold text-slate-500">
                      قم بصياغة المقال وتحديد التصنيف والكاتب والوسوم للنشر في المدونة
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveArticle} className="space-y-4 text-xs font-bold">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-slate-700 font-black">عنوان المقال الرئيسي *</label>
                  <input
                    type="text"
                    required
                    value={editingArticle.title || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                    placeholder="مثال: الدليل الشامل في تطبيق معايير الآيزو 9001..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                {/* Category & Author */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-700 font-black">المجال / التصنيف *</label>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                        className="text-[10px] font-black text-blue-600 hover:underline cursor-pointer"
                      >
                        {isAddingNewCat ? 'إلغاء' : '+ مجال جديد'}
                      </button>
                    </div>

                    {isAddingNewCat ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCatInput}
                          onChange={(e) => setNewCatInput(e.target.value)}
                          placeholder="اسم المجال الجديد..."
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddNewCategory}
                          className="px-3 py-2 bg-[#173A7C] text-white rounded-xl font-bold cursor-pointer"
                        >
                          إضافة
                        </button>
                      </div>
                    ) : (
                      <select
                        value={editingArticle.category || categoriesList[0]}
                        onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white"
                      >
                        {categoriesList.map((c, i) => (
                          <option key={i} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-black">اسم الكاتب / الباحث *</label>
                    <input
                      type="text"
                      required
                      value={editingArticle.authorName || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, authorName: e.target.value })}
                      placeholder="اسم الكاتب أو الفريق..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                </div>

                {/* Slug, Read Time, Image */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-black">الرابط المخصص (Slug)</label>
                    <input
                      type="text"
                      value={editingArticle.slug || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                      placeholder="iso-9001-guide"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-black">وقت القراءة المتوقع</label>
                    <input
                      type="text"
                      value={editingArticle.read_time || '5 دقائق'}
                      onChange={(e) => setEditingArticle({ ...editingArticle, read_time: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-black">رابط صورة الغلاف</label>
                    <input
                      type="text"
                      value={editingArticle.image || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, image: e.target.value })}
                      placeholder="/1.png أو رابط صورة"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div className="space-y-1">
                  <label className="text-slate-700 font-black">المقدمة والملخص التعريفي *</label>
                  <textarea
                    rows={2}
                    required
                    value={editingArticle.excerpt || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                    placeholder="نبذة موجزة تظهر في بطاقة المقال بمحركات البحث والمدونة..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] resize-none"
                  />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <label className="text-slate-700 font-black">محتوى المقال الكامل *</label>
                  <textarea
                    rows={6}
                    required
                    value={editingArticle.content || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                    placeholder="اكتب نص المقال كاملاً هنا، يمكنك استخدام العناوين والفقرات والرموز التعبيرية..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] font-mono"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-slate-700 font-black">الوسوم والكلمات المفتاحية (Tags)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="أضف وسماً واضغط Enter..."
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
                    >
                      إضافة
                    </button>
                  </div>

                  {editingArticle.tags && editingArticle.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {editingArticle.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200"
                        >
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Flags: Published & Featured */}
                <div className="flex flex-wrap items-center gap-6 pt-2 pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingArticle.status === 'published'}
                      onChange={(e) =>
                        setEditingArticle({
                          ...editingArticle,
                          status: e.target.checked ? 'published' : 'draft',
                        })
                      }
                      className="w-4 h-4 rounded text-[#173A7C] focus:ring-0"
                    />
                    <span className="text-xs font-black text-slate-800">نشر المقال فوراً في المدونة العامة</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingArticle.isFeatured || false}
                      onChange={(e) => setEditingArticle({ ...editingArticle, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                    />
                    <span className="text-xs font-black text-amber-800">تثبيت وتمييز المقال في الواجهة الرئيسية ⭐</span>
                  </label>
                </div>

                {/* Submit & Cancel */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-black cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-[#173A7C] hover:bg-[#1E4D9D] text-white font-black flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingArticle.id ? 'حفظ المقال' : 'نشر المقال الآن'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 6. DELETE CONFIRM MODAL ── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                <Trash2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">هل أنت متأكد من حذف هذا المقال؟</h3>
                <p className="text-xs font-bold text-slate-500">
                  سيتم حذف المقال نهائياً من قاعدة البيانات وإلغاء نشره من المدونة العامة.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-black cursor-pointer"
                >
                  تراجع
                </button>
                <button
                  onClick={() => handleDeleteArticle(deleteConfirmId)}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer shadow-md"
                >
                  تأكيد الحذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
