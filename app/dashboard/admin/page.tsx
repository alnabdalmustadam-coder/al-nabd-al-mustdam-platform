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

  // Refined Glass Card — clean elevation, thin border
  const glassNeumorphicCard = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(241,245,249,0.90) 100%)',
    backdropFilter: 'blur(12px) saturate(1.4)',
    WebkitBackdropFilter: 'blur(12px) saturate(1.4)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08), 0 10px 28px rgba(15, 23, 42, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.6)',
  };

  const glassNeumorphicInset = {
    background: 'rgba(241, 245, 249, 0.7)',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(226, 232, 240, 0.5)',
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
    <div className="space-y-6 font-[family-name:var(--font-cairo)]">

      {/* ── Executive Welcome Hero & Control Bar (Compact & Sleek) ── */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 animate-fade-in-up ultra-card-hover" style={glassNeumorphicCard}>
        {/* Subtle Ambient Glowing Background Accent */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-3 min-w-0 pr-2 border-r-4 border-[#173A7C]">
            <h1 className="text-sm font-bold text-slate-900 leading-snug whitespace-nowrap truncate pr-1">
              مركز التحليلات وإدارة الأداء المالي والأكاديمي 📊
            </h1>
            <p className="text-[11px] text-slate-400 font-normal max-w-2xl leading-relaxed mt-2 pr-1">
              تحليلات شاملة متعددة الأبعاد للمبيعات، معدلات الإنجاز، توزيع المتدربين الجغرافي، واستوديو الشهادات المعتمد.
            </p>
          </div>

          {/* Time Range Filter Controls */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-white/80 self-stretch sm:self-auto shrink-0 shadow-inner" style={glassNeumorphicInset}>
            {[
              { key: 'today', label: 'اليوم' },
              { key: 'week', label: 'هذا الأسبوع' },
              { key: 'month', label: 'هذا الشهر' },
              { key: 'year', label: 'هذا العام' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTimeRange(t.key as any)}
                className={`py-1.5 px-3.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${timeRange === t.key
                  ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md ring-1 ring-blue-400/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3D Neumorphic Glass Executive KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiData.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl p-5 space-y-3.5 transition-all duration-300 ultra-card-hover animate-fade-in-up relative overflow-hidden group"
              style={{ ...glassNeumorphicCard, animationDelay: `${idx * 100}ms` }}
            >
              {/* Subtle top indicator bar */}
              <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${kpi.color} opacity-80 group-hover:opacity-100 transition-opacity`} />

              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} text-white flex items-center justify-center shadow-md ring-2 ring-white/60`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${kpi.badgeBg}`}>
                  <ArrowUpRight className="w-3 h-3" />
                  {kpi.growth}
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-slate-400 font-normal text-[10.5px] block">{kpi.title}</span>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{kpi.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Premium Chart Suite 1: Interactive Revenue Vector Curve & Funnel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Vector SVG Revenue Curve & Monthly Trend (2 Columns) */}
        <div className="lg:col-span-2 rounded-2xl p-6 sm:p-7 space-y-6 flex flex-col justify-between ultra-card-hover" style={glassNeumorphicCard}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/50">
            <div className="space-y-1 pr-2 border-r-3 border-[#173A7C]">
              <div className="flex items-center gap-2 pr-1">
                <LineChart className="w-5 h-5 text-[#173A7C]" />
                <h3 className="text-sm font-semibold text-slate-900 whitespace-nowrap truncate">منحنى المبيعات والإيرادات المباشرة الفعلي</h3>
              </div>
              <p className="text-[10.5px] text-slate-500 font-normal mt-1.5 pr-1">مسار تتبع النقلة المالية ومعدل التوسع بالريال السعودي</p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <TrendingUp className="w-4 h-4" />
              <span>+24.8% نمو قياسي</span>
            </div>
          </div>

          {/* SVG Vector Interactive Area Curve Chart */}
          <div className="relative py-4">
            <div className="h-56 w-full relative flex items-end">

              {/* Grid Background Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-slate-400 w-full" />
                <div className="border-b border-slate-400 w-full" />
                <div className="border-b border-slate-400 w-full" />
                <div className="border-b border-slate-400 w-full" />
              </div>

              {/* Vector Smooth Area Curve with Exact Node Alignment */}
              <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#173A7C" stopOpacity="0.35" />
                    <stop offset="50%" stopColor="#5CB07C" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#5CB07C" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="revenueStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#173A7C" />
                    <stop offset="50%" stopColor="#1E4D9D" />
                    <stop offset="100%" stopColor="#5CB07C" />
                  </linearGradient>
                </defs>

                {/* Filled Gradient Area */}
                <path
                  d="M 20,130 C 80,120 120,95 180,85 C 240,75 300,55 360,40 C 420,25 450,15 480,10 L 480,150 L 20,150 Z"
                  fill="url(#revenueGradient)"
                />

                {/* Main Stroke Path */}
                <path
                  d="M 20,130 C 80,120 120,95 180,85 C 240,75 300,55 360,40 C 420,25 450,15 480,10"
                  fill="none"
                  stroke="url(#revenueStroke)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Precise Interactive Data Nodes Sitting Exactly on the Line */}
                <circle cx="20" cy="130" r="5" fill="#173A7C" stroke="#ffffff" strokeWidth="2" />
                <circle cx="112" cy="98" r="5" fill="#173A7C" stroke="#ffffff" strokeWidth="2" />
                <circle cx="204" cy="79" r="5" fill="#1E4D9D" stroke="#ffffff" strokeWidth="2" />
                <circle cx="296" cy="56" r="5" fill="#1E4D9D" stroke="#ffffff" strokeWidth="2" />
                <circle cx="388" cy="33" r="5" fill="#5CB07C" stroke="#ffffff" strokeWidth="2" />
                <circle cx="480" cy="10" r="6" fill="#5CB07C" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>

            {/* X-Axis Month Labels */}
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-3 border-t border-slate-200/60">
              <span>يناير (210k)</span>
              <span>فبراير (245k)</span>
              <span>مارس (290k)</span>
              <span>أبريل (320k)</span>
              <span>مايو (417k)</span>
              <span className="text-slate-800 font-semibold">يونيو (المتوقع 500k+)</span>
            </div>
          </div>

          {/* Payment Gateways Split Row */}
          <div className="pt-4 border-t border-slate-200/50 space-y-3">
            <h4 className="font-semibold text-xs text-slate-800 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>توزيع عمليات السداد عبر بوابات الدفع الإلكتروني المعتمدة</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3.5 rounded-2xl space-y-1" style={glassNeumorphicInset}>
                <span className="text-slate-400 font-normal text-[10px] block">بطاقات مدى Mada</span>
                <span className="font-bold text-[#173A7C] text-sm block">45%</span>
                <span className="text-[9px] text-emerald-600 font-medium block">188,055 ر.س</span>
              </div>

              <div className="p-3.5 rounded-2xl space-y-1" style={glassNeumorphicInset}>
                <span className="text-slate-400 font-normal text-[10px] block">أقساط تمارا Tamara</span>
                <span className="font-bold text-[#5CB07C] text-sm block">30%</span>
                <span className="text-[9px] text-emerald-600 font-medium block">125,370 ر.س</span>
              </div>

              <div className="p-3.5 rounded-2xl space-y-1" style={glassNeumorphicInset}>
                <span className="text-slate-400 font-normal text-[10px] block">أقساط تابـي Tabby</span>
                <span className="font-bold text-purple-700 text-sm block">15%</span>
                <span className="text-[9px] text-purple-600 font-medium block">62,685 ر.س</span>
              </div>

              <div className="p-3.5 rounded-2xl space-y-1" style={glassNeumorphicInset}>
                <span className="text-slate-400 font-normal text-[10px] block">Visa / MasterCard</span>
                <span className="font-bold text-amber-600 text-sm block">10%</span>
                <span className="text-[9px] text-amber-600 font-medium block">41,790 ر.س</span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Completion Funnel Chart (1 Column) */}
        <div className="rounded-2xl p-6 sm:p-7 space-y-6 flex flex-col justify-between ultra-card-hover" style={glassNeumorphicCard}>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
              <div className="flex items-center gap-2 min-w-0 pr-2 border-r-3 border-emerald-600">
                <Target className="w-5 h-5 text-emerald-600 shrink-0 pr-0.5" />
                <h3 className="text-sm font-semibold text-slate-900 whitespace-nowrap truncate">قمع التحويل الأكاديمي (Funnel)</h3>
              </div>
              <span className="text-[10px] font-medium text-[#173A7C] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
                نسبة الإكمال
              </span>
            </div>

            {/* Funnel Steps Meter */}
            <div className="space-y-3.5">
              {funnelSteps.map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">{step.label}</span>
                    <span className="text-slate-900 font-semibold font-mono">{step.percent}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-200/60 p-0.5 overflow-hidden" style={glassNeumorphicInset}>
                    <div
                      className={`h-full rounded-full ${step.color} transition-all duration-500`}
                      style={{ width: `${step.percent}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 font-normal block text-left">{step.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Student Satisfaction NPS Meter */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-300/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-md">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-slate-900">صافي رضا المستفيدين (NPS)</h4>
                <span className="text-[10px] font-normal text-slate-500">تقييم الطلاب 4.95 / 5.0</span>
              </div>
            </div>
            <span className="font-extrabold text-lg text-emerald-700 font-mono">94.8%</span>
          </div>

        </div>

      </div>

      {/* ── Main Chart Suite 2: Geographic Map Distribution & Peak Learning Hours ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Regional Distribution Bar Map */}
        <div className="rounded-2xl p-6 sm:p-7 space-y-6 ultra-card-hover" style={glassNeumorphicCard}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
            <div className="flex items-center gap-2 pr-2 border-r-3 border-emerald-600">
              <MapPin className="w-5 h-5 text-emerald-600 pr-0.5" />
              <h3 className="text-sm font-semibold text-slate-900">التوزيع الجغرافي للمتدربين</h3>
            </div>
            <span className="text-[10px] font-medium text-[#173A7C] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              المملكة
            </span>
          </div>

          <div className="space-y-3.5">
            {regionalDistribution.map((reg, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-700">{reg.region}</span>
                  <span className="text-emerald-700 font-semibold font-mono">{reg.percentage}% ({reg.count})</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-200/60 overflow-hidden" style={glassNeumorphicInset}>
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
        <div className="lg:col-span-2 rounded-2xl p-6 sm:p-7 space-y-6 flex flex-col justify-between ultra-card-hover" style={glassNeumorphicCard}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
            <div className="flex items-center gap-2 pr-2 border-r-3 border-amber-500">
              <Flame className="w-5 h-5 text-amber-500 pr-0.5" />
              <h3 className="text-sm font-semibold text-slate-900">ساعات الذروة والتفاعل الأكاديمي اليومي</h3>
            </div>
            <span className="text-[10px] font-medium text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              ذروة المساء 🔥
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              تظهر تحليلات المنصة أن الذروة الكبرى لتصفح الدروس وحضور اللقاءات الحية تتركز بين <span className="text-slate-900 font-semibold">8:00 مساءً - 11:30 مساءً</span> بنسبة 68% من إجمالي التفاعل اليومي.
            </p>

            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3.5 rounded-2xl space-y-1" style={glassNeumorphicInset}>
                <span className="text-slate-400 font-normal text-[10px] block">صباحاً (8 - 12)</span>
                <span className="text-slate-800 text-base block font-mono font-bold">12%</span>
                <span className="text-[9px] text-slate-400 font-normal block">هادئ</span>
              </div>
              <div className="p-3.5 rounded-2xl space-y-1" style={glassNeumorphicInset}>
                <span className="text-slate-400 font-normal text-[10px] block">ظهراً (12 - 4)</span>
                <span className="text-slate-800 text-base block font-mono font-bold">15%</span>
                <span className="text-[9px] text-slate-400 font-normal block">متوسط</span>
              </div>
              <div className="p-3.5 rounded-2xl space-y-1" style={glassNeumorphicInset}>
                <span className="text-slate-400 font-normal text-[10px] block">عصراً (4 - 8)</span>
                <span className="text-[#1E4D9D] text-base block font-mono font-bold">28%</span>
                <span className="text-[9px] text-blue-600 font-medium block">نشط</span>
              </div>
              <div className="p-3.5 rounded-2xl space-y-1 bg-amber-500/10 border border-amber-300">
                <span className="text-amber-900 font-normal text-[10px] block">مساءً (8 - 12)</span>
                <span className="text-amber-600 text-base block font-mono font-bold">68%</span>
                <span className="text-[9px] text-amber-700 font-semibold block">أعلى ذروة 🔥</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/50 flex items-center justify-between text-xs font-normal text-slate-500">
            <span>تحديث البيانات الحية: تلقائي كل 60 ثانية</span>
            <span className="text-emerald-700">جميع الخوادم تعمل بكفاءة 100%</span>
          </div>
        </div>

      </div>

      {/* ── Main Analytics Section 3: Top Performing Courses Leaderboard ── */}
      <div className="rounded-2xl p-6 sm:p-7 space-y-5 ultra-card-hover" style={glassNeumorphicCard}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
          <div className="flex items-center gap-2.5 pr-2 border-r-3 border-[#173A7C]">
            <div className="p-2 rounded-xl bg-[#173A7C] text-white shadow-sm">
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">المساقات والدبلومات الأكثر إقبالاً وإيراداً</h3>
              <p className="text-[11px] text-slate-400 font-normal">ترتيب المساقات بحسب إجمالي المتدربين المسجلين ونسبة الإكمال</p>
            </div>
          </div>

          <Link
            href="/dashboard/admin/courses"
            className="text-xs font-semibold text-[#173A7C] hover:underline flex items-center gap-1"
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
              style={glassNeumorphicInset}
            >
              <div className="space-y-2.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-[#173A7C] border border-blue-200/80 mb-1.5">
                  {crs.category}
                </span>
                <h4 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">{crs.title}</h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/50">
                <div>
                  <span className="text-slate-400 text-[10px] block font-normal">إجمالي المتدربين</span>
                  <span className="font-semibold text-slate-800 block text-xs">{crs.students.toLocaleString()} طالب</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-normal">إجمالي الإيراد</span>
                  <span className="font-semibold text-emerald-600 block text-xs font-mono">{crs.revenue}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 text-xs">
                <span className="text-amber-500 font-medium flex items-center gap-1 text-[11px]">
                  ★ {crs.rating} تقييم ممتاز
                </span>
                <span className="text-emerald-700 font-medium text-[11px]">
                  إكمال المساق: {crs.completion}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Real-Time Live Activity Feed ── */}
      <div className="rounded-2xl p-5 sm:p-7 space-y-5 ultra-card-hover border-r-4 border-[#5CB07C]" style={glassNeumorphicCard}>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-xl bg-[#173A7C] text-white shadow-sm shrink-0">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">سجل العمليات والأنشطة اللحظية بالمنصة</h3>
              <p className="text-[10px] sm:text-[10.5px] text-slate-400 font-medium truncate">بث مباشر 24/7 لكافة تفاعلات المنصة</p>
            </div>
          </div>

          <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 whitespace-nowrap shrink-0">
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
                className="p-4 rounded-2xl space-y-2.5 transition-all hover:scale-[1.01]"
                style={glassNeumorphicInset}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-white text-[#173A7C] shadow-sm shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 truncate">{act.title}</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${act.badgeColor}`}>
                    {act.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2">{act.desc}</p>
                <span className="text-[10px] text-slate-400 font-bold block text-left pt-1">{act.time}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
