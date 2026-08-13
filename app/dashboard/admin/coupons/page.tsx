'use client';

import React, { useState } from 'react';
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

  const glassNeumorphicCard = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(241,245,249,0.90) 100%)',
    backdropFilter: 'blur(16px) saturate(1.4)',
    WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08), 0 10px 28px rgba(15, 23, 42, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.6)',
  };

  const glassNeumorphicInset = {
    background: 'rgba(241, 245, 249, 0.7)',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
  };

  return (
    <div className="space-y-6" dir="rtl">

      {/* Header Banner - Ultra Premium Glass style matching Main Dashboard */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 animate-fade-in-up ultra-card-hover" style={glassNeumorphicCard}>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 pr-2 border-r-4 border-[#173A7C]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#173A7C] text-xs font-semibold border border-blue-200">
              <Tag className="w-4 h-4 text-[#173A7C]" />
              <span>إدارة العروض وقسائم الشراء الخصم</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              إدارة كودات الخصم والتخفيضات 🎟️
            </h1>
            <p className="text-xs text-slate-500 font-normal max-w-2xl leading-relaxed">
              إنشاء كودات التخفيض، تحديد النسب والمبالغ، متابعة إحصائيات الاستخدام، وتفعيل العروض الترويجية.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer border border-white/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء كود خصم جديد ⚡</span>
          </button>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="rounded-2xl p-6 border space-y-4 transition-all ultra-card-hover relative overflow-hidden group"
            style={glassNeumorphicCard}
          >
            <div className="absolute top-0 right-0 left-0 h-1 bg-[#173A7C]" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-400">كود الخصم</span>
              <button
                onClick={() => toggleCouponStatus(coupon.id)}
                className={`px-3 py-1 rounded-full text-[10px] font-black border cursor-pointer ${
                  coupon.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-200 text-slate-600 border-slate-300'
                }`}
              >
                {coupon.status === 'active' ? 'نشط 🟢' : 'منتهي / معطل 🔴'}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#173A7C]/10 to-blue-50 border border-blue-200/80 flex items-center justify-between">
              <div>
                <span className="font-mono font-black text-lg text-[#173A7C] tracking-wider">{coupon.code}</span>
                <p className="text-[10px] text-slate-500 font-bold">خصم: {coupon.discountValue}</p>
              </div>
              <button
                onClick={() => alert(`تم نسخ الكود: ${coupon.code}`)}
                className="p-2 rounded-xl bg-white text-[#173A7C] hover:bg-blue-50 border border-slate-200 shadow-xs cursor-pointer"
                title="نسخ الكود"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-bold text-slate-600 pt-2 border-t border-slate-200/60">
              <div className="flex justify-between">
                <span className="text-slate-400">عدد الاستخدامات:</span>
                <span className="font-mono font-black text-slate-800">
                  {coupon.timesUsed} / {coupon.usageLimit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">تاريخ الانتهاء:</span>
                <span className="text-slate-800 font-black">{coupon.expiryDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE COUPON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white text-slate-900 rounded-[32px] border border-slate-200 p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-black text-base text-slate-900">إنشاء قسيمة / كود خصم جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
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
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-black focus:outline-none focus:border-[#173A7C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700 block">نوع الخصم</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#173A7C]"
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
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-black focus:outline-none focus:border-[#173A7C]"
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
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 block">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#173A7C]"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-black cursor-pointer">
                  إلغاء
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-[#173A7C] text-white font-black shadow-lg cursor-pointer">
                  إنشاء الكود وتفعيله ⚡
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
