'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Percent,
  DollarSign,
  Copy,
  Trash2,
  X,
  TrendingUp,
  Check,
  Ticket,
} from 'lucide-react';

interface CouponItem {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  usageLimit: number;
  timesUsed: number;
  expiryDate: string;
  status: 'active' | 'expired';
}

export default function AdminCouponsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Coupon Form State
  const [newCode, setNewCode] = useState('SUSTAIN2026');
  const [newType, setNewType] = useState<'percentage' | 'fixed'>('percentage');
  const [newValue, setNewValue] = useState('20');
  const [newLimit, setNewLimit] = useState('100');
  const [newExpiry, setNewExpiry] = useState('2026-12-31');

  const [coupons, setCoupons] = useState<CouponItem[]>([
    {
      id: 'cp-1',
      code: 'SUSTAIN2026',
      discountType: 'percentage',
      discountValue: '20%',
      usageLimit: 500,
      timesUsed: 312,
      expiryDate: '31 ديسمبر 2026',
      status: 'active',
    },
    {
      id: 'cp-2',
      code: 'WELCOME100',
      discountType: 'fixed',
      discountValue: '100 ر.س',
      usageLimit: 200,
      timesUsed: 198,
      expiryDate: '15 أغسطس 2026',
      status: 'active',
    },
    {
      id: 'cp-3',
      code: 'VIP50',
      discountType: 'percentage',
      discountValue: '50%',
      usageLimit: 50,
      timesUsed: 50,
      expiryDate: '01 يوليو 2026',
      status: 'expired',
    },
  ]);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const newCp: CouponItem = {
      id: `cp-${Date.now()}`,
      code: newCode.toUpperCase(),
      discountType: newType,
      discountValue: newType === 'percentage' ? `${newValue}%` : `${newValue} ر.س`,
      usageLimit: parseInt(newLimit) || 100,
      timesUsed: 0,
      expiryDate: newExpiry,
      status: 'active',
    };

    setCoupons([newCp, ...coupons]);
    setIsModalOpen(false);
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === 'active' ? 'expired' : 'active' } : c))
    );
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsed = coupons.reduce((acc, curr) => acc + curr.timesUsed, 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#173A7C]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-20 left-10 w-[30rem] h-[30rem] bg-[#5CB07C]/8 rounded-full blur-[160px]" />
      </div>

      {/* Header Banner - Liquid Glass Hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-7 liquid-glass-hero border border-white/80 student-card-accent"
      >
        <div className="specular-card-reflection" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-3.5">
            <div className="flex flex-col items-start">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#173A7C]/10 text-[#173A7C] text-[10px] sm:text-xs font-black border border-[#173A7C]/15 shrink-0 whitespace-nowrap mb-3 sm:mb-4">
                <Tag className="w-3.5 h-3.5 text-[#173A7C] shrink-0" />
                <span>إدارة العروض وقسائم الشراء والخصومات</span>
              </div>
              <h1 className="text-sm sm:text-2xl lg:text-3xl font-black student-heading-h1 student-name-gradient leading-snug">
                إدارة كودات الخصم <span className="inline-block whitespace-nowrap">والتخفيضات 🎟️</span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs lg:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
              إنشاء كوبونات التخفيض، تحديد النسب والمبالغ الثابتة، متابعة معدلات الاستخدام، وتفعيل الحملات التسويقية والترويجية.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#173A7C]/20 cursor-pointer border border-white/25 shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>إنشاء كود خصم جديد ⚡</span>
          </motion.button>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-[#173A7C]/10">
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">إجمالي الكوبونات</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-[#173A7C]">{coupons.length} قسيمة</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">مرات الاستخدام</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-emerald-700">{totalUsed.toLocaleString()} عملية</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">الكوبونات النشطة</p>
            <p className="text-xs sm:text-sm lg:text-base font-black text-[#173A7C]">
              {coupons.filter((c) => c.status === 'active').length} فعالة 🟢
            </p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">أعلى نسبة خصم</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-amber-600">50% خصم</p>
          </div>
        </div>
      </motion.div>

      {/* Filter and Search Bar */}
      <div className="liquid-glass-card rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/60 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
          <Ticket className="w-4 h-4 text-[#173A7C]" />
          <span>كوبونات الخصم وقسائم الشراء الترويجية</span>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث برمز الكوبون..."
            className="w-full py-2.5 pr-10 pl-4 text-xs font-bold text-slate-800 bg-white/90 rounded-xl border border-slate-200/80 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCoupons.map((coupon) => (
          <motion.div
            key={coupon.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="liquid-glass-card liquid-glass-hover rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/70 space-y-4 sm:space-y-5 relative group overflow-hidden student-card-accent"
          >
            <div className="specular-card-reflection" />

            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">كود الخصم الترويجي</span>
              <button
                onClick={() => toggleCouponStatus(coupon.id)}
                className={`px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold border cursor-pointer transition-all ${
                  coupon.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-slate-200/80 text-slate-600 border-slate-300 hover:bg-slate-300'
                }`}
              >
                {coupon.status === 'active' ? 'نشط 🟢' : 'منتهي / معطل 🔴'}
              </button>
            </div>

            <div className="p-3.5 sm:p-4.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#173A7C]/8 to-blue-50/80 border border-[#173A7C]/15 flex items-center justify-between shadow-inner">
              <div>
                <span className="font-mono font-black text-xl text-[#173A7C] tracking-wider block">
                  {coupon.code}
                </span>
                <p className="text-xs text-emerald-700 font-extrabold mt-0.5">قيمة الخصم: {coupon.discountValue}</p>
              </div>
              <button
                onClick={() => handleCopy(coupon.code)}
                className="p-2.5 rounded-xl bg-white text-[#173A7C] hover:bg-[#173A7C] hover:text-white border border-[#173A7C]/20 shadow-sm cursor-pointer transition-all"
                title="نسخ الكود"
              >
                {copiedCode === coupon.code ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-2 text-xs font-bold text-slate-600 pt-2 border-t border-[#173A7C]/10">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">عدد مرات الاستخدام:</span>
                <span className="font-mono font-black text-[#173A7C]">
                  {coupon.timesUsed} / {coupon.usageLimit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">تاريخ الانتهاء:</span>
                <span className="text-slate-800 font-extrabold">{coupon.expiryDate}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CREATE COUPON MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white/95 backdrop-blur-xl text-slate-900 rounded-xl sm:rounded-2xl border border-white/80 p-6 sm:p-8 space-y-5 shadow-2xl overflow-hidden relative my-8"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#5CB07C] via-[#173A7C] to-emerald-400" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#152C5B] student-heading-h3">إنشاء قسيمة / كود خصم جديد</h3>
                    <p className="text-xs text-slate-500 font-bold">تحديد نسبة التخفيض وعدد مرات الاستخدام</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs font-bold">
                <div className="space-y-1.5">
                  <label className="text-slate-700 block">رمز كود الخصم (Coupon Code)</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: SUSTAIN2026"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 font-mono font-black focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">نوع الخصم</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                    >
                      <option value="percentage">نسبة مئوية (%)</option>
                      <option value="fixed">مبلغ ثابت (ر.س)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">قيمة الخصم</label>
                    <input
                      type="text"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="20"
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 font-mono font-black focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">الحد الأقصى لعدد الاستخدامات</label>
                    <input
                      type="number"
                      value={newLimit}
                      onChange={(e) => setNewLimit(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 block">تاريخ الانتهاء</label>
                    <input
                      type="date"
                      value={newExpiry}
                      onChange={(e) => setNewExpiry(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 focus:outline-none focus:border-[#173A7C] focus:bg-white focus:ring-2 focus:ring-[#173A7C]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3 border-t border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-bold shadow-lg shadow-[#173A7C]/25 cursor-pointer transition-all border border-white/20"
                  >
                    إنشاء الكود وتفعيله ⚡
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
