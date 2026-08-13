'use client';

import React from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Download,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export default function AdminFinancePage() {
  const transactions = [
    {
      id: 'tx-1',
      student: 'عبدالله الشمري',
      course: 'برنامج القيادة المستدامة والمسؤولية المجتمعية',
      amount: '1,250 ر.س',
      gateway: 'تمارا Tamara',
      date: '27 يوليو 2026',
      status: 'مكتمل ومدفوع',
    },
    {
      id: 'tx-2',
      student: 'سارة العتيبي',
      course: 'الشهادة الاحترافية في إدارة الاستدامة البيئية',
      amount: '1,800 ر.س',
      gateway: 'مدى Mada',
      date: '26 يوليو 2026',
      status: 'مكتمل ومدفوع',
    },
    {
      id: 'tx-3',
      student: 'محمد الغامدي',
      course: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      amount: '2,500 ر.س',
      gateway: 'تابـي Tabby',
      date: '24 يوليو 2026',
      status: 'مكتمل ومدفوع',
    },
  ];

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
    <div className="space-y-6">

      {/* Header Banner - Ultra Premium Glass style matching Main Dashboard */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 animate-fade-in-up ultra-card-hover" style={glassNeumorphicCard}>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 pr-2 border-r-4 border-emerald-600">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>السجل المالي وتقارير الإيرادات المباشرة</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              السجل المالي والإيرادات 💰
            </h1>
            <p className="text-xs text-slate-500 font-normal max-w-2xl leading-relaxed">
              تتبع الإيرادات المباشرة، تفاصيل عمليات السداد عبر (مدى، تمارا، تابي)، وتصدير التقارير الضريبية.
            </p>
          </div>

          <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] text-white font-semibold text-xs flex items-center gap-2 shadow-md cursor-pointer border border-white/20 shrink-0">
            <Download className="w-4 h-4" />
            <span>تصدير التقرير المالي (Excel)</span>
          </button>
        </div>
      </div>

      {/* Finance Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl p-6 border space-y-3 ultra-card-hover relative overflow-hidden group" style={glassNeumorphicCard}>
          <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-500" />
          <span className="text-slate-400 font-normal text-xs block">إجمالي إيرادات الشهر الحالي</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 tracking-tight">417,900 ر.س</h3>
          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block border border-emerald-200">
            +24.5% زيادة عن الشهر السابق
          </span>
        </div>

        <div className="rounded-2xl p-6 border space-y-3 ultra-card-hover relative overflow-hidden group" style={glassNeumorphicCard}>
          <div className="absolute top-0 right-0 left-0 h-1 bg-[#173A7C]" />
          <span className="text-slate-400 font-normal text-xs block">متحصلات الأقساط (تمارا & تابي)</span>
          <h3 className="text-2xl font-extrabold text-[#173A7C] tracking-tight">187,400 ر.س</h3>
          <span className="text-[10px] font-normal text-slate-500 block">45% من إجمالي المبيعات</span>
        </div>

        <div className="rounded-2xl p-6 border space-y-3 ultra-card-hover relative overflow-hidden group" style={glassNeumorphicCard}>
          <div className="absolute top-0 right-0 left-0 h-1 bg-purple-600" />
          <span className="text-slate-400 font-normal text-xs block">ضريبة القيمة المضافة (15%)</span>
          <h3 className="text-2xl font-extrabold text-purple-700 tracking-tight">62,685 ر.س</h3>
          <span className="text-[10px] font-normal text-slate-500 block">جاهزة للتصريح الزكوي</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl overflow-hidden border border-slate-200/80 ultra-card-hover" style={glassNeumorphicCard}>
        <div className="p-5 border-b border-slate-200/50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">سجل المعاملات المالية الأخير</h3>
          <span className="text-xs font-semibold text-emerald-600">تحديث فوري 24/7</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200/60 text-slate-600 font-black">
              <tr>
                <th className="p-4">اسم الطالب</th>
                <th className="p-4">المساق التدريبي</th>
                <th className="p-4">المبلغ</th>
                <th className="p-4">بوابة الدفع</th>
                <th className="p-4">التاريخ</th>
                <th className="p-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 font-bold">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/40 transition-colors">
                  <td className="p-4 font-black text-slate-900">{tx.student}</td>
                  <td className="p-4 text-slate-700">{tx.course}</td>
                  <td className="p-4 font-mono font-black text-emerald-600">{tx.amount}</td>
                  <td className="p-4 font-bold text-[#173A7C]">{tx.gateway}</td>
                  <td className="p-4 text-slate-600">{tx.date}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {tx.status} 🟢
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
