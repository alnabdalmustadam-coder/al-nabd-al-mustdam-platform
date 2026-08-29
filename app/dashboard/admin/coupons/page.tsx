'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Percent,
  Copy,
  Trash2,
  X,
  TrendingUp,
  Check,
  Ticket,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface CouponItem {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
}

export default function AdminCouponsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // New Coupon Form State
  const [newCode, setNewCode] = useState('PROMO20');
  const [newPercent, setNewPercent] = useState('20');
  const [newLimit, setNewLimit] = useState('100');
  const [newExpiry, setNewExpiry] = useState('2026-12-31');

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching coupons:', error);
      }

      if (data && data.length > 0) {
        setCoupons(data);
      } else {
        // Fallback sample coupons if empty
        setCoupons([
          {
            id: 'cp-1',
            code: 'SUSTAIN2026',
            discount_percent: 20,
            max_uses: 500,
            used_count: 312,
            expires_at: '2026-12-31T23:59:59Z',
            is_active: true,
          },
          {
            id: 'cp-2',
            code: 'WELCOME100',
            discount_percent: 15,
            max_uses: 200,
            used_count: 198,
            expires_at: '2026-08-15T23:59:59Z',
            is_active: true,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    try {
      setCreating(true);
      const supabase = createClient();
      const { error } = await supabase.from('coupons').insert({
        code: newCode.trim().toUpperCase(),
        discount_percent: parseInt(newPercent) || 10,
        max_uses: parseInt(newLimit) || 100,
        used_count: 0,
        expires_at: newExpiry ? new Date(newExpiry).toISOString() : null,
        is_active: true,
      });

      if (error) {
        console.error(error);
        alert(`خطأ: ${error.message}`);
        return;
      }

      alert('تم إنشاء كوبون الخصم بنجاح!');
      setIsModalOpen(false);
      setNewCode('');
      setNewPercent('20');
      setNewLimit('100');
      loadCoupons();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;
    try {
      const supabase = createClient();
      await supabase.from('coupons').delete().eq('id', id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
      {/* Hero Header */}
      <div className="relative z-20 liquid-glass-hero p-6 sm:p-8 rounded-2xl sm:rounded-3xl liquid-glass-hover overflow-hidden student-card-accent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#173A7C] text-xs font-black border border-blue-200">
              <Ticket className="w-3.5 h-3.5" />
              <span>الحملات التسويقية والخصومات</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black student-heading-h1">
              إدارة <span className="student-name-gradient">كوبونات وقسائم الخصم</span> 🏷️
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-xl">
              إنشاء وإدارة أكواد الخصم الترويجية، تحديد نسب الخصم ومرات الاستخدام وتواريخ الصلاحية.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-[#173A7C]/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء كود جديد</span>
          </button>
        </div>
      </div>

      {/* Search and List */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بكود الكوبون..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/80"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
          <p className="text-xs font-bold text-slate-500">جاري تحميل الكوبونات...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-3">
          <Tag className="w-12 h-12 text-[#173A7C]/30 mx-auto" />
          <h3 className="text-base font-black text-slate-900">لا توجد كوبونات مسجلة</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl liquid-glass-card liquid-glass-hover space-y-3 relative overflow-hidden student-card-accent"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-[#173A7C] bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                    {c.code}
                  </span>
                  <button
                    onClick={() => handleCopyCode(c.code)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#173A7C] cursor-pointer"
                    title="نسخ الكود"
                  >
                    {copiedCode === c.code ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteCoupon(c.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-200/60">
                <span className="text-slate-500">نسبة الخصم:</span>
                <span className="text-emerald-700 font-black text-sm">{c.discount_percent}%</span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">مرات الاستخدام:</span>
                <span className="text-slate-800">{c.used_count} / {c.max_uses}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">الحالة:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                    c.is_active
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-red-50 text-red-800 border border-red-300'
                  }`}
                >
                  {c.is_active ? 'فعّال' : 'منتهي / معطل'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl p-6 bg-white shadow-2xl border border-white/60 text-right space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="student-heading-h3">إنشاء كود خصم ترويجي جديد</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">كود الخصم (Code)</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="مثال: SUSTAIN20"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase font-mono focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">نسبة الخصم (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={newPercent}
                      onChange={(e) => setNewPercent(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700">الحد الأقصى للاستخدام</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newLimit}
                      onChange={(e) => setNewLimit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">تاريخ انتهاء الصلاحية</label>
                  <input
                    type="date"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>{creating ? 'جاري الحفظ...' : 'حفظ وتفعيل الكوبون'}</span>
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
