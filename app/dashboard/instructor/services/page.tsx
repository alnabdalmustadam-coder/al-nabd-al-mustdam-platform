'use client';

import React, { useState } from 'react';
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
  Sparkles,
  X,
  Check,
  Loader2,
  Layers,
  Power,
} from 'lucide-react';
import { DeviceImageUploader } from '@/components/dashboard/DeviceImageUploader';

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  price: number;
  duration: string;
  ordersCount: number;
  isActive: boolean;
  image?: string;
  description: string;
  deliverables: string[];
}

export default function InstructorServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: 'srv-1',
      title: 'جلسة استشارية فردية: التخطيط الأكاديمي وإعداد الحقائب التدريبية',
      category: 'استشارات وتوجيه',
      price: 250,
      duration: 'جلسة 60 دقيقة',
      ordersCount: 14,
      isActive: true,
      image: '/1.png',
      description: 'جلسة توجيهية خاصة لمراجعة خطط التدريب وتصميم الحقائب التدريبية المتوافقة مع معايير الجودة والاعتماد.',
      deliverables: ['خطة عمل تدريبية مخصصة', 'تقرير تقييمي بالنقاط التطويرية', 'تسجيل الجلسة وملحقاتها'],
    },
    {
      id: 'srv-2',
      title: 'مراجعة وتدقيق البحوث والرسائل الأكاديمية وتدقيق المنهجية',
      category: 'خدمات أكاديمية',
      price: 450,
      duration: '3 أيام عمل',
      ordersCount: 22,
      isActive: true,
      image: '/2.png',
      description: 'فحص أكاديمي شامل للمنهجية، المراجع، التوثيق، والتأكد من خلو العمل من الانتحال العلمي.',
      deliverables: ['تقرير فحص الانتحال المعتمد', 'ملاحظات المنهجية والتوثيق', 'ملف مصحح ومراجع'],
    },
    {
      id: 'srv-3',
      title: 'تصميم وبناء نماذج تقييم الأداء والمؤشرات المؤسسية (KPIs)',
      category: 'تطوير إداري',
      price: 600,
      duration: '5 أيام عمل',
      ordersCount: 8,
      isActive: false,
      image: '/3.webp',
      description: 'إعداد لوحة مؤشرات قياس أداء متقدمة ونماذج تقييم عملية للمنشآت والمؤسسات التعليمية.',
      deliverables: ['لوحة تحكم إكسيل تفاعلية', 'دليل استخدام وتفسير المؤشرات', 'دعم فني وتعديلات لمدة أسبوع'],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Categories with dynamic adding support
  const [categoriesList, setCategoriesList] = useState<string[]>([
    'استشارات وتوجيه',
    'خدمات أكاديمية',
    'تطوير إداري',
    'تدقيق وحوكمة',
    'تدريب وتوجيه تنفيذي',
  ]);
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newDeliverableInput, setNewDeliverableInput] = useState('');

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
      title: '',
      category: categoriesList[0] || 'استشارات وتوجيه',
      price: 200,
      duration: 'جلسة 60 دقيقة',
      ordersCount: 0,
      isActive: true,
      image: '/1.png',
      description: '',
      deliverables: ['تقرير تقييمي مخصص', 'متابعة وتوجيه مباشر'],
    });
    setNewDeliverableInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: ServiceItem) => {
    setEditingService({ ...service });
    setNewDeliverableInput('');
    setIsModalOpen(true);
  };

  const handleAddDeliverable = () => {
    if (!newDeliverableInput.trim() || !editingService) return;
    const cur = editingService.deliverables || [];
    setEditingService({
      ...editingService,
      deliverables: [...cur, newDeliverableInput.trim()],
    });
    setNewDeliverableInput('');
  };

  const handleRemoveDeliverable = (idx: number) => {
    if (!editingService) return;
    const cur = [...(editingService.deliverables || [])];
    cur.splice(idx, 1);
    setEditingService({ ...editingService, deliverables: cur });
  };

  const handleToggleActive = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleDeleteService = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الخدمة من متجرك؟')) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.title?.trim()) {
      alert('يرجى كتابة عنوان الخدمة');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      if (editingService.id) {
        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? ({ ...s, ...editingService } as ServiceItem) : s))
        );
      } else {
        const newSrv: ServiceItem = {
          id: `srv-${Date.now()}`,
          title: editingService.title || 'خدمة جديدة',
          category: editingService.category || 'استشارات وتوجيه',
          price: Number(editingService.price) || 150,
          duration: editingService.duration || 'جلسة 60 دقيقة',
          ordersCount: 0,
          isActive: editingService.isActive ?? true,
          image: editingService.image || '/1.png',
          description: editingService.description || '',
          deliverables: editingService.deliverables || ['مخرجات استشارية معتمدة'],
        };
        setServices((prev) => [newSrv, ...prev]);
      }
      setIsSaving(false);
      setIsModalOpen(false);
      setEditingService(null);
    }, 400);
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
      {/* ── 1. HERO HEADER ── */}
      <div className="relative z-20 liquid-glass-hero p-6 sm:p-8 rounded-2xl sm:rounded-3xl liquid-glass-hover overflow-hidden student-card-accent">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/50 mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#173A7C] text-xs font-black border border-blue-200/90 shadow-xs">
            <Briefcase className="w-4 h-4 text-[#173A7C]" />
            <span>متجر الخدمات والاستشارات الأكاديمية</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-300 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{services.filter((s) => s.isActive).length} خدمات مفعلة</span>
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#173A7C] via-[#1E4D9D] to-[#2563EB] text-white flex items-center justify-center shadow-xl shadow-[#173A7C]/25 border border-white/40 shrink-0">
                <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] student-heading-h1">
                  إدارة <span className="student-name-gradient">خدماتي واستشاراتي التدريبية</span>
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed pr-1 sm:pr-2">
              إضافة وإدارة باقات الجلسات الاستشارية، التدقيق الأكاديمي، وتحديد الأسعار ومتابعة طلبات المتدربين والعملاء.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#5CB07C] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-[#173A7C]/20 hover:opacity-95 transition-all cursor-pointer border border-white/20"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة خدمة جديدة</span>
          </button>
        </div>
      </div>

      {/* ── 2. METRICS COUNTERS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-blue-50 text-[#173A7C] border-blue-200">
              خدماتي
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">إجمالي الخدمات</span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#173A7C] tracking-tight">{services.length} خدمة</h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-emerald-50 text-emerald-800 border-emerald-300">
              متاحة للطلب
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">الخدمات المفعلة</span>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
              {services.filter((s) => s.isActive).length} مفعلة
            </h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-blue-50 text-blue-800 border-blue-200">
              إقبال المتدربين
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">الطلبات المنجزة</span>
            <h3 className="text-2xl sm:text-3xl font-black text-blue-700 tracking-tight">
              {services.reduce((acc, s) => acc + s.ordersCount, 0)} طلب
            </h3>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl liquid-glass-card liquid-glass-hover space-y-3.5 relative overflow-hidden student-card-accent">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-black border bg-amber-50 text-amber-900 border-amber-300">
              الأرباح التقديرية
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-extrabold block">إجمالي العوائد</span>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">
              {services.reduce((acc, s) => acc + s.price * s.ordersCount, 0).toLocaleString()} ر.س
            </h3>
          </div>
        </div>
      </div>

      {/* ── 3. SEARCH & CATEGORY BAR ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الخدمات والاستشارات..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-slate-50/80"
          />
        </div>

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
            كافة الخدمات
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

      {/* ── 4. SERVICES GRID ── */}
      {filteredServices.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-3">
          <Store className="w-12 h-12 text-[#173A7C]/30 mx-auto" />
          <h3 className="text-base font-black text-slate-900">لا توجد خدمات مطابقة</h3>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-[#173A7C] text-white text-xs font-black"
          >
            + إضافة خدمة الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className={`p-4 sm:p-5 rounded-3xl liquid-glass-card liquid-glass-hover flex flex-col justify-between space-y-4 student-card-accent transition-all ${
                !srv.isActive ? 'opacity-75 bg-slate-50/70' : ''
              }`}
            >
              {/* Thumbnail Image */}
              <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/60 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={srv.image || '/1.png'}
                  alt={srv.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/1.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

                <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-xl text-[11px] font-black bg-white/95 text-[#173A7C] shadow-md backdrop-blur-md truncate max-w-[160px]">
                    {srv.category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-white bg-[#173A7C]/95 px-2.5 py-1 rounded-xl shadow-md border border-white/20 backdrop-blur-md">
                      {srv.price} ر.س
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(srv.id)}
                      className={`p-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md ${
                        srv.isActive
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                      title={srv.isActive ? 'إلغاء التفعيل' : 'تفعيل الخدمة'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-2.5 right-3 left-3 flex items-center justify-between text-white text-[11px] font-black drop-shadow-md">
                  <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{srv.duration}</span>
                  </span>
                  <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                    <Users className="w-3.5 h-3.5 text-blue-300" />
                    <span>{srv.ordersCount} طلب منجز</span>
                  </span>
                </div>
              </div>

              {/* Header Info */}
              <div className="space-y-2">
                <h3 className="student-heading-h3 !text-sm sm:!text-[15px] leading-snug line-clamp-2 min-h-[42px]">
                  {srv.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                  {srv.description}
                </p>

                {/* Deliverables Checklist */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-extrabold block">مخرجات الخدمة:</span>
                  {srv.deliverables.slice(0, 2).map((del, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{del}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meta & Actions */}
              <div className="space-y-2 pt-3 border-t border-slate-200/80">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(srv)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-[#173A7C] hover:text-white text-slate-700 text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل الخدمة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteService(srv.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-700 text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <Link
                    href={`/marketplace`}
                    target="_blank"
                    className="text-[#173A7C] hover:underline font-black flex items-center gap-1"
                  >
                    <span>معاينة في المتجر</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <span
                    className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg border ${
                      srv.isActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {srv.isActive ? 'متاحة للطلب' : 'معطلة مؤقتاً'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 5. CREATE / EDIT MODAL ── */}
      <AnimatePresence>
        {isModalOpen && editingService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-white/80 overflow-hidden my-auto"
            >
              <form onSubmit={handleSaveService} className="space-y-4">
                {/* Header */}
                <div className="p-5 bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-amber-300" />
                    <div>
                      <h3 className="font-black text-sm sm:text-base">
                        {editingService.id ? 'تعديل الخدمة الأكاديمية' : 'إضافة خدمة واستشارة جديدة'}
                      </h3>
                      <p className="text-xs text-blue-100">عرض الخدمة في متجر خدمات المنصة</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingService(null);
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Fields */}
                <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs font-bold">
                  <div className="space-y-1">
                    <label className="text-slate-700 block">عنوان الخدمة أو الاستشارة *</label>
                    <input
                      type="text"
                      required
                      value={editingService.title || ''}
                      onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                      placeholder="مثال: جلسة استشارية فردية في التخطيط الأكاديمي..."
                      className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-700 block">التصنيف *</label>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                          className="text-[#173A7C] text-[10px] hover:underline font-black cursor-pointer"
                        >
                          {isAddingNewCat ? 'إلغاء' : '+ جديد'}
                        </button>
                      </div>

                      {isAddingNewCat ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={newCatInput}
                            onChange={(e) => setNewCatInput(e.target.value)}
                            placeholder="تصنيف جديد..."
                            className="w-full p-2 rounded-xl border border-blue-300 outline-none text-xs"
                          />
                          <button
                            type="button"
                            onClick={handleAddNewCategory}
                            className="px-2.5 py-2 rounded-xl bg-[#173A7C] text-white text-xs"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <select
                          value={editingService.category || categoriesList[0]}
                          onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none bg-white text-xs font-bold"
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
                      <label className="text-slate-700 block">السعر (ر.س) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={editingService.price || 150}
                        onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none text-xs font-black text-[#173A7C]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700 block">مدة التنفيذ *</label>
                      <input
                        type="text"
                        required
                        value={editingService.duration || 'جلسة 60 دقيقة'}
                        onChange={(e) => setEditingService({ ...editingService, duration: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none text-xs"
                      />
                    </div>
                  </div>

                  {/* Device-Based WebP Service Image Uploader */}
                  <DeviceImageUploader
                    value={editingService.image || ''}
                    onChange={(url) => setEditingService({ ...editingService, image: url })}
                    folder="services"
                    slug={editingService.id || 'service'}
                    label="صورة وبنر الخدمة (رفع مباشر من جهازك مع ضغط WebP)"
                    recommendedSize="المقاس المثالي: 1200 × 750 بكسل (WebP / JPG / PNG)"
                    aspectRatio="video"
                  />

                  <div className="space-y-1">
                    <label className="text-slate-700 block">وصف الخدمة وتفاصيلها *</label>
                    <textarea
                      rows={3}
                      required
                      value={editingService.description || ''}
                      onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                      placeholder="اشرح القيمة المضافة وما سيحصل عليه العميل من هذه الخدمة..."
                      className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none resize-none text-xs font-medium"
                    />
                  </div>

                  {/* Deliverables Checklist Manager */}
                  <div className="space-y-2">
                    <label className="text-slate-700 block">مخرجات وبنود الخدمة</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newDeliverableInput}
                        onChange={(e) => setNewDeliverableInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddDeliverable();
                          }
                        }}
                        placeholder="أدخل مخرجاً للخدمة ثم اضغط إضافة..."
                        className="flex-1 p-2.5 rounded-xl border border-slate-300 focus:border-[#173A7C] outline-none text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddDeliverable}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-[#173A7C] hover:text-white text-slate-700 text-xs font-black transition-colors"
                      >
                        + إضافة
                      </button>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {(editingService.deliverables || []).map((del, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{del}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDeliverable(idx)}
                            className="text-red-500 hover:text-red-700 font-bold px-2"
                          >
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingService(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-emerald-600 text-white font-black text-xs shadow-md hover:opacity-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>حفظ الخدمة بالمتجر</span>
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
