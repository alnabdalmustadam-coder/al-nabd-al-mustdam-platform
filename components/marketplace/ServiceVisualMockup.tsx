'use client';

import React from 'react';
import {
  Palette,
  Code2,
  PenTool,
  TrendingUp,
  GraduationCap,
  Database,
  Film,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Layers,
  Terminal,
  FileCode2,
  BarChart3,
  Search,
  Award,
  Table,
  Sliders,
  Play,
  FileText,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface ServiceVisualMockupProps {
  categorySlug?: string;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  isFeatured?: boolean;
}

export default function ServiceVisualMockup({
  categorySlug = 'design',
  title,
  size = 'md',
  isFeatured = false,
}: ServiceVisualMockupProps) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  // 1. DESIGN & BRANDING MOCKUP
  if (categorySlug === 'design') {
    return (
      <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#173A7C] to-[#0A1A3A] p-4 ${isLarge ? 'p-6' : 'p-4'} flex flex-col justify-between text-white font-[family-name:var(--font-cairo)]`}>
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:16px_16px]" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#5CB07C]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-emerald-300">
            <Palette className="w-3.5 h-3.5 text-[#5CB07C]" />
            <span>Brand Identity Guide</span>
          </div>
          <span className="text-[10px] font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">Vector AI • SVG • PDF</span>
        </div>

        {/* Center Visual Mockup Elements */}
        <div className="relative z-10 my-auto py-2 flex flex-col items-center justify-center gap-2">
          {/* Logo Monogram Box */}
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-white/15 to-white/5 border border-white/20 backdrop-blur-lg flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500">
              <span className="text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-white to-sky-200">
                {title.charAt(0) || 'ن'}
              </span>
              <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>

          {/* Color Palette Swatches */}
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <div className="w-4 h-4 rounded-full bg-[#173A7C] border border-white/40 shadow-xs" title="#173A7C" />
            <div className="w-4 h-4 rounded-full bg-[#5CB07C] border border-white/40 shadow-xs" title="#5CB07C" />
            <div className="w-4 h-4 rounded-full bg-[#D4AF37] border border-white/40 shadow-xs" title="#D4AF37" />
            <div className="w-4 h-4 rounded-full bg-slate-900 border border-white/40 shadow-xs" title="#0F172A" />
            <span className="text-[9px] text-slate-300 font-mono mr-1">Saudi Palette</span>
          </div>
        </div>

        {/* Bottom Deliverables Pill */}
        <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-300 border-t border-white/10 pt-2">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>ملفات مفتوحة + دليل هوية</span>
          </span>
          <span className="text-amber-300 font-bold">100% أصلي ومبتكر</span>
        </div>
      </div>
    );
  }

  // 2. DEVELOPMENT & PROGRAMMING MOCKUP
  if (categorySlug === 'development') {
    return (
      <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#0D1B2A] p-4 ${isLarge ? 'p-6' : 'p-4'} flex flex-col justify-between text-white font-[family-name:var(--font-cairo)]`}>
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#38bdf815_1px,transparent_1px),linear-gradient(to_bottom,#38bdf815_1px,transparent_1px)] bg-[size:16px_16px]" />
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Code Window Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-mono text-slate-400 mr-2">App.tsx — Next.js 15</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[10px] font-mono">React 19</span>
        </div>

        {/* Code Snippet Display */}
        <div className="relative z-10 my-auto py-2 font-mono text-[11px] space-y-1 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">01</span>
            <span className="text-purple-400">export default</span>
            <span className="text-blue-400">function</span>
            <span className="text-amber-300">FastApp()</span>
            <span className="text-slate-400">{'{'}</span>
          </div>
          <div className="flex items-center gap-2 pr-4">
            <span className="text-slate-600">02</span>
            <span className="text-slate-400">return</span>
            <span className="text-emerald-400">&lt;UltraResponsiveUI /&gt;;</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">03</span>
            <span className="text-slate-400">{'}'}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✓ Compiled 12ms</span>
          </div>
        </div>

        {/* Bottom Feature */}
        <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-300 border-t border-white/10 pt-2">
          <span className="flex items-center gap-1 text-cyan-300">
            <Terminal className="w-3 h-3" />
            <span>كود نظيف • متجاوب 100%</span>
          </span>
          <span className="text-emerald-400 font-bold">100/100 Lighthouse</span>
        </div>
      </div>
    );
  }

  // 3. WRITING & TRANSLATION MOCKUP
  if (categorySlug === 'writing') {
    return (
      <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#022C22] p-4 ${isLarge ? 'p-6' : 'p-4'} flex flex-col justify-between text-white font-[family-name:var(--font-cairo)]`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
        
        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-emerald-200">
            <PenTool className="w-3.5 h-3.5 text-emerald-300" />
            <span>SEO & Copywriting</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-200 text-[10px] font-bold border border-emerald-300/30">تدقيق لغوي فصيح</span>
        </div>

        {/* Paper Document Preview */}
        <div className="relative z-10 my-auto py-2">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-black text-amber-200">تحسين محركات البحث SEO</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono text-[9px]">Score 98%</span>
            </div>
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 w-[95%]" />
            </div>
            <p className="text-[10px] text-emerald-100/90 leading-tight">محتوى حصري خالي من الذكاء الاصطناعي وجاهز للنشر المباشر</p>
          </div>
        </div>

        {/* Bottom Feature */}
        <div className="relative z-10 flex items-center justify-between text-[10px] text-emerald-200 border-t border-white/10 pt-2">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-300" />
            <span>كلمات مفتاحية + صياغة إبداعية</span>
          </span>
          <span className="text-amber-200 font-bold">100% محتوى أصلي</span>
        </div>
      </div>
    );
  }

  // 4. DIGITAL MARKETING MOCKUP
  if (categorySlug === 'marketing') {
    return (
      <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-[#7C2D12] via-[#C2410C] to-[#431407] p-4 ${isLarge ? 'p-6' : 'p-4'} flex flex-col justify-between text-white font-[family-name:var(--font-cairo)]`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
        
        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-orange-200">
            <TrendingUp className="w-3.5 h-3.5 text-orange-300" />
            <span>Growth & Ads Marketing</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-orange-400/20 text-orange-200 text-[10px] font-bold border border-orange-300/30">Google & Meta Ads</span>
        </div>

        {/* Metrics Box */}
        <div className="relative z-10 my-auto py-2 grid grid-cols-2 gap-2">
          <div className="bg-black/25 backdrop-blur-md p-2 rounded-xl border border-white/15 text-center">
            <span className="text-[10px] text-orange-200 block">العائد على الإعلان ROI</span>
            <span className="text-lg font-black text-emerald-300 font-mono">+380%</span>
          </div>
          <div className="bg-black/25 backdrop-blur-md p-2 rounded-xl border border-white/15 text-center">
            <span className="text-[10px] text-orange-200 block">معدل التحويل CR</span>
            <span className="text-lg font-black text-amber-300 font-mono">4.8%</span>
          </div>
        </div>

        {/* Bottom Feature */}
        <div className="relative z-10 flex items-center justify-between text-[10px] text-orange-200 border-t border-white/10 pt-2">
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3 text-amber-300" />
            <span>تقارير أداء دورية + استهداف دقيق</span>
          </span>
          <span className="text-emerald-300 font-bold">نمو مبيعات مؤكد</span>
        </div>
      </div>
    );
  }

  // 5. CONSULTING & TRAINING MOCKUP
  if (categorySlug === 'consulting') {
    return (
      <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#0F172A] p-4 ${isLarge ? 'p-6' : 'p-4'} flex flex-col justify-between text-white font-[family-name:var(--font-cairo)]`}>
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-indigo-200">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-300" />
            <span>استشارات وتأهيل NELC</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-indigo-400/20 text-indigo-200 text-[10px] font-bold border border-indigo-300/30">معايير 2030</span>
        </div>

        <div className="relative z-10 my-auto py-2">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 space-y-2 shadow-lg">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-black text-white">خارطة طريق لاعتماد المنشآت</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-indigo-200">
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 border border-indigo-400/30">1. التقييم</span>
              <span>←</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 border border-indigo-400/30">2. التطوير</span>
              <span>←</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 font-bold">3. الترخيص</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[10px] text-indigo-200 border-t border-white/10 pt-2">
          <span className="flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-300" />
            <span>مستشارون معتمدون ومرخصون</span>
          </span>
          <span className="text-emerald-300 font-bold">قوالب جاهزة شاملة</span>
        </div>
      </div>
    );
  }

  // 6. DEFAULT / OTHER CATEGORIES (DATA, MEDIA, BUSINESS)
  return (
    <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#173A7C] p-4 ${isLarge ? 'p-6' : 'p-4'} flex flex-col justify-between text-white font-[family-name:var(--font-cairo)]`}>
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:16px_16px]" />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-slate-200">
          <Briefcase className="w-3.5 h-3.5 text-sky-400" />
          <span>خدمة أعمال احترافية</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-sky-400/20 text-sky-200 text-[10px] font-bold border border-sky-300/30">دقة وسرعة</span>
      </div>

      <div className="relative z-10 my-auto py-2 flex flex-col items-center justify-center text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
          <Zap className="w-6 h-6 text-amber-400" />
        </div>
        <p className="text-xs font-bold text-slate-200 max-w-[200px] line-clamp-1">{title}</p>
      </div>

      <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-300 border-t border-white/10 pt-2">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>تنفيذ ومتابعة مباشرة</span>
        </span>
        <span className="text-amber-300 font-bold">تسليم في الموعد</span>
      </div>
    </div>
  );
}
