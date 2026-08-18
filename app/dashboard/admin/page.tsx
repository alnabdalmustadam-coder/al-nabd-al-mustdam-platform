'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Award,
  DollarSign,
  Crown,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ChevronLeft,
  CreditCard,
  BarChart3,
  PieChart,
  MapPin,
  Target,
  Star,
  Smile,
  Flame,
  Zap,
  GraduationCap,
} from 'lucide-react';

interface BarChartDataPoint {
  id: number;
  name: string;
  shortName: string;
  revText: string;
  rawAmount: number;
  amount: string;
  growth: string;
  studentsCount: string;
  txCount: number;
  heightPercent: number;
  status: 'completed' | 'current' | 'forecast';
}

const sectionFadeVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
      delayChildren: custom * 0.08 + 0.04,
    },
  }),
};

const textItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('year');

  // Full 12-Months Revenue Bar Data (From January to December)
  const yearlyRevenueData: BarChartDataPoint[] = [
    { id: 1, name: 'يناير', shortName: 'يناير', revText: '210k', rawAmount: 210000, amount: '210,000 ر.س', growth: '+12.5%', studentsCount: '1,120 متدرب', txCount: 168, heightPercent: 32, status: 'completed' },
    { id: 2, name: 'فبراير', shortName: 'فبراير', revText: '245k', rawAmount: 245000, amount: '245,000 ر.س', growth: '+16.7%', studentsCount: '1,280 متدرب', txCount: 196, heightPercent: 37, status: 'completed' },
    { id: 3, name: 'مارس', shortName: 'مارس', revText: '290k', rawAmount: 290000, amount: '290,000 ر.س', growth: '+18.4%', studentsCount: '1,450 متدرب', txCount: 232, heightPercent: 44, status: 'completed' },
    { id: 4, name: 'أبريل', shortName: 'أبريل', revText: '320k', rawAmount: 320000, amount: '320,000 ر.س', growth: '+10.3%', studentsCount: '1,590 متدرب', txCount: 256, heightPercent: 49, status: 'completed' },
    { id: 5, name: 'مايو', shortName: 'مايو', revText: '380k', rawAmount: 380000, amount: '380,000 ر.س', growth: '+18.8%', studentsCount: '1,820 متدرب', txCount: 304, heightPercent: 58, status: 'completed' },
    { id: 6, name: 'يونيو', shortName: 'يونيو', revText: '418k', rawAmount: 417900, amount: '417,900 ر.س', growth: '+24.5%', studentsCount: '2,100 متدرب', txCount: 334, heightPercent: 64, status: 'completed' },
    { id: 7, name: 'يوليو', shortName: 'يوليو', revText: '450k', rawAmount: 450000, amount: '450,000 ر.س', growth: '+7.7%', studentsCount: '2,350 متدرب', txCount: 360, heightPercent: 69, status: 'current' },
    { id: 8, name: 'أغسطس', shortName: 'أغسطس', revText: '480k', rawAmount: 480000, amount: '480,000 ر.س', growth: '+6.6%', studentsCount: '2,480 متدرب', txCount: 384, heightPercent: 74, status: 'forecast' },
    { id: 9, name: 'سبتمبر', shortName: 'سبتمبر', revText: '520k', rawAmount: 520000, amount: '520,000 ر.س', growth: '+8.3%', studentsCount: '2,650 متدرب', txCount: 416, heightPercent: 80, status: 'forecast' },
    { id: 10, name: 'أكتوبر', shortName: 'أكتوبر', revText: '570k', rawAmount: 570000, amount: '570,000 ر.س', growth: '+9.6%', studentsCount: '2,820 متدرب', txCount: 456, heightPercent: 87, status: 'forecast' },
    { id: 11, name: 'نوفمبر', shortName: 'نوفمبر', revText: '610k', rawAmount: 610000, amount: '610,000 ر.س', growth: '+7.0%', studentsCount: '2,980 متدرب', txCount: 488, heightPercent: 93, status: 'forecast' },
    { id: 12, name: 'ديسمبر', shortName: 'ديسمبر', revText: '680k', rawAmount: 680000, amount: '680,000 ر.س', growth: '+11.5%', studentsCount: '3,250 متدرب', txCount: 544, heightPercent: 100, status: 'forecast' },
  ];

  const monthlyWeekData: BarChartDataPoint[] = [
    { id: 1, name: 'الأسبوع 1', shortName: 'أ 1', revText: '95k', rawAmount: 95000, amount: '95,000 ر.س', growth: '+8.2%', studentsCount: '520 متدرب', txCount: 76, heightPercent: 45, status: 'completed' },
    { id: 2, name: 'الأسبوع 2', shortName: 'أ 2', revText: '110k', rawAmount: 110000, amount: '110,000 ر.س', growth: '+15.8%', studentsCount: '610 متدرب', txCount: 88, heightPercent: 55, status: 'completed' },
    { id: 3, name: 'الأسبوع 3', shortName: 'أ 3', revText: '135k', rawAmount: 135000, amount: '135,000 ر.س', growth: '+22.7%', studentsCount: '740 متدرب', txCount: 108, heightPercent: 72, status: 'completed' },
    { id: 4, name: 'الأسبوع 4', shortName: 'أ 4', revText: '177k', rawAmount: 177900, amount: '177,900 ر.س', growth: '+31.4%', studentsCount: '980 متدرب', txCount: 142, heightPercent: 100, status: 'current' },
  ];

  const weeklyDayData: BarChartDataPoint[] = [
    { id: 1, name: 'السبت', shortName: 'سبت', revText: '14k', rawAmount: 14000, amount: '14,000 ر.س', growth: '+5.1%', studentsCount: '65 متدرب', txCount: 12, heightPercent: 35, status: 'completed' },
    { id: 2, name: 'الأحد', shortName: 'أحد', revText: '22k', rawAmount: 22000, amount: '22,000 ر.س', growth: '+12.4%', studentsCount: '110 متدرب', txCount: 18, heightPercent: 55, status: 'completed' },
    { id: 3, name: 'الاثنين', shortName: 'اثنين', revText: '28k', rawAmount: 28000, amount: '28,000 ر.س', growth: '+18.0%', studentsCount: '145 متدرب', txCount: 24, heightPercent: 70, status: 'completed' },
    { id: 4, name: 'الثلاثاء', shortName: 'ثلاثاء', revText: '35k', rawAmount: 35000, amount: '35,000 ر.س', growth: '+25.0%', studentsCount: '180 متدرب', txCount: 30, heightPercent: 88, status: 'completed' },
    { id: 5, name: 'الأربعاء', shortName: 'أربعاء', revText: '40k', rawAmount: 40000, amount: '40,000 ر.س', growth: '+14.3%', studentsCount: '210 متدرب', txCount: 36, heightPercent: 100, status: 'current' },
    { id: 6, name: 'الخميس', shortName: 'خميس', revText: '32k', rawAmount: 32000, amount: '32,000 ر.س', growth: '+8.0%', studentsCount: '160 متدرب', txCount: 28, heightPercent: 80, status: 'forecast' },
    { id: 7, name: 'الجمعة', shortName: 'جمعة', revText: '18k', rawAmount: 18000, amount: '18,000 ر.س', growth: '+4.5%', studentsCount: '90 متدرب', txCount: 16, heightPercent: 45, status: 'forecast' },
  ];

  const todayHourData: BarChartDataPoint[] = [
    { id: 1, name: '8:00 ص', shortName: '8 ص', revText: '3.2k', rawAmount: 3200, amount: '3,200 ر.س', growth: '+4.0%', studentsCount: '12 متدرب', txCount: 3, heightPercent: 25, status: 'completed' },
    { id: 2, name: '12:00 ظ', shortName: '12 ظ', revText: '5.8k', rawAmount: 5800, amount: '5,800 ر.س', growth: '+11.5%', studentsCount: '24 متدرب', txCount: 5, heightPercent: 45, status: 'completed' },
    { id: 3, name: '4:00 ع', shortName: '4 ع', revText: '8.4k', rawAmount: 8400, amount: '8,400 ر.س', growth: '+20.1%', studentsCount: '42 متدرب', txCount: 8, heightPercent: 65, status: 'completed' },
    { id: 4, name: '8:00 م', shortName: '8 م', revText: '12.9k', rawAmount: 12900, amount: '12,900 ر.س', growth: '+45.0%', studentsCount: '68 متدرب', txCount: 14, heightPercent: 100, status: 'current' },
    { id: 5, name: '10:00 م', shortName: '10 م', revText: '9.1k', rawAmount: 9100, amount: '9,100 ر.س', growth: '+15.2%', studentsCount: '48 متدرب', txCount: 9, heightPercent: 72, status: 'forecast' },
    { id: 6, name: '12:00 ل', shortName: '12 ل', revText: '4.5k', rawAmount: 4500, amount: '4,500 ر.س', growth: '+6.0%', studentsCount: '20 متدرب', txCount: 4, heightPercent: 35, status: 'forecast' },
  ];

  const currentChartData =
    timeRange === 'year'
      ? yearlyRevenueData
      : timeRange === 'month'
      ? monthlyWeekData
      : timeRange === 'week'
      ? weeklyDayData
      : todayHourData;

  const [selectedPoint, setSelectedPoint] = useState<BarChartDataPoint>(yearlyRevenueData[6]);

  const kpiData = [
    {
      title: 'الإيرادات الإجمالية Direct Revenue',
      value: '1,482,900 ر.س',
      growth: '+18.4% نمو شهري',
      icon: DollarSign,
      topBar: 'from-[#5CB07C] to-emerald-400',
      iconGradient: 'from-[#5CB07C] to-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    },
    {
      title: 'المتدربين والطلاب النشطين',
      value: '14,250 طالب',
      growth: '+1,840 تسجيل جديد',
      icon: Users,
      topBar: 'from-[#173A7C] to-[#1E4D9D]',
      iconGradient: 'from-[#173A7C] to-[#1E4D9D]',
      badgeBg: 'bg-blue-50 text-[#173A7C] border-blue-300',
    },
    {
      title: 'الشهادات الصادرة المعتمدة',
      value: '9,840 شهادة',
      growth: 'موثقة بالمركز الوطني 24/7',
      icon: Award,
      topBar: 'from-amber-400 to-yellow-500',
      iconGradient: 'from-amber-500 to-yellow-600',
      badgeBg: 'bg-amber-50 text-amber-900 border-amber-300',
    },
    {
      title: 'معدل إكمال وتفاعل المساقات',
      value: '94.2%',
      growth: '+3.1% ارتفاع الإنجاز',
      icon: Target,
      topBar: 'from-blue-500 to-indigo-600',
      iconGradient: 'from-blue-600 to-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    },
  ];

  const funnelSteps = [
    { label: 'التسجيل والزيارات الأولى للمنصة', count: '18,400 زائر', percent: 100, color: 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D]' },
    { label: 'بدء أول درس في المساق المعتمد', count: '16,920 متدرب', percent: 92, color: 'bg-gradient-to-r from-[#1E4D9D] to-blue-500' },
    { label: 'إكمال نصف محتوى البرنامج (%50)', count: '15,200 متدرب', percent: 82.6, color: 'bg-gradient-to-r from-blue-500 to-[#5CB07C]' },
    { label: 'اجتياز الاختبارات التقييمية بنجاح', count: '14,350 متدرب', percent: 78, color: 'bg-gradient-to-r from-[#5CB07C] to-emerald-400' },
    { label: 'إصدار الشهادة وتوثيق الاعتماد الأكاديمي', count: '13,950 شهادة', percent: 75.8, color: 'bg-gradient-to-r from-amber-400 to-amber-500' },
  ];

  const topCourses = [
    {
      title: 'دورة استخدام الحاسب الالي في الاعمال المكتبية',
      category: 'أعمال مكتبية',
      instructor: 'د. محمد القحطاني',
      students: 1250,
      revenue: '1,125,000 ر.س',
      rating: '4.95',
      completion: 96,
    },
    {
      title: 'دورات ادخال بيانات ومعالجة نصوص',
      category: 'إدخال بيانات',
      instructor: 'أ. د. سارة العتيبي',
      students: 980,
      revenue: '1,274,000 ر.س',
      rating: '4.92',
      completion: 94,
    },
    {
      title: 'دورة الذكاء الاصطناعي وهندسة الأوامر',
      category: 'تقنية',
      instructor: 'د. خالد الدوسري',
      students: 1120,
      revenue: '504,000 ر.س',
      rating: '4.88',
      completion: 91,
    },
  ];

  const regionalDistribution = [
    { region: 'منطقة الرياض', percentage: 42, count: '5,985 طالب' },
    { region: 'منطقة مكة المكرمة (جدة/مكة)', percentage: 28, count: '3,990 طالب' },
    { region: 'المنطقة الشرقية (الدمام/الخبر)', percentage: 18, count: '2,565 طالب' },
    { region: 'باقي مناطق المملكة والدول المجاورة', percentage: 12, count: '1,710 طالب' },
  ];

  const recentActivities = [
    {
      id: '1',
      title: 'إصدار شهادة معتمدة بنجاح ⚡',
      desc: 'تم إصدار شهادة (استخدام الحاسب الآلي) للمتدرب عبدالله الشمري بنسبة %98',
      time: 'منذ 4 دقائق',
      icon: Award,
      badge: 'الشهادات',
      badgeColor: 'text-amber-800 bg-amber-100/90 border-amber-300',
    },
    {
      id: '2',
      title: 'عملية دفع جديدة عبر (تمارا)',
      desc: 'سداد القسط الأول 433 ر.س لدورة إدخال البيانات ومعالجة النصوص',
      time: 'منذ 14 دقيقة',
      icon: CreditCard,
      badge: 'المالية',
      badgeColor: 'text-emerald-800 bg-emerald-100/90 border-emerald-300',
    },
    {
      id: '3',
      title: 'تسجيل متدرب جديد في المنصة',
      desc: 'انضم المتدرب د. خالد العتيبي إلى مساق دورة الذكاء الاصطناعي',
      time: 'منذ 35 دقيقة',
      icon: Users,
      badge: 'الطلاب',
      badgeColor: 'text-[#173A7C] bg-blue-100/90 border-blue-300',
    },
    {
      id: '4',
      title: 'تذكرة دعم فني جديدة قيد المعالجة',
      desc: 'استفسار بشأن الاسترداد المالي من المتدربة ريم الجهني',
      time: 'منذ ساعة',
      icon: Clock,
      badge: 'الدعم',
      badgeColor: 'text-indigo-800 bg-indigo-100/90 border-indigo-300',
    },
  ];

  return (
    <div className="space-y-3.5 sm:space-y-5 font-[family-name:var(--font-cairo)] text-slate-800">

      {/* ── 1. Executive Welcome Hero Banner (Ultra Premium Liquid Glass) ── */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative z-20 liquid-glass-hero p-4 sm:p-6 lg:p-7 min-h-[145px] sm:min-h-[185px] flex flex-col justify-center liquid-glass-hover overflow-hidden student-card-accent rounded-lg sm:rounded-xl lg:rounded-2xl"
      >
        {/* Specular line */}
        <div className="specular-card-reflection" />

        {/* Ambient Liquid Glowing Orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-[#173A7C]/20 to-[#1E4D9D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-br from-[#5CB07C]/20 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2.5 pr-0.5 sm:pr-2">
            <motion.div variants={textItemVariants} className="flex flex-col items-start">
              <div className="admin-hero-tag bg-[#173A7C]/10 text-[#173A7C] border border-[#173A7C]/15">
                <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                <span>مركز التحليلات الذكية والأداء المؤسسي</span>
              </div>
              <h1 className="text-sm sm:text-xl lg:text-2xl font-black student-heading-h1 leading-snug">
                مركز التحليلات وإدارة الأداء المالي والأكاديمي <span className="student-name-gradient">Sustain Pulse</span>
              </h1>
            </motion.div>

            <motion.p variants={textItemVariants} className="text-[11px] sm:text-[13px] text-slate-600 font-medium max-w-2xl pr-0.5 leading-relaxed">
              مؤشرات شاملة وفورية للمبيعات، معدلات إنجاز البرامج الأكاديمية، توزيع المتدربين الجغرافي، وإصدار الشهادات المعتمدة.
            </motion.p>
          </div>

          {/* Time Range Filter Controls - Single Row Grid on 360px Mobile */}
          <motion.div variants={textItemVariants} className="grid grid-cols-4 sm:flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-slate-200/80 bg-white/90 backdrop-blur-md w-full sm:w-auto shrink-0 shadow-xs">
            {[
              { key: 'year', label: 'العام (12ش)', desktopLabel: 'هذا العام (12 شهراً)' },
              { key: 'month', label: 'الشهر', desktopLabel: 'هذا الشهر' },
              { key: 'week', label: 'الأسبوع', desktopLabel: 'هذا الأسبوع' },
              { key: 'today', label: 'اليوم', desktopLabel: 'اليوم' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTimeRange(t.key as any);
                  if (t.key === 'year') setSelectedPoint(yearlyRevenueData[6]);
                  else if (t.key === 'month') setSelectedPoint(monthlyWeekData[3]);
                  else if (t.key === 'week') setSelectedPoint(weeklyDayData[4]);
                  else setSelectedPoint(todayHourData[3]);
                }}
                className={`py-1.5 px-1 sm:px-3 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold text-center transition-all cursor-pointer truncate ${
                  timeRange === t.key
                    ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-sm shadow-[#173A7C]/25 border border-white/20'
                    : 'text-[#173A7C] hover:text-[#173A7C] hover:bg-slate-100/80'
                }`}
              >
                <span className="sm:hidden">{t.label}</span>
                <span className="hidden sm:inline">{t.desktopLabel}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ── 2. Executive KPI Cards (Liquid Glass Finish with Badges Next to Icons) ── */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={1}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {kpiData.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              variants={cardItemVariants}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative overflow-hidden rounded-lg sm:rounded-xl p-3.5 sm:p-4.5 pr-4 sm:pr-6 min-h-[92px] sm:min-h-[105px] liquid-glass-card liquid-glass-hover flex flex-col justify-between group cursor-default student-card-accent"
            >
              {/* Specular reflection line */}
              <div className="specular-card-reflection" />

              {/* Top Accent Gradient Ribbon */}
              <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${kpi.topBar}`} />

              {/* Badges directly next to Icons */}
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br ${kpi.iconGradient} text-white flex items-center justify-center shadow-md shadow-slate-900/10 border border-white/30 shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[10.5px] font-black border flex items-center gap-1 shadow-2xs ${kpi.badgeBg} shrink-0 whitespace-nowrap`}>
                  <ArrowUpRight className="w-3 h-3 shrink-0" />
                  <span>{kpi.growth}</span>
                </span>
              </div>

              <div className="space-y-0.5 pt-2">
                <span className="text-[#173A7C]/80 font-bold text-[11px] block">{kpi.title}</span>
                <h3 className="text-lg sm:text-xl font-black text-[#173A7C] font-mono tracking-tight leading-none [text-shadow:_0_1px_0_rgba(255,255,255,0.35)]">
                  {kpi.value}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── 3. Main Chart Suite 1: Interactive Revenue Bar Chart & Funnel ── */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={2}
        className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-5"
      >
        {/* Modern Interactive 12-Month Bar Chart (2 Columns) */}
        <div className="lg:col-span-2 rounded-lg sm:rounded-xl p-3.5 sm:p-5 pr-4 sm:pr-6 space-y-3.5 sm:space-y-4 flex flex-col justify-between liquid-glass-card liquid-glass-hover student-card-accent relative overflow-hidden">
          <div className="specular-card-reflection" />

          {/* Chart Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-slate-200/60">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-50 text-[#173A7C] border border-blue-200/80 flex items-center justify-center shadow-xs shrink-0">
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#173A7C]" />
              </div>
              <div className="min-w-0">
                <h3 className="student-heading-h3 text-xs sm:text-sm font-black truncate">مخطط نمو الإيرادات والمبيعات</h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold truncate">
                  {timeRange === 'year'
                    ? 'إحصاءات شهرية متكاملة من يناير حتى ديسمبر'
                    : timeRange === 'month'
                    ? 'إحصاءات أسابيع الشهر الحالي'
                    : timeRange === 'week'
                    ? 'إحصاءات أيام الأسبوع الجاري'
                    : 'إحصاءات ساعات التفاعل اليومية'}
                </p>
              </div>
            </div>

            <div className="self-start sm:self-auto flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 sm:px-3.5 py-1 rounded-full border border-emerald-200 shadow-2xs shrink-0 whitespace-nowrap">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>+24.8% نمو قياسي</span>
            </div>
          </div>

          {/* Selected Month Deep Stats Banner (Instant Live Insight) */}
          <motion.div
            key={selectedPoint.id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3.5 rounded-xl bg-gradient-to-r from-[#173A7C]/5 via-[#1E4D9D]/5 to-[#5CB07C]/10 border border-[#173A7C]/15 shadow-2xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 font-mono">
                {selectedPoint.id}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-xs sm:text-sm text-[#173A7C]">
                    إحصاءات: شهر {selectedPoint.name}
                  </span>
                  <span
                    className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[9.5px] font-black border shrink-0 whitespace-nowrap ${
                      selectedPoint.status === 'completed'
                        ? 'bg-blue-50 text-[#173A7C] border-blue-200'
                        : selectedPoint.status === 'current'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 animate-pulse'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {selectedPoint.status === 'completed'
                      ? 'إيراد فعلي ✓'
                      : selectedPoint.status === 'current'
                      ? 'الشهر الجاري ⚡'
                      : 'مستهدف متوقع 🎯'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold truncate">
                  {selectedPoint.txCount} عملية سداد • {selectedPoint.studentsCount}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 mr-auto sm:mr-0">
              <div className="text-right">
                <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold block">إجمالي الإيراد</span>
                <span className="text-xs sm:text-base font-black font-mono text-emerald-700 block leading-tight">
                  {selectedPoint.amount}
                </span>
              </div>
              <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-100/90 text-emerald-800 border border-emerald-300 text-[10px] sm:text-xs font-black font-mono shadow-2xs shrink-0 whitespace-nowrap">
                {selectedPoint.growth}
              </div>
            </div>
          </motion.div>

          {/* Interactive Bar Chart Canvas */}
          <div className="relative pt-2 pb-1">
            {/* Background Horizontal Guide Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-25 pb-14 pt-2">
              <div className="border-b border-dashed border-slate-400 w-full" />
              <div className="border-b border-dashed border-slate-400 w-full" />
              <div className="border-b border-dashed border-slate-400 w-full" />
              <div className="border-b border-slate-400 w-full" />
            </div>

            {/* Columns Grid (All 12 Months: January -> December) */}
            <div
              className={`grid ${
                timeRange === 'year'
                  ? 'grid-cols-12 gap-0.5 sm:gap-2'
                  : timeRange === 'month'
                  ? 'grid-cols-4 gap-2 sm:gap-4'
                  : timeRange === 'week'
                  ? 'grid-cols-7 gap-1 sm:gap-2.5'
                  : 'grid-cols-6 gap-1.5 sm:gap-3'
              } items-end h-48 sm:h-56 pb-2 pt-2 relative`}
              dir="ltr"
            >
              {currentChartData.map((m, idx) => {
                const isSelected = selectedPoint.id === m.id;

                return (
                  <div
                    key={m.id}
                    className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    onMouseEnter={() => setSelectedPoint(m)}
                    onClick={() => setSelectedPoint(m)}
                  >
                    {/* Top Value Tag */}
                    <div
                      className={`mb-1 transition-all text-center ${
                        isSelected
                          ? 'opacity-100 transform -translate-y-1 scale-110 z-10'
                          : 'opacity-75 sm:opacity-85 group-hover:opacity-100 group-hover:-translate-y-0.5'
                      }`}
                    >
                      <span
                        className={`text-[7px] sm:text-[10px] font-mono font-black px-0.5 sm:px-1.5 py-0.5 rounded sm:rounded-md border shadow-2xs block truncate max-w-[28px] sm:max-w-none ${
                          isSelected
                            ? 'bg-[#173A7C] text-white border-[#173A7C]'
                            : m.status === 'current'
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-white/95 text-slate-700 border-slate-200/90 group-hover:border-[#173A7C]/40 group-hover:text-[#173A7C]'
                        }`}
                      >
                        {m.revText}
                      </span>
                    </div>

                    {/* Bar Track & Animated Column */}
                    <div className="w-full max-w-[22px] sm:max-w-[38px] h-full flex items-end justify-center bg-slate-100/70 hover:bg-slate-200/60 rounded-t-lg sm:rounded-t-2xl p-0.5 sm:p-1 transition-all">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${m.heightPercent}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
                        className={`w-full rounded-t-md sm:rounded-t-xl transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'bg-gradient-to-t from-[#173A7C] via-[#1E4D9D] to-emerald-400 shadow-lg shadow-[#173A7C]/30 ring-2 ring-emerald-400'
                            : m.status === 'current'
                            ? 'bg-gradient-to-t from-[#173A7C] via-[#5CB07C] to-emerald-400 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/60'
                            : m.status === 'completed'
                            ? 'bg-gradient-to-t from-[#173A7C] via-[#1E4D9D] to-[#5CB07C] group-hover:to-emerald-400 group-hover:shadow-md'
                            : 'bg-gradient-to-t from-[#173A7C]/35 via-[#1E4D9D]/30 to-[#5CB07C]/35 border-t-2 border-dashed border-emerald-400/80'
                        }`}
                      >
                        {/* Specular Inner Sheen */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent opacity-60 pointer-events-none" />
                        {/* Pulse indicator for active current month */}
                        {m.status === 'current' && (
                          <div className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 left-0.5 sm:left-1 h-0.5 sm:h-1 bg-white rounded-full animate-pulse opacity-80" />
                        )}
                      </motion.div>
                    </div>

                    {/* Bottom Month Label: Number on Mobile (1..12), Full Name on Desktop */}
                    <div className="pt-1.5 sm:pt-2 text-center w-full leading-tight">
                      <span
                        className={`text-[9px] sm:text-[11px] block transition-colors ${
                          isSelected
                            ? 'text-[#173A7C] font-black scale-105'
                            : m.status === 'current'
                            ? 'text-emerald-800 font-extrabold'
                            : 'text-slate-600 font-bold group-hover:text-[#173A7C]'
                        }`}
                      >
                        {timeRange === 'year' ? (
                          <>
                            <span className="sm:hidden font-mono font-black">{m.id}</span>
                            <span className="hidden sm:inline truncate">{m.name}</span>
                          </>
                        ) : (
                          <span className="truncate">{m.name}</span>
                        )}
                      </span>
                      <span
                        className={`hidden sm:block text-[8px] sm:text-[9px] font-mono font-bold truncate ${
                          isSelected
                            ? 'text-emerald-700 font-black'
                            : m.status === 'current'
                            ? 'text-emerald-600 font-bold'
                            : 'text-slate-400'
                        }`}
                      >
                        {m.growth}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Gateways Split Row - Compressed with Inline Percentage */}
          <div className="pt-2.5 border-t border-slate-200/60 space-y-1.5">
            <h4 className="student-heading-h3 text-xs flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-emerald-600" />
              <span>توزيع عمليات السداد عبر بوابات الدفع الإلكتروني المعتمدة</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 sm:p-2.5 rounded-lg bg-white/75 border border-slate-200/70 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-bold text-[10px] block">بطاقات مدى</span>
                  <span className="text-[10px] text-emerald-700 font-black font-mono block">188,055 ر.س</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#173A7C]/10 text-[#173A7C] border border-[#173A7C]/20">
                  45%
                </span>
              </div>

              <div className="p-2 sm:p-2.5 rounded-lg bg-white/75 border border-slate-200/70 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-bold text-[10px] block">أقساط تمارا</span>
                  <span className="text-[10px] text-emerald-700 font-black font-mono block">125,370 ر.س</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
                  30%
                </span>
              </div>

              <div className="p-2 sm:p-2.5 rounded-lg bg-white/75 border border-slate-200/70 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-bold text-[10px] block">أقساط تابي</span>
                  <span className="text-[10px] text-indigo-600 font-black font-mono block">62,685 ر.س</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-700 border border-indigo-500/20">
                  15%
                </span>
              </div>

              <div className="p-2 sm:p-2.5 rounded-lg bg-white/75 border border-slate-200/70 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-bold text-[10px] block">Visa / Master</span>
                  <span className="text-[10px] text-amber-600 font-black font-mono block">41,790 ر.س</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-800 border border-amber-500/20">
                  10%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Completion Funnel Chart (1 Column) */}
        <div className="rounded-lg sm:rounded-xl p-3.5 sm:p-5 pr-4 sm:pr-6 space-y-3.5 sm:space-y-4 flex flex-col justify-between liquid-glass-card liquid-glass-hover student-card-accent relative overflow-hidden">
          <div className="specular-card-reflection" />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs shrink-0">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <h3 className="student-heading-h3 text-xs sm:text-sm font-black truncate">قمع التحويل الأكاديمي</h3>
              </div>
              <span className="text-[10px] sm:text-xs font-black text-[#173A7C] bg-blue-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-blue-200 shrink-0 whitespace-nowrap">
                نسبة الإكمال
              </span>
            </div>

            {/* Funnel Steps Meter */}
            <div className="space-y-2.5">
              {funnelSteps.map((step, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-700">{step.label}</span>
                    <span className="text-[#173A7C] font-black font-mono">{step.percent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${step.color} transition-all duration-500`}
                      style={{ width: `${step.percent}%` }}
                    />
                  </div>
                  <span className="text-[9.5px] text-slate-500 font-bold block text-left">{step.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Student Satisfaction NPS Meter */}
          <div className="p-3 rounded-lg sm:rounded-xl bg-emerald-50/90 border border-emerald-200/80 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#5CB07C] to-emerald-600 text-white shadow-xs shrink-0">
                <Smile className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-xs text-[#173A7C] truncate">صافي رضا المستفيدين (NPS)</h4>
                <span className="text-[10px] font-bold text-emerald-800 truncate block">تقييم الطلاب 4.95 / 5.0</span>
              </div>
            </div>
            <span className="font-black text-base text-emerald-700 font-mono shrink-0">94.8%</span>
          </div>
        </div>
      </motion.div>

      {/* ── 4. Main Chart Suite 2: Geographic Map Distribution & Peak Learning Hours ── */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={3}
        className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-5"
      >
        {/* Regional Distribution Bar Map */}
        <div className="rounded-lg sm:rounded-xl p-3.5 sm:p-5 pr-4 sm:pr-6 space-y-3.5 sm:space-y-4 liquid-glass-card liquid-glass-hover student-card-accent relative overflow-hidden">
          <div className="specular-card-reflection" />

          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs shrink-0">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <h3 className="student-heading-h3 text-xs sm:text-sm font-black truncate">التوزيع الجغرافي للمتدربين</h3>
            </div>
            <span className="text-[10px] sm:text-xs font-black text-[#173A7C] bg-blue-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-blue-200 shrink-0 whitespace-nowrap">
              المملكة
            </span>
          </div>

          <div className="space-y-2.5">
            {regionalDistribution.map((reg, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-700">{reg.region}</span>
                  <span className="text-[#173A7C] font-black font-mono">{reg.percentage}% ({reg.count})</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#5CB07C]"
                    style={{ width: `${reg.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours Engagement Chart */}
        <div className="lg:col-span-2 rounded-lg sm:rounded-xl p-3.5 sm:p-5 pr-4 sm:pr-6 space-y-3.5 sm:space-y-4 flex flex-col justify-between liquid-glass-card liquid-glass-hover student-card-accent relative overflow-hidden">
          <div className="specular-card-reflection" />

          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg sm:rounded-xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center shadow-xs shrink-0">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <h3 className="student-heading-h3 text-xs sm:text-sm font-black truncate">ساعات الذروة والتفاعل الأكاديمي</h3>
            </div>
            <span className="text-[10px] sm:text-xs font-black text-amber-800 bg-amber-100/90 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-amber-300 shadow-2xs shrink-0 whitespace-nowrap">
              ذروة المساء 🔥
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
              تظهر تحليلات المنصة أن الذروة الكبرى لتصفح الدروس وحضور اللقاءات تتركز بين <span className="text-[#173A7C] font-extrabold">8:00م - 11:30م</span> بنسبة 68% من إجمالي التفاعل.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg sm:rounded-xl space-y-0.5 bg-white/70 border border-slate-200/70 shadow-2xs">
                <span className="text-slate-500 font-bold text-[9.5px] block">صباحاً (8 - 12)</span>
                <span className="text-[#173A7C] text-sm block font-mono font-black">12%</span>
                <span className="text-[9px] text-slate-400 font-bold block">هادئ</span>
              </div>
              <div className="p-2.5 rounded-lg sm:rounded-xl space-y-0.5 bg-white/70 border border-slate-200/70 shadow-2xs">
                <span className="text-slate-500 font-bold text-[9.5px] block">ظهراً (12 - 4)</span>
                <span className="text-[#173A7C] text-sm block font-mono font-black">15%</span>
                <span className="text-[9px] text-slate-400 font-bold block">متوسط</span>
              </div>
              <div className="p-2.5 rounded-lg sm:rounded-xl space-y-0.5 bg-white/70 border border-slate-200/70 shadow-2xs">
                <span className="text-slate-500 font-bold text-[9.5px] block">عصراً (4 - 8)</span>
                <span className="text-[#1E4D9D] text-sm block font-mono font-black">28%</span>
                <span className="text-[9px] text-blue-600 font-bold block">نشط</span>
              </div>
              <div className="p-2.5 rounded-lg sm:rounded-xl space-y-0.5 bg-amber-50/90 border border-amber-200/90 shadow-2xs">
                <span className="text-amber-900 font-bold text-[9.5px] block">مساءً (8 - 12)</span>
                <span className="text-amber-700 text-sm block font-mono font-black">68%</span>
                <span className="text-[9px] text-amber-800 font-extrabold block">أعلى ذروة 🔥</span>
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-500 gap-2">
            <span className="truncate">تحديث البيانات: تلقائي كل 60 ثانية</span>
            <span className="text-emerald-700 font-black flex items-center gap-1 shrink-0 whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>الخوادم تعمل 100%</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── 5. Main Analytics Section 3: Top Performing Courses Leaderboard ── */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={4}
        className="rounded-lg sm:rounded-xl p-3.5 sm:p-5 pr-4 sm:pr-6 space-y-3.5 sm:space-y-4 liquid-glass-card liquid-glass-hover student-card-accent relative overflow-hidden"
      >
        <div className="specular-card-reflection" />

        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-xs shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h3 className="student-heading-h3 text-xs sm:text-sm font-black truncate">المساقات الأكثر إقبالاً وإيراداً</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold truncate">ترتيب البرامج حسب إجمالي المتدربين</p>
            </div>
          </div>

          <Link
            href="/dashboard/admin/courses"
            className="text-[10px] sm:text-xs font-bold text-[#173A7C] hover:bg-blue-50 px-2 sm:px-2.5 py-1 rounded-lg border border-blue-200/60 flex items-center gap-1 shrink-0 whitespace-nowrap transition-colors"
          >
            <span>جميع المساقات ({topCourses.length})</span>
            <ChevronLeft className="w-3 h-3 text-[#173A7C] shrink-0" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {topCourses.map((crs, idx) => (
            <div
              key={idx}
              className="p-3.5 sm:p-4 rounded-lg sm:rounded-xl space-y-3 bg-white/70 hover:bg-white/90 border border-slate-200/70 hover:border-[#173A7C]/30 transition-all duration-200 shadow-2xs hover:shadow-sm group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-black bg-blue-50 text-[#173A7C] border border-blue-200/80 shrink-0 whitespace-nowrap">
                    {crs.category}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-amber-600 flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                    ★ {crs.rating}
                  </span>
                </div>
                <h4 className="font-black text-xs sm:text-sm text-[#173A7C] leading-snug group-hover:text-[#1E4D9D] transition-colors">{crs.title}</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-[#5CB07C] shrink-0" />
                  <span className="truncate">{crs.instructor}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-500 text-[9.5px] block font-bold">إجمالي المتدربين</span>
                  <span className="font-extrabold text-[#173A7C] block text-xs">{crs.students.toLocaleString('en-US')} طالب</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[9.5px] block font-bold">إجمالي الإيراد</span>
                  <span className="font-extrabold text-emerald-700 block text-xs font-mono">{crs.revenue}</span>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200/60">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 text-[10px]">معدل إكمال البرنامج:</span>
                  <span className="text-[#5CB07C] font-black text-xs">{crs.completion}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-200/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#5CB07C] transition-all duration-700"
                    style={{ width: `${crs.completion}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── 6. Real-Time Live Activity Feed ── */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={5}
        className="rounded-lg sm:rounded-xl p-3.5 sm:p-5 pr-4 sm:pr-6 space-y-3.5 sm:space-y-4 liquid-glass-card liquid-glass-hover student-card-accent relative overflow-hidden"
      >
        <div className="specular-card-reflection" />

        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white shadow-xs shrink-0">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h3 className="student-heading-h3 text-xs sm:text-sm font-black truncate">سجل العمليات والأنشطة اللحظية</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold truncate">بث مباشر 24/7 لكافة تفاعلات المنصة</p>
            </div>
          </div>

          <span className="text-[10px] sm:text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-2xs">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>تحديث مباشر</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recentActivities.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl space-y-1.5 bg-white/70 hover:bg-white/90 border border-slate-200/70 hover:border-[#173A7C]/30 transition-all duration-200 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#173A7C]/10 to-[#1E4D9D]/10 text-[#173A7C] shadow-xs shrink-0 border border-blue-200/60">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-black text-xs text-[#173A7C] truncate">{act.title}</h4>
                  </div>
                  <span className={`text-[9.5px] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 rounded-full border shrink-0 whitespace-nowrap ${act.badgeColor}`}>
                    {act.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-bold leading-relaxed">{act.desc}</p>
                <span className="text-[9.5px] text-slate-400 font-bold block text-left">{act.time}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
}
