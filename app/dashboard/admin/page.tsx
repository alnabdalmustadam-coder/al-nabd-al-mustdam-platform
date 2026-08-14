'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Users,
  Award,
  BookOpen,
  DollarSign,
  Crown,
  Sparkles,
  ArrowUpRight,
  Plus,
  Radio,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  ChevronLeft,
  Sliders,
  FileCheck,
  CreditCard,
  BarChart3,
  PieChart,
  MapPin,
  Target,
  Calendar,
  Activity,
  Filter,
  ArrowDownRight,
  Eye,
  Star,
  LineChart,
  Percent,
  Smile,
  Flame,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Unified Premium Glass Card Styling (Matching Student Portal Standard)
  const glassCardStyle = {
    background: 'rgba(255, 255, 255, 0.88)',
    backdropFilter: 'blur(28px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.60)',
  };

  const glassInsetCardStyle = {
    background: 'rgba(241, 245, 249, 0.75)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
  };

  const kpiData = [
    {
      title: 'الإيرادات الإجمالية Direct Revenue',
      value: '1,482,900 ر.س',
      growth: '+18.4% نمو شهري',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-700',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      trend: 'up',
    },
    {
      title: 'المتدربين والطلاب النشطين',
      value: '14,250 طالب',
      growth: '+1,840 تسجيل جديد',
      icon: Users,
      color: 'from-[#173A7C] to-[#1E4D9D]',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
      trend: 'up',
    },
    {
      title: 'الشهادات الصادرة المعتمدة',
      value: '9,840 شهادة',
      growth: 'موثقة بالمركز الوطني 24/7',
      icon: Award,
      color: 'from-amber-500 to-yellow-600',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      trend: 'up',
    },
    {
      title: 'معدل إكمال وتفاعل المساقات',
      value: '94.2%',
      growth: '+3.1% ارتفاع الإنجاز',
      icon: Target,
      color: 'from-purple-600 to-indigo-800',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
      trend: 'up',
    },
  ];

  const funnelSteps = [
    { label: 'التسجيل والزيارات الأولى', count: '18,400 زائر', percent: 100, color: 'bg-[#173A7C]' },
    { label: 'بدء أول درس في المساق', count: '16,920 متدرب', percent: 92, color: 'bg-[#1E4D9D]' },
    { label: 'إكمال نصف محتوى البرنامج (%50)', count: '15,200 متدرب', percent: 82.6, color: 'bg-[#3B82F6]' },
    { label: 'اجتياز الاختبارات التقييمية', count: '14,350 متدرب', percent: 78, color: 'bg-[#5CB07C]' },
    { label: 'إصدار الشهادة وتوثيق الاعتماد', count: '13,950 شهادة', percent: 75.8, color: 'bg-amber-500' },
  ];

  const topCourses = [
    {
      title: 'برنامج القيادة المستدامة والمسؤولية المجتمعية',
      category: 'الاستدامة والحوكمة',
      students: 4850,
      revenue: '6,062,500 ر.س',
      rating: '4.95',
      completion: 96,
    },
    {
      title: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      category: 'الدبلومات العليا',
      students: 3200,
      revenue: '8,000,000 ر.س',
      rating: '4.92',
      completion: 94,
    },
    {
      title: 'الشهادة الاحترافية في إدارة الاستدامة البيئية',
      category: 'البيئة والطاقة',
      students: 1790,
      revenue: '3,222,000 ر.س',
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
      desc: 'تم إصدار شهادة (برنامج القيادة المستدامة) للمتدرب عبدالله الشمري بنسبة %98',
      time: 'منذ 4 دقائق',
      icon: Award,
      badge: 'الشهادات',
      badgeColor: 'text-amber-700 bg-amber-100 border-amber-300',
    },
    {
      id: '2',
      title: 'عملية دفع جديدة عبر (تمارا)',
      desc: 'سداد القسط الأول 625 ر.س لدبلوم التسامح والمواطنة الصالحة',
      time: 'منذ 14 دقيقة',
      icon: CreditCard,
      badge: 'المالية',
      badgeColor: 'text-emerald-700 bg-emerald-100 border-emerald-300',
    },
    {
      id: '3',
      title: 'تسجيل متدرب جديد',
      desc: 'انضم المتدرب د. خالد العتيبي إلى مساق إدارة الاستدامة البيئية',
      time: 'منذ 35 دقيقة',
      icon: Users,
      badge: 'الطلاب',
      badgeColor: 'text-blue-700 bg-blue-100 border-blue-300',
    },
    {
      id: '4',
      title: 'تذكرة دعم فني جديدة',
      desc: 'استفسار بشأن الاسترداد المالي من المتدربة ريم الجهني',
      time: 'منذ ساعة',
      icon: Clock,
      badge: 'الدعم',
      badgeColor: 'text-purple-700 bg-purple-100 border-purple-300',
    },
  ];

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800">

      {/* ── Executive Welcome Hero & Control Bar (Clean Glass, No Harsh Vertical Line) ── */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 transition-all duration-300" style={glassCardStyle}>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#1E4D9D] text-white flex items-center justify-center font-black shadow-xs shrink-0">
                <Crown className="w-4 h-4 text-amber-300" />
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                مركز التحليلات وإدارة الأداء المالي والأكاديمي 📊
              </h1>
            </div>
            <p className="text-xs text-slate-600 font-bold max-w-2xl leading-relaxed pr-10.5">
              تحليلات شاملة متعددة الأبعاد للمبيعات، معدلات الإنجاز، توزيع المتدربين الجغرافي، واستوديو الشهادات المعتمد.
            </p>
          </div>

          {/* Time Range Filter Controls */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 self-stretch sm:self-auto shrink-0 shadow-xs">
            {[
              { key: 'today', label: 'اليوم' },
              { key: 'week', label: 'هذا الأسبوع' },
              { key: 'month', label: 'هذا الشهر' },
              { key: 'year', label: 'هذا العام' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTimeRange(t.key as any)}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeRange === t.key
                    ? 'bg-[#173A7C] text-white shadow-sm ring-1 ring-[#173A7C]/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Executive KPI Cards (Liquid Glass Finish) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiData.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="rounded-3xl p-5 space-y-3.5 transition-all duration-300 hover:shadow-lg relative overflow-hidden group"
              style={glassCardStyle}
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${kpi.color} text-white flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-black border flex items-center gap-1 ${kpi.badgeBg}`}>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {kpi.growth}
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-slate-500 font-bold text-xs block">{kpi.title}</span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{kpi.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Premium Chart Suite 1: Interactive Revenue Curve & Funnel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Vector SVG Revenue Curve & Monthly Trend (2 Columns) */}
        <div className="lg:col-span-2 rounded-3xl p-6 sm:p-7 space-y-6 flex flex-col justify-between" style={glassCardStyle}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#173A7C] border border-blue-200/80 flex items-center justify-center shadow-xs shrink-0">
                <LineChart className="w-5 h-5 text-[#173A7C]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">منحنى المبيعات والإيرادات المباشرة الفعلي</h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">مسار تتبع النقلة المالية ومعدل التوسع بالريال السعودي</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <TrendingUp className="w-4 h-4" />
              <span>+24.8% نمو قياسي</span>
            </div>
          </div>

          {/* SVG Vector Interactive Area Curve Chart */}
          <div className="relative py-2">
            <div className="h-56 w-full relative flex items-end">

              {/* Grid Background Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-25">
                <div className="border-b border-slate-300 w-full" />
                <div className="border-b border-slate-300 w-full" />
                <div className="border-b border-slate-300 w-full" />
                <div className="border-b border-slate-300 w-full" />
              </div>

              {/* Vector Smooth Area Curve */}
              <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#173A7C" stopOpacity="0.30" />
                    <stop offset="60%" stopColor="#5CB07C" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#5CB07C" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="adminRevenueStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#173A7C" />
                    <stop offset="50%" stopColor="#1E4D9D" />
                    <stop offset="100%" stopColor="#5CB07C" />
                  </linearGradient>
                </defs>

                {/* Filled Gradient Area */}
                <path
                  d="M 20,130 C 80,120 120,95 180,85 C 240,75 300,55 360,40 C 420,25 450,15 480,10 L 480,150 L 20,150 Z"
                  fill="url(#adminRevenueGradient)"
                />

                {/* Main Stroke Path */}
                <path
                  d="M 20,130 C 80,120 120,95 180,85 C 240,75 300,55 360,40 C 420,25 450,15 480,10"
                  fill="none"
                  stroke="url(#adminRevenueStroke)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Precise Interactive Data Nodes */}
                <circle cx="20" cy="130" r="5" fill="#173A7C" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="112" cy="98" r="5" fill="#173A7C" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="204" cy="79" r="5" fill="#1E4D9D" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="296" cy="56" r="5" fill="#1E4D9D" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="388" cy="33" r="5" fill="#5CB07C" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="480" cy="10" r="6" fill="#5CB07C" stroke="#ffffff" strokeWidth="2.5" />
              </svg>
            </div>

            {/* X-Axis Month Labels */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-3 border-t border-slate-200/60">
              <span>يناير (210k)</span>
              <span>فبراير (245k)</span>
              <span>مارس (290k)</span>
              <span>أبريل (320k)</span>
              <span>مايو (417k)</span>
              <span className="text-[#173A7C] font-black">يونيو (المتوقع 500k+)</span>
            </div>
          </div>

          {/* Payment Gateways Split Row */}
          <div className="pt-4 border-t border-slate-200/60 space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>توزيع عمليات السداد عبر بوابات الدفع الإلكتروني المعتمدة</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3.5 rounded-2xl space-y-1" style={glassInsetCardStyle}>
                <span className="text-slate-500 font-bold text-[10.5px] block">بطاقات مدى Mada</span>
                <span className="font-black text-[#173A7C] text-sm block">45%</span>
                <span className="text-[10px] text-emerald-700 font-bold block">188,055 ر.س</span>
              </div>

              <div className="p-3.5 rounded-2xl space-y-1" style={glassInsetCardStyle}>
                <span className="text-slate-500 font-bold text-[10.5px] block">أقساط تمارا Tamara</span>
                <span className="font-black text-[#5CB07C] text-sm block">30%</span>
                <span className="text-[10px] text-emerald-700 font-bold block">125,370 ر.س</span>
              </div>

              <div className="p-3.5 rounded-2xl space-y-1" style={glassInsetCardStyle}>
                <span className="text-slate-500 font-bold text-[10.5px] block">أقساط تابـي Tabby</span>
                <span className="font-black text-purple-700 text-sm block">15%</span>
                <span className="text-[10px] text-purple-600 font-bold block">62,685 ر.س</span>
              </div>

              <div className="p-3.5 rounded-2xl space-y-1" style={glassInsetCardStyle}>
                <span className="text-slate-500 font-bold text-[10.5px] block">Visa / MasterCard</span>
                <span className="font-black text-amber-600 text-sm block">10%</span>
                <span className="text-[10px] text-amber-600 font-bold block">41,790 ر.س</span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Completion Funnel Chart (1 Column) */}
        <div className="rounded-3xl p-6 sm:p-7 space-y-6 flex flex-col justify-between" style={glassCardStyle}>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs shrink-0">
                  <Target className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-sm font-black text-slate-900">قمع التحويل الأكاديمي (Funnel)</h3>
              </div>
              <span className="text-[10px] font-black text-[#173A7C] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 shrink-0">
                نسبة الإكمال
              </span>
            </div>

            {/* Funnel Steps Meter */}
            <div className="space-y-3.5">
              {funnelSteps.map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">{step.label}</span>
                    <span className="text-slate-900 font-black font-mono">{step.percent}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-200/60 p-0.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${step.color} transition-all duration-500`}
                      style={{ width: `${step.percent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold block text-left">{step.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Student Satisfaction NPS Meter */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-xs text-slate-900">صافي رضا المستفيدين (NPS)</h4>
                <span className="text-[11px] font-bold text-slate-600">تقييم الطلاب 4.95 / 5.0</span>
              </div>
            </div>
            <span className="font-black text-lg text-emerald-700 font-mono">94.8%</span>
          </div>

        </div>

      </div>

      {/* ── Main Chart Suite 2: Geographic Map Distribution & Peak Learning Hours ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Regional Distribution Bar Map */}
        <div className="rounded-3xl p-6 sm:p-7 space-y-6" style={glassCardStyle}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs shrink-0">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-black text-slate-900">التوزيع الجغرافي للمتدربين</h3>
            </div>
            <span className="text-[10px] font-black text-[#173A7C] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              المملكة
            </span>
          </div>

          <div className="space-y-3.5">
            {regionalDistribution.map((reg, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">{reg.region}</span>
                  <span className="text-emerald-700 font-black font-mono">{reg.percentage}% ({reg.count})</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-200/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#173A7C]"
                    style={{ width: `${reg.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours Engagement Chart */}
        <div className="lg:col-span-2 rounded-3xl p-6 sm:p-7 space-y-6 flex flex-col justify-between" style={glassCardStyle}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center shadow-xs shrink-0">
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-sm font-black text-slate-900">ساعات الذروة والتفاعل الأكاديمي اليومي</h3>
            </div>
            <span className="text-[10px] font-black text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-300">
              ذروة المساء 🔥
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-bold leading-relaxed">
              تظهر تحليلات المنصة أن الذروة الكبرى لتصفح الدروس وحضور اللقاءات الحية تتركز بين <span className="text-slate-900 font-extrabold">8:00 مساءً - 11:30 مساءً</span> بنسبة 68% من إجمالي التفاعل اليومي.
            </p>

            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3.5 rounded-2xl space-y-1" style={glassInsetCardStyle}>
                <span className="text-slate-500 font-bold text-[10px] block">صباحاً (8 - 12)</span>
                <span className="text-slate-800 text-base block font-mono font-black">12%</span>
                <span className="text-[9.5px] text-slate-400 font-bold block">هادئ</span>
              </div>
              <div className="p-3.5 rounded-2xl space-y-1" style={glassInsetCardStyle}>
                <span className="text-slate-500 font-bold text-[10px] block">ظهراً (12 - 4)</span>
                <span className="text-slate-800 text-base block font-mono font-black">15%</span>
                <span className="text-[9.5px] text-slate-400 font-bold block">متوسط</span>
              </div>
              <div className="p-3.5 rounded-2xl space-y-1" style={glassInsetCardStyle}>
                <span className="text-slate-500 font-bold text-[10px] block">عصراً (4 - 8)</span>
                <span className="text-[#1E4D9D] text-base block font-mono font-black">28%</span>
                <span className="text-[9.5px] text-blue-600 font-bold block">نشط</span>
              </div>
              <div className="p-3.5 rounded-2xl space-y-1 bg-amber-50 border border-amber-200">
                <span className="text-amber-900 font-bold text-[10px] block">مساءً (8 - 12)</span>
                <span className="text-amber-700 text-base block font-mono font-black">68%</span>
                <span className="text-[9.5px] text-amber-800 font-extrabold block">أعلى ذروة 🔥</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>تحديث البيانات الحية: تلقائي كل 60 ثانية</span>
            <span className="text-emerald-700 font-black">جميع الخوادم تعمل بكفاءة 100%</span>
          </div>
        </div>

      </div>

      {/* ── Main Analytics Section 3: Top Performing Courses Leaderboard ── */}
      <div className="rounded-3xl p-6 sm:p-7 space-y-5" style={glassCardStyle}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#173A7C] text-white shadow-xs">
              <Star className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">المساقات والدبلومات الأكثر إقبالاً وإيراداً</h3>
              <p className="text-xs text-slate-500 font-bold">ترتيب المساقات بحسب إجمالي المتدربين المسجلين ونسبة الإكمال</p>
            </div>
          </div>

          <Link
            href="/dashboard/admin/courses"
            className="text-xs font-black text-[#173A7C] hover:underline flex items-center gap-1"
          >
            <span>جميع المساقات ({topCourses.length})</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topCourses.map((crs, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl space-y-4 transition-all hover:scale-[1.01]"
              style={glassInsetCardStyle}
            >
              <div className="space-y-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-[#173A7C] border border-blue-200/80 mb-1">
                  {crs.category}
                </span>
                <h4 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">{crs.title}</h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">إجمالي المتدربين</span>
                  <span className="font-extrabold text-slate-800 block text-xs">{crs.students.toLocaleString()} طالب</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">إجمالي الإيراد</span>
                  <span className="font-extrabold text-emerald-700 block text-xs font-mono">{crs.revenue}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-amber-600 font-bold flex items-center gap-1 text-xs">
                  ★ {crs.rating} تقييم ممتاز
                </span>
                <span className="text-emerald-700 font-bold text-xs">
                  إكمال المساق: {crs.completion}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Real-Time Live Activity Feed ── */}
      <div className="rounded-3xl p-6 sm:p-7 space-y-5" style={glassCardStyle}>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-[#173A7C] text-white shadow-xs shrink-0">
              <Zap className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">سجل العمليات والأنشطة اللحظية بالمنصة</h3>
              <p className="text-[10.5px] sm:text-xs text-slate-500 font-bold truncate">بث مباشر 24/7 لكافة تفاعلات المنصة</p>
            </div>
          </div>

          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>تحديث مباشر</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentActivities.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                className="p-4 rounded-2xl space-y-2 transition-all hover:scale-[1.01]"
                style={glassInsetCardStyle}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-white text-[#173A7C] shadow-xs shrink-0 border border-slate-200/60">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-black text-xs text-slate-900 truncate">{act.title}</h4>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shrink-0 ${act.badgeColor}`}>
                    {act.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-bold leading-relaxed mt-1">{act.desc}</p>
                <span className="text-[10px] text-slate-400 font-bold block text-left pt-0.5">{act.time}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
