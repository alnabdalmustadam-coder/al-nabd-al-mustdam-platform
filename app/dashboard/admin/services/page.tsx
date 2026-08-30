'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Store,
  Plus,
  Search,
  DollarSign,
  Clock,
  CheckCircle2,
  Edit3,
  Trash2,
  ExternalLink,
  Users,
  ShieldCheck,
  X,
  Check,
  Loader2,
  Layers,
  Power,
  Star,
  UserCheck,
  Eye,
  Filter,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface AdminServiceItem {
  id: string;
  title: string;
  category: string;
  price: number;
  duration: string;
  ordersCount: number;
  isActive: boolean;
  isFeatured?: boolean;
  providerName: string;
  image?: string;
  description: string;
  deliverables: string[];
  created_at?: string;
}

const initialServices: AdminServiceItem[] = [
  {
    id: 'srv-1',
    title: 'جلسة استشارية فردية: التخطيط الأكاديمي وإعداد الحقائب التدريبية',
    category: 'استشارات وتوجيه',
    price: 250,
    duration: 'جلسة 60 دقيقة',
    ordersCount: 38,
    isActive: true,
    isFeatured: true,
    providerName: 'د. خالد العتيبي',
    image: '/1.png',
    description: 'جلسة توجيهية خاصة لمراجعة خطط التدريب وتصميم الحقائب التدريبية المتوافقة مع معايير الجودة والاعتماد.',
    deliverables: ['خطة عمل تدريبية مخصصة', 'تقرير تقييمي بالنقاط التطويرية', 'تسجيل الجلسة وملحقاتها'],
    created_at: '2026-06-10',
  },
  {
    id: 'srv-2',
    title: 'مراجعة وتدقيق البحوث والرسائل الأكاديمية وتدقيق المنهجية',
    category: 'خدمات أكاديمية',
    price: 450,
    duration: '3 أيام عمل',
    ordersCount: 54,
    isActive: true,
    isFeatured: true,
    providerName: 'أ. د. سارة الشمري',
    image: '/2.png',
    description: 'فحص أكاديمي شامل للمنهجية، المراجع، التوثيق، والتأكد من خلو العمل من الانتحال العلمي.',
    deliverables: ['تقرير فحص الانتحال المعتمد', 'ملاحظات المنهجية والتوثيق', 'ملف مصحح ومراجع'],
    created_at: '2026-06-15',
  },
  {
    id: 'srv-3',
    title: 'تصميم وبناء نماذج تقييم الأداء والمؤشرات المؤسسية (KPIs)',
    category: 'تطوير إداري',
    price: 600,
    duration: '5 أيام عمل',
    ordersCount: 29,
    isActive: true,
    isFeatured: false,
    providerName: 'فريق معهد النبض المستدام',
    image: '/3.webp',
    description: 'إعداد لوحة مؤشرات قياس أداء متقدمة ونماذج تقييم عملية للمنشآت والمؤسسات التعليمية.',
    deliverables: ['لوحة تحكم إكسيل تفاعلية', 'دليل استخدام وتفسير المؤشرات', 'دعم فني وتعديلات لمدة أسبوع'],
    created_at: '2026-07-01',
  },
  {
    id: 'srv-4',
    title: 'إعداد ومراجعة لوائح الحوكمة والامتثال للمنشآت والمراكز التدريبية',
    category: 'تدقيق وحوكمة',
    price: 850,
    duration: '7 أيام عمل',
    ordersCount: 16,
    isActive: true,
    isFeatured: false,
    providerName: 'المستشار القانوني د. عبدالعزيز السالم',
    image: '/1.png',
    description: 'صياغة ومراجعة سياسات العمل الداخلية واللوائح التنظيمية المتوافقة مع متطلبات الجهات الإشرافية.',
    deliverables: ['مسودة اللائحة التنظيمية المعتمدة', 'مصفوفة الصلاحيات والحوكمة', 'جلسة شرح ومواءمة'],
    created_at: '2026-07-12',
  },
  {
    id: 'srv-5',
    title: 'جلسات كوتشينغ وتوجيه تنفيذي للقادة والمشرفين التربويين',
    category: 'تدريب وتوجيه تنفيذي',
    price: 350,
    duration: 'جلسة 90 دقيقة',
    ordersCount: 42,
    isActive: false,
    isFeatured: false,
    providerName: 'كوتش معتمد / فهد الدوسري',
    image: '/2.png',
    description: 'برنامج توجيه قيادي فردي يركز على مهارات إدارة فرق العمل واتخاذ القرارات الاستراتيجية وحل المشكلات.',
    deliverables: ['خطة تطوير قيادية شخصية', 'نموذج تقييم المهارات القيادية', 'متابعة وتغذية راجعة بعد الجلسة'],
    created_at: '2026-07-20',
  },
];

