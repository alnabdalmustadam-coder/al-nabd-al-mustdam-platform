'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import {
  CreditCard,
  Download,
  ShieldCheck,
  Receipt,
  CheckCircle2,
  CheckCheck,
} from 'lucide-react';

const sectionFadeVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.16,
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.12,
      delayChildren: custom * 0.16 + 0.08,
    },
  }),
};

const textItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function StudentBillingPage() {
  const invoices = [
    {
      id: 'INV-2026-881',
      date: '15 يوليو 2026',
      courseName: 'دورة استخدام الحاسب الالي في الاعمال المكتبية',
      amount: '900 ر.س',
      paymentMethod: 'مدى (Mada) / Visa',
      status: 'paid',
      statusLabel: 'مدفوع ومكتمل',
    },
    {
      id: 'INV-2026-412',
      date: '02 يونيو 2026',
      courseName: 'دورات ادخال بيانات ومعالجة نصوص',
      amount: '1,300 ر.س',
      paymentMethod: 'Apple Pay',
      status: 'paid',
      statusLabel: 'مدفوع ومكتمل',
    },
    {
      id: 'INV-2026-109',
      date: '10 يناير 2026',
      courseName: 'دورة صيانة الجوالات',
      amount: '750 ر.س',
      paymentMethod: 'تحويل بنكي مباشر',
      status: 'paid',
      statusLabel: 'مدفوع ومكتمل',
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner Ultra Premium - Liquid Glass Theme (Unified with Student Dashboard) */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative z-20 liquid-glass-hero p-6 sm:p-8 md:p-9 space-y-4 liquid-glass-hover overflow-hidden student-card-accent rounded-2xl sm:rounded-3xl"
      >
        {/* Ambient Liquid Glowing Orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-br from-blue-600/15 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 pr-2">
            <motion.div variants={textItemVariants} className="student-tag-badge bg-blue-50 text-[#173A7C] border border-blue-200/80 shadow-xs">
              <CreditCard className="w-3.5 h-3.5 text-[#173A7C]" />
              <span>سجل المعاملات والعمليات المالية</span>
            </motion.div>

            <motion.h1 variants={textItemVariants} className="student-heading-h1">
              السجل المالي و<span className="student-name-gradient">الفواتير الرسمية</span> 💳
            </motion.h1>

            <motion.p variants={textItemVariants} className="student-text-body max-w-xl pr-0.5 pt-1.5 sm:pt-2 leading-relaxed">
              استعراض وتنزيل الفواتير الضريبية المعتمدة لاشتراكاتك في البرامج والدبلومات المعتمدة.
            </motion.p>
          </div>

          <motion.div variants={textItemVariants} className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-white/90 backdrop-blur-md text-right shrink-0 min-w-48 shadow-sm">
            <span className="text-[11px] font-black text-slate-500 block">إجمالي المدفوعات المسجلة</span>
            <span className="text-xl sm:text-2xl font-black text-[#173A7C]">5,350 ر.س</span>
            <span className="text-[10px] font-extrabold text-[#0D5C3A] flex items-center gap-1.5 mt-1">
              <CheckCheck className="w-3.5 h-3.5 text-[#0D5C3A]" />
              <span>مكتملة وموثقة ضريبياً</span>
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Subscription Status Card - Unified Liquid Glass */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={1}
        className="relative overflow-hidden rounded-2xl sm:rounded-[28px] p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 liquid-glass-card liquid-glass-hover student-card-accent"
      >
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20 shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="student-heading-h3 text-xs sm:text-base">حساب المتدرب النشط</h3>
              <span className="text-xs font-black text-white px-4 py-1.5 rounded-full bg-emerald-500 border border-emerald-400 shadow-xs whitespace-nowrap">
                عضوية نشطة
              </span>
            </div>
            <p className="text-xs text-slate-600 font-extrabold mt-1.5 leading-relaxed">
              جميع الاشتراكات والوصول للمواد التدريبية محدثة ومفعلة بشكل كامل.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Invoices List - Unified Liquid Glass Cards */}
      <div className="space-y-4">
        <motion.div
          variants={sectionFadeVariants}
          initial="hidden"
          animate="visible"
          custom={2}
          className="flex items-center justify-between pr-1"
        >
          <h2 className="student-heading-h2 flex items-center gap-2.5 pr-2.5 border-r-4 border-[#5CB07C]">
            <div className="p-1.5 rounded-xl text-[#0D5C3A] bg-emerald-100/90 border border-emerald-300/80 shadow-xs">
              <Receipt className="w-4 h-4" />
            </div>
            <span>الفواتير الضريبية المعتمدة</span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {invoices.map((inv, idx) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + idx * 0.14, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl sm:rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 liquid-glass-card liquid-glass-hover student-card-accent"
            >
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <span className="font-mono font-black text-xs text-[#173A7C] bg-blue-50/90 border border-blue-200/80 px-3.5 py-1.5 rounded-xl shadow-2xs">
                    {inv.id}
                  </span>
                  <span className="px-3.5 py-1.5 rounded-xl bg-slate-100/80 text-slate-600 font-bold text-xs border border-slate-200/60">
                    {inv.date}
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-emerald-500 text-white font-black text-xs border border-emerald-400 shadow-xs flex items-center gap-1.5 whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>{inv.statusLabel}</span>
                  </span>
                </div>

                <h3 className="student-heading-h3 text-xs sm:text-base pt-0.5">
                  {inv.courseName}
                </h3>
                <p className="text-xs text-slate-600 font-extrabold">
                  طريقة الدفع: <strong className="text-[#173A7C]">{inv.paymentMethod}</strong>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between md:justify-end gap-4 sm:gap-6 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200/60">
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 font-black block">المبلغ المدفوع</span>
                  <span className="text-base sm:text-xl font-black text-[#173A7C]">{inv.amount}</span>
                </div>

                <button
                  onClick={() => alert(`جاري تنزيل الفاتورة الضريبية رقم ${inv.id}`)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-[#173A7C]/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل الفاتورة PDF</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
