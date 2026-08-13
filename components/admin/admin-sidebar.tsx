'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Award,
  Radio,
  CreditCard,
  Headphones,
  Settings,
  ShieldCheck,
  UserCheck,
  Sparkles,
  ChevronLeft,
  Crown,
  Home,
  X,
  LogOut,
  HelpCircle,
  FileQuestion,
  Star,
} from 'lucide-react';

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { label: 'الرئيسية والتحليلات', href: '/dashboard/admin', icon: LayoutDashboard, badge: 'مباشر' },
    { label: 'إدارة المساقات والدورات', href: '/dashboard/admin/courses', icon: BookOpen, count: '48' },
    { label: 'إدارة المتدربين والطلاب', href: '/dashboard/admin/users', icon: Users, count: '14.2k' },
    { label: 'إدارة المدربين والمحاضرين', href: '/dashboard/admin/trainers', icon: UserCheck, count: '32' },
    { label: 'استوديو وإدارة الشهادات', href: '/dashboard/admin/certificates', icon: Award, highlight: true },
    { label: 'بنك الأسئلة والاختبارات', href: '/dashboard/admin/quizzes', icon: FileQuestion, count: '12' },
    { label: 'قسائم الخصم والعروض', href: '/dashboard/admin/coupons', icon: Sparkles, count: 'خصم' },
    { label: 'استبيانات وتقييمات', href: '/dashboard/admin/surveys', icon: Star, count: '4.9★' },
    { label: 'اللقاءات المباشرة', href: '/dashboard/admin/live', icon: Radio, count: '5' },
    { label: 'السجل المالي والإيرادات', href: '/dashboard/admin/finance', icon: CreditCard, count: 'ر.س' },
    { label: 'الدعم وتذاكر الخدمة', href: '/dashboard/admin/support', icon: Headphones, count: '12' },
    { label: 'إعدادات المنصة للهوية', href: '/dashboard/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR — Visible on large screens (lg:block) sticky in-flow    */}
      {/* ========================================================================= */}
      <aside
        suppressHydrationWarning
        className={`hidden lg:block shrink-0 sticky top-[100px] h-[calc(100vh-8rem)] z-30 font-[family-name:var(--font-cairo)] transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-96'
          }`}
      >
        <div
          className={`relative overflow-hidden rounded-[32px] border h-full flex flex-col justify-between transition-all duration-300 ${
            isCollapsed ? 'p-2.5 sm:p-3' : 'p-4 sm:p-5'
          }`}
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(241,245,249,0.85) 50%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(28px) saturate(1.9)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.9)',
            boxShadow: '0 12px 40px -6px rgba(0, 0, 0, 0.28), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.65)',
          }}
        >
          {/* Top Accent Ribbon */}
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#173A7C] via-[#5CB07C] to-[#D4AF37] rounded-t-[32px]" />

          <div className="space-y-4 relative z-10 overflow-y-auto no-scrollbar px-0.5 py-1 flex-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

            {/* Admin Header Card */}
            <div
              className={`rounded-2xl border border-white/80 transition-all duration-300 relative group overflow-hidden ${
                isCollapsed ? 'p-2 flex items-center justify-center' : 'p-3.5'
              }`}
              style={{
                background: 'linear-gradient(135deg, rgba(23, 58, 124, 0.05) 0%, rgba(92, 176, 124, 0.08) 100%)',
                boxShadow: 'inset 3px 3px 8px rgba(15, 23, 42, 0.04), inset -3px -3px 8px rgba(255, 255, 255, 0.8)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#173A7C] via-[#1E4D9D] to-[#0F2D69] text-white flex items-center justify-center font-black shadow-md shrink-0 border border-white/30">
                  <Crown className="w-5 h-5 text-amber-300" />
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <h3 className="font-black text-xs text-slate-900 truncate">سعود القحطاني</h3>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold truncate">مدير المنصة الرئيسي</p>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation Links with Staggered Framer Motion & Ultra High Contrast */}
            <motion.nav
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.035,
                    delayChildren: 0.05,
                  },
                },
              }}
              className="space-y-1.5 px-0.5 py-0.5"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <motion.div
                    key={item.href}
                    variants={{
                      hidden: { opacity: 0, x: 15, scale: 0.97 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        transition: {
                          type: 'spring',
                          stiffness: 350,
                          damping: 25,
                        },
                      },
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.985 }}
                  >
                    <Link
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={`relative flex items-center rounded-2xl font-black text-xs transition-all duration-300 group cursor-pointer ${
                        isCollapsed ? 'p-2 justify-center' : 'p-3 justify-between'
                      } ${
                        isActive
                          ? 'text-white bg-gradient-to-r from-[#173A7C] via-[#1E4D9D] to-[#173A7C] border border-white/40 shadow-lg shadow-[#173A7C]/30'
                          : 'text-slate-900 bg-white/70 hover:bg-white hover:text-[#173A7C] border border-slate-200/80 hover:border-[#173A7C]/40 shadow-xs hover:shadow-md'
                      }`}
                    >
                      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: [0, -6, 6, 0] }}
                          transition={{ duration: 0.2 }}
                          className={`rounded-xl transition-all duration-300 shrink-0 border flex items-center justify-center relative ${
                            isCollapsed ? 'w-9 h-9 p-0' : 'p-2'
                          } ${
                            isActive
                              ? 'bg-white/20 text-white border-white/30 shadow-inner'
                              : 'bg-[#173A7C]/10 text-[#173A7C] border-[#173A7C]/15 group-hover:bg-[#173A7C] group-hover:text-white group-hover:shadow-md'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </motion.div>
                        {!isCollapsed && (
                          <span className={`truncate ${isActive ? 'font-black text-white' : 'font-black text-slate-900 group-hover:text-[#173A7C]'}`}>
                            {item.label}
                          </span>
                        )}
                      </div>

                      {!isCollapsed && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.count && (
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                                isActive
                                  ? 'bg-white/20 text-white border border-white/30'
                                  : 'text-slate-700 bg-slate-200/80 border border-slate-300/60 shadow-xs'
                              }`}
                            >
                              {item.count}
                            </span>
                          )}
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 animate-pulse">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}

                      {isActive && (
                        <motion.div
                          layoutId="adminActiveTabIndicator"
                          className="absolute right-0 top-2.5 bottom-2.5 w-1.5 bg-[#5CB07C] rounded-l-full shadow-md shadow-[#5CB07C]/50"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>
          </div>

          {!isCollapsed && (
            <div className="pt-3 border-t border-slate-200/40 text-center relative z-10">
              <p className="text-[10px] text-slate-400 font-extrabold flex items-center justify-center gap-1">
                <span>تحكم الأدمن</span>
                <span className="font-mono text-[#173A7C]">Sustain Pulse</span>
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE DRAWER SHEET — Light 3D Glassmorphic RTL Mobile Sheet (Flush)   */}
      {/* ========================================================================= */}
      {isMobileOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />

          {/* Edge-to-Edge Light Glass Mobile Drawer Panel */}
          <aside
            suppressHydrationWarning
            className="fixed top-0 bottom-0 right-0 z-[1001] w-[320px] max-w-[88vw] h-full bg-gradient-to-b from-white via-[#F8FAFC] to-slate-100/98 backdrop-blur-2xl text-slate-800 shadow-[-20px_0_50px_rgba(15,23,42,0.15)] border-l border-slate-200/90 flex flex-col justify-between p-5 rounded-none overflow-y-auto no-scrollbar lg:hidden font-[family-name:var(--font-cairo)] animate-in slide-in-from-right duration-300"
            dir="rtl"
          >
            {/* Top Accent Ribbon */}
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#173A7C] via-[#5CB07C] to-[#D4AF37] rounded-none" />

            {/* Ambient Background Glowing Orbs */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#173A7C]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#5CB07C]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-5 relative z-10 flex-1 flex flex-col min-h-0 pt-1">

              {/* Drawer Header: Brand Identity + Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#173A7C] to-[#5CB07C] p-0.5 flex items-center justify-center shadow-md shadow-blue-900/10">
                    <Crown className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="font-black text-sm text-slate-900 tracking-wide">الإدارة العليا</h2>
                    <p className="text-[10px] text-slate-500 font-bold">النبض المستدام</p>
                  </div>
                </div>

                <button
                  onClick={onCloseMobile}
                  className="w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-300/80 text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center border border-slate-300/60 cursor-pointer shadow-sm"
                  title="إغلاق القائمة"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Admin Identity Badge Card */}
              <div
                className="p-3.5 rounded-2xl border border-white/90 shadow-md flex items-center gap-3 shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(23, 58, 124, 0.08) 0%, rgba(92, 176, 124, 0.06) 100%)',
                  boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.9), 4px 4px 12px rgba(15,23,42,0.04)',
                }}
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#173A7C] to-blue-900 text-white flex items-center justify-center font-black shadow-md shrink-0 border border-white/40 text-base">
                  A
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-xs text-slate-900 truncate">سعود القحطاني</h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-[10px] text-amber-700 font-bold truncate">مدير المنصة الرئيسي 👑</p>
                </div>
              </div>

              {/* Scrollable Navigation Items */}
              <nav className="space-y-1.5 overflow-y-auto no-scrollbar flex-1 pr-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`relative flex items-center justify-between p-3 rounded-2xl font-black text-xs transition-all duration-300 group ${
                        isActive
                          ? 'text-white bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] border border-blue-400/40 shadow-md shadow-blue-900/20'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-white/80 border border-transparent'
                      }`}
                      style={
                        !isActive
                          ? {
                            boxShadow: '2px 2px 8px rgba(15,23,42,0.02)',
                          }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl transition-all duration-300 shrink-0 ${isActive
                              ? 'bg-amber-400 text-slate-950 shadow-md'
                              : 'bg-slate-200/60 text-slate-500 group-hover:bg-[#173A7C]/10 group-hover:text-[#173A7C]'
                            }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.count && (
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${isActive
                              ? 'bg-white/20 text-white border border-white/30'
                              : 'bg-slate-200/80 text-slate-600 border border-slate-300/40'
                            }`}>
                            {item.count}
                          </span>
                        )}
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 shadow-sm animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {isActive && (
                        <div className="absolute right-0 top-2 bottom-2 w-1.5 bg-amber-400 rounded-l-full shadow-sm" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Drawer Footer Actions */}
              <div className="pt-3 border-t border-slate-200/80 space-y-2 shrink-0 relative z-10">
                <Link
                  href="/"
                  onClick={onCloseMobile}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-[#173A7C] font-black text-xs border border-blue-200/70 transition-all cursor-pointer shadow-sm"
                >
                  <Home className="w-4 h-4 text-[#173A7C]" />
                  <span>الذهاب للرئيسية 🏠</span>
                </Link>
                <button
                  onClick={async () => {
                    if (onCloseMobile) onCloseMobile();
                    try {
                      await fetch('/api/auth/logout', { method: 'POST' });
                    } catch (e) {
                      console.error('Logout error:', e);
                    }
                    window.location.href = '/auth/login';
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-xs border border-rose-200 transition-all cursor-pointer shadow-sm"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>تسجيل الخروج 🚪</span>
                </button>
                <p className="text-[10px] text-slate-400 font-extrabold text-center">
                  Sustain Pulse Admin v2.4
                </p>
              </div>

            </div>
          </aside>
        </>
      )}
    </>
  );
};