export default function AdminServicesPage() {
  const [services, setServices] = useState<AdminServiceItem[]>(initialServices);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'featured'>('all');

  const [categoriesList, setCategoriesList] = useState<string[]>([
    'استشارات وتوجيه',
    'خدمات أكاديمية',
    'تطوير إداري',
    'تدقيق وحوكمة',
    'تدريب وتوجيه تنفيذي',
  ]);
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<AdminServiceItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newDeliverableInput, setNewDeliverableInput] = useState('');

  // Delete Confirmation Modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleAddNewCategory = () => {
    if (!newCatInput.trim()) return;
    const cat = newCatInput.trim();
    if (!categoriesList.includes(cat)) {
      setCategoriesList((prev) => [...prev, cat]);
    }
    if (editingService) {
      setEditingService({ ...editingService, category: cat });
    }
    setNewCatInput('');
    setIsAddingNewCat(false);
  };

  const handleOpenCreateModal = () => {
    setEditingService({
      id: '',
      title: '',
      category: categoriesList[0] || 'استشارات وتوجيه',
      price: 150,
      duration: 'جلسة 60 دقيقة',
      ordersCount: 0,
      isActive: true,
      isFeatured: false,
      providerName: 'إدارة المنصة المعتمدة',
      image: '/1.png',
      description: '',
      deliverables: ['مخرجات مخصصة للعميل', 'تقرير توثيق معتمد'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: AdminServiceItem) => {
    setEditingService({ ...service });
    setIsModalOpen(true);
  };

  const handleAddDeliverable = () => {
    if (!newDeliverableInput.trim() || !editingService) return;
    const currentList = editingService.deliverables || [];
    setEditingService({
      ...editingService,
      deliverables: [...currentList, newDeliverableInput.trim()],
    });
    setNewDeliverableInput('');
  };

  const handleRemoveDeliverable = (index: number) => {
    if (!editingService || !editingService.deliverables) return;
    const updated = editingService.deliverables.filter((_, i) => i !== index);
    setEditingService({ ...editingService, deliverables: updated });
  };

  const handleToggleActive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleToggleFeatured = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFeatured: !s.isFeatured } : s))
    );
  };

  const handleDeleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirmId(null);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.title) return;

    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 400)); // simulated instant feedback

      if (editingService.id) {
        // Edit existing
        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? (editingService as AdminServiceItem) : s))
        );
      } else {
        // Create new
        const newServ: AdminServiceItem = {
          ...(editingService as AdminServiceItem),
          id: `srv-${Date.now()}`,
          ordersCount: 0,
          created_at: new Date().toISOString().split('T')[0],
        };
        setServices((prev) => [newServ, ...prev]);
      }

      setIsModalOpen(false);
      setEditingService(null);
    } catch (err) {
      console.error('Error saving service:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Services List
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && s.isActive) ||
      (statusFilter === 'inactive' && !s.isActive) ||
      (statusFilter === 'featured' && s.isFeatured);

    return matchesSearch && matchesCat && matchesStatus;
  });

  const totalRevenue = services.reduce((acc, s) => acc + s.price * s.ordersCount, 0);
  const totalOrders = services.reduce((acc, s) => acc + s.ordersCount, 0);
  const activeCount = services.filter((s) => s.isActive).length;

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#173A7C] text-xs font-black border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>لوحة الإدارة العليا • متجر الخدمات والاستشارات</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span>إدارة باقات الخدمات والاستشارات</span>
              <Store className="w-7 h-7 text-[#173A7C] shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-2xl leading-relaxed">
              تحكم كامل في إضافة، تسعير، ونشر باقات الاستشارات الأكاديمية والمهنية، تعيين مقدمي الخدمة، ومتابعة الطلبات المكتملة في المتجر العام.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/marketplace"
              target="_blank"
              className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-[#173A7C] font-black text-xs flex items-center gap-2 border border-slate-200 shadow-sm transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>معاينة المتجر العام</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#132F64] hover:to-[#173A7C] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-[#173A7C]/25 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة خدمة جديدة</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── 2. METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="px-3 py-1 rounded-xl text-xs font-black border bg-blue-50 text-blue-800 border-blue-200">
              إجمالي المعروض
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">إجمالي الخدمات</span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#173A7C] tracking-tight">{services.length} خدمة</h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="px-3 py-1 rounded-xl text-xs font-black border bg-emerald-50 text-emerald-800 border-emerald-200">
              منشورة ومتاحة
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">الخدمات النشطة</span>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">{activeCount} خدمة</h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <span className="px-3 py-1 rounded-xl text-xs font-black border bg-amber-50 text-amber-900 border-amber-300">
              الطلبات المكتملة
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">إجمالي المستفيدين</span>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">{totalOrders} مستفيد</h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="px-3 py-1 rounded-xl text-xs font-black border bg-indigo-50 text-indigo-800 border-indigo-200">
              عائدات المتجر
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">إجمالي المبيعات</span>
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-700 tracking-tight">
              {totalRevenue.toLocaleString()} <span className="text-xs font-bold">ر.س</span>
            </h3>
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
              placeholder="البحث باسم الخدمة، مقدم الخدمة، التصنيف، أو الكلمات المفتاحية..."
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
              الكل ({services.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              النشطة ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('featured')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                statusFilter === 'featured'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              المميزة ({services.filter((s) => s.isFeatured).length})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              المعطلة ({services.filter((s) => !s.isActive).length})
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
          <span className="text-[11px] font-black text-slate-500 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#173A7C]" />
            <span>التصنيف:</span>
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#173A7C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            جميع التصنيفات
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

      {/* ── 4. SERVICES GRID ── */}
      {filteredServices.length === 0 ? (
        <div className="p-12 text-center rounded-3xl liquid-glass-card border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#173A7C] flex items-center justify-center mx-auto border border-blue-100">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">لا توجد خدمات مطابقة لبحثك</h3>
            <p className="text-xs text-slate-500 font-bold">
              جرّب تغيير خيارات البحث أو تصفية الحالة، أو أضف خدمة استشارية جديدة.
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-[#173A7C] text-white text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-xs hover:bg-[#1E4D9D]"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة خدمة جديدة الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <motion.div
              key={service.id}
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
                    src={service.image || '/1.png'}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

                  {/* Top Status Badges */}
                  <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl text-[11px] font-black backdrop-blur-md bg-white/90 text-[#173A7C] border border-white shadow-xs">
                      {service.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {service.isFeatured && (
                        <span className="p-1.5 rounded-xl bg-amber-500 text-white shadow-md flex items-center gap-1 text-[10px] font-black">
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>مميزة</span>
                        </span>
                      )}
                      <button
                        onClick={(e) => handleToggleActive(service.id, e)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black border flex items-center gap-1 backdrop-blur-md cursor-pointer transition-all ${
                          service.isActive
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-800/90 text-slate-300 border-slate-700'
                        }`}
                        title="انقر لتبديل حالة التفعيل"
                      >
                        <Power className="w-3 h-3" />
                        <span>{service.isActive ? 'متاحة' : 'معطلة'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Meta on Image */}
                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-xs font-black">
                    <div className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-xl">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="truncate max-w-[150px]">{service.providerName}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-xs">
                      <span className="text-sm font-black">{service.price}</span>
                      <span className="text-[10px]">ر.س</span>
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 space-y-3.5">
                  <h3 className="font-black text-sm sm:text-base text-slate-900 leading-snug line-clamp-2">
                    {service.title}
                  </h3>

                  <p className="text-xs font-bold text-slate-500 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Deliverables List */}
                  {service.deliverables && service.deliverables.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-extrabold text-slate-400 block">المخرجات والضمانات:</span>
                      <div className="space-y-1">
                        {service.deliverables.slice(0, 2).map((deliv, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{deliv}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{service.duration}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      <span>{service.ordersCount} طلب مكتمل</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(service)}
                    className="p-2 rounded-xl text-[#173A7C] hover:bg-blue-50 border border-slate-200 bg-white shadow-2xs transition-colors cursor-pointer"
                    title="تعديل تفاصيل الخدمة"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleToggleFeatured(service.id, e)}
                    className={`p-2 rounded-xl border shadow-2xs transition-colors cursor-pointer ${
                      service.isFeatured
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-white text-slate-400 hover:text-amber-600 border-slate-200'
                    }`}
                    title={service.isFeatured ? 'إلغاء التمييز' : 'تمييز في المتجر'}
                  >
                    <Star className={`w-4 h-4 ${service.isFeatured ? 'fill-amber-500' : ''}`} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(service.id)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-slate-200 bg-white shadow-2xs transition-colors cursor-pointer"
                    title="حذف الخدمة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href={`/marketplace#${service.id}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-[#173A7C] text-[11px] font-black border border-slate-200 flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <span>عرض</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── 5. CREATE / EDIT MODAL ── */}
      <AnimatePresence>
        {isModalOpen && editingService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {editingService.id ? 'تعديل بيانات الخدمة' : 'إضافة خدمة أو استشارة جديدة'}
                    </h3>
                    <p className="text-xs font-bold text-slate-500">
                      حدد كافة التفاصيل والشروط والمخرجات المعتمدة للظهور في المتجر
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

              <form onSubmit={handleSaveService} className="space-y-4 text-xs font-bold">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-slate-700 font-black">عنوان الخدمة أو الاستشارة *</label>
                  <input
                    type="text"
                    required
                    value={editingService.title || ''}
                    onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                    placeholder="مثال: جلسة استشارية فردية في التخطيط الأكاديمي..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                {/* Category & Provider */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-700 font-black">التصنيف *</label>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                        className="text-[10px] font-black text-blue-600 hover:underline cursor-pointer"
                      >
                        {isAddingNewCat ? 'إلغاء' : '+ تصنيف جديد'}
                      </button>
                    </div>

                    {isAddingNewCat ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCatInput}
                          onChange={(e) => setNewCatInput(e.target.value)}
                          placeholder="اسم التصنيف الجديد..."
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
                        value={editingService.category || categoriesList[0]}
                        onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
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
                    <label className="text-slate-700 font-black">مقدم الخدمة / المشرف *</label>
                    <input
                      type="text"
                      required
                      value={editingService.providerName || ''}
                      onChange={(e) => setEditingService({ ...editingService, providerName: e.target.value })}
                      placeholder="اسم الدكتور / المدرب / الفريق الأكاديمي..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                </div>

                {/* Price, Duration, Image */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-black">السعر (ر.س) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editingService.price || ''}
                      onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-black">مدة التنفيذ / الجلسة *</label>
                    <input
                      type="text"
                      required
                      value={editingService.duration || ''}
                      onChange={(e) => setEditingService({ ...editingService, duration: e.target.value })}
                      placeholder="مثال: 3 أيام عمل أو 60 دقيقة"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-black">رابط الصورة التعبيرية</label>
                    <input
                      type="text"
                      value={editingService.image || ''}
                      onChange={(e) => setEditingService({ ...editingService, image: e.target.value })}
                      placeholder="/1.png أو رابط صورة"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-slate-700 font-black">الوصف التعريفي للخدمة *</label>
                  <textarea
                    rows={3}
                    required
                    value={editingService.description || ''}
                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                    placeholder="اشرح بالتفصيل ما تتضمنه الخدمة ومن الفئة المستهدفة..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] resize-none"
                  />
                </div>

                {/* Deliverables Checklist */}
                <div className="space-y-2">
                  <label className="text-slate-700 font-black">المخرجات والضمانات المستلمة</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDeliverableInput}
                      onChange={(e) => setNewDeliverableInput(e.target.value)}
                      placeholder="أضف مخرجاً مثل: تقرير فحص، ملف إكسيل، تسجيل..."
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDeliverable();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddDeliverable}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
                    >
                      إضافة
                    </button>
                  </div>

                  {editingService.deliverables && editingService.deliverables.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {editingService.deliverables.map((deliv, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>{deliv}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDeliverable(index)}
                            className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Flags: Active & Featured */}
                <div className="flex flex-wrap items-center gap-6 pt-2 pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingService.isActive || false}
                      onChange={(e) => setEditingService({ ...editingService, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-[#173A7C] focus:ring-0"
                    />
                    <span className="text-xs font-black text-slate-800">تفعيل ونشر الخدمة في المتجر مباشرة</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingService.isFeatured || false}
                      onChange={(e) => setEditingService({ ...editingService, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                    />
                    <span className="text-xs font-black text-amber-800">تمييز الخدمة في الصفحة الأولى للمتجر ⭐</span>
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
                    <span>{editingService.id ? 'حفظ التعديلات' : 'إنشاء ونشر الخدمة'}</span>
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
                <h3 className="text-base font-black text-slate-900">هل أنت متأكد من حذف هذه الخدمة؟</h3>
                <p className="text-xs font-bold text-slate-500">
                  سيتم حذف الخدمة نهائياً من المتجر ولن يتمكن المتدربون من طلبها بعد الآن.
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
                  onClick={() => handleDeleteService(deleteConfirmId)}
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
