'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Download,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Receipt,
  PieChart,
  Wallet,
  Building,
  Search,
} from 'lucide-react';

export default function AdminFinancePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const transactions = [
    {
      id: 'tx-1',
      student: 'عبدالله الشمري',
      course: 'برنامج القيادة المستدامة والمسؤولية المجتمعية',
      amount: '1,250 ر.س',
      gateway: 'تمارا Tamara',
      date: '27 يوليو 2026',
      status: 'مكتمل ومدفوع',
      reference: 'INV-2026-9921',
    },
    {
      id: 'tx-2',
      student: 'سارة العتيبي',
      course: 'الشهادة الاحترافية في إدارة الاستدامة البيئية',
      amount: '1,800 ر.س',
      gateway: 'مدى Mada',
      date: '26 يوليو 2026',
      status: 'مكتمل ومدفوع',
      reference: 'INV-2026-9922',
    },
    {
      id: 'tx-3',
      student: 'محمد الغامدي',
      course: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      amount: '2,500 ر.س',
      gateway: 'تابـي Tabby',
      date: '24 يوليو 2026',
      status: 'مكتمل ومدفوع',
      reference: 'INV-2026-9923',
    },
    {
      id: 'tx-4',
      student: 'د. خالد الدوسري',
      course: 'دبلوم الحوكمة المؤسسية والتميز الأكاديمي',
      amount: '3,100 ر.س',
      gateway: 'Apple Pay',
      date: '22 يوليو 2026',
      status: 'مكتمل ومدفوع',
      reference: 'INV-2026-9924',
    },
  ];

  const filteredTransactions = transactions.filter(
    (t) =>
      t.student.includes(searchQuery) ||
      t.course.includes(searchQuery) ||
      t.reference.includes(searchQuery)
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#173A7C]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-20 left-10 w-[30rem] h-[30rem] bg-emerald-500/8 rounded-full blur-[160px]" />
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
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-800 text-[10px] sm:text-xs font-black border border-emerald-500/20 shrink-0 whitespace-nowrap mb-3 sm:mb-4">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>السجل المالي وتقارير الإيرادات المباشرة</span>
              </div>
              <h1 className="text-sm sm:text-2xl lg:text-3xl font-black student-heading-h1 student-name-gradient leading-snug">
                السجل المالي <span className="inline-block whitespace-nowrap">وإدارة الإيرادات 💰</span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs lg:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
              تتبع الإيرادات المباشرة، تفاصيل عمليات السداد عبر بوابات الدفع الإلكتروني (مدى، تمارا، تابي، Apple Pay)، وتصدير الفواتير الضريبية.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => alert('تم تصدير التقرير المالي الشامل بنجاح!')}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#173A7C]/20 cursor-pointer border border-white/25 shrink-0 whitespace-nowrap"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>تصدير التقرير المالي (Excel) 📊</span>
          </motion.button>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-[#173A7C]/10">
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">إجمالي المبيعات (الشهر)</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-emerald-700">417,900 ر.س</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">متحصلات الأقساط (تابي/تمارا)</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-[#173A7C]">187,400 ر.س (45%)</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">ضريبة القيمة المضافة (15%)</p>
            <p className="text-sm sm:text-base lg:text-lg font-black text-[#173A7C]">62,685 ر.س</p>
          </div>
          <div className="liquid-glass-inset p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/70">
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold">حالة التسوية البنكية</p>
            <p className="text-xs sm:text-sm lg:text-base font-black text-emerald-700">مكتملة ومطابقة 🟢</p>
          </div>
        </div>
      </motion.div>

      {/* Finance Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="liquid-glass-card liquid-glass-hover rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/70 space-y-3 relative group overflow-hidden student-card-accent"
        >
          <div className="specular-card-reflection" />
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold text-xs">إجمالي إيرادات الشهر الحالي</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-emerald-700 tracking-tight">417,900 ر.س</h3>
          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-500/10 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1 border border-emerald-500/20">
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            <span>+24.5% زيادة عن الشهر السابق</span>
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="liquid-glass-card liquid-glass-hover rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/70 space-y-3 relative group overflow-hidden student-card-accent"
        >
          <div className="specular-card-reflection" />
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold text-xs">متحصلات الأقساط (تمارا & تابي)</span>
            <div className="p-2 rounded-xl bg-[#173A7C]/10 text-[#173A7C]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-[#173A7C] tracking-tight">187,400 ر.س</h3>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#173A7C] bg-[#173A7C]/10 px-2.5 py-0.5 rounded-md inline-block border border-[#173A7C]/20">
            يمثل 45% من إجمالي مبيعات الدورات
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="liquid-glass-card liquid-glass-hover rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/70 space-y-3 relative group overflow-hidden student-card-accent"
        >
          <div className="specular-card-reflection" />
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold text-xs">ضريبة القيمة المضافة (15%)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-700">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-purple-800 tracking-tight">62,685 ر.س</h3>
          <span className="text-[10px] sm:text-[11px] font-bold text-purple-800 bg-purple-500/10 px-2.5 py-0.5 rounded-md inline-block border border-purple-500/20">
            جاهزة للتصريح الفصلي لدى هيئة الزكاة
          </span>
        </motion.div>
      </div>

      {/* Transactions Container */}
      <div className="liquid-glass-card rounded-lg sm:rounded-xl overflow-hidden border border-white/70 shadow-lg student-card-accent">
        <div className="p-4 sm:p-5 border-b border-[#173A7C]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-[#152C5B] student-heading-h3">
              سجل المعاملات والمدفوعات الإلكترونية 💳
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-bold">تحديث فوري لجميع عمليات الشراء والسداد 24/7</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث باسم المتدرب أو الفاتورة..."
              className="w-full py-2 pr-9 pl-3.5 text-xs font-bold text-slate-800 bg-white/90 rounded-lg sm:rounded-xl border border-slate-200/80 focus:outline-none focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#173A7C]/5 text-[#173A7C] font-black border-b border-[#173A7C]/10">
              <tr>
                <th className="p-4">رقم الفاتورة</th>
                <th className="p-4">اسم المتدرب</th>
                <th className="p-4">المساق التدريبي</th>
                <th className="p-4">المبلغ المسدد</th>
                <th className="p-4">بوابة الدفع</th>
                <th className="p-4">تاريخ العملية</th>
                <th className="p-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#173A7C]/8 font-bold text-slate-800">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/60 transition-colors">
                  <td className="p-4 font-mono font-black text-[#173A7C] text-xs">
                    <span className="bg-[#173A7C]/10 px-2.5 py-1 rounded-lg border border-[#173A7C]/15 text-[11px]">
                      {tx.reference}
                    </span>
                  </td>
                  <td className="p-4 font-extrabold text-[#152C5B] text-sm student-heading-h3">
                    {tx.student}
                  </td>
                  <td className="p-4 text-slate-700">{tx.course}</td>
                  <td className="p-4 font-mono font-black text-emerald-700 text-sm">{tx.amount}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-[#173A7C] font-bold border border-blue-500/20 text-[11px]">
                      {tx.gateway}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{tx.date}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-500/30">
                      {tx.status} 🟢
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-[#173A7C]/8">
          {filteredTransactions.map((tx) => (
            <div key={tx.id} className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#152C5B] student-heading-h3">{tx.student}</h4>
                  <p className="text-[10px] text-slate-500 font-bold">{tx.course}</p>
                </div>
                <span className="font-mono font-black text-emerald-700 text-xs sm:text-sm">{tx.amount}</span>
              </div>

              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="font-mono font-bold text-[#173A7C] bg-[#173A7C]/10 px-2 py-0.5 rounded border border-[#173A7C]/15">
                  {tx.reference}
                </span>
                <span className="text-slate-500 font-bold">{tx.gateway} • {tx.date}</span>
                <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
                  {tx.status} 🟢
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
